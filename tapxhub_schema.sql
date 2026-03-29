-- ==========================================
-- TAPXHUB DATABASE SCHEMA MIGRATION
-- Copy/Paste this entire file into the Supabase SQL Editor and click "RUN"
-- ==========================================

-- 1. Create Tables
-- ------------------------------------------

-- Table: companies (CRM)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT,
    site TEXT,
    email TEXT,
    phone TEXT,
    monthly_amount NUMERIC,
    start_date DATE,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Retainer', 'One-off', 'Completed')),
    business_profile JSONB DEFAULT '{}'::jsonb,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: profiles (Extended from Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
    full_name TEXT,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: bookings (Leads from TapxMedia Website)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    preferred_date DATE,
    preferred_time TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    source TEXT DEFAULT 'TapxMedia Website',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: tasks (Planner & Kanban)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company_name TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: messages (Live Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: files (Vault Deliverables)
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Configure Realtime
-- ------------------------------------------

-- Enable Realtime for relevant tables so the dashboard updates instantly
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table companies;

-- 3. Row Level Security (RLS)
-- ------------------------------------------

-- Enable RLS for all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- ------------------------------------------

-- Note: TapxHub currently uses anonymous connections and mock users for local dev.
-- We are granting "anon" full access for now to ensure the dashboard works seamlessly, 
-- but in production with real Supabase Auth, these policies will restrict 'client' 
-- roles to only view data matching their company_id.

CREATE POLICY "Allow anon everything" ON public.companies FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon everything" ON public.profiles FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon everything" ON public.bookings FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon everything" ON public.tasks FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon everything" ON public.messages FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon everything" ON public.files FOR ALL TO anon USING (true);

-- (If using authenticated users, you would use policies like:)
-- CREATE POLICY "Admins have full access" ON public.companies FOR ALL USING (
--     (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
-- );
-- CREATE POLICY "Clients view own company" ON public.companies FOR SELECT USING (
--     id = (SELECT company_id FROM profiles WHERE id = auth.uid())
-- );
