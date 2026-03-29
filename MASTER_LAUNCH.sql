-- 🚀 TAPXHUB MASTER LAUNCH SCRIPT 🚀
-- Run this once in your Supabase SQL Editor to activate all features.

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- 2. CREATE CLIENT REPORTS TABLE (Analytics Sync)
CREATE TABLE IF NOT EXISTS public.client_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    report_month DATE NOT NULL,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spend NUMERIC(10, 2) DEFAULT 0.00,
    revenue NUMERIC(10, 2) DEFAULT 0.00,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(company_id, report_month)
);

-- 3. CREATE MEETINGS TABLE (Planner OS)
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    meeting_link TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    is_personal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. UPDATE COMPANIES TABLE SCHEMA
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS meta_ad_account_id TEXT,
ADD COLUMN IF NOT EXISTS google_property_id TEXT,
ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT false;

-- 5. AUTH -> PROFILES TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unnamed User'),
    COALESCE(new.raw_user_meta_data->>'role', 'client')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. RLS TIGHTENING & SERVICE ROLE BYPASS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can submit bookings" ON public.bookings;
CREATE POLICY "Public can submit bookings" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Universal Service Role Key Override (For Telegram & Analytics sync)
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

-- 7. ENABLE RLS ON NEW TABLES
ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own reports" ON public.client_reports FOR SELECT TO authenticated USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Clients view invited meetings" ON public.meetings FOR SELECT TO authenticated USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Admins full access reports" ON public.client_reports FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins full access meetings" ON public.meetings FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 8. TELEGRAM NOTIFICATION SYSTEM
-- This function catches NEW client messages and pushes them to your Telegram Edge Function
CREATE OR REPLACE FUNCTION public.notify_telegram_bot()
RETURNS trigger AS $$
DECLARE
  payload JSONB;
BEGIN
  -- We ONLY notify if the real sender is a client
  IF NEW.sender_role = 'admin' THEN
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'messages',
    'record', row_to_json(NEW)
  );

  -- ⚠️ REPLACE 'YOUR_APP_URL' with your real Supabase project URL
  PERFORM net.http_post(
    url := 'https://YOUR_APP_URL.supabase.co/functions/v1/telegram-bot',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_client_message_created ON public.messages;
CREATE TRIGGER on_client_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_telegram_bot();

-- 9. HTTP RESPONSE LOGGING (For Debugging Edge Functions)
-- Use: SELECT * FROM net.http_response; to see results of syncs/bots
GRANT ALL ON net.http_response TO postgres;

-- 🚀 PROJECT ACTIVATED.
