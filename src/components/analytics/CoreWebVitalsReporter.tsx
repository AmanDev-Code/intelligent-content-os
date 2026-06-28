"use client";

import { useEffect } from "react";

export default function CoreWebVitalsReporter() {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      // Report performance metrics in development
      try {
        // Using native Performance API for basic metrics
        const perfData = window.performance;
        if (perfData && perfData.timing) {
          const timing = perfData.timing;
          const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
          console.log("[Web Vitals] Page load time:", pageLoadTime, "ms");
        }

        // Observe layout shifts if available
        if ("PerformanceObserver" in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === "layout-shift") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                console.log("[Web Vitals] CLS:", (entry as any).value);
              }
            }
          });

          try {
            observer.observe({ type: "layout-shift", buffered: true } as PerformanceObserverInit);
          } catch {
            // Layout shift observer not supported
          }
        }
      } catch {
        // Silently fail if performance APIs not available
      }
    }
  }, []);

  return null;
}
