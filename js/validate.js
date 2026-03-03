export function validateState(state, schema) {
  const issues = [];
  const fields = flattenSchemaFields(schema);

  for (const f of fields) {
    if (!f?.path) continue;
    const v = getByPath(state, f.path);

    if (f.required && !v) {
      issues.push({ path: f.path, type: "required", message: "Required" });
      continue;
    }

    if (f.type === "select" && v) {
      const opts = Array.isArray(f.options) ? f.options.map(String) : [];
      if (opts.length && !opts.includes(String(v))) {
        issues.push({ path: f.path, type: "option", message: "Invalid option" });
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

export function applyValidationToFields(rootEl, validation) {
  rootEl.querySelectorAll("[data-path]").forEach(el => el.classList.remove("is-invalid"));
  const bad = new Set((validation?.issues ?? []).map(i => i.path));
  if (!bad.size) return;

  rootEl.querySelectorAll("[data-path]").forEach(el => {
    const p = el.getAttribute("data-path");
    if (bad.has(p)) el.classList.add("is-invalid");
  });
}

export function summarizeValidation(validation) {
  const issues = validation?.issues ?? [];
  const required = issues.filter(i => i.type === "required").length;
  const option = issues.filter(i => i.type === "option").length;
  if (!issues.length) return "Valid";
  const parts = [];
  if (required) parts.push(`${required} missing`);
  if (option) parts.push(`${option} invalid`);
  return parts.join(" • ");
}

export function flattenSchemaFields(schema) {
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
