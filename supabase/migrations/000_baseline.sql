-- =========================================================================
-- Migration: 001_group_linking_system.sql
-- =========================================================================
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
-- 1. group_bookings â†’ group_profiles
-- 2. corporate_accounts â†’ group_profiles
-- 3. Existing guest parent relationships â†’ guest_group_relationships
-- 4. Reservations group_booking_id â†’ group_profile_id
-- ================================================================================

-- END: 001_group_linking_system.sql

-- =========================================================================
-- Migration: 002_update_group_booking_function.sql
-- =========================================================================
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

-- END: 002_update_group_booking_function.sql

-- =========================================================================
-- Migration: 003_gift_shop_pos_tables.sql
-- =========================================================================
-- ======================================================================================
-- Migration 003: Gift Shop POS Tables & Invoice Sequence
-- ======================================================================================

-- Add retail_price to inventory items for decoupled retail pricing
alter table inventory_items
  add column if not exists retail_price numeric not null default 0.00;

-- Invoice number sequence for Gift Shop (guarantees uniqueness)
create sequence if not exists gift_shop_invoice_seq
  start with 100001
  increment by 1
  no cycle;

-- Helper to atomically generate the next invoice number
create or replace function next_gift_shop_invoice()
returns text
language plpgsql
security definer
as $$
begin
  return 'INV-GS-' || lpad(nextval('gift_shop_invoice_seq')::text, 6, '0');
end;
$$;

-- Gift Shop Sales (POS transactions)
create table if not exists gift_shop_sales (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  date timestamp with time zone not null default now(),
  cashier text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0.00,
  tax numeric not null default 0.00,
  total numeric not null default 0.00,
  discount_percent numeric not null default 0,
  discount_amount numeric not null default 0.00,
  payment_method text not null default 'Cash',
  split_payments jsonb default null,
  client_name text,
  client_tin text,
  client_vat_no text,
  client_vat_date text,
  room_charge_details jsonb default null,
  change_given numeric not null default 0.00,
  status text not null default 'Completed' check (status in ('Completed', 'Voided')),
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_gift_shop_sales_date on gift_shop_sales(date desc);
create index if not exists idx_gift_shop_sales_status on gift_shop_sales(status);
create index if not exists idx_gift_shop_sales_invoice on gift_shop_sales(invoice_number);

-- Gift Shop Issues (damaged / broken / lost write-offs)
create table if not exists gift_shop_issues (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  type text not null check (type in ('Damaged', 'Broken', 'Lost')),
  item_cost numeric not null default 0.00,
  notes text,
  reporter text not null,
  date timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_gift_shop_issues_date on gift_shop_issues(date desc);
create index if not exists idx_gift_shop_issues_product on gift_shop_issues(product_id);

-- Enable RLS on gift shop tables
alter table gift_shop_sales enable row level security;
alter table gift_shop_issues enable row level security;

drop policy if exists "Allow all public reads" on gift_shop_sales;
create policy "Allow all public reads" on gift_shop_sales for select using (true);
drop policy if exists "Allow all public writes" on gift_shop_sales;
create policy "Allow all public writes" on gift_shop_sales for all using (true) with check (true);

drop policy if exists "Allow all public reads" on gift_shop_issues;
create policy "Allow all public reads" on gift_shop_issues for select using (true);
drop policy if exists "Allow all public writes" on gift_shop_issues;
create policy "Allow all public writes" on gift_shop_issues for all using (true) with check (true);

-- END: 003_gift_shop_pos_tables.sql

-- =========================================================================
-- Migration: 004_inventory_schema_alignment.sql
-- =========================================================================
-- ======================================================================================
-- INVENTORY PORTAL SCHEMA ALIGNMENT
-- Adds columns missing from inventory_items to match the frontend InventoryItem interface
-- ======================================================================================

alter table inventory_items
  add column if not exists sale_price numeric not null default 0.00,
  add column if not exists guest_portal_active boolean not null default false,
  add column if not exists image_url text,
  add column if not exists dietary_tags text[] default '{}';

-- END: 004_inventory_schema_alignment.sql

-- =========================================================================
-- Migration: 005_seed_inventory_demo_data.sql
-- =========================================================================
-- ======================================================================================
-- SEED INVENTORY DEMO DATA
-- Populates all inventory portal tables with realistic hotel ERP data
-- ======================================================================================

-- Suppliers (aligned with frontend defaults)
insert into inventory_suppliers (id, code, name, contact_person, phone, email, status, rating) values
('S-001', 'SUP-001', 'Global Foods Ltd', 'Account Manager', '+1 234 567 890', 'sales@globalfoods.com', 'Active', 5),
('S-002', 'SUP-002', 'Luxe Hospitality Supplies', 'Operations Lead', '+1 987 654 321', 'orders@luxesupplies.pro', 'Active', 5),
('S-003', 'SUP-003', 'Prime Meats & Poultry', 'Sales Representative', '+1 555 123 456', 'sales@primemeats.com', 'Active', 4),
('S-004', 'SUP-004', 'Metro Office Solutions', 'Client Services', '+1 444 888 999', 'support@metro-office.com', 'Inactive', 3),
('S-005', 'SUP-005', 'Technical Maintenance Parts', 'Fleet Supervisor', '+1 222 333 444', 'service@techmaintenance.net', 'Active', 5)
on conflict (id) do nothing;

-- Inventory Items (diverse categories, all mapped columns)
insert into inventory_items (
  id, code, name, category, subcategory, unit, brand, supplier_id,
  max_stock, reorder_level, last_cost, avg_cost, current_stock,
  location, barcode, store_id, stock, price, min_stock,
  retail_price, sale_price, guest_portal_active, image_url, dietary_tags
) values
('I-001', 'FVG-001', 'Fresh Organic Tomatoes', 'Food & Beverage', 'Fresh Produce', 'kg', 'GreenFields', 'S-001', 500, 50, 12.50, 12.50, 120, 'Central Warehouse', '8901234567890', 'ST-MAIN', 120, 12.50, 30, 0.00, 0.00, false, null, '{}'),
('I-002', 'FVG-002', 'Chicken Breast Fillet', 'Food & Beverage', 'Meat & Poultry', 'kg', 'Prime Farms', 'S-003', 300, 40, 45.00, 45.00, 85, 'Central Warehouse', '8901234567891', 'ST-MAIN', 85, 45.00, 20, 0.00, 0.00, false, null, '{}'),
('I-003', 'FVB-003', 'Mineral Water 500ml', 'Food & Beverage', 'Beverages', 'pcs', 'AquaPure', 'S-001', 2000, 200, 3.50, 3.50, 450, 'Bar Store', '8901234567892', 'ST-BAR', 450, 3.50, 100, 8.00, 6.00, true, null, array['Vegetarian','Vegan']),
('I-004', 'HKG-001', 'Luxury Shampoo 30ml', 'Housekeeping', 'Guest Amenities', 'pcs', 'LuxeScent', 'S-002', 5000, 500, 1.20, 1.20, 1200, 'Housekeeping Central', '8901234567893', 'ST-HK', 1200, 1.20, 200, 5.00, 4.00, true, null, '{}'),
('I-005', 'HKC-002', 'All-Purpose Cleaner', 'Housekeeping', 'Cleaning Chemicals', 'ltr', 'CleanMax', 'S-002', 200, 30, 18.00, 18.00, 45, 'Housekeeping Central', '8901234567894', 'ST-HK', 45, 18.00, 10, 0.00, 0.00, false, null, array['Eco-Friendly']),
('I-006', 'ENG-001', 'LED Bulb 9W', 'Engineering', 'Electrical', 'pcs', 'BrightLight', 'S-005', 300, 50, 8.50, 8.50, 95, 'Engineering Plant Store', '8901234567895', 'ST-ENG', 95, 8.50, 20, 0.00, 0.00, false, null, '{}'),
('I-007', 'ENP-002', 'PVC Pipe 20mm', 'Engineering', 'Plumbing', 'mtr', 'FlowTech', 'S-005', 500, 60, 6.00, 6.00, 130, 'Engineering Plant Store', '8901234567896', 'ST-ENG', 130, 6.00, 25, 0.00, 0.00, false, null, '{}'),
('I-008', 'OFF-001', 'A4 Copy Paper Ream', 'Office Supplies', 'Stationery', 'pcs', 'PaperMills', 'S-004', 100, 20, 12.00, 12.00, 35, 'Central Warehouse', '8901234567897', 'ST-MAIN', 35, 12.00, 10, 0.00, 0.00, false, null, '{}'),
('I-009', 'OFF-002', 'Ink Cartridge HP-63', 'Office Supplies', 'Printing', 'pcs', 'HP', 'S-004', 50, 10, 45.00, 45.00, 18, 'Central Warehouse', '8901234567898', 'ST-MAIN', 18, 45.00, 5, 0.00, 0.00, false, null, '{}'),
('I-010', 'GFT-001', 'Hotel Branded Mug', 'Gift Shop', 'Souvenirs', 'pcs', 'CeramicCraft', 'S-002', 200, 30, 8.00, 8.00, 60, 'Gift Store', '8901234567899', 'ST-GIFT', 60, 8.00, 15, 18.00, 15.00, true, 'https://example.com/mug.jpg', '{}'),
('I-011', 'GFT-002', 'Spa Voucher Card', 'Gift Shop', 'Souvenirs', 'pcs', 'InHouse', 'S-002', 100, 10, 2.00, 2.00, 40, 'Gift Store', '8901234567900', 'ST-GIFT', 40, 2.00, 5, 5.00, 0.00, true, null, '{}'),
('I-012', 'FVB-004', 'Ethiopian Coffee Beans 1kg', 'Food & Beverage', 'Beverages', 'kg', 'Habesha Roast', 'S-001', 100, 15, 35.00, 35.00, 28, 'Restaurant Store', '8901234567901', 'ST-REST', 28, 35.00, 10, 45.00, 40.00, true, null, array['Organic','Fair Trade']),
('I-013', 'FVD-005', 'Mozzarella Cheese Block', 'Food & Beverage', 'Dairy', 'kg', 'DairyGold', 'S-001', 80, 10, 28.00, 28.00, 22, 'Restaurant Store', '8901234567902', 'ST-REST', 22, 28.00, 8, 0.00, 0.00, false, null, array['Vegetarian']),
('I-014', 'HKL-003', 'Linen Bed Sheets King', 'Housekeeping', 'Laundry Supplies', 'pcs', 'SoftThread', 'S-002', 150, 25, 65.00, 65.00, 40, 'Housekeeping Central', '8901234567903', 'ST-HK', 40, 65.00, 15, 0.00, 0.00, false, null, '{}'),
('I-015', 'ENG-003', 'Air Filter 16x25x1', 'Engineering', 'HVAC', 'pcs', 'FilterPro', 'S-005', 80, 15, 22.00, 22.00, 18, 'Engineering Plant Store', '8901234567904', 'ST-ENG', 18, 22.00, 8, 0.00, 0.00, false, null, '{}'),
('I-016', 'OFC-001', 'Ballpoint Pen Black', 'Office Supplies', 'Stationery', 'pcs', 'WriteWell', 'S-004', 200, 30, 1.50, 1.50, 45, 'Front Office Store', '8901234567905', 'ST-OFC', 45, 1.50, 15, 0.00, 0.00, false, null, '{}'),
('I-017', 'OFC-002', 'Sticky Notes 3x3 Yellow', 'Office Supplies', 'Stationery', 'pcs', 'Post-it', 'S-004', 100, 20, 4.00, 4.00, 30, 'Front Office Store', '8901234567906', 'ST-OFC', 30, 4.00, 10, 0.00, 0.00, false, null, '{}'),
('I-018', 'OFC-003', 'Thermal Paper Roll 80mm', 'Office Supplies', 'Printing', 'pcs', 'PrintTech', 'S-004', 80, 15, 12.00, 12.00, 22, 'Front Office Store', '8901234567907', 'ST-OFC', 22, 12.00, 8, 0.00, 0.00, false, null, '{}'),
('I-019', 'OFC-004', 'Room Key Cards Pack', 'Office Supplies', 'Consumables', 'pcs', 'SecureKey', 'S-005', 500, 50, 3.00, 3.00, 120, 'Front Office Store', '8901234567908', 'ST-OFC', 120, 3.00, 30, 0.00, 0.00, false, null, '{}'),
('I-020', 'GFT-003', 'Hotel Branded Mug', 'Gift Shop', 'Souvenirs', 'pcs', 'CeramicCraft', 'S-002', 300, 40, 8.00, 8.00, 80, 'Central Warehouse', '8901234567909', 'ST-MAIN', 80, 8.00, 20, 18.00, 15.00, true, 'https://example.com/mug.jpg', '{}'),
('I-021', 'GFT-004', 'Spa Voucher Card', 'Gift Shop', 'Souvenirs', 'pcs', 'InHouse', 'S-002', 150, 20, 2.00, 2.00, 60, 'Central Warehouse', '8901234567910', 'ST-MAIN', 60, 2.00, 10, 5.00, 0.00, true, null, '{}'),
('I-022', 'GFT-005', 'Local Coffee Blend', 'Gift Shop', 'Souvenirs', 'pcs', 'Habesha Roast', 'S-003', 200, 30, 10.00, 10.00, 55, 'Central Warehouse', '8901234567911', 'ST-MAIN', 55, 10.00, 15, 24.00, 20.00, true, null, '{}'),
('I-023', 'GFT-006', 'Crystal Keepsake', 'Gift Shop', 'Souvenirs', 'pcs', 'ArtisanGlass', 'S-002', 80, 15, 40.00, 40.00, 25, 'Central Warehouse', '8901234567912', 'ST-MAIN', 25, 40.00, 8, 95.00, 80.00, true, null, '{}')
on conflict (id) do nothing;

-- Requisitions
insert into inventory_requisitions (id, number, department, requested_by, request_date, priority, status, items) values
('REQ-001', 'REQ-0001', 'Housekeeping', 'Alice Johnson', '2026-06-01', 'Normal', 'Issued', '[{"itemId":"I-004","name":"Luxury Shampoo 30ml","requestedQty":200,"issuedQty":200,"unit":"pcs","cost":1.20},{"itemId":"I-005","name":"All-Purpose Cleaner","requestedQty":10,"issuedQty":10,"unit":"ltr","cost":18.00}]'::jsonb),
('REQ-002', 'REQ-0002', 'Restaurant', 'Chef Marco', '2026-06-05', 'High', 'Approved', '[{"itemId":"I-001","name":"Fresh Organic Tomatoes","requestedQty":50,"issuedQty":0,"unit":"kg","cost":12.50},{"itemId":"I-012","name":"Ethiopian Coffee Beans 1kg","requestedQty":5,"issuedQty":0,"unit":"kg","cost":35.00}]'::jsonb),
('REQ-003', 'REQ-0003', 'Engineering', 'Tom Bradley', '2026-06-08', 'Urgent', 'Pending', '[{"itemId":"I-006","name":"LED Bulb 9W","requestedQty":20,"issuedQty":0,"unit":"pcs","cost":8.50},{"itemId":"I-015","name":"Air Filter 16x25x1","requestedQty":10,"issuedQty":0,"unit":"pcs","cost":22.00}]'::jsonb),
('REQ-004', 'REQ-0004', 'Front Office', 'Sarah Lee', '2026-06-10', 'Normal', 'Received', '[{"itemId":"I-003","name":"Mineral Water 500ml","requestedQty":100,"issuedQty":100,"unit":"pcs","cost":3.50}]'::jsonb)
on conflict (id) do nothing;

-- Stock Movements
insert into inventory_stock_movements (id, date, item_id, item_name, type, quantity, cost, reference, "user", store_from, store_to) values
('M-001', '2026-06-01', 'I-001', 'Fresh Organic Tomatoes', 'Purchase', 120, 12.50, 'GRN-0001', 'John Storekeeper', null, 'Central Warehouse'),
('M-002', '2026-06-01', 'I-004', 'Luxury Shampoo 30ml', 'Purchase', 500, 1.20, 'GRN-0001', 'John Storekeeper', null, 'Housekeeping Central'),
('M-003', '2026-06-02', 'I-004', 'Luxury Shampoo 30ml', 'Issue', -200, 1.20, 'REQ-0001', 'Alice Johnson', 'Housekeeping Central', null),
('M-004', '2026-06-03', 'I-006', 'LED Bulb 9W', 'Purchase', 50, 8.50, 'GRN-0002', 'John Storekeeper', null, 'Engineering Plant Store'),
('M-005', '2026-06-04', 'I-003', 'Mineral Water 500ml', 'Transfer', -50, 3.50, 'ST-TX-001', 'Tom Bradley', 'Bar Store', 'Restaurant Store'),
('M-006', '2026-06-04', 'I-003', 'Mineral Water 500ml', 'Transfer', 50, 3.50, 'ST-TX-001', 'Tom Bradley', 'Bar Store', 'Restaurant Store'),
('M-007', '2026-06-05', 'I-012', 'Ethiopian Coffee Beans 1kg', 'Adjustment', -2, 35.00, 'ADJ-001', 'System', 'Restaurant Store', null),
('M-008', '2026-06-06', 'I-010', 'Hotel Branded Mug', 'Damage', -3, 8.00, 'DMG-001', 'Gift Shop Supervisor', 'Gift Store', null),
('M-009', '2026-06-07', 'I-002', 'Chicken Breast Fillet', 'Purchase', 40, 45.00, 'GRN-0003', 'John Storekeeper', null, 'Central Warehouse')
on conflict (id) do nothing;

-- Goods Received Notes (GRNs)
insert into inventory_grns (id, number, supplier_id, supplier_name, purchase_order_id, delivery_note, invoice_number, received_date, receiver, items, total_value) values
('GRN-001', 'GRN-2026-0001', 'S-001', 'Global Foods Ltd', 'PO-5023', 'DN-12345', 'INV-4001', '2026-06-01', 'John Storekeeper',
'[{"itemId":"I-001","name":"Fresh Organic Tomatoes","receivedQty":120,"unitCost":12.50,"batchNumber":"B-105","expiryDate":"2027-04-15"},{"itemId":"I-004","name":"Luxury Shampoo 30ml","receivedQty":500,"unitCost":1.20,"batchNumber":"B-203","expiryDate":"2028-01-01"}]'::jsonb, 2100.00),
('GRN-002', 'GRN-2026-0002', 'S-005', 'Technical Maintenance Parts', 'PO-5024', 'DN-12346', 'INV-4002', '2026-06-03', 'John Storekeeper',
'[{"itemId":"I-006","name":"LED Bulb 9W","receivedQty":50,"unitCost":8.50,"batchNumber":"B-301","expiryDate":"2030-12-31"},{"itemId":"I-015","name":"Air Filter 16x25x1","receivedQty":10,"unitCost":22.00,"batchNumber":"B-302","expiryDate":"2030-12-31"}]'::jsonb, 645.00),
('GRN-003', 'GRN-2026-0003', 'S-003', 'Prime Meats & Poultry', 'PO-5025', 'DN-12347', 'INV-4003', '2026-06-07', 'John Storekeeper',
'[{"itemId":"I-002","name":"Chicken Breast Fillet","receivedQty":40,"unitCost":45.00,"batchNumber":"B-401","expiryDate":"2026-06-14"}]'::jsonb, 1800.00)
on conflict (id) do nothing;

-- END: 005_seed_inventory_demo_data.sql

-- =========================================================================
-- Migration: 006_seed_system_users.sql
-- =========================================================================
-- Seed preset system users for development / demo access
-- Password for all seeded accounts: admin123
-- Run this in your Supabase SQL Editor if the app is in database auth mode.

INSERT INTO system_users (
  id, name, email, role, role_description, avatar_initials,
  status, password_hash, force_password_change, created_at, updated_at
) VALUES
  ('U-101', 'Front Office Supervisor', 'frontoffice@erp.com', 'frontoffice', 'Night Auditor', 'FO', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-102', 'Housekeeping Manager', 'housekeeping@erp.com', 'housekeeping', 'HK Supervisor', 'HK', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-103', 'F&B Director', 'fb@erp.com', 'f&b', 'Culinary Director', 'FB', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-104', 'Chief Engineer', 'maintenance@erp.com', 'maintenance', 'Chief Engineer', 'CE', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-105', 'General Manager', 'gm@erp.com', 'executive', 'General Manager', 'GM', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-106', 'Finance Controller', 'finance@erp.com', 'finance', 'Finance Controller', 'FC', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-107', 'HR Manager', 'hr@erp.com', 'hr', 'HR Manager', 'HR', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-108', 'Inventory Manager', 'inventory@erp.com', 'inventory', 'Stores Manager', 'IM', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-109', 'Procurement Lead', 'procurement@erp.com', 'procurement', 'Procurement Lead', 'PL', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now()),
  ('U-110', 'System Administrator', 'admin@erp.com', 'executive', 'System Administrator', 'SA', 'Active', '$2b$10$hiMHxz3ZXzjNGZAVrIlWIO1lY2yoXZZ1bswVggEtOd5BaKZTrGi0.', true, now(), now())
ON CONFLICT (email) DO NOTHING;

-- Restrict System Administrator to Admin portal only
UPDATE system_users
SET allowed_tabs = '{"admin", "settings"}'::text[]
WHERE email = 'admin@erp.com';

-- END: 006_seed_system_users.sql

-- =========================================================================
-- Migration: 007_add_permission_matrix.sql
-- =========================================================================
-- Add permission_matrix JSONB column to system_users for granular RBAC
alter table system_users add column if not exists permission_matrix jsonb not null default '{}'::jsonb;

-- END: 007_add_permission_matrix.sql

-- =========================================================================
-- Migration: 008_security_enhancements.sql
-- =========================================================================
-- Security enhancements: account lockout, forced password change, reset tokens, RLS
alter table if exists system_users
  add column if not exists force_password_change boolean not null default false,
  add column if not exists password_reset_token text,
  add column if not exists password_reset_expires timestamp with time zone;

-- Enable RLS on sensitive admin tables
alter table if exists system_users enable row level security;
alter table if exists custom_roles enable row level security;
alter table if exists global_settings enable row level security;
alter table if exists audit_events enable row level security;

-- Drop any existing anon/policy rules so we can recreate cleanly
-- (safe to re-run)
drop policy if exists system_users_anon_all on system_users;
drop policy if exists custom_roles_anon_all on custom_roles;
drop policy if exists global_settings_anon_all on global_settings;
drop policy if exists audit_events_anon_all on audit_events;

-- system_users: anon key can only SELECT (server handles writes via service role)
create policy if not exists system_users_anon_select
  on system_users for select
  to anon
  using (true);

-- custom_roles: anon key can only SELECT
create policy if not exists custom_roles_anon_select
  on custom_roles for select
  to anon
  using (true);

-- global_settings: anon key can only SELECT
create policy if not exists global_settings_anon_select
  on global_settings for select
  to anon
  using (true);

-- audit_events: anon key can only SELECT
create policy if not exists audit_events_anon_select
  on audit_events for select
  to anon
  using (true);

-- END: 008_security_enhancements.sql

-- =========================================================================
-- Migration: 009_add_module_toggles.sql
-- =========================================================================
-- Migration: Add module_toggles and missing settings columns to global_settings
-- This ensures all GlobalHotelSettings fields have corresponding DB columns.

alter table global_settings add column if not exists module_toggles jsonb not null default '{}'::jsonb;
alter table global_settings add column if not exists hero_image_url text;
alter table global_settings add column if not exists contact_phone text;
alter table global_settings add column if not exists public_tagline text;
alter table global_settings add column if not exists social_links jsonb not null default '[]'::jsonb;
alter table global_settings add column if not exists force_mfa boolean not null default false;
alter table global_settings add column if not exists strict_password_rotation boolean not null default false;
alter table global_settings add column if not exists biometric_reauth boolean not null default false;
alter table global_settings add column if not exists maintenance_message text;
alter table global_settings add column if not exists public_booking_enabled boolean not null default true;
alter table global_settings add column if not exists guest_portal_enabled boolean not null default true;
alter table global_settings add column if not exists vip_spend_threshold numeric not null default 0.00;
alter table global_settings add column if not exists public_page_content jsonb not null default '{}'::jsonb;

comment on column global_settings.module_toggles is 'JSONB map of admin/department module toggle keys to boolean enabled state.';

-- END: 009_add_module_toggles.sql

-- =========================================================================
-- Migration: 010_add_allowed_ips.sql
-- =========================================================================
-- Migration: Add allowed_ips column to global_settings
-- This column is referenced in server.ts KNOWN_GLOBAL_SETTINGS_COLUMNS but was missing from previous migrations

alter table global_settings add column if not exists allowed_ips text[] not null default '{}'::text[];

comment on column global_settings.allowed_ips is 'Array of allowed IP addresses for system access control';

-- END: 010_add_allowed_ips.sql

-- =========================================================================
-- Migration: 011_add_api_integrations.sql
-- =========================================================================
-- Add api_integrations column to global_settings table
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS api_integrations jsonb not null default '[]'::jsonb;

-- END: 011_add_api_integrations.sql

-- =========================================================================
-- Migration: 012_add_isolation_policy.sql
-- =========================================================================
-- Add isolation_policy column to global_settings table
-- Used for subsystem isolation/zero-trust security settings
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS isolation_policy jsonb not null default '{"finance": false, "hr": false, "executive": false, "dualSignature": false}'::jsonb;

-- END: 012_add_isolation_policy.sql

-- =========================================================================
-- Migration: 013_add_auto_night_audit_time.sql
-- =========================================================================
-- Add auto_night_audit_time column to global_settings table
-- Used for automatic night audit scheduling
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS auto_night_audit_time text;

-- END: 013_add_auto_night_audit_time.sql

-- =========================================================================
-- Migration: 014_add_backup_frequency.sql
-- =========================================================================
-- Add backup_frequency column to global_settings table
-- Used for backup scheduling (daily, weekly, manual)
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS backup_frequency text check (backup_frequency in ('daily', 'weekly', 'manual'));

-- END: 014_add_backup_frequency.sql

-- =========================================================================
-- Migration: 015_add_system_log_level.sql
-- =========================================================================
-- Add system_log_level column to global_settings table
-- Used for system logging verbosity (info, detailed, debug)
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS system_log_level text check (system_log_level in ('info', 'detailed', 'debug'));

-- END: 015_add_system_log_level.sql

-- =========================================================================
-- Migration: 016_comprehensive_global_settings_columns.sql
-- =========================================================================
-- Comprehensive migration to add ALL missing columns to global_settings table
-- This ensures the database is fully aligned with schema.sql

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS social_links jsonb not null default '[]'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS invoice_template text default 'modern';

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS invoice_footer_text text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS invoice_bank_details text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS payment_types text[] not null default '{"Cash", "Credit Card", "Mobile Money", "Bank Transfer"}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS addon_charges jsonb not null default '[]'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS pos_categories text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS pos_outlets text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS pos_printers text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS pos_outlet_categories jsonb not null default '{}'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS split_folio_rules jsonb not null default '[]'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS cancellation_grace_hours integer not null default 24;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS cancellation_penalty_percent numeric not null default 0.00;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS credit_limit_default numeric not null default 0.00;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS loyalty_points_per_dollar numeric not null default 1.0;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS loyalty_redemption_rate numeric not null default 0.01;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS vip_spend_threshold numeric not null default 0.00;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS auto_night_audit_time text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS operating_hours jsonb not null default '{}'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS revenue_mappings jsonb not null default '{}'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS room_types text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS room_features text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS guest_statuses text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS inventory_categories text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS inventory_locations text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS inventory_units text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS floors text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS departments text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS session_timeout integer;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS password_complexity text check (password_complexity in ('low', 'medium', 'high'));

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS maintenance_mode boolean not null default false;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS allowed_ips text[] not null default '{}'::text[];

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS backup_frequency text check (backup_frequency in ('daily', 'weekly', 'manual'));

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS system_log_level text check (system_log_level in ('info', 'detailed', 'debug'));

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS api_integrations jsonb not null default '[]'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS module_toggles jsonb not null default '{}'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS force_mfa boolean not null default false;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS strict_password_rotation boolean not null default false;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS biometric_reauth boolean not null default false;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS maintenance_message text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS public_booking_enabled boolean not null default true;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS guest_portal_enabled boolean not null default true;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS public_page_content jsonb not null default '{}'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS terms_adventure_liability text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS terms_waitlist_protocol text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS terms_conservation_devotion text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS terms_billing_cancellation text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS terms_wilderness_emergency text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS policy_sections jsonb not null default '[]'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS fee_components jsonb not null default '[]'::jsonb;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS isolation_policy jsonb not null default '{"finance": false, "hr": false, "executive": false, "dualSignature": false}'::jsonb;

-- Add audit columns for tracking changes
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS created_at timestamptz default now();

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS created_by text;

ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS updated_by text;

-- END: 016_comprehensive_global_settings_columns.sql

-- =========================================================================
-- Migration: 017_pending_admin_changes.sql
-- =========================================================================
-- Migration 017: Pending admin changes queue for Executive Governance approval workflow

CREATE TABLE IF NOT EXISTS pending_admin_changes (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  change_type TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_by TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Pending',
  payload     JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pending_admin_changes_status ON pending_admin_changes (status);

-- END: 017_pending_admin_changes.sql

-- =========================================================================
-- Migration: 018_risk_compliance.sql
-- =========================================================================
-- Risk & Compliance Management Table
create table if not exists risk_compliance (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  category text not null check (category in ('Compliance', 'Legal', 'Financial', 'Safety', 'Operational')),
  status text not null check (status in ('Good', 'Warning', 'Critical', 'Expired')),
  expiry_date date,
  owner text not null,
  description text default '',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index for faster queries
create index if not exists idx_risk_compliance_status on risk_compliance(status);
create index if not exists idx_risk_compliance_expiry on risk_compliance(expiry_date);
create index if not exists idx_risk_compliance_category on risk_compliance(category);

-- Insert sample data
insert into risk_compliance (title, category, status, expiry_date, owner, description) values
  ('Fire Safety Certification', 'Safety', 'Warning', '2024-12-31', 'Engineering', 'Annual fire safety inspection and certification'),
  ('Liquor License Renewal', 'Legal', 'Warning', '2024-06-30', 'Executive', 'State liquor license renewal'),
  ('GDPR / Data Privacy Audit', 'Compliance', 'Good', '2024-11-05', 'Admin', 'Annual data privacy compliance audit'),
  ('Asset Insurance Policy', 'Financial', 'Good', '2025-01-15', 'Finance', 'Property and liability insurance coverage'),
  ('Health & Safety Inspection', 'Safety', 'Good', '2024-09-30', 'Engineering', 'Quarterly health and safety inspection'),
  ('Food Safety Certificate', 'Compliance', 'Good', '2024-08-15', 'F&B', 'Restaurant food handling certification'),
  ('Building Permit Renewal', 'Legal', 'Good', '2025-03-01', 'Engineering', 'Municipal building compliance'),
  ('Environmental Compliance', 'Compliance', 'Warning', '2024-07-31', 'Engineering', 'Waste management and environmental standards')
on conflict do nothing;

-- END: 018_risk_compliance.sql

-- =========================================================================
-- Migration: 019_public_page_editor.sql
-- =========================================================================
-- ============================================================
-- 019_public_page_editor.sql
-- Public Page Editor: pages, versions, blocks, templates, media,
-- policy metadata, legal review records, audit log
-- ============================================================

-- 1. Pages
CREATE TABLE IF NOT EXISTS pages (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id           TEXT NOT NULL DEFAULT 'single-property',
  slug                  TEXT NOT NULL,
  page_type             TEXT NOT NULL CHECK (page_type IN ('marketing','policy')),
  status                TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','in_review','published','archived')),
  published_version_id  TEXT,
  current_draft_id      TEXT,
  locale                TEXT NOT NULL DEFAULT 'en',
  seo_title             TEXT,
  seo_description       TEXT,
  seo_og_image_url      TEXT,
  seo_canonical_url     TEXT,
  structured_data       JSONB,
  scheduled_publish_at  TIMESTAMPTZ,
  scheduled_expire_at   TIMESTAMPTZ,
  created_by            TEXT NOT NULL,
  updated_by            TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, slug, locale)
);

CREATE INDEX IF NOT EXISTS idx_pages_property_id ON pages(property_id);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_page_type ON pages(page_type);

-- 2. Page Versions (immutable snapshots)
CREATE TABLE IF NOT EXISTS page_versions (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_id         TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  version_number  INT NOT NULL,
  block_tree      JSONB NOT NULL,
  change_summary  TEXT,
  created_by      TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);

-- Prevent direct updates/deletes to version records (enforce immutability)
CREATE OR REPLACE FUNCTION prevent_version_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Page version records are immutable and cannot be modified or deleted.';
END;
$$;

CREATE TRIGGER trg_prevent_version_update
  BEFORE UPDATE ON page_versions
  FOR EACH ROW EXECUTE FUNCTION prevent_version_mutation();

CREATE TRIGGER trg_prevent_version_delete
  BEFORE DELETE ON page_versions
  FOR EACH ROW EXECUTE FUNCTION prevent_version_mutation();

-- 3. Blocks (live working state for current draft)
CREATE TABLE IF NOT EXISTS blocks (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_id     TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL DEFAULT 'single-property',
  block_type  TEXT NOT NULL CHECK (block_type IN (
    'hero','text_rich','image','gallery','room_card','offer_card',
    'testimonial','cta_button','video','map','embedded_form',
    'policy_clause','terms_table','last_updated_banner','jurisdiction_selector',
    'faq_accordion','divider','spacer'
  )),
  position    INT NOT NULL,
  config      JSONB NOT NULL DEFAULT '{}',
  is_dynamic  BOOLEAN NOT NULL DEFAULT false,
  template_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocks_page_id ON blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_blocks_page_position ON blocks(page_id, position);

-- 4. Block Templates
CREATE TABLE IF NOT EXISTS block_templates (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id   TEXT, -- NULL = system-wide template
  name          TEXT NOT NULL,
  block_type    TEXT NOT NULL,
  config        JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  is_system     BOOLEAN NOT NULL DEFAULT false,
  created_by    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_block_templates_property_id ON block_templates(property_id);

-- 5. Media Assets
CREATE TABLE IF NOT EXISTS media_assets (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id     TEXT NOT NULL DEFAULT 'single-property',
  filename        TEXT NOT NULL,
  mime_type       TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  width_px        INT,
  height_px       INT,
  cdn_url         TEXT NOT NULL,
  alt_text        TEXT,
  scan_status     TEXT NOT NULL DEFAULT 'pending'
                    CHECK (scan_status IN ('pending','clean','quarantined')),
  usage_refs      JSONB DEFAULT '[]',
  uploaded_by     TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_property_id ON media_assets(property_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_scan_status ON media_assets(scan_status);

-- 6. Policy Page Metadata
CREATE TABLE IF NOT EXISTS policy_page_metadata (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_id               TEXT NOT NULL UNIQUE REFERENCES pages(id) ON DELETE CASCADE,
  effective_date        DATE,
  requires_legal_review BOOLEAN NOT NULL DEFAULT true,
  legal_template_id     TEXT,
  jurisdiction_tags     TEXT[] DEFAULT '{}',
  last_approved_by      TEXT,
  last_approved_at      TIMESTAMPTZ,
  last_approved_version_id TEXT,
  change_log            JSONB DEFAULT '[]'
);

-- 7. Legal Page Templates (central corporate-approved base templates)
CREATE TABLE IF NOT EXISTS legal_page_templates (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  template_name   TEXT NOT NULL,
  jurisdiction    TEXT[] DEFAULT '{}',
  block_tree      JSONB NOT NULL,
  mandatory_block_ids TEXT[] DEFAULT '{}',
  approved_by     TEXT,
  approved_at     TIMESTAMPTZ,
  version         INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Legal Review Records (enforcement layer for policy publishing)
CREATE TABLE IF NOT EXISTS legal_review_records (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_id     TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  version_id  TEXT NOT NULL REFERENCES page_versions(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  decision    TEXT NOT NULL CHECK (decision IN ('approved','rejected')),
  comments    TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_id, version_id)
);

CREATE INDEX IF NOT EXISTS idx_legal_review_records_page_id ON legal_review_records(page_id);
CREATE INDEX IF NOT EXISTS idx_legal_review_records_version_id ON legal_review_records(version_id);

-- DB constraint: policy page cannot be published without approved legal review
CREATE OR REPLACE FUNCTION enforce_policy_page_legal_review()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'published' THEN
    IF (SELECT page_type FROM pages WHERE id = NEW.id) = 'policy' THEN
      IF NOT EXISTS (
        SELECT 1 FROM legal_review_records
        WHERE page_id = NEW.id
          AND version_id = NEW.published_version_id
          AND decision = 'approved'
      ) THEN
        RAISE EXCEPTION 'Policy pages require an approved legal_review_record before publishing';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_legal_review
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION enforce_policy_page_legal_review();

-- 9. Page Audit Log
CREATE TABLE IF NOT EXISTS page_audit_log (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_id       TEXT REFERENCES pages(id),
  property_id   TEXT NOT NULL DEFAULT 'single-property',
  actor_id      TEXT NOT NULL,
  action        TEXT NOT NULL,
  version_id    TEXT REFERENCES page_versions(id),
  before_state  JSONB,
  after_state   JSONB,
  diff          JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_audit_log_page_id ON page_audit_log(page_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_audit_log_property_id ON page_audit_log(property_id, created_at DESC);

-- Insert sample legal page template
INSERT INTO legal_page_templates (template_name, jurisdiction, block_tree, mandatory_block_ids, approved_by, approved_at)
VALUES (
  'Privacy Policy v1',
  ARRAY['ETH', 'EU-GDPR'],
  '[
    {"block_type":"policy_clause","position":1,"config":{"title":"Data Collection","content":"We collect..."}},
    {"block_type":"policy_clause","position":2,"config":{"title":"Data Usage","content":"We use your data to..."}},
    {"block_type":"policy_clause","position":3,"config":{"title":"Your Rights","content":"You have the right to..."}}
  ]',
  ARRAY['policy_clause'],
  'system',
  now()
) ON CONFLICT DO NOTHING;

-- Insert sample system block templates
INSERT INTO block_templates (property_id, name, block_type, config, is_system, created_by)
VALUES
  (NULL, 'Hero Banner - Default', 'hero', '{"title":"Welcome","subtitle":"Your perfect stay awaits","backgroundImage":""}', true, 'system'),
  (NULL, 'Room Card - Standard', 'room_card', '{"showPrice":true,"showAmenities":true}', true, 'system'),
  (NULL, 'CTA Button - Book Now', 'cta_button', '{"text":"Book Now","link":"/booking"}', true, 'system'),
  (NULL, 'Policy Clause - Standard', 'policy_clause', '{"title":"","content":""}', true, 'system')
ON CONFLICT DO NOTHING;

-- END: 019_public_page_editor.sql

-- =========================================================================
-- Migration: 020_page_editor_public_booking.sql
-- =========================================================================
-- ============================================================
-- 020_page_editor_public_booking.sql
-- Allow 'public_booking' page type and add preview link tokens
-- ============================================================

-- Relax page_type check constraint to include public_booking
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_page_type_check;
ALTER TABLE pages ADD CONSTRAINT pages_page_type_check
  CHECK (page_type IN ('marketing','policy','public_booking'));

-- Preview share links for stakeholder review
CREATE TABLE IF NOT EXISTS page_preview_links (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  page_id     TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  created_by  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_preview_links_token ON page_preview_links(token);
CREATE INDEX IF NOT EXISTS idx_page_preview_links_page_id ON page_preview_links(page_id);

-- END: 020_page_editor_public_booking.sql

-- =========================================================================
-- Migration: 021_page_editor_initial_data.sql
-- =========================================================================
-- ============================================================
-- 021_page_editor_initial_data.sql
-- Modern Booking Page with modular individual blocks
-- ============================================================

-- Add title column to pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS title TEXT;

-- Insert modern booking page
INSERT INTO pages (
  id, property_id, slug, page_type, status, locale,
  seo_title, seo_description, seo_og_image_url, seo_canonical_url,
  title, created_by, updated_by
) VALUES
  (
    'page-booking',
    'single-property',
    'booking',
    'public_booking',
    'published',
    'en',
    'Book Your Stay',
    'Online reservations for your perfect stay with modern booking experience',
    NULL,
    'https://example.com/booking',
    'Modern Booking Page',
    'system',
    'system'
  )
ON CONFLICT (property_id, slug, locale) DO NOTHING;

-- Delete old monolithic booking_engine block and any stale individual room cards
DELETE FROM blocks WHERE page_id = 'page-booking' AND block_type = 'booking_engine';
DELETE FROM blocks WHERE page_id = 'page-booking' AND block_type = 'booking_room_card' AND id IN ('block-booking-room-card-1', 'block-booking-room-card-2');

-- Insert modular blocks for the booking page (grid layout ready)
INSERT INTO blocks (id, page_id, property_id, block_type, position, config, is_dynamic, created_at, updated_at) VALUES
  (
    'block-booking-hero',
    'page-booking',
    'single-property',
    'booking_hero',
    0,
    '{
      "title": "",
      "subtitle": "",
      "badge": "Direct Booking",
      "imageUrl": "",
      "videoUrl": "",
      "overlay": true,
      "height": "400px",
      "overlayColor": "bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent",
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-filter-bar',
    'page-booking',
    'single-property',
    'booking_filter_bar',
    1,
    '{
      "showPromoCode": true,
      "primaryColor": "#4f46e5",
      "accentColor": "#f59e0b",
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-room-list',
    'page-booking',
    'single-property',
    'booking_room_card',
    2,
    '{
      "primaryColor": "#4f46e5",
      "accentColor": "#f59e0b",
      "amenitiesLabel": "Amenities",
      "soldOutLabel": "Sold Out",
      "availableLabel": "{count} rooms available",
      "perNightLabel": "/night",
      "noImageLabel": "No image",
      "addLabel": "+",
      "removeLabel": "-",
      "emptyLabel": "No rooms available for the selected dates.",
      "colSpan": 3,
      "rowSpan": 2
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-sidebar',
    'page-booking',
    'single-property',
    'booking_sidebar_section',
    3,
    '{
      "title": "Contact Us",
      "email": "",
      "phone": "",
      "address": "",
      "position": "right",
      "colSpan": 1,
      "rowSpan": 2
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-features',
    'page-booking',
    'single-property',
    'booking_features_section',
    4,
    '{
      "title": "Why Book Direct",
      "description": "Enjoy the best rates and perks.",
      "features": [],
      "columns": 4,
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-experience-section',
    'page-booking',
    'single-property',
    'booking_experience_section',
    5,
    '{
      "title": "Enhance Your Stay",
      "description": "Add experiences to your reservation.",
      "showSection": true,
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-testimonials-section',
    'page-booking',
    'single-property',
    'booking_testimonials_section',
    6,
    '{
      "title": "Guest Reviews",
      "testimonials": [],
      "showSection": true,
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-story-section',
    'page-booking',
    'single-property',
    'booking_story_section',
    7,
    '{
      "title": "Our Story",
      "text": "Experience the perfect blend of luxury and nature.",
      "stat1": "100+",
      "stat2": "5 Star",
      "stat1Label": "Rooms",
      "stat2Label": "Rating",
      "showSection": true,
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  ),
  (
    'block-booking-footer-section',
    'page-booking',
    'single-property',
    'booking_footer_section',
    8,
    '{
      "text": "Thank you for choosing our hotel.",
      "copyright": "Â© 2026 Gheralta. All rights reserved.",
      "links": [],
      "showSection": true,
      "primaryColor": "#4f46e5",
      "colSpan": 4,
      "rowSpan": 1
    }',
    false,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- END: 021_page_editor_initial_data.sql

-- =========================================================================
-- Migration: 022_booking_engine_block.sql
-- =========================================================================
-- ============================================================
-- 022_page_creator_block_types.sql
-- Allow the block types used by the LEGO-style page creator.
-- Note: The modern booking page setup is handled in 021_page_editor_initial_data.sql
-- ============================================================

-- Relax blocks.block_type check constraint to include all page creator blocks
ALTER TABLE blocks DROP CONSTRAINT IF EXISTS blocks_block_type_check;
ALTER TABLE blocks ADD CONSTRAINT blocks_block_type_check
  CHECK (block_type IN (
    'hero','text_rich','image','gallery','features','room_card','offer_card',
    'testimonial','cta_button','video','map','embedded_form',
    'policy_clause','terms_table','last_updated_banner','jurisdiction_selector',
    'faq_accordion','divider','spacer',
    'booking_hero','booking_room_card','booking_filter_bar',
    'booking_experience_section','booking_testimonials_section',
    'booking_story_section','booking_footer_section','booking_sidebar_section','booking_features_section'
  ));

-- Page and block seeding for modern booking page is handled in 021_page_editor_initial_data.sql
-- This migration only ensures the block type constraint is updated.

-- END: 022_booking_engine_block.sql

-- =========================================================================
-- Migration: 023_page_creator_new_blocks.sql
-- =========================================================================
-- ============================================================-- 023_page_creator_new_blocks.sql-- Add modern block types to the page creator block registry.-- ============================================================

ALTER TABLE blocks DROP CONSTRAINT IF EXISTS blocks_block_type_check;
ALTER TABLE blocks ADD CONSTRAINT blocks_block_type_check
  CHECK (block_type IN (
    'hero','text_rich','image','gallery','features','room_card','offer_card',
    'testimonial','cta_button','video','map','embedded_form',
    'policy_clause','terms_table','last_updated_banner','jurisdiction_selector',
    'faq_accordion','divider','spacer',
    'navigation','contact_form','newsletter','carousel','stats_counter','team_list','container',
    'booking_hero','booking_room_card','booking_filter_bar',
    'booking_experience_section','booking_testimonials_section',
    'booking_story_section','booking_footer_section','booking_sidebar_section','booking_features_section',
    'tabs','pricing_table','testimonial_slider','before_after','masonry_gallery','countdown_timer','scroll_reveal'
  ));

-- END: 023_page_creator_new_blocks.sql

-- =========================================================================
-- Migration: 024_public_testimonials.sql
-- =========================================================================
-- ============================================================
-- 024_public_testimonials.sql
-- Guest testimonials submitted through the public booking portal.
-- ============================================================

CREATE TABLE IF NOT EXISTS public_testimonials (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id   TEXT NOT NULL DEFAULT 'single-property',
  guest_name    TEXT NOT NULL,
  location      TEXT,
  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL,
  stay_date     TEXT,
  room_type     TEXT,
  avatar_url    TEXT,
  status        TEXT NOT NULL DEFAULT 'approved'
                  CHECK (status IN ('pending','approved','rejected')),
  source        TEXT NOT NULL DEFAULT 'public_portal'
                  CHECK (source IN ('public_portal','imported','manager')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_public_testimonials_property_id ON public_testimonials(property_id);
CREATE INDEX IF NOT EXISTS idx_public_testimonials_status ON public_testimonials(status);
CREATE INDEX IF NOT EXISTS idx_public_testimonials_created_at ON public_testimonials(created_at DESC);

-- Seed a few demo testimonials so the public portal is never empty on first run.
INSERT INTO public_testimonials (
  id, property_id, guest_name, location, rating, comment, stay_date, room_type, avatar_url, status, source
) VALUES
  (
    'tstm-demo-1',
    'single-property',
    'Eleanor Vance',
    'London, UK',
    5,
    'Our stay was absolutely pristine. The penthouse exceeded all expectations. The hospitality is unmatched.',
    'May 2026',
    'Penthouse',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    'approved',
    'imported'
  ),
  (
    'tstm-demo-2',
    'single-property',
    'Dr. Marcus Sterling',
    'Boston, USA',
    5,
    'I travel extensively for business and expect perfection. The resort combines breathtaking design with personalized service.',
    'June 2026',
    'Suite',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    'approved',
    'imported'
  ),
  (
    'tstm-demo-3',
    'single-property',
    'The Sato Family',
    'Tokyo, Japan',
    5,
    'Traveling with children can be demanding, but the family villa was fantastic. The kids were occupied while we fully relaxed.',
    'April 2026',
    'Family',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    'approved',
    'imported'
  ),
  (
    'tstm-demo-4',
    'single-property',
    'Chloe & Nathan Davis',
    'Sydney, Australia',
    5,
    'We spent our honeymoon in the Deluxe Room and were blown away. Falling asleep to the ocean sound was magic.',
    'June 2026',
    'Deluxe',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    'approved',
    'imported'
  )
ON CONFLICT (id) DO NOTHING;

-- END: 024_public_testimonials.sql

-- =========================================================================
-- Migration: 025_booking_page_blocks.sql
-- =========================================================================
-- ============================================================
-- 025_booking_page_blocks.sql
-- Add booking-specific block types and seed default booking page
-- ============================================================

-- 1. Add booking-specific block types to the blocks table check constraint
-- First, we need to drop the existing check constraint and recreate it with the new types
ALTER TABLE blocks DROP CONSTRAINT IF EXISTS blocks_block_type_check;

-- Before adding the new constraint, update any existing rows with invalid block types
-- to valid ones or delete them to avoid constraint violations
UPDATE blocks SET block_type = 'hero' WHERE block_type NOT IN (
  'hero','text_rich','image','gallery','room_card','offer_card',
  'testimonial','cta_button','video','map','embedded_form',
  'policy_clause','terms_table','last_updated_banner','jurisdiction_selector',
  'faq_accordion','divider','spacer',
  'booking_hero','booking_filter_bar','booking_room_card',
  'booking_experience_section','booking_testimonials_section',
  'booking_story_section','booking_features_section',
  'booking_footer_section','booking_sidebar_section'
);

-- Now add the new constraint
ALTER TABLE blocks
  ADD CONSTRAINT blocks_block_type_check
  CHECK (block_type IN (
    'hero','text_rich','image','gallery','room_card','offer_card',
    'testimonial','cta_button','video','map','embedded_form',
    'policy_clause','terms_table','last_updated_banner','jurisdiction_selector',
    'faq_accordion','divider','spacer',
    'booking_hero','booking_filter_bar','booking_room_card',
    'booking_experience_section','booking_testimonials_section',
    'booking_story_section','booking_features_section',
    'booking_footer_section','booking_sidebar_section'
  ));

-- 2. Create the default booking page
-- Use upsert to ensure the page exists
INSERT INTO pages (
  id,
  property_id,
  slug,
  page_type,
  status,
  locale,
  seo_title,
  seo_description,
  created_by,
  updated_by
) VALUES (
  'default-booking-page',
  'single-property',
  'booking',
  'marketing',
  'published',
  'en',
  'Book Your Stay - Grand Vista Resort',
  'Reserve your luxury escape at Grand Vista Resort. Choose from our sanctuary suites and bespoke experiences.',
  'system',
  'system'
) ON CONFLICT (property_id, slug, locale) DO UPDATE SET
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  updated_by = EXCLUDED.updated_by,
  updated_at = now();

-- 3. Create initial page version only if the page exists
INSERT INTO page_versions (
  id,
  page_id,
  version_number,
  block_tree,
  change_summary,
  created_by
) SELECT
  'booking-page-v1',
  'default-booking-page',
  1,
  '[]'::jsonb,
  'Initial booking page version',
  'system'
WHERE EXISTS (SELECT 1 FROM pages WHERE id = 'default-booking-page')
ON CONFLICT (page_id, version_number) DO NOTHING;

-- 4. Update the page to reference the published version
UPDATE pages
SET published_version_id = 'booking-page-v1',
    current_draft_id = 'booking-page-v1'
WHERE id = 'default-booking-page' AND EXISTS (SELECT 1 FROM page_versions WHERE id = 'booking-page-v1');

-- 5. Insert default blocks for the booking page
-- Note: These blocks will be rendered by PublicBlockRenderer
-- Only insert if the page exists

-- Helper function to insert block if page exists
DO $$
DECLARE
  page_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM pages WHERE id = 'default-booking-page') INTO page_exists;

  IF page_exists THEN
    -- Hero Section
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_hero',
      0,
      '{
        "imageUrl": "",
        "title": "Where the Sea Greets the Horizon",
        "tagline": "Unmatched Ocean Luxury",
        "address": "Via Cristoforo Colombo, 84017 Positano SA, Italy"
      }'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Filter Bar
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_filter_bar',
      1,
      '{}'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Room Cards
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_room_card',
      2,
      '{
        "title": "Our Sanctuary Suites",
        "subtitle": "Choose your perfect escape"
      }'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Experience Section
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_experience_section',
      3,
      '{
        "title": "Epic Mountain Experiences",
        "description": "Curated packages for unforgettable stays"
      }'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Story Section
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_story_section',
      4,
      '{
        "title": "Our Story",
        "description": "Experience the perfect blend of luxury and nature.",
        "stat1": "100+ Rooms",
        "stat1Label": "Capacity",
        "stat2": "5 Star Rating",
        "stat2Label": "Quality",
        "text": "Experience the perfect blend of luxury and nature. Tucked away on rugged cliffs overlooking pristine waters, Grand Vista Resort brings bespoke hospitality, award-winning spa treatments, and Michelin-star culinary secrets together into a seamless private escape."
      }'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Features Section
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_features_section',
      5,
      '{
        "title": "Why Book Direct",
        "description": "Enjoy the best rates and perks."
      }'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Testimonials Section
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_testimonials_section',
      6,
      '{
        "title": "Verified Guest Remarks"
      }'::jsonb
    ) ON CONFLICT DO NOTHING;

    -- Footer
    INSERT INTO blocks (id, page_id, property_id, block_type, position, config)
    VALUES (
      gen_random_uuid()::text,
      'default-booking-page',
      'single-property',
      'booking_footer_section',
      7,
      '{}'::jsonb
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- END: 025_booking_page_blocks.sql

-- =========================================================================
-- Migration: 026_public_portal_rls.sql
-- =========================================================================
-- ============================================================
-- 026_public_portal_rls.sql
-- Add RLS policies for public portal access to pages and blocks
-- ============================================================

-- Enable RLS on pages table (if not already enabled)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to published pages
CREATE POLICY "Allow public read access to published pages"
ON pages FOR SELECT
USING (status = 'published');

-- Policy: Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access to pages"
ON pages FOR ALL
USING (auth.role() = 'service_role');

-- Enable RLS on blocks table (if not already enabled)
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to blocks from published pages
CREATE POLICY "Allow public read access to blocks from published pages"
ON blocks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pages
    WHERE pages.id = blocks.page_id
    AND pages.status = 'published'
  )
);

-- Policy: Allow service role full access to blocks
CREATE POLICY "Allow service role full access to blocks"
ON blocks FOR ALL
USING (auth.role() = 'service_role');

-- Enable RLS on page_versions table (if not already enabled)
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to published versions
CREATE POLICY "Allow public read access to published page versions"
ON page_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pages
    WHERE pages.published_version_id = page_versions.id
    AND pages.status = 'published'
  )
);

-- Policy: Allow service role full access to page_versions
CREATE POLICY "Allow service role full access to page_versions"
ON page_versions FOR ALL
USING (auth.role() = 'service_role');

-- Enable RLS on testimonials table (if not already enabled)
ALTER TABLE public_testimonials ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to approved testimonials
CREATE POLICY "Allow public read access to approved testimonials"
ON public_testimonials FOR SELECT
USING (status = 'approved');

-- Policy: Allow authenticated users to insert testimonials
CREATE POLICY "Allow authenticated users to insert testimonials"
ON public_testimonials FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow service role full access to testimonials
CREATE POLICY "Allow service role full access to testimonials"
ON public_testimonials FOR ALL
USING (auth.role() = 'service_role');

-- END: 026_public_portal_rls.sql

-- =========================================================================
-- Migration: 027_add_booking_terms.sql
-- =========================================================================
-- Add booking_terms column to global_settings for public booking terms and conditions

alter table global_settings add column if not exists booking_terms text default '';

-- END: 027_add_booking_terms.sql

-- =========================================================================
-- Migration: 028_fix_admin_role.sql
-- =========================================================================
-- Fix admin user role from 'executive' to 'admin' and restrict access
UPDATE system_users 
SET role = 'admin', allowed_tabs = '{"admin", "settings"}'::text[]
WHERE email = 'admin@erp.com';

-- END: 028_fix_admin_role.sql

-- =========================================================================
-- Migration: 029_room_types_enhancement.sql
-- =========================================================================
-- Room Types Enhancement Migration
-- Adds room_types table with descriptions, amenities, images, and base price
-- Links rooms to room_types for better inventory management

-- Create room_types table
create table if not exists room_types (
  id text primary key,
  name text not null unique,
  description text,
  base_price numeric not null default 0.00,
  max_occupancy integer not null default 2,
  bed_configuration text,
  room_size_sqm integer,
  amenities text[] not null default '{}'::text[],
  image_url_1 text,
  image_url_2 text,
  image_url_3 text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Add room_type_id foreign key to rooms table
alter table rooms 
add column if not exists room_type_id text references room_types(id) on delete set null;

-- Create index for faster queries
create index if not exists idx_rooms_room_type_id on rooms(room_type_id);
create index if not exists idx_room_types_active on room_types(is_active) where is_active = true;

-- Insert default room types with sample data
insert into room_types (id, name, description, base_price, max_occupancy, bed_configuration, room_size_sqm, amenities, image_url_1, image_url_2, image_url_3, display_order) values
(
  'rt_single',
  'Single Room',
  'Comfortable single room perfect for business travelers. Features a cozy workspace and modern amenities.',
  89.00,
  1,
  '1 Queen Bed',
  26,
  ARRAY['Free WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Daily Housekeeping'],
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
  1
),
(
  'rt_double',
  'Double Room',
  'Spacious double room ideal for couples or friends. Offers comfortable bedding and city views.',
  129.00,
  2,
  '1 King Bed or 2 Queen Beds',
  33,
  ARRAY['Free WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Daily Housekeeping', 'City View'],
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
  2
),
(
  'rt_suite',
  'Suite',
  'Luxurious suite with separate living area. Perfect for extended stays and special occasions.',
  199.00,
  3,
  '1 King Bed + Sofa Bed',
  51,
  ARRAY['Free WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Daily Housekeeping', 'City View', 'Living Room', 'Dining Table', 'Bathtub', 'Robes'],
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
  3
),
(
  'rt_deluxe',
  'Deluxe Room',
  'Premium deluxe room with enhanced amenities and stunning views. Features premium bedding and upgraded bath products.',
  159.00,
  2,
  '1 King Bed',
  39,
  ARRAY['Free WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Daily Housekeeping', 'Ocean View', 'Premium Bath Products', 'Turndown Service'],
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
  4
),
(
  'rt_penthouse',
  'Penthouse',
  'Exclusive penthouse suite with panoramic views, private terrace, and full luxury amenities. The ultimate accommodation experience.',
  499.00,
  4,
  '1 King Bed + 2 Queen Beds',
  111,
  ARRAY['Free WiFi', 'Multiple Smart TVs', 'Work Desk', 'Air Conditioning', 'Fully Stocked Mini Bar', 'Premium Coffee Maker', 'Safe', 'Daily Housekeeping', 'Panoramic View', 'Living Room', 'Dining Room', 'Private Terrace', 'Jacuzzi', 'Steam Room', 'Butler Service', 'Private Check-in', 'Airport Transfer'],
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
  5
)
on conflict (id) do nothing;

-- Update existing rooms to link to room types based on their type field
update rooms 
set room_type_id = 'rt_single' 
where type = 'Single' and room_type_id is null;

update rooms 
set room_type_id = 'rt_double' 
where type = 'Double' and room_type_id is null;

update rooms 
set room_type_id = 'rt_suite' 
where type = 'Suite' and room_type_id is null;

update rooms 
set room_type_id = 'rt_deluxe' 
where type = 'Deluxe' and room_type_id is null;

update rooms 
set room_type_id = 'rt_penthouse' 
where type = 'Penthouse' and room_type_id is null;

-- Add comment for documentation
comment on table room_types is 'Room type definitions with descriptions, amenities, images, and pricing';
comment on column room_types.amenities is 'Array of amenities available in this room type';
comment on column room_types.image_url_1 is 'Primary room type image';
comment on column room_types.image_url_2 is 'Secondary room type image';
comment on column room_types.image_url_3 is 'Tertiary room type image';
comment on column room_types.base_price is 'Default base price for this room type';

-- END: 029_room_types_enhancement.sql

-- =========================================================================
-- Migration: 030_add_room_type_id_to_reservations.sql
-- =========================================================================
-- Add room_type_id to reservations table for alignment with room_types schema
-- This allows reservations to reference the room_types table directly

-- Add room_type_id column to reservations table
alter table reservations
add column if not exists room_type_id text references room_types(id) on delete set null;

-- Create index for faster queries
create index if not exists idx_reservations_room_type_id on reservations(room_type_id);

-- Update existing reservations to link to room types based on room_type field
update reservations 
set room_type_id = (
  select id from room_types 
  where lower(name) = lower(reservations.room_type) 
  limit 1
)
where room_type_id is null and room_type is not null;

-- Add comment for documentation
comment on column reservations.room_type_id is 'Foreign key reference to room_types table for enhanced room type management';

-- END: 030_add_room_type_id_to_reservations.sql

-- =========================================================================
-- Migration: 031_yield_policies.sql
-- =========================================================================
-- Drop existing yield_policies table if it exists with different structure
DROP TABLE IF EXISTS yield_policies CASCADE;

-- Create yield policies table
CREATE TABLE yield_policies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_yield_policies_default ON yield_policies(is_default) WHERE is_default = TRUE;

-- Insert default yield policies
INSERT INTO yield_policies (id, name, description, multiplier, is_default) VALUES
  ('yield_1', 'Standard Rate', 'Default standard rate multiplier', 1.0, TRUE),
  ('yield_2', 'Peak Season', 'High demand period multiplier', 1.3, FALSE),
  ('yield_3', 'Low Season', 'Low demand period multiplier', 0.8, FALSE),
  ('yield_4', 'Weekend Premium', 'Weekend rate multiplier', 1.15, FALSE),
  ('yield_5', 'Last Minute', 'Urgent booking discount', 0.9, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_yield_policies_updated_at
  BEFORE UPDATE ON yield_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- END: 031_yield_policies.sql

-- =========================================================================
-- Migration: 032_rate_plans.sql
-- =========================================================================
-- Drop existing rate_plans table if it exists with different structure
DROP TABLE IF EXISTS rate_plans CASCADE;

-- Create rate plans table
CREATE TABLE rate_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_modifier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  base_rate DECIMAL(10,2) DEFAULT 100.00,
  min_stay INTEGER DEFAULT 1,
  max_stay INTEGER DEFAULT 30,
  cancellation_policy TEXT DEFAULT '24h',
  applicable_room_types TEXT[],
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active rate plans
CREATE INDEX IF NOT EXISTS idx_rate_plans_active ON rate_plans(active) WHERE active = TRUE;

-- Insert default rate plans
INSERT INTO rate_plans (id, name, description, base_modifier, base_rate, min_stay, max_stay, cancellation_policy, active) VALUES
  ('rp_1', 'Standard Rate', 'Regular room rate', 1.0, 100.00, 1, 30, '24h', TRUE),
  ('rp_2', 'Extended Stay', 'Discount for longer stays', 0.85, 85.00, 7, 30, '48h', TRUE),
  ('rp_3', 'Last Minute Deal', 'Discount for same-day bookings', 0.7, 70.00, 1, 3, 'non-refundable', TRUE),
  ('rp_4', 'Premium Rate', 'Premium room rate with amenities', 1.25, 125.00, 1, 30, '24h', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_rate_plans_updated_at
  BEFORE UPDATE ON rate_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- END: 032_rate_plans.sql

-- =========================================================================
-- Migration: 033_seasons.sql
-- =========================================================================
-- Drop existing seasons table if it exists with different structure
DROP TABLE IF EXISTS seasons CASCADE;

-- Create seasons table
CREATE TABLE seasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_month INTEGER NOT NULL CHECK (start_month >= 0 AND start_month <= 11),
  start_day INTEGER NOT NULL CHECK (start_day >= 1 AND start_day <= 31),
  end_month INTEGER NOT NULL CHECK (end_month >= 0 AND end_month <= 11),
  end_day INTEGER NOT NULL CHECK (end_day >= 1 AND end_day <= 31),
  multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default seasons
INSERT INTO seasons (id, name, start_month, start_day, end_month, end_day, multiplier) VALUES
  ('season_1', 'Summer Peak', 5, 15, 8, 31, 1.3),
  ('season_2', 'Winter Holiday', 11, 20, 0, 10, 1.4),
  ('season_3', 'Spring Shoulder', 2, 15, 5, 14, 1.0),
  ('season_4', 'Autumn Shoulder', 9, 1, 11, 19, 0.95),
  ('season_5', 'Low Season', 0, 11, 2, 14, 0.8)
ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_seasons_updated_at
  BEFORE UPDATE ON seasons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- END: 033_seasons.sql

-- =========================================================================
-- Migration: 034_packages.sql
-- =========================================================================
-- Drop existing packages table if it exists with different structure
DROP TABLE IF EXISTS packages CASCADE;

-- Create packages table
CREATE TABLE packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  type TEXT NOT NULL DEFAULT 'special_occasion',
  charge_frequency TEXT DEFAULT 'once' CHECK (charge_frequency IN ('once', 'daily')),
  applicable_room_types TEXT[],
  amenities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for package types
CREATE INDEX IF NOT EXISTS idx_packages_type ON packages(type);

-- Insert default packages
INSERT INTO packages (id, name, description, price, type, charge_frequency, amenities) VALUES
  ('pkg_1', 'Birthday Package', 'Celebrate with champagne, cake, and decorations', 150.00, 'special_occasion', 'once', ARRAY['Champagne', 'Birthday Cake', 'Decorations', 'Late Checkout']),
  ('pkg_2', 'Honeymoon Package', 'Romantic getaway with special amenities', 299.00, 'romance', 'once', ARRAY['Champagne', 'Rose Petals', 'Spa Treatment', 'Late Checkout', 'Romantic Dinner']),
  ('pkg_3', 'Geralta Mountain Hiking', 'Guided hiking tour with equipment', 250.00, 'adventure', 'once', ARRAY['Guide Service', 'Equipment Rental', 'Packed Lunch', 'Transportation']),
  ('pkg_4', 'Wellness Package', 'Complete spa and wellness experience', 200.00, 'wellness', 'once', ARRAY['Spa Treatment', 'Massage', 'Healthy Meals', 'Yoga Session']),
  ('pkg_5', 'Business Package', 'Complete business traveler amenities', 175.00, 'business', 'once', ARRAY['High-Speed Internet', 'Meeting Room Access', 'Business Center', 'Airport Transfer'])
ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- END: 034_packages.sql

-- =========================================================================
-- Migration: 035_guest_services.sql
-- =========================================================================
-- Drop existing guest_services table if it exists with different structure
DROP TABLE IF EXISTS guest_services CASCADE;

-- Create guest services table
CREATE TABLE guest_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'dining' CHECK (category IN ('dining', 'transportation', 'laundry', 'spa', 'room_service', 'concierge')),
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for available services
CREATE INDEX IF NOT EXISTS idx_guest_services_available ON guest_services(available) WHERE available = TRUE;
CREATE INDEX IF NOT EXISTS idx_guest_services_category ON guest_services(category);

-- Insert default guest services
INSERT INTO guest_services (id, name, description, category, price, available) VALUES
  ('gs_1', 'Lunch', 'Daily lunch service with local and international cuisine', 'dining', 25.00, TRUE),
  ('gs_2', 'Dinner', 'Dinner service featuring gourmet dishes and local specialties', 'dining', 35.00, TRUE),
  ('gs_3', 'Airport Shuttle', '24/7 airport transfer service to and from Geralta Airport', 'transportation', 50.00, TRUE),
  ('gs_4', 'Laundry Service', 'Same-day laundry and dry cleaning service', 'laundry', 20.00, TRUE),
  ('gs_5', 'Spa Treatment', 'Full spa treatment with massage and wellness services', 'spa', 80.00, TRUE),
  ('gs_6', 'Room Service', '24/7 in-room dining service', 'room_service', 15.00, TRUE),
  ('gs_7', 'Concierge', 'Personal concierge assistance for tours and activities', 'concierge', 30.00, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_guest_services_updated_at
  BEFORE UPDATE ON guest_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- END: 035_guest_services.sql

-- =========================================================================
-- Migration: 036_add_missing_executive_columns.sql
-- =========================================================================
-- Add missing columns for Executive Portal Business Admin
-- These columns are needed to save all changes made by the executive portal

-- Add hotel_logo column (missing from schema)
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS hotel_logo text;

-- Add contact_email column (needed for public booking API)
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS contact_email text;

-- Add check_in_time and check_out_time columns
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS check_in_time text default '02:00 PM';
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS check_out_time text default '10:00 AM';

-- Add star_rating column for hotel brand rating
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS star_rating text default '5';

-- Update hero_image_url to use public URL instead of local path
UPDATE global_settings 
SET hero_image_url = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1920'
WHERE hero_image_url LIKE '/src/%' OR hero_image_url IS NULL;

-- Set default contact email if empty
UPDATE global_settings 
SET contact_email = 'info@gheralta-lodge.com'
WHERE contact_email IS NULL OR contact_email = '';

-- Set default check-in and check-out times if empty
UPDATE global_settings 
SET check_in_time = '01:00 PM'
WHERE check_in_time IS NULL OR check_in_time = '';

UPDATE global_settings 
SET check_out_time = '10:00 AM'
WHERE check_out_time IS NULL OR check_out_time = '';

-- Set default star rating if empty
UPDATE global_settings 
SET star_rating = '5'
WHERE star_rating IS NULL OR star_rating = '';

-- Add comments for documentation
COMMENT ON COLUMN global_settings.hotel_logo IS 'Hotel logo URL for branding and invoices';
COMMENT ON COLUMN global_settings.contact_email IS 'Public contact email for booking inquiries';
COMMENT ON COLUMN global_settings.check_in_time IS 'Default check-in time for reservations';
COMMENT ON COLUMN global_settings.check_out_time IS 'Default check-out time for reservations';
COMMENT ON COLUMN global_settings.star_rating IS 'Hotel brand rating (3, 4, or 5 stars)';

-- END: 036_add_missing_executive_columns.sql

-- =========================================================================
-- Migration: 037_add_guest_services_to_public_booking.sql
-- =========================================================================
-- 037_add_guest_services_to_public_booking.sql
-- Add guest services price and revenue columns to reservations table for public booking tracking

-- Add guest_services_price column to track the total price of guest services for each booking
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS guest_services_price NUMERIC NOT NULL DEFAULT 0.00;

-- Add guest_services_revenue column to track the actual revenue from guest services for each booking
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS guest_services_revenue NUMERIC NOT NULL DEFAULT 0.00;

-- Add comment to explain the purpose of these columns
COMMENT ON COLUMN reservations.guest_services_price IS 'Total price of guest services selected for this booking (before discounts/taxes)';
COMMENT ON COLUMN reservations.guest_services_revenue IS 'Actual revenue earned from guest services for this booking (after discounts/taxes)';

-- Create index for querying bookings by guest services revenue
CREATE INDEX IF NOT EXISTS idx_reservations_guest_services_revenue ON reservations(guest_services_revenue);

-- END: 037_add_guest_services_to_public_booking.sql

-- =========================================================================
-- Migration: 038_drop_rooms_type_check.sql
-- =========================================================================
-- Drop the outdated rooms type check constraint
-- Room types are now managed dynamically through the room_types table,
-- and rooms are linked via room_type_id foreign key.

alter table rooms
  drop constraint if exists rooms_type_check;

-- END: 038_drop_rooms_type_check.sql

-- =========================================================================
-- Migration: 039_add_guest_service_ids_to_reservations.sql
-- =========================================================================
-- 039_add_guest_service_ids_to_reservations.sql
-- Track which guest services were selected for each reservation

ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS guest_service_ids TEXT[] DEFAULT '{}';

COMMENT ON COLUMN reservations.guest_service_ids IS 'Array of guest service IDs selected for this reservation (public booking add-ons)';

CREATE INDEX IF NOT EXISTS idx_reservations_guest_service_ids ON reservations USING GIN (guest_service_ids);

-- END: 039_add_guest_service_ids_to_reservations.sql

-- =========================================================================
-- Migration: 040_create_airport_shuttle_requests_table.sql
-- =========================================================================
-- 040_create_airport_shuttle_requests_table.sql
-- Dedicated table for airport shuttle requests linked to guests and reservations

CREATE TABLE IF NOT EXISTS airport_shuttle_requests (
  id TEXT PRIMARY KEY,
  guest_id TEXT REFERENCES guests(id) ON DELETE CASCADE,
  reservation_id TEXT REFERENCES reservations(id) ON DELETE SET NULL,
  room_number TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  shuttle_type TEXT NOT NULL CHECK (shuttle_type IN ('Pickup', 'Drop-off')),
  flight_number TEXT,
  flight_time TIME,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')) DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_airport_shuttle_requests_scheduled_date ON airport_shuttle_requests(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_airport_shuttle_requests_status ON airport_shuttle_requests(status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_airport_shuttle_requests_updated_at ON airport_shuttle_requests;

CREATE TRIGGER update_airport_shuttle_requests_updated_at
  BEFORE UPDATE ON airport_shuttle_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- END: 040_create_airport_shuttle_requests_table.sql

-- =========================================================================
-- Migration: 041_add_quantity_to_airport_shuttle_requests.sql
-- =========================================================================
-- 041_add_quantity_to_airport_shuttle_requests.sql
-- Adds quantity support for pickup and drop-off shuttle requests

ALTER TABLE airport_shuttle_requests
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

COMMENT ON COLUMN airport_shuttle_requests.quantity IS 'Number of shuttle vehicles requested for this direction (Pickup or Drop-off).';

-- END: 041_add_quantity_to_airport_shuttle_requests.sql

-- =========================================================================
-- Migration: 042_atomic_availability_check.sql
-- =========================================================================
-- Atomic availability check that includes Waitlisted public bookings
-- This prevents race conditions where multiple concurrent bookings could overbook
-- the same room type by including Waitlisted public bookings in the count.

CREATE OR REPLACE FUNCTION check_room_type_availability(
  p_room_type_name TEXT,
  p_check_in DATE,
  p_check_out DATE,
  p_requested_quantity INTEGER DEFAULT 1
)
RETURNS TABLE(
  available INTEGER,
  capacity INTEGER,
  booked INTEGER,
  can_book BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_capacity INTEGER;
  v_booked INTEGER;
  v_available INTEGER;
BEGIN
  -- Get total capacity for this room type
  SELECT COUNT(*)
  INTO v_capacity
  FROM rooms r
  JOIN room_types rt ON r.type = rt.name
  WHERE rt.name = p_room_type_name;

  IF v_capacity IS NULL THEN
    v_capacity := 0;
  END IF;

  -- Count all reservations that overlap the date range
  -- Include Confirmed, CheckedIn, and Waitlisted public bookings
  SELECT COUNT(*)
  INTO v_booked
  FROM reservations res
  JOIN room_types rt ON res.room_type = rt.name
  WHERE rt.name = p_room_type_name
    AND (res.status IN ('Confirmed', 'CheckedIn') OR 
         (res.status = 'Waitlisted' AND res.channel = 'Direct Website'))
    AND (
      -- Check if date ranges overlap
      (res.check_in_date <= p_check_out AND res.check_out_date >= p_check_in)
    );

  IF v_booked IS NULL THEN
    v_booked := 0;
  END IF;

  -- Calculate available rooms
  v_available := GREATEST(0, v_capacity - v_booked);

  RETURN QUERY SELECT
    v_available,
    v_capacity,
    v_booked,
    v_available >= p_requested_quantity;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_room_type_availability(TEXT, DATE, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_room_type_availability(TEXT, DATE, DATE, INTEGER) TO anon;

-- END: 042_atomic_availability_check.sql

-- =========================================================================
-- Migration: 043_add_booking_page_content_fields.sql
-- =========================================================================
-- Add specific fields for public booking page content
-- This removes hardcoded text from the booking page and makes it configurable

-- Add columns to global_settings for booking page content
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS booking_hero_title TEXT DEFAULT 'Find your perfect stay',
ADD COLUMN IF NOT EXISTS booking_hero_description TEXT DEFAULT 'Book directly with us for the best available rates, personalized service, and instant confirmation.',
ADD COLUMN IF NOT EXISTS booking_step1_label TEXT DEFAULT 'Select Room',
ADD COLUMN IF NOT EXISTS booking_step2_label TEXT DEFAULT 'Add-ons',
ADD COLUMN IF NOT EXISTS booking_step3_label TEXT DEFAULT 'Details',
ADD COLUMN IF NOT EXISTS booking_rooms_section_title TEXT DEFAULT 'Select your room',
ADD COLUMN IF NOT EXISTS booking_packages_section_title TEXT DEFAULT 'Packages',
ADD COLUMN IF NOT EXISTS booking_guest_services_section_title TEXT DEFAULT 'Guest Services',
ADD COLUMN IF NOT EXISTS booking_your_rooms_title TEXT DEFAULT 'Your Rooms',
ADD COLUMN IF NOT EXISTS booking_guest_details_title TEXT DEFAULT 'Guest Details',
ADD COLUMN IF NOT EXISTS booking_summary_title TEXT DEFAULT 'Booking Summary',
ADD COLUMN IF NOT EXISTS booking_header_subtitle TEXT DEFAULT 'Direct Reservations',
ADD COLUMN IF NOT EXISTS booking_no_rooms_message TEXT DEFAULT 'No rooms available for the selected dates.',
ADD COLUMN IF NOT EXISTS booking_no_rooms_subtext TEXT DEFAULT 'Try adjusting your dates or contact the hotel.',
ADD COLUMN IF NOT EXISTS booking_terms_agreement TEXT DEFAULT 'I agree to the hotel terms and conditions and cancellation policy.',
ADD COLUMN IF NOT EXISTS booking_read_terms_text TEXT DEFAULT 'Read terms',
ADD COLUMN IF NOT EXISTS booking_confirm_button_text TEXT DEFAULT 'Confirm booking',
ADD COLUMN IF NOT EXISTS booking_secure_booking_text TEXT DEFAULT 'Secure booking Â· No card required',
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- END: 043_add_booking_page_content_fields.sql

-- =========================================================================
-- Migration: 047_persistent_folios_vouchers_ar.sql
-- =========================================================================
-- ============================================================
-- P4: Extend existing folios + create vouchers & AR ledger
-- folios/folio_lines/folio_payments already exist with
-- different column names â€” we ALTER to add missing B2B columns
-- then CREATE vouchers and ar_ledger from scratch.
-- ============================================================

-- 1. Extend folios: add owner/operator columns for master folio support
ALTER TABLE folios
  ADD COLUMN IF NOT EXISTS owner_type   text,
  ADD COLUMN IF NOT EXISTS owner_id     text,
  ADD COLUMN IF NOT EXISTS operator_id  uuid REFERENCES tour_operators(id),
  ADD COLUMN IF NOT EXISTS group_id     text,
  ADD COLUMN IF NOT EXISTS credit_limit numeric(14,2) DEFAULT 0;

-- Back-fill existing rows: reservation-level folios are guest-owned
UPDATE folios
SET owner_type = 'guest',
    owner_id   = reservation_id
WHERE owner_type IS NULL;

-- 2. Extend folio_lines: add reservation link
ALTER TABLE folio_lines
  ADD COLUMN IF NOT EXISTS reservation_id text;

-- 3. Extend folio_payments: add reservation link + notes
ALTER TABLE folio_payments
  ADD COLUMN IF NOT EXISTS reservation_id text,
  ADD COLUMN IF NOT EXISTS notes          text;

-- 4. Vouchers
CREATE TABLE IF NOT EXISTS vouchers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_no     text NOT NULL UNIQUE,
  operator_id    uuid NOT NULL REFERENCES tour_operators(id),
  group_id       text,
  reservation_id text,
  issued_at      timestamptz DEFAULT now(),
  valid_from     date NOT NULL,
  valid_to       date NOT NULL,
  room_type_id   text REFERENCES room_types(id),
  nights         integer,
  board_basis    text DEFAULT 'RO',
  pax_count      integer DEFAULT 1,
  net_value      numeric(12,2),
  status         text NOT NULL DEFAULT 'issued'
                 CHECK (status IN ('issued','redeemed','void','expired')),
  redeemed_at    timestamptz,
  redeemed_by    text,
  void_reason    text,
  notes          text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vouchers_operator_status_idx ON vouchers (operator_id, status);

-- 5. Redeem voucher atomically (prevents double-redemption)
CREATE OR REPLACE FUNCTION redeem_voucher(
  p_voucher_no     text,
  p_reservation_id text,
  p_redeemed_by    text
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_voucher vouchers%ROWTYPE;
BEGIN
  SELECT * INTO v_voucher
  FROM vouchers
  WHERE voucher_no = p_voucher_no
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'VOUCHER_NOT_FOUND: %', p_voucher_no;
  END IF;
  IF v_voucher.status != 'issued' THEN
    RAISE EXCEPTION 'VOUCHER_INVALID_STATUS: voucher % is already %',
      p_voucher_no, v_voucher.status;
  END IF;
  IF v_voucher.valid_to < CURRENT_DATE THEN
    UPDATE vouchers SET status = 'expired', updated_at = now()
    WHERE id = v_voucher.id;
    RAISE EXCEPTION 'VOUCHER_EXPIRED: voucher % expired on %',
      p_voucher_no, v_voucher.valid_to;
  END IF;

  UPDATE vouchers
  SET status         = 'redeemed',
      redeemed_at    = now(),
      redeemed_by    = p_redeemed_by,
      reservation_id = p_reservation_id,
      updated_at     = now()
  WHERE id = v_voucher.id;

  RETURN jsonb_build_object(
    'success',     TRUE,
    'voucher_id',  v_voucher.id,
    'voucher_no',  v_voucher.voucher_no,
    'net_value',   v_voucher.net_value,
    'board_basis', v_voucher.board_basis,
    'operator_id', v_voucher.operator_id
  );
END;
$$;

-- 6. Accounts Receivable Ledger
CREATE TABLE IF NOT EXISTS ar_ledger (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id    uuid NOT NULL REFERENCES tour_operators(id),
  folio_id       text REFERENCES folios(id),
  voucher_id     uuid REFERENCES vouchers(id),
  entry_type     text NOT NULL
                 CHECK (entry_type IN ('invoice','payment','credit_note','adjustment')),
  description    text NOT NULL,
  debit_amount   numeric(14,2) DEFAULT 0,
  credit_amount  numeric(14,2) DEFAULT 0,
  balance_after  numeric(14,2),
  due_date       date,
  is_reconciled  boolean DEFAULT FALSE,
  reconciled_at  timestamptz,
  reference_no   text,
  posting_date   date NOT NULL DEFAULT CURRENT_DATE,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ar_ledger_operator_idx  ON ar_ledger (operator_id, is_reconciled);
CREATE INDEX IF NOT EXISTS ar_ledger_due_date_idx  ON ar_ledger (due_date) WHERE NOT is_reconciled;

-- 7. Post master folio balance to A/R on group checkout
CREATE OR REPLACE FUNCTION post_folio_to_ar(
  p_folio_id text,
  p_due_date date
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_folio     folios%ROWTYPE;
  v_charges   numeric;
  v_payments  numeric;
  v_balance   numeric;
  v_ar_id     uuid;
BEGIN
  SELECT * INTO v_folio FROM folios WHERE id = p_folio_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Folio % not found', p_folio_id;
  END IF;
  IF v_folio.operator_id IS NULL THEN
    RAISE EXCEPTION 'Folio % has no operator â€” cannot post to A/R', p_folio_id;
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_charges
  FROM folio_lines WHERE folio_id = p_folio_id AND NOT is_voided;

  SELECT COALESCE(SUM(amount), 0) INTO v_payments
  FROM folio_payments WHERE folio_id = p_folio_id AND NOT is_voided;

  v_balance := v_charges - v_payments;

  INSERT INTO ar_ledger (
    operator_id, folio_id, entry_type, description,
    debit_amount, credit_amount, balance_after, due_date,
    reference_no, posting_date
  ) VALUES (
    v_folio.operator_id,
    p_folio_id,
    'invoice',
    'Group checkout â€” master folio balance due',
    v_balance, 0, v_balance, p_due_date,
    'FOLIO-' || p_folio_id,
    CURRENT_DATE
  ) RETURNING id INTO v_ar_id;

  UPDATE folios
  SET status = 'closed', closed_at = now(), updated_at = now()
  WHERE id = p_folio_id;

  RETURN v_ar_id;
END;
$$;

-- 8. RLS
ALTER TABLE vouchers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_vouchers" ON vouchers;
DROP POLICY IF EXISTS "staff_ar_ledger" ON ar_ledger;

CREATE POLICY "staff_vouchers"
  ON vouchers  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "staff_ar_ledger"
  ON ar_ledger FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

GRANT EXECUTE ON FUNCTION redeem_voucher   TO authenticated;
GRANT EXECUTE ON FUNCTION post_folio_to_ar TO authenticated;

-- END: 047_persistent_folios_vouchers_ar.sql

-- =========================================================================
-- Migration: 048_booking_atomic_unified_fees.sql
-- =========================================================================
-- 048_booking_atomic_unified_fees.sql
--
-- Unify public-booking fee math with the front desk.
--
-- The previous create_booking_atomic recomputed tax and service charge as flat
-- percentages of the subtotal (non-compounded) and ignored any additional fee
-- components. This meant the total a guest saw on screen could differ from the
-- total the server persisted, and custom fees silently vanished from revenue.
--
-- This version accepts the ABSOLUTE fee amounts already computed by the server's
-- unified pricing engine (src/utils/pricing.ts -> computeFees), which mirrors the
-- front-desk formatTaxesAndFees logic: service charge + additional fees applied
-- to the base, then VAT applied last on (base + service charge + additional fees).
-- Room rates passed in are already adjusted for season + rate plan.

DROP FUNCTION IF EXISTS public.create_booking_atomic(
  text, text, text, text, text, text, date, date, jsonb,
  text[], text[], numeric, numeric, numeric, numeric, text, uuid
);

CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_idempotency_key text,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_guest_nationality text,
  p_special_requests text,
  p_check_in date,
  p_check_out date,
  p_items jsonb,
  p_package_ids text[],
  p_guest_service_ids text[],
  p_package_total numeric,
  p_guest_svc_total numeric,
  p_tax_percent numeric,
  p_svc_charge_pct numeric,
  p_group_name text DEFAULT NULL::text,
  p_operator_id uuid DEFAULT NULL::uuid,
  p_tax_amount numeric DEFAULT 0,
  p_svc_amount numeric DEFAULT 0,
  p_addon_amount numeric DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_nights            INTEGER;
  v_total_qty         INTEGER := 0;
  v_is_group          BOOLEAN;
  v_guest_id          TEXT;
  v_group_id          TEXT;
  v_reservation_ids   TEXT[] := '{}';
  v_item              JSONB;
  v_capacity          INTEGER;
  v_booked            INTEGER;
  v_available         INTEGER;
  v_reservation_id    TEXT;
  v_base_amount       NUMERIC;
  v_item_total        NUMERIC;
  v_charges           JSONB;
  v_first_res         BOOLEAN := TRUE;
  v_existing_ids      TEXT[];
  v_subtotal          NUMERIC := 0;
  v_allotment_block   INTEGER := 0;
BEGIN
  -- â”€â”€ Idempotency guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  SELECT ARRAY_AGG(id) INTO v_existing_ids
  FROM reservations
  WHERE idempotency_key = p_idempotency_key;

  IF v_existing_ids IS NOT NULL AND array_length(v_existing_ids, 1) > 0 THEN
    RETURN jsonb_build_object(
      'success',        TRUE,
      'idempotent',     TRUE,
      'reservationIds', v_existing_ids,
      'guestId',        (SELECT guest_id FROM reservations WHERE idempotency_key = p_idempotency_key LIMIT 1)
    );
  END IF;

  -- â”€â”€ Date math â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  v_nights := GREATEST(1, (p_check_out - p_check_in));

  -- â”€â”€ Availability check WITH row-level lock â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    PERFORM id FROM room_types
      WHERE name = (v_item->>'roomTypeName')
      FOR UPDATE;

    SELECT COUNT(*) INTO v_capacity
    FROM rooms r
    JOIN room_types rt ON r.type = rt.name
    WHERE rt.name = (v_item->>'roomTypeName');

    SELECT COUNT(*) INTO v_booked
    FROM reservations res
    WHERE res.room_type = (v_item->>'roomTypeName')
      AND (
        res.status IN ('Confirmed', 'CheckedIn')
        OR (res.status = 'Waitlisted' AND res.channel = 'Direct Website')
      )
      AND res.check_in_date < p_check_out
      AND res.check_out_date > p_check_in;

    BEGIN
      SELECT COALESCE(SUM(GREATEST(0, a.blocked_qty - a.picked_up_qty)), 0)
      INTO v_allotment_block
      FROM allotments a
      JOIN room_types rt ON a.room_type_id = rt.id
      WHERE rt.name = (v_item->>'roomTypeName')
        AND a.release_date >= CURRENT_DATE
        AND a.stay_date >= p_check_in
        AND a.stay_date < p_check_out;
    EXCEPTION WHEN undefined_table THEN
      v_allotment_block := 0;
    END;

    v_available := GREATEST(0, v_capacity - v_booked - v_allotment_block);

    IF v_available < (v_item->>'qty')::INTEGER THEN
      RAISE EXCEPTION 'AVAILABILITY_ERROR:% room(s) available for %, requested %',
        v_available, v_item->>'roomTypeName', v_item->>'qty';
    END IF;

    v_total_qty := v_total_qty + (v_item->>'qty')::INTEGER;
    v_subtotal  := v_subtotal + ((v_item->>'rate')::NUMERIC * v_nights * (v_item->>'qty')::INTEGER);
  END LOOP;

  v_subtotal := v_subtotal + COALESCE(p_package_total, 0) + COALESCE(p_guest_svc_total, 0);
  v_is_group := v_total_qty > 1;

  -- â”€â”€ Insert guest â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  v_guest_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
  INSERT INTO guests (
    id, name, email, phone, nationality, status,
    loyalty_points, special_requests, notes, total_spend, preferences
  ) VALUES (
    v_guest_id, p_guest_name, p_guest_email,
    COALESCE(p_guest_phone, ''), COALESCE(p_guest_nationality, ''),
    'Regular', 0, COALESCE(p_special_requests, ''),
    'Direct website booking â€” pending front desk promotion', 0, '{}'::jsonb
  );

  -- â”€â”€ Insert group booking (if multi-room) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  IF v_is_group THEN
    v_group_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
    INSERT INTO group_bookings (
      id, group_name, contact_name, contact_email, contact_phone,
      room_type_needed, room_count, check_in_date, check_out_date,
      discount_percent, status
    ) VALUES (
      v_group_id,
      COALESCE(p_group_name, p_guest_name),
      p_guest_name, p_guest_email,
      COALESCE(p_guest_phone, ''),
      (p_items->0->>'roomTypeName'),
      v_total_qty, p_check_in, p_check_out,
      0, 'Pending'
    );
  END IF;

  -- â”€â”€ Insert reservations per item Ã— qty â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  -- Fees (service charge, additional fees, VAT) and package/service totals are
  -- attached to the FIRST reservation as itemized folio charges so that the sum
  -- of every reservation's total_amount equals the grand total the guest saw.
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    DECLARE v_i INTEGER;
    BEGIN
      FOR v_i IN 1..(v_item->>'qty')::INTEGER LOOP
        v_base_amount := (v_item->>'rate')::NUMERIC * v_nights;
        v_item_total  := v_base_amount;
        v_charges     := jsonb_build_array(
                           jsonb_build_object('description','Room charge','amount',v_base_amount,'date',NOW())
                         );

        IF v_first_res THEN
          IF COALESCE(p_package_total, 0) > 0 THEN
            v_item_total := v_item_total + p_package_total;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','Packages & add-ons','amount',p_package_total,'date',NOW())
                            );
          END IF;
          IF COALESCE(p_guest_svc_total, 0) > 0 THEN
            v_item_total := v_item_total + p_guest_svc_total;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','Guest services','amount',p_guest_svc_total,'date',NOW())
                            );
          END IF;
          IF COALESCE(p_svc_amount, 0) > 0 THEN
            v_item_total := v_item_total + p_svc_amount;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','Service charge','amount',p_svc_amount,'date',NOW())
                            );
          END IF;
          IF COALESCE(p_addon_amount, 0) > 0 THEN
            v_item_total := v_item_total + p_addon_amount;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','Additional fees','amount',p_addon_amount,'date',NOW())
                            );
          END IF;
          IF COALESCE(p_tax_amount, 0) > 0 THEN
            v_item_total := v_item_total + p_tax_amount;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','VAT / Tax','amount',p_tax_amount,'date',NOW())
                            );
          END IF;
        END IF;

        v_reservation_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
        v_reservation_ids := v_reservation_ids || v_reservation_id;

        INSERT INTO reservations (
          id, idempotency_key, guest_id,
          guest_name, guest_email, guest_phone, guest_status,
          room_type, room_type_id,
          check_in_date, check_out_date,
          adults, children,
          status, rate, total_amount,
          channel, payment_status, notes,
          tax_percent, service_charge_percent,
          package_ids, guest_service_ids,
          charges, payments,
          is_group, group_booking_id, booking_group_id
        ) VALUES (
          v_reservation_id,
          CASE WHEN v_first_res THEN p_idempotency_key ELSE NULL END,
          v_guest_id,
          p_guest_name, p_guest_email, COALESCE(p_guest_phone,''), 'Regular',
          (v_item->>'roomTypeName'), (v_item->>'roomTypeId'),
          p_check_in, p_check_out,
          COALESCE((v_item->>'adults')::INTEGER, 1),
          COALESCE((v_item->>'children')::INTEGER, 0),
          'Waitlisted',
          (v_item->>'rate')::NUMERIC,
          v_item_total,
          'Direct Website', 'Unpaid',
          COALESCE(p_special_requests,''),
          p_tax_percent, p_svc_charge_pct,
          p_package_ids, p_guest_service_ids,
          v_charges, '[]'::jsonb,
          v_is_group,
          v_group_id, v_group_id
        );

        v_first_res := FALSE;
      END LOOP;
    END;
  END LOOP;

  -- â”€â”€ Audit event â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  INSERT INTO audit_events (id, user_id, action, entity_type, entity_id, module, details)
  VALUES (
    gen_random_uuid()::text, 'public', 'public_booking.atomic_created',
    CASE WHEN v_is_group THEN 'GroupBooking' ELSE 'Reservation' END,
    COALESCE(v_group_id, v_reservation_ids[1]),
    'public_booking',
    jsonb_build_object(
      'guestEmail',       p_guest_email,
      'reservationIds',   v_reservation_ids,
      'groupId',          v_group_id,
      'checkIn',          p_check_in,
      'checkOut',         p_check_out,
      'idempotencyKey',   p_idempotency_key,
      'roomCount',        v_total_qty
    )
  );

  RETURN jsonb_build_object(
    'success',        TRUE,
    'idempotent',     FALSE,
    'reservationIds', v_reservation_ids,
    'guestId',        v_guest_id,
    'groupId',        v_group_id,
    'totalAmount',    v_subtotal + COALESCE(p_tax_amount,0) + COALESCE(p_svc_amount,0) + COALESCE(p_addon_amount,0)
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$function$;

-- END: 048_booking_atomic_unified_fees.sql

-- =========================================================================
-- Migration: 049_per_room_guest_profiles.sql
-- =========================================================================
-- Migration: Update create_booking_atomic to create per-room guest profiles for group bookings
-- This ensures each room in a group booking has its own guest profile for individual editing and ID upload

DROP FUNCTION IF EXISTS public.create_booking_atomic(
  text, text, text, text, text, text, date, date, jsonb,
  text[], text[], numeric, numeric, numeric, numeric, text, uuid, numeric, numeric, numeric, text, text
);

CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_idempotency_key text,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_guest_nationality text,
  p_special_requests text,
  p_check_in date,
  p_check_out date,
  p_items jsonb,
  p_package_ids text[],
  p_guest_service_ids text[],
  p_package_total numeric,
  p_guest_svc_total numeric,
  p_tax_percent numeric,
  p_svc_charge_pct numeric,
  p_group_name text DEFAULT NULL::text,
  p_operator_id uuid DEFAULT NULL::uuid,
  p_tax_amount numeric DEFAULT 0,
  p_svc_amount numeric DEFAULT 0,
  p_addon_amount numeric DEFAULT 0,
  p_channel text DEFAULT 'Direct Website',
  p_status text DEFAULT 'Waitlisted'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_nights            INTEGER;
  v_total_qty         INTEGER := 0;
  v_is_group          BOOLEAN;
  v_guest_id          TEXT;
  v_group_id          TEXT;
  v_reservation_ids   TEXT[] := '{}';
  v_guest_ids         TEXT[] := '{}';
  v_item              JSONB;
  v_capacity          INTEGER;
  v_booked            INTEGER;
  v_available         INTEGER;
  v_reservation_id    TEXT;
  v_base_amount       NUMERIC;
  v_item_total        NUMERIC;
  v_charges           JSONB;
  v_first_res         BOOLEAN := TRUE;
  v_existing_ids      TEXT[];
  v_subtotal          NUMERIC := 0;
  v_allotment_block   INTEGER := 0;
  v_room_index        INTEGER := 0;
  v_room_guest_id     TEXT;
  v_room_guest_name   TEXT;
  v_room_guest_email  TEXT;
BEGIN
  -- â”€â”€ Idempotency guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  SELECT ARRAY_AGG(id) INTO v_existing_ids
  FROM reservations
  WHERE idempotency_key = p_idempotency_key;

  IF v_existing_ids IS NOT NULL AND array_length(v_existing_ids, 1) > 0 THEN
    RETURN jsonb_build_object(
      'success',        TRUE,
      'idempotent',     TRUE,
      'reservationIds', v_existing_ids,
      'guestId',        (SELECT guest_id FROM reservations WHERE idempotency_key = p_idempotency_key LIMIT 1)
    );
  END IF;

  -- â”€â”€ Date math â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  v_nights := GREATEST(1, (p_check_out - p_check_in));

  -- â”€â”€ Availability check WITH row-level lock â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    PERFORM id FROM room_types
      WHERE name = (v_item->>'roomTypeName')
      FOR UPDATE;

    SELECT COUNT(*) INTO v_capacity
    FROM rooms r
    JOIN room_types rt ON r.type = rt.name
    WHERE rt.name = (v_item->>'roomTypeName');

    SELECT COUNT(*) INTO v_booked
    FROM reservations res
    WHERE res.room_type = (v_item->>'roomTypeName')
      AND (
        res.status IN ('Confirmed', 'CheckedIn')
        OR (res.status = 'Waitlisted' AND res.channel = 'Direct Website')
      )
      AND res.check_in_date < p_check_out
      AND res.check_out_date > p_check_in;

    BEGIN
      SELECT COALESCE(SUM(GREATEST(0, a.blocked_qty - a.picked_up_qty)), 0)
      INTO v_allotment_block
      FROM allotments a
      JOIN room_types rt ON a.room_type_id = rt.id
      WHERE rt.name = (v_item->>'roomTypeName')
        AND a.release_date >= CURRENT_DATE
        AND a.stay_date >= p_check_in
        AND a.stay_date < p_check_out;
    EXCEPTION WHEN undefined_table THEN
      v_allotment_block := 0;
    END;

    v_available := GREATEST(0, v_capacity - v_booked - v_allotment_block);

    IF v_available < (v_item->>'qty')::INTEGER THEN
      RAISE EXCEPTION 'AVAILABILITY_ERROR:% room(s) available for %, requested %',
        v_available, v_item->>'roomTypeName', v_item->>'qty';
    END IF;

    v_total_qty := v_total_qty + (v_item->>'qty')::INTEGER;
    v_subtotal  := v_subtotal + ((v_item->>'rate')::NUMERIC * v_nights * (v_item->>'qty')::INTEGER);
  END LOOP;

  v_subtotal := v_subtotal + COALESCE(p_package_total, 0) + COALESCE(p_guest_svc_total, 0);
  v_is_group := v_total_qty > 1;

  -- â”€â”€ Insert group booking (if multi-room) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  IF v_is_group THEN
    v_group_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
    INSERT INTO group_bookings (
      id, group_name, contact_name, contact_email, contact_phone,
      room_type_needed, room_count, check_in_date, check_out_date,
      discount_percent, status
    ) VALUES (
      v_group_id,
      COALESCE(p_group_name, p_guest_name),
      p_guest_name, p_guest_email,
      COALESCE(p_guest_phone, ''),
      (p_items->0->>'roomTypeName'),
      v_total_qty, p_check_in, p_check_out,
      0, 'Pending'
    );
  END IF;

  -- â”€â”€ Insert reservations per item Ã— qty with per-room guest profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  -- Fees (service charge, additional fees, VAT) and package/service totals are
  -- attached to the FIRST reservation as itemized folio charges so that the sum
  -- of every reservation's total_amount equals the grand total the guest saw.
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    DECLARE v_i INTEGER;
    BEGIN
      FOR v_i IN 1..(v_item->>'qty')::INTEGER LOOP
        v_base_amount := (v_item->>'rate')::NUMERIC * v_nights;
        v_item_total  := v_base_amount;
        v_charges     := jsonb_build_array(
                           jsonb_build_object('description','Room charge','amount',v_base_amount,'date',NOW())
                         );

        IF v_first_res THEN
          IF COALESCE(p_package_total, 0) > 0 THEN
            v_item_total := v_item_total + p_package_total;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','Packages & add-ons','amount',p_package_total,'date',NOW())
                            );
          END IF;
          IF COALESCE(p_guest_svc_total, 0) > 0 THEN
            v_item_total := v_item_total + p_guest_svc_total;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','Guest services','amount',p_guest_svc_total,'date',NOW())
                            );
          END IF;
          IF COALESCE(p_svc_amount, 0) > 0 THEN
            v_item_total := v_item_total + p_svc_amount;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','Service charge','amount',p_svc_amount,'date',NOW())
                            );
          END IF;
          IF COALESCE(p_addon_amount, 0) > 0 THEN
            v_item_total := v_item_total + p_addon_amount;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','Additional fees','amount',p_addon_amount,'date',NOW())
                            );
          END IF;
          IF COALESCE(p_tax_amount, 0) > 0 THEN
            v_item_total := v_item_total + p_tax_amount;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','VAT / Tax','amount',p_tax_amount,'date',NOW())
                            );
          END IF;
        END IF;

        -- Create per-room guest profile for group bookings
        v_room_index := v_room_index + 1;
        IF v_is_group THEN
          v_room_guest_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
          v_room_guest_name := CASE WHEN v_room_index = 1 
            THEN p_guest_name 
            ELSE p_guest_name || ' (Room ' || v_room_index || ')' 
          END;
          v_room_guest_email := CASE WHEN v_room_index = 1 
            THEN p_guest_email 
            ELSE REPLACE(p_guest_email, '@', '+room' || v_room_index || '@') 
          END;
          
          INSERT INTO guests (
            id, name, email, phone, nationality, status,
            loyalty_points, special_requests, notes, total_spend, preferences,
            is_primary_contact
          ) VALUES (
            v_room_guest_id, v_room_guest_name, v_room_guest_email,
            COALESCE(p_guest_phone, ''), COALESCE(p_guest_nationality, ''),
            'Regular', 0, COALESCE(p_special_requests, ''),
            'Direct website group booking â€” Room ' || v_room_index, 0, '{}'::jsonb,
            v_room_index = 1
          );
          
          v_room_guest_id := v_room_guest_id;
          v_guest_ids := v_guest_ids || v_room_guest_id;
        ELSE
          -- Single booking: create one guest profile
          IF v_room_index = 1 THEN
            v_guest_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
            INSERT INTO guests (
              id, name, email, phone, nationality, status,
              loyalty_points, special_requests, notes, total_spend, preferences
            ) VALUES (
              v_guest_id, p_guest_name, p_guest_email,
              COALESCE(p_guest_phone, ''), COALESCE(p_guest_nationality, ''),
              'Regular', 0, COALESCE(p_special_requests, ''),
              'Direct website booking â€” pending front desk promotion', 0, '{}'::jsonb
            );
            v_room_guest_id := v_guest_id;
            v_guest_ids := v_guest_ids || v_room_guest_id;
          END IF;
        END IF;

        v_reservation_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
        v_reservation_ids := v_reservation_ids || v_reservation_id;

        INSERT INTO reservations (
          id, idempotency_key, guest_id,
          guest_name, guest_email, guest_phone, guest_status,
          room_type, room_type_id,
          check_in_date, check_out_date,
          adults, children,
          status, rate, total_amount,
          channel, payment_status, notes,
          tax_percent, service_charge_percent,
          package_ids, guest_service_ids,
          charges, payments,
          is_group, group_booking_id, booking_group_id,
          operator_id
        ) VALUES (
          v_reservation_id,
          CASE WHEN v_first_res THEN p_idempotency_key ELSE NULL END,
          v_room_guest_id,
          CASE WHEN v_is_group THEN 
            CASE WHEN v_room_index = 1 THEN p_guest_name ELSE p_guest_name || ' (Room ' || v_room_index || ')' END
          ELSE p_guest_name END,
          CASE WHEN v_is_group THEN 
            CASE WHEN v_room_index = 1 THEN p_guest_email ELSE REPLACE(p_guest_email, '@', '+room' || v_room_index || '@') END
          ELSE p_guest_email END,
          COALESCE(p_guest_phone,''), 'Regular',
          (v_item->>'roomTypeName'), (v_item->>'roomTypeId'),
          p_check_in, p_check_out,
          COALESCE((v_item->>'adults')::INTEGER, 1),
          COALESCE((v_item->>'children')::INTEGER, 0),
          COALESCE(p_status, 'Waitlisted'),
          (v_item->>'rate')::NUMERIC,
          v_item_total,
          COALESCE(p_channel, 'Direct Website'), 'Unpaid',
          COALESCE(p_special_requests,''),
          p_tax_percent, p_svc_charge_pct,
          p_package_ids, p_guest_service_ids,
          v_charges, '[]'::jsonb,
          v_is_group,
          v_group_id, v_group_id,
          p_operator_id
        );

        v_first_res := FALSE;
      END LOOP;
    END;
  END LOOP;

  -- â”€â”€ Audit event â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  INSERT INTO audit_events (id, user_id, action, entity_type, entity_id, module, details)
  VALUES (
    gen_random_uuid()::text, 'public', 'public_booking.atomic_created',
    CASE WHEN v_is_group THEN 'GroupBooking' ELSE 'Reservation' END,
    COALESCE(v_group_id, v_reservation_ids[1]),
    'public_booking',
    jsonb_build_object(
      'guestEmail',       p_guest_email,
      'reservationIds',   v_reservation_ids,
      'guestIds',         v_guest_ids,
      'groupId',          v_group_id,
      'checkIn',          p_check_in,
      'checkOut',         p_check_out,
      'idempotencyKey',   p_idempotency_key,
      'roomCount',        v_total_qty
    )
  );

  RETURN jsonb_build_object(
    'success',        TRUE,
    'idempotent',     FALSE,
    'reservationIds', v_reservation_ids,
    'guestIds',       v_guest_ids,
    'groupId',        v_group_id
  );
END;
$function$;

-- END: 049_per_room_guest_profiles.sql

-- =========================================================================
-- Migration: 050_per_night_room_assignments.sql
-- =========================================================================
-- Migration: Support per-night room selection and room moves in create_booking_atomic
-- Each room in a booking can now be assigned a different room for each night;
-- consecutive nights in the same room are grouped into one reservation.

DROP FUNCTION IF EXISTS public.create_booking_atomic(
  text, text, text, text, date, date, jsonb, numeric, numeric, text, text, text, text, numeric, text, numeric, numeric, numeric, text, text
);

DROP FUNCTION IF EXISTS public.create_booking_atomic(
  text, text, text, text, text, text, date, date, jsonb,
  text[], text[], numeric, numeric, numeric, numeric, text, uuid, numeric, numeric, numeric
);

DROP FUNCTION IF EXISTS public.create_booking_atomic(
  text, text, text, text, text, text, date, date, jsonb,
  text[], text[], numeric, numeric, numeric, numeric, text, uuid, numeric, numeric, numeric, text, text
);

CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_idempotency_key text,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_guest_nationality text,
  p_special_requests text,
  p_check_in date,
  p_check_out date,
  p_items jsonb,
  p_package_ids text[],
  p_guest_service_ids text[],
  p_package_total numeric,
  p_guest_svc_total numeric,
  p_tax_percent numeric,
  p_svc_charge_pct numeric,
  p_group_name text DEFAULT NULL::text,
  p_operator_id uuid DEFAULT NULL::uuid,
  p_tax_amount numeric DEFAULT 0,
  p_svc_amount numeric DEFAULT 0,
  p_addon_amount numeric DEFAULT 0,
  p_channel text DEFAULT 'Direct Website',
  p_status text DEFAULT 'Waitlisted'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_nights            INTEGER;
  v_total_qty         INTEGER := 0;
  v_is_group          BOOLEAN;
  v_guest_id          TEXT;
  v_group_id          TEXT;
  v_reservation_ids   TEXT[] := '{}';
  v_guest_ids         TEXT[] := '{}';
  v_item              JSONB;
  v_capacity          INTEGER;
  v_booked            INTEGER;
  v_available         INTEGER;
  v_reservation_id    TEXT;
  v_base_amount       NUMERIC;
  v_item_total        NUMERIC;
  v_charges           JSONB;
  v_first_res         BOOLEAN := TRUE;
  v_existing_ids      TEXT[];
  v_subtotal          NUMERIC := 0;
  v_allotment_block   INTEGER := 0;
  v_room_index        INTEGER := 0;
  v_room_guest_id     TEXT;
  v_room_guest_name   TEXT;
  v_room_guest_email  TEXT;
  -- Per-night room assignment variables
  v_i                 INTEGER;
  v_night_idx         INTEGER;
  v_desired_room      TEXT;
  v_current_room      TEXT;
  v_current_start     DATE;
  v_current_nights    INTEGER;
  v_segments          JSONB;
  v_segment           JSONB;
  v_segment_room      TEXT;
  v_segment_check_in  DATE;
  v_segment_check_out DATE;
  v_segment_nights    INTEGER;
  v_assigned_room     TEXT;
BEGIN
  -- â”€â”€ Idempotency guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  SELECT ARRAY_AGG(id) INTO v_existing_ids
  FROM reservations
  WHERE idempotency_key = p_idempotency_key;

  IF v_existing_ids IS NOT NULL AND array_length(v_existing_ids, 1) > 0 THEN
    RETURN jsonb_build_object(
      'success',        TRUE,
      'idempotent',     TRUE,
      'reservationIds', v_existing_ids,
      'guestId',        (SELECT guest_id FROM reservations WHERE idempotency_key = p_idempotency_key LIMIT 1)
    );
  END IF;

  -- â”€â”€ Date math â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  v_nights := GREATEST(1, (p_check_out - p_check_in));

  -- â”€â”€ Availability check WITH row-level lock â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    PERFORM id FROM room_types
      WHERE name = (v_item->>'roomTypeName')
      FOR UPDATE;

    SELECT COUNT(*) INTO v_capacity
    FROM rooms r
    JOIN room_types rt ON r.type = rt.name
    WHERE rt.name = (v_item->>'roomTypeName');

    SELECT COUNT(*) INTO v_booked
    FROM reservations res
    WHERE res.room_type = (v_item->>'roomTypeName')
      AND (
        res.status IN ('Confirmed', 'CheckedIn')
        OR (res.status = 'Waitlisted' AND res.channel = 'Direct Website')
      )
      AND res.check_in_date < p_check_out
      AND res.check_out_date > p_check_in;

    BEGIN
      SELECT COALESCE(SUM(GREATEST(0, a.blocked_qty - a.picked_up_qty)), 0)
      INTO v_allotment_block
      FROM allotments a
      JOIN room_types rt ON a.room_type_id = rt.id
      WHERE rt.name = (v_item->>'roomTypeName')
        AND a.release_date >= CURRENT_DATE
        AND a.stay_date >= p_check_in
        AND a.stay_date < p_check_out;
    EXCEPTION WHEN undefined_table THEN
      v_allotment_block := 0;
    END;

    v_available := GREATEST(0, v_capacity - v_booked - v_allotment_block);

    IF v_available < (v_item->>'qty')::INTEGER THEN
      RAISE EXCEPTION 'AVAILABILITY_ERROR:% room(s) available for %, requested %',
        v_available, v_item->>'roomTypeName', v_item->>'qty';
    END IF;

    v_total_qty := v_total_qty + (v_item->>'qty')::INTEGER;
    v_subtotal  := v_subtotal + ((v_item->>'rate')::NUMERIC * v_nights * (v_item->>'qty')::INTEGER);
  END LOOP;

  v_subtotal := v_subtotal + COALESCE(p_package_total, 0) + COALESCE(p_guest_svc_total, 0);
  v_is_group := v_total_qty > 1;

  -- â”€â”€ Insert group booking (if multi-room) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  IF v_is_group THEN
    v_group_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
    INSERT INTO group_bookings (
      id, group_name, contact_name, contact_email, contact_phone,
      room_type_needed, room_count, check_in_date, check_out_date,
      discount_percent, status
    ) VALUES (
      v_group_id,
      COALESCE(p_group_name, p_guest_name),
      p_guest_name, p_guest_email,
      COALESCE(p_guest_phone, ''),
      (p_items->0->>'roomTypeName'),
      v_total_qty, p_check_in, p_check_out,
      0, 'Pending'
    );
  END IF;

  -- â”€â”€ Insert reservations per item Ã— qty, split by room moves per night â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  -- Fees (service charge, additional fees, VAT) and package/service totals are
  -- attached to the FIRST reservation as itemized folio charges so that the sum
  -- of every reservation's total_amount equals the grand total the guest saw.
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    DECLARE
      v_qty INTEGER;
    BEGIN
      v_qty := (v_item->>'qty')::INTEGER;
      FOR v_i IN 1..v_qty LOOP
        -- Create per-room guest profile for group bookings
        v_room_index := v_room_index + 1;
        IF v_is_group THEN
          v_room_guest_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
          v_room_guest_name := CASE WHEN v_room_index = 1
            THEN p_guest_name
            ELSE p_guest_name || ' (Room ' || v_room_index || ')'
          END;
          v_room_guest_email := CASE WHEN v_room_index = 1
            THEN p_guest_email
            ELSE REPLACE(p_guest_email, '@', '+room' || v_room_index || '@')
          END;

          INSERT INTO guests (
            id, name, email, phone, nationality, status,
            loyalty_points, special_requests, notes, total_spend, preferences,
            is_primary_contact
          ) VALUES (
            v_room_guest_id, v_room_guest_name, v_room_guest_email,
            COALESCE(p_guest_phone, ''), COALESCE(p_guest_nationality, ''),
            'Regular', 0, COALESCE(p_special_requests, ''),
            'Direct website group booking â€” Room ' || v_room_index, 0, '{}'::jsonb,
            v_room_index = 1
          );

          v_guest_ids := v_guest_ids || v_room_guest_id;
        ELSE
          -- Single booking: create one guest profile
          IF v_room_index = 1 THEN
            v_guest_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
            INSERT INTO guests (
              id, name, email, phone, nationality, status,
              loyalty_points, special_requests, notes, total_spend, preferences
            ) VALUES (
              v_guest_id, p_guest_name, p_guest_email,
              COALESCE(p_guest_phone, ''), COALESCE(p_guest_nationality, ''),
              'Regular', 0, COALESCE(p_special_requests, ''),
              'Direct website booking â€” pending front desk promotion', 0, '{}'::jsonb
            );
            v_room_guest_id := v_guest_id;
            v_guest_ids := v_guest_ids || v_room_guest_id;
          END IF;
        END IF;

        -- Build per-night segments for this room, grouping consecutive nights in the same room
        v_segments := '[]'::jsonb;
        v_current_room := NULL;
        v_current_start := p_check_in;
        v_current_nights := 0;

        FOR v_night_idx IN 0..(v_nights - 1) LOOP
          v_desired_room := NULLIF((v_item->'roomNights'->v_night_idx->>(v_i - 1)), '');

          IF v_current_nights = 0 THEN
            v_current_room := v_desired_room;
            v_current_start := p_check_in + v_night_idx;
            v_current_nights := 1;
          ELSIF v_desired_room IS NULL OR v_desired_room = v_current_room THEN
            v_current_nights := v_current_nights + 1;
          ELSE
            v_segments := v_segments || jsonb_build_object('room', v_current_room, 'start', v_current_start, 'nights', v_current_nights);
            v_current_room := v_desired_room;
            v_current_start := p_check_in + v_night_idx;
            v_current_nights := 1;
          END IF;
        END LOOP;

        IF v_current_nights > 0 THEN
          v_segments := v_segments || jsonb_build_object('room', v_current_room, 'start', v_current_start, 'nights', v_current_nights);
        END IF;

        -- If no per-night room data was provided, create one segment for the whole stay
        IF jsonb_array_length(v_segments) = 0 THEN
          v_segments := jsonb_build_array(jsonb_build_object('room', NULL, 'start', p_check_in, 'nights', v_nights));
        END IF;

        -- Create a reservation for each segment
        FOR v_segment IN SELECT * FROM jsonb_array_elements(v_segments) LOOP
          v_segment_room := (v_segment->>'room');
          v_segment_check_in := (v_segment->>'start')::date;
          v_segment_nights := (v_segment->>'nights')::integer;
          v_segment_check_out := v_segment_check_in + v_segment_nights;
          v_base_amount := (v_item->>'rate')::NUMERIC * v_segment_nights;
          v_item_total  := v_base_amount;
          v_charges     := jsonb_build_array(
                             jsonb_build_object('description','Room charge','amount',v_base_amount,'date',NOW())
                           );

          IF v_first_res THEN
            IF COALESCE(p_package_total, 0) > 0 THEN
              v_item_total := v_item_total + p_package_total;
              v_charges    := v_charges || jsonb_build_array(
                                jsonb_build_object('description','Packages & add-ons','amount',p_package_total,'date',NOW())
                              );
            END IF;
            IF COALESCE(p_guest_svc_total, 0) > 0 THEN
              v_item_total := v_item_total + p_guest_svc_total;
              v_charges    := v_charges || jsonb_build_array(
                                jsonb_build_object('description','Guest services','amount',p_guest_svc_total,'date',NOW())
                              );
            END IF;
            IF COALESCE(p_svc_amount, 0) > 0 THEN
              v_item_total := v_item_total + p_svc_amount;
              v_charges    := v_charges || jsonb_build_array(
                                jsonb_build_object('description','Service charge','amount',p_svc_amount,'date',NOW())
                              );
            END IF;
            IF COALESCE(p_addon_amount, 0) > 0 THEN
              v_item_total := v_item_total + p_addon_amount;
              v_charges    := v_charges || jsonb_build_array(
                                jsonb_build_object('description','Additional fees','amount',p_addon_amount,'date',NOW())
                              );
            END IF;
            IF COALESCE(p_tax_amount, 0) > 0 THEN
              v_item_total := v_item_total + p_tax_amount;
              v_charges    := v_charges || jsonb_build_array(
                                jsonb_build_object('description','VAT / Tax','amount',p_tax_amount,'date',NOW())
                              );
            END IF;
          END IF;

          -- Assign a specific room if requested, otherwise auto-assign one available for the segment
          v_assigned_room := NULL;
          IF v_segment_room IS NOT NULL THEN
            SELECT r.number INTO v_assigned_room
            FROM rooms r
            WHERE r.number = v_segment_room
              AND r.type = (v_item->>'roomTypeName')
              AND r.number NOT IN (
                SELECT res.room_number
                FROM reservations res
                WHERE res.room_number IS NOT NULL
                  AND res.room_type = (v_item->>'roomTypeName')
                  AND res.check_in_date < v_segment_check_out
                  AND res.check_out_date > v_segment_check_in
              )
            LIMIT 1;
          END IF;

          IF v_assigned_room IS NULL THEN
            SELECT r.number INTO v_assigned_room
            FROM rooms r
            WHERE r.type = (v_item->>'roomTypeName')
              AND r.status <> 'Out of Order'
              AND r.number NOT IN (
                SELECT res.room_number
                FROM reservations res
                WHERE res.room_number IS NOT NULL
                  AND res.room_type = (v_item->>'roomTypeName')
                  AND res.check_in_date < v_segment_check_out
                  AND res.check_out_date > v_segment_check_in
              )
            ORDER BY (r.status = 'Vacant Clean') DESC, r.number
            LIMIT 1;
          END IF;

          v_reservation_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
          v_reservation_ids := v_reservation_ids || v_reservation_id;

          INSERT INTO reservations (
            id, idempotency_key, guest_id,
            guest_name, guest_email, guest_phone, guest_status,
            room_type, room_type_id, room_number,
            check_in_date, check_out_date,
            adults, children,
            status, rate, total_amount,
            channel, payment_status, notes,
            tax_percent, service_charge_percent,
            package_ids, guest_service_ids,
            charges, payments,
            is_group, group_booking_id, booking_group_id,
            tour_operator_id
          ) VALUES (
            v_reservation_id,
            CASE WHEN v_first_res THEN p_idempotency_key ELSE NULL END,
            v_room_guest_id,
            CASE WHEN v_is_group THEN
              CASE WHEN v_room_index = 1 THEN p_guest_name ELSE p_guest_name || ' (Room ' || v_room_index || ')' END
            ELSE p_guest_name END,
            CASE WHEN v_is_group THEN
              CASE WHEN v_room_index = 1 THEN p_guest_email ELSE REPLACE(p_guest_email, '@', '+room' || v_room_index || '@') END
            ELSE p_guest_email END,
            COALESCE(p_guest_phone,''), 'Regular',
            (v_item->>'roomTypeName'), (v_item->>'roomTypeId'), v_assigned_room,
            v_segment_check_in, v_segment_check_out,
            COALESCE((v_item->>'adults')::INTEGER, 1),
            COALESCE((v_item->>'children')::INTEGER, 0),
            COALESCE(p_status, 'Waitlisted'),
            (v_item->>'rate')::NUMERIC,
            v_item_total,
            COALESCE(p_channel, 'Direct Website'), 'Unpaid',
            COALESCE(p_special_requests,''),
            p_tax_percent, p_svc_charge_pct,
            p_package_ids, p_guest_service_ids,
            v_charges, '[]'::jsonb,
            v_is_group,
            v_group_id, v_group_id,
            p_operator_id
          );

          v_first_res := FALSE;
        END LOOP;
      END LOOP;
    END;
  END LOOP;

  -- â”€â”€ Audit event â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  INSERT INTO audit_events (id, user_id, action, entity_type, entity_id, module, details)
  VALUES (
    gen_random_uuid()::text, NULL, 'public_booking.atomic_created',
    CASE WHEN v_is_group THEN 'GroupBooking' ELSE 'Reservation' END,
    COALESCE(v_group_id, v_reservation_ids[1]),
    'public_booking',
    jsonb_build_object(
      'guestEmail',       p_guest_email,
      'reservationIds',   v_reservation_ids,
      'guestIds',         v_guest_ids,
      'groupId',          v_group_id,
      'checkIn',          p_check_in,
      'checkOut',         p_check_out,
      'idempotencyKey',   p_idempotency_key,
      'roomCount',        v_total_qty
    )
  );

  RETURN jsonb_build_object(
    'success',        TRUE,
    'idempotent',     FALSE,
    'reservationIds', v_reservation_ids,
    'guestIds',       v_guest_ids,
    'groupId',        v_group_id
  );
END;
$function$;

-- END: 050_per_night_room_assignments.sql

-- =========================================================================
-- Migration: 051_room_nights_column.sql
-- =========================================================================
-- Migration: Add per-night room assignments column to reservations
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS room_nights jsonb DEFAULT NULL;

COMMENT ON COLUMN public.reservations.room_nights IS
  'Per-night room selection: array of nights, each an array of selected room numbers (supports room moves and multi-room bookings).';

-- END: 051_room_nights_column.sql

-- =========================================================================
-- Migration: 052_payment_receipts_storage.sql
-- =========================================================================
/*
  Storage bucket for guest folio payment receipt screenshots (Front Desk billing terminal).
  Public bucket so receipt images can be previewed directly via public URL.
*/

insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', true)
on conflict (id) do nothing;

drop policy if exists "payment_receipts_public_read" on storage.objects;
create policy "payment_receipts_public_read"
  on storage.objects for select
  using (bucket_id = 'payment-receipts');

drop policy if exists "payment_receipts_public_write" on storage.objects;
create policy "payment_receipts_public_write"
  on storage.objects for insert
  with check (bucket_id = 'payment-receipts');

/*
  Add receipt_url column to folio_payments table for storing uploaded receipt screenshot URLs
*/

alter table folio_payments
add column if not exists receipt_url text;

/*
  Update post_folio_payment function to accept and store receipt_url
*/

create or replace function post_folio_payment(
  p_folio_id text,
  p_amount numeric,
  p_payment_method text,
  p_reference text,
  p_user_id text,
  p_receipt_url text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_now timestamp with time zone := now();
begin
  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  if v_folio.status != 'Open' then
    return jsonb_build_object('success', false, 'error', 'Folio is not open');
  end if;

  -- Insert payment with receipt URL
  insert into folio_payments (
    id, folio_id, amount, payment_method, reference_number, cashier_id, created_by, receipt_url
  ) values (
    gen_random_uuid()::text, p_folio_id, p_amount, p_payment_method, p_reference, p_user_id, p_user_id, p_receipt_url
  );

  -- Update folio balance
  update folios
  set balance = balance - p_amount,
      total_payments = total_payments + p_amount,
      updated_at = v_now
  where id = p_folio_id;

  -- Update reservation payment status if folio balance is cleared
  if (v_folio.balance - p_amount) <= 0 then
    update reservations
    set payment_status = 'Paid'
    where id = v_folio.reservation_id;
  else
    update reservations
    set payment_status = 'Partial'
    where id = v_folio.reservation_id;
  end if;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'folio.payment.add', 'folio', p_folio_id, 'frontoffice',
    jsonb_build_object('amount', p_amount, 'method', p_payment_method, 'receiptUrl', p_receipt_url)
  );

  return jsonb_build_object('success', true, 'folioId', p_folio_id, 'newBalance', v_folio.balance - p_amount);
end;
$$;

-- END: 052_payment_receipts_storage.sql

-- =========================================================================
-- Migration: 053_pos_receipts_storage.sql
-- =========================================================================
/*
  Add receipt_url column to all POS sales tables for storing payment receipt screenshots
  Uses the same payment-receipts storage bucket created in migration 052
*/

-- Gift Shop POS
alter table gift_shop_sales
add column if not exists receipt_url text;

-- Bar POS
alter table bar_sales
add column if not exists receipt_url text;

-- Restaurant POS
alter table restaurant_sales
add column if not exists receipt_url text;

-- Room Service
alter table room_service_orders
add column if not exists receipt_url text;

-- END: 053_pos_receipts_storage.sql

-- =========================================================================
-- Migration: 053b_payment_safeguards.sql
-- =========================================================================
-- ============================================================
-- Payment Safeguards: Prevent duplicate and extra payments on folios
-- ============================================================

-- 1. Add unique constraint on reference_number per folio to prevent duplicate references
-- Note: Allow NULL reference numbers (cash payments typically don't have references)
ALTER TABLE folio_payments
DROP CONSTRAINT IF EXISTS folio_payments_reference_folio_unique;

CREATE UNIQUE INDEX folio_payments_reference_folio_idx 
ON folio_payments(folio_id, reference_number) 
WHERE reference_number IS NOT NULL AND is_voided = false;

-- 2. Add idempotency tracking for payment operations
CREATE TABLE IF NOT EXISTS payment_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL UNIQUE,
  folio_id text NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '24 hours',
  processed_payment_id text,
  created_by text
);

CREATE INDEX idx_payment_idempotency_key ON payment_idempotency(idempotency_key);
CREATE INDEX idx_payment_idempotency_expires ON payment_idempotency(expires_at);

-- 3. Update post_folio_payment function with comprehensive safeguards
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT oid FROM pg_proc WHERE proname = 'post_folio_payment'
  LOOP
    EXECUTE 'DROP FUNCTION ' || func_record.oid::regprocedure || ' CASCADE';
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION post_folio_payment(
  p_folio_id text,
  p_amount numeric,
  p_payment_method text,
  p_reference text,
  p_user_id text,
  p_receipt_url text default null,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_now timestamp with time zone := now();
  v_duplicate_ref boolean;
  v_existing_idempotency payment_idempotency%rowtype;
  v_outstanding_balance numeric;
begin
  -- Idempotency check: if this key was already processed, return the existing result
  if p_idempotency_key is not null then
    select * into v_existing_idempotency
    from payment_idempotency
    where idempotency_key = p_idempotency_key
      and folio_id = p_folio_id
      and amount = p_amount
      and payment_method = p_payment_method
      and expires_at > now()
    for update;
    
    if found then
      if v_existing_idempotency.processed_payment_id is not null then
        -- Return the existing payment result
        return jsonb_build_object(
          'success', true,
          'folioId', p_folio_id,
          'paymentId', v_existing_idempotency.processed_payment_id,
          'idempotent', true,
          'message', 'Payment already processed (idempotent request)'
        );
      else
        -- Idempotency key exists but no payment processed - this shouldn't happen
        return jsonb_build_object('success', false, 'error', 'Idempotency key conflict');
      end if;
    end if;
  end if;

  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  if v_folio.status != 'Open' then
    return jsonb_build_object('success', false, 'error', 'Folio is not open');
  end if;

  -- Calculate outstanding balance (total charges - total payments)
  select coalesce(sum(amount), 0) into v_outstanding_balance
  from folio_lines
  where folio_id = p_folio_id and is_voided = false;

  v_outstanding_balance := v_outstanding_balance - (
    select coalesce(sum(amount), 0)
    from folio_payments
    where folio_id = p_folio_id and is_voided = false
  );

  -- Safeguard 1: Prevent overpayment
  if p_amount > v_outstanding_balance then
    return jsonb_build_object(
      'success', false,
      'error', 'Payment amount exceeds outstanding balance',
      'outstandingBalance', v_outstanding_balance,
      'requestedAmount', p_amount
    );
  end if;

  -- Safeguard 2: Prevent negative payments
  if p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Payment amount must be positive');
  end if;

  -- Safeguard 3: Check for duplicate reference number within the same folio
  if p_reference is not null then
    select exists(
      select 1 from folio_payments
      where folio_id = p_folio_id
        and reference_number = p_reference
        and is_voided = false
    ) into v_duplicate_ref;
    
    if v_duplicate_ref then
      return jsonb_build_object(
        'success', false,
        'error', 'Duplicate reference number for this folio',
        'reference', p_reference
      );
    end if;
  end if;

  -- Safeguard 4: Prevent rapid duplicate payments (same amount and method within 30 seconds)
  if exists(
    select 1 from folio_payments
    where folio_id = p_folio_id
      and amount = p_amount
      and payment_method = p_payment_method
      and is_voided = false
      and created_at > v_now - interval '30 seconds'
  ) then
    return jsonb_build_object(
      'success', false,
      'error', 'Duplicate payment detected (same amount and method within 30 seconds)',
      'suggestion', 'Please wait before submitting another payment or verify if payment was already processed'
    );
  end if;

  -- Insert payment with receipt URL
  insert into folio_payments (
    id, folio_id, amount, payment_method, reference_number, cashier_id, created_by, receipt_url
  ) values (
    gen_random_uuid()::text, p_folio_id, p_amount, p_payment_method, p_reference, p_user_id, p_user_id, p_receipt_url
  ) returning id into v_existing_idempotency.processed_payment_id;

  -- Update folio balance
  update folios
  set balance = balance - p_amount,
      total_payments = total_payments + p_amount,
      updated_at = v_now
  where id = p_folio_id;

  -- Update reservation payment status if folio balance is cleared
  if (v_folio.balance - p_amount) <= 0 then
    update reservations
    set payment_status = 'Paid'
    where id = v_folio.reservation_id;
  else
    update reservations
    set payment_status = 'Partial'
    where id = v_folio.reservation_id;
  end if;

  -- Record idempotency key if provided
  if p_idempotency_key is not null then
    insert into payment_idempotency (
      idempotency_key, folio_id, amount, payment_method, processed_payment_id, created_by
    ) values (
      p_idempotency_key, p_folio_id, p_amount, p_payment_method, v_existing_idempotency.processed_payment_id, p_user_id
    );
  end if;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'folio.payment.add', 'folio', p_folio_id, 'frontoffice',
    jsonb_build_object(
      'amount', p_amount, 
      'method', p_payment_method, 
      'receiptUrl', p_receipt_url,
      'reference', p_reference,
      'idempotencyKey', p_idempotency_key
    )
  );

  return jsonb_build_object('success', true, 'folioId', p_folio_id, 'paymentId', v_existing_idempotency.processed_payment_id, 'newBalance', v_folio.balance - p_amount);
end;
$$;

-- 4. Create function to clean up expired idempotency keys (run periodically)
DROP FUNCTION IF EXISTS cleanup_expired_idempotency();
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency()
returns void
language plpgsql
as $$
begin
  delete from payment_idempotency
  where expires_at < now();
  
  -- Log cleanup
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, 'system', 'idempotency.cleanup', 'payment_idempotency', null, 'system',
    jsonb_build_object('timestamp', now())
  );
end;
$$;

-- 5. Enable RLS on payment_idempotency
ALTER TABLE payment_idempotency ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_payment_idempotency" ON payment_idempotency;
CREATE POLICY "staff_payment_idempotency"
  ON payment_idempotency FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

GRANT EXECUTE ON FUNCTION post_folio_payment TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_idempotency TO authenticated;

-- END: 053b_payment_safeguards.sql

-- =========================================================================
-- Migration: 054_bank_account_tracking.sql
-- =========================================================================
-- ============================================================
-- Bank Account Tracking for Sales and Expenses
-- ============================================================
-- This migration adds comprehensive bank account tracking to track
-- which bank account receives payments (sales) and which bank account 
-- pays for expenses

-- 1. Create bank_accounts table to store structured bank account data
CREATE TABLE IF NOT EXISTS bank_accounts (
  id text PRIMARY KEY,
  account_name text NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('Checking', 'Savings', 'Current', 'Business', 'Corporate')),
  currency text NOT NULL DEFAULT 'ETB',
  is_active boolean NOT NULL DEFAULT true,
  is_default_for_sales boolean NOT NULL DEFAULT false,
  is_default_for_expenses boolean NOT NULL DEFAULT false,
  swift_bic_code text,
  branch_name text,
  branch_address text,
  description text,
  opening_balance numeric NOT NULL DEFAULT 0.00,
  current_balance numeric NOT NULL DEFAULT 0.00,
  created_by text REFERENCES system_users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(account_number, bank_name)
);

-- Create indexes for bank_accounts
CREATE INDEX IF NOT EXISTS idx_bank_accounts_is_active ON bank_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_type ON bank_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_defaults ON bank_accounts(is_default_for_sales, is_default_for_expenses);

-- Enable RLS on bank_accounts
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can read bank accounts
DROP POLICY IF EXISTS "bank_accounts_read" ON bank_accounts;
CREATE POLICY "bank_accounts_read" ON bank_accounts FOR SELECT TO authenticated USING (true);

-- Policy: only finance/admin users can insert/update/delete bank accounts
DROP POLICY IF EXISTS "bank_accounts_write" ON bank_accounts;
CREATE POLICY "bank_accounts_write" ON bank_accounts FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM system_users 
    WHERE system_users.id = auth.uid()::text 
    AND (system_users.role IN ('Admin', 'Finance Manager', 'General Manager') 
         OR system_users.department = 'Finance')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM system_users 
    WHERE system_users.id = auth.uid()::text 
    AND (system_users.role IN ('Admin', 'Finance Manager', 'General Manager') 
         OR system_users.department = 'Finance')
  )
);

-- 2. Add bank_account_id to folio_payments for sales tracking
ALTER TABLE folio_payments 
ADD COLUMN IF NOT EXISTS bank_account_id text REFERENCES bank_accounts(id) ON DELETE SET NULL;

-- Create index for bank_account_id in folio_payments
CREATE INDEX IF NOT EXISTS idx_folio_payments_bank_account ON folio_payments(bank_account_id);

-- 3. Add bank_account_id to expense_requests for expense tracking
ALTER TABLE expense_requests 
ADD COLUMN IF NOT EXISTS bank_account_id text REFERENCES bank_accounts(id) ON DELETE SET NULL;

-- Create index for bank_account_id in expense_requests
CREATE INDEX IF NOT EXISTS idx_expense_requests_bank_account ON expense_requests(bank_account_id);

-- Add payment_date to expense_requests if it doesn't exist (for tracking when expense was paid)
ALTER TABLE expense_requests 
ADD COLUMN IF NOT EXISTS payment_date date;

ALTER TABLE expense_requests 
ADD COLUMN IF NOT EXISTS payment_method text;

ALTER TABLE expense_requests 
ADD COLUMN IF NOT EXISTS payment_reference text;

-- 4. Update post_folio_payment function to accept bank_account_id
DROP FUNCTION IF EXISTS post_folio_payment(text, numeric, text, text, text, text, text);

CREATE OR REPLACE FUNCTION post_folio_payment(
  p_folio_id text,
  p_amount numeric,
  p_payment_method text,
  p_reference text,
  p_user_id text,
  p_receipt_url text default null,
  p_idempotency_key text default null,
  p_bank_account_id text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_now timestamp with time zone := now();
  v_duplicate_ref boolean;
  v_existing_idempotency payment_idempotency%rowtype;
  v_outstanding_balance numeric;
begin
  -- Idempotency check: if this key was already processed, return the existing result
  if p_idempotency_key is not null then
    select * into v_existing_idempotency
    from payment_idempotency
    where idempotency_key = p_idempotency_key
      and folio_id = p_folio_id
      and amount = p_amount
      and payment_method = p_payment_method
      and expires_at > now()
    for update;
    
    if found then
      if v_existing_idempotency.processed_payment_id is not null then
        -- Return the existing payment result
        return jsonb_build_object(
          'success', true,
          'folioId', p_folio_id,
          'paymentId', v_existing_idempotency.processed_payment_id,
          'idempotent', true,
          'message', 'Payment already processed (idempotent request)'
        );
      else
        -- Idempotency key exists but no payment processed - this shouldn't happen
        return jsonb_build_object('success', false, 'error', 'Idempotency key conflict');
      end if;
    end if;
  end if;

  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  if v_folio.status != 'Open' then
    return jsonb_build_object('success', false, 'error', 'Folio is not open');
  end if;

  -- Calculate outstanding balance (total charges - total payments)
  -- Note: Over-balance validation is now handled at the API endpoint level
  -- to properly support split payments. Individual split amounts are not
  -- validated against the balance here since the total is validated upstream.
  select coalesce(sum(amount), 0) into v_outstanding_balance
  from folio_lines
  where folio_id = p_folio_id and is_voided = false;

  v_outstanding_balance := v_outstanding_balance - (
    select coalesce(sum(amount), 0)
    from folio_payments
    where folio_id = p_folio_id and is_voided = false
  );

  -- Safeguard 1: Prevent negative payments
  if p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Payment amount must be positive');
  end if;

  -- Safeguard 3: Check for duplicate reference number within the same folio
  if p_reference is not null then
    select exists(
      select 1 from folio_payments
      where folio_id = p_folio_id
        and reference_number = p_reference
        and is_voided = false
    ) into v_duplicate_ref;
    
    if v_duplicate_ref then
      return jsonb_build_object(
        'success', false,
        'error', 'Duplicate reference number for this folio',
        'reference', p_reference
      );
    end if;
  end if;

  -- Safeguard 4: Prevent rapid duplicate payments (same amount and method within 30 seconds)
  if exists(
    select 1 from folio_payments
    where folio_id = p_folio_id
      and amount = p_amount
      and payment_method = p_payment_method
      and is_voided = false
      and created_at > v_now - interval '30 seconds'
  ) then
    return jsonb_build_object(
      'success', false,
      'error', 'Duplicate payment detected (same amount and method within 30 seconds)',
      'suggestion', 'Please wait before submitting another payment or verify if payment was already processed'
    );
  end if;

  -- Validate bank_account_id if provided
  if p_bank_account_id is not null then
    if not exists (select 1 from bank_accounts where id = p_bank_account_id and is_active = true) then
      return jsonb_build_object('success', false, 'error', 'Invalid or inactive bank account');
    end if;
  end if;

  -- Insert payment with receipt URL and bank account
  insert into folio_payments (
    id, folio_id, amount, payment_method, reference_number, cashier_id, created_by, receipt_url, bank_account_id
  ) values (
    gen_random_uuid()::text, p_folio_id, p_amount, p_payment_method, p_reference, p_user_id, p_user_id, p_receipt_url, p_bank_account_id
  ) returning id into v_existing_idempotency.processed_payment_id;

  -- Update folio balance
  update folios
  set balance = balance - p_amount,
      total_payments = total_payments + p_amount,
      updated_at = v_now
  where id = p_folio_id;

  -- Update bank account balance if bank_account_id provided (for sales/revenue)
  if p_bank_account_id is not null then
    update bank_accounts
    set current_balance = current_balance + p_amount,
        updated_at = v_now
    where id = p_bank_account_id;
  end if;

  -- Update reservation payment status if folio balance is cleared
  if (v_folio.balance - p_amount) <= 0 then
    update reservations
    set payment_status = 'Paid'
    where id = v_folio.reservation_id;
  else
    update reservations
    set payment_status = 'Partial'
    where id = v_folio.reservation_id;
  end if;

  -- Record idempotency key if provided
  if p_idempotency_key is not null then
    insert into payment_idempotency (
      idempotency_key, folio_id, amount, payment_method, processed_payment_id, created_by
    ) values (
      p_idempotency_key, p_folio_id, p_amount, p_payment_method, v_existing_idempotency.processed_payment_id, p_user_id
    );
  end if;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'folio.payment.add', 'folio', p_folio_id, 'frontoffice',
    jsonb_build_object(
      'amount', p_amount, 
      'method', p_payment_method, 
      'receiptUrl', p_receipt_url,
      'reference', p_reference,
      'idempotencyKey', p_idempotency_key,
      'bankAccountId', p_bank_account_id
    )
  );

  return jsonb_build_object('success', true, 'folioId', p_folio_id, 'paymentId', v_existing_idempotency.processed_payment_id, 'newBalance', v_folio.balance - p_amount);
end;
$$;

-- 5. Create function to update expense payment with bank account tracking
CREATE OR REPLACE FUNCTION update_expense_payment(
  p_expense_id text,
  p_bank_account_id text,
  p_payment_method text,
  p_payment_reference text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_expense expense_requests%rowtype;
  v_now timestamp with time zone := now();
begin
  -- Lock and validate expense
  select * into v_expense
  from expense_requests
  where id = p_expense_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Expense request not found');
  end if;

  if v_expense.status != 'Approved' then
    return jsonb_build_object('success', false, 'error', 'Expense must be approved before payment');
  end if;

  -- Validate bank_account_id
  if p_bank_account_id is not null then
    if not exists (select 1 from bank_accounts where id = p_bank_account_id and is_active = true) then
      return jsonb_build_object('success', false, 'error', 'Invalid or inactive bank account');
    end if;
  end if;

  -- Update expense with payment details
  update expense_requests
  set 
    bank_account_id = p_bank_account_id,
    payment_date = v_now::date,
    payment_method = p_payment_method,
    payment_reference = p_payment_reference,
    status = 'Paid'
  where id = p_expense_id;

  -- Update bank account balance (deduct for expenses)
  if p_bank_account_id is not null then
    update bank_accounts
    set current_balance = current_balance - v_expense.amount,
        updated_at = v_now
    where id = p_bank_account_id;
  end if;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'expense.payment', 'expense_request', p_expense_id, 'finance',
    jsonb_build_object(
      'amount', v_expense.amount,
      'paymentMethod', p_payment_method,
      'paymentReference', p_payment_reference,
      'bankAccountId', p_bank_account_id
    )
  );

  return jsonb_build_object('success', true, 'expenseId', p_expense_id, 'status', 'Paid');
end;
$$;

-- 6. Create function to get bank account transaction summary
CREATE OR REPLACE FUNCTION get_bank_account_summary(p_bank_account_id text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_bank_account bank_accounts%rowtype;
  v_total_incoming numeric;
  v_total_outgoing numeric;
  v_transaction_count integer;
begin
  -- Get bank account details
  select * into v_bank_account
  from bank_accounts
  where id = p_bank_account_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Bank account not found');
  end if;

  -- Calculate total incoming (sales/payments received)
  select coalesce(sum(amount), 0) into v_total_incoming
  from folio_payments
  where bank_account_id = p_bank_account_id and is_voided = false;

  -- Calculate total outgoing (expenses paid)
  select coalesce(sum(amount), 0) into v_total_outgoing
  from expense_requests
  where bank_account_id = p_bank_account_id and status = 'Paid';

  -- Count total transactions
  select 
    (select count(*) from folio_payments where bank_account_id = p_bank_account_id and is_voided = false) +
    (select count(*) from expense_requests where bank_account_id = p_bank_account_id and status = 'Paid')
  into v_transaction_count;

  return jsonb_build_object(
    'success', true,
    'bankAccount', jsonb_build_object(
      'id', v_bank_account.id,
      'accountName', v_bank_account.account_name,
      'bankName', v_bank_account.bank_name,
      'accountNumber', v_bank_account.account_number,
      'accountType', v_bank_account.account_type,
      'currency', v_bank_account.currency,
      'currentBalance', v_bank_account.current_balance,
      'isActive', v_bank_account.is_active
    ),
    'summary', jsonb_build_object(
      'totalIncoming', v_total_incoming,
      'totalOutgoing', v_total_outgoing,
      'netFlow', v_total_incoming - v_total_outgoing,
      'transactionCount', v_transaction_count
    )
  );
end;
$$;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION post_folio_payment TO authenticated;
GRANT EXECUTE ON FUNCTION update_expense_payment TO authenticated;
GRANT EXECUTE ON FUNCTION get_bank_account_summary TO authenticated;

-- 8. Add helpful comment
COMMENT ON TABLE bank_accounts IS 'Stores bank account information for tracking sales receipts and expense payments';
COMMENT ON COLUMN folio_payments.bank_account_id IS 'References which bank account received this payment';
COMMENT ON COLUMN expense_requests.bank_account_id IS 'References which bank account was used to pay this expense';

-- END: 054_bank_account_tracking.sql

-- =========================================================================
-- Migration: 055_usali_coa_integration.sql
-- =========================================================================
-- ============================================================
-- USALI COA Integration for Bank Account Tracking
-- ============================================================
-- This migration integrates the bank_accounts table with the Chart of Accounts
-- system following USALI (Uniform System of Accounts for the Lodging Industry) standards
-- and implements proper double-entry posting for bank transactions.

-- 1. Add coa_account_code field to bank_accounts to link with Chart of Accounts
ALTER TABLE bank_accounts 
ADD COLUMN IF NOT EXISTS coa_account_code text REFERENCES chart_of_accounts(code) ON DELETE SET NULL;

-- 2. Add department field for USALI departmental tagging
ALTER TABLE bank_accounts
ADD COLUMN IF NOT EXISTS department text DEFAULT 'Finance';

-- 3. Update Chart of Accounts table to support department field if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chart_of_accounts' 
    AND column_name = 'department'
  ) THEN
    ALTER TABLE chart_of_accounts ADD COLUMN department text;
  END IF;
END $$;

-- 4. Update bank_accounts to align with USALI asset account numbering (1000-1999 range)
-- Create a function to auto-assign COA account codes if not provided
CREATE OR REPLACE FUNCTION assign_coa_account_code()
RETURNS trigger AS $$
DECLARE
  v_account_type text;
BEGIN
  -- Only assign if coa_account_code is null
  IF NEW.coa_account_code IS NULL THEN
    -- Determine account type based on account_type
    CASE NEW.account_type
      WHEN 'Checking' THEN v_account_type := '1020';
      WHEN 'Savings' THEN v_account_type := '1030';
      WHEN 'Business' THEN v_account_type := '1040';
      WHEN 'Corporate' THEN v_account_type := '1050';
      WHEN 'Current' THEN v_account_type := '1060';
      ELSE v_account_type := '1010';
    END CASE;

    NEW.coa_account_code := v_account_type;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to auto-assign COA account codes
DROP TRIGGER IF EXISTS assign_coa_code_trigger ON bank_accounts;
CREATE TRIGGER assign_coa_code_trigger
  BEFORE INSERT ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION assign_coa_account_code();

-- 6. Ensure Chart of Accounts has proper USALI structure for bank accounts
-- Insert standard bank account COA codes if they don't exist
INSERT INTO chart_of_accounts (id, code, name, category, sub_category, balance, currency, is_active)
VALUES 
  (gen_random_uuid()::text, '1010', 'Petty Cash', 'Asset', 'Cash', 0, 'ETB', true),
  (gen_random_uuid()::text, '1020', 'Bank - CBE', 'Asset', 'Bank', 0, 'ETB', true),
  (gen_random_uuid()::text, '1030', 'Bank - Awash', 'Asset', 'Bank', 0, 'ETB', true),
  (gen_random_uuid()::text, '1040', 'Bank - Business Checking', 'Asset', 'Bank', 0, 'ETB', true),
  (gen_random_uuid()::text, '1050', 'Bank - Corporate', 'Asset', 'Bank', 0, 'ETB', true),
  (gen_random_uuid()::text, '1060', 'Bank - Current Account', 'Asset', 'Bank', 0, 'ETB', true),
  (gen_random_uuid()::text, '1100', 'Accounts Receivable - Guests', 'Asset', 'Receivable', 0, 'ETB', true),
  (gen_random_uuid()::text, '1101', 'Accounts Receivable - Corporate', 'Asset', 'Receivable', 0, 'ETB', true),
  (gen_random_uuid()::text, '1200', 'VAT Receivable', 'Asset', 'Receivable', 0, 'ETB', true)
ON CONFLICT (code) DO NOTHING;

-- 7. Add proper USALI revenue and expense accounts if they don't exist
INSERT INTO chart_of_accounts (id, code, name, category, sub_category, department, balance, currency, is_active)
VALUES 
  -- Revenue Accounts (4000-4999 range)
  (gen_random_uuid()::text, '4010', 'Room Revenue', 'Revenue', 'Rooms', 'Rooms', 0, 'ETB', true),
  (gen_random_uuid()::text, '4020', 'F&B Revenue - Restaurant', 'Revenue', 'Food & Beverage', 'F&B', 0, 'ETB', true),
  (gen_random_uuid()::text, '4030', 'F&B Revenue - Bar', 'Revenue', 'Food & Beverage', 'F&B', 0, 'ETB', true),
  (gen_random_uuid()::text, '4040', 'Other Operated Departments', 'Revenue', 'Other', 'Other', 0, 'ETB', true),
  (gen_random_uuid()::text, '4050', 'Miscellaneous Revenue', 'Revenue', 'Other', 'Other', 0, 'ETB', true),
  
  -- Expense Accounts (5000-5999 range)
  (gen_random_uuid()::text, '5010', 'Cost of Food & Beverage', 'Expense', 'Cost of Sales', 'F&B', 0, 'ETB', true),
  (gen_random_uuid()::text, '5020', 'Payroll - Rooms Department', 'Expense', 'Payroll', 'Rooms', 0, 'ETB', true),
  (gen_random_uuid()::text, '5030', 'Payroll - F&B Department', 'Expense', 'Payroll', 'F&B', 0, 'ETB', true),
  (gen_random_uuid()::text, '5040', 'Utilities', 'Expense', 'Operating', 'General', 0, 'ETB', true),
  (gen_random_uuid()::text, '5050', 'Repairs & Maintenance', 'Expense', 'Operating', 'General', 0, 'ETB', true),
  (gen_random_uuid()::text, '5090', 'General & Administrative', 'Expense', 'Operating', 'General', 0, 'ETB', true),
  
  -- Liability Accounts (2000-2999 range)
  (gen_random_uuid()::text, '2010', 'Accounts Payable - Suppliers', 'Liability', 'Payable', 'Finance', 0, 'ETB', true),
  (gen_random_uuid()::text, '2020', 'VAT Payable', 'Liability', 'Tax', 'Finance', 0, 'ETB', true),
  (gen_random_uuid()::text, '2030', 'Guest Deposits & Advances', 'Liability', 'Deposit', 'Front Office', 0, 'ETB', true),
  (gen_random_uuid()::text, '2040', 'Payroll Payable', 'Liability', 'Payable', 'HR', 0, 'ETB', true),
  
  -- Equity Accounts (3000-3999 range)
  (gen_random_uuid()::text, '3010', 'Owner''s Equity', 'Equity', 'Equity', 'Finance', 0, 'ETB', true),
  (gen_random_uuid()::text, '3020', 'Retained Earnings', 'Equity', 'Equity', 'Finance', 0, 'ETB', true)
ON CONFLICT (code) DO NOTHING;

-- 8. Update existing bank accounts to link with appropriate COA codes
UPDATE bank_accounts
SET coa_account_code = 
  CASE 
    WHEN bank_name ILIKE '%CBE%' THEN '1020'
    WHEN bank_name ILIKE '%Awash%' THEN '1030'
    WHEN account_type = 'Business' THEN '1040'
    WHEN account_type = 'Corporate' THEN '1050'
    WHEN account_type = 'Current' THEN '1060'
    ELSE '1010'
  END
WHERE coa_account_code IS NULL;

-- 9. Add helpful comments
COMMENT ON COLUMN bank_accounts.coa_account_code IS 'Links to Chart of Accounts code for proper double-entry posting';
COMMENT ON COLUMN bank_accounts.department IS 'USALI departmental tagging for reporting';
COMMENT ON TABLE chart_of_accounts IS 'Chart of Accounts following USALI hospitality accounting standards';

-- 10. Create function to sync bank account balance with COA
CREATE OR REPLACE FUNCTION sync_bank_account_balance()
RETURNS trigger AS $$
BEGIN
  -- When bank account balance changes, update corresponding COA account
  IF NEW.coa_account_code IS NOT NULL THEN
    UPDATE chart_of_accounts
    SET balance = NEW.current_balance
    WHERE code = NEW.coa_account_code;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger to sync balances
DROP TRIGGER IF EXISTS sync_bank_balance_trigger ON bank_accounts;
CREATE TRIGGER sync_bank_balance_trigger
  AFTER UPDATE OF current_balance ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION sync_bank_account_balance();

-- 12. Grant execute permissions
GRANT EXECUTE ON FUNCTION assign_coa_account_code TO authenticated;
GRANT EXECUTE ON FUNCTION sync_bank_account_balance TO authenticated;

-- 13. Update post_folio_payment to create proper journal entries following USALI standards
DROP FUNCTION IF EXISTS post_folio_payment_with_journal_entry;

CREATE OR REPLACE FUNCTION post_folio_payment_with_journal_entry(
  p_folio_id text,
  p_amount numeric,
  p_payment_method text,
  p_reference text,
  p_user_id text,
  p_receipt_url text default null,
  p_idempotency_key text default null,
  p_bank_account_id text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_now timestamp with time zone := now();
  v_duplicate_ref boolean;
  v_existing_idempotency payment_idempotency%rowtype;
  v_outstanding_balance numeric;
  v_payment_id text;
  v_bank_account bank_accounts%rowtype;
  v_vat_amount numeric;
  v_vat_rate numeric;
  v_journal_entry_id text;
  v_revenue_account_code text;
  v_vat_account_code text;
begin
  -- Get VAT rate from global settings (default 15% for Ethiopia)
  SELECT COALESCE(tax_percent, 15.0) / 100.0 INTO v_vat_rate
  FROM global_settings
  WHERE id = 'main';

  -- Calculate VAT portion
  v_vat_amount := p_amount * v_vat_rate;
  
  -- Get revenue account code from settings (default 4010 for Room Revenue)
  SELECT COALESCE(revenue_mappings->'roomRevenueAccount', '4010') INTO v_revenue_account_code
  FROM global_settings
  WHERE id = 'main';
  
  -- Get VAT payable account code (default 2020)
  v_vat_account_code := '2020';

  -- Idempotency check
  if p_idempotency_key is not null then
    select * into v_existing_idempotency
    from payment_idempotency
    where idempotency_key = p_idempotency_key
      and folio_id = p_folio_id
      and amount = p_amount
      and payment_method = p_payment_method
      and expires_at > now()
    for update;
    
    if found then
      if v_existing_idempotency.processed_payment_id is not null then
        return jsonb_build_object(
          'success', true,
          'folioId', p_folio_id,
          'paymentId', v_existing_idempotency.processed_payment_id,
          'idempotent', true,
          'message', 'Payment already processed (idempotent request)'
        );
      else
        return jsonb_build_object('success', false, 'error', 'Idempotency key conflict');
      end if;
    end if;
  end if;

  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  if v_folio.status != 'Open' then
    return jsonb_build_object('success', false, 'error', 'Folio is not open');
  end if;

  -- Calculate outstanding balance
  select coalesce(sum(amount), 0) into v_outstanding_balance
  from folio_lines
  where folio_id = p_folio_id and is_voided = false;

  v_outstanding_balance := v_outstanding_balance - (
    select coalesce(sum(amount), 0)
    from folio_payments
    where folio_id = p_folio_id and is_voided = false
  );

  -- Safeguard 1: Prevent overpayment
  if p_amount > v_outstanding_balance then
    return jsonb_build_object(
      'success', false,
      'error', 'Payment amount exceeds outstanding balance',
      'outstandingBalance', v_outstanding_balance,
      'requestedAmount', p_amount
    );
  end if;

  -- Safeguard 2: Prevent negative payments
  if p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Payment amount must be positive');
  end if;

  -- Safeguard 3: Check for duplicate reference
  if p_reference is not null then
    select exists(
      select 1 from folio_payments
      where folio_id = p_folio_id
        and reference_number = p_reference
        and is_voided = false
    ) into v_duplicate_ref;
    
    if v_duplicate_ref then
      return jsonb_build_object(
        'success', false,
        'error', 'Duplicate reference number for this folio',
        'reference', p_reference
      );
    end if;
  end if;

  -- Safeguard 4: Prevent rapid duplicate payments
  if exists(
    select 1 from folio_payments
    where folio_id = p_folio_id
      and amount = p_amount
      and payment_method = p_payment_method
      and is_voided = false
      and created_at > v_now - interval '30 seconds'
  ) then
    return jsonb_build_object(
      'success', false,
      'error', 'Duplicate payment detected (same amount and method within 30 seconds)'
    );
  end if;

  -- Validate bank_account_id if provided
  if p_bank_account_id is not null then
    select * into v_bank_account
    from bank_accounts
    where id = p_bank_account_id and is_active = true;
    
    if not found then
      return jsonb_build_object('success', false, 'error', 'Invalid or inactive bank account');
    end if;
  end if;

  -- Insert payment
  insert into folio_payments (
    id, folio_id, amount, payment_method, reference_number, cashier_id, created_by, receipt_url, bank_account_id
  ) values (
    gen_random_uuid()::text, p_folio_id, p_amount, p_payment_method, p_reference, p_user_id, p_user_id, p_receipt_url, p_bank_account_id
  ) returning id into v_payment_id;

  -- Update folio balance
  update folios
  set balance = balance - p_amount,
      total_payments = total_payments + p_amount,
      updated_at = v_now
  where id = p_folio_id;

  -- Update bank account balance if bank_account_id provided
  if p_bank_account_id is not null then
    update bank_accounts
    set current_balance = current_balance + p_amount,
        updated_at = v_now
    where id = p_bank_account_id;
  end if;

  -- Create journal entry following USALI double-entry standards
  -- Debit: Bank Account (if specified) or Accounts Receivable
  -- Credit: Revenue Account + VAT Payable
  v_journal_entry_id := gen_random_uuid()::text;
  
  insert into journal_entries (
    id, date, reference, description, status, created_by, amount, department
  ) values (
    v_journal_entry_id, 
    v_now::date, 
    'FOLIO-PAY-' || v_payment_id,
    'Folio Payment - Room ' || v_folio.reservation_id,
    'Posted',
    p_user_id,
    p_amount,
    'Rooms'
  );

  -- Debit leg: Bank account or Accounts Receivable
  insert into journal_lines (
    id, journal_id, account_id, account_name, description, debit, credit
  ) values (
    gen_random_uuid()::text,
    v_journal_entry_id,
    COALESCE(v_bank_account.coa_account_code, '1100'),
    COALESCE(v_bank_account.bank_name, 'Accounts Receivable'),
    'Payment received for folio ' || p_folio_id,
    p_amount,
    0
  );

  -- Credit leg: Revenue account (excluding VAT)
  insert into journal_lines (
    id, journal_id, account_id, account_name, description, debit, credit
  ) values (
    gen_random_uuid()::text,
    v_journal_entry_id,
    v_revenue_account_code,
    'Room Revenue',
    'Room revenue from folio ' || p_folio_id,
    0,
    p_amount - v_vat_amount
  );

  -- Credit leg: VAT Payable
  insert into journal_lines (
    id, journal_id, account_id, account_name, description, debit, credit
  ) values (
    gen_random_uuid()::text,
    v_journal_entry_id,
    v_vat_account_code,
    'VAT Payable',
    'VAT on folio payment ' || p_folio_id,
    0,
    v_vat_amount
  );

  -- Update Chart of Accounts balances
  -- Debit bank/AR increases balance, Credit revenue/VAT decreases balance
  update chart_of_accounts
  set balance = balance + p_amount
  where code = COALESCE(v_bank_account.coa_account_code, '1100');

  update chart_of_accounts
  set balance = balance - (p_amount - v_vat_amount)
  where code = v_revenue_account_code;

  update chart_of_accounts
  set balance = balance - v_vat_amount
  where code = v_vat_account_code;

  -- Update reservation payment status
  if (v_folio.balance - p_amount) <= 0 then
    update reservations
    set payment_status = 'Paid'
    where id = v_folio.reservation_id;
  else
    update reservations
    set payment_status = 'Partial'
    where id = v_folio.reservation_id;
  end if;

  -- Record idempotency key if provided
  if p_idempotency_key is not null then
    insert into payment_idempotency (
      idempotency_key, folio_id, amount, payment_method, processed_payment_id, created_by
    ) values (
      p_idempotency_key, p_folio_id, p_amount, p_payment_method, v_payment_id, p_user_id
    );
  end if;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'folio.payment.add', 'folio', p_folio_id, 'frontoffice',
    jsonb_build_object(
      'amount', p_amount, 
      'method', p_payment_method, 
      'receiptUrl', p_receipt_url,
      'reference', p_reference,
      'idempotencyKey', p_idempotency_key,
      'bankAccountId', p_bank_account_id,
      'journalEntryId', v_journal_entry_id,
      'vatAmount', v_vat_amount,
      'coaAccountCode', v_bank_account.coa_account_code
    )
  );

  return jsonb_build_object(
    'success', true, 
    'folioId', p_folio_id, 
    'paymentId', v_payment_id,
    'journalEntryId', v_journal_entry_id,
    'newBalance', v_folio.balance - p_amount,
    'vatAmount', v_vat_amount
  );
end;
$$;

-- 14. Grant execute permission for the new function
GRANT EXECUTE ON FUNCTION post_folio_payment_with_journal_entry TO authenticated;

-- END: 055_usali_coa_integration.sql

-- =========================================================================
-- Migration: 056_fix_split_payment_validation.sql
-- =========================================================================
-- Fix split payment validation: Move over-balance check to API endpoint level
-- This allows split payments to be validated as a total rather than per-split

DROP FUNCTION IF EXISTS post_folio_payment(text, numeric, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION post_folio_payment(
  p_folio_id text,
  p_amount numeric,
  p_payment_method text,
  p_reference text,
  p_user_id text,
  p_receipt_url text default null,
  p_idempotency_key text default null,
  p_bank_account_id text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_payment_id text;
  v_now timestamp with time zone := now();
  v_duplicate_ref boolean;
  v_existing_idempotency payment_idempotency%rowtype;
  v_outstanding_balance numeric;
begin
  -- Idempotency check: if this key was already processed, return the existing result
  if p_idempotency_key is not null then
    select * into v_existing_idempotency
    from payment_idempotency
    where idempotency_key = p_idempotency_key
      and folio_id = p_folio_id
      and amount = p_amount
      and payment_method = p_payment_method
      and expires_at > now()
    for update;
    
    if found then
      if v_existing_idempotency.processed_payment_id is not null then
        -- Return the existing payment result
        return jsonb_build_object(
          'success', true,
          'folioId', p_folio_id,
          'paymentId', v_existing_idempotency.processed_payment_id,
          'idempotent', true,
          'message', 'Payment already processed (idempotent request)'
        );
      else
        -- Idempotency key exists but no payment processed - this shouldn't happen
        return jsonb_build_object('success', false, 'error', 'Idempotency key conflict');
      end if;
    end if;
  end if;

  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  if v_folio.status != 'Open' then
    return jsonb_build_object('success', false, 'error', 'Folio is not open');
  end if;

  -- Calculate outstanding balance (total charges - total payments)
  -- Note: Over-balance validation is now handled at the API endpoint level
  -- to properly support split payments. Individual split amounts are not
  -- validated against the balance here since the total is validated upstream.
  select coalesce(sum(amount), 0) into v_outstanding_balance
  from folio_lines
  where folio_id = p_folio_id and is_voided = false;

  v_outstanding_balance := v_outstanding_balance - (
    select coalesce(sum(amount), 0)
    from folio_payments
    where folio_id = p_folio_id and is_voided = false
  );

  -- Safeguard 1: Prevent negative payments
  if p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Payment amount must be positive');
  end if;

  -- Safeguard 2: Check for duplicate reference number within the same folio
  if p_reference is not null then
    select exists(
      select 1 from folio_payments
      where folio_id = p_folio_id
        and reference_number = p_reference
        and is_voided = false
    ) into v_duplicate_ref;
    
    if v_duplicate_ref then
      return jsonb_build_object(
        'success', false,
        'error', 'Duplicate reference number for this folio',
        'reference', p_reference
      );
    end if;
  end if;

  -- Safeguard 3: Prevent rapid duplicate payments (same amount and method within 30 seconds)
  if exists(
    select 1 from folio_payments
    where folio_id = p_folio_id
      and amount = p_amount
      and payment_method = p_payment_method
      and is_voided = false
      and created_at > v_now - interval '30 seconds'
  ) then
    return jsonb_build_object(
      'success', false,
      'error', 'Duplicate payment detected (same amount and method within 30 seconds)',
      'suggestion', 'Please wait before submitting another payment or verify if payment was already processed'
    );
  end if;

  -- Validate bank_account_id if provided
  if p_bank_account_id is not null then
    if not exists (select 1 from bank_accounts where id = p_bank_account_id and is_active = true) then
      return jsonb_build_object('success', false, 'error', 'Invalid or inactive bank account');
    end if;
  end if;

  -- Insert the payment
  insert into folio_payments (
    id,
    folio_id,
    amount,
    payment_method,
    reference_number,
    user_id,
    receipt_url,
    bank_account_id,
    created_at
  ) values (
    gen_random_uuid()::text,
    p_folio_id,
    p_amount,
    p_payment_method,
    p_reference,
    p_user_id,
    p_receipt_url,
    p_bank_account_id,
    v_now
  ) returning id into v_payment_id;

  -- Store idempotency key if provided
  if p_idempotency_key is not null then
    insert into payment_idempotency (
      idempotency_key,
      folio_id,
      amount,
      payment_method,
      processed_payment_id,
      created_at,
      expires_at
    ) values (
      p_idempotency_key,
      p_folio_id,
      p_amount,
      p_payment_method,
      v_payment_id,
      v_now,
      v_now + interval '24 hours'
    );
  end if;

  -- Return success
  return jsonb_build_object(
    'success', true,
    'folioId', p_folio_id,
    'paymentId', v_payment_id,
    'amount', p_amount,
    'paymentMethod', p_payment_method
  );
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function post_folio_payment to authenticated;

-- END: 056_fix_split_payment_validation.sql

-- =========================================================================
-- Migration: 057_fix_folio_duplication_and_balance.sql
-- =========================================================================
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

-- END: 057_fix_folio_duplication_and_balance.sql

-- =========================================================================
-- Migration: 058_checkin_discount_fix.sql
-- =========================================================================
-- Fix: check_in_reservation() never applied reservations.discount_percent
-- when building the initial folio_lines, while the frontend
-- (calculateFolioComponents / calculateReservationFolioMath) always
-- subtracts the discount BEFORE computing service charge and VAT. For any
-- reservation with a discount, this caused the backend folio balance to be
-- permanently higher than what the frontend displayed to the guest,
-- surfacing as a front-end/back-end balance discrepancy and blocked final
-- settlement ("payment won't post" for the last installment).
--
-- This migration re-creates check_in_reservation with discount applied in
-- the same order as the frontend: subtotal -> discount -> + fees -> + VAT.

create or replace function check_in_reservation(
  p_reservation_id text,
  p_room_number text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation reservations%rowtype;
  v_room rooms%rowtype;
  v_folio_id text;
  v_business_date date;
  v_now timestamp with time zone := now();
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  select * into v_reservation
  from reservations
  where id = p_reservation_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  if v_reservation.status not in ('Confirmed', 'Waitlisted') then
    return jsonb_build_object('success', false, 'error', 'Reservation is not eligible for check-in (status: ' || v_reservation.status || ')');
  end if;

  select * into v_room
  from rooms
  where number = p_room_number
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Room not found');
  end if;

  if v_room.status = 'Out of Order' then
    return jsonb_build_object('success', false, 'error', 'Room is Out of Order');
  end if;

  if exists (
    select 1 from reservations
    where room_number = p_room_number
    and status = 'CheckedIn'
    and id != p_reservation_id
  ) then
    return jsonb_build_object('success', false, 'error', 'Room is already occupied');
  end if;

  declare
    v_is_corporate boolean := v_reservation.channel = 'Corporate' or v_reservation.group_booking_id is not null;
    v_folio_a_id text;
    v_folio_b_id text;
    v_primary_folio_id text;
  begin
    if v_is_corporate then
      v_folio_a_id := gen_random_uuid()::text;
      v_folio_b_id := gen_random_uuid()::text;
      insert into folios (id, reservation_id, folio_type, target_folio, status, balance, currency, opened_at, created_by)
      values (v_folio_a_id, p_reservation_id, 'Master', 'A', 'Open', 0.00, 'USD', v_now, p_user_id);
      insert into folios (id, reservation_id, folio_type, target_folio, status, balance, currency, opened_at, created_by)
      values (v_folio_b_id, p_reservation_id, 'Guest', 'B', 'Open', 0.00, 'USD', v_now, p_user_id);
      v_primary_folio_id := v_folio_a_id;
    else
      v_primary_folio_id := gen_random_uuid()::text;
      insert into folios (id, reservation_id, folio_type, target_folio, status, balance, currency, opened_at, created_by)
      values (v_primary_folio_id, p_reservation_id, 'Guest', null, 'Open', 0.00, 'USD', v_now, p_user_id);
    end if;

    declare
      v_base_amount numeric := v_reservation.total_amount;
      v_line_num integer := 1;
      v_fee record;
      v_fee_amount numeric;
      v_non_vat_fees numeric := 0.00;
      v_vat_amount numeric := 0.00;
      v_vat_name text := '';
      v_vat_rate numeric := 0;
      v_vat_account text := '';
      v_sc_total numeric := 0.00;
      v_discount_amount numeric := 0.00;
      v_discounted_base numeric;
    begin
      -- Base room charge (goes to corporate folio A if split, else primary)
      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, target_folio, revenue_account_code, source_module, created_by
      ) values (
        gen_random_uuid()::text, v_primary_folio_id, v_line_num, v_business_date,
        'Room charge - ' || v_reservation.room_type || ' (' || v_reservation.check_in_date || ' to ' || v_reservation.check_out_date || ')',
        v_base_amount, 1, v_base_amount, 'Room',
        case when v_is_corporate then 'A' else null end,
        (select code from chart_of_accounts where name ilike '%room revenue%' limit 1),
        'frontoffice', p_user_id
      );

      -- Discount, applied BEFORE fees/VAT to match the frontend's
      -- calculateFolioComponents ordering (subtotal -> discount -> fees -> tax).
      if coalesce(v_reservation.discount_percent, 0) > 0 then
        v_discount_amount := round(v_base_amount * v_reservation.discount_percent / 100, 2);
        v_line_num := v_line_num + 1;
        insert into folio_lines (
          id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
          line_type, target_folio, revenue_account_code, source_module, created_by
        ) values (
          gen_random_uuid()::text, v_primary_folio_id, v_line_num, v_business_date,
          'Discount @ ' || v_reservation.discount_percent || '%',
          -v_discount_amount, 1, -v_discount_amount, 'Discount',
          case when v_is_corporate then 'A' else null end,
          (select code from chart_of_accounts where name ilike '%discount%' limit 1),
          'frontoffice', p_user_id
        );
      end if;

      v_discounted_base := v_base_amount - v_discount_amount;

      -- Phase 1: Calculate non-VAT fees on the discounted base, insert lines
      for v_fee in
        select
          (elem->>'name')::text as name,
          (elem->>'feeType')::text as fee_type,
          (elem->>'value')::numeric as value,
          (elem->>'accountCode')::text as account_code
        from global_settings, jsonb_array_elements(fee_components) as elem
        where global_settings.id = 'main'
        and (elem->>'isEnabled')::boolean = true
        and lower((elem->>'name')::text) not like '%vat%'
        and lower((elem->>'name')::text) not like '%tax%'
        order by (elem->>'displayOrder')::int asc
      loop
        v_line_num := v_line_num + 1;
        if v_fee.fee_type = 'percentage' then
          v_fee_amount := round(v_discounted_base * v_fee.value / 100, 2);
        else
          v_fee_amount := v_fee.value;
        end if;
        v_non_vat_fees := v_non_vat_fees + v_fee_amount;

        if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
          v_sc_total := v_sc_total + v_fee_amount;
        end if;

        insert into folio_lines (
          id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
          line_type, target_folio, revenue_account_code, source_module, created_by
        ) values (
          gen_random_uuid()::text, v_primary_folio_id, v_line_num, v_business_date,
          v_fee.name || case when v_fee.fee_type = 'percentage' then ' @ ' || v_fee.value || '%' else ' (Fixed)' end,
          v_fee_amount, 1, v_fee_amount,
          case
            when lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then 'ServiceCharge'
            else 'Extra'
          end,
          case when v_is_corporate then 'A' else null end,
          coalesce(v_fee.account_code, (select code from chart_of_accounts where name ilike '%miscellaneous%' limit 1)),
          'frontoffice', p_user_id
        );
      end loop;

      -- Phase 2: Calculate VAT on (discounted base + non-VAT fees)
      select
        (elem->>'name')::text,
        (elem->>'value')::numeric,
        (elem->>'accountCode')::text
      into v_vat_name, v_vat_rate, v_vat_account
      from global_settings, jsonb_array_elements(fee_components) as elem
      where id = 'main'
      and (elem->>'isEnabled')::boolean = true
      and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
      limit 1;

      if v_vat_name is not null and v_vat_rate > 0 then
        v_vat_amount := round((v_discounted_base + v_non_vat_fees) * v_vat_rate / 100, 2);
        v_line_num := v_line_num + 1;
        insert into folio_lines (
          id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
          line_type, target_folio, revenue_account_code, source_module, created_by
        ) values (
          gen_random_uuid()::text, v_primary_folio_id, v_line_num, v_business_date,
          v_vat_name || ' @ ' || v_vat_rate || '%',
          v_vat_amount, 1, v_vat_amount, 'Tax',
          case when v_is_corporate then 'A' else null end,
          coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
          'frontoffice', p_user_id
        );
      end if;

      -- Update primary folio balance (net of discount)
      update folios
      set balance = v_discounted_base + v_non_vat_fees + v_vat_amount,
          total_charges = v_discounted_base + v_non_vat_fees + v_vat_amount,
          tax_total = v_vat_amount,
          service_charge_total = v_sc_total,
          updated_at = v_now
      where id = v_primary_folio_id;

      if v_is_corporate then
        update folios
        set balance = 0.00,
            total_charges = 0.00,
            tax_total = 0.00,
            service_charge_total = 0.00,
            updated_at = v_now
        where id = v_folio_b_id;
      end if;
    end;

    -- Preserve the primary folio id for the audit log / response below
    -- (the previous version of this function left the outer v_folio_id
    -- variable unset, so the check-in API response always returned
    -- folioId: null).
    v_folio_id := v_primary_folio_id;
  end;

  update reservations
  set status = 'CheckedIn',
      room_number = p_room_number,
      payment_status = case when v_reservation.is_deposit_paid then 'Partial' else 'Unpaid' end
  where id = p_reservation_id;

  update rooms
  set status = 'Occupied Clean'
  where number = p_room_number;

  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text,
    p_user_id,
    'reservation.check_in',
    'reservation',
    p_reservation_id,
    'frontoffice',
    jsonb_build_object('roomNumber', p_room_number, 'previousStatus', v_reservation.status, 'folioId', v_folio_id)
  );

  return jsonb_build_object('success', true, 'folioId', v_folio_id, 'roomNumber', p_room_number);
end;
$$;

grant execute on function check_in_reservation to authenticated;

-- END: 058_checkin_discount_fix.sql

-- =========================================================================
-- Migration: 059_backfill_empty_folio_charges.sql
-- =========================================================================
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

-- END: 059_backfill_empty_folio_charges.sql

-- =========================================================================
-- Migration: 060_unified_billing_calculation.sql
-- =========================================================================
-- Migration 060: Unified Billing Calculation and Single Source of Truth
-- This migration implements long-term architectural changes to eliminate
-- frontend/backend billing discrepancies.

-- Part 1: Add discount_percent parameter to post_folio_charge
create or replace function post_folio_charge(
  p_folio_id text,
  p_description text,
  p_amount numeric,
  p_quantity numeric,
  p_line_type text,
  p_revenue_account_code text,
  p_user_id text,
  p_source_reference text default null,
  p_discount_percent numeric default 0.0
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_next_line integer;
  v_business_date date;
  v_now timestamp with time zone := now();
  v_base_amount numeric := p_amount;
  v_base_line_id text := gen_random_uuid()::text;
  v_fee record;
  v_fee_amount numeric;
  v_total_fees numeric := 0.00;
  v_tax_amount numeric := 0.00;
  v_discount_percent numeric := 0.0;
  v_discount_amount numeric := 0.00;
  v_discounted_amount numeric;
  v_res_discount_percent numeric := 0.0;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  if v_folio.status != 'Open' then
    return jsonb_build_object('success', false, 'error', 'Folio is not open');
  end if;

  -- Get reservation discount_percent as fallback
  select coalesce(discount_percent, 0.0) into v_res_discount_percent
  from reservations
  where id = v_folio.reservation_id;

  -- Use provided discount_percent or fall back to reservation discount
  if p_discount_percent > 0 then
    v_discount_percent := p_discount_percent;
  elsif v_res_discount_percent > 0 then
    v_discount_percent := v_res_discount_percent;
  else
    v_discount_percent := 0.0;
  end if;

  -- Calculate discount amount
  if v_discount_percent > 0 then
    v_discount_amount := round(v_base_amount * v_discount_percent / 100, 2);
  end if;
  
  v_discounted_amount := v_base_amount - v_discount_amount;

  -- Get next line number
  select coalesce(max(line_number), 0) + 1 into v_next_line
  from folio_lines
  where folio_id = p_folio_id;

  -- Insert base charge line (undiscounted base for transparency)
  insert into folio_lines (
    id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
    line_type, target_folio, revenue_account_code, source_module, source_reference, created_by
  ) values (
    v_base_line_id, p_folio_id, v_next_line, v_business_date,
    p_description, v_base_amount, p_quantity,
    case when p_quantity > 0 then round(v_base_amount / p_quantity, 2) else v_base_amount end,
    p_line_type, v_folio.target_folio, p_revenue_account_code, 'frontoffice', p_source_reference, p_user_id
  );

  -- Insert discount line if applicable
  if v_discount_percent > 0 then
    v_next_line := v_next_line + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
      'Discount @ ' || v_discount_percent || '% on ' || p_description,
      -v_discount_amount, 1, -v_discount_amount, 'Discount',
      v_folio.target_folio, (select code from chart_of_accounts where name ilike '%discount%' limit 1),
      'frontoffice', p_user_id
    );
  end if;

  -- Phase 1: Calculate non-VAT fees on DISCOUNTED amount, insert lines
  declare
    v_non_vat_fees numeric := 0.00;
    v_vat_amount numeric := 0.00;
    v_vat_name text := '';
    v_vat_rate numeric := 0;
    v_vat_account text := '';
    v_sc_total numeric := 0.00;
  begin
    for v_fee in
      select
        (elem->>'name')::text as name,
        (elem->>'feeType')::text as fee_type,
        (elem->>'value')::numeric as value,
        (elem->>'accountCode')::text as account_code
      from global_settings, jsonb_array_elements(fee_components) as elem
      where global_settings.id = 'main'
      and (elem->>'isEnabled')::boolean = true
      and lower((elem->>'name')::text) not like '%vat%'
      and lower((elem->>'name')::text) not like '%tax%'
      order by (elem->>'displayOrder')::int asc
    loop
      v_next_line := v_next_line + 1;
      if v_fee.fee_type = 'percentage' then
        v_fee_amount := round(v_discounted_amount * v_fee.value / 100, 2);
      else
        v_fee_amount := v_fee.value;
      end if;
      v_non_vat_fees := v_non_vat_fees + v_fee_amount;

      if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
        v_sc_total := v_sc_total + v_fee_amount;
      end if;

      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, target_folio, revenue_account_code, source_module, created_by
      ) values (
        gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
        v_fee.name || case when v_fee.fee_type = 'percentage' then ' @ ' || v_fee.value || '% on ' || p_description else ' (Fixed) on ' || p_description end,
        v_fee_amount, 1, v_fee_amount,
        case
          when lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then 'ServiceCharge'
          else 'Extra'
        end,
        v_folio.target_folio,
        coalesce(v_fee.account_code, (select code from chart_of_accounts where name ilike '%miscellaneous%' limit 1)),
        'frontoffice', p_user_id
      );
    end loop;

    -- Phase 2: Calculate VAT on (discounted base + non-VAT fees), insert last
    select
      (elem->>'name')::text,
      (elem->>'value')::numeric,
      (elem->>'accountCode')::text
    into v_vat_name, v_vat_rate, v_vat_account
    from global_settings, jsonb_array_elements(fee_components) as elem
    where global_settings.id = 'main'
    and (elem->>'isEnabled')::boolean = true
    and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
    limit 1;

    if v_vat_name is not null and v_vat_rate > 0 then
      v_vat_amount := round((v_discounted_amount + v_non_vat_fees) * v_vat_rate / 100, 2);
      v_next_line := v_next_line + 1;
      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, target_folio, revenue_account_code, source_module, created_by
      ) values (
        gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
        v_vat_name || ' @ ' || v_vat_rate || '% on ' || p_description,
        v_vat_amount, 1, v_vat_amount, 'Tax',
        v_folio.target_folio,
        coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
        'frontoffice', p_user_id
      );
    end if;

    v_total_fees := v_non_vat_fees + v_vat_amount;

    -- Update folio balance with separate service charge and tax tracking
    update folios
    set balance = balance + v_discounted_amount + v_total_fees,
        total_charges = total_charges + v_discounted_amount + v_total_fees,
        tax_total = tax_total + v_vat_amount,
        service_charge_total = service_charge_total + v_sc_total,
        updated_at = v_now
    where id = p_folio_id;

    -- Audit
    insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
    values (
      gen_random_uuid()::text, p_user_id, 'folio.charge.add', 'folio', p_folio_id, 'frontoffice',
      jsonb_build_object(
        'baseAmount', v_base_amount, 'discountPercent', v_discount_percent, 'discountAmount', v_discount_amount,
        'discountedAmount', v_discounted_amount, 'nonVatFees', v_non_vat_fees, 'vatAmount', v_vat_amount,
        'scTotal', v_sc_total, 'totalAmount', v_discounted_amount + v_total_fees,
        'description', p_description, 'lineType', p_line_type
      )
    );

    return jsonb_build_object(
      'success', true,
      'folio_id', p_folio_id,
      'base_amount', v_base_amount,
      'discount_percent', v_discount_percent,
      'discount_amount', v_discount_amount,
      'discounted_amount', v_discounted_amount,
      'non_vat_fees', v_non_vat_fees,
      'vat_amount', v_vat_amount,
      'total_amount', v_discounted_amount + v_total_fees,
      'folio_balance', v_folio.balance + v_discounted_amount + v_total_fees
    );
  end;
end;
$$;

-- Part 2: Create unified calculate_billing_breakdown RPC
create or replace function calculate_billing_breakdown(
  p_base_amount numeric,
  p_discount_percent numeric default 0.0,
  p_reservation_id text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_discount_amount numeric := 0.0;
  v_discounted_amount numeric;
  v_non_vat_fees numeric := 0.00;
  v_vat_amount numeric := 0.00;
  v_sc_total numeric := 0.00;
  v_fee record;
  v_fee_amount numeric;
  v_vat_name text;
  v_vat_rate numeric;
  v_fee_breakdown jsonb := '[]'::jsonb;
  v_effective_discount numeric := 0.0;
  v_res_discount numeric := 0.0;
begin
  -- Resolve effective discount: use provided or fall back to reservation
  if p_discount_percent > 0 then
    v_effective_discount := p_discount_percent;
  elsif p_reservation_id is not null then
    select coalesce(discount_percent, 0.0) into v_res_discount
    from reservations
    where id = p_reservation_id;
    v_effective_discount := v_res_discount;
  end if;

  -- Calculate discount
  if v_effective_discount > 0 then
    v_discount_amount := round(p_base_amount * v_effective_discount / 100, 2);
  end if;
  v_discounted_amount := p_base_amount - v_discount_amount;

  -- Phase 1: non-VAT fees on discounted amount
  for v_fee in
    select
      (elem->>'name')::text as name,
      (elem->>'feeType')::text as fee_type,
      (elem->>'value')::numeric as value,
      (elem->>'displayOrder')::int as display_order
    from global_settings, jsonb_array_elements(fee_components) as elem
    where global_settings.id = 'main'
    and (elem->>'isEnabled')::boolean = true
    and lower((elem->>'name')::text) not like '%vat%'
    and lower((elem->>'name')::text) not like '%tax%'
    order by (elem->>'displayOrder')::int asc
  loop
    if v_fee.fee_type = 'percentage' then
      v_fee_amount := round(v_discounted_amount * v_fee.value / 100, 2);
    else
      v_fee_amount := v_fee.value;
    end if;
    v_non_vat_fees := v_non_vat_fees + v_fee_amount;

    if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
      v_sc_total := v_sc_total + v_fee_amount;
    end if;

    v_fee_breakdown := v_fee_breakdown || jsonb_build_object(
      'name', v_fee.name,
      'amount', v_fee_amount,
      'type', v_fee.fee_type,
      'value', v_fee.value,
      'displayOrder', v_fee.display_order
    );
  end loop;

  -- Phase 2: VAT on (discounted amount + non-VAT fees)
  select
    (elem->>'name')::text,
    (elem->>'value')::numeric
  into v_vat_name, v_vat_rate
  from global_settings, jsonb_array_elements(fee_components) as elem
  where global_settings.id = 'main'
  and (elem->>'isEnabled')::boolean = true
  and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
  limit 1;

  if v_vat_name is not null and v_vat_rate > 0 then
    v_vat_amount := round((v_discounted_amount + v_non_vat_fees) * v_vat_rate / 100, 2);
    v_fee_breakdown := v_fee_breakdown || jsonb_build_object(
      'name', v_vat_name,
      'amount', v_vat_amount,
      'type', 'percentage',
      'value', v_vat_rate,
      'displayOrder', 9999
    );
  end if;

  return jsonb_build_object(
    'base_amount', p_base_amount,
    'discount_percent', v_effective_discount,
    'discount_amount', v_discount_amount,
    'discounted_amount', v_discounted_amount,
    'non_vat_fees', v_non_vat_fees,
    'service_charge_total', v_sc_total,
    'vat_amount', v_vat_amount,
    'total_amount', v_discounted_amount + v_non_vat_fees + v_vat_amount,
    'fee_breakdown', v_fee_breakdown
  );
end;
$$;

-- Grant execute permissions
grant execute on function post_folio_charge(text, text, numeric, numeric, text, text, text, text, numeric) to authenticated;
grant execute on function calculate_billing_breakdown(numeric, numeric, text) to authenticated;

-- Part 3: Database trigger to sync folio_lines to reservation.charges (backward compatibility)
-- This ensures reservation.charges JSONB stays in sync with folio_lines table during transition

create or replace function sync_folio_lines_to_reservation_charges()
returns trigger
language plpgsql
security definer
as $$
declare
  v_reservation_id text;
  v_folio_id text;
  v_charges jsonb := '[]'::jsonb;
  v_payments jsonb := '[]'::jsonb;
  v_line record;
  v_payment record;
begin
  -- Determine the folio id based on which table fired the trigger.
  -- folios has id; folio_lines and folio_payments have folio_id.
  if tg_table_name = 'folios' then
    if tg_op = 'DELETE' then
      v_folio_id := old.id;
    else
      v_folio_id := new.id;
    end if;
  else
    v_folio_id := coalesce(new.folio_id, old.folio_id);
  end if;

  -- Get reservation_id from the folio
  select reservation_id into v_reservation_id
  from folios
  where id = v_folio_id;

  if v_reservation_id is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  -- Rebuild charges array from all folio_lines for this reservation
  for v_line in
    select
      fl.id, fl.line_number, fl.transaction_date, fl.description,
      fl.amount, fl.quantity, fl.unit_price, fl.line_type, fl.is_voided, fl.created_at
    from folio_lines fl
    join folios f on f.id = fl.folio_id
    where f.reservation_id = v_reservation_id
    order by f.id, fl.line_number
  loop
    v_charges := v_charges || jsonb_build_object(
      'id', v_line.id,
      'lineNumber', v_line.line_number,
      'date', v_line.transaction_date,
      'description', v_line.description,
      'amount', v_line.amount,
      'quantity', v_line.quantity,
      'unitPrice', v_line.unit_price,
      'lineType', v_line.line_type,
      'isVoided', v_line.is_voided,
      'createdAt', v_line.created_at
    );
  end loop;

  -- Rebuild payments array from all folio_payments for this reservation
  for v_payment in
    select distinct
      fp.id, fp.payment_date, fp.amount, fp.payment_method, fp.reference_number, fp.is_voided, fp.created_at
    from folio_payments fp
    join folios f on f.id = fp.folio_id
    where f.reservation_id = v_reservation_id
    order by fp.payment_date
  loop
    v_payments := v_payments || jsonb_build_object(
      'id', v_payment.id,
      'date', v_payment.payment_date,
      'amount', v_payment.amount,
      'paymentMethod', v_payment.payment_method,
      'reference', v_payment.reference_number,
      'isVoided', v_payment.is_voided,
      'createdAt', v_payment.created_at
    );
  end loop;

  -- Update reservation.charges and reservation.payments
  update reservations
  set charges = v_charges,
      payments = v_payments
  where id = v_reservation_id;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- Create trigger on folio_lines
drop trigger if exists trigger_sync_folio_lines_to_reservation on folio_lines;
create trigger trigger_sync_folio_lines_to_reservation
after insert or update or delete on folio_lines
for each row
execute function sync_folio_lines_to_reservation_charges();

-- Create trigger on folio_payments
drop trigger if exists trigger_sync_folio_payments_to_reservation on folio_payments;
create trigger trigger_sync_folio_payments_to_reservation
after insert or update or delete on folio_payments
for each row
execute function sync_folio_lines_to_reservation_charges();

-- Create trigger on folios (when folio is created/deleted, sync lines)
drop trigger if exists trigger_sync_folio_to_reservation on folios;
create trigger trigger_sync_folio_to_reservation
after insert or delete on folios
for each row
execute function sync_folio_lines_to_reservation_charges();

-- END: 060_unified_billing_calculation.sql

-- =========================================================================
-- Migration: 061_fix_folio_payments_missing_columns.sql
-- =========================================================================
-- Migration 061: Add missing columns to folio_payments table
-- These columns are referenced in post_folio_payment (migrations 052-056)
-- but were never added via ALTER TABLE to the live schema.

alter table folio_payments add column if not exists user_id text references system_users(id) on delete set null;
alter table folio_payments add column if not exists receipt_url text;
alter table folio_payments add column if not exists bank_account_id text references bank_accounts(id) on delete set null;
alter table folio_payments add column if not exists target_folio text check (target_folio in ('A', 'B', null));

-- Backfill user_id from created_by for existing rows
update folio_payments set user_id = created_by where user_id is null and created_by is not null;

-- Index for bank_account_id lookups
create index if not exists idx_folio_payments_bank_account on folio_payments(bank_account_id);
create index if not exists idx_folio_payments_user_id on folio_payments(user_id);

-- END: 061_fix_folio_payments_missing_columns.sql

-- =========================================================================
-- Migration: 062_fix_folio_ab_sync_and_balance.sql
-- =========================================================================
-- Migration 062: Fix Folio A/B identification showing 0.00 balance
--
-- Bug 1: sync_folio_lines_to_reservation_charges() (migration 060) rebuilt
--   reservations.charges without the `target_folio` column, so every trigger
--   sync wiped targetFolio from in-memory charge objects. getChargeFolio()
--   always fell through to 'B', leaving Folio A perpetually 0.00.
--   Fix: include target_folio (coalesced with the parent folio's target_folio
--   as fallback) and notes in the rebuilt JSONB.
--
-- Bug 2: /folio-balance filtered folio_lines.target_folio = 'A'/'B' but for a
--   single non-split folio all lines have target_folio = NULL (inherited from
--   folios.target_folio which is also NULL for a personal guest folio).
--   Fix: handled in server.ts â€” falls back to the folio's own target_folio.

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Part 1: Helper function (direct call, no trigger dependency)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create or replace function sync_folio_lines_to_reservation_charges_direct(p_folio_id text)
returns void
language plpgsql
security definer
as $$
declare
  v_reservation_id text;
  v_charges  jsonb := '[]'::jsonb;
  v_payments jsonb := '[]'::jsonb;
  v_line    record;
  v_payment record;
begin
  select reservation_id into v_reservation_id
  from folios where id = p_folio_id;

  if v_reservation_id is null then return; end if;

  for v_line in
    select
      fl.id, fl.line_number, fl.transaction_date, fl.description,
      fl.amount, fl.quantity, fl.unit_price, fl.line_type,
      fl.is_voided, fl.created_at,
      coalesce(fl.target_folio, f.target_folio) as effective_target_folio
    from folio_lines fl
    join folios f on f.id = fl.folio_id
    where f.reservation_id = v_reservation_id
    order by f.id, fl.line_number
  loop
    v_charges := v_charges || jsonb_build_object(
      'id',          v_line.id,
      'lineNumber',  v_line.line_number,
      'date',        v_line.transaction_date,
      'description', v_line.description,
      'amount',      v_line.amount,
      'quantity',    v_line.quantity,
      'unitPrice',   v_line.unit_price,
      'type',        v_line.line_type,
      'isVoided',    v_line.is_voided,
      'createdAt',   v_line.created_at,
      'targetFolio', v_line.effective_target_folio
    );
  end loop;

  for v_payment in
    select
      fp.id, fp.payment_date, fp.amount, fp.payment_method,
      fp.reference_number, fp.is_voided, fp.created_at,
      fp.target_folio as payment_target_folio
    from folio_payments fp
    join folios f on f.id = fp.folio_id
    where f.reservation_id = v_reservation_id
    order by f.id, fp.payment_date
  loop
    v_payments := v_payments || jsonb_build_object(
      'id',          v_payment.id,
      'date',        v_payment.payment_date,
      'amount',      v_payment.amount,
      'method',      v_payment.payment_method,
      'reference',   v_payment.reference_number,
      'isVoided',    v_payment.is_voided,
      'createdAt',   v_payment.created_at,
      'targetFolio', v_payment.payment_target_folio
    );
  end loop;

  update reservations
  set charges  = v_charges,
      payments = v_payments
  where id = v_reservation_id;
end;
$$;

grant execute on function sync_folio_lines_to_reservation_charges_direct(text) to authenticated;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Part 2: Rebuild the trigger function to use the same logic
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
create or replace function sync_folio_lines_to_reservation_charges()
returns trigger
language plpgsql
security definer
as $$
declare
  v_folio_id text;
begin
  -- The trigger is attached to folios, folio_lines, and folio_payments.
  -- Only folio_lines/folio_payments have a folio_id column; folios uses its id.
  if tg_table_name = 'folios' then
    v_folio_id := coalesce(new.id, old.id);
  else
    v_folio_id := coalesce(new.folio_id, old.folio_id);
  end if;

  if v_folio_id is not null then
    perform sync_folio_lines_to_reservation_charges_direct(v_folio_id);
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Part 3: Backfill â€” inline logic (no function call) so this works regardless
--         of statement isolation in Supabase SQL Editor
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
do $$
declare
  v_folio_id      text;
  v_reservation_id text;
  v_charges       jsonb;
  v_payments      jsonb;
  v_line          record;
  v_payment       record;
begin
  for v_folio_id in
    select distinct folio_id from folio_lines
  loop
    select reservation_id into v_reservation_id
    from folios where id = v_folio_id;

    continue when v_reservation_id is null;

    v_charges  := '[]'::jsonb;
    v_payments := '[]'::jsonb;

    for v_line in
      select
        fl.id, fl.line_number, fl.transaction_date, fl.description,
        fl.amount, fl.quantity, fl.unit_price, fl.line_type,
        fl.is_voided, fl.created_at,
        coalesce(fl.target_folio, f.target_folio) as effective_target_folio
      from folio_lines fl
      join folios f on f.id = fl.folio_id
      where f.reservation_id = v_reservation_id
      order by f.id, fl.line_number
    loop
      v_charges := v_charges || jsonb_build_object(
        'id',          v_line.id,
        'lineNumber',  v_line.line_number,
        'date',        v_line.transaction_date,
        'description', v_line.description,
        'amount',      v_line.amount,
        'quantity',    v_line.quantity,
        'unitPrice',   v_line.unit_price,
        'type',        v_line.line_type,
        'isVoided',    v_line.is_voided,
        'createdAt',   v_line.created_at,
        'targetFolio', v_line.effective_target_folio
      );
    end loop;

    for v_payment in
      select
        fp.id, fp.payment_date, fp.amount, fp.payment_method,
        fp.reference_number, fp.is_voided, fp.created_at,
        fp.target_folio as payment_target_folio
      from folio_payments fp
      join folios f on f.id = fp.folio_id
      where f.reservation_id = v_reservation_id
      order by f.id, fp.payment_date
    loop
      v_payments := v_payments || jsonb_build_object(
        'id',          v_payment.id,
        'date',        v_payment.payment_date,
        'amount',      v_payment.amount,
        'method',      v_payment.payment_method,
        'reference',   v_payment.reference_number,
        'isVoided',    v_payment.is_voided,
        'createdAt',   v_payment.created_at,
        'targetFolio', v_payment.payment_target_folio
      );
    end loop;

    update reservations
    set charges  = v_charges,
        payments = v_payments
    where id = v_reservation_id;
  end loop;
end;
$$;

-- END: 062_fix_folio_ab_sync_and_balance.sql

-- =========================================================================
-- Migration: 063_fix_group_auto_link_checkin.sql
-- =========================================================================
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Part 1: BEFORE trigger - normalize group_profile_id and guest_id
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Part 2: Auto-linking function - prefer guest_id, support group_booking_id
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Part 3: Trigger auto-link on status changes (check-in / promotion)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
drop trigger if exists trigger_auto_link_guest_to_group on reservations;
create trigger trigger_auto_link_guest_to_group
after insert or update of group_profile_id, booking_group_id, group_booking_id, guest_email, guest_id, status
on reservations
for each row
execute function auto_link_guest_to_group();

-- END: 063_fix_group_auto_link_checkin.sql

-- =========================================================================
-- Migration: 063b_fix_ambiguous_id_references.sql
-- =========================================================================
-- Migration 063: Fix ambiguous id references in post_folio_charge
-- This fixes the "column reference id is ambiguous" error

-- Fix post_folio_charge function
create or replace function post_folio_charge(
  p_folio_id text,
  p_description text,
  p_amount numeric,
  p_quantity numeric,
  p_line_type text,
  p_revenue_account_code text,
  p_user_id text,
  p_source_reference text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_next_line integer;
  v_business_date date;
  v_now timestamp with time zone := now();
  v_base_amount numeric := p_amount;
  v_base_line_id text := gen_random_uuid()::text;
  v_fee record;
  v_fee_amount numeric;
  v_total_fees numeric := 0.00;
  v_tax_amount numeric := 0.00;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  if v_folio.status != 'Open' then
    return jsonb_build_object('success', false, 'error', 'Folio is not open');
  end if;

  -- Get next line number
  select coalesce(max(line_number), 0) + 1 into v_next_line
  from folio_lines
  where folio_id = p_folio_id;

  -- Insert base charge line
  insert into folio_lines (
    id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
    line_type, target_folio, revenue_account_code, source_module, source_reference, created_by
  ) values (
    v_base_line_id, p_folio_id, v_next_line, v_business_date,
    p_description, v_base_amount, p_quantity,
    case when p_quantity > 0 then round(v_base_amount / p_quantity, 2) else v_base_amount end,
    p_line_type, v_folio.target_folio, p_revenue_account_code, 'frontoffice', p_source_reference, p_user_id
  );

  -- Phase 1: Calculate non-VAT fees on base amount, insert lines
  declare
    v_non_vat_fees numeric := 0.00;
    v_vat_amount numeric := 0.00;
    v_vat_name text := '';
    v_vat_rate numeric := 0;
    v_vat_account text := '';
    v_sc_total numeric := 0.00;
  begin
    for v_fee in
      select
        (elem->>'name')::text as name,
        (elem->>'feeType')::text as fee_type,
        (elem->>'value')::numeric as value,
        (elem->>'accountCode')::text as account_code
      from global_settings, jsonb_array_elements(fee_components) as elem
      where global_settings.id = 'main'
      and (elem->>'isEnabled')::boolean = true
      and lower((elem->>'name')::text) not like '%vat%'
      and lower((elem->>'name')::text) not like '%tax%'
      order by (elem->>'displayOrder')::int asc
    loop
      v_next_line := v_next_line + 1;
      if v_fee.fee_type = 'percentage' then
        v_fee_amount := round(v_base_amount * v_fee.value / 100, 2);
      else
        v_fee_amount := v_fee.value;
      end if;
      v_non_vat_fees := v_non_vat_fees + v_fee_amount;

      if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
        v_sc_total := v_sc_total + v_fee_amount;
      end if;

      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, target_folio, revenue_account_code, source_module, created_by
      ) values (
        gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
        v_fee.name || case when v_fee.fee_type = 'percentage' then ' @ ' || v_fee.value || '% on ' || p_description else ' (Fixed) on ' || p_description end,
        v_fee_amount, 1, v_fee_amount,
        case
          when lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then 'ServiceCharge'
          else 'Extra'
        end,
        v_folio.target_folio,
        coalesce(v_fee.account_code, (select code from chart_of_accounts where name ilike '%miscellaneous%' limit 1)),
        'frontoffice', p_user_id
      );
    end loop;

    -- Phase 2: Calculate VAT on (base + non-VAT fees), insert last
    select
      (elem->>'name')::text,
      (elem->>'value')::numeric,
      (elem->>'accountCode')::text
    into v_vat_name, v_vat_rate, v_vat_account
    from global_settings, jsonb_array_elements(fee_components) as elem
    where global_settings.id = 'main'
    and (elem->>'isEnabled')::boolean = true
    and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
    limit 1;

    if v_vat_name is not null and v_vat_rate > 0 then
      v_vat_amount := round((v_base_amount + v_non_vat_fees) * v_vat_rate / 100, 2);
      v_next_line := v_next_line + 1;
      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, target_folio, revenue_account_code, source_module, created_by
      ) values (
        gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
        v_vat_name || ' @ ' || v_vat_rate || '% on ' || p_description,
        v_vat_amount, 1, v_vat_amount, 'Tax',
        v_folio.target_folio,
        coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
        'frontoffice', p_user_id
      );
    end if;

    v_total_fees := v_non_vat_fees + v_vat_amount;

    -- Update folio balance with separate service charge and tax tracking
    update folios
    set balance = balance + v_base_amount + v_total_fees,
        total_charges = total_charges + v_base_amount + v_total_fees,
        tax_total = tax_total + v_vat_amount,
        service_charge_total = service_charge_total + v_sc_total,
        updated_at = v_now
    where id = p_folio_id;
  end;

  -- Return success
  return jsonb_build_object(
    'success', true,
    'folioId', p_folio_id,
    'baseAmount', v_base_amount,
    'feesTotal', v_total_fees,
    'taxAmount', v_vat_amount,
    'serviceChargeTotal', v_sc_total
  );
end;
$$;

-- Grant execute permission
grant execute on function post_folio_charge to authenticated;

-- END: 063b_fix_ambiguous_id_references.sql

-- =========================================================================
-- Migration: 064_checkin_form_settings.sql
-- =========================================================================
-- Add columns for customizable check-in form content
-- This allows business admins to customize the check-in form text and terms

-- Individual check-in form settings
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS checkin_form_title text default 'Check-In Registration Form';
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS checkin_form_hotel_name text default 'SELEDA HOTEL';
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS checkin_form_terms text default 'â€¢ Guest agrees to comply with all hotel rules and regulations.
â€¢ Check-out time is 11:00 AM. Late check-out may incur additional charges.
â€¢ The hotel is not responsible for lost or stolen items.
â€¢ Payment for all charges is due upon check-out.
â€¢ Cancellation policy applies as per reservation terms.';
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS checkin_form_signature_label text default 'Guest Signature';
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS checkin_form_signature_hint text default 'Please sign above to confirm check-in';

-- Group check-in form settings
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS group_checkin_form_title text default 'Group Check-In Registration Form';
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS group_checkin_form_terms text default 'â€¢ Group contact person agrees to comply with all hotel rules and regulations on behalf of all group members.
â€¢ Check-out time is 11:00 AM. Late check-out may incur additional charges.
â€¢ The hotel is not responsible for lost or stolen items.
â€¢ Payment for all charges is due upon check-out.
â€¢ Cancellation policy applies as per reservation terms.
â€¢ Group leader is responsible for all charges incurred by group members.';
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS group_checkin_form_signature_label text default 'Group Leader Signature';
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS group_checkin_form_signature_hint text default 'Please sign above to confirm group check-in';

-- Add comments for documentation
COMMENT ON COLUMN global_settings.checkin_form_title IS 'Title for individual check-in form';
COMMENT ON COLUMN global_settings.checkin_form_hotel_name IS 'Hotel name displayed on check-in form';
COMMENT ON COLUMN global_settings.checkin_form_terms IS 'Terms and conditions text for individual check-in';
COMMENT ON COLUMN global_settings.checkin_form_signature_label IS 'Label for signature field on individual check-in';
COMMENT ON COLUMN global_settings.checkin_form_signature_hint IS 'Hint text for signature field on individual check-in';
COMMENT ON COLUMN global_settings.group_checkin_form_title IS 'Title for group check-in form';
COMMENT ON COLUMN global_settings.group_checkin_form_terms IS 'Terms and conditions text for group check-in';
COMMENT ON COLUMN global_settings.group_checkin_form_signature_label IS 'Label for signature field on group check-in';
COMMENT ON COLUMN global_settings.group_checkin_form_signature_hint IS 'Hint text for signature field on group check-in';

-- END: 064_checkin_form_settings.sql

-- =========================================================================
-- Migration: 064b_fix_all_ambiguous_id_references.sql
-- =========================================================================
-- Migration 064: Fix ALL ambiguous id references in all functions
-- This fixes the "column reference id is ambiguous" error in:
-- 1. post_folio_charge
-- 2. check_in_reservation

-- Drop ALL versions of post_folio_charge by OID
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT oid FROM pg_proc WHERE proname = 'post_folio_charge'
  LOOP
    EXECUTE 'DROP FUNCTION ' || func_record.oid::regprocedure || ' CASCADE';
  END LOOP;
END $$;

-- Drop ALL versions of check_in_reservation by OID
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT oid FROM pg_proc WHERE proname = 'check_in_reservation'
  LOOP
    EXECUTE 'DROP FUNCTION ' || func_record.oid::regprocedure || ' CASCADE';
  END LOOP;
END $$;

-- Fix post_folio_charge function
create or replace function post_folio_charge(
  p_folio_id text,
  p_description text,
  p_amount numeric,
  p_quantity numeric,
  p_line_type text,
  p_revenue_account_code text,
  p_user_id text,
  p_source_reference text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_next_line integer;
  v_business_date date;
  v_now timestamp with time zone := now();
  v_base_amount numeric := p_amount;
  v_base_line_id text := gen_random_uuid()::text;
  v_fee record;
  v_fee_amount numeric;
  v_total_fees numeric := 0.00;
  v_tax_amount numeric := 0.00;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  if v_folio.status != 'Open' then
    return jsonb_build_object('success', false, 'error', 'Folio is not open');
  end if;

  -- Get next line number
  select coalesce(max(line_number), 0) + 1 into v_next_line
  from folio_lines
  where folio_id = p_folio_id;

  -- Insert base charge line
  insert into folio_lines (
    id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
    line_type, target_folio, revenue_account_code, source_module, source_reference, created_by
  ) values (
    v_base_line_id, p_folio_id, v_next_line, v_business_date,
    p_description, v_base_amount, p_quantity,
    case when p_quantity > 0 then round(v_base_amount / p_quantity, 2) else v_base_amount end,
    p_line_type, v_folio.target_folio, p_revenue_account_code, 'frontoffice', p_source_reference, p_user_id
  );

  -- Phase 1: Calculate non-VAT fees on base amount, insert lines
  declare
    v_non_vat_fees numeric := 0.00;
    v_vat_amount numeric := 0.00;
    v_vat_name text := '';
    v_vat_rate numeric := 0;
    v_vat_account text := '';
    v_sc_total numeric := 0.00;
  begin
    for v_fee in
      select
        (elem->>'name')::text as name,
        (elem->>'feeType')::text as fee_type,
        (elem->>'value')::numeric as value,
        (elem->>'accountCode')::text as account_code
      from global_settings, jsonb_array_elements(fee_components) as elem
      where global_settings.id = 'main'
      and (elem->>'isEnabled')::boolean = true
      and lower((elem->>'name')::text) not like '%vat%'
      and lower((elem->>'name')::text) not like '%tax%'
      order by (elem->>'displayOrder')::int asc
    loop
      v_next_line := v_next_line + 1;
      if v_fee.fee_type = 'percentage' then
        v_fee_amount := round(v_base_amount * v_fee.value / 100, 2);
      else
        v_fee_amount := v_fee.value;
      end if;
      v_non_vat_fees := v_non_vat_fees + v_fee_amount;

      if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
        v_sc_total := v_sc_total + v_fee_amount;
      end if;

      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, target_folio, revenue_account_code, source_module, created_by
      ) values (
        gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
        v_fee.name || case when v_fee.fee_type = 'percentage' then ' @ ' || v_fee.value || '% on ' || p_description else ' (Fixed) on ' || p_description end,
        v_fee_amount, 1, v_fee_amount,
        case
          when lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then 'ServiceCharge'
          else 'Extra'
        end,
        v_folio.target_folio,
        coalesce(v_fee.account_code, (select code from chart_of_accounts where name ilike '%miscellaneous%' limit 1)),
        'frontoffice', p_user_id
      );
    end loop;

    -- Phase 2: Calculate VAT on (base + non-VAT fees), insert last
    select
      (elem->>'name')::text,
      (elem->>'value')::numeric,
      (elem->>'accountCode')::text
    into v_vat_name, v_vat_rate, v_vat_account
    from global_settings, jsonb_array_elements(fee_components) as elem
    where global_settings.id = 'main'
    and (elem->>'isEnabled')::boolean = true
    and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
    limit 1;

    if v_vat_name is not null and v_vat_rate > 0 then
      v_vat_amount := round((v_base_amount + v_non_vat_fees) * v_vat_rate / 100, 2);
      v_next_line := v_next_line + 1;
      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, target_folio, revenue_account_code, source_module, created_by
      ) values (
        gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
        v_vat_name || ' @ ' || v_vat_rate || '% on ' || p_description,
        v_vat_amount, 1, v_vat_amount, 'Tax',
        v_folio.target_folio,
        coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
        'frontoffice', p_user_id
      );
    end if;

    v_total_fees := v_non_vat_fees + v_vat_amount;

    -- Update folio balance with separate service charge and tax tracking
    update folios
    set balance = balance + v_base_amount + v_total_fees,
        total_charges = total_charges + v_base_amount + v_total_fees,
        tax_total = tax_total + v_vat_amount,
        service_charge_total = service_charge_total + v_sc_total,
        updated_at = v_now
    where id = p_folio_id;
  end;

  -- Return success
  return jsonb_build_object(
    'success', true,
    'folioId', p_folio_id,
    'baseAmount', v_base_amount,
    'feesTotal', v_total_fees,
    'taxAmount', v_vat_amount,
    'serviceChargeTotal', v_sc_total
  );
end;
$$;

-- Grant execute permission
grant execute on function post_folio_charge to authenticated;

-- Fix check_in_reservation function
create or replace function check_in_reservation(
  p_reservation_id text,
  p_user_id text,
  p_room_number text default null,
  p_payment_method text default null,
  p_payment_amount numeric default null,
  p_payment_reference text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation reservations%rowtype;
  v_folio_id text;
  v_line_num integer;
  v_business_date date;
  v_now timestamp with time zone := now();
  v_base_amount numeric;
  v_discount_percent numeric := 0.0;
  v_discount_amount numeric := 0.00;
  v_discounted_base numeric;
  v_fee record;
  v_fee_amount numeric;
  v_non_vat_fees numeric := 0.00;
  v_vat_amount numeric := 0.00;
  v_vat_name text := '';
  v_vat_rate numeric := 0;
  v_vat_account text := '';
  v_sc_total numeric := 0.00;
  v_payment_id text;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Lock reservation
  select * into v_reservation
  from reservations
  where id = p_reservation_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  if v_reservation.status = 'CheckedIn' then
    return jsonb_build_object('success', false, 'error', 'Reservation already checked in');
  end if;

  -- Update reservation status and room assignment
  update reservations
  set status = 'CheckedIn',
      check_in_date = v_now,
      check_out_date = v_reservation.check_out_date,
      room_number = coalesce(p_room_number, room_number)
  where id = p_reservation_id;

  -- Create folio if not exists
  select id into v_folio_id
  from folios
  where reservation_id = p_reservation_id
    and status = 'Open'
  limit 1;

  if v_folio_id is null then
    v_folio_id := gen_random_uuid()::text;
    insert into folios (
      id, reservation_id, folio_type, status, balance, total_charges, total_payments,
      currency, opened_at, created_by
    ) values (
      v_folio_id, p_reservation_id, 'Guest', 'Open', 0, 0, 0,
      'USD', v_now, p_user_id
    );
  end if;

  -- Calculate base amount from reservation charges
  v_base_amount := coalesce(v_reservation.total_amount, 0);
  v_discount_percent := coalesce(v_reservation.discount_percent, 0);

  -- Calculate discount
  if v_discount_percent > 0 then
    v_discount_amount := round(v_base_amount * v_discount_percent / 100, 2);
  end if;
  v_discounted_base := v_base_amount - v_discount_amount;

  -- Get next line number
  select coalesce(max(line_number), 0) + 1 into v_line_num
  from folio_lines
  where folio_id = v_folio_id;

  -- Insert base room charge line
  insert into folio_lines (
    id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
    line_type, target_folio, revenue_account_code, source_module, created_by
  ) values (
    gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
    'Room charge - ' || coalesce(v_reservation.room_type, 'reservation'),
    v_base_amount, 1, v_base_amount, 'Room', null,
    (select code from chart_of_accounts where name ilike '%room revenue%' limit 1),
    'frontoffice', p_user_id
  );

  -- Insert discount line if applicable
  if v_discount_percent > 0 then
    v_line_num := v_line_num + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      'Discount @ ' || v_discount_percent || '% on room charge',
      -v_discount_amount, 1, -v_discount_amount, 'Discount', null,
      (select code from chart_of_accounts where name ilike '%discount%' limit 1),
      'frontoffice', p_user_id
    );
  end if;

  -- Phase 1: Calculate non-VAT fees on the discounted base, insert lines
  for v_fee in
    select
      (elem->>'name')::text as name,
      (elem->>'feeType')::text as fee_type,
      (elem->>'value')::numeric as value,
      (elem->>'accountCode')::text as account_code
    from global_settings, jsonb_array_elements(fee_components) as elem
    where global_settings.id = 'main'
    and (elem->>'isEnabled')::boolean = true
    and lower((elem->>'name')::text) not like '%vat%'
    and lower((elem->>'name')::text) not like '%tax%'
    order by (elem->>'displayOrder')::int asc
  loop
    v_line_num := v_line_num + 1;
    if v_fee.fee_type = 'percentage' then
      v_fee_amount := round(v_discounted_base * v_fee.value / 100, 2);
    else
      v_fee_amount := v_fee.value;
    end if;
    v_non_vat_fees := v_non_vat_fees + v_fee_amount;

    if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
      v_sc_total := v_sc_total + v_fee_amount;
    end if;

    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      v_fee.name || case when v_fee.fee_type = 'percentage' then ' @ ' || v_fee.value || '% on room charge' else ' (Fixed) on room charge' end,
      v_fee_amount, 1, v_fee_amount,
      case
        when lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then 'ServiceCharge'
        else 'Extra'
      end,
      null,
      coalesce(v_fee.account_code, (select code from chart_of_accounts where name ilike '%miscellaneous%' limit 1)),
      'frontoffice', p_user_id
    );
  end loop;

  -- Phase 2: Calculate VAT on (discounted base + non-VAT fees), insert last
  select
    (elem->>'name')::text,
    (elem->>'value')::numeric,
    (elem->>'accountCode')::text
  into v_vat_name, v_vat_rate, v_vat_account
  from global_settings, jsonb_array_elements(fee_components) as elem
  where global_settings.id = 'main'
  and (elem->>'isEnabled')::boolean = true
  and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
  limit 1;

  if v_vat_name is not null and v_vat_rate > 0 then
    v_vat_amount := round((v_discounted_base + v_non_vat_fees) * v_vat_rate / 100, 2);
    v_line_num := v_line_num + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      v_vat_name || ' @ ' || v_vat_rate || '% on room charge',
      v_vat_amount, 1, v_vat_amount, 'Tax', null,
      coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
      'frontoffice', p_user_id
    );
  end if;

  -- Update folio balance
  update folios
  set balance = balance + v_discounted_base + v_non_vat_fees + v_vat_amount,
      total_charges = total_charges + v_discounted_base + v_non_vat_fees + v_vat_amount,
      tax_total = tax_total + v_vat_amount,
      service_charge_total = service_charge_total + v_sc_total,
      updated_at = v_now
  where id = v_folio_id;

  -- Process payment if provided
  if p_payment_amount is not null and p_payment_amount > 0 then
    insert into folio_payments (
      id, folio_id, amount, payment_method, reference_number, user_id, created_at
    ) values (
      gen_random_uuid()::text, v_folio_id, p_payment_amount, p_payment_method, p_payment_reference, p_user_id, v_now
    ) returning id into v_payment_id;

    update folios
    set total_payments = total_payments + p_payment_amount,
        balance = balance - p_payment_amount,
        updated_at = v_now
    where id = v_folio_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'reservationId', p_reservation_id,
    'folioId', v_folio_id,
    'roomNumber', v_reservation.room_number,
    'checkInDate', v_now
  );
end;
$$;

-- Grant execute permission
grant execute on function check_in_reservation to authenticated;

-- END: 064b_fix_all_ambiguous_id_references.sql

-- =========================================================================
-- Migration: 065_db_only_monetary_calculations.sql
-- =========================================================================
-- Migration 065: Database-Only Monetary Calculations
-- This migration ensures ALL monetary values are calculated and stored in the database,
-- eliminating frontend calculation discrepancies.

-- Part 1: Create function to get reservation balance from folios
create or replace function get_reservation_balance(p_reservation_id text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_balance numeric := 0;
  v_total_charges numeric := 0;
  v_total_payments numeric := 0;
  v_folio record;
begin
  -- Sum balances from all folios for this reservation
  for v_folio in
    select 
      coalesce(balance, 0) as folio_balance,
      coalesce(total_charges, 0) as folio_charges,
      coalesce(total_payments, 0) as folio_payments
    from folios
    where reservation_id = p_reservation_id
  loop
    v_balance := v_balance + v_folio.folio_balance;
    v_total_charges := v_total_charges + v_folio.folio_charges;
    v_total_payments := v_total_payments + v_folio.folio_payments;
  end loop;

  return jsonb_build_object(
    'reservationId', p_reservation_id,
    'outstandingBalance', v_balance,
    'totalCharges', v_total_charges,
    'totalPayments', v_total_payments,
    'isSettled', v_balance <= 0
  );
end;
$$;

-- Part 2: Create function to get reservation total amount from database
create or replace function get_reservation_total(p_reservation_id text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_total_amount numeric;
  v_base_amount numeric := 0;
  v_discount_amount numeric := 0;
  v_tax_amount numeric := 0;
  v_service_charge numeric := 0;
  v_other_fees numeric := 0;
begin
  -- Get total_amount from reservations table (authoritative source)
  select coalesce(total_amount, 0) into v_total_amount
  from reservations
  where id = p_reservation_id;

  -- Calculate breakdown from folio_lines
  select
    coalesce(sum(case when line_type = 'RoomRate' then amount else 0 end), 0) +
    coalesce(sum(case when line_type = 'Extra' and description not ilike '%discount%' then amount else 0 end), 0)
  into v_base_amount
  from folio_lines fl
  join folios f on f.id = fl.folio_id
  where f.reservation_id = p_reservation_id
  and fl.is_voided = false;

  select coalesce(sum(abs(amount)), 0) into v_discount_amount
  from folio_lines fl
  join folios f on f.id = fl.folio_id
  where f.reservation_id = p_reservation_id
  and fl.line_type = 'Discount'
  and fl.is_voided = false;

  select coalesce(sum(amount), 0) into v_tax_amount
  from folio_lines fl
  join folios f on f.id = fl.folio_id
  where f.reservation_id = p_reservation_id
  and fl.line_type = 'Tax'
  and fl.is_voided = false;

  select coalesce(sum(amount), 0) into v_service_charge
  from folio_lines fl
  join folios f on f.id = fl.folio_id
  where f.reservation_id = p_reservation_id
  and fl.line_type = 'ServiceCharge'
  and fl.is_voided = false;

  select coalesce(sum(amount), 0) into v_other_fees
  from folio_lines fl
  join folios f on f.id = fl.folio_id
  where f.reservation_id = p_reservation_id
  and fl.line_type = 'Extra'
  and fl.is_voided = false
  and fl.description not ilike '%service%';

  return jsonb_build_object(
    'reservationId', p_reservation_id,
    'totalAmount', v_total_amount,
    'baseAmount', v_base_amount,
    'discountAmount', v_discount_amount,
    'taxAmount', v_tax_amount,
    'serviceChargeAmount', v_service_charge,
    'otherFeesAmount', v_other_fees
  );
end;
$$;

-- Part 3: Create function to get effective nightly rate from database
create or replace function get_effective_nightly_rate(
  p_room_type text,
  p_check_in_date date,
  p_rate_plan_id text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_base_rate numeric;
  v_season_multiplier numeric := 1.0;
  v_rate_plan_modifier numeric := 1.0;
  v_effective_rate numeric;
  v_season_name text := '';
  v_rate_plan_name text := 'Standard Rate';
begin
  -- Get base rate from rooms table (first room of this type)
  select coalesce(rate, 0) into v_base_rate
  from rooms
  where type = p_room_type
  limit 1;

  -- Get seasonal multiplier
  select 
    coalesce(multiplier, 1.0),
    name
  into v_season_multiplier, v_season_name
  from seasons
  where 
    (to_char(p_check_in_date, 'MM')::int = start_month and to_char(p_check_in_date, 'DD')::int >= start_day)
    or
    (to_char(p_check_in_date, 'MM')::int = end_month and to_char(p_check_in_date, 'DD')::int <= end_day)
    or
    (start_month > end_month and (
      (to_char(p_check_in_date, 'MM')::int = start_month and to_char(p_check_in_date, 'DD')::int >= start_day) or
      (to_char(p_check_in_date, 'MM')::int = end_month and to_char(p_check_in_date, 'DD')::int <= end_day)
    ))
  limit 1;

  -- Get rate plan modifier
  if p_rate_plan_id is not null then
    select 
      coalesce(base_modifier, 1.0),
      name
    into v_rate_plan_modifier, v_rate_plan_name
    from rate_plans
    where id = p_rate_plan_id
    and active = true
    limit 1;
  end if;

  v_effective_rate := round(v_base_rate * v_season_multiplier * v_rate_plan_modifier, 2);

  return jsonb_build_object(
    'roomType', p_room_type,
    'baseRate', v_base_rate,
    'seasonMultiplier', v_season_multiplier,
    'seasonName', v_season_name,
    'ratePlanModifier', v_rate_plan_modifier,
    'ratePlanName', v_rate_plan_name,
    'effectiveRate', v_effective_rate
  );
end;
$$;

-- Grant execute permissions
grant execute on function get_reservation_balance(text) to authenticated;
grant execute on function get_reservation_total(text) to authenticated;
grant execute on function get_effective_nightly_rate(text, date, text) to authenticated;

-- END: 065_db_only_monetary_calculations.sql

-- =========================================================================
-- Migration: 066_fix_check_in_room_column.sql
-- =========================================================================
-- Migration 066: Fix check_in_reservation room column / parameter mismatch
-- Migration 064 introduced a broken signature that referenced the non-existent
-- reservations.room_id column and swapped p_user_id / p_room_id semantics so the
-- room number sent by the server was stored as created_by. That caused a 500 on
-- every POST /api/reservations/:id/check-in call.
--
-- This migration drops all overloaded variants of check_in_reservation and
-- recreates it with the corrected signature (p_user_id, p_room_number) using the
-- existing reservations.room_number column.

-- Drop all versions of check_in_reservation by OID to avoid overloading
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT oid FROM pg_proc WHERE proname = 'check_in_reservation'
  LOOP
    EXECUTE 'DROP FUNCTION ' || func_record.oid::regprocedure || ' CASCADE';
  END LOOP;
END $$;

-- Recreate check_in_reservation with the corrected signature
create or replace function check_in_reservation(
  p_reservation_id text,
  p_user_id text,
  p_room_number text default null,
  p_payment_method text default null,
  p_payment_amount numeric default null,
  p_payment_reference text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation reservations%rowtype;
  v_folio_id text;
  v_line_num integer;
  v_business_date date;
  v_now timestamp with time zone := now();
  v_base_amount numeric;
  v_discount_percent numeric := 0.0;
  v_discount_amount numeric := 0.00;
  v_discounted_base numeric;
  v_fee record;
  v_fee_amount numeric;
  v_non_vat_fees numeric := 0.00;
  v_vat_amount numeric := 0.00;
  v_vat_name text := '';
  v_vat_rate numeric := 0;
  v_vat_account text := '';
  v_sc_total numeric := 0.00;
  v_payment_id text;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Lock reservation
  select * into v_reservation
  from reservations
  where id = p_reservation_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  if v_reservation.status = 'CheckedIn' then
    return jsonb_build_object('success', false, 'error', 'Reservation already checked in');
  end if;

  -- Update reservation status and room assignment
  update reservations
  set status = 'CheckedIn',
      check_in_date = v_now,
      check_out_date = v_reservation.check_out_date,
      room_number = coalesce(p_room_number, room_number)
  where id = p_reservation_id;

  -- Create folio if not exists
  select id into v_folio_id
  from folios
  where reservation_id = p_reservation_id
    and status = 'Open'
  limit 1;

  if v_folio_id is null then
    v_folio_id := gen_random_uuid()::text;
    insert into folios (
      id, reservation_id, folio_type, status, balance, total_charges, total_payments,
      currency, opened_at, created_by
    ) values (
      v_folio_id, p_reservation_id, 'Guest', 'Open', 0, 0, 0,
      'USD', v_now, p_user_id
    );
  end if;

  -- Calculate base amount from reservation charges
  v_base_amount := coalesce(v_reservation.total_amount, 0);
  v_discount_percent := coalesce(v_reservation.discount_percent, 0);

  -- Calculate discount
  if v_discount_percent > 0 then
    v_discount_amount := round(v_base_amount * v_discount_percent / 100, 2);
  end if;
  v_discounted_base := v_base_amount - v_discount_amount;

  -- Get next line number
  select coalesce(max(line_number), 0) + 1 into v_line_num
  from folio_lines
  where folio_id = v_folio_id;

  -- Insert base room charge line
  insert into folio_lines (
    id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
    line_type, target_folio, revenue_account_code, source_module, created_by
  ) values (
    gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
    'Room charge - ' || coalesce(v_reservation.room_type, 'reservation'),
    v_base_amount, 1, v_base_amount, 'Room', null,
    (select code from chart_of_accounts where name ilike '%room revenue%' limit 1),
    'frontoffice', p_user_id
  );

  -- Insert discount line if applicable
  if v_discount_percent > 0 then
    v_line_num := v_line_num + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      'Discount @ ' || v_discount_percent || '% on room charge',
      -v_discount_amount, 1, -v_discount_amount, 'Discount', null,
      (select code from chart_of_accounts where name ilike '%discount%' limit 1),
      'frontoffice', p_user_id
    );
  end if;

  -- Phase 1: Calculate non-VAT fees on the discounted base, insert lines
  for v_fee in
    select
      (elem->>'name')::text as name,
      (elem->>'feeType')::text as fee_type,
      (elem->>'value')::numeric as value,
      (elem->>'accountCode')::text as account_code
    from global_settings, jsonb_array_elements(fee_components) as elem
    where global_settings.id = 'main'
    and (elem->>'isEnabled')::boolean = true
    and lower((elem->>'name')::text) not like '%vat%'
    and lower((elem->>'name')::text) not like '%tax%'
    order by (elem->>'displayOrder')::int asc
  loop
    v_line_num := v_line_num + 1;
    if v_fee.fee_type = 'percentage' then
      v_fee_amount := round(v_discounted_base * v_fee.value / 100, 2);
    else
      v_fee_amount := v_fee.value;
    end if;
    v_non_vat_fees := v_non_vat_fees + v_fee_amount;

    if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
      v_sc_total := v_sc_total + v_fee_amount;
    end if;

    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      v_fee.name || case when v_fee.fee_type = 'percentage' then ' @ ' || v_fee.value || '% on room charge' else ' (Fixed) on room charge' end,
      v_fee_amount, 1, v_fee_amount,
      case
        when lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then 'ServiceCharge'
        else 'Extra'
      end,
      null,
      coalesce(v_fee.account_code, (select code from chart_of_accounts where name ilike '%miscellaneous%' limit 1)),
      'frontoffice', p_user_id
    );
  end loop;

  -- Phase 2: Calculate VAT on (discounted base + non-VAT fees), insert last
  select
    (elem->>'name')::text,
    (elem->>'value')::numeric,
    (elem->>'accountCode')::text
  into v_vat_name, v_vat_rate, v_vat_account
  from global_settings, jsonb_array_elements(fee_components) as elem
  where global_settings.id = 'main'
  and (elem->>'isEnabled')::boolean = true
  and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
  limit 1;

  if v_vat_name is not null and v_vat_rate > 0 then
    v_vat_amount := round((v_discounted_base + v_non_vat_fees) * v_vat_rate / 100, 2);
    v_line_num := v_line_num + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      v_vat_name || ' @ ' || v_vat_rate || '% on room charge',
      v_vat_amount, 1, v_vat_amount, 'Tax', null,
      coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
      'frontoffice', p_user_id
    );
  end if;

  -- Update folio balance
  update folios
  set balance = balance + v_discounted_base + v_non_vat_fees + v_vat_amount,
      total_charges = total_charges + v_discounted_base + v_non_vat_fees + v_vat_amount,
      tax_total = tax_total + v_vat_amount,
      service_charge_total = service_charge_total + v_sc_total,
      updated_at = v_now
  where id = v_folio_id;

  -- Process payment if provided
  if p_payment_amount is not null and p_payment_amount > 0 then
    insert into folio_payments (
      id, folio_id, amount, payment_method, reference_number, user_id, created_at
    ) values (
      gen_random_uuid()::text, v_folio_id, p_payment_amount, p_payment_method, p_payment_reference, p_user_id, v_now
    ) returning id into v_payment_id;

    update folios
    set total_payments = total_payments + p_payment_amount,
        balance = balance - p_payment_amount,
        updated_at = v_now
    where id = v_folio_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'reservationId', p_reservation_id,
    'folioId', v_folio_id,
    'roomNumber', v_reservation.room_number,
    'checkInDate', v_now
  );
end;
$$;

-- Grant execute permission
grant execute on function check_in_reservation to authenticated;

-- END: 066_fix_check_in_room_column.sql

-- =========================================================================
-- Migration: 067_fix_check_in_reservation_updated_at.sql
-- =========================================================================
-- Migration 067: Fix check_in_reservation reference to non-existent reservations.updated_at
-- Migration 066's function tried to set reservations.updated_at, but the reservations
-- table does not have that column. This drops all overloaded variants and recreates
-- the function without that assignment.

-- Drop all versions of check_in_reservation by OID to avoid overloading
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT oid FROM pg_proc WHERE proname = 'check_in_reservation'
  LOOP
    EXECUTE 'DROP FUNCTION ' || func_record.oid::regprocedure || ' CASCADE';
  END LOOP;
END $$;

-- Recreate check_in_reservation with the corrected signature and column references
create or replace function check_in_reservation(
  p_reservation_id text,
  p_user_id text,
  p_room_number text default null,
  p_payment_method text default null,
  p_payment_amount numeric default null,
  p_payment_reference text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation reservations%rowtype;
  v_folio_id text;
  v_line_num integer;
  v_business_date date;
  v_now timestamp with time zone := now();
  v_base_amount numeric;
  v_discount_percent numeric := 0.0;
  v_discount_amount numeric := 0.00;
  v_discounted_base numeric;
  v_fee record;
  v_fee_amount numeric;
  v_non_vat_fees numeric := 0.00;
  v_vat_amount numeric := 0.00;
  v_vat_name text := '';
  v_vat_rate numeric := 0;
  v_vat_account text := '';
  v_sc_total numeric := 0.00;
  v_payment_id text;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Lock reservation
  select * into v_reservation
  from reservations
  where id = p_reservation_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  if v_reservation.status = 'CheckedIn' then
    return jsonb_build_object('success', false, 'error', 'Reservation already checked in');
  end if;

  -- Update reservation status and room assignment
  update reservations
  set status = 'CheckedIn',
      check_in_date = v_now,
      check_out_date = v_reservation.check_out_date,
      room_number = coalesce(p_room_number, room_number)
  where id = p_reservation_id;

  -- Create folio if not exists
  select id into v_folio_id
  from folios
  where reservation_id = p_reservation_id
    and status = 'Open'
  limit 1;

  if v_folio_id is null then
    v_folio_id := gen_random_uuid()::text;
    insert into folios (
      id, reservation_id, folio_type, status, balance, total_charges, total_payments,
      currency, opened_at, created_by
    ) values (
      v_folio_id, p_reservation_id, 'Guest', 'Open', 0, 0, 0,
      'USD', v_now, p_user_id
    );
  end if;

  -- Calculate base amount from reservation charges
  v_base_amount := coalesce(v_reservation.total_amount, 0);
  v_discount_percent := coalesce(v_reservation.discount_percent, 0);

  -- Calculate discount
  if v_discount_percent > 0 then
    v_discount_amount := round(v_base_amount * v_discount_percent / 100, 2);
  end if;
  v_discounted_base := v_base_amount - v_discount_amount;

  -- Get next line number
  select coalesce(max(line_number), 0) + 1 into v_line_num
  from folio_lines
  where folio_id = v_folio_id;

  -- Insert base room charge line
  insert into folio_lines (
    id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
    line_type, target_folio, revenue_account_code, source_module, created_by
  ) values (
    gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
    'Room charge - ' || coalesce(v_reservation.room_type, 'reservation'),
    v_base_amount, 1, v_base_amount, 'Room', null,
    (select code from chart_of_accounts where name ilike '%room revenue%' limit 1),
    'frontoffice', p_user_id
  );

  -- Insert discount line if applicable
  if v_discount_percent > 0 then
    v_line_num := v_line_num + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      'Discount @ ' || v_discount_percent || '% on room charge',
      -v_discount_amount, 1, -v_discount_amount, 'Discount', null,
      (select code from chart_of_accounts where name ilike '%discount%' limit 1),
      'frontoffice', p_user_id
    );
  end if;

  -- Phase 1: Calculate non-VAT fees on the discounted base, insert lines
  for v_fee in
    select
      (elem->>'name')::text as name,
      (elem->>'feeType')::text as fee_type,
      (elem->>'value')::numeric as value,
      (elem->>'accountCode')::text as account_code
    from global_settings, jsonb_array_elements(fee_components) as elem
    where global_settings.id = 'main'
    and (elem->>'isEnabled')::boolean = true
    and lower((elem->>'name')::text) not like '%vat%'
    and lower((elem->>'name')::text) not like '%tax%'
    order by (elem->>'displayOrder')::int asc
  loop
    v_line_num := v_line_num + 1;
    if v_fee.fee_type = 'percentage' then
      v_fee_amount := round(v_discounted_base * v_fee.value / 100, 2);
    else
      v_fee_amount := v_fee.value;
    end if;
    v_non_vat_fees := v_non_vat_fees + v_fee_amount;

    if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
      v_sc_total := v_sc_total + v_fee_amount;
    end if;

    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      v_fee.name || case when v_fee.fee_type = 'percentage' then ' @ ' || v_fee.value || '% on room charge' else ' (Fixed) on room charge' end,
      v_fee_amount, 1, v_fee_amount,
      case
        when lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then 'ServiceCharge'
        else 'Extra'
      end,
      null,
      coalesce(v_fee.account_code, (select code from chart_of_accounts where name ilike '%miscellaneous%' limit 1)),
      'frontoffice', p_user_id
    );
  end loop;

  -- Phase 2: Calculate VAT on (discounted base + non-VAT fees), insert last
  select
    (elem->>'name')::text,
    (elem->>'value')::numeric,
    (elem->>'accountCode')::text
  into v_vat_name, v_vat_rate, v_vat_account
  from global_settings, jsonb_array_elements(fee_components) as elem
  where global_settings.id = 'main'
  and (elem->>'isEnabled')::boolean = true
  and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
  limit 1;

  if v_vat_name is not null and v_vat_rate > 0 then
    v_vat_amount := round((v_discounted_base + v_non_vat_fees) * v_vat_rate / 100, 2);
    v_line_num := v_line_num + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      v_vat_name || ' @ ' || v_vat_rate || '% on room charge',
      v_vat_amount, 1, v_vat_amount, 'Tax', null,
      coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
      'frontoffice', p_user_id
    );
  end if;

  -- Update folio balance
  update folios
  set balance = balance + v_discounted_base + v_non_vat_fees + v_vat_amount,
      total_charges = total_charges + v_discounted_base + v_non_vat_fees + v_vat_amount,
      tax_total = tax_total + v_vat_amount,
      service_charge_total = service_charge_total + v_sc_total,
      updated_at = v_now
  where id = v_folio_id;

  -- Process payment if provided
  if p_payment_amount is not null and p_payment_amount > 0 then
    insert into folio_payments (
      id, folio_id, amount, payment_method, reference_number, user_id, created_at
    ) values (
      gen_random_uuid()::text, v_folio_id, p_payment_amount, p_payment_method, p_payment_reference, p_user_id, v_now
    ) returning id into v_payment_id;

    update folios
    set total_payments = total_payments + p_payment_amount,
        balance = balance - p_payment_amount,
        updated_at = v_now
    where id = v_folio_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'reservationId', p_reservation_id,
    'folioId', v_folio_id,
    'roomNumber', v_reservation.room_number,
    'checkInDate', v_now
  );
end;
$$;

-- Grant execute permission
grant execute on function check_in_reservation to authenticated;

-- END: 067_fix_check_in_reservation_updated_at.sql

-- =========================================================================
-- Migration: 068_add_folios_created_at.sql
-- =========================================================================
-- Migration 068: Add missing created_at column to folios and clean up old check_in_reservation overload
-- check_in_reservation and other folio workflows reference folios.created_at,
-- but the column was never added to the live schema.
-- Also removes the old 3-parameter signature left by schema.sql / migration 058
-- so the server no longer gets an "ambiguous function" error.

-- Drop the old 3-parameter overload (reservation_id, room_number, user_id)
drop function if exists check_in_reservation(text, text, text) cascade;

-- Add the missing column
alter table folios
add column if not exists created_at timestamp with time zone not null default now();

-- END: 068_add_folios_created_at.sql

-- =========================================================================
-- Migration: 069_fix_folio_trigger_folio_id.sql
-- =========================================================================
-- Migration 069: Fix sync_folio_lines_to_reservation_charges trigger function for folios
-- Migration 060 attached this trigger function to the folios table, but the function
-- references NEW.folio_id, which does not exist on the folios table (folios uses id).
-- That caused the error: record "new" has no field "folio_id" when check-in inserted a folio.

create or replace function sync_folio_lines_to_reservation_charges()
returns trigger
language plpgsql
security definer
as $$
declare
  v_folio_id text;
  v_reservation_id text;
  v_charges jsonb := '[]'::jsonb;
  v_payments jsonb := '[]'::jsonb;
  v_line record;
  v_payment record;
begin
  -- Determine the folio id based on which table fired the trigger.
  -- folios has id; folio_lines and folio_payments have folio_id.
  if tg_table_name = 'folios' then
    if tg_op = 'DELETE' then
      v_folio_id := old.id;
    else
      v_folio_id := new.id;
    end if;
  else
    v_folio_id := coalesce(new.folio_id, old.folio_id);
  end if;

  -- Get reservation_id from the folio
  select reservation_id into v_reservation_id
  from folios
  where id = v_folio_id;

  if v_reservation_id is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  -- Rebuild charges array from all folio_lines for this reservation
  for v_line in
    select
      fl.id, fl.line_number, fl.transaction_date, fl.description,
      fl.amount, fl.quantity, fl.unit_price, fl.line_type, fl.is_voided, fl.created_at
    from folio_lines fl
    join folios f on f.id = fl.folio_id
    where f.reservation_id = v_reservation_id
    order by f.id, fl.line_number
  loop
    v_charges := v_charges || jsonb_build_object(
      'id', v_line.id,
      'lineNumber', v_line.line_number,
      'date', v_line.transaction_date,
      'description', v_line.description,
      'amount', v_line.amount,
      'quantity', v_line.quantity,
      'unitPrice', v_line.unit_price,
      'lineType', v_line.line_type,
      'isVoided', v_line.is_voided,
      'createdAt', v_line.created_at
    );
  end loop;

  -- Rebuild payments array from all folio_payments for this reservation
  for v_payment in
    select
      fp.id, fp.payment_date, fp.amount, fp.payment_method, fp.reference_number, fp.is_voided, fp.created_at
    from folio_payments fp
    join folios f on f.id = fp.folio_id
    where f.reservation_id = v_reservation_id
    order by f.id, fp.payment_date
  loop
    v_payments := v_payments || jsonb_build_object(
      'id', v_payment.id,
      'date', v_payment.payment_date,
      'amount', v_payment.amount,
      'paymentMethod', v_payment.payment_method,
      'reference', v_payment.reference_number,
      'isVoided', v_payment.is_voided,
      'createdAt', v_payment.created_at
    );
  end loop;

  -- Update reservation.charges and reservation.payments
  update reservations
  set charges = v_charges,
      payments = v_payments
  where id = v_reservation_id;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- END: 069_fix_folio_trigger_folio_id.sql

-- =========================================================================
-- Migration: 070_fix_folio_trigger_ambiguous_id.sql
-- =========================================================================
-- Migration 070: Fix ambiguous "id" column references in sync_folio_lines_to_reservation_charges
-- The trigger function joins folio_lines/folio_payments with folios and selects "id"
-- without qualifying it, causing a 42702 ambiguous-column error when the trigger fires.

create or replace function sync_folio_lines_to_reservation_charges()
returns trigger
language plpgsql
security definer
as $$
declare
  v_folio_id text;
  v_reservation_id text;
  v_charges jsonb := '[]'::jsonb;
  v_payments jsonb := '[]'::jsonb;
  v_line record;
  v_payment record;
begin
  -- Determine the folio id based on which table fired the trigger.
  -- folios has id; folio_lines and folio_payments have folio_id.
  if tg_table_name = 'folios' then
    if tg_op = 'DELETE' then
      v_folio_id := old.id;
    else
      v_folio_id := new.id;
    end if;
  else
    v_folio_id := coalesce(new.folio_id, old.folio_id);
  end if;

  -- Get reservation_id from the folio
  select reservation_id into v_reservation_id
  from folios
  where id = v_folio_id;

  if v_reservation_id is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  -- Rebuild charges array from all folio_lines for this reservation
  for v_line in
    select
      fl.id, fl.line_number, fl.transaction_date, fl.description,
      fl.amount, fl.quantity, fl.unit_price, fl.line_type, fl.is_voided, fl.created_at
    from folio_lines fl
    join folios f on f.id = fl.folio_id
    where f.reservation_id = v_reservation_id
    order by f.id, fl.line_number
  loop
    v_charges := v_charges || jsonb_build_object(
      'id', v_line.id,
      'lineNumber', v_line.line_number,
      'date', v_line.transaction_date,
      'description', v_line.description,
      'amount', v_line.amount,
      'quantity', v_line.quantity,
      'unitPrice', v_line.unit_price,
      'lineType', v_line.line_type,
      'isVoided', v_line.is_voided,
      'createdAt', v_line.created_at
    );
  end loop;

  -- Rebuild payments array from all folio_payments for this reservation
  for v_payment in
    select
      fp.id, fp.payment_date, fp.amount, fp.payment_method, fp.reference_number, fp.is_voided, fp.created_at
    from folio_payments fp
    join folios f on f.id = fp.folio_id
    where f.reservation_id = v_reservation_id
    order by f.id, fp.payment_date
  loop
    v_payments := v_payments || jsonb_build_object(
      'id', v_payment.id,
      'date', v_payment.payment_date,
      'amount', v_payment.amount,
      'paymentMethod', v_payment.payment_method,
      'reference', v_payment.reference_number,
      'isVoided', v_payment.is_voided,
      'createdAt', v_payment.created_at
    );
  end loop;

  -- Update reservation.charges and reservation.payments
  update reservations
  set charges = v_charges,
      payments = v_payments
  where id = v_reservation_id;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- END: 070_fix_folio_trigger_ambiguous_id.sql

-- =========================================================================
-- Migration: 071_id_card_storage.sql
-- =========================================================================
-- Migration 071: ID Card Storage for Check-In
-- Creates storage bucket and database structure for storing guest ID cards during check-in
-- ID cards will be displayed in the CRM module

-- Create storage bucket for ID cards
insert into storage.buckets (id, name, public)
values ('id-cards', 'id-cards', true)
on conflict (id) do nothing;

-- Drop existing policies if they exist
drop policy if exists "id_cards_public_read" on storage.objects;
drop policy if exists "id_cards_authenticated_read" on storage.objects;
drop policy if exists "id_cards_authenticated_write" on storage.objects;
drop policy if exists "id_cards_authenticated_update" on storage.objects;
drop policy if exists "id_cards_authenticated_delete" on storage.objects;

-- Create read policy (public read for displaying in CRM)
create policy "id_cards_public_read"
  on storage.objects for select
  using (bucket_id = 'id-cards');

-- Create write policy (authenticated users only)
create policy "id_cards_authenticated_write"
  on storage.objects for insert
  with check (bucket_id = 'id-cards');

-- Create update/delete policy (authenticated users only)
create policy "id_cards_authenticated_update"
  on storage.objects for update
  using (bucket_id = 'id-cards');

create policy "id_cards_authenticated_delete"
  on storage.objects for delete
  using (bucket_id = 'id-cards');

-- Enhance the identification_doc column structure with proper indexing
-- The column already exists as JSONB, we'll add a comment to document the expected structure
comment on column guests.identification_doc is 
'ID card information stored as JSONB with structure:
{
  "type": "Passport|National ID|Drivers License",
  "number": "document number",
  "expiryDate": "YYYY-MM-DD",
  "issueDate": "YYYY-MM-DD",
  "issuingCountry": "country code",
  "frontImageUrl": "storage URL for front of ID",
  "backImageUrl": "storage URL for back of ID",
  "uploadedAt": "ISO timestamp",
  "isUploaded": true,
  "verifiedAt": "ISO timestamp when verified"
}';

-- Add index on identification_doc for faster queries
create index if not exists idx_guests_identification_doc on guests using gin (identification_doc jsonb_path_ops);

-- Create a function to update guest ID card information
create or replace function update_guest_id_card(
  p_guest_id text,
  p_doc_type text,
  p_doc_number text,
  p_expiry_date text,
  p_issue_date text default null,
  p_issuing_country text default null,
  p_front_image_url text default null,
  p_back_image_url text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_identification_doc jsonb;
begin
  -- Get existing identification_doc or create new
  select identification_doc into v_identification_doc
  from guests
  where id = p_guest_id;
  
  if v_identification_doc is null then
    v_identification_doc := '{}'::jsonb;
  end if;
  
  -- Update the identification_doc with new information
  v_identification_doc := jsonb_build_object(
    'type', p_doc_type,
    'number', p_doc_number,
    'expiryDate', p_expiry_date,
    'issueDate', coalesce(p_issue_date, v_identification_doc->>'issueDate'),
    'issuingCountry', coalesce(p_issuing_country, v_identification_doc->>'issuingCountry'),
    'frontImageUrl', coalesce(p_front_image_url, v_identification_doc->>'frontImageUrl'),
    'backImageUrl', coalesce(p_back_image_url, v_identification_doc->>'backImageUrl'),
    'uploadedAt', now()::text,
    'isUploaded', true,
    'verifiedAt', now()::text
  );
  
  -- Update the guest record
  update guests
  set identification_doc = v_identification_doc
  where id = p_guest_id;
  
  return v_identification_doc;
end;
$$;

-- Grant execute permission on the function
grant execute on function update_guest_id_card to authenticated;

-- END: 071_id_card_storage.sql

-- =========================================================================
-- Migration: 071b_link_payments_to_invoices.sql
-- =========================================================================
-- Migration 071: Link folio_payments to invoice_documents
-- This establishes a direct relationship between payments and invoices for audit trail purposes

-- 1. Add invoice_id column to folio_payments
ALTER TABLE folio_payments 
ADD COLUMN IF NOT EXISTS invoice_id text REFERENCES invoice_documents(id) ON DELETE SET NULL;

-- 2. Create index for invoice_id lookups
CREATE INDEX IF NOT EXISTS idx_folio_payments_invoice_id ON folio_payments(invoice_id);

-- 3. Add comment to document the relationship
COMMENT ON COLUMN folio_payments.invoice_id IS 'References the invoice document this payment is associated with, if any';

-- 4. Update sync_folio_lines_to_reservation_charges to include invoice_id in payments array
CREATE OR REPLACE FUNCTION sync_folio_lines_to_reservation_charges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_folio_id text;
  v_reservation_id text;
  v_charges jsonb := '[]'::jsonb;
  v_payments jsonb := '[]'::jsonb;
  v_line record;
  v_payment record;
BEGIN
  -- Determine the folio id based on which table fired the trigger.
  -- folios has id; folio_lines and folio_payments have folio_id.
  IF tg_table_name = 'folios' THEN
    IF tg_op = 'DELETE' THEN
      v_folio_id := old.id;
    ELSE
      v_folio_id := new.id;
    END IF;
  ELSE
    v_folio_id := coalesce(new.folio_id, old.folio_id);
  END IF;

  -- Get reservation_id from the folio
  SELECT reservation_id INTO v_reservation_id
  FROM folios
  WHERE id = v_folio_id;

  IF v_reservation_id IS NULL THEN
    IF tg_op = 'DELETE' THEN RETURN old; END IF;
    RETURN new;
  END IF;

  -- Rebuild charges array from all folio_lines for this reservation
  FOR v_line IN
    SELECT
      fl.id, fl.line_number, fl.transaction_date, fl.description,
      fl.amount, fl.quantity, fl.unit_price, fl.line_type, fl.is_voided, fl.created_at
    FROM folio_lines fl
    JOIN folios f ON f.id = fl.folio_id
    WHERE f.reservation_id = v_reservation_id
    ORDER BY f.id, fl.line_number
  LOOP
    v_charges := v_charges || jsonb_build_object(
      'id', v_line.id,
      'lineNumber', v_line.line_number,
      'date', v_line.transaction_date,
      'description', v_line.description,
      'amount', v_line.amount,
      'quantity', v_line.quantity,
      'unitPrice', v_line.unit_price,
      'lineType', v_line.line_type,
      'isVoided', v_line.is_voided,
      'createdAt', v_line.created_at
    );
  END LOOP;

  -- Rebuild payments array from all folio_payments for this reservation (now includes invoice_id)
  FOR v_payment IN
    SELECT
      fp.id, fp.payment_date, fp.amount, fp.payment_method, fp.reference_number, 
      fp.is_voided, fp.created_at, fp.invoice_id
    FROM folio_payments fp
    JOIN folios f ON f.id = fp.folio_id
    WHERE f.reservation_id = v_reservation_id
    ORDER BY f.id, fp.payment_date
  LOOP
    v_payments := v_payments || jsonb_build_object(
      'id', v_payment.id,
      'date', v_payment.payment_date,
      'amount', v_payment.amount,
      'paymentMethod', v_payment.payment_method,
      'reference', v_payment.reference_number,
      'isVoided', v_payment.is_voided,
      'invoiceId', v_payment.invoice_id,
      'createdAt', v_payment.created_at
    );
  END LOOP;

  -- Update reservation.charges and reservation.payments
  UPDATE reservations
  SET charges = v_charges,
      payments = v_payments
  WHERE id = v_reservation_id;

  IF tg_op = 'DELETE' THEN RETURN old; END IF;
  RETURN new;
END;
$$;

-- 5. Create function to link payments to invoice when invoice is generated
CREATE OR REPLACE FUNCTION link_payments_to_invoice(p_invoice_id text, p_folio_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count integer;
BEGIN
  -- Update all non-voided payments for this folio to reference the invoice
  UPDATE folio_payments
  SET invoice_id = p_invoice_id
  WHERE folio_id = p_folio_id
    AND is_voided = false
    AND invoice_id IS NULL;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'invoiceId', p_invoice_id,
    'folioId', p_folio_id,
    'paymentsLinked', v_updated_count
  );
END;
$$;

-- 6. Create function to unlink payments from invoice (when invoice is voided)
CREATE OR REPLACE FUNCTION unlink_payments_from_invoice(p_invoice_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count integer;
BEGIN
  -- Remove invoice reference from all payments linked to this invoice
  UPDATE folio_payments
  SET invoice_id = NULL
  WHERE invoice_id = p_invoice_id;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'invoiceId', p_invoice_id,
    'paymentsUnlinked', v_updated_count
  );
END;
$$;

-- END: 071b_link_payments_to_invoices.sql

-- =========================================================================
-- Migration: 072_auto_invoice_on_folio_close.sql
-- =========================================================================
-- Migration 072: Auto-generate invoice when folio is closed
-- This ensures that when a folio is closed (during checkout), an invoice is automatically created
-- and all payments are linked to that invoice

-- 1. Create function to close folio and auto-generate invoice
CREATE OR REPLACE FUNCTION close_folio_with_invoice(p_folio_id text, p_user_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_folio folios%ROWTYPE;
  v_reservation reservations%ROWTYPE;
  v_folio_totals jsonb;
  v_invoice_id text;
  v_invoice_number text;
  v_charges numeric;
  v_payments numeric;
  v_balance numeric;
  v_payments_linked integer;
BEGIN
  -- Get folio details
  SELECT * INTO v_folio FROM folios WHERE id = p_folio_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Folio not found');
  END IF;

  -- Check if folio is already closed
  IF v_folio.status = 'Closed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Folio is already closed');
  END IF;

  -- Get reservation details
  SELECT * INTO v_reservation FROM reservations WHERE id = v_folio.reservation_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation not found for this folio');
  END IF;

  -- Recompute folio totals
  SELECT recompute_folio_totals(p_folio_id) INTO v_folio_totals;
  
  -- Calculate totals
  v_charges := COALESCE(v_folio_totals->>'total_charges', '0')::numeric;
  v_payments := COALESCE(v_folio_totals->>'total_payments', '0')::numeric;
  v_balance := COALESCE(v_folio_totals->>'folio_balance', '0')::numeric;

  -- Generate invoice number
  v_invoice_number := 'INV-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6));

  -- Create invoice document
  INSERT INTO invoice_documents (
    id, folio_id, invoice_number, invoice_type, issue_date, due_date,
    subtotal, tax_total, discount_total, total, amount_paid, status,
    customer_name, customer_email, customer_address, customer_tin, customer_vat_no,
    hotel_tin, hotel_vat_no, hotel_vat_date, payment_terms, notes,
    is_voided, created_by
  ) VALUES (
    gen_random_uuid()::text,
    p_folio_id,
    v_invoice_number,
    'Guest',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    v_charges,
    0, -- TODO: Calculate from folio lines
    0, -- TODO: Calculate from folio lines
    v_charges,
    v_payments,
    CASE WHEN v_balance <= 0 THEN 'Paid' ELSE 'Issued' END,
    v_reservation.guest_name,
    v_reservation.guest_email,
    NULL,
    v_reservation.guest_tin,
    v_reservation.guest_vat_no,
    NULL, -- TODO: Get from global settings
    NULL, -- TODO: Get from global settings
    NULL, -- TODO: Get from global settings
    'Net 30',
    'Auto-generated on folio close',
    false,
    p_user_id
  ) RETURNING id INTO v_invoice_id;

  -- Link all non-voided payments to the invoice
  UPDATE folio_payments
  SET invoice_id = v_invoice_id
  WHERE folio_id = p_folio_id
    AND is_voided = false
    AND invoice_id IS NULL;

  GET DIAGNOSTICS v_payments_linked = ROW_COUNT;

  -- Close the folio
  UPDATE folios
  SET status = 'Closed',
      closed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_folio_id;

  -- Sync reservation payment status
  PERFORM sync_reservation_payment_status(p_folio_id);

  RETURN jsonb_build_object(
    'success', true,
    'folio_id', p_folio_id,
    'invoice_id', v_invoice_id,
    'invoice_number', v_invoice_number,
    'invoice_status', CASE WHEN v_balance <= 0 THEN 'Paid' ELSE 'Issued' END,
    'payments_linked', v_payments_linked,
    'total_charges', v_charges,
    'total_payments', v_payments,
    'balance', v_balance
  );
END;
$$;

-- 2. Create function to close folio without invoice (for cases where invoice already exists)
CREATE OR REPLACE FUNCTION close_folio_only(p_folio_id text, p_user_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_folio folios%ROWTYPE;
BEGIN
  -- Get folio details
  SELECT * INTO v_folio FROM folios WHERE id = p_folio_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Folio not found');
  END IF;

  -- Check if folio is already closed
  IF v_folio.status = 'Closed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Folio is already closed');
  END IF;

  -- Close the folio
  UPDATE folios
  SET status = 'Closed',
      closed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_folio_id;

  -- Sync reservation payment status
  PERFORM sync_reservation_payment_status(p_folio_id);

  RETURN jsonb_build_object(
    'success', true,
    'folio_id', p_folio_id,
    'message', 'Folio closed without generating new invoice'
  );
END;
$$;

-- 3. Grant execute permissions
GRANT EXECUTE ON FUNCTION close_folio_with_invoice TO authenticated;
GRANT EXECUTE ON FUNCTION close_folio_only TO authenticated;

-- END: 072_auto_invoice_on_folio_close.sql

-- =========================================================================
-- Migration: 073_fix_duplicate_payment_keys.sql
-- =========================================================================
-- Migration 073: Fix duplicate payment keys in reservation.payments array
--
-- Bug: When a reservation has multiple folios (e.g., split A/B folios), the
-- sync_folio_lines_to_reservation_charges trigger (migration 060) can return
-- the same payment multiple times because the join between folio_payments and
-- folios doesn't deduplicate by payment ID. This causes React key duplication
-- errors in the frontend.
--
-- Fix: Add DISTINCT to the payment query in the trigger function to ensure
-- each payment appears only once in the reservation.payments array.

-- Drop and recreate the trigger function with DISTINCT
create or replace function sync_folio_lines_to_reservation_charges()
returns trigger as $$
declare
  v_folio_id text;
  v_reservation_id text;
  v_charges jsonb := '[]'::jsonb;
  v_payments jsonb := '[]'::jsonb;
  v_line record;
  v_payment record;
begin
  -- Determine the folio id based on which table fired the trigger.
  -- folios has id; folio_lines and folio_payments have folio_id.
  if tg_table_name = 'folios' then
    if tg_op = 'DELETE' then
      v_folio_id := old.id;
    else
      v_folio_id := new.id;
    end if;
  else
    v_folio_id := coalesce(new.folio_id, old.folio_id);
  end if;

  -- Get reservation_id from the folio
  select reservation_id into v_reservation_id
  from folios
  where id = v_folio_id;

  if v_reservation_id is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  -- Rebuild charges array from all folio_lines for this reservation
  for v_line in
    select
      fl.id, fl.line_number, fl.transaction_date, fl.description,
      fl.amount, fl.quantity, fl.unit_price, fl.line_type, fl.is_voided, fl.created_at
    from folio_lines fl
    join folios f on f.id = fl.folio_id
    where f.reservation_id = v_reservation_id
    order by f.id, fl.line_number
  loop
    v_charges := v_charges || jsonb_build_object(
      'id', v_line.id,
      'lineNumber', v_line.line_number,
      'date', v_line.transaction_date,
      'description', v_line.description,
      'amount', v_line.amount,
      'quantity', v_line.quantity,
      'unitPrice', v_line.unit_price,
      'lineType', v_line.line_type,
      'isVoided', v_line.is_voided,
      'createdAt', v_line.created_at
    );
  end loop;

  -- Rebuild payments array from all folio_payments for this reservation
  -- Use DISTINCT to prevent duplicate payment IDs when reservation has multiple folios
  for v_payment in
    select distinct
      fp.id, fp.payment_date, fp.amount, fp.payment_method, fp.reference_number, fp.is_voided, fp.created_at
    from folio_payments fp
    join folios f on f.id = fp.folio_id
    where f.reservation_id = v_reservation_id
    order by fp.payment_date
  loop
    v_payments := v_payments || jsonb_build_object(
      'id', v_payment.id,
      'date', v_payment.payment_date,
      'amount', v_payment.amount,
      'paymentMethod', v_payment.payment_method,
      'reference', v_payment.reference_number,
      'isVoided', v_payment.is_voided,
      'createdAt', v_payment.created_at
    );
  end loop;

  -- Update reservation.charges and reservation.payments
  update reservations
  set charges = v_charges,
      payments = v_payments
  where id = v_reservation_id;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$ language plpgsql;

-- Recreate triggers on folios, folio_lines, and folio_payments
drop trigger if exists trigger_sync_folio_lines_to_reservation_charges on folios;
create trigger trigger_sync_folio_lines_to_reservation_charges
after insert or update or delete on folios
for each row execute function sync_folio_lines_to_reservation_charges();

drop trigger if exists trigger_sync_folio_lines_to_reservation_charges on folio_lines;
create trigger trigger_sync_folio_lines_to_reservation_charges
after insert or update or delete on folio_lines
for each row execute function sync_folio_lines_to_reservation_charges();

drop trigger if exists trigger_sync_folio_lines_to_reservation_charges on folio_payments;
create trigger trigger_sync_folio_lines_to_reservation_charges
after insert or update or delete on folio_payments
for each row execute function sync_folio_lines_to_reservation_charges();

-- Clean up existing duplicate payment entries in reservation.payments arrays
-- This one-time fix removes duplicates that may have been created before this migration
do $$
declare
  res record;
  v_cleaned_payments jsonb;
  v_seen_ids text[] := array[]::text[];
  v_payment jsonb;
begin
  for res in select id, payments from reservations where payments is not null and jsonb_array_length(payments) > 0 loop
    v_cleaned_payments := '[]'::jsonb;
    v_seen_ids := array[]::text[];
    
    for i in 0..jsonb_array_length(res.payments) - 1 loop
      v_payment := res.payments -> i;
      if not (v_payment->>'id') = any(v_seen_ids) then
        v_cleaned_payments := v_cleaned_payments || v_payment;
        v_seen_ids := array_append(v_seen_ids, v_payment->>'id');
      end if;
    end loop;
    
    if jsonb_array_length(v_cleaned_payments) != jsonb_array_length(res.payments) then
      update reservations set payments = v_cleaned_payments where id = res.id;
    end if;
  end loop;
end $$;

-- END: 073_fix_duplicate_payment_keys.sql

-- =========================================================================
-- Migration: 074_finance_core_architecture.sql
-- =========================================================================
-- ============================================================
-- Finance & Accounting Portal - Core Architecture
-- ============================================================
-- This migration creates the complete finance system architecture
-- following USALI standards and Ethiopian statutory requirements

-- 1. Enhance existing usali_chart_of_accounts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usali_chart_of_accounts' AND column_name = 'normal_balance') THEN
    ALTER TABLE usali_chart_of_accounts ADD COLUMN normal_balance text CHECK (normal_balance IN ('Debit', 'Credit'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usali_chart_of_accounts' AND column_name = 'currency') THEN
    ALTER TABLE usali_chart_of_accounts ADD COLUMN currency text DEFAULT 'ETB';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usali_chart_of_accounts' AND column_name = 'is_control_account') THEN
    ALTER TABLE usali_chart_of_accounts ADD COLUMN is_control_account boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usali_chart_of_accounts' AND column_name = 'balance') THEN
    ALTER TABLE usali_chart_of_accounts ADD COLUMN balance numeric(18,2) DEFAULT 0;
  END IF;
END $$;

UPDATE usali_chart_of_accounts SET normal_balance = 'Debit' WHERE account_type IN ('Asset', 'Expense') AND normal_balance IS NULL;
UPDATE usali_chart_of_accounts SET normal_balance = 'Credit' WHERE account_type IN ('Liability', 'Equity', 'Revenue') AND normal_balance IS NULL;

-- 2. General Ledger - Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  date date NOT NULL,
  period text NOT NULL,
  source text NOT NULL CHECK (source IN ('Manual', 'AP', 'AR', 'POS', 'PMS', 'Payroll', 'Bank', 'System')),
  reference text,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Posted', 'Reversed')),
  total_debit numeric(18,2) NOT NULL DEFAULT 0,
  total_credit numeric(18,2) NOT NULL DEFAULT 0,
  department text,
  created_by text REFERENCES system_users(id) ON DELETE SET NULL,
  approved_by text REFERENCES system_users(id) ON DELETE SET NULL,
  posted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_journal_entries_period ON journal_entries(period);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_date ON journal_entries(date);

-- 3. General Ledger - Journal Lines
CREATE TABLE IF NOT EXISTS journal_lines (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  journal_id text NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_code text NOT NULL REFERENCES usali_chart_of_accounts(code),
  account_name text NOT NULL,
  description text,
  debit numeric(18,2) NOT NULL DEFAULT 0,
  credit numeric(18,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'ETB',
  exchange_rate numeric(12,6) DEFAULT 1.0,
  cost_center text,
  tax_code text,
  memo text,
  line_number integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_journal_lines_journal_id ON journal_lines(journal_id);
CREATE INDEX idx_journal_lines_account_code ON journal_lines(account_code);

-- END: 074_finance_core_architecture.sql

-- =========================================================================
-- Migration: 075_security_hardening_phase1.sql
-- =========================================================================
-- ============================================================
-- Phase 1 Security Hardening
-- ============================================================
-- Goals:
-- 1. Enable RLS on tables that currently ship without it.
-- 2. Block the public `anon` key from sensitive admin/security/financial tables.
-- 3. Allow `anon` SELECT on operational/public tables so the existing
--    frontend read paths keep working while all writes are forced through
--    the trusted Express backend.
-- 4. Add MFA secret storage to system_users.

-- ----------------------------------------------------------------
-- 1. MFA secret storage
-- ----------------------------------------------------------------
ALTER TABLE system_users
  ADD COLUMN IF NOT EXISTS mfa_secret text;

-- ----------------------------------------------------------------
-- 2. Enable RLS on every public table (idempotent)
-- ----------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

-- ----------------------------------------------------------------
-- 3. Sensitive tables: anon gets no access at all
--    (admin, security, financial ledger, configuration)
-- ----------------------------------------------------------------
DO $$
DECLARE
  sensitive_tables text[] := ARRAY[
    'system_users',
    'custom_roles',
    'roles',
    'permissions',
    'role_permissions',
    'user_roles',
    'user_sessions',
    'audit_events',
    'pending_admin_changes',
    'risk_compliance',
    'global_settings',
    'folios',
    'folio_lines',
    'folio_payments',
    'invoice_documents',
    'journal_entries',
    'journal_lines',
    'journal_batches',
    'posting_rules',
    'chart_of_accounts',
    'fiscal_periods',
    'business_dates',
    'void_audit_log',
    'audit_logs'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY sensitive_tables
  LOOP
    -- Drop any existing permissive policies first
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_select', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_no_access', t);
    -- Deny all anon access (service role bypasses RLS, so Express keeps working)
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO anon USING (false) WITH CHECK (false);',
      t || '_anon_no_access', t
    );
  END LOOP;
END $$;

-- ----------------------------------------------------------------
-- 4. Operational / public-facing tables: anon SELECT allowed,
--    writes blocked by default (no INSERT/UPDATE/DELETE policies)
-- ----------------------------------------------------------------
DO $$
DECLARE
  read_only_tables text[] := ARRAY[
    'rooms',
    'guests',
    'reservations',
    'group_bookings',
    'corporate_accounts',
    'inventory_stores',
    'inventory_items',
    'inventory_requisitions',
    'inventory_suppliers',
    'inventory_stock_movements',
    'inventory_grns',
    'sales_transactions',
    'expense_requests',
    'gift_shop_sales',
    'gift_shop_issues',
    'airport_shuttle_requests',
    'group_profiles',
    'guest_group_relationships',
    'group_audit_log',
    'tour_operators',
    'allotments',
    'allotment_pickup_log',
    'operator_contracts',
    'vouchers',
    'ar_ledger',
    'payment_idempotency',
    'bank_accounts',
    'notifications',
    'dispatched_emails',
    'guest_feedbacks',
    'public_testimonials',
    'pages',
    'page_versions',
    'blocks',
    'block_templates',
    'media_assets',
    'policy_page_metadata',
    'legal_page_templates',
    'legal_review_records',
    'page_audit_log',
    'page_preview_links',
    'id_documents',
    'payment_receipts',
    'document_verifications',
    'room_types',
    'yield_policies',
    'guest_services',
    'usali_chart_of_accounts',
    'usali_item_mappings',
    'tax_codes',
    'rate_plans',
    'seasons',
    'packages',
    'fee_components'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY read_only_tables
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_select', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_no_access', t);
    -- SELECT allowed; INSERT/UPDATE/DELETE are denied because no policy matches
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO anon USING (true);',
      t || '_anon_select', t
    );
  END LOOP;
END $$;

-- END: 075_security_hardening_phase1.sql

-- =========================================================================
-- Migration: 076_security_phase1_compatibility.sql
-- =========================================================================
-- ============================================================
-- Phase 1 Security Hardening â€” Compatibility Adjustment
-- ============================================================
-- The previous migration enabled RLS broadly. This migration restores
-- permissive anon access on operational and general admin tables so the
-- existing frontend read/write paths keep working while the core
-- sensitive tables remain locked down.
--
-- Next phase: migrate operational writes to Express endpoints and replace
-- these permissive policies with scoped, command-specific policies.

DO $$
DECLARE
  restore_tables text[] := ARRAY[
    -- Operational tables used by front desk, housekeeping, f&b, inventory, etc.
    'rooms', 'guests', 'reservations', 'group_bookings', 'corporate_accounts',
    'inventory_stores', 'inventory_items', 'inventory_requisitions', 'inventory_suppliers',
    'inventory_stock_movements', 'inventory_grns', 'sales_transactions', 'expense_requests',
    'gift_shop_sales', 'gift_shop_issues', 'airport_shuttle_requests',
    'group_profiles', 'guest_group_relationships', 'group_audit_log',
    'tour_operators', 'allotments', 'allotment_pickup_log', 'operator_contracts',
    'vouchers', 'ar_ledger', 'payment_idempotency', 'bank_accounts',
    'notifications', 'dispatched_emails', 'guest_feedbacks', 'public_testimonials',
    'pages', 'page_versions', 'blocks', 'block_templates', 'media_assets',
    'policy_page_metadata', 'legal_page_templates', 'legal_review_records',
    'page_audit_log', 'page_preview_links',
    'id_documents', 'payment_receipts', 'document_verifications',
    'room_types', 'yield_policies', 'guest_services', 'usali_chart_of_accounts',
    'usali_item_mappings', 'tax_codes', 'rate_plans', 'seasons', 'packages',
    'fee_components',
    -- Admin tables whose reads/writes still flow through the frontend supabaseService
    -- during Phase 1. Writes already use Express endpoints; reads will be migrated
    -- in Phase 2.
    'system_users', 'custom_roles', 'roles', 'permissions', 'role_permissions', 'user_roles',
    'global_settings'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY restore_tables
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_select', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_no_access', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_all', t);
    -- Restore permissive anon access to maintain current application behavior.
    -- This will be tightened once all writes are routed through Express.
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true);',
      t || '_anon_all', t
    );
  END LOOP;
END $$;

-- END: 076_security_phase1_compatibility.sql

-- =========================================================================
-- Migration: 077_calculate_billing_breakdown_reservation.sql
-- =========================================================================
-- ============================================================
-- Phase 2 â€” Unify the Ledger & Data Model
-- Make calculate_billing_breakdown reservation-centric.
-- If no explicit base_amount is supplied, derive it from the
-- reservation's total_amount. This lets the frontend call a single
-- RPC for a reservation instead of computing a base amount itself.
-- ============================================================

create or replace function calculate_billing_breakdown(
  p_base_amount numeric default null,
  p_discount_percent numeric default 0.0,
  p_reservation_id text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_base_amount numeric;
  v_discount_amount numeric := 0.0;
  v_discounted_amount numeric;
  v_non_vat_fees numeric := 0.00;
  v_vat_amount numeric := 0.00;
  v_sc_total numeric := 0.00;
  v_fee record;
  v_fee_amount numeric;
  v_vat_name text;
  v_vat_rate numeric;
  v_fee_breakdown jsonb := '[]'::jsonb;
  v_effective_discount numeric := 0.0;
  v_res_discount numeric := 0.0;
  v_res_total numeric;
  v_reservation record;
begin
  -- Resolve reservation and base amount
  if p_reservation_id is not null then
    select id, total_amount, discount_percent
    into v_reservation
    from reservations
    where id = p_reservation_id;

    if v_reservation is null then
      return jsonb_build_object('success', false, 'error', 'Reservation not found');
    end if;

    v_res_total := coalesce(v_reservation.total_amount, 0.0);
  end if;

  -- Base amount precedence: explicit > reservation total > 0
  if p_base_amount is not null and p_base_amount > 0 then
    v_base_amount := p_base_amount;
  elsif v_res_total is not null and v_res_total > 0 then
    v_base_amount := v_res_total;
  else
    v_base_amount := 0.0;
  end if;

  -- Resolve effective discount: explicit > reservation > 0
  if p_discount_percent > 0 then
    v_effective_discount := p_discount_percent;
  elsif v_reservation.id is not null and coalesce(v_reservation.discount_percent, 0.0) > 0 then
    v_effective_discount := v_reservation.discount_percent;
  elsif p_reservation_id is not null then
    -- legacy path when reservation row had no discount column populated
    select coalesce(discount_percent, 0.0) into v_res_discount
    from reservations
    where id = p_reservation_id;
    v_effective_discount := v_res_discount;
  end if;

  -- Calculate discount
  if v_effective_discount > 0 then
    v_discount_amount := round(v_base_amount * v_effective_discount / 100, 2);
  end if;
  v_discounted_amount := v_base_amount - v_discount_amount;

  -- Phase 1: non-VAT fees on discounted amount
  for v_fee in
    select
      (elem->>'name')::text as name,
      (elem->>'feeType')::text as fee_type,
      (elem->>'value')::numeric as value,
      (elem->>'displayOrder')::int as display_order
    from global_settings, jsonb_array_elements(fee_components) as elem
    where global_settings.id = 'main'
    and (elem->>'isEnabled')::boolean = true
    and lower((elem->>'name')::text) not like '%vat%'
    and lower((elem->>'name')::text) not like '%tax%'
    order by (elem->>'displayOrder')::int asc
  loop
    if v_fee.fee_type = 'percentage' then
      v_fee_amount := round(v_discounted_amount * v_fee.value / 100, 2);
    else
      v_fee_amount := v_fee.value;
    end if;
    v_non_vat_fees := v_non_vat_fees + v_fee_amount;

    if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
      v_sc_total := v_sc_total + v_fee_amount;
    end if;

    v_fee_breakdown := v_fee_breakdown || jsonb_build_object(
      'name', v_fee.name,
      'amount', v_fee_amount,
      'type', v_fee.fee_type,
      'value', v_fee.value,
      'displayOrder', v_fee.display_order
    );
  end loop;

  -- Phase 2: VAT on (discounted amount + non-VAT fees)
  select
    (elem->>'name')::text,
    (elem->>'value')::numeric
  into v_vat_name, v_vat_rate
  from global_settings, jsonb_array_elements(fee_components) as elem
  where global_settings.id = 'main'
  and (elem->>'isEnabled')::boolean = true
  and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
  limit 1;

  if v_vat_name is not null and v_vat_rate > 0 then
    v_vat_amount := round((v_discounted_amount + v_non_vat_fees) * v_vat_rate / 100, 2);
    v_fee_breakdown := v_fee_breakdown || jsonb_build_object(
      'name', v_vat_name,
      'amount', v_vat_amount,
      'type', 'percentage',
      'value', v_vat_rate,
      'displayOrder', 9999
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'reservation_id', p_reservation_id,
    'base_amount', v_base_amount,
    'discount_percent', v_effective_discount,
    'discount_amount', v_discount_amount,
    'discounted_amount', v_discounted_amount,
    'non_vat_fees', v_non_vat_fees,
    'service_charge_total', v_sc_total,
    'vat_amount', v_vat_amount,
    'total_amount', v_discounted_amount + v_non_vat_fees + v_vat_amount,
    'fee_breakdown', v_fee_breakdown
  );
end;
$$;

-- Re-grant execute on the updated signature
grant execute on function calculate_billing_breakdown(numeric, numeric, text) to authenticated;
grant execute on function calculate_billing_breakdown(numeric, numeric, text) to anon;

-- END: 077_calculate_billing_breakdown_reservation.sql

-- =========================================================================
-- Migration: 078_accounts_payable.sql
-- =========================================================================
-- ============================================================
-- Finance & Accounting - Accounts Payable
-- ============================================================

CREATE TABLE IF NOT EXISTS vendors (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  address text,
  tax_id text,
  withholding_rate numeric(5,2) DEFAULT 0,
  category text DEFAULT 'Operations',
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Hold')),
  balance numeric(18,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);

CREATE TABLE IF NOT EXISTS ap_bills (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id text NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  invoice_number text NOT NULL,
  invoice_date date NOT NULL,
  due_date date NOT NULL,
  category text,
  amount numeric(18,2) NOT NULL DEFAULT 0,
  tax_amount numeric(18,2) NOT NULL DEFAULT 0,
  withholding_amount numeric(18,2) NOT NULL DEFAULT 0,
  net_payable numeric(18,2) NOT NULL DEFAULT 0,
  amount_due numeric(18,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Partially Paid', 'Paid', 'Overdue', 'Voided')),
  lines jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ap_bills_vendor_id ON ap_bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_ap_bills_status ON ap_bills(status);
CREATE INDEX IF NOT EXISTS idx_ap_bills_due_date ON ap_bills(due_date);

CREATE TABLE IF NOT EXISTS ap_payments (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  bill_id text NOT NULL REFERENCES ap_bills(id) ON DELETE RESTRICT,
  vendor_id text NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  amount numeric(18,2) NOT NULL DEFAULT 0,
  payment_date date NOT NULL,
  payment_method text,
  reference text,
  status text NOT NULL DEFAULT 'Completed' CHECK (status IN ('Completed', 'Voided', 'Scheduled')),
  created_at timestamptz DEFAULT now()
);

-- Add missing columns if table already exists (for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'bill_id') THEN
    ALTER TABLE ap_payments ADD COLUMN bill_id text REFERENCES ap_bills(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'vendor_id') THEN
    ALTER TABLE ap_payments ADD COLUMN vendor_id text REFERENCES vendors(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'amount') THEN
    ALTER TABLE ap_payments ADD COLUMN amount numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'payment_date') THEN
    ALTER TABLE ap_payments ADD COLUMN payment_date date NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'payment_method') THEN
    ALTER TABLE ap_payments ADD COLUMN payment_method text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'reference') THEN
    ALTER TABLE ap_payments ADD COLUMN reference text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'status') THEN
    ALTER TABLE ap_payments ADD COLUMN status text NOT NULL DEFAULT 'Completed' CHECK (status IN ('Completed', 'Voided', 'Scheduled'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'created_at') THEN
    ALTER TABLE ap_payments ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ap_payments_bill_id ON ap_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_ap_payments_vendor_id ON ap_payments(vendor_id);

-- Trigger to update vendor balance and bill status when a payment is recorded
CREATE OR REPLACE FUNCTION record_ap_payment(
  p_bill_id text,
  p_amount numeric,
  p_payment_date date,
  p_payment_method text,
  p_reference text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_vendor_id text;
  v_amount_due numeric;
  v_new_status text;
  v_payment_id text;
BEGIN
  SELECT vendor_id, amount_due INTO v_vendor_id, v_amount_due
  FROM ap_bills WHERE id = p_bill_id FOR UPDATE;

  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Bill not found';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be positive';
  END IF;

  IF p_amount > v_amount_due THEN
    RAISE EXCEPTION 'Payment amount exceeds amount due';
  END IF;

  v_payment_id := gen_random_uuid()::text;

  INSERT INTO ap_payments (id, bill_id, vendor_id, amount, payment_date, payment_method, reference)
  VALUES (v_payment_id, p_bill_id, v_vendor_id, p_amount, p_payment_date, p_payment_method, p_reference);

  UPDATE ap_bills
  SET amount_due = amount_due - p_amount,
      status = CASE
        WHEN amount_due - p_amount <= 0 THEN 'Paid'
        ELSE 'Partially Paid'
      END,
      updated_at = now()
  WHERE id = p_bill_id
  RETURNING status INTO v_new_status;

  UPDATE vendors
  SET balance = balance - p_amount,
      updated_at = now()
  WHERE id = v_vendor_id;

  RETURN jsonb_build_object('payment_id', v_payment_id, 'status', v_new_status);
END;
$$;

CREATE OR REPLACE FUNCTION increment_vendor_balance(
  p_vendor_id text,
  p_delta numeric
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE vendors
  SET balance = balance + p_delta,
      updated_at = now()
  WHERE id = p_vendor_id;
END;
$$;

-- END: 078_accounts_payable.sql

-- =========================================================================
-- Migration: 079_bank_reconciliation.sql
-- =========================================================================
-- ============================================================
-- Finance & Accounting - Bank Reconciliation
-- ============================================================

CREATE TABLE IF NOT EXISTS bank_accounts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  account_number text NOT NULL UNIQUE,
  account_name text NOT NULL,
  bank_name text NOT NULL,
  currency text DEFAULT 'ETB',
  balance numeric(18,2) NOT NULL DEFAULT 0,
  last_reconciled_date date,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add missing columns if table already exists (for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'account_number') THEN
    ALTER TABLE bank_accounts ADD COLUMN account_number text NOT NULL UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'account_name') THEN
    ALTER TABLE bank_accounts ADD COLUMN account_name text NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'bank_name') THEN
    ALTER TABLE bank_accounts ADD COLUMN bank_name text NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'currency') THEN
    ALTER TABLE bank_accounts ADD COLUMN currency text DEFAULT 'ETB';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'balance') THEN
    ALTER TABLE bank_accounts ADD COLUMN balance numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'last_reconciled_date') THEN
    ALTER TABLE bank_accounts ADD COLUMN last_reconciled_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'status') THEN
    ALTER TABLE bank_accounts ADD COLUMN status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Closed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'created_at') THEN
    ALTER TABLE bank_accounts ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'updated_at') THEN
    ALTER TABLE bank_accounts ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bank_accounts_status ON bank_accounts(status);

CREATE TABLE IF NOT EXISTS bank_statement_lines (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  bank_account_id text NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  statement_date date NOT NULL,
  transaction_date date NOT NULL,
  description text,
  reference text,
  debit numeric(18,2) NOT NULL DEFAULT 0,
  credit numeric(18,2) NOT NULL DEFAULT 0,
  balance numeric(18,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Unmatched' CHECK (status IN ('Unmatched', 'Matched', 'Partially Matched', 'Excluded')),
  matched_journal_line_id text,
  created_at timestamptz DEFAULT now()
);

-- Add missing columns if table already exists (for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'bank_account_id') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN bank_account_id text REFERENCES bank_accounts(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'statement_date') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN statement_date date NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'transaction_date') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN transaction_date date NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'description') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN description text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'reference') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN reference text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'debit') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN debit numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'credit') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN credit numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'balance') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN balance numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'status') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN status text NOT NULL DEFAULT 'Unmatched' CHECK (status IN ('Unmatched', 'Matched', 'Partially Matched', 'Excluded'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'matched_journal_line_id') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN matched_journal_line_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'created_at') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bank_statement_lines_account_id ON bank_statement_lines(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_statement_lines_status ON bank_statement_lines(status);
CREATE INDEX IF NOT EXISTS idx_bank_statement_lines_date ON bank_statement_lines(statement_date);

CREATE TABLE IF NOT EXISTS reconciliation_batches (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  bank_account_id text NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  opening_balance numeric(18,2) NOT NULL DEFAULT 0,
  closing_balance numeric(18,2) NOT NULL DEFAULT 0,
  total_debits numeric(18,2) NOT NULL DEFAULT 0,
  total_credits numeric(18,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Completed', 'Cancelled')),
  reconciled_by text,
  reconciled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add missing columns if table already exists (for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'bank_account_id') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN bank_account_id text REFERENCES bank_accounts(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'period_start') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN period_start date NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'period_end') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN period_end date NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'opening_balance') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN opening_balance numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'closing_balance') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN closing_balance numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'total_debits') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN total_debits numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'total_credits') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN total_credits numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'status') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Completed', 'Cancelled'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'reconciled_by') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN reconciled_by text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'reconciled_at') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN reconciled_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'created_at') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reconciliation_batches_account_id ON reconciliation_batches(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_batches_status ON reconciliation_batches(status);
CREATE INDEX IF NOT EXISTS idx_reconciliation_batches_period ON reconciliation_batches(period_start, period_end);

-- Function to import statement lines
CREATE OR REPLACE FUNCTION import_bank_statement_lines(
  p_bank_account_id text,
  p_lines jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_imported_count int := 0;
  v_line jsonb;
BEGIN
  FOREACH v_line IN ARRAY p_lines
  LOOP
    INSERT INTO bank_statement_lines (
      bank_account_id,
      statement_date,
      transaction_date,
      description,
      reference,
      debit,
      credit,
      balance
    ) VALUES (
      p_bank_account_id,
      (v_line->>'statement_date')::date,
      (v_line->>'transaction_date')::date,
      v_line->>'description',
      v_line->>'reference',
      COALESCE((v_line->>'debit')::numeric, 0),
      COALESCE((v_line->>'credit')::numeric, 0),
      COALESCE((v_line->>'balance')::numeric, 0)
    );
    v_imported_count := v_imported_count + 1;
  END LOOP;

  RETURN jsonb_build_object('imported_count', v_imported_count);
END;
$$;

-- Function to match statement line to journal line
CREATE OR REPLACE FUNCTION match_statement_line(
  p_statement_line_id text,
  p_journal_line_id text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE bank_statement_lines
  SET status = 'Matched',
      matched_journal_line_id = p_journal_line_id
  WHERE id = p_statement_line_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- END: 079_bank_reconciliation.sql

-- =========================================================================
-- Migration: 080_fixed_assets.sql
-- =========================================================================
-- ============================================================
-- Finance & Accounting - Fixed Assets
-- ============================================================

-- Drop table if it exists to ensure clean schema (for development)
DROP TABLE IF EXISTS fixed_assets CASCADE;
DROP TABLE IF EXISTS depreciation_schedules CASCADE;

CREATE TABLE fixed_assets (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  asset_code text NOT NULL UNIQUE,
  asset_name text NOT NULL,
  asset_category text NOT NULL DEFAULT 'Other',
  description text,
  location text,
  purchase_date date NOT NULL,
  purchase_cost numeric(18,2) NOT NULL DEFAULT 0,
  salvage_value numeric(18,2) NOT NULL DEFAULT 0,
  useful_life_years int NOT NULL,
  depreciation_method text NOT NULL DEFAULT 'Straight Line' CHECK (depreciation_method IN ('Straight Line', 'Reducing Balance', 'Units of Production')),
  accumulated_depreciation numeric(18,2) NOT NULL DEFAULT 0,
  net_book_value numeric(18,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Under Maintenance', 'Disposal Pending', 'Disposed', 'Written Off')),
  disposal_date date,
  disposal_value numeric(18,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fixed_assets_category ON fixed_assets(asset_category);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_status ON fixed_assets(status);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_purchase_date ON fixed_assets(purchase_date);

CREATE TABLE IF NOT EXISTS depreciation_schedules (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  asset_id text NOT NULL REFERENCES fixed_assets(id) ON DELETE CASCADE,
  fiscal_year int NOT NULL,
  depreciation_amount numeric(18,2) NOT NULL DEFAULT 0,
  accumulated_depreciation numeric(18,2) NOT NULL DEFAULT 0,
  net_book_value numeric(18,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_depreciation_schedules_asset_id ON depreciation_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_depreciation_schedules_fiscal_year ON depreciation_schedules(fiscal_year);

-- Function to calculate depreciation for an asset
CREATE OR REPLACE FUNCTION calculate_depreciation(
  p_asset_id text,
  p_fiscal_year int
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_asset record;
  v_years_elapsed int;
  v_depreciation_amount numeric;
  v_accumulated_depreciation numeric;
  v_net_book_value numeric;
BEGIN
  SELECT * INTO v_asset FROM fixed_assets WHERE id = p_asset_id;

  IF v_asset IS NULL THEN
    RAISE EXCEPTION 'Asset not found';
  END IF;

  v_years_elapsed := p_fiscal_year - EXTRACT(YEAR FROM v_asset.purchase_date);

  IF v_years_elapsed < 0 THEN
    RAISE EXCEPTION 'Fiscal year is before purchase date';
  END IF;

  IF v_years_elapsed >= v_asset.useful_life_years THEN
    v_depreciation_amount := 0;
  ELSE
    CASE v_asset.depreciation_method
      WHEN 'Straight Line' THEN
        v_depreciation_amount := (v_asset.purchase_cost - v_asset.salvage_value) / v_asset.useful_life_years;
      WHEN 'Reducing Balance' THEN
        v_depreciation_amount := (v_asset.net_book_value * 0.2); -- 20% reducing balance
      ELSE
        v_depreciation_amount := (v_asset.purchase_cost - v_asset.salvage_value) / v_asset.useful_life_years;
    END CASE;
  END IF;

  v_accumulated_depreciation := v_asset.accumulated_depreciation + v_depreciation_amount;
  v_net_book_value := v_asset.purchase_cost - v_accumulated_depreciation;

  -- Update asset
  UPDATE fixed_assets
  SET accumulated_depreciation = v_accumulated_depreciation,
      net_book_value = v_net_book_value,
      updated_at = now()
  WHERE id = p_asset_id;

  -- Insert or update depreciation schedule
  INSERT INTO depreciation_schedules (
    asset_id,
    fiscal_year,
    depreciation_amount,
    accumulated_depreciation,
    net_book_value
  ) VALUES (
    p_asset_id,
    p_fiscal_year,
    v_depreciation_amount,
    v_accumulated_depreciation,
    v_net_book_value
  )
  ON CONFLICT (asset_id, fiscal_year) DO UPDATE SET
    depreciation_amount = v_depreciation_amount,
    accumulated_depreciation = v_accumulated_depreciation,
    net_book_value = v_net_book_value;

  RETURN jsonb_build_object(
    'depreciation_amount', v_depreciation_amount,
    'accumulated_depreciation', v_accumulated_depreciation,
    'net_book_value', v_net_book_value
  );
END;
$$;

-- Function to dispose of an asset
CREATE OR REPLACE FUNCTION dispose_asset(
  p_asset_id text,
  p_disposal_date date,
  p_disposal_value numeric
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE fixed_assets
  SET status = 'Disposed',
      disposal_date = p_disposal_date,
      disposal_value = p_disposal_value,
      updated_at = now()
  WHERE id = p_asset_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- END: 080_fixed_assets.sql

-- =========================================================================
-- Migration: 081_period_close.sql
-- =========================================================================
-- ============================================================
-- Finance & Accounting - Period Close
-- ============================================================

CREATE TABLE IF NOT EXISTS accounting_periods (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  period_name text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closing', 'Closed')),
  closed_by text,
  closed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_accounting_periods_status ON accounting_periods(status);
CREATE INDEX IF NOT EXISTS idx_accounting_periods_dates ON accounting_periods(period_start, period_end);

-- Function to close an accounting period
CREATE OR REPLACE FUNCTION close_accounting_period(
  p_period_id text,
  p_closed_by text,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_period record;
BEGIN
  SELECT * INTO v_period FROM accounting_periods WHERE id = p_period_id;

  IF v_period IS NULL THEN
    RAISE EXCEPTION 'Period not found';
  END IF;

  IF v_period.status = 'Closed' THEN
    RAISE EXCEPTION 'Period is already closed';
  END IF;

  UPDATE accounting_periods
  SET status = 'Closed',
      closed_by = p_closed_by,
      closed_at = now(),
      notes = p_notes,
      updated_at = now()
  WHERE id = p_period_id;

  RETURN jsonb_build_object('success', true, 'period_id', p_period_id);
END;
$$;

-- Function to reopen an accounting period
CREATE OR REPLACE FUNCTION reopen_accounting_period(
  p_period_id text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE accounting_periods
  SET status = 'Open',
      closed_by = NULL,
      closed_at = NULL,
      updated_at = now()
  WHERE id = p_period_id;

  RETURN jsonb_build_object('success', true, 'period_id', p_period_id);
END;
$$;

-- END: 081_period_close.sql

-- =========================================================================
-- Migration: 082_fb_core.sql
-- =========================================================================
-- ============================================================
-- Food & Beverage - Core Data Model
-- ============================================================

-- Drop existing tables for clean schema (development)
DROP TABLE IF EXISTS stock_counts CASCADE;
DROP TABLE IF EXISTS stock_count_lines CASCADE;
DROP TABLE IF EXISTS wastage_logs CASCADE;
DROP TABLE IF EXISTS banquet_events CASCADE;
DROP TABLE IF EXISTS order_lines CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS requisitions CASCADE;
DROP TABLE IF EXISTS requisition_lines CASCADE;
DROP TABLE IF EXISTS stock_transactions CASCADE;
DROP TABLE IF EXISTS stock_locations CASCADE;
DROP TABLE IF EXISTS recipe_lines CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS outlets CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;

-- Outlets (Restaurant, Bar, Room Service, Banquet, Minibar)
CREATE TABLE outlets (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Restaurant', 'Bar', 'RoomService', 'Banquet', 'Minibar')),
  operating_hours jsonb, -- Store opening/closing times per day
  revenue_center_code text, -- GL link to Finance module
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_outlets_type ON outlets(type);
CREATE INDEX idx_outlets_active ON outlets(is_active);

-- Ingredients (Inventory Items) - Create this first since other tables reference it
CREATE TABLE ingredients (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Food', 'Beverage', 'Spice', 'Cleaning', 'Disposable', 'Equipment', 'Tableware')),
  unit_of_measure text NOT NULL,
  par_level numeric(10,3) NOT NULL DEFAULT 0,
  reorder_point numeric(10,3) NOT NULL DEFAULT 0,
  current_cost numeric(18,2) NOT NULL DEFAULT 0, -- Weighted average cost
  suppliers text[], -- Array of supplier names
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_active ON ingredients(is_active);

-- Menu Items
CREATE TABLE menu_items (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  outlet_id text NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  selling_price numeric(18,2) NOT NULL DEFAULT 0,
  tax_code text,
  is_active boolean NOT NULL DEFAULT true,
  pos_button_group text, -- For POS UI organization
  meal_periods text[] CHECK (array_length(meal_periods, 1) > 0), -- Breakfast, Lunch, Dinner, etc.
  is_fixed_menu boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_menu_items_outlet ON menu_items(outlet_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_active ON menu_items(is_active);

-- Recipes (for menu items)
CREATE TABLE recipes (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  menu_item_id text NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  yield numeric(5,2) NOT NULL DEFAULT 1.00, -- Yield percentage (e.g., 0.95 for 5% loss)
  portions int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (menu_item_id)
);

CREATE INDEX idx_recipes_menu_item ON recipes(menu_item_id);

-- Recipe Lines (ingredients for recipes) - Now ingredients table exists
CREATE TABLE recipe_lines (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  recipe_id text NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id text NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity numeric(10,3) NOT NULL,
  unit text NOT NULL,
  cost_at_time_of_costing numeric(18,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_recipe_lines_recipe ON recipe_lines(recipe_id);
CREATE INDEX idx_recipe_lines_ingredient ON recipe_lines(ingredient_id);

-- Stock Locations (Stores, Cellars, Outlets)
CREATE TABLE stock_locations (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('MainStore', 'OutletStore', 'Cellar', 'Minibar')),
  outlet_id text REFERENCES outlets(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_stock_locations_type ON stock_locations(type);
CREATE INDEX idx_stock_locations_outlet ON stock_locations(outlet_id);
CREATE INDEX idx_stock_locations_active ON stock_locations(is_active);

-- Stock Transactions (Receipt, Requisition, Transfer, Wastage, Stock Count)
CREATE TABLE stock_transactions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ingredient_id text NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  location_id text NOT NULL REFERENCES stock_locations(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('Receipt', 'Requisition', 'Transfer', 'WastageWriteoff', 'StockCount', 'POSDepletion')),
  quantity numeric(10,3) NOT NULL, -- Positive for receipts, negative for depletion
  unit text NOT NULL,
  cost_per_unit numeric(18,2) NOT NULL DEFAULT 0,
  total_value numeric(18,2) NOT NULL DEFAULT 0,
  date timestamptz NOT NULL DEFAULT now(),
  reference_doc text, -- Order ID, Requisition ID, etc.
  reference_type text, -- 'order', 'requisition', 'wastage_log', etc.
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_stock_transactions_ingredient ON stock_transactions(ingredient_id);
CREATE INDEX idx_stock_transactions_location ON stock_transactions(location_id);
CREATE INDEX idx_stock_transactions_type ON stock_transactions(transaction_type);
CREATE INDEX idx_stock_transactions_date ON stock_transactions(date);

-- Requisitions
CREATE TABLE requisitions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  from_location_id text NOT NULL REFERENCES stock_locations(id) ON DELETE CASCADE,
  to_outlet_id text NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Approved', 'Fulfilled', 'Rejected')),
  requested_by text NOT NULL,
  approved_by text,
  fulfilled_by text,
  approved_at timestamptz,
  fulfilled_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_requisitions_status ON requisitions(status);
CREATE INDEX idx_requisitions_from_location ON requisitions(from_location_id);
CREATE INDEX idx_requisitions_to_outlet ON requisitions(to_outlet_id);

-- Requisition Lines
CREATE TABLE requisition_lines (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  requisition_id text NOT NULL REFERENCES requisitions(id) ON DELETE CASCADE,
  ingredient_id text NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_requested numeric(10,3) NOT NULL,
  quantity_fulfilled numeric(10,3) NOT NULL DEFAULT 0,
  unit text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_requisition_lines_requisition ON requisition_lines(requisition_id);
CREATE INDEX idx_requisition_lines_ingredient ON requisition_lines(ingredient_id);

-- Orders (POS tickets / BEO)
CREATE TABLE orders (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  outlet_id text NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  table_or_room_or_event_id text, -- Table number, room number, or event ID
  customer_type text NOT NULL CHECK (customer_type IN ('In-House Guest', 'Walk-In Guest', 'Corporate Client', 'Conference Group', 'Tour Group')),
  server_id text,
  guest_folio_id text, -- For room charge routing to PMS
  reservation_id text, -- For guest meal plans
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Sent', 'Served', 'Paid', 'Void', 'Cancelled')),
  subtotal numeric(18,2) NOT NULL DEFAULT 0,
  tax_amount numeric(18,2) NOT NULL DEFAULT 0,
  discount_amount numeric(18,2) NOT NULL DEFAULT 0,
  service_charge numeric(18,2) NOT NULL DEFAULT 0,
  total_amount numeric(18,2) NOT NULL DEFAULT 0,
  payment_method text CHECK (payment_method IN ('Cash', 'Card', 'RoomCharge', 'CorporateAccount', 'Complimentary')),
  is_complimentary boolean NOT NULL DEFAULT false,
  comp_reason text,
  void_reason text,
  voided_by text,
  voided_at timestamptz,
  meal_period text CHECK (meal_period IN ('Breakfast', 'Lunch', 'Dinner', 'Brunch', 'Tea Time', 'Morning Snack', 'Afternoon Snack')),
  guest_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_orders_outlet ON orders(outlet_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_guest_folio ON orders(guest_folio_id);
CREATE INDEX idx_orders_date ON orders(created_at);

-- Order Lines
CREATE TABLE order_lines (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id text NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(18,2) NOT NULL,
  discount_amount numeric(18,2) NOT NULL DEFAULT 0,
  line_total numeric(18,2) NOT NULL,
  void_reason text,
  comp_reason text,
  is_voided boolean NOT NULL DEFAULT false,
  is_comped boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_order_lines_order ON order_lines(order_id);
CREATE INDEX idx_order_lines_menu_item ON order_lines(menu_item_id);

-- Banquet Events (BEO)
CREATE TABLE banquet_events (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_name text NOT NULL,
  event_date date NOT NULL,
  client_name text NOT NULL,
  guest_count int NOT NULL,
  menu_package text,
  room_setup text,
  payment_terms text,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Confirmed', 'InProgress', 'Completed', 'Cancelled')),
  estimated_revenue numeric(18,2) NOT NULL DEFAULT 0,
  actual_revenue numeric(18,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_banquet_events_date ON banquet_events(event_date);
CREATE INDEX idx_banquet_events_status ON banquet_events(status);

-- Wastage Logs
CREATE TABLE wastage_logs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ingredient_id text NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  location_id text NOT NULL REFERENCES stock_locations(id) ON DELETE CASCADE,
  quantity numeric(10,3) NOT NULL,
  unit text NOT NULL,
  reason text NOT NULL CHECK (reason IN ('Spoilage', 'Breakage', 'Overproduction', 'QualityReject', 'Theft', 'Other')),
  cost_value numeric(18,2) NOT NULL DEFAULT 0,
  logged_by text NOT NULL,
  approved_by text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_wastage_logs_ingredient ON wastage_logs(ingredient_id);
CREATE INDEX idx_wastage_logs_location ON wastage_logs(location_id);
CREATE INDEX idx_wastage_logs_date ON wastage_logs(created_at);

-- Stock Counts (Physical Inventory)
CREATE TABLE stock_counts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  location_id text NOT NULL REFERENCES stock_locations(id) ON DELETE CASCADE,
  count_date date NOT NULL,
  counted_by text NOT NULL,
  approved_by text,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Rejected')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_stock_counts_location ON stock_counts(location_id);
CREATE INDEX idx_stock_counts_date ON stock_counts(count_date);
CREATE INDEX idx_stock_counts_status ON stock_counts(status);

-- Stock Count Lines
CREATE TABLE stock_count_lines (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stock_count_id text NOT NULL REFERENCES stock_counts(id) ON DELETE CASCADE,
  ingredient_id text NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  expected_quantity numeric(10,3) NOT NULL,
  counted_quantity numeric(10,3) NOT NULL,
  unit text NOT NULL,
  variance_quantity numeric(10,3) NOT NULL,
  variance_value numeric(18,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_stock_count_lines_count ON stock_count_lines(stock_count_id);
CREATE INDEX idx_stock_count_lines_ingredient ON stock_count_lines(ingredient_id);

-- END: 082_fb_core.sql

-- =========================================================================
-- Migration: 085_executive_portal_schema.sql
-- =========================================================================
-- Executive Portal - Reporting Data Mart Schema
-- Phase 2: MetricDefinition + ReportingSnapshot schema for aggregation layer
-- This migration creates the foundational database schema for the Executive Portal

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MetricDefinition table - Catalog of all KPIs across departments
CREATE TABLE IF NOT EXISTS metric_definitions (
  metric_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  module VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL CHECK (unit IN ('Percent', 'Currency', 'Count', 'Duration', 'Ratio')),
  direction VARCHAR(50) NOT NULL CHECK (direction IN ('HigherIsBetter', 'LowerIsBetter', 'Neutral')),
  target_value DECIMAL(15,2),
  formula TEXT,
  department VARCHAR(100) NOT NULL,
  is_computed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ReportingSnapshot table - Standardized daily snapshots from all modules
CREATE TABLE IF NOT EXISTS reporting_snapshots (
  snapshot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module VARCHAR(100) NOT NULL,
  property_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001', -- Default single-property ID
  snapshot_date DATE NOT NULL,
  metric_values JSONB NOT NULL, -- Map of metric_id -> value
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_quality_flag VARCHAR(50) NOT NULL DEFAULT 'Complete' CHECK (data_quality_flag IN ('Complete', 'Partial', 'Estimated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module, property_id, snapshot_date)
);

-- 3. MetricHistory table - Time-series data for trend analysis
CREATE TABLE IF NOT EXISTS metric_history (
  history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID NOT NULL REFERENCES metric_definitions(metric_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  property_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_id, date, property_id)
);

-- 4. AlertRule table - Alert configuration
CREATE TABLE IF NOT EXISTS alert_rules (
  rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID NOT NULL REFERENCES metric_definitions(metric_id) ON DELETE CASCADE,
  condition VARCHAR(50) NOT NULL CHECK (condition IN ('AboveTarget', 'BelowTarget', 'PctChangeExceeds', 'NoDataReceived')),
  threshold DECIMAL(15,2) NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('Info', 'Warning', 'Critical')),
  notify_roles TEXT[] NOT NULL,
  notify_channel VARCHAR(50) NOT NULL CHECK (notify_channel IN ('InApp', 'Email', 'SMS', 'Both')),
  is_active BOOLEAN DEFAULT TRUE,
  cooldown_period INTERVAL DEFAULT '1 hour',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AlertInstance table - Alert occurrences
CREATE TABLE IF NOT EXISTS alert_instances (
  instance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES alert_rules(rule_id) ON DELETE CASCADE,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  value DECIMAL(15,2),
  status VARCHAR(50) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Acknowledged', 'Resolved', 'Snoozed')),
  acknowledged_by UUID,
  resolution_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DashboardView table - Custom dashboard configurations per role
CREATE TABLE IF NOT EXISTS dashboard_views (
  view_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  owner_role VARCHAR(100) NOT NULL CHECK (owner_role IN ('Owner', 'GM', 'DepartmentManager', 'Finance', 'Auditor')),
  tile_layout JSONB NOT NULL, -- Grid position per TileID
  default_date_range VARCHAR(50) NOT NULL DEFAULT 'Week' CHECK (default_date_range IN ('Today', 'WTD', 'MTD', 'QTD', 'YTD', 'Custom')),
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ReportSchedule table - Automated report export scheduling
CREATE TABLE IF NOT EXISTS report_schedules (
  schedule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  recipient_list TEXT[] NOT NULL,
  frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly')),
  day_of_week_or_month VARCHAR(50),
  report_content JSONB NOT NULL, -- TileID[] or "Full Dashboard"
  format VARCHAR(50) NOT NULL CHECK (format IN ('PDF', 'Excel', 'Both')),
  last_sent_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DrillDownLink table - Navigation to source module detail views
CREATE TABLE IF NOT EXISTS drill_down_links (
  link_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tile_id UUID NOT NULL,
  target_module VARCHAR(100) NOT NULL,
  target_view VARCHAR(255) NOT NULL,
  required_permission VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ForecastEntry table (Phase 3) - Forecast projections clearly separated from actuals
CREATE TABLE IF NOT EXISTS forecast_entries (
  forecast_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID NOT NULL REFERENCES metric_definitions(metric_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  forecasted_value DECIMAL(15,2) NOT NULL,
  confidence_level VARCHAR(50) NOT NULL CHECK (confidence_level IN ('Low', 'Medium', 'High')),
  method VARCHAR(255),
  is_projection BOOLEAN DEFAULT TRUE NOT NULL,
  property_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_id, date, property_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reporting_snapshots_module_date ON reporting_snapshots(module, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_reporting_snapshots_property_date ON reporting_snapshots(property_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_metric_history_metric_date ON metric_history(metric_id, date);
CREATE INDEX IF NOT EXISTS idx_alert_instances_rule_status ON alert_instances(rule_id, status);
CREATE INDEX IF NOT EXISTS idx_alert_instances_triggered_at ON alert_instances(triggered_at);
CREATE INDEX IF NOT EXISTS idx_forecast_entries_metric_date ON forecast_entries(metric_id, date);

-- Create individual updated_at trigger functions for each table
CREATE OR REPLACE FUNCTION update_metric_definitions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_reporting_snapshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_alert_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_alert_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_dashboard_views_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_report_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_drill_down_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_forecast_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_metric_definitions_updated_at ON metric_definitions;
DROP TRIGGER IF EXISTS update_reporting_snapshots_updated_at ON reporting_snapshots;
DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON alert_rules;
DROP TRIGGER IF EXISTS update_alert_instances_updated_at ON alert_instances;
DROP TRIGGER IF EXISTS update_dashboard_views_last_modified ON dashboard_views;
DROP TRIGGER IF EXISTS update_report_schedules_updated_at ON report_schedules;
DROP TRIGGER IF EXISTS update_drill_down_links_updated_at ON drill_down_links;
DROP TRIGGER IF EXISTS update_forecast_entries_updated_at ON forecast_entries;

-- Apply updated_at triggers to each table using its specific function
CREATE TRIGGER update_metric_definitions_updated_at BEFORE UPDATE ON metric_definitions
    FOR EACH ROW EXECUTE FUNCTION update_metric_definitions_updated_at();

CREATE TRIGGER update_reporting_snapshots_updated_at BEFORE UPDATE ON reporting_snapshots
    FOR EACH ROW EXECUTE FUNCTION update_reporting_snapshots_updated_at();

CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules
    FOR EACH ROW EXECUTE FUNCTION update_alert_rules_updated_at();

CREATE TRIGGER update_alert_instances_updated_at BEFORE UPDATE ON alert_instances
    FOR EACH ROW EXECUTE FUNCTION update_alert_instances_updated_at();

CREATE TRIGGER update_dashboard_views_last_modified BEFORE UPDATE ON dashboard_views
    FOR EACH ROW EXECUTE FUNCTION update_dashboard_views_last_modified();

CREATE TRIGGER update_report_schedules_updated_at BEFORE UPDATE ON report_schedules
    FOR EACH ROW EXECUTE FUNCTION update_report_schedules_updated_at();

CREATE TRIGGER update_drill_down_links_updated_at BEFORE UPDATE ON drill_down_links
    FOR EACH ROW EXECUTE FUNCTION update_drill_down_links_updated_at();

CREATE TRIGGER update_forecast_entries_updated_at BEFORE UPDATE ON forecast_entries
    FOR EACH ROW EXECUTE FUNCTION update_forecast_entries_updated_at();

-- Note: metric_history does not have updated_at column, so no trigger is applied

-- Enable Row Level Security
ALTER TABLE metric_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_down_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated to read metric definitions" ON metric_definitions;
DROP POLICY IF EXISTS "Allow system admin full access to metric_definitions" ON metric_definitions;
DROP POLICY IF EXISTS "Allow system admin full access to reporting_snapshots" ON reporting_snapshots;
DROP POLICY IF EXISTS "Allow system admin full access to metric_history" ON metric_history;
DROP POLICY IF EXISTS "Allow system admin full access to alert_rules" ON alert_rules;
DROP POLICY IF EXISTS "Allow system admin full access to alert_instances" ON alert_instances;
DROP POLICY IF EXISTS "Allow system admin full access to dashboard_views" ON dashboard_views;
DROP POLICY IF EXISTS "Allow system admin full access to report_schedules" ON report_schedules;
DROP POLICY IF EXISTS "Allow system admin full access to drill_down_links" ON drill_down_links;
DROP POLICY IF EXISTS "Allow system admin full access to forecast_entries" ON forecast_entries;

-- RLS Policies - Allow authenticated users to read metric definitions
CREATE POLICY "Allow authenticated to read metric definitions" ON metric_definitions
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies - System Admin can manage all tables
CREATE POLICY "Allow system admin full access to metric_definitions" ON metric_definitions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to reporting_snapshots" ON reporting_snapshots
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to metric_history" ON metric_history
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to alert_rules" ON alert_rules
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to alert_instances" ON alert_instances
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to dashboard_views" ON dashboard_views
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to report_schedules" ON report_schedules
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to drill_down_links" ON drill_down_links
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow system admin full access to forecast_entries" ON forecast_entries
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial metric definitions for the 10 core metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Occupancy Rate', 'Front Office', 'Percent', 'HigherIsBetter', 75.0, 'Rooms Sold / Rooms Available', 'Front Office', FALSE),
  ('Average Daily Rate', 'Front Office', 'Currency', 'HigherIsBetter', 120.0, 'Room Revenue / Rooms Sold', 'Front Office', FALSE),
  ('RevPAR', 'Front Office', 'Currency', 'HigherIsBetter', 80.0, 'Room Revenue / Rooms Available', 'Front Office', TRUE),
  ('Total Revenue', 'Finance', 'Currency', 'HigherIsBetter', NULL, 'Sum of all revenue streams', 'Finance', FALSE),
  ('Labor Cost %', 'HR', 'Percent', 'LowerIsBetter', 35.0, 'Labor Cost / Total Revenue', 'HR', FALSE),
  ('Open Work Orders', 'Maintenance', 'Count', 'LowerIsBetter', 10.0, 'Count of unresolved work orders', 'Maintenance', FALSE),
  ('Pipeline Value', 'Sales & Events', 'Currency', 'HigherIsBetter', 50000.0, 'Sum of tentative/pending bookings', 'Sales & Events', FALSE),
  ('Food Cost %', 'F&B', 'Percent', 'LowerIsBetter', 32.0, 'Food Cost / F&B Revenue', 'F&B', FALSE),
  ('Headcount', 'HR', 'Count', 'Neutral', NULL, 'Total active employees', 'HR', FALSE),
  ('Cash Position', 'Finance', 'Currency', 'HigherIsBetter', 50000.0, 'Available cash and equivalents', 'Finance', FALSE)
ON CONFLICT DO NOTHING;

-- Insert default dashboard view for GM role
INSERT INTO dashboard_views (name, owner_role, tile_layout, default_date_range, is_default) VALUES
  ('GM Daily Dashboard', 'GM',
   '{"occupancy_rate": {"row": 0, "col": 0, "size": "Small"}, "adr": {"row": 0, "col": 1, "size": "Small"}, "revpar": {"row": 0, "col": 2, "size": "Small"}, "total_revenue": {"row": 0, "col": 3, "size": "Small"}, "labor_cost_percent": {"row": 1, "col": 0, "size": "Small"}, "open_work_orders": {"row": 1, "col": 1, "size": "Small"}, "pipeline_value": {"row": 1, "col": 2, "size": "Small"}, "food_cost_percent": {"row": 1, "col": 3, "size": "Small"}, "headcount": {"row": 2, "col": 0, "size": "Small"}, "cash_position": {"row": 2, "col": 1, "size": "Small"}}',
   'WTD', TRUE)
ON CONFLICT DO NOTHING;

-- Insert sample alert rules
INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'BelowTarget',
  60.0,
  'Critical',
  ARRAY['GM', 'Owner'],
  'Both',
  TRUE,
  INTERVAL '4 hours'
FROM metric_definitions 
WHERE name = 'Occupancy Rate'
ON CONFLICT DO NOTHING;

INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'AboveTarget',
  38.0,
  'Warning',
  ARRAY['GM', 'Finance'],
  'InApp',
  TRUE,
  INTERVAL '8 hours'
FROM metric_definitions 
WHERE name = 'Food Cost %'
ON CONFLICT DO NOTHING;

-- END: 085_executive_portal_schema.sql

-- =========================================================================
-- Migration: 085b_fix_trigger_function.sql
-- =========================================================================
-- Fix the update_updated_at_column trigger function to handle tables without updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set updated_at if the column exists in the table
    IF TG_TABLE_NAME IN ('metric_definitions', 'reporting_snapshots', 'alert_rules', 'alert_instances', 'dashboard_views', 'report_schedules', 'drill_down_links', 'forecast_entries') THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- END: 085b_fix_trigger_function.sql

-- =========================================================================
-- Migration: 086_full_kpi_catalog.sql
-- =========================================================================
-- Executive Portal - Full KPI Catalog Expansion
-- Phase 3: Expand to full KPI catalog with all department metrics including GOPPAR

-- Additional Front Office metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Booking Channel Mix', 'Front Office', 'Percent', 'Neutral', NULL, 'Distribution by booking channel (OTA, Direct, Corporate)', 'Front Office', FALSE),
  ('Cancellation Rate', 'Front Office', 'Percent', 'LowerIsBetter', 5.0, 'Cancellations / Total Bookings', 'Front Office', FALSE),
  ('No-Show Rate', 'Front Office', 'Percent', 'LowerIsBetter', 3.0, 'No-shows / Total Arrivals', 'Front Office', FALSE),
  ('Average Length of Stay', 'Front Office', 'Duration', 'HigherIsBetter', 2.5, 'Total Room Nights / Total Arrivals', 'Front Office', FALSE)
ON CONFLICT DO NOTHING;

-- Additional F&B metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Beverage Cost %', 'F&B', 'Percent', 'LowerIsBetter', 25.0, 'Beverage Cost / Beverage Revenue', 'F&B', FALSE),
  ('Average Check', 'F&B', 'Currency', 'HigherIsBetter', 35.0, 'Total F&B Revenue / Total Covers', 'F&B', FALSE),
  ('Cover Count', 'F&B', 'Count', 'HigherIsBetter', NULL, 'Total number of guests served', 'F&B', FALSE),
  ('Comp/Void Rate', 'F&B', 'Percent', 'LowerIsBetter', 2.0, 'Comps + Voids / Total Transactions', 'F&B', FALSE),
  ('Revenue per Outlet', 'F&B', 'Currency', 'HigherIsBetter', NULL, 'Outlet Revenue / Outlet Capacity', 'F&B', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Finance metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('P&L Departmental', 'Finance', 'Currency', 'HigherIsBetter', NULL, 'Departmental profit/loss by cost center', 'Finance', FALSE),
  ('Budget vs Actual Variance %', 'Finance', 'Percent', 'Neutral', 0.0, '(Actual - Budget) / Budget', 'Finance', FALSE),
  ('Cash Position', 'Finance', 'Currency', 'HigherIsBetter', 50000.0, 'Available cash and equivalents', 'Finance', FALSE),
  ('AR Aging', 'Finance', 'Duration', 'LowerIsBetter', 30.0, 'Average days accounts receivable outstanding', 'Finance', FALSE),
  ('AP Aging', 'Finance', 'Duration', 'LowerIsBetter', 45.0, 'Average days accounts payable outstanding', 'Finance', FALSE),
  ('GOPPAR', 'Finance', 'Currency', 'HigherIsBetter', 45000.0, 'Gross Operating Profit Per Available Room', 'Finance', TRUE)
ON CONFLICT DO NOTHING;

-- Additional Housekeeping metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Room Turnaround Time', 'Housekeeping', 'Duration', 'LowerIsBetter', 45.0, 'Average time to clean a room (minutes)', 'Housekeeping', FALSE),
  ('Inspection Pass Rate', 'Housekeeping', 'Percent', 'HigherIsBetter', 95.0, 'Passed inspections / Total inspections', 'Housekeeping', FALSE),
  ('OOO Room Count', 'Housekeeping', 'Count', 'LowerIsBetter', 2.0, 'Rooms out of order for maintenance', 'Housekeeping', FALSE),
  ('Rooms Cleaned per Attendant-Shift', 'Housekeeping', 'Count', 'HigherIsBetter', 12.0, 'Total rooms cleaned / Total attendant shifts', 'Housekeeping', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Maintenance/Engineering metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Average Resolution Time', 'Maintenance', 'Duration', 'LowerIsBetter', 24.0, 'Average time to resolve work orders (hours)', 'Maintenance', FALSE),
  ('PM Compliance Rate', 'Maintenance', 'Percent', 'HigherIsBetter', 90.0, 'Completed PMs / Scheduled PMs', 'Maintenance', FALSE),
  ('OOS Room Count', 'Maintenance', 'Count', 'LowerIsBetter', 1.0, 'Rooms out of service for maintenance', 'Maintenance', FALSE)
ON CONFLICT DO NOTHING;

-- Additional HR & Payroll metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Labor Cost %', 'HR', 'Percent', 'LowerIsBetter', 35.0, 'Labor Cost / Total Revenue', 'HR', FALSE),
  ('Overtime Hours', 'HR', 'Duration', 'LowerIsBetter', 8.0, 'Total overtime hours per period', 'HR', FALSE),
  ('Leave Balance Liability', 'HR', 'Currency', 'LowerIsBetter', 100000.0, 'Total accrued leave liability', 'HR', FALSE),
  ('Turnover Rate', 'HR', 'Percent', 'LowerIsBetter', 15.0, 'Departures / Average headcount', 'HR', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Procurement & Stores metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Purchase Spend by Category', 'Procurement', 'Currency', 'Neutral', NULL, 'Total spend by procurement category', 'Procurement', FALSE),
  ('Main Store Stock Value', 'Procurement', 'Currency', 'Neutral', NULL, 'Total value of main store inventory', 'Procurement', FALSE),
  ('Goods-Receipt Discrepancy Rate', 'Procurement', 'Percent', 'LowerIsBetter', 2.0, 'Discrepancies / Total receipts', 'Procurement', FALSE),
  ('Days of Stock on Hand', 'Procurement', 'Duration', 'Neutral', 30.0, 'Average inventory days / consumption rate', 'Procurement', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Sales & Events metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Pipeline Value by Stage', 'Sales & Events', 'Currency', 'HigherIsBetter', NULL, 'Total pipeline value by sales stage', 'Sales & Events', FALSE),
  ('Win Rate', 'Sales & Events', 'Percent', 'HigherIsBetter', 40.0, 'Won opportunities / Total opportunities', 'Sales & Events', FALSE),
  ('Average Deal Size', 'Sales & Events', 'Currency', 'HigherIsBetter', 15000.0, 'Total pipeline value / Number of deals', 'Sales & Events', FALSE),
  ('Booked Group/Event Revenue', 'Sales & Events', 'Currency', 'HigherIsBetter', NULL, 'Revenue from confirmed group bookings', 'Sales & Events', FALSE),
  ('Forecast vs Actual Booking Pace', 'Sales & Events', 'Percent', 'Neutral', 0.0, '(Actual Bookings - Forecast) / Forecast', 'Sales & Events', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Guest Portal metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Direct Booking Conversion Rate', 'Guest Portal', 'Percent', 'HigherIsBetter', 25.0, 'Direct bookings / Total website visits', 'Guest Portal', FALSE),
  ('In-Stay Request Volume by Type', 'Guest Portal', 'Count', 'Neutral', NULL, 'Guest requests by category', 'Guest Portal', FALSE),
  ('Request Resolution Time', 'Guest Portal', 'Duration', 'LowerIsBetter', 30.0, 'Average time to resolve guest requests (minutes)', 'Guest Portal', FALSE),
  ('Guest Satisfaction Signal', 'Guest Portal', 'Ratio', 'HigherIsBetter', 4.5, 'Average guest rating (1-5 scale)', 'Guest Portal', FALSE)
ON CONFLICT DO NOTHING;

-- Additional System Admin metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Active User Count', 'System Admin', 'Count', 'Neutral', NULL, 'Total active system users', 'System Admin', FALSE),
  ('Permission Change Frequency', 'System Admin', 'Count', 'LowerIsBetter', 5.0, 'Permission changes per week (GM-only view)', 'System Admin', FALSE)
ON CONFLICT DO NOTHING;

-- Update the default GM dashboard view to include additional key metrics
UPDATE dashboard_views 
SET tile_layout = 
  '{"occupancy_rate": {"row": 0, "col": 0, "size": "Small"}, "adr": {"row": 0, "col": 1, "size": "Small"}, "revpar": {"row": 0, "col": 2, "size": "Small"}, "total_revenue": {"row": 0, "col": 3, "size": "Small"}, "labor_cost_percent": {"row": 1, "col": 0, "size": "Small"}, "open_work_orders": {"row": 1, "col": 1, "size": "Small"}, "pipeline_value": {"row": 1, "col": 2, "size": "Small"}, "food_cost_percent": {"row": 1, "col": 3, "size": "Small"}, "goppar": {"row": 2, "col": 0, "size": "Medium"}, "cash_position": {"row": 2, "col": 1, "size": "Small"}, "ar_aging": {"row": 2, "col": 2, "size": "Small"}, "turnover_rate": {"row": 2, "col": 3, "size": "Small"}}'
WHERE name = 'GM Daily Dashboard';

-- Add alert rule for GOPPAR
INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'BelowTarget',
  40000.0,
  'Warning',
  ARRAY['GM', 'Finance', 'Owner'],
  'Both',
  TRUE,
  INTERVAL '24 hours'
FROM metric_definitions 
WHERE name = 'GOPPAR'
ON CONFLICT DO NOTHING;

-- Add alert rule for AR Aging
INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'AboveTarget',
  45.0,
  'Warning',
  ARRAY['GM', 'Finance'],
  'InApp',
  TRUE,
  INTERVAL '24 hours'
FROM metric_definitions 
WHERE name = 'AR Aging'
ON CONFLICT DO NOTHING;

-- Add alert rule for Turnover Rate
INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'AboveTarget',
  20.0,
  'Critical',
  ARRAY['GM', 'HR'],
  'Both',
  TRUE,
  INTERVAL '1 week'
FROM metric_definitions 
WHERE name = 'Turnover Rate'
ON CONFLICT DO NOTHING;

-- END: 086_full_kpi_catalog.sql

-- =========================================================================
-- Migration: 087_recreate_triggers_safely.sql
-- =========================================================================
-- Recreate all triggers to use the safe updated_at function

-- Drop all existing triggers
DROP TRIGGER IF EXISTS update_metric_definitions_updated_at ON metric_definitions;
DROP TRIGGER IF EXISTS update_reporting_snapshots_updated_at ON reporting_snapshots;
DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON alert_rules;
DROP TRIGGER IF EXISTS update_alert_instances_updated_at ON alert_instances;
DROP TRIGGER IF EXISTS update_dashboard_views_last_modified ON dashboard_views;
DROP TRIGGER IF EXISTS update_report_schedules_updated_at ON report_schedules;
DROP TRIGGER IF EXISTS update_drill_down_links_updated_at ON drill_down_links;
DROP TRIGGER IF EXISTS update_forecast_entries_updated_at ON forecast_entries;

-- Drop individual trigger functions
DROP FUNCTION IF EXISTS update_metric_definitions_updated_at();
DROP FUNCTION IF EXISTS update_reporting_snapshots_updated_at();
DROP FUNCTION IF EXISTS update_alert_rules_updated_at();
DROP FUNCTION IF EXISTS update_alert_instances_updated_at();
DROP FUNCTION IF EXISTS update_dashboard_views_last_modified();
DROP FUNCTION IF EXISTS update_report_schedules_updated_at();
DROP FUNCTION IF EXISTS update_drill_down_links_updated_at();
DROP FUNCTION IF EXISTS update_forecast_entries_updated_at();

-- Recreate the safe trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set updated_at if the column exists in the table
    IF TG_TABLE_NAME IN ('metric_definitions', 'reporting_snapshots', 'alert_rules', 'alert_instances', 'dashboard_views', 'report_schedules', 'drill_down_links', 'forecast_entries') THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables that have updated_at column
CREATE TRIGGER update_metric_definitions_updated_at BEFORE UPDATE ON metric_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reporting_snapshots_updated_at BEFORE UPDATE ON reporting_snapshots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_instances_updated_at BEFORE UPDATE ON alert_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_views_last_modified BEFORE UPDATE ON dashboard_views
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_schedules_updated_at BEFORE UPDATE ON report_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drill_down_links_updated_at BEFORE UPDATE ON drill_down_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forecast_entries_updated_at BEFORE UPDATE ON forecast_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- END: 087_recreate_triggers_safely.sql

-- =========================================================================
-- Migration: 088_fix_triggers_final.sql
-- =========================================================================
-- Final fix for triggers - create individual functions for each table

-- Drop all existing triggers for Executive Portal tables
DROP TRIGGER IF EXISTS update_metric_definitions_updated_at ON metric_definitions;
DROP TRIGGER IF EXISTS update_reporting_snapshots_updated_at ON reporting_snapshots;
DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON alert_rules;
DROP TRIGGER IF EXISTS update_alert_instances_updated_at ON alert_instances;
DROP TRIGGER IF EXISTS update_dashboard_views_last_modified ON dashboard_views;
DROP TRIGGER IF EXISTS update_report_schedules_updated_at ON report_schedules;
DROP TRIGGER IF EXISTS update_drill_down_links_updated_at ON drill_down_links;
DROP TRIGGER IF EXISTS update_forecast_entries_updated_at ON forecast_entries;

-- Drop individual trigger functions for Executive Portal tables
-- Note: Do NOT drop update_updated_at_column() as it's used by other tables
DROP FUNCTION IF EXISTS update_metric_definitions_updated_at();
DROP FUNCTION IF EXISTS update_reporting_snapshots_updated_at();
DROP FUNCTION IF EXISTS update_alert_rules_updated_at();
DROP FUNCTION IF EXISTS update_alert_instances_updated_at();
DROP FUNCTION IF EXISTS update_dashboard_views_last_modified();
DROP FUNCTION IF EXISTS update_report_schedules_updated_at();
DROP FUNCTION IF EXISTS update_drill_down_links_updated_at();
DROP FUNCTION IF EXISTS update_forecast_entries_updated_at();

-- Create individual trigger functions for each table
CREATE OR REPLACE FUNCTION update_metric_definitions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_reporting_snapshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_alert_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_alert_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_dashboard_views_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_report_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_drill_down_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_forecast_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers only to tables that have update timestamp columns
CREATE TRIGGER update_metric_definitions_updated_at BEFORE UPDATE ON metric_definitions
    FOR EACH ROW EXECUTE FUNCTION update_metric_definitions_updated_at();

CREATE TRIGGER update_reporting_snapshots_updated_at BEFORE UPDATE ON reporting_snapshots
    FOR EACH ROW EXECUTE FUNCTION update_reporting_snapshots_updated_at();

CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules
    FOR EACH ROW EXECUTE FUNCTION update_alert_rules_updated_at();

CREATE TRIGGER update_alert_instances_updated_at BEFORE UPDATE ON alert_instances
    FOR EACH ROW EXECUTE FUNCTION update_alert_instances_updated_at();

CREATE TRIGGER update_dashboard_views_last_modified BEFORE UPDATE ON dashboard_views
    FOR EACH ROW EXECUTE FUNCTION update_dashboard_views_last_modified();

CREATE TRIGGER update_report_schedules_updated_at BEFORE UPDATE ON report_schedules
    FOR EACH ROW EXECUTE FUNCTION update_report_schedules_updated_at();

CREATE TRIGGER update_drill_down_links_updated_at BEFORE UPDATE ON drill_down_links
    FOR EACH ROW EXECUTE FUNCTION update_drill_down_links_updated_at();

CREATE TRIGGER update_forecast_entries_updated_at BEFORE UPDATE ON forecast_entries
    FOR EACH ROW EXECUTE FUNCTION update_forecast_entries_updated_at();

-- Note: metric_history does not have updated_at column, so no trigger is applied

-- END: 088_fix_triggers_final.sql

-- =========================================================================
-- Migration: 089_kpi_catalog_no_triggers.sql
-- =========================================================================
-- Executive Portal - Full KPI Catalog Expansion (No trigger dependency)
-- Phase 3: Expand to full KPI catalog with all department metrics including GOPPAR
-- This version avoids triggering updated_at functions

-- Additional Front Office metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Booking Channel Mix', 'Front Office', 'Percent', 'Neutral', NULL, 'Distribution by booking channel (OTA, Direct, Corporate)', 'Front Office', FALSE),
  ('Cancellation Rate', 'Front Office', 'Percent', 'LowerIsBetter', 5.0, 'Cancellations / Total Bookings', 'Front Office', FALSE),
  ('No-Show Rate', 'Front Office', 'Percent', 'LowerIsBetter', 3.0, 'No-shows / Total Arrivals', 'Front Office', FALSE),
  ('Average Length of Stay', 'Front Office', 'Duration', 'HigherIsBetter', 2.5, 'Total Room Nights / Total Arrivals', 'Front Office', FALSE)
ON CONFLICT DO NOTHING;

-- Additional F&B metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Beverage Cost %', 'F&B', 'Percent', 'LowerIsBetter', 25.0, 'Beverage Cost / Beverage Revenue', 'F&B', FALSE),
  ('Average Check', 'F&B', 'Currency', 'HigherIsBetter', 35.0, 'Total F&B Revenue / Total Covers', 'F&B', FALSE),
  ('Cover Count', 'F&B', 'Count', 'HigherIsBetter', NULL, 'Total number of guests served', 'F&B', FALSE),
  ('Comp/Void Rate', 'F&B', 'Percent', 'LowerIsBetter', 2.0, 'Comps + Voids / Total Transactions', 'F&B', FALSE),
  ('Revenue per Outlet', 'F&B', 'Currency', 'HigherIsBetter', NULL, 'Outlet Revenue / Outlet Capacity', 'F&B', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Finance metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('P&L Departmental', 'Finance', 'Currency', 'HigherIsBetter', NULL, 'Departmental profit/loss by cost center', 'Finance', FALSE),
  ('Budget vs Actual Variance %', 'Finance', 'Percent', 'Neutral', 0.0, '(Actual - Budget) / Budget', 'Finance', FALSE),
  ('Cash Position', 'Finance', 'Currency', 'HigherIsBetter', 50000.0, 'Available cash and equivalents', 'Finance', FALSE),
  ('AR Aging', 'Finance', 'Duration', 'LowerIsBetter', 30.0, 'Average days accounts receivable outstanding', 'Finance', FALSE),
  ('AP Aging', 'Finance', 'Duration', 'LowerIsBetter', 45.0, 'Average days accounts payable outstanding', 'Finance', FALSE),
  ('GOPPAR', 'Finance', 'Currency', 'HigherIsBetter', 45000.0, 'Gross Operating Profit Per Available Room', 'Finance', TRUE)
ON CONFLICT DO NOTHING;

-- Additional Housekeeping metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Room Turnaround Time', 'Housekeeping', 'Duration', 'LowerIsBetter', 45.0, 'Average time to clean a room (minutes)', 'Housekeeping', FALSE),
  ('Inspection Pass Rate', 'Housekeeping', 'Percent', 'HigherIsBetter', 95.0, 'Passed inspections / Total inspections', 'Housekeeping', FALSE),
  ('OOO Room Count', 'Housekeeping', 'Count', 'LowerIsBetter', 2.0, 'Rooms out of order for maintenance', 'Housekeeping', FALSE),
  ('Rooms Cleaned per Attendant-Shift', 'Housekeeping', 'Count', 'HigherIsBetter', 12.0, 'Total rooms cleaned / Total attendant shifts', 'Housekeeping', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Maintenance/Engineering metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Average Resolution Time', 'Maintenance', 'Duration', 'LowerIsBetter', 24.0, 'Average time to resolve work orders (hours)', 'Maintenance', FALSE),
  ('PM Compliance Rate', 'Maintenance', 'Percent', 'HigherIsBetter', 90.0, 'Completed PMs / Scheduled PMs', 'Maintenance', FALSE),
  ('OOS Room Count', 'Maintenance', 'Count', 'LowerIsBetter', 1.0, 'Rooms out of service for maintenance', 'Maintenance', FALSE)
ON CONFLICT DO NOTHING;

-- Additional HR & Payroll metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Labor Cost %', 'HR', 'Percent', 'LowerIsBetter', 35.0, 'Labor Cost / Total Revenue', 'HR', FALSE),
  ('Overtime Hours', 'HR', 'Duration', 'LowerIsBetter', 8.0, 'Total overtime hours per period', 'HR', FALSE),
  ('Leave Balance Liability', 'HR', 'Currency', 'LowerIsBetter', 100000.0, 'Total accrued leave liability', 'HR', FALSE),
  ('Turnover Rate', 'HR', 'Percent', 'LowerIsBetter', 15.0, 'Departures / Average headcount', 'HR', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Procurement & Stores metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Purchase Spend by Category', 'Procurement', 'Currency', 'Neutral', NULL, 'Total spend by procurement category', 'Procurement', FALSE),
  ('Main Store Stock Value', 'Procurement', 'Currency', 'Neutral', NULL, 'Total value of main store inventory', 'Procurement', FALSE),
  ('Goods-Receipt Discrepancy Rate', 'Procurement', 'Percent', 'LowerIsBetter', 2.0, 'Discrepancies / Total receipts', 'Procurement', FALSE),
  ('Days of Stock on Hand', 'Procurement', 'Duration', 'Neutral', 30.0, 'Average inventory days / consumption rate', 'Procurement', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Sales & Events metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Pipeline Value by Stage', 'Sales & Events', 'Currency', 'HigherIsBetter', NULL, 'Total pipeline value by sales stage', 'Sales & Events', FALSE),
  ('Win Rate', 'Sales & Events', 'Percent', 'HigherIsBetter', 40.0, 'Won opportunities / Total opportunities', 'Sales & Events', FALSE),
  ('Average Deal Size', 'Sales & Events', 'Currency', 'HigherIsBetter', 15000.0, 'Total pipeline value / Number of deals', 'Sales & Events', FALSE),
  ('Booked Group/Event Revenue', 'Sales & Events', 'Currency', 'HigherIsBetter', NULL, 'Revenue from confirmed group bookings', 'Sales & Events', FALSE),
  ('Forecast vs Actual Booking Pace', 'Sales & Events', 'Percent', 'Neutral', 0.0, '(Actual Bookings - Forecast) / Forecast', 'Sales & Events', FALSE)
ON CONFLICT DO NOTHING;

-- Additional Guest Portal metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Direct Booking Conversion Rate', 'Guest Portal', 'Percent', 'HigherIsBetter', 25.0, 'Direct bookings / Total website visits', 'Guest Portal', FALSE),
  ('In-Stay Request Volume by Type', 'Guest Portal', 'Count', 'Neutral', NULL, 'Guest requests by category', 'Guest Portal', FALSE),
  ('Request Resolution Time', 'Guest Portal', 'Duration', 'LowerIsBetter', 30.0, 'Average time to resolve guest requests (minutes)', 'Guest Portal', FALSE),
  ('Guest Satisfaction Signal', 'Guest Portal', 'Ratio', 'HigherIsBetter', 4.5, 'Average guest rating (1-5 scale)', 'Guest Portal', FALSE)
ON CONFLICT DO NOTHING;

-- Additional System Admin metrics
INSERT INTO metric_definitions (name, module, unit, direction, target_value, formula, department, is_computed) VALUES
  ('Active User Count', 'System Admin', 'Count', 'Neutral', NULL, 'Total active system users', 'System Admin', FALSE),
  ('Permission Change Frequency', 'System Admin', 'Count', 'LowerIsBetter', 5.0, 'Permission changes per week (GM-only view)', 'System Admin', FALSE)
ON CONFLICT DO NOTHING;

-- Update the default GM dashboard view to include additional key metrics
UPDATE dashboard_views 
SET tile_layout = 
  '{"occupancy_rate": {"row": 0, "col": 0, "size": "Small"}, "adr": {"row": 0, "col": 1, "size": "Small"}, "revpar": {"row": 0, "col": 2, "size": "Small"}, "total_revenue": {"row": 0, "col": 3, "size": "Small"}, "labor_cost_percent": {"row": 1, "col": 0, "size": "Small"}, "open_work_orders": {"row": 1, "col": 1, "size": "Small"}, "pipeline_value": {"row": 1, "col": 2, "size": "Small"}, "food_cost_percent": {"row": 1, "col": 3, "size": "Small"}, "goppar": {"row": 2, "col": 0, "size": "Medium"}, "cash_position": {"row": 2, "col": 1, "size": "Small"}, "ar_aging": {"row": 2, "col": 2, "size": "Small"}, "turnover_rate": {"row": 2, "col": 3, "size": "Small"}}'
WHERE name = 'GM Daily Dashboard';

-- Add alert rule for GOPPAR
INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'BelowTarget',
  40000.0,
  'Warning',
  ARRAY['GM', 'Finance', 'Owner'],
  'Both',
  TRUE,
  INTERVAL '24 hours'
FROM metric_definitions 
WHERE name = 'GOPPAR'
ON CONFLICT DO NOTHING;

-- Add alert rule for AR Aging
INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'AboveTarget',
  45.0,
  'Warning',
  ARRAY['GM', 'Finance'],
  'InApp',
  TRUE,
  INTERVAL '24 hours'
FROM metric_definitions 
WHERE name = 'AR Aging'
ON CONFLICT DO NOTHING;

-- Add alert rule for Turnover Rate
INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'AboveTarget',
  20.0,
  'Critical',
  ARRAY['GM', 'HR'],
  'Both',
  TRUE,
  INTERVAL '1 week'
FROM metric_definitions 
WHERE name = 'Turnover Rate'
ON CONFLICT DO NOTHING;

-- END: 089_kpi_catalog_no_triggers.sql

-- =========================================================================
-- Migration: 090_safe_trigger_function.sql
-- =========================================================================
-- Create a safe trigger function that checks if the column exists before setting it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the updated_at column exists in the table before trying to set it
    -- This prevents errors when the function is called on tables without updated_at
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = TG_TABLE_NAME 
        AND column_name = 'updated_at'
    ) THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- END: 090_safe_trigger_function.sql

-- =========================================================================
-- Migration: 091_role_based_dashboard_views.sql
-- =========================================================================
-- Executive Portal - Role-Based Dashboard Views
-- Phase 4: Implement DashboardView customization per role

-- Owner Dashboard View - Focus on high-level financial and operational metrics
INSERT INTO dashboard_views (name, owner_role, tile_layout, default_date_range, is_default) VALUES
  ('Owner Executive Summary', 'Owner',
   '{"total_revenue": {"row": 0, "col": 0, "size": "Medium"}, "goppar": {"row": 0, "col": 1, "size": "Medium"}, "occupancy_rate": {"row": 1, "col": 0, "size": "Small"}, "adr": {"row": 1, "col": 1, "size": "Small"}, "revpar": {"row": 1, "col": 2, "size": "Small"}, "cash_position": {"row": 2, "col": 0, "size": "Small"}, "ar_aging": {"row": 2, "col": 1, "size": "Small"}, "turnover_rate": {"row": 2, "col": 2, "size": "Small"}}',
   'MTD', TRUE)
ON CONFLICT DO NOTHING;

-- Department Manager Dashboard View - Focus on operational metrics
INSERT INTO dashboard_views (name, owner_role, tile_layout, default_date_range, is_default) VALUES
  ('Department Manager Operations', 'DepartmentManager',
   '{"occupancy_rate": {"row": 0, "col": 0, "size": "Small"}, "adr": {"row": 0, "col": 1, "size": "Small"}, "open_work_orders": {"row": 0, "col": 2, "size": "Small"}, "pipeline_value": {"row": 1, "col": 0, "size": "Small"}, "food_cost_percent": {"row": 1, "col": 1, "size": "Small"}, "labor_cost_percent": {"row": 1, "col": 2, "size": "Small"}, "room_turnaround_time": {"row": 2, "col": 0, "size": "Small"}, "inspection_pass_rate": {"row": 2, "col": 1, "size": "Small"}, "ooo_room_count": {"row": 2, "col": 2, "size": "Small"}}',
   'WTD', TRUE)
ON CONFLICT DO NOTHING;

-- Finance Dashboard View - Focus on financial metrics
INSERT INTO dashboard_views (name, owner_role, tile_layout, default_date_range, is_default) VALUES
  ('Finance Departmental', 'Finance',
   '{"total_revenue": {"row": 0, "col": 0, "size": "Medium"}, "goppar": {"row": 0, "col": 1, "size": "Medium"}, "labor_cost_percent": {"row": 1, "col": 0, "size": "Small"}, "cash_position": {"row": 1, "col": 1, "size": "Small"}, "ar_aging": {"row": 1, "col": 2, "size": "Small"}, "ap_aging": {"row": 2, "col": 0, "size": "Small"}, "budget_vs_actual_variance_percent": {"row": 2, "col": 1, "size": "Small"}, "pl_departmental": {"row": 2, "col": 2, "size": "Small"}}',
   'MTD', TRUE)
ON CONFLICT DO NOTHING;

-- Auditor Dashboard View - Focus on compliance and risk metrics
INSERT INTO dashboard_views (name, owner_role, tile_layout, default_date_range, is_default) VALUES
  ('Auditor Compliance View', 'Auditor',
   '{"labor_cost_percent": {"row": 0, "col": 0, "size": "Small"}, "food_cost_percent": {"row": 0, "col": 1, "size": "Small"}, "open_work_orders": {"row": 0, "col": 2, "size": "Small"}, "ar_aging": {"row": 1, "col": 0, "size": "Small"}, "ap_aging": {"row": 1, "col": 1, "size": "Small"}, "goods_receipt_discrepancy_rate": {"row": 1, "col": 2, "size": "Small"}, "permission_change_frequency": {"row": 2, "col": 0, "size": "Small"}, "pm_compliance_rate": {"row": 2, "col": 1, "size": "Small"}, "comp_void_rate": {"row": 2, "col": 2, "size": "Small"}}',
   'MTD', TRUE)
ON CONFLICT DO NOTHING;

-- Add additional alert rules for role-specific metrics
INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'AboveTarget',
  45.0,
  'Warning',
  ARRAY['DepartmentManager', 'GM'],
  'InApp',
  TRUE,
  INTERVAL '24 hours'
FROM metric_definitions 
WHERE name = 'Room Turnaround Time'
ON CONFLICT DO NOTHING;

INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'BelowTarget',
  90.0,
  'Warning',
  ARRAY['DepartmentManager', 'GM'],
  'InApp',
  TRUE,
  INTERVAL '24 hours'
FROM metric_definitions 
WHERE name = 'Inspection Pass Rate'
ON CONFLICT DO NOTHING;

INSERT INTO alert_rules (metric_id, condition, threshold, severity, notify_roles, notify_channel, is_active, cooldown_period)
SELECT 
  metric_id,
  'AboveTarget',
  3.0,
  'Warning',
  ARRAY['Auditor', 'Finance', 'GM'],
  'Both',
  TRUE,
  INTERVAL '1 week'
FROM metric_definitions 
WHERE name = 'Goods-Receipt Discrepancy Rate'
ON CONFLICT DO NOTHING;

-- END: 091_role_based_dashboard_views.sql

-- =========================================================================
-- Migration: 093_metric_history_functions.sql
-- =========================================================================
-- Executive Portal - Metric History and Trend Analysis Functions
-- Phase 6: Add MetricHistory + period-over-period/trend UI support

-- Function to get metric history for a date range
CREATE OR REPLACE FUNCTION get_metric_history(
    p_metric_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_property_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'
)
RETURNS TABLE(
    history_id UUID,
    metric_id UUID,
    date DATE,
    value DECIMAL,
    property_id UUID,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mh.history_id,
        mh.metric_id,
        mh.date,
        mh.value,
        mh.property_id,
        mh.created_at
    FROM metric_history mh
    WHERE mh.metric_id = p_metric_id
    AND mh.property_id = p_property_id
    AND mh.date BETWEEN p_start_date AND p_end_date
    ORDER BY mh.date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate period-over-period changes
CREATE OR REPLACE FUNCTION calculate_period_over_period(
    p_metric_id UUID,
    p_current_date DATE,
    p_previous_date DATE,
    p_property_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'
)
RETURNS TABLE(
    metric_id UUID,
    current_value DECIMAL,
    previous_value DECIMAL,
    absolute_change DECIMAL,
    percentage_change DECIMAL,
    curr_date DATE,
    previous_date DATE
) AS $$
DECLARE
    current_val DECIMAL;
    previous_val DECIMAL;
    abs_change DECIMAL;
    pct_change DECIMAL;
BEGIN
    -- Get current period value
    SELECT value INTO current_val
    FROM metric_history
    WHERE metric_id = p_metric_id
    AND property_id = p_property_id
    AND date = p_current_date;
    
    -- Get previous period value
    SELECT value INTO previous_val
    FROM metric_history
    WHERE metric_id = p_metric_id
    AND property_id = p_property_id
    AND date = p_previous_date;
    
    -- Calculate changes
    IF current_val IS NOT NULL AND previous_val IS NOT NULL AND previous_val != 0 THEN
        abs_change := current_val - previous_val;
        pct_change := (current_val - previous_val) / previous_val * 100;
    ELSE
        abs_change := NULL;
        pct_change := NULL;
    END IF;
    
    RETURN QUERY
    SELECT 
        p_metric_id,
        current_val,
        previous_val,
        abs_change,
        pct_change,
        p_current_date AS curr_date,
        p_previous_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get trend analysis for a metric
CREATE OR REPLACE FUNCTION get_metric_trend(
    p_metric_id UUID,
    p_days INTEGER DEFAULT 30,
    p_property_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'
)
RETURNS TABLE(
    metric_id UUID,
    start_date DATE,
    end_date DATE,
    start_value DECIMAL,
    end_value DECIMAL,
    total_change DECIMAL,
    percentage_change DECIMAL,
    average_value DECIMAL,
    min_value DECIMAL,
    max_value DECIMAL,
    trend_direction VARCHAR
) AS $$
DECLARE
    start_val DECIMAL;
    end_val DECIMAL;
    total_chg DECIMAL;
    pct_chg DECIMAL;
    avg_val DECIMAL;
    min_val DECIMAL;
    max_val DECIMAL;
    trend_dir VARCHAR;
    end_dt DATE;
    start_dt DATE;
BEGIN
    -- Calculate date range
    end_dt := CURRENT_DATE;
    start_dt := end_dt - (p_days || ' days')::INTERVAL;
    
    -- Get start and end values
    SELECT value INTO start_val
    FROM metric_history
    WHERE metric_id = p_metric_id
    AND property_id = p_property_id
    AND date >= start_dt
    ORDER BY date ASC
    LIMIT 1;
    
    SELECT value INTO end_val
    FROM metric_history
    WHERE metric_id = p_metric_id
    AND property_id = p_property_id
    AND date <= end_dt
    ORDER BY date DESC
    LIMIT 1;
    
    -- Calculate statistics
    SELECT 
        AVG(value),
        MIN(value),
        MAX(value)
    INTO avg_val, min_val, max_val
    FROM metric_history
    WHERE metric_id = p_metric_id
    AND property_id = p_property_id
    AND date BETWEEN start_dt AND end_dt;
    
    -- Calculate changes
    IF start_val IS NOT NULL AND end_val IS NOT NULL AND start_val != 0 THEN
        total_chg := end_val - start_val;
        pct_chg := (end_val - start_val) / start_val * 100;
        
        -- Determine trend direction
        IF pct_chg > 5 THEN
            trend_dir := 'Strongly Increasing';
        ELSIF pct_chg > 0 THEN
            trend_dir := 'Increasing';
        ELSIF pct_chg < -5 THEN
            trend_dir := 'Strongly Decreasing';
        ELSIF pct_chg < 0 THEN
            trend_dir := 'Decreasing';
        ELSE
            trend_dir := 'Stable';
        END IF;
    ELSE
        total_chg := NULL;
        pct_chg := NULL;
        trend_dir := 'Insufficient Data';
    END IF;
    
    RETURN QUERY
    SELECT 
        p_metric_id,
        start_dt,
        end_dt,
        start_val,
        end_val,
        total_chg,
        pct_chg,
        avg_val,
        min_val,
        max_val,
        trend_dir;
END;
$$ LANGUAGE plpgsql;

-- Function to get moving average for a metric
CREATE OR REPLACE FUNCTION get_moving_average(
    p_metric_id UUID,
    p_window_days INTEGER DEFAULT 7,
    p_end_date DATE DEFAULT CURRENT_DATE,
    p_property_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'
)
RETURNS TABLE(
    date DATE,
    value DECIMAL,
    moving_average DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mh.date,
        mh.value,
        AVG(mh2.value) OVER (
            ORDER BY mh.date 
            ROWS BETWEEN (p_window_days - 1) PRECEDING AND CURRENT ROW
        ) AS moving_average
    FROM metric_history mh
    LEFT JOIN metric_history mh2 ON mh.metric_id = mh2.metric_id 
        AND mh.property_id = mh2.property_id
        AND mh2.date BETWEEN mh.date - (p_window_days || ' days')::INTERVAL AND mh.date
    WHERE mh.metric_id = p_metric_id
    AND mh.property_id = p_property_id
    AND mh.date <= p_end_date
    GROUP BY mh.date, mh.value
    ORDER BY mh.date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to populate metric history from reporting snapshots
CREATE OR REPLACE FUNCTION populate_metric_history_from_snapshot(
    p_snapshot_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    snapshot_record RECORD;
    metric_key TEXT;
    metric_id UUID;
    metric_value DECIMAL;
    snapshot_date DATE;
    property_id UUID;
    inserted_count INTEGER DEFAULT 0;
BEGIN
    -- Get snapshot details
    SELECT snapshot_date, property_id, metric_values
    INTO snapshot_date, property_id, snapshot_record.metric_values
    FROM reporting_snapshots
    WHERE snapshot_id = p_snapshot_id;
    
    -- Insert metric values into history
    FOR metric_key, metric_value IN 
        SELECT * FROM jsonb_each_text(snapshot_record.metric_values)
    LOOP
        -- Try to find metric by name (simplified - in production use metric_id directly)
        SELECT metric_id INTO metric_id
        FROM metric_definitions
        WHERE LOWER(name) = LOWER(metric_key)
        LIMIT 1;
        
        IF metric_id IS NOT NULL AND metric_value IS NOT NULL THEN
            INSERT INTO metric_history (metric_id, date, value, property_id)
            VALUES (metric_id, snapshot_date, metric_value::DECIMAL, property_id)
            ON CONFLICT (metric_id, date, property_id) 
            DO UPDATE SET value = EXCLUDED.value;
            
            inserted_count := inserted_count + 1;
        END IF;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

-- END: 093_metric_history_functions.sql

-- =========================================================================
-- Migration: 094_report_schedule_functions.sql
-- =========================================================================
-- Executive Portal - Report Schedule Functions
-- Phase 7: Implement ReportSchedule automated export
-- Adapted to work with existing report_schedules table schema

-- Function to get active report schedules for a specific day
CREATE OR REPLACE FUNCTION get_due_reports(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
    id UUID,
    report_name VARCHAR,
    frequency VARCHAR,
    recipients TEXT[],
    status VARCHAR,
    next_run TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rs.id,
        rs.report_name,
        rs.frequency,
        rs.recipients,
        rs.status,
        rs.next_run
    FROM report_schedules rs
    WHERE rs.status = 'Active'
    AND (
        -- Daily reports
        (rs.frequency = 'Daily') OR
        -- Weekly reports (check if day matches)
        (rs.frequency = 'Weekly' AND rs.next_run = TO_CHAR(p_date, 'Day')) OR
        -- Monthly reports (check if day of month matches)
        (rs.frequency = 'Monthly' AND rs.next_run::INTEGER = EXTRACT(DAY FROM p_date)) OR
        -- Quarterly reports (check if it's the first day of a quarter)
        (rs.frequency = 'Quarterly' AND 
         EXTRACT(DAY FROM p_date) = 1 AND 
         EXTRACT(MONTH FROM p_date) IN (1, 4, 7, 10))
    );
END;
$$ LANGUAGE plpgsql;

-- Function to mark a report as sent
CREATE OR REPLACE FUNCTION mark_report_sent(p_schedule_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE report_schedules
    SET updated_at = NOW()
    WHERE id = p_schedule_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new report schedule
CREATE OR REPLACE FUNCTION create_report_schedule(
    p_report_name VARCHAR,
    p_recipients TEXT[],
    p_frequency VARCHAR,
    p_next_run TEXT,
    p_created_by TEXT
)
RETURNS UUID AS $$
DECLARE
    new_schedule_id UUID;
BEGIN
    INSERT INTO report_schedules (
        report_name, frequency, recipients, next_run, status, created_by
    )
    VALUES (
        p_report_name, p_frequency, p_recipients, p_next_run, 'Active', p_created_by
    )
    RETURNING id INTO new_schedule_id;
    
    RETURN new_schedule_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update a report schedule
CREATE OR REPLACE FUNCTION update_report_schedule(
    p_schedule_id UUID,
    p_report_name VARCHAR,
    p_recipients TEXT[],
    p_frequency VARCHAR,
    p_next_run TEXT,
    p_status VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE report_schedules
    SET 
        report_name = p_report_name,
        recipients = p_recipients,
        frequency = p_frequency,
        next_run = p_next_run,
        status = p_status,
        updated_at = NOW()
    WHERE id = p_schedule_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to delete a report schedule
CREATE OR REPLACE FUNCTION delete_report_schedule(p_schedule_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM report_schedules
    WHERE id = p_schedule_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get all report schedules
CREATE OR REPLACE FUNCTION get_all_report_schedules()
RETURNS TABLE(
    id UUID,
    report_name VARCHAR,
    frequency VARCHAR,
    recipients TEXT[],
    status VARCHAR,
    next_run TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rs.id,
        rs.report_name,
        rs.frequency,
        rs.recipients,
        rs.status,
        rs.next_run,
        rs.created_by,
        rs.created_at,
        rs.updated_at
    FROM report_schedules rs
    ORDER BY rs.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert sample report schedules (without created_by to avoid FK constraint)
INSERT INTO report_schedules (report_name, frequency, recipients, next_run, status) VALUES
  ('Daily GM Summary', 'Daily', ARRAY['gm@hotel.com', 'owner@hotel.com'], NULL, 'Active'),
  ('Weekly Financial Report', 'Weekly', ARRAY['finance@hotel.com', 'gm@hotel.com'], 'Monday', 'Active'),
  ('Monthly Operations Review', 'Monthly', ARRAY['gm@hotel.com', 'departmentmanager@hotel.com'], '1', 'Active'),
  ('Quarterly Owner Report', 'Quarterly', ARRAY['owner@hotel.com', 'gm@hotel.com', 'finance@hotel.com'], NULL, 'Active')
ON CONFLICT DO NOTHING;

-- END: 094_report_schedule_functions.sql

-- =========================================================================
-- Migration: 096_drill_down_navigation.sql
-- =========================================================================
-- Executive Portal - Drill-Down Navigation Functions
-- Phase 8: Add drill-down navigation respecting source-module permissions

-- Function to get drill-down links for a specific tile
CREATE OR REPLACE FUNCTION get_drill_down_links(p_tile_id UUID)
RETURNS TABLE(
    link_id UUID,
    tile_id UUID,
    target_module VARCHAR,
    target_view VARCHAR,
    required_permission VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dl.link_id,
        dl.tile_id,
        dl.target_module,
        dl.target_view,
        dl.required_permission,
        dl.created_at
    FROM drill_down_links dl
    WHERE dl.tile_id = p_tile_id
    ORDER BY dl.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has permission for a drill-down link
CREATE OR REPLACE FUNCTION check_drill_down_permission(
    p_link_id UUID,
    p_user_permissions TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
    required_perm VARCHAR;
BEGIN
    -- Get the required permission for the link
    SELECT required_permission INTO required_perm
    FROM drill_down_links
    WHERE link_id = p_link_id;
    
    -- If no permission required, allow access
    IF required_perm IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user has the required permission
    IF required_perm = ANY(p_user_permissions) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get accessible drill-down links for a user
CREATE OR REPLACE FUNCTION get_accessible_drill_down_links(
    p_tile_id UUID,
    p_user_permissions TEXT[]
)
RETURNS TABLE(
    link_id UUID,
    tile_id UUID,
    target_module VARCHAR,
    target_view VARCHAR,
    required_permission VARCHAR,
    is_accessible BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dl.link_id,
        dl.tile_id,
        dl.target_module,
        dl.target_view,
        dl.required_permission,
        CASE 
            WHEN dl.required_permission IS NULL THEN TRUE
            WHEN dl.required_permission = ANY(p_user_permissions) THEN TRUE
            ELSE FALSE
        END AS is_accessible
    FROM drill_down_links dl
    WHERE dl.tile_id = p_tile_id
    ORDER BY dl.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to create a drill-down link
CREATE OR REPLACE FUNCTION create_drill_down_link(
    p_tile_id UUID,
    p_target_module VARCHAR,
    p_target_view VARCHAR,
    p_required_permission VARCHAR
)
RETURNS UUID AS $$
DECLARE
    new_link_id UUID;
BEGIN
    INSERT INTO drill_down_links (
        tile_id, target_module, target_view, required_permission
    )
    VALUES (
        p_tile_id, p_target_module, p_target_view, p_required_permission
    )
    RETURNING link_id INTO new_link_id;
    
    RETURN new_link_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update a drill-down link
CREATE OR REPLACE FUNCTION update_drill_down_link(
    p_link_id UUID,
    p_target_module VARCHAR,
    p_target_view VARCHAR,
    p_required_permission VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE drill_down_links
    SET 
        target_module = p_target_module,
        target_view = p_target_view,
        required_permission = p_required_permission,
        updated_at = NOW()
    WHERE link_id = p_link_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to delete a drill-down link
CREATE OR REPLACE FUNCTION delete_drill_down_link(p_link_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM drill_down_links
    WHERE link_id = p_link_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Insert sample drill-down links for key metrics
-- Note: Using placeholder UUIDs for tile_id - in production these would reference actual metric IDs
INSERT INTO drill_down_links (tile_id, target_module, target_view, required_permission) VALUES
  -- Occupancy Rate drill-down to Front Office
  (uuid_generate_v4(), 'frontoffice', 'room-occupancy', 'view_frontoffice'),
  -- ADR drill-down to Front Office
  (uuid_generate_v4(), 'frontoffice', 'room-rates', 'view_frontoffice'),
  -- RevPAR drill-down to Front Office
  (uuid_generate_v4(), 'frontoffice', 'revenue-analysis', 'view_frontoffice'),
  -- Total Revenue drill-down to Finance
  (uuid_generate_v4(), 'finance', 'revenue-report', 'view_finance'),
  -- Labor Cost % drill-down to HR
  (uuid_generate_v4(), 'hr', 'labor-report', 'view_hr'),
  -- Open Work Orders drill-down to Maintenance
  (uuid_generate_v4(), 'maintenance', 'work-orders', 'view_maintenance'),
  -- Pipeline Value drill-down to Sales & Events
  (uuid_generate_v4(), 'sales', 'pipeline', 'view_sales'),
  -- Food Cost % drill-down to F&B
  (uuid_generate_v4(), 'foodbeverage', 'cost-analysis', 'view_fandb'),
  -- Headcount drill-down to HR
  (uuid_generate_v4(), 'hr', 'staffing', 'view_hr'),
  -- Cash Position drill-down to Finance
  (uuid_generate_v4(), 'finance', 'cash-management', 'view_finance'),
  -- GOPPAR drill-down to Finance
  (uuid_generate_v4(), 'finance', 'profit-loss', 'view_finance'),
  -- AR Aging drill-down to Finance
  (uuid_generate_v4(), 'finance', 'accounts-receivable', 'view_finance'),
  -- Turnover Rate drill-down to HR
  (uuid_generate_v4(), 'hr', 'turnover-report', 'view_hr')
ON CONFLICT DO NOTHING;

-- END: 096_drill_down_navigation.sql

-- =========================================================================
-- Migration: 097_operations_manager_portal.sql
-- =========================================================================
-- Operations Manager Portal Migration
-- Creates tables for Daily Briefing, Action Queue, Escalations, Staffing, Handoffs, Handover, and Manager Notes

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DAILY BRIEFING
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_briefing (
    briefing_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL,
    briefing_date DATE NOT NULL,
    arrivals_count INTEGER DEFAULT 0,
    departures_count INTEGER DEFAULT 0,
    vip_arrivals JSONB DEFAULT '[]'::jsonb, -- Array of {name, room, notes}
    events_today JSONB DEFAULT '[]'::jsonb, -- Array of {name, time, location, type}
    staffing_gap_count INTEGER DEFAULT 0,
    open_escalation_count INTEGER DEFAULT 0,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_property_date UNIQUE (property_id, briefing_date)
);

CREATE INDEX idx_daily_briefing_date ON daily_briefing(briefing_date);
CREATE INDEX idx_daily_briefing_property ON daily_briefing(property_id);

-- ============================================================================
-- ACTION ITEM (Unified Cross-Module Task/Approval Queue)
-- ============================================================================
CREATE TABLE IF NOT EXISTS action_item (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_module VARCHAR(50) NOT NULL CHECK (source_module IN (
        'FrontOffice', 'FandB', 'Housekeeping', 'Maintenance', 
        'HR', 'Procurement', 'SalesEvents', 'GuestPortal'
    )),
    source_record_id VARCHAR(255) NOT NULL, -- FK reference to owning module's record
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN (
        'Approval', 'Escalation', 'TaskAssignment', 'Exception'
    )),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'Normal' CHECK (priority IN (
        'Low', 'Normal', 'High', 'Urgent'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'New' CHECK (status IN (
        'New', 'InProgress', 'Resolved', 'Dismissed'
    )),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_by TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,
    requires_approval_amount DECIMAL(12, 2) -- For approval items with cost threshold
);

CREATE INDEX idx_action_item_status ON action_item(status);
CREATE INDEX idx_action_item_priority ON action_item(priority);
CREATE INDEX idx_action_item_module ON action_item(source_module);
CREATE INDEX idx_action_item_assigned ON action_item(assigned_to);
CREATE INDEX idx_action_item_due ON action_item(due_by);

-- ============================================================================
-- STAFFING STATUS
-- ============================================================================
CREATE TABLE IF NOT EXISTS staffing_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department VARCHAR(100) NOT NULL,
    status_date DATE NOT NULL,
    shift VARCHAR(20) NOT NULL CHECK (shift IN (
        'Morning', 'Afternoon', 'Evening', 'Night'
    )),
    scheduled_count INTEGER DEFAULT 0,
    present_count INTEGER DEFAULT 0,
    gap_count INTEGER GENERATED ALWAYS AS (scheduled_count - present_count) STORED,
    coverage_plan TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_dept_date_shift UNIQUE (department, status_date, shift)
);

CREATE INDEX idx_staffing_status_date ON staffing_status(status_date);
CREATE INDEX idx_staffing_status_dept ON staffing_status(department);

-- ============================================================================
-- ESCALATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS escalation (
    escalation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raised_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    department VARCHAR(100) NOT NULL,
    linked_guest_id UUID, -- Reference to guest record
    linked_room_id UUID, -- Reference to room record
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'GuestComplaint', 'SafetyIncident', 'EquipmentFailure', 'StaffIssue', 'Other'
    )),
    severity VARCHAR(20) NOT NULL DEFAULT 'Moderate' CHECK (severity IN (
        'Minor', 'Moderate', 'Major', 'Critical'
    )),
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN (
        'Open', 'InProgress', 'Resolved', 'EscalatedFurther'
    )),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_escalation_status ON escalation(status);
CREATE INDEX idx_escalation_severity ON escalation(severity);
CREATE INDEX idx_escalation_dept ON escalation(department);
CREATE INDEX idx_escalation_assigned ON escalation(assigned_to);
CREATE INDEX idx_escalation_guest ON escalation(linked_guest_id);
CREATE INDEX idx_escalation_room ON escalation(linked_room_id);

-- ============================================================================
-- ESCALATION EVENT (Append-only timeline)
-- ============================================================================
CREATE TABLE IF NOT EXISTS escalation_event (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escalation_id UUID NOT NULL REFERENCES escalation(escalation_id) ON DELETE CASCADE,
    actor UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    note TEXT NOT NULL,
    status_change VARCHAR(50), -- Optional: captures status transition
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_escalation_event_escalation ON escalation_event(escalation_id);
CREATE INDEX idx_escalation_event_time ON escalation_event(created_at);

-- ============================================================================
-- INTERDEPARTMENTAL HANDOFF
-- ============================================================================
CREATE TABLE IF NOT EXISTS interdepartmental_handoff (
    handoff_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_department VARCHAR(100) NOT NULL,
    to_department VARCHAR(100) NOT NULL,
    source_record_type VARCHAR(50) NOT NULL CHECK (source_record_type IN (
        'HousekeepingFlag', 'GuestRequest', 'MaintenanceIssue'
    )),
    source_record_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Sent' CHECK (status IN (
        'Sent', 'Acknowledged', 'InProgress', 'Completed'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_handoff_status ON interdepartmental_handoff(status);
CREATE INDEX idx_handoff_from_dept ON interdepartmental_handoff(from_department);
CREATE INDEX idx_handoff_to_dept ON interdepartmental_handoff(to_department);
CREATE INDEX idx_handoff_source ON interdepartmental_handoff(source_record_type, source_record_id);

-- ============================================================================
-- SHIFT HANDOVER NOTE
-- ============================================================================
CREATE TABLE IF NOT EXISTS shift_handover_note (
    note_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outgoing_manager UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    incoming_manager UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    shift_date DATE NOT NULL,
    shift_period VARCHAR(20) NOT NULL CHECK (shift_period IN (
        'Day', 'Evening', 'Night'
    )),
    summary TEXT NOT NULL,
    open_item_refs UUID[] DEFAULT ARRAY[]::UUID[], -- References to ActionItem.item_id
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_handover_date ON shift_handover_note(shift_date);
CREATE INDEX idx_handover_outgoing ON shift_handover_note(outgoing_manager);
CREATE INDEX idx_handover_incoming ON shift_handover_note(incoming_manager);

-- ============================================================================
-- MANAGER NOTE
-- ============================================================================
CREATE TABLE IF NOT EXISTS manager_note (
    note_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    linked_type VARCHAR(50) NOT NULL CHECK (linked_type IN (
        'Guest', 'Room', 'Escalation', 'General'
    )),
    linked_id VARCHAR(255), -- ID of the linked entity
    author UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    text TEXT NOT NULL,
    visible_to_roles TEXT[] DEFAULT ARRAY[]::TEXT[], -- Roles that can see this note
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_manager_note_linked ON manager_note(linked_type, linked_id);
CREATE INDEX idx_manager_note_author ON manager_note(author);
CREATE INDEX idx_manager_note_created ON manager_note(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Daily Briefing RLS
ALTER TABLE daily_briefing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily briefing readable by authenticated users"
    ON daily_briefing FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Daily briefing writable by operations managers"
    ON daily_briefing FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager')
        )
    );

-- Action Item RLS
ALTER TABLE action_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Action items readable by authenticated users"
    ON action_item FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Action items writable by operations managers"
    ON action_item FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager', 'Department Manager')
        )
    );

-- Staffing Status RLS
ALTER TABLE staffing_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staffing status readable by authenticated users"
    ON staffing_status FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Staffing status writable by operations managers"
    ON staffing_status FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager')
        )
    );

-- Escalation RLS
ALTER TABLE escalation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Escalations readable by authenticated users"
    ON escalation FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Escalations writable by operations managers"
    ON escalation FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager')
        )
    );

-- Escalation Event RLS
ALTER TABLE escalation_event ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Escalation events readable by authenticated users"
    ON escalation_event FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Escalation events writable by operations managers"
    ON escalation_event FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager')
        )
    );

-- Interdepartmental Handoff RLS
ALTER TABLE interdepartmental_handoff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Handoffs readable by authenticated users"
    ON interdepartmental_handoff FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Handoffs writable by operations managers"
    ON interdepartmental_handoff FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager')
        )
    );

-- Shift Handover Note RLS
ALTER TABLE shift_handover_note ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Handover notes readable by authenticated users"
    ON shift_handover_note FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Handover notes writable by operations managers"
    ON shift_handover_note FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Operations Manager', 'General Manager', 'Duty Manager')
        )
    );

-- Manager Note RLS
ALTER TABLE manager_note ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manager notes readable by authenticated users"
    ON manager_note FOR SELECT
    TO authenticated
    USING (
        -- User can see if they are author or if their role is in visible_to_roles
        author = auth.uid() 
        OR visible_to_roles && (
            SELECT array_agg(role) FROM user_roles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Manager notes writable by all authenticated"
    ON manager_note FOR ALL
    TO authenticated
    USING (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate or refresh daily briefing
CREATE OR REPLACE FUNCTION refresh_daily_briefing(p_property_id UUID, p_briefing_date DATE DEFAULT CURRENT_DATE)
RETURNS UUID AS $$
DECLARE
    v_briefing_id UUID;
    v_arrivals_count INTEGER;
    v_departures_count INTEGER;
    v_vip_arrivals JSONB;
    v_events_today JSONB;
    v_staffing_gap_count INTEGER;
    v_open_escalation_count INTEGER;
BEGIN
    -- Count arrivals for the date
    SELECT COUNT(*) INTO v_arrivals_count
    FROM reservations
    WHERE check_in_date = p_briefing_date
    AND status IN ('Confirmed', 'CheckedIn');
    
    -- Count departures for the date
    SELECT COUNT(*) INTO v_departures_count
    FROM reservations
    WHERE check_out_date = p_briefing_date
    AND status IN ('Confirmed', 'CheckedIn');
    
    -- Get VIP arrivals (guests marked as VIP)
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'name', g.first_name || ' ' || g.last_name,
        'room', r.room_number,
        'notes', g.notes
    )), '[]'::jsonb) INTO v_vip_arrivals
    FROM reservations res
    JOIN guests g ON res.guest_id = g.guest_id
    JOIN rooms r ON res.room_id = r.room_id
    WHERE res.check_in_date = p_briefing_date
    AND res.status IN ('Confirmed', 'CheckedIn')
    AND g.is_vip = true;
    
    -- Get events for today (from events table if exists, otherwise empty)
    SELECT COALESCE(
        (SELECT jsonb_agg(jsonb_build_object(
            'name', event_name,
            'time', start_time,
            'location', location,
            'type', event_type
        ))
        FROM events
        WHERE event_date = p_briefing_date),
        '[]'::jsonb
    ) INTO v_events_today;
    
    -- Count staffing gaps for today
    SELECT COALESCE(SUM(gap_count), 0) INTO v_staffing_gap_count
    FROM staffing_status
    WHERE status_date = p_briefing_date;
    
    -- Count open escalations
    SELECT COUNT(*) INTO v_open_escalation_count
    FROM escalation
    WHERE status IN ('Open', 'InProgress')
    AND created_at >= p_briefing_date - INTERVAL '7 days'; -- Active in last 7 days
    
    -- Upsert the briefing
    INSERT INTO daily_briefing (
        property_id, briefing_date, arrivals_count, departures_count,
        vip_arrivals, events_today, staffing_gap_count, open_escalation_count, generated_at
    ) VALUES (
        p_property_id, p_briefing_date, v_arrivals_count, v_departures_count,
        v_vip_arrivals, v_events_today, v_staffing_gap_count, v_open_escalation_count, NOW()
    )
    ON CONFLICT (property_id, briefing_date)
    DO UPDATE SET
        arrivals_count = EXCLUDED.arrivals_count,
        departures_count = EXCLUDED.departures_count,
        vip_arrivals = EXCLUDED.vip_arrivals,
        events_today = EXCLUDED.events_today,
        staffing_gap_count = EXCLUDED.staffing_gap_count,
        open_escalation_count = EXCLUDED.open_escalation_count,
        generated_at = NOW()
    RETURNING briefing_id INTO v_briefing_id;
    
    RETURN v_briefing_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create action item from module
CREATE OR REPLACE FUNCTION create_action_item(
    p_source_module VARCHAR,
    p_source_record_id VARCHAR,
    p_item_type VARCHAR,
    p_title VARCHAR,
    p_description TEXT,
    p_priority VARCHAR DEFAULT 'Normal',
    p_assigned_to UUID DEFAULT NULL,
    p_due_by TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_requires_approval_amount DECIMAL DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_item_id UUID;
BEGIN
    INSERT INTO action_item (
        source_module, source_record_id, item_type, title, description,
        priority, assigned_to, due_by, requires_approval_amount
    ) VALUES (
        p_source_module, p_source_record_id, p_item_type, p_title, p_description,
        p_priority, p_assigned_to, p_due_by, p_requires_approval_amount
    ) RETURNING item_id INTO v_item_id;
    
    RETURN v_item_id;
END;
$$ LANGUAGE plpgsql;

-- Function to resolve action item
CREATE OR REPLACE FUNCTION resolve_action_item(
    p_item_id UUID,
    p_resolution_note TEXT,
    p_actor UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE action_item
    SET status = 'Resolved',
        resolved_at = NOW(),
        resolution_note = p_resolution_note
    WHERE item_id = p_item_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to add escalation event
CREATE OR REPLACE FUNCTION add_escalation_event(
    p_escalation_id UUID,
    p_actor UUID,
    p_note TEXT,
    p_status_change VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO escalation_event (escalation_id, actor, note, status_change)
    VALUES (p_escalation_id, p_actor, p_note, p_status_change)
    RETURNING event_id INTO v_event_id;
    
    -- Update escalation status if status_change provided
    IF p_status_change IS NOT NULL THEN
        UPDATE escalation
        SET status = p_status_change
        WHERE escalation_id = p_escalation_id;
        
        -- Set resolved_at if resolving
        IF p_status_change = 'Resolved' THEN
            UPDATE escalation
            SET resolved_at = NOW()
            WHERE escalation_id = p_escalation_id;
        END IF;
    END IF;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to acknowledge shift handover
CREATE OR REPLACE FUNCTION acknowledge_handover(p_note_id UUID, p_incoming_manager UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE shift_handover_note
    SET incoming_manager = p_incoming_manager,
        acknowledged_at = NOW()
    WHERE note_id = p_note_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to auto-refresh daily briefing when reservations change
CREATE OR REPLACE FUNCTION trigger_refresh_briefing()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh briefing for check-in/check-out date changes
    IF TG_TABLE_NAME = 'reservations' THEN
        IF (NEW.check_in_date IS DISTINCT FROM OLD.check_in_date) OR
           (NEW.check_out_date IS DISTINCT FROM OLD.check_out_date) OR
           (NEW.status IS DISTINCT FROM OLD.status) THEN
            PERFORM refresh_daily_briefing(NULL, COALESCE(NEW.check_in_date, NEW.check_out_date, CURRENT_DATE));
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to reservations table
DROP TRIGGER IF EXISTS tr_refresh_briefing_reservations ON reservations;
CREATE TRIGGER tr_refresh_briefing_reservations
    AFTER INSERT OR UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_refresh_briefing();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create initial daily briefing for today if not exists
SELECT refresh_daily_briefing(NULL, CURRENT_DATE);

-- END: 097_operations_manager_portal.sql

-- =========================================================================
-- Migration: 098_operations_reports_overview.sql
-- =========================================================================
-- ============================================================================
-- Operations Manager Portal: Reports & Overview Tables
-- Migration 098
-- ============================================================================

-- Report Definitions: catalog of available operational reports
create table if not exists operations_report_definition (
  report_id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('DailyOperations','Housekeeping','Maintenance','FandB','FrontOffice','HR','Procurement','SalesEvents','CrossDepartment')),
  description text,
  default_date_range text not null default 'Today' check (default_date_range in ('Today','Yesterday','WTD','MTD','Custom')),
  fields text[] not null default '{}',
  output_formats text[] not null default '{PDF}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Generated Reports: records of report generation runs
create table if not exists operations_generated_report (
  generated_report_id uuid primary key default gen_random_uuid(),
  report_id uuid not null references operations_report_definition(report_id) on delete cascade,
  generated_by text,
  date_range_used text,
  generated_at timestamptz not null default now(),
  format text not null default 'PDF' check (format in ('PDF','Excel','CSV')),
  file_ref text,
  status text not null default 'Generating' check (status in ('Ready','Failed','Generating'))
);

-- Report Schedules: recurring automated report generation + delivery
create table if not exists operations_report_schedule (
  schedule_id uuid primary key default gen_random_uuid(),
  report_id uuid not null references operations_report_definition(report_id) on delete cascade,
  recipient_list text[] not null default '{}',
  frequency text not null default 'Daily' check (frequency in ('Daily','Weekly','Monthly')),
  format text not null default 'PDF' check (format in ('PDF','Excel')),
  is_active boolean not null default true,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Report Archive: retention tracking for generated reports
create table if not exists operations_report_archive (
  archive_entry_id uuid primary key default gen_random_uuid(),
  generated_report_id uuid not null references operations_generated_report(generated_report_id) on delete cascade,
  retained_until date not null,
  archived_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_ops_gen_report_report_id on operations_generated_report(report_id);
create index if not exists idx_ops_gen_report_generated_at on operations_generated_report(generated_at desc);
create index if not exists idx_ops_schedule_report_id on operations_report_schedule(report_id);
create index if not exists idx_ops_schedule_active on operations_report_schedule(is_active);
create index if not exists idx_ops_archive_retained_until on operations_report_archive(retained_until);
create index if not exists idx_ops_report_def_category on operations_report_definition(category);

-- Enable RLS
alter table operations_report_definition enable row level security;
alter table operations_generated_report enable row level security;
alter table operations_report_schedule enable row level security;
alter table operations_report_archive enable row level security;

-- RLS Policies: authenticated users can read; operations managers/admins can write
drop policy if exists "ops_report_def_read" on operations_report_definition;
create policy "ops_report_def_read" on operations_report_definition
  for select to authenticated using (true);

drop policy if exists "ops_report_def_write" on operations_report_definition;
create policy "ops_report_def_write" on operations_report_definition
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_gen_report_read" on operations_generated_report;
create policy "ops_gen_report_read" on operations_generated_report
  for select to authenticated using (true);

drop policy if exists "ops_gen_report_write" on operations_generated_report;
create policy "ops_gen_report_write" on operations_generated_report
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_schedule_read" on operations_report_schedule;
create policy "ops_schedule_read" on operations_report_schedule
  for select to authenticated using (true);

drop policy if exists "ops_schedule_write" on operations_report_schedule;
create policy "ops_schedule_write" on operations_report_schedule
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_archive_read" on operations_report_archive;
create policy "ops_archive_read" on operations_report_archive
  for select to authenticated using (true);

drop policy if exists "ops_archive_write" on operations_report_archive;
create policy "ops_archive_write" on operations_report_archive
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

-- Seed report definitions
insert into operations_report_definition (name, category, description, default_date_range, fields, output_formats)
values
  ('Daily Operations Summary', 'DailyOperations', 'Occupancy, arrivals/departures, F&B covers, open escalations, staffing gaps â€” one page, end-of-day', 'Today', '{"Occupancy","Arrivals","Departures","F&B Covers","Open Escalations","Staffing Gaps"}', '{"PDF","Excel"}'),
  ('Shift Handover Report', 'DailyOperations', 'Formatted export of shift handover notes and any carried-forward action items', 'Today', '{"Shift Period","Outgoing Manager","Summary","Carried Forward Items"}', '{"PDF"}'),
  ('Housekeeping Daily Report', 'Housekeeping', 'Rooms cleaned, inspection results, OOO log', 'Today', '{"Rooms Cleaned","Inspection Results","OOO Log"}', '{"PDF","Excel","CSV"}'),
  ('Maintenance Work Order Log', 'Maintenance', 'All work orders in a date range with status and resolution time', 'WTD', '{"Work Order ID","Status","Resolution Time","Room"}', '{"PDF","Excel","CSV"}'),
  ('F&B Daily Cost & Comp Report', 'FandB', 'Cover count, comp/void log with reasons, food cost %', 'Today', '{"Cover Count","Comp/Void Log","Food Cost %"}', '{"PDF","Excel"}'),
  ('Front Office Arrivals/Departures', 'FrontOffice', 'Full guest list with room, rate, notes for the day', 'Today', '{"Guest Name","Room","Rate","Notes"}', '{"PDF","Excel","CSV"}'),
  ('Staffing & Attendance Summary', 'HR', 'Scheduled vs. present by department, overtime flagged', 'MTD', '{"Department","Scheduled","Present","Overtime"}', '{"PDF","Excel"}'),
  ('Goods Receipt & Discrepancy Log', 'Procurement', 'Receipts in range, any discrepancy noted', 'WTD', '{"Receipt ID","PO Number","Discrepancy","Notes"}', '{"PDF","Excel","CSV"}'),
  ('Escalation Log', 'CrossDepartment', 'All escalations in range with severity, resolution time, department', 'MTD', '{"Escalation ID","Department","Severity","Resolution Time","Status"}', '{"PDF","Excel"}'),
  ('Weekly Cross-Department Summary', 'CrossDepartment', 'Rolled-up version of the Daily Operations Summary across 7 days', 'WTD', '{"Daily Occupancy","Daily Arrivals","Daily Departures","F&B Covers","Escalations","Staffing Gaps"}', '{"PDF","Excel"}')
on conflict (report_id) do nothing;

-- END: 098_operations_reports_overview.sql

-- =========================================================================
-- Migration: 099_operations_financial_reports.sql
-- =========================================================================
-- ============================================================================
-- Operations Manager Portal: Financial Reports Tables
-- Migration 099
-- ============================================================================

-- Financial Report Definitions: catalog of available financial reports
create table if not exists operations_financial_report_definition (
  report_id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('Monthly','Quarterly','YearOverYear')),
  department_scope text not null default 'AllDepartments' check (department_scope in ('AllDepartments','RoomsOnly','FandBOnly','Custom')),
  includes_budget_comparison boolean not null default true,
  includes_prior_period_comparison boolean not null default false,
  output_formats text[] not null default '{PDF,Excel}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Monthly Financial Report: department-level P&L for a single month
create table if not exists operations_monthly_financial_report (
  report_instance_id uuid primary key default gen_random_uuid(),
  month date not null,
  revenue_by_department jsonb not null default '{}',
  expense_by_department jsonb not null default '{}',
  undistributed_expenses numeric(14,2) not null default 0,
  fixed_charges numeric(14,2) not null default 0,
  gop numeric(14,2) not null default 0,
  net_operating_income numeric(14,2) not null default 0,
  budget_variance jsonb not null default '{}',
  occupancy_for_month numeric(5,2) not null default 0,
  adr_for_month numeric(14,2) not null default 0,
  revpar_for_month numeric(14,2) not null default 0,
  goppar_for_month numeric(14,2) not null default 0,
  generated_at timestamptz not null default now(),
  source_snapshot_date date not null default current_date,
  unique(month)
);

-- Quarterly Financial Report: rollup of 3 monthly reports
create table if not exists operations_quarterly_financial_report (
  report_instance_id uuid primary key default gen_random_uuid(),
  quarter text not null unique,
  monthly_breakdown jsonb not null default '[]',
  quarter_total_revenue numeric(14,2) not null default 0,
  quarter_total_expense numeric(14,2) not null default 0,
  quarter_gop numeric(14,2) not null default 0,
  quarter_net_operating_income numeric(14,2) not null default 0,
  quarter_over_quarter_variance jsonb not null default '{}',
  quarter_budget_variance jsonb not null default '{}',
  average_occupancy numeric(5,2) not null default 0,
  average_adr numeric(14,2) not null default 0,
  average_revpar numeric(14,2) not null default 0,
  generated_at timestamptz not null default now()
);

-- Year-over-Year Report: comparison of same period across years
create table if not exists operations_yoy_report (
  report_instance_id uuid primary key default gen_random_uuid(),
  period_type text not null check (period_type in ('Month','Quarter','YTD')),
  current_period_label text not null,
  prior_period_label text not null,
  current_period_financials jsonb not null default '{}',
  prior_period_financials jsonb not null default '{}',
  variance_amount jsonb not null default '{}',
  variance_percent jsonb not null default '{}',
  occupancy_current_vs_prior jsonb not null default '{}',
  adr_current_vs_prior jsonb not null default '{}',
  revpar_current_vs_prior jsonb not null default '{}',
  commentary text,
  generated_at timestamptz not null default now()
);

-- Financial Report Schedule: recurring automated financial report generation
create table if not exists operations_financial_report_schedule (
  schedule_id uuid primary key default gen_random_uuid(),
  report_id uuid not null references operations_financial_report_definition(report_id) on delete cascade,
  recipient_list text[] not null default '{}',
  frequency text not null default 'Monthly' check (frequency in ('Monthly','Quarterly','Annual')),
  format text not null default 'PDF' check (format in ('PDF','Excel')),
  is_active boolean not null default true,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_ops_fin_monthly_month on operations_monthly_financial_report(month);
create index if not exists idx_ops_fin_quarterly_quarter on operations_quarterly_financial_report(quarter);
create index if not exists idx_ops_fin_yoy_period_type on operations_yoy_report(period_type);
create index if not exists idx_ops_fin_yoy_generated_at on operations_yoy_report(generated_at desc);
create index if not exists idx_ops_fin_schedule_report_id on operations_financial_report_schedule(report_id);
create index if not exists idx_ops_fin_schedule_active on operations_financial_report_schedule(is_active);
create index if not exists idx_ops_fin_def_type on operations_financial_report_definition(type);

-- Enable RLS
alter table operations_financial_report_definition enable row level security;
alter table operations_monthly_financial_report enable row level security;
alter table operations_quarterly_financial_report enable row level security;
alter table operations_yoy_report enable row level security;
alter table operations_financial_report_schedule enable row level security;

-- RLS Policies: authenticated users can read; operations managers/admins/exec can write
drop policy if exists "ops_fin_def_read" on operations_financial_report_definition;
create policy "ops_fin_def_read" on operations_financial_report_definition
  for select to authenticated using (true);

drop policy if exists "ops_fin_def_write" on operations_financial_report_definition;
create policy "ops_fin_def_write" on operations_financial_report_definition
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_fin_monthly_read" on operations_monthly_financial_report;
create policy "ops_fin_monthly_read" on operations_monthly_financial_report
  for select to authenticated using (true);

drop policy if exists "ops_fin_monthly_write" on operations_monthly_financial_report;
create policy "ops_fin_monthly_write" on operations_monthly_financial_report
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_fin_quarterly_read" on operations_quarterly_financial_report;
create policy "ops_fin_quarterly_read" on operations_quarterly_financial_report
  for select to authenticated using (true);

drop policy if exists "ops_fin_quarterly_write" on operations_quarterly_financial_report;
create policy "ops_fin_quarterly_write" on operations_quarterly_financial_report
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_fin_yoy_read" on operations_yoy_report;
create policy "ops_fin_yoy_read" on operations_yoy_report
  for select to authenticated using (true);

drop policy if exists "ops_fin_yoy_write" on operations_yoy_report;
create policy "ops_fin_yoy_write" on operations_yoy_report
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

drop policy if exists "ops_fin_schedule_read" on operations_financial_report_schedule;
create policy "ops_fin_schedule_read" on operations_financial_report_schedule
  for select to authenticated using (true);

drop policy if exists "ops_fin_schedule_write" on operations_financial_report_schedule;
create policy "ops_fin_schedule_write" on operations_financial_report_schedule
  for all to authenticated using (
    exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid()::text and r.name in ('Operations Manager','General Manager','Duty Manager','System Administrator','Executive'))
  );

-- Seed financial report definitions
insert into operations_financial_report_definition (name, type, department_scope, includes_budget_comparison, includes_prior_period_comparison, output_formats)
values
  ('Monthly P&L Summary', 'Monthly', 'AllDepartments', true, false, '{PDF,Excel}'),
  ('Quarterly Financial Rollup', 'Quarterly', 'AllDepartments', true, true, '{PDF,Excel}'),
  ('Year-over-Year Comparison', 'YearOverYear', 'AllDepartments', false, true, '{PDF,Excel}'),
  ('Rooms Department Monthly', 'Monthly', 'RoomsOnly', true, false, '{PDF,Excel}'),
  ('F&B Department Monthly', 'Monthly', 'FandBOnly', true, false, '{PDF,Excel}')
on conflict (report_id) do nothing;

-- END: 099_operations_financial_reports.sql

-- =========================================================================
-- Migration: 100_rls_policies_comprehensive.sql
-- =========================================================================
-- ============================================================
-- 100_rls_policies_comprehensive.sql
-- Comprehensive Row Level Security (RLS) on all public tables
-- 
-- Closes critical security vulnerability where the anon key could
-- read/write system_users, roles, permissions, global_settings,
-- reservations, folios, and all operational tables.
-- ============================================================

-- ============================================================
-- Step 1: Drop ALL existing policies on ALL public tables
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname 
    FROM pg_policies WHERE schemaname = 'public' 
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- Step 2: Enable RLS on ALL tables in public schema
-- (including the 21 tables that currently lack RLS)
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- Step 3: Create comprehensive RLS policies
-- ============================================================

-- 3a: Public read-only tables (anon SELECT only)
-- These are tables the public booking portal needs to display
-- room types, rates, packages, seasons, and guest services.

CREATE POLICY "anon_select_rooms" ON public.rooms 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_room_types" ON public.room_types 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_rate_plans" ON public.rate_plans 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_packages" ON public.packages 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_seasons" ON public.seasons 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_guest_services" ON public.guest_services 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_yield_policies" ON public.yield_policies 
  FOR SELECT TO anon USING (true);

-- CMS / public website content
CREATE POLICY "anon_select_pages_published" ON public.pages 
  FOR SELECT TO anon USING (status = 'published');

CREATE POLICY "anon_select_blocks_published" ON public.blocks 
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.id = blocks.page_id 
        AND pages.status = 'published'
    )
  );

CREATE POLICY "anon_select_page_versions_published" ON public.page_versions 
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.published_version_id = page_versions.id 
        AND pages.status = 'published'
    )
  );

CREATE POLICY "anon_select_block_templates" ON public.block_templates 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_policy_metadata" ON public.policy_page_metadata 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_legal_templates" ON public.legal_page_templates 
  FOR SELECT TO anon USING (true);

-- Testimonials: public can read approved only
CREATE POLICY "anon_select_testimonials_approved" ON public.public_testimonials 
  FOR SELECT TO anon USING (status = 'approved');

-- 3b: Public insert-only tables (anon can INSERT, no SELECT)
-- These support the public booking portal's write operations.

-- Reservations: public can create bookings
CREATE POLICY "anon_insert_reservations" ON public.reservations 
  FOR INSERT TO anon WITH CHECK (true);

-- Guests: public booking creates guest records
CREATE POLICY "anon_insert_guests" ON public.guests 
  FOR INSERT TO anon WITH CHECK (true);

-- Airport shuttle requests: public can submit
CREATE POLICY "anon_insert_shuttle_requests" ON public.airport_shuttle_requests 
  FOR INSERT TO anon WITH CHECK (true);

-- Testimonials: public can submit (pending review)
CREATE POLICY "anon_insert_testimonials" ON public.public_testimonials 
  FOR INSERT TO anon WITH CHECK (true);

-- Payment idempotency: public payment flow needs insert + select
CREATE POLICY "anon_insert_payment_idempotency" ON public.payment_idempotency 
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_payment_idempotency" ON public.payment_idempotency 
  FOR SELECT TO anon USING (true);

-- Payment receipts: public payment confirmation
CREATE POLICY "anon_insert_payment_receipts" ON public.payment_receipts 
  FOR INSERT TO anon WITH CHECK (true);

-- Guest communications: public can submit messages
CREATE POLICY "anon_insert_guest_communications" ON public.guest_communications 
  FOR INSERT TO anon WITH CHECK (true);

-- Guest feedbacks: public can submit feedback
CREATE POLICY "anon_insert_guest_feedbacks" ON public.guest_feedbacks 
  FOR INSERT TO anon WITH CHECK (true);

-- ID documents: public booking can submit ID docs
CREATE POLICY "anon_insert_id_documents" ON public.id_documents 
  FOR INSERT TO anon WITH CHECK (true);

-- Document verifications: public booking flow
CREATE POLICY "anon_insert_document_verifications" ON public.document_verifications 
  FOR INSERT TO anon WITH CHECK (true);

-- 3c: Authenticated role gets full access to ALL operational tables
-- This covers staff users who authenticate via Supabase Auth.
-- (The Express server uses the service_role key which bypasses RLS entirely.)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  LOOP
    EXECUTE format(
      'CREATE POLICY "authenticated_all_%s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      r.tablename, r.tablename
    );
  END LOOP;
END $$;

-- ============================================================
-- Step 4: Sensitive tables â€” anon gets NO access at all
-- ============================================================
-- The following tables have NO anon policies created above,
-- which means anon gets no access (RLS enabled + no policy = denied):
--   system_users, roles, permissions, role_permissions, user_roles,
--   global_settings, audit_events, custom_roles, user_sessions,
--   pending_admin_changes, risk_compliance, audit_logs, audit_exceptions,
--   void_audit_log, business_dates, fiscal_periods, posting_rules,
--   folios, folio_lines, folio_payments, invoice_documents,
--   chart_of_accounts, journal_entries, journal_lines, journal_batches,
--   sales_transactions, expense_requests, fee_components,
--   inventory_items, inventory_stores, inventory_suppliers,
--   inventory_requisitions, inventory_stock_movements, inventory_grns,
--   group_bookings, group_profiles, guest_group_relationships, group_audit_log,
--   corporate_accounts, tour_operators, allotments, allotment_pickup_log,
--   operator_contracts, vouchers, ar_ledger,
--   bank_accounts, tax_codes, usali_chart_of_accounts, usali_item_mappings,
--   ap_vendors, ap_bills, ap_bill_lines, ap_payments,
--   ar_customers, ar_invoices, ar_invoice_lines,
--   fixed_asset_depreciation, budgets, period_close,
--   notifications, dispatched_emails,
--   metric_definitions, reporting_snapshots, metric_history,
--   alert_rules, alert_instances, dashboard_views, drill_down_links,
--   forecast_entries, report_schedules, report_versions, historical_stats,
--   operations_report_definition, operations_generated_report,
--   operations_report_schedule, operations_report_archive,
--   operations_financial_report_definition, operations_monthly_financial_report,
--   operations_quarterly_financial_report, operations_yoy_report,
--   operations_financial_report_schedule,
--   media_assets, page_audit_log, page_preview_links, legal_review_records,
--   gift_shop_sales, gift_shop_issues,
--   vendors, bank_statement_lines, reconciliation_batches,
--   fixed_assets, depreciation_schedules, accounting_periods,
--   outlets, ingredients, menu_items, recipes, recipe_lines,
--   stock_locations, stock_transactions, requisitions, requisition_lines,
--   orders, order_lines, banquet_events, wastage_logs,
--   stock_counts, stock_count_lines

-- ============================================================
-- Step 5: audit_events â€” append-only
-- Revoke UPDATE and DELETE from anon and authenticated roles
-- ============================================================
REVOKE UPDATE, DELETE ON public.audit_events FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.audit_logs FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.void_audit_log FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.group_audit_log FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.page_audit_log FROM anon, authenticated;

-- ============================================================
-- Step 6: Grant base table privileges
-- Ensure anon can SELECT/INSERT on tables with public policies,
-- and authenticated can do everything on operational tables.
-- ============================================================
-- Grant anon the minimum needed
GRANT SELECT ON public.rooms, public.room_types, public.rate_plans, 
  public.packages, public.seasons, public.guest_services, public.yield_policies,
  public.pages, public.blocks, public.page_versions, public.block_templates,
  public.policy_page_metadata, public.legal_page_templates, public.public_testimonials
  TO anon;

GRANT INSERT ON public.reservations, public.guests, public.airport_shuttle_requests,
  public.public_testimonials, public.payment_idempotency, public.payment_receipts,
  public.guest_communications, public.guest_feedbacks, public.id_documents,
  public.document_verifications
  TO anon;

GRANT SELECT ON public.payment_idempotency TO anon;

-- Authenticated gets full DML on all public tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- Verification (run manually to check):
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT tablename, policyname, roles, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
-- ============================================================

-- END: 100_rls_policies_comprehensive.sql

-- =========================================================================
-- Migration: 101_auth_security_columns.sql
-- =========================================================================
-- ============================================================
-- 101_auth_security_columns.sql
-- Add missing auth security columns and MFA secrets table
-- ============================================================

-- Add failed_mfa_count for MFA lockout after 5 failures
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS failed_mfa_count INTEGER DEFAULT 0;

-- Add mfa_locked_until for MFA lockout duration
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS mfa_locked_until TIMESTAMPTZ;

-- Add mfa_secret_encrypted (alternative to plaintext mfa_secret)
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS mfa_secret_encrypted TEXT;

-- Create mfa_secrets table for per-device MFA secrets
CREATE TABLE IF NOT EXISTS mfa_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES system_users(id) ON DELETE CASCADE,
  secret_encrypted TEXT NOT NULL,
  backup_codes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS and authenticated policy already created by migration 100_rls_policies_comprehensive.sql
-- which enables RLS and creates authenticated_all_* policies on ALL public tables.
-- Just ensure grants are in place.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mfa_secrets TO authenticated;

-- END: 101_auth_security_columns.sql

-- =========================================================================
-- Migration: 102_encrypt_existing_secrets.sql
-- =========================================================================
-- ============================================================
-- 102_encrypt_existing_secrets.sql
-- Add encrypted_api_integrations column and migrate plaintext secrets
-- ============================================================

ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS encrypted_api_integrations JSONB;

-- Copy existing plaintext api_integrations to encrypted_api_integrations
UPDATE global_settings 
SET encrypted_api_integrations = api_integrations 
WHERE api_integrations IS NOT NULL 
  AND api_integrations != '[]'::jsonb
  AND encrypted_api_integrations IS NULL;

-- Set plaintext column to empty array (was NOT NULL with default '[]')
UPDATE global_settings 
SET api_integrations = '[]'::jsonb 
WHERE encrypted_api_integrations IS NOT NULL 
  AND encrypted_api_integrations != '[]'::jsonb;

-- Drop NOT NULL constraint so app layer can manage it
ALTER TABLE global_settings ALTER COLUMN api_integrations DROP NOT NULL;

-- END: 102_encrypt_existing_secrets.sql

-- =========================================================================
-- Migration: 103_session_timeout_columns.sql
-- =========================================================================
-- ============================================================
-- 103_session_timeout_columns.sql
-- Add session activity tracking and concurrent session limit
-- ============================================================

-- Add last_activity to user_sessions for idle timeout tracking
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT now();

-- Add max_concurrent_sessions to global_settings
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS max_concurrent_sessions INTEGER DEFAULT 3;

-- END: 103_session_timeout_columns.sql

-- =========================================================================
-- Migration: 104_deprecate_jsonb_ledger.sql
-- =========================================================================
-- ============================================================
-- 104_deprecate_jsonb_ledger.sql
-- Mark JSONB charges/payments as deprecated; add ledger_migrated flag
-- ============================================================

-- Add migration tracking column
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS ledger_migrated BOOLEAN DEFAULT false;

-- Backfill: set ledger_migrated = true for reservations that have folios
-- (their charges are already in folio_lines)
UPDATE reservations r
SET ledger_migrated = true
WHERE EXISTS (
  SELECT 1 FROM folios f WHERE f.reservation_id = r.id
)
AND r.ledger_migrated = false;

-- Add deprecation comments on the legacy JSONB columns
COMMENT ON COLUMN reservations.charges IS 'DEPRECATED: Use folio_lines via GET /api/reservations/:id/folio instead. Kept for backward compatibility during migration.';
COMMENT ON COLUMN reservations.payments IS 'DEPRECATED: Use folio_payments via GET /api/reservations/:id/folio instead. Kept for backward compatibility during migration.';

-- END: 104_deprecate_jsonb_ledger.sql

-- =========================================================================
-- Migration: 105_unified_billing_rpc.sql
-- =========================================================================
-- ============================================================
-- Migration 105: Unified Billing RPC
-- Step 2.2 â€” Single Billing RPC
--
-- Creates get_reservation_billing(p_reservation_id) that reads
-- actual folio_lines + folio_payments from the database and returns
-- a canonical billing breakdown. This replaces the frontend
-- calculateFolioComponents() function and the existing
-- calculate_billing_breakdown() which only used reservations.total_amount.
--
-- Also adds p_discount_percent to post_folio_charge so discounts
-- can be applied at charge-posting time.
-- ============================================================

-- ============================================================
-- Part 1: get_reservation_billing â€” canonical billing read RPC
-- ============================================================
create or replace function get_reservation_billing(
  p_reservation_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation record;
  v_folio_ids text[];
  v_base_charges numeric := 0.0;
  v_service_charges numeric := 0.0;
  v_tax_charges numeric := 0.0;
  v_extra_charges numeric := 0.0;
  v_total_charges numeric := 0.0;
  v_total_payments numeric := 0.0;
  v_balance numeric := 0.0;
  v_discount_percent numeric := 0.0;
  v_discount_amount numeric := 0.0;
  v_lines jsonb := '[]'::jsonb;
  v_payments jsonb := '[]'::jsonb;
  v_line record;
  v_pay record;
begin
  -- Get reservation
  select id, discount_percent, total_amount
  into v_reservation
  from reservations
  where id = p_reservation_id;

  if v_reservation is null then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  v_discount_percent := coalesce(v_reservation.discount_percent, 0.0);

  -- Get folio IDs for this reservation
  select array_agg(id) into v_folio_ids
  from folios
  where reservation_id = p_reservation_id;

  if v_folio_ids is null or array_length(v_folio_ids, 1) = 0 then
    return jsonb_build_object(
      'success', true,
      'reservation_id', p_reservation_id,
      'subtotal', 0.0,
      'discount_percent', v_discount_percent,
      'discount_amount', 0.0,
      'service_charges', 0.0,
      'tax_amount', 0.0,
      'extra_charges', 0.0,
      'total_charges', 0.0,
      'total_payments', 0.0,
      'balance', 0.0,
      'lines', '[]'::jsonb,
      'payments', '[]'::jsonb
    );
  end if;

  -- Aggregate charges by line_type from folio_lines (non-voided)
  for v_line in
    select
      id,
      folio_id,
      line_number,
      transaction_date,
      description,
      amount,
      quantity,
      unit_price,
      line_type,
      target_folio,
      revenue_account_code,
      source_module,
      source_reference,
      is_voided,
      created_at
    from folio_lines
    where folio_id = any(v_folio_ids)
    and is_voided = false
    order by line_number asc
  loop
    v_lines := v_lines || jsonb_build_object(
      'id', v_line.id,
      'folioId', v_line.folio_id,
      'lineNumber', v_line.line_number,
      'transactionDate', to_char(v_line.transaction_date, 'YYYY-MM-DD'),
      'description', v_line.description,
      'amount', v_line.amount,
      'quantity', v_line.quantity,
      'unitPrice', v_line.unit_price,
      'lineType', v_line.line_type,
      'targetFolio', v_line.target_folio,
      'revenueAccountCode', v_line.revenue_account_code,
      'sourceModule', v_line.source_module,
      'sourceReference', v_line.source_reference,
      'isVoided', v_line.is_voided,
      'createdAt', to_char(v_line.created_at, 'YYYY-MM-DD"T"HH24:MI:SS')
    );

    -- Categorize by line_type
    if v_line.line_type = 'Tax' then
      v_tax_charges := v_tax_charges + v_line.amount;
    elsif v_line.line_type = 'ServiceCharge' then
      v_service_charges := v_service_charges + v_line.amount;
    elsif v_line.line_type = 'Discount' then
      v_discount_amount := v_discount_amount + abs(v_line.amount);
    else
      v_base_charges := v_base_charges + v_line.amount;
    end if;
  end loop;

  v_total_charges := v_base_charges + v_service_charges + v_tax_charges + v_extra_charges;

  -- Aggregate payments from folio_payments (non-voided)
  for v_pay in
    select
      id,
      folio_id,
      payment_date,
      amount,
      payment_method,
      payment_sub_type,
      reference_number,
      card_last_four,
      is_voided,
      is_refund,
      target_folio,
      notes,
      created_at
    from folio_payments
    where folio_id = any(v_folio_ids)
    and is_voided = false
    order by payment_date asc
  loop
    v_payments := v_payments || jsonb_build_object(
      'id', v_pay.id,
      'folioId', v_pay.folio_id,
      'paymentDate', to_char(v_pay.payment_date, 'YYYY-MM-DD"T"HH24:MI:SS'),
      'amount', v_pay.amount,
      'paymentMethod', v_pay.payment_method,
      'paymentSubType', v_pay.payment_sub_type,
      'referenceNumber', v_pay.reference_number,
      'cardLastFour', v_pay.card_last_four,
      'isVoided', v_pay.is_voided,
      'isRefund', v_pay.is_refund,
      'targetFolio', v_pay.target_folio,
      'notes', v_pay.notes,
      'createdAt', to_char(v_pay.created_at, 'YYYY-MM-DD"T"HH24:MI:SS')
    );

    v_total_payments := v_total_payments + v_pay.amount;
  end loop;

  v_balance := v_total_charges - v_total_payments;

  return jsonb_build_object(
    'success', true,
    'reservation_id', p_reservation_id,
    'subtotal', round(v_base_charges, 2),
    'discount_percent', v_discount_percent,
    'discount_amount', round(v_discount_amount, 2),
    'service_charges', round(v_service_charges, 2),
    'tax_amount', round(v_tax_charges, 2),
    'extra_charges', round(v_extra_charges, 2),
    'total_charges', round(v_total_charges, 2),
    'total_payments', round(v_total_payments, 2),
    'balance', round(v_balance, 2),
    'lines', v_lines,
    'payments', v_payments
  );
end;
$$;

grant execute on function get_reservation_billing(text) to authenticated;
grant execute on function get_reservation_billing(text) to anon;

-- ============================================================
-- Part 2: Add p_discount_percent to post_folio_charge
-- ============================================================

-- Drop all existing versions of post_folio_charge
do $$
declare
  func_record record;
begin
  for func_record in
    select oid from pg_proc where proname = 'post_folio_charge'
  loop
    execute 'drop function if exists ' || func_record.oid::regprocedure || ' cascade';
  end loop;
end $$;

create or replace function post_folio_charge(
  p_folio_id text,
  p_description text,
  p_amount numeric,
  p_quantity numeric,
  p_line_type text,
  p_revenue_account_code text,
  p_user_id text,
  p_source_reference text default null,
  p_discount_percent numeric default 0.0
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_next_line integer;
  v_business_date date;
  v_now timestamp with time zone := now();
  v_base_amount numeric := p_amount;
  v_discounted_amount numeric;
  v_discount_amount numeric := 0.0;
  v_base_line_id text := gen_random_uuid()::text;
  v_fee record;
  v_fee_amount numeric;
  v_total_fees numeric := 0.00;
  v_tax_amount numeric := 0.00;
  v_non_vat_fees numeric := 0.00;
  v_vat_name text := '';
  v_vat_rate numeric := 0;
  v_vat_account text := '';
  v_sc_total numeric := 0.00;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  if v_folio.status != 'Open' then
    return jsonb_build_object('success', false, 'error', 'Folio is not open');
  end if;

  -- Get next line number
  select coalesce(max(line_number), 0) + 1 into v_next_line
  from folio_lines
  where folio_id = p_folio_id;

  -- Apply discount if provided
  if p_discount_percent > 0 then
    v_discount_amount := round(v_base_amount * p_discount_percent / 100, 2);
    v_discounted_amount := v_base_amount - v_discount_amount;
  else
    v_discounted_amount := v_base_amount;
  end if;

  -- Insert base charge line (using discounted amount)
  insert into folio_lines (
    id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
    line_type, target_folio, revenue_account_code, source_module, source_reference, created_by
  ) values (
    v_base_line_id, p_folio_id, v_next_line, v_business_date,
    p_description, v_discounted_amount, p_quantity,
    case when p_quantity > 0 then round(v_discounted_amount / p_quantity, 2) else v_discounted_amount end,
    p_line_type, v_folio.target_folio, p_revenue_account_code, 'frontoffice', p_source_reference, p_user_id
  );

  -- Insert discount line if discount applied
  if v_discount_amount > 0 then
    v_next_line := v_next_line + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
      'Discount @ ' || p_discount_percent || '% on ' || p_description,
      -v_discount_amount, 1, -v_discount_amount,
      'Discount', v_folio.target_folio, null, 'frontoffice', p_user_id
    );
  end if;

  -- Phase 1: Calculate non-VAT fees on discounted amount, insert lines
  for v_fee in
    select
      (elem->>'name')::text as name,
      (elem->>'feeType')::text as fee_type,
      (elem->>'value')::numeric as value,
      (elem->>'accountCode')::text as account_code
    from global_settings, jsonb_array_elements(fee_components) as elem
    where global_settings.id = 'main'
    and (elem->>'isEnabled')::boolean = true
    and lower((elem->>'name')::text) not like '%vat%'
    and lower((elem->>'name')::text) not like '%tax%'
    order by (elem->>'displayOrder')::int asc
  loop
    v_next_line := v_next_line + 1;
    if v_fee.fee_type = 'percentage' then
      v_fee_amount := round(v_discounted_amount * v_fee.value / 100, 2);
    else
      v_fee_amount := v_fee.value;
    end if;
    v_non_vat_fees := v_non_vat_fees + v_fee_amount;

    if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
      v_sc_total := v_sc_total + v_fee_amount;
    end if;

    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
      v_fee.name || case when v_fee.fee_type = 'percentage' then ' @ ' || v_fee.value || '% on ' || p_description else ' (Fixed) on ' || p_description end,
      v_fee_amount, 1, v_fee_amount,
      case
        when lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then 'ServiceCharge'
        else 'Extra'
      end,
      v_folio.target_folio,
      coalesce(v_fee.account_code, (select code from chart_of_accounts where name ilike '%miscellaneous%' limit 1)),
      'frontoffice', p_user_id
    );
  end loop;

  -- Phase 2: Calculate VAT on (discounted amount + non-VAT fees), insert last
  select
    (elem->>'name')::text,
    (elem->>'value')::numeric,
    (elem->>'accountCode')::text
  into v_vat_name, v_vat_rate, v_vat_account
  from global_settings, jsonb_array_elements(fee_components) as elem
  where global_settings.id = 'main'
  and (elem->>'isEnabled')::boolean = true
  and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
  limit 1;

  if v_vat_name is not null and v_vat_rate > 0 then
    v_tax_amount := round((v_discounted_amount + v_non_vat_fees) * v_vat_rate / 100, 2);
    v_next_line := v_next_line + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
      v_vat_name || ' @ ' || v_vat_rate || '% on ' || p_description,
      v_tax_amount, 1, v_tax_amount, 'Tax',
      v_folio.target_folio,
      coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
      'frontoffice', p_user_id
    );
  end if;

  v_total_fees := v_non_vat_fees + v_tax_amount;

  -- Update folio balance
  update folios
  set balance = balance + v_discounted_amount + v_total_fees,
      total_charges = total_charges + v_discounted_amount + v_total_fees,
      tax_total = tax_total + v_tax_amount,
      service_charge_total = service_charge_total + v_sc_total,
      updated_at = v_now
  where id = p_folio_id;

  -- Return success
  return jsonb_build_object(
    'success', true,
    'folioId', p_folio_id,
    'baseAmount', v_base_amount,
    'discountedAmount', v_discounted_amount,
    'discountAmount', v_discount_amount,
    'feesTotal', v_total_fees,
    'taxAmount', v_tax_amount,
    'serviceChargeTotal', v_sc_total
  );
end;
$$;

grant execute on function post_folio_charge(text, text, numeric, numeric, text, text, text, text, numeric) to authenticated;

-- END: 105_unified_billing_rpc.sql

-- =========================================================================
-- Migration: 106_normalize_room_entity.sql
-- =========================================================================
-- Normalize Room Entity Migration
-- Sets room_type_id as NOT NULL with FK constraint, deprecates type column
-- This is Step 2.4 of the remediation roadmap

-- Step 1: Ensure all rooms have room_type_id populated
-- First, try to match by existing type field to room_types.name
update rooms
set room_type_id = (
  select id from room_types
  where lower(name) = lower(rooms.type)
  limit 1
)
where room_type_id is null and type is not null;

-- Step 2: For any remaining NULL room_type_id, assign a default (rt_double)
update rooms
set room_type_id = 'rt_double'
where room_type_id is null;

-- Step 3: Add NOT NULL constraint to room_type_id
alter table rooms
alter column room_type_id set not null;

-- Step 4: Add FK constraint (it already exists from migration 029, but ensure it's properly set)
-- Drop existing FK if it exists to recreate with proper settings
alter table rooms
drop constraint if exists rooms_room_type_id_fkey;

alter table rooms
add constraint rooms_room_type_id_fkey
foreign key (room_type_id) references room_types(id) on delete restrict;

-- Step 5: Deprecate the type column
-- Add comment indicating it's deprecated
comment on column rooms.type is 'DEPRECATED: Use room_type_id foreign key instead. This column will be removed in a future migration.';

-- Step 6: Create a function to get room type name (for backward compatibility)
-- This can be used in views or queries that need the type name
create or replace function get_room_type_name(p_room_id text)
returns text
language sql
stable
as $$
  select rt.name
  from rooms r
  join room_types rt on r.room_type_id = rt.id
  where r.id = p_room_id;
$$;

-- Step 7: Create a view that includes the type name for backward compatibility
-- This allows legacy queries to continue working while we transition
create or replace view rooms_with_type_name as
select
  r.*,
  rt.name as type_name,
  rt.description as type_description,
  rt.base_price as type_base_price,
  rt.max_occupancy as type_max_occupancy,
  rt.bed_configuration as type_bed_configuration,
  rt.room_size_sqft as type_room_size_sqft,
  rt.amenities as type_amenities,
  rt.image_url_1 as type_image_url_1,
  rt.image_url_2 as type_image_url_2,
  rt.image_url_3 as type_image_url_3,
  rt.is_active as type_is_active,
  rt.display_order as type_display_order
from rooms r
join room_types rt on r.room_type_id = rt.id;

-- Add comment for documentation
comment on view rooms_with_type_name is 'Backward-compatible view that includes room type details joined from room_types table. Use this for queries that need type name without explicit joins.';

-- END: 106_normalize_room_entity.sql

-- =========================================================================
-- Migration: 107_settings_versioning.sql
-- =========================================================================
-- Settings Version & Checksum Migration
-- Adds version tracking and checksum validation to global_settings
-- This is Step 2.5 of the remediation roadmap

-- Step 1: Add version and checksum columns to global_settings
alter table global_settings
add column if not exists settings_version integer not null default 1;

alter table global_settings
add column if not exists settings_checksum text;

-- Step 2: Initialize checksum for existing settings
-- Compute MD5 checksum of the entire row (excluding version/checksum columns themselves)
-- Uses to_jsonb(gs) minus the version/checksum keys for a schema-agnostic approach
update global_settings gs
set settings_checksum = (
  encode(
    digest(
      (
        select (to_jsonb(gs) - 'settings_version' - 'settings_checksum')::text
      ),
      'md5'
    ),
    'hex'
  )
)
where settings_checksum is null;

-- Step 3: Create function to increment version and update checksum
create or replace function update_settings_version_and_checksum()
returns trigger
language plpgsql
security definer
as $$
declare
  v_checksum text;
begin
  -- Compute new checksum from the entire NEW row minus version/checksum columns
  select encode(
    digest(
      (
        select (to_jsonb(NEW) - 'settings_version' - 'settings_checksum')::text
      ),
      'md5'
    ),
    'hex'
  ) into v_checksum;

  -- Increment version if checksum changed
  if OLD.settings_checksum is null or OLD.settings_checksum != v_checksum then
    NEW.settings_version := OLD.settings_version + 1;
  end if;

  NEW.settings_checksum := v_checksum;
  return NEW;
end;
$$;

-- Step 4: Create trigger to auto-update version and checksum
drop trigger if exists global_settings_version_checksum_trigger on global_settings;
create trigger global_settings_version_checksum_trigger
before update on global_settings
for each row
execute function update_settings_version_and_checksum();

-- Step 5: Add comments for documentation
comment on column global_settings.settings_version is 'Auto-incremented version number for settings changes. Used by frontend to detect stale settings.';
comment on column global_settings.settings_checksum is 'MD5 checksum of settings values. Used to detect actual data changes.';
comment on function update_settings_version_and_checksum is 'Trigger function that auto-increments version and updates checksum when settings change.';

-- Step 6: Helper function to get table columns for dynamic schema queries
-- Used by server.ts to filter known columns without manual list maintenance
create or replace function get_table_columns(p_table_name text)
returns table (column_name text)
language sql
stable
as $$
  select column_name
  from information_schema.columns
  where table_name = lower(p_table_name)
    and table_schema = 'public'
  order by ordinal_position;
$$;

comment on function get_table_columns is 'Returns column names for a given table. Used for dynamic schema validation without manual column lists.';

-- END: 107_settings_versioning.sql

-- =========================================================================
-- Migration: 108_link_hr_to_system_users.sql
-- =========================================================================
-- Link HR Employees to System Users Migration
-- Adds FK between HR staff records and system_users
-- This is Step 2.6 of the remediation roadmap

-- Step 1: Create employees table (HR staff records)
create table if not exists employees (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text unique,
  phone text,
  department text,
  position text,
  status text not null default 'Active' check (status in ('Active', 'Inactive', 'On Leave', 'Terminated')),
  hire_date date,
  salary numeric default 0,
  avatar_initials text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on employees
alter table employees enable row level security;

-- Basic RLS policy: allow all for authenticated users
drop policy if exists employees_all_authenticated on employees;
create policy employees_all_authenticated on employees
  for all using (true) with check (true);

-- Step 2: Add linked_employee_id column to system_users
alter table system_users
add column if not exists linked_employee_id text references employees(id) on delete set null;

-- Step 3: Create index for faster queries
create index if not exists idx_system_users_linked_employee_id on system_users(linked_employee_id);

-- Step 4: Backfill linked_employee_id by matching email
-- Match system_users.email with employees.email
update system_users
set linked_employee_id = (
  select id from employees
  where lower(employees.email) = lower(system_users.email)
  limit 1
)
where linked_employee_id is null and email is not null;

-- Step 5: Add comment for documentation
comment on column system_users.linked_employee_id is 'Foreign key reference to employees table for HR staff records. Links login accounts to HR employee profiles.';

-- Step 6: Create function to auto-link employee on user creation
create or replace function link_employee_on_user_creation()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If linked_employee_id is not provided, try to match by email
  if NEW.linked_employee_id is null and NEW.email is not null then
    select id into NEW.linked_employee_id
    from employees
    where lower(email) = lower(NEW.email)
    limit 1;
  end if;
  return NEW;
end;
$$;

-- Step 7: Create trigger to auto-link on user creation
drop trigger if exists system_users_link_employee_trigger on system_users;
create trigger system_users_link_employee_trigger
before insert on system_users
for each row
execute function link_employee_on_user_creation();

comment on function link_employee_on_user_creation is 'Trigger function that auto-links system_users to employees by email when linked_employee_id is not provided.';

-- END: 108_link_hr_to_system_users.sql

-- =========================================================================
-- Migration: 109_audit_triggers.sql
-- =========================================================================
-- Audit Trail Triggers Migration
-- Creates DB triggers on operational tables to write to audit_events
-- This is Step 3.3 of the remediation roadmap

-- Step 1: Create helper function to set session variables for audit context
create or replace function set_audit_context(p_key text, p_value text)
returns void
language plpgsql
security definer
as $$
begin
  perform set_config(p_key, p_value, false);
end;
$$;

comment on function set_audit_context is 'Helper function to set session configuration variables. Used to set app.user_id for audit triggers.';

-- Step 2: Ensure audit_events table has all required columns
alter table audit_events
add column if not exists before_data jsonb,
add column if not exists after_data jsonb,
add column if not exists table_name text,
add column if not exists record_id text;

-- Step 2: Create generic audit trigger function
create or replace function audit_trigger_func()
returns trigger
language plpgsql
security definer
as $$
declare
  v_user_id text;
begin
  -- Get current user from session variable (set by middleware)
  v_user_id := current_setting('app.user_id', true);

  if TG_OP = 'DELETE' then
    insert into audit_events (user_id, action, table_name, record_id, before_data, after_data, created_at)
    values (
      v_user_id,
      'DELETE',
      TG_TABLE_NAME,
      OLD.id::text,
      to_jsonb(OLD),
      null,
      now()
    );
    return OLD;
  elsif TG_OP = 'UPDATE' then
    insert into audit_events (user_id, action, table_name, record_id, before_data, after_data, created_at)
    values (
      v_user_id,
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW),
      now()
    );
    return NEW;
  elsif TG_OP = 'INSERT' then
    insert into audit_events (user_id, action, table_name, record_id, before_data, after_data, created_at)
    values (
      v_user_id,
      'INSERT',
      TG_TABLE_NAME,
      NEW.id::text,
      null,
      to_jsonb(NEW),
      now()
    );
    return NEW;
  end if;
  return null;
end;
$$;

-- Step 3: Create audit triggers on operational tables

-- Reservations
drop trigger if exists audit_reservations_trigger on reservations;
create trigger audit_reservations_trigger
after insert or update or delete on reservations
for each row execute function audit_trigger_func();

-- Folios
drop trigger if exists audit_folios_trigger on folios;
create trigger audit_folios_trigger
after insert or update or delete on folios
for each row execute function audit_trigger_func();

-- Folio lines
drop trigger if exists audit_folio_lines_trigger on folio_lines;
create trigger audit_folio_lines_trigger
after insert or update or delete on folio_lines
for each row execute function audit_trigger_func();

-- Folio payments
drop trigger if exists audit_folio_payments_trigger on folio_payments;
create trigger audit_folio_payments_trigger
after insert or update or delete on folio_payments
for each row execute function audit_trigger_func();

-- Rooms
drop trigger if exists audit_rooms_trigger on rooms;
create trigger audit_rooms_trigger
after insert or update or delete on rooms
for each row execute function audit_trigger_func();

-- Guests
drop trigger if exists audit_guests_trigger on guests;
create trigger audit_guests_trigger
after insert or update or delete on guests
for each row execute function audit_trigger_func();

-- System users
drop trigger if exists audit_system_users_trigger on system_users;
create trigger audit_system_users_trigger
after insert or update or delete on system_users
for each row execute function audit_trigger_func();

-- Roles
drop trigger if exists audit_roles_trigger on roles;
create trigger audit_roles_trigger
after insert or update or delete on roles
for each row execute function audit_trigger_func();

-- Global settings
drop trigger if exists audit_global_settings_trigger on global_settings;
create trigger audit_global_settings_trigger
after insert or update or delete on global_settings
for each row execute function audit_trigger_func();

-- Inventory items
drop trigger if exists audit_inventory_items_trigger on inventory_items;
create trigger audit_inventory_items_trigger
after insert or update or delete on inventory_items
for each row execute function audit_trigger_func();

-- Room types
drop trigger if exists audit_room_types_trigger on room_types;
create trigger audit_room_types_trigger
after insert or update or delete on room_types
for each row execute function audit_trigger_func();

-- Rate plans
drop trigger if exists audit_rate_plans_trigger on rate_plans;
create trigger audit_rate_plans_trigger
after insert or update or delete on rate_plans
for each row execute function audit_trigger_func();

-- Packages
drop trigger if exists audit_packages_trigger on packages;
create trigger audit_packages_trigger
after insert or update or delete on packages
for each row execute function audit_trigger_func();

-- Employees
drop trigger if exists audit_employees_trigger on employees;
create trigger audit_employees_trigger
after insert or update or delete on employees
for each row execute function audit_trigger_func();

-- Tour operators
drop trigger if exists audit_tour_operators_trigger on tour_operators;
create trigger audit_tour_operators_trigger
after insert or update or delete on tour_operators
for each row execute function audit_trigger_func();

-- Allotments
drop trigger if exists audit_allotments_trigger on allotments;
create trigger audit_allotments_trigger
after insert or update or delete on allotments
for each row execute function audit_trigger_func();

-- Vouchers
drop trigger if exists audit_vouchers_trigger on vouchers;
create trigger audit_vouchers_trigger
after insert or update or delete on vouchers
for each row execute function audit_trigger_func();

-- Step 4: Add comments for documentation
comment on function audit_trigger_func is 'Generic audit trigger function that writes INSERT/UPDATE/DELETE events to audit_events table with before/after data.';
comment on column audit_events.before_data is 'JSONB representation of record state before the change (for UPDATE/DELETE).';
comment on column audit_events.after_data is 'JSONB representation of record state after the change (for INSERT/UPDATE).';
comment on column audit_events.table_name is 'Name of the table where the change occurred.';
comment on column audit_events.record_id is 'ID of the affected record.';

-- END: 109_audit_triggers.sql

-- =========================================================================
-- Migration: 109b_performance_indexes.sql
-- =========================================================================
-- Migration 109: Performance Indexes
-- Adds indexes to accelerate the most frequent query patterns:
--   - Reservation availability lookups (date-range overlap)
--   - Status-based filtering
--   - Group booking lookups
--   - Folio line/payment joins
--   - Room type + status filtering
--   - Audit event chronological ordering
--   - User email lookups (auth)

-- Reservation availability: overlap queries use check_in_date <= ? AND check_out_date >= ?
CREATE INDEX IF NOT EXISTS idx_reservations_date_range
  ON reservations (check_in_date, check_out_date);

-- Reservation status filtering (dashboard, check-in queue, etc.)
CREATE INDEX IF NOT EXISTS idx_reservations_status
  ON reservations (status);

-- Group booking membership lookups
CREATE INDEX IF NOT EXISTS idx_reservations_group_booking
  ON reservations (group_booking_id);

-- Folio lines joined by folio_id
CREATE INDEX IF NOT EXISTS idx_folio_lines_folio_id
  ON folio_lines (folio_id);

-- Folio payments joined by folio_id
CREATE INDEX IF NOT EXISTS idx_folio_payments_folio_id
  ON folio_payments (folio_id);

-- Room filtering by type + status (housekeeping board, availability)
CREATE INDEX IF NOT EXISTS idx_rooms_type_status
  ON rooms (room_type_id, status);

-- Audit events chronological ordering (newest first)
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at
  ON audit_events (created_at DESC);

-- System user email lookups (login, dedup)
CREATE INDEX IF NOT EXISTS idx_system_users_email
  ON system_users (email);

-- END: 109b_performance_indexes.sql

-- =========================================================================
-- Migration: 111_fn_recipe_costing_waste.sql
-- =========================================================================
-- Migration 111: F&B Recipe Costing, Weighted-Avg Inventory, Waste Tracking
-- Step 5.2 â€” F&B Module Completion

-- =============================================================
-- 1. Weighted-Average Cost trigger on inventory_grns (goods receipt)
--    Updates inventory_items.avg_cost when goods are received
-- =============================================================

CREATE OR REPLACE FUNCTION update_weighted_avg_cost()
RETURNS TRIGGER AS $$
DECLARE
  old_qty numeric;
  old_cost numeric;
  new_qty numeric;
  new_cost numeric;
BEGIN
  SELECT current_stock, avg_cost INTO old_qty, old_cost
  FROM inventory_items
  WHERE id = NEW.item_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Weighted average: (old_qty * old_cost + received_qty * unit_cost) / (old_qty + received_qty)
  new_qty := COALESCE(old_qty, 0) + COALESCE(NEW.quantity_received, 0);
  IF new_qty > 0 THEN
    new_cost := (COALESCE(old_qty, 0) * COALESCE(old_cost, 0) + COALESCE(NEW.quantity_received, 0) * COALESCE(NEW.unit_cost, 0)) / new_qty;
  ELSE
    new_cost := old_cost;
  END IF;

  UPDATE inventory_items
  SET avg_cost = new_cost,
      current_stock = new_qty,
      last_cost = COALESCE(NEW.unit_cost, old_cost),
      updated_at = now()
  WHERE id = NEW.item_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_weighted_avg_cost ON inventory_grns;
CREATE TRIGGER trg_update_weighted_avg_cost
  AFTER INSERT OR UPDATE ON inventory_grns
  FOR EACH ROW
  EXECUTE FUNCTION update_weighted_avg_cost();

-- =============================================================
-- 2. Recipe cost calculation function
--    Returns total cost and cost per portion for a recipe
-- =============================================================

CREATE OR REPLACE FUNCTION calculate_recipe_cost(p_recipe_id text)
RETURNS TABLE (
  total_cost numeric,
  portions integer,
  cost_per_portion numeric,
  menu_item_name text,
  selling_price numeric,
  food_cost_percent numeric
) AS $$
DECLARE
  v_portions integer;
  v_menu_item_name text;
  v_selling_price numeric;
BEGIN
  SELECT r.portions, mi.name, mi.selling_price
  INTO v_portions, v_menu_item_name, v_selling_price
  FROM recipes r
  LEFT JOIN menu_items mi ON r.menu_item_id = mi.id
  WHERE r.id = p_recipe_id;

  v_portions := COALESCE(v_portions, 1);

  RETURN QUERY
  SELECT
    COALESCE(SUM(rl.quantity * COALESCE(rl.cost_at_time_of_costing, i.current_cost, 0)), 0) AS total_cost,
    v_portions AS portions,
    CASE WHEN v_portions > 0 THEN COALESCE(SUM(rl.quantity * COALESCE(rl.cost_at_time_of_costing, i.current_cost, 0)), 0) / v_portions ELSE 0 END AS cost_per_portion,
    v_menu_item_name,
    COALESCE(v_selling_price, 0) AS selling_price,
    CASE WHEN COALESCE(v_selling_price, 0) > 0 AND v_portions > 0
      THEN (COALESCE(SUM(rl.quantity * COALESCE(rl.cost_at_time_of_costing, i.current_cost, 0)), 0) / v_portions) / v_selling_price * 100
      ELSE 0 END AS food_cost_percent
  FROM recipe_lines rl
  LEFT JOIN ingredients i ON rl.ingredient_id = i.id
  WHERE rl.recipe_id = p_recipe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- 3. Waste summary view for reporting
-- =============================================================

CREATE OR REPLACE VIEW waste_summary AS
SELECT
  w.ingredient_id,
  i.name AS ingredient_name,
  i.category,
  COUNT(*) AS waste_count,
  SUM(w.quantity) AS total_wasted,
  SUM(w.cost_value) AS total_cost_wasted,
  AVG(w.quantity) AS avg_waste_per_event
FROM wastage_logs w
LEFT JOIN ingredients i ON w.ingredient_id = i.id
GROUP BY w.ingredient_id, i.name, i.category
ORDER BY total_cost_wasted DESC;

-- =============================================================
-- 4. Add AV requirements and billing instructions to banquet_events
-- =============================================================

ALTER TABLE banquet_events
  ADD COLUMN IF NOT EXISTS av_requirements text,
  ADD COLUMN IF NOT EXISTS billing_instructions text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS event_start_time text,
  ADD COLUMN IF NOT EXISTS event_end_time text,
  ADD COLUMN IF NOT EXISTS function_room text;

-- END: 111_fn_recipe_costing_waste.sql

-- =========================================================================
-- Migration: 114_maintenance_pm_schedules.sql
-- =========================================================================
-- Migration 114: Maintenance & Engineering â€” PM Schedules, Work Orders, Spare Parts
-- Step 5.5 â€” Maintenance & Engineering Completion

-- =============================================================
-- 1. PM Schedules table
--    Recurring preventive maintenance schedules per asset
-- =============================================================

CREATE TABLE IF NOT EXISTS public.pm_schedules (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  schedule_name text NOT NULL,
  asset_id text REFERENCES public.fixed_assets(id) ON DELETE SET NULL,
  frequency text NOT NULL DEFAULT 'Monthly',
  interval_days integer DEFAULT 30,
  next_due_date date NOT NULL,
  last_completed_date date,
  checklist_template jsonb DEFAULT '[]'::jsonb,
  assigned_technician text,
  priority text DEFAULT 'Medium',
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 2. Work Orders table
--    Auto-generated from PM schedules or manually created
-- =============================================================

CREATE TABLE IF NOT EXISTS public.work_orders (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  wo_number text,
  pm_schedule_id text REFERENCES public.pm_schedules(id) ON DELETE SET NULL,
  asset_id text REFERENCES public.fixed_assets(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  type text DEFAULT 'Preventive',
  priority text DEFAULT 'Medium',
  status text DEFAULT 'Open',
  assigned_to text,
  room_number text,
  checklist jsonb DEFAULT '[]'::jsonb,
  completed_checklist jsonb DEFAULT '[]'::jsonb,
  spare_parts_used jsonb DEFAULT '[]'::jsonb,
  labor_hours numeric DEFAULT 0,
  cost_estimate numeric DEFAULT 0,
  actual_cost numeric DEFAULT 0,
  created_date timestamptz DEFAULT now(),
  scheduled_date date,
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_by text
);

-- =============================================================
-- 3. Spare Parts table
--    Inventory of spare parts with min/max reorder levels
-- =============================================================

CREATE TABLE IF NOT EXISTS public.spare_parts (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  part_number text,
  part_name text NOT NULL,
  category text,
  manufacturer text,
  compatible_assets jsonb DEFAULT '[]'::jsonb,
  unit text DEFAULT 'pcs',
  min_stock integer DEFAULT 5,
  max_stock integer DEFAULT 50,
  current_stock integer DEFAULT 0,
  unit_cost numeric DEFAULT 0,
  location text,
  reorder_qty integer DEFAULT 10,
  last_reorder_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 4. Auto-generate PM work orders function
--    Scans all active PM schedules due on or before p_date
--    and creates work orders for each
-- =============================================================

CREATE OR REPLACE FUNCTION public.generate_pm_work_orders(p_date date DEFAULT CURRENT_DATE)
RETURNS TABLE(wo_id text, wo_number text, schedule_name text) AS $$
DECLARE
  v_schedule record;
  v_wo_id text;
  v_wo_number text;
BEGIN
  FOR v_schedule IN
    SELECT * FROM pm_schedules
    WHERE status = 'Active' AND next_due_date <= p_date
  LOOP
    v_wo_id := gen_random_uuid()::text;
    v_wo_number := 'WO-PM-' || to_char(p_date, 'YYYYMMDD') || '-' || SUBSTRING(v_schedule.id FROM 1 FOR 4);

    INSERT INTO work_orders (id, wo_number, pm_schedule_id, asset_id, title, description, type, priority, status, assigned_to, scheduled_date, checklist, created_by, created_date)
    VALUES (
      v_wo_id, v_wo_number, v_schedule.id, v_schedule.asset_id,
      'PM: ' || v_schedule.schedule_name,
      'Preventive maintenance auto-generated from schedule',
      'Preventive', v_schedule.priority, 'Open', v_schedule.assigned_technician,
      p_date, v_schedule.checklist_template, 'system', now()
    );

    UPDATE pm_schedules
      SET next_due_date = p_date + (v_schedule.interval_days || ' days')::interval,
          last_completed_date = p_date
      WHERE id = v_schedule.id;

    RETURN QUERY SELECT v_wo_id, v_wo_number, v_schedule.schedule_name;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- 5. updated_at triggers
-- =============================================================

DROP TRIGGER IF EXISTS trg_pm_schedules_updated_at ON public.pm_schedules;
CREATE TRIGGER trg_pm_schedules_updated_at
  BEFORE UPDATE ON public.pm_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_spare_parts_updated_at ON public.spare_parts;
CREATE TRIGGER trg_spare_parts_updated_at
  BEFORE UPDATE ON public.spare_parts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- 6. Performance indexes
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_pm_schedules_asset_id ON public.pm_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_status ON public.pm_schedules(status);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_next_due ON public.pm_schedules(next_due_date);

CREATE INDEX IF NOT EXISTS idx_work_orders_pm_schedule_id ON public.work_orders(pm_schedule_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_asset_id ON public.work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_scheduled_date ON public.work_orders(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_spare_parts_part_number ON public.spare_parts(part_number);
CREATE INDEX IF NOT EXISTS idx_spare_parts_category ON public.spare_parts(category);

-- END: 114_maintenance_pm_schedules.sql

-- =========================================================================
-- Migration: 115_sales_events_tables.sql
-- =========================================================================
-- Migration 115: Sales & Events â€” Corporate Accounts, Leads, Proposals, Contracts, Group Blocks
-- Step 5.6 â€” Sales & Events Completion

-- =============================================================
-- 1. Corporate Accounts table
--    Centralized corporate account master with credit terms
-- =============================================================

CREATE TABLE IF NOT EXISTS public.corporate_accounts (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  company_name text NOT NULL,
  contact_person text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  discount_percent numeric NOT NULL DEFAULT 0.00,
  active_bookings integer NOT NULL DEFAULT 0,
  unpaid_balance numeric NOT NULL DEFAULT 0.00,
  credit_limit numeric DEFAULT 0,
  credit_terms text DEFAULT 'Net 30',
  billing_address text,
  tax_id text,
  industry text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 2. Sales Leads table
--    Pipeline CRM: prospect -> qualified -> proposal -> negotiation -> won/lost
-- =============================================================

CREATE TABLE IF NOT EXISTS public.sales_leads (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  lead_number text,
  lead_name text NOT NULL,
  company text,
  contact_person text,
  contact_email text,
  contact_phone text,
  source text DEFAULT 'Direct',
  stage text DEFAULT 'Prospect',
  opportunity_value numeric DEFAULT 0,
  expected_close_date date,
  assigned_to text,
  corporate_account_id text REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
  priority text DEFAULT 'Medium',
  notes text,
  conversion_date date,
  lost_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 3. Sales Proposals table
--    Generated from leads, converted to contracts on acceptance
-- =============================================================

CREATE TABLE IF NOT EXISTS public.sales_proposals (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  proposal_number text,
  lead_id text REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  corporate_account_id text REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
  title text NOT NULL,
  event_type text,
  event_dates text,
  guest_count integer DEFAULT 0,
  room_nights integer DEFAULT 0,
  proposed_revenue numeric DEFAULT 0,
  discount_percent numeric DEFAULT 0,
  terms_conditions text,
  status text DEFAULT 'Draft',
  valid_until date,
  sent_date date,
  accepted_date date,
  rejected_date date,
  contract_id text,
  notes text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 4. Sales Contracts table
--    Created when a proposal is accepted; links to BEO and group block
-- =============================================================

CREATE TABLE IF NOT EXISTS public.sales_contracts (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  contract_number text,
  proposal_id text REFERENCES public.sales_proposals(id) ON DELETE SET NULL,
  lead_id text REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  corporate_account_id text REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
  title text NOT NULL,
  event_type text,
  start_date date,
  end_date date,
  guest_count integer DEFAULT 0,
  room_nights integer DEFAULT 0,
  total_value numeric DEFAULT 0,
  deposit_amount numeric DEFAULT 0,
  deposit_paid boolean DEFAULT false,
  status text DEFAULT 'Active',
  group_block_id text,
  beo_id text REFERENCES public.banquet_events(id) ON DELETE SET NULL,
  terms text,
  signed_by_client text,
  signed_date date,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 5. Group Blocks table
--    Room inventory blocks tied to contracts
-- =============================================================

CREATE TABLE IF NOT EXISTS public.group_blocks (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  block_name text NOT NULL,
  contract_id text REFERENCES public.sales_contracts(id) ON DELETE SET NULL,
  corporate_account_id text REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
  arrival_date date,
  departure_date date,
  total_rooms integer DEFAULT 0,
  blocked_rooms integer DEFAULT 0,
  picked_up_rooms integer DEFAULT 0,
  room_type text,
  rate numeric DEFAULT 0,
  status text DEFAULT 'Open',
  cutoff_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 6. Create group block from contract function
--    Auto-creates a group block when a contract is signed
-- =============================================================

CREATE OR REPLACE FUNCTION public.create_group_block_from_contract(p_contract_id text)
RETURNS TABLE(block_id text, block_name text) AS $$
DECLARE
  v_contract record;
  v_block_id text;
BEGIN
  SELECT * INTO v_contract FROM sales_contracts WHERE id = p_contract_id;
  IF NOT FOUND THEN RETURN; END IF;

  v_block_id := gen_random_uuid()::text;
  INSERT INTO group_blocks (id, block_name, contract_id, corporate_account_id,
    arrival_date, departure_date, total_rooms, blocked_rooms, room_type, rate, status)
  VALUES (
    v_block_id,
    v_contract.title || ' - Group Block',
    p_contract_id, v_contract.corporate_account_id,
    v_contract.start_date, v_contract.end_date,
    v_contract.room_nights, v_contract.room_nights,
    'Standard', v_contract.total_value / NULLIF(v_contract.room_nights, 0),
    'Open'
  );

  UPDATE sales_contracts SET group_block_id = v_block_id WHERE id = p_contract_id;

  RETURN QUERY SELECT v_block_id, v_contract.title || ' - Group Block';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- 7. updated_at triggers
-- =============================================================

DROP TRIGGER IF EXISTS trg_corporate_accounts_updated_at ON public.corporate_accounts;
CREATE TRIGGER trg_corporate_accounts_updated_at
  BEFORE UPDATE ON public.corporate_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sales_leads_updated_at ON public.sales_leads;
CREATE TRIGGER trg_sales_leads_updated_at
  BEFORE UPDATE ON public.sales_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sales_proposals_updated_at ON public.sales_proposals;
CREATE TRIGGER trg_sales_proposals_updated_at
  BEFORE UPDATE ON public.sales_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sales_contracts_updated_at ON public.sales_contracts;
CREATE TRIGGER trg_sales_contracts_updated_at
  BEFORE UPDATE ON public.sales_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_group_blocks_updated_at ON public.group_blocks;
CREATE TRIGGER trg_group_blocks_updated_at
  BEFORE UPDATE ON public.group_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- 8. Performance indexes
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_corporate_accounts_company_name ON public.corporate_accounts(company_name);
CREATE INDEX IF NOT EXISTS idx_corporate_accounts_contact_email ON public.corporate_accounts(contact_email);

CREATE INDEX IF NOT EXISTS idx_sales_leads_corporate_account_id ON public.sales_leads(corporate_account_id);
CREATE INDEX IF NOT EXISTS idx_sales_leads_stage ON public.sales_leads(stage);
CREATE INDEX IF NOT EXISTS idx_sales_leads_assigned_to ON public.sales_leads(assigned_to);

CREATE INDEX IF NOT EXISTS idx_sales_proposals_lead_id ON public.sales_proposals(lead_id);
CREATE INDEX IF NOT EXISTS idx_sales_proposals_corporate_account_id ON public.sales_proposals(corporate_account_id);
CREATE INDEX IF NOT EXISTS idx_sales_proposals_status ON public.sales_proposals(status);

CREATE INDEX IF NOT EXISTS idx_sales_contracts_proposal_id ON public.sales_contracts(proposal_id);
CREATE INDEX IF NOT EXISTS idx_sales_contracts_lead_id ON public.sales_contracts(lead_id);
CREATE INDEX IF NOT EXISTS idx_sales_contracts_corporate_account_id ON public.sales_contracts(corporate_account_id);
CREATE INDEX IF NOT EXISTS idx_sales_contracts_status ON public.sales_contracts(status);

CREATE INDEX IF NOT EXISTS idx_group_blocks_contract_id ON public.group_blocks(contract_id);
CREATE INDEX IF NOT EXISTS idx_group_blocks_corporate_account_id ON public.group_blocks(corporate_account_id);
CREATE INDEX IF NOT EXISTS idx_group_blocks_status ON public.group_blocks(status);

-- END: 115_sales_events_tables.sql

-- =========================================================================
-- Migration: 116_enable_rls_remaining_tables.sql
-- =========================================================================
-- Migration 116: Enable RLS on remaining unprotected tables
-- Tables created in migrations 112-115 were missing RLS policies.
-- This closes the security gap where anon key could read/write:
--   pm_schedules, work_orders, spare_parts (Engineering)
--   sales_leads, sales_proposals, sales_contracts, group_blocks (Sales)
--   payroll_runs, payslips, tax_bands, pension_rates (HR/Payroll)

-- =============================================================
-- 1. Enable RLS on all tables that currently lack it
-- =============================================================

ALTER TABLE public.pm_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pension_rates ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 2. Authenticated role gets full CRUD (staff users via Supabase Auth)
--    The Express server uses service_role key which bypasses RLS.
-- =============================================================

DROP POLICY IF EXISTS "authenticated_all_pm_schedules" ON public.pm_schedules;
CREATE POLICY "authenticated_all_pm_schedules" ON public.pm_schedules
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_work_orders" ON public.work_orders;
CREATE POLICY "authenticated_all_work_orders" ON public.work_orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_spare_parts" ON public.spare_parts;
CREATE POLICY "authenticated_all_spare_parts" ON public.spare_parts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_sales_leads" ON public.sales_leads;
CREATE POLICY "authenticated_all_sales_leads" ON public.sales_leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_sales_proposals" ON public.sales_proposals;
CREATE POLICY "authenticated_all_sales_proposals" ON public.sales_proposals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_sales_contracts" ON public.sales_contracts;
CREATE POLICY "authenticated_all_sales_contracts" ON public.sales_contracts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_group_blocks" ON public.group_blocks;
CREATE POLICY "authenticated_all_group_blocks" ON public.group_blocks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_payroll_runs" ON public.payroll_runs;
CREATE POLICY "authenticated_all_payroll_runs" ON public.payroll_runs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_payslips" ON public.payslips;
CREATE POLICY "authenticated_all_payslips" ON public.payslips
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_tax_bands" ON public.tax_bands;
CREATE POLICY "authenticated_all_tax_bands" ON public.tax_bands
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_pension_rates" ON public.pension_rates;
CREATE POLICY "authenticated_all_pension_rates" ON public.pension_rates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================================
-- 3. Grant DML privileges to authenticated role
-- =============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.pm_schedules, public.work_orders, public.spare_parts,
  public.sales_leads, public.sales_proposals, public.sales_contracts,
  public.group_blocks,
  public.payroll_runs, public.payslips, public.tax_bands, public.pension_rates
  TO authenticated;

-- =============================================================
-- 4. No anon policies = anon gets no access (RLS enabled + no policy = denied)
-- =============================================================
-- Verification:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false;
-- (should return 0 rows after this migration)

-- END: 116_enable_rls_remaining_tables.sql

-- =========================================================================
-- Migration: 117_guest_in_stay_requests.sql
-- =========================================================================
-- Migration 117: Guest In-Stay Requests
-- Note: Already applied via Supabase MCP. This file exists for version control.

-- Guest in-stay service requests
CREATE TABLE IF NOT EXISTS guest_requests (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  request_number text,
  reservation_id text,
  room_number text,
  guest_name text,
  request_type text NOT NULL DEFAULT 'Housekeeping',
  description text,
  priority text DEFAULT 'Normal',
  status text DEFAULT 'Open',
  assigned_to text,
  assigned_department text,
  submitted_at timestamptz DEFAULT now(),
  acknowledged_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for lookup by reservation
CREATE INDEX IF NOT EXISTS idx_guest_requests_reservation ON guest_requests(reservation_id);
CREATE INDEX IF NOT EXISTS idx_guest_requests_status ON guest_requests(status);
CREATE INDEX IF NOT EXISTS idx_guest_requests_department ON guest_requests(assigned_department);

-- Folio view for guest portal (read-only view joining folios + folio_lines)
CREATE OR REPLACE VIEW guest_folio_view AS
SELECT
  f.id AS folio_id,
  f.reservation_id,
  f.status AS folio_status,
  f.balance,
  f.total_charges,
  f.total_payments,
  f.tax_total,
  f.service_charge_total,
  f.currency,
  f.opened_at,
  fl.id AS line_id,
  fl.line_number,
  fl.transaction_date,
  fl.description,
  fl.amount,
  fl.quantity,
  fl.unit_price,
  fl.line_type,
  fl.is_voided,
  fl.source_module
FROM folios f
LEFT JOIN folio_lines fl ON fl.folio_id = f.id AND fl.is_voided = false
WHERE f.status IN ('Open', 'Closed');

-- END: 117_guest_in_stay_requests.sql

-- =========================================================================
-- Migration: 118_org_property_hierarchy.sql
-- =========================================================================
-- Migration 118: Organization & Property Hierarchy
-- Note: Applied via Supabase MCP. This file exists for version control.

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  tax_id TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  currency TEXT DEFAULT 'ETB',
  fiscal_year_start DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE folios ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;

-- Seed default org and property (triggers disabled during backfill)
-- Default org: Gheralta Hotels (66d8b193-4333-4832-b782-2dd40bc1eb48)
-- Default property: Gheralta Main Property (18762279-a389-41c9-9169-7ebc682e9703)

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_read_authenticated" ON organizations;
CREATE POLICY "org_read_authenticated" ON organizations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "org_admin_write" ON organizations;
CREATE POLICY "org_admin_write" ON organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "prop_read_authenticated" ON properties;
CREATE POLICY "prop_read_authenticated" ON properties FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "prop_admin_write" ON properties;
CREATE POLICY "prop_admin_write" ON properties FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- END: 118_org_property_hierarchy.sql

-- =========================================================================
-- Migration: 119_scheduler_tables.sql
-- =========================================================================
-- Migration 119: Scheduler & Job Engine Tables
-- Note: Applied via Supabase MCP. This file exists for version control.

CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  schedule_cron TEXT NOT NULL DEFAULT '0 2 * * *',
  config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES scheduled_jobs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_runs_job_id ON job_runs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_runs_status ON job_runs(status);

ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobs_read_authenticated" ON scheduled_jobs;
CREATE POLICY "jobs_read_authenticated" ON scheduled_jobs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "jobs_admin_write" ON scheduled_jobs;
CREATE POLICY "jobs_admin_write" ON scheduled_jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "runs_read_authenticated" ON job_runs;
CREATE POLICY "runs_read_authenticated" ON job_runs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "runs_admin_write" ON job_runs;
CREATE POLICY "runs_admin_write" ON job_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed default jobs
INSERT INTO scheduled_jobs (name, type, schedule_cron, config, enabled) VALUES
  ('Night Audit', 'night_audit', '0 2 * * *', '{"autoCloseBusinessDate": true, "postRoomCharges": true, "releaseAllotments": true}', true),
  ('Expired Allotment Release', 'allotment_release', '*/30 * * * *', '{}', true),
  ('Daily Report Email', 'report_email', '0 8 * * *', '{"reportType": "daily_summary"}', false),
  ('Database Backup', 'backup', '0 3 * * *', '{"type": "full"}', false)
ON CONFLICT DO NOTHING;

-- END: 119_scheduler_tables.sql

-- =========================================================================
-- Migration: 120_compliance_tables.sql
-- =========================================================================
-- Migration 120: Compliance Center Tables
-- Note: Applied via Supabase MCP. This file exists for version control.

CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id TEXT,
  consent_type TEXT NOT NULL,
  granted BOOLEAN DEFAULT true,
  policy_version TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  retention_days INTEGER NOT NULL DEFAULT 365,
  action TEXT DEFAULT 'archive',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pii_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by TEXT,
  target_entity TEXT,
  status TEXT DEFAULT 'pending',
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pii_erasure_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by TEXT,
  target_entity TEXT,
  status TEXT DEFAULT 'pending',
  erased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_guest ON consent_logs(guest_id);
CREATE INDEX IF NOT EXISTS idx_retention_table ON data_retention_policies(table_name);

ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pii_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pii_erasure_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "compliance_read" ON consent_logs;
CREATE POLICY "compliance_read" ON consent_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "compliance_write" ON consent_logs;
CREATE POLICY "compliance_write" ON consent_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "retention_read" ON data_retention_policies;
CREATE POLICY "retention_read" ON data_retention_policies FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "retention_write" ON data_retention_policies;
CREATE POLICY "retention_write" ON data_retention_policies FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "export_read" ON pii_export_requests;
CREATE POLICY "export_read" ON pii_export_requests FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "export_write" ON pii_export_requests;
CREATE POLICY "export_write" ON pii_export_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "erasure_read" ON pii_erasure_requests;
CREATE POLICY "erasure_read" ON pii_erasure_requests FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "erasure_write" ON pii_erasure_requests;
CREATE POLICY "erasure_write" ON pii_erasure_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed default retention policies
INSERT INTO data_retention_policies (table_name, retention_days, action, enabled) VALUES
  ('audit_events', 2555, 'archive', true),
  ('job_runs', 90, 'delete', true),
  ('guest_requests', 365, 'archive', true),
  ('error_logs', 180, 'delete', true)
ON CONFLICT DO NOTHING;

-- END: 120_compliance_tables.sql

-- =========================================================================
-- Migration: 121_health_monitoring.sql
-- =========================================================================
-- Migration 121: System Health Monitoring
-- Note: Applied via Supabase MCP. This file exists for version control.

CREATE TABLE IF NOT EXISTS health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy',
  latency_ms INTEGER,
  details JSONB,
  checked_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL DEFAULT 'error',
  message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_checks_service ON health_checks(service);
CREATE INDEX IF NOT EXISTS idx_health_checks_checked ON health_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp DESC);

ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "health_read" ON health_checks;
CREATE POLICY "health_read" ON health_checks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "health_write" ON health_checks;
CREATE POLICY "health_write" ON health_checks FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "errlog_read" ON error_logs;
CREATE POLICY "errlog_read" ON error_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "errlog_write" ON error_logs;
CREATE POLICY "errlog_write" ON error_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- END: 121_health_monitoring.sql

-- =========================================================================
-- Migration: 122_config_versioning.sql
-- =========================================================================
-- Migration 122: Configuration Versioning & Rollback
-- Note: Applied via Supabase MCP. This file exists for version control.

CREATE TABLE IF NOT EXISTS config_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT,
  diff JSONB,
  changed_by TEXT,
  changed_at TIMESTAMPTZ DEFAULT now(),
  version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_config_versions_table ON config_versions(table_name);
CREATE INDEX IF NOT EXISTS idx_config_versions_record ON config_versions(record_id);
CREATE INDEX IF NOT EXISTS idx_config_versions_changed ON config_versions(changed_at DESC);

ALTER TABLE config_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "config_ver_read" ON config_versions;
CREATE POLICY "config_ver_read" ON config_versions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "config_ver_write" ON config_versions;
CREATE POLICY "config_ver_write" ON config_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION log_config_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id TEXT;
  v_version INTEGER;
BEGIN
  v_user_id := current_setting('app.user_id', true);
  SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
  FROM config_versions
  WHERE table_name = TG_TABLE_NAME AND record_id = NEW.id::text;
  INSERT INTO config_versions (table_name, record_id, diff, changed_by, version)
  VALUES (TG_TABLE_NAME, NEW.id::text, jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW)), v_user_id, v_version);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'config_version_global_settings' AND event_object_table = 'global_settings') THEN
    CREATE TRIGGER config_version_global_settings AFTER UPDATE ON global_settings FOR EACH ROW EXECUTE FUNCTION log_config_change();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'config_version_custom_roles' AND event_object_table = 'custom_roles') THEN
    CREATE TRIGGER config_version_custom_roles AFTER UPDATE ON custom_roles FOR EACH ROW EXECUTE FUNCTION log_config_change();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'config_version_role_permissions' AND event_object_table = 'role_permissions') THEN
    CREATE TRIGGER config_version_role_permissions AFTER UPDATE ON role_permissions FOR EACH ROW EXECUTE FUNCTION log_config_change();
  END IF;
END $$;

-- END: 122_config_versioning.sql

-- =========================================================================
-- Migration: 123_api_management.sql
-- =========================================================================
-- Migration 123: API Management
-- Note: Applied via Supabase MCP. This file exists for version control.

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 100,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  last_used TIMESTAMPTZ,
  disabled BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "apikeys_read" ON api_keys;
CREATE POLICY "apikeys_read" ON api_keys FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "apikeys_write" ON api_keys;
CREATE POLICY "apikeys_write" ON api_keys FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- END: 123_api_management.sql

-- =========================================================================
-- Migration: 124_add_admin_role.sql
-- =========================================================================
-- Add the missing 'admin' superuser role and link System Administrator
-- Also fix audit_events.id to have a default (was missing, causing trigger failures)

-- Fix: audit_events.id had no default, causing audit trigger INSERT to fail
ALTER TABLE audit_events ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add the 'admin' role (was missing from the roles table)
INSERT INTO roles (id, name, description, is_superuser, is_system)
VALUES ('role_admin', 'admin', 'System Administrator with full access', true, true)
ON CONFLICT (id) DO NOTHING;

-- Link System Administrator (U-110) to the admin role
INSERT INTO user_roles (user_id, role_id)
SELECT 'U-110', 'role_admin'
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = 'U-110' AND role_id = 'role_admin'
);

-- Link Operation Manager (U-111) to the operations role (was missing)
INSERT INTO user_roles (user_id, role_id)
SELECT 'U-111', 'role_operations'
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = 'U-111' AND role_id = 'role_operations'
);

-- Grant all permissions to the admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role_admin', p.id FROM permissions p
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions rp WHERE rp.role_id = 'role_admin' AND rp.permission_id = p.id
);

-- END: 124_add_admin_role.sql

