-- ─── 1. TIGHTENING RLS POLICIES FOR PRODUCTION ───────────────────────

-- Ensure bookings can be submitted by the public (Lead Form)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can submit bookings" ON public.bookings;
CREATE POLICY "Public can submit bookings" 
ON public.bookings FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Harden Conversations (Clients can ONLY see their own)
DROP POLICY IF EXISTS "Clients read conversations" ON public.conversations;
CREATE POLICY "Clients read own conversations" 
ON public.conversations FOR SELECT 
TO authenticated 
USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Harden Files (Clients can ONLY see their own company files)
DROP POLICY IF EXISTS "Clients read files" ON public.files;
CREATE POLICY "Clients read own company files" 
ON public.files FOR SELECT 
TO authenticated 
USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- ─── 2. SERVICE ROLE OVERRIDE ───────────────────────────────────────
-- This ensures our Edge Functions (Telegram/Analytics) never get blocked by RLS policies
-- We apply this to all critical tables

DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Service role bypass" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Service role bypass" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;

-- ─── 3. ADMIN OVERRIDE ──────────────────────────────────────────────
-- Simplified Admin Check for performance
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Re-apply admin policies on core tables
CREATE POLICY "Admin full access companies" ON public.companies FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admin full access messages" ON public.messages FOR ALL TO authenticated USING (public.is_admin());

-- 6. PUBLIC INVOICE ACCESS (For shared links)
DROP POLICY IF EXISTS "Anyone with link can view invoice" ON public.invoices;
CREATE POLICY "Anyone with link can view invoice" ON public.invoices FOR SELECT USING (true);
