import type { Metadata } from "next";
import FeaturesPage from "@/views/FeaturesPage";
import { defaultDescription, getSiteUrl, siteName } from "@/lib/site";

const url = getSiteUrl();

export const metadata: Metadata = {
  title: "Features",
  description: `${siteName} features: AI content creation, multi-channel roadmap (X, Instagram, Facebook, YouTube, Twitch, Reddit), AI reels, analytics, and planned LinkedIn outreach.`,
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
