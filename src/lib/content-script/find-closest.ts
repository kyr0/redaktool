export function getClosestWrappingElement(selection: Selection): Element {
  const range = selection.getRangeAt(0);
  const commonAncestor = range.commonAncestorContainer;

  // If the commonAncestor is an element, return it directly
  if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
    return commonAncestor as Element;
  }

  // Otherwise, return the parent element of the text node
  return commonAncestor.parentNode as Element;
}

export function getAnchorNode(selection: Selection) {
  const anchorNode = selection.anchorNode;

  // If the anchorNode is a text node, get its parent element
  if (anchorNode && anchorNode.nodeType === Node.TEXT_NODE) {
    return anchorNode.parentNode as Node;
  }
  return anchorNode as Node;
}
