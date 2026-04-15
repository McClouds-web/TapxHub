-- ==========================================
-- FINAL AUDIT SCHEMA PATCHES
-- ==========================================

-- 1. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('active', 'completed', 'on_hold')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Link Tasks to Projects
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- 3. Enhance Invoices for MRR tracking if not already there
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_type TEXT CHECK (invoice_type IN ('one_time', 'recurring')) DEFAULT 'one_time';

-- 4. Enable Realtime for Projects
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'projects'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE projects;
    END IF;
END $$;

-- 5. RLS for Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read and write all projects" ON public.projects FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Clients read only their own projects" ON public.projects FOR SELECT USING (company_id = public.get_user_company_id());
