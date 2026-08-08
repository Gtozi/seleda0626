-- Keys & Access System Migration
-- Creates tables for key management, encoder tracking, and access logs

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Keys table - stores all key records (guest keys, staff keys, master keys)
CREATE TABLE IF NOT EXISTS keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_name TEXT,
  reservation_id TEXT,
  room_number TEXT,
  staff_name TEXT,
  staff_role TEXT,
  key_code TEXT NOT NULL UNIQUE,
  key_type TEXT NOT NULL CHECK (key_type IN ('physical', 'digital', 'nfc', 'mobile')),
  access_level TEXT NOT NULL CHECK (access_level IN ('guest', 'staff', 'master', 'service', 'emergency')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'lost', 'damaged', 'returned', 'master')),
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  returned_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  issued_by TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on key_code for fast lookups
CREATE INDEX idx_keys_key_code ON keys(key_code);
CREATE INDEX idx_keys_status ON keys(status);
CREATE INDEX idx_keys_access_level ON keys(access_level);
CREATE INDEX idx_keys_reservation_id ON keys(reservation_id);
CREATE INDEX idx_keys_room_number ON keys(room_number);
CREATE INDEX idx_keys_expires_at ON keys(expires_at);
CREATE INDEX idx_keys_issued_at ON keys(issued_at);

-- Key Encoders table - tracks encoder devices
CREATE TABLE IF NOT EXISTS key_encoders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance')),
  last_used TIMESTAMP WITH TIME ZONE,
  encodings_today INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on encoder status
CREATE INDEX idx_key_encoders_status ON key_encoders(status);

-- Access Logs table - tracks all key access events
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  room TEXT NOT NULL,
  key_code TEXT NOT NULL,
  event TEXT NOT NULL CHECK (event IN ('access_granted', 'access_denied', 'elevator_access', 'door_unlocked')),
  device TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for log queries
CREATE INDEX idx_access_logs_time ON access_logs(time DESC);
CREATE INDEX idx_access_logs_key_code ON access_logs(key_code);
CREATE INDEX idx_access_logs_room ON access_logs(room);
CREATE INDEX idx_access_logs_event ON access_logs(event);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_keys_updated_at BEFORE UPDATE ON keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_key_encoders_updated_at BEFORE UPDATE ON key_encoders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to reset encodings_today daily (runs via scheduled job)
CREATE OR REPLACE FUNCTION reset_encodings_today()
RETURNS VOID AS $$
BEGIN
  UPDATE key_encoders SET encodings_today = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to increment encodings_today for a specific encoder
CREATE OR REPLACE FUNCTION increment_encodings_today(p_encoder_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE key_encoders
  SET encodings_today = encodings_today + 1,
      last_used = NOW()
  WHERE id = p_encoder_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on encoder functions
GRANT EXECUTE ON FUNCTION reset_encodings_today() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_encodings_today(UUID) TO authenticated;

-- RLS Policies (Row Level Security)
ALTER TABLE keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_encoders ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Keys RLS policies
DROP POLICY IF EXISTS "service_role all keys" ON keys;
CREATE POLICY "service_role all keys"
  ON keys FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "authenticated read keys" ON keys;
CREATE POLICY "authenticated read keys"
  ON keys FOR SELECT
  USING (auth.role() = 'authenticated');

-- Key Encoders RLS policies
DROP POLICY IF EXISTS "service_role all key_encoders" ON key_encoders;
CREATE POLICY "service_role all key_encoders"
  ON key_encoders FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "authenticated read key_encoders" ON key_encoders;
CREATE POLICY "authenticated read key_encoders"
  ON key_encoders FOR SELECT
  USING (auth.role() = 'authenticated');

-- Access Logs RLS policies
DROP POLICY IF EXISTS "service_role all access_logs" ON access_logs;
CREATE POLICY "service_role all access_logs"
  ON access_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "authenticated read access_logs" ON access_logs;
CREATE POLICY "authenticated read access_logs"
  ON access_logs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Function to get key statistics
CREATE OR REPLACE FUNCTION get_key_stats()
RETURNS JSON AS $$
DECLARE
  active_keys INTEGER;
  due_out_today INTEGER;
  lost_damaged INTEGER;
  online_encoders INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_keys
  FROM keys
  WHERE status = 'active';

  SELECT COUNT(*) INTO due_out_today
  FROM keys
  WHERE status = 'active'
  AND DATE(expires_at) = CURRENT_DATE;

  SELECT COUNT(*) INTO lost_damaged
  FROM keys
  WHERE status IN ('lost', 'damaged');

  SELECT COUNT(*) INTO online_encoders
  FROM key_encoders
  WHERE status = 'online';

  RETURN json_build_object(
    'activeKeys', active_keys,
    'dueOutToday', due_out_today,
    'lostDamaged', lost_damaged,
    'onlineEncoders', online_encoders
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on stats function
GRANT EXECUTE ON FUNCTION get_key_stats() TO authenticated;

-- Insert sample encoder data
INSERT INTO key_encoders (name, location, status, encodings_today) VALUES
  ('Front Desk A', 'Lobby', 'online', 0),
  ('Front Desk B', 'Lobby', 'online', 0),
  ('Housekeeping Master', 'Back office', 'online', 0),
  ('Mobile Key Server', 'Server room', 'online', 0)
ON CONFLICT DO NOTHING;

-- Comment on tables
COMMENT ON TABLE keys IS 'Stores all key records including guest keys, staff keys, and master keys';
COMMENT ON TABLE key_encoders IS 'Tracks key encoder devices and their status';
COMMENT ON TABLE access_logs IS 'Logs all key access events for security auditing';