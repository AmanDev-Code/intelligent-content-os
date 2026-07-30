import type { Metadata } from "next";
import AiAgentMarketingPage from "@/views/AiAgentMarketingPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/ai-agent", {
    title: "Trndinn AI Social Media Agent — Draft, Schedule, Publish",
    description: `${siteName}'s in-app AI agent drafts on-brand LinkedIn posts, images, and carousels from your Brand Voice, then schedules or publishes. Start free with 150 credits.`,
    keywords: [
      "AI social media agent",
      "agentic social media scheduling",
      "LinkedIn AI agent",
      "AI post generator",
      "brand voice AI",
      "social media automation agent",
      "trndinn agent",
    ],
  });
}

export default async function Page() {
  const [h1Override, structuredData] = await Promise.all([
    fetchMarketingH1Override("/ai-agent"),
    fetchMarketingStructuredData("/ai-agent"),
  ]);
  return (
    <>
      <MarketingStructuredData data={structuredData} />
      <AiAgentMarketingPage h1Override={h1Override} />
    </>
  );
}
