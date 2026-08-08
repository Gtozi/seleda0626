/**
 * Apply migration 221: Fix reservation trigger subquery issues
 * Run: npx tsx supabase/run-migration-221.ts
 * 
 * This fixes the "more than one row returned by a subquery" error
 * that was occurring during reservation creation.
 */
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const sql = `
-- Migration 221: Fix reservation trigger subquery issues
-- The ensure_reservation_group_profile_and_guest function had subqueries that could return multiple rows
-- This fixes the ambiguous queries by using more specific logic and consistent ordering

DROP FUNCTION IF EXISTS public.ensure_reservation_group_profile_and_guest() CASCADE;

CREATE OR REPLACE FUNCTION public.ensure_reservation_group_profile_and_guest()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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

      -- Try to find an existing group profile with exact ID match first
      select id into v_group_id
      from group_profiles
      where id = new.booking_group_id
         or id = new.group_booking_id
      limit 1;

      -- If no exact ID match, try code match
      if v_group_id is null then
        select id into v_group_id
        from group_profiles
        where code = new.booking_group_id
           or code = new.group_booking_id
        order by created_at asc  -- Consistent ordering
        limit 1;
      end if;

      -- If missing, create from group_bookings when available
      if v_group_id is null then
        -- Try booking_group_id first, then group_booking_id
        select * into v_group_record
        from group_bookings
        where id = new.booking_group_id
        limit 1;

        if v_group_record is null then
          select * into v_group_record
          from group_bookings
          where id = new.group_booking_id
          limit 1;
        end if;

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

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_ensure_reservation_group_profile_and_guest ON public.reservations;

CREATE TRIGGER trigger_ensure_reservation_group_profile_and_guest
BEFORE INSERT OR UPDATE OF status, booking_group_id, group_booking_id, guest_email
ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION ensure_reservation_group_profile_and_guest();

GRANT EXECUTE ON FUNCTION public.ensure_reservation_group_profile_and_guest() TO anon;
GRANT EXECUTE ON FUNCTION public.ensure_reservation_group_profile_and_guest() TO authenticated;
`;

let result;
try {
  result = await (supabase as any).rpc('exec_sql', { query: sql });
} catch (e) {
  // Fallback: execute via raw SQL using the REST API
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  result = res.ok ? { error: null } : { error: await res.text() };
}

if (result.error) {
  console.error('Could not auto-apply migration. Please run the following SQL in your Supabase SQL Editor:\n');
  console.log(sql);
  process.exit(1);
}

console.log('✓ Migration 221 applied: Fixed reservation trigger subquery issues.');
console.log('✓ Reservation creation should now work without the "more than one row returned" error.');
