import { renderField } from "./components/fields.js";
import { isCollapsed } from "./ui_state.js";

export function renderApp(rootEl, { schema, state, getByPath, uiState, lockSet }) {
  const fieldMap = new Map();
  const blocks = [];
  for (const section of (schema.sections ?? [])) blocks.push(renderSection(section, state, getByPath, uiState, fieldMap, lockSet));
  rootEl.innerHTML = blocks.join("");
  rootEl.__fieldMap = fieldMap;
}

function renderSection(section, state, getByPath, uiState, fieldMap, lockSet) {
  const id = String(section.id ?? section.title ?? "section");
  const title = escapeHtml(section.title ?? section.id ?? "Section");
  const inner = [];

  for (const field of (section.fields ?? [])) {
    if (field?.path) fieldMap.set(String(field.path), field);
    inner.push(renderField(field, getByPath(state, field.path), { locked: Boolean(lockSet?.has?.(String(field.path))) }));
  }

  for (const sub of (section.subsections ?? [])) {
    inner.push(`<div class="c-subSectionTitle">${escapeHtml(sub.title ?? sub.id ?? "Subsection")}</div>`);
    for (const field of (sub.fields ?? [])) {
      if (field?.path) fieldMap.set(String(field.path), field);
      inner.push(renderField(field, getByPath(state, field.path), { locked: Boolean(lockSet?.has?.(String(field.path))) }));
    }
  }

  const collapsed = isCollapsed(uiState, id);
  const bodyClass = collapsed ? "c-sectionBody is-collapsed" : "c-sectionBody";

  return `
    <div class="c-card c-section" data-section-id="${escapeHtml(id)}">
      <div class="c-sectionHeader">
        <button class="c-sectionToggle" type="button" data-toggle-section="${escapeHtml(id)}" aria-expanded="${collapsed ? "false" : "true"}">
          <span class="c-chevron">${collapsed ? "▸" : "▾"}</span>
          <span>${title}</span>
        </button>
        <button class="c-btn c-btnTiny c-btnGhost" type="button" data-rand-section="${escapeHtml(id)}">Random</button>
      </div>
      <div class="${bodyClass}" data-section-body="${escapeHtml(id)}">
        ${inner.join("")}
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
