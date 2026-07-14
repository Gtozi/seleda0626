-- Add columns for customizable check-in form content
-- This allows business admins to customize the check-in form text and terms

-- Individual check-in form settings
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS checkin_form_title text default 'Check-In Registration Form';
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS checkin_form_hotel_name text default 'SELEDA HOTEL';
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS checkin_form_terms text default '• Guest agrees to comply with all hotel rules and regulations.
• Check-out time is 11:00 AM. Late check-out may incur additional charges.
• The hotel is not responsible for lost or stolen items.
• Payment for all charges is due upon check-out.
• Cancellation policy applies as per reservation terms.';
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS checkin_form_signature_label text default 'Guest Signature';
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS checkin_form_signature_hint text default 'Please sign above to confirm check-in';

-- Group check-in form settings
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS group_checkin_form_title text default 'Group Check-In Registration Form';
ALTER TABLE global_settings 
ADD COLUMN IF NOT EXISTS group_checkin_form_terms text default '• Group contact person agrees to comply with all hotel rules and regulations on behalf of all group members.
• Check-out time is 11:00 AM. Late check-out may incur additional charges.
• The hotel is not responsible for lost or stolen items.
• Payment for all charges is due upon check-out.
• Cancellation policy applies as per reservation terms.
• Group leader is responsible for all charges incurred by group members.';
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
