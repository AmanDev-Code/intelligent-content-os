"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import type { MediaEngineAlert } from "./useMediaEngineHealth";

// Re-export the event type (same shape as MediaEngineAlert)
export type MediaEngineEvent = MediaEngineAlert;

export type SeverityFilter = "all" | "info" | "warning" | "critical";

interface UseMediaEngineEventsOptions {
  /** Auto-refresh interval in ms. 0 = disabled. Default: 10000 */
  autoRefreshMs?: number;
  /** Max events to fetch. Default: 100 */
  limit?: number;
  /** Severity filter. Default: "all" */
  severity?: SeverityFilter;
}

export function useMediaEngineEvents(options: UseMediaEngineEventsOptions = {}) {
  const { autoRefreshMs = 10000, limit = 100, severity = "all" } = options;

  const [events, setEvents] = useState<MediaEngineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams({ limit: String(limit) });
      if (severity !== "all") {
        params.set("severity", severity);
      }

      const res = await apiClient.get(
        `/admin/media-engine/events?${params.toString()}`
      );

      if (!res || res.statusCode || res.error) {
        const msg = res?.message || res?.error || "Unexpected API response";
        setError(msg);
        return;
      }

      const fetched = Array.isArray(res.events) ? res.events : [];
      setEvents(fetched);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch event log"
      );
    } finally {
      setLoading(false);
    }
  }, [limit, severity]);

  useEffect(() => {
    setLoading(true);
    fetchEvents();

    if (autoRefreshMs > 0) {
      intervalRef.current = setInterval(fetchEvents, autoRefreshMs);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchEvents, autoRefreshMs]);

  return { events, loading, error, refetch: fetchEvents };
}
