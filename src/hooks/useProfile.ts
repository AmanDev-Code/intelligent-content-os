import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Omit<Tables<"profiles">, "linkedin_access_token" | "linkedin_refresh_token" | "linkedin_expires_at">;

const PROFILE_CACHE_TTL = 5000; // 5 seconds

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const lastFetchRef = useRef<number>(0);
  const lastUserIdRef = useRef<string | null>(null);

  const fetchProfile = useCallback(
    async (force = false): Promise<Profile | null> => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return null;
      }

      const now = Date.now();
      const userChanged = lastUserIdRef.current !== user.id;

      if (!force && !userChanged && now - lastFetchRef.current < PROFILE_CACHE_TTL) {
        return null;
      }

      lastUserIdRef.current = user.id;
      setLoading(true);

      try {
        const { data } = await supabase
          .from("profiles")
          .select(
            "id, username, full_name, avatar_url, author_bio, author_role, author_avatar_url, author_linkedin_url, plan, credits_remaining, monthly_credits, daily_credits_used, daily_credits_reset_at, preferences, created_at, updated_at",
          )
          .eq("id", user.id)
          .single();
        setProfile(data);
        lastFetchRef.current = Date.now();
        return data;
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  const refetch = useCallback(() => fetchProfile(true), [fetchProfile]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      lastUserIdRef.current = null;
      lastFetchRef.current = 0;
      return;
    }
    void fetchProfile();
  }, [user?.id, fetchProfile]);

  return { profile, loading, refetch };
}
