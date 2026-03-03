import { createCharacterState } from "../state.js";

export function createDoc({ id, name, state, locks }) {
  const docId = id || cryptoId();
  const s = createCharacterState(state ?? {});
  if (!s.subject.gender) s.subject.gender = "female";
  return {
    id: docId,
    name: String(name || s.character?.name || "Character").trim() || "Character",
    state: s,
    locks: new Set(Array.isArray(locks) ? locks.map(String) : []),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function renameDoc(doc, name) {
  doc.name = String(name || "Character").trim().slice(0, 40) || "Character";
  doc.updated_at = new Date().toISOString();
}

export function serializeDoc(doc) {
  return { id: doc.id, name: doc.name, state: doc.state, locks: Array.from(doc.locks ?? []), created_at: doc.created_at, updated_at: doc.updated_at };
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
