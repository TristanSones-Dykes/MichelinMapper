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

export interface ClassifiedTag {
  name: string;
  slug: string;
  type: TagType;
  confidence: number;
}

export interface RawDishInput {
  sourceId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  sourceUrl?: string;
  priceText?: string;
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
  dishes: RawDishInput[];
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
