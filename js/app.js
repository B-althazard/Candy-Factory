import { createCharacterState, toKeyValuePairs } from "./state.js";
import { loadState, saveState } from "./storage.js";
import { registerServiceWorker, setupInstallButton } from "./pwa.js";
import { renderApp } from "./ui.js";
import { bindChipGroups, setChipActive } from "./components/chips.js";
import { bindInputs, setInputsFromState } from "./components/form.js";
import { renderOutput } from "./components/output.js";

const appRoot = document.getElementById("app");
renderApp(appRoot);

const persisted = loadState();
const state = createCharacterState(persisted ?? {});

const outputEl = appRoot.querySelector("#output");

function getByPath(obj, path) {
  return path.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
}

function setByPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function normalizeValue(path, value) {
  const v = (value ?? "").trim();
  // Keep numbers as strings for stable KV output; change later if you want numeric typing.
  return v;
}

// Restore inputs
setInputsFromState(appRoot, state, { getByPath });

// Restore chips
if (state.pose) setChipActive(appRoot, "pose", state.pose);
if (state.expression) setChipActive(appRoot, "expression", state.expression);
if (state.background) setChipActive(appRoot, "background", state.background);

// Initial output
renderOutput(outputEl, toKeyValuePairs(state));

// Bind text inputs
bindInputs(appRoot, {
  onChange: (path, value) => {
    setByPath(state, path, normalizeValue(path, value));
    saveState(state);
    renderOutput(outputEl, toKeyValuePairs(state));
  }
});

// Bind chip groups (pose/expression/background)
bindChipGroups(appRoot, {
  onSelect: (key, value) => {
    state[key] = value;
    saveState(state);
    renderOutput(outputEl, toKeyValuePairs(state));
  }
});

// Explicit generate button (kept)
appRoot.querySelector("#genBtn").addEventListener("click", () => {
  renderOutput(outputEl, toKeyValuePairs(state));
});

// PWA
const installBtn = document.getElementById("installBtn");
setupInstallButton(installBtn);

const pwaText = document.getElementById("pwaText");
registerServiceWorker({ onStatus: (s) => (pwaText.textContent = s) });