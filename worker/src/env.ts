export interface Env {
  DB: D1Database;
  APP_ENV: string;
  CRAWLER_SOURCE_URL: string;
  ENABLE_WIKIDATA_SOURCE?: string;
  WIKIDATA_LIMIT?: string;
  ENABLE_WEBSITE_MENU_SOURCE?: string;
  WEBSITE_MENU_LIMIT?: string;
  CRAWLER_ADMIN_TOKEN?: string;
}
