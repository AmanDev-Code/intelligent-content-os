/**
 * Core Trndinn platform competitor index — for the /compare hub.
 *
 * These are the existing /vs/{slug} pages that compare the WHOLE Trndinn
 * platform (agentic AI, Brand Voice, LinkedIn publishing, Content Engine)
 * with competing social media / scheduling tools.
 *
 * Separate from `caption-competitors.ts` which powers the /compare/trndinn-vs-*
 * pages that specifically compare the Auto Caption Generator tool.
 *
 * Keep this small — one entry per active /vs page. When a new /vs page is
 * built, add its slug here and it'll appear on the /compare hub automatically.
 */

export type CoreCompetitor = {
  /** URL slug — matches /vs/{slug} route. */
  slug: string;
  /** Marketing name. */
  name: string;
  /** One-line summary of Trndinn's wedge for the /compare hub card. */
  wedgeSummary: string;
  /** Target search keyword this comparison ranks for. */
  targetKeyword: string;
  /** Which platform category the competitor is in (for grouping). */
  category: "scheduling" | "enterprise" | "ai-content" | "linkedin" | "open-source";
};

export const CORE_COMPETITORS: readonly CoreCompetitor[] = [
  {
    slug: "buffer",
    name: "Buffer",
    wedgeSummary:
      "Agentic AI content + Brand Voice + Content Engine vs Buffer's classic scheduling.",
    targetKeyword: "buffer alternative",
    category: "scheduling",
  },
  {
    slug: "hootsuite",
    name: "Hootsuite",
    wedgeSummary:
      "Modern AI-native social platform at 70% lower cost than Hootsuite's legacy enterprise pricing.",
    targetKeyword: "hootsuite alternative",
    category: "enterprise",
  },
  {
    slug: "postiz",
    name: "Postiz",
    wedgeSummary:
      "Managed agentic AI vs Postiz's self-hosted open-source scheduling — zero DevOps required.",
    targetKeyword: "postiz alternative",
    category: "open-source",
  },
  {
    slug: "predis",
    name: "Predis.ai",
    wedgeSummary:
      "Brand Voice trained on your examples + full workflow vs Predis's generic AI content generation.",
    targetKeyword: "predis alternative",
    category: "ai-content",
  },
  {
    slug: "taplio",
    name: "Taplio",
    wedgeSummary:
      "LinkedIn + Company Pages + Content Engine vs Taplio's personal-profile-only scheduling.",
    targetKeyword: "taplio alternative",
    category: "linkedin",
  },
];

export const CORE_COMPETITOR_SLUGS = CORE_COMPETITORS.map((c) => c.slug);
