import { describe, expect, it } from "vitest";
import { classifyDish } from "../shared/classifier";

describe("classifyDish", () => {
  it("assigns award, geographic, cuisine, and gastronomic tags from dish and restaurant text", () => {
    const tags = classifyDish({
      awardType: "3-star",
      city: "Paris",
      country: "France",
      cuisine: "French",
      dishName: "Turbot with caviar beurre blanc",
      description: "Line-caught turbot finished with oyster, caviar, and beurre blanc."
    });

    expect(tags.map((tag) => tag.slug)).toEqual(
      expect.arrayContaining([
        "3-star",
        "paris",
        "france",
        "french",
        "seafood",
        "luxury"
      ])
    );
  });

  it("deduplicates tags when multiple keywords match the same category", () => {
    const tags = classifyDish({
      awardType: "bib-gourmand",
      city: "Tokyo",
      country: "Japan",
      cuisine: "Japanese",
      dishName: "Yuzu miso cod",
      description: "Miso-marinated cod with yuzu and dashi."
    });

    expect(tags.filter((tag) => tag.slug === "japanese")).toHaveLength(1);
    expect(tags.map((tag) => tag.slug)).toEqual(
      expect.arrayContaining(["bib-gourmand", "tokyo", "japan", "seafood"])
    );
  });
});
