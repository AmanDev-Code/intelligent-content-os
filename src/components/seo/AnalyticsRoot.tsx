"use client";

import { Suspense, lazy } from "react";

// Lazily load heavy analytics to reduce initial bundle size
const CoreWebVitalsReporter = lazy(
  () => import("@/components/analytics/CoreWebVitalsReporter")
);

/**
 * AnalyticsRoot - Root-level analytics wrapper
 * 
 * Includes:
 * - Core Web Vitals reporting
 * - Page view tracking
 * - Performance monitoring
 * 
 * This component should be added to the root layout near the body end
 * to avoid blocking initial render.
 * 
 * Usage:
 * ```tsx
 * // In layout.tsx
 * import { AnalyticsRoot } from "@/components/seo/AnalyticsRoot";
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <AnalyticsRoot />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function AnalyticsRoot() {
  return (
    <Suspense fallback={null}>
      <CoreWebVitalsReporter />
    </Suspense>
  );
}

/**
 * WebVitalsLogger - Logs Core Web Vitals to console (development)
 * Use this in development to track performance metrics
 */
export function WebVitalsLogger() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // Core Web Vitals Logger
          if ('web-vitals' in window) {
            import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
              onCLS(console.log);
              onFID(console.log);
              onLCP(console.log);
              onFCP(console.log);
              onTTFB(console.log);
            });
          }
        `,
      }}
    />
  );
}
