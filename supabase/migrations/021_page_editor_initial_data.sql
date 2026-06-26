-- ============================================================
-- 021_page_editor_initial_data.sql
-- Modern Booking Page with modular individual blocks
-- ============================================================

-- Add title column to pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS title TEXT;

-- Insert modern booking page
INSERT INTO pages (
  id, property_id, slug, page_type, status, locale,
  seo_title, seo_description, seo_og_image_url, seo_canonical_url,
  title, created_by, updated_by
) VALUES
  (
    'page-booking',
    'single-property',
    'booking',
    'public_booking',
    'published',
    'en',
    'Book Your Stay',
    'Online reservations for your perfect stay with modern booking experience',
    NULL,
    'https://example.com/booking',
    'Modern Booking Page',
    'system',
    'system'
  )
ON CONFLICT (property_id, slug, locale) DO NOTHING;

-- Delete old monolithic booking_engine block and any stale individual room cards
DELETE FROM blocks WHERE page_id = 'page-booking' AND block_type = 'booking_engine';
DELETE FROM blocks WHERE page_id = 'page-booking' AND block_type = 'booking_room_card' AND id IN ('block-booking-room-card-1', 'block-booking-room-card-2');

-- Insert modular blocks for the booking page (grid layout ready)
INSERT INTO blocks (id, page_id, property_id, block_type, position, config, is_dynamic, created_at, updated_at) VALUES
  (
    'block-booking-hero',
    'page-booking',
    'single-property',
    'booking_hero',
    0,
    '{
      "title": "",
      "subtitle": "",
      "badge": "Direct Booking",
      "imageUrl": "",
      "videoUrl": "",
      "overlay": true,
      "height": "400px",
      "overlayColor": "bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent",
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-filter-bar',
    'page-booking',
    'single-property',
    'booking_filter_bar',
    1,
    '{
      "showPromoCode": true,
      "primaryColor": "#4f46e5",
      "accentColor": "#f59e0b",
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-room-list',
    'page-booking',
    'single-property',
    'booking_room_card',
    2,
    '{
      "primaryColor": "#4f46e5",
      "accentColor": "#f59e0b",
      "amenitiesLabel": "Amenities",
      "soldOutLabel": "Sold Out",
      "availableLabel": "{count} rooms available",
      "perNightLabel": "/night",
      "noImageLabel": "No image",
      "addLabel": "+",
      "removeLabel": "-",
      "emptyLabel": "No rooms available for the selected dates.",
      "colSpan": 3,
      "rowSpan": 2
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-sidebar',
    'page-booking',
    'single-property',
    'booking_sidebar_section',
    3,
    '{
      "title": "Contact Us",
      "email": "",
      "phone": "",
      "address": "",
      "position": "right",
      "colSpan": 1,
      "rowSpan": 2
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-features',
    'page-booking',
    'single-property',
    'booking_features_section',
    4,
    '{
      "title": "Why Book Direct",
      "description": "Enjoy the best rates and perks.",
      "features": [],
      "columns": 4,
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-experience-section',
    'page-booking',
    'single-property',
    'booking_experience_section',
    5,
    '{
      "title": "Enhance Your Stay",
      "description": "Add experiences to your reservation.",
      "showSection": true,
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-testimonials-section',
    'page-booking',
    'single-property',
    'booking_testimonials_section',
    6,
    '{
      "title": "Guest Reviews",
      "testimonials": [],
      "showSection": true,
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-story-section',
    'page-booking',
    'single-property',
    'booking_story_section',
    7,
    '{
      "title": "Our Story",
      "text": "Experience the perfect blend of luxury and nature.",
      "stat1": "100+",
      "stat2": "5 Star",
      "stat1Label": "Rooms",
      "stat2Label": "Rating",
      "showSection": true,
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-footer-section',
    'page-booking',
    'single-property',
    'booking_footer_section',
    8,
    '{
      "text": "Thank you for choosing our hotel.",
      "copyright": "© 2026 Grand Hotel. All rights reserved.",
      "links": [],
      "showSection": true,
      "primaryColor": "#4f46e5",
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;
