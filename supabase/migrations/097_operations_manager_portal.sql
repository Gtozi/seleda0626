-- Operations Manager Portal Migration
-- Creates tables for Daily Briefing, Action Queue, Escalations, Staffing, Handoffs, Handover, and Manager Notes

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DAILY BRIEFING
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_briefing (
    briefing_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL,
    briefing_date DATE NOT NULL,
    arrivals_count INTEGER DEFAULT 0,
    departures_count INTEGER DEFAULT 0,
    vip_arrivals JSONB DEFAULT '[]'::jsonb, -- Array of {name, room, notes}
    events_today JSONB DEFAULT '[]'::jsonb, -- Array of {name, time, location, type}
    staffing_gap_count INTEGER DEFAULT 0,
    open_escalation_count INTEGER DEFAULT 0,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_property_date UNIQUE (property_id, briefing_date)
);

CREATE INDEX idx_daily_briefing_date ON daily_briefing(briefing_date);
CREATE INDEX idx_daily_briefing_property ON daily_briefing(property_id);

-- ============================================================================
-- ACTION ITEM (Unified Cross-Module Task/Approval Queue)
-- ============================================================================
CREATE TABLE IF NOT EXISTS action_item (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_module VARCHAR(50) NOT NULL CHECK (source_module IN (
        'FrontOffice', 'FandB', 'Housekeeping', 'Maintenance', 
        'HR', 'Procurement', 'SalesEvents', 'GuestPortal'
    )),
    source_record_id VARCHAR(255) NOT NULL, -- FK reference to owning module's record
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN (
        'Approval', 'Escalation', 'TaskAssignment', 'Exception'
    )),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'Normal' CHECK (priority IN (
        'Low', 'Normal', 'High', 'Urgent'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'New' CHECK (status IN (
        'New', 'InProgress', 'Resolved', 'Dismissed'
    )),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_by TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,
    requires_approval_amount DECIMAL(12, 2) -- For approval items with cost threshold
);

CREATE INDEX idx_action_item_status ON action_item(status);
CREATE INDEX idx_action_item_priority ON action_item(priority);
CREATE INDEX idx_action_item_module ON action_item(source_module);
CREATE INDEX idx_action_item_assigned ON action_item(assigned_to);
CREATE INDEX idx_action_item_due ON action_item(due_by);

-- ============================================================================
-- STAFFING STATUS
-- ============================================================================
CREATE TABLE IF NOT EXISTS staffing_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department VARCHAR(100) NOT NULL,
    status_date DATE NOT NULL,
    shift VARCHAR(20) NOT NULL CHECK (shift IN (
        'Morning', 'Afternoon', 'Evening', 'Night'
    )),
    scheduled_count INTEGER DEFAULT 0,
    present_count INTEGER DEFAULT 0,
    gap_count INTEGER GENERATED ALWAYS AS (scheduled_count - present_count) STORED,
    coverage_plan TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_dept_date_shift UNIQUE (department, status_date, shift)
);

CREATE INDEX idx_staffing_status_date ON staffing_status(status_date);
CREATE INDEX idx_staffing_status_dept ON staffing_status(department);

-- ============================================================================
-- ESCALATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS escalation (
    escalation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raised_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    department VARCHAR(100) NOT NULL,
    linked_guest_id UUID, -- Reference to guest record
    linked_room_id UUID, -- Reference to room record
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'GuestComplaint', 'SafetyIncident', 'EquipmentFailure', 'StaffIssue', 'Other'
    )),
    severity VARCHAR(20) NOT NULL DEFAULT 'Moderate' CHECK (severity IN (
        'Minor', 'Moderate', 'Major', 'Critical'
    )),
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN (
        'Open', 'InProgress', 'Resolved', 'EscalatedFurther'
    )),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_escalation_status ON escalation(status);
CREATE INDEX idx_escalation_severity ON escalation(severity);
CREATE INDEX idx_escalation_dept ON escalation(department);
CREATE INDEX idx_escalation_assigned ON escalation(assigned_to);
CREATE INDEX idx_escalation_guest ON escalation(linked_guest_id);
CREATE INDEX idx_escalation_room ON escalation(linked_room_id);

-- ============================================================================
-- ESCALATION EVENT (Append-only timeline)
-- ============================================================================
CREATE TABLE IF NOT EXISTS escalation_event (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escalation_id UUID NOT NULL REFERENCES escalation(escalation_id) ON DELETE CASCADE,
    actor UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    note TEXT NOT NULL,
    status_change VARCHAR(50), -- Optional: captures status transition
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_escalation_event_escalation ON escalation_event(escalation_id);
CREATE INDEX idx_escalation_event_time ON escalation_event(created_at);

-- ============================================================================
-- INTERDEPARTMENTAL HANDOFF
-- ============================================================================
CREATE TABLE IF NOT EXISTS interdepartmental_handoff (
    handoff_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_department VARCHAR(100) NOT NULL,
    to_department VARCHAR(100) NOT NULL,
    source_record_type VARCHAR(50) NOT NULL CHECK (source_record_type IN (
        'HousekeepingFlag', 'GuestRequest', 'MaintenanceIssue'
    )),
    source_record_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Sent' CHECK (status IN (
        'Sent', 'Acknowledged', 'InProgress', 'Completed'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_handoff_status ON interdepartmental_handoff(status);
CREATE INDEX idx_handoff_from_dept ON interdepartmental_handoff(from_department);
CREATE INDEX idx_handoff_to_dept ON interdepartmental_handoff(to_department);
CREATE INDEX idx_handoff_source ON interdepartmental_handoff(source_record_type, source_record_id);

-- ============================================================================
-- SHIFT HANDOVER NOTE
-- ============================================================================
CREATE TABLE IF NOT EXISTS shift_handover_note (
    note_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outgoing_manager UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    incoming_manager UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    shift_date DATE NOT NULL,
    shift_period VARCHAR(20) NOT NULL CHECK (shift_period IN (
        'Day', 'Evening', 'Night'
    )),
    summary TEXT NOT NULL,
    open_item_refs UUID[] DEFAULT ARRAY[]::UUID[], -- References to ActionItem.item_id
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_handover_date ON shift_handover_note(shift_date);
CREATE INDEX idx_handover_outgoing ON shift_handover_note(outgoing_manager);
CREATE INDEX idx_handover_incoming ON shift_handover_note(incoming_manager);

-- ============================================================================
-- MANAGER NOTE
-- ============================================================================
CREATE TABLE IF NOT EXISTS manager_note (
    note_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    linked_type VARCHAR(50) NOT NULL CHECK (linked_type IN (
        'Guest', 'Room', 'Escalation', 'General'
    )),
    linked_id VARCHAR(255), -- ID of the linked entity
    author UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    text TEXT NOT NULL,
    visible_to_roles TEXT[] DEFAULT ARRAY[]::TEXT[], -- Roles that can see this note
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_manager_note_linked ON manager_note(linked_type, linked_id);
CREATE INDEX idx_manager_note_author ON manager_note(author);
CREATE INDEX idx_manager_note_created ON manager_note(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Daily Briefing RLS
ALTER TABLE daily_briefing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily briefing readable by authenticated users"
    ON daily_briefing FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Daily briefing writable by operations managers"
    ON daily_briefing FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager')
        )
    );

-- Action Item RLS
ALTER TABLE action_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Action items readable by authenticated users"
    ON action_item FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Action items writable by operations managers"
    ON action_item FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager', 'Department Manager')
        )
    );

-- Staffing Status RLS
ALTER TABLE staffing_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staffing status readable by authenticated users"
    ON staffing_status FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Staffing status writable by operations managers"
    ON staffing_status FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager')
        )
    );

-- Escalation RLS
ALTER TABLE escalation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Escalations readable by authenticated users"
    ON escalation FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Escalations writable by operations managers"
    ON escalation FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager')
        )
    );

-- Escalation Event RLS
ALTER TABLE escalation_event ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Escalation events readable by authenticated users"
    ON escalation_event FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Escalation events writable by operations managers"
    ON escalation_event FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager')
        )
    );

-- Interdepartmental Handoff RLS
ALTER TABLE interdepartmental_handoff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Handoffs readable by authenticated users"
    ON interdepartmental_handoff FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Handoffs writable by operations managers"
    ON interdepartmental_handoff FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager')
        )
    );

-- Shift Handover Note RLS
ALTER TABLE shift_handover_note ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Handover notes readable by authenticated users"
    ON shift_handover_note FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Handover notes writable by operations managers"
    ON shift_handover_note FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager')
        )
    );

-- Manager Note RLS
ALTER TABLE manager_note ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manager notes readable by authenticated users"
    ON manager_note FOR SELECT
    TO authenticated
    USING (
        -- User can see if they are author or if their role is in visible_to_roles
        author = auth.uid() 
        OR visible_to_roles && (
            SELECT array_agg(role) FROM user_roles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Manager notes writable by all authenticated"
    ON manager_note FOR ALL
    TO authenticated
    USING (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate or refresh daily briefing
CREATE OR REPLACE FUNCTION refresh_daily_briefing(p_property_id UUID, p_briefing_date DATE DEFAULT CURRENT_DATE)
RETURNS UUID AS $$
DECLARE
    v_briefing_id UUID;
    v_arrivals_count INTEGER;
    v_departures_count INTEGER;
    v_vip_arrivals JSONB;
    v_events_today JSONB;
    v_staffing_gap_count INTEGER;
    v_open_escalation_count INTEGER;
BEGIN
    -- Count arrivals for the date
    SELECT COUNT(*) INTO v_arrivals_count
    FROM reservations
    WHERE check_in_date = p_briefing_date
    AND status IN ('Confirmed', 'CheckedIn');
    
    -- Count departures for the date
    SELECT COUNT(*) INTO v_departures_count
    FROM reservations
    WHERE check_out_date = p_briefing_date
    AND status IN ('Confirmed', 'CheckedIn');
    
    -- Get VIP arrivals (guests marked as VIP)
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'name', g.first_name || ' ' || g.last_name,
        'room', r.room_number,
        'notes', g.notes
    )), '[]'::jsonb) INTO v_vip_arrivals
    FROM reservations res
    JOIN guests g ON res.guest_id = g.guest_id
    JOIN rooms r ON res.room_id = r.room_id
    WHERE res.check_in_date = p_briefing_date
    AND res.status IN ('Confirmed', 'CheckedIn')
    AND g.is_vip = true;
    
    -- Get events for today (from events table if exists, otherwise empty)
    SELECT COALESCE(
        (SELECT jsonb_agg(jsonb_build_object(
            'name', event_name,
            'time', start_time,
            'location', location,
            'type', event_type
        ))
        FROM events
        WHERE event_date = p_briefing_date),
        '[]'::jsonb
    ) INTO v_events_today;
    
    -- Count staffing gaps for today
    SELECT COALESCE(SUM(gap_count), 0) INTO v_staffing_gap_count
    FROM staffing_status
    WHERE status_date = p_briefing_date;
    
    -- Count open escalations
    SELECT COUNT(*) INTO v_open_escalation_count
    FROM escalation
    WHERE status IN ('Open', 'InProgress')
    AND created_at >= p_briefing_date - INTERVAL '7 days'; -- Active in last 7 days
    
    -- Upsert the briefing
    INSERT INTO daily_briefing (
        property_id, briefing_date, arrivals_count, departures_count,
        vip_arrivals, events_today, staffing_gap_count, open_escalation_count, generated_at
    ) VALUES (
        p_property_id, p_briefing_date, v_arrivals_count, v_departures_count,
        v_vip_arrivals, v_events_today, v_staffing_gap_count, v_open_escalation_count, NOW()
    )
    ON CONFLICT (property_id, briefing_date)
    DO UPDATE SET
        arrivals_count = EXCLUDED.arrivals_count,
        departures_count = EXCLUDED.departures_count,
        vip_arrivals = EXCLUDED.vip_arrivals,
        events_today = EXCLUDED.events_today,
        staffing_gap_count = EXCLUDED.staffing_gap_count,
        open_escalation_count = EXCLUDED.open_escalation_count,
        generated_at = NOW()
    RETURNING briefing_id INTO v_briefing_id;
    
    RETURN v_briefing_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create action item from module
CREATE OR REPLACE FUNCTION create_action_item(
    p_source_module VARCHAR,
    p_source_record_id VARCHAR,
    p_item_type VARCHAR,
    p_title VARCHAR,
    p_description TEXT,
    p_priority VARCHAR DEFAULT 'Normal',
    p_assigned_to UUID DEFAULT NULL,
    p_due_by TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_requires_approval_amount DECIMAL DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_item_id UUID;
BEGIN
    INSERT INTO action_item (
        source_module, source_record_id, item_type, title, description,
        priority, assigned_to, due_by, requires_approval_amount
    ) VALUES (
        p_source_module, p_source_record_id, p_item_type, p_title, p_description,
        p_priority, p_assigned_to, p_due_by, p_requires_approval_amount
    ) RETURNING item_id INTO v_item_id;
    
    RETURN v_item_id;
END;
$$ LANGUAGE plpgsql;

-- Function to resolve action item
CREATE OR REPLACE FUNCTION resolve_action_item(
    p_item_id UUID,
    p_resolution_note TEXT,
    p_actor UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE action_item
    SET status = 'Resolved',
        resolved_at = NOW(),
        resolution_note = p_resolution_note
    WHERE item_id = p_item_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to add escalation event
CREATE OR REPLACE FUNCTION add_escalation_event(
    p_escalation_id UUID,
    p_actor UUID,
    p_note TEXT,
    p_status_change VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO escalation_event (escalation_id, actor, note, status_change)
    VALUES (p_escalation_id, p_actor, p_note, p_status_change)
    RETURNING event_id INTO v_event_id;
    
    -- Update escalation status if status_change provided
    IF p_status_change IS NOT NULL THEN
        UPDATE escalation
        SET status = p_status_change
        WHERE escalation_id = p_escalation_id;
        
        -- Set resolved_at if resolving
        IF p_status_change = 'Resolved' THEN
            UPDATE escalation
            SET resolved_at = NOW()
            WHERE escalation_id = p_escalation_id;
        END IF;
    END IF;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to acknowledge shift handover
CREATE OR REPLACE FUNCTION acknowledge_handover(p_note_id UUID, p_incoming_manager UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE shift_handover_note
    SET incoming_manager = p_incoming_manager,
        acknowledged_at = NOW()
    WHERE note_id = p_note_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to auto-refresh daily briefing when reservations change
CREATE OR REPLACE FUNCTION trigger_refresh_briefing()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh briefing for check-in/check-out date changes
    IF TG_TABLE_NAME = 'reservations' THEN
        IF (NEW.check_in_date IS DISTINCT FROM OLD.check_in_date) OR
           (NEW.check_out_date IS DISTINCT FROM OLD.check_out_date) OR
           (NEW.status IS DISTINCT FROM OLD.status) THEN
            PERFORM refresh_daily_briefing(NULL, COALESCE(NEW.check_in_date, NEW.check_out_date, CURRENT_DATE));
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to reservations table
DROP TRIGGER IF EXISTS tr_refresh_briefing_reservations ON reservations;
CREATE TRIGGER tr_refresh_briefing_reservations
    AFTER INSERT OR UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_refresh_briefing();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create initial daily briefing for today if not exists
SELECT refresh_daily_briefing(NULL, CURRENT_DATE);
