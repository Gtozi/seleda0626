-- Migration: Revenue Management System (RMS) Core Schema
-- Phase 1 Enhancement: Automated Dynamic Pricing & Demand Forecasting
-- This migration creates the foundation for intelligent pricing algorithms

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================
-- REVENUE MANAGEMENT CONFIGURATION
-- ============================================

-- RMS global configuration settings
CREATE TABLE IF NOT EXISTS rms_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID DEFAULT NULL,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Insert default RMS configuration
INSERT INTO rms_config (config_key, config_value, description) VALUES
('pricing_strategy', '{"strategy": "competitor_based", "enabled": true, "weight_competitor": 0.4, "weight_demand": 0.4, "weight_seasonality": 0.2}', 'Pricing strategy weights'),
('forecast_settings', '{"horizon_days": 90, "model_type": "ensemble", "retrain_frequency_days": 7, "min_confidence_threshold": 0.7}', 'Demand forecast configuration'),
('rate_constraints', '{"min_discount_percent": 15, "max_premium_percent": 50, "last_minute_discount_days": 3, "last_minute_discount_percent": 20}', 'Rate constraint boundaries'),
('elasticity_settings', '{"default_elasticity": -1.2, "room_type_elasticity": {}}', 'Price elasticity settings by room type'),
('competitor_settings', '{"update_frequency_hours": 6, "competitors": [], "rate_parity_threshold": 0.05}', 'Competitor rate shopping configuration')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================
-- PRICING HISTORY & ANALYTICS
-- ============================================

-- Historical pricing data for ML training and analysis
CREATE TABLE IF NOT EXISTS pricing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id TEXT NOT NULL REFERENCES room_types(id),
    date DATE NOT NULL,
    base_rate DECIMAL(10,2) NOT NULL,
    effective_rate DECIMAL(10,2) NOT NULL,
    occupancy_rate DECIMAL(5,2) NOT NULL,
    demand_score DECIMAL(5,2),
    competitor_avg_rate DECIMAL(10,2),
    seasonality_factor DECIMAL(5,2),
    events_impact DECIMAL(5,2),
    pricing_source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_type_id, date)
);

-- Create indexes for pricing history
CREATE INDEX idx_pricing_history_room_type ON pricing_history(room_type_id);
CREATE INDEX idx_pricing_history_date ON pricing_history(date);
CREATE INDEX idx_pricing_history_composite ON pricing_history(room_type_id, date);

-- ============================================
-- COMPETITOR RATE TRACKING
-- ============================================

-- Competitor hotel configuration
CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    property_id UUID,
    star_rating INTEGER,
    proximity_km DECIMAL(5,2),
    competitor_type VARCHAR(50) DEFAULT 'direct',
    website_url TEXT,
    active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor room type mapping
CREATE TABLE IF NOT EXISTS competitor_room_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID REFERENCES competitors(id),
    our_room_type_id TEXT REFERENCES room_types(id),
    their_room_type_name VARCHAR(255),
    quality_score DECIMAL(3,2) DEFAULT 1.0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily competitor rate collection
CREATE TABLE IF NOT EXISTS competitor_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID REFERENCES competitors(id),
    room_type_id TEXT REFERENCES room_types(id),
    date DATE NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    availability BOOLEAN,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(50) DEFAULT 'api',
    UNIQUE(competitor_id, room_type_id, date)
);

-- Create indexes for competitor rates
CREATE INDEX idx_competitor_rates_competitor ON competitor_rates(competitor_id);
CREATE INDEX idx_competitor_rates_date ON competitor_rates(date);
CREATE INDEX idx_competitor_rates_room_type ON competitor_rates(room_type_id);

-- ============================================
-- DEMAND FORECASTING
-- ============================================

-- Demand forecast results
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id TEXT REFERENCES room_types(id),
    forecast_date DATE NOT NULL,
    target_date DATE NOT NULL,
    forecast_demand INTEGER NOT NULL,
    forecast_occupancy DECIMAL(5,2) NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    model_version VARCHAR(50),
    forecast_horizon_days INTEGER,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_type_id, target_date, forecast_date)
);

-- Forecast accuracy tracking
CREATE TABLE IF NOT EXISTS forecast_accuracy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_id UUID REFERENCES demand_forecasts(id),
    actual_demand INTEGER,
    actual_occupancy DECIMAL(5,2),
    error_absolute INTEGER,
    error_percent DECIMAL(5,2),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for forecasts
CREATE INDEX idx_demand_forecasts_room_type ON demand_forecasts(room_type_id);
CREATE INDEX idx_demand_forecasts_target_date ON demand_forecasts(target_date);
CREATE INDEX idx_forecast_accuracy_forecast ON forecast_accuracy(forecast_id);

-- ============================================
-- PRICING RECOMMENDATIONS
-- ============================================

-- System-generated pricing recommendations
CREATE TABLE IF NOT EXISTS pricing_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id TEXT REFERENCES room_types(id),
    date DATE NOT NULL,
    recommended_rate DECIMAL(10,2) NOT NULL,
    current_rate DECIMAL(10,2),
    confidence DECIMAL(5,2) NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    factors JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    applied_by UUID REFERENCES auth.users(id),
    applied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_type_id, date, created_at)
);

-- Pricing recommendation factors structure:
-- {
--   demand_score: number,
--   competitor_avg: number,
--   occupancy_forecast: number,
--   seasonality: number,
--   events_impact: number,
--   length_of_stay_factor: number,
--   corporate_demand: number
-- }

-- Create indexes for recommendations
CREATE INDEX idx_pricing_recommendations_room_type ON pricing_recommendations(room_type_id);
CREATE INDEX idx_pricing_recommendations_date ON pricing_recommendations(date);
CREATE INDEX idx_pricing_recommendations_status ON pricing_recommendations(status);

-- ============================================
-- LENGTH-OF-STAY PRICING
-- ============================================

-- Length-of-stay pricing rules
CREATE TABLE IF NOT EXISTS los_pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id TEXT REFERENCES room_types(id),
    min_nights INTEGER NOT NULL,
    max_nights INTEGER NOT NULL,
    adjustment_percent DECIMAL(5,2) NOT NULL,
    adjustment_type VARCHAR(20) DEFAULT 'percent',
    active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CORPORATE RATE MANAGEMENT
-- ============================================

-- Corporate negotiated rates
CREATE TABLE IF NOT EXISTS corporate_rate_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    corporate_account_id TEXT REFERENCES corporate_accounts(id),
    room_type_id TEXT REFERENCES room_types(id),
    rate_code VARCHAR(50) UNIQUE NOT NULL,
    negotiated_rate DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2),
    volume_commitment INTEGER,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    blackout_dates DATE[],
    terms TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Corporate rate usage tracking
CREATE TABLE IF NOT EXISTS corporate_rate_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agreement_id UUID REFERENCES corporate_rate_agreements(id),
    reservation_id TEXT REFERENCES reservations(id),
    room_nights INTEGER,
    revenue DECIMAL(10,2),
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EVENTS & CALENDAR IMPACT
-- ============================================

-- Local events that impact demand
CREATE TABLE IF NOT EXISTS demand_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    impact_score DECIMAL(5,2) NOT NULL,
    impact_radius_km DECIMAL(5,2),
    expected_attendees INTEGER,
    room_demand_impact INTEGER,
    active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RMS AUDIT LOG
-- ============================================

-- Track all RMS pricing changes
CREATE TABLE IF NOT EXISTS rms_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit log
CREATE INDEX idx_rms_audit_entity ON rms_audit_log(entity_type, entity_id);
CREATE INDEX idx_rms_audit_timestamp ON rms_audit_log(timestamp);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to log pricing changes
CREATE OR REPLACE FUNCTION log_pricing_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND (OLD.effective_rate IS DISTINCT FROM NEW.effective_rate) THEN
        INSERT INTO rms_audit_log (
            action_type, entity_type, entity_id, old_value, new_value,
            reason, user_id, ip_address
        ) VALUES (
            'UPDATE',
            'pricing_history',
            NEW.id,
            jsonb_build_object('effective_rate', OLD.effective_rate),
            jsonb_build_object('effective_rate', NEW.effective_rate),
            'Rate change recorded',
            NEW.updated_by,
            inet_client_addr()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pricing_change_audit
    AFTER UPDATE ON pricing_history
    FOR EACH ROW
    EXECUTE FUNCTION log_pricing_change();

-- Function to calculate demand score based on multiple factors
CREATE OR REPLACE FUNCTION calculate_demand_score(
    p_room_type_id TEXT,
    p_date DATE
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_booked_rooms INTEGER;
    v_total_rooms INTEGER;
    v_occupancy_forecast DECIMAL(5,2);
    v_events_impact DECIMAL(5,2);
    v_seasonality_factor DECIMAL(5,2);
    v_demand_score DECIMAL(5,2);
BEGIN
    -- Get current occupancy for the date
    SELECT COUNT(*), 
           (SELECT COUNT(*) FROM rooms WHERE room_type_id = p_room_type_id AND status NOT IN ('Out of Order', 'Out of Service'))
    INTO v_booked_rooms, v_total_rooms
    FROM reservations
    WHERE room_type_id = p_room_type_id
      AND p_date BETWEEN check_in_date AND check_out_date
      AND status NOT IN ('Cancelled', 'NoShow');
    
    -- Calculate occupancy forecast
    v_occupancy_forecast := CASE WHEN v_total_rooms > 0 THEN (v_booked_rooms::DECIMAL / v_total_rooms::DECIMAL) * 100 ELSE 0 END;
    
    -- Get events impact
    SELECT COALESCE(SUM(impact_score), 0)
    INTO v_events_impact
    FROM demand_events
    WHERE active = true
      AND p_date BETWEEN start_date AND end_date;
    
    -- Get seasonality factor (simplified - would be more complex in production)
    v_seasonality_factor := 1.0; -- Would be calculated from historical data
    
    -- Calculate composite demand score
    v_demand_score := (v_occupancy_forecast * 0.6) + (v_events_impact * 0.3) + (v_seasonality_factor * 10);
    
    RETURN v_demand_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- Pricing performance view
CREATE OR REPLACE VIEW rms_pricing_performance AS
SELECT 
    ph.room_type_id,
    rt.name AS room_type_name,
    ph.date,
    ph.base_rate,
    ph.effective_rate,
    ph.occupancy_rate,
    ph.demand_score,
    ph.competitor_avg_rate,
    CASE WHEN ph.competitor_avg_rate > 0 
         THEN ((ph.effective_rate - ph.competitor_avg_rate) / ph.competitor_avg_rate) * 100 
         ELSE 0 END AS rate_vs_competitor_percent
FROM pricing_history ph
JOIN room_types rt ON ph.room_type_id = rt.id;

-- Competitor rate comparison view
CREATE OR REPLACE VIEW rms_competitor_comparison AS
SELECT 
    DATE(cr.date) AS date,
    rt.name AS room_type_name,
    c.name AS competitor_name,
    cr.rate AS competitor_rate,
    ph.effective_rate AS our_rate,
    CASE WHEN ph.effective_rate > 0 
         THEN ((cr.rate - ph.effective_rate) / ph.effective_rate) * 100 
         ELSE 0 END AS rate_difference_percent
FROM competitor_rates cr
JOIN competitors c ON cr.competitor_id = c.id
JOIN room_types rt ON cr.room_type_id = rt.id
LEFT JOIN pricing_history ph ON ph.room_type_id = cr.room_type_id AND ph.date = cr.date
WHERE c.active = true;

-- Forecast accuracy view
CREATE OR REPLACE VIEW rms_forecast_accuracy_summary AS
SELECT 
    DATE(df.target_date) AS target_date,
    rt.name AS room_type_name,
    AVG(df.forecast_occupancy) AS avg_forecast_occupancy,
    AVG(fa.actual_occupancy) AS avg_actual_occupancy,
    AVG(ABS(fa.error_percent)) AS avg_absolute_error_percent,
    COUNT(*) AS forecast_count
FROM demand_forecasts df
JOIN room_types rt ON df.room_type_id = rt.id
LEFT JOIN forecast_accuracy fa ON fa.forecast_id = df.id
GROUP BY df.target_date, rt.name
ORDER BY df.target_date DESC;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE rms_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE los_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_rate_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rms_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - can be refined based on requirements)
CREATE POLICY "Allow authenticated read access to rms_config"
    ON rms_config FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admin write access to rms_config"
    ON rms_config FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (raw_user_meta_data->>'role') = 'admin'
        )
    );

-- Similar policies for other tables (simplified for brevity)
CREATE POLICY "Allow authenticated read access to pricing_history"
    ON pricing_history FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read access to competitors"
    ON competitors FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read access to pricing_recommendations"
    ON pricing_recommendations FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Composite indexes for common queries
CREATE INDEX idx_pricing_history_composite_query ON pricing_history(room_type_id, date, effective_rate);
CREATE INDEX idx_competitor_rates_composite_query ON competitor_rates(room_type_id, date, rate);
CREATE INDEX idx_demand_forecasts_composite_query ON demand_forecasts(room_type_id, target_date, forecast_occupancy);
CREATE INDEX idx_pricing_recommendations_composite_query ON pricing_recommendations(room_type_id, date, status, confidence);

-- ============================================
-- INITIAL DATA SEEDING
-- ============================================

-- Insert default competitor (example)
INSERT INTO competitors (name, code, star_rating, proximity_km, active) VALUES
('Hilton Addis', 'HILTON', 5, 2.5, true),
('Sheraton Addis', 'SHERATON', 5, 3.0, true),
('Radisson Blu', 'RADISSON', 4, 1.8, true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample demand events
INSERT INTO demand_events (name, event_type, start_date, end_date, impact_score, impact_radius_km, expected_attendees, room_demand_impact, active) VALUES
('Addis Film Festival', 'conference', '2026-09-15', '2026-09-20', 85.0, 50.0, 50000, 500, true),
('African Union Summit', 'government', '2026-10-10', '2026-10-15', 95.0, 25.0, 10000, 300, true),
('Trade Fair Exhibition', 'exhibition', '2026-11-05', '2026-11-10', 70.0, 30.0, 25000, 200, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE rms_config IS 'Revenue Management System global configuration settings';
COMMENT ON TABLE pricing_history IS 'Historical pricing data for ML training and analysis';
COMMENT ON TABLE competitors IS 'Competitor hotel configuration for rate shopping';
COMMENT ON TABLE competitor_rates IS 'Daily competitor rate collection';
COMMENT ON TABLE demand_forecasts IS 'Demand forecast results from ML models';
COMMENT ON TABLE pricing_recommendations IS 'System-generated pricing recommendations';
COMMENT ON TABLE los_pricing_rules IS 'Length-of-stay pricing adjustment rules';
COMMENT ON TABLE corporate_rate_agreements IS 'Corporate negotiated rate agreements';
COMMENT ON TABLE demand_events IS 'Local events that impact demand and pricing';
COMMENT ON TABLE rms_audit_log IS 'Audit trail for all RMS pricing changes';

-- Migration complete
