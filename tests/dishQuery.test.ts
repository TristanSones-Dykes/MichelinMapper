import { describe, expect, it } from "vitest";
import { parseDishQuery } from "../worker/src/api/dishQuery";

describe("parseDishQuery", () => {
  it("normalizes pagination and filters from URL search params", () => {
    const query = parseDishQuery(
      new URL("https://example.test/api/dishes?page=2&pageSize=24&tag=seafood&tag=paris&awardType=3-star&q=turbot&sort=restaurant")
    );

    expect(query).toEqual({
      awardType: "3-star",
      limit: 24,
      offset: 24,
      search: "turbot",
      sort: "restaurant",
      tags: ["seafood", "paris"]
    });
  });

  it("clamps invalid pagination and falls back to newest sorting", () => {
    const query = parseDishQuery(
      new URL("https://example.test/api/dishes?page=-4&pageSize=999&sort=bad")
    );

    expect(query.limit).toBe(50);
    expect(query.offset).toBe(0);
    expect(query.sort).toBe("newest");
  });
});
