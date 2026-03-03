import { loadSchema } from "./schema.js";
import { createCharacterState } from "./state.js";
import { formatPreferredOutput } from "./format.js";
import { randomizeState, getSectionPaths } from "./randomize.js";
import { validateState, applyValidationToFields, summarizeValidation } from "./validate.js";
import { buildFlatKV, downloadText, downloadJson } from "./export.js";
import { loadState, saveState, loadMeta, saveMeta } from "./storage.js";
import { loadLocks, saveLocks, lockPaths, unlockPath } from "./locks.js";
import { migrateIfNeeded } from "./migrate.js";
import { loadUIState, saveUIState, isCollapsed, setCollapsed } from "./ui_state.js";
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

function applyLocksToFields(rootEl, locks) {
  rootEl.querySelectorAll("[data-path]").forEach(el => {
    const p = el.getAttribute("data-path");
    const field = el.closest(".c-field");
    if (!field) return;
    field.classList.toggle("is-locked", locks.has(p));
  });
}

(async function init() {
  const { schema, source } = await loadSchema();

  const persisted = loadState();
  const meta = loadMeta();

  const mig = migrateIfNeeded({ state: persisted ?? {}, meta: meta ?? {}, schema });
  saveMeta(mig.meta);

  const state = createCharacterState(mig.state ?? {});
  if (!state.subject.gender) state.subject.gender = "female";
  saveState(state);

  const locks = loadLocks();
  const uiState = loadUIState();

  renderApp(appRoot, { schema, state, getByPath, uiState });

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
    applyLocksToFields(appRoot, locks);

    const migNote = mig.didMigrate ? ` • Migration: ${mig.message}` : "";
    valMeta.textContent = `Validation: ${summarizeValidation(validation)}${migNote}`;
  }

  refreshAll();

  // Collapsible sections + section random (event delegation)
  appRoot.addEventListener("click", (e) => {
    const t = e.target;

    const toggle = t.closest("[data-toggle-section]");
    if (toggle) {
      const id = toggle.getAttribute("data-toggle-section");
      const body = appRoot.querySelector(`[data-section-body="${cssEscape(id)}"]`);
      const card = appRoot.querySelector(`[data-section-id="${cssEscape(id)}"]`);
      if (!body || !card) return;

      const collapsed = !body.classList.contains("is-collapsed");
      body.classList.toggle("is-collapsed", collapsed);
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      const chev = toggle.querySelector(".c-chevron");
      if (chev) chev.textContent = collapsed ? "▸" : "▾";

      setCollapsed(uiState, id, collapsed);
      saveUIState(uiState);
      return;
    }

    const rand = t.closest("[data-rand-section]");
    if (rand) {
      const id = rand.getAttribute("data-rand-section");
      const paths = getSectionPaths(schema, id);
      const randomized = randomizeState(state, schema, {
        onlyPaths: paths,
        lockedPaths: new Set(), // section random ignores locks
        includeName: id === "character"
      });

      // lock randomized paths (excluding forced subject.gender)
      lockPaths(locks, randomized);
      saveLocks(locks);

      saveState(state);
      setFieldValues(appRoot, state, { getByPath });
      refreshAll();

      const prev = rand.textContent;
      rand.textContent = "Randomized";
      setTimeout(() => { rand.textContent = prev; }, 800);
    }
  });

  bindFields(appRoot, {
    onChange: (path, value) => {
      setByPath(state, path, normalize(value));
      // manual edits unlock from randomization lock
      if (locks.has(path)) {
        unlockPath(locks, path);
        saveLocks(locks);
      }
      saveState(state);
      refreshAll();
    }
  });

  randomizeBtn.addEventListener("click", () => {
    randomizeState(state, schema, { lockedPaths: locks, includeName: true });
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

    // clear locks on full reset
    locks.clear();
    saveLocks(locks);

    saveState(state);
    saveMeta({ ...(loadMeta() ?? {}), schema_version: schema.schema_version ?? "" });
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
      app_version: "0.1.4",
      schema_version: schema.schema_version ?? "",
      exported_at: new Date().toISOString(),
      data: flat,
      locked_paths: Array.from(locks)
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

function cssEscape(s) {
  // minimal escape for attribute selectors; ids are schema ids (safe)
  return String(s).replace(/"/g, '\"');
}
