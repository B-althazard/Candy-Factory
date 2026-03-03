export function bindChipGroups(rootEl, { onSelect }) {
  rootEl.querySelectorAll("[data-group]").forEach(groupEl => {
    groupEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button.c-chip");
      if (!btn) return;

      groupEl.querySelectorAll("button.c-chip").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const key = groupEl.getAttribute("data-group");
      const value = btn.getAttribute("data-value");

      onSelect?.(key, value);
    });
  });
}

export function setChipActive(rootEl, group, value) {
  const groupEl = rootEl.querySelector(`[data-group="${group}"]`);
  if (!groupEl) return;
  const btn = groupEl.querySelector(`button.c-chip[data-value="${CSS.escape(value)}"]`);
  if (!btn) return;
  groupEl.querySelectorAll("button.c-chip").forEach(b => b.classList.remove("is-active"));
  btn.classList.add("is-active");
}