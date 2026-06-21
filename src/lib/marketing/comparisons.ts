export type ComparisonCell = boolean | "partial" | "roadmap" | string;

export type ComparisonRow = {
  label: string;
  competitor: ComparisonCell;
  trndinn: ComparisonCell;
};

export type ComparisonSection = {
  title: string;
  rows: ComparisonRow[];
};

export type CompetitorPlan = {
  name: string;
  price: string;
  note?: string;
};

export type CompetitorComparisonConfig = {
  slug: string;
  competitorName: string;
  route: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  competitorOverview: {
    title: string;
    paragraphs: string[];
  };
  trndinnOverview: {
    title: string;
    paragraphs: string[];
  };
  sections: ComparisonSection[];
  competitorPlans: CompetitorPlan[];
  trndinnPlans: CompetitorPlan[];
  pricingNotes: {
    competitor: string[];
    trndinn: string[];
  };
  verdict: {
    title: string;
    body: string;
    chooseCompetitor: string;
    chooseTrndinn: string;
  };
  cta: {
    title: string;
    subtitle: string;
  };
};

export const BUFFER_COMPARISON: CompetitorComparisonConfig = {
  slug: "buffer",
  competitorName: "Buffer",
  route: "/compare/trndinn/buffer",
  seo: {
    title: "Trndinn vs Buffer — Agentic Scheduler Comparison",
    description:
      "Compare Trndinn and Buffer honestly: Buffer excels at simple multi-channel scheduling. Trndinn adds agentic creation, Brand Voice from your examples, and a Content Engine for SEO and distribution.",
    keywords: [
      "Trndinn vs Buffer",
      "Buffer alternative",
      "agentic social media scheduling",
      "Buffer comparison",
      "AI social media scheduler",
      "LinkedIn scheduling tool",
    ],
  },
  hero: {
    eyebrow: "Comparison",
    title: "Trndinn vs. Buffer",
    subtitle:
      "Buffer is a proven scheduler for posting across major networks. Trndinn is an agentic growth platform — create with AI agents, schedule on a calendar, and grow with Content Engine and Brand Voice.",
  },
  competitorOverview: {
    title: "Buffer",
    paragraphs: [
      "Buffer is one of the most established social media management tools, trusted by creators and small businesses since 2010. Its strength is a clean, reliable workflow for planning, publishing, and analyzing content across major networks like Instagram, X, LinkedIn, TikTok, and more.",
      "Buffer offers a visual calendar, queue-based scheduling, an AI assistant for drafting posts, analytics, and team collaboration with approval workflows. If you want a straightforward, no-frills scheduler with broad channel coverage and a generous free tier, Buffer remains an excellent choice.",
    ],
  },
  trndinnOverview: {
    title: "Trndinn",
    paragraphs: [
      "Trndinn is an agentic social media platform built for teams who need more than a queue. AI agents draft on-brand posts from examples you provide, schedule them on a visual calendar, and publish to connected accounts — then feed a Content Engine that turns keywords into SEO articles and multi-platform distribution.",
      "Where Buffer stops at scheduling and light AI assistance, Trndinn adds Brand Voice trained only from your examples (never scraped feeds), agentic multi-step workflows, and a full SEO-to-social growth loop. LinkedIn is live today (personal + Company Pages); additional channels are on the roadmap.",
    ],
  },
  sections: [
    {
      title: "Scheduling & publishing",
      rows: [
        { label: "Visual content calendar", competitor: true, trndinn: true },
        { label: "Drag-and-drop scheduling", competitor: true, trndinn: true },
        { label: "Queue / slot-based posting", competitor: true, trndinn: true },
        { label: "Drafts & recurring schedules", competitor: true, trndinn: true },
        { label: "Multi-channel publishing", competitor: "11 major networks", trndinn: "LinkedIn live; more on roadmap" },
        { label: "LinkedIn Company Pages + identity picker", competitor: true, trndinn: true },
      ],
    },
    {
      title: "AI & brand control",
      rows: [
        { label: "AI post generation", competitor: true, trndinn: true },
        { label: "Brand Voice from your examples (no feed scraping)", competitor: false, trndinn: true },
        { label: "Agentic multi-step workflows (draft → schedule → publish)", competitor: false, trndinn: true },
        { label: "AI images & carousels", competitor: "partial", trndinn: true },
        { label: "Content Engine (SEO articles → distribution)", competitor: false, trndinn: true },
      ],
    },
    {
      title: "Analytics & collaboration",
      rows: [
        { label: "Post performance analytics", competitor: true, trndinn: true },
        { label: "Team members & roles", competitor: true, trndinn: true },
        { label: "Approval workflows", competitor: true, trndinn: "Team & Agency" },
        { label: "Unified social inbox", competitor: true, trndinn: "roadmap" },
      ],
    },
    {
      title: "Automation & integrations",
      rows: [
        { label: "Public API", competitor: "partial", trndinn: "Team & Agency" },
        { label: "Webhooks", competitor: false, trndinn: "Team & Agency" },
        { label: "MCP server / CLI for external agents", competitor: false, trndinn: "roadmap" },
        { label: "Zapier / Make / n8n", competitor: true, trndinn: "API + webhooks today" },
      ],
    },
  ],
  competitorPlans: [
    { name: "Free", price: "$0 / month", note: "Up to 3 channels" },
    { name: "Essentials", price: "From $5 / month", note: "Per channel pricing" },
    { name: "Team", price: "From $10 / month", note: "Collaboration & approvals" },
  ],
  trndinnPlans: [
    { name: "Free", price: "150 credits", note: "14-day trial credits; no card required" },
    { name: "Creator", price: "500 credits / month", note: "Solo creators" },
    { name: "Team", price: "2,000 credits / month", note: "API + webhooks" },
    { name: "Agency", price: "10,000 credits / month", note: "Content Engine access" },
  ],
  pricingNotes: {
    competitor: [
      "Free plan with up to 3 channels — great for getting started.",
      "Per-channel pricing on paid tiers; 14-day trial on paid plans.",
    ],
    trndinn: [
      "Credits per agent action — transparent for AI-heavy workflows.",
      "Start free with 150 credits; no card required.",
      "See live pricing on the pricing page.",
    ],
  },
  verdict: {
    title: "Which should you choose?",
    body: "Both tools can schedule social posts reliably. The difference is scope: Buffer optimizes for simple, multi-channel scheduling with a polished UX. Trndinn optimizes for agentic creation, brand-safe AI, and a Content Engine that connects SEO to social distribution.",
    chooseCompetitor:
      "Choose Buffer if you want a mature scheduler across many networks today, with minimal setup and a free tier for a few channels.",
    chooseTrndinn:
      "Choose Trndinn if you want AI agents that create and schedule on-brand content, plus a Content Engine to grow organic traffic — especially on LinkedIn.",
  },
  cta: {
    title: "Ready to try agentic scheduling?",
    subtitle:
      "Start free with 150 credits. Connect LinkedIn, train Brand Voice from your examples, and let agents handle the busywork.",
  },
};
