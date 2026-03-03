import { loadPresets, addPreset, deletePreset, getPreset } from "../../presets.js";
import { createCharacterState } from "../../state.js";
import { saveLocks } from "../../locks.js";

export function renderPresetsPane(pane, ctx) {
  return `
    <div class="c-pane" data-pane-id="${pane.id}">
      <div class="c-paneHeader">
        <div class="c-paneTitle">${escapeHtml(pane.title || "Presets")}</div>
        <div class="c-paneActions">
          <button class="c-btn c-btnTiny c-btnGhost" data-pre-action="save" type="button">Save</button>
          <button class="c-btn c-btnTiny c-btnGhost" data-pre-action="apply" type="button">Apply</button>
          <button class="c-btn c-btnTiny c-btnGhost" data-pre-action="delete" type="button">Delete</button>
        </div>
      </div>
      <div class="c-paneBody">
        <select class="c-select" id="${pane.id}__sel"><option value="">—</option></select>
        <div class="c-muted" id="${pane.id}__meta"></div>
      </div>
    </div>
  `;
}

export function bindPresetsPane(pane, ctx) {
  const host = ctx.root.querySelector(`[data-pane-id="${pane.id}"]`);
  if (!host) return;
  const sel = host.querySelector(`#${cssEscape(pane.id)}__sel`);
  const meta = host.querySelector(`#${cssEscape(pane.id)}__meta`);

  let presets = loadPresets();
  renderOptions();
  meta.textContent = presets.length ? `${presets.length} saved` : "No presets saved";

  function renderOptions() {
    const cur = sel.value;
    sel.innerHTML = `<option value="">—</option>` + presets.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`).join("");
    if (cur) sel.value = cur;
  }

  host.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pre-action]");
    if (!btn) return;
    const a = btn.getAttribute("data-pre-action");
    const doc = ctx.getActiveDoc();
    if (!doc) return;

    if (a === "save") {
      const defaultName = String(doc.state.character?.name || doc.name || "Preset").trim() || "Preset";
      const name = window.prompt("Preset name", defaultName);
      if (!name) return;
      const out = addPreset({ name, state: deepClone(doc.state), locks: Array.from(doc.locks) });
      presets = out.presets; renderOptions(); sel.value = out.id;
      meta.textContent = `${presets.length} saved`;
    }

    if (a === "apply") {
      const id = sel.value; if (!id) return;
      const p = getPreset(id); if (!p) return;
      const fresh = createCharacterState(p.state ?? {});
      if (!fresh.subject.gender) fresh.subject.gender = "female";
      Object.keys(doc.state).forEach(k => delete doc.state[k]);
      Object.assign(doc.state, fresh);
      doc.locks.clear();
      for (const x of (p.locks ?? [])) doc.locks.add(String(x));
      saveLocks(doc.locks);
      ctx.touchDoc(doc); ctx.persistSession(); ctx.emitDocChange();
    }

    if (a === "delete") {
      const id = sel.value; if (!id) return;
      if (!window.confirm("Delete preset?")) return;
      presets = deletePreset(id); renderOptions();
      meta.textContent = presets.length ? `${presets.length} saved` : "No presets saved";
    }
  });
}

function deepClone(x){ try{ return structuredClone(x);}catch{ return JSON.parse(JSON.stringify(x ?? {})); } }
function escapeHtml(str){ return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;"); }
function cssEscape(s){ return String(s).replace(/"/g,'\\"'); }
