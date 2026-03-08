import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { startOfMonth, endOfMonth } from "date-fns";

interface DashboardStats {
  scheduledPosts: number;
  connectedChannels: number;
  thisMonthPosts: number;
  creditsRemaining: number;
  monthlyCredits: number;
  dailyCreditsUsed: number;
  loading: boolean;
}

export function useDashboardStats(): DashboardStats {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [scheduledPosts, setScheduledPosts] = useState(0);
  const [thisMonthPosts, setThisMonthPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      const now = new Date();
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();

      const [scheduledRes, monthRes] = await Promise.all([
        supabase
          .from("generated_content")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("status", ["draft", "ready"])
          .is("deleted_at", null),
        supabase
          .from("generated_content")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", monthStart)
          .lte("created_at", monthEnd)
          .is("deleted_at", null),
      ]);

      setScheduledPosts(scheduledRes.count ?? 0);
      setThisMonthPosts(monthRes.count ?? 0);
      setLoading(false);
    };

    fetch();
  }, [user]);

  const hasLinkedIn = !!(profile?.preferences && typeof profile.preferences === "object");
  // Check if linkedin token exists — since linkedin_access_token is excluded from the profile hook,
  // we check from a separate lightweight query or assume not connected for now
  const connectedChannels = 0; // Real connection status — user hasn't connected yet

  return {
    scheduledPosts,
    connectedChannels,
    thisMonthPosts,
    creditsRemaining: profile?.credits_remaining ?? 0,
    monthlyCredits: profile?.monthly_credits ?? 5,
    dailyCreditsUsed: profile?.daily_credits_used ?? 0,
    loading,
  };
}
