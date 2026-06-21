/** Comparison data for Trndinn vs Postiz — sourced from AGENTIC-POSITIONING-STRATEGY §7. */

export type CompareRow = {
  capability: string;
  postiz: string;
  trndinn: string;
};

/** Differentiation matrix rows — honest, no trash-talk. */
export const POSTIZ_COMPARE_ROWS: CompareRow[] = [
  {
    capability: "Channel breadth",
    postiz: "30+ social networks live today",
    trndinn: "LinkedIn live (personal + Company Pages); more channels on roadmap",
  },
  {
    capability: "Agent protocols",
    postiz: "MCP server, CLI, Smart Agent chat — core product story",
    trndinn: "In-app Agent, Public API v1, webhooks; MCP and CLI on roadmap",
  },
  {
    capability: "Content Engine",
    postiz: "RSS auto-post and blog syndication channels",
    trndinn: "Full SEO pipeline: keywords, clusters, articles, scoring, internal links, rank tracking",
  },
  {
    capability: "Distribution",
    postiz: "30+ social and blog channels from posts",
    trndinn: "31 platforms with tiered auto/manual distribution from articles",
  },
  {
    capability: "Brand Voice",
    postiz: "AI copilot and Smart Agent for drafts",
    trndinn: "Brand Voice built only from examples you provide — no feed scraping",
  },
  {
    capability: "LinkedIn depth",
    postiz: "One of 30+ supported channels",
    trndinn: "B2B-first: posting identity picker, Company Pages, live publishing",
  },
  {
    capability: "Newsletter",
    postiz: "Listmonk as a publish channel",
    trndinn: "Listmonk campaigns from posts — owned audience + social in one loop",
  },
  {
    capability: "Quality scoring",
    postiz: "Per-channel and per-post social analytics",
    trndinn: "SEO, AEO, GEO, and E-E-A-T scoring on every article",
  },
  {
    capability: "Pricing model",
    postiz: "Channels, post caps, and AI media allowances per tier",
    trndinn: "Credits per agent action — transparent for AI-heavy workflows",
  },
  {
    capability: "Open source",
    postiz: "Open-source, self-hostable",
    trndinn: "Managed SaaS with compliance-first data ownership",
  },
];

export type CompareFaqItem = {
  question: string;
  answer: string;
};

export const COMPARE_POSTIZ_FAQ: CompareFaqItem[] = [
  {
    question: "Is Postiz or Trndinn better for posting to many channels?",
    answer:
      "Postiz ships 30+ live channels today and is the stronger choice if you need the widest cross-posting footprint right now. Trndinn is LinkedIn-first with a Content Engine that distributes SEO articles to 31 platforms — better if organic growth and B2B depth matter more than channel count.",
  },
  {
    question: "Which platform is better for B2B LinkedIn teams?",
    answer:
      "Trndinn is built for LinkedIn depth: personal profiles and Company Pages, posting identity picker, and Brand Voice from your examples. Postiz supports LinkedIn as one of many channels with strong agent tooling (MCP, CLI) across the full network list.",
  },
  {
    question: "Does Trndinn have MCP and CLI like Postiz?",
    answer:
      "Not yet. Postiz ships MCP server, CLI, and native agent integrations today. Trndinn offers in-app Agent, Public API v1, and signed webhooks now; MCP and CLI are on the roadmap with Brand Voice and Content Engine tools baked in.",
  },
  {
    question: "How does pricing compare?",
    answer:
      "Postiz plans scale by channel count, monthly post caps, and AI image/video allowances. Trndinn uses credits per agent action (generate, schedule, publish, distribute) — often clearer for AI-heavy teams. Both offer free trials to evaluate fit.",
  },
  {
    question: "What is the honest summary?",
    answer:
      "Postiz wins on channel breadth and agent protocol maturity today. Trndinn wins on growth depth: Content Engine, Brand Voice compliance, LinkedIn workflows, newsletter, and credit-transparent pricing. Many teams choose based on whether they need the widest scheduler or an agentic growth OS.",
  },
];
