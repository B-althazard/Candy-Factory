export function renderApp(rootEl) {
  rootEl.innerHTML = `
    <div class="c-card">
      <div class="c-sectionTitle">Basic Info</div>
      <input id="name" class="c-input" placeholder="Character Name" autocomplete="off" />
    </div>

    <div class="c-card">
      <div class="c-sectionTitle">Pose</div>
      <div class="l-grid-2" data-group="pose">
        <button class="c-chip" data-value="Standing">Standing</button>
        <button class="c-chip" data-value="Sitting">Sitting</button>
        <button class="c-chip" data-value="Action">Action</button>
        <button class="c-chip" data-value="Floating">Floating</button>
      </div>
    </div>

    <div class="c-card">
      <div class="c-sectionTitle">Expression</div>
      <div class="l-grid-2" data-group="expression">
        <button class="c-chip" data-value="Happy">Happy</button>
        <button class="c-chip" data-value="Serious">Serious</button>
        <button class="c-chip" data-value="Angry">Angry</button>
        <button class="c-chip" data-value="Surprised">Surprised</button>
      </div>
    </div>

    <div class="c-card">
      <div class="c-sectionTitle">Background</div>
      <div class="l-grid-2" data-group="background">
        <button class="c-chip" data-value="Studio">Studio</button>
        <button class="c-chip" data-value="Forest">Forest</button>
        <button class="c-chip" data-value="City">City</button>
        <button class="c-chip" data-value="Fantasy">Fantasy</button>
      </div>
    </div>

    <div class="c-card">
      <div class="c-sectionTitle">Character Attributes</div>
      <input id="age" class="c-input" placeholder="Age" inputmode="numeric" />
      <div style="height:12px"></div>
      <input id="style" class="c-input" placeholder="Art Style (e.g. anime, realistic)" autocomplete="off" />
      <div class="c-muted">Version 1 outputs key-value pairs. Version 2 can map these to an AI prompt.</div>
    </div>

    <button class="c-btn c-btnPrimary" id="genBtn">Generate Key-Value Data</button>

    <div class="c-card">
      <div class="c-sectionTitle">Output (Version 1)</div>
      <textarea id="output" class="c-textarea" readonly></textarea>
    </div>
  `;
}