-- 040_create_airport_shuttle_requests_table.sql
-- Dedicated table for airport shuttle requests linked to guests and reservations

CREATE TABLE IF NOT EXISTS airport_shuttle_requests (
  id TEXT PRIMARY KEY,
  guest_id TEXT REFERENCES guests(id) ON DELETE CASCADE,
  reservation_id TEXT REFERENCES reservations(id) ON DELETE SET NULL,
  room_number TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  shuttle_type TEXT NOT NULL CHECK (shuttle_type IN ('Pickup', 'Drop-off')),
  flight_number TEXT,
  flight_time TIME,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')) DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_airport_shuttle_requests_scheduled_date ON airport_shuttle_requests(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_airport_shuttle_requests_status ON airport_shuttle_requests(status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_airport_shuttle_requests_updated_at ON airport_shuttle_requests;

CREATE TRIGGER update_airport_shuttle_requests_updated_at
  BEFORE UPDATE ON airport_shuttle_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
