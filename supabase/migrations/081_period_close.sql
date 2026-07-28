-- ============================================================
-- Finance & Accounting - Period Close
-- ============================================================

CREATE TABLE IF NOT EXISTS accounting_periods (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  period_name text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closing', 'Closed')),
  closed_by text,
  closed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_accounting_periods_status ON accounting_periods(status);
CREATE INDEX IF NOT EXISTS idx_accounting_periods_dates ON accounting_periods(period_start, period_end);

-- Function to close an accounting period
CREATE OR REPLACE FUNCTION close_accounting_period(
  p_period_id text,
  p_closed_by text,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_period record;
BEGIN
  SELECT * INTO v_period FROM accounting_periods WHERE id = p_period_id;

  IF v_period IS NULL THEN
    RAISE EXCEPTION 'Period not found';
  END IF;

  IF v_period.status = 'Closed' THEN
    RAISE EXCEPTION 'Period is already closed';
  END IF;

  UPDATE accounting_periods
  SET status = 'Closed',
      closed_by = p_closed_by,
      closed_at = now(),
      notes = p_notes,
      updated_at = now()
  WHERE id = p_period_id;

  RETURN jsonb_build_object('success', true, 'period_id', p_period_id);
END;
$$;

-- Function to reopen an accounting period
CREATE OR REPLACE FUNCTION reopen_accounting_period(
  p_period_id text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE accounting_periods
  SET status = 'Open',
      closed_by = NULL,
      closed_at = NULL,
      updated_at = now()
  WHERE id = p_period_id;

  RETURN jsonb_build_object('success', true, 'period_id', p_period_id);
END;
$$;
