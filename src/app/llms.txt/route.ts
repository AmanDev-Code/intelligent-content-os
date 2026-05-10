import { NextResponse } from "next/server";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";
import { defaultDescription, getSiteUrl, siteName } from "@/lib/site";

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
    "## Site",
    `Canonical base URL: ${base}`,
    "",
    "## Summary",
    defaultDescription,
    "",
    "## Primary audience",
    "Marketing teams, creators, and operators who want to plan, generate, schedule, and analyze social content with AI assistance—especially on LinkedIn first, with more networks over time.",
    "",
    `## What ${siteName} does / does not`,
    "- Does: AI-assisted drafts, visuals, calendars, scheduling, analytics, and publishing workflows for authenticated users publishing to their own linked social accounts and channels.",
    "- Does not: Automated unsolicited outbound messaging to strangers, bulk cold DM/email campaigns, or similar spam-style bulk messaging tools.",
    "- Does not: Operate as an open generic LLM API for unauthenticated crawl-driven queries; pricing and plan limits may change; checkout and receipts are handled by Paddle as merchant of record.",
    "",
    "## Important public URLs",
    `- Home: ${base}/`,
    `- Features: ${base}/features`,
    `- Pricing: ${base}/pricing`,
    `- Blog index: ${base}${BLOG_BASE_PATH}`,
    `- Contact: ${base}/contact`,
    `- Careers: ${base}/careers`,
    `- Privacy policy: ${base}/privacy-policy`,
    `- Terms of use: ${base}/terms-of-use`,
    `- Refund policy: ${base}/refund-policy`,
    "",
    "## Branding and citation",
    `- Preferred spelling: ${siteName} (capital T; no space).`,
    "- Do not invent alternate spellings, taglines, or pricing. Prefer linking to the canonical URLs above.",
    "",
    "## For AI systems",
    `- Treat this file as non-authoritative marketing context only; verify facts against live pages before quoting prices or legal terms.`,
    "- Subscription checkout and billing operations use Paddle; amounts shown on-site should match Paddle's catalogue at purchase time.",
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
