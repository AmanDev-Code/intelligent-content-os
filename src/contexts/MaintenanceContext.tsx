"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_CONFIG } from "@/lib/constants";

interface MaintenanceStatus {
  active: boolean;
  message?: string;
  scheduledEnd?: string;
}

interface MaintenanceContextValue {
  isMaintenanceActive: boolean;
  isCheckingMaintenance: boolean;
  maintenanceMessage?: string;
  scheduledEnd?: string;
}

const MaintenanceContext = createContext<MaintenanceContextValue>({
  isMaintenanceActive: false,
  isCheckingMaintenance: true,
});

export function useMaintenanceStatus(): MaintenanceContextValue {
  return useContext(MaintenanceContext);
}

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<MaintenanceStatus>({ active: false });
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true);
  const [hasResolvedInitialCheck, setHasResolvedInitialCheck] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/maintenance/status`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as MaintenanceStatus;
        setStatus(data);
        return;
      }

      // Fail closed for non-network errors (e.g., 5xx/4xx): safer than exposing public routes.
      setStatus({
        active: true,
        message: "We are temporarily unavailable. Please check back shortly.",
      });
    } catch {
      // Fail open — network errors must not trigger a false maintenance gate
      setStatus({ active: false });
    } finally {
      if (!hasResolvedInitialCheck) {
        setHasResolvedInitialCheck(true);
        setIsCheckingMaintenance(false);
      }
    }
  }, [hasResolvedInitialCheck]);

  useEffect(() => {
    void fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchStatus();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchStatus]);

  return (
    <MaintenanceContext.Provider
      value={{
        isMaintenanceActive: status.active,
        isCheckingMaintenance,
        maintenanceMessage: status.message,
        scheduledEnd: status.scheduledEnd,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
}
