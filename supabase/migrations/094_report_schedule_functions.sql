-- Executive Portal - Report Schedule Functions
-- Phase 7: Implement ReportSchedule automated export
-- Adapted to work with existing report_schedules table schema

-- Function to get active report schedules for a specific day
CREATE OR REPLACE FUNCTION get_due_reports(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
    id UUID,
    report_name VARCHAR,
    frequency VARCHAR,
    recipients TEXT[],
    status VARCHAR,
    next_run TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rs.id,
        rs.report_name,
        rs.frequency,
        rs.recipients,
        rs.status,
        rs.next_run
    FROM report_schedules rs
    WHERE rs.status = 'Active'
    AND (
        -- Daily reports
        (rs.frequency = 'Daily') OR
        -- Weekly reports (check if day matches)
        (rs.frequency = 'Weekly' AND rs.next_run = TO_CHAR(p_date, 'Day')) OR
        -- Monthly reports (check if day of month matches)
        (rs.frequency = 'Monthly' AND rs.next_run::INTEGER = EXTRACT(DAY FROM p_date)) OR
        -- Quarterly reports (check if it's the first day of a quarter)
        (rs.frequency = 'Quarterly' AND 
         EXTRACT(DAY FROM p_date) = 1 AND 
         EXTRACT(MONTH FROM p_date) IN (1, 4, 7, 10))
    );
END;
$$ LANGUAGE plpgsql;

-- Function to mark a report as sent
CREATE OR REPLACE FUNCTION mark_report_sent(p_schedule_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE report_schedules
    SET updated_at = NOW()
    WHERE id = p_schedule_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new report schedule
CREATE OR REPLACE FUNCTION create_report_schedule(
    p_report_name VARCHAR,
    p_recipients TEXT[],
    p_frequency VARCHAR,
    p_next_run TEXT,
    p_created_by TEXT
)
RETURNS UUID AS $$
DECLARE
    new_schedule_id UUID;
BEGIN
    INSERT INTO report_schedules (
        report_name, frequency, recipients, next_run, status, created_by
    )
    VALUES (
        p_report_name, p_frequency, p_recipients, p_next_run, 'Active', p_created_by
    )
    RETURNING id INTO new_schedule_id;
    
    RETURN new_schedule_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update a report schedule
CREATE OR REPLACE FUNCTION update_report_schedule(
    p_schedule_id UUID,
    p_report_name VARCHAR,
    p_recipients TEXT[],
    p_frequency VARCHAR,
    p_next_run TEXT,
    p_status VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE report_schedules
    SET 
        report_name = p_report_name,
        recipients = p_recipients,
        frequency = p_frequency,
        next_run = p_next_run,
        status = p_status,
        updated_at = NOW()
    WHERE id = p_schedule_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to delete a report schedule
CREATE OR REPLACE FUNCTION delete_report_schedule(p_schedule_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM report_schedules
    WHERE id = p_schedule_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get all report schedules
CREATE OR REPLACE FUNCTION get_all_report_schedules()
RETURNS TABLE(
    id UUID,
    report_name VARCHAR,
    frequency VARCHAR,
    recipients TEXT[],
    status VARCHAR,
    next_run TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rs.id,
        rs.report_name,
        rs.frequency,
        rs.recipients,
        rs.status,
        rs.next_run,
        rs.created_by,
        rs.created_at,
        rs.updated_at
    FROM report_schedules rs
    ORDER BY rs.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert sample report schedules (without created_by to avoid FK constraint)
INSERT INTO report_schedules (report_name, frequency, recipients, next_run, status) VALUES
  ('Daily GM Summary', 'Daily', ARRAY['gm@hotel.com', 'owner@hotel.com'], NULL, 'Active'),
  ('Weekly Financial Report', 'Weekly', ARRAY['finance@hotel.com', 'gm@hotel.com'], 'Monday', 'Active'),
  ('Monthly Operations Review', 'Monthly', ARRAY['gm@hotel.com', 'departmentmanager@hotel.com'], '1', 'Active'),
  ('Quarterly Owner Report', 'Quarterly', ARRAY['owner@hotel.com', 'gm@hotel.com', 'finance@hotel.com'], NULL, 'Active')
ON CONFLICT DO NOTHING;
