import type { AwardType } from "../../../shared/types";

export type DishSort = "newest" | "name" | "restaurant";

export interface DishQuery {
  awardType?: AwardType;
  limit: number;
  offset: number;
  search?: string;
  sort: DishSort;
  tags: string[];
}

const AWARD_TYPES = new Set<AwardType>([
  "3-star",
  "2-star",
  "1-star",
  "bib-gourmand",
  "recommended"
]);

const SORTS = new Set<DishSort>(["newest", "name", "restaurant"]);

export function parseDishQuery(url: URL): DishQuery {
  const page = clampInteger(url.searchParams.get("page"), 1, 1, 10_000);
  const limit = clampInteger(url.searchParams.get("pageSize"), 20, 1, 50);
  const sortCandidate = url.searchParams.get("sort");
  const awardTypeCandidate = url.searchParams.get("awardType");
  const search = url.searchParams.get("q")?.trim();

  return {
    ...(AWARD_TYPES.has(awardTypeCandidate as AwardType)
      ? { awardType: awardTypeCandidate as AwardType }
      : {}),
    limit,
    offset: (page - 1) * limit,
    ...(search ? { search } : {}),
    sort: SORTS.has(sortCandidate as DishSort) ? (sortCandidate as DishSort) : "newest",
    tags: normalizeTags(url.searchParams)
  };
}

function normalizeTags(searchParams: URLSearchParams): string[] {
  const tags = [
    ...searchParams.getAll("tag"),
    ...searchParams.getAll("tags").flatMap((value) => value.split(","))
  ];

  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function clampInteger(
  value: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}
