export function renderShell(root, { deviceClass }) {
  root.innerHTML = `
    <div class="c-shell" data-device="${deviceClass}">
      <header class="c-topbar">
        <div class="c-brand">
          <div class="c-brandTitle">Candy Factory</div>
          <div class="c-brandSub">Workstation • Multi-character</div>
        </div>
        <div class="c-topbarRight">
          <select class="c-select" id="docSelect" aria-label="Active character"></select>
          <button class="c-btn c-btnGhost" id="newDocBtn" type="button">New</button>
          <button class="c-btn c-btnGhost" id="renameDocBtn" type="button">Rename</button>
          <div class="c-divider"></div>
          <button class="c-btn c-btnGhost" id="exportProjectBtn" type="button">Export .cfproject</button>
          <label class="c-btn c-btnGhost" for="importProjectInput">Import</label>
          <input id="importProjectInput" type="file" accept=".json,.cfproject,application/json" style="display:none" />
          <div class="c-divider"></div>
          <select class="c-select" id="layoutSelect" aria-label="Layout"></select>
          <button class="c-btn c-btnGhost" id="saveLayoutBtn" type="button">Save Layout</button>
          <div class="c-divider"></div>
          <select class="c-select" id="themeSelect" aria-label="Theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="native">Native</option>
          </select>
        </div>
      </header>

      <main class="c-main" id="mainArea"></main>

      <button class="c-fab" id="fab" type="button" aria-label="Workstation actions">≡</button>

      <div class="c-floatPanel" id="floatOutput" aria-hidden="true"></div>
      <div class="c-floatPanel" id="floatPresets" aria-hidden="true"></div>

      <footer class="c-footer">
        <div class="c-muted" id="footerLeft"></div>
        <div class="c-muted" id="footerRight"></div>
      </footer>
    </div>
  `;
}
