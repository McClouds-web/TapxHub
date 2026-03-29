-- ─── 1. MEETINGS TABLE ──────────────────────────────────────────────
-- For your personal agency planner
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL, -- The client attending
    
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    meeting_link TEXT, -- Zoom/Google Meet link
    status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled
    is_personal BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 2. PERMISSIONS (RLS) ──────────────────────────────────────────
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Admins (You) can see all meetings
CREATE POLICY "Admins can view and manage all meetings" 
ON public.meetings FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (true);

-- Clients can see only meetings they are invited to (based on company_id)
CREATE POLICY "Clients can view their own meetings" 
ON public.meetings FOR SELECT 
TO authenticated 
USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
