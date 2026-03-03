export async function registerServiceWorker({ onStatus } = {}) {
  if (!("serviceWorker" in navigator)) {
    onStatus?.("Service Worker unavailable");
    return;
  }
  try {
    await navigator.serviceWorker.register("./sw.js", { scope: "./" });
    await navigator.serviceWorker.ready;
    onStatus?.("Offline ready");
  } catch {
    onStatus?.("SW registration failed");
  }
}

export function setupInstallButton(buttonEl) {
  let deferred = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    buttonEl.disabled = false;
  });

  buttonEl.addEventListener("click", async () => {
    if (!deferred) return;
    buttonEl.disabled = true;
    deferred.prompt();
    try { await deferred.userChoice; } catch {}
    deferred = null;
  });

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (isStandalone) buttonEl.style.display = "none";
}
