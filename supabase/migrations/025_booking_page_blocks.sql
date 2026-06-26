-- ============================================================
-- 025_booking_page_blocks.sql
-- Add booking-specific block types and seed default booking page
-- ============================================================

-- 1. Add booking-specific block types to the blocks table check constraint
-- First, we need to drop the existing check constraint and recreate it with the new types
ALTER TABLE blocks DROP CONSTRAINT IF EXISTS blocks_block_type_check;

-- Before adding the new constraint, update any existing rows with invalid block types
-- to valid ones or delete them to avoid constraint violations
UPDATE blocks SET block_type = 'hero' WHERE block_type NOT IN (
  'hero','text_rich','image','gallery','room_card','offer_card',
  'testimonial','cta_button','video','map','embedded_form',
  'policy_clause','terms_table','last_updated_banner','jurisdiction_selector',
  'faq_accordion','divider','spacer',
  'booking_hero','booking_filter_bar','booking_room_card',
  'booking_experience_section','booking_testimonials_section',
  'booking_story_section','booking_features_section',
  'booking_footer_section','booking_sidebar_section'
);

-- Now add the new constraint
ALTER TABLE blocks
  ADD CONSTRAINT blocks_block_type_check
  CHECK (block_type IN (
    'hero','text_rich','image','gallery','room_card','offer_card',
    'testimonial','cta_button','video','map','embedded_form',
    'policy_clause','terms_table','last_updated_banner','jurisdiction_selector',
    'faq_accordion','divider','spacer',
    'booking_hero','booking_filter_bar','booking_room_card',
    'booking_experience_section','booking_testimonials_section',
    'booking_story_section','booking_features_section',
    'booking_footer_section','booking_sidebar_section'
  ));

-- 2. Create the default booking page
-- Use upsert to ensure the page exists
INSERT INTO pages (
  id,
  property_id,
  slug,
  page_type,
  status,
  locale,
  seo_title,
  seo_description,
  created_by,
  updated_by
) VALUES (
  'default-booking-page',
  'single-property',
  'booking',
  'marketing',
  'published',
  'en',
  'Book Your Stay - Grand Vista Resort',
  'Reserve your luxury escape at Grand Vista Resort. Choose from our sanctuary suites and bespoke experiences.',
  'system',
  'system'
) ON CONFLICT (property_id, slug, locale) DO UPDATE SET
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  updated_by = EXCLUDED.updated_by,
  updated_at = now();

-- 3. Create initial page version only if the page exists
INSERT INTO page_versions (
  id,
  page_id,
  version_number,
  block_tree,
  change_summary,
  created_by
) SELECT
  'booking-page-v1',
  'default-booking-page',
  1,
  '[]'::jsonb,
  'Initial booking page version',
  'system'
WHERE EXISTS (SELECT 1 FROM pages WHERE id = 'default-booking-page')
ON CONFLICT (page_id, version_number) DO NOTHING;

-- 4. Update the page to reference the published version
UPDATE pages
SET published_version_id = 'booking-page-v1',
    current_draft_id = 'booking-page-v1'
WHERE id = 'default-booking-page' AND EXISTS (SELECT 1 FROM page_versions WHERE id = 'booking-page-v1');

-- 5. Insert default blocks for the booking page
-- Note: These blocks will be rendered by PublicBlockRenderer
-- Only insert if the page exists

-- Helper function to insert block if page exists
DO $$
DECLARE
  page_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM pages WHERE id = 'default-booking-page') INTO page_exists;

  IF page_exists THEN
    -- Hero Section
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_hero',
      0,
      '{
        "imageUrl": "",
        "title": "Where the Sea Greets the Horizon",
        "tagline": "Unmatched Ocean Luxury",
        "address": "Via Cristoforo Colombo, 84017 Positano SA, Italy"
      }'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Filter Bar
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_filter_bar',
      1,
      '{}'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Room Cards
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_room_card',
      2,
      '{
        "title": "Our Sanctuary Suites",
        "subtitle": "Choose your perfect escape"
      }'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Experience Section
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_experience_section',
      3,
      '{
        "title": "Epic Mountain Experiences",
        "description": "Curated packages for unforgettable stays"
      }'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Story Section
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_story_section',
      4,
      '{
        "title": "Our Story",
        "description": "Experience the perfect blend of luxury and nature.",
        "stat1": "100+ Rooms",
        "stat1Label": "Capacity",
        "stat2": "5 Star Rating",
        "stat2Label": "Quality",
        "text": "Experience the perfect blend of luxury and nature. Tucked away on rugged cliffs overlooking pristine waters, Grand Vista Resort brings bespoke hospitality, award-winning spa treatments, and Michelin-star culinary secrets together into a seamless private escape."
      }'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Features Section
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_features_section',
      5,
      '{
        "title": "Why Book Direct",
        "description": "Enjoy the best rates and perks."
      }'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Testimonials Section
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_testimonials_section',
      6,
      '{
        "title": "Verified Guest Remarks"
      }'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Footer
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_footer_section',
      7,
      '{}'::jsonb
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;
