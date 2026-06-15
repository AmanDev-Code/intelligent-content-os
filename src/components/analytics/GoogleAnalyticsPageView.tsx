"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { isCredentialPath } from "@/lib/credentialRoutes";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function GoogleAnalyticsPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skippedInitial = useRef(false);

  useEffect(() => {
    if (
      !GA_ID ||
      typeof window === "undefined" ||
      isCredentialPath(pathname)
    ) {
      return;
    }

    const qs = searchParams?.toString();
    const pagePath = `${pathname}${qs ? `?${qs}` : ""}`;

    const send = () => {
      if (!window.gtag) return;
      window.gtag("config", GA_ID, {
        page_path: pagePath,
        page_location: `${window.location.origin}${pagePath}`,
      });
    };

    // Initial page_view is sent by <GoogleAnalytics /> in layout — avoid double-count on first paint.
    if (!skippedInitial.current) {
      skippedInitial.current = true;
      return;
    }

    send();
  }, [pathname, searchParams]);

  return null;
}

/** Sends GA4 page_view on client-side navigations (App Router). */
export function GoogleAnalyticsPageView() {
  if (!GA_ID) return null;
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsPageViewInner />
    </Suspense>
  );
}
