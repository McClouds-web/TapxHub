-- ==========================================
-- AUTOMATION & INTELLIGENCE LAYER
-- ==========================================

-- 1. Global Activity Log
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'lead_won', 'content_approved', 'task_completed', 'file_uploaded'
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Expand Notification Types
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
    'new_client', 'file_uploaded', 'task_due', 'invoice_sent', 
    'deliverable_ready', 'lead_captured', 'lead_won', 
    'content_approved', 'revision_requested', 'task_completed'
));

-- 3. Automation Helper Functions

-- Function: Auto-log activity on file upload
CREATE OR REPLACE FUNCTION public.log_file_upload_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.activity_logs (company_id, user_id, event_type, description, metadata)
    VALUES (
        NEW.company_id,
        NEW.uploaded_by,
        'file_uploaded',
        'Uploaded a new file: ' || NEW.name,
        jsonb_build_object('file_id', NEW.id, 'file_url', NEW.url)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Log file upload
DROP TRIGGER IF EXISTS tr_log_file_upload ON public.files;
CREATE TRIGGER tr_log_file_upload
AFTER INSERT ON public.files
FOR EACH ROW EXECUTE FUNCTION public.log_file_upload_activity();

-- Function: Auto-log activity on task completion
CREATE OR REPLACE FUNCTION public.log_task_completion_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status <> 'done' AND NEW.status = 'done') THEN
        INSERT INTO public.activity_logs (company_id, event_type, description)
        VALUES (
            NEW.company_id,
            'task_completed',
            'Completed task: ' || NEW.title
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Log task completion
DROP TRIGGER IF EXISTS tr_log_task_completion ON public.tasks;
CREATE TRIGGER tr_log_task_completion
AFTER UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.log_task_completion_activity();

-- 4. Enable Realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'activity_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
    END IF;
END $$;

-- 5. RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see all activity" ON public.activity_logs
    FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Clients see own company activity" ON public.activity_logs
    FOR SELECT USING (company_id = public.get_user_company_id());

-- 6. Conversions: Leads to Clients (Stored Procedure)
CREATE OR REPLACE FUNCTION public.convert_lead_to_client(p_lead_id UUID, p_admin_id UUID)
RETURNS UUID AS $$
DECLARE
    v_lead RECORD;
    v_company_id UUID;
BEGIN
    -- 1. Fetch lead
    SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id;
    
    -- 2. Create Company
    INSERT INTO public.companies (name, industry, website, phone, status)
    VALUES (v_lead.business_name, v_lead.industry, v_lead.website, v_lead.phone, 'active')
    RETURNING id INTO v_company_id;
    
    -- 3. Create Default Project
    INSERT INTO public.projects (company_id, name, description, status)
    VALUES (v_company_id, 'Growth Onboarding', 'Initial setup and strategic alignment.', 'active');
    
    -- 4. Create Starter Tasks
    INSERT INTO public.tasks (company_id, title, description, status, priority)
    VALUES 
    (v_company_id, 'Initial Strategy Session', 'Schedule and conduct the discovery call.', 'todo', 'high'),
    (v_company_id, 'Vault Setup', 'Organize brand assets and contracts.', 'todo', 'medium'),
    (v_company_id, 'Brand Brain Programming', 'Initial intake for AI context.', 'todo', 'medium');
    
    -- 5. Log activity
    INSERT INTO public.activity_logs (company_id, user_id, event_type, description)
    VALUES (v_company_id, p_admin_id, 'lead_won', 'Lead converted to active client node.');
    
    -- 6. Update Lead
    UPDATE public.leads SET pipeline_stage = 'won' WHERE id = p_lead_id;
    
    RETURN v_company_id;
END;
$$ LANGUAGE plpgsql;
