import { flattenSchemaFields } from "./validate.js";

export function buildFlatKV(state, schema) {
  const flat = {};
  for (const f of flattenSchemaFields(schema)) {
    if (!f?.path) continue;
    const v = getByPath(state, f.path);
    if (!v) continue;
    flat[f.path] = v;
  }
  return flat;
}

export function downloadText(filename, text) {
  const blob = new Blob([text ?? ""], { type: "text/plain;charset=utf-8" });
  triggerDownload(filename, blob);
}

export function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj ?? {}, null, 2)], { type: "application/json;charset=utf-8" });
  triggerDownload(filename, blob);
}

function triggerDownload(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function getByPath(obj, path) {
  const v = String(path).split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
  return v === undefined || v === null ? "" : String(v).trim();
}
