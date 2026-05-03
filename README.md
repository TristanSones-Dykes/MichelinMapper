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
- Google Maps, Instagram, and TikTok are integrated as outbound discovery links unless official API credentials are configured.

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
