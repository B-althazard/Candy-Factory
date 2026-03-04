import { renderPane, bindPane, getDefaultDesktopLayout, getDefaultMobileWorkstationLayout, PaneTypes } from "./panes/registry.js";

export function deviceClass() {
  const w = window.innerWidth || 0;
  return w >= 980 ? "desktop" : "mobile";
}

export function computeMode(session) {
  const dc = deviceClass();
  if (session?.ui?.mode && session.ui.mode !== "auto") return session.ui.mode;
  return dc === "desktop" ? "desktop" : "mobile_default";
}

export function ensureLayout(session, layouts) {
  const mode = computeMode(session);
  const activeId = session?.ui?.active_layout_id || "";
  const found = activeId ? layouts.find(l => String(l.id) === String(activeId)) : null;
  if (found && (found.device_mode === mode || found.device_mode === "auto")) return found.layout || {};
  if (mode === "desktop") return getDefaultDesktopLayout();
  return getDefaultMobileWorkstationLayout();
}

export function renderMain(mainEl, { mode, layout, ctx }) {
  if (mode === "desktop") return renderDesktop(mainEl, layout, ctx);
  if (mode === "mobile_workstation") return renderMobileWorkstation(mainEl, ctx);
  return renderMobileDefault(mainEl, ctx);
}

function renderDesktop(mainEl, layout, ctx) {
  const left = (layout.panes ?? []).filter(p => p.region === "left" && p.visible !== false);
  const right = (layout.panes ?? []).filter(p => p.region === "right" && p.visible !== false);

  mainEl.innerHTML = `
    <div class="c-workspaceDesktop">
      <section class="c-region c-regionLeft">${left.map(p => renderPane(p, ctx)).join("")}</section>
      <section class="c-region c-regionRight">${right.map(p => renderPane(p, ctx)).join("")}</section>
    </div>
  `;
  for (const p of (layout.panes ?? [])) bindPane(p, ctx);
}

function renderMobileWorkstation(mainEl, ctx) {
  const editor = { id: "p_editor_main", type: PaneTypes.editor, title: "Editor", region: "main", visible: true };
  mainEl.innerHTML = `<div class="c-workspaceMobileWS">${renderPane(editor, ctx)}</div>`;
  bindPane(editor, ctx);
}

function renderMobileDefault(mainEl, ctx) {
  const sectionMap = {
    identity: ["character", "subject"],
    appearance: ["appearance", "hair", "face", "eyes", "lips", "skin"],
    body: ["body", "distinguishing_marks"],
    style: ["style", "pose", "waist_emphasis_system"],
    wardrobe: ["wardrobe", "top", "bottom", "outer_layer", "materials", "color_system", "accessories"]
  };

  mainEl.innerHTML = `
    <div class="c-mobileTabs">
      <nav class="c-tabbar">
        <button class="c-tab" data-tab="identity">Identity</button>
        <button class="c-tab" data-tab="appearance">Appearance</button>
        <button class="c-tab" data-tab="body">Body</button>
        <button class="c-tab" data-tab="style">Style</button>
        <button class="c-tab" data-tab="wardrobe">Wardrobe</button>
        <button class="c-tab" data-tab="output">Output</button>
        <button class="c-tab" data-tab="preview">Preview</button>
      </nav>
      <div class="c-tabBody" id="tabBody"></div>
    </div>
  `;

  const tabBody = mainEl.querySelector("#tabBody");
  const active = ctx.session?.ui?.active_tab || "identity";
  setActiveTab(mainEl, active);

  const renderTab = (tab) => {
    tabBody.innerHTML = "";

    if (tab === "output") {
      const outPane = { id: "p_output_tab", type: PaneTypes.output, title: "Output", region: "tab", visible: true };
      tabBody.innerHTML = renderPane(outPane, ctx);
      bindPane(outPane, ctx);
      return;
    }

    if (tab === "preview") {
      const prvPane = { id: "p_preview_tab", type: PaneTypes.preview, title: "Preview", region: "tab", visible: true };
      tabBody.innerHTML = renderPane(prvPane, ctx);
      bindPane(prvPane, ctx);
      return;
    }

    const allow = sectionMap[tab] || [];
    const editor = {
      id: "p_editor_tab",
      type: PaneTypes.editor,
      title: "Editor",
      region: "tab",
      visible: true,
      sectionFilter: allow
    };

    tabBody.innerHTML = renderPane(editor, ctx);
    bindPane(editor, ctx);
  };

  renderTab(active);

  mainEl.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      ctx.session.ui.active_tab = tab;
      ctx.persistSession();
      setActiveTab(mainEl, tab);
      renderTab(tab);
    });
  });
}

function setActiveTab(mainEl, tab) {
  mainEl.querySelectorAll("[data-tab]").forEach(b => b.classList.toggle("is-active", b.getAttribute("data-tab") === tab));
}
