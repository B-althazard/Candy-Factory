const LAYOUTS_KEY = "candy_factory_layouts_v1";

export function loadLayouts() {
  try {
    const raw = localStorage.getItem(LAYOUTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export function saveLayouts(layouts) {
  try { localStorage.setItem(LAYOUTS_KEY, JSON.stringify(Array.isArray(layouts) ? layouts : [])); } catch {}
}

export function upsertLayout({ id, name, device_mode, layout }) {
  const layouts = loadLayouts();
  const item = { id: id || cryptoId(), name: String(name || "Layout").trim().slice(0,40) || "Layout", device_mode: device_mode || "auto", updated_at: new Date().toISOString(), layout: layout ?? {} };
  const idx = layouts.findIndex(x => String(x.id) === String(item.id));
  if (idx >= 0) layouts[idx] = item; else layouts.unshift(item);
  layouts.length = Math.min(layouts.length, 30);
  saveLayouts(layouts);
  return { layouts, id: item.id };
}

function cryptoId() {
  try {
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return Array.from(a).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return String(Date.now()) + "_" + Math.random().toString(16).slice(2);
  }
}
