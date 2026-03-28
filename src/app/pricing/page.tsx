import type { Metadata } from "next";
import PricingPage from "@/views/PricingPage";
import { defaultDescription, getSiteUrl, siteName } from "@/lib/site";

const url = getSiteUrl();

export const metadata: Metadata = {
  title: "Pricing",
  description: `${siteName} pricing plans for creators and teams-AI credits, scheduling, analytics, and scaling. Compare Free, Standard, Pro, and Ultimate.`,
  keywords: [
    "Trndinn pricing",
    "social media scheduling price",
    "AI content credits",
    "LinkedIn scheduling tool",
    "content platform pricing",
  ],
  alternates: { canonical: `${url}/pricing` },
  openGraph: {
    title: `Pricing | ${siteName}`,
    description: `Simple plans for serious output. ${defaultDescription.slice(0, 120)}...`,
    url: "/pricing",
    type: "website",
    siteName,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `Pricing | ${siteName}`,
    description: "Compare plans and start with the workspace that fits your growth.",
  },
};

export default function Page() {
  return <PricingPage />;
}
