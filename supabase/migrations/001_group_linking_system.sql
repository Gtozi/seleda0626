-- ================================================================================
-- AUTOMATIC GUEST-TO-GROUP PROFILE LINKING SYSTEM
-- Database Migration Script
-- ================================================================================
-- This migration creates the database schema for comprehensive group profile
-- management and automatic guest-to-group relationship tracking.
--
-- Run this script in your Supabase SQL Editor after the main schema.sql
-- ================================================================================

-- ================================================================================
-- 1. GROUP PROFILES TABLE
-- ================================================================================
-- Comprehensive group profile management for all group types:
-- - Group Reservations
-- - Corporate Accounts
-- - Travel Agents
-- - Tour Operators
-- - Crew Bookings
-- - Conferences
-- - Events
-- - Long-Term Contracts
-- ================================================================================

create table if not exists group_profiles (
  id text primary key,
  code text unique not null,  -- Unique group code (e.g., CORP-001, GRP-2026-TECH)
  name text not null,  -- Group name
  type text not null check (type in (
    'GroupReservation',
    'CorporateAccount',
    'TravelAgent',
    'TourOperator',
    'CrewBooking',
    'Conference',
    'Event',
    'LongTermContract'
  )),
  status text not null default 'Active' check (status in (
    'Active',
    'Inactive',
    'Suspended',
    'Blacklisted',
    'Archived'
  )),
  
  -- Contact Information
  contact_name text,
  contact_email text,
  contact_phone text,
  contact_title text,
  
  -- Organization Details
  organization_name text,
  organization_address text,
  organization_city text,
  organization_country text,
  organization_tax_id text,
  organization_vat_no text,
  
  -- Billing Information
  billing_address text,
  billing_city text,
  billing_country text,
  billing_tax_id text,
  billing_vat_no text,
  payment_terms text default 'Net 30',
  credit_limit numeric default 0.00,
  current_balance numeric default 0.00,
  
  -- Contract Details
  contract_start_date date,
  contract_end_date date,
  cut_off_date date,  -- Date by which unsold rooms release
  negotiated_rate_code text,
  discount_percent numeric default 0.00,
  
  -- Master Payment Settings
  master_payment_method text check (master_payment_method in (
    'Invoice',
    'Credit Card',
    'Wire Transfer',
    'Check',
    'Cash',
    'Other'
  )),
  
  -- Room Requirements
  room_type_breakdown jsonb default '[]'::jsonb,  -- Array of {roomType, count}
  total_rooms_allocated integer default 0,
  total_rooms_used integer default 0,
  
  -- Analytics
  total_revenue numeric default 0.00,
  total_room_nights integer default 0,
  total_stays integer default 0,
  lifetime_value numeric default 0.00,
  average_daily_rate numeric default 0.00,
  
  -- Metadata
  notes text,
  preferences jsonb default '{}'::jsonb,
  custom_fields jsonb default '{}'::jsonb,
  
  -- Default Folio Routing Profile
  default_routing_profile_id text,
  
  -- Timestamps
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by text references system_users(id) on delete set null,
  updated_by text references system_users(id) on delete set null
);

-- Indexes for group_profiles
create index if not exists idx_group_profiles_code on group_profiles(code);
create index if not exists idx_group_profiles_type on group_profiles(type);
create index if not exists idx_group_profiles_status on group_profiles(status);
create index if not exists idx_group_profiles_organization on group_profiles(organization_name);
create index if not exists idx_group_profiles_contact_email on group_profiles(contact_email);
create index if not exists idx_group_profiles_created_at on group_profiles(created_at desc);

-- ================================================================================
-- 2. GUEST GROUP RELATIONSHIPS TABLE
-- ================================================================================
-- Historical tracking of guest-group relationships with full metadata
-- Supports multiple group memberships over time with analytics
-- ================================================================================

create table if not exists guest_group_relationships (
  id text primary key,
  guest_id text not null references guests(id) on delete cascade,
  group_id text not null references group_profiles(id) on delete cascade,
  reservation_id text references reservations(id) on delete set null,
  
  -- Relationship Type
  relationship_type text not null check (relationship_type in (
    'GroupReservation',
    'CorporateAccount',
    'TravelAgent',
    'TourOperator',
    'CrewBooking',
    'Conference',
    'Event',
    'LongTermContract'
  )),
  
  -- Relationship Status
  status text not null default 'Active' check (status in (
    'Active',
    'Inactive',
    'Terminated',
    'Expired',
    'Merged'
  )),
  
  -- Time Period
  start_date date not null default current_date,
  end_date date,  -- Null means currently active
  
  -- Role within Group
  is_primary_contact boolean not null default false,
  role_title text,  -- e.g., 'Event Coordinator', 'Department Head'
  
  -- Analytics (calculated from reservations)
  total_stays integer default 0,
  total_room_nights integer default 0,
  total_revenue numeric default 0.00,
  average_daily_rate numeric default 0.00,
  last_stay_date date,
  
  -- Metadata
  notes text,
  custom_fields jsonb default '{}'::jsonb,
  
  -- Timestamps
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by text references system_users(id) on delete set null,
  updated_by text references system_users(id) on delete set null
);

-- Composite indexes for guest_group_relationships
create index if not exists idx_guest_group_relationships_guest_id on guest_group_relationships(guest_id);
create index if not exists idx_guest_group_relationships_group_id on guest_group_relationships(group_id);
create index if not exists idx_guest_group_relationships_reservation_id on guest_group_relationships(reservation_id);
create index if not exists idx_guest_group_relationships_status on guest_group_relationships(status);
create index if not exists idx_guest_group_relationships_type on guest_group_relationships(relationship_type);
create index if not exists idx_guest_group_relationships_dates on guest_group_relationships(start_date, end_date);
create index if not exists idx_guest_group_relationships_active on guest_group_relationships(guest_id, group_id) where status = 'Active';
create index if not exists idx_guest_group_relationships_guest_active on guest_group_relationships(guest_id) where status = 'Active';

-- Unique constraint to prevent duplicate active relationships
create unique index if not exists idx_guest_group_relationships_unique_active 
on guest_group_relationships(guest_id, group_id) 
where status = 'Active' and end_date is null;

-- ================================================================================
-- 3. GROUP AUDIT LOG TABLE
-- ================================================================================
-- Dedicated audit logging for group operations and relationship changes
-- ================================================================================

create table if not exists group_audit_log (
  id text primary key,
  timestamp timestamp with time zone not null default now(),
  user_id text references system_users(id) on delete set null,
  user_name text,
  
  -- Action Details
  action text not null check (action in (
    'group_profile_created',
    'group_profile_updated',
    'group_profile_deleted',
    'group_status_changed',
    'relationship_created',
    'relationship_updated',
    'relationship_terminated',
    'relationship_status_changed',
    'guest_linked_to_group',
    'guest_unlinked_from_group',
    'guest_merged',
    'group_assignment_changed',
    'automatic_linking_triggered',
    'bulk_linking_operation',
    'data_import_linking'
  )),
  
  -- Entity References
  entity_type text check (entity_type in (
    'GroupProfile',
    'GuestGroupRelationship',
    'Guest',
    'Reservation'
  )),
  entity_id text,
  
  -- Group Context
  group_id text references group_profiles(id) on delete set null,
  guest_id text references guests(id) on delete set null,
  reservation_id text references reservations(id) on delete set null,
  relationship_id text references guest_group_relationships(id) on delete set null,
  
  -- Change Details
  previous_values jsonb default '{}'::jsonb,
  new_values jsonb default '{}'::jsonb,
  reason text,
  
  -- System Context
  ip_address text,
  user_agent text,
  module text default 'group_management',
  
  -- Outcome
  outcome text not null default 'success' check (outcome in ('success', 'failure', 'partial'))
);

-- Indexes for group_audit_log
create index if not exists idx_group_audit_log_timestamp on group_audit_log(timestamp desc);
create index if not exists idx_group_audit_log_user_id on group_audit_log(user_id);
create index if not exists idx_group_audit_log_action on group_audit_log(action);
create index if not exists idx_group_audit_log_group_id on group_audit_log(group_id);
create index if not exists idx_group_audit_log_guest_id on group_audit_log(guest_id);
create index if not exists idx_group_audit_log_entity on group_audit_log(entity_type, entity_id);

-- ================================================================================
-- 4. UPDATE RESERVATIONS TABLE
-- ================================================================================
-- Add proper foreign key to group_profiles and update existing columns
-- ================================================================================

-- Add group_profile_id column if it doesn't exist
alter table reservations 
add column if not exists group_profile_id text references group_profiles(id) on delete set null;

-- Create index for group_profile_id
create index if not exists idx_reservations_group_profile_id on reservations(group_profile_id);

-- Update existing index for booking_group_id to include group_profile_id
drop index if exists idx_reservations_booking_group_id;
create index idx_reservations_booking_group_id on reservations(booking_group_id, group_profile_id);

-- ================================================================================
-- 5. UPDATE GUESTS TABLE
-- ================================================================================
-- Add columns for group relationship tracking (for backward compatibility)
-- ================================================================================

-- Add columns if they don't exist
alter table guests 
add column if not exists parent_group_id text references group_profiles(id) on delete set null,
add column if not exists parent_corporate_id text references group_profiles(id) on delete set null,
add column if not exists is_primary_contact boolean not null default false,
add column if not exists billing_routing_profile_id text;

-- Create indexes
create index if not exists idx_guests_parent_group_id on guests(parent_group_id);
create index if not exists idx_guests_parent_corporate_id on guests(parent_corporate_id);

-- ================================================================================
-- 6. AUTOMATIC LINKING TRIGGER FUNCTIONS
-- ================================================================================
-- PostgreSQL functions to automatically link guests to groups on reservation operations
-- ================================================================================

-- Function: Automatically link guest to group when reservation is created/updated
create or replace function auto_link_guest_to_group()
returns trigger
language plpgsql
security definer
as $$
declare
  v_group_id text;
  v_relationship_type text;
  v_existing_relationship record;
begin
  -- Determine group_id from reservation
  if new.group_profile_id is not null then
    v_group_id := new.group_profile_id;
  elsif new.booking_group_id is not null then
    -- Try to find group profile by booking_group_id
    select id into v_group_id from group_profiles 
    where code = new.booking_group_id or id = new.booking_group_id
    limit 1;
  end if;
  
  -- If no group found, exit
  if v_group_id is null then
    return new;
  end if;
  
  -- Determine relationship type from group profile
  select type into v_relationship_type from group_profiles where id = v_group_id;
  
  -- Check if guest profile exists
  if not exists (select 1 from guests where email = new.guest_email limit 1) then
    -- Guest profile doesn't exist yet - will be created separately
    return new;
  end if;
  
  -- Check for existing active relationship
  select * into v_existing_relationship from guest_group_relationships
  where guest_id = (select id from guests where email = new.guest_email limit 1)
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
      id,
      guest_id,
      group_id,
      reservation_id,
      relationship_type,
      status,
      start_date,
      is_primary_contact,
      created_at,
      created_by
    ) values (
      gen_random_uuid()::text,
      (select id from guests where email = new.guest_email limit 1),
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
    where email = new.guest_email;
  end if;
  
  return new;
end;
$$;

-- Create trigger for automatic linking on reservation insert/update
drop trigger if exists trigger_auto_link_guest_to_group on reservations;
create trigger trigger_auto_link_guest_to_group
after insert or update of group_profile_id, booking_group_id, guest_email
on reservations
for each row
execute function auto_link_guest_to_group();

-- ================================================================================
-- 7. ANALYTICS UPDATE FUNCTIONS
-- ================================================================================
-- Functions to update group and relationship analytics when reservations change
-- ================================================================================

-- Function: Update group analytics when reservation is checked out
create or replace function update_group_analytics_on_checkout()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Update group profile analytics
  update group_profiles
  set total_revenue = total_revenue + coalesce(new.total_amount, 0),
      total_room_nights = total_room_nights + 
        (new.check_out_date - new.check_in_date)::integer,
      total_stays = total_stays + 1,
      updated_at = now()
  where id = new.group_profile_id;
  
  -- Update guest-group relationship analytics
  update guest_group_relationships
  set total_stays = total_stays + 1,
      total_room_nights = total_room_nights + 
        (new.check_out_date - new.check_in_date)::integer,
      total_revenue = total_revenue + coalesce(new.total_amount, 0),
      last_stay_date = new.check_out_date,
      updated_at = now()
  where reservation_id = new.id;
  
  return new;
end;
$$;

-- Create trigger for analytics update on checkout
drop trigger if exists trigger_update_group_analytics on reservations;
create trigger trigger_update_group_analytics
after update of status
on reservations
for each row
when (new.status = 'CheckedOut' and old.status != 'CheckedOut')
execute function update_group_analytics_on_checkout();

-- ================================================================================
-- 8. DATA MIGRATION
-- ================================================================================
-- Migrate existing group_bookings to group_profiles
-- Migrate existing corporate_accounts to group_profiles
-- Migrate existing guest parent relationships to guest_group_relationships
-- ================================================================================

-- Migrate group_bookings to group_profiles
insert into group_profiles (
  id,
  code,
  name,
  type,
  status,
  contact_name,
  contact_email,
  contact_phone,
  organization_name,
  discount_percent,
  contract_start_date,
  contract_end_date,
  cut_off_date,
  room_type_breakdown,
  total_rooms_allocated,
  created_at,
  updated_at
)
select 
  gb.id,
  'GRP-' || gb.id,
  gb.group_name,
  'GroupReservation',
  case when gb.status = 'Completed' then 'Archived' else gb.status end,
  gb.contact_name,
  gb.contact_email,
  gb.contact_phone,
  gb.group_name,
  gb.discount_percent,
  gb.check_in_date,
  gb.check_out_date,
  null,
  jsonb_build_array(
    jsonb_build_object(
      'roomType', gb.room_type_needed,
      'count', gb.room_count
    )
  ),
  gb.room_count,
  now(),
  now()
from group_bookings gb
on conflict (id) do nothing;

-- Migrate corporate_accounts to group_profiles
insert into group_profiles (
  id,
  code,
  name,
  type,
  status,
  contact_name,
  contact_email,
  contact_phone,
  organization_name,
  organization_address,
  organization_city,
  organization_country,
  organization_tax_id,
  billing_address,
  billing_city,
  billing_country,
  billing_tax_id,
  payment_terms,
  credit_limit,
  current_balance,
  discount_percent,
  created_at,
  updated_at
)
select 
  ca.id,
  'CORP-' || ca.id,
  ca.company_name,
  'CorporateAccount',
  case when ca.is_active = false then 'Inactive' else 'Active' end,
  ca.contact_person,
  ca.contact_email,
  ca.contact_phone,
  ca.company_name,
  ca.billing_address,
  ca.billing_city,
  ca.billing_country,
  ca.corporate_tax_id,
  ca.billing_address,
  ca.billing_city,
  ca.billing_country,
  ca.corporate_tax_id,
  ca.payment_terms,
  ca.credit_limit,
  ca.unpaid_balance,
  ca.discount_percent,
  now(),
  now()
from corporate_accounts ca
on conflict (id) do nothing;

-- Migrate existing guest parent relationships to guest_group_relationships
insert into guest_group_relationships (
  id,
  guest_id,
  group_id,
  relationship_type,
  status,
  start_date,
  is_primary_contact,
  created_at,
  updated_at
)
select 
  gen_random_uuid()::text,
  g.id,
  g.parent_group_id,
  'GroupReservation',
  'Active',
  current_date,
  coalesce(g.is_primary_contact, false),
  now(),
  now()
from guests g
where g.parent_group_id is not null
  and exists (select 1 from group_profiles where id = g.parent_group_id)
on conflict do nothing;

-- Migrate corporate relationships
insert into guest_group_relationships (
  id,
  guest_id,
  group_id,
  relationship_type,
  status,
  start_date,
  is_primary_contact,
  created_at,
  updated_at
)
select 
  gen_random_uuid()::text,
  g.id,
  g.parent_corporate_id,
  'CorporateAccount',
  'Active',
  current_date,
  coalesce(g.is_primary_contact, false),
  now(),
  now()
from guests g
where g.parent_corporate_id is not null
  and exists (select 1 from group_profiles where id = g.parent_corporate_id)
on conflict do nothing;

-- Update reservations to link to group_profiles
update reservations
set group_profile_id = (
  select gp.id from group_profiles gp 
  where gp.id = reservations.group_booking_id 
     or gp.code = reservations.group_booking_id
  )
where group_booking_id is not null
  and group_profile_id is null;

-- ================================================================================
-- 9. HELPER FUNCTIONS
-- ================================================================================
-- Utility functions for group relationship management
-- ================================================================================

-- Function: Get guest's active group relationships
create or replace function get_guest_active_groups(p_guest_id text)
returns table (
  group_id text,
  group_name text,
  group_type text,
  relationship_type text,
  start_date date,
  is_primary_contact boolean,
  total_stays integer,
  total_revenue numeric
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    gp.id as group_id,
    gp.name as group_name,
    gp.type as group_type,
    ggr.relationship_type,
    ggr.start_date,
    ggr.is_primary_contact,
    ggr.total_stays,
    ggr.total_revenue
  from guest_group_relationships ggr
  join group_profiles gp on ggr.group_id = gp.id
  where ggr.guest_id = p_guest_id
    and ggr.status = 'Active'
    and (ggr.end_date is null or ggr.end_date >= current_date)
  order by ggr.start_date desc;
end;
$$;

-- Function: Get group's active members
create or replace function get_group_active_members(p_group_id text)
returns table (
  guest_id text,
  guest_name text,
  guest_email text,
  relationship_type text,
  start_date date,
  is_primary_contact boolean,
  total_stays integer,
  total_revenue numeric
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    g.id as guest_id,
    g.name as guest_name,
    g.email as guest_email,
    ggr.relationship_type,
    ggr.start_date,
    ggr.is_primary_contact,
    ggr.total_stays,
    ggr.total_revenue
  from guest_group_relationships ggr
  join guests g on ggr.guest_id = g.id
  where ggr.group_id = p_group_id
    and ggr.status = 'Active'
    and (ggr.end_date is null or ggr.end_date >= current_date)
  order by ggr.is_primary_contact desc, ggr.start_date asc;
end;
$$;

-- Function: Link guest to group (manual/automatic)
create or replace function link_guest_to_group(
  p_guest_id text,
  p_group_id text,
  p_relationship_type text,
  p_is_primary_contact boolean default false,
  p_reservation_id text default null,
  p_user_id text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_existing_relationship record;
  v_group_type text;
  v_new_relationship_id text;
begin
  -- Validate inputs
  if not exists (select 1 from guests where id = p_guest_id) then
    return jsonb_build_object('success', false, 'error', 'Guest not found');
  end if;
  
  if not exists (select 1 from group_profiles where id = p_group_id) then
    return jsonb_build_object('success', false, 'error', 'Group not found');
  end if;
  
  -- Get group type
  select type into v_group_type from group_profiles where id = p_group_id;
  
  -- Check for existing active relationship
  select * into v_existing_relationship from guest_group_relationships
  where guest_id = p_guest_id
    and group_id = p_group_id
    and status = 'Active'
    and (end_date is null or end_date >= current_date)
  limit 1;
  
  if v_existing_relationship is not null then
    -- Update existing relationship
    update guest_group_relationships
    set is_primary_contact = p_is_primary_contact,
        reservation_id = coalesce(p_reservation_id, reservation_id),
        updated_at = now(),
        updated_by = p_user_id
    where id = v_existing_relationship.id;
    
    -- Log audit
    insert into group_audit_log (
      id, action, entity_type, entity_id, group_id, guest_id,
      relationship_id, previous_values, new_values, user_id, user_name
    ) values (
      gen_random_uuid()::text,
      'relationship_updated',
      'GuestGroupRelationship',
      v_existing_relationship.id,
      p_group_id,
      p_guest_id,
      v_existing_relationship.id,
      jsonb_build_object('isPrimaryContact', v_existing_relationship.is_primary_contact),
      jsonb_build_object('isPrimaryContact', p_is_primary_contact),
      p_user_id,
      (select name from system_users where id = p_user_id limit 1)
    );
    
    return jsonb_build_object('success', true, 'action', 'updated', 'relationshipId', v_existing_relationship.id);
  end if;
  
  -- Create new relationship
  v_new_relationship_id := gen_random_uuid()::text;
  
  insert into guest_group_relationships (
    id,
    guest_id,
    group_id,
    reservation_id,
    relationship_type,
    status,
    start_date,
    is_primary_contact,
    created_at,
    created_by
  ) values (
    v_new_relationship_id,
    p_guest_id,
    p_group_id,
    p_reservation_id,
    coalesce(p_relationship_type, v_group_type),
    'Active',
    current_date,
    p_is_primary_contact,
    now(),
    p_user_id
  );
  
  -- Update guest's parent_group_id for backward compatibility
  update guests
  set parent_group_id = p_group_id,
      is_primary_contact = p_is_primary_contact
  where id = p_guest_id;
  
  -- Log audit
  insert into group_audit_log (
    id, action, entity_type, entity_id, group_id, guest_id,
    relationship_id, new_values, user_id, user_name
  ) values (
    gen_random_uuid()::text,
    'relationship_created',
    'GuestGroupRelationship',
    v_new_relationship_id,
    p_group_id,
    p_guest_id,
    v_new_relationship_id,
    jsonb_build_object(
      'guestId', p_guest_id,
      'groupId', p_group_id,
      'relationshipType', coalesce(p_relationship_type, v_group_type),
      'isPrimaryContact', p_is_primary_contact
    ),
    p_user_id,
    (select name from system_users where id = p_user_id limit 1)
  );
  
  return jsonb_build_object('success', true, 'action', 'created', 'relationshipId', v_new_relationship_id);
end;
$$;

-- Function: Unlink guest from group
create or replace function unlink_guest_from_group(
  p_guest_id text,
  p_group_id text,
  p_reason text default null,
  p_user_id text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_existing_relationship record;
begin
  -- Find active relationship
  select * into v_existing_relationship from guest_group_relationships
  where guest_id = p_guest_id
    and group_id = p_group_id
    and status = 'Active'
    and (end_date is null or end_date >= current_date)
  limit 1;
  
  if v_existing_relationship is null then
    return jsonb_build_object('success', false, 'error', 'No active relationship found');
  end if;
  
  -- Terminate relationship
  update guest_group_relationships
  set status = 'Terminated',
      end_date = current_date,
      updated_at = now(),
      updated_by = p_user_id
  where id = v_existing_relationship.id;
  
  -- Clear guest's parent_group_id if this was the primary group
  update guests
  set parent_group_id = null,
      is_primary_contact = false
  where id = p_guest_id and parent_group_id = p_group_id;
  
  -- Log audit
  insert into group_audit_log (
    id, action, entity_type, entity_id, group_id, guest_id,
    relationship_id, previous_values, new_values, reason, user_id, user_name
  ) values (
    gen_random_uuid()::text,
    'relationship_terminated',
    'GuestGroupRelationship',
    v_existing_relationship.id,
    p_group_id,
    p_guest_id,
    v_existing_relationship.id,
    jsonb_build_object('status', 'Active', 'endDate', null),
    jsonb_build_object('status', 'Terminated', 'endDate', current_date),
    p_reason,
    p_user_id,
    (select name from system_users where id = p_user_id limit 1)
  );
  
  return jsonb_build_object('success', true, 'action', 'terminated', 'relationshipId', v_existing_relationship.id);
end;
$$;

-- ================================================================================
-- MIGRATION COMPLETE
-- ================================================================================
-- The following tables have been created/updated:
-- 1. group_profiles - Comprehensive group profile management
-- 2. guest_group_relationships - Historical relationship tracking
-- 3. group_audit_log - Dedicated audit logging
-- 4. reservations - Added group_profile_id foreign key
-- 5. guests - Added parent_group_id and parent_corporate_id foreign keys
--
-- The following triggers have been created:
-- 1. trigger_auto_link_guest_to_group - Automatic linking on reservation operations
-- 2. trigger_update_group_analytics - Analytics update on checkout
--
-- The following functions have been created:
-- 1. get_guest_active_groups - Get guest's active group relationships
-- 2. get_group_active_members - Get group's active members
-- 3. link_guest_to_group - Link guest to group (manual/automatic)
-- 4. unlink_guest_from_group - Unlink guest from group
--
-- Data migration has been executed for:
-- 1. group_bookings → group_profiles
-- 2. corporate_accounts → group_profiles
-- 3. Existing guest parent relationships → guest_group_relationships
-- 4. Reservations group_booking_id → group_profile_id
-- ================================================================================
