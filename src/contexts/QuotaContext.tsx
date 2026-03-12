import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/apiClient";
import type { UserQuota } from "@/services/dataService";

interface QuotaContextValue {
  quota: UserQuota | null;
  loading: boolean;
  refreshQuota: () => Promise<void>;
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

export function QuotaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [quota, setQuota] = useState<UserQuota | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshQuota = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await api.quota.get();
      setQuota(data);
    } catch (error) {
      console.error("QuotaContext: Error fetching quota", error);
      setQuota(defaultFallbackQuota(user.id));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      refreshQuota();
    } else {
      setQuota(null);
    }
  }, [user?.id, refreshQuota]);

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
