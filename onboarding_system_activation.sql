-- ONBOARDING SYSTEM ACTIVATION LAYER
-- This script handles the automatic configuration of the TapxHub ecosystem per client.

-- 1. Extend Companies table for Onboarding Data if needed
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS goals text[];
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS target_audience jsonb;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS selected_services text[];
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS platforms text[];
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS budget_range text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS workload_level text;

-- 2. Create Brand Profiles table for deeper Brand Brain storage
CREATE TABLE IF NOT EXISTS public.brand_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    brand_voice text,
    tone_style text,
    brand_keywords text[],
    brand_values text[],
    messaging_direction text,
    target_audience_desc text,
    pain_points text[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Brand Profiles
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see all brand profiles" ON public.brand_profiles
    FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Clients see own brand profile" ON public.brand_profiles
    FOR SELECT USING (company_id = public.get_user_company_id());

-- 3. The Activation Stored Procedure
CREATE OR REPLACE FUNCTION public.activate_client_system(
    p_company_id uuid,
    p_onboarding_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_company_name text;
    v_selected_services text[];
    v_service text;
    v_project_id uuid;
    v_brand_profile_id uuid;
BEGIN
    -- Get company info
    SELECT name INTO v_company_name FROM public.companies WHERE id = p_company_id;
    IF v_company_name IS NULL THEN
        RAISE EXCEPTION 'Company not found';
    END IF;

    -- Extract services
    v_selected_services := ARRAY(SELECT jsonb_array_elements_text(p_onboarding_data->'selectedServices'));

    -- 1. BRAND BRAIN INITIALIZATION
    INSERT INTO public.brand_profiles (
        company_id,
        brand_voice,
        tone_style,
        brand_keywords,
        brand_values,
        messaging_direction,
        target_audience_desc,
        pain_points
    ) VALUES (
        p_company_id,
        p_onboarding_data->>'brandVoice',
        p_onboarding_data->>'toneStyle',
        ARRAY(SELECT jsonb_array_elements_text(p_onboarding_data->'brandKeywords')),
        ARRAY(SELECT jsonb_array_elements_text(p_onboarding_data->'brandValues')),
        p_onboarding_data->>'messagingDirection',
        p_onboarding_data->>'targetAudienceDesc',
        ARRAY(SELECT jsonb_array_elements_text(p_onboarding_data->'painPoints'))
    ) RETURNING id INTO v_brand_profile_id;

    -- 2. WORKSPACE SETUP: Default Onboarding Project
    INSERT INTO public.projects (
        company_id,
        name,
        status,
        description
    ) VALUES (
        p_company_id,
        'Onboarding & System Setup',
        'active',
        'Initial system configuration and strategy phase.'
    ) RETURNING id INTO v_project_id;

    -- Initial Tasks
    INSERT INTO public.tasks (company_id, project_id, title, description, status, priority, is_internal)
    VALUES 
    (p_company_id, v_project_id, 'Brand Audit & Core Identity Sync', 'Review onboarding data and align Brand Brain vectors.', 'todo', 'high', true),
    (p_company_id, v_project_id, 'Marketing Operations Framework Setup', 'Initialize folders, tracking, and reporting baseline.', 'todo', 'high', true),
    (p_company_id, v_project_id, '7-Day Strategic Launch Map', 'Draft the first week of active campaigns.', 'todo', 'high', false);

    -- 3. SERVICE-SPECIFIC ACTIVATION
    FOREACH v_service IN ARRAY v_selected_services
    LOOP
        -- Social Media Logic
        IF v_service = 'Social Media Systems' THEN
            INSERT INTO public.tasks (company_id, project_id, title, description, status, priority, is_internal)
            VALUES (p_company_id, v_project_id, 'Initialize Content Calendar', 'Set up frequencies and platform distribution rules.', 'todo', 'medium', true);
        END IF;

        -- Lead Gen Logic
        IF v_service = 'Lead Generation & Funnels' THEN
             INSERT INTO public.tasks (company_id, project_id, title, description, status, priority, is_internal)
             VALUES (p_company_id, v_project_id, 'Funnel Architecture Mapping', 'Map lead flow from discovery to CRM intake.', 'todo', 'high', true);
        END IF;

        -- Paid Media
        IF v_service = 'Paid Media Systems' THEN
             INSERT INTO public.tasks (company_id, project_id, title, description, status, priority, is_internal)
             VALUES (p_company_id, v_project_id, 'Ad Account Audit & Pixel Sync', 'Verify tracking integrity for paid operations.', 'todo', 'high', true);
        END IF;
    END LOOP;

    -- 4. VAULT STRUCTURE (Simulated via Activity Logs / Metadata)
    -- In a real system, we'd create physical folders, here we log it.
    INSERT INTO public.activity_logs (company_id, type, description)
    VALUES (p_company_id, 'system', 'Vault structure initialized: Brand Assets, Deliverables, Strategy, Reports.');

    -- 5. UPDATE COMPANY STATUS
    UPDATE public.companies 
    SET 
        onboarding_completed = true,
        goals = ARRAY(SELECT jsonb_array_elements_text(p_onboarding_data->'goals')),
        target_audience = p_onboarding_data->'targetAudience',
        selected_services = v_selected_services,
        platforms = ARRAY(SELECT jsonb_array_elements_text(p_onboarding_data->'platforms')),
        budget_range = p_onboarding_data->>'budgetRange',
        workload_level = p_onboarding_data->>'workloadLevel'
    WHERE id = p_company_id;

    RETURN jsonb_build_object(
        'status', 'success',
        'activated_modules', v_selected_services,
        'brand_profile_id', v_brand_profile_id,
        'project_id', v_project_id
    );
END;
$$;
