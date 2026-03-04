import { renderEditorPane, bindEditorPane } from "./pane_editor.js";
import { renderOutputPane, bindOutputPane } from "./pane_output.js";
import { renderPresetsPane, bindPresetsPane } from "./pane_presets.js";
import { renderPreviewPane, bindPreviewPane } from "./pane_preview.js";
import { renderDiagnosticsPane, bindDiagnosticsPane } from "./pane_diagnostics.js";

export const PaneTypes = { editor: "editor", output: "output", presets: "presets", preview: "preview", diagnostics: "diagnostics" };

export function getDefaultDesktopLayout() {
  return { panes: [
    { id: "p_editor", type: PaneTypes.editor, region: "left", title: "Editor", visible: true },
    { id: "p_output", type: PaneTypes.output, region: "right", title: "Output", visible: true },
    { id: "p_preview", type: PaneTypes.preview, region: "right", title: "Preview", visible: true },
    { id: "p_diagnostics", type: PaneTypes.diagnostics, region: "right", title: "Diagnostics", visible: true }
  ]};
}

export function getDefaultMobileWorkstationLayout() {
  return { panes: [
    { id: "p_output_float", type: PaneTypes.output, region: "float_output", title: "Output", visible: false },
    { id: "p_presets_float", type: PaneTypes.presets, region: "float_presets", title: "Presets", visible: false },
    { id: "p_preview_float", type: PaneTypes.preview, region: "float_preview", title: "Preview", visible: false },
    { id: "p_diagnostics_float", type: PaneTypes.diagnostics, region: "float_diagnostics", title: "Diagnostics", visible: false }
  ]};
}

export function renderPane(pane, ctx) {
  if (pane.type === PaneTypes.editor) return renderEditorPane(pane, ctx);
  if (pane.type === PaneTypes.output) return renderOutputPane(pane, ctx);
  if (pane.type === PaneTypes.presets) return renderPresetsPane(pane, ctx);
  if (pane.type === PaneTypes.preview) return renderPreviewPane(pane, ctx);
  if (pane.type === PaneTypes.diagnostics) return renderDiagnosticsPane(pane, ctx);
  return `<div class="c-card">Unknown pane</div>`;
}

export function bindPane(pane, ctx) {
  if (pane.type === PaneTypes.editor) return bindEditorPane(pane, ctx);
  if (pane.type === PaneTypes.output) return bindOutputPane(pane, ctx);
  if (pane.type === PaneTypes.presets) return bindPresetsPane(pane, ctx);
  if (pane.type === PaneTypes.preview) return bindPreviewPane(pane, ctx);
  if (pane.type === PaneTypes.diagnostics) return bindDiagnosticsPane(pane, ctx);
}
