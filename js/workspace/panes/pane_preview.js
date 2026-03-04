import { flattenSchemaFields } from "../../validate.js";

export function renderPreviewPane(pane, ctx) {
  return `
    <div class="c-pane" data-pane-id="${escapeHtml(pane.id)}">
      <div class="c-paneHeader">
        <div class="c-paneTitle">${escapeHtml(pane.title || "Preview")}</div>
        <div class="c-paneActions">
          <span class="c-muted" id="${escapeHtml(pane.id)}__meta"></span>
        </div>
      </div>
      <div class="c-paneBody">
        <div class="c-previewCard" id="${escapeHtml(pane.id)}__card"></div>
      </div>
    </div>
  `;
}

export function bindPreviewPane(pane, ctx) {
  const host = ctx.root.querySelector(`[data-pane-id="${cssEscape(pane.id)}"]`);
  if (!host) return;
  const card = host.querySelector(`#${cssEscape(pane.id)}__card`);
  const meta = host.querySelector(`#${cssEscape(pane.id)}__meta`);

  function refresh() {
    const doc = ctx.getActiveDoc();
    if (!doc) return;
    meta.textContent = doc.updated_at ? `Updated ${formatTs(doc.updated_at)}` : "";
    card.innerHTML = renderSummaryCard(doc.state, ctx.schema);
  }

  refresh();
  ctx.onDocChange(() => refresh());
}

function renderSummaryCard(state, schema) {
  const bySection = new Map();
  const sections = Array.isArray(schema?.sections) ? schema.sections : [];

  // Build a quick index from path → field label + section
  const fieldIndex = new Map();
  for (const section of sections) {
    const secTitle = String(section?.title || section?.id || "Section");
    for (const f of (section?.fields ?? [])) {
      if (!f?.path) continue;
      fieldIndex.set(String(f.path), { label: String(f.label || f.path), section: secTitle });
    }
    for (const sub of (section?.subsections ?? [])) {
      const subTitle = String(sub?.title || sub?.id || secTitle);
      for (const f of (sub?.fields ?? [])) {
        if (!f?.path) continue;
        fieldIndex.set(String(f.path), { label: String(f.label || f.path), section: `${secTitle} · ${subTitle}` });
      }
    }
  }

  // Prefer schema flatten order
  for (const f of flattenSchemaFields(schema)) {
    if (!f?.path) continue;
    const path = String(f.path);
    const v = getByPath(state, path);
    if (!v) continue;

    const info = fieldIndex.get(path) || { label: String(f.label || path), section: "Other" };
    if (!bySection.has(info.section)) bySection.set(info.section, []);
    bySection.get(info.section).push({ label: info.label, value: normalizeMulti(v) });
  }

  const blocks = [];
  blocks.push(`<div class="c-previewHeader">
    <div class="c-previewTitle">${escapeHtml(String(getByPath(state, "character.name") || "Character"))}</div>
    <div class="c-previewSub">${escapeHtml(String(getByPath(state, "subject.gender") || ""))}</div>
  </div>`);

  for (const [sec, items] of bySection.entries()) {
    if (!items.length) continue;
    blocks.push(`<div class="c-previewSection">
      <div class="c-previewSectionTitle">${escapeHtml(sec)}</div>
      <div class="c-previewList" role="list">
        ${items.map(it => `
          <div class="c-previewRow" role="listitem">
            <div class="c-previewKey">${escapeHtml(it.label)}</div>
            <div class="c-previewVal">${escapeHtml(it.value)}</div>
          </div>
        `).join("")}
      </div>
    </div>`);
  }

  if (blocks.length === 1) {
    blocks.push(`<div class="c-muted">No fields filled yet.</div>`);
  }

  return blocks.join("");
}

function normalizeMulti(v) {
  return String(v).split("|").map(s => s.trim()).filter(Boolean).join(", ");
}

function getByPath(obj, path) {
  const v = String(path).split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
  return v === undefined || v === null ? "" : String(v).trim();
}

function formatTs(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
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
