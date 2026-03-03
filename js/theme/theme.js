const THEME_KEY = "candy_factory_theme_v1";

export function loadTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    const v = raw ? JSON.parse(raw) : {};
    const mode = String(v.mode || "light").toLowerCase();
    return { mode: mode === "dark" ? "dark" : mode === "native" ? "native" : "light" };
  } catch {
    return { mode: "light" };
  }
}

export function saveTheme(theme) {
  try { localStorage.setItem(THEME_KEY, JSON.stringify({ mode: theme?.mode || "light" })); } catch {}
}

export function applyTheme(theme) {
  const mode = String(theme?.mode || "light").toLowerCase();
  document.documentElement.dataset.theme = mode === "dark" ? "dark" : mode === "native" ? "native" : "light";
}
