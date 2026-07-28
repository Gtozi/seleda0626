-- Share Reservations: Link multiple guests to a single reservation
-- Enables shared bookings where additional guests share a room/reservation
-- with role tracking (primary, sharing, child) and billing preferences

CREATE TABLE IF NOT EXISTS share_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id TEXT NOT NULL,
  guest_id TEXT NOT NULL REFERENCES guests(id) ON DELETE CASCADE,

  role TEXT NOT NULL DEFAULT 'sharing' CHECK (role IN ('primary', 'sharing', 'child')),
  is_primary_occupant BOOLEAN DEFAULT FALSE,

  -- Billing preferences for this shared guest
  billing_split TEXT DEFAULT 'shared' CHECK (billing_split IN ('shared', 'separate', 'primary_pays')),
  folio_label TEXT,                    -- optional label for separate folio routing

  -- Stay preferences for this specific guest within the shared reservation
  preferences JSONB DEFAULT NULL,      -- dietary, pillow, etc. overrides

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(reservation_id, guest_id)
);

CREATE INDEX IF NOT EXISTS idx_share_res_reservation ON share_reservations(reservation_id);
CREATE INDEX IF NOT EXISTS idx_share_res_guest ON share_reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_share_res_role ON share_reservations(role);

-- RLS
ALTER TABLE share_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "share_res_read_authenticated" ON share_reservations;
CREATE POLICY "share_res_read_authenticated" ON share_reservations
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "share_res_admin_write" ON share_reservations;
CREATE POLICY "share_res_admin_write" ON share_reservations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON share_reservations TO authenticated;

-- Function to get all shared guests for a reservation with guest details
CREATE OR REPLACE FUNCTION get_shared_guests(p_reservation_id TEXT)
RETURNS TABLE (
  share_id UUID,
  guest_id TEXT,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  guest_status TEXT,
  role TEXT,
  is_primary_occupant BOOLEAN,
  billing_split TEXT,
  folio_label TEXT,
  preferences JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sr.id AS share_id,
    sr.guest_id,
    g.name AS guest_name,
    g.email AS guest_email,
    g.phone AS guest_phone,
    g.status AS guest_status,
    sr.role,
    sr.is_primary_occupant,
    sr.billing_split,
    sr.folio_label,
    sr.preferences,
    sr.notes,
    sr.created_at
  FROM share_reservations sr
  JOIN guests g ON g.id = sr.guest_id
  WHERE sr.reservation_id = p_reservation_id
  ORDER BY
    CASE WHEN sr.role = 'primary' THEN 0 ELSE 1 END,
    sr.created_at;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION get_shared_guests TO authenticated;
