export function validateState(state, schema) {
  const issues = [];
  const fields = flattenSchemaFields(schema);

  for (const f of fields) {
    if (!f?.path) continue;
    const vRaw = getByPath(state, f.path);

    if (f.required && !vRaw) {
      issues.push({ path: f.path, type: "required", message: "Required" });
      continue;
    }

    if (f.type === "select" && vRaw) {
      const opts = Array.isArray(f.options) ? f.options.map(String) : [];
      if (!opts.length) continue;

      if (f.multi) {
        const values = parseMulti(vRaw);
        for (const v of values) {
          if (!opts.includes(v)) {
            issues.push({ path: f.path, type: "option", message: "Invalid option" });
            break;
          }
        }
      } else {
        if (!opts.includes(String(vRaw))) {
          issues.push({ path: f.path, type: "option", message: "Invalid option" });
        }
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

export function parseMulti(raw) {
  return String(raw).split("|").map(s => s.trim()).filter(Boolean);
}

export function joinMulti(values) {
  return (values ?? []).map(s => String(s).trim()).filter(Boolean).join(" | ");
}

function getByPath(obj, path) {
  const v = String(path).split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
  return v === undefined || v === null ? "" : String(v).trim();
}
