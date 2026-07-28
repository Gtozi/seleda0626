-- Executive Portal - Metric History and Trend Analysis Functions
-- Phase 6: Add MetricHistory + period-over-period/trend UI support

-- Function to get metric history for a date range
CREATE OR REPLACE FUNCTION get_metric_history(
    p_metric_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_property_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'
)
RETURNS TABLE(
    history_id UUID,
    metric_id UUID,
    date DATE,
    value DECIMAL,
    property_id UUID,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mh.history_id,
        mh.metric_id,
        mh.date,
        mh.value,
        mh.property_id,
        mh.created_at
    FROM metric_history mh
    WHERE mh.metric_id = p_metric_id
    AND mh.property_id = p_property_id
    AND mh.date BETWEEN p_start_date AND p_end_date
    ORDER BY mh.date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate period-over-period changes
CREATE OR REPLACE FUNCTION calculate_period_over_period(
    p_metric_id UUID,
    p_current_date DATE,
    p_previous_date DATE,
    p_property_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'
)
RETURNS TABLE(
    metric_id UUID,
    current_value DECIMAL,
    previous_value DECIMAL,
    absolute_change DECIMAL,
    percentage_change DECIMAL,
    curr_date DATE,
    previous_date DATE
) AS $$
DECLARE
    current_val DECIMAL;
    previous_val DECIMAL;
    abs_change DECIMAL;
    pct_change DECIMAL;
BEGIN
    -- Get current period value
    SELECT value INTO current_val
    FROM metric_history
    WHERE metric_id = p_metric_id
    AND property_id = p_property_id
    AND date = p_current_date;
    
    -- Get previous period value
    SELECT value INTO previous_val
    FROM metric_history
    WHERE metric_id = p_metric_id
    AND property_id = p_property_id
    AND date = p_previous_date;
    
    -- Calculate changes
    IF current_val IS NOT NULL AND previous_val IS NOT NULL AND previous_val != 0 THEN
        abs_change := current_val - previous_val;
        pct_change := (current_val - previous_val) / previous_val * 100;
    ELSE
        abs_change := NULL;
        pct_change := NULL;
    END IF;
    
    RETURN QUERY
    SELECT 
        p_metric_id,
        current_val,
        previous_val,
        abs_change,
        pct_change,
        p_current_date AS curr_date,
        p_previous_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get trend analysis for a metric
CREATE OR REPLACE FUNCTION get_metric_trend(
    p_metric_id UUID,
    p_days INTEGER DEFAULT 30,
    p_property_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'
)
RETURNS TABLE(
    metric_id UUID,
    start_date DATE,
    end_date DATE,
    start_value DECIMAL,
    end_value DECIMAL,
    total_change DECIMAL,
    percentage_change DECIMAL,
    average_value DECIMAL,
    min_value DECIMAL,
    max_value DECIMAL,
    trend_direction VARCHAR
) AS $$
DECLARE
    start_val DECIMAL;
    end_val DECIMAL;
    total_chg DECIMAL;
    pct_chg DECIMAL;
    avg_val DECIMAL;
    min_val DECIMAL;
    max_val DECIMAL;
    trend_dir VARCHAR;
    end_dt DATE;
    start_dt DATE;
BEGIN
    -- Calculate date range
    end_dt := CURRENT_DATE;
    start_dt := end_dt - (p_days || ' days')::INTERVAL;
    
    -- Get start and end values
    SELECT value INTO start_val
    FROM metric_history
    WHERE metric_id = p_metric_id
    AND property_id = p_property_id
    AND date >= start_dt
    ORDER BY date ASC
    LIMIT 1;
    
    SELECT value INTO end_val
    FROM metric_history
    WHERE metric_id = p_metric_id
    AND property_id = p_property_id
    AND date <= end_dt
    ORDER BY date DESC
    LIMIT 1;
    
    -- Calculate statistics
    SELECT 
        AVG(value),
        MIN(value),
        MAX(value)
    INTO avg_val, min_val, max_val
    FROM metric_history
    WHERE metric_id = p_metric_id
    AND property_id = p_property_id
    AND date BETWEEN start_dt AND end_dt;
    
    -- Calculate changes
    IF start_val IS NOT NULL AND end_val IS NOT NULL AND start_val != 0 THEN
        total_chg := end_val - start_val;
        pct_chg := (end_val - start_val) / start_val * 100;
        
        -- Determine trend direction
        IF pct_chg > 5 THEN
            trend_dir := 'Strongly Increasing';
        ELSIF pct_chg > 0 THEN
            trend_dir := 'Increasing';
        ELSIF pct_chg < -5 THEN
            trend_dir := 'Strongly Decreasing';
        ELSIF pct_chg < 0 THEN
            trend_dir := 'Decreasing';
        ELSE
            trend_dir := 'Stable';
        END IF;
    ELSE
        total_chg := NULL;
        pct_chg := NULL;
        trend_dir := 'Insufficient Data';
    END IF;
    
    RETURN QUERY
    SELECT 
        p_metric_id,
        start_dt,
        end_dt,
        start_val,
        end_val,
        total_chg,
        pct_chg,
        avg_val,
        min_val,
        max_val,
        trend_dir;
END;
$$ LANGUAGE plpgsql;

-- Function to get moving average for a metric
CREATE OR REPLACE FUNCTION get_moving_average(
    p_metric_id UUID,
    p_window_days INTEGER DEFAULT 7,
    p_end_date DATE DEFAULT CURRENT_DATE,
    p_property_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'
)
RETURNS TABLE(
    date DATE,
    value DECIMAL,
    moving_average DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mh.date,
        mh.value,
        AVG(mh2.value) OVER (
            ORDER BY mh.date 
            ROWS BETWEEN (p_window_days - 1) PRECEDING AND CURRENT ROW
        ) AS moving_average
    FROM metric_history mh
    LEFT JOIN metric_history mh2 ON mh.metric_id = mh2.metric_id 
        AND mh.property_id = mh2.property_id
        AND mh2.date BETWEEN mh.date - (p_window_days || ' days')::INTERVAL AND mh.date
    WHERE mh.metric_id = p_metric_id
    AND mh.property_id = p_property_id
    AND mh.date <= p_end_date
    GROUP BY mh.date, mh.value
    ORDER BY mh.date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to populate metric history from reporting snapshots
CREATE OR REPLACE FUNCTION populate_metric_history_from_snapshot(
    p_snapshot_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    snapshot_record RECORD;
    metric_key TEXT;
    metric_id UUID;
    metric_value DECIMAL;
    snapshot_date DATE;
    property_id UUID;
    inserted_count INTEGER DEFAULT 0;
BEGIN
    -- Get snapshot details
    SELECT snapshot_date, property_id, metric_values
    INTO snapshot_date, property_id, snapshot_record.metric_values
    FROM reporting_snapshots
    WHERE snapshot_id = p_snapshot_id;
    
    -- Insert metric values into history
    FOR metric_key, metric_value IN 
        SELECT * FROM jsonb_each_text(snapshot_record.metric_values)
    LOOP
        -- Try to find metric by name (simplified - in production use metric_id directly)
        SELECT metric_id INTO metric_id
        FROM metric_definitions
        WHERE LOWER(name) = LOWER(metric_key)
        LIMIT 1;
        
        IF metric_id IS NOT NULL AND metric_value IS NOT NULL THEN
            INSERT INTO metric_history (metric_id, date, value, property_id)
            VALUES (metric_id, snapshot_date, metric_value::DECIMAL, property_id)
            ON CONFLICT (metric_id, date, property_id) 
            DO UPDATE SET value = EXCLUDED.value;
            
            inserted_count := inserted_count + 1;
        END IF;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;
