import { slugify } from "./slug";

export interface RestaurantSlugInput {
  name: string;
  city?: string;
  country: string;
  sourceId: string;
}

export function buildRestaurantSlug(input: RestaurantSlugInput): string {
  return slugify(`${input.name}-${input.city ?? input.country}-${input.sourceId}`);
}
