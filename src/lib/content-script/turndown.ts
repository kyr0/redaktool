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

export const fixLinks = (markdown: string): string =>
  markdown
    .replace(
      /\[\s*(.+?)\s*\]\((.+?)\)/gs,
      (match, p1, p2) =>
        `[${markdownTrim(p1.replace(/\s*\n\s*/g, " "))}](${p2})`,
    )
    .replace(/(\S)\[(.+?)\]\((.+?)\)(\S)/g, "$1 [$2]($3) $4") // Ensure space around links
    .replace(/(\S)\[(.+?)\]\((.+?)\)/g, "$1 [$2]($3)") // Space after the link
    .replace(/\[(.+?)\]\((.+?)\)(\S)/g, "[$1]($2) $3") // Space before the link
    .replace(
      /\[\s*\]\((.+?)\s+"(.+?)"\)/g, // Remove leading and trailing whitespace inside title, link text (pass 1)
      (match, p1, p2) =>
        `[${markdownTrim(p2)}](${markdownTrim(p1)} "${markdownTrim(p2)}")`,
    )
    .replace(
      /\[(.+?)\]\((.+?)\s+"(.+?)"\)/g, // Remove leading and trailing whitespace inside title, link text (pass 2)
      (match, p1, p2, p3) =>
        `[${markdownTrim(p1)}](${markdownTrim(p2)} "${markdownTrim(p3)}")`,
    );

export const fixHeadingsWithoutNewlines = (markdown: string): string =>
  markdown.replace(/(^|\n)([^\n]*?)(?=\n?#)/g, (match, p1, p2) => {
    // Trim the leading and trailing whitespace
    const trimmed = markdownTrim(p2);
    return trimmed ? `${p1}${trimmed}\n\n` : `${p1}${trimmed}`;
  });

// trims leading and trailing whitespace, newline, and other non-printable characters without affecting UTF-8 symbols.
export const markdownTrim = (markdown: string): string =>
  markdown.replace(/^[\s\p{C}]+|[\s\p{C}]+$/gu, "");

export const postProcessMarkdown = (markdown: string): string =>
  removeNonStandardProtocolHrefs(
    fixHeadingsWithoutNewlines(
      trimLeadingElementWhitespace(
        fixMissingLinkWhenTitleIsSet(fixHeadingLinks(fixLinks(markdown))),
      ),
    ),
  );

export const removeNonStandardProtocolHrefs = (markdown: string): string =>
  markdown.replace(
    /(^|\n)([^\n]*?)(?=\n?#)|\[[^\]]*\]\((?!(http:\/\/|https:\/\/))[^\)]*\)/g,
    (match, p1, p2) => {
      if (p2 !== undefined) {
        // This handles the heading formatting
        const trimmed = markdownTrim(p2);
        return `${p1}${trimmed}\n\n`;
      }
      // This handles the non-http/https link removal
      return "";
    },
  );

export const fixHeadingLinks = (markdown: string): string =>
  // Move any # starting directly after [ to the position before the last \n\n
  markdown.replace(/(\[#+\s*)(.+?)\s*\](\(.+?\))/g, (match, p1, p2, p3) => {
    const headingText = markdownTrim(p2);
    const headingLevel = markdownTrim(p1).replace("[", "");
    return `${headingLevel} ${headingText}\n\n[${headingText}]${p3}`;
  });

export const fixMissingLinkWhenTitleIsSet = (markdown: string): string =>
  markdown.replace(
    /\[\s*\]\((.+?)\s+"(.+?)"\)/g,
    (match, p1, p2) => `[${p2}](${p1} "${p2}")`,
  );

export const trimLeadingElementWhitespace = (markdown: string): string =>
  markdown.replace(/^\s+([#\[])/gm, (match) => markdownTrim(match));

const escapeMarkdown = (text: string): string => {
  return text.replace(/([\\`*{}[\]()#+\-.!_>])/g, "$1");
};

// function to transform html links to markdown links
export const htmlLinkToMarkdown = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const anchor = doc.querySelectorAll("a");

  if (!anchor) {
    return html;
  }

  for (let i = 0; i < anchor.length; i++) {
    const href = decodeURIComponent(anchor[i].getAttribute("href") || "");
    const title = anchor[i].getAttribute("title") || "";
    const text = anchor[i].textContent || "";

    const escapedTitle = escapeMarkdown(title);
    const escapedText = escapeMarkdown(text);

    html = html.replace(
      anchor[i].outerHTML,
      `[${markdownTrim(escapedText)}](${markdownTrim(href)} "${markdownTrim(
        escapedTitle,
      )}")`,
    );
  }
  return html;
};

export const turndown = (html: string): string => {
  //const preprocessed = htmlLinkToMarkdown(html);
  // remove buggy characters; TODO: fix with data format change
  return postProcessMarkdown(
    turndownService.turndown(html.replace(/[®©™]/g, "")),
  );
};
