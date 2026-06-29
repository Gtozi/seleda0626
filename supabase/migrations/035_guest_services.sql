-- Drop existing guest_services table if it exists with different structure
DROP TABLE IF EXISTS guest_services CASCADE;

-- Create guest services table
CREATE TABLE guest_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'dining' CHECK (category IN ('dining', 'transportation', 'laundry', 'spa', 'room_service', 'concierge')),
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for available services
CREATE INDEX IF NOT EXISTS idx_guest_services_available ON guest_services(available) WHERE available = TRUE;
CREATE INDEX IF NOT EXISTS idx_guest_services_category ON guest_services(category);

-- Insert default guest services
INSERT INTO guest_services (id, name, description, category, price, available) VALUES
  ('gs_1', 'Lunch', 'Daily lunch service with local and international cuisine', 'dining', 25.00, TRUE),
  ('gs_2', 'Dinner', 'Dinner service featuring gourmet dishes and local specialties', 'dining', 35.00, TRUE),
  ('gs_3', 'Airport Shuttle', '24/7 airport transfer service to and from Geralta Airport', 'transportation', 50.00, TRUE),
  ('gs_4', 'Laundry Service', 'Same-day laundry and dry cleaning service', 'laundry', 20.00, TRUE),
  ('gs_5', 'Spa Treatment', 'Full spa treatment with massage and wellness services', 'spa', 80.00, TRUE),
  ('gs_6', 'Room Service', '24/7 in-room dining service', 'room_service', 15.00, TRUE),
  ('gs_7', 'Concierge', 'Personal concierge assistance for tours and activities', 'concierge', 30.00, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_guest_services_updated_at
  BEFORE UPDATE ON guest_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
