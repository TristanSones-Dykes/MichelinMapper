import { Hono } from "hono";
import { cors } from "hono/cors";
import type { DishListItem, RestaurantMapItem } from "../../../shared/types";
import { runCrawler } from "../crawler";
import type { Env } from "../env";
import { parseDishQuery } from "./dishQuery";

type HonoEnv = {
  Bindings: Env;
};

interface RestaurantRow {
  id: number;
  name: string;
  slug: string;
  award_type: RestaurantMapItem["awardType"];
  cuisine: string | null;
  city: string | null;
  country: string;
  latitude: number;
  longitude: number;
  external_links: string | null;
  preview_dishes: string | null;
}

interface DishRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  price_text: string | null;
  restaurant_id: number;
  restaurant_name: string;
  award_type: DishListItem["restaurant"]["awardType"];
  city: string | null;
  country: string;
  tags_json: string | null;
}

interface CountRow {
  total: number;
}

interface TagRow {
  id: number;
  name: string;
  slug: string;
  type: string;
  dish_count: number;
}

export const app = new Hono<HonoEnv>();

app.use(
  "/api/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"]
  })
);

app.get("/api/health", (c) =>
  c.json({
    ok: true,
    service: "michelinmapper-api"
  })
);

app.post("/api/crawl", async (c) => {
  if (c.env.APP_ENV === "production" && !hasCrawlerAdminAccess(c)) {
    return c.json({ error: "Manual crawl is disabled in production." }, 403);
  }

  if (c.env.APP_ENV === "production") {
    c.executionCtx.waitUntil(runCrawler(c.env));
    return c.json({ ok: true, queued: true });
  }

  const stats = await runCrawler(c.env);
  return c.json({ ok: true, stats });
});

app.get("/api/restaurants", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT
      r.id,
      r.name,
      r.slug,
      r.award_type,
      r.cuisine,
      r.city,
      r.country,
      r.latitude,
      r.longitude,
      (
        SELECT json_group_array(
          json_object('id', id, 'source', source, 'label', label, 'url', url, 'handle', handle)
        )
        FROM (
          SELECT l.id, l.source, l.label, l.url, l.handle
          FROM restaurant_external_links l
          WHERE l.restaurant_id = r.id
          ORDER BY
            CASE l.source
              WHEN 'website' THEN 1
              WHEN 'google_maps' THEN 2
              WHEN 'instagram' THEN 3
              WHEN 'tiktok' THEN 4
              ELSE 5
            END,
            l.label
        )
      ) AS external_links,
      (
        SELECT json_group_array(
          json_object('id', id, 'name', name, 'imageUrl', image_url)
        )
        FROM (
          SELECT d.id, d.name, d.image_url
          FROM dishes d
          WHERE d.restaurant_id = r.id
          ORDER BY d.created_at DESC
          LIMIT 3
        )
      ) AS preview_dishes
    FROM restaurants r
    ORDER BY
      CASE r.award_type
        WHEN '3-star' THEN 1
        WHEN '2-star' THEN 2
        WHEN '1-star' THEN 3
        WHEN 'bib-gourmand' THEN 4
        ELSE 5
      END,
      r.name`
  ).all<RestaurantRow>();

  return c.json({
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
      externalLinks: parseJsonArray<RestaurantMapItem["externalLinks"][number]>(
        row.external_links
      ),
      previewDishes: parseJsonArray<RestaurantMapItem["previewDishes"][number]>(
        row.preview_dishes
      )
    }))
  });
});

app.get("/api/dishes", async (c) => {
  const query = parseDishQuery(new URL(c.req.url));
  const where: string[] = [];
  const params: Array<number | string> = [];

  if (query.awardType) {
    where.push("r.award_type = ?");
    params.push(query.awardType);
  }

  if (query.search) {
    where.push("(d.search_text LIKE ? OR lower(r.name) LIKE ?)");
    params.push(`%${query.search.toLowerCase()}%`, `%${query.search.toLowerCase()}%`);
  }

  if (query.tags.length > 0) {
    where.push(
      `d.id IN (
        SELECT dt.dish_id
        FROM dish_tags dt
        JOIN tags t ON t.id = dt.tag_id
        WHERE t.slug IN (${query.tags.map(() => "?").join(", ")})
        GROUP BY dt.dish_id
        HAVING COUNT(DISTINCT t.slug) = ?
      )`
    );
    params.push(...query.tags, query.tags.length);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const orderSql = getOrderSql(query.sort);

  const countRow = await c.env.DB.prepare(
    `SELECT COUNT(*) AS total
    FROM dishes d
    JOIN restaurants r ON r.id = d.restaurant_id
    ${whereSql}`
  )
    .bind(...params)
    .first<CountRow>();

  const { results } = await c.env.DB.prepare(
    `SELECT
      d.id,
      d.name,
      d.slug,
      d.description,
      d.image_url,
      d.image_alt,
      d.price_text,
      r.id AS restaurant_id,
      r.name AS restaurant_name,
      r.award_type,
      r.city,
      r.country,
      (
        SELECT json_group_array(
          json_object('id', t.id, 'name', t.name, 'slug', t.slug, 'type', t.type)
        )
        FROM dish_tags dt
        JOIN tags t ON t.id = dt.tag_id
        WHERE dt.dish_id = d.id
        ORDER BY t.type, t.name
      ) AS tags_json
    FROM dishes d
    JOIN restaurants r ON r.id = d.restaurant_id
    ${whereSql}
    ${orderSql}
    LIMIT ? OFFSET ?`
  )
    .bind(...params, query.limit, query.offset)
    .all<DishRow>();

  const total = countRow?.total ?? 0;
  return c.json({
    items: results.map(mapDishRow),
    pageSize: query.limit,
    total,
    hasMore: query.offset + results.length < total
  });
});

app.get("/api/tags", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT
      t.id,
      t.name,
      t.slug,
      t.type,
      COUNT(dt.dish_id) AS dish_count
    FROM tags t
    LEFT JOIN dish_tags dt ON dt.tag_id = t.id
    GROUP BY t.id
    ORDER BY t.type, t.name`
  ).all<TagRow>();

  return c.json({
    items: results.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      type: row.type,
      dishCount: row.dish_count
    }))
  });
});

function getOrderSql(sort: string): string {
  switch (sort) {
    case "name":
      return "ORDER BY d.name COLLATE NOCASE ASC";
    case "restaurant":
      return "ORDER BY r.name COLLATE NOCASE ASC, d.name COLLATE NOCASE ASC";
    default:
      return "ORDER BY d.created_at DESC, d.id DESC";
  }
}

function hasCrawlerAdminAccess(c: { env: Env; req: { header(name: string): string | undefined } }): boolean {
  const token = c.env.CRAWLER_ADMIN_TOKEN;
  const authorization = c.req.header("authorization");
  return Boolean(token && authorization === `Bearer ${token}`);
}

function mapDishRow(row: DishRow): DishListItem {
  return {
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
    tags: parseJsonArray<DishListItem["tags"][number]>(row.tags_json)
  };
}

function parseJsonArray<T>(value: string | null): T[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
