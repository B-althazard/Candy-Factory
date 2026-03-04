// Local-first diagnostics store (no backend dependency)
// - Captures runtime errors + unhandled promise rejections
// - Persists a bounded event buffer to localStorage
// - Supports exportable payload for bug reports

const DIAG_KEY = "candy_factory_diagnostics_v1";
const MAX_EVENTS = 200;

export function createDiagnostics({ appVersion, getContext }) {
  const ctxFn = typeof getContext === "function" ? getContext : () => ({});
  const state = load();

  function log(level, type, message, data) {
    const evt = {
      id: cryptoId(),
      ts: new Date().toISOString(),
      level: String(level || "info"),
      type: String(type || "event"),
      message: String(message || ""),
      data: sanitize(data),
      context: sanitize(ctxFn())
    };
    state.events.unshift(evt);
    state.events.length = Math.min(state.events.length, MAX_EVENTS);
    state.updated_at = evt.ts;
    persist();
    return evt.id;
  }

  function get() {
    return deepClone(state);
  }

  function clear() {
    state.events = [];
    state.updated_at = new Date().toISOString();
    persist();
  }

  function exportPayload({ schemaVersion } = {}) {
    const ctx = ctxFn();
    return {
      app_version: String(appVersion || ""),
      schema_version: String(schemaVersion || ctx?.schema_version || ""),
      exported_at: new Date().toISOString(),
      context: sanitize(ctx),
      diagnostics: get()
    };
  }

  function installGlobalHandlers() {
    // window.onerror
    window.addEventListener("error", (ev) => {
      try {
        log(
          "error",
          "window_error",
          ev?.message || "Unhandled error",
          {
            filename: ev?.filename,
            lineno: ev?.lineno,
            colno: ev?.colno,
            stack: ev?.error?.stack
          }
        );
      } catch {}
    });

    // unhandledrejection
    window.addEventListener("unhandledrejection", (ev) => {
      try {
        const reason = ev?.reason;
        log(
          "error",
          "unhandled_rejection",
          reason?.message || String(reason || "Unhandled rejection"),
          { stack: reason?.stack }
        );
      } catch {}
    });
  }

  function persist() {
    try { localStorage.setItem(DIAG_KEY, JSON.stringify(state)); } catch {}
  }

  return { log, get, clear, exportPayload, installGlobalHandlers };
}

function load() {
  try {
    const raw = localStorage.getItem(DIAG_KEY);
    const v = raw ? JSON.parse(raw) : null;
    if (v && typeof v === "object" && Array.isArray(v.events)) return v;
  } catch {}
  return { created_at: new Date().toISOString(), updated_at: new Date().toISOString(), events: [] };
}

function sanitize(x) {
  // Ensure JSON-serializable; avoid leaking DOM objects.
  try {
    return JSON.parse(JSON.stringify(x ?? null));
  } catch {
    return { note: "non-serializable" };
  }
}

function deepClone(x) {
  try { return structuredClone(x); } catch { return JSON.parse(JSON.stringify(x ?? {})); }
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
