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
  
  // Fetch guards to prevent duplicate requests
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);
  const lastUserIdRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (force = false) => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    
    // Prevent concurrent fetches
    if (fetchingRef.current) return;
    
    // Skip if fetched recently (unless forced or user changed)
    const now = Date.now();
    const userChanged = lastUserIdRef.current !== user.id;
    if (!force && !userChanged && now - lastFetchRef.current < PROFILE_CACHE_TTL) return;
    
    fetchingRef.current = true;
    lastUserIdRef.current = user.id;
    setLoading(true);
    
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, plan, credits_remaining, monthly_credits, daily_credits_used, daily_credits_reset_at, preferences, created_at, updated_at")
        .eq("id", user.id)
        .single();
      setProfile(data);
      lastFetchRef.current = Date.now();
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      lastUserIdRef.current = null;
      lastFetchRef.current = 0;
      return;
    }
    fetchProfile();
  }, [user?.id, fetchProfile]);

  return { profile, loading, refetch: () => fetchProfile(true) };
}
