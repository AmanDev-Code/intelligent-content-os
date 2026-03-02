
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  credits_remaining INTEGER NOT NULL DEFAULT 5,
  monthly_credits INTEGER NOT NULL DEFAULT 5,
  daily_credits_used INTEGER NOT NULL DEFAULT 0,
  daily_credits_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_categories table
CREATE TABLE public.content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated_content table
CREATE TABLE public.generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.content_categories(id),
  ai_score NUMERIC(4,1),
  status TEXT NOT NULL DEFAULT 'draft',
  visual_url TEXT,
  visual_type TEXT DEFAULT 'image',
  carousel_urls TEXT[],
  hashtags TEXT[],
  ai_reasoning TEXT,
  performance_prediction JSONB,
  suggested_improvements TEXT[],
  linkedin_post_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generation_logs table
CREATE TABLE public.generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.generated_content(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stages JSONB DEFAULT '[]',
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_usage table
CREATE TABLE public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  generations_count INTEGER NOT NULL DEFAULT 0,
  publications_count INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS policies for generated_content
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own content" ON public.generated_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own content" ON public.generated_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own content" ON public.generated_content FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own content" ON public.generated_content FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for generation_logs
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own logs" ON public.generation_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.generation_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_usage
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON public.user_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.user_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON public.user_usage FOR UPDATE USING (auth.uid() = user_id);

-- Content categories are readable by all authenticated users
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view categories" ON public.content_categories FOR SELECT TO authenticated USING (true);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Seed default categories
INSERT INTO public.content_categories (name, description, color) VALUES
  ('Technology', 'Tech trends, AI, software', '#8B5CF6'),
  ('Business', 'Startups, growth, leadership', '#3B82F6'),
  ('Marketing', 'Growth hacking, content strategy', '#EC4899'),
  ('Productivity', 'Tools, workflows, efficiency', '#10B981'),
  ('Industry News', 'Breaking news and analysis', '#F59E0B'),
  ('Personal Brand', 'Thought leadership, storytelling', '#6366F1');
