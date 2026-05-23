"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/apiClient";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = "trndinn_launch_pricing_cache";

export type LaunchPricingCurrencyTier = {
  listMonthly: number;
  listYearly: number;
  offerMonthly: number;
  offerYearly: number;
};

export type LaunchPricingPlan = {
  planType: string;
  INR: LaunchPricingCurrencyTier;
  USD: LaunchPricingCurrencyTier;
};

export type LaunchPricingConfig = {
  id: string;
  label: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  plans: LaunchPricingPlan[];
  conversionRateINR: number;
  bannerText: string | null;
  badgeText: string | null;
};

type CachedData = {
  data: LaunchPricingConfig | null;
  timestamp: number;
};

function parseLaunchPricingResponse(raw: unknown): LaunchPricingConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;
  if ("config" in body) {
    const cfg = body.config;
    return cfg && typeof cfg === "object" ? (cfg as LaunchPricingConfig) : null;
  }
  const nested = body.data;
  if (nested && typeof nested === "object" && "config" in (nested as Record<string, unknown>)) {
    const cfg = (nested as Record<string, unknown>).config;
    return cfg && typeof cfg === "object" ? (cfg as LaunchPricingConfig) : null;
  }
  return null;
}

function getCachedData(): LaunchPricingConfig | null | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed: CachedData = JSON.parse(raw);
    if (Date.now() - parsed.timestamp >= CACHE_TTL_MS) {
      return undefined;
    }
    // Only reuse cache for an active offer (avoid stale "off" after admin enables)
    if (parsed.data?.isActive) {
      return parsed.data;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function setCachedData(data: LaunchPricingConfig | null) {
  if (typeof window === "undefined") return;
  try {
    if (data?.isActive) {
      const cache: CachedData = { data, timestamp: Date.now() };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

/** Clear launch-pricing client cache (call after admin enable/disable/update). */
export function clearLaunchPricingClientCache(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export type UseActiveLaunchPricingReturn = {
  config: LaunchPricingConfig | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

/**
 * Hook to fetch active launch pricing configuration.
 * Caches active configs for 5 minutes in localStorage.
 * Endpoint: GET /public/launch-pricing/active
 */
export function useActiveLaunchPricing(): UseActiveLaunchPricingReturn {
  const [config, setConfig] = useState<LaunchPricingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = useCallback(async (skipCache = false) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!skipCache) {
        const cached = getCachedData();
        if (cached !== undefined) {
          setConfig(cached);
          setIsLoading(false);
          return;
        }
      }

      const raw = await apiClient.get("/public/launch-pricing/active");
      const configData = parseLaunchPricingResponse(raw);

      setConfig(configData);
      setCachedData(configData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch launch pricing"));
      setConfig(null);
      clearLaunchPricingClientCache();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const refetch = useCallback(async () => {
    clearLaunchPricingClientCache();
    await fetchConfig(true);
  }, [fetchConfig]);

  return {
    config,
    isLoading,
    error,
    refetch,
  };
}
