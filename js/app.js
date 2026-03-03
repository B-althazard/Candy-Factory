import { loadSchema } from "./schema.js";
import { createCharacterState, toPreferredOutput } from "./state.js";
import { loadState, saveState } from "./storage.js";
import { registerServiceWorker, setupInstallButton } from "./pwa.js";
import { renderApp } from "./ui.js";
import { bindFields, setFieldValues } from "./components/fields.js";
import { renderOutput, copyToClipboard } from "./components/output.js";

const appRoot = document.getElementById("app");

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

function normalize(value) {
  return (value ?? "").toString().trim();
}

(async function init() {
  const { schema, source } = await loadSchema();

  const persisted = loadState();
  const state = createCharacterState(persisted ?? {});
  if (!state.subject.gender) state.subject.gender = "female";

  renderApp(appRoot, { schema, state, getByPath });

  document.getElementById("schemaMeta").textContent =
    `Schema v${schema.schema_version ?? "?"} (${source})`;

  setFieldValues(appRoot, state, { getByPath });

  const outputEl = document.getElementById("output");
  const copyBtn = document.getElementById("copyBtn");
  const genBtn = document.getElementById("genBtn");

  const refreshOutput = () => renderOutput(outputEl, toPreferredOutput(state));
  refreshOutput();

  bindFields(appRoot, {
    onChange: (path, value) => {
      setByPath(state, path, normalize(value));
      saveState(state);
      refreshOutput();
    }
  });

  genBtn.addEventListener("click", refreshOutput);

  copyBtn.addEventListener("click", async () => {
    try {
      await copyToClipboard(outputEl.value);
      copyBtn.textContent = "Copied";
      setTimeout(() => (copyBtn.textContent = "Copy"), 900);
    } catch {
      copyBtn.textContent = "Copy failed";
      setTimeout(() => (copyBtn.textContent = "Copy"), 900);
    }
  });

  const installBtn = document.getElementById("installBtn");
  setupInstallButton(installBtn);
  const pwaText = document.getElementById("pwaText");
  registerServiceWorker({ onStatus: (s) => (pwaText.textContent = s) });
})();
