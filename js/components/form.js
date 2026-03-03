export function bindInputs(rootEl, { onChange }) {
  const els = rootEl.querySelectorAll("input[data-path], textarea[data-path]");
  for (const el of els) {
    el.addEventListener("input", () => {
      const path = el.getAttribute("data-path");
      onChange?.(path, el.value);
    });
  }
}

export function setInputsFromState(rootEl, state, { getByPath }) {
  const els = rootEl.querySelectorAll("input[data-path], textarea[data-path]");
  for (const el of els) {
    const path = el.getAttribute("data-path");
    const v = getByPath(state, path);
    el.value = v ?? "";
  }
}