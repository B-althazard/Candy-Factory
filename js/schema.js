async function fetchJson(url, { timeoutMs = 2500 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function loadSchema() {
  try {
    const latest = await fetchJson("./data/schema.json");
    return { schema: latest, source: "network" };
  } catch {
    const fallback = await fetch("./data/schema.v0.0.7.json", { cache: "force-cache" });
    const schema = await fallback.json();
    return { schema, source: "fallback" };
  }
}
