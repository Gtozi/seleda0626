-- Fix folio duplication race condition and ensure balance is always derived
-- from folio_lines/folio_payments (single source of truth), with folios
-- staying Open after partial payments.

-- 1. Merge any pre-existing duplicate OPEN folios BEFORE the unique index is
--    created below, otherwise the index creation itself fails with a unique
--    violation (this happened live: reservation A738BBCB had two open
--    target_folio='B' folios). For each duplicate group we keep the oldest
--    folio (by opened_at) as the "keeper", re-parent all folio_lines and
--    folio_payments from the other duplicate(s) onto the keeper, then close
--    the now-empty duplicate folio(s) with an explanatory note.
do $$
declare
  v_dupe record;
  v_keeper_id text;
  v_dupe_id text;
  v_dupe_ids text[];
  v_max_line integer;
begin
  for v_dupe in
    select reservation_id, coalesce(target_folio, '_') as tf, count(*) as cnt
    from folios
    where status = 'Open'
    group by reservation_id, coalesce(target_folio, '_')
    having count(*) > 1
  loop
    raise notice 'Merging duplicate open folios for reservation % (target_folio=%): % rows', v_dupe.reservation_id, v_dupe.tf, v_dupe.cnt;

    -- Keeper = oldest open folio in this duplicate group
    select id into v_keeper_id
    from folios
    where reservation_id = v_dupe.reservation_id
      and coalesce(target_folio, '_') = v_dupe.tf
      and status = 'Open'
    order by opened_at asc, id asc
    limit 1;

    -- All other open folios in the group get merged into the keeper
    select array_agg(id) into v_dupe_ids
    from folios
    where reservation_id = v_dupe.reservation_id
      and coalesce(target_folio, '_') = v_dupe.tf
      and status = 'Open'
      and id != v_keeper_id;

    foreach v_dupe_id in array v_dupe_ids
    loop
      select coalesce(max(line_number), 0) into v_max_line
      from folio_lines
      where folio_id = v_keeper_id;

      -- Re-parent charges, renumbering to avoid line_number collisions
      -- (window functions aren't allowed directly in an UPDATE SET clause,
      -- so the new line numbers are computed in a CTE and joined back).
      with renumbered as (
        select id, v_max_line + row_number() over (order by line_number) as new_line_number
        from folio_lines
        where folio_id = v_dupe_id
      )
      update folio_lines fl
      set folio_id = v_keeper_id,
          line_number = renumbered.new_line_number
      from renumbered
      where fl.id = renumbered.id;

      -- Re-parent payments. folio_payments has a unique index on
      -- (folio_id, reference_number), and duplicate folios frequently share
      -- the same generic reference_number (e.g. "Individual Payment"), which
      -- would collide once both sets of payments land on the same keeper
      -- folio. Disambiguate only the rows that would actually collide.
      update folio_payments dupe
      set folio_id = v_keeper_id,
          reference_number = case
            when dupe.reference_number is not null and exists (
              select 1 from folio_payments k
              where k.folio_id = v_keeper_id
                and k.reference_number = dupe.reference_number
            )
            then dupe.reference_number || ' [merged-' || substr(dupe.id, 1, 8) || ']'
            else dupe.reference_number
          end
      where dupe.folio_id = v_dupe_id;

      -- Close the now-empty duplicate folio
      update folios
      set status = 'Closed',
          closed_at = now(),
          notes = coalesce(notes, '') || ' [merged into duplicate-folio cleanup, id=' || v_keeper_id || ']'
      where id = v_dupe_id;
    end loop;

    -- Recompute the keeper's cached totals from the merged ledger
    update folios
    set total_charges = coalesce((select sum(amount) from folio_lines where folio_id = v_keeper_id and is_voided = false), 0),
        total_payments = coalesce((select sum(amount) from folio_payments where folio_id = v_keeper_id and is_voided = false), 0),
        balance = coalesce((select sum(amount) from folio_lines where folio_id = v_keeper_id and is_voided = false), 0)
                - coalesce((select sum(amount) from folio_payments where folio_id = v_keeper_id and is_voided = false), 0),
        updated_at = now()
    where id = v_keeper_id;
  end loop;
end $$;

-- 2. Prevent duplicate OPEN folios for the same reservation/target_folio
--    going forward. ensureFolio() in server.ts does a SELECT-then-INSERT
--    which is subject to a race condition under concurrent requests
--    (double-click, retries, etc). This partial unique index makes the
--    second concurrent INSERT fail fast with a unique violation instead of
--    silently creating a duplicate folio. target_folio can be null
--    (individual bookings), so we coalesce it to a sentinel value for
--    uniqueness purposes.
create unique index if not exists uq_folios_open_reservation_target
  on folios (reservation_id, coalesce(target_folio, '_'))
  where status = 'Open';

-- 3. Recompute folio balance/total_charges/total_payments from the actual
--    ledger (folio_lines/folio_payments) rather than trusting the
--    incrementally-maintained columns, which can drift. balance/total_charges/
--    total_payments columns are kept in sync here as a cache, but callers
--    (server.ts) should keep computing on-demand from folio_lines/folio_payments
--    for anything balance-critical (already the case for /folio-balance and
--    /payments endpoints).
create or replace function recompute_folio_totals(p_folio_id text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_total_charges numeric;
  v_total_payments numeric;
  v_balance numeric;
begin
  select coalesce(sum(amount), 0) into v_total_charges
  from folio_lines
  where folio_id = p_folio_id and is_voided = false;

  select coalesce(sum(amount), 0) into v_total_payments
  from folio_payments
  where folio_id = p_folio_id and is_voided = false;

  v_balance := round((v_total_charges - v_total_payments)::numeric, 2);

  update folios
  set total_charges = round(v_total_charges::numeric, 2),
      total_payments = round(v_total_payments::numeric, 2),
      balance = v_balance,
      updated_at = now()
  where id = p_folio_id;

  -- IMPORTANT: a partial payment must NOT close the folio. Only an explicit
  -- checkout/invoice action closes a folio. We intentionally do not touch
  -- `status` here so the folio remains 'Open' regardless of balance reaching
  -- zero from a payment alone.

  return jsonb_build_object(
    'folioId', p_folio_id,
    'totalCharges', round(v_total_charges::numeric, 2),
    'totalPayments', round(v_total_payments::numeric, 2),
    'balance', v_balance
  );
end;
$$;

grant execute on function recompute_folio_totals to authenticated;

-- 4. Keep reservations.payment_status in sync with the recomputed balance
--    (Paid / Partial / Unpaid) without ever touching folio status.
create or replace function sync_reservation_payment_status(p_folio_id text)
returns void
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_new_status text;
begin
  select * into v_folio from folios where id = p_folio_id;
  if not found then return; end if;

  if v_folio.total_payments <= 0 then
    v_new_status := 'Unpaid';
  elsif v_folio.balance <= 0.01 then
    v_new_status := 'Paid';
  else
    v_new_status := 'Partial';
  end if;

  update reservations
  set payment_status = v_new_status
  where id = v_folio.reservation_id;
end;
$$;

grant execute on function sync_reservation_payment_status to authenticated;
