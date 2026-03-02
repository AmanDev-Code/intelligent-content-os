
-- =====================================================
-- PART 1: ENUMS
-- =====================================================

CREATE TYPE public.content_status AS ENUM ('draft', 'generating', 'ready', 'posted', 'failed');
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trialing');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- =====================================================
-- PART 2: ALTER EXISTING TABLES
-- =====================================================

-- generated_content: convert status to enum
ALTER TABLE public.generated_content 
  ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.generated_content 
  ALTER COLUMN status TYPE public.content_status USING status::public.content_status;
ALTER TABLE public.generated_content 
  ALTER COLUMN status SET DEFAULT 'draft'::public.content_status;

-- generated_content: constrain ai_score
ALTER TABLE public.generated_content 
  ALTER COLUMN ai_score TYPE NUMERIC(4,1);

-- generated_content: soft delete
ALTER TABLE public.generated_content 
  ADD COLUMN deleted_at TIMESTAMPTZ;

-- generation_logs: retry count
ALTER TABLE public.generation_logs 
  ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0;

-- profiles: LinkedIn tokens
ALTER TABLE public.profiles 
  ADD COLUMN linkedin_access_token TEXT,
  ADD COLUMN linkedin_refresh_token TEXT,
  ADD COLUMN linkedin_expires_at TIMESTAMPTZ;

-- =====================================================
-- PART 3: NEW TABLES
-- =====================================================

-- generation_jobs
CREATE TABLE public.generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.generated_content(id) ON DELETE SET NULL,
  status public.content_status NOT NULL DEFAULT 'generating',
  progress INTEGER NOT NULL DEFAULT 0,
  current_stage TEXT,
  webhook_url TEXT,
  response JSONB,
  error TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status public.subscription_status NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ai_config (singleton)
CREATE TABLE public.ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL DEFAULT 'gpt-4o',
  temperature NUMERIC NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 2000,
  enable_images BOOLEAN NOT NULL DEFAULT true,
  enable_carousel BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Singleton enforcement
CREATE UNIQUE INDEX ai_config_singleton ON public.ai_config ((1));

-- feature_flags
CREATE TABLE public.feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- =====================================================
-- PART 4: TRIGGERS
-- =====================================================

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generated_content_updated_at
  BEFORE UPDATE ON public.generated_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generation_jobs_updated_at
  BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_config_updated_at
  BEFORE UPDATE ON public.ai_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Progress validation trigger for generation_jobs
CREATE OR REPLACE FUNCTION public.validate_job_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.progress < 0 OR NEW.progress > 100 THEN
    RAISE EXCEPTION 'progress must be between 0 and 100';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_generation_jobs_progress
  BEFORE INSERT OR UPDATE ON public.generation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.validate_job_progress();

-- =====================================================
-- PART 5: INDEXES
-- =====================================================

CREATE INDEX idx_gc_user_id ON public.generated_content(user_id);
CREATE INDEX idx_gc_status ON public.generated_content(status);
CREATE INDEX idx_gc_deleted_at ON public.generated_content(deleted_at);
CREATE INDEX idx_logs_user_id ON public.generation_logs(user_id);
CREATE INDEX idx_jobs_user_id ON public.generation_jobs(user_id);
CREATE INDEX idx_jobs_status ON public.generation_jobs(status);

-- =====================================================
-- PART 6: SECURITY - has_role function
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =====================================================
-- PART 7: RLS POLICIES
-- =====================================================

-- generation_jobs RLS
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own jobs" ON public.generation_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.generation_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.generation_jobs FOR UPDATE USING (auth.uid() = user_id);

-- subscriptions RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ai_config RLS (read-only for authenticated)
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view config" ON public.ai_config FOR SELECT TO authenticated USING (true);

-- feature_flags RLS (read-only for authenticated)
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view flags" ON public.feature_flags FOR SELECT TO authenticated USING (true);

-- user_roles RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
