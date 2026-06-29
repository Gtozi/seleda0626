-- Drop existing seasons table if it exists with different structure
DROP TABLE IF EXISTS seasons CASCADE;

-- Create seasons table
CREATE TABLE seasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_month INTEGER NOT NULL CHECK (start_month >= 0 AND start_month <= 11),
  start_day INTEGER NOT NULL CHECK (start_day >= 1 AND start_day <= 31),
  end_month INTEGER NOT NULL CHECK (end_month >= 0 AND end_month <= 11),
  end_day INTEGER NOT NULL CHECK (end_day >= 1 AND end_day <= 31),
  multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default seasons
INSERT INTO seasons (id, name, start_month, start_day, end_month, end_day, multiplier) VALUES
  ('season_1', 'Summer Peak', 5, 15, 8, 31, 1.3),
  ('season_2', 'Winter Holiday', 11, 20, 0, 10, 1.4),
  ('season_3', 'Spring Shoulder', 2, 15, 5, 14, 1.0),
  ('season_4', 'Autumn Shoulder', 9, 1, 11, 19, 0.95),
  ('season_5', 'Low Season', 0, 11, 2, 14, 0.8)
ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_seasons_updated_at
  BEFORE UPDATE ON seasons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
