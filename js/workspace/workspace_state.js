const WORKSPACE_KEY = "candy_factory_workspace_v1";

export function loadWorkspaceSession() {
  try {
    const raw = localStorage.getItem(WORKSPACE_KEY);
    const v = raw ? JSON.parse(raw) : null;
    return v && typeof v === "object" ? v : null;
  } catch { return null; }
}

export function saveWorkspaceSession(session) {
  try { localStorage.setItem(WORKSPACE_KEY, JSON.stringify(session ?? {})); } catch {}
}

export function createEmptyWorkspace() {
  return { active_doc_id: null, docs: [], ui: { mode: "auto", active_tab: "identity", active_layout_id: "" } };
}
