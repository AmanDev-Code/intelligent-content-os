import type { Metadata } from "next";
import PricingPage from "@/views/PricingPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { MarketingPageJsonLd } from "@/components/seo/MarketingPageJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/pricing", {
    title: "Trndinn Pricing — Agentic Social Media Plans from Free",
    description: `Compare ${siteName} plans: Free, Creator, Team, Agency. Transparent credits, agentic scheduling, AI content, and Content Engine. LinkedIn live. Start free — 150 credits.`,
    keywords: [
      "trndinn pricing",
      "social media scheduler pricing",
      "AI content credits",
      "LinkedIn scheduling tool pricing",
      "Buffer alternative pricing",
      "agentic social media plans",
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
      <MarketingPageJsonLd structuredData={structuredData} />
      <PricingPage h1Override={h1Override} />
    </>
  );
}
