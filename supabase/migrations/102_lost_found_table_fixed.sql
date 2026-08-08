-- Lost & Found Table Migration (Fixed)
-- Comprehensive tracking of lost and found items in hotel operations

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create Lost & Found table
create table if not exists lost_found (
  id text primary key default uuid_generate_v4(),
  
  -- Item Information
  item_name text not null,
  item_description text,
  item_category text check (item_category in (
    'Electronics',
    'Clothing',
    'Accessories',
    'Documents',
    'Keys',
    'Luggage',
    'Toiletries',
    'Sports Equipment',
    'Children Items',
    'Other'
  )),
  item_color text,
  item_brand text,
  item_size text,
  serial_number text,
  distinguishing_features text,
  
  -- Location Information
  found_location text not null,
  found_date date not null default current_date,
  found_time time not null default current_time,
  found_by text references system_users(id) on delete set null,
  
  -- Guest Information (if found in guest room)
  guest_id text references guests(id) on delete set null,
  guest_name text,
  room_number text,
  reservation_id text references reservations(id) on delete set null,
  
  -- Status and Disposition
  status text not null default 'Found' check (status in (
    'Found',
    'Claimed',
    'Donated',
    'Disposed',
    'Returned to Owner',
    'Transferred to Lost Property'
  )),
  
  -- Claim Information
  claimed_by text,
  claimed_date date,
  claimed_time time,
  claim_verification_method text,
  id_verified boolean default false,
  verification_notes text,
  
  -- Storage Information
  storage_location text,
  storage_date date,
  disposal_date date,
  disposal_method text,
  disposal_reason text,
  
  -- Value and Insurance
  estimated_value numeric default 0.00,
  currency text default 'USD',
  insurance_claim boolean default false,
  insurance_claim_number text,
  
  -- Photos and Evidence
  photo_url text,
  additional_photos text[] default '{}',
  evidence_notes text,
  
  -- Communication
  owner_contacted boolean default false,
  owner_contact_method text,
  owner_contact_date date,
  follow_up_required boolean default false,
  follow_up_date date,
  
  -- Resolution
  resolution_notes text,
  resolved_by text references system_users(id) on delete set null,
  resolved_at timestamp with time zone,
  
  -- Audit Trail
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by text references system_users(id) on delete set null,
  updated_by text references system_users(id) on delete set null
);

-- Create indexes for common queries
create index if not exists idx_lost_found_status on lost_found(status);
create index if not exists idx_lost_found_found_date on lost_found(found_date desc);
create index if not exists idx_lost_found_category on lost_found(item_category);
create index if not exists idx_lost_found_guest_id on lost_found(guest_id);
create index if not exists idx_lost_found_reservation_id on lost_found(reservation_id);
create index if not exists idx_lost_found_room_number on lost_found(room_number);
create index if not exists idx_lost_found_created_at on lost_found(created_at desc);

-- Add comments for documentation
comment on table lost_found is 'Tracks lost and found items in hotel operations with full lifecycle management';
comment on column lost_found.status is 'Current status of the item: Found, Claimed, Donated, Disposed, etc.';
comment on column lost_found.estimated_value is 'Estimated value for insurance and reporting purposes';
comment on column lost_found.id_verified is 'Whether claimant ID was verified before returning item';
comment on column lost_found.storage_location is 'Physical storage location (e.g., Safe #1, Front Desk, Lost & Found Closet)';

-- Create updated_at trigger
create or replace function update_lost_found_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_lost_found_updated_at
  before update on lost_found
  for each row
  execute function update_lost_found_updated_at();

-- Create view for active lost & found items (not yet claimed/disposed)
create or replace view active_lost_found as
select 
  id,
  item_name,
  item_description,
  item_category,
  item_color,
  found_location,
  found_date,
  found_time,
  guest_name,
  room_number,
  status,
  estimated_value,
  storage_location,
  photo_url,
  days_in_storage,
  created_at
from (
  select 
    lf.*,
    (current_date - lf.found_date) as days_in_storage
  from lost_found lf
  where lf.status in ('Found', 'Transferred to Lost Property')
) active_items;

-- Create view for lost & found statistics
create or replace view lost_found_stats as
select 
  item_category,
  status,
  count(*) as item_count,
  coalesce(sum(estimated_value), 0) as total_value,
  count(*) filter (where found_date >= current_date - interval '30 days') as last_30_days,
  count(*) filter (where found_date >= current_date - interval '7 days') as last_7_days
from lost_found
group by item_category, status
order by item_category, status;

-- Enable Row Level Security
alter table lost_found enable row level security;

-- Create RLS policies
-- Staff can view all lost & found items
create policy "Staff can view all lost and found items"
  on lost_found for select
  using (true);

-- Staff can insert lost & found items
create policy "Staff can insert lost and found items"
  on lost_found for insert
  with check (true);

-- Staff can update lost & found items
create policy "Staff can update lost and found items"
  on lost_found for update
  using (true);

-- Staff can delete lost & found items
create policy "Staff can delete lost and found items"
  on lost_found for delete
  using (true);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on active_lost_found to anon, authenticated;
grant select on lost_found_stats to anon, authenticated;
grant all on lost_found to authenticated;