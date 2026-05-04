import { mkdir, readFile, writeFile } from "node:fs/promises";

const DEFAULT_SITEMAPS = [
  "https://guide.michelin.com/sitemap/restaurant/us/page/1.xml",
  "https://guide.michelin.com/sitemap/restaurant/gb/page/1.xml",
  "https://guide.michelin.com/sitemap/restaurant/fr/page/1.xml"
];

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  })
);

const limit = Number.parseInt(args.get("limit") ?? "120", 10);
const output = args.get("output") ?? "worker/src/generatedMichelinData.ts";
const sitemaps = (args.get("sitemaps")?.split(",") ?? DEFAULT_SITEMAPS).filter(Boolean);
const sitemapFiles = (args.get("sitemap-files")?.split(",") ?? []).filter(Boolean);

const restaurants = [];
const urls = [];

for (const sitemap of sitemaps) {
  const xml = await fetchText(sitemap);
  urls.push(...Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (match) => decodeXml(match[1] ?? "")));
}

for (const sitemapFile of sitemapFiles) {
  const xml = await readFile(sitemapFile, "utf8");
  urls.push(...Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (match) => decodeXml(match[1] ?? "")));
}

for (const url of unique(urls).slice(0, limit)) {
  try {
    const html = await fetchText(url);
    const restaurant = parseRestaurantPage(url, html);
    if (restaurant) {
      restaurants.push(restaurant);
      console.log(`${restaurants.length}/${limit} ${restaurant.name}`);
    }
  } catch (error) {
    console.warn(`skip ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }

  await delay(120);
}

await mkdir(output.split("/").slice(0, -1).join("/"), { recursive: true });
await writeFile(
  output,
  `import type { RawRestaurantInput } from "../../shared/types";\n\nexport const MICHELIN_RESTAURANTS: RawRestaurantInput[] = ${JSON.stringify(restaurants, null, 2)};\n`,
  "utf8"
);

console.log(`Wrote ${restaurants.length} restaurants to ${output}`);

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml,text/xml",
      "user-agent": "Mozilla/5.0 MichelinMapper/0.2 (+https://michelinmapper.pages.dev)"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

function parseRestaurantPage(url, html) {
  const jsonLd = extractJsonLd(html);
  const name = jsonLd?.name ?? getMeta(html, "itemprop", "name")?.replace(/\s+–.+$/, "");
  const coordinates = {
    latitude: Number(jsonLd?.latitude ?? parseMapCoordinate(html, 0)),
    longitude: Number(jsonLd?.longitude ?? parseMapCoordinate(html, 1))
  };

  if (!name || !Number.isFinite(coordinates.latitude) || !Number.isFinite(coordinates.longitude)) {
    return null;
  }

  const address = jsonLd?.address ?? {};
  const cuisine = Array.isArray(jsonLd?.servesCuisine)
    ? jsonLd.servesCuisine.join(", ")
    : jsonLd?.servesCuisine;
  const review = jsonLd?.review?.description ?? getMeta(html, "name", "description");
  const awardType = mapAward(jsonLd?.starRating ?? getMeta(html, "name", "description"));
  const websiteUrl = extractWebsiteUrl(html);
  const imageUrl = normalizeImageUrl(jsonLd?.image ?? getMeta(html, "property", "og:image"));
  const sourceId = `michelin-${url.split("/restaurant/")[1] ?? slugify(name)}`;
  const city = address.addressLocality ?? cityFromUrl(url);
  const country = normalizeCountry(address.addressCountry ?? countryFromUrl(url));

  return {
    source: "michelin",
    sourceId,
    name,
    awardType,
    cuisine,
    description: review,
    address: address.streetAddress,
    city,
    region: address.addressRegion,
    country,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    websiteUrl,
    sourceUrl: url,
    externalLinks: [
      { source: "michelin", label: "MICHELIN Guide", url },
      ...(websiteUrl ? [{ source: "website", label: "Website", url: websiteUrl }] : []),
      {
        source: "google_maps",
        label: "Google Maps",
        url: jsonLd?.hasMap ?? `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`
      },
      {
        source: "instagram",
        label: "Instagram Search",
        url: `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(name)}`
      },
      {
        source: "tiktok",
        label: "TikTok Search",
        url: `https://www.tiktok.com/search?q=${encodeURIComponent(`${name} restaurant`)}`
      }
    ],
    sourceNotes: [
      {
        sourceId: `${sourceId}-michelin-review`,
        title: `${cuisine || "MICHELIN"} source profile`,
        body: review,
        imageUrl,
        imageAlt: `${name} restaurant image from MICHELIN Guide`,
        imageCredit: "MICHELIN Guide",
        sourceUrl: url
      }
    ].filter((note) => note.body || note.imageUrl),
    dishes: []
  };
}

function extractJsonLd(html) {
  const blocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    (match) => match[1] ?? ""
  );

  for (const block of blocks) {
    try {
      const parsed = JSON.parse(decodeHtml(block.trim()));
      if (parsed?.["@type"] === "Restaurant") {
        return parsed;
      }
    } catch {
      // Ignore malformed metadata blocks.
    }
  }

  return null;
}

function getMeta(html, attribute, key) {
  const pattern = new RegExp(`<meta[^>]+${attribute}=["']${escapeRegExp(key)}["'][^>]+content=["']([^"']+)["']`, "i");
  return decodeHtml(html.match(pattern)?.[1] ?? "");
}

function extractWebsiteUrl(html) {
  const match = html.match(/href=["'](https?:\/\/[^"']+)["'][^>]+data-event=["']CTA_website["']/i);
  return decodeHtml(match?.[1] ?? "") || undefined;
}

function parseMapCoordinate(html, index) {
  const match = html.match(/maps\/embed\/v1\/place\?[^"']*q=([-\d.]+),([-\d.]+)/);
  return match?.[index + 1];
}

function mapAward(value = "") {
  const normalized = String(value).toLowerCase();
  if (normalized.includes("three") || normalized.includes("3 star")) return "3-star";
  if (normalized.includes("two") || normalized.includes("2 star")) return "2-star";
  if (normalized.includes("one") || normalized.includes("1 star")) return "1-star";
  if (normalized.includes("bib")) return "bib-gourmand";
  return "recommended";
}

function cityFromUrl(url) {
  return titleCase(url.split("/restaurant/")[0]?.split("/").at(-1)?.replace(/-/g, " ") ?? "");
}

function countryFromUrl(url) {
  const code = url.match(/guide\.michelin\.com\/([^/]+)\//)?.[1] ?? "";
  if (code === "us") return "United States";
  if (code === "gb") return "United Kingdom";
  if (code === "fr") return "France";
  return code.toUpperCase();
}

function normalizeCountry(value) {
  const countryMap = {
    ARE: "United Arab Emirates",
    AUT: "Austria",
    BEL: "Belgium",
    CAN: "Canada",
    CHE: "Switzerland",
    CHN: "China",
    DEU: "Germany",
    ESP: "Spain",
    FRA: "France",
    GBR: "United Kingdom",
    HKG: "Hong Kong",
    ITA: "Italy",
    JPN: "Japan",
    KOR: "South Korea",
    PRT: "Portugal",
    SGP: "Singapore",
    SWE: "Sweden",
    THA: "Thailand",
    TWN: "Taiwan",
    USA: "United States"
  };

  if (countryMap[value]) return countryMap[value];
  if (value === "USA") return "United States";
  return value || "Unknown";
}

function normalizeImageUrl(value) {
  if (!value) return undefined;
  return String(value).replace(/\?width=\d+$/, "?width=900");
}

function decodeXml(value) {
  return value.replace(/&amp;/g, "&");
}

function decodeHtml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function titleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unique(values) {
  return Array.from(new Set(values));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
