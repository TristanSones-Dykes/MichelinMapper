export type AwardType =
  | "3-star"
  | "2-star"
  | "1-star"
  | "bib-gourmand"
  | "recommended";

export type TagType =
  | "award"
  | "geographic"
  | "gastronomic"
  | "cuisine"
  | "dietary"
  | "other";

export type DishKind = "dish" | "menu_highlight";

export interface ClassifiedTag {
  name: string;
  slug: string;
  type: TagType;
  confidence: number;
}

export interface RawDishInput {
  sourceId: string;
  name: string;
  dishKind?: DishKind;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  sourceUrl?: string;
  priceText?: string;
  images?: RawDishImageInput[];
}

export interface RawDishImageInput {
  url: string;
  alt?: string;
  credit?: string;
  source?: string;
  sourceUrl?: string;
  isPrimary?: boolean;
}

export interface RawSourceNoteInput {
  sourceId: string;
  title: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  sourceUrl?: string;
}

export interface RawRestaurantInput {
  source: string;
  sourceId: string;
  name: string;
  awardType: AwardType;
  cuisine?: string;
  description?: string;
  address?: string;
  city?: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  websiteUrl?: string;
  sourceUrl?: string;
  externalLinks?: RawExternalLinkInput[];
  sourceNotes?: RawSourceNoteInput[];
  dishes: RawDishInput[];
}

export interface RawExternalLinkInput {
  source: "website" | "wikidata" | "google_maps" | "instagram" | "tiktok" | "michelin" | "other";
  label: string;
  url: string;
  handle?: string;
}

export interface RestaurantMapItem {
  id: number;
  name: string;
  slug: string;
  awardType: AwardType;
  cuisine: string | null;
  city: string | null;
  country: string;
  latitude: number;
  longitude: number;
  externalLinks: Array<{
    id: number;
    source: string;
    label: string;
    url: string;
    handle: string | null;
  }>;
  previewDishes: Array<{
    id: number;
    name: string;
    imageUrl: string | null;
  }>;
}

export interface DishListItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  priceText: string | null;
  restaurant: {
    id: number;
    name: string;
    awardType: AwardType;
    city: string | null;
    country: string;
  };
  tags: Array<{
    id: number;
    name: string;
    slug: string;
    type: TagType;
  }>;
}

export interface DishDetailItem extends DishListItem {
  source: string;
  sourceId: string;
  sourceUrl: string | null;
  imageCredit: string | null;
  restaurant: DishListItem["restaurant"] & {
    cuisine: string | null;
    region: string | null;
  };
  images: DishOntologyImage[];
  ontology: DishOntology;
}

export interface DishOntologyImage {
  id: number;
  url: string;
  alt: string | null;
  credit: string | null;
  source: string;
  sourceUrl: string | null;
  isPrimary: boolean;
}

export interface DishOntologyTag {
  id: number;
  name: string;
  slug: string;
  type: TagType;
  confidence: number;
  source: string;
}

export interface DishOntology {
  identity: {
    id: number;
    slug: string;
    label: string;
    type: "dish";
  };
  award: {
    label: AwardType;
    type: "award";
    source: string;
  };
  cuisine: {
    label: string;
    type: "cuisine";
    source: string;
  } | null;
  place: {
    city: string | null;
    region: string | null;
    country: string;
    source: string;
  };
  tags: Record<TagType, DishOntologyTag[]>;
  media: DishOntologyImage[];
  provenance: {
    source: string;
    sourceId: string;
    sourceUrl: string | null;
    imageCredit: string | null;
  };
}
