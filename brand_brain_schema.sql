-- ==========================================
-- BRAND BRAIN ENGINE SCHEMA
-- ==========================================

-- 1. Extend Companies for Brand Profiles
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS brand_voice TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS brand_tone TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS brand_keywords TEXT[];
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS brand_description TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS brand_values TEXT;

-- 2. Create Brand Outputs (History)
CREATE TABLE IF NOT EXISTS public.brand_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- social_caption, ad_copy, email, blog_outline, etc.
    persona_mode TEXT NOT NULL, -- punchy, professional, founder, luxury, minimal
    prompt TEXT NOT NULL,
    output_text TEXT NOT NULL,
    is_saved_to_vault BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. Enable Realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'brand_outputs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE brand_outputs;
    END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE public.brand_outputs ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Admins: Full access
CREATE POLICY "Admins have full access to brand_outputs" ON public.brand_outputs
    FOR ALL USING (public.get_user_role() = 'admin');

-- Clients: No access (Brand Brain is Admin Only)
CREATE POLICY "Clients have no access to brand_outputs" ON public.brand_outputs
    FOR SELECT USING (false);

-- 6. Trigger for updated_at (optional if we had it, but brand_outputs are mostly immutable history)
