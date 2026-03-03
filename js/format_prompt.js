export function formatPromptOutput(state, schema) {
  const parts = [];

  for (const section of (schema?.sections ?? [])) {
    for (const f of (section.fields ?? [])) pushField(parts, state, f);
    for (const sub of (section.subsections ?? [])) {
      for (const f of (sub.fields ?? [])) pushField(parts, state, f);
    }
  }

  return parts.join(", ").replace(/\s+/g, " ").trim();
}

function pushField(parts, state, f) {
  if (!f?.path) return;
  const v = getByPath(state, f.path);
  if (!v) return;

  const key = normalizeKey(f.label ?? f.path);
  const val = String(v).split("|").map(s => s.trim()).filter(Boolean).join(", ");
  parts.push(`${key}: ${val}`);
}

function getByPath(obj, path) {
  const v = String(path).split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
  return v === undefined || v === null ? "" : String(v).trim();
}

function normalizeKey(k) {
  return String(k)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
