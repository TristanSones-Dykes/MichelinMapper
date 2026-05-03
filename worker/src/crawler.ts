import { classifyDish } from "../../shared/classifier";
import { slugify } from "../../shared/slug";
import type { ClassifiedTag, RawRestaurantInput } from "../../shared/types";
import type { Env } from "./env";
import { MOCK_RESTAURANTS } from "./mockData";

interface IngestionStats {
  restaurantsSeen: number;
  dishesSeen: number;
  restaurantsUpserted: number;
  dishesUpserted: number;
}

interface IdRow {
  id: number;
}

export async function runCrawler(env: Env): Promise<IngestionStats> {
  const runId = await createIngestionRun(env, "scheduled-crawler");
  const stats: IngestionStats = {
    restaurantsSeen: 0,
    dishesSeen: 0,
    restaurantsUpserted: 0,
    dishesUpserted: 0
  };

  try {
    const restaurants = await fetchRestaurants(env.CRAWLER_SOURCE_URL);
    stats.restaurantsSeen = restaurants.length;
    stats.dishesSeen = restaurants.reduce((total, restaurant) => total + restaurant.dishes.length, 0);

    for (const restaurant of restaurants) {
      const restaurantId = await upsertRestaurant(env, restaurant);
      stats.restaurantsUpserted += 1;

      for (const dish of restaurant.dishes) {
        const dishId = await upsertDish(env, restaurantId, restaurant.source, dish);
        stats.dishesUpserted += 1;

        const tags = classifyDish({
          awardType: restaurant.awardType,
          city: restaurant.city,
          country: restaurant.country,
          cuisine: restaurant.cuisine,
          dishName: dish.name,
          description: dish.description
        });

        await replaceDishTags(env, dishId, tags);
      }
    }

    await finishIngestionRun(env, runId, "success", stats);
    return stats;
  } catch (error) {
    await failIngestionRun(env, runId, error);
    throw error;
  }
}

async function fetchRestaurants(sourceUrl: string): Promise<RawRestaurantInput[]> {
  if (!sourceUrl || sourceUrl.includes("example.com")) {
    return MOCK_RESTAURANTS;
  }

  const response = await fetch(sourceUrl, {
    headers: {
      accept: "application/json",
      "user-agent": "MichelinMapper/0.1 (+https://example.com)"
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

async function upsertRestaurant(env: Env, restaurant: RawRestaurantInput): Promise<number> {
  const slug = slugify(`${restaurant.name}-${restaurant.city ?? restaurant.country}`);

  await env.DB.prepare(
    `INSERT INTO restaurants (
      source, source_id, name, slug, award_type, cuisine, description, address,
      city, region, country, latitude, longitude, website_url, source_url, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(source, source_id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      award_type = excluded.award_type,
      cuisine = excluded.cuisine,
      description = excluded.description,
      address = excluded.address,
      city = excluded.city,
      region = excluded.region,
      country = excluded.country,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      website_url = excluded.website_url,
      source_url = excluded.source_url,
      updated_at = datetime('now')`
  )
    .bind(
      restaurant.source,
      restaurant.sourceId,
      restaurant.name,
      slug,
      restaurant.awardType,
      restaurant.cuisine ?? null,
      restaurant.description ?? null,
      restaurant.address ?? null,
      restaurant.city ?? null,
      restaurant.region ?? null,
      restaurant.country,
      restaurant.latitude,
      restaurant.longitude,
      restaurant.websiteUrl ?? null,
      restaurant.sourceUrl ?? null
    )
    .run();

  const row = await env.DB.prepare(
    "SELECT id FROM restaurants WHERE source = ? AND source_id = ?"
  )
    .bind(restaurant.source, restaurant.sourceId)
    .first<IdRow>();

  if (!row) {
    throw new Error(`Restaurant upsert failed for ${restaurant.source}:${restaurant.sourceId}`);
  }

  return row.id;
}

async function upsertDish(
  env: Env,
  restaurantId: number,
  source: string,
  dish: RawRestaurantInput["dishes"][number]
): Promise<number> {
  const slug = slugify(dish.name);

  await env.DB.prepare(
    `INSERT INTO dishes (
      restaurant_id, source, source_id, name, slug, description, image_url,
      image_alt, image_credit, source_url, price_text, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(source, source_id) DO UPDATE SET
      restaurant_id = excluded.restaurant_id,
      name = excluded.name,
      slug = excluded.slug,
      description = excluded.description,
      image_url = excluded.image_url,
      image_alt = excluded.image_alt,
      image_credit = excluded.image_credit,
      source_url = excluded.source_url,
      price_text = excluded.price_text,
      updated_at = datetime('now')`
  )
    .bind(
      restaurantId,
      source,
      dish.sourceId,
      dish.name,
      slug,
      dish.description ?? null,
      dish.imageUrl ?? null,
      dish.imageAlt ?? null,
      dish.imageCredit ?? null,
      dish.sourceUrl ?? null,
      dish.priceText ?? null
    )
    .run();

  const row = await env.DB.prepare("SELECT id FROM dishes WHERE source = ? AND source_id = ?")
    .bind(source, dish.sourceId)
    .first<IdRow>();

  if (!row) {
    throw new Error(`Dish upsert failed for ${source}:${dish.sourceId}`);
  }

  return row.id;
}

async function replaceDishTags(
  env: Env,
  dishId: number,
  tags: ClassifiedTag[]
): Promise<void> {
  await env.DB.prepare("DELETE FROM dish_tags WHERE dish_id = ?").bind(dishId).run();

  for (const tag of tags) {
    await env.DB.prepare(
      `INSERT INTO tags (name, slug, type)
      VALUES (?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        name = excluded.name,
        type = excluded.type`
    )
      .bind(tag.name, tag.slug, tag.type)
      .run();

    const row = await env.DB.prepare("SELECT id FROM tags WHERE slug = ?")
      .bind(tag.slug)
      .first<IdRow>();

    if (!row) {
      throw new Error(`Tag upsert failed for ${tag.slug}`);
    }

    await env.DB.prepare(
      `INSERT INTO dish_tags (dish_id, tag_id, confidence, source)
      VALUES (?, ?, ?, 'classifier')
      ON CONFLICT(dish_id, tag_id) DO UPDATE SET
        confidence = excluded.confidence,
        source = excluded.source`
    )
      .bind(dishId, row.id, tag.confidence)
      .run();
  }
}

async function createIngestionRun(env: Env, source: string): Promise<number> {
  const result = await env.DB.prepare(
    "INSERT INTO ingestion_runs (source, status) VALUES (?, 'running')"
  )
    .bind(source)
    .run();

  const runId = result.meta.last_row_id;
  if (typeof runId !== "number") {
    throw new Error("Failed to create ingestion run");
  }

  return runId;
}

async function finishIngestionRun(
  env: Env,
  runId: number,
  status: "success",
  stats: IngestionStats
): Promise<void> {
  await env.DB.prepare(
    `UPDATE ingestion_runs
    SET status = ?,
      restaurants_seen = ?,
      dishes_seen = ?,
      restaurants_upserted = ?,
      dishes_upserted = ?,
      finished_at = datetime('now')
    WHERE id = ?`
  )
    .bind(
      status,
      stats.restaurantsSeen,
      stats.dishesSeen,
      stats.restaurantsUpserted,
      stats.dishesUpserted,
      runId
    )
    .run();
}

async function failIngestionRun(env: Env, runId: number, error: unknown): Promise<void> {
  await env.DB.prepare(
    `UPDATE ingestion_runs
    SET status = 'failed',
      error_message = ?,
      finished_at = datetime('now')
    WHERE id = ?`
  )
    .bind(error instanceof Error ? error.message : "Unknown crawler failure", runId)
    .run();
}
