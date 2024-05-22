import { scrapeForMarkdownOneLevelDeep } from "../src/lib/content-script/scrape";

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