import type { RawRestaurantInput } from "../../../shared/types";
import { MOCK_RESTAURANTS } from "../mockData";
import type { IngestionSource } from "./types";

export function createSeedSource(sourceUrl: string): IngestionSource {
  return {
    name: "seed-json",
    async fetchRestaurants() {
      if (!sourceUrl || sourceUrl.includes("example.com")) {
        return MOCK_RESTAURANTS;
      }

      const response = await fetch(sourceUrl, {
        headers: {
          accept: "application/json",
          "user-agent": "MichelinMapper/0.2 (+https://michelinmapper.pages.dev)"
        }
      });

      if (!response.ok) {
        throw new Error(`Crawler source returned ${response.status}`);
      }

      const payload = (await response.json()) as unknown;
      if (!Array.isArray(payload)) {
        throw new Error("Crawler source must return an array of restaurants");
      }

      return payload as RawRestaurantInput[];
    }
  };
}
