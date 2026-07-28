-- Executive Portal - KPI Trigger Pipeline Stabilization
-- Phase 1: Stabilize KPI trigger pipeline for reliable metric calculations
-- This migration creates a robust trigger-based system for KPI calculations

-- Create function to calculate occupancy rate KPI
CREATE OR REPLACE FUNCTION calculate_occupancy_rate_kpi()
RETURNS TRIGGER AS $$
DECLARE
  v_total_rooms INTEGER;
  v_occupied_rooms INTEGER;
  v_occupancy_rate DECIMAL(5,2);
BEGIN
  -- Get total rooms for the property
  SELECT COUNT(*) INTO v_total_rooms
  FROM rooms
  WHERE property_id = NEW.property_id AND status != 'out_of_order';
  
  -- Get occupied rooms
  SELECT COUNT(*) INTO v_occupied_rooms
  FROM rooms
  WHERE property_id = NEW.property_id AND status = 'occupied';
  
  -- Calculate occupancy rate
  IF v_total_rooms > 0 THEN
    v_occupancy_rate := (v_occupied_rooms::DECIMAL / v_total_rooms::DECIMAL) * 100;
  ELSE
    v_occupancy_rate := 0;
  END IF;
  
  -- Insert or update KPI metric value
  INSERT INTO metric_values (metric_id, property_id, value, recorded_at)
  SELECT 
    (SELECT metric_id FROM metric_definitions WHERE name = 'Occupancy Rate'),
    NEW.property_id,
    v_occupancy_rate,
    NOW()
  ON CONFLICT (metric_id, property_id, recorded_at)
  DO UPDATE SET value = EXCLUDED.value;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate ADR (Average Daily Rate) KPI
CREATE OR REPLACE FUNCTION calculate_adr_kpi()
RETURNS TRIGGER AS $$
DECLARE
  v_total_revenue DECIMAL(10,2);
  v_occupied_rooms INTEGER;
  v_adr DECIMAL(10,2);
  v_date DATE;
BEGIN
  v_date := CURRENT_DATE;
  
  -- Get total revenue for today
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue
  FROM reservations
  WHERE property_id = NEW.property_id
    AND check_in_date = v_date
    AND status IN ('confirmed', 'checked_in', 'completed');
  
  -- Get occupied rooms for today
  SELECT COUNT(*) INTO v_occupied_rooms
  FROM reservations
  WHERE property_id = NEW.property_id
    AND check_in_date = v_date
    AND status IN ('checked_in');
  
  -- Calculate ADR
  IF v_occupied_rooms > 0 THEN
    v_adr := v_total_revenue / v_occupied_rooms;
  ELSE
    v_adr := 0;
  END IF;
  
  -- Insert or update KPI metric value
  INSERT INTO metric_values (metric_id, property_id, value, recorded_at)
  SELECT 
    (SELECT metric_id FROM metric_definitions WHERE name = 'ADR'),
    NEW.property_id,
    v_adr,
    NOW()
  ON CONFLICT (metric_id, property_id, recorded_at)
  DO UPDATE SET value = EXCLUDED.value;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate RevPAR KPI
CREATE OR REPLACE FUNCTION calculate_revpar_kpi()
RETURNS TRIGGER AS $$
DECLARE
  v_total_revenue DECIMAL(10,2);
  v_total_rooms INTEGER;
  v_revpar DECIMAL(10,2);
  v_date DATE;
BEGIN
  v_date := CURRENT_DATE;
  
  -- Get total revenue for today
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue
  FROM reservations
  WHERE property_id = NEW.property_id
    AND check_in_date = v_date
    AND status IN ('confirmed', 'checked_in', 'completed');
  
  -- Get total available rooms
  SELECT COUNT(*) INTO v_total_rooms
  FROM rooms
  WHERE property_id = NEW.property_id AND status != 'out_of_order';
  
  -- Calculate RevPAR
  IF v_total_rooms > 0 THEN
    v_revpar := v_total_revenue / v_total_rooms;
  ELSE
    v_revpar := 0;
  END IF;
  
  -- Insert or update KPI metric value
  INSERT INTO metric_values (metric_id, property_id, value, recorded_at)
  SELECT 
    (SELECT metric_id FROM metric_definitions WHERE name = 'RevPAR'),
    NEW.property_id,
    v_revpar,
    NOW()
  ON CONFLICT (metric_id, property_id, recorded_at)
  DO UPDATE SET value = EXCLUDED.value;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate Labor Cost % KPI
-- DISABLED: labor_costs table does not exist
-- CREATE OR REPLACE FUNCTION calculate_labor_cost_percent_kpi()
-- RETURNS TRIGGER AS $$
-- DECLARE
--   v_total_labor_cost DECIMAL(10,2);
--   v_total_revenue DECIMAL(10,2);
--   v_labor_cost_percent DECIMAL(5,2);
--   v_date DATE;
-- BEGIN
--   v_date := CURRENT_DATE;
--   
--   -- Get total labor cost for the period
--   SELECT COALESCE(SUM(total_cost), 0) INTO v_total_labor_cost
--   FROM labor_costs
--   WHERE property_id = NEW.property_id
--     AND period >= v_date - INTERVAL '30 days';
--   
--   -- Get total revenue for the period
--   SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue
--   FROM reservations
--   WHERE property_id = NEW.property_id
--     AND check_in_date >= v_date - INTERVAL '30 days'
--     AND status IN ('confirmed', 'checked_in', 'completed');
--   
--   -- Calculate labor cost percentage
--   IF v_total_revenue > 0 THEN
--     v_labor_cost_percent := (v_total_labor_cost / v_total_revenue) * 100;
--   ELSE
--     v_labor_cost_percent := 0;
--   END IF;
--   
--   -- Insert or update KPI metric value
--   INSERT INTO metric_values (metric_id, property_id, value, recorded_at)
--   SELECT 
--     (SELECT metric_id FROM metric_definitions WHERE name = 'Labor Cost %'),
--     NEW.property_id,
--     v_labor_cost_percent,
--     NOW()
--   ON CONFLICT (metric_id, property_id, recorded_at)
--   DO UPDATE SET value = EXCLUDED.value;
--   
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- Create trigger for occupancy rate on room status changes
DROP TRIGGER IF EXISTS trigger_occupancy_rate ON rooms;
CREATE TRIGGER trigger_occupancy_rate
  AFTER INSERT OR UPDATE OF status ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION calculate_occupancy_rate_kpi();

-- Create trigger for ADR on reservation changes
DROP TRIGGER IF EXISTS trigger_adr ON reservations;
CREATE TRIGGER trigger_adr
  AFTER INSERT OR UPDATE OF total_amount, check_in_date, status ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_adr_kpi();

-- Create trigger for RevPAR on reservation changes
DROP TRIGGER IF EXISTS trigger_revpar ON reservations;
CREATE TRIGGER trigger_revpar
  AFTER INSERT OR UPDATE OF total_amount, check_in_date, status ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_revpar_kpi();

-- Create trigger for Labor Cost % on labor cost changes
-- DISABLED: labor_costs table does not exist
-- DROP TRIGGER IF EXISTS trigger_labor_cost_percent ON labor_costs;
-- CREATE TRIGGER trigger_labor_cost_percent
--   AFTER INSERT OR UPDATE OF total_cost ON labor_costs
--   FOR EACH ROW
--   EXECUTE FUNCTION calculate_labor_cost_percent_kpi();

-- Create scheduled job function for periodic KPI recalculation
CREATE OR REPLACE FUNCTION recalculate_all_kpis(p_property_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  v_property RECORD;
BEGIN
  -- Iterate through properties
  FOR v_property IN SELECT id FROM properties WHERE (p_property_id IS NULL OR id = p_property_id) LOOP
    -- Recalculate occupancy rate
    PERFORM calculate_occupancy_rate_kpi_for_property(v_property.id);
    
    -- Recalculate ADR
    PERFORM calculate_adr_kpi_for_property(v_property.id);
    
    -- Recalculate RevPAR
    PERFORM calculate_revpar_kpi_for_property(v_property.id);
    
    -- Recalculate Labor Cost %
    -- DISABLED: labor_costs table does not exist
    -- PERFORM calculate_labor_cost_percent_kpi_for_property(v_property.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Helper functions for scheduled recalculation
CREATE OR REPLACE FUNCTION calculate_occupancy_rate_kpi_for_property(p_property_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_rooms INTEGER;
  v_occupied_rooms INTEGER;
  v_occupancy_rate DECIMAL(5,2);
BEGIN
  SELECT COUNT(*) INTO v_total_rooms
  FROM rooms
  WHERE property_id = p_property_id AND status != 'out_of_order';
  
  SELECT COUNT(*) INTO v_occupied_rooms
  FROM rooms
  WHERE property_id = p_property_id AND status = 'occupied';
  
  IF v_total_rooms > 0 THEN
    v_occupancy_rate := (v_occupied_rooms::DECIMAL / v_total_rooms::DECIMAL) * 100;
  ELSE
    v_occupancy_rate := 0;
  END IF;
  
  INSERT INTO metric_values (metric_id, property_id, value, recorded_at)
  SELECT 
    (SELECT metric_id FROM metric_definitions WHERE name = 'Occupancy Rate'),
    p_property_id,
    v_occupancy_rate,
    NOW()
  ON CONFLICT (metric_id, property_id, recorded_at)
  DO UPDATE SET value = EXCLUDED.value;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_adr_kpi_for_property(p_property_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_revenue DECIMAL(10,2);
  v_occupied_rooms INTEGER;
  v_adr DECIMAL(10,2);
  v_date DATE;
BEGIN
  v_date := CURRENT_DATE;
  
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue
  FROM reservations
  WHERE property_id = p_property_id
    AND check_in_date = v_date
    AND status IN ('confirmed', 'checked_in', 'completed');
  
  SELECT COUNT(*) INTO v_occupied_rooms
  FROM reservations
  WHERE property_id = p_property_id
    AND check_in_date = v_date
    AND status IN ('checked_in');
  
  IF v_occupied_rooms > 0 THEN
    v_adr := v_total_revenue / v_occupied_rooms;
  ELSE
    v_adr := 0;
  END IF;
  
  INSERT INTO metric_values (metric_id, property_id, value, recorded_at)
  SELECT 
    (SELECT metric_id FROM metric_definitions WHERE name = 'ADR'),
    p_property_id,
    v_adr,
    NOW()
  ON CONFLICT (metric_id, property_id, recorded_at)
  DO UPDATE SET value = EXCLUDED.value;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_revpar_kpi_for_property(p_property_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_revenue DECIMAL(10,2);
  v_total_rooms INTEGER;
  v_revpar DECIMAL(10,2);
  v_date DATE;
BEGIN
  v_date := CURRENT_DATE;
  
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue
  FROM reservations
  WHERE property_id = p_property_id
    AND check_in_date = v_date
    AND status IN ('confirmed', 'checked_in', 'completed');
  
  SELECT COUNT(*) INTO v_total_rooms
  FROM rooms
  WHERE property_id = p_property_id AND status != 'out_of_order';
  
  IF v_total_rooms > 0 THEN
    v_revpar := v_total_revenue / v_total_rooms;
  ELSE
    v_revpar := 0;
  END IF;
  
  INSERT INTO metric_values (metric_id, property_id, value, recorded_at)
  SELECT 
    (SELECT metric_id FROM metric_definitions WHERE name = 'RevPAR'),
    p_property_id,
    v_revpar,
    NOW()
  ON CONFLICT (metric_id, property_id, recorded_at)
  DO UPDATE SET value = EXCLUDED.value;
END;
$$ LANGUAGE plpgsql;

-- DISABLED: labor_costs table does not exist
-- CREATE OR REPLACE FUNCTION calculate_labor_cost_percent_kpi_for_property(p_property_id UUID)
-- RETURNS VOID AS $$
-- DECLARE
--   v_total_labor_cost DECIMAL(10,2);
--   v_total_revenue DECIMAL(10,2);
--   v_labor_cost_percent DECIMAL(5,2);
--   v_date DATE;
-- BEGIN
--   v_date := CURRENT_DATE;
--   
--   SELECT COALESCE(SUM(total_cost), 0) INTO v_total_labor_cost
--   FROM labor_costs
--   WHERE property_id = p_property_id
--     AND period >= v_date - INTERVAL '30 days';
--   
--   SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue
--   FROM reservations
--   WHERE property_id = p_property_id
--     AND check_in_date >= v_date - INTERVAL '30 days'
--     AND status IN ('confirmed', 'checked_in', 'completed');
--   
--   IF v_total_revenue > 0 THEN
--     v_labor_cost_percent := (v_total_labor_cost / v_total_revenue) * 100;
--   ELSE
--     v_labor_cost_percent := 0;
--   END IF;
--   
--   INSERT INTO metric_values (metric_id, property_id, value, recorded_at)
--   SELECT 
--     (SELECT metric_id FROM metric_definitions WHERE name = 'Labor Cost %'),
--     p_property_id,
--     v_labor_cost_percent,
--     NOW()
--   ON CONFLICT (metric_id, property_id, recorded_at)
--   DO UPDATE SET value = EXCLUDED.value;
-- END;
-- $$ LANGUAGE plpgsql;

-- Add comment documenting the KPI trigger pipeline
COMMENT ON FUNCTION calculate_occupancy_rate_kpi() IS 'Trigger function to automatically calculate and update Occupancy Rate KPI when room status changes';
COMMENT ON FUNCTION calculate_adr_kpi() IS 'Trigger function to automatically calculate and update ADR KPI when reservation data changes';
COMMENT ON FUNCTION calculate_revpar_kpi() IS 'Trigger function to automatically calculate and update RevPAR KPI when reservation data changes';
-- COMMENT ON FUNCTION calculate_labor_cost_percent_kpi() IS 'Trigger function to automatically calculate and update Labor Cost % KPI when labor cost data changes'; -- DISABLED: labor_costs table does not exist
COMMENT ON FUNCTION recalculate_all_kpis(UUID) IS 'Scheduled job function to recalculate all KPIs for data consistency and catch-up';
