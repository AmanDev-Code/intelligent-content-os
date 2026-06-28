import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";
import CompareVsPage from "@/views/CompareVsPage";

const ROUTE = "/vs/buffer";

const PAGE_CONFIG = {
  slug: "buffer",
  competitorName: "Buffer",
  route: ROUTE,
  seo: {
    title: "Trndinn vs Buffer (2025) — Best Buffer Alternative & AI Social Media Tool",
    description:
      "Looking for the best Buffer alternative? Compare Trndinn vs Buffer: AI-powered content creation, Brand Voice from your examples, and Content Engine vs traditional scheduling. Start free with 150 credits.",
    keywords: [
      "best buffer alternative",
      "buffer vs ai social media tool",
      "buffer alternative 2025",
      "ai social media manager vs buffer",
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
    title: "The Best Buffer Alternative for AI-Powered Social Media Growth",
    subtitle:
      "Buffer pioneered social scheduling. Trndinn adds agentic AI that learns your brand voice, creates content, and grows your audience — not just schedules posts.",
  },
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
      answer: "Yes. Trndinn replaces Buffer's core scheduling functionality while adding AI content creation, Brand Voice, and Content Engine features that Buffer doesn't offer. If you're looking for a Buffer alternative that does more than just schedule, Trndinn is purpose-built for growth.",
    },
    {
      question: "What's the best Buffer alternative in 2025?",
      answer: "For teams wanting AI-powered content creation and growth features, Trndinn is the best Buffer alternative. Unlike Buffer's per-channel pricing, Trndinn uses credits-based pricing that's more transparent for AI-heavy workflows. Plus you get Brand Voice training and SEO content generation.",
    },
    {
      question: "Can I import my Buffer schedule into Trndinn?",
      answer: "Trndinn's import tools let you bring over your content calendar and upcoming posts. Our onboarding team can help migrate your Buffer workflow to take advantage of Trndinn's AI features.",
    },
    {
      question: "Does Trndinn cost more than Buffer?",
      answer: "Not necessarily. Buffer's per-channel pricing ($5-10/channel) can exceed Trndinn's credits-based plans for multi-channel creators. With Trndinn, you get AI content generation included — no extra fees for the AI writer.",
    },
    {
      question: "Buffer vs Trndinn: Which is better for LinkedIn?",
      answer: "Trndinn is specifically optimized for LinkedIn with deeper Company Page support, identity switching, and AI trained to write engaging LinkedIn content. Buffer supports LinkedIn but doesn't have LinkedIn-specific features.",
    },
    {
      question: "Will switching from Buffer be difficult?",
      answer: "Trndinn's onboarding includes guided setup and import tools. Most teams are creating content with their Brand Voice within 30 minutes of signing up. Our support team is available to answer questions.",
    },
  ],
  cta: {
    title: "Ready to upgrade from Buffer?",
    subtitle: "Start free with 150 credits. No credit card required. See why teams are switching to agentic social media.",
    primaryLabel: "Start Free Trial",
    secondaryLabel: "Compare Pricing",
  },
  relatedComparisons: [
    { name: "Hootsuite", href: "/vs/hootsuite", description: "Enterprise legacy vs modern AI" },
    { name: "Postiz", href: "/vs/postiz", description: "Open-source vs agentic platform" },
    { name: "Predis", href: "/vs/predis", description: "AI vs AI: Which creates better?" },
    { name: "Taplio", href: "/vs/taplio", description: "LinkedIn tools compared" },
  ],
};

function defaultStructuredData() {
  const base = getSiteUrl().replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ComparisonPage",
        name: PAGE_CONFIG.seo.title,
        description: PAGE_CONFIG.seo.description,
        url: `${base}${ROUTE}`,
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
