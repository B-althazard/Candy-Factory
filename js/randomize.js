const NAME_POOL = [
  "Ada","Sarah","Mina","Yuna","Lea","Nora","Iris","Hana","Zara","Lina",
  "Sofia","Maya","Ava","Noa","Elena","Aria","Rin","Kira","Naomi","Amara"
];

/**
 * options:
 * - onlyPaths: Set/Array of paths to consider (if provided, only those are randomized)
 * - lockedPaths: Set of paths to SKIP (locks apply to global randomize)
 * - lockAfter: boolean; if true, returns paths actually randomized (for locking)
 * - includeName: boolean; if true, randomizes character.name when eligible
 */
export function randomizeState(state, schema, options = {}) {
  const onlySet = toSet(options.onlyPaths);
  const locked = options.lockedPaths instanceof Set ? options.lockedPaths : new Set();
  const includeName = options.includeName !== false;

  const randomized = [];

  // Name
  if (includeName && shouldConsider("character.name", onlySet) && !locked.has("character.name")) {
    setByPath(state, "character.name", pick(NAME_POOL));
    randomized.push("character.name");
  }

  // Locked dataset gender
  if (shouldConsider("subject.gender", onlySet)) {
    setByPath(state, "subject.gender", "female");
    // do not mark as randomized/lockable
  }

  for (const f of flattenSchemaFields(schema)) {
    if (!f?.path) continue;

    const path = String(f.path);
    if (!shouldConsider(path, onlySet)) continue;
    if (path === "subject.gender") continue;
    if (path === "character.name") continue;
    if (locked.has(path)) continue;

    if (f.type === "select") {
      const opts = Array.isArray(f.options) ? f.options : [];
      if (opts.length) {
        setByPath(state, path, pick(opts));
        randomized.push(path);
      }
    }
  }

  return randomized;
}

export function getSectionPaths(schema, sectionId) {
  const sec = (schema?.sections ?? []).find(s => String(s.id) === String(sectionId));
  if (!sec) return [];
  const out = [];
  for (const f of (sec.fields ?? [])) out.push(String(f.path));
  for (const sub of (sec.subsections ?? [])) {
    for (const f of (sub.fields ?? [])) out.push(String(f.path));
  }
  return out.filter(Boolean);
}

function flattenSchemaFields(schema) {
  const out = [];
  for (const section of (schema?.sections ?? [])) {
    for (const f of (section.fields ?? [])) out.push(f);
    for (const sub of (section.subsections ?? [])) {
      for (const f of (sub.fields ?? [])) out.push(f);
    }
  }
  return out;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function setByPath(obj, path, value) {
  const parts = String(path).split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = String(value);
}

function toSet(x) {
  if (!x) return null;
  if (x instanceof Set) return x;
  if (Array.isArray(x)) return new Set(x.map(String));
  return null;
}

function shouldConsider(path, onlySet) {
  if (!onlySet) return true;
  return onlySet.has(String(path));
}
