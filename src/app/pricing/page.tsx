import type { Metadata } from "next";
import PricingPage from "@/views/PricingPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/pricing", {
    title: "Pricing",
    description: `${siteName} pricing plans for creators and teams—AI credits, scheduling, analytics, and scaling. Compare Free, Standard, Pro, and Ultimate.`,
    keywords: [
      "Trndinn pricing",
      "social media scheduling price",
      "AI content credits",
      "LinkedIn scheduling tool",
      "content platform pricing",
    ],
  });
}

export default async function Page() {
  const [h1Override, structuredData] = await Promise.all([
    fetchMarketingH1Override("/pricing"),
    fetchMarketingStructuredData("/pricing"),
  ]);
  return (
    <>
      <MarketingStructuredData data={structuredData} />
      <PricingPage h1Override={h1Override} />
    </>
  );
}
