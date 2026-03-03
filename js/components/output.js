export function renderOutput(textareaEl, text) {
  textareaEl.value = text ?? "";
}

export async function copyToClipboard(text) {
  if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
  await navigator.clipboard.writeText(text);
}
