export function createCharacterState(initial = {}) {
  const base = {
    character: { name: "" },
    subject: { category: "", gender: "female", age: "", ethnicity: "", demographics: "" },
    appearance: {
      hair: { cut: "", color: "", length: "", texture: "", style: "", motion: "" },
      face: { features: "", shape: "", nose: "" },
      eyes: { features: "", color: "", shape: "", makeup: "" },
      lips: { form: "", fullness: "", color: "", state: "" },
      skin: { look: "", tone: "", texture: "", finish: "", freckles: "", water_droplets: "" },
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
      waist_emphasis_system: "",
      distinguishing_marks: { type: "", location: "" }
    },
    pose: "",
    expression: "",
    background: "",
    style: ""
  };
  return deepMerge(base, initial);
}

export function toPreferredOutput(state) {
  const lines = [];

  const name = state.character?.name?.trim();
  const gender = state.subject?.gender?.trim();

  if (name || gender) {
    const parts = [];
    if (name) parts.push(name);
    if (gender) parts.push(capitalize(gender));
    lines.push(`Name ${parts.join(", ")}`);
  }

  const hairColor = state.appearance?.hair?.color?.trim();
  if (hairColor) lines.push(`Hair color, ${hairColor}`);

  const skinTone = state.appearance?.skin?.tone?.trim();
  if (skinTone) lines.push(`Skin tone, ${skinTone}`);

  const height = (state.body?.height_cm ?? "").toString().trim();
  if (height) lines.push(`Height ${height}cm`);

  const markType = state.body?.distinguishing_marks?.type?.trim();
  const markLoc = state.body?.distinguishing_marks?.location?.trim();
  if (markType && markLoc) lines.push(`Distinguishing Marks, ${markType} on the ${markLoc}`);

  const pose = state.pose?.trim();
  const expr = state.expression?.trim();
  if (pose || expr) {
    const p = pose ? pose.toLowerCase() : "";
    const e = expr ? ` with a ${expr.toLowerCase()} expression` : "";
    lines.push(`Pose, ${p}${e}`);
  }

  const bg = state.background?.trim();
  if (bg) lines.push(`Background ${bg.toLowerCase()}`);

  const style = state.style?.trim();
  if (style) lines.push(`Style, ${style}`);

  return lines.join("\n");
}

function capitalize(str) {
  if (!str) return str;
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
