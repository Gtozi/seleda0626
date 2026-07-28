-- Migration 111: F&B Recipe Costing, Weighted-Avg Inventory, Waste Tracking
-- Step 5.2 — F&B Module Completion

-- =============================================================
-- 1. Weighted-Average Cost trigger on inventory_grns (goods receipt)
--    Updates inventory_items.avg_cost when goods are received
-- =============================================================

CREATE OR REPLACE FUNCTION update_weighted_avg_cost()
RETURNS TRIGGER AS $$
DECLARE
  old_qty numeric;
  old_cost numeric;
  new_qty numeric;
  new_cost numeric;
BEGIN
  SELECT current_stock, avg_cost INTO old_qty, old_cost
  FROM inventory_items
  WHERE id = NEW.item_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Weighted average: (old_qty * old_cost + received_qty * unit_cost) / (old_qty + received_qty)
  new_qty := COALESCE(old_qty, 0) + COALESCE(NEW.quantity_received, 0);
  IF new_qty > 0 THEN
    new_cost := (COALESCE(old_qty, 0) * COALESCE(old_cost, 0) + COALESCE(NEW.quantity_received, 0) * COALESCE(NEW.unit_cost, 0)) / new_qty;
  ELSE
    new_cost := old_cost;
  END IF;

  UPDATE inventory_items
  SET avg_cost = new_cost,
      current_stock = new_qty,
      last_cost = COALESCE(NEW.unit_cost, old_cost),
      updated_at = now()
  WHERE id = NEW.item_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_weighted_avg_cost ON inventory_grns;
CREATE TRIGGER trg_update_weighted_avg_cost
  AFTER INSERT OR UPDATE ON inventory_grns
  FOR EACH ROW
  EXECUTE FUNCTION update_weighted_avg_cost();

-- =============================================================
-- 2. Recipe cost calculation function
--    Returns total cost and cost per portion for a recipe
-- =============================================================

CREATE OR REPLACE FUNCTION calculate_recipe_cost(p_recipe_id text)
RETURNS TABLE (
  total_cost numeric,
  portions integer,
  cost_per_portion numeric,
  menu_item_name text,
  selling_price numeric,
  food_cost_percent numeric
) AS $$
DECLARE
  v_portions integer;
  v_menu_item_name text;
  v_selling_price numeric;
BEGIN
  SELECT r.portions, mi.name, mi.selling_price
  INTO v_portions, v_menu_item_name, v_selling_price
  FROM recipes r
  LEFT JOIN menu_items mi ON r.menu_item_id = mi.id
  WHERE r.id = p_recipe_id;

  v_portions := COALESCE(v_portions, 1);

  RETURN QUERY
  SELECT
    COALESCE(SUM(rl.quantity * COALESCE(rl.cost_at_time_of_costing, i.current_cost, 0)), 0) AS total_cost,
    v_portions AS portions,
    CASE WHEN v_portions > 0 THEN COALESCE(SUM(rl.quantity * COALESCE(rl.cost_at_time_of_costing, i.current_cost, 0)), 0) / v_portions ELSE 0 END AS cost_per_portion,
    v_menu_item_name,
    COALESCE(v_selling_price, 0) AS selling_price,
    CASE WHEN COALESCE(v_selling_price, 0) > 0 AND v_portions > 0
      THEN (COALESCE(SUM(rl.quantity * COALESCE(rl.cost_at_time_of_costing, i.current_cost, 0)), 0) / v_portions) / v_selling_price * 100
      ELSE 0 END AS food_cost_percent
  FROM recipe_lines rl
  LEFT JOIN ingredients i ON rl.ingredient_id = i.id
  WHERE rl.recipe_id = p_recipe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- 3. Waste summary view for reporting
-- =============================================================

CREATE OR REPLACE VIEW waste_summary AS
SELECT
  w.ingredient_id,
  i.name AS ingredient_name,
  i.category,
  COUNT(*) AS waste_count,
  SUM(w.quantity) AS total_wasted,
  SUM(w.cost_value) AS total_cost_wasted,
  AVG(w.quantity) AS avg_waste_per_event
FROM wastage_logs w
LEFT JOIN ingredients i ON w.ingredient_id = i.id
GROUP BY w.ingredient_id, i.name, i.category
ORDER BY total_cost_wasted DESC;

-- =============================================================
-- 4. Add AV requirements and billing instructions to banquet_events
-- =============================================================

ALTER TABLE banquet_events
  ADD COLUMN IF NOT EXISTS av_requirements text,
  ADD COLUMN IF NOT EXISTS billing_instructions text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS event_start_time text,
  ADD COLUMN IF NOT EXISTS event_end_time text,
  ADD COLUMN IF NOT EXISTS function_room text;
