-- Final fix for triggers - create individual functions for each table

-- Drop all existing triggers for Executive Portal tables
DROP TRIGGER IF EXISTS update_metric_definitions_updated_at ON metric_definitions;
DROP TRIGGER IF EXISTS update_reporting_snapshots_updated_at ON reporting_snapshots;
DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON alert_rules;
DROP TRIGGER IF EXISTS update_alert_instances_updated_at ON alert_instances;
DROP TRIGGER IF EXISTS update_dashboard_views_last_modified ON dashboard_views;
DROP TRIGGER IF EXISTS update_report_schedules_updated_at ON report_schedules;
DROP TRIGGER IF EXISTS update_drill_down_links_updated_at ON drill_down_links;
DROP TRIGGER IF EXISTS update_forecast_entries_updated_at ON forecast_entries;

-- Drop individual trigger functions for Executive Portal tables
-- Note: Do NOT drop update_updated_at_column() as it's used by other tables
DROP FUNCTION IF EXISTS update_metric_definitions_updated_at();
DROP FUNCTION IF EXISTS update_reporting_snapshots_updated_at();
DROP FUNCTION IF EXISTS update_alert_rules_updated_at();
DROP FUNCTION IF EXISTS update_alert_instances_updated_at();
DROP FUNCTION IF EXISTS update_dashboard_views_last_modified();
DROP FUNCTION IF EXISTS update_report_schedules_updated_at();
DROP FUNCTION IF EXISTS update_drill_down_links_updated_at();
DROP FUNCTION IF EXISTS update_forecast_entries_updated_at();

-- Create individual trigger functions for each table
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

-- Apply triggers only to tables that have update timestamp columns
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
