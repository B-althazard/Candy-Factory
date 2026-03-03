const NAME_POOL = [
  "Ada","Sarah","Mina","Yuna","Lea","Nora","Iris","Hana","Zara","Lina",
  "Sofia","Maya","Ava","Noa","Elena","Aria","Rin","Kira","Naomi","Amara"
];

export function randomizeState(state, schema) {
  // Name (freeform in Normal Mode)
  setByPath(state, "character.name", pick(NAME_POOL));

  // Locked for this dataset
  setByPath(state, "subject.gender", "female");

  // Randomize all schema select fields
  for (const f of flattenSchemaFields(schema)) {
    if (!f?.path) continue;
    if (f.path === "character.name") continue;
    if (f.path === "subject.gender") continue;

    if (f.type === "select") {
      const opts = Array.isArray(f.options) ? f.options : [];
      if (opts.length) setByPath(state, f.path, pick(opts));
    }
  }
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
