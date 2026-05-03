const SEED = [
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

const TAG_RULES = [
  ["Seafood", "seafood", "gastronomic", ["turbot", "oyster", "cod", "fish", "crab", "shellfish", "caviar"]],
  ["Dessert", "dessert", "gastronomic", ["souffle", "chocolate", "ice cream", "vanilla"]],
  ["French", "french", "cuisine", ["french", "beurre blanc"]],
  ["Japanese", "japanese", "cuisine", ["japanese", "miso", "yuzu", "dashi"]],
  ["Portuguese", "portuguese", "cuisine", ["portuguese", "lisbon"]]
];

const AWARDS = {
  "3-star": "3 Star",
  "2-star": "2 Star",
  "1-star": "1 Star",
  "bib-gourmand": "Bib Gourmand",
  recommended: "Recommended"
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type"
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }

    try {
      if (url.pathname === "/api/health") {
        return json({ ok: true, service: "michelinmapper-api" });
      }

      if (url.pathname === "/__scheduled" && request.method === "POST") {
        const stats = await runCrawler(env.DB);
        return json({ ok: true, stats });
      }

      if (url.pathname === "/api/restaurants") {
        return json(await getRestaurants(env.DB));
      }

      if (url.pathname === "/api/dishes") {
        return json(await getDishes(env.DB, url));
      }

      if (url.pathname === "/api/tags") {
        return json(await getTags(env.DB));
      }

      return json({ error: "Not found" }, 404);
    } catch (error) {
      console.error(JSON.stringify({ level: "error", message: error.message, stack: error.stack }));
      return json({ error: "Internal server error" }, 500);
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runCrawler(env.DB));
  }
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

async function runCrawler(db) {
  const run = await db.prepare(
    "INSERT INTO ingestion_runs (source, status) VALUES ('scheduled-crawler', 'running') RETURNING id"
  ).first();

  const stats = { restaurantsSeen: SEED.length, dishesSeen: 0, restaurantsUpserted: 0, dishesUpserted: 0 };

  try {
    for (const restaurant of SEED) {
      const restaurantId = await upsertRestaurant(db, restaurant);
      stats.restaurantsUpserted += 1;

      for (const dish of restaurant.dishes) {
        stats.dishesSeen += 1;
        const dishId = await upsertDish(db, restaurantId, restaurant.source, dish);
        stats.dishesUpserted += 1;
        await replaceTags(db, dishId, classify(restaurant, dish));
      }
    }

    await db.prepare(
      "UPDATE ingestion_runs SET status = 'success', restaurants_seen = ?, dishes_seen = ?, restaurants_upserted = ?, dishes_upserted = ?, finished_at = datetime('now') WHERE id = ?"
    ).bind(stats.restaurantsSeen, stats.dishesSeen, stats.restaurantsUpserted, stats.dishesUpserted, run.id).run();
    return stats;
  } catch (error) {
    await db.prepare(
      "UPDATE ingestion_runs SET status = 'failed', error_message = ?, finished_at = datetime('now') WHERE id = ?"
    ).bind(error.message, run.id).run();
    throw error;
  }
}

async function upsertRestaurant(db, restaurant) {
  const slug = slugify(`${restaurant.name}-${restaurant.city || restaurant.country}`);
  await db.prepare(
    `INSERT INTO restaurants (
      source, source_id, name, slug, award_type, cuisine, description, address,
      city, region, country, latitude, longitude, website_url, source_url, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(source, source_id) DO UPDATE SET
      name = excluded.name, slug = excluded.slug, award_type = excluded.award_type,
      cuisine = excluded.cuisine, description = excluded.description, address = excluded.address,
      city = excluded.city, region = excluded.region, country = excluded.country,
      latitude = excluded.latitude, longitude = excluded.longitude, website_url = excluded.website_url,
      source_url = excluded.source_url, updated_at = datetime('now')`
  ).bind(
    restaurant.source,
    restaurant.sourceId,
    restaurant.name,
    slug,
    restaurant.awardType,
    restaurant.cuisine || null,
    restaurant.description || null,
    restaurant.address || null,
    restaurant.city || null,
    restaurant.region || null,
    restaurant.country,
    restaurant.latitude,
    restaurant.longitude,
    restaurant.websiteUrl || null,
    restaurant.sourceUrl || null
  ).run();
  const row = await db.prepare("SELECT id FROM restaurants WHERE source = ? AND source_id = ?")
    .bind(restaurant.source, restaurant.sourceId).first();
  return row.id;
}

async function upsertDish(db, restaurantId, source, dish) {
  await db.prepare(
    `INSERT INTO dishes (
      restaurant_id, source, source_id, name, slug, description, image_url,
      image_alt, image_credit, source_url, price_text, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(source, source_id) DO UPDATE SET
      restaurant_id = excluded.restaurant_id, name = excluded.name, slug = excluded.slug,
      description = excluded.description, image_url = excluded.image_url,
      image_alt = excluded.image_alt, image_credit = excluded.image_credit,
      source_url = excluded.source_url, price_text = excluded.price_text,
      updated_at = datetime('now')`
  ).bind(
    restaurantId,
    source,
    dish.sourceId,
    dish.name,
    slugify(dish.name),
    dish.description || null,
    dish.imageUrl || null,
    dish.imageAlt || null,
    dish.imageCredit || null,
    dish.sourceUrl || null,
    dish.priceText || null
  ).run();
  const row = await db.prepare("SELECT id FROM dishes WHERE source = ? AND source_id = ?")
    .bind(source, dish.sourceId).first();
  return row.id;
}

async function replaceTags(db, dishId, tags) {
  await db.prepare("DELETE FROM dish_tags WHERE dish_id = ?").bind(dishId).run();

  for (const tag of tags) {
    await db.prepare(
      "INSERT INTO tags (name, slug, type) VALUES (?, ?, ?) ON CONFLICT(slug) DO UPDATE SET name = excluded.name, type = excluded.type"
    ).bind(tag.name, tag.slug, tag.type).run();
    const row = await db.prepare("SELECT id FROM tags WHERE slug = ?").bind(tag.slug).first();
    await db.prepare(
      "INSERT INTO dish_tags (dish_id, tag_id, confidence, source) VALUES (?, ?, ?, 'classifier') ON CONFLICT(dish_id, tag_id) DO UPDATE SET confidence = excluded.confidence"
    ).bind(dishId, row.id, tag.confidence).run();
  }
}

function classify(restaurant, dish) {
  const text = `${restaurant.cuisine || ""} ${restaurant.city || ""} ${restaurant.country || ""} ${dish.name} ${dish.description || ""}`.toLowerCase();
  const tags = [
    { name: AWARDS[restaurant.awardType], slug: restaurant.awardType, type: "award", confidence: 1 },
    { name: restaurant.country, slug: slugify(restaurant.country), type: "geographic", confidence: 1 }
  ];

  if (restaurant.city) {
    tags.push({ name: restaurant.city, slug: slugify(restaurant.city), type: "geographic", confidence: 1 });
  }

  for (const [name, slug, type, keywords] of TAG_RULES) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      tags.push({ name, slug, type, confidence: 0.86 });
    }
  }

  return dedupe(tags);
}

function dedupe(tags) {
  const seen = new Set();
  return tags.filter((tag) => {
    if (seen.has(tag.slug)) return false;
    seen.add(tag.slug);
    return true;
  });
}

async function getRestaurants(db) {
  const { results } = await db.prepare(
    `SELECT r.id, r.name, r.slug, r.award_type, r.cuisine, r.city, r.country, r.latitude, r.longitude,
      (SELECT json_group_array(json_object('id', id, 'name', name, 'imageUrl', image_url))
       FROM (SELECT d.id, d.name, d.image_url FROM dishes d WHERE d.restaurant_id = r.id ORDER BY d.created_at DESC LIMIT 3)) AS preview_dishes
     FROM restaurants r
     ORDER BY CASE r.award_type WHEN '3-star' THEN 1 WHEN '2-star' THEN 2 WHEN '1-star' THEN 3 WHEN 'bib-gourmand' THEN 4 ELSE 5 END, r.name`
  ).all();

  return {
    items: results.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      awardType: row.award_type,
      cuisine: row.cuisine,
      city: row.city,
      country: row.country,
      latitude: row.latitude,
      longitude: row.longitude,
      previewDishes: parseJson(row.preview_dishes)
    }))
  };
}

async function getDishes(db, url) {
  const page = clamp(Number(url.searchParams.get("page") || "1"), 1, 1000);
  const pageSize = clamp(Number(url.searchParams.get("pageSize") || "12"), 1, 48);
  const search = (url.searchParams.get("q") || url.searchParams.get("search") || "").trim().toLowerCase();
  const awardType = url.searchParams.get("awardType") || "";
  const sort = url.searchParams.get("sort") || "newest";
  const tags = url.searchParams.getAll("tag").concat((url.searchParams.get("tags") || "").split(",")).map((tag) => tag.trim()).filter(Boolean);
  const where = [];
  const params = [];

  if (awardType) {
    where.push("r.award_type = ?");
    params.push(awardType);
  }

  if (search) {
    where.push("(d.search_text LIKE ? OR lower(r.name) LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (tags.length > 0) {
    where.push(`d.id IN (
      SELECT dt.dish_id FROM dish_tags dt JOIN tags t ON t.id = dt.tag_id
      WHERE t.slug IN (${tags.map(() => "?").join(",")})
      GROUP BY dt.dish_id HAVING COUNT(DISTINCT t.slug) = ?
    )`);
    params.push(...tags, tags.length);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderSql = sort === "name" ? "ORDER BY d.name COLLATE NOCASE" :
    sort === "award" ? "ORDER BY CASE r.award_type WHEN '3-star' THEN 1 WHEN '2-star' THEN 2 WHEN '1-star' THEN 3 WHEN 'bib-gourmand' THEN 4 ELSE 5 END, d.name" :
    "ORDER BY d.created_at DESC, d.id DESC";

  const count = await db.prepare(`SELECT COUNT(*) AS total FROM dishes d JOIN restaurants r ON r.id = d.restaurant_id ${whereSql}`)
    .bind(...params).first();
  const { results } = await db.prepare(
    `SELECT d.id, d.name, d.slug, d.description, d.image_url, d.image_alt, d.price_text,
      r.id AS restaurant_id, r.name AS restaurant_name, r.award_type, r.city, r.country,
      (SELECT json_group_array(json_object('id', t.id, 'name', t.name, 'slug', t.slug, 'type', t.type))
       FROM dish_tags dt JOIN tags t ON t.id = dt.tag_id WHERE dt.dish_id = d.id ORDER BY t.type, t.name) AS tags_json
     FROM dishes d JOIN restaurants r ON r.id = d.restaurant_id
     ${whereSql} ${orderSql} LIMIT ? OFFSET ?`
  ).bind(...params, pageSize, (page - 1) * pageSize).all();

  return {
    items: results.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      imageUrl: row.image_url,
      imageAlt: row.image_alt,
      priceText: row.price_text,
      restaurant: {
        id: row.restaurant_id,
        name: row.restaurant_name,
        awardType: row.award_type,
        city: row.city,
        country: row.country
      },
      tags: parseJson(row.tags_json)
    })),
    page,
    pageSize,
    total: count.total,
    hasMore: (page - 1) * pageSize + results.length < count.total
  };
}

async function getTags(db) {
  const { results } = await db.prepare(
    `SELECT t.id, t.name, t.slug, t.type, COUNT(dt.dish_id) AS dish_count
     FROM tags t LEFT JOIN dish_tags dt ON dt.tag_id = t.id
     GROUP BY t.id ORDER BY t.type, t.name`
  ).all();
  return { items: results.map((row) => ({ id: row.id, name: row.name, slug: row.slug, type: row.type, dishCount: row.dish_count })) };
}

function parseJson(value) {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function slugify(input) {
  return input.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
