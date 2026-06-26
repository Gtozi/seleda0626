-- Add booking_terms column to global_settings for public booking terms and conditions

alter table global_settings add column if not exists booking_terms text default '';
