export function renderShell(root, { deviceClass }) {
  root.innerHTML = `
    <div class="c-shell" data-device="${deviceClass}">
      <header class="c-topbar">
        <div class="c-topbarRow">
          <div class="c-brandCompact" aria-label="Candy Factory">
            <div class="c-brandMark">CF</div>
            <div class="c-brandText">
              <div class="c-brandTitle">Candy Factory</div>
            </div>
          </div>

          <div class="c-topbarCore">
            <div class="c-docGroup">
              <select class="c-select" id="docSelect" aria-label="Active character"></select>
              <button class="c-btn c-btnGhost" id="newDocBtn" type="button">New</button>
              <button class="c-btn c-btnGhost" id="renameDocBtn" type="button">Rename</button>
            </div>
            <button class="c-btn c-btnGhost c-btnTools" id="toolsToggleBtn" type="button" aria-expanded="false" aria-controls="topbarTray">Tools</button>
          </div>
        </div>

        <div class="c-topbarTray" id="topbarTray" hidden>
          <div class="c-topbarTrayGroup">
            <div class="c-topbarTrayLabel">Project</div>
            <div class="c-inlineActions">
              <button class="c-btn c-btnGhost" id="exportProjectBtn" type="button">Export</button>
              <label class="c-btn c-btnGhost" for="importProjectInput">Import</label>
              <input id="importProjectInput" type="file" accept=".json,.cfproject,application/json" style="display:none" />
            </div>
          </div>

          <div class="c-topbarTrayGroup">
            <div class="c-topbarTrayLabel">Layout</div>
            <div class="c-inlineActions c-inlineActions--grow">
              <select class="c-select" id="layoutSelect" aria-label="Layout"></select>
              <button class="c-btn c-btnGhost" id="saveLayoutBtn" type="button">Save</button>
            </div>
          </div>

          <div class="c-topbarTrayGroup">
            <div class="c-topbarTrayLabel">Theme</div>
            <select class="c-select" id="themeSelect" aria-label="Theme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="native">Native</option>
            </select>
          </div>
        </div>
      </header>

      <main class="c-main" id="mainArea"></main>

      <div class="c-fabScrim" id="fabScrim" aria-hidden="true"></div>
      <div class="c-fabMenu" id="fabMenu" aria-hidden="true">
        <button class="c-fabItem" type="button" data-fab-panel="output" aria-label="Open Output">
          <span class="c-fabItemLabel">Output</span>
          <span class="c-fabItemIcon">⎘</span>
        </button>
        <button class="c-fabItem" type="button" data-fab-panel="presets" aria-label="Open Presets">
          <span class="c-fabItemLabel">Presets</span>
          <span class="c-fabItemIcon">★</span>
        </button>
        <button class="c-fabItem" type="button" data-fab-panel="preview" aria-label="Open Preview">
          <span class="c-fabItemLabel">Preview</span>
          <span class="c-fabItemIcon">◫</span>
        </button>
        <button class="c-fabItem" type="button" data-fab-panel="diagnostics" aria-label="Open Diagnostics">
          <span class="c-fabItemLabel">Diagnostics</span>
          <span class="c-fabItemIcon">⚙</span>
        </button>
      </div>

      <button class="c-fab" id="fab" type="button" aria-label="Workstation actions" aria-expanded="false">≡</button>

      <div class="c-floatPanel" id="floatOutput" aria-hidden="true"></div>
      <div class="c-floatPanel" id="floatPresets" aria-hidden="true"></div>
      <div class="c-floatPanel" id="floatPreview" aria-hidden="true"></div>
      <div class="c-floatPanel" id="floatDiagnostics" aria-hidden="true"></div>

      <footer class="c-footer">
        <div class="c-muted" id="footerLeft"></div>
        <div class="c-muted" id="footerRight"></div>
      </footer>
    </div>
  `;
}
