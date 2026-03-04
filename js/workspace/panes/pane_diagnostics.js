import { downloadJson } from "../../export.js";

export function renderDiagnosticsPane(pane, ctx) {
  return `
    <div class="c-pane" data-pane-id="${escapeHtml(pane.id)}">
      <div class="c-paneHeader">
        <div class="c-paneTitle">${escapeHtml(pane.title || "Diagnostics")}</div>
        <div class="c-paneActions">
          <button class="c-btn c-btnTiny c-btnGhost" data-diag-action="export" type="button">Export</button>
          <button class="c-btn c-btnTiny c-btnGhost" data-diag-action="clear" type="button">Clear</button>
        </div>
      </div>
      <div class="c-paneBody">
        <div class="c-muted" id="${escapeHtml(pane.id)}__meta"></div>
        <div class="c-diagList" id="${escapeHtml(pane.id)}__list"></div>
      </div>
    </div>
  `;
}

export function bindDiagnosticsPane(pane, ctx) {
  const host = ctx.root.querySelector(`[data-pane-id="${cssEscape(pane.id)}"]`);
  if (!host) return;
  const meta = host.querySelector(`#${cssEscape(pane.id)}__meta`);
  const list = host.querySelector(`#${cssEscape(pane.id)}__list`);

  function refresh() {
    const snap = ctx.diagnostics?.get?.() || { events: [] };
    const events = Array.isArray(snap.events) ? snap.events : [];
    meta.textContent = `${events.length} events • stored locally`;
    list.innerHTML = events.length ? events.map(renderEvent).join("") : `<div class="c-muted">No diagnostics recorded.</div>`;
  }

  function exportNow() {
    const payload = ctx.diagnostics?.exportPayload?.({ schemaVersion: ctx.schema?.schema_version || "" }) || {};
    downloadJson(`CandyFactory_Diagnostics_${nowStamp()}.json`, payload);
  }

  host.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-diag-action]");
    if (!btn) return;
    const a = btn.getAttribute("data-diag-action");
    if (a === "export") {
      exportNow();
      return;
    }
    if (a === "clear") {
      if (!window.confirm("Clear diagnostics?")) return;
      ctx.diagnostics?.clear?.();
      refresh();
    }
  });

  refresh();
  // Refresh on doc change as a cheap proxy; diagnostics are global.
  ctx.onDocChange(() => refresh());
}

function renderEvent(ev) {
  const lvl = escapeHtml(ev?.level || "info");
  const type = escapeHtml(ev?.type || "event");
  const msg = escapeHtml(ev?.message || "");
  const ts = escapeHtml(formatTs(ev?.ts));
  const ctx = ev?.context ? escapeHtml(JSON.stringify(ev.context)) : "";
  const data = ev?.data ? escapeHtml(JSON.stringify(ev.data)) : "";
  return `
    <div class="c-diagEvt" data-level="${lvl}">
      <div class="c-diagEvtTop">
        <div class="c-diagEvtTitle">${type}</div>
        <div class="c-diagEvtMeta">${ts} • ${lvl}</div>
      </div>
      <div class="c-diagEvtMsg">${msg}</div>
      ${data ? `<details class="c-diagEvtDetails"><summary>data</summary><pre>${data}</pre></details>` : ""}
      ${ctx ? `<details class="c-diagEvtDetails"><summary>context</summary><pre>${ctx}</pre></details>` : ""}
    </div>
  `;
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function formatTs(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function cssEscape(s) { return String(s).replace(/"/g, "\\\""); }
