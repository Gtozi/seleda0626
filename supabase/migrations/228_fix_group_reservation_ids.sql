-- ================================================================================
-- Fix: Replace group-name-as-ID with proper group reservation IDs
-- ================================================================================
-- Previously, frontOffice.routes.ts set booking_group_id = group_name for group
-- bookings. This caused group reservation "IDs" like "ETT", "ccct", "GCE" to
-- appear in the UI instead of unique identifiers like "GRP-AB12CD".
--
-- This migration:
--   1. Generates a proper GRP-XXXXXX ID for each distinct bad group_booking_id.
--   2. Updates all reservations sharing that bad value to the new proper ID.
--   3. Updates/creates matching group_bookings and group_profiles rows so the
--      link is consistent.
--
-- "Bad" values are those that do NOT start with 'GRP-' or 'RES-' (i.e. they are
-- raw group names used as IDs).
-- ================================================================================

do $$
declare
  bad_row record;
  new_id text;
begin
  for bad_row in
    select distinct booking_group_id as bad_id
    from reservations
    where booking_group_id is not null
      and booking_group_id <> ''
      and booking_group_id not like 'GRP-%'
      and booking_group_id not like 'RES-%'
  loop
    -- Generate a new proper group reservation ID
    new_id := 'GRP-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));

    -- Ensure uniqueness (extremely unlikely collision, but guard anyway)
    while exists (select 1 from group_bookings where id = new_id) loop
      new_id := 'GRP-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    end loop;

    -- Update all reservations that had the bad group ID
    update reservations
      set booking_group_id = new_id,
          group_booking_id = new_id
      where booking_group_id = bad_row.bad_id;

    -- Update group_bookings if a row with the bad ID exists
    update group_bookings
      set id = new_id
      where id = bad_row.bad_id;

    -- If no group_bookings row exists, create one from the reservation data
    if not exists (select 1 from group_bookings where id = new_id) then
      insert into group_bookings (
        id, group_name, contact_name, contact_email, contact_phone,
        room_type_needed, room_count, check_in_date, check_out_date,
        discount_percent, status
      )
      select
        new_id,
        bad_row.bad_id, -- group_name was stored as the ID
        max(guest_name),
        max(guest_email),
        max(guest_phone),
        max(room_type),
        count(*),
        min(check_in_date),
        max(check_out_date),
        0,
        'Confirmed'
      from reservations
      where booking_group_id = new_id;
    end if;

    -- Update group_profiles if a row with the bad ID exists
    update group_profiles
      set id = new_id
      where id = bad_row.bad_id;

    -- Update guest parent_group_id references
    update guests
      set parent_group_id = new_id
      where parent_group_id = bad_row.bad_id;

    -- Update guest_group_relationships
    update guest_group_relationships
      set group_id = new_id
      where group_id = bad_row.bad_id;

  end loop;
end $$;
