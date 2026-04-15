-- ==========================================
-- REVENUE INTELLIGENCE & EXECUTIVE COMMAND SCHEMA
-- ==========================================

-- 1. Extend Companies for Intelligence
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS health_score INT DEFAULT 100; -- 0-100
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS lifetime_value DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS mrr DECIMAL(12,2) DEFAULT 0.00;

-- 2. Service Performance Tracking
CREATE TABLE IF NOT EXISTS public.service_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type TEXT NOT NULL, -- Lead Gen, Social, SEO, etc.
    revenue_generated DECIMAL(12,2) DEFAULT 0.00,
    cost_estimate DECIMAL(12,2) DEFAULT 0.00,
    profit_estimate DECIMAL(12,2) DEFAULT 0.00,
    performance_score INT DEFAULT 0,
    active_clients_count INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Revenue Metrics Table (Historical snapshots for trend analysis)
CREATE TABLE IF NOT EXISTS public.revenue_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT NOT NULL, -- YYYY-MM
    total_mrr DECIMAL(12,2) DEFAULT 0.00,
    total_revenue_collected DECIMAL(12,2) DEFAULT 0.00,
    new_clients_count INT DEFAULT 0,
    churn_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Intelligence Logic: Update Client Health Score (Stored Procedure)
CREATE OR REPLACE FUNCTION public.recalculate_client_health(p_company_id UUID)
RETURNS INT AS $$
DECLARE
    v_task_completion_rate DECIMAL;
    v_interaction_days INT;
    v_payment_status INT;
    v_final_score INT;
BEGIN
    -- 1. Completion Rate (0-40 points)
    SELECT 
        COALESCE(
            (COUNT(*) FILTER (WHERE status = 'done')::DECIMAL / NULLIF(COUNT(*), 0)) * 40, 
            30 -- Default if no tasks
        ) INTO v_task_completion_rate
    FROM public.tasks WHERE company_id = p_company_id;

    -- 2. Interaction Recency (0-30 points)
    SELECT EXTRACT(DAY FROM (now() - COALESCE(last_interaction_at, created_at))) INTO v_interaction_days
    FROM public.companies WHERE id = p_company_id;
    
    v_interaction_days := CASE 
        WHEN v_interaction_days <= 1 THEN 30
        WHEN v_interaction_days <= 7 THEN 20
        WHEN v_interaction_days <= 14 THEN 10
        ELSE 0
    END;

    -- 3. Payment Health (0-30 points)
    -- All invoices paid?
    SELECT CASE WHEN EXISTS (SELECT 1 FROM public.invoices WHERE company_id = p_company_id AND status = 'overdue') THEN 0 ELSE 30 END INTO v_payment_status;

    v_final_score := LEAST(100, GREATEST(0, ROUND(v_task_completion_rate + v_interaction_days + v_payment_status)));
    
    UPDATE public.companies SET health_score = v_final_score WHERE id = p_company_id;
    
    RETURN v_final_score;
END;
$$ LANGUAGE plpgsql;

-- 5. Intelligence Logic: Update Revenue Metrics
CREATE OR REPLACE FUNCTION public.update_revenue_intelligence()
RETURNS TRIGGER AS $$
BEGIN
    -- This would be called on invoice payment or company update
    -- Recap MRR
    UPDATE public.companies SET mrr = monthly_amount;
    
    -- Recap LTV
    UPDATE public.companies c
    SET lifetime_value = (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.invoices i
        WHERE i.company_id = c.id AND i.status = 'paid'
    );
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for revenue
DROP TRIGGER IF EXISTS tr_update_revenue ON public.invoices;
CREATE TRIGGER tr_update_revenue
AFTER INSERT OR UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_revenue_intelligence();

-- 6. RLS
ALTER TABLE public.service_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to intelligence" ON public.service_performance FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admins have full access to metrics" ON public.revenue_metrics FOR ALL USING (public.get_user_role() = 'admin');

-- Clients have NO access
CREATE POLICY "Clients no access to intelligence" ON public.service_performance FOR SELECT USING (false);
CREATE POLICY "Clients no access to metrics" ON public.revenue_metrics FOR SELECT USING (false);

-- 7. Initial Service Data Populate
INSERT INTO public.service_performance (service_type, revenue_generated, cost_estimate, profit_estimate, performance_score, active_clients_count)
VALUES 
('Growth OS', 125000, 45000, 80000, 92, 12),
('Social Engine', 85000, 30000, 55000, 85, 24),
('Lead Generation', 95000, 50000, 45000, 78, 15),
('Strategy/Consulting', 45000, 10000, 35000, 95, 8)
ON CONFLICT DO NOTHING;
