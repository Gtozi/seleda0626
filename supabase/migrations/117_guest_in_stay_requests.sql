-- Migration 117: Guest In-Stay Requests
-- Note: Already applied via Supabase MCP. This file exists for version control.

-- Guest in-stay service requests
CREATE TABLE IF NOT EXISTS guest_requests (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  request_number text,
  reservation_id text,
  room_number text,
  guest_name text,
  request_type text NOT NULL DEFAULT 'Housekeeping',
  description text,
  priority text DEFAULT 'Normal',
  status text DEFAULT 'Open',
  assigned_to text,
  assigned_department text,
  submitted_at timestamptz DEFAULT now(),
  acknowledged_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for lookup by reservation
CREATE INDEX IF NOT EXISTS idx_guest_requests_reservation ON guest_requests(reservation_id);
CREATE INDEX IF NOT EXISTS idx_guest_requests_status ON guest_requests(status);
CREATE INDEX IF NOT EXISTS idx_guest_requests_department ON guest_requests(assigned_department);

-- Folio view for guest portal (read-only view joining folios + folio_lines)
CREATE OR REPLACE VIEW guest_folio_view AS
SELECT
  f.id AS folio_id,
  f.reservation_id,
  f.status AS folio_status,
  f.balance,
  f.total_charges,
  f.total_payments,
  f.tax_total,
  f.service_charge_total,
  f.currency,
  f.opened_at,
  fl.id AS line_id,
  fl.line_number,
  fl.transaction_date,
  fl.description,
  fl.amount,
  fl.quantity,
  fl.unit_price,
  fl.line_type,
  fl.is_voided,
  fl.source_module
FROM folios f
LEFT JOIN folio_lines fl ON fl.folio_id = f.id AND fl.is_voided = false
WHERE f.status IN ('Open', 'Closed');
