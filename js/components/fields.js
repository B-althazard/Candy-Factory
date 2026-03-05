import { parseMulti, joinMulti } from "../validate.js";

const OPTION_DIALOG_ID = "cfOptionDialog";
let optionDialog = null;

export function renderField(field, value, options = {}) {
  const label = escapeHtml(field.label ?? field.path);
  const path = String(field.path ?? "");
  const pathAttr = escapeHtml(path);
  const idBase = makeId(path);
  const nameAttr = escapeHtml(path);
  const locked = Boolean(options.locked);
  const fieldClass = `c-field${locked ? " is-locked" : ""}`;
  const lockIcon = locked ? "🔒" : "🔓";
  const lockLabel = locked ? "Unlock field" : "Lock field";
  const lockPressed = locked ? "true" : "false";

  const header = `
    <div class="c-fieldHead">
      <label class="c-label" for="${escapeHtml(idBase)}__btn">${label}</label>
      <button class="c-lockBtn" type="button" data-lock-path="${pathAttr}" aria-pressed="${lockPressed}" aria-label="${lockLabel}" title="${lockLabel}">${lockIcon}</button>
    </div>
  `;

  if (field.type === "select") {
    const values = field.multi ? parseMulti(value) : [String(value ?? "").trim()].filter(Boolean);
    const triggerId = `${idBase}__btn`;
    const hiddenId = `${idBase}__val`;
    const summary = summarizeOptionValue(field, value);
    const chips = renderSelectionChips(pathAttr, values);

    return `
      <div class="${fieldClass}" data-field-path="${pathAttr}">
        ${header}
        <input type="hidden" id="${escapeHtml(hiddenId)}" name="${nameAttr}" data-path="${pathAttr}" value="${escapeHtml(String(value ?? ""))}" />
        <button class="c-optionTrigger" id="${escapeHtml(triggerId)}" type="button" data-option-open="${pathAttr}" aria-haspopup="dialog" aria-controls="${OPTION_DIALOG_ID}">
          <span class="c-optionTriggerText">${escapeHtml(summary)}</span>
          <span class="c-optionTriggerMeta">${field.multi ? `${values.length || 0} selected` : (values[0] ? "Selected" : "Select")}</span>
        </button>
        ${chips}
      </div>
    `;
  }

  const v = escapeHtml(String(value ?? ""));
  return `
    <div class="${fieldClass}" data-field-path="${pathAttr}">
      ${header}
      <input class="c-input" id="${escapeHtml(idBase)}__btn" name="${nameAttr}" data-path="${pathAttr}" value="${v}" placeholder="${label}" autocomplete="off" />
    </div>
  `;
}

export function bindFields(rootEl, { onChange }) {
  const handler = (e) => {
    const el = e.target.closest("[data-path]");
    if (!el) return;
    const path = el.getAttribute("data-path");
    onChange?.(path, el.value, { eventType: e.type, isCommit: e.type === "change" || e.type === "blur" });
  };

  rootEl.addEventListener("input", handler);
  rootEl.addEventListener("change", handler);
  rootEl.addEventListener("blur", handler, true);

  rootEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-option-open]");
    if (!btn || !(btn instanceof HTMLButtonElement)) return;

    const path = btn.getAttribute("data-option-open");
    const field = rootEl.__fieldMap?.get?.(String(path));
    if (!field || field.type !== "select") return;

    const hidden = rootEl.querySelector(`[data-path="${cssEscape(path)}"]`);
    if (!(hidden instanceof HTMLInputElement)) return;

    openOptionDialog({
      label: String(field.label ?? path),
      options: Array.isArray(field.options) ? field.options.map(String) : [],
      selected: field.multi ? parseMulti(hidden.value) : [String(hidden.value || "").trim()].filter(Boolean),
      multiple: Boolean(field.multi),
      onApply: (values) => {
        hidden.value = field.multi ? joinMulti(values) : String(values[0] || "");
        hidden.dispatchEvent(new Event("change", { bubbles: true }));
        syncOptionField(rootEl, path);
      }
    });
  });
}

export function setFieldValues(rootEl, state, { getByPath }) {
  rootEl.querySelectorAll("[data-path]").forEach(el => {
    const path = el.getAttribute("data-path");
    el.value = getByPath(state, path) ?? "";
  });

  rootEl.querySelectorAll("[data-option-open]").forEach(btn => {
    syncOptionField(rootEl, btn.getAttribute("data-option-open"));
  });
}

function syncOptionField(rootEl, path) {
  const field = rootEl.__fieldMap?.get?.(String(path));
  if (!field || field.type !== "select") return;

  const hidden = rootEl.querySelector(`[data-path="${cssEscape(path)}"]`);
  if (!(hidden instanceof HTMLInputElement)) return;

  const values = field.multi ? parseMulti(hidden.value) : [String(hidden.value || "").trim()].filter(Boolean);
  const trigger = rootEl.querySelector(`[data-option-open="${cssEscape(path)}"]`);
  if (trigger) {
    const textEl = trigger.querySelector(".c-optionTriggerText");
    const metaEl = trigger.querySelector(".c-optionTriggerMeta");
    if (textEl) textEl.textContent = summarizeOptionValue(field, hidden.value);
    if (metaEl) metaEl.textContent = field.multi ? `${values.length || 0} selected` : (values[0] ? "Selected" : "Select");
  }

  const chipsHost = rootEl.querySelector(`[data-chip-path="${cssEscape(path)}"]`);
  if (chipsHost) chipsHost.innerHTML = renderSelectionChipItems(values);
}

function summarizeOptionValue(field, rawValue) {
  const values = field.multi ? parseMulti(rawValue) : [String(rawValue ?? "").trim()].filter(Boolean);
  if (!values.length) return field.multi ? "Select one or more options" : "Select an option";
  if (!field.multi) return values[0];
  if (values.length <= 2) return values.join(", ");
  return `${values.slice(0, 2).join(", ")} +${values.length - 2}`;
}

function renderSelectionChips(pathAttr, values) {
  return `<div class="c-chipRow" data-chip-path="${pathAttr}">${renderSelectionChipItems(values)}</div>`;
}

function renderSelectionChipItems(values) {
  return (values ?? []).map(v => `<span class="c-chip">${escapeHtml(v)}</span>`).join("");
}

function openOptionDialog(args) {
  ensureOptionDialog().open(args);
}

function ensureOptionDialog() {
  if (optionDialog) return optionDialog;

  const overlay = document.createElement("div");
  overlay.id = OPTION_DIALOG_ID;
  overlay.className = "c-modalOverlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="c-modalScrim" data-modal-close="1"></div>
    <div class="c-modal c-modal--options">
      <div class="c-modalHeader">
        <div class="c-modalTitle" id="${OPTION_DIALOG_ID}__title"></div>
        <button class="c-btn c-btnGhost c-btnTiny" type="button" data-modal-close="1" aria-label="Close">✕</button>
      </div>
      <div class="c-modalBody">
        <input class="c-input" type="search" id="${OPTION_DIALOG_ID}__search" placeholder="Search options" autocomplete="off" />
        <div class="c-modalList" id="${OPTION_DIALOG_ID}__list"></div>
      </div>
      <div class="c-modalFooter">
        <button class="c-btn c-btnGhost" type="button" data-modal-clear="1">Clear</button>
        <button class="c-btn c-btnGhost" type="button" data-modal-cancel="1">Cancel</button>
        <button class="c-btn c-btnPrimary" type="button" data-modal-apply="1">Apply</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const titleEl = overlay.querySelector(`#${OPTION_DIALOG_ID}__title`);
  const searchEl = overlay.querySelector(`#${OPTION_DIALOG_ID}__search`);
  const listEl = overlay.querySelector(`#${OPTION_DIALOG_ID}__list`);

  const state = {
    open: false,
    label: "",
    options: [],
    selected: new Set(),
    multiple: false,
    onApply: null
  };

  function close() {
    state.open = false;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    searchEl.value = "";
    listEl.innerHTML = "";
    state.onApply = null;
  }

  function renderList() {
    const q = String(searchEl.value || "").toLowerCase().trim();
    const rows = [];

    for (const opt of state.options) {
      if (q && !String(opt).toLowerCase().includes(q)) continue;
      const checked = state.selected.has(opt);
      const marker = state.multiple ? (checked ? "☑" : "☐") : (checked ? "◉" : "○");
      rows.push(`
        <button class="c-optionRow ${checked ? "is-selected" : ""}" type="button" data-option-row="${escapeHtml(opt)}" aria-pressed="${checked ? "true" : "false"}">
          <span class="c-optionRowMarker">${marker}</span>
          <span class="c-optionRowText">${escapeHtml(opt)}</span>
        </button>
      `);
    }

    listEl.innerHTML = rows.join("") || `<div class="c-muted">No matches</div>`;
  }

  overlay.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-modal-close]");
    const cancelBtn = e.target.closest("[data-modal-cancel]");
    const clearBtn = e.target.closest("[data-modal-clear]");
    const applyBtn = e.target.closest("[data-modal-apply]");
    const rowBtn = e.target.closest("[data-option-row]");

    if (closeBtn || cancelBtn) {
      close();
      return;
    }

    if (clearBtn) {
      state.selected.clear();
      renderList();
      return;
    }

    if (rowBtn) {
      const opt = rowBtn.getAttribute("data-option-row");
      if (!opt) return;
      if (state.multiple) {
        if (state.selected.has(opt)) state.selected.delete(opt);
        else state.selected.add(opt);
      } else {
        state.selected = state.selected.has(opt) ? new Set() : new Set([opt]);
      }
      renderList();
      return;
    }

    if (applyBtn) {
      state.onApply?.(Array.from(state.selected));
      close();
    }
  });

  searchEl.addEventListener("input", renderList);
  document.addEventListener("keydown", (e) => {
    if (!state.open) return;
    if (e.key === "Escape") close();
  });

  optionDialog = {
    open: ({ label, options, selected, multiple, onApply }) => {
      state.open = true;
      state.label = String(label || "Select");
      state.options = (options ?? []).map(String);
      state.selected = new Set(Array.from(selected ?? []));
      state.multiple = Boolean(multiple);
      state.onApply = typeof onApply === "function" ? onApply : null;
      titleEl.textContent = state.label;
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      renderList();
      searchEl.focus();
    }
  };

  return optionDialog;
}

function makeId(path) {
  const base = String(path || "field")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60) || "field";
  return `cf_${base}`;
}

function cssEscape(s) {
  return String(s).replace(/"/g, "\"");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
