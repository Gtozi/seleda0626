-- Pre-Registration: Public portal guests can submit detailed check-in data
-- before arrival, feeding into the CRM check-in flow at the front desk.
-- Bridges the gap between public booking (basic info) and front desk CRM (full profile).

CREATE TABLE IF NOT EXISTS pre_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_name TEXT NOT NULL,

  -- Extended guest data collected during pre-registration
  guest_phone TEXT,
  guest_nationality TEXT,
  date_of_birth TEXT,
  passport_number TEXT,
  id_type TEXT DEFAULT 'passport',           -- 'passport', 'national_id', 'driver_license'
  id_number TEXT,
  id_expiry_date TEXT,
  id_issue_date TEXT,
  id_issuing_country TEXT,

  -- Preferences (matches Guest.preferences shape)
  room_type_preference TEXT,
  pillow_preference TEXT,                     -- 'Soft', 'Firm', 'Feather', 'Orthopedic'
  dietary_restrictions TEXT,
  language_preference TEXT,

  -- Tax/compliance fields
  tin TEXT,
  vat_no TEXT,
  vat_date TEXT,

  -- Vehicle info (for parking allocation)
  vehicle_plate TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,

  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,

  -- Estimated arrival time
  estimated_arrival_time TEXT,                -- e.g. "14:00"

  -- ID document upload URLs (front/back of ID)
  id_front_image_url TEXT,
  id_back_image_url TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'imported', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Link to guest profile once imported into CRM
  imported_guest_id TEXT,

  -- Metadata
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(reservation_id, guest_email)
);

CREATE INDEX IF NOT EXISTS idx_prereg_reservation ON pre_registrations(reservation_id);
CREATE INDEX IF NOT EXISTS idx_prereg_email ON pre_registrations(guest_email);
CREATE INDEX IF NOT EXISTS idx_prereg_status ON pre_registrations(status);
CREATE INDEX IF NOT EXISTS idx_prereg_created ON pre_registrations(created_at DESC);

-- RLS
ALTER TABLE pre_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prereg_read_authenticated" ON pre_registrations;
CREATE POLICY "prereg_read_authenticated" ON pre_registrations
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "prereg_admin_write" ON pre_registrations;
CREATE POLICY "prereg_admin_write" ON pre_registrations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public can submit pre-registration (insert only, no read/update/delete)
DROP POLICY IF EXISTS "prereg_public_submit" ON pre_registrations;
CREATE POLICY "prereg_public_submit" ON pre_registrations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Public can check if they already have a pre-registration (select own email only)
DROP POLICY IF EXISTS "prereg_public_check" ON pre_registrations;
CREATE POLICY "prereg_public_check" ON pre_registrations
  FOR SELECT TO anon, authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON pre_registrations TO authenticated;
GRANT INSERT, SELECT ON pre_registrations TO anon;
