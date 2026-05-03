import { slugify } from "../../../shared/slug";
import type { AwardType, RawExternalLinkInput, RawRestaurantInput } from "../../../shared/types";
import type { IngestionSource } from "./types";

interface WikidataBinding {
  restaurant: { value: string };
  restaurantLabel: { value: string };
  coord?: { value: string };
  countryLabel?: { value: string };
  cityLabel?: { value: string };
  website?: { value: string };
  instagram?: { value: string };
  stars?: { value: string };
}

interface WikidataResponse {
  results: {
    bindings: WikidataBinding[];
  };
}

const WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";

export function createWikidataSource(limit: number): IngestionSource {
  return {
    name: "wikidata",
    async fetchRestaurants() {
      const query = buildRestaurantQuery(limit);
      const response = await fetch(`${WIKIDATA_ENDPOINT}?format=json&query=${encodeURIComponent(query)}`, {
        headers: {
          accept: "application/sparql-results+json",
          "user-agent": "MichelinMapper/0.2 (+https://michelinmapper.pages.dev; open data ingestion)"
        }
      });

      if (!response.ok) {
        throw new Error(`Wikidata returned ${response.status}`);
      }

      const payload = (await response.json()) as WikidataResponse;
      return dedupeRestaurants(payload.results.bindings.map(mapWikidataRestaurant).filter(isRestaurant));
    }
  };
}

function buildRestaurantQuery(limit: number): string {
  return `SELECT ?restaurant ?restaurantLabel ?coord ?countryLabel ?cityLabel ?website ?instagram (MAX(?starsValue) AS ?stars) WHERE {
    ?restaurant wdt:P31/wdt:P279* wd:Q11707.
    ?restaurant p:P166 ?awardStatement.
    ?awardStatement ps:P166 wd:Q20824563.
    OPTIONAL { ?awardStatement pq:P1114 ?starsValue. }
    OPTIONAL { ?restaurant wdt:P625 ?coord. }
    OPTIONAL { ?restaurant wdt:P17 ?country. }
    OPTIONAL { ?restaurant wdt:P131 ?city. }
    OPTIONAL { ?restaurant wdt:P856 ?website. }
    OPTIONAL { ?restaurant wdt:P2003 ?instagram. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }
  GROUP BY ?restaurant ?restaurantLabel ?coord ?countryLabel ?cityLabel ?website ?instagram
  ORDER BY DESC(?stars)
  LIMIT ${Math.max(1, Math.min(limit, 500))}`;
}

function mapWikidataRestaurant(row: WikidataBinding): RawRestaurantInput | null {
  const coordinates = parsePoint(row.coord?.value);
  const country = row.countryLabel?.value;

  if (!coordinates || !country) {
    return null;
  }

  const name = row.restaurantLabel.value;
  const sourceUrl = row.restaurant.value.replace("http://www.wikidata.org/entity/", "https://www.wikidata.org/wiki/");
  const externalLinks: RawExternalLinkInput[] = [
    { source: "wikidata", label: "Wikidata", url: sourceUrl },
    {
      source: "google_maps",
      label: "Google Maps",
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${row.cityLabel?.value ?? ""} ${country}`)}`
    },
    {
      source: "tiktok",
      label: "TikTok Search",
      url: `https://www.tiktok.com/search?q=${encodeURIComponent(`${name} restaurant`)}`
    }
  ];

  if (row.website?.value) {
    externalLinks.push({ source: "website", label: "Website", url: row.website.value });
  }

  if (row.instagram?.value) {
    externalLinks.push({
      source: "instagram",
      label: "Instagram",
      url: `https://www.instagram.com/${row.instagram.value.replace(/^@/, "")}/`,
      handle: row.instagram.value.replace(/^@/, "")
    });
  } else {
    externalLinks.push({
      source: "instagram",
      label: "Instagram Search",
      url: `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(name)}`
    });
  }

  return {
    source: "wikidata",
    sourceId: row.restaurant.value.replace("http://www.wikidata.org/entity/", ""),
    name,
    awardType: mapStarsToAward(row.stars?.value),
    city: row.cityLabel?.value,
    country,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    websiteUrl: row.website?.value,
    sourceUrl,
    externalLinks,
    dishes: []
  };
}

function mapStarsToAward(starsValue: string | undefined): AwardType {
  switch (Number.parseInt(starsValue ?? "1", 10)) {
    case 3:
      return "3-star";
    case 2:
      return "2-star";
    default:
      return "1-star";
  }
}

function parsePoint(point: string | undefined): { latitude: number; longitude: number } | null {
  const match = point?.match(/^Point\(([-\d.]+) ([-\d.]+)\)$/);
  if (!match) {
    return null;
  }

  return {
    longitude: Number(match[1]),
    latitude: Number(match[2])
  };
}

function isRestaurant(value: RawRestaurantInput | null): value is RawRestaurantInput {
  return value !== null;
}

function dedupeRestaurants(restaurants: RawRestaurantInput[]): RawRestaurantInput[] {
  const seen = new Set<string>();
  return restaurants.filter((restaurant) => {
    const key = slugify(`${restaurant.name}-${restaurant.latitude.toFixed(4)}-${restaurant.longitude.toFixed(4)}`);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
