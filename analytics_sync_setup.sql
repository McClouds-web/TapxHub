-- ─── 1. CREATE CLIENT REPORTS TABLE ───────────────────────────────────
-- This table stores the snapshot of analytics for every client per month
CREATE TABLE IF NOT EXISTS public.client_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    report_month DATE NOT NULL, -- The first day of the month this report represents
    
    -- Key Performance Indicators (KPIs)
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spend NUMERIC(10, 2) DEFAULT 0.00,
    revenue NUMERIC(10, 2) DEFAULT 0.00,
    
    -- Metadata
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure one report per company per month
    UNIQUE(company_id, report_month)
);

-- ─── 2. UPDATE COMPANIES WITH AD IDS ────────────────────────────────
-- We need to know which external IDs to pull from for each client
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS meta_ad_account_id TEXT,
ADD COLUMN IF NOT EXISTS google_property_id TEXT,
ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT false;

-- ─── 3. PERMISSIONS ────────────────────────────────────────────────
ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;

-- Allow clients to see only their own reports
CREATE POLICY "Clients can view their own reports" 
ON public.client_reports FOR SELECT 
TO authenticated 
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Allow service_role (the sync script) to do everything
CREATE POLICY "Service role full access" 
ON public.client_reports FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- ─── 4. SCHEDULE THE SYNC (CRON) ───────────────────────────────────
-- Note: Replace YOUR_PROJECT_REF and YOUR_ANON_KEY with your values.
-- Frequency: Every night at 02:00 AM UTC
-- SELECT cron.schedule(
--   'sync-analytics-nightly',
--   '0 2 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-analytics',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--     body := '{}'::jsonb
--   );
--   $$
-- );
