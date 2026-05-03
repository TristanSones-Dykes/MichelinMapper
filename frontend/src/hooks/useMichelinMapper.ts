import { startTransition, useDeferredValue, useEffect, useState } from "react";
import type { AwardType, DishListItem, RestaurantMapItem } from "../../../shared/types";
import { fetchDishes, fetchRestaurants, fetchTags, type DishFilters, type TagFilter } from "../api";

const PAGE_SIZE = 18;

export function useMichelinMapper() {
  const [restaurants, setRestaurants] = useState<RestaurantMapItem[]>([]);
  const [tags, setTags] = useState<TagFilter[]>([]);
  const [dishes, setDishes] = useState<DishListItem[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [awardType, setAwardType] = useState<AwardType | undefined>();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<DishFilters["sort"]>("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStaticData() {
      try {
        const [restaurantItems, tagItems] = await Promise.all([
          fetchRestaurants(controller.signal),
          fetchTags(controller.signal)
        ]);
        setRestaurants(restaurantItems);
        setTags(tagItems);
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : "Unable to load map filters.");
        }
      }
    }

    void loadStaticData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    startTransition(() => {
      setPage(1);
    });
  }, [awardType, deferredSearch, selectedTags, sort]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    async function loadDishes() {
      try {
        const response = await fetchDishes(
          {
            awardType,
            page,
            pageSize: PAGE_SIZE,
            search: deferredSearch,
            sort,
            tags: selectedTags
          },
          controller.signal
        );

        setDishes((current) => (page === 1 ? response.items : [...current, ...response.items]));
        setTotal(response.total);
        setHasMore(response.hasMore);
        setError(null);
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : "Unable to load dishes.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadDishes();
    return () => controller.abort();
  }, [awardType, deferredSearch, page, selectedTags, sort]);

  function toggleTag(slug: string) {
    startTransition(() => {
      setSelectedTags((current) =>
        current.includes(slug)
          ? current.filter((tag) => tag !== slug)
          : [...current, slug]
      );
    });
  }

  function clearFilters() {
    startTransition(() => {
      setAwardType(undefined);
      setSearch("");
      setSelectedTags([]);
      setSort("newest");
      setPage(1);
    });
  }

  return {
    awardType,
    clearFilters,
    dishes,
    error,
    hasMore,
    isLoading,
    loadMore: () => setPage((current) => current + 1),
    restaurants,
    search,
    selectedTags,
    setAwardType,
    setSearch,
    setSort,
    sort,
    tags,
    toggleTag,
    total
  };
}
