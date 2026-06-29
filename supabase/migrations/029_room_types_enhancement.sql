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
