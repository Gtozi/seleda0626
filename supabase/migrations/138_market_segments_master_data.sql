-- Market Segments Master Data
-- Defines market segment classifications for guest categorization and reporting

-- Market segments table
CREATE TABLE IF NOT EXISTS market_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_code TEXT NOT NULL UNIQUE, -- e.g., 'LEISURE', 'CORPORATE', 'GROUP', 'GOV'
  segment_name TEXT NOT NULL,
  description TEXT,
  parent_segment_id UUID REFERENCES market_segments(id),
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- Higher priority segments appear first in reports
  revenue_weight DECIMAL(5,2) DEFAULT 1.00, -- Weight for revenue calculations
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_segments_code ON market_segments(segment_code);
CREATE INDEX IF NOT EXISTS idx_market_segments_parent ON market_segments(parent_segment_id);
CREATE INDEX IF NOT EXISTS idx_market_segments_active ON market_segments(is_active);

-- Guest market segment assignments
CREATE TABLE IF NOT EXISTS guest_market_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id TEXT REFERENCES guests(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES market_segments(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_primary BOOLEAN DEFAULT TRUE, -- Primary segment for the guest
  confidence_score DECIMAL(3,2) DEFAULT 1.00, -- 0.00 to 1.00, how confident we are in this assignment
  assignment_source TEXT DEFAULT 'manual', -- 'manual', 'automatic', 'inferred'
  notes TEXT,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_segment_primary ON guest_market_segments(guest_id) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_guest_segment_guest ON guest_market_segments(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_segment_segment ON guest_market_segments(segment_id);
CREATE INDEX IF NOT EXISTS idx_guest_segment_valid ON guest_market_segments(valid_from, valid_until);

-- Segment performance metrics
CREATE TABLE IF NOT EXISTS segment_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID REFERENCES market_segments(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  total_guests INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_rooms_sold INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  avg_rate DECIMAL(10,2) DEFAULT 0.00,
  occupancy_rate DECIMAL(5,2) DEFAULT 0.00,
  avg_length_of_stay DECIMAL(5,2) DEFAULT 0.00,
  cancellation_rate DECIMAL(5,2) DEFAULT 0.00,
  no_show_rate DECIMAL(5,2) DEFAULT 0.00,
  repeat_guest_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_segment_metrics_date ON segment_metrics(segment_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_segment_metrics_date_only ON segment_metrics(metric_date);

-- Segment booking patterns
CREATE TABLE IF NOT EXISTS segment_booking_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID REFERENCES market_segments(id) ON DELETE CASCADE,
  booking_lead_days_avg INTEGER DEFAULT 0,
  booking_lead_days_median INTEGER DEFAULT 0,
  length_of_stay_avg DECIMAL(5,2) DEFAULT 0.00,
  length_of_stay_median DECIMAL(5,2) DEFAULT 0.00,
  check_in_day_pattern JSONB DEFAULT '{}', -- Distribution by day of week
  check_out_day_pattern JSONB DEFAULT '{}', -- Distribution by day of week
  seasonal_pattern JSONB DEFAULT '{}', -- Distribution by month
  room_type_preference JSONB DEFAULT '{}', -- Distribution by room type
  package_preference JSONB DEFAULT '{}', -- Distribution by package type
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_segment_pattern ON segment_booking_patterns(segment_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_market_segment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER market_segments_updated_at
  BEFORE UPDATE ON market_segments
  FOR EACH ROW
  EXECUTE FUNCTION update_market_segment_timestamp();

-- Function to assign primary segment to guest
CREATE OR REPLACE FUNCTION assign_guest_primary_segment(
  p_guest_id TEXT,
  p_segment_id UUID,
  p_assigned_by UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_assignment_id UUID;
BEGIN
  -- Remove existing primary assignment
  UPDATE guest_market_segments
  SET is_primary = FALSE, valid_until = NOW()
  WHERE guest_id = p_guest_id AND is_primary = TRUE;
  
  -- Insert new primary assignment
  INSERT INTO guest_market_segments (
    guest_id, segment_id, assigned_by, is_primary, notes
  ) VALUES (
    p_guest_id, p_segment_id, p_assigned_by, TRUE, p_notes
  ) RETURNING id INTO v_assignment_id;
  
  RETURN v_assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get guest segments
CREATE OR REPLACE FUNCTION get_guest_segments(p_guest_id TEXT)
RETURNS TABLE (
  segment_id UUID,
  segment_code TEXT,
  segment_name TEXT,
  is_primary BOOLEAN,
  confidence_score DECIMAL,
  assigned_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ms.id,
    ms.segment_code,
    ms.segment_name,
    gms.is_primary,
    gms.confidence_score,
    gms.assigned_at
  FROM guest_market_segments gms
  JOIN market_segments ms ON gms.segment_id = ms.id
  WHERE gms.guest_id = p_guest_id
    AND (gms.valid_until IS NULL OR gms.valid_until > NOW())
  ORDER BY gms.is_primary DESC, gms.confidence_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate segment metrics
CREATE OR REPLACE FUNCTION calculate_segment_metrics(p_segment_id UUID, p_metric_date DATE DEFAULT CURRENT_DATE)
RETURNS UUID AS $$
DECLARE
  v_metric_id UUID;
  v_total_guests INTEGER;
  v_total_bookings INTEGER;
  v_total_rooms_sold INTEGER;
  v_total_revenue DECIMAL;
  v_avg_rate DECIMAL;
  v_occupancy_rate DECIMAL;
  v_avg_los DECIMAL;
  v_cancellation_rate DECIMAL;
  v_no_show_rate DECIMAL;
BEGIN
  -- Calculate metrics for the segment on the given date
  SELECT 
    COUNT(DISTINCT gms.guest_id),
    COUNT(DISTINCT r.id),
    COALESCE(SUM(r.number_of_rooms), 0),
    COALESCE(SUM(r.total_amount), 0)
  INTO v_total_guests, v_total_bookings, v_total_rooms_sold, v_total_revenue
  FROM guest_market_segments gms
  JOIN reservations r ON gms.guest_id = r.guest_id
  WHERE gms.segment_id = p_segment_id
    AND gms.is_primary = TRUE
    AND DATE(r.check_in_date) = p_metric_date;
  
  -- Calculate average rate
  IF v_total_rooms_sold > 0 THEN
    v_avg_rate := v_total_revenue / v_total_rooms_sold;
  END IF;
  
  -- Insert or update metrics
  INSERT INTO segment_metrics (
    segment_id, metric_date, total_guests, total_bookings, 
    total_rooms_sold, total_revenue, avg_rate
  ) VALUES (
    p_segment_id, p_metric_date, v_total_guests, v_total_bookings,
    v_total_rooms_sold, v_total_revenue, v_avg_rate
  )
  ON CONFLICT (segment_id, metric_date)
  DO UPDATE SET
    total_guests = EXCLUDED.total_guests,
    total_bookings = EXCLUDED.total_bookings,
    total_rooms_sold = EXCLUDED.total_rooms_sold,
    total_revenue = EXCLUDED.total_revenue,
    avg_rate = EXCLUDED.avg_rate
  RETURNING id INTO v_metric_id;
  
  RETURN v_metric_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default market segments
INSERT INTO market_segments (segment_code, segment_name, description, priority, revenue_weight) VALUES
  ('LEISURE', 'Leisure Travelers', 'Individual leisure travelers booking for personal reasons', 1, 1.0),
  ('CORPORATE', 'Corporate/Business', 'Business travelers and corporate accounts', 2, 1.2),
  ('GROUP', 'Group Bookings', 'Group reservations and tour operator bookings', 3, 0.9),
  ('GOVERNMENT', 'Government/Official', 'Government employees and official travel', 4, 0.8),
  ('AIRLINE', 'Airline Crew', 'Airline crew and staff accommodations', 5, 0.7),
  ('LONG_STAY', 'Long Stay', 'Extended stay guests (7+ nights)', 6, 1.3),
  ('WEDDING', 'Wedding/Events', 'Wedding parties and event guests', 7, 1.1),
  ('VIP', 'VIP/Executive', 'High-value VIP guests and executives', 8, 2.0)
ON CONFLICT (segment_code) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON market_segments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON guest_market_segments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON segment_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON segment_booking_patterns TO authenticated;

GRANT EXECUTE ON FUNCTION assign_guest_primary_segment TO authenticated;
GRANT EXECUTE ON FUNCTION get_guest_segments TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_segment_metrics TO authenticated;

-- RLS policies
ALTER TABLE market_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_market_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_booking_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read market segments" ON market_segments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write market segments" ON market_segments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read guest segments" ON guest_market_segments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write guest segments" ON guest_market_segments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read segment metrics" ON segment_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write segment metrics" ON segment_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );

CREATE POLICY "Authenticated can read segment patterns" ON segment_booking_patterns
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can write segment patterns" ON segment_booking_patterns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()::text AND r.name = 'admin'
    )
  );
