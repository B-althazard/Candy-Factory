const PRESETS_KEY = "candy_factory_presets_v1";

export function loadPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function savePresets(presets) {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(Array.isArray(presets) ? presets : []));
  } catch {
    // ignore
  }
}

export function addPreset({ name, state, locks }) {
  const presets = loadPresets();
  const item = {
    id: cryptoId(),
    name: String(name || "Preset").trim().slice(0, 40) || "Preset",
    created_at: new Date().toISOString(),
    state: state ?? {},
    locks: Array.isArray(locks) ? locks : []
  };
  presets.unshift(item);
  presets.length = Math.min(presets.length, 50);
  savePresets(presets);
  return { presets, id: item.id };
}

export function deletePreset(id) {
  const presets = loadPresets().filter(p => String(p.id) !== String(id));
  savePresets(presets);
  return presets;
}

export function getPreset(id) {
  return loadPresets().find(p => String(p.id) === String(id)) || null;
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
