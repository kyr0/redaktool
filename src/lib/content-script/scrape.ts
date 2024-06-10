import { ZenRows } from "zenrows";
import { htmlToDomDocument } from "./dom";
import TurndownService from "turndown";

export const getTurndownService = () => {
  const turndownService = new TurndownService({
    // @ts-ignore
    filter: (node, options) => !isIrrelevantNode(node),
  });
  return turndownService;
};

// Extended array of legal and irrelevant content stop words for NLP tasks
export const LEGAL_SLUG_STOP_WORDS_EN = [
  "terms",
  "conditions",
  "privacy",
  "policy",
  "disclaimer",
  "copyright",
  "cookie",
  "user",
  "agreement",
  "license",
  "compliance",
  "gdpr",
  "rights",
  "law",
  "consent",
  "guidelines",
  "ethics",
  "conduct",
  "patent",
  "trademarks",
  "conditions",
  "terms-of-use",
  "privacy-statement",
  "legal-notice",
  "subscriptions",
  "end-user",
  "eula",
  "limitations",
  "liability",
  "indemnity",
  "disclosure",
  "cookies-policy",
  "data-use",
  "copyrights",
  "legal-disclosures",
  "terms-of-sale",
  "license-agreement",
  "terms-of-access",
  "privacy-notice",
  "cookie-notice",
  "user-rights",
  "legal-info",
  "company-policy",
  "access-terms",
  "service-terms",
];

export const LEGAL_SLUG_STOP_WORDS_DE = [
  "rechtlich",
  "bedingungen",
  "nutzungsbedingungen",
  "datenschutz",
  "datenschutzerklaerung",
  "haftungsausschluss",
  "urheberrecht",
  "cookie",
  "vereinbarung",
  "lizenz",
  "dsgvo",
  "datenschutz-grundverordnung",
  "datenschutzrichtlinie",
  "nutzungsrecht",
  "nutzerbedingungen",
  "impressum",
  "agb",
  "allgemeine-geschaeftsbedingungen",
  "haftung",
  "vertraulichkeit",
  "geschaeftsbedingungen",
  "lizenzvereinbarung",
  "datennutzung",
  "rechtliche-hinweise",
  "verkaufsbedingungen",
  "zugangsregeln",
  "datenschutzhinweis",
  "cookie-richtlinie",
  "rechtliche-informationen",
];

export function containsLegalSlug(slug: string) {
  const terms = slug.split(/[-_./]/);
  for (let i = 0; i < terms.length; i++) {
    if (
      [...LEGAL_SLUG_STOP_WORDS_EN, ...LEGAL_SLUG_STOP_WORDS_DE].includes(
        terms[i],
      )
    ) {
      return true;
    }
  }
  return false;
}

export function validateAndFormatUrl(url: string) {
  // protocol missing or wrong, prefix with https
  if (!url.match(/^(http|https):\/\//)) {
    url = `https://${url}`;
  }
  return new URL(url).toString();
}

export interface ScrapeOptions {
  apiKey: string;
  hardCharLimit?: number;
  maxLinks?: number;
}

export interface ScrapeConfig {
  autoparse?: boolean;
  css_extractor?: string;
  js_render?: boolean;
  premium_proxy?: boolean;
  proxy_country?: string;
  wait_for?: string;
  wait?: number;
  block_resources?: string;
  window_width?: number;
  window_height?: number;
  device?: string;
  original_status?: boolean;
  custom_headers?: boolean;
  [x: string]: unknown;
}

export const scrapeWebsite = async (
  targetUrl: string,
  options: ScrapeOptions,
  scrapeConfig?: ScrapeConfig,
): Promise<string> => {
  // validate URL
  targetUrl = validateAndFormatUrl(targetUrl);

  try {
    if (!options.apiKey || options.apiKey.trim() === "") {
      throw new Error("ZenRows API key is required");
    }

    const client = new ZenRows(options.apiKey, {
      concurrency: 5,
      retries: 1,
    });

    const { data: html } = await client.get(targetUrl, {
      js_render: true,
      premium_proxy: true,
      antibot: "true",
      ...scrapeConfig,
    });
    return html;
  } catch (error) {
    // @ts-ignore
    if (error.response?.data) {
      const throwError = {
        // @ts-ignore
        ...(error.response ? error.response.data : error),
        targetUrl,
        options,
        scrapeConfig,
      };
      throw throwError;
    }
    throw error;
  }
};

export const extractRelevantContentAsMarkdown = (
  document: Document,
  html: string,
  maxLength = 32000,
) => {
  const metaDescription =
    (document.querySelector('meta[name="description"]') as HTMLMetaElement)
      ?.content || "";

  // https://www.npmjs.com/package/node-html-markdown#usage
  const contentMarkdown = `# ${document.title}
    ${metaDescription ? `## ${metaDescription}` : ""}

    ${getTurndownService().turndown(html).substring(0, maxLength)}
    `;
  return contentMarkdown;
};

export const toRelativeHref = (link: string, targetUrl: URL) => {
  let href = link;
  if (href.startsWith(targetUrl.origin)) {
    href = href.replace(targetUrl.origin, "");
  }

  if (href.startsWith(`http://${targetUrl.host}`)) {
    href = href.replace(`http://${targetUrl.host}`, "");
  }

  if (href.startsWith(`https://${targetUrl.host}`)) {
    href = href.replace(`https://${targetUrl.host}`, "");
  }
  return href.startsWith("/") ? href.substring(1) : href;
};

export const filterScrapeLinks = (
  links: Array<HTMLAnchorElement>,
  targetUrl: URL,
) => {
  return links
    .map((link) => toRelativeHref(link.href, targetUrl))
    .filter(
      (link) =>
        link &&
        // do not include legal slugs for scraping, as they descrease the quality of the generated content
        !containsLegalSlug(link) &&
        // all typical file extensions, like .pdf, .gz, .jpeg
        !link.match(/\.[a-zA-Z]{2,4}$/) &&
        // no anchor recursion constraint
        !link.startsWith("#") &&
        // no landing page query params
        !link.startsWith("?") &&
        // no email mailto:, tel:, data:, *:* recursion constraint
        !link.includes(":"),
    )
    .map((link) => `/${link}`);
};

export const extractRelevantRelativeLinks = async (
  document: Document,
  targetUrl: string,
  limit = 3,
) => {
  const url = new URL(targetUrl);
  const links = filterScrapeLinks(
    Array.from(document.querySelectorAll("a")),
    url,
  );
  return links.slice(0, limit);
};

export const scrapeForMarkdownOneLevelDeep = async (
  targetUrl: string,
  options: ScrapeOptions,
  scrapeConfig?: ScrapeConfig,
) => {
  const html = await scrapeWebsite(targetUrl, options, scrapeConfig);

  //log("out.html", html);
  const _document =
    // Node.js vs. browser/service worker
    typeof document === "undefined" ? htmlToDomDocument(html) : document;

  const { bestCandidate, topP } = autoCorrelateMostRelevantContent(
    _document,
    _document.body,
  );

  return extractRelevantContentAsMarkdown(
    _document,
    (bestCandidate.node as HTMLElement).innerHTML ||
      (bestCandidate.node as HTMLElement).innerText,
    options?.hardCharLimit || 32000,
  );
};

const ELEMENT_NODE = 1;
const FILTER_REJECT = 2;
const FILTER_ACCEPT = 1;

export const isIrrelevantNode = (node: Node) => {
  const ignoredElements = [
    "STYLE",
    "IMG",
    "SCRIPT",
    "AUDIO",
    "VIDEO",
    "OBJECT",
    "SVG",
    "CODE",
    "FORM",
    "INPUT",
    "TEXTAREA",
    "BUTTON",
    "NAV",
    "FOOTER",
    "IFRAME",
    "INS",
    "ADS",
    "NOSCRIPT",
  ];

  if (ignoredElements.includes(node.nodeName.toUpperCase())) {
    return true;
  }
  return false;
};

export const createDomWalker = (document: Document, el: Node) =>
  document.createTreeWalker(el, ELEMENT_NODE, {
    acceptNode: (node) => {
      if (isIrrelevantNode(node)) {
        return FILTER_REJECT;
      }
      return FILTER_ACCEPT;
    },
  });

export const traverseUpwards = (node: Node) => {
  let count = 0;
  let currentNode = node;

  while (currentNode.parentElement) {
    count++;
    currentNode = currentNode.parentElement;
  }
  return count;
};

export const forEachRelevantElement = (
  document: Document,
  node: Node,
  fn: (node: Node, depth: number) => void,
) => {
  const walker = createDomWalker(document, node);
  let currentNode = walker.nextNode();
  while (currentNode) {
    if (currentNode.textContent?.trim()) {
      fn(currentNode, traverseUpwards(currentNode));
    }
    currentNode = walker.nextNode();
  }
};

export const splitIntoSentences = (text: string) => {
  // regular expression to match sentence-ending period preceded by a word character and followed by whitespace or end of string.
  const sentencePattern = /(?<=\w\.)\s+/u;

  // check if text contains at least one period, if not return an empty array
  if (!/\w\./.test(text)) {
    return [];
  }

  return text
    .split(sentencePattern)
    .filter((sentence) => sentence.trim().length > 0);
};

// normalize values to a scale of 0 to 1
export const normalize = (value: number, min: number, max: number) =>
  (value - min) / (max - min);

export interface AutoCorrelateMostRelevantContentOptions {
  minSentences: number;
}

export interface AutoCorrelateMostRelevantContentResult {
  text: string;
  node: Node;
  sentences: number;
  length: number;
  depth: number;
  score?: number;
  naturalIndex?: number;
  inclusions?: number;
}

export const autoCorrelateMostRelevantContent = (
  document: Document,
  node: Element,
  options = { minSentences: 3 },
) => {
  let results: Array<AutoCorrelateMostRelevantContentResult> = [];
  let minDepth = Number.POSITIVE_INFINITY;
  let maxDepth = Number.NEGATIVE_INFINITY;
  let minSentenceCount = Number.POSITIVE_INFINITY;
  let maxSentenceCount = Number.NEGATIVE_INFINITY;
  let maxInclusions = 0;

  const uniqueCombinations = new Set();

  forEachRelevantElement(document, node, (node, depth) => {
    if ((node as HTMLElement) && !node.textContent) return;

    const sentencesTexts = splitIntoSentences(
      (node as HTMLElement).innerText.trim(),
    );
    const text = sentencesTexts.join(" ").trim();

    if (text) {
      const sentences = sentencesTexts.length;
      const length = text.length;
      const combinationKey = `${sentences}-${length}`;

      // skip records with the same sentence count and depth as any record already in the results
      if (uniqueCombinations.has(combinationKey)) return;

      results.push({
        node,
        text,
        sentences,
        length,
        depth,
        inclusions: 0,
      });

      // add the combination to the set
      uniqueCombinations.add(combinationKey);

      // update min and max depths
      if (depth < minDepth) {
        minDepth = depth;
      }
      if (depth > maxDepth) {
        maxDepth = depth;
      }

      // update min and max sentence counts
      if (sentences < minSentenceCount) {
        minSentenceCount = sentences;
      }
      if (sentences > maxSentenceCount) {
        maxSentenceCount = sentences;
      }
    }
  });

  // calculate inclusions and find the maximum inclusions
  results.forEach((result, index) => {
    results.forEach((otherResult, otherIndex) => {
      if (index !== otherIndex && result.text.includes(otherResult.text)) {
        result.inclusions! += 1;
      }
    });
    if (result.inclusions! > maxInclusions) {
      maxInclusions = result.inclusions!;
    }
  });

  results = results.filter((v) => v.node.nodeType === ELEMENT_NODE);

  // calculate normalized content score for auto-correlation
  results.forEach((result, index) => {
    const normalizedDepth = normalize(result.depth, minDepth, maxDepth);
    const normalizedSentences = normalize(
      result.sentences,
      minSentenceCount,
      maxSentenceCount,
    );
    const normalizedInclusions = normalize(
      result.inclusions!,
      0,
      maxInclusions,
    );

    if (!result.inclusions) result.inclusions = 0;
    results.forEach((otherResult, otherIndex) => {
      if (index !== otherIndex && result.text.includes(otherResult.text)) {
        result.inclusions! += 1;
      }
    });

    // if it contains a nav element, it is MUCH less probable to be relevant content
    const navFactorPenalty = (result.node as Element).querySelector(
      "header,footer,nav,aside",
    )
      ? 0.75 /** clamp -25% */
      : 1;

    const mainBoostChildFactor = (
      result.node.parentNode as Element
    ).querySelector("article,main")
      ? 1.25
      : 1;

    const mainExactMatchBoostFactor =
      result.node.nodeName === "MAIN" || result.node.nodeName === "ARTICLE"
        ? 1.5
        : 1;

    // the element that is contains alot of other element's text and is deep and has many sentences is the most probable to contain the actually relevant content
    result.score = result.score =
      (0.45 * normalizedInclusions + // if this element includes alot of the text of other candidates, it's an outer element with relevant content
        0.4 * normalizedDepth + // the deeper the element is nested, the less probable it is to not be an outer element that includes header, footer and side navigation
        0.15 * normalizedSentences) * // the more sentences the element has, the more probable it is to be relevant content in general
      navFactorPenalty * // if it contains a nav element, it is MUCH less probable to be relevant content
      mainBoostChildFactor * // if it contains a main or article element, it is MUCH more probable to be relevant content
      mainExactMatchBoostFactor; // if it is a main or article element, it is absolutely the MOST probable to be relevant content
    //(normalizedDepth + normalizedSentences + normalizedInclusions) / 3;
    //result.score = 0.5 * normalizedDepth + 0.5 * normalizedSentences;
  });

  const relevantContent = results
    .map((result, index) => ({
      ...result,
      naturalIndex: index,
    }))

    .filter((v) => v.sentences > options.minSentences)
    .sort((a, b) => b.score! - a.score!);

  const bestCandidate = relevantContent[0];

  const postProcessedResults: AutoCorrelateMostRelevantContentResult[] = results
    .sort((a, b) => b.length - a.length)
    .reduce((acc: AutoCorrelateMostRelevantContentResult[], result, index) => {
      if (acc[index - 1] && acc[index - 1].text.includes(result.text)) {
        return acc;
      }
      acc.push(result);
      return acc;
    }, [] as AutoCorrelateMostRelevantContentResult[])
    .sort((a, b) => b.naturalIndex! - a.naturalIndex!);

  return {
    topP: relevantContent,
    bestCandidate,
    results,
    postProcessedResults,
  };
};
