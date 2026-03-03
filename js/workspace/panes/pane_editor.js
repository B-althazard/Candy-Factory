import { renderApp } from "../../ui.js";
import { setFieldValues, bindFields } from "../../components/fields.js";
import { validateState, applyValidationToFields, summarizeValidation } from "../../validate.js";
import { saveLocks, lockPaths, unlockPath } from "../../locks.js";
import { randomizeState, getSectionPaths } from "../../randomize.js";
import { setCollapsed, saveUIState } from "../../ui_state.js";

export function renderEditorPane(pane, ctx) {
  return `
    <div class="c-pane" data-pane-id="${pane.id}">
      <div class="c-paneHeader">
        <div class="c-paneTitle">${escapeHtml(pane.title || "Editor")}</div>
        <div class="c-paneActions">
          <button class="c-btn c-btnTiny c-btnGhost" data-pane-action="randomize_all" type="button">Randomize</button>
          <button class="c-btn c-btnTiny c-btnGhost" data-pane-action="reset_doc" type="button">Reset</button>
        </div>
      </div>
      <div class="c-paneBody">
        <div class="c-editorRoot" id="${pane.id}__editor"></div>
        <div class="c-muted" id="${pane.id}__meta"></div>
      </div>
    </div>
  `;
}

export function bindEditorPane(pane, ctx) {
  const host = ctx.root.querySelector(`[data-pane-id="${pane.id}"]`);
  if (!host) return;
  const editorRoot = host.querySelector(`#${cssEscape(pane.id)}__editor`);
  const meta = host.querySelector(`#${cssEscape(pane.id)}__meta`);

  const { schema } = ctx;
  const getByPath = ctx.getByPath;

  function renderForActive() {
    const doc = ctx.getActiveDoc();
    if (!doc) return;
    renderApp(editorRoot, { schema, state: doc.state, getByPath, uiState: ctx.uiState });
    setFieldValues(editorRoot, doc.state, { getByPath });
    refreshValidation(doc);
  }

  function refreshValidation(doc) {
    const validation = validateState(doc.state, schema);
    applyValidationToFields(editorRoot, validation);
    meta.textContent = `Validation: ${summarizeValidation(validation)}`;
  }

  renderForActive();

  editorRoot.addEventListener("click", (e) => {
    const t = e.target;
    const doc = ctx.getActiveDoc();
    if (!doc) return;

    const toggle = t.closest("[data-toggle-section]");
    if (toggle) {
      const id = toggle.getAttribute("data-toggle-section");
      const body = editorRoot.querySelector(`[data-section-body="${cssEscape(id)}"]`);
      if (!body) return;
      const collapsed = !body.classList.contains("is-collapsed");
      body.classList.toggle("is-collapsed", collapsed);
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      const chev = toggle.querySelector(".c-chevron");
      if (chev) chev.textContent = collapsed ? "▸" : "▾";
      setCollapsed(ctx.uiState, id, collapsed);
      saveUIState(ctx.uiState);
      return;
    }

    const rand = t.closest("[data-rand-section]");
    if (rand) {
      const id = rand.getAttribute("data-rand-section");
      const paths = getSectionPaths(schema, id);
      const randomized = randomizeState(doc.state, schema, { onlyPaths: paths, lockedPaths: new Set(), includeName: id === "character" });
      lockPaths(doc.locks, randomized);
      saveLocks(doc.locks);
      ctx.touchDoc(doc);
      ctx.persistSession();
      setFieldValues(editorRoot, doc.state, { getByPath });
      refreshValidation(doc);
      ctx.emitDocChange();
      return;
    }

    const action = t.closest("[data-pane-action]");
    if (action) {
      const a = action.getAttribute("data-pane-action");
      if (a === "randomize_all") {
        randomizeState(doc.state, schema, { lockedPaths: doc.locks, includeName: true });
        ctx.touchDoc(doc); ctx.persistSession();
        setFieldValues(editorRoot, doc.state, { getByPath });
        refreshValidation(doc); ctx.emitDocChange();
      }
      if (a === "reset_doc") {
        ctx.resetDoc(doc); ctx.persistSession();
        renderForActive(); ctx.emitDocChange();
      }
    }
  });

  bindFields(editorRoot, {
    onChange: (path, value) => {
      const doc = ctx.getActiveDoc();
      if (!doc) return;
      ctx.setByPath(doc.state, path, value);
      if (doc.locks.has(path)) { unlockPath(doc.locks, path); saveLocks(doc.locks); }
      ctx.touchDoc(doc); ctx.persistSession();
      refreshValidation(doc); ctx.emitDocChange();
    }
  });

  ctx.onDocChange(() => renderForActive());
}

function escapeHtml(str) {
  return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
}
function cssEscape(s){ return String(s).replace(/"/g,'\\"'); }
