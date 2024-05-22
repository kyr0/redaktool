import { parseHTML } from "linkedom";

// uses the linkedom library to parse the HTML string into a DOM document (spec conform DOM API's Document interface)
export const htmlToDomDocument = (html: string): Document =>
  parseHTML(
    html.indexOf("<body") === -1
      ? `<html><head></head><body>${html}</body></html>`
      : html,
  ).document;
