import type { AwardType, DishDetailItem, DishOntology, TagType } from "../../../shared/types";

export interface DishDetailRow {
  id: number;
  source: string;
  source_id: string;
  source_url: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_credit: string | null;
  price_text: string | null;
  restaurant_id: number;
  restaurant_name: string;
  award_type: AwardType;
  cuisine: string | null;
  city: string | null;
  region: string | null;
  country: string;
  tags_json: string | null;
  images_json: string | null;
}

interface DishSourceIdentity {
  name: string;
  sourceId: string;
}

interface OntologyTagRow {
  id: number;
  name: string;
  slug: string;
  type: TagType;
  confidence: number;
  source: string;
}

interface DishImageRow {
  id: number;
  url: string;
  alt: string | null;
  credit: string | null;
  source: string;
  sourceUrl: string | null;
  isPrimary: number | boolean;
}

const PUBLISHABLE_PLACEHOLDER_PATTERNS = [/menu highlights/i];

export function isPublishableDishSource(dish: DishSourceIdentity): boolean {
  if (dish.sourceId.endsWith("-menu-highlights")) {
    return false;
  }

  return !PUBLISHABLE_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(dish.name));
}

export function buildDishOntology(row: DishDetailRow): DishOntology {
  const tags = parseJsonArray<OntologyTagRow>(row.tags_json);
  const media = parseJsonArray<DishImageRow>(row.images_json).map((image) => ({
    id: image.id,
    url: image.url,
    alt: image.alt,
    credit: image.credit,
    source: image.source,
    sourceUrl: image.sourceUrl,
    isPrimary: Boolean(image.isPrimary)
  }));

  return {
    identity: {
      id: row.id,
      slug: row.slug,
      label: row.name,
      type: "dish"
    },
    award: {
      label: row.award_type,
      type: "award",
      source: "restaurant"
    },
    cuisine: row.cuisine
      ? {
          label: row.cuisine,
          type: "cuisine",
          source: "restaurant"
        }
      : null,
    place: {
      city: row.city,
      region: row.region,
      country: row.country,
      source: "restaurant"
    },
    tags: {
      award: tags.filter((tag) => tag.type === "award"),
      cuisine: tags.filter((tag) => tag.type === "cuisine"),
      dietary: tags.filter((tag) => tag.type === "dietary"),
      gastronomic: tags.filter((tag) => tag.type === "gastronomic"),
      geographic: tags.filter((tag) => tag.type === "geographic"),
      other: tags.filter((tag) => tag.type === "other")
    },
    media,
    provenance: {
      source: row.source,
      sourceId: row.source_id,
      sourceUrl: row.source_url,
      imageCredit: row.image_credit
    }
  };
}

export function mapDishDetailRow(row: DishDetailRow): DishDetailItem {
  const ontology = buildDishOntology(row);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    priceText: row.price_text,
    source: row.source,
    sourceId: row.source_id,
    sourceUrl: row.source_url,
    imageCredit: row.image_credit,
    restaurant: {
      id: row.restaurant_id,
      name: row.restaurant_name,
      awardType: row.award_type,
      cuisine: row.cuisine,
      city: row.city,
      region: row.region,
      country: row.country
    },
    images: ontology.media,
    tags: Object.values(ontology.tags).flat().map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      type: tag.type
    })),
    ontology
  };
}

function parseJsonArray<T>(value: string | null): T[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
