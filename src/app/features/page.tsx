import type { Metadata } from "next";
import FeaturesPage from "@/views/FeaturesPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";

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

export default async function Page() {
  const [h1Override, structuredData] = await Promise.all([
    fetchMarketingH1Override("/features"),
    fetchMarketingStructuredData("/features"),
  ]);
  return (
    <>
      <MarketingStructuredData data={structuredData} />
      <FeaturesPage h1Override={h1Override} />
    </>
  );
}
