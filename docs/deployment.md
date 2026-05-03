# MichelinMapper Deployment Guide

This project is designed for Cloudflare's free tier:

- Cloudflare Workers for the Hono API and scheduled crawler.
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

## 4. Configure The Crawler Source

The MVP uses bundled mock data when `CRAWLER_SOURCE_URL` is left as the example URL.

To use a real permitted JSON source, update `wrangler.jsonc`:

```jsonc
"vars": {
  "APP_ENV": "production",
  "CRAWLER_SOURCE_URL": "https://your-permitted-source.example/restaurants.json"
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

Do not scrape Michelin's protected website directly. Use permitted public datasets, your own curated data, or APIs whose terms allow this use.

## 5. Deploy The Worker API And Crawler

```bash
npm run deploy:worker
```

The cron trigger in `wrangler.jsonc` runs weekly:

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

## 6. Deploy The Frontend To Cloudflare Pages

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

Set the frontend API base URL in Cloudflare Pages environment variables:

```bash
VITE_API_BASE_URL=https://michelinmapper-api.<your-subdomain>.workers.dev
```

If you deploy through the Cloudflare dashboard or Git integration:

- Build command: `npm run build:frontend`
- Build output directory: `dist`
- Environment variable: `VITE_API_BASE_URL` set to the deployed Worker origin

## 7. Production Smoke Test

After deployment:

```bash
curl https://michelinmapper-api.<your-subdomain>.workers.dev/api/health
curl https://michelinmapper-api.<your-subdomain>.workers.dev/api/restaurants
curl https://michelinmapper-api.<your-subdomain>.workers.dev/api/dishes?page=1&pageSize=6
curl https://michelinmapper-api.<your-subdomain>.workers.dev/api/tags
```

Then load the Pages URL and verify:

- The map renders with OpenStreetMap attribution.
- Restaurant pins open popups.
- Dish cards display images or fallback states.
- Search, award filters, tag filters, sorting, and load-more pagination work.
