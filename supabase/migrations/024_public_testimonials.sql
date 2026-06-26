-- ============================================================
-- 024_public_testimonials.sql
-- Guest testimonials submitted through the public booking portal.
-- ============================================================

CREATE TABLE IF NOT EXISTS public_testimonials (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id   TEXT NOT NULL DEFAULT 'single-property',
  guest_name    TEXT NOT NULL,
  location      TEXT,
  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL,
  stay_date     TEXT,
  room_type     TEXT,
  avatar_url    TEXT,
  status        TEXT NOT NULL DEFAULT 'approved'
                  CHECK (status IN ('pending','approved','rejected')),
  source        TEXT NOT NULL DEFAULT 'public_portal'
                  CHECK (source IN ('public_portal','imported','manager')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_public_testimonials_property_id ON public_testimonials(property_id);
CREATE INDEX IF NOT EXISTS idx_public_testimonials_status ON public_testimonials(status);
CREATE INDEX IF NOT EXISTS idx_public_testimonials_created_at ON public_testimonials(created_at DESC);

-- Seed a few demo testimonials so the public portal is never empty on first run.
INSERT INTO public_testimonials (
  id, property_id, guest_name, location, rating, comment, stay_date, room_type, avatar_url, status, source
) VALUES
  (
    'tstm-demo-1',
    'single-property',
    'Eleanor Vance',
    'London, UK',
    5,
    'Our stay was absolutely pristine. The penthouse exceeded all expectations. The hospitality is unmatched.',
    'May 2026',
    'Penthouse',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    'approved',
    'imported'
  ),
  (
    'tstm-demo-2',
    'single-property',
    'Dr. Marcus Sterling',
    'Boston, USA',
    5,
    'I travel extensively for business and expect perfection. The resort combines breathtaking design with personalized service.',
    'June 2026',
    'Suite',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    'approved',
    'imported'
  ),
  (
    'tstm-demo-3',
    'single-property',
    'The Sato Family',
    'Tokyo, Japan',
    5,
    'Traveling with children can be demanding, but the family villa was fantastic. The kids were occupied while we fully relaxed.',
    'April 2026',
    'Family',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    'approved',
    'imported'
  ),
  (
    'tstm-demo-4',
    'single-property',
    'Chloe & Nathan Davis',
    'Sydney, Australia',
    5,
    'We spent our honeymoon in the Deluxe Room and were blown away. Falling asleep to the ocean sound was magic.',
    'June 2026',
    'Deluxe',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    'approved',
    'imported'
  )
ON CONFLICT (id) DO NOTHING;
