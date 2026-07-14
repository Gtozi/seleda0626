-- One-time backfill: any OPEN folio that currently has zero folio_lines but
-- whose reservation has a real total_amount was created via the ensureFolio()
-- fallback path (payment/charge posted before check_in_reservation ran) using
-- the old code, which left the folio as an empty shell - so /folio-balance
-- always showed $0.00 outstanding even though the guest genuinely owed money.
-- This posts the missing initial room charge (discount-adjusted, then
-- service charge + VAT via post_folio_charge) for every such folio so
-- existing bookings affected by that bug are corrected retroactively.
-- ensureFolio() in server.ts has already been fixed to seed this charge at
-- creation time going forward.

do $$
declare
  v_folio record;
  v_discount_pct numeric;
  v_base_amount numeric;
  v_room_type text;
begin
  for v_folio in
    select f.id as folio_id, f.reservation_id, f.target_folio
    from folios f
    join reservations r on r.id = f.reservation_id
    where f.status = 'Open'
      and coalesce(r.total_amount, 0) > 0
      and not exists (select 1 from folio_lines fl where fl.folio_id = f.id)
      -- Skip Guest (B) folios in a corporate split; the room charge belongs
      -- on the Master (A) folio, mirroring check_in_reservation/ensureFolio.
      and (f.target_folio is distinct from 'B')
  loop
    select coalesce(r.discount_percent, 0), r.room_type, round(r.total_amount * (1 - coalesce(r.discount_percent, 0) / 100), 2)
    into v_discount_pct, v_room_type, v_base_amount
    from reservations r
    where r.id = v_folio.reservation_id;

    if v_base_amount > 0 then
      raise notice 'Backfilling missing charge for folio % (reservation %): base amount %', v_folio.folio_id, v_folio.reservation_id, v_base_amount;

      -- p_user_id is passed as NULL rather than a placeholder string:
      -- folio_lines.created_by has a foreign key to system_users(id), and a
      -- non-existent user id would fail that constraint; NULL is allowed
      -- (on delete set null) and satisfies the FK trivially.
      perform post_folio_charge(
        v_folio.folio_id,
        'Room charge - ' || coalesce(v_room_type, 'reservation') || ' (backfill)',
        v_base_amount,
        1,
        'Room',
        null,
        null
      );
    end if;
  end loop;
end $$;
