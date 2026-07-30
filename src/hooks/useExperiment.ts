"use client";

/**
 * useExperiment — thin wrapper around PostHog feature flags for A/B testing.
 *
 * PostHog handles the assignment (server-side or bootstrap), we just read the
 * flag value on the client and expose it as a typed variant string.
 *
 * Works with:
 *   - Self-hosted PostHog (Docker) — set NEXT_PUBLIC_POSTHOG_HOST to your VM URL
 *   - PostHog Cloud — the default
 *
 * Usage:
 *   const variant = useExperiment("landing-hero-h1", ["control", "test-a", "test-b"]);
 *   return <h1>{variant === "test-a" ? "Copy A" : "Copy B"}</h1>;
 *
 * Design notes:
 *   - Returns "control" (or the first variant in the tuple) until PostHog has
 *     loaded, so SSR/first paint is stable. This means server-rendered HTML
 *     always shows control; PostHog swaps variants after hydration.
 *   - Exposes `$feature_flag_called` automatically via posthog.getFeatureFlag,
 *     so PostHog links exposure to downstream conversion events.
 *   - No-op if PostHog isn't configured (dev without NEXT_PUBLIC_POSTHOG_KEY).
 */

import { useEffect, useState } from "react";
import posthog from "posthog-js";

export type ExperimentVariant<V extends readonly string[]> = V[number];

interface UseExperimentOptions {
  /**
   * If true, force a specific variant regardless of PostHog assignment.
   * Useful for local dev, screenshots, and QA. Reads from
   * `?experiment_<key>=<variant>` in the URL query string.
   */
  respectUrlOverride?: boolean;
}

export function useExperiment<V extends readonly string[]>(
  flagKey: string,
  variants: V,
  options: UseExperimentOptions = {},
): ExperimentVariant<V> {
  const { respectUrlOverride = true } = options;
  const control = variants[0] as ExperimentVariant<V>;
  const [variant, setVariant] = useState<ExperimentVariant<V>>(control);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Allow ?experiment_<key>=<variant> URL overrides for QA / previews.
    if (respectUrlOverride) {
      const params = new URLSearchParams(window.location.search);
      const override = params.get(`experiment_${flagKey}`);
      if (override && (variants as readonly string[]).includes(override)) {
        setVariant(override as ExperimentVariant<V>);
        return;
      }
    }

    // No PostHog key → stay on control silently.
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    let cancelled = false;
    const readFlag = () => {
      if (cancelled) return;
      const flag = posthog.getFeatureFlag(flagKey);
      if (typeof flag === "string" && (variants as readonly string[]).includes(flag)) {
        setVariant(flag as ExperimentVariant<V>);
      }
    };

    // PostHog loads flags asynchronously — wait for the load callback
    // before reading. Falls back to polling if the callback API is unavailable.
    if (posthog.__loaded) {
      readFlag();
    } else {
      const timer = setInterval(() => {
        if (posthog.__loaded) {
          clearInterval(timer);
          readFlag();
        }
      }, 100);
      // Give up after 3s — user experience should not stall on a flag lookup.
      setTimeout(() => clearInterval(timer), 3000);
    }

    // Re-read when PostHog re-evaluates flags (e.g. identify() fires later).
    posthog.onFeatureFlags(() => readFlag());

    return () => {
      cancelled = true;
    };
  }, [flagKey, respectUrlOverride, variants]);

  return variant;
}

/**
 * Track a manual conversion event tied to the current experiment assignment.
 * PostHog automatically attaches feature-flag properties to every capture,
 * so you rarely need to pass variant explicitly — this helper exists for
 * cases where you want a named goal (e.g. "signup_completed") tied to the
 * experiment key for easier funnel building in PostHog UI.
 */
export function trackExperimentConversion(
  flagKey: string,
  goalName: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.capture(goalName, {
    ...properties,
    experiment_key: flagKey,
    experiment_variant: posthog.getFeatureFlag(flagKey),
  });
}
