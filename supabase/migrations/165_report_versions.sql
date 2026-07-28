-- Create report_versions table for tracking generated report history
CREATE TABLE IF NOT EXISTS public.report_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name TEXT NOT NULL,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  generated_by TEXT,
  date_range TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.report_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "report_versions_select_authenticated" ON public.report_versions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "report_versions_insert_authenticated" ON public.report_versions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "report_versions_update_authenticated" ON public.report_versions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_report_versions_report_name ON public.report_versions(report_name);
CREATE INDEX IF NOT EXISTS idx_report_versions_created_at ON public.report_versions(created_at DESC);
