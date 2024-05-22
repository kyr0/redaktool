import { scrapeForMarkdownOneLevelDeep } from "../src/lib/content-script/scrape";

// e.g.  bun run scrape "https://www.n-tv.de/der_tag/Der-Tag-am-Dienstag-22-Mai-2024-article24957468.html" $apiKey

const url = process.argv[2];
const apiKey = process.argv[3];

if (!apiKey) {
  console.error("Missing apiKey");
  process.exit(1);
}

console.log(`Scraping ${url}...`);

const scrapeResult = await scrapeForMarkdownOneLevelDeep(url, {
  apiKey: apiKey,
  hardCharLimit: 32000,
  maxLinks: 2,
});

console.log('scrapeResult', scrapeResult);