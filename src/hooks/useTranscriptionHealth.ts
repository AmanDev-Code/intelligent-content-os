"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/apiClient";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TranscriptionStatus = "healthy" | "degraded" | "critical";

export interface EngineEnvStatus {
  [key: string]: boolean;
}

export interface TranscriptionEngine {
  name: string;
  priority: number;
  healthy: boolean;
  configured: boolean;
  circuitOpen: boolean;
  envConfigured: EngineEnvStatus;
}

export interface TranscriptionHealth {
  status: TranscriptionStatus;
  totalEngines: number;
  configuredCount: number;
  healthyCount: number;
  engines: TranscriptionEngine[];
  timestamp: string;
}

export interface ProbeResult {
  engine: string;
  success: boolean;
  latencyMs?: number;
  error?: string;
  timestamp: string;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTranscriptionHealth(autoRefreshMs = 15000) {
  const [data, setData] = useState<TranscriptionHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setError(null);
      const res = await apiClient.get("/admin/transcription/health");

      // Guard: if the response is an error object (401/403), don't set data
      if (!res || res.statusCode || res.error || !res.engines) {
        const msg = res?.message || res?.error || "Unexpected API response";
        setError(msg);
        return;
      }

      const mapped: TranscriptionHealth = {
        status: res.status ?? "healthy",
        totalEngines: res.totalEngines ?? 0,
        configuredCount: res.configuredCount ?? 0,
        healthyCount: res.healthyCount ?? 0,
        engines: Array.isArray(res.engines)
          ? res.engines.map((e: any) => ({
              name: e?.name ?? "unknown",
              priority: e?.priority ?? 99,
              healthy: e?.healthy ?? false,
              configured: e?.configured ?? false,
              circuitOpen: e?.circuitOpen ?? false,
              envConfigured: e?.envConfigured ?? {},
            }))
          : [],
        timestamp: res.timestamp ?? new Date().toISOString(),
      };

      setData(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transcription health");
    } finally {
      setLoading(false);
    }
  }, []);

  const resetCircuit = useCallback(async (engine: string) => {
    await apiClient.post(`/admin/transcription/circuits/${encodeURIComponent(engine)}/reset`);
    await fetchHealth();
  }, [fetchHealth]);

  const probeEngine = useCallback(async (engine: string): Promise<ProbeResult | null> => {
    try {
      const res = await apiClient.get(`/admin/transcription/test/${encodeURIComponent(engine)}`);
      return res as ProbeResult;
    } catch (err) {
      return {
        engine,
        success: false,
        error: err instanceof Error ? err.message : "Probe failed",
        timestamp: new Date().toISOString(),
      };
    }
  }, []);

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
    resetCircuit,
    probeEngine,
  };
}
