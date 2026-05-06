"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import posthog from "posthog-js";

function PostHogPageViewInner() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    const url = `${pathname}${search?.toString() ? `?${search.toString()}` : ""}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, search]);

  return null;
}

export function PostHogPageProvider() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;
  return (
    <Suspense fallback={null}>
      <PostHogPageViewInner />
    </Suspense>
  );
}
