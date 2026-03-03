import { serializeDoc } from "../workspace/docs.js";

export function buildProjectFile({ app_version, schema_version, project, docs, layouts, theme, uiState }) {
  const now = new Date().toISOString();
  return {
    app_version,
    schema_version,
    project_id: project?.id || "default",
    project_name: project?.name || "Candy Factory Project",
    created_at: project?.created_at || now,
    updated_at: now,
    characters: (docs ?? []).map(serializeDoc),
    workspace_layouts: layouts ?? [],
    settings: { theme_mode: theme?.mode || "light", ui_state: uiState ?? {} }
  };
}

export async function readProjectFile(file) {
  const txt = await file.text();
  return JSON.parse(txt);
}

export function downloadProject(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
