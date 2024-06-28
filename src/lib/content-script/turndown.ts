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
        `[${markdownTrim(p1.replace(/\s*\n\s*/g, " "))}](${markdownTrim(p2)})`,
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
    return trimmed
      ? `${markdownTrim(p1)}${trimmed}\n\n`
      : `${markdownTrim(p1)}${trimmed}`;
  });

// trims leading and trailing whitespace, newline, and other non-printable characters without affecting UTF-8 symbols.
export const markdownTrim = (markdown: string): string =>
  markdown.replace(/^[\s\p{C}]+|[\s\p{C}]+$/gu, "");

export const postProcessMarkdown = (markdown: string): string =>
  removeNonStandardProtocolHrefs(
    fixHeadingsWithoutNewlines(
      trimLeadingElementWhitespace(
        fixMissingLinkWhenTitleIsSet(fixLinks(markdown)),
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
        return `${markdownTrim(p1)}${trimmed}\n\n`;
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
    return `${headingLevel} ${headingText}\n\n[${headingText}]${markdownTrim(
      p3,
    )}`;
  });

export const fixMissingLinkWhenTitleIsSet = (markdown: string): string =>
  markdown.replace(
    /\[\s*\]\((.+?)\s+"(.+?)"\)/g,
    (match, p1, p2) =>
      `[${markdownTrim(p2)}](${markdownTrim(p1)} "${markdownTrim(p2)}")`,
  );

export const trimLeadingElementWhitespace = (markdown: string): string =>
  markdown.replace(/^\s+([#\[])/gm, (match) => markdownTrim(match));

const escapeMarkdown = (text: string): string => {
  return text.replace(/([\\\`*{}[\]()#+\-.!_>])/g, "");
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
export function skipMarkdownSyntaxForKmpSearch(
  text: string,
  index: number,
): number {
  // Check for escaped characters and skip them
  if (text[index] === "\\") {
    return index + 2; // Skip the escape character and the escaped character
  }

  // Skip code blocks
  if (text[index] === "`") {
    if (text.substring(index, index + 3) === "```") {
      index += 3;
      while (
        index < text.length - 2 &&
        text.substring(index, index + 3) !== "```"
      ) {
        index += 1;
      }
      return index + 3;
    }
    index += 1;
    while (index < text.length && text[index] !== "`") {
      index += 1;
    }
    return index + 1;
  }

  // Skip links
  if (text[index] === "[") {
    while (index < text.length && text[index] !== "]") {
      index += 1;
    }
    if (index < text.length && text[index + 1] === "(") {
      index += 2;
      while (index < text.length && text[index] !== ")") {
        index += 1;
      }
      return index + 1;
    }
  }

  // Skip images
  if (text[index] === "!" && text[index + 1] === "[") {
    index += 2;
    while (index < text.length && text[index] !== "]") {
      index += 1;
    }
    if (index < text.length && text[index + 1] === "(") {
      index += 2;
      while (index < text.length && text[index] !== ")") {
        index += 1;
      }
      return index + 1;
    }
  }

  // Skip blockquotes
  if (text[index] === ">") {
    while (index < text.length && text[index] !== "\n") {
      index += 1;
    }
    return index + 1;
  }

  // Skip tables, lists, headers, emphasis, and other markdown symbols
  const markdownSymbols: Set<string> = new Set([
    "*",
    "_",
    "~",
    "`",
    "#",
    "-",
    "+",
    "|",
  ]);
  while (index < text.length && markdownSymbols.has(text[index])) {
    if (
      text[index] === "|" ||
      (["-", "+"].includes(text[index]) &&
        (index === 0 || ["\n", " "].includes(text[index - 1])))
    ) {
      while (index < text.length && text[index] !== "\n") {
        index += 1;
      }
      return index + 1;
    }
    index += 1;
  }
  return index;
}

// KMP search function for Markdown text
export function kmpSearchMarkdown(
  formattedText: string,
  searchText: string,
): [number, number] {
  // Compute longest suffix-prefix (LSP) array for the search text
  const lsp: Array<number> = Array(searchText.length).fill(0);
  let j = 0;
  for (let i = 1; i < searchText.length; i++) {
    while (j > 0 && searchText[i] !== searchText[j]) {
      j = lsp[j - 1];
    }
    if (searchText[i] === searchText[j]) {
      j += 1;
      lsp[i] = j;
    }
  }

  // Perform the KMP search in the formatted text
  let i = 0;
  let start_index = -1;

  // TODO: case where formatting is removed at start index like slicedContent "Update**: Falls ihr euch gefr",
  // would be smart to simply go -n characters back when they are markdown syntax

  while (i < formattedText.length) {
    i = skipMarkdownSyntaxForKmpSearch(formattedText, i);

    if (
      j < searchText.length &&
      i < formattedText.length &&
      formattedText[i] === searchText[j]
    ) {
      if (j === 0) {
        start_index = i;
      }
      j += 1;
      if (j === searchText.length) {
        return [start_index, i];
      }
    } else if (j > 0) {
      j = lsp[j - 1];
      continue;
    }
    i += 1;
  }

  return [-1, -1];
}

export function sliceOutMarkdownTextIntersection(md: string, text: string) {
  text = text.trim();
  if (text.length < 20) {
    return text; // too short to slice
  }

  const beginning = text.substring(0, 10).split("");
  const middle = text.substring(10, text.length - 10).split(" ");
  const end = text.substring(text.length - 10, text.length).split("");
  const pattern = `(${[...beginning, ...middle, ...end].join(".+?")})`;

  console.log("pattern", pattern);
  const regex = new RegExp(pattern, "i");
  const match = md.split(regex);
  if (match) {
    return match[1];
  }
}

export const turndown = (html: string): string => {
  //const preprocessed = htmlLinkToMarkdown(html);
  // remove buggy characters; TODO: fix with data format change
  return postProcessMarkdown(
    turndownService.turndown(html.replace(/[®©™]/g, "")),
  );
};
