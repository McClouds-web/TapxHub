-- ==========================================
-- SOCIAL ENGINE SCHEMA & SECURITY
-- ==========================================

-- 1. Create Social Content Table
CREATE TABLE IF NOT EXISTS public.social_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    project_id UUID, -- Optional link to a specific project
    platform TEXT NOT NULL, -- Instagram, Facebook, TikTok, LinkedIn, etc.
    content_type TEXT NOT NULL, -- post, reel, story, carousel
    caption TEXT,
    media_files TEXT[], -- Array of URLs or Vault File IDs
    status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'draft', 'in_review', 'approved', 'scheduled', 'published')),
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'revision_requested')),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'social_content'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE social_content;
    END IF;
END $$;

-- 3. Row Level Security (RLS)
ALTER TABLE public.social_content ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Admins: Full access
DROP POLICY IF EXISTS "Admins have full access to social_content" ON public.social_content;
CREATE POLICY "Admins have full access to social_content" ON public.social_content
    FOR ALL
    USING (public.get_user_role() = 'admin');

-- Clients: View and update (for approvals) only their own company content
DROP POLICY IF EXISTS "Clients view own company content" ON public.social_content;
CREATE POLICY "Clients view own company content" ON public.social_content
    FOR SELECT
    USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Clients approve own company content" ON public.social_content;
CREATE POLICY "Clients approve own company content" ON public.social_content
    FOR UPDATE
    USING (company_id = public.get_user_company_id())
    WITH CHECK (company_id = public.get_user_company_id());

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_social_content_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_update_social_content_timestamp ON public.social_content;
CREATE TRIGGER tr_update_social_content_timestamp
    BEFORE UPDATE ON public.social_content
    FOR EACH ROW
    EXECUTE FUNCTION update_social_content_timestamp();

-- 6. Link Media to Social Content
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS social_content_id UUID REFERENCES public.social_content(id) ON DELETE SET NULL;
