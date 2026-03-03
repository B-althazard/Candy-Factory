import { loadSchema } from "./schema.js";
import { createCharacterState } from "./state.js";
import { formatPreferredOutput } from "./format.js";
import { randomizeState } from "./randomize.js";
import { validateState, applyValidationToFields, summarizeValidation } from "./validate.js";
import { buildFlatKV, downloadText, downloadJson } from "./export.js";
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

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function safeName(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 32) || "character";
}

(async function init() {
  const { schema, source } = await loadSchema();

  const persisted = loadState();
  const state = createCharacterState(persisted ?? {});
  if (!state.subject.gender) state.subject.gender = "female";

  renderApp(appRoot, { schema, state, getByPath });

  const schemaMeta = document.getElementById("schemaMeta");
  const valMeta = document.getElementById("valMeta");
  schemaMeta.textContent = `Schema v${schema.schema_version ?? "?"} (${source})`;

  setFieldValues(appRoot, state, { getByPath });

  const outputEl = document.getElementById("output");
  const outputCard = document.getElementById("outputCard");
  const copyBtn = document.getElementById("copyBtn");

  const randomizeBtn = document.getElementById("genBtn");
  const resetBtn = document.getElementById("resetBtn");
  const exportTxtBtn = document.getElementById("exportTxtBtn");
  const exportJsonBtn = document.getElementById("exportJsonBtn");

  function refreshAll() {
    renderOutput(outputEl, formatPreferredOutput(state, schema));

    const validation = validateState(state, schema);
    applyValidationToFields(appRoot, validation);
    valMeta.textContent = `Validation: ${summarizeValidation(validation)}`;
  }

  refreshAll();

  bindFields(appRoot, {
    onChange: (path, value) => {
      setByPath(state, path, normalize(value));
      saveState(state);
      refreshAll();
    }
  });

  randomizeBtn.addEventListener("click", () => {
    randomizeState(state, schema);
    saveState(state);
    setFieldValues(appRoot, state, { getByPath });
    refreshAll();
    outputCard.scrollIntoView({ behavior: "smooth", block: "start" });
    const prev = randomizeBtn.textContent;
    randomizeBtn.textContent = "Randomized";
    setTimeout(() => { randomizeBtn.textContent = prev; }, 900);
  });

  resetBtn.addEventListener("click", () => {
    const fresh = createCharacterState({});
    fresh.subject.gender = "female";
    Object.keys(state).forEach(k => delete state[k]);
    Object.assign(state, fresh);

    saveState(state);
    setFieldValues(appRoot, state, { getByPath });
    refreshAll();

    const prev = resetBtn.textContent;
    resetBtn.textContent = "Reset";
    setTimeout(() => { resetBtn.textContent = prev; }, 600);
  });

  exportTxtBtn.addEventListener("click", () => {
    const name = (getByPath(state, "character.name") ?? "character").toString().trim() || "character";
    const filename = `CandyFactory_${safeName(name)}_${nowStamp()}.txt`;
    downloadText(filename, outputEl.value);
  });

  exportJsonBtn.addEventListener("click", () => {
    const name = (getByPath(state, "character.name") ?? "character").toString().trim() || "character";
    const filename = `CandyFactory_${safeName(name)}_${nowStamp()}.json`;
    const flat = buildFlatKV(state, schema);
    const payload = {
      app_version: "0.1.0",
      schema_version: schema.schema_version ?? "",
      exported_at: new Date().toISOString(),
      data: flat
    };
    downloadJson(filename, payload);
  });

  copyBtn.addEventListener("click", async () => {
    try {
      await copyToClipboard(outputEl.value);
      copyBtn.textContent = "Copied";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 900);
    } catch {
      copyBtn.textContent = "Copy failed";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 900);
    }
  });

  const installBtn = document.getElementById("installBtn");
  setupInstallButton(installBtn);

  const pwaText = document.getElementById("pwaText");
  registerServiceWorker({ onStatus: (s) => (pwaText.textContent = s) });
})();
