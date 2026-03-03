const UI_STATE_KEY = "candy_factory_ui_state_v1";

export function loadUIState() {
  try {
    const raw = localStorage.getItem(UI_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUIState(state) {
  try {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(state ?? {}));
  } catch {
    // ignore
  }
}

export function isCollapsed(uiState, sectionId) {
  return Boolean(uiState?.collapsed?.[String(sectionId)]);
}

export function setCollapsed(uiState, sectionId, collapsed) {
  if (!uiState.collapsed || typeof uiState.collapsed !== "object") uiState.collapsed = {};
  uiState.collapsed[String(sectionId)] = Boolean(collapsed);
}
