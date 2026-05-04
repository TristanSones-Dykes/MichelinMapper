# MichelinMapper Deployment Guide

This project is designed for Cloudflare's free tier:

- Cloudflare Pages Functions for the Hono API.
- Cloudflare Workers for the scheduled crawler trigger and compatibility proxy.
- Cloudflare D1 for SQLite storage.
- Cloudflare Pages for the React/Vite frontend.
- OpenStreetMap tiles through Leaflet. Keep the attribution visible and do not bulk download tiles.

## 1. Install And Authenticate Wrangler

```bash
npm install
npx wrangler login
npx wrangler whoami
```

## 2. Create The D1 Database

```bash
npx wrangler d1 create michelinmapper
```

Wrangler prints a `database_id`. Replace the placeholder in `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "michelinmapper",
    "database_id": "your-real-database-id"
  }
]
```

## 3. Apply The Schema

For local development:

```bash
npm run db:migrate:local
```

For the remote Cloudflare D1 database:

```bash
npm run db:migrate:remote
```

## 4. Configure The Crawler Sources

The app uses bundled curated data when `CRAWLER_SOURCE_URL` is left as the example URL. It can also ingest Michelin-starred restaurant metadata from Wikidata.

To use a real permitted JSON source, update `wrangler.jsonc` or the matching Pages environment variables:

```jsonc
"vars": {
  "APP_ENV": "production",
  "CRAWLER_SOURCE_URL": "https://your-permitted-source.example/restaurants.json",
  "ENABLE_WIKIDATA_SOURCE": "true",
  "WIKIDATA_LIMIT": "80",
  "ENABLE_WEBSITE_MENU_SOURCE": "false",
  "WEBSITE_MENU_LIMIT": "0"
}
```

Expected source shape:

```json
[
  {
    "source": "community-dataset",
    "sourceId": "restaurant-123",
    "name": "Restaurant Name",
    "awardType": "1-star",
    "cuisine": "French",
    "city": "Paris",
    "country": "France",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "sourceNotes": [
      {
        "sourceId": "restaurant-123-profile",
        "title": "MICHELIN source profile",
        "body": "Restaurant-level review or profile text.",
        "imageUrl": "https://example.com/restaurant.jpg"
      }
    ],
    "dishes": [
      {
        "sourceId": "dish-123",
        "name": "Turbot with caviar",
        "description": "Line-caught turbot with caviar beurre blanc.",
        "imageUrl": "https://example.com/image.jpg"
      }
    ]
  }
]
```

Do not scrape Michelin's protected website directly. Use permitted public datasets, your own curated data, restaurant websites that expose public metadata, or APIs whose terms allow this use.

To refresh the committed Michelin-derived seed data from public sitemap/detail pages on a machine that can access `guide.michelin.com`:

```bash
curl -L -o /tmp/michelin-us.xml https://guide.michelin.com/sitemap/restaurant/us/page/1.xml
node scripts/scrape-michelin.mjs \
  --sitemaps= \
  --sitemap-files=/tmp/michelin-us.xml \
  --limit=120
```

The script extracts restaurant JSON-LD, Michelin image URLs, award level, coordinates, website links, and a menu-highlight record. It does not bypass WAF challenges, CAPTCHA, account walls, or disallowed `robots.txt` paths.

## 5. Deploy The Pages API

This repo includes `functions/api/[[route]].ts`, which serves the same Hono API from Cloudflare Pages Functions. Bind the D1 database to Pages as `DB` and set these environment variables:

```bash
APP_ENV=production
CRAWLER_SOURCE_URL=https://example.com/michelinmapper-seed.json
ENABLE_WIKIDATA_SOURCE=true
WIKIDATA_LIMIT=80
ENABLE_WEBSITE_MENU_SOURCE=false
WEBSITE_MENU_LIMIT=0
CRAWLER_ADMIN_TOKEN=<long-random-token>
VITE_API_BASE_URL=
```

Leaving `VITE_API_BASE_URL` empty makes the frontend call same-origin `/api/*`.

## 6. Deploy The Worker Cron Trigger

```bash
npm run deploy:worker
```

The Worker can either host the API directly or act as a scheduled trigger/proxy for the Pages API. The cron trigger in `wrangler.jsonc` runs weekly:

```jsonc
"triggers": {
  "crons": ["0 3 * * 1"]
}
```

To test locally:

```bash
npm run dev:worker
curl "http://localhost:8787/__scheduled?cron=0+3+*+*+1"
```

## 7. Deploy The Frontend To Cloudflare Pages

Build locally:

```bash
npm run build:frontend
```

Create the Pages project:

```bash
npx wrangler pages project create michelinmapper
```

Deploy the built frontend:

```bash
npx wrangler pages deploy dist --project-name michelinmapper
```

If you deploy through the Cloudflare dashboard or Git integration:

- Build command: `npm run build:frontend`
- Build output directory: `dist`
- Environment variable: `VITE_API_BASE_URL` empty for same-origin Pages Functions

## 8. Production Smoke Test

After deployment:

```bash
curl https://michelinmapper.pages.dev/api/health
curl https://michelinmapper.pages.dev/api/restaurants
curl "https://michelinmapper.pages.dev/api/dishes?page=1&pageSize=6"
curl https://michelinmapper.pages.dev/api/tags
curl -X POST https://michelinmapper.pages.dev/api/crawl \
  -H "Authorization: Bearer $CRAWLER_ADMIN_TOKEN"
```

Then load the Pages URL and verify:

- The map renders with OpenStreetMap attribution.
- Restaurant pins open popups.
- Dish cards display images or fallback states.
- Search, award filters, tag filters, sorting, and load-more pagination work.
