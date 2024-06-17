import { parseHTML } from "linkedom";
import * as sanitizeHtml from "sanitize-html";

// uses the linkedom library to parse the HTML string into a DOM document (spec conform DOM API's Document interface)
export const htmlToDomDocument = (html: string): Document =>
  parseHTML(
    html.indexOf("<body") === -1
      ? `<html><head></head><body>${html}</body></html>`
      : html,
  ).document;

// Define a whitelist of HTML standard elements
const whitelist = [
  "p",
  "br",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "ul",
  "ol",
  "li",
  "pre",
  "code",
  "hr",
  "a",
  "em",
  "i",
  "strong",
  "b",
  //"img",
  "del",
  "s",
  "strike",
  "input",
  "th",
  "td",
  "tr",
  "table",
  "thead",
  "tbody",
  "tfoot",
];

/**
 * Clone a node deeply and filter non-whitelisted elements
 * @param {Node} node - The node to clone and filter
 * @returns {Node} - The cloned and filtered node
 */
export const cloneAndFilterNode = (node: Element) => {
  if (node.querySelector("body")) {
    node = node.querySelector("body")!;
  }

  const html =
    // @ts-ignore
    sanitizeHtml.default(node.outerHTML, {
      allowedTags: whitelist,
      allowedAttributes: {
        a: ["href", "title"],
        img: ["src", "alt", "title"],
        input: ["type", "checked"],
        th: ["align"],
        td: ["align"],
        table: ["align"],
      },
    });
  return html;
};

export const scrollDownMax = (el: HTMLElement | null) => {
  if (el) {
    requestAnimationFrame(() => {
      el.scrollTop = Number.MAX_SAFE_INTEGER;
    });
  }
};
