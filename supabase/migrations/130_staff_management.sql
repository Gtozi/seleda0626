-- Migration: Staff Management & Performance Tracking
-- This migration adds tables and functions for staff scheduling, performance tracking, and labor cost analysis
-- Phase 3.1: Staff Management & Performance Tracking

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Staff Schedules table: Staff shift scheduling
CREATE TABLE IF NOT EXISTS fb_staff_schedules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  staff_id TEXT NOT NULL,
  outlet_id TEXT NOT NULL,
  date DATE NOT NULL,
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('server', 'bartender', 'chef', 'sous_chef', 'line_cook', 'host', 'manager', 'supervisor', 'busser', 'runner')),
  section TEXT,
  scheduled_hours NUMERIC(4, 2) NOT NULL,
  actual_hours NUMERIC(4, 2) DEFAULT 0,
  hourly_rate NUMERIC(8, 2) NOT NULL,
  labor_cost NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'clocked_in', 'clocked_out', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, date, shift_start, shift_end)
);

-- Time Clock Entries table: Staff clock in/out tracking
CREATE TABLE IF NOT EXISTS fb_time_clock_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  staff_id TEXT NOT NULL,
  outlet_id TEXT NOT NULL,
  schedule_id TEXT REFERENCES fb_staff_schedules(id) ON DELETE SET NULL,
  clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out_time TIMESTAMP WITH TIME ZONE,
  break_start_time TIMESTAMP WITH TIME ZONE,
  break_end_time TIMESTAMP WITH TIME ZONE,
  total_hours NUMERIC(4, 2),
  break_hours NUMERIC(4, 2) DEFAULT 0,
  worked_hours NUMERIC(4, 2),
  hourly_rate NUMERIC(8, 2) NOT NULL,
  total_pay NUMERIC(10, 2),
  is_overtime BOOLEAN DEFAULT FALSE,
  overtime_hours NUMERIC(4, 2) DEFAULT 0,
  overtime_rate NUMERIC(8, 2),
  location TEXT,
  device_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server Performance Metrics table: Performance tracking for service staff
CREATE TABLE IF NOT EXISTS fb_server_performance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  staff_id TEXT NOT NULL,
  outlet_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sales NUMERIC(12, 2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  average_check NUMERIC(8, 2) DEFAULT 0,
  sales_per_hour NUMERIC(8, 2) DEFAULT 0,
  upsell_rate NUMERIC(5, 2) DEFAULT 0,
  void_rate NUMERIC(5, 2) DEFAULT 0,
  guest_satisfaction_score NUMERIC(3, 2),
  tips_total NUMERIC(10, 2) DEFAULT 0,
  tip_percent NUMERIC(5, 2) DEFAULT 0,
  tables_served INTEGER DEFAULT 0,
  guests_served INTEGER DEFAULT 0,
  returns_count INTEGER DEFAULT 0,
  complaints_count INTEGER DEFAULT 0,
  compliments_count INTEGER DEFAULT 0,
  ranking INTEGER,
  total_hours_worked NUMERIC(6, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, period_start, period_end)
);

-- Tips Tracking table: Tip distribution and tracking
CREATE TABLE IF NOT EXISTS fb_tips_tracking (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  staff_id TEXT NOT NULL,
  outlet_id TEXT NOT NULL,
  order_id TEXT,
  tip_amount NUMERIC(8, 2) NOT NULL,
  tip_percent NUMERIC(5, 2),
  payment_method TEXT,
  tip_date DATE NOT NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with TEXT[], -- Array of staff IDs
  distribution_method TEXT DEFAULT 'individual' CHECK (distribution_method IN ('individual', 'pool', 'tip_share')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'distributed', 'paid')),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labor Cost Analysis table: Periodic labor cost analysis
CREATE TABLE IF NOT EXISTS fb_labor_cost_analysis (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  outlet_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_labor_cost NUMERIC(12, 2) DEFAULT 0,
  total_revenue NUMERIC(12, 2) DEFAULT 0,
  labor_cost_percent NUMERIC(5, 2) DEFAULT 0,
  scheduled_hours NUMERIC(8, 2) DEFAULT 0,
  actual_hours NUMERIC(8, 2) DEFAULT 0,
  overtime_hours NUMERIC(6, 2) DEFAULT 0,
  staff_count INTEGER DEFAULT 0,
  average_hourly_rate NUMERIC(8, 2) DEFAULT 0,
  sales_per_labor_hour NUMERIC(8, 2) DEFAULT 0,
  target_labor_percent NUMERIC(5, 2) DEFAULT 30,
  variance_percent NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outlet_id, period_start, period_end)
);

-- Role-based Tasks table: Task assignment and tracking
CREATE TABLE IF NOT EXISTS fb_staff_tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  task_name TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('opening', 'closing', 'cleaning', 'inventory', 'maintenance', 'training', 'meeting', 'other')),
  role TEXT NOT NULL,
  section TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_duration INTEGER DEFAULT 30, -- in minutes
  required_staff INTEGER DEFAULT 1,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern TEXT, -- e.g., 'daily', 'weekly', 'monthly'
  due_time TIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Task Assignments table: Individual task assignments
CREATE TABLE IF NOT EXISTS fb_staff_task_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  task_id TEXT NOT NULL REFERENCES fb_staff_tasks(id) ON DELETE CASCADE,
  staff_id TEXT NOT NULL,
  outlet_id TEXT NOT NULL,
  assigned_date DATE NOT NULL,
  due_date DATE,
  due_time TIME,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'overdue')),
  start_time TIMESTAMP WITH TIME ZONE,
  completion_time TIMESTAMP WITH TIME ZONE,
  actual_duration INTEGER, -- in minutes
  notes TEXT,
  completed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, staff_id, assigned_date)
);

-- Labor Forecasting table: Labor demand forecasting
CREATE TABLE IF NOT EXISTS fb_labor_forecast (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  outlet_id TEXT NOT NULL,
  forecast_date DATE NOT NULL,
  day_of_week INTEGER NOT NULL,
  is_holiday BOOLEAN DEFAULT FALSE,
  is_special_event BOOLEAN DEFAULT FALSE,
  event_name TEXT,
  expected_revenue NUMERIC(12, 2),
  expected_orders INTEGER,
  expected_guests INTEGER,
  recommended_staff_count INTEGER,
  recommended_hours NUMERIC(6, 2),
  recommended_labor_cost NUMERIC(10, 2),
  confidence_level NUMERIC(3, 2),
  actual_revenue NUMERIC(12, 2),
  actual_orders INTEGER,
  actual_staff_count INTEGER,
  actual_hours NUMERIC(6, 2),
  actual_labor_cost NUMERIC(10, 2),
  forecast_accuracy NUMERIC(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outlet_id, forecast_date)
);

-- Indexes for performance
CREATE INDEX idx_fb_staff_schedules_staff ON fb_staff_schedules(staff_id);
CREATE INDEX idx_fb_staff_schedules_outlet ON fb_staff_schedules(outlet_id);
CREATE INDEX idx_fb_staff_schedules_date ON fb_staff_schedules(date);
CREATE INDEX idx_fb_staff_schedules_status ON fb_staff_schedules(status);

CREATE INDEX idx_fb_time_clock_staff ON fb_time_clock_entries(staff_id);
CREATE INDEX idx_fb_time_clock_outlet ON fb_time_clock_entries(outlet_id);
CREATE INDEX idx_fb_time_clock_clock_in ON fb_time_clock_entries(clock_in_time);
CREATE INDEX idx_fb_time_clock_clock_out ON fb_time_clock_entries(clock_out_time);

CREATE INDEX idx_fb_server_performance_staff ON fb_server_performance(staff_id);
CREATE INDEX idx_fb_server_performance_outlet ON fb_server_performance(outlet_id);
CREATE INDEX idx_fb_server_performance_period ON fb_server_performance(period_start, period_end);

CREATE INDEX idx_fb_tips_tracking_staff ON fb_tips_tracking(staff_id);
CREATE INDEX idx_fb_tips_tracking_date ON fb_tips_tracking(tip_date);
CREATE INDEX idx_fb_tips_tracking_status ON fb_tips_tracking(status);

CREATE INDEX idx_fb_labor_cost_analysis_outlet ON fb_labor_cost_analysis(outlet_id);
CREATE INDEX idx_fb_labor_cost_analysis_period ON fb_labor_cost_analysis(period_start, period_end);

CREATE INDEX idx_fb_staff_tasks_role ON fb_staff_tasks(role);
CREATE INDEX idx_fb_staff_tasks_type ON fb_staff_tasks(task_type);
CREATE INDEX idx_fb_staff_tasks_active ON fb_staff_tasks(is_active);

CREATE INDEX idx_fb_staff_task_assignments_staff ON fb_staff_task_assignments(staff_id);
CREATE INDEX idx_fb_staff_task_assignments_task ON fb_staff_task_assignments(task_id);
CREATE INDEX idx_fb_staff_task_assignments_date ON fb_staff_task_assignments(assigned_date);
CREATE INDEX idx_fb_staff_task_assignments_status ON fb_staff_task_assignments(status);

CREATE INDEX idx_fb_labor_forecast_outlet ON fb_labor_forecast(outlet_id);
CREATE INDEX idx_fb_labor_forecast_date ON fb_labor_forecast(forecast_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_staff_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_fb_staff_schedules_updated_at
  BEFORE UPDATE ON fb_staff_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_timestamp();

CREATE TRIGGER trigger_fb_server_performance_updated_at
  BEFORE UPDATE ON fb_server_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_timestamp();

CREATE TRIGGER trigger_fb_staff_tasks_updated_at
  BEFORE UPDATE ON fb_staff_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_timestamp();

CREATE TRIGGER trigger_fb_staff_task_assignments_updated_at
  BEFORE UPDATE ON fb_staff_task_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_timestamp();

-- Function to calculate worked hours from time clock entry
CREATE OR REPLACE FUNCTION calculate_worked_hours(p_clock_in TIMESTAMPTZ, p_clock_out TIMESTAMPTZ, p_break_start TIMESTAMPTZ, p_break_end TIMESTAMPTZ)
RETURNS NUMERIC AS $$
DECLARE
  v_total_hours NUMERIC;
  v_break_hours NUMERIC;
  v_worked_hours NUMERIC;
BEGIN
  IF p_clock_out IS NULL THEN
    RETURN NULL;
  END IF;
  
  v_total_hours := EXTRACT(EPOCH FROM (p_clock_out - p_clock_in)) / 3600;
  
  IF p_break_start IS NOT NULL AND p_break_end IS NOT NULL THEN
    v_break_hours := EXTRACT(EPOCH FROM (p_break_end - p_break_start)) / 3600;
  ELSE
    v_break_hours := 0;
  END IF;
  
  v_worked_hours := v_total_hours - v_break_hours;
  RETURN v_worked_hours;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate labor cost percent
CREATE OR REPLACE FUNCTION calculate_labor_cost_percent(p_labor_cost NUMERIC, p_revenue NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  IF p_revenue = 0 THEN
    RETURN 0;
  END IF;
  RETURN (p_labor_cost / p_revenue) * 100;
END;
$$ LANGUAGE plpgsql;

-- Function to generate labor forecast
CREATE OR REPLACE FUNCTION generate_labor_forecast(p_outlet_id TEXT, p_start_date DATE, p_end_date DATE)
RETURNS VOID AS $$
DECLARE
  v_date DATE;
  v_day_of_week INTEGER;
  v_expected_revenue NUMERIC;
  v_expected_orders INTEGER;
  v_recommended_staff INTEGER;
  v_recommended_hours NUMERIC;
BEGIN
  FOR v_date IN SELECT generate_series(p_start_date, p_end_date, '1 day'::INTERVAL) LOOP
    v_day_of_week := EXTRACT(DOW FROM v_date);
    
    -- Get historical average revenue for this day of week
    SELECT COALESCE(AVG(total_revenue), 0)
    INTO v_expected_revenue
    FROM fb_labor_cost_analysis
    WHERE outlet_id = p_outlet_id
      AND EXTRACT(DOW FROM period_start) = v_day_of_week
      AND period_start >= CURRENT_DATE - INTERVAL '8 weeks';
    
    -- Estimate orders (assuming average check of 50)
    v_expected_orders := COALESCE(v_expected_revenue / 50, 0)::INTEGER;
    
    -- Calculate recommended staff (1 staff per 15 orders per shift)
    v_recommended_staff := GREATEST(2, CEIL(v_expected_orders / 15.0));
    
    -- Calculate recommended hours (assuming 8-hour shifts)
    v_recommended_hours := v_recommended_staff * 8;
    
    -- Insert or update forecast
    INSERT INTO fb_labor_forecast (
      outlet_id,
      forecast_date,
      day_of_week,
      expected_revenue,
      expected_orders,
      recommended_staff_count,
      recommended_hours,
      confidence_level
    ) VALUES (
      p_outlet_id,
      v_date,
      v_day_of_week,
      v_expected_revenue,
      v_expected_orders,
      v_recommended_staff,
      v_recommended_hours,
      75.0
    )
    ON CONFLICT (outlet_id, forecast_date)
    DO UPDATE SET
      expected_revenue = EXCLUDED.expected_revenue,
      expected_orders = EXCLUDED.expected_orders,
      recommended_staff_count = EXCLUDED.recommended_staff_count,
      recommended_hours = EXCLUDED.recommended_hours;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate server performance metrics
CREATE OR REPLACE FUNCTION calculate_server_performance(p_staff_id TEXT, p_period_start DATE, p_period_end DATE)
RETURNS VOID AS $$
DECLARE
  v_total_sales NUMERIC;
  v_total_orders INTEGER;
  v_total_tips NUMERIC;
  v_total_hours NUMERIC;
  v_average_check NUMERIC;
  v_sales_per_hour NUMERIC;
  v_tip_percent NUMERIC;
BEGIN
  -- Get total sales and orders for the period
  SELECT 
    COALESCE(SUM(oi.quantity * oi.unit_price), 0),
    COALESCE(COUNT(DISTINCT o.id), 0)
  INTO v_total_sales, v_total_orders
  FROM fb_orders o
  JOIN fb_order_items oi ON o.id = oi.order_id
  WHERE o.server_id = p_staff_id
    AND o.order_date BETWEEN p_period_start AND p_period_end
    AND o.status IN ('completed', 'paid');
  
  -- Get total tips for the period
  SELECT COALESCE(SUM(tip_amount), 0)
  INTO v_total_tips
  FROM fb_tips_tracking
  WHERE staff_id = p_staff_id
    AND tip_date BETWEEN p_period_start AND p_period_end;
  
  -- Get total hours worked
  SELECT COALESCE(SUM(worked_hours), 0)
  INTO v_total_hours
  FROM fb_time_clock_entries
  WHERE staff_id = p_staff_id
    AND DATE(clock_in_time) BETWEEN p_period_start AND p_period_end;
  
  -- Calculate derived metrics
  IF v_total_orders > 0 THEN
    v_average_check := v_total_sales / v_total_orders;
  ELSE
    v_average_check := 0;
  END IF;
  
  IF v_total_hours > 0 THEN
    v_sales_per_hour := v_total_sales / v_total_hours;
  ELSE
    v_sales_per_hour := 0;
  END IF;
  
  IF v_total_sales > 0 THEN
    v_tip_percent := (v_total_tips / v_total_sales) * 100;
  ELSE
    v_tip_percent := 0;
  END IF;
  
  -- Insert or update performance record
  INSERT INTO fb_server_performance (
    staff_id,
    outlet_id,
    period_start,
    period_end,
    total_sales,
    total_orders,
    average_check,
    sales_per_hour,
    tips_total,
    tip_percent,
    total_hours_worked
  ) VALUES (
    p_staff_id,
    'default', -- This should be parameterized
    p_period_start,
    p_period_end,
    v_total_sales,
    v_total_orders,
    v_average_check,
    v_sales_per_hour,
    v_total_tips,
    v_tip_percent,
    v_total_hours
  )
  ON CONFLICT (staff_id, period_start, period_end)
  DO UPDATE SET
    total_sales = EXCLUDED.total_sales,
    total_orders = EXCLUDED.total_orders,
    average_check = EXCLUDED.average_check,
    sales_per_hour = EXCLUDED.sales_per_hour,
    tips_total = EXCLUDED.tips_total,
    tip_percent = EXCLUDED.tip_percent,
    total_hours_worked = EXCLUDED.total_hours_worked;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_staff_schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_time_clock_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_server_performance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_tips_tracking TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_labor_cost_analysis TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_staff_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_staff_task_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_labor_forecast TO authenticated;

GRANT EXECUTE ON FUNCTION calculate_worked_hours(TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_labor_cost_percent(NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_labor_forecast(TEXT, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_server_performance(TEXT, DATE, DATE) TO authenticated;
