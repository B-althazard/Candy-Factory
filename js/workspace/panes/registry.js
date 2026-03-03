import { renderEditorPane, bindEditorPane } from "./pane_editor.js";
import { renderOutputPane, bindOutputPane } from "./pane_output.js";
import { renderPresetsPane, bindPresetsPane } from "./pane_presets.js";

export const PaneTypes = { editor: "editor", output: "output", presets: "presets" };

export function getDefaultDesktopLayout() {
  return { panes: [
    { id: "p_editor", type: PaneTypes.editor, region: "left", title: "Editor", visible: true },
    { id: "p_output", type: PaneTypes.output, region: "right", title: "Output", visible: true }
  ]};
}

export function getDefaultMobileWorkstationLayout() {
  return { panes: [
    { id: "p_output_float", type: PaneTypes.output, region: "float_output", title: "Output", visible: false },
    { id: "p_presets_float", type: PaneTypes.presets, region: "float_presets", title: "Presets", visible: false }
  ]};
}

export function renderPane(pane, ctx) {
  if (pane.type === PaneTypes.editor) return renderEditorPane(pane, ctx);
  if (pane.type === PaneTypes.output) return renderOutputPane(pane, ctx);
  if (pane.type === PaneTypes.presets) return renderPresetsPane(pane, ctx);
  return `<div class="c-card">Unknown pane</div>`;
}

export function bindPane(pane, ctx) {
  if (pane.type === PaneTypes.editor) return bindEditorPane(pane, ctx);
  if (pane.type === PaneTypes.output) return bindOutputPane(pane, ctx);
  if (pane.type === PaneTypes.presets) return bindPresetsPane(pane, ctx);
}
