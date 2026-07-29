"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/apiClient";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PoolStatus = "healthy" | "degraded" | "critical";

export interface SessionInfo {
  accountId: string;
  health: "healthy" | "cooldown" | "dead" | "checkpoint";
  lastUsed: string | null;
  totalRequests: number;
  consecutiveFailures: number;
  cookieCount: number;
}

export interface PoolStats {
  total: number;
  healthy: number;
  cooldown: number;
  dead: number;
  checkpoint: number;
}

export interface CircuitBreaker {
  engine: string;
  state: "closed" | "open" | "half-open";
  failures: number;
  lastFailure: string | null;
}

export interface MediaEngineAlert {
  correlationId: string;
  severity: "info" | "warning" | "critical";
  event: string;
  accountId?: string;
  engine?: string;
  platform?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface MediaEngineHealth {
  status: PoolStatus;
  pool: PoolStats;
  sessions: SessionInfo[];
  circuits: Record<string, CircuitBreaker>;
  alerts: MediaEngineAlert[];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMediaEngineHealth(autoRefreshMs = 15000) {
  const [data, setData] = useState<MediaEngineHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setError(null);
      const res = await apiClient.get("/admin/media-engine/health");

      // Guard: if the response is an error object (401/403), don't set data
      if (!res || res.statusCode || res.error || !res.pool) {
        const msg = res?.message || res?.error || "Unexpected API response";
        setError(msg);
        return;
      }

      // Defensive mapping — handle any response shape
      const poolData = res.pool ?? {};
      const mapped: MediaEngineHealth = {
        status: res.status ?? "healthy",
        pool: {
          total: poolData.total ?? 0,
          healthy: poolData.healthy ?? 0,
          cooldown: poolData.cooldown ?? 0,
          dead: poolData.dead ?? 0,
          checkpoint: poolData.checkpoint ?? 0,
        },
        sessions: Array.isArray(poolData.sessions)
          ? poolData.sessions.map((s: any) => ({
              accountId: s?.accountId ?? "unknown",
              health: s?.health ?? "dead",
              lastUsed: s?.lastUsed || null,
              totalRequests: s?.totalRequests ?? 0,
              consecutiveFailures: s?.consecutiveFailures ?? 0,
              cookieCount: s?.cookieCount ?? 0,
            }))
          : [],
        circuits: res.circuits ?? {},
        alerts: Array.isArray(res.recentAlerts) ? res.recentAlerts : [],
      };

      setData(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch health data");
    } finally {
      setLoading(false);
    }
  }, []);

  const removeSession = useCallback(async (accountId: string) => {
    await apiClient.delete(`/admin/media-engine/sessions/${encodeURIComponent(accountId)}`);
    await fetchHealth();
  }, [fetchHealth]);

  const resetCircuit = useCallback(async (engine: string) => {
    await apiClient.post(`/admin/media-engine/circuits/${encodeURIComponent(engine)}/reset`);
    await fetchHealth();
  }, [fetchHealth]);

  const sendTestAlert = useCallback(async () => {
    await apiClient.post("/admin/media-engine/test-alert");
    await fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    fetchHealth();

    if (autoRefreshMs > 0) {
      intervalRef.current = setInterval(fetchHealth, autoRefreshMs);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchHealth, autoRefreshMs]);

  return {
    data,
    loading,
    error,
    refetch: fetchHealth,
    removeSession,
    resetCircuit,
    sendTestAlert,
  };
}
