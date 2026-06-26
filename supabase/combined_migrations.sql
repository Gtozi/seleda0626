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
-- ======================================================================================
-- INVENTORY PORTAL SCHEMA ALIGNMENT
-- Adds columns missing from inventory_items to match the frontend InventoryItem interface
-- ======================================================================================

alter table inventory_items
  add column if not exists sale_price numeric not null default 0.00,
  add column if not exists guest_portal_active boolean not null default false,
  add column if not exists image_url text,
  add column if not exists dietary_tags text[] default '{}';
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
-- Add permission_matrix JSONB column to system_users for granular RBAC
alter table system_users add column if not exists permission_matrix jsonb not null default '{}'::jsonb;
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
-- Migration: Add allowed_ips column to global_settings
-- This column is referenced in server.ts KNOWN_GLOBAL_SETTINGS_COLUMNS but was missing from previous migrations

alter table global_settings add column if not exists allowed_ips text[] not null default '{}'::text[];

comment on column global_settings.allowed_ips is 'Array of allowed IP addresses for system access control';
-- Add api_integrations column to global_settings table
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS api_integrations jsonb not null default '[]'::jsonb;
-- Add isolation_policy column to global_settings table
-- Used for subsystem isolation/zero-trust security settings
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS isolation_policy jsonb not null default '{"finance": false, "hr": false, "executive": false, "dualSignature": false}'::jsonb;
-- Add auto_night_audit_time column to global_settings table
-- Used for automatic night audit scheduling
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS auto_night_audit_time text;
-- Add backup_frequency column to global_settings table
-- Used for backup scheduling (daily, weekly, manual)
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS backup_frequency text check (backup_frequency in ('daily', 'weekly', 'manual'));
-- Add system_log_level column to global_settings table
-- Used for system logging verbosity (info, detailed, debug)
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS system_log_level text check (system_log_level in ('info', 'detailed', 'debug'));
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
      "copyright": "Â© 2026 Grand Hotel. All rights reserved.",
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
-- Add booking_terms column to global_settings for public booking terms and conditions

alter table global_settings add column if not exists booking_terms text default '';
