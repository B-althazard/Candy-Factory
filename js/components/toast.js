let toastApi = null;

export function createNotifier() {
  if (toastApi) return toastApi;

  const host = document.createElement("div");
  host.className = "c-toastHost";
  host.setAttribute("aria-live", "polite");
  host.setAttribute("aria-atomic", "false");
  document.body.appendChild(host);

  function notify(message, options = {}) {
    const text = String(message || "").trim();
    if (!text) return;

    const kind = normalizeKind(options.kind);
    const duration = Number.isFinite(options.duration) ? Math.max(1200, options.duration) : 2400;

    const toast = document.createElement("div");
    toast.className = `c-toast c-toast--${kind}`;
    toast.setAttribute("role", kind === "error" ? "alert" : "status");
    toast.innerHTML = `
      <div class="c-toastBody">${escapeHtml(text)}</div>
      <button class="c-toastClose" type="button" aria-label="Dismiss notification">✕</button>
    `;

    host.appendChild(toast);
    const close = () => {
      if (!toast.isConnected) return;
      toast.classList.add("is-leaving");
      window.setTimeout(() => toast.remove(), 180);
    };

    toast.querySelector(".c-toastClose")?.addEventListener("click", close);
    window.setTimeout(close, duration);
    return close;
  }

  toastApi = { notify };
  return toastApi;
}

function normalizeKind(kind) {
  const v = String(kind || "info").toLowerCase();
  return v === "success" || v === "error" || v === "warning" ? v : "info";
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
