-- Migration: Operations-Wide Advanced Staff Scheduling & Optimization
-- This migration adds tables and functions for AI-powered staff scheduling across all departments
-- Phase 2.1: Advanced Staff Scheduling & Optimization

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Optimized Schedules table: AI-generated optimized schedules
CREATE TABLE IF NOT EXISTS ops_optimized_schedules (
  schedule_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  date DATE NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('FrontOffice', 'Housekeeping', 'FandB', 'Maintenance', 'HR', 'Procurement', 'SalesEvents', 'GuestPortal')),
  total_labor_cost NUMERIC(12, 2) DEFAULT 0,
  budget_variance NUMERIC(10, 2) DEFAULT 0,
  coverage_score NUMERIC(3, 2) DEFAULT 0,
  optimization_version TEXT DEFAULT 'v1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, department)
);

-- Optimization Metrics table: Detailed optimization scoring
CREATE TABLE IF NOT EXISTS ops_optimization_metrics (
  metric_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  schedule_id TEXT NOT NULL REFERENCES ops_optimized_schedules(schedule_id) ON DELETE CASCADE,
  fairness_score NUMERIC(3, 2) DEFAULT 0,
  preference_match_score NUMERIC(3, 2) DEFAULT 0,
  skill_coverage_score NUMERIC(3, 2) DEFAULT 0,
  cost_efficiency_score NUMERIC(3, 2) DEFAULT 0,
  compliance_score NUMERIC(3, 2) DEFAULT 0,
  overall_score NUMERIC(3, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optimized Shifts table: Individual shift assignments within optimized schedule
CREATE TABLE IF NOT EXISTS ops_optimized_shifts (
  shift_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  schedule_id TEXT NOT NULL REFERENCES ops_optimized_schedules(schedule_id) ON DELETE CASCADE,
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  coverage_percentage NUMERIC(5, 2) DEFAULT 0,
  estimated_cost NUMERIC(10, 2) DEFAULT 0,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Assignments table: Detailed staff assignments to shifts
CREATE TABLE IF NOT EXISTS ops_staff_assignments (
  assignment_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  shift_id TEXT NOT NULL REFERENCES ops_optimized_shifts(shift_id) ON DELETE CASCADE,
  staff_id TEXT NOT NULL,
  role TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  hours_scheduled NUMERIC(4, 2) DEFAULT 0,
  overtime_hours NUMERIC(4, 2) DEFAULT 0,
  cost NUMERIC(8, 2) DEFAULT 0,
  preference_score NUMERIC(3, 2) DEFAULT 0,
  skill_match_score NUMERIC(3, 2) DEFAULT 0,
  is_swap_proposed BOOLEAN DEFAULT FALSE,
  swap_proposed_with TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Skills table: Skills database for staff members
CREATE TABLE IF NOT EXISTS ops_staff_skills (
  skill_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  staff_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  skill_category TEXT NOT NULL CHECK (skill_category IN ('technical', 'service', 'leadership', 'language', 'certification', 'other')),
  proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  certified BOOLEAN DEFAULT FALSE,
  certification_expiry DATE,
  last_verified DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, skill_name)
);

-- Staff Preferences table: Staff scheduling preferences
CREATE TABLE IF NOT EXISTS ops_staff_preferences (
  preference_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  staff_id TEXT NOT NULL,
  preference_type TEXT NOT NULL CHECK (preference_type IN ('shift_timing', 'days_off', 'department', 'role', 'partner')),
  preference_value JSONB NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'essential')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labor Cost Forecast table: AI-powered labor cost forecasting
CREATE TABLE IF NOT EXISTS ops_labor_cost_forecast (
  forecast_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  department TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  projected_labor_cost NUMERIC(12, 2) DEFAULT 0,
  budget NUMERIC(12, 2) DEFAULT 0,
  variance NUMERIC(10, 2) DEFAULT 0,
  variance_percent NUMERIC(5, 2) DEFAULT 0,
  forecast_confidence NUMERIC(3, 2) DEFAULT 0,
  drivers JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(department, period_start, period_end)
);

-- Overtime Prediction table: Predictive overtime analysis
CREATE TABLE IF NOT EXISTS ops_overtime_prediction (
  prediction_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  staff_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  predicted_overtime_hours NUMERIC(4, 2) DEFAULT 0,
  predicted_overtime_cost NUMERIC(10, 2) DEFAULT 0,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  contributing_factors JSONB DEFAULT '{}',
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shift Swap Requests table: Shift swapping workflow
CREATE TABLE IF NOT EXISTS ops_shift_swap_requests (
  swap_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  requester_staff_id TEXT NOT NULL,
  original_shift_id TEXT NOT NULL REFERENCES ops_optimized_shifts(shift_id),
  proposed_staff_id TEXT NOT NULL,
  proposed_shift_id TEXT REFERENCES ops_optimized_shifts(shift_id),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Staff Performance Integration table: Performance data for scheduling
CREATE TABLE IF NOT EXISTS ops_staff_performance_integration (
  integration_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  staff_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  productivity_score NUMERIC(3, 2) DEFAULT 0,
  quality_score NUMERIC(3, 2) DEFAULT 0,
  attendance_score NUMERIC(3, 2) DEFAULT 0,
  reliability_score NUMERIC(3, 2) DEFAULT 0,
  overall_performance_score NUMERIC(3, 2) DEFAULT 0,
  scheduling_weight NUMERIC(3, 2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, period_start, period_end)
);

-- Department Labor Budget table: Labor budget management
CREATE TABLE IF NOT EXISTS ops_department_labor_budget (
  budget_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  department TEXT NOT NULL,
  fiscal_year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  budget_amount NUMERIC(12, 2) NOT NULL,
  actual_spent NUMERIC(12, 2) DEFAULT 0,
  remaining_budget NUMERIC(12, 2) DEFAULT 0,
  variance_percent NUMERIC(5, 2) DEFAULT 0,
  staff_count_budget INTEGER DEFAULT 0,
  staff_count_actual INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(department, fiscal_year, month)
);

-- Scheduling Constraints table: Business rules and constraints
CREATE TABLE IF NOT EXISTS ops_scheduling_constraints (
  constraint_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  constraint_type TEXT NOT NULL CHECK (constraint_type IN ('min_staff', 'max_staff', 'skill_requirement', 'break_requirement', 'rest_period', 'max_consecutive_days', 'max_hours_per_week', 'max_overtime')),
  department TEXT,
  constraint_value JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ops_optimized_schedules_date ON ops_optimized_schedules(date);
CREATE INDEX idx_ops_optimized_schedules_department ON ops_optimized_schedules(department);
CREATE INDEX idx_ops_optimization_metrics_schedule ON ops_optimization_metrics(schedule_id);
CREATE INDEX idx_ops_optimized_shifts_schedule ON ops_optimized_shifts(schedule_id);
CREATE INDEX idx_ops_staff_assignments_shift ON ops_staff_assignments(shift_id);
CREATE INDEX idx_ops_staff_assignments_staff ON ops_staff_assignments(staff_id);
CREATE INDEX idx_ops_staff_skills_staff ON ops_staff_skills(staff_id);
CREATE INDEX idx_ops_staff_skills_category ON ops_staff_skills(skill_category);
CREATE INDEX idx_ops_staff_preferences_staff ON ops_staff_preferences(staff_id);
CREATE INDEX idx_ops_staff_preferences_type ON ops_staff_preferences(preference_type);
CREATE INDEX idx_ops_labor_cost_forecast_department ON ops_labor_cost_forecast(department);
CREATE INDEX idx_ops_labor_cost_forecast_period ON ops_labor_cost_forecast(period_start, period_end);
CREATE INDEX idx_ops_overtime_prediction_staff ON ops_overtime_prediction(staff_id);
CREATE INDEX idx_ops_overtime_prediction_period ON ops_overtime_prediction(period_start, period_end);
CREATE INDEX idx_ops_shift_swap_requests_requester ON ops_shift_swap_requests(requester_staff_id);
CREATE INDEX idx_ops_shift_swap_requests_status ON ops_shift_swap_requests(status);
CREATE INDEX idx_ops_staff_performance_integration_staff ON ops_staff_performance_integration(staff_id);
CREATE INDEX idx_ops_staff_performance_integration_period ON ops_staff_performance_integration(period_start, period_end);
CREATE INDEX idx_ops_department_labor_budget_department ON ops_department_labor_budget(department);
CREATE INDEX idx_ops_department_labor_budget_period ON ops_department_labor_budget(fiscal_year, month);
CREATE INDEX idx_ops_scheduling_constraints_department ON ops_scheduling_constraints(department);
CREATE INDEX idx_ops_scheduling_constraints_type ON ops_scheduling_constraints(constraint_type);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ops_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_ops_optimized_schedules_updated_at
  BEFORE UPDATE ON ops_optimized_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_ops_timestamp();

CREATE TRIGGER trigger_ops_staff_assignments_updated_at
  BEFORE UPDATE ON ops_staff_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_ops_timestamp();

CREATE TRIGGER trigger_ops_staff_preferences_updated_at
  BEFORE UPDATE ON ops_staff_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_ops_timestamp();

CREATE TRIGGER trigger_ops_labor_cost_forecast_updated_at
  BEFORE UPDATE ON ops_labor_cost_forecast
  FOR EACH ROW
  EXECUTE FUNCTION update_ops_timestamp();

CREATE TRIGGER trigger_ops_scheduling_constraints_updated_at
  BEFORE UPDATE ON ops_scheduling_constraints
  FOR EACH ROW
  EXECUTE FUNCTION update_ops_timestamp();

CREATE TRIGGER trigger_ops_department_labor_budget_updated_at
  BEFORE UPDATE ON ops_department_labor_budget
  FOR EACH ROW
  EXECUTE FUNCTION update_ops_timestamp();

-- Function to calculate optimization score
CREATE OR REPLACE FUNCTION calculate_optimization_score(p_schedule_id TEXT)
RETURNS NUMERIC AS $$
DECLARE
  v_fairness NUMERIC;
  v_preference NUMERIC;
  v_skill NUMERIC;
  v_cost NUMERIC;
  v_compliance NUMERIC;
  v_overall NUMERIC;
BEGIN
  SELECT 
    COALESCE(AVG(fairness_score), 0),
    COALESCE(AVG(preference_match_score), 0),
    COALESCE(AVG(skill_coverage_score), 0),
    COALESCE(AVG(cost_efficiency_score), 0),
    COALESCE(AVG(compliance_score), 0)
  INTO v_fairness, v_preference, v_skill, v_cost, v_compliance
  FROM ops_optimization_metrics
  WHERE schedule_id = p_schedule_id;
  
  -- Weighted average (adjust weights as needed)
  v_overall := (v_fairness * 0.2) + (v_preference * 0.15) + (v_skill * 0.25) + (v_cost * 0.25) + (v_compliance * 0.15);
  
  RETURN v_overall;
END;
$$ LANGUAGE plpgsql;

-- Function to generate labor cost forecast
CREATE OR REPLACE FUNCTION generate_ops_labor_forecast(p_department TEXT, p_period_start DATE, p_period_end DATE)
RETURNS VOID AS $$
DECLARE
  v_projected_cost NUMERIC;
  v_budget NUMERIC;
  v_variance NUMERIC;
  v_variance_percent NUMERIC;
  v_drivers JSONB;
BEGIN
  -- Get historical average labor cost for similar periods
  SELECT COALESCE(AVG(total_labor_cost), 0)
  INTO v_projected_cost
  FROM ops_optimized_schedules
  WHERE department = p_department
    AND date BETWEEN (p_period_start - INTERVAL '1 year') AND (p_period_end - INTERVAL '1 year');
  
  -- Apply growth factor (5% default)
  v_projected_cost := v_projected_cost * 1.05;
  
  -- Get budget for the period
  SELECT COALESCE(budget_amount, 0)
  INTO v_budget
  FROM ops_department_labor_budget
  WHERE department = p_department
    AND fiscal_year = EXTRACT(YEAR FROM p_period_start)::INTEGER
    AND month = EXTRACT(MONTH FROM p_period_start)::INTEGER;
  
  -- Calculate variance
  v_variance := v_projected_cost - v_budget;
  IF v_budget > 0 THEN
    v_variance_percent := (v_variance / v_budget) * 100;
  ELSE
    v_variance_percent := 0;
  END IF;
  
  -- Build drivers JSON
  v_drivers := jsonb_build_object(
    'historical_trend', v_projected_cost * 0.4,
    'occupancy_forecast', v_projected_cost * 0.3,
    'seasonality', v_projected_cost * 0.2,
    'staffing_changes', v_projected_cost * 0.1
  );
  
  -- Insert or update forecast
  INSERT INTO ops_labor_cost_forecast (
    department,
    period_start,
    period_end,
    projected_labor_cost,
    budget,
    variance,
    variance_percent,
    forecast_confidence,
    drivers
  ) VALUES (
    p_department,
    p_period_start,
    p_period_end,
    v_projected_cost,
    v_budget,
    v_variance,
    v_variance_percent,
    75.0,
    v_drivers
  )
  ON CONFLICT (department, period_start, period_end)
  DO UPDATE SET
    projected_labor_cost = EXCLUDED.projected_labor_cost,
    budget = EXCLUDED.budget,
    variance = EXCLUDED.variance,
    variance_percent = EXCLUDED.variance_percent,
    drivers = EXCLUDED.drivers;
END;
$$ LANGUAGE plpgsql;

-- Function to predict overtime risk
CREATE OR REPLACE FUNCTION predict_overtime_risk(p_staff_id TEXT, p_period_start DATE, p_period_end DATE)
RETURNS VOID AS $$
DECLARE
  v_predicted_hours NUMERIC;
  v_standard_hours NUMERIC;
  v_overtime_hours NUMERIC;
  v_overtime_cost NUMERIC;
  v_risk_level TEXT;
  v_factors JSONB;
  v_hourly_rate NUMERIC;
BEGIN
  -- Get staff hourly rate (default to 15 if not found)
  SELECT COALESCE(hourly_rate, 15)
  INTO v_hourly_rate
  FROM fb_staff_schedules
  WHERE staff_id = p_staff_id
  LIMIT 1;
  
  -- Calculate predicted hours based on scheduled shifts
  SELECT COALESCE(SUM(hours_scheduled), 0)
  INTO v_predicted_hours
  FROM ops_staff_assignments
  JOIN ops_optimized_shifts ON ops_staff_assignments.shift_id = ops_optimized_shifts.shift_id
  JOIN ops_optimized_schedules ON ops_optimized_shifts.schedule_id = ops_optimized_schedules.schedule_id
  WHERE ops_staff_assignments.staff_id = p_staff_id
    AND ops_optimized_schedules.date BETWEEN p_period_start AND p_period_end;
  
  -- Standard hours (40 hours per week / 4 weeks = 160 hours per month)
  v_standard_hours := 160;
  
  -- Calculate overtime
  IF v_predicted_hours > v_standard_hours THEN
    v_overtime_hours := v_predicted_hours - v_standard_hours;
    v_overtime_cost := v_overtime_hours * v_hourly_rate * 1.5; -- 1.5x overtime rate
  ELSE
    v_overtime_hours := 0;
    v_overtime_cost := 0;
  END IF;
  
  -- Determine risk level
  IF v_overtime_hours > 20 THEN
    v_risk_level := 'critical';
  ELSIF v_overtime_hours > 10 THEN
    v_risk_level := 'high';
  ELSIF v_overtime_hours > 5 THEN
    v_risk_level := 'medium';
  ELSE
    v_risk_level := 'low';
  END IF;
  
  -- Build contributing factors
  v_factors := jsonb_build_object(
    'predicted_hours', v_predicted_hours,
    'standard_hours', v_standard_hours,
    'overtime_hours', v_overtime_hours,
    'hourly_rate', v_hourly_rate
  );
  
  -- Insert prediction
  INSERT INTO ops_overtime_prediction (
    staff_id,
    period_start,
    period_end,
    predicted_overtime_hours,
    predicted_overtime_cost,
    risk_level,
    contributing_factors,
    recommendations
  ) VALUES (
    p_staff_id,
    p_period_start,
    p_period_end,
    v_overtime_hours,
    v_overtime_cost,
    v_risk_level,
    v_factors,
    CASE 
      WHEN v_risk_level = 'critical' THEN ARRAY['Reduce scheduled hours', 'Hire additional staff', 'Review workload distribution']
      WHEN v_risk_level = 'high' THEN ARRAY['Monitor closely', 'Consider shift adjustments', 'Plan for coverage']
      WHEN v_risk_level = 'medium' THEN ARRAY['Track hours', 'Optimize scheduling', 'Prevent escalation']
      ELSE ARRAY['Continue monitoring']
    END
  );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate staff performance integration score
CREATE OR REPLACE FUNCTION calculate_staff_performance_integration(p_staff_id TEXT, p_period_start DATE, p_period_end DATE)
RETURNS VOID AS $$
DECLARE
  v_productivity NUMERIC;
  v_quality NUMERIC;
  v_attendance NUMERIC;
  v_reliability NUMERIC;
  v_overall NUMERIC;
  v_scheduling_weight NUMERIC;
BEGIN
  -- Calculate productivity score (based on performance metrics)
  SELECT COALESCE(AVG(sales_per_hour), 0)
  INTO v_productivity
  FROM fb_server_performance
  WHERE staff_id = p_staff_id
    AND period_start >= p_period_start
    AND period_end <= p_period_end;
  
  -- Normalize to 0-100 scale
  v_productivity := LEAST(v_productivity * 2, 100);
  
  -- Calculate quality score (based on guest satisfaction)
  SELECT COALESCE(AVG(guest_satisfaction_score), 50)
  INTO v_quality
  FROM fb_server_performance
  WHERE staff_id = p_staff_id
    AND period_start >= p_period_start
    AND period_end <= p_period_end;
  
  -- Calculate attendance score (based on no-show rate)
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 100
      ELSE (1.0 - (COUNT(*) FILTER (WHERE status = 'no_show')::NUMERIC / COUNT(*))) * 100
    END
  INTO v_attendance
  FROM fb_staff_schedules
  WHERE staff_id = p_staff_id
    AND date BETWEEN p_period_start AND p_period_end;
  
  -- Calculate reliability score (based on schedule adherence)
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 100
      ELSE (1.0 - ABS(COALESCE(SUM(actual_hours), 0) - COALESCE(SUM(scheduled_hours), 0)) / GREATEST(SUM(scheduled_hours), 1)) * 100
    END
  INTO v_reliability
  FROM fb_staff_schedules
  WHERE staff_id = p_staff_id
    AND date BETWEEN p_period_start AND p_period_end;
  
  -- Calculate overall score (weighted average)
  v_overall := (v_productivity * 0.3) + (v_quality * 0.3) + (v_attendance * 0.2) + (v_reliability * 0.2);
  
  -- Calculate scheduling weight (higher performance = higher weight for desirable shifts)
  v_scheduling_weight := v_overall / 100.0;
  
  -- Insert or update integration record
  INSERT INTO ops_staff_performance_integration (
    staff_id,
    period_start,
    period_end,
    productivity_score,
    quality_score,
    attendance_score,
    reliability_score,
    overall_performance_score,
    scheduling_weight
  ) VALUES (
    p_staff_id,
    p_period_start,
    p_period_end,
    v_productivity,
    v_quality,
    v_attendance,
    v_reliability,
    v_overall,
    v_scheduling_weight
  )
  ON CONFLICT (staff_id, period_start, period_end)
  DO UPDATE SET
    productivity_score = EXCLUDED.productivity_score,
    quality_score = EXCLUDED.quality_score,
    attendance_score = EXCLUDED.attendance_score,
    reliability_score = EXCLUDED.reliability_score,
    overall_performance_score = EXCLUDED.overall_performance_score,
    scheduling_weight = EXCLUDED.scheduling_weight;
END;
$$ LANGUAGE plpgsql;

-- Function to check scheduling constraints
CREATE OR REPLACE FUNCTION check_scheduling_constraint(p_constraint_type TEXT, p_department TEXT, p_constraint_value JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_active BOOLEAN;
  v_priority TEXT;
BEGIN
  -- Check if constraint exists and is active
  SELECT is_active, priority
  INTO v_is_active, v_priority
  FROM ops_scheduling_constraints
  WHERE constraint_type = p_constraint_type
    AND (p_department IS NULL OR department = p_department OR department = 'all')
    AND is_active = TRUE
  ORDER BY 
    CASE priority
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'normal' THEN 3
      WHEN 'low' THEN 4
    END
  LIMIT 1;
  
  -- If no active constraint found, allow by default
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;
  
  -- Here you would implement specific constraint validation logic
  -- For now, return TRUE (placeholder for actual validation)
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Insert default scheduling constraints
INSERT INTO ops_scheduling_constraints (constraint_type, department, constraint_value, priority, description) VALUES
('max_hours_per_week', 'all', '{"max_hours": 40, "allow_overtime": true, "max_overtime_hours": 8}'::jsonb, 'critical', 'Maximum hours per week per staff member'),
('max_consecutive_days', 'all', '{"max_days": 6, "required_rest_days": 1}'::jsonb, 'high', 'Maximum consecutive working days'),
('rest_period', 'all', '{"min_hours_between_shifts": 11}'::jsonb, 'high', 'Minimum rest period between shifts'),
('break_requirement', 'all', '{"break_after_hours": 5, "break_duration_minutes": 30}'::jsonb, 'normal', 'Required break after working hours'),
('min_staff', NULL, '{"front_office": 2, "housekeeping": 4, "maintenance": 1}'::jsonb, 'critical', 'Minimum staff required per department'),
('max_overtime', 'all', '{"max_weekly_overtime_hours": 8, "max_monthly_overtime_hours": 20}'::jsonb, 'high', 'Maximum allowed overtime')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_optimized_schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_optimization_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_optimized_shifts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_staff_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_staff_skills TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_staff_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_labor_cost_forecast TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_overtime_prediction TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_shift_swap_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_staff_performance_integration TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_department_labor_budget TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_scheduling_constraints TO authenticated;

GRANT EXECUTE ON FUNCTION calculate_optimization_score(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_ops_labor_forecast(TEXT, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION predict_overtime_risk(TEXT, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_staff_performance_integration(TEXT, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION check_scheduling_constraint(TEXT, TEXT, JSONB) TO authenticated;
