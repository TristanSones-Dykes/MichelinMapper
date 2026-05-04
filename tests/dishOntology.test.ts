import { describe, expect, it } from "vitest";
import { buildDishOntology, isPublishableDishSource } from "../worker/src/api/dishOntology";
import type { DishDetailRow } from "../worker/src/api/dishOntology";

describe("dish ontology", () => {
  it("excludes Michelin menu highlight placeholders from dish publishing", () => {
    expect(
      isPublishableDishSource({
        name: "Modern Cuisine menu highlights",
        sourceId: "michelin-pur-1187942-menu-highlights"
      })
    ).toBe(false);

    expect(
      isPublishableDishSource({
        name: "Wild turbot with yuzu beurre blanc",
        sourceId: "restaurant-menu-wild-turbot"
      })
    ).toBe(true);
  });

  it("groups dish metadata into a displayable ontology", () => {
    const row: DishDetailRow = {
      id: 12,
      source: "website-menu",
      source_id: "restaurant-menu-wild-turbot",
      source_url: "https://example.test/menu",
      name: "Wild turbot with yuzu beurre blanc",
      slug: "wild-turbot-with-yuzu-beurre-blanc",
      description: "Line-caught turbot finished with a citrus butter sauce.",
      image_url: "https://example.test/turbot.jpg",
      image_alt: "Wild turbot plated with sauce",
      image_credit: "Restaurant",
      price_text: "48 GBP",
      restaurant_id: 3,
      restaurant_name: "Example Table",
      award_type: "1-star",
      cuisine: "Modern British",
      city: "London",
      region: "England",
      country: "United Kingdom",
      tags_json: JSON.stringify([
        { id: 1, name: "Seafood", slug: "seafood", type: "gastronomic", confidence: 0.95, source: "classifier" },
        { id: 2, name: "London", slug: "london", type: "geographic", confidence: 1, source: "classifier" }
      ]),
      images_json: JSON.stringify([
        {
          id: 9,
          url: "https://example.test/turbot.jpg",
          alt: "Wild turbot plated with sauce",
          credit: "Restaurant",
          source: "website-menu",
          sourceUrl: "https://example.test/menu",
          isPrimary: 1
        }
      ])
    };

    const ontology = buildDishOntology(row);

    expect(ontology.award.label).toBe("1-star");
    expect(ontology.place.country).toBe("United Kingdom");
    expect(ontology.cuisine?.label).toBe("Modern British");
    expect(ontology.tags.gastronomic).toHaveLength(1);
    expect(ontology.tags.geographic).toHaveLength(1);
    expect(ontology.media).toHaveLength(1);
    expect(ontology.provenance.source).toBe("website-menu");
  });
});
