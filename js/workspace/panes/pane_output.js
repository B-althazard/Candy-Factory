import { formatPreferredOutput } from "../../format.js";
import { formatPromptOutput } from "../../format_prompt.js";
import { renderOutput, copyToClipboard } from "../../components/output.js";
import { buildFlatKV, downloadText, downloadJson } from "../../export.js";
import { getOutputMode, setOutputMode, saveUIState } from "../../ui_state.js";

export function renderOutputPane(pane, ctx) {
  return `
    <div class="c-pane" data-pane-id="${pane.id}">
      <div class="c-paneHeader">
        <div class="c-paneTitle">${escapeHtml(pane.title || "Output")}</div>
        <div class="c-paneActions">
          <button class="c-btn c-btnTiny c-btnGhost" data-out-mode="preferred" aria-pressed="false" type="button">Preferred</button>
          <button class="c-btn c-btnTiny c-btnGhost" data-out-mode="prompt" aria-pressed="false" type="button">Prompt</button>
          <button class="c-btn c-btnTiny c-btnGhost" data-out-action="copy" type="button">Copy</button>
          <button class="c-btn c-btnTiny c-btnGhost" data-out-action="txt" type="button">TXT</button>
          <button class="c-btn c-btnTiny c-btnGhost" data-out-action="json" type="button">JSON</button>
        </div>
      </div>
      <div class="c-paneBody">
        <textarea class="c-textarea" id="${pane.id}__out" readonly></textarea>
        <div class="c-muted" id="${pane.id}__meta"></div>
      </div>
    </div>
  `;
}

export function bindOutputPane(pane, ctx) {
  const host = ctx.root.querySelector(`[data-pane-id="${pane.id}"]`);
  if (!host) return;
  const out = host.querySelector(`#${cssEscape(pane.id)}__out`);
  const meta = host.querySelector(`#${cssEscape(pane.id)}__meta`);

  function currentOutput(doc) {
    const mode = getOutputMode(ctx.uiState);
    return mode === "prompt" ? formatPromptOutput(doc.state, ctx.schema) : formatPreferredOutput(doc.state, ctx.schema);
  }

  function syncModeButtons() {
    const mode = getOutputMode(ctx.uiState);
    host.querySelectorAll("[data-out-mode]").forEach(b => b.setAttribute("aria-pressed", b.getAttribute("data-out-mode") === mode ? "true" : "false"));
  }

  function refresh() {
    const doc = ctx.getActiveDoc();
    if (!doc) return;
    renderOutput(out, currentOutput(doc));
    meta.textContent = `Doc: ${doc.name}`;
    syncModeButtons();
  }

  refresh();

  host.addEventListener("click", async (e) => {
    const t = e.target;
    const doc = ctx.getActiveDoc();
    if (!doc) return;

    const modeBtn = t.closest("[data-out-mode]");
    if (modeBtn) {
      setOutputMode(ctx.uiState, modeBtn.getAttribute("data-out-mode"));
      saveUIState(ctx.uiState);
      refresh();
      return;
    }

    const act = t.closest("[data-out-action]");
    if (!act) return;
    const a = act.getAttribute("data-out-action");

    if (a === "copy") {
      try { await copyToClipboard(out.value); act.textContent = "Copied"; setTimeout(() => (act.textContent = "Copy"), 700); } catch {}
    }
    if (a === "txt") {
      downloadText(`CandyFactory_${safeName(doc.name)}_${nowStamp()}.txt`, out.value);
    }
    if (a === "json") {
      const flat = buildFlatKV(doc.state, ctx.schema);
      downloadJson(`CandyFactory_${safeName(doc.name)}_${nowStamp()}.json`, {
        app_version: ctx.appVersion,
        schema_version: ctx.schema.schema_version ?? "",
        exported_at: new Date().toISOString(),
        doc_id: doc.id,
        doc_name: doc.name,
        data: flat,
        locked_paths: Array.from(doc.locks ?? []),
        output_mode: getOutputMode(ctx.uiState)
      });
    }
  });

  ctx.onDocChange(() => refresh());
}

function nowStamp() {
  const d = new Date(); const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
function safeName(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,32)||"character"; }
function escapeHtml(str){ return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;"); }
function cssEscape(s){ return String(s).replace(/"/g,'\\"'); }
