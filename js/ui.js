import { renderField } from "./components/fields.js";
import { isCollapsed } from "./ui_state.js";

export function renderApp(rootEl, { schema, state, getByPath, uiState }) {
  const blocks = [];

  for (const section of (schema.sections ?? [])) {
    blocks.push(renderSection(section, state, getByPath, uiState));
  }

  blocks.push(`
    <div class="c-card">
      <div class="c-sectionTitle">Actions</div>
      <div class="c-actionsRow">
        <button class="c-btn c-btnGhost" id="genBtn" type="button">Randomize</button>
        <button class="c-btn c-btnGhost" id="resetBtn" type="button">Reset</button>
        <button class="c-btn c-btnGhost" id="exportTxtBtn" type="button">Export TXT</button>
        <button class="c-btn c-btnGhost" id="exportJsonBtn" type="button">Export JSON</button>
      </div>
      <div class="c-muted">Validation runs continuously; section random locks fields from global randomize.</div>
    </div>

    <div class="c-card" id="outputCard">
      <div class="c-sectionTitle">Output</div>
      <div class="u-row" style="justify-content:space-between;margin-bottom:12px;">
        <div class="c-muted" id="schemaMeta"></div>
        <div class="c-muted" id="valMeta"></div>
        <button class="c-btn c-btnGhost" id="copyBtn" type="button">Copy</button>
      </div>
      <textarea id="output" class="c-textarea" readonly></textarea>
      <div class="c-muted">Expert Mode (freeform) planned for v2.</div>
    </div>
  `);

  rootEl.innerHTML = blocks.join("");
}

function renderSection(section, state, getByPath, uiState) {
  const id = String(section.id ?? section.title ?? "section");
  const title = escapeHtml(section.title ?? section.id ?? "Section");
  const inner = [];

  for (const field of (section.fields ?? [])) {
    inner.push(renderField(field, getByPath(state, field.path)));
  }

  for (const sub of (section.subsections ?? [])) {
    inner.push(`<div class="c-subSectionTitle">${escapeHtml(sub.title ?? sub.id ?? "Subsection")}</div>`);
    for (const field of (sub.fields ?? [])) {
      inner.push(renderField(field, getByPath(state, field.path)));
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
