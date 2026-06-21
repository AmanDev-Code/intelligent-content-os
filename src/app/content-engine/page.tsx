import type { Metadata } from "next";
import ContentEngineMarketingPage from "@/views/ContentEngineMarketingPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/content-engine", {
    title: "Content Engine — Agentic SEO & Distribution",
    description: `Turn keywords into articles, distribute to 31 platforms, interlink, score SEO/AEO/GEO, and email your list — one agentic loop. Available in ${siteName} Team and Agency workspaces.`,
    keywords: [
      "agentic content engine social media",
      "SEO social media distribution",
      "social media newsletter automation",
      "Content Engine",
      "SEO article generation",
      "content clusters",
      "rank tracking",
      "Trndinn Content Engine",
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
