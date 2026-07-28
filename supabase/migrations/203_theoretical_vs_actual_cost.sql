-- Migration 203: Theoretical vs Actual Cost Analysis
-- Phase 3 Item 3: Compute theoretical cost from POS sales × recipe cost
-- vs actual stock depletion, wastage, and inventory movements.

-- ── 1. Theoretical Cost Function ────────────────────────────────────────
-- Computes theoretical cost from POS sales line_items × recipe costs
-- for a given date range and optional outlet filter.
CREATE OR REPLACE FUNCTION public.compute_theoretical_cost(
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT CURRENT_DATE,
  p_outlet_id UUID DEFAULT NULL
) RETURNS TABLE (
  menu_item_id TEXT,
  menu_item_name TEXT,
  total_quantity NUMERIC,
  recipe_cost_per_unit NUMERIC,
  theoretical_cost NUMERIC,
  actual_revenue NUMERIC
) AS $$
BEGIN
  -- Expand JSONB line_items from pos_transactions and join to recipes
  RETURN QUERY
  WITH sold_items AS (
    SELECT
      (li->>'menu_item_id')::TEXT AS menu_item_id,
      COALESCE(li->>'name', 'Unknown') AS menu_item_name,
      COALESCE((li->>'quantity')::NUMERIC, 0) AS quantity,
      COALESCE((li->>'price')::NUMERIC, 0) AS price,
      t.outlet_id
    FROM public.pos_transactions t,
        LATERAL jsonb_array_elements(t.line_items) AS li
    WHERE t.business_date >= p_start_date
      AND t.business_date <= p_end_date
      AND t.status = 'completed'
      AND (p_outlet_id IS NULL OR t.outlet_id = p_outlet_id)
  ),
  recipe_costs AS (
    -- Core recipes via recipe_lines → ingredients
    SELECT
      r.menu_item_id::TEXT AS menu_item_id,
      SUM(rl.quantity * COALESCE(i.current_cost, 0)) / COALESCE(r.portions, 1) AS cost_per_unit
    FROM public.recipes r
    JOIN public.recipe_lines rl ON rl.recipe_id = r.id
    LEFT JOIN public.ingredients i ON i.id = rl.ingredient_id
    GROUP BY r.id, r.menu_item_id, r.portions

    UNION ALL

    -- Kitchen recipes
    SELECT
      kr.id::TEXT AS menu_item_id,
      kr.cost_per_portion AS cost_per_unit
    FROM public.kitchen_recipes kr
    WHERE kr.is_deleted = false AND kr.status = 'active'

    UNION ALL

    -- Bar recipes
    SELECT
      br.id::TEXT AS menu_item_id,
      br.cost_per_portion AS cost_per_unit
    FROM public.bar_recipes br
    WHERE br.is_deleted = false AND br.status = 'active'

    UNION ALL

    -- POS menu items with recipe_id link
    SELECT
      pmi.id::TEXT AS menu_item_id,
      COALESCE(pmi.cost_price, 0) AS cost_per_unit
    FROM public.pos_menu_items pmi
    WHERE pmi.is_active = true
  )
  SELECT
    si.menu_item_id,
    si.menu_item_name,
    SUM(si.quantity) AS total_quantity,
    COALESCE(MAX(rc.cost_per_unit), 0) AS recipe_cost_per_unit,
    SUM(si.quantity) * COALESCE(MAX(rc.cost_per_unit), 0) AS theoretical_cost,
    SUM(si.quantity * si.price) AS actual_revenue
  FROM sold_items si
  LEFT JOIN recipe_costs rc ON rc.menu_item_id = si.menu_item_id
  GROUP BY si.menu_item_id, si.menu_item_name
  ORDER BY theoretical_cost DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.compute_theoretical_cost(DATE, DATE, UUID) IS
  'Computes theoretical cost from POS sales × recipe costs for a date range';

-- ── 2. Actual Cost Function ─────────────────────────────────────────────
-- Computes actual cost from stock depletion, wastage, and inventory movements.
CREATE OR REPLACE FUNCTION public.compute_actual_cost(
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT CURRENT_DATE,
  p_outlet_id UUID DEFAULT NULL
) RETURNS TABLE (
  source TEXT,
  item_id TEXT,
  item_name TEXT,
  total_quantity NUMERIC,
  unit_cost NUMERIC,
  actual_cost NUMERIC
) AS $$
BEGIN
  -- Core stock transactions (depletion = negative quantity)
  RETURN QUERY
  SELECT
    'stock_transaction'::TEXT AS source,
    st.ingredient_id::TEXT AS item_id,
    COALESCE(i.name, 'Unknown') AS item_name,
    SUM(ABS(st.quantity)) AS total_quantity,
    COALESCE(AVG(ABS(st.cost_per_unit)), 0) AS unit_cost,
    SUM(ABS(st.total_value)) AS actual_cost
  FROM public.stock_transactions st
  LEFT JOIN public.ingredients i ON i.id = st.ingredient_id
  WHERE st.date >= p_start_date::TIMESTAMPTZ
    AND st.date <= (p_end_date::TIMESTAMPTZ + INTERVAL '1 day')
    AND st.quantity < 0
    AND st.transaction_type IN ('Requisition','Transfer','WastageWriteoff','POSDepletion','StockCount')
  GROUP BY st.ingredient_id, i.name;

  -- Wastage logs
  RETURN QUERY
  SELECT
    'wastage'::TEXT AS source,
    w.ingredient_id::TEXT AS item_id,
    COALESCE(i.name, 'Unknown') AS item_name,
    SUM(w.quantity) AS total_quantity,
    COALESCE(AVG(w.unit_cost), 0) AS unit_cost,
    SUM(w.total_cost) AS actual_cost
  FROM public.wastage_logs w
  LEFT JOIN public.ingredients i ON i.id = w.ingredient_id
  WHERE w.created_at >= p_start_date::TIMESTAMPTZ
    AND w.created_at <= (p_end_date::TIMESTAMPTZ + INTERVAL '1 day')
  GROUP BY w.ingredient_id, i.name;

  -- Kitchen inventory movements (out direction)
  RETURN QUERY
  SELECT
    'kitchen_movement'::TEXT AS source,
    kim.inventory_item_id::TEXT AS item_id,
    COALESCE(ki.name, 'Unknown') AS item_name,
    SUM(ABS(kim.quantity)) AS total_quantity,
    COALESCE(AVG(ABS(kim.unit_cost)), 0) AS unit_cost,
    SUM(ABS(kim.total_cost)) AS actual_cost
  FROM public.kitchen_inventory_movements kim
  LEFT JOIN public.kitchen_inventory_items ki ON ki.id = kim.inventory_item_id
  WHERE kim.created_at >= p_start_date::TIMESTAMPTZ
    AND kim.created_at <= (p_end_date::TIMESTAMPTZ + INTERVAL '1 day')
    AND kim.direction = 'out'
  GROUP BY kim.inventory_item_id, ki.name;

  -- Bar inventory movements (out direction)
  RETURN QUERY
  SELECT
    'bar_movement'::TEXT AS source,
    bim.inventory_item_id::TEXT AS item_id,
    COALESCE(bi.name, 'Unknown') AS item_name,
    SUM(ABS(bim.quantity)) AS total_quantity,
    COALESCE(AVG(ABS(bim.unit_cost)), 0) AS unit_cost,
    SUM(ABS(bim.total_cost)) AS actual_cost
  FROM public.bar_inventory_movements bim
  LEFT JOIN public.bar_inventory_items bi ON bi.id = bim.inventory_item_id
  WHERE bim.created_at >= p_start_date::TIMESTAMPTZ
    AND bim.created_at <= (p_end_date::TIMESTAMPTZ + INTERVAL '1 day')
    AND bim.direction = 'out'
  GROUP BY bim.inventory_item_id, bi.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.compute_actual_cost(DATE, DATE, UUID) IS
  'Computes actual cost from stock depletion, wastage, and inventory movements';

-- ── 3. Cost Variance Summary Function ───────────────────────────────────
-- Returns a summary comparing theoretical vs actual cost for a date range.
CREATE OR REPLACE FUNCTION public.compute_cost_variance_summary(
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT CURRENT_DATE,
  p_outlet_id UUID DEFAULT NULL
) RETURNS TABLE (
  theoretical_total NUMERIC,
  actual_total NUMERIC,
  variance_amount NUMERIC,
  variance_percent NUMERIC,
  actual_revenue NUMERIC,
  actual_food_cost_percent NUMERIC,
  theoretical_food_cost_percent NUMERIC
) AS $$
DECLARE
  v_theoretical NUMERIC;
  v_actual NUMERIC;
  v_revenue NUMERIC;
BEGIN
  -- Sum theoretical cost
  SELECT COALESCE(SUM(theoretical_cost), 0) INTO v_theoretical
  FROM public.compute_theoretical_cost(p_start_date, p_end_date, p_outlet_id);

  -- Sum actual cost
  SELECT COALESCE(SUM(actual_cost), 0) INTO v_actual
  FROM public.compute_actual_cost(p_start_date, p_end_date, p_outlet_id);

  -- Sum actual revenue
  SELECT COALESCE(SUM(actual_revenue), 0) INTO v_revenue
  FROM public.compute_theoretical_cost(p_start_date, p_end_date, p_outlet_id);

  RETURN QUERY
  SELECT
    v_theoretical,
    v_actual,
    (v_actual - v_theoretical),
    CASE WHEN v_theoretical > 0 THEN ((v_actual - v_theoretical) / v_theoretical * 100) ELSE 0 END,
    v_revenue,
    CASE WHEN v_revenue > 0 THEN (v_actual / v_revenue * 100) ELSE 0 END,
    CASE WHEN v_revenue > 0 THEN (v_theoretical / v_revenue * 100) ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.compute_cost_variance_summary(DATE, DATE, UUID) IS
  'Returns a summary comparing theoretical vs actual cost with variance';
