-- Executive Portal - Reporting Data Mart Schema
-- Phase 2: MetricDefinition + ReportingSnapshot schema for aggregation layer
-- This migration creates the foundational database schema for the Executive Portal

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MetricDefinition table - Catalog of all KPIs across departments
CREATE TABLE IF NOT EXISTS metric_definitions (
  metric_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  module VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL CHECK (unit IN ('Percent', 'Currency', 'Count', 'Duration', 'Ratio')),
  direction VARCHAR(50) NOT NULL CHECK (direction IN ('HigherIsBetter', 'LowerIsBetter', 'Neutral')),
  target_value DECIMAL(15,2),
  formula TEXT,
  department VARCHAR(100) NOT NULL,
  is_computed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ReportingSnapshot table - Standardized daily snapshots from all modules
CREATE TABLE IF NOT EXISTS reporting_snapshots (
  snapshot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module VARCHAR(100) NOT NULL,
  property_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001', -- Default single-property ID
  snapshot_date DATE NOT NULL,
  metric_values JSONB NOT NULL, -- Map of metric_id -> value
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_quality_flag VARCHAR(50) NOT NULL DEFAULT 'Complete' CHECK (data_quality_flag IN ('Complete', 'Partial', 'Estimated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module, property_id, snapshot_date)
);

-- 3. MetricHistory table - Time-series data for trend analysis
CREATE TABLE IF NOT EXISTS metric_history (
  history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID NOT NULL REFERENCES metric_definitions(metric_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  property_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_id, date, property_id)
);

-- 4. AlertRule table - Alert configuration
CREATE TABLE IF NOT EXISTS alert_rules (
  rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID NOT NULL REFERENCES metric_definitions(metric_id) ON DELETE CASCADE,
  condition VARCHAR(50) NOT NULL CHECK (condition IN ('AboveTarget', 'BelowTarget', 'PctChangeExceeds', 'NoDataReceived')),
  threshold DECIMAL(15,2) NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('Info', 'Warning', 'Critical')),
  notify_roles TEXT[] NOT NULL,
  notify_channel VARCHAR(50) NOT NULL CHECK (notify_channel IN ('InApp', 'Email', 'SMS', 'Both')),
  is_active BOOLEAN DEFAULT TRUE,
  cooldown_period INTERVAL DEFAULT '1 hour',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AlertInstance table - Alert occurrences
CREATE TABLE IF NOT EXISTS alert_instances (
  instance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES alert_rules(rule_id) ON DELETE CASCADE,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  value DECIMAL(15,2),
  status VARCHAR(50) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Acknowledged', 'Resolved', 'Snoozed')),
  acknowledged_by UUID,
  resolution_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DashboardView table - Custom dashboard configurations per role
CREATE TABLE IF NOT EXISTS dashboard_views (
  view_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  owner_role VARCHAR(100) NOT NULL CHECK (owner_role IN ('Owner', 'GM', 'DepartmentManager', 'Finance', 'Auditor')),
  tile_layout JSONB NOT NULL, -- Grid position per TileID
  default_date_range VARCHAR(50) NOT NULL DEFAULT 'Week' CHECK (default_date_range IN ('Today', 'WTD', 'MTD', 'QTD', 'YTD', 'Custom')),
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ReportSchedule table - Automated report export scheduling
CREATE TABLE IF NOT EXISTS report_schedules (
  schedule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  recipient_list TEXT[] NOT NULL,
  frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly')),
  day_of_week_or_month VARCHAR(50),
  report_content JSONB NOT NULL, -- TileID[] or "Full Dashboard"
  format VARCHAR(50) NOT NULL CHECK (format IN ('PDF', 'Excel', 'Both')),
  last_sent_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DrillDownLink table - Navigation to source module detail views
CREATE TABLE IF NOT EXISTS drill_down_links (
  link_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tile_id UUID NOT NULL,
  target_module VARCHAR(100) NOT NULL,
  target_view VARCHAR(255) NOT NULL,
  required_permission VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ForecastEntry table (Phase 3) - Forecast projections clearly separated from actuals
CREATE TABLE IF NOT EXISTS forecast_entries (
  forecast_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID NOT NULL REFERENCES metric_definitions(metric_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  forecasted_value DECIMAL(15,2) NOT NULL,
  confidence_level VARCHAR(50) NOT NULL CHECK (confidence_level IN ('Low', 'Medium', 'High')),
  method VARCHAR(255),
  is_projection BOOLEAN DEFAULT TRUE NOT NULL,
  property_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_id, date, property_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reporting_snapshots_module_date ON reporting_snapshots(module, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_reporting_snapshots_property_date ON reporting_snapshots(property_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_metric_history_metric_date ON metric_history(metric_id, date);
CREATE INDEX IF NOT EXISTS idx_alert_instances_rule_status ON alert_instances(rule_id, status);
CREATE INDEX IF NOT EXISTS idx_alert_instances_triggered_at ON alert_instances(triggered_at);
CREATE INDEX IF NOT EXISTS idx_forecast_entries_metric_date ON forecast_entries(metric_id, date);

-- Create individual updated_at trigger functions for each table
CREATE OR REPLACE FUNCTION update_metric_definitions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_reporting_snapshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_alert_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_alert_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_dashboard_views_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_report_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_drill_down_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_forecast_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_metric_definitions_updated_at ON metric_definitions;
DROP TRIGGER IF EXISTS update_reporting_snapshots_updated_at ON reporting_snapshots;
DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON alert_rules;
DROP TRIGGER IF EXISTS update_alert_instances_updated_at ON alert_instances;
DROP TRIGGER IF EXISTS update_dashboard_views_last_modified ON dashboard_views;
DROP TRIGGER IF EXISTS update_report_schedules_updated_at ON report_schedules;
DROP TRIGGER IF EXISTS update_drill_down_links_updated_at ON drill_down_links;
DROP TRIGGER IF EXISTS update_forecast_entries_updated_at ON forecast_entries;

-- Apply updated_at triggers to each table using its specific function
CREATE TRIGGER update_metric_definitions_updated_at BEFORE UPDATE ON metric_definitions
    FOR EACH ROW EXECUTE FUNCTION update_metric_definitions_updated_at();

CREATE TRIGGER update_reporting_snapshots_updated_at BEFORE UPDATE ON reporting_snapshots
    FOR EACH ROW EXECUTE FUNCTION update_reporting_snapshots_updated_at();

CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules
    FOR EACH ROW EXECUTE FUNCTION update_alert_rules_updated_at();

CREATE TRIGGER update_alert_instances_updated_at BEFORE UPDATE ON alert_instances
    FOR EACH ROW EXECUTE FUNCTION update_alert_instances_updated_at();

CREATE TRIGGER update_dashboard_views_last_modified BEFORE UPDATE ON dashboard_views
    FOR EACH ROW EXECUTE FUNCTION update_dashboard_views_last_modified();

CREATE TRIGGER update_report_schedules_updated_at BEFORE UPDATE ON report_schedules
    FOR EACH ROW EXECUTE FUNCTION update_report_schedules_updated_at();

CREATE TRIGGER update_drill_down_links_updated_at BEFORE UPDATE ON drill_down_links
    FOR EACH ROW EXECUTE FUNCTION update_drill_down_links_updated_at();

CREATE TRIGGER update_forecast_entries_updated_at BEFORE UPDATE ON forecast_entries
    FOR EACH ROW EXECUTE FUNCTION update_forecast_entries_updated_at();

-- Note: metric_history does not have updated_at column, so no trigger is applied

-- Enable Row Level Security
ALTER TABLE metric_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_down_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated to read metric definitions" ON metric_definitions;
DROP POLICY IF EXISTS "Allow system admin full access to metric_definitions" ON metric_definitions;
DROP POLICY IF EXISTS "Allow system admin full access to reporting_snapshots" ON reporting_snapshots;
DROP POLICY IF EXISTS "Allow system admin full access to metric_history" ON metric_history;
DROP POLICY IF EXISTS "Allow system admin full access to alert_rules" ON alert_rules;
DROP POLICY IF EXISTS "Allow system admin full access to alert_instances" ON alert_instances;
DROP POLICY IF EXISTS "Allow system admin full access to dashboard_views" ON dashboard_views;
DROP POLICY IF EXISTS "Allow system admin full access to report_schedules" ON report_schedules;
DROP POLICY IF EXISTS "Allow system admin full access to drill_down_links" ON drill_down_links;
DROP POLICY IF EXISTS "Allow system admin full access to forecast_entries" ON forecast_entries;

-- RLS Policies - Allow authenticated users to read metric definitions
CREATE POLICY "Allow authenticated to read metric definitions" ON metric_definitions
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies - System Admin can manage all tables
CREATE POLICY "Allow system admin full access to metric_definitions" ON metric_definitions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to reporting_snapshots" ON reporting_snapshots
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to metric_history" ON metric_history
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to alert_rules" ON alert_rules
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to alert_instances" ON alert_instances
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to dashboard_views" ON dashboard_views
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to report_schedules" ON report_schedules
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to drill_down_links" ON drill_down_links
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to forecast_entries" ON forecast_entries
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial metric definitions for the 10 core metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Occupancy Rate', 'Front Office', 'Percent', 'HigherIsBetter', 75.0, 'Rooms Sold / Rooms Available', 'Front Office', FALSE),
  ('Average Daily Rate', 'Front Office', 'Currency', 'HigherIsBetter', 120.0, 'Room Revenue / Rooms Sold', 'Front Office', FALSE),
  ('RevPAR', 'Front Office', 'Currency', 'HigherIsBetter', 80.0, 'Room Revenue / Rooms Available', 'Front Office', TRUE),
  ('Total Revenue', 'Finance', 'Currency', 'HigherIsBetter', NULL, 'Sum of all revenue streams', 'Finance', FALSE),
  ('Labor Cost %', 'HR', 'Percent', 'LowerIsBetter', 35.0, 'Labor Cost / Total Revenue', 'HR', FALSE),
  ('Open Work Orders', 'Maintenance', 'Count', 'LowerIsBetter', 10.0, 'Count of unresolved work orders', 'Maintenance', FALSE),
  ('Pipeline Value', 'Sales & Events', 'Currency', 'HigherIsBetter', 50000.0, 'Sum of tentative/pending bookings', 'Sales & Events', FALSE),
  ('Food Cost %', 'F&B', 'Percent', 'LowerIsBetter', 32.0, 'Food Cost / F&B Revenue', 'F&B', FALSE),
  ('Headcount', 'HR', 'Count', 'Neutral', NULL, 'Total active employees', 'HR', FALSE),
  ('Cash Position', 'Finance', 'Currency', 'HigherIsBetter', 50000.0, 'Available cash and equivalents', 'Finance', FALSE)
ON CONFLICT DO NOTHING;

-- Insert default dashboard view for GM role
INSERT INTO dashboard_views (name, owner_role, tile_layout, default_date_range, is_default) VALUES
  ('GM Daily Dashboard', 'GM',
   '{"occupancy_rate": {"row": 0, "col": 0, "size": "Small"}, "adr": {"row": 0, "col": 1, "size": "Small"}, "revpar": {"row": 0, "col": 2, "size": "Small"}, "total_revenue": {"row": 0, "col": 3, "size": "Small"}, "labor_cost_percent": {"row": 1, "col": 0, "size": "Small"}, "open_work_orders": {"row": 1, "col": 1, "size": "Small"}, "pipeline_value": {"row": 1, "col": 2, "size": "Small"}, "food_cost_percent": {"row": 1, "col": 3, "size": "Small"}, "headcount": {"row": 2, "col": 0, "size": "Small"}, "cash_position": {"row": 2, "col": 1, "size": "Small"}}',
   'WTD', TRUE)
ON CONFLICT DO NOTHING;

-- Insert sample alert rules
INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'BelowTarget',
  60.0,
  'Critical',
  ARRAY['GM', 'Owner'],
  'Both',
  TRUE,
  INTERVAL '4 hours'
FROM metric_definitions 
WHERE name = 'Occupancy Rate'
ON CONFLICT DO NOTHING;

INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'AboveTarget',
  38.0,
  'Warning',
  ARRAY['GM', 'Finance'],
  'InApp',
  TRUE,
  INTERVAL '8 hours'
FROM metric_definitions 
WHERE name = 'Food Cost %'
ON CONFLICT DO NOTHING;
