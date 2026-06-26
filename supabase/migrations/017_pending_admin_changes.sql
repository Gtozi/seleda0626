-- Migration 017: Pending admin changes queue for Executive Governance approval workflow

CREATE TABLE IF NOT EXISTS pending_admin_changes (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  change_type TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_by TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Pending',
  payload     JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pending_admin_changes_status ON pending_admin_changes (status);
