import type { Metadata } from "next";
import { getSiteUrl, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Read the ${siteName} Terms of Use — the rules and conditions governing your use of our AI social media platform.`,
  alternates: { canonical: `${getSiteUrl().replace(/\/$/, "")}/terms-of-use` },
  robots: { index: true, follow: true },
  openGraph: {
    title: `Terms of Use | ${siteName}`,
    description: `The rules and conditions for using ${siteName}.`,
    url: `${getSiteUrl().replace(/\/$/, "")}/terms-of-use`,
    type: "website",
  },
};

export { default } from "@/views/TermsOfUse";
