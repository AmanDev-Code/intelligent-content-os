import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { api } from "@/lib/apiClient";

export type BlogAccessState = {
  canManageBlog: boolean;
  isPlatformAdmin: boolean;
  loading: boolean;
};

export function useBlogAccess(): BlogAccessState {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [state, setState] = useState<BlogAccessState>({
    canManageBlog: false,
    isPlatformAdmin: false,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setState({ canManageBlog: false, isPlatformAdmin: false, loading: false });
      return;
    }
    if (isAdmin) {
      setState({ canManageBlog: true, isPlatformAdmin: true, loading: false });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    void api.blog.myAccess().then((r: { canManageBlog?: boolean; isPlatformAdmin?: boolean }) => {
        if (cancelled) return;
        setState({
          canManageBlog: !!r.canManageBlog,
          isPlatformAdmin: !!r.isPlatformAdmin,
          loading: false,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ canManageBlog: false, isPlatformAdmin: false, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin]);

  return state;
}
