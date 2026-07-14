-- Migration 063: Fix auto-linking of group profiles with individual and group check-in
--
-- Problem: The auto_link_guest_to_group trigger only fired on updates to
-- group_profile_id, booking_group_id, or guest_email. It did NOT fire when a
-- reservation's status changed to 'CheckedIn', so guests were never linked to
-- group profiles during check-in. Additionally, for group bookings created via
-- create_booking_atomic, no group_profile row existed, so the lookup failed.
--
-- Fix:
-- 1. Add a BEFORE trigger that ensures reservations have a group_profile_id
--    (creating a group_profile from group_bookings if necessary) and a guest_id
--    (creating a guest from reservation details if necessary) before the row is
--    written.
-- 2. Update the auto_link_guest_to_group trigger function to use guest_id when
--    available and to handle group_booking_id as a fallback.
-- 3. Extend trigger_auto_link_guest_to_group to fire on status changes (e.g.
--    Confirmed/CheckedIn) so the link is created at check-in.

-- ─────────────────────────────────────────────────────────────────────────────
-- Part 1: BEFORE trigger - normalize group_profile_id and guest_id
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function ensure_reservation_group_profile_and_guest()
returns trigger
language plpgsql
security definer
as $$
declare
  v_group_id        text;
  v_guest_id        text;
  v_group_record    record;
  v_group_name      text;
  v_group_ref       text;
begin
  -- Resolve a group_profile_id for this reservation if needed
  if new.group_profile_id is null then
    if new.booking_group_id is not null or new.group_booking_id is not null then
      v_group_ref := coalesce(new.booking_group_id, new.group_booking_id);

      -- Try to find an existing group profile
      select id into v_group_id
      from group_profiles
      where id = new.booking_group_id
         or id = new.group_booking_id
         or code = new.booking_group_id
         or code = new.group_booking_id
      limit 1;

      -- If missing, create from group_bookings when available
      if v_group_id is null then
        select * into v_group_record
        from group_bookings
        where id = new.booking_group_id
           or id = new.group_booking_id
        limit 1;

        if v_group_record is not null then
          insert into group_profiles (
            id, code, name, type, status,
            contact_name, contact_email, contact_phone,
            organization_name, created_at, updated_at
          ) values (
            v_group_record.id,
            'GRP-' || v_group_record.id,
            v_group_record.group_name,
            'GroupReservation',
            'Active',
            v_group_record.contact_name,
            v_group_record.contact_email,
            v_group_record.contact_phone,
            v_group_record.group_name,
            now(),
            now()
          )
          on conflict (id) do nothing
          returning id into v_group_id;

          if v_group_id is null then
            select id into v_group_id from group_profiles where id = v_group_record.id;
          end if;
        else
          -- Last resort: create a generic group profile from the group reference
          v_group_name := coalesce(new.guest_name, 'Group ' || v_group_ref);
          insert into group_profiles (
            id, code, name, type, status,
            contact_name, contact_email, contact_phone,
            organization_name, created_at, updated_at
          ) values (
            v_group_ref,
            'GRP-' || v_group_ref,
            v_group_name,
            'GroupReservation',
            'Active',
            new.guest_name,
            new.guest_email,
            new.guest_phone,
            v_group_name,
            now(),
            now()
          )
          on conflict (id) do nothing
          returning id into v_group_id;

          if v_group_id is null then
            select id into v_group_id from group_profiles where id = v_group_ref;
          end if;
        end if;
      end if;

      new.group_profile_id := v_group_id;
    end if;
  end if;

  -- Resolve a guest_id for this reservation if needed
  if new.guest_id is null and new.guest_email is not null then
    select id into v_guest_id from guests where email = new.guest_email limit 1;

    if v_guest_id is null then
      v_guest_id := 'G-' || gen_random_uuid()::text;
      insert into guests (
        id, name, email, phone, status,
        loyalty_points, special_requests, notes,
        total_spend, preferences, identification_doc
      ) values (
        v_guest_id,
        new.guest_name,
        new.guest_email,
        new.guest_phone,
        coalesce(new.guest_status, 'Regular'),
        0,
        '',
        'Auto-created from reservation ' || new.id,
        0,
        '{}'::jsonb,
        '{}'::jsonb
      )
      on conflict (id) do nothing
      returning id into v_guest_id;

      if v_guest_id is null then
        select id into v_guest_id from guests where email = new.guest_email limit 1;
      end if;
    end if;

    new.guest_id := v_guest_id;
  end if;

  return new;
end;
$$;

grant execute on function ensure_reservation_group_profile_and_guest() to authenticated;

drop trigger if exists trigger_ensure_reservation_group_profile_and_guest on reservations;
create trigger trigger_ensure_reservation_group_profile_and_guest
before insert or update of status, booking_group_id, group_booking_id, guest_email
on reservations
for each row
execute function ensure_reservation_group_profile_and_guest();

-- ─────────────────────────────────────────────────────────────────────────────
-- Part 2: Auto-linking function - prefer guest_id, support group_booking_id
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function auto_link_guest_to_group()
returns trigger
language plpgsql
security definer
as $$
declare
  v_group_id           text;
  v_guest_id           text;
  v_relationship_type  text;
  v_existing_relationship record;
begin
  -- Determine group_id, preferring group_profile_id then booking_group_id then group_booking_id
  if new.group_profile_id is not null then
    v_group_id := new.group_profile_id;
  elsif new.booking_group_id is not null then
    select id into v_group_id
    from group_profiles
    where code = new.booking_group_id or id = new.booking_group_id
    limit 1;
  elsif new.group_booking_id is not null then
    select id into v_group_id
    from group_profiles
    where code = new.group_booking_id or id = new.group_booking_id
    limit 1;
  end if;

  if v_group_id is null then
    return new;
  end if;

  select type into v_relationship_type from group_profiles where id = v_group_id;

  -- Determine guest_id, preferring the reservation's guest_id then email lookup
  if new.guest_id is not null then
    v_guest_id := new.guest_id;
  elsif new.guest_email is not null then
    select id into v_guest_id from guests where email = new.guest_email limit 1;
  end if;

  if v_guest_id is null then
    return new;
  end if;

  -- Update or create the active relationship
  select * into v_existing_relationship
  from guest_group_relationships
  where guest_id = v_guest_id
    and group_id = v_group_id
    and status = 'Active'
    and (end_date is null or end_date >= current_date)
  limit 1;

  if v_existing_relationship is not null then
    update guest_group_relationships
    set reservation_id = new.id,
        updated_at = now()
    where id = v_existing_relationship.id;
  else
    insert into guest_group_relationships (
      id, guest_id, group_id, reservation_id, relationship_type,
      status, start_date, is_primary_contact, created_at, created_by
    ) values (
      gen_random_uuid()::text,
      v_guest_id,
      v_group_id,
      new.id,
      v_relationship_type,
      'Active',
      new.check_in_date,
      false,
      now(),
      current_setting('request.jwt.claim.sub', true)
    );

    update guests
    set parent_group_id = v_group_id
    where id = v_guest_id;
  end if;

  return new;
end;
$$;

grant execute on function auto_link_guest_to_group() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Part 3: Trigger auto-link on status changes (check-in / promotion)
-- ─────────────────────────────────────────────────────────────────────────────
drop trigger if exists trigger_auto_link_guest_to_group on reservations;
create trigger trigger_auto_link_guest_to_group
after insert or update of group_profile_id, booking_group_id, group_booking_id, guest_email, guest_id, status
on reservations
for each row
execute function auto_link_guest_to_group();
