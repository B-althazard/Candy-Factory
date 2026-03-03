export function formatPreferredOutput(state, schema) {
  const lines = [];

  const name = getByPath(state, "character.name");
  const gender = getByPath(state, "subject.gender");
  if (name || gender) {
    const parts = [];
    if (name) parts.push(name);
    if (gender) parts.push(capitalize(gender));
    lines.push(`Name ${parts.join(", ")}`);
  }

  const dmType = getByPath(state, "body.distinguishing_marks.type");
  const dmLoc = getByPath(state, "body.distinguishing_marks.location");
  if (dmType && dmLoc) lines.push(`Distinguishing Marks, ${dmType} on the ${dmLoc}`);

  const pose = getByPath(state, "pose");
  const expr = getByPath(state, "expression");
  if (pose || expr) {
    const p = pose ? pose.toLowerCase() : "";
    const e = expr ? ` with a ${expr.toLowerCase()} expression` : "";
    lines.push(`Pose, ${p}${e}`);
  }

  const bg = getByPath(state, "background");
  if (bg) lines.push(`Background ${bg.toLowerCase()}`);

  const h = getByPath(state, "body.height_cm");
  if (h) lines.push(`Height ${h}cm`);

  // Schema-driven for all other fields (label, value)
  const skip = new Set([
    "character.name",
    "subject.gender",
    "body.distinguishing_marks.type",
    "body.distinguishing_marks.location",
    "pose",
    "expression",
    "background",
    "body.height_cm"
  ]);

  for (const f of flattenSchemaFields(schema)) {
    if (!f?.path || skip.has(f.path)) continue;
    const v = getByPath(state, f.path);
    if (!v) continue;
    lines.push(`${f.label ?? f.path}, ${v}`);
  }

  return lines.join("\n");
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

function getByPath(obj, path) {
  const v = String(path).split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
  return v === undefined || v === null ? "" : String(v).trim();
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
