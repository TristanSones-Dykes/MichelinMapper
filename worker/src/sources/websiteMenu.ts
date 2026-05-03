import { slugify } from "../../../shared/slug";
import type { RawDishInput, RawRestaurantInput } from "../../../shared/types";

const MAX_HTML_BYTES = 250_000;
const MAX_DISHES_PER_SITE = 12;
const FETCH_TIMEOUT_MS = 8_000;

export async function extractWebsiteMenuDishes(
  restaurant: RawRestaurantInput
): Promise<RawDishInput[]> {
  if (!restaurant.websiteUrl) {
    return [];
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(restaurant.websiteUrl, {
      signal: controller.signal,
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "MichelinMapper/0.2 (+https://michelinmapper.pages.dev; menu metadata crawler)"
      }
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok || !response.body) {
    return [];
  }

  const html = await readTextWithLimit(response.body, MAX_HTML_BYTES);
  const jsonLdBlocks = extractJsonLdBlocks(html);
  const dishes = jsonLdBlocks.flatMap((block) => extractMenuItems(block, restaurant));

  return dedupeDishes(dishes).slice(0, MAX_DISHES_PER_SITE);
}

async function readTextWithLimit(stream: ReadableStream<Uint8Array>, limit: number): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (total < limit) {
    const { done, value } = await reader.read();
    if (done || !value) {
      break;
    }

    chunks.push(value);
    total += value.byteLength;
  }

  await reader.cancel().catch(() => undefined);
  const bytes = concatBytes(chunks, Math.min(total, limit));
  return new TextDecoder().decode(bytes);
}

function concatBytes(chunks: Uint8Array[], length: number): Uint8Array {
  const output = new Uint8Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    const slice = chunk.slice(0, Math.min(chunk.byteLength, length - offset));
    output.set(slice, offset);
    offset += slice.byteLength;
    if (offset >= length) {
      break;
    }
  }

  return output;
}

function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(decodeHtmlEntities((match[1] ?? "").trim())));
    } catch {
      // Invalid JSON-LD is common on restaurant sites; ignore and keep crawling.
    }
  }

  return blocks;
}

function extractMenuItems(value: unknown, restaurant: RawRestaurantInput): RawDishInput[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractMenuItems(item, restaurant));
  }

  const record = value as Record<string, unknown>;
  const type = Array.isArray(record["@type"]) ? record["@type"].join(" ") : String(record["@type"] ?? "");
  const nested = Object.values(record).flatMap((item) => extractMenuItems(item, restaurant));

  if (!/\b(MenuItem|MenuSection)\b/i.test(type) || typeof record.name !== "string") {
    return nested;
  }

  if (/menu|tasting|wine|beverage|drinks?/i.test(record.name)) {
    return nested;
  }

  return [
    {
      sourceId: `${restaurant.sourceId}-website-${slugify(record.name)}`,
      name: record.name,
      description: typeof record.description === "string" ? record.description : undefined,
      imageUrl: getFirstString(record.image),
      imageAlt: record.name,
      imageCredit: "Restaurant website",
      sourceUrl: restaurant.websiteUrl
    },
    ...nested
  ];
}

function getFirstString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string");
  }

  if (value && typeof value === "object" && typeof (value as { url?: unknown }).url === "string") {
    return (value as { url: string }).url;
  }

  return undefined;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function dedupeDishes(dishes: RawDishInput[]): RawDishInput[] {
  const seen = new Set<string>();
  return dishes.filter((dish) => {
    const key = slugify(dish.name);
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
