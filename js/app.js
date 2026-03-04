import { loadSchema } from "./schema.js";
import { migrateIfNeeded } from "./migrate.js";
import { loadUIState, saveUIState } from "./ui_state.js";
import { loadTheme, applyTheme, saveTheme } from "./theme/theme.js";
import { createDiagnostics } from "./diagnostics.js";
import { renderShell } from "./workspace/shell.js";
import { deviceClass, computeMode, ensureLayout, renderMain } from "./workspace/renderer.js";
import { loadLayouts, upsertLayout } from "./workspace/layout_store.js";
import { loadWorkspaceSession, saveWorkspaceSession, createEmptyWorkspace } from "./workspace/workspace_state.js";
import { createDoc, renameDoc } from "./workspace/docs.js";
import { buildProjectFile, downloadProject, readProjectFile } from "./project/cfproject.js";
import { registerServiceWorker } from "./pwa.js";

const APP_VERSION = "0.3.1";

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

function isVersionNewer(a, b) {
  const pa = String(a || "").trim().split(".").map(n => parseInt(n, 10));
  const pb = String(b || "").trim().split(".").map(n => parseInt(n, 10));
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = Number.isFinite(pa[i]) ? pa[i] : 0;
    const nb = Number.isFinite(pb[i]) ? pb[i] : 0;
    if (na > nb) return true;
    if (na < nb) return false;
  }
  return false;
}

(async function init() {
  const { schema, source } = await loadSchema();
  const uiState = loadUIState();
  const theme = loadTheme();
  applyTheme(theme);

  let session = loadWorkspaceSession() || createEmptyWorkspace();
  session.ui = session.ui || { mode: "auto", active_tab: "identity", active_layout_id: "" };
  if (!Array.isArray(session.docs)) session.docs = [];

  // Diagnostics: local-first, exportable.
  const diagnostics = createDiagnostics({
    appVersion: APP_VERSION,
    getContext: () => ({
      mode: computeMode(session),
      active_layout_id: session?.ui?.active_layout_id || "",
      active_doc_id: session?.active_doc_id || "",
      schema_version: schema?.schema_version || "",
      device_class: deviceClass()
    })
  });
  diagnostics.installGlobalHandlers();
  diagnostics.log("info", "app_init", "App init", { schema_source: source });

  // Rehydrate stored docs into canonical in-memory shape (locks Set, meta object).
  try {
    session.docs = session.docs.map(d => {
      const doc = createDoc({ id: d?.id, name: d?.name, state: d?.state, locks: d?.locks, meta: d?.meta });
      if (d?.created_at) doc.created_at = d.created_at;
      if (d?.updated_at) doc.updated_at = d.updated_at;
      // Preserve meta if present
      if (d?.meta && typeof d.meta === "object") doc.meta = { ...d.meta };
      return doc;
    });
  } catch {
    session.docs = [];
  }

  // migrate legacy v0.1.x single state into first doc
  try {
    const legacyRaw = localStorage.getItem("candy_factory_state_v1");
    const legacyLocksRaw = localStorage.getItem("candy_factory_locks_v1");
    if (legacyRaw && session.docs.length === 0) {
      const legacyState = JSON.parse(legacyRaw);
      const legacyLocks = legacyLocksRaw ? JSON.parse(legacyLocksRaw) : [];
      const mig = migrateIfNeeded({ state: legacyState ?? {}, meta: {}, schema });
      const doc = createDoc({
        name: legacyState?.character?.name || "Character",
        state: mig.state,
        locks: legacyLocks,
        meta: { schema_version: mig?.meta?.schema_version || schema?.schema_version || "" }
      });
      session.docs.push(doc);
      session.active_doc_id = doc.id;
      diagnostics.log("info", "legacy_migrate", "Migrated legacy state", { to_schema_version: doc.meta.schema_version });
    }
  } catch {}

  // Migration-on-load for all docs (schema evolution safety).
  for (const doc of (session.docs ?? [])) {
    try {
      const curMeta = doc.meta && typeof doc.meta === "object" ? doc.meta : (doc.meta = {});
      const mig = migrateIfNeeded({
        state: doc.state ?? {},
        meta: { schema_version: curMeta.schema_version || "" },
        schema
      });
      doc.state = mig.state;
      curMeta.schema_version = mig?.meta?.schema_version || schema?.schema_version || "";
      if (mig.didMigrate) {
        doc.updated_at = new Date().toISOString();
        diagnostics.log("info", "doc_migrate", "Migrated document", { doc_id: doc.id, to: curMeta.schema_version, message: mig.message });
      }
    } catch (e) {
      diagnostics.log("error", "doc_migrate_failed", "Doc migration failed", { doc_id: doc?.id, error: String(e?.message || e) });
    }
  }

  if (session.docs.length === 0) {
    const doc = createDoc({ name: "Character 1", state: {}, locks: [], meta: { schema_version: schema?.schema_version || "" } });
    session.docs.push(doc);
    session.active_doc_id = doc.id;
  }
  if (!session.active_doc_id) session.active_doc_id = session.docs[0].id;

  const mode = computeMode(session);
  const dc = deviceClass();
  document.documentElement.setAttribute("data-device", dc);

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
  const fabMenu = document.getElementById("fabMenu");
  const fabScrim = document.getElementById("fabScrim");
  const floatOutput = document.getElementById("floatOutput");
  const floatPresets = document.getElementById("floatPresets");
  const floatPreview = document.getElementById("floatPreview");
  const floatDiagnostics = document.getElementById("floatDiagnostics");

  const reg = await import("./workspace/panes/registry.js");
  const renderPane = reg.renderPane;
  const bindPane = reg.bindPane;

  const docChangeListeners = new Set();

  const ctx = {
    root,
    schema,
    uiState,
    appVersion: APP_VERSION,
    diagnostics,
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
      const fresh = createDoc({ id: doc.id, name: doc.name, state: {}, locks: [], meta: { ...(doc.meta ?? {}) } });
      doc.state = fresh.state;
      doc.locks = fresh.locks;
      doc.meta = fresh.meta;
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


  ctx.refreshDocSelect = refreshDocSelect;
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
    floatPreview.innerHTML = "";
    floatDiagnostics.innerHTML = "";
    const outPane = { id: "p_out_float", type: "output", title: "Output", region: "float_output", visible: true };
    const prePane = { id: "p_pre_float", type: "presets", title: "Presets", region: "float_presets", visible: true };
    const prvPane = { id: "p_prv_float", type: "preview", title: "Preview", region: "float_preview", visible: true };
    const diaPane = { id: "p_dia_float", type: "diagnostics", title: "Diagnostics", region: "float_diagnostics", visible: true };
    floatOutput.innerHTML = `<div class="c-floatInner">${renderPane(outPane, ctx)}</div>`;
    floatPresets.innerHTML = `<div class="c-floatInner">${renderPane(prePane, ctx)}</div>`;
    floatPreview.innerHTML = `<div class="c-floatInner">${renderPane(prvPane, ctx)}</div>`;
    floatDiagnostics.innerHTML = `<div class="c-floatInner">${renderPane(diaPane, ctx)}</div>`;
    bindPane(outPane, ctx);
    bindPane(prePane, ctx);
    bindPane(prvPane, ctx);
    bindPane(diaPane, ctx);
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
    const doc = createDoc({ name: `Character ${n}`, state: {}, locks: [], meta: { schema_version: schema?.schema_version || "" } });
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
    diagnostics.log("info", "project_export", "Export project", null);
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

      // Basic import validation (required fields)
      if (!proj || typeof proj !== "object") throw new Error("Invalid project payload");
      if (!proj.app_version || !proj.schema_version) throw new Error("Missing app_version or schema_version");
      if (!Array.isArray(proj.characters)) throw new Error("Missing characters[]");

      if (isVersionNewer(proj.schema_version, schema?.schema_version || "")) {
        throw new Error(`Project schema_version (${proj.schema_version}) is newer than this app's schema (${schema?.schema_version || ""}). Update the app before importing.`);
      }

      session.docs = (proj.characters ?? []).map(c => {
        const meta = (c?.meta && typeof c.meta === "object") ? { ...c.meta } : { schema_version: proj.schema_version };
        // Migration-on-import to current packaged schema
        const mig = migrateIfNeeded({ state: c?.state ?? {}, meta: { schema_version: meta.schema_version || proj.schema_version }, schema });
        meta.schema_version = mig?.meta?.schema_version || schema?.schema_version || "";
        const doc = createDoc({ id: c.id, name: c.name, state: mig.state, locks: c.locks, meta });
        if (c?.created_at) doc.created_at = c.created_at;
        if (c?.updated_at) doc.updated_at = c.updated_at;
        return doc;
      });
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

      diagnostics.log("info", "project_import", "Imported project", { app_version: proj.app_version, schema_version: proj.schema_version, chars: session.docs.length });
    } catch (e) {
      diagnostics.log("error", "project_import_failed", "Import failed", { error: String(e?.message || e) });
      alert("Import failed: " + String(e?.message || e));
    } finally {
      importProjectInput.value = "";
    }
  });

  function setFloat(panel, on) {
    panel.classList.toggle("is-open", on);
    panel.setAttribute("aria-hidden", on ? "false" : "true");
  }

  function closeAllFloats() {
    setFloat(floatOutput, false);
    setFloat(floatPresets, false);
    setFloat(floatPreview, false);
    setFloat(floatDiagnostics, false);
  }

  function anyFloatOpen() {
    return (
      floatOutput.classList.contains("is-open") ||
      floatPresets.classList.contains("is-open") ||
      floatPreview.classList.contains("is-open") ||
      floatDiagnostics.classList.contains("is-open")
    );
  }

  function setFabMenuOpen(on) {
    if (!fabMenu || !fabScrim) return;
    fabMenu.classList.toggle("is-open", on);
    fabMenu.setAttribute("aria-hidden", on ? "false" : "true");
    syncFabUI();
  }

  function syncFabUI() {
    const open = fabMenu?.classList.contains("is-open");
    const floating = anyFloatOpen();
    const showClose = Boolean(open || floating);

    // Scrim only when the menu is open and no float panel is open (avoid blocking interaction).
    const scrimOn = Boolean(open && !floating);
    if (fabScrim) {
      fabScrim.classList.toggle("is-open", scrimOn);
      fabScrim.setAttribute("aria-hidden", scrimOn ? "false" : "true");
    }

    fab.textContent = showClose ? "✕" : "≡";
    fab.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function closeWorkstationUI() {
    closeAllFloats();
    if (fabMenu) fabMenu.classList.remove("is-open");
    if (fabMenu) fabMenu.setAttribute("aria-hidden", "true");
    syncFabUI();
  }

  function openPanel(key) {
    closeAllFloats();
    if (key === "output") setFloat(floatOutput, true);
    if (key === "presets") setFloat(floatPresets, true);
    if (key === "preview") setFloat(floatPreview, true);
    if (key === "diagnostics") setFloat(floatDiagnostics, true);
    setFabMenuOpen(true); // keep menu open while the panel is open
    syncFabUI();
  }

  if (fabScrim) {
    fabScrim.addEventListener("click", () => {
      if (mode !== "mobile_workstation") return;
      closeWorkstationUI();
    });
  }

  if (fabMenu) {
    fabMenu.addEventListener("click", (e) => {
      if (mode !== "mobile_workstation") return;
      const btn = e.target.closest("[data-fab-panel]");
      if (!btn) return;
      const key = btn.getAttribute("data-fab-panel");
      if (!key) return;

      const alreadyOpen =
        (key === "output" && floatOutput.classList.contains("is-open")) ||
        (key === "presets" && floatPresets.classList.contains("is-open")) ||
        (key === "preview" && floatPreview.classList.contains("is-open")) ||
        (key === "diagnostics" && floatDiagnostics.classList.contains("is-open"));

      if (alreadyOpen) {
        closeWorkstationUI();
        return;
      }

      openPanel(key);
    });
  }

  fab.addEventListener("click", () => {
    if (deviceClass() !== "mobile") return;

    // From mobile tabs → enter workstation mode.
    if (mode !== "mobile_workstation") {
      session.ui.mode = "mobile_workstation";
      ctx.persistSession();
      location.reload();
      return;
    }

    // In workstation mode:
    // - If any panel/menu is open, close everything (X behavior).
    // - Otherwise open the speed-dial menu.
    const menuOpen = fabMenu?.classList.contains("is-open");
    if (anyFloatOpen() || menuOpen) {
      closeWorkstationUI();
      return;
    }
    setFabMenuOpen(true);
  });

  fab.addEventListener("dblclick", () => {
    if (deviceClass() !== "mobile") return;
    session.ui.mode = "mobile_default";
    ctx.persistSession();
    location.reload();
  });

  // Ensure initial icon state is correct.
  syncFabUI();


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
      meta: d.meta && typeof d.meta === "object" ? d.meta : {},
      created_at: d.created_at,
      updated_at: d.updated_at
    })),
    ui: session.ui ?? {}
  };
}
