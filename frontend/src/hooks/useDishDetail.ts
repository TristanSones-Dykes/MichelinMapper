import { useEffect, useState } from "react";
import type { DishDetailItem } from "../../../shared/types";
import { fetchDish } from "../api";

export function useDishDetail(id: number | null) {
  const [dish, setDish] = useState<DishDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setDish(null);
      setIsLoading(false);
      setError("Invalid dish page.");
      return;
    }

    const dishId = id;
    const controller = new AbortController();
    setIsLoading(true);

    async function loadDish() {
      try {
        const item = await fetchDish(dishId, controller.signal);
        setDish(item);
        setError(null);
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : "Unable to load dish.");
          setDish(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadDish();
    return () => controller.abort();
  }, [id]);

  return { dish, error, isLoading };
}
