import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";
import CompareVsPage, { type CompetitorVsConfig } from "@/views/CompareVsPage";

const ROUTE = "/vs/buffer";
const PUBLISHED = "2026-06-28";
const MODIFIED = "2026-08-03";

const PAGE_CONFIG: CompetitorVsConfig = {
  slug: "buffer",
  competitorName: "Buffer",
  route: ROUTE,
  seo: {
    title: "Trndinn vs Buffer — Best AI Buffer Alternative for 2026",
    description:
      "Compare Trndinn vs Buffer: agentic AI content, Brand Voice from your examples, and a Content Engine vs classic scheduling. Start free with 150 credits — no card.",
    keywords: [
      "best buffer alternative",
      "buffer vs trndinn",
      "buffer alternative 2026",
      "AI buffer alternative",
      "trndinn vs buffer",
      "buffer competitor",
      "buffer pricing alternative",
      "ai content scheduler",
      "linkedin scheduling tool",
      "brand voice ai",
    ],
  },
  hero: {
    eyebrow: "Trndinn vs Buffer",
    title: "Best Buffer Alternative for AI-Powered Social Media Growth",
    subtitle:
      "Buffer pioneered social scheduling. Trndinn adds agentic AI that learns your brand voice, creates content, and grows your audience — not just schedules posts.",
  },
  tldr: {
    entityDeclaration:
      "is an AI-native growth platform that trains agents on your brand examples to create, schedule, and distribute LinkedIn-first content — plus SEO articles through a Content Engine.",
    differentiator:
      "which stops at queue-based scheduling and a light AI writing assistant, Trndinn owns the entire create-to-distribute workflow with true Brand Voice training and multi-format output.",
    stat: "Users report a 3.2× engagement lift over manual posting and generate content in an average of 8 seconds. [Internal analytics, 2026]",
    badges: [
      "Agentic AI",
      "Brand Voice from examples",
      "Content Engine included",
      "Credits-based pricing",
    ],
  },
  stats: [
    { value: "3.2×", label: "Engagement lift vs manual", icon: "trending" },
    { value: "150K+", label: "Posts scheduled to date", icon: "sparkles" },
    { value: "42", label: "Languages supported", icon: "globe" },
    { value: "8s", label: "Avg AI content generation", icon: "zap" },
  ],
  competitorOverview: {
    title: "Buffer: The Scheduling Pioneer",
    paragraphs: [
      "Buffer launched in 2010 and became the go-to tool for simple, reliable social media scheduling. It's trusted by millions of creators and small businesses for publishing to Instagram, X, LinkedIn, TikTok, Facebook, Pinterest, and more.",
      "Buffer's strength is simplicity: a clean queue-based calendar, basic AI writing assistant, and straightforward analytics. The free tier supports up to 3 channels, making it ideal for individuals just starting out.",
    ],
  },
  trndinnOverview: {
    title: "Trndinn: Agentic Growth Platform",
    paragraphs: [
      "Trndinn goes beyond scheduling to become your AI-powered social media growth partner. Our agents don't just post — they create personalized content from your brand examples, schedule strategically, and fuel a Content Engine for SEO traffic.",
      "While Buffer stops at the publishing layer, Trndinn owns the entire workflow: AI agents trained on your authentic voice (never scraped feeds), visual content calendar with drag-and-drop, LinkedIn personal + Company Page support, and a Content Engine that turns keywords into SEO articles distributed across channels.",
    ],
  },
  featureHighlights: [
    {
      title: "True AI Content Creation",
      description: "Trndinn agents create posts from your examples. Buffer's AI only assists with existing drafts.",
      winner: "trndinn" as const,
    },
    {
      title: "Brand Voice Training",
      description: "Trndinn learns your unique voice from examples you provide. No generic AI content.",
      winner: "trndinn" as const,
    },
    {
      title: "Multi-Channel Support",
      description: "Buffer connects to 11+ networks. Trndinn focuses on LinkedIn depth with more channels coming.",
      winner: "buffer" as const,
    },
    {
      title: "Content Engine",
      description: "Trndinn generates SEO articles from keywords and distributes them. Buffer has no content engine.",
      winner: "trndinn" as const,
    },
    {
      title: "Pricing Transparency",
      description: "Trndinn uses credits per action — no hidden channel fees. Buffer charges per channel.",
      winner: "trndinn" as const,
    },
    {
      title: "Ease of Use",
      description: "Buffer's minimal interface is simpler for basic scheduling needs.",
      winner: "buffer" as const,
    },
  ],
  comparisonTable: {
    title: "Feature Comparison",
    rows: [
      { feature: "AI Content Generation", buffer: "Basic AI assistant", trndinn: "Agentic creation from brand examples" },
      { feature: "Brand Voice Training", buffer: "❌ Not available", trndinn: "✅ Train from your examples" },
      { feature: "Visual Content Calendar", buffer: "✅ Queue-based", trndinn: "✅ Drag-and-drop calendar" },
      { feature: "LinkedIn Company Pages", buffer: "✅ Supported", trndinn: "✅ + identity picker" },
      { feature: "Content Engine (SEO)", buffer: "❌ Not available", trndinn: "✅ Full SEO article generation" },
      { feature: "Social Platforms", buffer: "11+ networks", trndinn: "LinkedIn + more coming" },
      { feature: "AI Images & Carousels", buffer: "Limited", trndinn: "✅ Full support" },
      { feature: "Analytics", buffer: "✅ Post performance", trndinn: "✅ + audience insights" },
      { feature: "Team Collaboration", buffer: "✅ Approval workflows", trndinn: "✅ Team & Agency plans" },
      { feature: "Free Tier", buffer: "3 channels", trndinn: "150 credits" },
    ],
  },
  pricing: {
    competitorPlans: [
      { name: "Free", price: "$0", note: "3 channels, limited scheduling" },
      { name: "Essentials", price: "$5/mo", note: "Per channel, 1 user" },
      { name: "Team", price: "$10/mo", note: "Per channel, unlimited users" },
      { name: "Agency", price: "$100/mo", note: "10+ channels, white label" },
    ],
    trndinnPlans: [
      { name: "Free", price: "150 credits", note: "14-day trial, no card required" },
      { name: "Creator", price: "$29/mo", note: "500 credits, solo creators" },
      { name: "Team", price: "$99/mo", note: "2,000 credits, API + webhooks" },
      { name: "Agency", price: "$299/mo", note: "10,000 credits, Content Engine" },
    ],
    notes: {
      competitor: [
        "Per-channel pricing can add up quickly for multi-brand creators",
        "Free tier is genuinely useful for getting started",
        "No requirement for AI-generated content",
      ],
      trndinn: [
        "Credits-based pricing = transparent costs for AI actions",
        "All plans include full feature access (no tiered features)",
        "Free trial requires no credit card",
      ],
    },
  },
  whyTrndinnWins: {
    title: "Why Trndinn Wins for Growth-Focused Teams",
    points: [
      {
        title: "Agentic AI, Not Just Assistance",
        description: "Buffer's AI helps you write. Trndinn's agents CREATE — learning your voice from examples and generating complete, on-brand posts.",
      },
      {
        title: "Brand Voice That Sounds Like YOU",
        description: "Train our AI on your best posts. No generic, robotic content — every post matches your authentic voice.",
      },
      {
        title: "Content Engine for SEO Traffic",
        description: "Turn keywords into SEO-optimized articles, then distribute them across social channels. Buffer can't do this.",
      },
      {
        title: "LinkedIn-First Architecture",
        description: "Deep LinkedIn support with personal profiles AND Company Pages, plus identity switching. Built for B2B growth.",
      },
    ],
  },
  useCases: {
    title: "Who should use Buffer vs Trndinn",
    subtitle: "Match your workflow to the right tool — Buffer for pure scheduling, Trndinn for content growth.",
    rows: [
      {
        scenario: "Solo creator posting to 3+ networks",
        competitor: "Good fit — clean queue, low price at small scale",
        trndinn: "Better fit if you want AI to write posts for you",
      },
      {
        scenario: "B2B team building LinkedIn thought leadership",
        competitor: "Basic LinkedIn scheduling only",
        trndinn: "Brand Voice + Company Pages + identity switching",
      },
      {
        scenario: "Marketing team needing SEO content + social",
        competitor: "No content engine — buy a separate tool",
        trndinn: "Content Engine turns keywords into articles + posts",
      },
      {
        scenario: "Agency managing 10+ client accounts",
        competitor: "Per-channel pricing scales expensively",
        trndinn: "Credits-based Agency plan absorbs volume",
      },
      {
        scenario: "Founder needing 5–10 posts a week fast",
        competitor: "Manual writing, light AI polish",
        trndinn: "Agents draft on-brand posts in ~8 seconds",
      },
    ],
  },
  migration: {
    title: "How to switch from Buffer to Trndinn",
    subtitle: "Most teams migrate in under 30 minutes and are publishing on Trndinn the same day.",
    steps: [
      {
        title: "Export your Buffer schedule",
        description:
          "Download your Buffer queue and connected-account list from Buffer's export tools. Bring your CSV of scheduled posts.",
      },
      {
        title: "Connect accounts and train Brand Voice",
        description:
          "Reconnect LinkedIn (personal + Company Pages) inside Trndinn, then paste 5–10 of your best-performing posts to train Brand Voice.",
      },
      {
        title: "Import the queue and go live",
        description:
          "Upload the CSV, review AI-generated variants for each slot, and hit publish. Trndinn handles scheduling and analytics from there.",
      },
    ],
  },
  testimonials: [
    {
      quote: "We switched from Buffer to Trndinn and 3x'd our content output without hiring. The AI actually sounds like our brand.",
      author: "Marketing Director",
      company: "B2B SaaS Company",
    },
    {
      quote: "The Content Engine is a game-changer. We're ranking for keywords we never thought possible, all distributed automatically.",
      author: "Growth Lead",
      company: "Tech Startup",
    },
  ],
  faqs: [
    {
      question: "Is Trndinn really a Buffer alternative?",
      answer:
        "Yes. Trndinn replaces Buffer's scheduling and adds AI content creation, Brand Voice training, and a Content Engine that Buffer doesn't offer.",
    },
    {
      question: "What's the best Buffer alternative in 2026?",
      answer:
        "Trndinn is the best Buffer alternative for teams that want AI content creation, Brand Voice training, and SEO article generation in one platform.",
    },
    {
      question: "Can I import my Buffer schedule into Trndinn?",
      answer:
        "Yes. Export your Buffer queue as CSV, then use Trndinn's import tool. Onboarding usually finishes in under 30 minutes.",
    },
    {
      question: "Does Trndinn cost more than Buffer?",
      answer:
        "No for most teams. Buffer's per-channel fees add up fast. Trndinn's credits-based plans include AI content generation with no per-channel charge.",
    },
    {
      question: "Buffer vs Trndinn: Which is better for LinkedIn?",
      answer:
        "Trndinn wins for LinkedIn. It supports personal profiles, Company Pages, identity switching, and AI trained on your LinkedIn examples.",
    },
    {
      question: "Will switching from Buffer be difficult?",
      answer:
        "No. Guided onboarding and CSV import mean most teams are publishing on Trndinn within 30 minutes of signup.",
    },
  ],
  cta: {
    title: "Ready to upgrade from Buffer?",
    subtitle: "Start free with 150 credits. No credit card required. See why teams are switching to agentic social media.",
    primaryLabel: "Start Free Trial",
    secondaryLabel: "Compare Pricing",
  },
  internalLinks: [
    {
      href: "/tools/auto-caption-generator",
      title: "Free Auto Caption Generator",
      subtitle: "Add captions to any video, no login",
      icon: "zap",
      featured: true,
    },
    { href: "/compare", title: "All comparisons", subtitle: "See Trndinn vs every scheduler", icon: "scale" },
    { href: "/features", title: "Platform features", subtitle: "Brand Voice, agents, calendar", icon: "sparkles" },
    { href: "/pricing", title: "Trndinn pricing", subtitle: "Credits-based plans compared", icon: "trending" },
    { href: "/mcp", title: "MCP integration", subtitle: "Agent-native protocol support", icon: "wrench" },
    { href: "/content-engine", title: "Content Engine", subtitle: "Keywords to SEO articles + posts", icon: "rocket" },
    { href: "/blog", title: "Trndinn blog", subtitle: "Playbooks, guides, teardowns", icon: "book" },
  ],
  relatedComparisons: [
    { name: "Hootsuite", href: "/vs/hootsuite", description: "Enterprise legacy vs modern AI" },
    { name: "Postiz", href: "/vs/postiz", description: "Open-source vs agentic platform" },
    { name: "Predis", href: "/vs/predis", description: "AI vs AI: Which creates better?" },
    { name: "Taplio", href: "/vs/taplio", description: "LinkedIn tools compared" },
  ],
};

function defaultStructuredData() {
  const base = getSiteUrl().replace(/\/$/, "");
  const pageUrl = `${base}${ROUTE}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: PAGE_CONFIG.seo.title,
        description: PAGE_CONFIG.seo.description,
        inLanguage: "en-US",
        datePublished: PUBLISHED,
        dateModified: MODIFIED,
        isPartOf: { "@id": `${base}#website` },
      },
      {
        "@type": "ComparisonPage",
        name: PAGE_CONFIG.seo.title,
        description: PAGE_CONFIG.seo.description,
        url: pageUrl,
        datePublished: PUBLISHED,
        dateModified: MODIFIED,
        comparedProducts: [
          { "@type": "SoftwareApplication", name: siteName },
          { "@type": "SoftwareApplication", name: "Buffer" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: PAGE_CONFIG.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "SoftwareApplication",
        name: siteName,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: base,
        description: PAGE_CONFIG.trndinnOverview.paragraphs[0],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free tier with 150 credits",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "127",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Buffer",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://buffer.com",
        description: PAGE_CONFIG.competitorOverview.paragraphs[0],
        sameAs: [
          "https://en.wikipedia.org/wiki/Buffer_(application)",
          "https://www.linkedin.com/company/bufferapp",
          "https://www.crunchbase.com/organization/buffer",
        ],
      },
    ],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata(ROUTE, PAGE_CONFIG.seo);
}

export default async function Page() {
  const [h1Override, structuredData] = await Promise.all([
    fetchMarketingH1Override(ROUTE),
    fetchMarketingStructuredData(ROUTE),
  ]);

  return (
    <>
      <MarketingStructuredData data={structuredData ?? defaultStructuredData()} />
      <CompareVsPage config={PAGE_CONFIG} h1Override={h1Override} />
    </>
  );
}
