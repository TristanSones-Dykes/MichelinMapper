import type { AwardType, DishListItem, RestaurantMapItem, TagType } from "../../shared/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export interface DishFilters {
  awardType?: AwardType;
  page: number;
  pageSize: number;
  search: string;
  sort: "newest" | "name" | "restaurant";
  tags: string[];
}

export interface DishResponse {
  items: DishListItem[];
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface TagFilter {
  id: number;
  name: string;
  slug: string;
  type: TagType;
  dishCount: number;
}

export async function fetchRestaurants(signal?: AbortSignal): Promise<RestaurantMapItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/restaurants`, { signal });
  const payload = await parseJson<{ items: RestaurantMapItem[] }>(response);
  return payload.items;
}

export async function fetchTags(signal?: AbortSignal): Promise<TagFilter[]> {
  const response = await fetch(`${API_BASE_URL}/api/tags`, { signal });
  const payload = await parseJson<{ items: TagFilter[] }>(response);
  return payload.items;
}

export async function fetchDishes(
  filters: DishFilters,
  signal?: AbortSignal
): Promise<DishResponse> {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
    sort: filters.sort
  });

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.awardType) {
    params.set("awardType", filters.awardType);
  }

  for (const tag of filters.tags) {
    params.append("tag", tag);
  }

  const response = await fetch(`${API_BASE_URL}/api/dishes?${params.toString()}`, { signal });
  return parseJson<DishResponse>(response);
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}
