import { classifyDish } from "../../shared/classifier";
import { buildRestaurantSlug } from "../../shared/restaurantSlug";
import { slugify } from "../../shared/slug";
import type { ClassifiedTag, RawRestaurantInput } from "../../shared/types";
import type { Env } from "./env";
import { createSeedSource } from "./sources/seed";
import type { IngestionSource } from "./sources/types";
import { extractWebsiteMenuDishes } from "./sources/websiteMenu";
import { createWikidataSource } from "./sources/wikidata";

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
    let websiteMenuAttempts = 0;
    const websiteMenuLimit = Number.parseInt(env.WEBSITE_MENU_LIMIT ?? "6", 10);

    for (const source of getSources(env)) {
      const restaurants = await source.fetchRestaurants();
      stats.restaurantsSeen += restaurants.length;

      for (const restaurant of restaurants) {
        const enrichedRestaurant = { ...restaurant };

        if (
          shouldExtractWebsiteMenus(env) &&
          enrichedRestaurant.dishes.length === 0 &&
          enrichedRestaurant.websiteUrl &&
          websiteMenuAttempts < websiteMenuLimit
        ) {
          websiteMenuAttempts += 1;
          enrichedRestaurant.dishes = await safeExtractWebsiteMenuDishes(enrichedRestaurant);
        }

        stats.dishesSeen += enrichedRestaurant.dishes.length;

        const restaurantId = await upsertRestaurant(env, enrichedRestaurant);
        stats.restaurantsUpserted += 1;
        await replaceExternalLinks(env, restaurantId, getExternalLinks(enrichedRestaurant));

        for (const dish of enrichedRestaurant.dishes) {
          const dishId = await upsertDish(env, restaurantId, enrichedRestaurant.source, dish);
          stats.dishesUpserted += 1;

          const tags = classifyDish({
            awardType: enrichedRestaurant.awardType,
            city: enrichedRestaurant.city,
            country: enrichedRestaurant.country,
            cuisine: enrichedRestaurant.cuisine,
            dishName: dish.name,
            description: dish.description
          });

          await replaceDishTags(env, dishId, tags);
        }
      }
    }

    await finishIngestionRun(env, runId, "success", stats);
    return stats;
  } catch (error) {
    await failIngestionRun(env, runId, error);
    throw error;
  }
}

async function safeExtractWebsiteMenuDishes(restaurant: RawRestaurantInput): Promise<RawRestaurantInput["dishes"]> {
  try {
    return await extractWebsiteMenuDishes(restaurant);
  } catch (error) {
    console.warn(
      JSON.stringify({
        level: "warn",
        source: "website-menu",
        restaurant: restaurant.name,
        message: error instanceof Error ? error.message : "Unknown menu extraction error"
      })
    );
    return [];
  }
}

function shouldExtractWebsiteMenus(env: Env): boolean {
  return env.ENABLE_WEBSITE_MENU_SOURCE === "true";
}

function getSources(env: Env): IngestionSource[] {
  const sources: IngestionSource[] = [createSeedSource(env.CRAWLER_SOURCE_URL)];

  if (env.ENABLE_WIKIDATA_SOURCE !== "false") {
    sources.push(createWikidataSource(Number.parseInt(env.WIKIDATA_LIMIT ?? "80", 10)));
  }

  return sources;
}

async function upsertRestaurant(env: Env, restaurant: RawRestaurantInput): Promise<number> {
  const slug = buildRestaurantSlug(restaurant);

  const row = await env.DB.prepare(
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
      updated_at = datetime('now')
    RETURNING id`
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
    .first<IdRow>();

  if (!row) {
    throw new Error(`Restaurant upsert failed for ${restaurant.source}:${restaurant.sourceId}`);
  }

  return row.id;
}

async function replaceExternalLinks(
  env: Env,
  restaurantId: number,
  links: NonNullable<RawRestaurantInput["externalLinks"]>
): Promise<void> {
  await env.DB.prepare("DELETE FROM restaurant_external_links WHERE restaurant_id = ?")
    .bind(restaurantId)
    .run();

  if (links.length === 0) {
    return;
  }

  await env.DB.batch(
    links.map((link) =>
      env.DB.prepare(
      `INSERT INTO restaurant_external_links (
        restaurant_id, source, label, url, handle, updated_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(restaurant_id, source, url) DO UPDATE SET
        label = excluded.label,
        handle = excluded.handle,
        updated_at = datetime('now')`
      ).bind(restaurantId, link.source, link.label, link.url, link.handle ?? null)
    )
  );
}

function getExternalLinks(restaurant: RawRestaurantInput): NonNullable<RawRestaurantInput["externalLinks"]> {
  const links = restaurant.externalLinks ? [...restaurant.externalLinks] : [];

  if (restaurant.websiteUrl) {
    links.push({ source: "website", label: "Website", url: restaurant.websiteUrl });
  }

  if (restaurant.sourceUrl) {
    links.push({ source: "other", label: "Source", url: restaurant.sourceUrl });
  }

  links.push(
    {
      source: "google_maps",
      label: "Google Maps",
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${restaurant.name} ${restaurant.city ?? ""} ${restaurant.country}`
      )}`
    },
    {
      source: "tiktok",
      label: "TikTok Search",
      url: `https://www.tiktok.com/search?q=${encodeURIComponent(`${restaurant.name} restaurant`)}`
    }
  );

  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.source}:${link.url}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function upsertDish(
  env: Env,
  restaurantId: number,
  source: string,
  dish: RawRestaurantInput["dishes"][number]
): Promise<number> {
  const slug = slugify(dish.name);

  const row = await env.DB.prepare(
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
      updated_at = datetime('now')
    RETURNING id`
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
    const row = await env.DB.prepare(
      `INSERT INTO tags (name, slug, type)
      VALUES (?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        name = excluded.name,
        type = excluded.type
      RETURNING id`
    )
      .bind(tag.name, tag.slug, tag.type)
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
