-- ============================================================
-- 019_public_page_editor.sql
-- Public Page Editor: pages, versions, blocks, templates, media,
-- policy metadata, legal review records, audit log
-- ============================================================

-- 1. Pages
CREATE TABLE IF NOT EXISTS pages (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id           TEXT NOT NULL DEFAULT 'single-property',
  slug                  TEXT NOT NULL,
  page_type             TEXT NOT NULL CHECK (page_type IN ('marketing','policy')),
  status                TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','in_review','published','archived')),
  published_version_id  TEXT,
  current_draft_id      TEXT,
  locale                TEXT NOT NULL DEFAULT 'en',
  seo_title             TEXT,
  seo_description       TEXT,
  seo_og_image_url      TEXT,
  seo_canonical_url     TEXT,
  structured_data       JSONB,
  scheduled_publish_at  TIMESTAMPTZ,
  scheduled_expire_at   TIMESTAMPTZ,
  created_by            TEXT NOT NULL,
  updated_by            TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, slug, locale)
);

CREATE INDEX IF NOT EXISTS idx_pages_property_id ON pages(property_id);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_page_type ON pages(page_type);

-- 2. Page Versions (immutable snapshots)
CREATE TABLE IF NOT EXISTS page_versions (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_id         TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  version_number  INT NOT NULL,
  block_tree      JSONB NOT NULL,
  change_summary  TEXT,
  created_by      TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);

-- Prevent direct updates/deletes to version records (enforce immutability)
CREATE OR REPLACE FUNCTION prevent_version_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Page version records are immutable and cannot be modified or deleted.';
END;
$$;

CREATE TRIGGER trg_prevent_version_update
  BEFORE UPDATE ON page_versions
  FOR EACH ROW EXECUTE FUNCTION prevent_version_mutation();

CREATE TRIGGER trg_prevent_version_delete
  BEFORE DELETE ON page_versions
  FOR EACH ROW EXECUTE FUNCTION prevent_version_mutation();

-- 3. Blocks (live working state for current draft)
CREATE TABLE IF NOT EXISTS blocks (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_id     TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL DEFAULT 'single-property',
  block_type  TEXT NOT NULL CHECK (block_type IN (
    'hero','text_rich','image','gallery','room_card','offer_card',
    'testimonial','cta_button','video','map','embedded_form',
    'policy_clause','terms_table','last_updated_banner','jurisdiction_selector',
    'faq_accordion','divider','spacer'
  )),
  position    INT NOT NULL,
  config      JSONB NOT NULL DEFAULT '{}',
  is_dynamic  BOOLEAN NOT NULL DEFAULT false,
  template_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocks_page_id ON blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_blocks_page_position ON blocks(page_id, position);

-- 4. Block Templates
CREATE TABLE IF NOT EXISTS block_templates (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id   TEXT, -- NULL = system-wide template
  name          TEXT NOT NULL,
  block_type    TEXT NOT NULL,
  config        JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  is_system     BOOLEAN NOT NULL DEFAULT false,
  created_by    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_block_templates_property_id ON block_templates(property_id);

-- 5. Media Assets
CREATE TABLE IF NOT EXISTS media_assets (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id     TEXT NOT NULL DEFAULT 'single-property',
  filename        TEXT NOT NULL,
  mime_type       TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  width_px        INT,
  height_px       INT,
  cdn_url         TEXT NOT NULL,
  alt_text        TEXT,
  scan_status     TEXT NOT NULL DEFAULT 'pending'
                    CHECK (scan_status IN ('pending','clean','quarantined')),
  usage_refs      JSONB DEFAULT '[]',
  uploaded_by     TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_property_id ON media_assets(property_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_scan_status ON media_assets(scan_status);

-- 6. Policy Page Metadata
CREATE TABLE IF NOT EXISTS policy_page_metadata (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_id               TEXT NOT NULL UNIQUE REFERENCES pages(id) ON DELETE CASCADE,
  effective_date        DATE,
  requires_legal_review BOOLEAN NOT NULL DEFAULT true,
  legal_template_id     TEXT,
  jurisdiction_tags     TEXT[] DEFAULT '{}',
  last_approved_by      TEXT,
  last_approved_at      TIMESTAMPTZ,
  last_approved_version_id TEXT,
  change_log            JSONB DEFAULT '[]'
);

-- 7. Legal Page Templates (central corporate-approved base templates)
CREATE TABLE IF NOT EXISTS legal_page_templates (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  template_name   TEXT NOT NULL,
  jurisdiction    TEXT[] DEFAULT '{}',
  block_tree      JSONB NOT NULL,
  mandatory_block_ids TEXT[] DEFAULT '{}',
  approved_by     TEXT,
  approved_at     TIMESTAMPTZ,
  version         INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Legal Review Records (enforcement layer for policy publishing)
CREATE TABLE IF NOT EXISTS legal_review_records (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_id     TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  version_id  TEXT NOT NULL REFERENCES page_versions(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  decision    TEXT NOT NULL CHECK (decision IN ('approved','rejected')),
  comments    TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_id, version_id)
);

CREATE INDEX IF NOT EXISTS idx_legal_review_records_page_id ON legal_review_records(page_id);
CREATE INDEX IF NOT EXISTS idx_legal_review_records_version_id ON legal_review_records(version_id);

-- DB constraint: policy page cannot be published without approved legal review
CREATE OR REPLACE FUNCTION enforce_policy_page_legal_review()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'published' THEN
    IF (SELECT page_type FROM pages WHERE id = NEW.id) = 'policy' THEN
      IF NOT EXISTS (
        SELECT 1 FROM legal_review_records
        WHERE page_id = NEW.id
          AND version_id = NEW.published_version_id
          AND decision = 'approved'
      ) THEN
        RAISE EXCEPTION 'Policy pages require an approved legal_review_record before publishing';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_legal_review
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION enforce_policy_page_legal_review();

-- 9. Page Audit Log
CREATE TABLE IF NOT EXISTS page_audit_log (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_id       TEXT REFERENCES pages(id),
  property_id   TEXT NOT NULL DEFAULT 'single-property',
  actor_id      TEXT NOT NULL,
  action        TEXT NOT NULL,
  version_id    TEXT REFERENCES page_versions(id),
  before_state  JSONB,
  after_state   JSONB,
  diff          JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_audit_log_page_id ON page_audit_log(page_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_audit_log_property_id ON page_audit_log(property_id, created_at DESC);

-- Insert sample legal page template
INSERT INTO legal_page_templates (template_name, jurisdiction, block_tree, mandatory_block_ids, approved_by, approved_at)
VALUES (
  'Privacy Policy v1',
  ARRAY['ETH', 'EU-GDPR'],
  '[
    {"block_type":"policy_clause","position":1,"config":{"title":"Data Collection","content":"We collect..."}},
    {"block_type":"policy_clause","position":2,"config":{"title":"Data Usage","content":"We use your data to..."}},
    {"block_type":"policy_clause","position":3,"config":{"title":"Your Rights","content":"You have the right to..."}}
  ]',
  ARRAY['policy_clause'],
  'system',
  now()
) ON CONFLICT DO NOTHING;

-- Insert sample system block templates
INSERT INTO block_templates (property_id, name, block_type, config, is_system, created_by)
VALUES
  (NULL, 'Hero Banner - Default', 'hero', '{"title":"Welcome","subtitle":"Your perfect stay awaits","backgroundImage":""}', true, 'system'),
  (NULL, 'Room Card - Standard', 'room_card', '{"showPrice":true,"showAmenities":true}', true, 'system'),
  (NULL, 'CTA Button - Book Now', 'cta_button', '{"text":"Book Now","link":"/booking"}', true, 'system'),
  (NULL, 'Policy Clause - Standard', 'policy_clause', '{"title":"","content":""}', true, 'system')
ON CONFLICT DO NOTHING;
