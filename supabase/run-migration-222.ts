/**
 * Apply migration 222: Fix duplicate metric definitions and trigger subquery issues
 * Run: npx tsx supabase/run-migration-222.ts
 * 
 * This fixes the "more than one row returned by a subquery" error that was
 * occurring during reservation INSERT and UPDATE operations. The root cause
 * was duplicate entries in the metric_definitions table.
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
-- Migration 222: Fix duplicate metric definitions and trigger subquery issues
DELETE FROM metric_definitions
WHERE metric_id NOT IN (
  SELECT DISTINCT ON (name) metric_id
  FROM metric_definitions
  ORDER BY name, created_at ASC
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'metric_definitions_name_unique'
  ) THEN
    ALTER TABLE metric_definitions ADD CONSTRAINT metric_definitions_name_unique UNIQUE (name);
  END IF;
END $$;

-- Fixed trigger functions with LIMIT 1 and graceful handling
CREATE OR REPLACE FUNCTION public.calculate_revpar_kpi()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total_revenue DECIMAL(10,2); v_total_rooms INTEGER; v_revpar DECIMAL(10,2);
  v_date DATE; v_metric_id uuid;
BEGIN
  v_date := CURRENT_DATE;
  SELECT metric_id INTO v_metric_id FROM metric_definitions WHERE name = 'RevPAR' LIMIT 1;
  IF v_metric_id IS NULL THEN RETURN NEW; END IF;
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue FROM reservations
  WHERE property_id = NEW.property_id AND check_in_date = v_date AND status IN ('confirmed', 'checked_in', 'completed');
  SELECT COUNT(*) INTO v_total_rooms FROM rooms WHERE property_id = NEW.property_id AND status != 'out_of_order';
  v_revpar := CASE WHEN v_total_rooms > 0 THEN v_total_revenue / v_total_rooms ELSE 0 END;
  INSERT INTO metric_values (metric_id, property_id, value, recorded_at)
  VALUES (v_metric_id, NEW.property_id, v_revpar, NOW())
  ON CONFLICT (metric_id, property_id, recorded_at) DO UPDATE SET value = EXCLUDED.value;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_adr_kpi()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total_revenue DECIMAL(10,2); v_occupied_rooms INTEGER; v_adr DECIMAL(10,2);
  v_date DATE; v_metric_id uuid;
BEGIN
  v_date := CURRENT_DATE;
  SELECT metric_id INTO v_metric_id FROM metric_definitions WHERE name = 'ADR' LIMIT 1;
  IF v_metric_id IS NULL THEN RETURN NEW; END IF;
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue FROM reservations
  WHERE property_id = NEW.property_id AND check_in_date = v_date AND status IN ('confirmed', 'checked_in', 'completed');
  SELECT COUNT(*) INTO v_occupied_rooms FROM reservations
  WHERE property_id = NEW.property_id AND check_in_date = v_date AND status IN ('checked_in');
  v_adr := CASE WHEN v_occupied_rooms > 0 THEN v_total_revenue / v_occupied_rooms ELSE 0 END;
  INSERT INTO metric_values (metric_id, property_id, value, recorded_at)
  VALUES (v_metric_id, NEW.property_id, v_adr, NOW())
  ON CONFLICT (metric_id, property_id, recorded_at) DO UPDATE SET value = EXCLUDED.value;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_link_guest_to_group()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
declare
  v_group_id text; v_relationship_type text; v_existing_relationship record; v_guest_id text;
begin
  if new.group_profile_id is not null then
    v_group_id := new.group_profile_id;
  elsif new.booking_group_id is not null then
    select id into v_group_id from group_profiles 
    where code = new.booking_group_id or id = new.booking_group_id
    order by created_at asc limit 1;
  end if;
  if v_group_id is null then return new; end if;
  select type into v_relationship_type from group_profiles where id = v_group_id limit 1;
  select id into v_guest_id from guests where email = new.guest_email order by created_at asc limit 1;
  if v_guest_id is null then return new; end if;
  select * into v_existing_relationship from guest_group_relationships
  where guest_id = v_guest_id and group_id = v_group_id and status = 'Active'
    and (end_date is null or end_date >= current_date) limit 1;
  if v_existing_relationship is not null then
    update guest_group_relationships set reservation_id = new.id, updated_at = now()
    where id = v_existing_relationship.id;
  else
    insert into guest_group_relationships (id, guest_id, group_id, reservation_id, relationship_type,
      status, start_date, is_primary_contact, created_at, created_by)
    values (gen_random_uuid()::text, v_guest_id, v_group_id, new.id, v_relationship_type,
      'Active', new.check_in_date, false, now(), current_setting('request.jwt.claim.sub', true));
    update guests set parent_group_id = v_group_id where id = v_guest_id;
  end if;
  return new;
end;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_revpar_kpi() TO anon;
GRANT EXECUTE ON FUNCTION public.calculate_revpar_kpi() TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_adr_kpi() TO anon;
GRANT EXECUTE ON FUNCTION public.calculate_adr_kpi() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_link_guest_to_group() TO anon;
GRANT EXECUTE ON FUNCTION public.auto_link_guest_to_group() TO authenticated;
`;

let result;
try {
  result = await (supabase as any).rpc('exec_sql', { query: sql });
} catch (e) {
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
    body: JSON.stringify({ query: sql }),
  });
  result = res.ok ? { error: null } : { error: await res.text() };
}

if (result.error) {
  console.error('Could not auto-apply migration. Please run the SQL in your Supabase SQL Editor:\n');
  console.log(sql);
  process.exit(1);
}

console.log('✓ Migration 222 applied: Fixed duplicate metrics and trigger subqueries.');
