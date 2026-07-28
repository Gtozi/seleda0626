-- Reservation Series: Recurring reservation patterns
-- Allows creating repeating reservations (daily, weekly, monthly) linked to a parent series

CREATE TABLE IF NOT EXISTS reservation_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  series_name TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  guest_status TEXT DEFAULT 'Regular',
  room_type TEXT NOT NULL,
  adults INT DEFAULT 1,
  children INT DEFAULT 0,
  rate NUMERIC DEFAULT 0,
  channel TEXT DEFAULT 'Direct Website',
  payment_status TEXT DEFAULT 'Unpaid',
  notes TEXT,

  -- Recurrence pattern
  frequency TEXT NOT NULL DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
  interval_days INT NOT NULL DEFAULT 1,     -- every N days/weeks/months
  days_of_week INT[] DEFAULT NULL,          -- 0=Sun..6=Sat (for weekly)
  check_in_offset INT NOT NULL DEFAULT 0,   -- nights per stay
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservation_series_property ON reservation_series(property_id);
CREATE INDEX IF NOT EXISTS idx_reservation_series_active ON reservation_series(is_active);
CREATE INDEX IF NOT EXISTS idx_reservation_series_dates ON reservation_series(start_date, end_date);

-- Add series_id to reservations table to link generated reservations back to their series
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES reservation_series(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE reservation_series ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "series_read_authenticated" ON reservation_series;
CREATE POLICY "series_read_authenticated" ON reservation_series
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "series_admin_write" ON reservation_series;
CREATE POLICY "series_admin_write" ON reservation_series
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON reservation_series TO authenticated;

-- Function to generate reservation dates from a series pattern
CREATE OR REPLACE FUNCTION generate_series_dates(
  p_frequency TEXT,
  p_interval INT,
  p_days_of_week INT[],
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (occurrence_date DATE) AS $$
DECLARE
  v_current DATE := p_start_date;
  v_dow INT;
  v_matched BOOLEAN;
BEGIN
  WHILE v_current <= p_end_date LOOP
    IF p_frequency = 'daily' THEN
      occurrence_date := v_current;
      RETURN NEXT;
      v_current := v_current + (p_interval || ' days')::INTERVAL;

    ELSIF p_frequency = 'weekly' THEN
      IF p_days_of_week IS NOT NULL AND array_length(p_days_of_week, 1) > 0 THEN
        -- Emit matching days within each week interval
        v_matched := false;
        FOR i IN 0..6 LOOP
          v_dow := EXTRACT(DOW FROM v_current + i);
          IF p_days_of_week @> ARRAY[v_dow] THEN
            IF v_current + i <= p_end_date THEN
              occurrence_date := v_current + i;
              RETURN NEXT;
            END IF;
            v_matched := true;
          END IF;
        END LOOP;
        -- Advance by interval weeks
        v_current := v_current + (p_interval || ' weeks')::INTERVAL;
      ELSE
        -- No specific days: just use the start day weekly
        occurrence_date := v_current;
        RETURN NEXT;
        v_current := v_current + (p_interval || ' weeks')::INTERVAL;
      END IF;

    ELSIF p_frequency = 'monthly' THEN
      occurrence_date := v_current;
      RETURN NEXT;
      v_current := v_current + (p_interval || ' months')::INTERVAL;
    ELSE
      occurrence_date := v_current;
      RETURN NEXT;
      v_current := v_current + (p_interval || ' days')::INTERVAL;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

GRANT EXECUTE ON FUNCTION generate_series_dates TO authenticated;
