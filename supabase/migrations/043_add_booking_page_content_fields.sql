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
ADD COLUMN IF NOT EXISTS booking_secure_booking_text TEXT DEFAULT 'Secure booking · No card required',
ADD COLUMN IF NOT EXISTS contact_email TEXT;
