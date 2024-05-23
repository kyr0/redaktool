import { isCodeBlock } from "./commonmark";

// @ts-ignore
import { CliPrettify } from "markdown-table-prettify";

type AlignMap = { [key: string]: string };

const alignMap: AlignMap = { left: ":---", right: "---:", center: ":---:" };
type Alignment = "left" | "center" | "right";

const tableShouldBeSkippedCache_ = new WeakMap<Node, boolean>();

function getAlignment(node: HTMLElement | null): string {
  return node
    ? (node.getAttribute("align") || node.style.textAlign || "").toLowerCase()
    : "";
}

function getBorder(alignment: string): string {
  return alignment ? alignMap[alignment] : "---";
}

function getColumnAlignment(
  table: HTMLTableElement,
  columnIndex: number,
): string {
  const votes = { left: 0, right: 0, center: 0, "": 0 };
  let align: Alignment = "left";

  for (let i = 0; i < table.rows.length; ++i) {
    const row = table.rows[i];
    if (columnIndex < row.childNodes.length) {
      const cellAlignment = getAlignment(
        row.childNodes[columnIndex] as HTMLElement,
      ) as Alignment;
      ++votes[cellAlignment];

      if (votes[cellAlignment] > votes[align]) {
        align = cellAlignment;
      }
    }
  }
  return align;
}

const rules: Record<string, any> = {};

rules.tableCell = {
  filter: ["th", "td"],
  replacement: (content: string, node: Node) => {
    if (tableShouldBeSkipped(nodeParentTable(node))) return content;
    return cell(content, node as Element);
  },
};

rules.tableRow = {
  filter: "tr",
  replacement: (content: string, node: Node) => {
    const parentTable = nodeParentTable(node);

    if (!parentTable) return content;

    if (tableShouldBeSkipped(parentTable)) return content;

    let borderCells = "";

    if (isHeadingRow(node as HTMLTableRowElement)) {
      const colCount = tableColCount(parentTable);
      for (let i = 0; i < colCount; i++) {
        const childNode =
          i < node.childNodes.length ? node.childNodes[i] : null;
        const border = getBorder(getColumnAlignment(parentTable, i));
        borderCells += cell(border, childNode as Element, i);
      }
    }
    return `\n${content}${borderCells ? `\n${borderCells}` : ""}`;
  },
};

rules.table = {
  filter: (node: Node, options: any) =>
    node.nodeName === "TABLE" && !tableShouldBeHtml(node, options),
  replacement: (content: string, node: HTMLTableElement) => {
    if (tableShouldBeSkipped(node)) return content;

    content = content.replace(/\n+/g, "\n");
    const secondLine = content.trim().split("\n")[1] || "";
    const secondLineIsDivider = /\| :?---/.test(secondLine);

    const columnCount = tableColCount(node);
    let emptyHeader = "";
    if (columnCount && !secondLineIsDivider) {
      emptyHeader = `|${"     |".repeat(columnCount)}\n|`;
      for (let columnIndex = 0; columnIndex < columnCount; ++columnIndex) {
        emptyHeader += ` ${getBorder(getColumnAlignment(node, columnIndex))} |`;
      }
    }

    const captionContent = node.caption ? node.caption.textContent || "" : "";
    const caption = captionContent ? `${captionContent}\n\n` : "";
    const tableContent = `${emptyHeader}${CliPrettify.prettify(content, {
      columnPadding: 1,
    })}`.trimStart();
    return `\n\n${caption}${tableContent}\n\n`;
  },
};

rules.tableCaption = {
  filter: ["caption"],
  replacement: () => "",
};

rules.tableColgroup = {
  filter: ["colgroup", "col"],
  replacement: () => "",
};

rules.tableSection = {
  filter: ["thead", "tbody", "tfoot"],
  replacement: (content: string) => content,
};

function isHeadingRow(tr: HTMLTableRowElement): boolean {
  const parentNode = tr.parentNode as Element;
  return (
    parentNode.nodeName === "THEAD" ||
    (parentNode.firstChild === tr &&
      (parentNode.nodeName === "TABLE" || isFirstTbody(parentNode)) &&
      Array.prototype.every.call(
        tr.childNodes,
        (n: Node) => n.nodeName === "TH",
      ))
  );
}

function isFirstTbody(element: Element): boolean {
  const previousSibling = element.previousSibling as Element;
  return (
    element.nodeName === "TBODY" &&
    (!previousSibling ||
      (previousSibling.nodeName === "THEAD" &&
        /^\s*$/i.test(previousSibling.textContent || "")))
  );
}

function cell(
  content: string,
  node: Element | null = null,
  index: number | null = null,
): string {
  if (index === null && node)
    index = Array.prototype.indexOf.call(node.parentNode!.childNodes, node);
  let prefix = " ";
  if (index === 0) prefix = "| ";
  let filteredContent = content
    .trim()
    .replace(/\n\r/g, "<br>")
    .replace(/\n/g, "<br>")
    .replace(/\|+/g, "\\|");
  while (filteredContent.length < 3) filteredContent += " ";
  if (node) filteredContent = handleColSpan(filteredContent, node, " ");
  return `${prefix + filteredContent} |`;
}

function nodeContainsTable(node: Node): boolean {
  if (!node.childNodes) return false;

  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (child.nodeName === "TABLE") return true;
    if (nodeContainsTable(child)) return true;
  }
  return false;
}

const nodeContains = (node: Node, types: string | Array<string>): boolean => {
  if (!node.childNodes) return false;

  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (types === "code" && isCodeBlock(child)) return true;
    if (typeof types === "string" && types.includes(child.nodeName))
      return true;
    if (Array.isArray(types) && types.includes(child.nodeName)) return true;
    if (nodeContains(child, types)) return true;
  }

  return false;
};

const tableShouldBeHtml = (tableNode: Node, options: any): boolean => {
  const possibleTags = [
    "UL",
    "OL",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "HR",
    "BLOCKQUOTE",
  ];

  if (options.preserveNestedTables) possibleTags.push("TABLE");

  return (
    nodeContains(tableNode, "code") || nodeContains(tableNode, possibleTags)
  );
};

function tableShouldBeSkipped(tableNode: HTMLTableElement | null): boolean {
  if (!tableNode) return true;

  const cached = tableShouldBeSkippedCache_.get(tableNode);
  if (cached !== undefined) return cached;

  const result = tableShouldBeSkipped_(tableNode);

  tableShouldBeSkippedCache_.set(tableNode, result);
  return result;
}

function tableShouldBeSkipped_(tableNode: HTMLTableElement): boolean {
  if (!tableNode || !tableNode.rows) return true;
  const rows = tableNode.rows;
  if (rows.length === 1 && rows[0].childNodes.length <= 1) return true;
  if (nodeContainsTable(tableNode)) return true;
  return false;
}

function nodeParentTable(node: Node): HTMLTableElement | null {
  let parent = node.parentNode as HTMLElement;
  while (parent.nodeName !== "TABLE") {
    parent = parent.parentNode as HTMLElement;
    if (!parent) return null;
  }
  return parent as HTMLTableElement;
}

function handleColSpan(
  content: string,
  node: Element,
  emptyChar: string,
): string {
  const colspan = Number.parseInt(node.getAttribute("colspan") || "1", 10);
  for (let i = 1; i < colspan; i++) {
    content += ` | ${emptyChar.repeat(3)}`;
  }
  return content;
}

function tableColCount(node: HTMLTableElement): number {
  let maxColCount = 0;
  for (let i = 0; i < node.rows.length; i++) {
    const row = node.rows[i];
    const colCount = row.childNodes.length;
    if (colCount > maxColCount) maxColCount = colCount;
  }
  return maxColCount;
}

export default function tables(turndownService: any): void {
  turndownService.keep((node: Node) => {
    if (
      node.nodeName === "TABLE" &&
      tableShouldBeHtml(node, turndownService.options)
    )
      return true;
    return false;
  });
  for (const key in rules) {
    turndownService.addRule(key, rules[key]);
  }
}
