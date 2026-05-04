# MichelinMapper

MichelinMapper is a Cloudflare-free-tier web app and ingestion pipeline for mapping Michelin-recognized restaurants and classified dishes.

## Stack

- Frontend: React, Vite, TypeScript, Leaflet, OpenStreetMap tiles
- Backend: Cloudflare Pages Functions and Cloudflare Workers, Hono, TypeScript
- Database: Cloudflare D1 SQLite
- Crawler: Cloudflare Worker Cron Trigger, Pages Function ingestion endpoint

## Data Sources

- Curated seed data provides verified restaurant and dish examples with source URLs.
- Wikidata ingestion adds open Michelin-starred restaurant metadata and coordinates.
- Optional website menu extraction reads public schema.org JSON-LD `MenuItem` metadata when enabled.
- Michelin sitemap/detail metadata is stored as restaurant source notes, not dishes, unless a real menu item is parsed.
- Google Maps, Instagram, and TikTok are integrated as outbound discovery links unless official API credentials are configured.

## Dish Ontology

Dish cards only represent publishable dish records. Restaurant review snippets and generic source images are kept out of the dish list and stored as source notes. Each dish has a detail page at `/dish/:id/:slug` with its full description, all collected dish images, grouped classifier tags, restaurant context, and source provenance.

## Local Development

```bash
npm install
npm run db:migrate:local
npm run dev:worker
```

In a second terminal:

```bash
npm run dev:frontend
```

Trigger the local scheduled crawler:

```bash
curl "http://localhost:8787/__scheduled?cron=0+3+*+*+1"
```

Then open the Vite URL printed by `npm run dev:frontend`.

## Verification

```bash
npm test
npm run typecheck
npm run build
```

## Deployment

See [docs/deployment.md](/Users/tsd/Projects/P_Food/docs/deployment.md).
