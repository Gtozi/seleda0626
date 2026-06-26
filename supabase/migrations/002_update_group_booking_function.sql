-- Migration: Update create_group_booking function to create group profiles and guest relationships
-- This updates the group booking creation to:
-- 1. Create group profile in group_profiles table
-- 2. Create group booking record in group_bookings table (legacy)
-- 3. Create guest profiles in guests table for each room
-- 4. Create guest-group relationships in guest_group_relationships table

-- Drop old function
drop function if exists create_group_booking;

-- Create updated function
create or replace function create_group_booking(
  p_group_name text,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_room_type_needed text,
  p_room_count integer,
  p_check_in_date date,
  p_check_out_date date,
  p_discount_percent numeric,
  p_status text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_group_id text := 'GRP-' || (floor(random() * 9000) + 1000)::int::text;
  v_group_code text := v_group_id;
  v_now timestamp with time zone := now();
  v_i integer;
  v_guest_id text;
  v_relationship_id text;
begin
  -- Create group profile record (new system)
  insert into group_profiles (
    id, code, name, type, status,
    contact_name, contact_email, contact_phone,
    organization_name, billing_address,
    preferences, notes,
    commission_percent,
    created_at, updated_at
  ) values (
    v_group_id, v_group_code, p_group_name, 'GroupReservation',
    case when p_status = 'Confirmed' then 'Active' else 'Active' end,
    p_contact_name, p_contact_email, p_contact_phone,
    p_group_name, '{}'::jsonb,
    jsonb_build_object('preferredRoomType', p_room_type_needed),
    'Group booking: ' || p_group_name,
    0.00,
    v_now, v_now
  );

  -- Create group booking record (legacy system for compatibility)
  insert into group_bookings (
    id, group_name, contact_name, contact_email, contact_phone,
    room_type_needed, room_count, check_in_date, check_out_date,
    discount_percent, status
  ) values (
    v_group_id, p_group_name, p_contact_name, p_contact_email, p_contact_phone,
    p_room_type_needed, p_room_count, p_check_in_date, p_check_out_date,
    p_discount_percent, p_status
  );

  -- Create guest profiles and guest-group relationships for each room
  for v_i in 1..p_room_count loop
    -- Create guest profile for this room
    v_guest_id := 'G-' || gen_random_uuid()::text;
    insert into guests (
      id, name, email, phone, status,
      loyalty_points, special_requests, notes, total_spend,
      parent_group_id, is_primary_contact
    ) values (
      v_guest_id,
      p_contact_name,
      p_contact_email,
      p_contact_phone,
      'Regular',
      0,
      '',
      'Group booking: ' || p_group_name || ' - Room ' || v_i,
      0,
      v_group_id,
      v_i = 1
    );

    -- Create guest-group relationship
    v_relationship_id := gen_random_uuid()::text;
    insert into guest_group_relationships (
      id, guest_id, group_id, relationship_type, status,
      start_date, end_date, role_title, is_primary_contact,
      created_at, updated_at
    ) values (
      v_relationship_id,
      v_guest_id,
      v_group_id,
      'GroupReservation',
      'Active',
      p_check_in_date,
      p_check_out_date,
      case when v_i = 1 then 'Primary Contact' else 'Member' end,
      v_i = 1,
      v_now,
      v_now
    );
  end loop;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'group_booking.create', 'group_booking', v_group_id, 'frontoffice',
    jsonb_build_object(
      'groupName', p_group_name,
      'roomCount', p_room_count,
      'roomType', p_room_type_needed
    )
  );

  return jsonb_build_object(
    'success', true,
    'groupId', v_group_id
  );
end;
$$;
