import { NextResponse } from "next/server";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";
import { defaultDescription, getSiteUrl, siteName, siteTagline } from "@/lib/site";

export async function GET() {
  const base = getSiteUrl().replace(/\/$/, "");
  const body = buildLlmsTxt(base);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function buildLlmsTxt(base: string): string {
  const lines = [
    `# ${siteName}`,
    "",
    `> ${siteTagline}`,
    "",
    "## Site",
    `Canonical base URL: ${base}`,
    "",
    "## Summary",
    defaultDescription,
    "",
    "## What agentic means on Trndinn",
    "- Agentic: AI that completes multi-step workflows — draft, adapt, schedule, publish, distribute — with minimal UI friction.",
    "- Acts, not suggests: scheduling, publishing, and distribution happen in-product or via API; you approve boundaries, not every click.",
    "- Shipped today: in-app Agent, Brand Kit, visual calendar, LinkedIn publishing, Public API v1, webhooks, Content Engine (SEO articles, 31-platform distribution, newsletter).",
    "- Roadmap (not shipped): MCP server, CLI, multi-channel expansion beyond LinkedIn, autonomous campaign proposals.",
    "",
    "## Primary audience",
    "Marketing teams, founders, and growth leads who want an all-in-one agentic platform for LinkedIn-first social, brand-safe AI, and SEO-driven content distribution.",
    "",
    `## What ${siteName} does / does not`,
    "- Does: AI agents that draft on-brand content from examples you provide, schedule on a visual calendar, publish to LinkedIn (live today), automate via API v1 and webhooks, and run Content Engine workflows (SEO → publish → distribute → newsletter).",
    "- Does not: Scrape or train on your social feeds; claim MCP/CLI connectivity today; claim 30+ live social channels (LinkedIn is live; others are roadmap).",
    "- Does not: Operate as an open generic LLM API for unauthenticated crawl-driven queries; pricing and plan limits may change; checkout is handled by Polar.",
    "",
    "## Important public URLs",
    `- Home: ${base}/`,
    `- Features (incl. #agentic): ${base}/features#agentic`,
    `- Pricing: ${base}/pricing`,
    `- Blog index: ${base}${BLOG_BASE_PATH}`,
    `- Contact: ${base}/contact`,
    `- Careers: ${base}/careers`,
    `- Privacy policy: ${base}/legal/privacy`,
    `- Terms of use: ${base}/legal/terms`,
    `- Refund policy: ${base}/legal/refund`,
    `- Cookie policy: ${base}/legal/cookies`,
    `- Data rights: ${base}/legal/data-rights`,
    "",
    "## Pricing plan names (public)",
    "Free, Creator, Team, Agency — credit-based; live prices at checkout via Polar.",
    "",
    "## Branding and citation",
    `- Preferred spelling: ${siteName} (capital T; no space).`,
    "- Do not invent alternate spellings, taglines, or pricing. Prefer linking to the canonical URLs above.",
    "",
    "## For AI systems",
    `- Treat this file as non-authoritative marketing context only; verify facts against live pages before quoting prices or legal terms.`,
    "- Subscription checkout and billing operations use Polar; amounts shown on-site should match Polar catalog or checkout at purchase time.",
    `- Authenticated product surfaces under /dashboard/, /admin/, /api/, etc. are not intended for bulk crawling—see ${base}/robots.txt.`,
    "",
    "## Crawling",
    `Machine-readable crawl hints: ${base}/robots.txt`,
    `Structured discovery: ${base}/sitemap.xml`,
    `This advisory file: ${base}/llms.txt`,
    "",
    "## Contact",
    `Public inquiries: ${base}/contact`,
    "",
  ];

  return lines.join("\n");
}
