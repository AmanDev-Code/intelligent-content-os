import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";
import CompareVsPage from "@/views/CompareVsPage";

const ROUTE = "/vs/postiz";

const PAGE_CONFIG = {
  slug: "postiz",
  competitorName: "Postiz",
  route: ROUTE,
  seo: {
    title: "Trndinn vs Postiz (2025) — Best Postiz Alternative & AI Social Media Scheduler",
    description:
      "Searching for a Postiz alternative? Compare Trndinn vs Postiz: Agentic AI content creation + Brand Voice vs 30+ channel scheduling. See which open-source scheduler wins for your growth. Start free.",
    keywords: [
      "postiz alternative",
      "ai social media scheduler",
      "trndinn vs postiz",
      "open source social media scheduler",
      "postiz vs competitors",
      "ai content scheduler",
      "social media management comparison",
      "buffer vs postiz vs trndinn",
      "linkedin scheduling tool",
      "self-hosted social media tool",
    ],
  },
  hero: {
    eyebrow: "Trndinn vs Postiz",
    title: "Agentic AI Content vs 30+ Channel Scheduling",
    subtitle:
      "Postiz schedules everywhere. Trndinn creates content everywhere. Choose between broad scheduling or brand-aware AI creation that drives growth.",
  },
  competitorOverview: {
    title: "Postiz: Open-Source Scheduling Powerhouse",
    paragraphs: [
      "Postiz (launched 2023) is an open-source social media scheduler gaining rapid traction. It connects to 30+ social networks including Instagram, TikTok, X, LinkedIn, Pinterest, YouTube, and niche platforms like Mastodon and Threads. For teams needing maximum platform coverage, Postiz is hard to beat.",
      "Postiz also offers unique technical features: MCP server for AI agent integration, CLI tool for developers, and self-hosting options. If you need to schedule to many platforms or want developer-friendly integrations, Postiz excels. However, its AI content creation is basic — it schedules well but doesn't create authentic brand content.",
    ],
  },
  trndinnOverview: {
    title: "Trndinn: Agentic Content + LinkedIn Focus",
    paragraphs: [
      "Trndinn takes a different approach: fewer platforms but deeper capabilities. Instead of scheduling everywhere, we focus on creating content that resonates — with Brand Voice training from your examples and a Content Engine for SEO-driven articles.",
      "LinkedIn is our flagship channel with deep support for personal profiles, Company Pages, and identity switching. Future channels will get the same agentic treatment. Trndinn doesn't just move content — it creates content strategically, tailored to your brand, with distribution that compounds over time.",
    ],
  },
  featureHighlights: [
    {
      title: "Platform Coverage",
      description: "Postiz wins with 30+ networks. Trndinn is LinkedIn-first with more channels planned.",
      winner: "postiz" as const,
    },
    {
      title: "AI Content Creation",
      description: "Trndinn creates authentic content from brand examples. Postiz has basic AI templates.",
      winner: "trndinn" as const,
    },
    {
      title: "Brand Voice Training",
      description: "Trndinn learns YOUR voice. Postiz uses generic prompts without personalization.",
      winner: "trndinn" as const,
    },
    {
      title: "Open Source & Self-Hosted",
      description: "Postiz is fully open-source with self-hosting options. Trndinn is SaaS-only.",
      winner: "postiz" as const,
    },
    {
      title: "Content Engine (SEO)",
      description: "Trndinn generates SEO articles + distribution. Postiz has no content engine.",
      winner: "trndinn" as const,
    },
    {
      title: "Developer Features",
      description: "Postiz has MCP server and CLI. Trndinn offers API + webhooks on Team tier.",
      winner: "postiz" as const,
    },
  ],
  comparisonTable: {
    title: "Feature Comparison: Open Source vs Agentic AI",
    rows: [
      { feature: "Social Platforms", postiz: "30+ networks", trndinn: "LinkedIn + more coming" },
      { feature: "AI Content Generation", postiz: "Basic templates", trndinn: "Agentic from examples" },
      { feature: "Brand Voice Training", postiz: "❌ Not available", trndinn: "✅ Learn from YOUR posts" },
      { feature: "Open Source", postiz: "✅ Fully OSS", trndinn: "❌ SaaS only" },
      { feature: "Self-Hosting", postiz: "✅ Available", trndinn: "❌ Not available" },
      { feature: "Content Engine (SEO)", postiz: "❌ Not available", trndinn: "✅ Full article generation" },
      { feature: "LinkedIn Company Pages", postiz: "✅ Supported", trndinn: "✅ + identity picker" },
      { feature: "MCP Server / CLI", postiz: "✅ Built-in", trndinn: "🔄 On roadmap" },
      { feature: "API Access", postiz: "✅ Available", trndinn: "✅ Team & Agency" },
      { feature: "Visual Calendar", postiz: "✅ Available", trndinn: "✅ Drag-and-drop" },
      { feature: "Pricing", postiz: "Free + hosting", trndinn: "Credits-based" },
      { feature: "Team Collaboration", postiz: "✅ Available", trndinn: "✅ Team & Agency" },
    ],
  },
  pricing: {
    competitorPlans: [
      { name: "Self-Hosted", price: "Free", note: "Open-source, host yourself" },
      { name: "Cloud", price: "$0-20/mo", note: "Hosted by Postiz team" },
      { name: "Enterprise", price: "Custom", note: "Support + features" },
    ],
    trndinnPlans: [
      { name: "Free", price: "150 credits", note: "14-day trial, no card required" },
      { name: "Creator", price: "$29/mo", note: "500 credits, solo creators" },
      { name: "Team", price: "$99/mo", note: "2,000 credits, API + webhooks" },
      { name: "Agency", price: "$299/mo", note: "10,000 credits, Content Engine" },
    ],
    notes: {
      competitor: [
        "Free if you self-host (requires technical setup)",
        "30+ channels including niche platforms",
        "MCP server for AI agent integration",
        "CLI tool for developers",
        "No AI content creation complexity",
      ],
      trndinn: [
        "Credits-based = predictable costs",
        "Professional support included",
        "Brand Voice training on all paid plans",
        "Content Engine for SEO traffic",
        "No infrastructure to manage",
      ],
    },
  },
  whyTrndinnWins: {
    title: "Why Trndinn Is the Better Postiz Alternative",
    points: [
      {
        title: "Content That Sounds Like You",
        description: "Postiz schedules content. But who creates it? Trndinn does — with Brand Voice trained on your examples, not generic AI output that sounds like everyone else.",
      },
      {
        title: "Content Engine for SEO Growth",
        description: "Postiz has no SEO capabilities. Trndinn turns keywords into articles and distributes them. One platform replaces your scheduler + your content marketing tool.",
      },
      {
        title: "No Infrastructure Headaches",
        description: "Self-hosting Postiz requires servers, updates, and maintenance. Trndinn is fully managed — you focus on growth, not DevOps.",
      },
      {
        title: "Agentic AI, Not Just Scheduling",
        description: "Postiz moves posts around. Trndinn's agents create, learn, and optimize. The AI gets better at YOUR brand over time.",
      },
      {
        title: "LinkedIn-First Depth",
        description: "LinkedIn is built deeply into Trndinn — personal profiles, Company Pages, identity switching, and content optimized for B2B engagement. Postiz supports LinkedIn but doesn't specialize in it.",
      },
    ],
  },
  testimonials: [
    {
      quote: "We tried Postiz but spent more time managing infrastructure than content. Trndinn just works — and the AI content is miles ahead.",
      author: "CTO",
      company: "Tech Startup",
    },
    {
      quote: "The Content Engine is what Postiz is missing. We get SEO articles that feed our social calendar. It's a complete content solution.",
      author: "Head of Growth",
      company: "B2B SaaS",
    },
  ],
  faqs: [
    {
      question: "Is Trndinn a good Postiz alternative?",
      answer: "Yes, if you need AI content creation and growth features. Postiz excels at scheduling to many channels. Trndinn excels at creating authentic content with Brand Voice and driving SEO growth. For teams prioritizing content quality over quantity of channels, Trndinn is the better Postiz alternative.",
    },
    {
      question: "What's the main difference between Postiz and Trndinn?",
      answer: "Postiz is a powerful open-source scheduler for 30+ platforms. Trndinn is an agentic content platform focused on LinkedIn with Brand Voice training and a Content Engine. Postiz schedules; Trndinn creates + schedules + grows.",
    },
    {
      question: "Is Postiz free vs Trndinn's paid model?",
      answer: "Postiz is free if you self-host (requires technical setup + hosting costs). Their hosted cloud is ~$20/mo. Trndinn starts at $29/mo but includes AI content generation, Brand Voice, and professional support. Factor in time saved and Trndinn is often cheaper.",
    },
    {
      question: "Should I use Postiz or Trndinn for LinkedIn?",
      answer: "Trndinn for LinkedIn. While Postiz supports LinkedIn, Trndinn is purpose-built for it — Company Pages, identity switching, Brand Voice optimized for LinkedIn engagement, and content strategies for B2B growth.",
    },
    {
      question: "Can I self-host Trndinn like Postiz?",
      answer: "Not currently. Trndinn is SaaS-only to ensure AI model updates and security. Postiz's self-hosting is great for teams with DevOps resources. Trndinn focuses on zero-maintenance growth for busy teams.",
    },
    {
      question: "Does Trndinn have Postiz's MCP server?",
      answer: "Trndinn's MCP server is on our Q2 2025 roadmap. Currently we offer API + webhooks on Team tier. Postiz's MCP is ideal for developers building AI agents. Trndinn's AI is already built into the platform.",
    },
    {
      question: "Which is better: Trndinn or Postiz for agencies?",
      answer: "Depends on your client needs. Postiz for clients needing 30+ platforms. Trndinn for clients wanting Brand Voice, AI content, and SEO growth. Many agencies use both — Postiz for wide distribution, Trndinn for content quality.",
    },
    {
      question: "Can I import from Postiz to Trndinn?",
      answer: "Yes. Our team can help migrate scheduled content and teach you Trndinn's Brand Voice features. Most teams see better engagement within weeks of switching.",
    },
  ],
  cta: {
    title: "Ready to upgrade from Postiz?",
    subtitle: "Stop managing infrastructure and start creating content that grows your brand. Start free with 150 credits.",
    primaryLabel: "Start Free Trial",
    secondaryLabel: "See Pricing",
  },
  relatedComparisons: [
    { name: "Buffer", href: "/vs/buffer", description: "Traditional scheduling comparison" },
    { name: "Hootsuite", href: "/vs/hootsuite", description: "Enterprise vs modern AI" },
    { name: "Predis", href: "/vs/predis", description: "AI content tools compared" },
    { name: "Taplio", href: "/vs/taplio", description: "LinkedIn-focused tools" },
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
          { "@type": "SoftwareApplication", name: "Postiz" },
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
        name: "Postiz",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://postiz.com",
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
