-- ====================================================================
-- VPN AND PROXY IP DETECTION SYSTEM: ROW LEVEL SECURITY (RLS) POLICIES
-- Migration 002: Zero-Trust Row-Level Access Controls
-- ====================================================================

-- Enable RLS on all operational tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the active requester holds the 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 1. Profiles Table Policies
-- --------------------------------------------------------------------
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- --------------------------------------------------------------------
-- 2. Investigations Table Policies (Strict User Isolation)
-- --------------------------------------------------------------------
CREATE POLICY "Users can view own investigations"
  ON public.investigations FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own investigations"
  ON public.investigations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own investigations"
  ON public.investigations FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- --------------------------------------------------------------------
-- 3. Detection Results Table Policies
-- --------------------------------------------------------------------
CREATE POLICY "Users can view detection results for their investigations"
  ON public.detection_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.investigations inv
      WHERE inv.id = detection_results.investigation_id
      AND (inv.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can insert detection results for their investigations"
  ON public.detection_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investigations inv
      WHERE inv.id = detection_results.investigation_id
      AND inv.user_id = auth.uid()
    )
  );

-- --------------------------------------------------------------------
-- 4. Report Records Table Policies
-- --------------------------------------------------------------------
CREATE POLICY "Users can view own report records"
  ON public.report_records FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own report records"
  ON public.report_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 5. System Audit Logs Policies (Administrative Confidentiality)
-- --------------------------------------------------------------------
CREATE POLICY "Admins can view system audit logs"
  ON public.system_audit_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "System can append audit logs"
  ON public.system_audit_logs FOR INSERT
  WITH CHECK (true);
