-- ============================================================
-- 022_page_creator_block_types.sql
-- Allow the block types used by the LEGO-style page creator.
-- Note: The modern booking page setup is handled in 021_page_editor_initial_data.sql
-- ============================================================

-- Relax blocks.block_type check constraint to include all page creator blocks
ALTER TABLE blocks DROP CONSTRAINT IF EXISTS blocks_block_type_check;
ALTER TABLE blocks ADD CONSTRAINT blocks_block_type_check
  CHECK (block_type IN (
    'hero','text_rich','image','gallery','features','room_card','offer_card',
    'testimonial','cta_button','video','map','embedded_form',
    'policy_clause','terms_table','last_updated_banner','jurisdiction_selector',
    'faq_accordion','divider','spacer',
    'booking_hero','booking_room_card','booking_filter_bar',
    'booking_experience_section','booking_testimonials_section',
    'booking_story_section','booking_footer_section','booking_sidebar_section','booking_features_section'
  ));

-- Page and block seeding for modern booking page is handled in 021_page_editor_initial_data.sql
-- This migration only ensures the block type constraint is updated.
