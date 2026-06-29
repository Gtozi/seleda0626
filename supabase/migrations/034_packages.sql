-- Drop existing packages table if it exists with different structure
DROP TABLE IF EXISTS packages CASCADE;

-- Create packages table
CREATE TABLE packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  type TEXT NOT NULL DEFAULT 'special_occasion',
  charge_frequency TEXT DEFAULT 'once' CHECK (charge_frequency IN ('once', 'daily')),
  applicable_room_types TEXT[],
  amenities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for package types
CREATE INDEX IF NOT EXISTS idx_packages_type ON packages(type);

-- Insert default packages
INSERT INTO packages (id, name, description, price, type, charge_frequency, amenities) VALUES
  ('pkg_1', 'Birthday Package', 'Celebrate with champagne, cake, and decorations', 150.00, 'special_occasion', 'once', ARRAY['Champagne', 'Birthday Cake', 'Decorations', 'Late Checkout']),
  ('pkg_2', 'Honeymoon Package', 'Romantic getaway with special amenities', 299.00, 'romance', 'once', ARRAY['Champagne', 'Rose Petals', 'Spa Treatment', 'Late Checkout', 'Romantic Dinner']),
  ('pkg_3', 'Geralta Mountain Hiking', 'Guided hiking tour with equipment', 250.00, 'adventure', 'once', ARRAY['Guide Service', 'Equipment Rental', 'Packed Lunch', 'Transportation']),
  ('pkg_4', 'Wellness Package', 'Complete spa and wellness experience', 200.00, 'wellness', 'once', ARRAY['Spa Treatment', 'Massage', 'Healthy Meals', 'Yoga Session']),
  ('pkg_5', 'Business Package', 'Complete business traveler amenities', 175.00, 'business', 'once', ARRAY['High-Speed Internet', 'Meeting Room Access', 'Business Center', 'Airport Transfer'])
ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
