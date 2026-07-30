import type { Metadata } from "next";
import McpMarketingPage from "@/views/McpMarketingPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/mcp", {
    title: "Trndinn MCP Server — Claude, ChatGPT & Cursor for Social",
    description: `${siteName} MCP roadmap: connect Claude, ChatGPT & Cursor to schedule LinkedIn posts with Brand Voice. Public API v1 & webhooks live today. Join the MCP waitlist.`,
    keywords: [
      "social media MCP server",
      "Claude MCP social media",
      "ChatGPT MCP scheduler",
      "Cursor MCP integration",
      "Model Context Protocol social",
      "trndinn MCP",
      "AI social media API",
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
