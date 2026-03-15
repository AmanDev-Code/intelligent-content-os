-- increment_daily_credits RPC function
-- Atomically increments daily_credits_used by 1, resetting the counter if
-- the last reset was on a previous calendar day (UTC).
CREATE OR REPLACE FUNCTION public.increment_daily_credits(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  UPDATE profiles
  SET
    daily_credits_used = CASE
      WHEN daily_credits_reset_at::date < now()::date THEN 1
      ELSE daily_credits_used + 1
    END,
    daily_credits_reset_at = CASE
      WHEN daily_credits_reset_at::date < now()::date THEN now()
      ELSE daily_credits_reset_at
    END,
    updated_at = now()
  WHERE id = user_id;
END;
$$;
