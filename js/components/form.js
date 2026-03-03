export function bindInputs(rootEl, { onChange }) {
  const ids = ["name", "age", "style"];
  for (const id of ids) {
    const el = rootEl.querySelector(`#${id}`);
    if (!el) continue;
    el.addEventListener("input", () => onChange?.(id, el.value));
  }
}

export function setInputValue(rootEl, id, value) {
  const el = rootEl.querySelector(`#${id}`);
  if (!el) return;
  el.value = value ?? "";
}