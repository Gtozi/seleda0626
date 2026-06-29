-- Drop existing yield_policies table if it exists with different structure
DROP TABLE IF EXISTS yield_policies CASCADE;

-- Create yield policies table
CREATE TABLE yield_policies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_yield_policies_default ON yield_policies(is_default) WHERE is_default = TRUE;

-- Insert default yield policies
INSERT INTO yield_policies (id, name, description, multiplier, is_default) VALUES
  ('yield_1', 'Standard Rate', 'Default standard rate multiplier', 1.0, TRUE),
  ('yield_2', 'Peak Season', 'High demand period multiplier', 1.3, FALSE),
  ('yield_3', 'Low Season', 'Low demand period multiplier', 0.8, FALSE),
  ('yield_4', 'Weekend Premium', 'Weekend rate multiplier', 1.15, FALSE),
  ('yield_5', 'Last Minute', 'Urgent booking discount', 0.9, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_yield_policies_updated_at
  BEFORE UPDATE ON yield_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
