-- ================================================================================
-- Fix: create_group_booking creates one named member per room (S1, S2, S3...)
-- ================================================================================
-- Previously the function created p_room_count guest profiles all with the same
-- contact name, or only the primary contact. Now it creates one properly-named
-- member per room with a room-number suffix (e.g. "S1", "S2", "S3") and distinct
-- emails, each linked via guest_group_relationships.
-- ================================================================================

drop function if exists create_group_booking;

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
  v_member_name text;
  v_member_email text;
  v_guest_id text;
  v_existing_guest_id text;
  v_relationship_id text;
  v_email_local text;
  v_email_domain text;
begin
  -- Create group profile record
  insert into group_profiles (
    id, code, name, type, status,
    contact_name, contact_email, contact_phone,
    organization_name, billing_address,
    preferences, notes,
    commission_percent,
    created_at, updated_at
  ) values (
    v_group_id, v_group_code, p_group_name, 'GroupReservation',
    'Active',
    p_contact_name, p_contact_email, p_contact_phone,
    p_group_name, '{}'::jsonb,
    jsonb_build_object('preferredRoomType', p_room_type_needed),
    'Group booking: ' || p_group_name,
    0.00,
    v_now, v_now
  );

  -- Create group booking record (legacy compatibility)
  insert into group_bookings (
    id, group_name, contact_name, contact_email, contact_phone,
    room_type_needed, room_count, check_in_date, check_out_date,
    discount_percent, status
  ) values (
    v_group_id, p_group_name, p_contact_name, p_contact_email, p_contact_phone,
    p_room_type_needed, p_room_count, p_check_in_date, p_check_out_date,
    p_discount_percent, p_status
  );

  -- Split email for per-member variant generation
  v_email_local := split_part(p_contact_email, '@', 1);
  v_email_domain := split_part(p_contact_email, '@', 2);
  if v_email_domain = '' then v_email_domain := 'example.com'; end if;

  -- Create ONE guest profile PER ROOM, each linked to the group.
  -- Members are named with a room-number suffix (e.g. "S1", "S2", "S3")
  -- so they appear as real individual members on the group profile.
  for v_i in 1..p_room_count loop
    v_member_name := p_contact_name || v_i::text;
    v_member_email := case when v_i = 1 then p_contact_email
                           else v_email_local || v_i::text || '@' || v_email_domain
                      end;

    -- Find or create the guest for this member
    select id into v_existing_guest_id from guests where email = v_member_email limit 1;

    if v_existing_guest_id is not null then
      v_guest_id := v_existing_guest_id;
      update guests
      set parent_group_id = v_group_id, is_primary_contact = (v_i = 1)
      where id = v_guest_id;
    else
      v_guest_id := 'GST-' || gen_random_uuid()::text;
      insert into guests (
        id, name, email, phone, status,
        loyalty_points, special_requests, notes, total_spend,
        parent_group_id, is_primary_contact
      ) values (
        v_guest_id,
        v_member_name,
        v_member_email,
        p_contact_phone,
        'Regular',
        0,
        '',
        'Group booking: ' || p_group_name || ' - Member ' || v_i ||
          case when v_i = 1 then ' (Primary contact)' else '' end,
        0,
        v_group_id,
        v_i = 1
      );
    end if;

    -- Create guest-group relationship for this member
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
      null,
      case when v_i = 1 then 'Primary Contact' else 'Member' end,
      v_i = 1,
      v_now,
      v_now
    )
    on conflict do nothing;
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
