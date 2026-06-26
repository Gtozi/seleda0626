-- ============================================================
-- 020_page_editor_public_booking.sql
-- Allow 'public_booking' page type and add preview link tokens
-- ============================================================

-- Relax page_type check constraint to include public_booking
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_page_type_check;
ALTER TABLE pages ADD CONSTRAINT pages_page_type_check
  CHECK (page_type IN ('marketing','policy','public_booking'));

-- Preview share links for stakeholder review
CREATE TABLE IF NOT EXISTS page_preview_links (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_id     TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  created_by  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_preview_links_token ON page_preview_links(token);
CREATE INDEX IF NOT EXISTS idx_page_preview_links_page_id ON page_preview_links(page_id);
