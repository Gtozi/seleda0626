-- ============================================================-- 023_page_creator_new_blocks.sql-- Add modern block types to the page creator block registry.-- ============================================================

ALTER TABLE blocks DROP CONSTRAINT IF EXISTS blocks_block_type_check;
ALTER TABLE blocks ADD CONSTRAINT blocks_block_type_check
  CHECK (block_type IN (
    'hero','text_rich','image','gallery','features','room_card','offer_card',
    'testimonial','cta_button','video','map','embedded_form',
    'policy_clause','terms_table','last_updated_banner','jurisdiction_selector',
    'faq_accordion','divider','spacer',
    'navigation','contact_form','newsletter','carousel','stats_counter','team_list','container',
    'booking_hero','booking_room_card','booking_filter_bar',
    'booking_experience_section','booking_testimonials_section',
    'booking_story_section','booking_footer_section','booking_sidebar_section','booking_features_section',
    'tabs','pricing_table','testimonial_slider','before_after','masonry_gallery','countdown_timer','scroll_reveal'
  ));
