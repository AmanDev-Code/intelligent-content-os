"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

export function PostHogInit({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
    posthog.init(key, {
      api_host: host,
      capture_pageview: false,
      persistence: "localStorage+cookie",
    });
  }, []);

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
