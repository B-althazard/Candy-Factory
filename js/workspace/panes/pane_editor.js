import { renderApp } from "../../ui.js";
import { setFieldValues, bindFields } from "../../components/fields.js";
import { validateState, applyValidationToFields, summarizeValidation } from "../../validate.js";
import { lockPaths, unlockPath } from "../../locks.js";
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
        <div class="c-muted c-editorMeta" id="${pane.id}__meta"></div>
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
  let lastActiveDocId = null;

  function applySectionFilter() {
    const filter = pane?.sectionFilter;
    if (!filter || !Array.isArray(filter) || !filter.length) return;
    const allow = new Set(filter.map(String));
    editorRoot.querySelectorAll(".c-section[data-section-id]").forEach(sec => {
      const id = sec.getAttribute("data-section-id");
      sec.style.display = allow.has(String(id)) ? "" : "none";
    });
  }

  function renderForActive() {
    const doc = ctx.getActiveDoc();
    if (!doc) return;
    lastActiveDocId = doc.id;
    renderApp(editorRoot, { schema, state: doc.state, getByPath, uiState: ctx.uiState, lockSet: doc.locks });
    applySectionFilter();
    setFieldValues(editorRoot, doc.state, { getByPath });
    refreshValidation(doc);
  }

  function refreshValidation(doc) {
    const validation = validateState(doc.state, schema);
    applyValidationToFields(editorRoot, validation);
    const summary = summarizeValidation(validation);
    meta.textContent = summary === "Valid" ? "" : `Validation: ${summary}`;
  }

  function updateFieldLockUI(path, locked) {
    const field = editorRoot.querySelector(`[data-field-path="${cssEscape(path)}"]`);
    if (!field) return;
    field.classList.toggle("is-locked", Boolean(locked));
    const btn = field.querySelector(`[data-lock-path="${cssEscape(path)}"]`);
    if (!btn) return;
    btn.setAttribute("aria-pressed", locked ? "true" : "false");
    btn.setAttribute("aria-label", locked ? "Unlock field" : "Lock field");
    btn.setAttribute("title", locked ? "Unlock field" : "Lock field");
    btn.textContent = locked ? "🔒" : "🔓";
  }

  renderForActive();

  host.addEventListener("click", (e) => {
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

    const lockBtn = t.closest("[data-lock-path]");
    if (lockBtn) {
      const path = lockBtn.getAttribute("data-lock-path");
      if (!path) return;
      if (doc.locks.has(path)) unlockPath(doc.locks, path);
      else doc.locks.add(path);
      updateFieldLockUI(path, doc.locks.has(path));
      ctx.touchDoc(doc);
      ctx.persistSession();
      ctx.notify?.(`${doc.locks.has(path) ? "Locked" : "Unlocked"} ${labelForPath(path, schema)}`, { kind: "info", duration: 1400 });
      return;
    }

    const rand = t.closest("[data-rand-section]");
    if (rand) {
      const id = rand.getAttribute("data-rand-section");
      const paths = getSectionPaths(schema, id);
      const randomized = randomizeState(doc.state, schema, {
        onlyPaths: paths,
        lockedPaths: doc.locks,
        includeName: id === "character"
      });
      lockPaths(doc.locks, randomized);
      ctx.touchDoc(doc);
      ctx.persistSession();
      renderForActive();
      ctx.emitDocChange("editor_randomize_section");
      ctx.notify?.(`Randomized ${randomized.length} field${randomized.length === 1 ? "" : "s"}`, { kind: "success" });
      return;
    }

    const action = t.closest("[data-pane-action]");
    if (action) {
      const a = action.getAttribute("data-pane-action");
      if (a === "randomize_all") {
        const randomized = randomizeState(doc.state, schema, { lockedPaths: doc.locks, includeName: true });
        lockPaths(doc.locks, randomized);
        ctx.touchDoc(doc);
        ctx.persistSession();
        renderForActive();
        ctx.emitDocChange("editor_randomize_all");
        ctx.notify?.(`Randomized ${randomized.length} field${randomized.length === 1 ? "" : "s"}`, { kind: "success" });
        return;
      }
      if (a === "reset_doc") {
        ctx.resetDoc(doc);
        ctx.persistSession();
        renderForActive();
        ctx.emitDocChange("doc_reset");
        ctx.notify?.("Character reset", { kind: "warning" });
        return;
      }
    }
  });

  bindFields(editorRoot, {
    onChange: (path, value, metaInfo) => {
      const doc = ctx.getActiveDoc();
      if (!doc) return;
      ctx.setByPath(doc.state, path, value);
      if (doc.locks.has(path)) {
        unlockPath(doc.locks, path);
        updateFieldLockUI(path, false);
      }

      if (path === "character.name") {
        const nm = String(value ?? "").trim() || "Character";
        doc.name = nm.slice(0, 40);
        if (metaInfo?.isCommit) ctx.refreshDocSelect?.();
      }

      ctx.touchDoc(doc);
      ctx.persistSession();
      refreshValidation(doc);
      ctx.emitDocChange(metaInfo?.isCommit ? "field_commit" : "field_input");
    }
  });

  ctx.onDocChange((reason) => {
    const active = ctx.getActiveDoc();
    if (!active) return;
    if (active.id !== lastActiveDocId || reason === "preset_apply" || reason === "doc_reset" || reason === "import_project" || reason === "active_doc") {
      renderForActive();
    }
  });
}

function labelForPath(path, schema) {
  for (const section of (schema?.sections ?? [])) {
    for (const field of (section.fields ?? [])) if (String(field?.path) === String(path)) return field.label || path;
    for (const sub of (section.subsections ?? [])) {
      for (const field of (sub.fields ?? [])) if (String(field?.path) === String(path)) return field.label || path;
    }
  }
  return path;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function cssEscape(s) {
  return String(s).replace(/"/g, "\"");
}
