
-- A. Update handle_new_user() to assign default 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- B. Index for feed performance
CREATE INDEX IF NOT EXISTS idx_gc_created_at ON public.generated_content(created_at DESC);

-- C. Unique subscription per user
ALTER TABLE public.subscriptions ADD CONSTRAINT unique_user_subscription UNIQUE (user_id);
