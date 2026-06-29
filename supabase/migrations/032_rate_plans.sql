-- Drop existing rate_plans table if it exists with different structure
DROP TABLE IF EXISTS rate_plans CASCADE;

-- Create rate plans table
CREATE TABLE rate_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_modifier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  base_rate DECIMAL(10,2) DEFAULT 100.00,
  min_stay INTEGER DEFAULT 1,
  max_stay INTEGER DEFAULT 30,
  cancellation_policy TEXT DEFAULT '24h',
  applicable_room_types TEXT[],
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active rate plans
CREATE INDEX IF NOT EXISTS idx_rate_plans_active ON rate_plans(active) WHERE active = TRUE;

-- Insert default rate plans
INSERT INTO rate_plans (id, name, description, base_modifier, base_rate, min_stay, max_stay, cancellation_policy, active) VALUES
  ('rp_1', 'Standard Rate', 'Regular room rate', 1.0, 100.00, 1, 30, '24h', TRUE),
  ('rp_2', 'Extended Stay', 'Discount for longer stays', 0.85, 85.00, 7, 30, '48h', TRUE),
  ('rp_3', 'Last Minute Deal', 'Discount for same-day bookings', 0.7, 70.00, 1, 3, 'non-refundable', TRUE),
  ('rp_4', 'Premium Rate', 'Premium room rate with amenities', 1.25, 125.00, 1, 30, '24h', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_rate_plans_updated_at
  BEFORE UPDATE ON rate_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
