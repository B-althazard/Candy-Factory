export function createCharacterState(initial = {}) {
  const base = {
    character: {
      name: ""
    },

    subject: {
      category: "",
      gender: "",
      age: "",
      ethnicity: "",
      demographics: ""
    },

    appearance: {
      hair: {
        color: "",
        length: "",
        texture: "",
        style: "",
        motion: ""
      },
      face: {
        shape: "",
        nose: ""
      },
      eyes: {
        color: "",
        shape: "",
        makeup: ""
      },
      lips: {
        fullness: "",
        color: "",
        state: ""
      },
      skin: {
        tone: "",
        texture: "",
        finish: "",
        freckles: "",
        water_droplets: ""
      },
      makeup_style: "",
      micro_details: ""
    },

    body: {
      build: "",
      silhouette: "",
      bust: "",
      waist_to_chest_ratio: "",
      shoulders: "",
      dominance: "",
      height_cm: "",
      distinguishing_marks: {
        type: "",
        location: ""
      },
      waist_emphasis_system: ""
    },

    // Existing v1 fields kept (pose/expression/background, style) for your current UI flow.
    pose: "",
    expression: "",
    background: "",
    style: ""
  };

  return deepMerge(base, initial);
}

export function toKeyValuePairs(state) {
  const lines = [];

  // Name + Gender (combined)
  if (state.character.name || state.subject.gender) {
    const parts = [];
    if (state.character.name) parts.push(state.character.name);
    if (state.subject.gender) parts.push(capitalize(state.subject.gender));
    lines.push(`Name ${parts.join(", ")}`);
  }

  // Hair color
  if (state.appearance.hair.color) {
    lines.push(`Hair color, ${state.appearance.hair.color}`);
  }

  // Skin tone
  if (state.appearance.skin.tone) {
    lines.push(`Skin tone, ${state.appearance.skin.tone}`);
  }

  // Height
  if (state.body.height_cm) {
    lines.push(`Height ${state.body.height_cm}cm`);
  }

  // Distinguishing marks
  const mark = state.body.distinguishing_marks;
  if (mark.type && mark.location) {
    lines.push(
      `Distinguishing Marks, ${mark.type} on the ${mark.location}`
    );
  }

  // Pose + Expression combined
  if (state.pose || state.expression) {
    const posePart = state.pose ? state.pose.toLowerCase() : "";
    const expPart = state.expression
      ? ` with a ${state.expression.toLowerCase()} expression`
      : "";
    lines.push(`Pose, ${posePart}${expPart}`);
  }

  // Background
  if (state.background) {
    lines.push(`Background ${state.background.toLowerCase()}`);
  }

  // Style
  if (state.style) {
    lines.push(`Style, ${state.style}`);
  }

  return lines.join("\n");
}

/* ---------- helpers ---------- */

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function deepMerge(target, source) {
  if (!isObj(target) || !isObj(source)) return source ?? target;
  const out = Array.isArray(target) ? [...target] : { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (isObj(v) && isObj(out[k])) out[k] = deepMerge(out[k], v);
    else out[k] = v;
  }
  return out;
}

function isObj(x) {
  return x && typeof x === "object" && !Array.isArray(x);
}