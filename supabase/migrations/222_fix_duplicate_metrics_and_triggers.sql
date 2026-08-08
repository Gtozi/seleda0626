-- Migration 222: Fix duplicate metric definitions and trigger subquery issues
-- The calculate_revpar_kpi trigger was failing because there were duplicate RevPAR entries
-- in metric_definitions, causing "more than one row returned by a subquery" errors

-- ============================================================
-- Step 1: Remove ALL duplicate metric definitions
-- Keep the oldest one (by created_at) for each name, remove the rest
-- ============================================================
DELETE FROM metric_definitions
WHERE metric_id NOT IN (
  SELECT DISTINCT ON (name) metric_id
  FROM metric_definitions
  ORDER BY name, created_at ASC
);

-- ============================================================
-- Step 2: Add unique constraint on name column to prevent future duplicates
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'metric_definitions_name_unique'
  ) THEN
    ALTER TABLE metric_definitions ADD CONSTRAINT metric_definitions_name_unique UNIQUE (name);
  END IF;
END $$;

-- ============================================================
-- Step 3: Fix calculate_revpar_kpi trigger function
-- Make it resilient to missing metrics and use LIMIT 1
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_revpar_kpi()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_revenue DECIMAL(10,2);
  v_total_rooms INTEGER;
  v_revpar DECIMAL(10,2);
  v_date DATE;
  v_metric_id uuid;
BEGIN
  v_date := CURRENT_DATE;
  
  -- Get the metric_id first with LIMIT 1 to avoid subquery issues
  SELECT metric_id INTO v_metric_id 
  FROM metric_definitions 
  WHERE name = 'RevPAR' 
  LIMIT 1;
  
  -- If metric doesn't exist, skip the update
  IF v_metric_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get total revenue for today
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue
  FROM reservations
  WHERE property_id = NEW.property_id
    AND check_in_date = v_date
    AND status IN ('confirmed', 'checked_in', 'completed');
  
  -- Get total available rooms
  SELECT COUNT(*) INTO v_total_rooms
  FROM rooms
  WHERE property_id = NEW.property_id AND status != 'out_of_order';
  
  -- Calculate RevPAR
  IF v_total_rooms > 0 THEN
    v_revpar := v_total_revenue / v_total_rooms;
  ELSE
    v_revpar := 0;
  END IF;
  
  -- Insert or update KPI metric value
  INSERT INTO metric_values (metric_id, property_id, value, recorded_at)
  VALUES (v_metric_id, NEW.property_id, v_revpar, NOW())
  ON CONFLICT (metric_id, property_id, recorded_at)
  DO UPDATE SET value = EXCLUDED.value;
  
  RETURN NEW;
END;
$$;

-- ============================================================
-- Step 4: Fix calculate_adr_kpi trigger function
-- Make it resilient to missing metrics and use LIMIT 1
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_adr_kpi()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_revenue DECIMAL(10,2);
  v_occupied_rooms INTEGER;
  v_adr DECIMAL(10,2);
  v_date DATE;
  v_metric_id uuid;
BEGIN
  v_date := CURRENT_DATE;
  
  -- Get the metric_id first with LIMIT 1 to avoid subquery issues
  SELECT metric_id INTO v_metric_id 
  FROM metric_definitions 
  WHERE name = 'ADR' 
  LIMIT 1;
  
  -- If metric doesn't exist, skip the update
  IF v_metric_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get total revenue for today
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue
  FROM reservations
  WHERE property_id = NEW.property_id
    AND check_in_date = v_date
    AND status IN ('confirmed', 'checked_in', 'completed');
  
  -- Get occupied rooms for today
  SELECT COUNT(*) INTO v_occupied_rooms
  FROM reservations
  WHERE property_id = NEW.property_id
    AND check_in_date = v_date
    AND status IN ('checked_in');
  
  -- Calculate ADR
  IF v_occupied_rooms > 0 THEN
    v_adr := v_total_revenue / v_occupied_rooms;
  ELSE
    v_adr := 0;
  END IF;
  
  -- Insert or update KPI metric value
  INSERT INTO metric_values (metric_id, property_id, value, recorded_at)
  VALUES (v_metric_id, NEW.property_id, v_adr, NOW())
  ON CONFLICT (metric_id, property_id, recorded_at)
  DO UPDATE SET value = EXCLUDED.value;
  
  RETURN NEW;
END;
$$;

-- ============================================================
-- Step 5: Fix auto_link_guest_to_group trigger function
-- The subquery (select id from guests where email = new.guest_email limit 1)
-- could return multiple rows if there are duplicate guest emails
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_link_guest_to_group()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
declare
  v_group_id text;
  v_relationship_type text;
  v_existing_relationship record;
  v_guest_id text;
begin
  -- Determine group_id from reservation
  if new.group_profile_id is not null then
    v_group_id := new.group_profile_id;
  elsif new.booking_group_id is not null then
    -- Try to find group profile by booking_group_id
    select id into v_group_id from group_profiles 
    where code = new.booking_group_id or id = new.booking_group_id
    order by created_at asc  -- Consistent ordering
    limit 1;
  end if;
  
  -- If no group found, exit
  if v_group_id is null then
    return new;
  end if;
  
  -- Determine relationship type from group profile
  select type into v_relationship_type from group_profiles where id = v_group_id limit 1;
  
  -- Check if guest profile exists and get the guest_id
  select id into v_guest_id from guests where email = new.guest_email 
  order by created_at asc  -- Consistent ordering if duplicates exist
  limit 1;
  
  if v_guest_id is null then
    -- Guest profile doesn't exist yet - will be created separately
    return new;
  end if;
  
  -- Check for existing active relationship
  select * into v_existing_relationship from guest_group_relationships
  where guest_id = v_guest_id
    and group_id = v_group_id
    and status = 'Active'
    and (end_date is null or end_date >= current_date)
  limit 1;
  
  if v_existing_relationship is not null then
    -- Update existing relationship with new reservation
    update guest_group_relationships
    set reservation_id = new.id,
        updated_at = now()
    where id = v_existing_relationship.id;
  else
    -- Create new relationship
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
      current_setting('request.jwt.claim.sub', true)  -- Get current user if available
    );
    
    -- Update guest's parent_group_id for backward compatibility
    update guests
    set parent_group_id = v_group_id
    where id = v_guest_id;
  end if;
  
  return new;
end;
$$;

-- ============================================================
-- Step 6: Check for and clean up duplicate guest emails
-- ============================================================
DO $$
DECLARE
  dup_count integer;
BEGIN
  SELECT COUNT(*) INTO dup_count
  FROM (SELECT email FROM guests WHERE email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1) d;
  
  IF dup_count > 0 THEN
    RAISE NOTICE 'Found % duplicate guest emails - these may cause issues', dup_count;
  END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.calculate_revpar_kpi() TO anon;
GRANT EXECUTE ON FUNCTION public.calculate_revpar_kpi() TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_adr_kpi() TO anon;
GRANT EXECUTE ON FUNCTION public.calculate_adr_kpi() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_link_guest_to_group() TO anon;
GRANT EXECUTE ON FUNCTION public.auto_link_guest_to_group() TO authenticated;
