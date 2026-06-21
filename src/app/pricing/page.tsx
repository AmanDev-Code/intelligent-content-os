import type { Metadata } from "next";
import PricingPage from "@/views/PricingPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { MarketingPageJsonLd } from "@/components/seo/MarketingPageJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/pricing", {
    title: "Pricing — Agentic Social Media Plans",
    description: `${siteName} pricing: compare Free, Creator, Team, and Agency plans. Agentic scheduling, AI creation, and Content Engine workflows powered by transparent credits. LinkedIn live; API and webhooks on Team and Agency.`,
    keywords: [
      "Trndinn pricing",
      "agentic social media pricing",
      "AI content credits",
      "LinkedIn scheduling tool",
      "Creator Team Agency plans",
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
