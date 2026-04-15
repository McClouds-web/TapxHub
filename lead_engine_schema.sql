-- ==========================================
-- LEAD ENGINE SCHEMA & SECURITY
-- ==========================================

-- 1. Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    industry TEXT,
    location TEXT,
    lead_source TEXT DEFAULT 'Manual Entry',
    pipeline_stage TEXT DEFAULT 'new' CHECK (pipeline_stage IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Configure Realtime
-- Check if the table is already in the publication or not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'leads'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE leads;
    END IF;
END $$;

-- 3. Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 4. Admin-Only Policies
-- Note: Using the get_user_role() function defined in supabase_setup.sql
DROP POLICY IF EXISTS "Admins have full access to leads" ON public.leads;
CREATE POLICY "Admins have full access to leads" ON public.leads
    FOR ALL
    USING (public.get_user_role() = 'admin');

-- Ensure clients have NO access to leads (default behavior of ENABLE RLS without policies)
-- But we can be explicit:
DROP POLICY IF EXISTS "Clients have no access to leads" ON public.leads;
CREATE POLICY "Clients have no access to leads" ON public.leads
    FOR SELECT
    USING (false);

-- 5. Auto-Convert Trigger Support (Optional logic for backend conversion)
-- For now, the app handles conversion via API calls, which is safer for debugging.
