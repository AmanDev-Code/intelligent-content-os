import type { Metadata } from "next";
import FeaturesPage from "@/views/FeaturesPage";
import { defaultDescription, siteName } from "@/lib/site";
import { buildMarketingMetadata } from "@/lib/serverSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/features", {
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
  });
}

export default function Page() {
  return <FeaturesPage />;
}
