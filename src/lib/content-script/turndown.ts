// @ts-ignore
import TurndownService from "turndown/lib/turndown.browser.umd";

// @ts-ignore
import { CliPrettify } from "markdown-table-prettify";
import tables from "./gfm/tables";

export const getTurndownService = () => {
  const turndownService = new TurndownService({
    linkStyle: "inlined",
    codeBlockStyle: "fenced",
    strongDelimiter: "**",
  });

  turndownService.addRule("remove-irrelevant", {
    filter: [
      "style",
      "script",
      "img",
      "picture",
      "audio",
      "video",
      "object",
      // @ts-ignore
      "svg",
      "code",
      "form",
      "input",
      "textarea",
      "button",
      "nav",
      "footer",
      "iframe",
      "ins",
      // @ts-ignore
      "ads",
      "noscript",
    ],
    replacement: () => {
      return "";
    },
  });
  tables(turndownService);

  turndownService.addRule("h1", {
    filter: ["h1"],
    replacement: (content: string) => `\n# ${content}\n`,
  });

  turndownService.addRule("h2", {
    filter: ["h2"],
    replacement: (content: string) => `\n## ${content}\n`,
  });

  turndownService.addRule("h3", {
    filter: ["h3"],
    replacement: (content: string) => `\n### ${content}\n`,
  });

  turndownService.addRule("h4", {
    filter: ["h4"],
    replacement: (content: string) => `\n#### ${content}\n`,
  });

  turndownService.addRule("h5", {
    filter: ["h5"],
    replacement: (content: string) => `\n##### ${content}\n`,
  });

  turndownService.addRule("h6", {
    filter: ["h6"],
    replacement: (content: string) => `\n##### ${content}\n`,
  });

  turndownService.addRule("scripting", {
    filter: ["script", "code", "style"],
    replacement: (content: string) => "",
  });

  return turndownService;
};

export const removeExcessiveNewlines = (text: string): string => {
  /*
  // regular expression to match three or more consecutive newlines
  const regex = /\n{3,}/g;
  // replace them with a single newline
  return text.replace(regex, "\n");
*/
  return text;
};

export const prettyPrintMarkdown = (originalString: string) => {
  const optimizedString = originalString
    .replaceAll("\\\\n", "\n")
    .replaceAll("\\n", "\n")
    .replaceAll("\\t", "\t")
    .replaceAll("\\r", "\r")
    .replaceAll("\\'", "'")
    .replaceAll('\\"', '"')
    .replaceAll("\n\n\\]", "]")
    .replaceAll("\n\\]", "]");
  //.replaceAll("\\[\n", "[")
  //.replaceAll("]\n", "]");

  // Ensure that the closing bracket ']' is always at the end of the previous line.
  /*
  optimizedString = optimizedString
    .replaceAll("\\[\n", "[")
    .replaceAll("]\n", "]");

  // Ensure that there are no stray brackets on a new line
  optimizedString = optimizedString
    .replaceAll("\n\\]", "]")
    .replaceAll("\\[\n", "[");
*/
  return removeExcessiveNewlines(optimizedString);
};

export const turndown = (html: string): string =>
  prettyPrintMarkdown(getTurndownService().turndown(html));
