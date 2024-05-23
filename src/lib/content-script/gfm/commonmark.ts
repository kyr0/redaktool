export const hasSiblings = (node: Node) =>
  node.previousSibling || node.nextSibling;

export const isCodeBlock = (node: Node) =>
  node.parentNode?.nodeName === "PRE" && !hasSiblings;
