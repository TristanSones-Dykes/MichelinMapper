PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL DEFAULT 'manual',
  source_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  award_type TEXT NOT NULL CHECK (
    award_type IN (
      '3-star',
      '2-star',
      '1-star',
      'bib-gourmand',
      'recommended'
    )
  ),
  cuisine TEXT,
  description TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  country TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  website_url TEXT,
  source_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (source, source_id)
);

CREATE TABLE IF NOT EXISTS dishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  source_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  image_alt TEXT,
  image_credit TEXT,
  source_url TEXT,
  price_text TEXT,
  search_text TEXT GENERATED ALWAYS AS (
    lower(
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(price_text, '')
    )
  ) VIRTUAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) ON DELETE CASCADE,
  UNIQUE (source, source_id),
  UNIQUE (restaurant_id, slug)
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (
    type IN (
      'award',
      'geographic',
      'gastronomic',
      'cuisine',
      'dietary',
      'other'
    )
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dish_tags (
  dish_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  source TEXT NOT NULL DEFAULT 'classifier',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (dish_id, tag_id),
  FOREIGN KEY (dish_id) REFERENCES dishes (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS restaurant_external_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (
    source IN (
      'website',
      'wikidata',
      'google_maps',
      'instagram',
      'tiktok',
      'michelin',
      'other'
    )
  ),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  handle TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) ON DELETE CASCADE,
  UNIQUE (restaurant_id, source, url)
);

CREATE TABLE IF NOT EXISTS ingestion_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  restaurants_seen INTEGER NOT NULL DEFAULT 0,
  dishes_seen INTEGER NOT NULL DEFAULT 0,
  restaurants_upserted INTEGER NOT NULL DEFAULT 0,
  dishes_upserted INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_restaurants_award_type
  ON restaurants (award_type);

CREATE INDEX IF NOT EXISTS idx_restaurants_location
  ON restaurants (country, city);

CREATE INDEX IF NOT EXISTS idx_restaurants_coordinates
  ON restaurants (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_id
  ON dishes (restaurant_id);

CREATE INDEX IF NOT EXISTS idx_dishes_created_at
  ON dishes (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dishes_search_text
  ON dishes (search_text);

CREATE INDEX IF NOT EXISTS idx_tags_type
  ON tags (type);

CREATE INDEX IF NOT EXISTS idx_dish_tags_tag_id
  ON dish_tags (tag_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_external_links_restaurant_id
  ON restaurant_external_links (restaurant_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_external_links_source
  ON restaurant_external_links (source);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_started_at
  ON ingestion_runs (started_at DESC);
