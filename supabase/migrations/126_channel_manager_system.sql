-- Migration: Channel Manager System
-- Phase 1 Enhancement: Real-time OTA Integration & Rate Parity
-- This migration creates the foundation for channel manager integration with OTAs

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================
-- CHANNEL CONNECTIONS
-- ============================================

-- OTA channel configurations
CREATE TABLE IF NOT EXISTS channel_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_name VARCHAR(100) NOT NULL,
    channel_code VARCHAR(50) UNIQUE NOT NULL,
    channel_type VARCHAR(50) NOT NULL, -- 'ota', 'gds', 'bedbank', 'metasearch'
    api_endpoint TEXT NOT NULL,
    api_version VARCHAR(20),
    credentials JSONB NOT NULL, -- Encrypted API keys, tokens, etc.
    webhook_url TEXT,
    sync_interval_minutes INTEGER DEFAULT 30,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_sync_status VARCHAR(20) DEFAULT 'never',
    last_sync_error TEXT,
    rate_parity_enabled BOOLEAN DEFAULT true,
    rate_parity_threshold DECIMAL(5,2) DEFAULT 5.00, -- percentage
    inventory_sync_enabled BOOLEAN DEFAULT true,
    booking_sync_enabled BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    test_mode BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Channel room type mapping
CREATE TABLE IF NOT EXISTS channel_room_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channel_connections(id),
    our_room_type_id TEXT REFERENCES room_types(id),
    channel_room_code VARCHAR(100) NOT NULL,
    channel_room_name VARCHAR(255),
    quality_score DECIMAL(3,2) DEFAULT 1.0, -- For rate parity calculations
    rate_multiplier DECIMAL(5,4) DEFAULT 1.0000,
    inventory_multiplier DECIMAL(5,4) DEFAULT 1.0000,
    active BOOLEAN DEFAULT true,
    sync_enabled BOOLEAN DEFAULT true,
    mapped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, our_room_type_id)
);

-- ============================================
-- INVENTORY SYNC
-- ============================================

-- Inventory availability snapshot per channel
CREATE TABLE IF NOT EXISTS channel_inventory_snapshot (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channel_connections(id),
    room_type_id TEXT REFERENCES room_types(id),
    date DATE NOT NULL,
    total_rooms INTEGER NOT NULL,
    available_rooms INTEGER NOT NULL,
    blocked_rooms INTEGER DEFAULT 0,
    booked_rooms INTEGER DEFAULT 0,
    sync_status VARCHAR(20) DEFAULT 'pending',
    synced_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, room_type_id, date)
);

-- Inventory sync log
CREATE TABLE IF NOT EXISTS inventory_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_id UUID DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channel_connections(id),
    sync_type VARCHAR(20) NOT NULL, -- 'full', 'incremental', 'single_date'
    sync_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_end TIMESTAMP WITH TIME ZONE,
    records_processed INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'running',
    error_summary JSONB,
    initiated_by UUID REFERENCES auth.users(id),
    trigger_type VARCHAR(50) DEFAULT 'manual' -- 'manual', 'scheduled', 'webhook', 'rate_change'
);

-- ============================================
-- RATE SYNC
-- ============================================

-- Rate sync tracking
CREATE TABLE IF NOT EXISTS rate_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_id UUID DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channel_connections(id),
    room_type_id TEXT REFERENCES room_types(id),
    date DATE,
    our_rate DECIMAL(10,2) NOT NULL,
    channel_rate DECIMAL(10,2),
    rate_difference_percent DECIMAL(5,2),
    sync_status VARCHAR(20) DEFAULT 'pending',
    parity_violation BOOLEAN DEFAULT false,
    synced_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate parity monitoring
CREATE TABLE IF NOT EXISTS rate_parity_monitor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channel_connections(id),
    room_type_id TEXT REFERENCES room_types(id),
    date DATE NOT NULL,
    our_rate DECIMAL(10,2) NOT NULL,
    channel_rate DECIMAL(10,2) NOT NULL,
    difference_percent DECIMAL(5,2) NOT NULL,
    parity_status VARCHAR(20) NOT NULL, -- 'in_parity', 'undercut', 'overpriced'
    auto_correction_attempted BOOLEAN DEFAULT false,
    auto_correction_success BOOLEAN,
    correction_timestamp TIMESTAMP WITH TIME ZONE,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, room_type_id, date)
);

-- ============================================
-- BOOKING SYNC
-- ============================================

-- Incoming bookings from channels
CREATE TABLE IF NOT EXISTS channel_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channel_connections(id),
    channel_booking_id VARCHAR(100) NOT NULL,
    channel_confirmation_code VARCHAR(100),
    reservation_id TEXT REFERENCES reservations(id),
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255),
    guest_phone VARCHAR(50),
    room_type_id TEXT REFERENCES room_types(id),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INTEGER NOT NULL,
    adults INTEGER DEFAULT 1,
    children INTEGER DEFAULT 0,
    channel_rate DECIMAL(10,2) NOT NULL,
    channel_currency VARCHAR(3) DEFAULT 'USD',
    our_rate DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    commission_percent DECIMAL(5,2),
    commission_amount DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    booking_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'modified'
    sync_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'synced', 'failed'
    special_requests TEXT,
    channel_raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, channel_booking_id)
);

-- Booking sync log
CREATE TABLE IF NOT EXISTS booking_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_booking_id UUID REFERENCES channel_bookings(id),
    sync_type VARCHAR(20) NOT NULL, -- 'new', 'modification', 'cancellation'
    sync_direction VARCHAR(20) NOT NULL, -- 'inbound', 'outbound'
    sync_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_end TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'running',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- WEBHOOK MANAGEMENT
-- ============================================

-- Incoming webhook log
CREATE TABLE IF NOT EXISTS webhook_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channel_connections(id),
    webhook_type VARCHAR(50) NOT NULL, -- 'booking', 'cancellation', 'modification', 'rate_change'
    payload JSONB NOT NULL,
    headers JSONB,
    processed BOOLEAN DEFAULT false,
    processing_status VARCHAR(20) DEFAULT 'pending',
    processing_error TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET
);

-- Webhook retry queue
CREATE TABLE IF NOT EXISTS webhook_retry_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_log_id UUID REFERENCES webhook_log(id),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    retry_backoff_seconds INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'pending',
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CHANNEL PERFORMANCE ANALYTICS
-- ============================================

-- Channel performance metrics
CREATE TABLE IF NOT EXISTS channel_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channel_connections(id),
    date DATE NOT NULL,
    bookings_received INTEGER DEFAULT 0,
    bookings_confirmed INTEGER DEFAULT 0,
    bookings_cancelled INTEGER DEFAULT 0,
    gross_revenue DECIMAL(12,2) DEFAULT 0,
    commission_amount DECIMAL(12,2) DEFAULT 0,
    net_revenue DECIMAL(12,2) DEFAULT 0,
    average_rate DECIMAL(10,2),
    average_lead_time_days INTEGER,
    cancellation_rate DECIMAL(5,2),
    no_show_rate DECIMAL(5,2),
    modified_bookings INTEGER DEFAULT 0,
    sync_errors INTEGER DEFAULT 0,
    parity_violations INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, date)
);

-- Channel booking lead time tracking
CREATE TABLE IF NOT EXISTS channel_lead_time (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channel_connections(id),
    lead_time_days INTEGER NOT NULL,
    booking_count INTEGER DEFAULT 0,
    revenue_amount DECIMAL(12,2) DEFAULT 0,
    recorded_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(channel_id, lead_time_days, recorded_date)
);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to check rate parity
CREATE OR REPLACE FUNCTION check_rate_parity()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check if both rates are available
    IF NEW.our_rate IS NOT NULL AND NEW.channel_rate IS NOT NULL AND NEW.channel_rate > 0 THEN
        NEW.difference_percent := ABS((NEW.our_rate - NEW.channel_rate) / NEW.channel_rate * 100);
        
        -- Determine parity status
        IF NEW.difference_percent <= 5.0 THEN
            NEW.parity_status := 'in_parity';
        ELSIF NEW.our_rate < NEW.channel_rate THEN
            NEW.parity_status := 'undercut';
        ELSE
            NEW.parity_status := 'overpriced';
        END IF;
        
        -- Check if this violates threshold
        SELECT rate_parity_threshold INTO NEW.parity_violation
        FROM channel_connections
        WHERE id = NEW.channel_id;
        
        IF NEW.parity_violation IS NULL THEN
            NEW.parity_violation := NEW.difference_percent > 5.0;
        ELSE
            NEW.parity_violation := NEW.difference_percent > NEW.parity_violation;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rate_parity_check
    BEFORE INSERT ON rate_parity_monitor
    FOR EACH ROW
    EXECUTE FUNCTION check_rate_parity();

-- Function to calculate channel performance
CREATE OR REPLACE FUNCTION calculate_channel_performance(p_channel_id UUID, p_date DATE)
RETURNS VOID AS $$
DECLARE
    v_bookings_received INTEGER;
    v_bookings_confirmed INTEGER;
    v_bookings_cancelled INTEGER;
    v_gross_revenue DECIMAL(12,2);
    v_commission_amount DECIMAL(12,2);
    v_net_revenue DECIMAL(12,2);
    v_average_rate DECIMAL(10,2);
    v_cancellation_rate DECIMAL(5,2);
BEGIN
    -- Get booking counts
    SELECT 
        COUNT(*) FILTER (WHERE booking_status IN ('pending', 'confirmed', 'modified')),
        COUNT(*) FILTER (WHERE booking_status = 'confirmed'),
        COUNT(*) FILTER (WHERE booking_status = 'cancelled')
    INTO v_bookings_received, v_bookings_confirmed, v_bookings_cancelled
    FROM channel_bookings
    WHERE channel_id = p_channel_id
      AND DATE(created_at) = p_date;
    
    -- Get revenue data
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COALESCE(SUM(commission_amount), 0),
        COALESCE(SUM(net_amount), 0),
        CASE WHEN COUNT(*) > 0 THEN AVG(channel_rate) ELSE 0 END
    INTO v_gross_revenue, v_commission_amount, v_net_revenue, v_average_rate
    FROM channel_bookings
    WHERE channel_id = p_channel_id
      AND DATE(created_at) = p_date
      AND booking_status != 'cancelled';
    
    -- Calculate cancellation rate
    IF v_bookings_received > 0 THEN
        v_cancellation_rate := (v_bookings_cancelled::DECIMAL / v_bookings_received::DECIMAL) * 100;
    ELSE
        v_cancellation_rate := 0;
    END IF;
    
    -- Insert or update performance record
    INSERT INTO channel_performance (
        channel_id, date, bookings_received, bookings_confirmed, bookings_cancelled,
        gross_revenue, commission_amount, net_revenue, average_rate, cancellation_rate
    ) VALUES (
        p_channel_id, p_date, v_bookings_received, v_bookings_confirmed, v_bookings_cancelled,
        v_gross_revenue, v_commission_amount, v_net_revenue, v_average_rate, v_cancellation_rate
    )
    ON CONFLICT (channel_id, date) DO UPDATE SET
        bookings_received = EXCLUDED.bookings_received,
        bookings_confirmed = EXCLUDED.bookings_confirmed,
        bookings_cancelled = EXCLUDED.bookings_cancelled,
        gross_revenue = EXCLUDED.gross_revenue,
        commission_amount = EXCLUDED.commission_amount,
        net_revenue = EXCLUDED.net_revenue,
        average_rate = EXCLUDED.average_rate,
        cancellation_rate = EXCLUDED.cancellation_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update channel connection last sync
CREATE OR REPLACE FUNCTION update_channel_sync_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE channel_connections
        SET last_sync_at = NOW(),
            last_sync_status = NEW.status
        WHERE id = NEW.channel_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sync_status
    AFTER INSERT ON inventory_sync_log
    FOR EACH ROW
    EXECUTE FUNCTION update_channel_sync_status();

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- Channel overview view
CREATE OR REPLACE VIEW channel_overview AS
SELECT 
    cc.id,
    cc.channel_name,
    cc.channel_code,
    cc.channel_type,
    cc.active,
    cc.last_sync_at,
    cc.last_sync_status,
    cc.rate_parity_enabled,
    cc.inventory_sync_enabled,
    COUNT(DISTINCT crm.our_room_type_id) AS mapped_room_types,
    COUNT(DISTINCT cb.id) FILTER (WHERE DATE(cb.created_at) = CURRENT_DATE) AS bookings_today,
    COALESCE(SUM(cp.net_revenue) FILTER (WHERE cp.date = CURRENT_DATE), 0) AS revenue_today,
    COALESCE(SUM(cp.net_revenue) FILTER (WHERE cp.date >= CURRENT_DATE - INTERVAL '30 days'), 0) AS revenue_30days
FROM channel_connections cc
LEFT JOIN channel_room_mapping crm ON crm.channel_id = cc.id AND crm.active = true
LEFT JOIN channel_bookings cb ON cb.channel_id = cc.id
LEFT JOIN channel_performance cp ON cp.channel_id = cc.id
WHERE cc.active = true
GROUP BY cc.id
ORDER BY cc.channel_name;

-- Rate parity status view
CREATE OR REPLACE VIEW rate_parity_status AS
SELECT 
    DATE(rpm.date) AS date,
    cc.channel_name,
    rt.name AS room_type_name,
    rpm.our_rate,
    rpm.channel_rate,
    rpm.difference_percent,
    rpm.parity_status,
    rpm.auto_correction_attempted,
    rpm.auto_correction_success
FROM rate_parity_monitor rpm
JOIN channel_connections cc ON rpm.channel_id = cc.id
JOIN room_types rt ON rpm.room_type_id = rt.id
WHERE rpm.date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY rpm.date DESC, rpm.difference_percent DESC;

-- Channel booking summary view
CREATE OR REPLACE VIEW channel_booking_summary AS
SELECT 
    DATE(cb.created_at) AS date,
    cc.channel_name,
    cb.booking_status,
    COUNT(*) AS booking_count,
    SUM(cb.total_amount) AS total_revenue,
    SUM(cb.commission_amount) AS total_commission,
    SUM(cb.net_amount) AS net_revenue,
    AVG(cb.channel_rate) AS average_rate
FROM channel_bookings cb
JOIN channel_connections cc ON cb.channel_id = cc.id
WHERE cb.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(cb.created_at), cc.channel_name, cb.booking_status
ORDER BY date DESC, cc.channel_name;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Channel connections indexes
CREATE INDEX idx_channel_connections_active ON channel_connections(active);
CREATE INDEX idx_channel_connections_type ON channel_connections(channel_type);

-- Inventory sync indexes
CREATE INDEX idx_inventory_snapshot_channel_date ON channel_inventory_snapshot(channel_id, date);
CREATE INDEX idx_inventory_snapshot_room_type ON channel_inventory_snapshot(room_type_id);
CREATE INDEX idx_inventory_sync_log_channel ON inventory_sync_log(channel_id);
CREATE INDEX idx_inventory_sync_log_status ON inventory_sync_log(status);

-- Rate sync indexes
CREATE INDEX idx_rate_sync_log_channel ON rate_sync_log(channel_id);
CREATE INDEX idx_rate_sync_log_room_type ON rate_sync_log(room_type_id);
CREATE INDEX idx_rate_parity_monitor_channel ON rate_parity_monitor(channel_id);
CREATE INDEX idx_rate_parity_monitor_date ON rate_parity_monitor(date);
CREATE INDEX idx_rate_parity_monitor_status ON rate_parity_monitor(parity_status);

-- Booking sync indexes
CREATE INDEX idx_channel_bookings_channel ON channel_bookings(channel_id);
CREATE INDEX idx_channel_bookings_reservation ON channel_bookings(reservation_id);
CREATE INDEX idx_channel_bookings_dates ON channel_bookings(check_in_date, check_out_date);
CREATE INDEX idx_channel_bookings_status ON channel_bookings(booking_status);
CREATE INDEX idx_channel_bookings_sync_status ON channel_bookings(sync_status);
CREATE INDEX idx_booking_sync_log_booking ON booking_sync_log(channel_booking_id);

-- Webhook indexes
CREATE INDEX idx_webhook_log_channel ON webhook_log(channel_id);
CREATE INDEX idx_webhook_log_processed ON webhook_log(processed);
CREATE INDEX idx_webhook_log_type ON webhook_log(webhook_type);
CREATE INDEX idx_webhook_retry_queue_status ON webhook_retry_queue(status);
CREATE INDEX idx_webhook_retry_queue_next_retry ON webhook_retry_queue(next_retry_at);

-- Performance indexes
CREATE INDEX idx_channel_performance_channel_date ON channel_performance(channel_id, date);
CREATE INDEX idx_channel_lead_time_channel ON channel_lead_time(channel_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE channel_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_room_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_inventory_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_parity_monitor ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_retry_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - can be refined based on requirements)
CREATE POLICY "Allow authenticated read access to channel_connections"
    ON channel_connections FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admin write access to channel_connections"
    ON channel_connections FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (raw_user_meta_data->>'role') = 'admin'
        )
    );

CREATE POLICY "Allow authenticated read access to channel_bookings"
    ON channel_bookings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read access to channel_performance"
    ON channel_performance FOR SELECT
    TO authenticated
    USING (true);

-- Similar policies for other tables (simplified for brevity)
CREATE POLICY "Allow authenticated read access to rate_parity_monitor"
    ON rate_parity_monitor FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read access to webhook_log"
    ON webhook_log FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- INITIAL DATA SEEDING
-- ============================================

-- Insert default channel configurations
INSERT INTO channel_connections (
    channel_name, channel_code, channel_type, api_endpoint, api_version,
    credentials, sync_interval_minutes, rate_parity_enabled, inventory_sync_enabled, 
    booking_sync_enabled, active, test_mode
) VALUES
(
    'Booking.com',
    'BOOKINGCOM',
    'ota',
    'https://supply-xml.booking.com/hotel-v3',
    '3.0',
    '{"apiKey": "placeholder_api_key", "username": "placeholder"}'::jsonb,
    30,
    true,
    true,
    true,
    false,
    true
),
(
    'Expedia',
    'EXPEDIA',
    'ota',
    'https://services.expediapartnercentral.com',
    '2.0',
    '{"apiKey": "placeholder_api_key", "username": "placeholder"}'::jsonb,
    60,
    true,
    true,
    true,
    false,
    true
),
(
    'Airbnb',
    'AIRBNB',
    'ota',
    'https://api.airbnb.com/v2',
    '2.0',
    '{"apiKey": "placeholder_api_key", "username": "placeholder"}'::jsonb,
    120,
    true,
    true,
    true,
    false,
    true
),
(
    'Amadeus',
    'AMADEUS',
    'gds',
    'https://webservices.amadeus.com',
    '1.0',
    '{"apiKey": "placeholder_api_key", "username": "placeholder"}'::jsonb,
    180,
    true,
    true,
    true,
    false,
    true
)
ON CONFLICT (channel_code) DO NOTHING;

-- ============================================
-- SCHEDULED JOBS (using pg_cron)
-- ============================================

-- Schedule automatic rate parity checks (every 6 hours)
-- SELECT cron.schedule('rate-parity-check', '0 */6 * * *', 
--     'SELECT check_rate_parity_for_all_channels();');

-- Schedule automatic inventory sync (every 30 minutes)
-- SELECT cron.schedule('inventory-sync', '*/30 * * * *', 
--     'SELECT sync_inventory_to_all_channels();');

-- Schedule performance calculation (daily at midnight)
-- SELECT cron.schedule('performance-calculation', '0 0 * * *', 
--     'SELECT calculate_daily_channel_performance();');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE channel_connections IS 'OTA and channel connection configurations';
COMMENT ON TABLE channel_room_mapping IS 'Mapping between our room types and channel room codes';
COMMENT ON TABLE channel_inventory_snapshot IS 'Inventory availability snapshots per channel';
COMMENT ON TABLE inventory_sync_log IS 'Log of inventory synchronization operations';
COMMENT ON TABLE rate_sync_log IS 'Log of rate synchronization operations';
COMMENT ON TABLE rate_parity_monitor IS 'Rate parity monitoring and violation tracking';
COMMENT ON TABLE channel_bookings IS 'Incoming bookings from external channels';
COMMENT ON TABLE booking_sync_log IS 'Log of booking synchronization operations';
COMMENT ON TABLE webhook_log IS 'Incoming webhook log from channels';
COMMENT ON TABLE webhook_retry_queue IS 'Queue for failed webhook retry processing';
COMMENT ON TABLE channel_performance IS 'Channel performance metrics and analytics';
COMMENT ON TABLE channel_lead_time IS 'Channel booking lead time distribution tracking';

-- Migration complete
