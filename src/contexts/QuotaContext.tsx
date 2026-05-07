import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/apiClient";
import type { UserQuota } from "@/services/dataService";

interface QuotaContextValue {
  quota: UserQuota | null;
  loading: boolean;
  refreshQuota: (force?: boolean) => Promise<void>;
}

const QuotaContext = createContext<QuotaContextValue | null>(null);

const defaultFallbackQuota = (userId: string): UserQuota => ({
  userId,
  totalCredits: 10000,
  usedCredits: 0,
  remainingCredits: 10000,
  percentageUsed: 0,
  planType: "ultimate",
  resetDate: new Date().toISOString(),
});

const QUOTA_CACHE_TTL = 5000; // 5 seconds

export function QuotaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [quota, setQuota] = useState<UserQuota | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch guards to prevent duplicate requests
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);
  const lastUserIdRef = useRef<string | null>(null);

  const refreshQuota = useCallback(async (force = false) => {
    if (!user?.id) return;
    
    // Prevent concurrent fetches
    if (fetchingRef.current) return;
    
    // Skip if fetched recently (unless forced or user changed)
    const now = Date.now();
    const userChanged = lastUserIdRef.current !== user.id;
    if (!force && !userChanged && now - lastFetchRef.current < QUOTA_CACHE_TTL) return;
    
    fetchingRef.current = true;
    lastUserIdRef.current = user.id;
    setLoading(true);
    
    try {
      const data = await api.quota.get();
      setQuota(data);
      lastFetchRef.current = Date.now();
    } catch (error) {
      console.error("QuotaContext: Error fetching quota", error);
      setQuota(defaultFallbackQuota(user.id));
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      refreshQuota();
    } else {
      setQuota(null);
      lastUserIdRef.current = null;
      lastFetchRef.current = 0;
    }
  }, [user?.id, refreshQuota]);

  useEffect(() => {
    const handler = () => {
      void refreshQuota(true); // Force refresh on subscription update
    };
    window.addEventListener("trndinn:subscription-updated", handler);
    return () => {
      window.removeEventListener("trndinn:subscription-updated", handler);
    };
  }, [refreshQuota]);

  useEffect(() => {
    const handler = (event: Event) => {
      const { balance } = (event as CustomEvent).detail || {};
      if (typeof balance === "number") {
        setQuota((prev) =>
          prev
            ? {
                ...prev,
                remainingCredits: balance,
                usedCredits: prev.totalCredits - balance,
                percentageUsed: Math.round(
                  ((prev.totalCredits - balance) / prev.totalCredits) * 100,
                ),
              }
            : prev,
        );
      }
    };
    window.addEventListener("trndinn:credits-updated", handler);
    return () => {
      window.removeEventListener("trndinn:credits-updated", handler);
    };
  }, []);

  const value: QuotaContextValue = {
    quota,
    loading,
    refreshQuota,
  };

  return (
    <QuotaContext.Provider value={value}>
      {children}
    </QuotaContext.Provider>
  );
}

export function useQuota(): QuotaContextValue {
  const ctx = useContext(QuotaContext);
  if (!ctx) {
    throw new Error("useQuota must be used within QuotaProvider");
  }
  return ctx;
}
