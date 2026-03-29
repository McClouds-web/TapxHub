-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLE DEFINITIONS
-- ==============================================================================

-- COMPANIES
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
  created_at timestamp with time zone DEFAULT now()
);

-- Migration: add columns if table already exists
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS business_profile jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'client', 'retainer')),
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  full_name text,
  phone_number text,
  telegram_chat_id text,
  ntfy_topic text,
  notification_preferences jsonb DEFAULT '{"email": true, "telegram": false, "ntfy": false, "gmail": false}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- NOTES
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  title text,
  content jsonb,
  folder text,
  is_shared boolean DEFAULT false,
  tags text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('todo', 'doing', 'done')) DEFAULT 'todo',
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date timestamp with time zone,
  is_internal boolean DEFAULT true,
  is_personal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  type text CHECK (type IN ('Meeting', 'Deadline', 'Personal')),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- FILES
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

-- INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text CHECK (status IN ('draft', 'sent', 'paid')) DEFAULT 'draft',
  due_date timestamp with time zone,
  invoice_url text,
  pdf_generated boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- RETAINER LOGS
CREATE TABLE IF NOT EXISTS public.retainer_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  month text,
  services_delivered text[],
  status text CHECK (status IN ('in_progress', 'completed', 'delivered')) DEFAULT 'in_progress',
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text CHECK (type IN ('new_client', 'file_uploaded', 'task_due', 'invoice_sent', 'deliverable_ready')),
  is_read boolean DEFAULT false,
  related_company_id uuid,
  related_file_id uuid,
  related_task_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  preferred_date text,
  preferred_time text,
  service_interest text,
  message text,
  status text CHECK (status IN ('pending', 'confirmed', 'cancelled', 'converted')) DEFAULT 'pending',
  source text DEFAULT 'website',
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  subject text,
  last_message_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_role text CHECK (sender_role IN ('admin', 'client')) NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- DAILY DIGEST LOG
CREATE TABLE IF NOT EXISTS public.daily_digest_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at timestamp with time zone,
  tasks_included integer,
  events_included integer,
  channel text CHECK (channel IN ('email', 'telegram', 'ntfy', 'gmail')),
  status text CHECK (status IN ('sent', 'failed')),
  created_at timestamp with time zone DEFAULT now()
);

-- ==============================================================================
-- 2. HELPER FUNCTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_client_type()
RETURNS text AS $$
  SELECT c.client_type FROM public.companies c 
  JOIN public.profiles p ON p.company_id = c.id 
  WHERE p.id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ==============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retainer_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_digest_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 4. RLS POLICIES
-- ==============================================================================

-- PROFILES
CREATE POLICY "Admins read and write all profiles" ON public.profiles FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Clients read and update only their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Clients update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- COMPANIES
CREATE POLICY "Admins read and write all companies" ON public.companies FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Clients read only their own company" ON public.companies FOR SELECT USING (public.get_user_company_id() = id);

-- NOTES
CREATE POLICY "Admins read and write all notes" ON public.notes FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Clients read only shared notes matching their profile" ON public.notes FOR SELECT USING (is_shared = true AND company_id = public.get_user_company_id());

-- TASKS
CREATE POLICY "Admins read and write all tasks" ON public.tasks FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Clients read only tasks matching company_id and is_internal is false" ON public.tasks FOR SELECT USING (company_id = public.get_user_company_id() AND is_internal = false AND is_personal = false);

-- EVENTS
CREATE POLICY "Admins read and write all events" ON public.events FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Clients read only events linked to their company_id" ON public.events FOR SELECT USING (company_id = public.get_user_company_id());

-- FILES
CREATE POLICY "Admins read and write all files" ON public.files FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Clients read files matching company_id" ON public.files FOR SELECT USING (company_id = public.get_user_company_id());
CREATE POLICY "Clients upload files where company_id matches" ON public.files FOR INSERT WITH CHECK (company_id = public.get_user_company_id());

-- INVOICES
CREATE POLICY "Admins read and write all invoices" ON public.invoices FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Clients read only invoices matching their company_id" ON public.invoices FOR SELECT USING (company_id = public.get_user_company_id());

-- RETAINER LOGS
CREATE POLICY "Admins read and write all logs" ON public.retainer_logs FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Retainer clients read only logs where company_id matches" ON public.retainer_logs FOR SELECT USING (company_id = public.get_user_company_id() AND public.get_client_type() = 'retainer');

-- NOTIFICATIONS
CREATE POLICY "Admins read all notifications" ON public.notifications FOR SELECT USING (public.get_user_role() = 'admin');
CREATE POLICY "Each user reads only their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());

-- BOOKINGS
CREATE POLICY "Admins read and write all bookings" ON public.bookings FOR ALL USING (public.get_user_role() = 'admin');

-- CONVERSATIONS
CREATE POLICY "Admins read and write all conversations" ON public.conversations FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Clients read conversations for their company" ON public.conversations FOR SELECT USING (company_id = public.get_user_company_id());

-- MESSAGES
CREATE POLICY "Admins read and write all messages" ON public.messages FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Clients read messages in their conversations" ON public.messages FOR SELECT USING (
  conversation_id IN (SELECT id FROM public.conversations WHERE company_id = public.get_user_company_id())
);
CREATE POLICY "Clients insert messages in their conversations" ON public.messages FOR INSERT WITH CHECK (
  conversation_id IN (SELECT id FROM public.conversations WHERE company_id = public.get_user_company_id())
  AND sender_id = auth.uid()
);

-- ==============================================================================
-- 5. STORAGE BUCKET: 'vault'
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'vault', 
  'vault', 
  false, 
  52428800, 
  ARRAY[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'video/mp4',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Admin access to vault" ON storage.objects FOR ALL USING (bucket_id = 'vault' AND public.get_user_role() = 'admin');
CREATE POLICY "Client read access to vault" ON storage.objects FOR SELECT USING (bucket_id = 'vault');
CREATE POLICY "Client insert access to vault" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vault');

-- ==============================================================================
-- 6. AUTO-CREATE PROFILE ON SIGN-UP (TRIGGER)
-- ==============================================================================

-- Allow users to insert their own profile row (needed for new signups)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger function: auto-creates a profile row whenever a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 7. MISSING COLUMN MIGRATIONS
-- ==============================================================================

-- Companies: add missing columns used by the app
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS site text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS start_date text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS retainer_status text CHECK (retainer_status IN ('in_progress', 'completed', 'delivered'));
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS monthly_amount numeric;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS meta_ad_account_id text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS google_property_id text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS sync_enabled boolean DEFAULT false;

-- Invoices: add missing columns
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_number text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS overdue boolean DEFAULT false;

-- Tasks: add missing column
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS start_date text;

-- Profiles: add missing column (already has full_name but ensure it exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;

-- ==============================================================================
-- 8. ADMIN USER SETUP
-- Run this AFTER your admin account exists in Supabase Auth.
-- Replace the email if needed.
-- ==============================================================================

-- Upsert the admin profile so RLS works immediately after sign-in
INSERT INTO public.profiles (id, email, role, full_name)
SELECT
  au.id,
  au.email,
  'admin',
  COALESCE(au.raw_user_meta_data->>'full_name', 'Tapiwa Makore')
FROM auth.users au
WHERE au.email = 'tapiwa.makore@tapxmedia.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
