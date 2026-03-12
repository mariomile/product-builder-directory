-- Product Builder Directory — Schema
-- Run via Supabase Dashboard → SQL Editor

-- 1. Fuzzy search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Enums
CREATE TYPE resource_type AS ENUM (
  'tool', 'course', 'article', 'newsletter', 'book',
  'podcast', 'video', 'community', 'x_post', 'framework'
);

CREATE TYPE resource_pillar AS ENUM (
  'discovery', 'design', 'delivery', 'strategy', 'stack', 'meta_skill'
);

CREATE TYPE resource_level AS ENUM (
  'beginner', 'intermediate', 'advanced'
);

-- 3. Resources table
CREATE TABLE resources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type        resource_type NOT NULL,
  pillar      resource_pillar NOT NULL,
  tags        TEXT[] NOT NULL DEFAULT '{}',
  level       resource_level NOT NULL DEFAULT 'intermediate',
  author      TEXT,
  expert_take TEXT,
  language    TEXT NOT NULL DEFAULT 'en',
  is_free     BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  logo_url    TEXT,
  raindrop_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Indexes
CREATE INDEX idx_resources_slug ON resources (slug);
CREATE INDEX idx_resources_type ON resources (type);
CREATE INDEX idx_resources_pillar ON resources (pillar);
CREATE INDEX idx_resources_level ON resources (level);
CREATE INDEX idx_resources_tags ON resources USING GIN (tags);
CREATE INDEX idx_resources_name_trgm ON resources USING GIN (name gin_trgm_ops);
CREATE INDEX idx_resources_description_trgm ON resources USING GIN (description gin_trgm_ops);
CREATE INDEX idx_resources_featured ON resources (is_featured) WHERE is_featured = true;

-- 5. Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 6. RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON resources FOR SELECT USING (true);

CREATE POLICY "Authenticated insert"
  ON resources FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update"
  ON resources FOR UPDATE USING (auth.role() = 'authenticated');
