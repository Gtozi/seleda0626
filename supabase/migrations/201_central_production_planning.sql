-- Migration 201: Central Production Planning
-- Phase 3 Item 1: Unified prep list generation from reservations, BEOs,
-- forecasted covers, and historical POS sales. Pushes tasks to KDS.

-- ── 1. Production Prep List ─────────────────────────────────────────────
-- A central table for generated prep lists that can span kitchen and bar.
CREATE TABLE IF NOT EXISTS public.production_prep_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  outlet_id UUID REFERENCES public.pos_outlets(id) ON DELETE SET NULL,
  prep_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_period TEXT DEFAULT 'all' CHECK (meal_period IN ('breakfast','lunch','dinner','brunch','tea_time','all')),
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual','reservation','banquet','forecast','pos_history')),
  -- Cover / demand inputs
  forecast_covers INTEGER NOT NULL DEFAULT 0,
  reservation_covers INTEGER NOT NULL DEFAULT 0,
  banquet_covers INTEGER NOT NULL DEFAULT 0,
  -- Aggregate
  total_demand INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','in_production','completed','cancelled')),
  notes TEXT,
  created_by TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prep_lists_outlet ON public.production_prep_lists(outlet_id);
CREATE INDEX IF NOT EXISTS idx_prep_lists_date ON public.production_prep_lists(prep_date);
CREATE INDEX IF NOT EXISTS idx_prep_lists_status ON public.production_prep_lists(status);

ALTER TABLE public.production_prep_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all prep_lists" ON public.production_prep_lists;
CREATE POLICY "service_role all prep_lists" ON public.production_prep_lists FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read prep_lists" ON public.production_prep_lists;
CREATE POLICY "authenticated read prep_lists" ON public.production_prep_lists FOR SELECT
    USING (auth.role() = 'authenticated');

-- ── 2. Prep List Lines ──────────────────────────────────────────────────
-- Individual recipe/production items within a prep list.
CREATE TABLE IF NOT EXISTS public.production_prep_list_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prep_list_id UUID NOT NULL REFERENCES public.production_prep_lists(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL,           -- FK to kitchen_recipes or bar_recipes
  recipe_source TEXT NOT NULL DEFAULT 'kitchen' CHECK (recipe_source IN ('kitchen','bar')),
  recipe_name TEXT NOT NULL,         -- denormalized for convenience
  yield_qty NUMERIC(12,3) NOT NULL DEFAULT 1,
  yield_unit TEXT NOT NULL DEFAULT 'portion',
  -- Demand calculation
  covers INTEGER NOT NULL DEFAULT 0,
  portions_per_cover NUMERIC(5,2) NOT NULL DEFAULT 1.0,
  forecast_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  current_stock_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  suggested_production_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  -- KDS routing
  prep_station_id UUID REFERENCES public.pos_prep_stations(id) ON DELETE SET NULL,
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','in_production','completed','skipped')),
  -- Cost
  cost_per_unit NUMERIC(12,4) NOT NULL DEFAULT 0,
  estimated_total_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prep_list_lines_list ON public.production_prep_list_lines(prep_list_id);
CREATE INDEX IF NOT EXISTS idx_prep_list_lines_recipe ON public.production_prep_list_lines(recipe_id);
CREATE INDEX IF NOT EXISTS idx_prep_list_lines_station ON public.production_prep_list_lines(prep_station_id);
CREATE INDEX IF NOT EXISTS idx_prep_list_lines_status ON public.production_prep_list_lines(status);

ALTER TABLE public.production_prep_list_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all prep_list_lines" ON public.production_prep_list_lines;
CREATE POLICY "service_role all prep_list_lines" ON public.production_prep_list_lines FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read prep_list_lines" ON public.production_prep_list_lines;
CREATE POLICY "authenticated read prep_list_lines" ON public.production_prep_list_lines FOR SELECT
    USING (auth.role() = 'authenticated');

-- ── 3. Forecast Covers Function ─────────────────────────────────────────
-- Computes forecast covers for a given date from reservations, banquet events,
-- and historical POS sales (last 4 weeks same day-of-week average).
CREATE OR REPLACE FUNCTION public.compute_forecast_covers(
  p_planning_date DATE DEFAULT CURRENT_DATE,
  p_outlet_id UUID DEFAULT NULL
) RETURNS TABLE (
  source TEXT,
  covers INTEGER,
  detail JSONB
) AS $$
DECLARE
  v_res_covers INTEGER;
  v_banquet_covers INTEGER;
  v_pos_avg INTEGER;
  v_dow INTEGER;
BEGIN
  v_dow := EXTRACT(DOW FROM p_planning_date);

  -- Reservation covers: guests checking in or staying on the planning date
  SELECT COALESCE(SUM(
    CASE WHEN p_outlet_id IS NULL THEN 2
         ELSE 2
    END
  ), 0)
  INTO v_res_covers
  FROM public.reservations
  WHERE check_in_date <= p_planning_date
    AND check_out_date > p_planning_date
    AND status IN ('Confirmed','Checked-in');

  -- Banquet event covers
  SELECT COALESCE(SUM(guest_count), 0)
  INTO v_banquet_covers
  FROM public.banquet_events
  WHERE event_date = p_planning_date
    AND status IN ('Confirmed','InProgress');

  -- Historical POS average: same day-of-week, last 4 weeks
  SELECT COALESCE(AVG(daily_count), 0)::INTEGER
  INTO v_pos_avg
  FROM (
    SELECT DATE(transaction_date) AS d, COUNT(*) AS daily_count
    FROM public.pos_transactions
    WHERE transaction_date >= p_planning_date - INTERVAL '28 days'
      AND transaction_date < p_planning_date
      AND EXTRACT(DOW FROM transaction_date) = v_dow
      AND (p_outlet_id IS NULL OR outlet_id = p_outlet_id)
    GROUP BY DATE(transaction_date)
  ) sub;

  RETURN QUERY
  SELECT 'reservation'::TEXT, v_res_covers, jsonb_build_object('date', p_planning_date);

  RETURN QUERY
  SELECT 'banquet'::TEXT, v_banquet_covers, jsonb_build_object('date', p_planning_date);

  RETURN QUERY
  SELECT 'pos_history'::TEXT, v_pos_avg, jsonb_build_object('weeks_back', 4, 'day_of_week', v_dow);

  RETURN QUERY
  SELECT 'forecast'::TEXT, GREATEST(v_res_covers + v_banquet_covers, v_pos_avg, (v_res_covers + v_banquet_covers + v_pos_avg) / 2)::INTEGER,
         jsonb_build_object('reservation', v_res_covers, 'banquet', v_banquet_covers, 'pos_avg', v_pos_avg);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.compute_forecast_covers(DATE, UUID) IS
  'Computes forecast covers from reservations, banquet events, and historical POS sales';

-- ── 4. Generate Prep List Function ──────────────────────────────────────
-- Generates a full prep list with suggested production quantities for all
-- active recipes at a given outlet, based on forecast covers.
CREATE OR REPLACE FUNCTION public.generate_prep_list(
  p_outlet_id UUID,
  p_planning_date DATE DEFAULT CURRENT_DATE,
  p_meal_period TEXT DEFAULT 'all',
  p_portions_per_cover_kitchen NUMERIC(5,2) DEFAULT 0.5,
  p_portions_per_cover_bar NUMERIC(5,2) DEFAULT 0.3
) RETURNS TABLE (
  recipe_id UUID,
  recipe_source TEXT,
  recipe_name TEXT,
  yield_qty NUMERIC,
  yield_unit TEXT,
  covers INTEGER,
  portions_per_cover NUMERIC,
  forecast_qty NUMERIC,
  current_stock_qty NUMERIC,
  suggested_production_qty NUMERIC,
  prep_station_id UUID,
  cost_per_unit NUMERIC,
  estimated_total_cost NUMERIC
) AS $$
DECLARE
  v_covers INTEGER;
BEGIN
  -- Get forecast covers for this outlet and date
  SELECT COALESCE(SUM(covers), 0) INTO v_covers
  FROM public.compute_forecast_covers(p_planning_date, p_outlet_id)
  WHERE source = 'forecast';

  -- Kitchen recipes
  RETURN QUERY
  SELECT
    kr.id,
    'kitchen'::TEXT,
    kr.name,
    kr.yield_qty,
    kr.yield_unit,
    v_covers,
    p_portions_per_cover_kitchen,
    (v_covers * p_portions_per_cover_kitchen)::NUMERIC(12,3),
    COALESCE(kii.on_hand_qty, 0)::NUMERIC(12,3),
    GREATEST(
      (v_covers * p_portions_per_cover_kitchen) - COALESCE(kii.on_hand_qty, 0),
      0
    )::NUMERIC(12,3),
    NULL::UUID,
    kr.cost_per_portion,
    GREATEST(
      (v_covers * p_portions_per_cover_kitchen) - COALESCE(kii.on_hand_qty, 0),
      0
    ) * kr.cost_per_portion
  FROM public.kitchen_recipes kr
  LEFT JOIN public.kitchen_inventory_items kii ON kii.recipe_id = kr.id AND kii.is_active = true
  WHERE kr.outlet_id = p_outlet_id
    AND kr.recipe_type = 'menu_item'
    AND kr.status = 'active'
    AND kr.is_deleted = false;

  -- Bar recipes
  RETURN QUERY
  SELECT
    br.id,
    'bar'::TEXT,
    br.name,
    br.yield_qty,
    br.yield_unit,
    v_covers,
    p_portions_per_cover_bar,
    (v_covers * p_portions_per_cover_bar)::NUMERIC(12,3),
    COALESCE(bii.on_hand_qty, 0)::NUMERIC(12,3),
    GREATEST(
      (v_covers * p_portions_per_cover_bar) - COALESCE(bii.on_hand_qty, 0),
      0
    )::NUMERIC(12,3),
    NULL::UUID,
    br.cost_per_portion,
    GREATEST(
      (v_covers * p_portions_per_cover_bar) - COALESCE(bii.on_hand_qty, 0),
      0
    ) * br.cost_per_portion
  FROM public.bar_recipes br
  LEFT JOIN public.bar_inventory_items bii ON bii.recipe_id = br.id AND bii.is_active = true
  WHERE br.outlet_id = p_outlet_id
    AND br.recipe_type = 'drink_item'
    AND br.status = 'active'
    AND br.is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.generate_prep_list(UUID, DATE, TEXT, NUMERIC, NUMERIC) IS
  'Generates a full prep list with suggested production quantities for an outlet';

-- ── 5. Add prep list columns to kds_orders ──────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kds_orders' AND column_name = 'prep_list_id'
  ) THEN
    ALTER TABLE public.kds_orders ADD COLUMN prep_list_id UUID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kds_orders' AND column_name = 'prep_list_line_id'
  ) THEN
    ALTER TABLE public.kds_orders ADD COLUMN prep_list_line_id UUID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kds_orders' AND column_name = 'order_type'
  ) THEN
    ALTER TABLE public.kds_orders ADD COLUMN order_type TEXT DEFAULT 'pos';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kds_orders' AND column_name = 'items'
  ) THEN
    ALTER TABLE public.kds_orders ADD COLUMN items JSONB DEFAULT '[]';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_kds_orders_prep_list ON public.kds_orders(prep_list_id);
CREATE INDEX IF NOT EXISTS idx_kds_orders_order_type ON public.kds_orders(order_type);

-- ── 6. Triggers ─────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS update_prep_lists_updated_at ON public.production_prep_lists;
CREATE TRIGGER update_prep_lists_updated_at BEFORE UPDATE ON public.production_prep_lists
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_prep_list_lines_updated_at ON public.production_prep_list_lines;
CREATE TRIGGER update_prep_list_lines_updated_at BEFORE UPDATE ON public.production_prep_list_lines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
