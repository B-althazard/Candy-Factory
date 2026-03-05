import { loadSchema } from "./schema.js";
import { migrateIfNeeded } from "./migrate.js";
import { loadUIState, saveUIState } from "./ui_state.js";
import { loadTheme, applyTheme, saveTheme } from "./theme/theme.js";
import { createDiagnostics } from "./diagnostics.js";
import { createNotifier } from "./components/toast.js";
import { renderShell } from "./workspace/shell.js";
import { deviceClass, computeMode, ensureLayout, renderMain } from "./workspace/renderer.js";
import { loadLayouts, upsertLayout } from "./workspace/layout_store.js";
import { loadWorkspaceSession, saveWorkspaceSession, createEmptyWorkspace } from "./workspace/workspace_state.js";
import { createDoc, renameDoc } from "./workspace/docs.js";
import { buildProjectFile, downloadProject, readProjectFile } from "./project/cfproject.js";
import { registerServiceWorker } from "./pwa.js";

const APP_VERSION = "0.3.2";
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
  const notifier = createNotifier();
  applyTheme(theme);

  let session = loadWorkspaceSession() || createEmptyWorkspace();
  session.ui = session.ui || { mode: "auto", active_tab: "identity", active_layout_id: "", tools_open: false };
  if (!Array.isArray(session.docs)) session.docs = [];

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

  try {
    session.docs = session.docs.map(d => {
      const doc = createDoc({ id: d?.id, name: d?.name, state: d?.state, locks: d?.locks, meta: d?.meta });
      if (d?.created_at) doc.created_at = d.created_at;
      if (d?.updated_at) doc.updated_at = d.updated_at;
      if (d?.meta && typeof d.meta === "object") doc.meta = { ...d.meta };
      return doc;
    });
  } catch {
    session.docs = [];
  }

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

  document.documentElement.setAttribute("data-device", deviceClass());
  renderShell(root, { deviceClass: deviceClass() });

  const mainEl = document.getElementById("mainArea");
  const footerLeft = document.getElementById("footerLeft");
  const footerRight = document.getElementById("footerRight");

  const docSelect = document.getElementById("docSelect");
  const newDocBtn = document.getElementById("newDocBtn");
  const renameDocBtn = document.getElementById("renameDocBtn");
  const toolsToggleBtn = document.getElementById("toolsToggleBtn");
  const topbarTray = document.getElementById("topbarTray");

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
  let swStatus = "";

  const ctx = {
    root,
    schema,
    uiState,
    appVersion: APP_VERSION,
    diagnostics,
    session,
    notify: (message, options) => notifier.notify(message, options),
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
    emitDocChange: (reason = "update") => { for (const fn of docChangeListeners) try { fn(reason); } catch {} }
  };

  function getMode() {
    return computeMode(session);
  }

  function updateFooter() {
    footerLeft.textContent = `App v${APP_VERSION} • Schema v${schema.schema_version ?? "?"} (${source})`;
    footerRight.textContent = `Mode: ${getMode()}${swStatus ? ` • ${swStatus}` : ""}`;
  }

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

  function syncToolsTray() {
    const open = Boolean(session?.ui?.tools_open);
    if (topbarTray) topbarTray.hidden = !open;
    if (toolsToggleBtn) toolsToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function mountFloatsIfNeeded() {
    if (deviceClass() !== "mobile") {
      floatOutput.innerHTML = "";
      floatPresets.innerHTML = "";
      floatPreview.innerHTML = "";
      floatDiagnostics.innerHTML = "";
      return;
    }

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
    const mode = getMode();
    const layout = ensureLayout(session, loadLayouts());
    renderMain(mainEl, { mode, layout, ctx });
    mountFloatsIfNeeded();
    refreshDocSelect();
    refreshLayoutSelect();
    syncToolsTray();
    updateFooter();
    syncFabUI();
  }

  registerServiceWorker({
    onStatus: (s) => {
      swStatus = s;
      updateFooter();
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
    return [floatOutput, floatPresets, floatPreview, floatDiagnostics].some(el => el.classList.contains("is-open"));
  }

  function setFabMenuOpen(on) {
    fabMenu.classList.toggle("is-open", on);
    fabMenu.setAttribute("aria-hidden", on ? "false" : "true");
    syncFabUI();
  }

  function syncFabUI() {
    const mobile = deviceClass() === "mobile";
    const menuOpen = fabMenu?.classList.contains("is-open");
    const floating = anyFloatOpen();
    const workstation = getMode() === "mobile_workstation";
    const showClose = mobile && (menuOpen || floating || workstation);

    if (fabScrim) {
      const scrimOn = Boolean(menuOpen && !floating);
      fabScrim.classList.toggle("is-open", scrimOn);
      fabScrim.setAttribute("aria-hidden", scrimOn ? "false" : "true");
    }

    if (fab) {
      fab.textContent = showClose ? "✕" : "≡";
      fab.setAttribute("aria-expanded", menuOpen ? "true" : "false");
    }
  }

  function closeWorkstationUI() {
    closeAllFloats();
    setFabMenuOpen(false);
    if (deviceClass() === "mobile") {
      session.ui.mode = "mobile_default";
      ctx.persistSession();
    }
    updateFooter();
    syncFabUI();
  }

  function openPanel(key) {
    session.ui.mode = "mobile_workstation";
    ctx.persistSession();
    closeAllFloats();
    if (key === "output") setFloat(floatOutput, true);
    if (key === "presets") setFloat(floatPresets, true);
    if (key === "preview") setFloat(floatPreview, true);
    if (key === "diagnostics") setFloat(floatDiagnostics, true);
    setFabMenuOpen(true);
    updateFooter();
  }

  docSelect.addEventListener("change", () => {
    session.active_doc_id = docSelect.value;
    ctx.persistSession();
    ctx.emitDocChange("active_doc");
    updateFooter();
  });

  newDocBtn.addEventListener("click", () => {
    const n = session.docs.length + 1;
    const doc = createDoc({ name: `Character ${n}`, state: {}, locks: [], meta: { schema_version: schema?.schema_version || "" } });
    session.docs.push(doc);
    session.active_doc_id = doc.id;
    ctx.persistSession();
    renderAll();
    ctx.emitDocChange("active_doc");
    ctx.notify(`Created ${doc.name}`, { kind: "success" });
  });

  renameDocBtn.addEventListener("click", () => {
    const doc = ctx.getActiveDoc();
    if (!doc) return;
    const name = window.prompt("Character name", doc.name);
    if (!name) return;
    renameDoc(doc, name);
    ctx.persistSession();
    refreshDocSelect();
    ctx.emitDocChange("doc_meta");
    ctx.notify("Character renamed", { kind: "success", duration: 1400 });
  });

  toolsToggleBtn?.addEventListener("click", () => {
    session.ui.tools_open = !session.ui.tools_open;
    ctx.persistSession();
    syncToolsTray();
  });

  document.addEventListener("click", (e) => {
    if (!session.ui.tools_open) return;
    const inTopbar = e.target.closest(".c-topbar");
    if (inTopbar) return;
    session.ui.tools_open = false;
    ctx.persistSession();
    syncToolsTray();
  });

  themeSelect.addEventListener("change", () => {
    const t = { mode: themeSelect.value };
    applyTheme(t);
    saveTheme(t);
    ctx.notify(`Theme: ${themeSelect.value}`, { kind: "info", duration: 1400 });
  });

  saveLayoutBtn.addEventListener("click", () => {
    const name = window.prompt("Layout name", "My Layout");
    if (!name) return;
    const currentLayout = ensureLayout(session, loadLayouts());
    const out = upsertLayout({ name, device_mode: getMode(), layout: currentLayout });
    session.ui.active_layout_id = out.id;
    ctx.persistSession();
    refreshLayoutSelect();
    layoutSelect.value = out.id;
    ctx.notify("Layout saved", { kind: "success" });
  });

  layoutSelect.addEventListener("change", () => {
    session.ui.active_layout_id = layoutSelect.value || "";
    ctx.persistSession();
    renderAll();
    ctx.emitDocChange("layout_change");
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
    ctx.notify("Project exported", { kind: "success" });
  });

  importProjectInput.addEventListener("change", async () => {
    const f = importProjectInput.files?.[0];
    if (!f) return;
    try {
      const proj = await readProjectFile(f);
      if (!proj || typeof proj !== "object") throw new Error("Invalid project payload");
      if (!proj.app_version || !proj.schema_version) throw new Error("Missing app_version or schema_version");
      if (!Array.isArray(proj.characters)) throw new Error("Missing characters[]");
      if (isVersionNewer(proj.schema_version, schema?.schema_version || "")) {
        throw new Error(`Project schema_version (${proj.schema_version}) is newer than this app's schema (${schema?.schema_version || ""}). Update the app before importing.`);
      }

      session.docs = (proj.characters ?? []).map(c => {
        const meta = (c?.meta && typeof c.meta === "object") ? { ...c.meta } : { schema_version: proj.schema_version };
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
      ctx.emitDocChange("import_project");
      diagnostics.log("info", "project_import", "Imported project", { app_version: proj.app_version, schema_version: proj.schema_version, chars: session.docs.length });
      ctx.notify("Project imported", { kind: "success" });
    } catch (e) {
      diagnostics.log("error", "project_import_failed", "Import failed", { error: String(e?.message || e) });
      ctx.notify(`Import failed: ${String(e?.message || e)}`, { kind: "error", duration: 3200 });
    } finally {
      importProjectInput.value = "";
    }
  });

  fabScrim?.addEventListener("click", () => {
    if (deviceClass() !== "mobile") return;
    closeWorkstationUI();
  });

  fabMenu?.addEventListener("click", (e) => {
    if (deviceClass() !== "mobile") return;
    const btn = e.target.closest("[data-fab-panel]");
    if (!btn) return;
    const key = btn.getAttribute("data-fab-panel");
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

  fab.addEventListener("click", () => {
    if (deviceClass() !== "mobile") return;
    if (getMode() !== "mobile_workstation") {
      session.ui.mode = "mobile_workstation";
      ctx.persistSession();
      setFabMenuOpen(true);
      updateFooter();
      return;
    }

    const menuOpen = fabMenu?.classList.contains("is-open");
    if (anyFloatOpen() || menuOpen) {
      closeWorkstationUI();
      return;
    }

    setFabMenuOpen(true);
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
      meta: d.meta && typeof d.meta === "object" ? d.meta : {},
      created_at: d.created_at,
      updated_at: d.updated_at
    })),
    ui: session.ui ?? {}
  };
}
