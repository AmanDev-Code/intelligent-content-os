"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { isCredentialPath } from "@/lib/credentialRoutes";
import { isMarketingPath } from "@/lib/marketingRoutes";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const pathname = usePathname();

  if (!GA_MEASUREMENT_ID || isCredentialPath(pathname)) {
    return null;
  }

  const strategy = isMarketingPath(pathname) ? "lazyOnload" : "afterInteractive";

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy={strategy}
      />
      <Script id="google-analytics" strategy={strategy}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
