-- Migration 071: Link folio_payments to invoice_documents
-- This establishes a direct relationship between payments and invoices for audit trail purposes

-- 1. Add invoice_id column to folio_payments
ALTER TABLE folio_payments 
ADD COLUMN IF NOT EXISTS invoice_id text REFERENCES invoice_documents(id) ON DELETE SET NULL;

-- 2. Create index for invoice_id lookups
CREATE INDEX IF NOT EXISTS idx_folio_payments_invoice_id ON folio_payments(invoice_id);

-- 3. Add comment to document the relationship
COMMENT ON COLUMN folio_payments.invoice_id IS 'References the invoice document this payment is associated with, if any';

-- 4. Update sync_folio_lines_to_reservation_charges to include invoice_id in payments array
CREATE OR REPLACE FUNCTION sync_folio_lines_to_reservation_charges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_folio_id text;
  v_reservation_id text;
  v_charges jsonb := '[]'::jsonb;
  v_payments jsonb := '[]'::jsonb;
  v_line record;
  v_payment record;
BEGIN
  -- Determine the folio id based on which table fired the trigger.
  -- folios has id; folio_lines and folio_payments have folio_id.
  IF tg_table_name = 'folios' THEN
    IF tg_op = 'DELETE' THEN
      v_folio_id := old.id;
    ELSE
      v_folio_id := new.id;
    END IF;
  ELSE
    v_folio_id := coalesce(new.folio_id, old.folio_id);
  END IF;

  -- Get reservation_id from the folio
  SELECT reservation_id INTO v_reservation_id
  FROM folios
  WHERE id = v_folio_id;

  IF v_reservation_id IS NULL THEN
    IF tg_op = 'DELETE' THEN RETURN old; END IF;
    RETURN new;
  END IF;

  -- Rebuild charges array from all folio_lines for this reservation
  FOR v_line IN
    SELECT
      fl.id, fl.line_number, fl.transaction_date, fl.description,
      fl.amount, fl.quantity, fl.unit_price, fl.line_type, fl.is_voided, fl.created_at
    FROM folio_lines fl
    JOIN folios f ON f.id = fl.folio_id
    WHERE f.reservation_id = v_reservation_id
    ORDER BY f.id, fl.line_number
  LOOP
    v_charges := v_charges || jsonb_build_object(
      'id', v_line.id,
      'lineNumber', v_line.line_number,
      'date', v_line.transaction_date,
      'description', v_line.description,
      'amount', v_line.amount,
      'quantity', v_line.quantity,
      'unitPrice', v_line.unit_price,
      'lineType', v_line.line_type,
      'isVoided', v_line.is_voided,
      'createdAt', v_line.created_at
    );
  END LOOP;

  -- Rebuild payments array from all folio_payments for this reservation (now includes invoice_id)
  FOR v_payment IN
    SELECT
      fp.id, fp.payment_date, fp.amount, fp.payment_method, fp.reference_number, 
      fp.is_voided, fp.created_at, fp.invoice_id
    FROM folio_payments fp
    JOIN folios f ON f.id = fp.folio_id
    WHERE f.reservation_id = v_reservation_id
    ORDER BY f.id, fp.payment_date
  LOOP
    v_payments := v_payments || jsonb_build_object(
      'id', v_payment.id,
      'date', v_payment.payment_date,
      'amount', v_payment.amount,
      'paymentMethod', v_payment.payment_method,
      'reference', v_payment.reference_number,
      'isVoided', v_payment.is_voided,
      'invoiceId', v_payment.invoice_id,
      'createdAt', v_payment.created_at
    );
  END LOOP;

  -- Update reservation.charges and reservation.payments
  UPDATE reservations
  SET charges = v_charges,
      payments = v_payments
  WHERE id = v_reservation_id;

  IF tg_op = 'DELETE' THEN RETURN old; END IF;
  RETURN new;
END;
$$;

-- 5. Create function to link payments to invoice when invoice is generated
CREATE OR REPLACE FUNCTION link_payments_to_invoice(p_invoice_id text, p_folio_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count integer;
BEGIN
  -- Update all non-voided payments for this folio to reference the invoice
  UPDATE folio_payments
  SET invoice_id = p_invoice_id
  WHERE folio_id = p_folio_id
    AND is_voided = false
    AND invoice_id IS NULL;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'invoiceId', p_invoice_id,
    'folioId', p_folio_id,
    'paymentsLinked', v_updated_count
  );
END;
$$;

-- 6. Create function to unlink payments from invoice (when invoice is voided)
CREATE OR REPLACE FUNCTION unlink_payments_from_invoice(p_invoice_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count integer;
BEGIN
  -- Remove invoice reference from all payments linked to this invoice
  UPDATE folio_payments
  SET invoice_id = NULL
  WHERE invoice_id = p_invoice_id;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'invoiceId', p_invoice_id,
    'paymentsUnlinked', v_updated_count
  );
END;
$$;
