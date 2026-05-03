import type { RawRestaurantInput } from "../../../shared/types";

export interface IngestionSource {
  name: string;
  fetchRestaurants(): Promise<RawRestaurantInput[]>;
}
