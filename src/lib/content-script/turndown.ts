// @ts-ignore
import TurndownService from "turndown/lib/turndown.browser.umd";

import {
  gfm,
  strikethrough,
  tables,
  taskListItems,
  // @ts-ignore
} from "turndown-plugin-gfm/lib/turndown-plugin-gfm.browser.es";

const turndownService = new TurndownService();
turndownService.use([gfm, tables, strikethrough, taskListItems, tables]);

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

export const turndown = (html: string): string =>
  // remove buggy characters; TODO: fix with data format change
  turndownService.turndown(html.replace(/[®©™]/g, ""));
