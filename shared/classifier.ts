import type { AwardType, ClassifiedTag, TagType } from "./types";
import { slugify } from "./slug";

interface ClassifyDishInput {
  awardType: AwardType;
  city?: string;
  country: string;
  cuisine?: string;
  dishName: string;
  description?: string;
}

const GASTRONOMIC_RULES: Array<{
  name: string;
  type: TagType;
  keywords: string[];
}> = [
  {
    name: "Seafood",
    type: "gastronomic",
    keywords: ["oyster", "scallop", "lobster", "crab", "cod", "turbot", "sea bass", "caviar"]
  },
  {
    name: "Meat",
    type: "gastronomic",
    keywords: ["wagyu", "beef", "lamb", "pork", "duck", "venison", "veal"]
  },
  {
    name: "Dessert",
    type: "gastronomic",
    keywords: ["chocolate", "souffle", "soufflé", "tart", "ice cream", "sorbet", "millefeuille"]
  },
  {
    name: "Japanese",
    type: "cuisine",
    keywords: ["yuzu", "miso", "dashi", "sushi", "sashimi", "ramen", "tempura"]
  },
  {
    name: "French",
    type: "cuisine",
    keywords: ["foie gras", "beurre blanc", "confit", "terrine", "veloute", "velouté"]
  },
  {
    name: "Luxury",
    type: "gastronomic",
    keywords: ["truffle", "caviar", "wagyu", "uni", "foie gras"]
  },
  {
    name: "Vegetarian",
    type: "dietary",
    keywords: ["vegetarian", "courgette", "aubergine", "mushroom", "asparagus"]
  }
];

export function classifyDish(input: ClassifyDishInput): ClassifiedTag[] {
  const tags = new Map<string, ClassifiedTag>();

  addTag(tags, input.awardType, "award", 1);
  addTag(tags, input.country, "geographic", 1);

  if (input.city) {
    addTag(tags, input.city, "geographic", 1);
  }

  if (input.cuisine) {
    addTag(tags, input.cuisine, "cuisine", 0.95);
  }

  const text = normalizeText(`${input.dishName} ${input.description ?? ""} ${input.cuisine ?? ""}`);
  for (const rule of GASTRONOMIC_RULES) {
    if (rule.keywords.some((keyword) => text.includes(normalizeText(keyword)))) {
      addTag(tags, rule.name, rule.type, 0.9);
    }
  }

  return Array.from(tags.values()).sort((a, b) => a.slug.localeCompare(b.slug));
}

function addTag(
  tags: Map<string, ClassifiedTag>,
  name: string,
  type: TagType,
  confidence: number
): void {
  const slug = slugify(name);
  if (!slug || tags.has(slug)) {
    return;
  }

  tags.set(slug, {
    name,
    slug,
    type,
    confidence
  });
}

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
