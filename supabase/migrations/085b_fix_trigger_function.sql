-- Fix the update_updated_at_column trigger function to handle tables without updated_at column
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
