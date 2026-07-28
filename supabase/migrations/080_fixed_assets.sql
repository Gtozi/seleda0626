-- ============================================================
-- Finance & Accounting - Fixed Assets
-- ============================================================

-- Drop table if it exists to ensure clean schema (for development)
DROP TABLE IF EXISTS fixed_assets CASCADE;
DROP TABLE IF EXISTS depreciation_schedules CASCADE;

CREATE TABLE fixed_assets (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  asset_code text NOT NULL UNIQUE,
  asset_name text NOT NULL,
  asset_category text NOT NULL DEFAULT 'Other',
  description text,
  location text,
  purchase_date date NOT NULL,
  purchase_cost numeric(18,2) NOT NULL DEFAULT 0,
  salvage_value numeric(18,2) NOT NULL DEFAULT 0,
  useful_life_years int NOT NULL,
  depreciation_method text NOT NULL DEFAULT 'Straight Line' CHECK (depreciation_method IN ('Straight Line', 'Reducing Balance', 'Units of Production')),
  accumulated_depreciation numeric(18,2) NOT NULL DEFAULT 0,
  net_book_value numeric(18,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Under Maintenance', 'Disposal Pending', 'Disposed', 'Written Off')),
  disposal_date date,
  disposal_value numeric(18,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fixed_assets_category ON fixed_assets(asset_category);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_status ON fixed_assets(status);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_purchase_date ON fixed_assets(purchase_date);

CREATE TABLE IF NOT EXISTS depreciation_schedules (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  asset_id text NOT NULL REFERENCES fixed_assets(id) ON DELETE CASCADE,
  fiscal_year int NOT NULL,
  depreciation_amount numeric(18,2) NOT NULL DEFAULT 0,
  accumulated_depreciation numeric(18,2) NOT NULL DEFAULT 0,
  net_book_value numeric(18,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_depreciation_schedules_asset_id ON depreciation_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_depreciation_schedules_fiscal_year ON depreciation_schedules(fiscal_year);

-- Function to calculate depreciation for an asset
CREATE OR REPLACE FUNCTION calculate_depreciation(
  p_asset_id text,
  p_fiscal_year int
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_asset record;
  v_years_elapsed int;
  v_depreciation_amount numeric;
  v_accumulated_depreciation numeric;
  v_net_book_value numeric;
BEGIN
  SELECT * INTO v_asset FROM fixed_assets WHERE id = p_asset_id;

  IF v_asset IS NULL THEN
    RAISE EXCEPTION 'Asset not found';
  END IF;

  v_years_elapsed := p_fiscal_year - EXTRACT(YEAR FROM v_asset.purchase_date);

  IF v_years_elapsed < 0 THEN
    RAISE EXCEPTION 'Fiscal year is before purchase date';
  END IF;

  IF v_years_elapsed >= v_asset.useful_life_years THEN
    v_depreciation_amount := 0;
  ELSE
    CASE v_asset.depreciation_method
      WHEN 'Straight Line' THEN
        v_depreciation_amount := (v_asset.purchase_cost - v_asset.salvage_value) / v_asset.useful_life_years;
      WHEN 'Reducing Balance' THEN
        v_depreciation_amount := (v_asset.net_book_value * 0.2); -- 20% reducing balance
      ELSE
        v_depreciation_amount := (v_asset.purchase_cost - v_asset.salvage_value) / v_asset.useful_life_years;
    END CASE;
  END IF;

  v_accumulated_depreciation := v_asset.accumulated_depreciation + v_depreciation_amount;
  v_net_book_value := v_asset.purchase_cost - v_accumulated_depreciation;

  -- Update asset
  UPDATE fixed_assets
  SET accumulated_depreciation = v_accumulated_depreciation,
      net_book_value = v_net_book_value,
      updated_at = now()
  WHERE id = p_asset_id;

  -- Insert or update depreciation schedule
  INSERT INTO depreciation_schedules (
    asset_id,
    fiscal_year,
    depreciation_amount,
    accumulated_depreciation,
    net_book_value
  ) VALUES (
    p_asset_id,
    p_fiscal_year,
    v_depreciation_amount,
    v_accumulated_depreciation,
    v_net_book_value
  )
  ON CONFLICT (asset_id, fiscal_year) DO UPDATE SET
    depreciation_amount = v_depreciation_amount,
    accumulated_depreciation = v_accumulated_depreciation,
    net_book_value = v_net_book_value;

  RETURN jsonb_build_object(
    'depreciation_amount', v_depreciation_amount,
    'accumulated_depreciation', v_accumulated_depreciation,
    'net_book_value', v_net_book_value
  );
END;
$$;

-- Function to dispose of an asset
CREATE OR REPLACE FUNCTION dispose_asset(
  p_asset_id text,
  p_disposal_date date,
  p_disposal_value numeric
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE fixed_assets
  SET status = 'Disposed',
      disposal_date = p_disposal_date,
      disposal_value = p_disposal_value,
      updated_at = now()
  WHERE id = p_asset_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
