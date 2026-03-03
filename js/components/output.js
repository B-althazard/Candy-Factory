export function renderOutput(textareaEl, obj) {
  textareaEl.value = JSON.stringify(obj, null, 2);
}