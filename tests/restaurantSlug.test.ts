import { describe, expect, it } from "vitest";
import { buildRestaurantSlug } from "../shared/restaurantSlug";

describe("buildRestaurantSlug", () => {
  it("keeps same-name same-city records unique by source id", () => {
    expect(
      buildRestaurantSlug({
        name: "Hertog Jan",
        city: "Bruges",
        country: "Belgium",
        sourceId: "Q123"
      })
    ).not.toBe(
      buildRestaurantSlug({
        name: "Hertog Jan",
        city: "Bruges",
        country: "Belgium",
        sourceId: "Q456"
      })
    );
  });
});
