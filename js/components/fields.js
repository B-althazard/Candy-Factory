import { parseMulti, joinMulti } from "../validate.js";

const MULTI_DIALOG_ID = "cfMultiDialog";
let multiDialog = null;

export function renderField(field, value) {
  const label = escapeHtml(field.label ?? field.path);
  const path = String(field.path ?? "");
  const pathAttr = escapeHtml(path);

  const idBase = makeId(path);
  const nameAttr = escapeHtml(path);

  if (field.type === "select") {
    const disabled = field.locked ? " disabled" : "";

    // Mobile-friendly multi-select (dialog checklist) instead of <select multiple>.
    if (field.multi && isMobileDevice()) {
      const values = parseMulti(value);
      const summary = values.length ? values.join(", ") : "Tap to select";
      const btnId = `${idBase}__btn`;
      const hiddenId = `${idBase}__val`;

      return `
        <div class="c-field">
          <label class="c-label" for="${escapeHtml(btnId)}">${label}</label>
          <input type="hidden" id="${escapeHtml(hiddenId)}" name="${nameAttr}" data-path="${pathAttr}" value="${escapeHtml(String(value ?? ""))}"${disabled} />
          <button class="c-multiTrigger" id="${escapeHtml(btnId)}" type="button" data-multi-open="${pathAttr}" aria-haspopup="dialog" aria-controls="${MULTI_DIALOG_ID}"${disabled}>${escapeHtml(truncate(summary, 64))}</button>
        </div>
      `;
    }

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
        <label class="c-label" for="${escapeHtml(idBase)}">${label}</label>
        <select class="c-select" id="${escapeHtml(idBase)}" name="${nameAttr}" data-path="${pathAttr}"${multi}${disabled}>
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
      <label class="c-label" for="${escapeHtml(idBase)}">${label}</label>
      <input class="c-input" id="${escapeHtml(idBase)}" name="${nameAttr}" data-path="${pathAttr}" value="${v}" placeholder="${label}" autocomplete="off"${disabled} />
    </div>
  `;
}

export function bindFields(rootEl, { onChange }) {
  // Value changes via native inputs/selects.
  const handler = (e) => {
    const el = e.target.closest("[data-path]");
    if (!el) return;
    const path = el.getAttribute("data-path");

    if (el instanceof HTMLSelectElement && el.multiple) {
      const values = Array.from(el.selectedOptions).map(o => o.value);
      onChange?.(path, joinMulti(values), { eventType: e.type, isCommit: e.type === "change" });
      return;
    }

    onChange?.(path, el.value, { eventType: e.type, isCommit: e.type === "change" });
  };
  rootEl.addEventListener("input", handler);
  rootEl.addEventListener("change", handler);

  // Mobile multi-select dialog open.
  rootEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-multi-open]");
    if (!btn) return;
    if (!(btn instanceof HTMLButtonElement)) return;
    if (btn.hasAttribute("disabled")) return;

    const path = btn.getAttribute("data-multi-open");
    const field = rootEl.__fieldMap?.get?.(String(path));
    if (!field || field.type !== "select" || !field.multi) return;

    const hidden = rootEl.querySelector(`[data-path="${cssEscape(path)}"]`);
    if (!(hidden instanceof HTMLInputElement)) return;

    const label = String(field.label ?? path);
    const options = Array.isArray(field.options) ? field.options.map(String) : [];
    const selected = new Set(parseMulti(hidden.value));

    openMultiDialog({
      label,
      options,
      selected,
      onApply: (values) => {
        hidden.value = joinMulti(values);
        // Drive the existing change pipeline.
        hidden.dispatchEvent(new Event("change", { bubbles: true }));
        btn.textContent = values.length ? truncate(values.join(", "), 64) : "Tap to select";
      }
    });
  });
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

  // Update mobile multi-select button summaries.
  rootEl.querySelectorAll("[data-multi-open]").forEach(btn => {
    const path = btn.getAttribute("data-multi-open");
    const hidden = rootEl.querySelector(`[data-path="${cssEscape(path)}"]`);
    if (!(hidden instanceof HTMLInputElement)) return;
    const values = parseMulti(hidden.value);
    btn.textContent = values.length ? truncate(values.join(", "), 64) : "Tap to select";
  });
}

function isMobileDevice() {
  const d = document.documentElement.getAttribute("data-device");
  if (d) return d === "mobile";
  return (window.matchMedia && window.matchMedia("(max-width: 979px)").matches);
}

function makeId(path) {
  const base = String(path || "field")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60) || "field";
  return `cf_${base}`;
}

function truncate(s, max) {
  const str = String(s ?? "");
  if (str.length <= max) return str;
  return str.slice(0, Math.max(0, max - 1)) + "…";
}

function cssEscape(s) {
  return String(s).replace(/"/g, "\\\"");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function ensureMultiDialog() {
  if (multiDialog) return multiDialog;

  const overlay = document.createElement("div");
  overlay.id = MULTI_DIALOG_ID;
  overlay.className = "c-modalOverlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="c-modalScrim" data-modal-close="1"></div>
    <div class="c-modal">
      <div class="c-modalHeader">
        <div class="c-modalTitle" id="${MULTI_DIALOG_ID}__title"></div>
        <button class="c-btn c-btnGhost c-btnTiny" type="button" data-modal-close="1" aria-label="Close">✕</button>
      </div>
      <div class="c-modalBody">
        <input class="c-input" type="search" id="${MULTI_DIALOG_ID}__search" placeholder="Search" autocomplete="off" />
        <div class="c-modalList" id="${MULTI_DIALOG_ID}__list"></div>
      </div>
      <div class="c-modalFooter">
        <button class="c-btn c-btnGhost" type="button" data-modal-cancel="1">Cancel</button>
        <button class="c-btn c-btnPrimary" type="button" data-modal-apply="1">Apply</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const titleEl = overlay.querySelector(`#${MULTI_DIALOG_ID}__title`);
  const searchEl = overlay.querySelector(`#${MULTI_DIALOG_ID}__search`);
  const listEl = overlay.querySelector(`#${MULTI_DIALOG_ID}__list`);

  const state = {
    open: false,
    label: "",
    options: [],
    selected: new Set(),
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
      const checked = state.selected.has(opt) ? " checked" : "";
      const id = `${MULTI_DIALOG_ID}__opt_${escapeId(opt)}`;
      rows.push(`
        <label class="c-modalRow" for="${escapeHtml(id)}">
          <input type="checkbox" id="${escapeHtml(id)}" data-multi-opt="${escapeHtml(opt)}"${checked} />
          <span>${escapeHtml(opt)}</span>
        </label>
      `);
    }

    listEl.innerHTML = rows.join("") || `<div class="c-muted">No matches</div>`;
  }

  overlay.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-modal-close]");
    const cancelBtn = e.target.closest("[data-modal-cancel]");
    const applyBtn = e.target.closest("[data-modal-apply]");

    if (closeBtn || cancelBtn) {
      close();
      return;
    }

    if (applyBtn) {
      const values = Array.from(state.selected);
      state.onApply?.(values);
      close();
      return;
    }
  });

  overlay.addEventListener("change", (e) => {
    const cb = e.target.closest("[data-multi-opt]");
    if (!(cb instanceof HTMLInputElement)) return;
    const opt = cb.getAttribute("data-multi-opt");
    if (!opt) return;
    if (cb.checked) state.selected.add(opt);
    else state.selected.delete(opt);
  });

  searchEl.addEventListener("input", () => renderList());

  document.addEventListener("keydown", (e) => {
    if (!state.open) return;
    if (e.key === "Escape") close();
  });

  multiDialog = {
    open: ({ label, options, selected, onApply }) => {
      state.open = true;
      state.label = String(label || "Select");
      state.options = (options ?? []).map(String);
      state.selected = new Set(Array.from(selected ?? []));
      state.onApply = typeof onApply === "function" ? onApply : null;

      titleEl.textContent = state.label;
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      renderList();
      searchEl.focus();
    }
  };

  return multiDialog;
}

function openMultiDialog(args) {
  ensureMultiDialog().open(args);
}

function escapeId(v) {
  return String(v).toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 64);
}
