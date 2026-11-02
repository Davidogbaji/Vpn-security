-- ====================================================================
-- VPN AND PROXY IP DETECTION SYSTEM: SUPABASE DATABASE INITIAL MIGRATION
-- Migration 001: Core Schemas, Tables, Triggers, and Foreign Keys
-- ====================================================================

-- 1. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for role lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. Investigations Table (stores user-saved IP analysis runs)
CREATE TABLE IF NOT EXISTS public.investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ip_address TEXT NOT NULL,
    ip_version TEXT NOT NULL DEFAULT 'IPv4',
    country TEXT,
    city TEXT,
    isp TEXT,
    asn TEXT,
    detection_verdict TEXT NOT NULL,
    risk_score INTEGER NOT NULL DEFAULT 0,
    is_vpn BOOLEAN NOT NULL DEFAULT false,
    is_proxy BOOLEAN NOT NULL DEFAULT false,
    is_tor BOOLEAN NOT NULL DEFAULT false,
    is_relay BOOLEAN NOT NULL DEFAULT false,
    is_hosting BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for fast searching and filtering
CREATE INDEX IF NOT EXISTS idx_investigations_user_id ON public.investigations(user_id);
CREATE INDEX IF NOT EXISTS idx_investigations_ip_address ON public.investigations(ip_address);
CREATE INDEX IF NOT EXISTS idx_investigations_verdict ON public.investigations(detection_verdict);
CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON public.investigations(created_at DESC);

-- 3. Detection Results Table (detailed provider signals and metadata)
CREATE TABLE IF NOT EXISTS public.detection_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL DEFAULT 'IPLogs',
    provider_request_id TEXT,
    raw_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    network_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    explanation TEXT,
    analyzed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_detection_results_inv_id ON public.detection_results(investigation_id);

-- 4. Report Records Table (tracks generated export artifacts)
CREATE TABLE IF NOT EXISTS public.report_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    investigation_id UUID REFERENCES public.investigations(id) ON DELETE SET NULL,
    report_format TEXT NOT NULL CHECK (report_format IN ('pdf', 'docx', 'csv', 'json')),
    file_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_report_records_user_id ON public.report_records(user_id);

-- 5. System Audit Logs Table (tracks security events and administrative operations)
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_resource TEXT,
    ip_address TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.system_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.system_audit_logs(created_at DESC);

-- Automatic Profile Creation Trigger on Supabase User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
