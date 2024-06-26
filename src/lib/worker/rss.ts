export const fetchRssFeed = async (rssFeedUrl: string) => {
  const feed = await fetch(rssFeedUrl);
  const feedText = await feed.text();
  console.log("feedText", feedText);
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(feedText, "application/xml");

  const items = xmlDoc.querySelectorAll("item");
  const feedItems = Array.from(items).map((item) => {
    const title = item.querySelector("title")?.textContent ?? "No title";
    const link = item.querySelector("link")?.textContent ?? "No link";
    const pubDate =
      item.querySelector("pubDate")?.textContent ?? "No publication date";
    return { title, link, pubDate };
  });

  console.log("feedItems", feedItems);
  return feedItems;
};
