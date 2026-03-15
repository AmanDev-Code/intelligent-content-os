import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Omit<Tables<"profiles">, "linkedin_access_token" | "linkedin_refresh_token" | "linkedin_expires_at">;

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, plan, credits_remaining, monthly_credits, daily_credits_used, daily_credits_reset_at, preferences, created_at, updated_at")
      .eq("id", user.id)
      .single();
    setProfile(data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [user?.id, fetchProfile]);

  return { profile, loading, refetch: fetchProfile };
}
