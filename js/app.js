import { createCharacterState, toKeyValuePairs } from "./state.js";
import { loadState, saveState } from "./storage.js";
import { registerServiceWorker, setupInstallButton } from "./pwa.js";
import { renderApp } from "./ui.js";
import { bindChipGroups, setChipActive } from "./components/chips.js";
import { bindInputs, setInputValue } from "./components/form.js";
import { renderOutput } from "./components/output.js";

const appRoot = document.getElementById("app");
renderApp(appRoot);

// --- state bootstrap ---
const persisted = loadState();
const state = createCharacterState(persisted ?? {});

// --- restore UI ---
setInputValue(appRoot, "name", state.name);
setInputValue(appRoot, "age", state.age);
setInputValue(appRoot, "style", state.style);

if (state.pose) setChipActive(appRoot, "pose", state.pose);
if (state.expression) setChipActive(appRoot, "expression", state.expression);
if (state.background) setChipActive(appRoot, "background", state.background);

const outputEl = appRoot.querySelector("#output");
renderOutput(outputEl, toKeyValuePairs(state));

// --- bindings ---
bindInputs(appRoot, {
  onChange: (key, value) => {
    state[key] = (value ?? "").trim();
    saveState(state);
    renderOutput(outputEl, toKeyValuePairs(state));
  }
});

bindChipGroups(appRoot, {
  onSelect: (key, value) => {
    state[key] = value;
    saveState(state);
    renderOutput(outputEl, toKeyValuePairs(state));
  }
});

appRoot.querySelector("#genBtn").addEventListener("click", () => {
  // Explicit “generate” action, while still keeping live updates
  renderOutput(outputEl, toKeyValuePairs(state));
});

// --- PWA ---
const installBtn = document.getElementById("installBtn");
setupInstallButton(installBtn);

const pwaText = document.getElementById("pwaText");
registerServiceWorker({ onStatus: (s) => (pwaText.textContent = s) });