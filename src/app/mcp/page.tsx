import type { Metadata } from "next";
import McpMarketingPage from "@/views/McpMarketingPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/mcp", {
    title: "Social Media MCP Server — Coming Soon",
    description: `${siteName} MCP server roadmap: connect Claude, ChatGPT, and Cursor to schedule and publish LinkedIn content with Brand Voice. Use Public API v1 and webhooks today while MCP ships.`,
    keywords: [
      "social media MCP server",
      "MCP server social media",
      "Claude social media MCP",
      "ChatGPT social media scheduling",
      "Cursor MCP social media",
      "Model Context Protocol scheduling",
      "Trndinn MCP",
      "agentic social media",
    ],
  });
}

export default async function Page() {
  const [h1Override, structuredData] = await Promise.all([
    fetchMarketingH1Override("/mcp"),
    fetchMarketingStructuredData("/mcp"),
  ]);
  return (
    <>
      <MarketingStructuredData data={structuredData} />
      <McpMarketingPage h1Override={h1Override} />
    </>
  );
}
