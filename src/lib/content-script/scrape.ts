import { ZenRows } from "zenrows";
import { htmlToDomDocument } from "./dom";
import TurndownService from "turndown";

export const getTurndownService = () => {
  const turndownService = new TurndownService({
    // @ts-ignore
    filter: (node, options) =>
      node.nodeName === "STYLE" ||
      node.nodeName === "IMG" ||
      node.nodeName === "SCRIPT" ||
      node.nodeName === "AUDIO" ||
      node.nodeName === "VIDEO" ||
      node.nodeName === "OBJECT" ||
      node.nodeName === "SVG" ||
      node.nodeName === "CODE" ||
      node.nodeName === "PRE" ||
      node.nodeName === "FORM" ||
      node.nodeName === "INPUT" ||
      node.nodeName === "TEXTAREA" ||
      node.nodeName === "BUTTON" ||
      node.nodeName === "NAV" ||
      node.nodeName === "FOOTER" ||
      node.nodeName === "IFRAME" ||
      node.nodeName === "INS" ||
      node.nodeName === "ADS",
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
  const document = htmlToDomDocument(html);
  const twoOtherOnSiteLinks = await extractRelevantRelativeLinks(
    document,
    targetUrl,
    options.maxLinks || 2,
  );
  let relevantContentAsMarkdown = extractRelevantContentAsMarkdown(
    document,
    html,
    options?.hardCharLimit || 32000,
  );
  for (let i = 0; i < twoOtherOnSiteLinks.length; i++) {
    const relevantLink = twoOtherOnSiteLinks[i];
    const subPageHtml = await scrapeWebsite(
      targetUrl.toString() + relevantLink,
      options,
    );
    const subPageDocument = htmlToDomDocument(subPageHtml);
    const subPageRelevantContentAsMarkdown = extractRelevantContentAsMarkdown(
      subPageDocument,
      subPageHtml,
      options?.hardCharLimit || 32000,
    );
    relevantContentAsMarkdown += subPageRelevantContentAsMarkdown;
  }
  return relevantContentAsMarkdown;
};
