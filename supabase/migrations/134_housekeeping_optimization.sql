-- Migration: Advanced Housekeeping Optimization
-- This migration adds tables and functions for AI-powered housekeeping optimization
-- Phase 2.2: Advanced Housekeeping Optimization

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Housekeeping Tasks table: Detailed task definitions
CREATE TABLE IF NOT EXISTS ops_housekeeping_tasks (
  task_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  task_name TEXT NOT NULL,
  task_category TEXT NOT NULL CHECK (task_category IN ('room_cleaning', 'deep_clean', 'turn_down', 'laundry', 'maintenance', 'inspection', 'other')),
  task_description TEXT,
  estimated_duration_minutes INTEGER DEFAULT 30,
  required_skills TEXT[] DEFAULT '{}',
  required_equipment TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room Status History table: Track room status changes over time
CREATE TABLE IF NOT EXISTS ops_room_status_history (
  history_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  room_number TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL CHECK (new_status IN ('occupied', 'vacant_clean', 'vacant_dirty', 'out_of_order', 'maintenance', 'cleaning_in_progress')),
  changed_by TEXT NOT NULL,
  change_reason TEXT,
  guest_stay_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Housekeeping Assignments table: Optimized task assignments
CREATE TABLE IF NOT EXISTS ops_housekeeping_assignments (
  assignment_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  staff_id TEXT NOT NULL,
  task_id TEXT NOT NULL REFERENCES ops_housekeeping_tasks(task_id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  assigned_date DATE NOT NULL,
  assigned_time TIME NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL,
  actual_duration_minutes INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_by TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  quality_score NUMERIC(3, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, assigned_date, room_number)
);

-- Housekeeping Performance Metrics table: Track staff performance
CREATE TABLE IF NOT EXISTS ops_housekeeping_performance (
  performance_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  staff_id TEXT NOT NULL,
  date DATE NOT NULL,
  rooms_cleaned INTEGER DEFAULT 0,
  total_rooms_assigned INTEGER DEFAULT 0,
  average_duration_minutes NUMERIC(5, 2),
  average_quality_score NUMERIC(3, 2),
  on_time_completion_rate NUMERIC(5, 2),
  guest_satisfaction_score NUMERIC(3, 2),
  efficiency_score NUMERIC(3, 2),
  productivity_score NUMERIC(3, 2),
  total_minutes_worked INTEGER DEFAULT 0,
  overtime_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, date)
);

-- Room Cleaning Standards table: Define cleaning requirements by room type
CREATE TABLE IF NOT EXISTS ops_cleaning_standards (
  standard_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  room_type TEXT NOT NULL,
  task_category TEXT NOT NULL,
  cleaning_items TEXT[] NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL,
  quality_checkpoints TEXT[] DEFAULT '{}',
  required_equipment TEXT[] DEFAULT '{}',
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'per_stay', 'on_demand')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Housekeeping Optimization Rules table: AI-generated optimization rules
CREATE TABLE IF NOT EXISTS ops_housekeeping_optimization_rules (
  rule_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('staff_allocation', 'task_prioritization', 'efficiency', 'quality', 'cost')),
  rule_description TEXT,
  rule_conditions JSONB NOT NULL,
  rule_actions JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Housekeeping Demand Forecast table: Predicted demand for housekeeping
CREATE TABLE IF NOT EXISTS ops_housekeeping_demand_forecast (
  forecast_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  forecast_date DATE NOT NULL,
  expected_checkouts INTEGER DEFAULT 0,
  expected_checkins INTEGER DEFAULT 0,
  expected_occupancy INTEGER DEFAULT 0,
  predicted_staff_required INTEGER DEFAULT 0,
  predicted_tasks_total INTEGER DEFAULT 0,
  predicted_duration_total_minutes INTEGER DEFAULT 0,
  confidence_level NUMERIC(3, 2),
  forecast_factors JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Housekeeping Inventory table: Track cleaning supplies and equipment
CREATE TABLE IF NOT EXISTS ops_housekeeping_inventory (
  inventory_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  item_name TEXT NOT NULL,
  item_category TEXT NOT NULL CHECK (item_category IN ('cleaning_supplies', 'linens', 'equipment', 'amenities', 'other')),
  current_quantity INTEGER NOT NULL DEFAULT 0,
  minimum_quantity INTEGER DEFAULT 10,
  unit_of_measure TEXT,
  reorder_point INTEGER,
  reorder_quantity INTEGER DEFAULT 50,
  last_restocked DATE,
  supplier TEXT,
  cost_per_unit NUMERIC(8, 2),
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Housekeeping Workload Distribution table: Optimize workload balance
CREATE TABLE IF NOT EXISTS ops_housekeeping_workload_distribution (
  distribution_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  staff_id TEXT NOT NULL,
  date DATE NOT NULL,
  assigned_rooms TEXT[] DEFAULT '{}',
  total_assigned_tasks INTEGER DEFAULT 0,
  total_estimated_minutes INTEGER DEFAULT 0,
  workload_percentage NUMERIC(5, 2),
  efficiency_rating NUMERIC(3, 2),
  is_balanced BOOLEAN DEFAULT TRUE,
  adjustment_recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, date)
);

-- Indexes for performance
CREATE INDEX idx_ops_housekeeping_tasks_category ON ops_housekeeping_tasks(task_category);
CREATE INDEX idx_ops_housekeeping_tasks_priority ON ops_housekeeping_tasks(priority);
CREATE INDEX idx_ops_housekeeping_tasks_active ON ops_housekeeping_tasks(is_active);

CREATE INDEX idx_ops_room_status_history_room ON ops_room_status_history(room_number);
CREATE INDEX idx_ops_room_status_history_timestamp ON ops_room_status_history(timestamp);
CREATE INDEX idx_ops_room_status_history_status ON ops_room_status_history(new_status);

CREATE INDEX idx_ops_housekeeping_assignments_staff ON ops_housekeeping_assignments(staff_id);
CREATE INDEX idx_ops_housekeeping_assignments_date ON ops_housekeeping_assignments(assigned_date);
CREATE INDEX idx_ops_housekeeping_assignments_status ON ops_housekeeping_assignments(status);
CREATE INDEX idx_ops_housekeeping_assignments_room ON ops_housekeeping_assignments(room_number);
CREATE INDEX idx_ops_housekeeping_assignments_priority ON ops_housekeeping_assignments(priority);

CREATE INDEX idx_ops_housekeeping_performance_staff ON ops_housekeeping_performance(staff_id);
CREATE INDEX idx_ops_housekeeping_performance_date ON ops_housekeeping_performance(date);

CREATE INDEX idx_ops_cleaning_standards_room_type ON ops_cleaning_standards(room_type);
CREATE INDEX idx_ops_cleaning_standards_category ON ops_cleaning_standards(task_category);
CREATE INDEX idx_ops_cleaning_standards_active ON ops_cleaning_standards(is_active);

CREATE INDEX idx_ops_housekeeping_optimization_rules_type ON ops_housekeeping_optimization_rules(rule_type);
CREATE INDEX idx_ops_housekeeping_optimization_rules_active ON ops_housekeeping_optimization_rules(is_active);

CREATE INDEX idx_ops_housekeeping_demand_forecast_date ON ops_housekeeping_demand_forecast(forecast_date);

CREATE INDEX idx_ops_housekeeping_inventory_category ON ops_housekeeping_inventory(item_category);
CREATE INDEX idx_ops_housekeeping_inventory_reorder ON ops_housekeeping_inventory(current_quantity, minimum_quantity);

CREATE INDEX idx_ops_housekeeping_workload_distribution_staff ON ops_housekeeping_workload_distribution(staff_id);
CREATE INDEX idx_ops_housekeeping_workload_distribution_date ON ops_housekeeping_workload_distribution(date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_housekeeping_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_ops_housekeeping_tasks_updated_at
  BEFORE UPDATE ON ops_housekeeping_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_housekeeping_timestamp();

CREATE TRIGGER trigger_ops_housekeeping_assignments_updated_at
  BEFORE UPDATE ON ops_housekeeping_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_housekeeping_timestamp();

CREATE TRIGGER trigger_ops_cleaning_standards_updated_at
  BEFORE UPDATE ON ops_cleaning_standards
  FOR EACH ROW
  EXECUTE FUNCTION update_housekeeping_timestamp();

CREATE TRIGGER trigger_ops_housekeeping_optimization_rules_updated_at
  BEFORE UPDATE ON ops_housekeeping_optimization_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_housekeeping_timestamp();

CREATE TRIGGER trigger_ops_housekeeping_inventory_updated_at
  BEFORE UPDATE ON ops_housekeeping_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_housekeeping_timestamp();

-- Function to optimize housekeeping assignments
CREATE OR REPLACE FUNCTION optimize_housekeeping_assignments(p_date DATE, p_department TEXT DEFAULT 'Housekeeping')
RETURNS TABLE (
  assignment_id TEXT,
  staff_id TEXT,
  room_number TEXT,
  task_id TEXT,
  priority TEXT,
  estimated_duration_minutes INTEGER,
  optimization_score NUMERIC
) AS $$
DECLARE
  v_available_staff RECORD;
  v_rooms_to_clean RECORD;
  v_assignment_id TEXT;
  v_optimization_score NUMERIC;
BEGIN
  -- Get available housekeeping staff
  FOR v_available_staff IN
    SELECT DISTINCT staff_id
    FROM ops_housekeeping_performance
    WHERE date = p_date - INTERVAL '1 day'
    ORDER BY efficiency_score DESC
  LOOP
    -- Get rooms that need cleaning
    FOR v_rooms_to_clean IN
      SELECT DISTINCT room_number
      FROM ops_room_status_history
      WHERE new_status IN ('vacant_dirty', 'cleaning_in_progress')
        AND date(timestamp) = p_date
      LIMIT 10 -- Limit to 10 rooms per staff for balance
    LOOP
      -- Generate assignment ID
      v_assignment_id := gen_random_uuid()::TEXT;
      
      -- Calculate optimization score (simplified)
      v_optimization_score := RANDOM() * 100;
      
      -- Return assignment
      RETURN QUERY SELECT
        v_assignment_id,
        v_available_staff.staff_id,
        v_rooms_to_clean.room_number,
        (SELECT task_id FROM ops_housekeeping_tasks WHERE task_category = 'room_cleaning' LIMIT 1),
        'normal',
        30,
        v_optimization_score;
    END LOOP;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate housekeeping performance metrics
CREATE OR REPLACE FUNCTION calculate_housekeeping_performance(p_staff_id TEXT, p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_rooms_cleaned INTEGER;
  v_total_assigned INTEGER;
  v_avg_duration NUMERIC;
  v_avg_quality NUMERIC;
  v_efficiency_score NUMERIC;
  v_productivity_score NUMERIC;
  v_total_minutes INTEGER;
BEGIN
  -- Count rooms cleaned
  SELECT COUNT(*), COUNT(*)
  INTO v_rooms_cleaned, v_total_assigned
  FROM ops_housekeeping_assignments
  WHERE staff_id = p_staff_id
    AND assigned_date = p_date;
  
  -- Calculate average duration
  SELECT AVG(actual_duration_minutes)
  INTO v_avg_duration
  FROM ops_housekeeping_assignments
  WHERE staff_id = p_staff_id
    AND assigned_date = p_date
    AND actual_duration_minutes IS NOT NULL;
  
  -- Calculate average quality score
  SELECT AVG(quality_score)
  INTO v_avg_quality
  FROM ops_housekeeping_assignments
  WHERE staff_id = p_staff_id
    AND assigned_date = p_date
    AND quality_score IS NOT NULL;
  
  -- Calculate total minutes worked
  SELECT COALESCE(SUM(actual_duration_minutes), 0)
  INTO v_total_minutes
  FROM ops_housekeeping_assignments
  WHERE staff_id = p_staff_id
    AND assigned_date = p_date
    AND actual_duration_minutes IS NOT NULL;
  
  -- Calculate efficiency score (rooms per hour)
  IF v_total_minutes > 0 THEN
    v_efficiency_score := (v_rooms_cleaned::NUMERIC / (v_total_minutes::NUMERIC / 60)) * 100;
  ELSE
    v_efficiency_score := 0;
  END IF;
  
  -- Calculate productivity score (completed vs assigned)
  IF v_total_assigned > 0 THEN
    v_productivity_score := (v_rooms_cleaned::NUMERIC / v_total_assigned::NUMERIC) * 100;
  ELSE
    v_productivity_score := 0;
  END IF;
  
  -- Insert or update performance record
  INSERT INTO ops_housekeeping_performance (
    staff_id,
    date,
    rooms_cleaned,
    total_rooms_assigned,
    average_duration_minutes,
    average_quality_score,
    efficiency_score,
    productivity_score,
    total_minutes_worked
  ) VALUES (
    p_staff_id,
    p_date,
    v_rooms_cleaned,
    v_total_assigned,
    v_avg_duration,
    v_avg_quality,
    v_efficiency_score,
    v_productivity_score,
    v_total_minutes
  )
  ON CONFLICT (staff_id, date) DO UPDATE SET
    rooms_cleaned = EXCLUDED.rooms_cleaned,
    total_rooms_assigned = EXCLUDED.total_rooms_assigned,
    average_duration_minutes = EXCLUDED.average_duration_minutes,
    average_quality_score = EXCLUDED.average_quality_score,
    efficiency_score = EXCLUDED.efficiency_score,
    productivity_score = EXCLUDED.productivity_score,
    total_minutes_worked = EXCLUDED.total_minutes_worked;
END;
$$ LANGUAGE plpgsql;

-- Function to generate housekeeping demand forecast
CREATE OR REPLACE FUNCTION generate_housekeeping_demand_forecast(p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_expected_checkouts INTEGER;
  v_expected_checkins INTEGER;
  v_expected_occupancy INTEGER;
  v_predicted_staff INTEGER;
  v_predicted_tasks INTEGER;
  v_predicted_duration INTEGER;
  v_confidence NUMERIC;
BEGIN
  -- Get expected checkouts (simplified - would use reservation data)
  SELECT COUNT(*) * 0.3 -- Assume 30% checkout rate
  INTO v_expected_checkouts
  FROM rooms
  WHERE status = 'occupied';
  
  -- Get expected checkins (simplified - would use reservation data)
  SELECT COUNT(*) * 0.25 -- Assume 25% checkin rate
  INTO v_expected_checkins
  FROM reservations
  WHERE check_in_date = p_date;
  
  -- Calculate expected occupancy
  v_expected_occupancy := v_expected_checkins - v_expected_checkouts;
  
  -- Predict staff required (1 staff per 8 rooms)
  v_predicted_staff := CEIL((v_expected_checkouts + v_expected_checkins) / 8.0);
  
  -- Predict tasks (1 task per room)
  v_predicted_tasks := v_expected_checkouts + v_expected_checkins;
  
  -- Predict duration (30 minutes per task)
  v_predicted_duration := v_predicted_tasks * 30;
  
  -- Confidence level (simplified)
  v_confidence := 75;
  
  -- Insert forecast
  INSERT INTO ops_housekeeping_demand_forecast (
    forecast_date,
    expected_checkouts,
    expected_checkins,
    expected_occupancy,
    predicted_staff_required,
    predicted_tasks_total,
    predicted_duration_total_minutes,
    confidence_level
  ) VALUES (
    p_date,
    v_expected_checkouts,
    v_expected_checkins,
    v_expected_occupancy,
    v_predicted_staff,
    v_predicted_tasks,
    v_predicted_duration,
    v_confidence
  )
  ON CONFLICT (forecast_date) DO UPDATE SET
    expected_checkouts = EXCLUDED.expected_checkouts,
    expected_checkins = EXCLUDED.expected_checkins,
    expected_occupancy = EXCLUDED.expected_occupancy,
    predicted_staff_required = EXCLUDED.predicted_staff_required,
    predicted_tasks_total = EXCLUDED.predicted_tasks_total,
    predicted_duration_total_minutes = EXCLUDED.predicted_duration_total_minutes,
    confidence_level = EXCLUDED.confidence_level;
END;
$$ LANGUAGE plpgsql;

-- Function to check inventory and generate alerts
CREATE OR REPLACE FUNCTION check_housekeeping_inventory_alerts()
RETURNS TABLE (
  inventory_id TEXT,
  item_name TEXT,
  current_quantity INTEGER,
  minimum_quantity INTEGER,
  reorder_point INTEGER,
  alert_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    inventory_id,
    item_name,
    current_quantity,
    minimum_quantity,
    reorder_point,
    CASE
      WHEN current_quantity <= minimum_quantity THEN 'critical'
      WHEN current_quantity <= reorder_point THEN 'warning'
      ELSE 'ok'
    END as alert_type
  FROM ops_housekeeping_inventory
  WHERE current_quantity <= reorder_point
  ORDER BY current_quantity ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to balance workload distribution
CREATE OR REPLACE FUNCTION balance_housekeeping_workload(p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_staff_workload RECORD;
  v_avg_workload NUMERIC;
  v_adjustment_needed BOOLEAN;
BEGIN
  -- Calculate average workload
  SELECT AVG(total_estimated_minutes)
  INTO v_avg_workload
  FROM ops_housekeeping_workload_distribution
  WHERE date = p_date;
  
  -- Check each staff member's workload
  FOR v_staff_workload IN
    SELECT *
    FROM ops_housekeeping_workload_distribution
    WHERE date = p_date
  LOOP
    -- Determine if adjustment is needed
    v_adjustment_needed := ABS(v_staff_workload.total_estimated_minutes - v_avg_workload) > (v_avg_workload * 0.2);
    
    -- Update workload distribution
    UPDATE ops_housekeeping_workload_distribution
    SET 
      workload_percentage = (total_estimated_minutes::NUMERIC / v_avg_workload) * 100,
      is_balanced = NOT v_adjustment_needed,
      adjustment_recommendations = CASE
        WHEN v_adjustment_needed AND total_estimated_minutes > v_avg_workwork THEN ARRAY['Consider reassigning some rooms to other staff']
        WHEN v_adjustment_needed AND total_estimated_minutes < v_avg_workload THEN ARRAY['Can handle additional room assignments']
        ELSE ARRAY[]::TEXT[]
      END
    WHERE distribution_id = v_staff_workload.distribution_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_housekeeping_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_room_status_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_housekeeping_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_housekeeping_performance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_cleaning_standards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_housekeeping_optimization_rules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_housekeeping_demand_forecast TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_housekeeping_inventory TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_housekeeping_workload_distribution TO authenticated;

GRANT EXECUTE ON FUNCTION optimize_housekeeping_assignments(DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_housekeeping_performance(TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_housekeeping_demand_forecast(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION check_housekeeping_inventory_alerts() TO authenticated;
GRANT EXECUTE ON FUNCTION balance_housekeeping_workload(DATE) TO authenticated;
