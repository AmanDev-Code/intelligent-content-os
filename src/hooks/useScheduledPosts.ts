import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ScheduledPost {
  id: string;
  title: string;
  status: string;
  created_at: string;
  published_at: string | null;
}

export function useScheduledPosts(startDate: string, endDate: string) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("generated_content")
        .select("id, title, status, created_at, published_at")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: true });

      setPosts((data as ScheduledPost[] | null) ?? []);
      setLoading(false);
    };

    fetchPosts();
  }, [user, startDate, endDate]);

  return { posts, loading };
}
