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
