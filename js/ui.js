import { renderField } from "./components/fields.js";

export function renderApp(rootEl, { schema, state, getByPath }) {
  const blocks = [];

  for (const section of (schema.sections ?? [])) {
    blocks.push(renderSection(section, state, getByPath));
  }

  blocks.push(`<button class="c-btn c-btnPrimary" id="genBtn">Generate Output</button>`);

  blocks.push(`
    <div class="c-card">
      <div class="c-sectionTitle">Output</div>
      <div class="u-row" style="justify-content:space-between;margin-bottom:12px;">
        <div class="c-muted" id="schemaMeta"></div>
        <button class="c-btn c-btnGhost" id="copyBtn" type="button">Copy</button>
      </div>
      <textarea id="output" class="c-textarea" readonly></textarea>
      <div class="c-muted">Expert Mode (freeform) planned for v2.</div>
    </div>
  `);

  rootEl.innerHTML = blocks.join("");
}

function renderSection(section, state, getByPath) {
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

  return `
    <div class="c-card">
      <div class="c-sectionTitle">${title}</div>
      ${inner.join("")}
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
