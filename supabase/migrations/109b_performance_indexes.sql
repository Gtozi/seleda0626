-- Migration 109: Performance Indexes
-- Adds indexes to accelerate the most frequent query patterns:
--   - Reservation availability lookups (date-range overlap)
--   - Status-based filtering
--   - Group booking lookups
--   - Folio line/payment joins
--   - Room type + status filtering
--   - Audit event chronological ordering
--   - User email lookups (auth)

-- Reservation availability: overlap queries use check_in_date <= ? AND check_out_date >= ?
CREATE INDEX IF NOT EXISTS idx_reservations_date_range
  ON reservations (check_in_date, check_out_date);

-- Reservation status filtering (dashboard, check-in queue, etc.)
CREATE INDEX IF NOT EXISTS idx_reservations_status
  ON reservations (status);

-- Group booking membership lookups
CREATE INDEX IF NOT EXISTS idx_reservations_group_booking
  ON reservations (group_booking_id);

-- Folio lines joined by folio_id
CREATE INDEX IF NOT EXISTS idx_folio_lines_folio_id
  ON folio_lines (folio_id);

-- Folio payments joined by folio_id
CREATE INDEX IF NOT EXISTS idx_folio_payments_folio_id
  ON folio_payments (folio_id);

-- Room filtering by type + status (housekeeping board, availability)
CREATE INDEX IF NOT EXISTS idx_rooms_type_status
  ON rooms (room_type_id, status);

-- Audit events chronological ordering (newest first)
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at
  ON audit_events (created_at DESC);

-- System user email lookups (login, dedup)
CREATE INDEX IF NOT EXISTS idx_system_users_email
  ON system_users (email);
