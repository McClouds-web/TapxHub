-- 🚀 TAPXHUB ULTIMATE LAUNCH SCRIPT 🚀
-- Run this ONCE in a blank Supabase SQL Editor for a brand new project.

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- 2. BASE TABLES
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kpi_embed_url text,
  drive_link text,
  client_type text CHECK (client_type IN ('invoice', 'retainer')),
  retainer_amount numeric,
  retainer_billing_day integer,
  retainer_services text[],
  contact_email text,
  business_profile jsonb DEFAULT '{}'::jsonb,
  onboarding_completed boolean DEFAULT false,
  meta_ad_account_id text,
  google_property_id text,
  sync_enabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'client', 'retainer')) DEFAULT 'client',
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  full_name text,
  phone_number text,
  telegram_chat_id text,
  ntfy_topic text,
  notification_preferences jsonb DEFAULT '{"email": true, "telegram": false, "ntfy": false, "gmail": false}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  subject text,
  last_message_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_role text CHECK (sender_role IN ('admin', 'client')) NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('todo', 'in_progress', 'done', 'doing')) DEFAULT 'todo',
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date timestamp with time zone,
  is_internal boolean DEFAULT true,
  is_personal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  storage_provider text CHECK (storage_provider IN ('supabase', 'cloudinary', 'external')),
  file_size_mb numeric,
  category text,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_deliverable boolean DEFAULT false,
  email_sent boolean DEFAULT false,
  email_sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. TRIGGERS & PROFILES AUTO-SYNC
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

-- 4. TELEGRAM WHATSAPP-LIKE NOTIFICATIONS
CREATE OR REPLACE FUNCTION public.notify_telegram_bot()
RETURNS trigger AS $$
DECLARE
  payload JSONB;
BEGIN
  IF NEW.sender_role = 'admin' THEN RETURN NEW; END IF;

  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'messages',
    'record', row_to_json(NEW)
  );

  PERFORM net.http_post(
    url := 'https://cijeetlvkellnsqhsuxo.supabase.co/functions/v1/telegram-bot',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpamVldGx2a2VsbG5zcWhzdXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjI5OTIsImV4cCI6MjA4OTkzODk5Mn0.OZeln7lFzxBZNdSBcZ7gkMm-mvKLjCpXvDl3xeV8lO8"}'::jsonb,
    body := payload
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_client_message_created ON public.messages;
CREATE TRIGGER on_client_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_bot();

-- 5. RLS SECURITY & SERVICE ROLE BYPASS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 5.1 PUBLIC INVOICE ACCESS (Shared Login-free links)
DROP POLICY IF EXISTS "Anyone with link can view invoice" ON public.invoices;
CREATE POLICY "Anyone with link can view invoice" ON public.invoices FOR SELECT USING (true);

DO $$ 
DECLARE t text;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public') 
    LOOP
        EXECUTE format('CREATE POLICY "Service bypass" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;

-- 🚀 PROJECT FULLY ACTIVATED.
