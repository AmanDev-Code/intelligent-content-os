import type { Metadata } from "next";
import { getSiteUrl, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Read ${siteName}'s Privacy Policy to understand how we collect, use, and protect your personal data.`,
  alternates: { canonical: `${getSiteUrl().replace(/\/$/, "")}/privacy-policy` },
  robots: { index: true, follow: true },
  openGraph: {
    title: `Privacy Policy | ${siteName}`,
    description: `How ${siteName} handles your personal data.`,
    url: `${getSiteUrl().replace(/\/$/, "")}/privacy-policy`,
    type: "website",
  },
};

export { default } from "@/views/PrivacyPolicy";
