export function createCharacterState(initial = {}) {
  return {
    name: "",
    age: "",
    style: "",
    pose: "",
    expression: "",
    background: "",
    ...initial
  };
}

export function toKeyValuePairs(state) {
  // Keep output stable and explicit; omit empty keys if desired later.
  return {
    name: state.name,
    age: state.age,
    style: state.style,
    pose: state.pose,
    expression: state.expression,
    background: state.background
  };
}