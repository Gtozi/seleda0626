-- ============================================================
-- 104_deprecate_jsonb_ledger.sql
-- Mark JSONB charges/payments as deprecated; add ledger_migrated flag
-- ============================================================

-- Add migration tracking column
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS ledger_migrated BOOLEAN DEFAULT false;

-- Backfill: set ledger_migrated = true for reservations that have folios
-- (their charges are already in folio_lines)
UPDATE reservations r
SET ledger_migrated = true
WHERE EXISTS (
  SELECT 1 FROM folios f WHERE f.reservation_id = r.id
)
AND r.ledger_migrated = false;

-- Add deprecation comments on the legacy JSONB columns
COMMENT ON COLUMN reservations.charges IS 'DEPRECATED: Use folio_lines via GET /api/reservations/:id/folio instead. Kept for backward compatibility during migration.';
COMMENT ON COLUMN reservations.payments IS 'DEPRECATED: Use folio_payments via GET /api/reservations/:id/folio instead. Kept for backward compatibility during migration.';
