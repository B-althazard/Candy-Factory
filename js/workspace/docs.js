import { createCharacterState } from "../state.js";

export function createDoc({ id, name, state, locks, meta }) {
  const docId = id || cryptoId();
  const s = createCharacterState(state ?? {});
  if (!s.subject.gender) s.subject.gender = "female";

  const docName = (String(name || s.character?.name || "Character").trim() || "Character").slice(0, 40);
  if (!s.character || typeof s.character !== "object") s.character = { name: "" };
  if (!String(s.character.name || "").trim()) s.character.name = docName;

  return {
    id: docId,
    name: docName,
    state: s,
    locks: new Set(Array.isArray(locks) ? locks.map(String) : []),
    meta: meta && typeof meta === "object" ? { ...meta } : {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function renameDoc(doc, name) {
  const nm = (String(name || "Character").trim() || "Character").slice(0, 40);
  doc.name = nm;
  if (doc?.state?.character && typeof doc.state.character === "object") {
    doc.state.character.name = nm;
  }
  doc.updated_at = new Date().toISOString();
}

export function serializeDoc(doc) {
  return {
    id: doc.id,
    name: doc.name,
    state: doc.state,
    locks: Array.from(doc.locks ?? []),
    meta: doc.meta && typeof doc.meta === "object" ? doc.meta : {},
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
}

function cryptoId() {
  try {
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return Array.from(a).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return String(Date.now()) + "_" + Math.random().toString(16).slice(2);
  }
}
