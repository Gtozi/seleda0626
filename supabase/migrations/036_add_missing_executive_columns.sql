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
