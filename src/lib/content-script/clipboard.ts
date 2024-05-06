export function copyToClipboard(text: string) {
  // Create a temporary text area to copy the text
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);

  // Select and copy the text to the clipboard
  textarea.select();
  document.execCommand("copy");

  // Remove the temporary text area
  document.body.removeChild(textarea);
}

export function deselect() {
  // Get the current selection from the document
  const selection = window.getSelection()!;

  // Remove any existing selections
  selection.removeAllRanges();

  return selection;
}

export interface SelectionDetails {
  range: Range;
  hasFocus: boolean;
}

export function selectEditorContent(editorName: string) {
  // Cache the previous selection
  const prevSelection = window.getSelection()!;
  if (!prevSelection.rangeCount) return null; // Early return if there's no selection to cache

  // Create a placeholder for the previous selection details
  const prevSelectionDetails = {
    range: prevSelection.getRangeAt(0).cloneRange(), // Clone the range to not modify the original selection
    hasFocus: document.hasFocus(), // Check if the document has focus
  };

  // First, find the contenteditable element
  const editableElement = document.querySelector(
    `[data-editor-name='${editorName}'] [contenteditable=true]`,
  )! as HTMLElement;

  console.log("selectEditorContent", editableElement);
  if (!editableElement) return;

  // Focus the element to ensure that the selection is visible to the user
  editableElement.focus();
  console.log("focus", editableElement);

  // Create a new range
  const range = document.createRange();
  range.selectNodeContents(editableElement);
  console.log("range", range);

  // Get the current selection from the document
  const selection = deselect();

  // Add the new range, which selects all content within the contenteditable element
  selection.addRange(range);

  console.log("done selecting editor content", selection, range);

  return prevSelectionDetails;
}

export function restorePreviousSelection(
  prevSelectionDetails?: SelectionDetails | null,
) {
  if (!prevSelectionDetails) return; // Early return if there's no previous selection to restore

  const currentSelection = window.getSelection()!;
  currentSelection.removeAllRanges(); // Clear the current selection
  currentSelection.addRange(prevSelectionDetails.range); // Restore the previous selection

  // Focus the editable element that likely contains the range
  // This assumes the range's startContainer is within an editable element, which is a safe assumption for this use case
  let focusTarget = prevSelectionDetails.range.startContainer as HTMLElement;

  // If the startContainer is not focusable (e.g., a text node), find the nearest ancestor that is an editable element
  while (focusTarget && !focusTarget.isContentEditable) {
    focusTarget = focusTarget.parentNode as HTMLElement;
  }

  if (focusTarget?.focus) {
    focusTarget.focus();
  }
}
