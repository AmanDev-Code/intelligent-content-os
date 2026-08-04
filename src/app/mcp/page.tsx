import type { Metadata } from "next";
import McpMarketingPage from "@/views/McpMarketingPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/mcp", {
    title: "Trndinn MCP Server — 67 Tools for Claude, ChatGPT & Cursor",
    description: `Connect Claude Code, Cursor, or ChatGPT to ${siteName}'s MCP server. 67 tools for blog CRUD, AEO/GEO optimization, image generation, SEO — live now.`,
    keywords: [
      "social media MCP server",
      "Claude MCP social media",
      "ChatGPT MCP scheduler",
      "Cursor MCP integration",
      "Model Context Protocol social",
      "trndinn MCP",
      "AI social media API",
      "MCP tools",
      "Model Context Protocol server",
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
