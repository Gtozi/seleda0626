-- Migration 186: Bar Management Module — DB Functions
-- Drink recipe costing with unlimited nesting, batch prep completion, FEFO consumption,
-- POS integration, expiry alerts, spillage/waste processing, production planning.

-- ── 1. Recursive drink recipe cost calculation ──────────────────────────
CREATE OR REPLACE FUNCTION public.calculate_bar_recipe_cost(
  p_recipe_id UUID,
  p_portions NUMERIC DEFAULT 1
) RETURNS TABLE (
  total_cost NUMERIC,
  cost_per_portion NUMERIC,
  ingredient_count INTEGER,
  sub_recipe_count INTEGER,
  cost_breakdown JSONB
) AS $$
DECLARE
  v_recipe RECORD;
  v_total_cost NUMERIC := 0;
  v_breakdown JSONB := '[]'::jsonb;
  v_sub_count INTEGER := 0;
  v_ing_count INTEGER := 0;
BEGIN
  SELECT * INTO v_recipe FROM public.bar_recipes WHERE id = p_recipe_id;
  IF NOT FOUND THEN RETURN; END IF;

  WITH RECURSIVE ingredient_tree AS (
    SELECT
      kri.id, kri.recipe_id, kri.ingredient_type, kri.ingredient_id,
      kri.raw_ingredient_id, kri.quantity, kri.waste_percent, kri.unit,
      kri.cost_at_time_of_costing, 1 AS depth
    FROM public.bar_recipe_ingredients kri
    WHERE kri.recipe_id = p_recipe_id

    UNION ALL

    SELECT
      kri.id, kri.recipe_id, kri.ingredient_type, kri.ingredient_id,
      kri.raw_ingredient_id,
      kri.quantity * it.quantity * (1 + it.waste_percent / 100),
      kri.waste_percent, kri.unit, kri.cost_at_time_of_costing, it.depth + 1
    FROM public.bar_recipe_ingredients kri
    JOIN ingredient_tree it ON kri.recipe_id = it.ingredient_id
    WHERE it.ingredient_type = 'sub_recipe' AND it.ingredient_id IS NOT NULL
  )
  SELECT
    COALESCE(SUM(
      CASE
        WHEN it.ingredient_type = 'raw_material' AND it.raw_ingredient_id IS NOT NULL THEN
          it.quantity * (1 + it.waste_percent / 100) * COALESCE(it.cost_at_time_of_costing, ing.current_cost, 0)
        WHEN it.ingredient_type IN ('sub_recipe','finished_product') AND it.ingredient_id IS NOT NULL THEN
          it.quantity * (1 + it.waste_percent / 100) * COALESCE(it.cost_at_time_of_costing, br.total_cost / NULLIF(br.yield_qty, 0), 0)
        ELSE 0
      END
    ), 0),
    COUNT(*) FILTER (WHERE it.ingredient_type = 'raw_material'),
    COUNT(*) FILTER (WHERE it.ingredient_type = 'sub_recipe'),
    jsonb_agg(
      jsonb_build_object(
        'ingredient_type', it.ingredient_type, 'quantity', it.quantity,
        'unit', it.unit, 'waste_percent', it.waste_percent,
        'cost', CASE
          WHEN it.ingredient_type = 'raw_material' THEN
            it.quantity * (1 + it.waste_percent / 100) * COALESCE(it.cost_at_time_of_costing, ing.current_cost, 0)
          ELSE
            it.quantity * (1 + it.waste_percent / 100) * COALESCE(it.cost_at_time_of_costing, br.total_cost / NULLIF(br.yield_qty, 0), 0)
        END,
        'depth', it.depth
      )
    )
  INTO v_total_cost, v_ing_count, v_sub_count, v_breakdown
  FROM ingredient_tree it
  LEFT JOIN public.ingredients ing ON it.raw_ingredient_id = ing.id
  LEFT JOIN public.bar_recipes br ON it.ingredient_id = br.id;

  RETURN QUERY SELECT
    v_total_cost,
    CASE WHEN p_portions > 0 THEN v_total_cost / p_portions ELSE 0 END,
    v_ing_count, v_sub_count, v_breakdown;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.calculate_bar_recipe_cost(UUID, NUMERIC) IS
  'Recursively calculates drink recipe cost including nested sub-recipes with unlimited depth';

-- ── 2. Update drink recipe cost ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_bar_recipe_cost(
  p_recipe_id UUID
) RETURNS VOID AS $$
DECLARE
  v_cost NUMERIC;
  v_cost_per_portion NUMERIC;
  v_yield NUMERIC;
  v_selling_price NUMERIC;
  v_pour_cost_pct NUMERIC;
BEGIN
  SELECT yield_qty, selling_price INTO v_yield, v_selling_price
  FROM public.bar_recipes WHERE id = p_recipe_id;

  SELECT total_cost, cost_per_portion INTO v_cost, v_cost_per_portion
  FROM public.calculate_bar_recipe_cost(p_recipe_id, COALESCE(v_yield, 1));

  v_pour_cost_pct := CASE WHEN v_selling_price > 0 AND v_cost_per_portion > 0
    THEN (v_cost_per_portion / v_selling_price) * 100 ELSE 0 END;

  UPDATE public.bar_recipes
  SET total_cost = COALESCE(v_cost, 0),
      cost_per_portion = COALESCE(v_cost_per_portion, 0),
      pour_cost_percent = COALESCE(v_pour_cost_pct, 0)
  WHERE id = p_recipe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. FEFO batch consumption ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.consume_bar_batch_fefo(
  p_inventory_item_id UUID,
  p_quantity NUMERIC,
  p_consumption_method TEXT DEFAULT 'fefo',
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_performed_by TEXT DEFAULT NULL,
  p_to_location_id UUID DEFAULT NULL
) RETURNS TABLE (
  batch_id UUID,
  batch_number TEXT,
  quantity_consumed NUMERIC,
  unit_cost NUMERIC,
  total_cost NUMERIC
) AS $$
DECLARE
  v_remaining NUMERIC := p_quantity;
  v_batch RECORD;
  v_consume_qty NUMERIC;
  v_method TEXT := p_consumption_method;
  v_order_by TEXT;
BEGIN
  IF v_method = 'fifo' THEN
    v_order_by := 'production_date ASC, created_at ASC';
  ELSE
    v_order_by := 'expiry_date ASC NULLS LAST, production_date ASC, created_at ASC';
  END IF;

  FOR v_batch IN
    EXECUTE format(
      'SELECT * FROM public.bar_inventory_batches
       WHERE inventory_item_id = $1
         AND remaining_qty > 0
         AND status = ''active''
         AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
       ORDER BY %s
       FOR UPDATE', v_order_by
    ) USING p_inventory_item_id
  LOOP
    EXIT WHEN v_remaining <= 0;
    v_consume_qty := LEAST(v_remaining, v_batch.remaining_qty);

    UPDATE public.bar_inventory_batches
    SET remaining_qty = remaining_qty - v_consume_qty,
        status = CASE WHEN remaining_qty - v_consume_qty <= 0 THEN 'consumed' ELSE status END
    WHERE id = v_batch.id;

    INSERT INTO public.bar_inventory_movements (
      inventory_item_id, batch_id, movement_type, direction,
      quantity, unit, unit_cost, total_cost,
      reference_type, reference_id, performed_by, to_location_id
    ) VALUES (
      p_inventory_item_id, v_batch.id,
      COALESCE(p_reference_type, 'consumption'), 'out',
      v_consume_qty, '', v_batch.unit_cost, v_consume_qty * v_batch.unit_cost,
      p_reference_type, p_reference_id, p_performed_by, p_to_location_id
    );

    RETURN QUERY SELECT v_batch.id, v_batch.batch_number, v_consume_qty, v_batch.unit_cost, v_consume_qty * v_batch.unit_cost;
    v_remaining := v_remaining - v_consume_qty;
  END LOOP;

  IF v_remaining > 0 THEN
    RAISE EXCEPTION 'Insufficient bar inventory for item %, short by %', p_inventory_item_id, v_remaining;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.consume_bar_batch_fefo(UUID, NUMERIC, TEXT, TEXT, TEXT, TEXT, UUID) IS
  'Consumes bar inventory from batches using FEFO (default) or FIFO, recording movements';

-- ── 4. Complete bar production order ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.complete_bar_production(
  p_production_order_id UUID,
  p_actual_qty NUMERIC,
  p_performed_by TEXT DEFAULT NULL,
  p_labor_cost NUMERIC DEFAULT 0
) RETURNS TABLE (
  success BOOLEAN,
  batch_id UUID,
  batch_number TEXT,
  total_cost NUMERIC,
  cost_per_unit NUMERIC,
  variance_qty NUMERIC,
  variance_cost NUMERIC
) AS $$
DECLARE
  v_order RECORD;
  v_recipe RECORD;
  v_total_cost NUMERIC := 0;
  v_cost_per_unit NUMERIC := 0;
  v_variance_qty NUMERIC := 0;
  v_variance_cost NUMERIC := 0;
  v_batch_id UUID;
  v_batch_number TEXT;
  v_inventory_item_id UUID;
  v_yield_pct NUMERIC;
  v_line RECORD;
  v_consumed_cost NUMERIC;
  v_shelf_life INTEGER;
  v_expiry_date DATE;
BEGIN
  SELECT * INTO v_order FROM public.bar_production_orders WHERE id = p_production_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Production order not found'; END IF;

  SELECT * INTO v_recipe FROM public.bar_recipes WHERE id = v_order.recipe_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Recipe not found'; END IF;

  v_yield_pct := CASE WHEN v_order.planned_qty > 0 THEN (p_actual_qty / v_order.planned_qty) * 100 ELSE 100 END;
  v_variance_qty := p_actual_qty - v_order.planned_qty;

  FOR v_line IN SELECT * FROM public.bar_production_lines WHERE production_order_id = p_production_order_id LOOP
    IF v_line.actual_qty > 0 THEN
      IF v_line.ingredient_type = 'raw_material' AND v_line.raw_ingredient_id IS NOT NULL THEN
        SELECT id INTO v_inventory_item_id FROM public.bar_inventory_items
        WHERE raw_ingredient_id = v_line.raw_ingredient_id AND is_active = true LIMIT 1;
      ELSIF v_line.ingredient_type IN ('sub_recipe','finished_product') AND v_line.ingredient_id IS NOT NULL THEN
        SELECT id INTO v_inventory_item_id FROM public.bar_inventory_items
        WHERE recipe_id = v_line.ingredient_id AND is_active = true LIMIT 1;
      END IF;

      IF v_inventory_item_id IS NOT NULL THEN
        v_consumed_cost := 0;
        PERFORM quantity_consumed FROM public.consume_bar_batch_fefo(
          v_inventory_item_id, v_line.actual_qty, 'fefo',
          'production_order', p_production_order_id::TEXT, p_performed_by
        );

        SELECT SUM(total_cost) INTO v_consumed_cost
        FROM public.bar_inventory_movements
        WHERE reference_id = p_production_order_id::TEXT
          AND inventory_item_id = v_inventory_item_id;

        v_total_cost := v_total_cost + COALESCE(v_consumed_cost, 0);

        UPDATE public.bar_production_lines
        SET cost_at_time = COALESCE(v_consumed_cost, 0) / NULLIF(v_line.actual_qty, 0)
        WHERE id = v_line.id;
      END IF;
    END IF;
  END LOOP;

  v_total_cost := v_total_cost + COALESCE(p_labor_cost, 0);
  v_cost_per_unit := CASE WHEN p_actual_qty > 0 THEN v_total_cost / p_actual_qty ELSE 0 END;
  v_variance_cost := v_total_cost - v_order.total_cost;

  v_batch_number := 'BB-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || SUBSTRING(p_production_order_id::TEXT, 1, 6);
  v_shelf_life := 7;
  v_expiry_date := CURRENT_DATE + v_shelf_life;

  SELECT id INTO v_inventory_item_id FROM public.bar_inventory_items
  WHERE recipe_id = v_order.recipe_id AND is_active = true LIMIT 1;

  IF v_inventory_item_id IS NULL THEN
    INSERT INTO public.bar_inventory_items (
      property_id, name, item_type, category, unit,
      on_hand_qty, last_cost, avg_cost, recipe_id
    ) VALUES (
      v_order.property_id, v_recipe.name, 'semi_finished', v_recipe.category,
      v_recipe.yield_unit, p_actual_qty, v_cost_per_unit, v_cost_per_unit, v_order.recipe_id
    ) RETURNING id INTO v_inventory_item_id;
  ELSE
    UPDATE public.bar_inventory_items
    SET on_hand_qty = on_hand_qty + p_actual_qty,
        last_cost = v_cost_per_unit,
        avg_cost = (on_hand_qty * avg_cost + p_actual_qty * v_cost_per_unit) / NULLIF(on_hand_qty + p_actual_qty, 0)
    WHERE id = v_inventory_item_id;
  END IF;

  INSERT INTO public.bar_inventory_batches (
    property_id, inventory_item_id, batch_number, recipe_id, production_order_id,
    production_date, expiry_date, shelf_life_days,
    quantity_produced, remaining_qty, unit_cost, total_cost,
    bartender_id, storage_location_id, status
  ) VALUES (
    v_order.property_id, v_inventory_item_id, v_batch_number, v_order.recipe_id, p_production_order_id,
    v_order.production_date, v_expiry_date, v_shelf_life,
    p_actual_qty, p_actual_qty, v_cost_per_unit, v_total_cost,
    v_order.bartender_id, v_order.storage_location_id, 'active'
  ) RETURNING id INTO v_batch_id;

  INSERT INTO public.bar_inventory_movements (
    inventory_item_id, batch_id, movement_type, direction,
    quantity, unit, unit_cost, total_cost,
    reference_type, reference_id, performed_by, to_location_id
  ) VALUES (
    v_inventory_item_id, v_batch_id, 'production', 'in',
    p_actual_qty, v_recipe.yield_unit, v_cost_per_unit, v_total_cost,
    'production_order', p_production_order_id::TEXT, p_performed_by, v_order.storage_location_id
  );

  UPDATE public.bar_production_orders
  SET actual_qty = p_actual_qty, yield_percent = v_yield_pct,
      total_cost = v_total_cost, cost_per_unit = v_cost_per_unit,
      labor_cost = COALESCE(p_labor_cost, 0),
      variance_qty = v_variance_qty, variance_cost = v_variance_cost,
      status = 'completed', completed_at = NOW()
  WHERE id = p_production_order_id;

  INSERT INTO public.bar_audit_log (
    property_id, user_id, action, module, entity_type, entity_id, new_values
  ) VALUES (
    v_order.property_id, p_performed_by, 'produce', 'production',
    'production_order', p_production_order_id::TEXT,
    jsonb_build_object('actual_qty', p_actual_qty, 'total_cost', v_total_cost, 'batch_id', v_batch_id)
  );

  RETURN QUERY SELECT true, v_batch_id, v_batch_number, v_total_cost, v_cost_per_unit, v_variance_qty, v_variance_cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.complete_bar_production(UUID, NUMERIC, TEXT, NUMERIC) IS
  'Completes a bar production order: deducts ingredients, calculates cost, creates inventory batch, records variance';

-- ── 5. POS sale integration ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.consume_bar_for_pos_sale(
  p_menu_item_id UUID,
  p_quantity NUMERIC,
  p_performed_by TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
) RETURNS TABLE (
  success BOOLEAN,
  total_cost_consumed NUMERIC,
  batches_consumed INTEGER
) AS $$
DECLARE
  v_recipe_id UUID;
  v_total_cost NUMERIC := 0;
  v_batches_count INTEGER := 0;
  v_line RECORD;
  v_inventory_item_id UUID;
  v_consumed_cost NUMERIC;
BEGIN
  SELECT id INTO v_recipe_id FROM public.bar_recipes
  WHERE recipe_type = 'drink_item' AND status = 'active'
    AND recipe_code = (SELECT name FROM public.pos_menu_items WHERE id = p_menu_item_id)
  LIMIT 1;

  IF v_recipe_id IS NULL THEN
    SELECT br.id INTO v_recipe_id
    FROM public.bar_recipes br
    WHERE br.recipe_type = 'drink_item' AND br.status = 'active'
    ORDER BY br.updated_at DESC LIMIT 1;
  END IF;

  IF v_recipe_id IS NULL THEN
    RETURN QUERY SELECT true, 0::NUMERIC, 0;
    RETURN;
  END IF;

  FOR v_line IN
    SELECT * FROM public.bar_recipe_ingredients WHERE recipe_id = v_recipe_id
  LOOP
    IF v_line.ingredient_type = 'raw_material' AND v_line.raw_ingredient_id IS NOT NULL THEN
      SELECT id INTO v_inventory_item_id FROM public.bar_inventory_items
      WHERE raw_ingredient_id = v_line.raw_ingredient_id AND is_active = true LIMIT 1;
    ELSIF v_line.ingredient_type IN ('sub_recipe','finished_product') AND v_line.ingredient_id IS NOT NULL THEN
      SELECT id INTO v_inventory_item_id FROM public.bar_inventory_items
      WHERE recipe_id = v_line.ingredient_id AND is_active = true LIMIT 1;
    END IF;

    IF v_inventory_item_id IS NOT NULL THEN
      v_consumed_cost := 0;
      SELECT SUM(total_cost) INTO v_consumed_cost
      FROM public.consume_bar_batch_fefo(
        v_inventory_item_id,
        v_line.quantity * p_quantity * (1 + v_line.waste_percent / 100),
        'fefo', 'pos_sale', COALESCE(p_reference_id, p_menu_item_id::TEXT), p_performed_by
      );

      v_total_cost := v_total_cost + COALESCE(v_consumed_cost, 0);
      v_batches_count := v_batches_count + 1;
    END IF;
  END LOOP;

  INSERT INTO public.bar_audit_log (
    action, module, entity_type, entity_id, new_values, notes
  ) VALUES (
    'consume', 'production', 'pos_sale', COALESCE(p_reference_id, p_menu_item_id::TEXT),
    jsonb_build_object('menu_item_id', p_menu_item_id, 'quantity', p_quantity, 'total_cost', v_total_cost),
    'Auto-consumed from POS sale'
  );

  RETURN QUERY SELECT true, v_total_cost, v_batches_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.consume_bar_for_pos_sale(UUID, NUMERIC, TEXT, TEXT) IS
  'Automatically consumes bar inventory when a drink is sold via POS';

-- ── 6. Expiry alerts view ───────────────────────────────────────────────
CREATE OR REPLACE VIEW public.bar_expiry_alerts AS
SELECT
  bib.id AS batch_id, bib.batch_number,
  kii.id AS inventory_item_id, kii.name AS item_name, kii.item_type,
  bib.remaining_qty, bib.unit_cost,
  bib.remaining_qty * bib.unit_cost AS total_value,
  bib.production_date, bib.expiry_date, bib.best_before_date, bib.shelf_life_days,
  bib.storage_location_id, ksl.name AS storage_location_name,
  bib.status AS batch_status,
  CASE
    WHEN bib.expiry_date IS NULL THEN 'no_expiry'
    WHEN bib.expiry_date < CURRENT_DATE THEN 'expired'
    WHEN bib.expiry_date = CURRENT_DATE THEN 'expiring_today'
    WHEN bib.expiry_date <= CURRENT_DATE + COALESCE(ks.expiry_alert_days, 3) THEN 'expiring_soon'
    ELSE 'fresh'
  END AS expiry_status,
  CASE
    WHEN bib.expiry_date IS NULL THEN NULL
    ELSE bib.expiry_date - CURRENT_DATE
  END AS days_until_expiry
FROM public.bar_inventory_batches bib
JOIN public.bar_inventory_items kii ON bib.inventory_item_id = kii.id
LEFT JOIN public.bar_storage_locations ksl ON bib.storage_location_id = ksl.id
CROSS JOIN (SELECT expiry_alert_days FROM public.bar_settings LIMIT 1) ks
WHERE bib.remaining_qty > 0 AND bib.status = 'active' AND bib.is_deleted = false
ORDER BY bib.expiry_date ASC NULLS LAST;

COMMENT ON VIEW public.bar_expiry_alerts IS 'View of all active bar batches with expiry status and days remaining';

-- ── 7. Bar dashboard summary ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.bar_dashboard_summary(
  p_property_id TEXT DEFAULT 'single-property'
) RETURNS TABLE (
  today_production_count INTEGER,
  pending_production_count INTEGER,
  inventory_value NUMERIC,
  low_stock_count INTEGER,
  expiring_items_count INTEGER,
  waste_today_cost NUMERIC,
  avg_pour_cost_percent NUMERIC,
  production_efficiency NUMERIC,
  total_batches_active INTEGER,
  total_waste_count_today INTEGER
) AS $$
DECLARE
  v_today_prod INTEGER; v_pending_prod INTEGER; v_inv_value NUMERIC;
  v_low_stock INTEGER; v_expiring INTEGER; v_waste_cost NUMERIC;
  v_avg_pc_pct NUMERIC; v_efficiency NUMERIC; v_batches_active INTEGER; v_waste_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_today_prod
  FROM public.bar_production_orders
  WHERE property_id = p_property_id AND production_date = CURRENT_DATE
    AND status NOT IN ('draft','cancelled');

  SELECT COUNT(*) INTO v_pending_prod
  FROM public.bar_production_orders
  WHERE property_id = p_property_id AND status IN ('draft','approved','in_production');

  SELECT COALESCE(SUM(on_hand_qty * avg_cost), 0) INTO v_inv_value
  FROM public.bar_inventory_items
  WHERE property_id = p_property_id AND is_active = true AND is_deleted = false;

  SELECT COUNT(*) INTO v_low_stock
  FROM public.bar_inventory_items
  WHERE property_id = p_property_id AND is_active = true AND is_deleted = false
    AND on_hand_qty <= reorder_level;

  SELECT COUNT(*) INTO v_expiring
  FROM public.bar_expiry_alerts
  WHERE expiry_status IN ('expired','expiring_today','expiring_soon');

  SELECT COALESCE(SUM(cost_value), 0) INTO v_waste_cost
  FROM public.bar_waste
  WHERE property_id = p_property_id AND created_at >= CURRENT_DATE
    AND status = 'approved' AND is_deleted = false;

  SELECT COALESCE(AVG(pour_cost_percent), 0) INTO v_avg_pc_pct
  FROM public.bar_recipes
  WHERE property_id = p_property_id AND status = 'active' AND is_deleted = false;

  SELECT COALESCE(AVG(yield_percent), 0) INTO v_efficiency
  FROM public.bar_production_orders
  WHERE property_id = p_property_id AND status = 'completed';

  SELECT COUNT(*) INTO v_batches_active
  FROM public.bar_inventory_batches
  WHERE property_id = p_property_id AND status = 'active' AND remaining_qty > 0;

  SELECT COUNT(*) INTO v_waste_count
  FROM public.bar_waste
  WHERE property_id = p_property_id AND created_at >= CURRENT_DATE AND is_deleted = false;

  RETURN QUERY SELECT
    COALESCE(v_today_prod, 0), COALESCE(v_pending_prod, 0),
    COALESCE(v_inv_value, 0), COALESCE(v_low_stock, 0),
    COALESCE(v_expiring, 0), COALESCE(v_waste_cost, 0),
    COALESCE(v_avg_pc_pct, 0), COALESCE(v_efficiency, 0),
    COALESCE(v_batches_active, 0), COALESCE(v_waste_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.bar_dashboard_summary(TEXT) IS
  'Returns aggregated dashboard metrics for the bar module';

-- ── 8. Process bar waste ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.process_bar_waste(
  p_waste_id UUID,
  p_approved_by TEXT DEFAULT NULL
) RETURNS TABLE (success BOOLEAN, cost_deducted NUMERIC) AS $$
DECLARE
  v_waste RECORD;
  v_cost NUMERIC := 0;
BEGIN
  SELECT * INTO v_waste FROM public.bar_waste WHERE id = p_waste_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Waste record not found'; END IF;

  SELECT SUM(total_cost) INTO v_cost
  FROM public.consume_bar_batch_fefo(
    v_waste.inventory_item_id, v_waste.quantity, 'fefo',
    'waste', p_waste_id::TEXT, COALESCE(p_approved_by, v_waste.employee_id)
  );

  UPDATE public.bar_waste
  SET status = 'approved', approved_by = p_approved_by, approved_at = NOW(),
      cost_value = COALESCE(v_cost, v_waste.cost_value)
  WHERE id = p_waste_id;

  INSERT INTO public.bar_audit_log (
    property_id, user_id, action, module, entity_type, entity_id, new_values
  ) VALUES (
    v_waste.property_id, p_approved_by, 'waste', 'waste',
    'waste', p_waste_id::TEXT,
    jsonb_build_object('quantity', v_waste.quantity, 'cost', v_cost, 'reason', v_waste.reason)
  );

  RETURN QUERY SELECT true, COALESCE(v_cost, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.process_bar_waste(UUID, TEXT) IS
  'Processes approved bar waste: deducts inventory and records audit trail';

-- ── 9. Generate bar production planning suggestions ─────────────────────
CREATE OR REPLACE FUNCTION public.generate_bar_production_plan(
  p_property_id TEXT DEFAULT 'single-property',
  p_planning_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
  recipe_id UUID,
  recipe_name TEXT,
  current_stock NUMERIC,
  min_stock NUMERIC,
  forecast_demand NUMERIC,
  suggested_qty NUMERIC
) AS $$
DECLARE
  v_occupancy NUMERIC;
  v_reservations INTEGER;
BEGIN
  SELECT
    COALESCE(AVG(CASE WHEN status IN ('Confirmed','Checked-in') THEN 1 ELSE 0 END) * 100, 0),
    COUNT(*)
  INTO v_occupancy, v_reservations
  FROM public.reservations
  WHERE check_in_date <= p_planning_date AND check_out_date > p_planning_date;

  RETURN QUERY
  SELECT
    kr.id, kr.name,
    COALESCE(kii.on_hand_qty, 0),
    COALESCE(kii.min_stock_level, 0),
    COALESCE(v_reservations, 0)::NUMERIC * 0.3,
    GREATEST(
      COALESCE(kii.min_stock_level, 0) - COALESCE(kii.on_hand_qty, 0),
      COALESCE(v_reservations, 0)::NUMERIC * 0.3 - COALESCE(kii.on_hand_qty, 0),
      0
    )
  FROM public.bar_recipes kr
  LEFT JOIN public.bar_inventory_items kii ON kii.recipe_id = kr.id AND kii.is_active = true
  WHERE kr.property_id = p_property_id
    AND kr.recipe_type = 'drink_item'
    AND kr.status = 'active'
    AND kr.is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.generate_bar_production_plan(TEXT, DATE) IS
  'Generates bar production planning suggestions based on occupancy, reservations, and stock levels';

-- ── 10. Trigger: auto-update recipe cost when ingredients change ────────
CREATE OR REPLACE FUNCTION public.trigger_update_bar_recipe_cost()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.update_bar_recipe_cost(NEW.recipe_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_bar_recipe_ingredient_cost_update ON public.bar_recipe_ingredients;
CREATE TRIGGER trg_bar_recipe_ingredient_cost_update
  AFTER INSERT OR UPDATE OR DELETE ON public.bar_recipe_ingredients
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_bar_recipe_cost();
