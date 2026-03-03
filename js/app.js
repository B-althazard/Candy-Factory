import { loadSchema } from "./schema.js";
import { migrateIfNeeded } from "./migrate.js";
import { loadUIState, saveUIState } from "./ui_state.js";
import { loadTheme, applyTheme, saveTheme } from "./theme/theme.js";
import { renderShell } from "./workspace/shell.js";
import { deviceClass, computeMode, ensureLayout, renderMain } from "./workspace/renderer.js";
import { loadLayouts, upsertLayout } from "./workspace/layout_store.js";
import { loadWorkspaceSession, saveWorkspaceSession, createEmptyWorkspace } from "./workspace/workspace_state.js";
import { createDoc, renameDoc } from "./workspace/docs.js";
import { buildProjectFile, downloadProject, readProjectFile } from "./project/cfproject.js";
import { registerServiceWorker } from "./pwa.js";

const APP_VERSION = "0.2.0";

const root = document.getElementById("app");

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function safeName(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 32) || "project";
}

function escapeHtml(str) {
  return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
}

(async function init() {
  const { schema, source } = await loadSchema();
  const uiState = loadUIState();
  const theme = loadTheme();
  applyTheme(theme);

  let session = loadWorkspaceSession() || createEmptyWorkspace();
  session.ui = session.ui || { mode: "auto", active_tab: "identity", active_layout_id: "" };
  if (!Array.isArray(session.docs)) session.docs = [];

  // migrate legacy v0.1.x single state into first doc
  try {
    const legacyRaw = localStorage.getItem("candy_factory_state_v1");
    const legacyLocksRaw = localStorage.getItem("candy_factory_locks_v1");
    if (legacyRaw && session.docs.length === 0) {
      const legacyState = JSON.parse(legacyRaw);
      const legacyLocks = legacyLocksRaw ? JSON.parse(legacyLocksRaw) : [];
      const mig = migrateIfNeeded({ state: legacyState ?? {}, meta: {}, schema });
      const doc = createDoc({ name: legacyState?.character?.name || "Character", state: mig.state, locks: legacyLocks });
      session.docs.push(doc);
      session.active_doc_id = doc.id;
    }
  } catch {}

  if (session.docs.length === 0) {
    const doc = createDoc({ name: "Character 1", state: {}, locks: [] });
    session.docs.push(doc);
    session.active_doc_id = doc.id;
  }
  if (!session.active_doc_id) session.active_doc_id = session.docs[0].id;

  const mode = computeMode(session);
  const dc = deviceClass();

  renderShell(root, { deviceClass: dc });

  const mainEl = document.getElementById("mainArea");
  const footerLeft = document.getElementById("footerLeft");
  const footerRight = document.getElementById("footerRight");

  footerLeft.textContent = `App v${APP_VERSION} • Schema v${schema.schema_version ?? "?"} (${source})`;
  footerRight.textContent = `Mode: ${mode}`;

  registerServiceWorker({ onStatus: (s) => (footerRight.textContent = `Mode: ${mode} • ${s}`) });

  const docSelect = document.getElementById("docSelect");
  const newDocBtn = document.getElementById("newDocBtn");
  const renameDocBtn = document.getElementById("renameDocBtn");

  const layoutSelect = document.getElementById("layoutSelect");
  const saveLayoutBtn = document.getElementById("saveLayoutBtn");

  const themeSelect = document.getElementById("themeSelect");
  themeSelect.value = theme.mode;

  const exportProjectBtn = document.getElementById("exportProjectBtn");
  const importProjectInput = document.getElementById("importProjectInput");

  const fab = document.getElementById("fab");
  const floatOutput = document.getElementById("floatOutput");
  const floatPresets = document.getElementById("floatPresets");

  const reg = await import("./workspace/panes/registry.js");
  const renderPane = reg.renderPane;
  const bindPane = reg.bindPane;

  const docChangeListeners = new Set();

  const ctx = {
    root,
    schema,
    uiState,
    appVersion: APP_VERSION,
    session,
    getByPath: (obj, path) => path.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj),
    setByPath: (obj, path, value) => {
      const parts = path.split(".");
      let cur = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];
        if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
        cur = cur[k];
      }
      cur[parts[parts.length - 1]] = String(value ?? "").trim();
    },
    touchDoc: (doc) => { doc.updated_at = new Date().toISOString(); },
    resetDoc: (doc) => {
      const fresh = createDoc({ id: doc.id, name: doc.name, state: {}, locks: [] });
      doc.state = fresh.state;
      doc.locks = fresh.locks;
      doc.updated_at = new Date().toISOString();
    },
    getActiveDoc: () => session.docs.find(d => d.id === session.active_doc_id) || null,
    persistSession: () => saveWorkspaceSession(serializeSession(session)),
    onDocChange: (fn) => docChangeListeners.add(fn),
    emitDocChange: () => { for (const fn of docChangeListeners) try { fn(); } catch {} }
  };

  function refreshDocSelect() {
    docSelect.innerHTML = session.docs.map(d => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.name)}</option>`).join("");
    docSelect.value = session.active_doc_id || "";
  }

  function refreshLayoutSelect() {
    const layoutsNow = loadLayouts();
    const cur = session.ui.active_layout_id || "";
    layoutSelect.innerHTML = `<option value="">Default</option>` + layoutsNow.map(l => `<option value="${escapeHtml(l.id)}">${escapeHtml(l.name)}</option>`).join("");
    if (cur) layoutSelect.value = cur;
  }

  function mountFloatsIfNeeded() {
    if (mode !== "mobile_workstation") return;
    floatOutput.innerHTML = "";
    floatPresets.innerHTML = "";
    const outPane = { id: "p_out_float", type: "output", title: "Output", region: "float_output", visible: true };
    const prePane = { id: "p_pre_float", type: "presets", title: "Presets", region: "float_presets", visible: true };
    floatOutput.innerHTML = `<div class="c-floatInner">${renderPane(outPane, ctx)}</div>`;
    floatPresets.innerHTML = `<div class="c-floatInner">${renderPane(prePane, ctx)}</div>`;
    bindPane(outPane, ctx);
    bindPane(prePane, ctx);
  }

  function renderAll() {
    const layout = ensureLayout(session, loadLayouts());
    renderMain(mainEl, { mode, layout, ctx });
    mountFloatsIfNeeded();
    refreshDocSelect();
    refreshLayoutSelect();
  }

  docSelect.addEventListener("change", () => {
    session.active_doc_id = docSelect.value;
    ctx.persistSession();
    ctx.emitDocChange();
  });

  newDocBtn.addEventListener("click", () => {
    const n = session.docs.length + 1;
    const doc = createDoc({ name: `Character ${n}`, state: {}, locks: [] });
    session.docs.push(doc);
    session.active_doc_id = doc.id;
    ctx.persistSession();
    renderAll();
    ctx.emitDocChange();
  });

  renameDocBtn.addEventListener("click", () => {
    const doc = ctx.getActiveDoc();
    if (!doc) return;
    const name = window.prompt("Character name", doc.name);
    if (!name) return;
    renameDoc(doc, name);
    ctx.persistSession();
    refreshDocSelect();
    ctx.emitDocChange();
  });

  themeSelect.addEventListener("change", () => {
    const t = { mode: themeSelect.value };
    applyTheme(t);
    saveTheme(t);
  });

  saveLayoutBtn.addEventListener("click", () => {
    const name = window.prompt("Layout name", "My Layout");
    if (!name) return;
    const currentLayout = ensureLayout(session, loadLayouts());
    const out = upsertLayout({ name, device_mode: mode, layout: currentLayout });
    session.ui.active_layout_id = out.id;
    ctx.persistSession();
    refreshLayoutSelect();
    layoutSelect.value = out.id;
  });

  layoutSelect.addEventListener("change", () => {
    session.ui.active_layout_id = layoutSelect.value || "";
    ctx.persistSession();
    renderAll();
    ctx.emitDocChange();
  });

  exportProjectBtn.addEventListener("click", () => {
    const payload = buildProjectFile({
      app_version: APP_VERSION,
      schema_version: schema.schema_version ?? "",
      project: { id: "default", name: "Candy Factory Project" },
      docs: session.docs,
      layouts: loadLayouts(),
      theme: loadTheme(),
      uiState
    });
    const filename = `CandyFactory_${safeName(payload.project_name)}_${nowStamp()}.cfproject.json`;
    downloadProject(filename, payload);
  });

  importProjectInput.addEventListener("change", async () => {
    const f = importProjectInput.files?.[0];
    if (!f) return;
    try {
      const proj = await readProjectFile(f);
      session.docs = (proj.characters ?? []).map(c => createDoc({ id: c.id, name: c.name, state: c.state, locks: c.locks }));
      session.active_doc_id = session.docs[0]?.id || null;

      const ls = Array.isArray(proj.workspace_layouts) ? proj.workspace_layouts : [];
      localStorage.setItem("candy_factory_layouts_v1", JSON.stringify(ls.slice(0, 30)));

      const tm = { mode: proj.settings?.theme_mode || "light" };
      applyTheme(tm);
      saveTheme(tm);
      themeSelect.value = tm.mode;

      if (proj.settings?.ui_state) {
        Object.assign(uiState, proj.settings.ui_state);
        saveUIState(uiState);
      }

      ctx.persistSession();
      renderAll();
      ctx.emitDocChange();
    } catch (e) {
      alert("Import failed: " + String(e?.message || e));
    } finally {
      importProjectInput.value = "";
    }
  });

  function setFloat(panel, on) {
    panel.classList.toggle("is-open", on);
    panel.setAttribute("aria-hidden", on ? "false" : "true");
  }

  fab.addEventListener("click", () => {
    if (deviceClass() !== "mobile") return;
    if (mode !== "mobile_workstation") {
      session.ui.mode = "mobile_workstation";
      ctx.persistSession();
      location.reload();
      return;
    }
    const outOpen = floatOutput.classList.contains("is-open");
    const preOpen = floatPresets.classList.contains("is-open");
    if (!outOpen && !preOpen) { setFloat(floatOutput, true); setFloat(floatPresets, false); return; }
    if (outOpen && !preOpen) { setFloat(floatOutput, false); setFloat(floatPresets, true); return; }
    setFloat(floatOutput, false); setFloat(floatPresets, false);
  });

  fab.addEventListener("dblclick", () => {
    if (deviceClass() !== "mobile") return;
    session.ui.mode = "mobile_default";
    ctx.persistSession();
    location.reload();
  });

  renderAll();
  ctx.persistSession();
})();

function serializeSession(session) {
  return {
    active_doc_id: session.active_doc_id,
    docs: session.docs.map(d => ({
      id: d.id,
      name: d.name,
      state: d.state,
      locks: Array.from(d.locks ?? []),
      created_at: d.created_at,
      updated_at: d.updated_at
    })),
    ui: session.ui ?? {}
  };
}
