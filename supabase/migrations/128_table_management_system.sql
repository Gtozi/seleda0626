-- Migration: Table Management System
-- This migration adds tables and functions for restaurant table management
-- Phase 1.3: Table Management & Reservation Integration

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables table: Stores restaurant table information
CREATE TABLE IF NOT EXISTS fb_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_number TEXT NOT NULL UNIQUE,
  seats INTEGER NOT NULL CHECK (seats > 0),
  shape TEXT NOT NULL CHECK (shape IN ('round', 'rectangular', 'square', 'oval')),
  location_x NUMERIC DEFAULT 0,
  location_y NUMERIC DEFAULT 0,
  section TEXT NOT NULL DEFAULT 'Main',
  outlet_id TEXT NOT NULL, -- Changed to TEXT to match outlets table
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'dirty', 'out_of_service')),
  current_order_id TEXT, -- Changed to TEXT to match orders table
  assigned_server_id TEXT,
  turn_start_time TIMESTAMP WITH TIME ZONE,
  average_turn_time INTEGER DEFAULT 0, -- in minutes
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table reservations table: Links tables to front office reservations
CREATE TABLE IF NOT EXISTS fb_table_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL,
  reservation_id TEXT, -- Changed to TEXT to match reservations table
  guest_name TEXT NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 120, -- expected duration in minutes
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'seated', 'completed', 'no_show', 'cancelled')),
  special_requests TEXT,
  confirmed_by TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_id, reservation_id)
);

-- Waitlist table: Manages walk-in guest waitlist
CREATE TABLE IF NOT EXISTS fb_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_name TEXT NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  contact_phone TEXT,
  estimated_wait_time INTEGER DEFAULT 0, -- in minutes
  queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMP WITH TIME ZONE,
  seated BOOLEAN DEFAULT FALSE,
  seated_at TIMESTAMP WITH TIME ZONE,
  table_id UUID REFERENCES fb_tables(id) ON DELETE SET NULL,
  cancelled BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server sections table: Defines server sections and table assignments
CREATE TABLE IF NOT EXISTS fb_server_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_name TEXT NOT NULL,
  server_id TEXT NOT NULL,
  outlet_id TEXT NOT NULL, -- Changed to TEXT to match outlets table
  table_ids UUID[] NOT NULL, -- Keep as UUID[] since references fb_tables.id
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section_name, outlet_id)
);

-- Table turn history: Tracks table turn times for analytics
CREATE TABLE IF NOT EXISTS fb_table_turn_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL,
  order_id TEXT, -- Changed to TEXT to match orders table
  party_size INTEGER,
  turn_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  turn_end_time TIMESTAMP WITH TIME ZONE,
  turn_duration INTEGER, -- in minutes
  server_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_fb_tables_outlet ON fb_tables(outlet_id);
CREATE INDEX idx_fb_tables_status ON fb_tables(status);
CREATE INDEX idx_fb_tables_section ON fb_tables(section);
CREATE INDEX idx_fb_tables_server ON fb_tables(assigned_server_id);
CREATE INDEX idx_fb_table_reservations_table ON fb_table_reservations(table_id);
CREATE INDEX idx_fb_table_reservations_reservation ON fb_table_reservations(reservation_id);
CREATE INDEX idx_fb_table_reservations_status ON fb_table_reservations(status);
CREATE INDEX idx_fb_table_reservations_arrival ON fb_table_reservations(arrival_time);
CREATE INDEX idx_fb_waitlist_status ON fb_waitlist(seated, cancelled);
CREATE INDEX idx_fb_waitlist_queued ON fb_waitlist(queued_at DESC);
CREATE INDEX idx_fb_server_sections_server ON fb_server_sections(server_id);
CREATE INDEX idx_fb_table_turn_history_table ON fb_table_turn_history(table_id);
CREATE INDEX idx_fb_table_turn_history_date ON fb_table_turn_history(turn_start_time DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fb_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_fb_tables_updated_at
  BEFORE UPDATE ON fb_tables
  FOR EACH ROW
  EXECUTE FUNCTION update_fb_tables_updated_at();

CREATE TRIGGER trigger_fb_table_reservations_updated_at
  BEFORE UPDATE ON fb_table_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_fb_tables_updated_at();

CREATE TRIGGER trigger_fb_waitlist_updated_at
  BEFORE UPDATE ON fb_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_fb_tables_updated_at();

CREATE TRIGGER trigger_fb_server_sections_updated_at
  BEFORE UPDATE ON fb_server_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_fb_tables_updated_at();

-- Function to get available tables for party size
DROP FUNCTION IF EXISTS get_available_tables(UUID, INTEGER, TEXT);
CREATE OR REPLACE FUNCTION get_available_tables(
  p_outlet_id TEXT, -- Changed to TEXT to match outlets table
  p_party_size INTEGER,
  p_section TEXT DEFAULT NULL
)
RETURNS TABLE(
  table_id UUID,
  table_number TEXT,
  seats INTEGER,
  section TEXT,
  shape TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.table_number,
    t.seats,
    t.section,
    t.shape
  FROM fb_tables t
  WHERE t.outlet_id = p_outlet_id
    AND t.status = 'available'
    AND t.is_active = TRUE
    AND t.seats >= p_party_size
    AND (p_section IS NULL OR t.section = p_section)
  ORDER BY t.seats ASC, t.table_number ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to assign table to order
DROP FUNCTION IF EXISTS assign_table_to_order(UUID, UUID, TEXT);
CREATE OR REPLACE FUNCTION assign_table_to_order(
  p_table_id UUID,
  p_order_id TEXT, -- Changed to TEXT to match orders table
  p_server_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_table_status TEXT;
BEGIN
  -- Get current table status
  SELECT status INTO v_table_status
  FROM fb_tables
  WHERE id = p_table_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Table not found';
  END IF;
  
  IF v_table_status != 'available' THEN
    RAISE EXCEPTION 'Table is not available (current status: %)', v_table_status;
  END IF;
  
  -- Update table status
  UPDATE fb_tables
  SET status = 'occupied',
      current_order_id = p_order_id,
      assigned_server_id = COALESCE(p_server_id, assigned_server_id),
      turn_start_time = NOW()
  WHERE id = p_table_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to release table from order
CREATE OR REPLACE FUNCTION release_table_from_order(
  p_table_id UUID,
  p_mark_dirty BOOLEAN DEFAULT TRUE
)
RETURNS BOOLEAN AS $$
DECLARE
  v_order_id UUID;
  v_turn_start_time TIMESTAMP WITH TIME ZONE;
  v_party_size INTEGER;
  v_server_id TEXT;
BEGIN
  -- Get current order info
  SELECT 
    current_order_id,
    turn_start_time,
    seats,
    assigned_server_id
  INTO v_order_id, v_turn_start_time, v_party_size, v_server_id
  FROM fb_tables
  WHERE id = p_table_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Table not found';
  END IF;
  
  -- Record turn history if we have an order
  IF v_order_id IS NOT NULL AND v_turn_start_time IS NOT NULL THEN
    INSERT INTO fb_table_turn_history (
      table_id,
      order_id,
      party_size,
      turn_start_time,
      turn_end_time,
      turn_duration,
      server_id
    ) VALUES (
      p_table_id,
      v_order_id,
      v_party_size,
      v_turn_start_time,
      NOW(),
      EXTRACT(EPOCH FROM (NOW() - v_turn_start_time)) / 60,
      v_server_id
    );
    
    -- Update average turn time
    UPDATE fb_tables
    SET average_turn_time = (
      SELECT COALESCE(AVG(turn_duration), 0)
      FROM fb_table_turn_history
      WHERE table_id = p_table_id
    )
    WHERE id = p_table_id;
  END IF;
  
  -- Update table status
  UPDATE fb_tables
  SET status = CASE WHEN p_mark_dirty THEN 'dirty' ELSE 'available' END,
      current_order_id = NULL,
      turn_start_time = NULL
  WHERE id = p_table_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to mark table as clean
CREATE OR REPLACE FUNCTION mark_table_clean(
  p_table_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE fb_tables
  SET status = 'available'
  WHERE id = p_table_id AND status = 'dirty';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get table status summary
DROP FUNCTION IF EXISTS get_table_status_summary(UUID);
CREATE OR REPLACE FUNCTION get_table_status_summary(
  p_outlet_id TEXT -- Changed to TEXT to match outlets table
)
RETURNS TABLE(
  status TEXT,
  count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    status,
    COUNT(*)
  FROM fb_tables
  WHERE outlet_id = p_outlet_id
    AND is_active = TRUE
  GROUP BY status;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign table from reservation
DROP FUNCTION IF EXISTS auto_assign_table_from_reservation(UUID);
CREATE OR REPLACE FUNCTION auto_assign_table_from_reservation(
  p_reservation_id TEXT -- Changed to TEXT to match reservations table
)
RETURNS UUID AS $$
DECLARE
  v_party_size INTEGER;
  v_outlet_id TEXT; -- Changed to TEXT to match outlets table
  v_arrival_time TIMESTAMP WITH TIME ZONE;
  v_table_id UUID;
BEGIN
  -- Get reservation details
  SELECT 
    r.guest_count,
    -- Assuming default outlet, in real implementation this would come from reservation
    (SELECT id FROM outlets WHERE type = 'Restaurant' LIMIT 1),
    r.check_in_date
  INTO v_party_size, v_outlet_id, v_arrival_time
  FROM reservations r
  WHERE r.id = p_reservation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found';
  END IF;
  
  -- Find best available table
  SELECT table_id INTO v_table_id
  FROM get_available_tables(v_outlet_id, v_party_size)
  LIMIT 1;
  
  IF v_table_id IS NULL THEN
    RAISE EXCEPTION 'No available tables for party size %', v_party_size;
  END IF;
  
  -- Create table reservation
  INSERT INTO fb_table_reservations (
    table_id,
    reservation_id,
    guest_name,
    party_size,
    arrival_time,
    status
  ) SELECT
    v_table_id,
    p_reservation_id,
    (SELECT guest_name FROM reservations WHERE id = p_reservation_id),
    v_party_size,
    v_arrival_time,
    'confirmed';
  
  RETURN v_table_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add guest to waitlist
CREATE OR REPLACE FUNCTION add_to_waitlist(
  p_guest_name TEXT,
  p_party_size INTEGER,
  p_contact_phone TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_waitlist_id UUID;
  v_avg_wait_time INTEGER;
BEGIN
  -- Calculate estimated wait time based on recent waitlist data
  SELECT COALESCE(
    EXTRACT(EPOCH FROM AVG(seated_at - queued_at)) / 60, 
    15 -- default 15 minutes
  ) INTO v_avg_wait_time
  FROM fb_waitlist
  WHERE seated = TRUE
    AND seated_at > NOW() - INTERVAL '7 days';
  
  -- Insert into waitlist
  INSERT INTO fb_waitlist (
    guest_name,
    party_size,
    contact_phone,
    estimated_wait_time,
    notes
  ) VALUES (
    p_guest_name,
    p_party_size,
    p_contact_phone,
    v_avg_wait_time,
    p_notes
  ) RETURNING id INTO v_waitlist_id;
  
  RETURN v_waitlist_id;
END;
$$ LANGUAGE plpgsql;

-- Function to seat next guest from waitlist
CREATE OR REPLACE FUNCTION seat_next_waitlist_guest(
  p_table_id UUID,
  p_party_size INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_waitlist_id UUID;
BEGIN
  -- Find next eligible guest (party size fits, not seated, not cancelled)
  SELECT id INTO v_waitlist_id
  FROM fb_waitlist
  WHERE party_size <= p_party_size
    AND seated = FALSE
    AND cancelled = FALSE
    AND notified = TRUE -- Only seat if they've been notified
  ORDER BY 
    ABS(party_size - party_size) ASC, -- Prefer closest match
    queued_at ASC
  LIMIT 1;
  
  IF v_waitlist_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Update waitlist entry
  UPDATE fb_waitlist
  SET seated = TRUE,
      seated_at = NOW(),
      table_id = p_table_id
  WHERE id = v_waitlist_id;
  
  RETURN v_waitlist_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_tables TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_table_reservations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_waitlist TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_server_sections TO authenticated;
GRANT SELECT, INSERT ON fb_table_turn_history TO authenticated;

GRANT EXECUTE ON FUNCTION get_available_tables(TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_table_to_order(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION release_table_from_order(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_table_clean(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_status_summary(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION auto_assign_table_from_reservation(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_to_waitlist(TEXT, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION seat_next_waitlist_guest(UUID, INTEGER) TO authenticated;

-- Add comments for documentation (removed to avoid signature conflicts)
