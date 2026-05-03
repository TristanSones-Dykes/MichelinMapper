import type { RawRestaurantInput } from "../../shared/types";

export const MOCK_RESTAURANTS: RawRestaurantInput[] = [
  {
    source: "mock",
    sourceId: "le-jardin-paris",
    name: "Le Jardin Lumiere",
    awardType: "3-star",
    cuisine: "French",
    description: "A precise Paris dining room focused on seafood and classic sauces.",
    address: "12 Rue Imaginaire",
    city: "Paris",
    country: "France",
    latitude: 48.8566,
    longitude: 2.3522,
    websiteUrl: "https://example.com/le-jardin-lumiere",
    sourceUrl: "https://example.com/michelinmapper-seed.json",
    dishes: [
      {
        sourceId: "le-jardin-turbot-caviar",
        name: "Turbot with caviar beurre blanc",
        description: "Line-caught turbot finished with oyster, caviar, and beurre blanc.",
        imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Plated fish dish with sauce",
        imageCredit: "Unsplash",
        sourceUrl: "https://example.com/le-jardin-lumiere/turbot",
        priceText: "Tasting menu"
      },
      {
        sourceId: "le-jardin-chocolate-souffle",
        name: "Dark chocolate souffle",
        description: "Warm chocolate souffle with vanilla ice cream.",
        imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Chocolate dessert",
        imageCredit: "Unsplash",
        sourceUrl: "https://example.com/le-jardin-lumiere/souffle"
      }
    ]
  },
  {
    source: "mock",
    sourceId: "kumo-tokyo",
    name: "Kumo",
    awardType: "1-star",
    cuisine: "Japanese",
    description: "Counter dining in Tokyo with seasonal fish and dashi-led broths.",
    city: "Tokyo",
    country: "Japan",
    latitude: 35.6762,
    longitude: 139.6503,
    websiteUrl: "https://example.com/kumo",
    sourceUrl: "https://example.com/michelinmapper-seed.json",
    dishes: [
      {
        sourceId: "kumo-yuzu-miso-cod",
        name: "Yuzu miso cod",
        description: "Miso-marinated cod with yuzu and dashi.",
        imageUrl: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Japanese fish course",
        imageCredit: "Unsplash",
        sourceUrl: "https://example.com/kumo/yuzu-miso-cod"
      }
    ]
  },
  {
    source: "mock",
    sourceId: "mesa-clara-lisbon",
    name: "Mesa Clara",
    awardType: "bib-gourmand",
    cuisine: "Portuguese",
    description: "Relaxed Lisbon cooking with generous seafood plates.",
    city: "Lisbon",
    country: "Portugal",
    latitude: 38.7223,
    longitude: -9.1393,
    websiteUrl: "https://example.com/mesa-clara",
    sourceUrl: "https://example.com/michelinmapper-seed.json",
    dishes: [
      {
        sourceId: "mesa-clara-crab-rice",
        name: "Atlantic crab rice",
        description: "Clay-pot rice with crab, herbs, and shellfish stock.",
        imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Seafood rice dish",
        imageCredit: "Unsplash",
        sourceUrl: "https://example.com/mesa-clara/crab-rice"
      }
    ]
  }
];
