import type { Metadata } from "next";
import ContentEngineMarketingPage from "@/views/ContentEngineMarketingPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/content-engine", {
    title: "Trndinn Content Engine — Agentic SEO & Distribution",
    description: `Turn keywords into ranked articles, distribute to 31 platforms, interlink, score SEO/AEO/GEO, and email your list — one agentic loop in ${siteName} Team & Agency.`,
    keywords: [
      "agentic content engine",
      "SEO article generator",
      "social media distribution",
      "content clusters",
      "SEO rank tracking",
      "newsletter automation",
      "trndinn content engine",
    ],
  });
}

export default async function Page() {
  const [h1Override, structuredData] = await Promise.all([
    fetchMarketingH1Override("/content-engine"),
    fetchMarketingStructuredData("/content-engine"),
  ]);
  return (
    <>
      <MarketingStructuredData data={structuredData} />
      <ContentEngineMarketingPage h1Override={h1Override} />
    </>
  );
}
