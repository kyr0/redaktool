import { parseHTML } from "linkedom";

// uses the linkedom library to parse the HTML string into a DOM document (spec conform DOM API's Document interface)
export const htmlToDomDocument = (html: string): Document =>
  parseHTML(
    html.indexOf("<body") === -1
      ? `<html><head></head><body>${html}</body></html>`
      : html,
  ).document;

// Define a whitelist of HTML standard elements
const whitelist = [
  "div",
  "span",
  "p",
  "a",
  "b",
  "u",
  "i",
  "em",
  "strong",
  "code",
  "ins",
  "del",
  "img",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "form",
  "input",
  "textarea",
  "button",
  "select",
  "option",
  "label",
  "article",
  "section",
  "header",
  "footer",
  "nav",
  "aside",
];

// Define a whitelist of attributes to keep
const attributeWhitelist = ["title", "href", "alt"];

/**
 * Remove all attributes except those in the whitelist
 * @param {Element} element - The element to clean
 */
const cleanAttributes = (element: Element) => {
  Array.from(element.attributes).forEach((attr) => {
    if (!attributeWhitelist.includes(attr.name)) {
      element.removeAttribute(attr.name);
    }
  });
};

/**
 * Recursively filter elements based on the whitelist and clean attributes
 * @param {Node} node - The node to filter
 */
const filterElements = (node: Node) => {
  const children = Array.from(node.childNodes);

  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      if (!whitelist.includes(child.nodeName.toLowerCase())) {
        //node.removeChild(child);
      } else {
        if (child instanceof Element) {
          cleanAttributes(child); // Clean attributes of the element
        }
        filterElements(child); // Recursively filter the child nodes
        // Remove empty nodes
        if (child.childNodes.length === 0 && !child.textContent?.trim()) {
          node.removeChild(child);
        }
      }
    } else if (child.nodeType === Node.TEXT_NODE) {
      // Remove empty text nodes
      if (!child.textContent?.trim()) {
        node.removeChild(child);
      }
    }
  }
};

/**
 * Clone a node deeply and filter non-whitelisted elements
 * @param {Node} node - The node to clone and filter
 * @returns {Node} - The cloned and filtered node
 */
export const cloneAndFilterNode = (node: Node) => {
  // Deep clone the node
  const clonedNode = node.cloneNode(true);

  // Filter the cloned node
  filterElements(clonedNode);
  console.log(clonedNode, "clonedNode", clonedNode.innerHTML);

  return clonedNode;
};
