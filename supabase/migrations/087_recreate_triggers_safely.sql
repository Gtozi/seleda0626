-- Recreate all triggers to use the safe updated_at function

-- Drop all existing triggers
DROP TRIGGER IF EXISTS update_metric_definitions_updated_at ON metric_definitions;
DROP TRIGGER IF EXISTS update_reporting_snapshots_updated_at ON reporting_snapshots;
DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON alert_rules;
DROP TRIGGER IF EXISTS update_alert_instances_updated_at ON alert_instances;
DROP TRIGGER IF EXISTS update_dashboard_views_last_modified ON dashboard_views;
DROP TRIGGER IF EXISTS update_report_schedules_updated_at ON report_schedules;
DROP TRIGGER IF EXISTS update_drill_down_links_updated_at ON drill_down_links;
DROP TRIGGER IF EXISTS update_forecast_entries_updated_at ON forecast_entries;

-- Drop individual trigger functions
DROP FUNCTION IF EXISTS update_metric_definitions_updated_at();
DROP FUNCTION IF EXISTS update_reporting_snapshots_updated_at();
DROP FUNCTION IF EXISTS update_alert_rules_updated_at();
DROP FUNCTION IF EXISTS update_alert_instances_updated_at();
DROP FUNCTION IF EXISTS update_dashboard_views_last_modified();
DROP FUNCTION IF EXISTS update_report_schedules_updated_at();
DROP FUNCTION IF EXISTS update_drill_down_links_updated_at();
DROP FUNCTION IF EXISTS update_forecast_entries_updated_at();

-- Recreate the safe trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set updated_at if the column exists in the table
    IF TG_TABLE_NAME IN ('metric_definitions', 'reporting_snapshots', 'alert_rules', 'alert_instances', 'dashboard_views', 'report_schedules', 'drill_down_links', 'forecast_entries') THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables that have updated_at column
CREATE TRIGGER update_metric_definitions_updated_at BEFORE UPDATE ON metric_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reporting_snapshots_updated_at BEFORE UPDATE ON reporting_snapshots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_instances_updated_at BEFORE UPDATE ON alert_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_views_last_modified BEFORE UPDATE ON dashboard_views
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_schedules_updated_at BEFORE UPDATE ON report_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drill_down_links_updated_at BEFORE UPDATE ON drill_down_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forecast_entries_updated_at BEFORE UPDATE ON forecast_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
