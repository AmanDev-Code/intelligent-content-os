import type { Metadata } from "next";
import FeaturesPage from "@/views/FeaturesPage";
import { defaultDescription, getSiteUrl, siteName } from "@/lib/site";

const url = getSiteUrl();

export const metadata: Metadata = {
  title: "Features",
  description: `${siteName}: AI Content Engine, one-clip-to-all-reels repurposing, kinetic roadmap across channels, predictive analytics, and plans to scale your signal—one platform from creation to distribution.`,
  keywords: [
    "AI social media",
    "content scheduling",
    "LinkedIn tool",
    "AI reels",
    "social analytics",
    "Trndinn features",
  ],
  alternates: { canonical: `${url}/features` },
  openGraph: {
    title: `Features | ${siteName}`,
    description: defaultDescription,
    url: "/features",
    type: "website",
    siteName,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `Features | ${siteName}`,
    description: "AI creation, scheduling, analytics, and the roadmap ahead.",
  },
};

export default function Page() {
  return <FeaturesPage />;
}
