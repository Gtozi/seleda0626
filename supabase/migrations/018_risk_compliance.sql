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
