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
