import type { Metadata } from "next";
import { CompareJsonLd } from "@/components/seo/CompareJsonLd";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import ComparePostizPage from "@/views/ComparePostizPage";
import { siteName } from "@/lib/site";
import {
  buildMarketingMetadata,
  fetchMarketingH1Override,
  fetchMarketingStructuredData,
} from "@/lib/serverSeo";

const ROUTE = "/compare/trndinn/postiz";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata(ROUTE, {
    title: "Trndinn vs Postiz: Agentic Scheduler vs Growth OS",
    description: `Honest comparison of ${siteName} and Postiz. Postiz leads on 30+ channels, MCP, and CLI. ${siteName} leads on Content Engine, Brand Voice, LinkedIn depth, credits, and newsletter. Start free.`,
    keywords: [
      "Trndinn vs Postiz",
      "Postiz alternative",
      "agentic social media scheduling",
      "social media scheduler comparison",
      "Content Engine",
      "Brand Voice AI",
      "LinkedIn scheduling tool",
      "MCP social media",
    ],
  });
}

export default async function Page() {
  const [h1Override, structuredData] = await Promise.all([
    fetchMarketingH1Override(ROUTE),
    fetchMarketingStructuredData(ROUTE),
  ]);

  return (
    <>
      <CompareJsonLd />
      <MarketingStructuredData data={structuredData} />
      <ComparePostizPage h1Override={h1Override} />
    </>
  );
}
