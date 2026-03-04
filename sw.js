const CACHE_NAME = "candy-factory-v0.3.1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js",
  "./VERSION.txt",
  "./CHANGELOG.md",
  "./data/schema.json",
  "./data/schema.v0.2.1.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./styles/tokens.css",
  "./styles/utilities.css",
  "./styles/components.css",
  "./js/app.js",
  "./js/diagnostics.js",
  "./js/pwa.js",
  "./js/schema.js",
  "./js/state.js",
  "./js/storage.js",
  "./js/migrate.js",
  "./js/ui_state.js",
  "./js/locks.js",
  "./js/presets.js",
  "./js/ui.js",
  "./js/format.js",
  "./js/format_prompt.js",
  "./js/randomize.js",
  "./js/validate.js",
  "./js/export.js",
  "./js/components/fields.js",
  "./js/components/output.js",
  "./js/theme/theme.js",
  "./js/project/cfproject.js",
  "./js/workspace/shell.js",
  "./js/workspace/renderer.js",
  "./js/workspace/layout_store.js",
  "./js/workspace/workspace_state.js",
  "./js/workspace/docs.js",
  "./js/workspace/panes/registry.js",
  "./js/workspace/panes/pane_editor.js",
  "./js/workspace/panes/pane_output.js",
  "./js/workspace/panes/pane_presets.js",
  "./js/workspace/panes/pane_preview.js",
  "./js/workspace/panes/pane_diagnostics.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const accept = req.headers.get("accept") || "";
  const isHTML = req.mode === "navigate" || accept.includes("text/html");

  if (isHTML) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(req)) || (await cache.match("./index.html")) || new Response("Offline", { status: 503 });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req);
      if (res && res.status === 200 && res.type === "basic") cache.put(req, res.clone());
      return res;
    } catch {
      return cached || new Response("", { status: 504 });
    }
  })());
});
