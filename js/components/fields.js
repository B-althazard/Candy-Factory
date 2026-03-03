import { parseMulti, joinMulti } from "../validate.js";

export function renderField(field, value) {
  const label = escapeHtml(field.label ?? field.path);
  const pathAttr = escapeHtml(field.path);

  if (field.type === "select") {
    const disabled = field.locked ? " disabled" : "";
    const multi = field.multi ? " multiple" : "";
    const selectedSet = field.multi ? new Set(parseMulti(value)) : null;

    const opts = (field.options ?? []).map(o => {
      const ov = String(o);
      const selected = field.multi
        ? (selectedSet.has(ov) ? " selected" : "")
        : (ov === String(value ?? "") ? " selected" : "");
      return `<option value="${escapeHtml(ov)}"${selected}>${escapeHtml(ov)}</option>`;
    }).join("");

    const hint = field.multi ? `<div class="c-muted">Multi-select enabled</div>` : ``;

    return `
      <div class="c-field">
        <div class="c-label">${label}</div>
        <select class="c-select" data-path="${pathAttr}"${multi}${disabled}>
          ${field.multi ? "" : `<option value="">—</option>`}
          ${opts}
        </select>
        ${hint}
      </div>
    `;
  }

  const v = escapeHtml(String(value ?? ""));
  const disabled = field.locked ? " disabled" : "";
  return `
    <div class="c-field">
      <div class="c-label">${label}</div>
      <input class="c-input" data-path="${pathAttr}" value="${v}" placeholder="${label}" autocomplete="off"${disabled} />
    </div>
  `;
}

export function bindFields(rootEl, { onChange }) {
  const handler = (e) => {
    const el = e.target.closest("[data-path]");
    if (!el) return;
    const path = el.getAttribute("data-path");

    if (el instanceof HTMLSelectElement && el.multiple) {
      const values = Array.from(el.selectedOptions).map(o => o.value);
      onChange?.(path, joinMulti(values));
      return;
    }

    onChange?.(path, el.value);
  };
  rootEl.addEventListener("input", handler);
  rootEl.addEventListener("change", handler);
}

export function setFieldValues(rootEl, state, { getByPath }) {
  rootEl.querySelectorAll("[data-path]").forEach(el => {
    const path = el.getAttribute("data-path");
    const v = getByPath(state, path) ?? "";

    if (el instanceof HTMLSelectElement && el.multiple) {
      const set = new Set(parseMulti(v));
      Array.from(el.options).forEach(opt => {
        opt.selected = set.has(opt.value);
      });
      return;
    }

    el.value = v;
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
