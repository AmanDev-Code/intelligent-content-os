import type { Metadata } from "next";
import FeaturesPage from "@/views/FeaturesPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { MarketingPageJsonLd } from "@/components/seo/MarketingPageJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/features", {
    title: "Trndinn Features — AI Agent, Calendar & Content Engine",
    description: `${siteName} features: in-app AI Agent, Brand Voice, visual calendar, LinkedIn publishing, Public API, webhooks, and Content Engine for SEO & 31-platform distribution.`,
    keywords: [
      "agentic social media",
      "AI social media agent",
      "content scheduling",
      "LinkedIn scheduler",
      "Content Engine",
      "social media API",
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
      <MarketingPageJsonLd structuredData={structuredData} />
      <FeaturesPage h1Override={h1Override} />
    </>
  );
}
