/*
Declarative migration format (stored in schema.json):
schema.migrations = [
  {
    "from": "0.1.0",
    "to": "0.1.1",
    "rename": { "old.path": "new.path" },
    "setDefaults": { "some.path": "default value" },
    "delete": ["path.to.remove", "other.path"]
  }
]

Behavior:
- Reads meta.schema_version and schema.schema_version.
- Applies migrations sequentially by matching "from".
- Stops if no matching migration for current version.
- If meta.schema_version is missing, stamps schema_version without altering state.
*/

export function migrateIfNeeded({ state, meta, schema }) {
  const current = normalizeVersion(meta?.schema_version);
  const target = normalizeVersion(schema?.schema_version);

  if (!target) {
    return { state: state ?? {}, meta: { ...(meta ?? {}) }, didMigrate: false, message: "No schema_version" };
  }
  if (current === target) {
    return { state: state ?? {}, meta: { ...(meta ?? {}), schema_version: target }, didMigrate: false, message: "Up to date" };
  }

  const migrations = Array.isArray(schema?.migrations) ? schema.migrations : [];

  // First run: stamp version only
  if (!current) {
    return { state: state ?? {}, meta: { ...(meta ?? {}), schema_version: target }, didMigrate: true, message: "Stamped schema_version" };
  }

  let nextState = deepClone(state ?? {});
  let from = current;
  let steps = 0;
  const maxSteps = 50;

  while (from !== target && steps < maxSteps) {
    const mig = migrations.find(m => normalizeVersion(m?.from) === from);
    if (!mig) break;

    const to = normalizeVersion(mig?.to);
    if (!to) break;

    nextState = applyMigration(nextState, mig);
    from = to;
    steps += 1;
  }

  const didMigrate = steps > 0;
  const outMeta = { ...(meta ?? {}), schema_version: from };

  if (from === target) outMeta.schema_version = target;

  return {
    state: nextState,
    meta: outMeta,
    didMigrate,
    message: from === target ? "Migrated" : (didMigrate ? "Migration incomplete" : "No migration found")
  };
}

function applyMigration(state, mig) {
  let out = deepClone(state);

  const ren = mig?.rename && typeof mig.rename === "object" ? mig.rename : null;
  if (ren) {
    for (const [oldPath, newPath] of Object.entries(ren)) {
      const v = getByPath(out, oldPath);
      if (v !== undefined) {
        setByPath(out, newPath, v);
        deleteByPath(out, oldPath);
      }
    }
  }

  const defs = mig?.setDefaults && typeof mig.setDefaults === "object" ? mig.setDefaults : null;
  if (defs) {
    for (const [path, value] of Object.entries(defs)) {
      const cur = getByPath(out, path);
      if (cur === undefined || cur === null || String(cur).trim() === "") {
        setByPath(out, path, value);
      }
    }
  }

  const dels = Array.isArray(mig?.delete) ? mig.delete : [];
  for (const p of dels) deleteByPath(out, p);

  return out;
}

function normalizeVersion(v) {
  const s = (v ?? "").toString().trim();
  return s || "";
}

function deepClone(x) {
  try { return structuredClone(x); } catch { return JSON.parse(JSON.stringify(x ?? {})); }
}

function getByPath(obj, path) {
  return String(path).split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
}

function setByPath(obj, path, value) {
  const parts = String(path).split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function deleteByPath(obj, path) {
  const parts = String(path).split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur || typeof cur !== "object") return;
    cur = cur[k];
  }
  if (cur && typeof cur === "object") delete cur[parts[parts.length - 1]];
}
