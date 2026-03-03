export function renderApp(rootEl) {
  rootEl.innerHTML = `
    <div class="c-card">
      <div class="c-sectionTitle">Character</div>
      <input class="c-input" data-path="character.name" placeholder="Name" autocomplete="off" />
    </div>

    <div class="c-card">
      <div class="c-sectionTitle">Subject</div>
      <div class="u-col u-gap-14">
        <input class="c-input" data-path="subject.category" placeholder="Category" autocomplete="off" />
        <input class="c-input" data-path="subject.gender" placeholder="Gender" autocomplete="off" />
        <input class="c-input" data-path="subject.age" placeholder="Age" autocomplete="off" />
        <input class="c-input" data-path="subject.ethnicity" placeholder="Ethnicity" autocomplete="off" />
        <input class="c-input" data-path="subject.demographics" placeholder="Demographics" autocomplete="off" />
      </div>
    </div>

    <div class="c-card">
      <div class="c-sectionTitle">Appearance</div>

      <div class="c-sectionTitle" style="font-size:14px;margin-top:0;opacity:.85;">Hair</div>
      <div class="u-col u-gap-14">
        <input class="c-input" data-path="appearance.hair.color" placeholder="Hair color" autocomplete="off" />
        <input class="c-input" data-path="appearance.hair.length" placeholder="Hair length" autocomplete="off" />
        <input class="c-input" data-path="appearance.hair.texture" placeholder="Hair texture" autocomplete="off" />
        <input class="c-input" data-path="appearance.hair.style" placeholder="Hair style" autocomplete="off" />
        <input class="c-input" data-path="appearance.hair.motion" placeholder="Hair motion" autocomplete="off" />
      </div>

      <div class="c-sectionTitle" style="font-size:14px;margin-top:14px;opacity:.85;">Face</div>
      <div class="u-col u-gap-14">
        <input class="c-input" data-path="appearance.face.shape" placeholder="Face shape" autocomplete="off" />
        <input class="c-input" data-path="appearance.face.nose" placeholder="Nose" autocomplete="off" />
      </div>

      <div class="c-sectionTitle" style="font-size:14px;margin-top:14px;opacity:.85;">Eyes</div>
      <div class="u-col u-gap-14">
        <input class="c-input" data-path="appearance.eyes.color" placeholder="Eye color" autocomplete="off" />
        <input class="c-input" data-path="appearance.eyes.shape" placeholder="Eye shape" autocomplete="off" />
        <input class="c-input" data-path="appearance.eyes.makeup" placeholder="Eye makeup" autocomplete="off" />
      </div>

      <div class="c-sectionTitle" style="font-size:14px;margin-top:14px;opacity:.85;">Lips</div>
      <div class="u-col u-gap-14">
        <input class="c-input" data-path="appearance.lips.fullness" placeholder="Lip fullness" autocomplete="off" />
        <input class="c-input" data-path="appearance.lips.color" placeholder="Lip color" autocomplete="off" />
        <input class="c-input" data-path="appearance.lips.state" placeholder="Lips state" autocomplete="off" />
      </div>

      <div class="c-sectionTitle" style="font-size:14px;margin-top:14px;opacity:.85;">Skin</div>
      <div class="u-col u-gap-14">
        <input class="c-input" data-path="appearance.skin.tone" placeholder="Skin tone" autocomplete="off" />
        <input class="c-input" data-path="appearance.skin.texture" placeholder="Skin texture" autocomplete="off" />
        <input class="c-input" data-path="appearance.skin.finish" placeholder="Skin finish" autocomplete="off" />
        <input class="c-input" data-path="appearance.skin.freckles" placeholder="Freckles" autocomplete="off" />
        <input class="c-input" data-path="appearance.skin.water_droplets" placeholder="Water droplets" autocomplete="off" />
      </div>

      <div class="u-col u-gap-14" style="margin-top:14px;">
        <input class="c-input" data-path="appearance.makeup_style" placeholder="Makeup style" autocomplete="off" />
        <input class="c-input" data-path="appearance.micro_details" placeholder="Micro details" autocomplete="off" />
      </div>
    </div>

    <div class="c-card">
      <div class="c-sectionTitle">Body</div>
      <div class="u-col u-gap-14">
        <input class="c-input" data-path="body.build" placeholder="Build" autocomplete="off" />
        <input class="c-input" data-path="body.silhouette" placeholder="Silhouette" autocomplete="off" />
        <input class="c-input" data-path="body.bust" placeholder="Bust" autocomplete="off" />
        <input class="c-input" data-path="body.waist_to_chest_ratio" placeholder="Waist-to-chest ratio" autocomplete="off" />
        <input class="c-input" data-path="body.shoulders" placeholder="Shoulders" autocomplete="off" />
        <input class="c-input" data-path="body.dominance" placeholder="Dominance" autocomplete="off" />
        <input class="c-input" data-path="body.height_cm" placeholder="Height (cm)" inputmode="numeric" autocomplete="off" />
        <input class="c-input" data-path="body.waist_emphasis_system" placeholder="Waist emphasis system" autocomplete="off" />
      </div>

      <div class="c-sectionTitle" style="font-size:14px;margin-top:14px;opacity:.85;">Distinguishing marks</div>
      <div class="u-col u-gap-14">
        <input class="c-input" data-path="body.distinguishing_marks.type" placeholder="Type" autocomplete="off" />
        <input class="c-input" data-path="body.distinguishing_marks.location" placeholder="Location" autocomplete="off" />
      </div>
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
      <div class="c-sectionTitle">Art Style</div>
      <input class="c-input" data-path="style" placeholder="Style (e.g., anime, realistic)" autocomplete="off" />
      <div class="c-muted">Version 1 outputs key-value pairs. Version 2 can map these to an AI prompt.</div>
    </div>

    <button class="c-btn c-btnPrimary" id="genBtn">Generate Key-Value Data</button>

    <div class="c-card">
      <div class="c-sectionTitle">Output (Version 1)</div>
      <textarea id="output" class="c-textarea" readonly></textarea>
    </div>
  `;
}