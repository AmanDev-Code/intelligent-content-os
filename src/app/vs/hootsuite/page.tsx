import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";
import CompareVsPage from "@/views/CompareVsPage";

const ROUTE = "/vs/hootsuite";

const PAGE_CONFIG = {
  slug: "hootsuite",
  competitorName: "Hootsuite",
  route: ROUTE,
  seo: {
    title: "Trndinn vs Hootsuite (2025) — Best Hootsuite Alternative & Modern AI Platform",
    description:
      "Looking for a Hootsuite alternative? Compare Trndinn vs Hootsuite: Modern AI-powered social media management vs legacy enterprise tools. Better pricing, true AI, and faster ROI. Start free with 150 credits.",
    keywords: [
      "hootsuite alternative",
      "hootsuite alternative 2025",
      "ai social media manager vs hootsuite",
      "best hootsuite replacement",
      "trndinn vs hootsuite",
      "hootsuite competitor",
      "hootsuite pricing alternative",
      "modern social media management",
      "ai-powered social media tool",
      "enterprise social media tool",
    ],
  },
  hero: {
    eyebrow: "Trndinn vs Hootsuite",
    title: "The Modern Alternative to Hootsuite's Legacy Platform",
    subtitle:
      "Hootsuite built the enterprise social media category. Trndinn replaces complexity with AI agents that create, schedule, and grow — without the enterprise price tag.",
  },
  competitorOverview: {
    title: "Hootsuite: Enterprise Legacy Leader",
    paragraphs: [
      "Hootsuite has been the enterprise standard for social media management since 2008. They serve Fortune 500 companies with a comprehensive platform spanning 35+ social networks, enterprise-grade security, and extensive team collaboration features.",
      "Hootsuite's strength is scale: massive platform support, detailed analytics, employee advocacy programs, and integrations with enterprise tools. However, this comes at a cost — pricing starts at $99/month for individuals and quickly escalates to $739+ for teams. The platform can feel overwhelming for smaller teams.",
    ],
  },
  trndinnOverview: {
    title: "Trndinn: Agentic Growth for Modern Teams",
    paragraphs: [
      "Trndinn brings the power of modern AI to social media management without the enterprise complexity. Our agents don't just schedule — they create content from your brand examples, optimize posting times, and fuel a Content Engine for organic growth.",
      "While Hootsuite charges premium prices for legacy features, Trndinn delivers AI-first capabilities at a fraction of the cost: true Brand Voice training (not generic templates), agentic workflows that learn and improve, and a Content Engine that turns SEO keywords into distributed articles. All with modern UX that your team will actually want to use.",
    ],
  },
  featureHighlights: [
    {
      title: "AI Content Creation",
      description: "Trndinn agents create content from your brand examples. Hootsuite's AI is a basic writing assistant.",
      winner: "trndinn" as const,
    },
    {
      title: "Platform Coverage",
      description: "Hootsuite supports 35+ networks including TikTok, YouTube, Pinterest. Trndinn is LinkedIn-first with more coming.",
      winner: "hootsuite" as const,
    },
    {
      title: "Brand Voice Training",
      description: "Trndinn learns YOUR voice from examples. Hootsuite offers generic tone settings only.",
      winner: "trndinn" as const,
    },
    {
      title: "Pricing Accessibility",
      description: "Trndinn starts at $29/mo. Hootsuite Professional starts at $99/mo.",
      winner: "trndinn" as const,
    },
    {
      title: "Enterprise Security",
      description: "Hootsuite has SOC 2, SSO, detailed permissions. Trndinn is building enterprise features.",
      winner: "hootsuite" as const,
    },
    {
      title: "Content Engine",
      description: "Trndinn generates SEO articles and distributes them. Hootsuite has no content creation engine.",
      winner: "trndinn" as const,
    },
  ],
  comparisonTable: {
    title: "Feature Comparison: Modern AI vs Enterprise Legacy",
    rows: [
      { feature: "Starting Price", hootsuite: "$99/month", trndinn: "$29/month" },
      { feature: "AI Content Generation", hootsuite: "Basic AI writer", trndinn: "Agentic creation from brand examples" },
      { feature: "Brand Voice Training", hootsuite: "❌ Not available", trndinn: "✅ Train from your examples" },
      { feature: "Social Platforms", hootsuite: "35+ networks", trndinn: "LinkedIn + (more coming)" },
      { feature: "Content Engine (SEO)", hootsuite: "❌ Not available", trndinn: "✅ Full article generation" },
      { feature: "Social Listening", hootsuite: "✅ Included (higher tiers)", trndinn: "🔄 Coming soon" },
      { feature: "Team Collaboration", hootsuite: "✅ Advanced workflows", trndinn: "✅ Team & Agency plans" },
      { feature: "API Access", hootsuite: "✅ Enterprise only", trndinn: "✅ Team & Agency plans" },
      { feature: "SSO & SAML", hootsuite: "✅ Enterprise", trndinn: "🔄 On roadmap" },
      { feature: "Employee Advocacy", hootsuite: "✅ Separate product", trndinn: "❌ Not available" },
      { feature: "Analytics Depth", hootsuite: "✅ Enterprise-grade", trndinn: "✅ Growth-focused" },
      { feature: "UX/Modern Interface", hootsuite: "Legacy interface", trndinn: "Modern, fast, intuitive" },
    ],
  },
  pricing: {
    competitorPlans: [
      { name: "Professional", price: "$99/mo", note: "1 user, 10 social accounts" },
      { name: "Team", price: "$249/mo", note: "5 users, unlimited accounts" },
      { name: "Enterprise", price: "$739+/mo", note: "Custom, SSO, advanced features" },
    ],
    trndinnPlans: [
      { name: "Free", price: "150 credits", note: "14-day trial, no card required" },
      { name: "Creator", price: "$29/mo", note: "500 credits, solo creators" },
      { name: "Team", price: "$99/mo", note: "2,000 credits, API + webhooks" },
      { name: "Agency", price: "$299/mo", note: "10,000 credits, Content Engine" },
    ],
    notes: {
      competitor: [
        "Higher starting price but includes more platforms",
        "Enterprise security and compliance features",
        "Social listening included in higher tiers",
        "Employee advocacy platform available",
      ],
      trndinn: [
        "70% lower starting cost with AI included",
        "Credits-based = transparent costs",
        "All plans get full feature access",
        "No long-term contracts required",
      ],
    },
  },
  whyTrndinnWins: {
    title: "Why Teams Are Leaving Hootsuite for Trndinn",
    points: [
      {
        title: "True AI, Not Just Scheduling",
        description: "Hootsuite's AI writes drafts. Trndinn's AI agents CREATE complete posts from your brand examples — headlines, body text, hashtags, and engagement strategies.",
      },
      {
        title: "Your Brand Voice, Perfected",
        description: "Train our AI on your best content. Hootsuite can't learn your unique voice — it only offers generic tone templates that sound like everyone else.",
      },
      {
        title: "Content Engine: SEO Meets Social",
        description: "Turn keywords into SEO-optimized articles, then auto-distribute across channels. Hootsuite has nothing like this — you're stuck creating content manually.",
      },
      {
        title: "70% Lower Cost, More Features",
        description: "Hootsuite Professional: $99/mo for basic scheduling. Trndinn Creator: $29/mo with true AI content creation. Modern teams are switching.",
      },
      {
        title: "Modern UX Your Team Will Love",
        description: "Hootsuite's interface hasn't evolved much since 2008. Trndinn is built with modern UX principles — your team will actually want to use it.",
      },
    ],
  },
  testimonials: [
    {
      quote: "We left Hootsuite because we were paying $249/month for scheduling when we needed AI content creation. Trndinn delivered that at a third of the cost.",
      author: "VP of Marketing",
      company: "SaaS Company",
    },
    {
      quote: "The onboarding from Hootsuite was seamless. Within a day, our AI was writing posts that sounded exactly like our founder would write them.",
      author: "Social Media Manager",
      company: "Tech Startup",
    },
  ],
  faqs: [
    {
      question: "Is Trndinn a good Hootsuite alternative for enterprises?",
      answer: "Trndinn serves growing teams up to agency size. If you need SSO, SAML, advanced compliance, and social listening today, Hootsuite Enterprise still leads. But for teams under 50 users wanting AI-powered content creation without the enterprise price, Trndinn is the better Hootsuite alternative.",
    },
    {
      question: "Can Trndinn replace Hootsuite for our team?",
      answer: "If your primary needs are LinkedIn scheduling, AI content creation, and brand voice training, Trndinn replaces Hootsuite completely. If you need TikTok, Pinterest, or YouTube scheduling, check our roadmap — new channels are added monthly.",
    },
    {
      question: "Is Trndinn cheaper than Hootsuite?",
      answer: "Yes — significantly. Hootsuite Professional starts at $99/month for basic features. Trndinn Creator is $29/month and includes AI content generation. Teams typically save 60-70% switching from Hootsuite while getting better AI features.",
    },
    {
      question: "What's the best Hootsuite alternative in 2025?",
      answer: "For AI-powered social media management, Trndinn is the leading Hootsuite alternative. Unlike Hootsuite's legacy interface and basic AI, Trndinn offers agentic content creation, Brand Voice training, and a Content Engine at a fraction of the cost.",
    },
    {
      question: "Does Trndinn have Hootsuite's social listening features?",
      answer: "Social listening is on our Q2 2025 roadmap. For now, Trndinn excels at content creation, scheduling, and growth — areas where Hootsuite is weaker. Many teams use Trndinn for publishing and a specialized tool for listening.",
    },
    {
      question: "Can I import my Hootsuite content calendar into Trndinn?",
      answer: "Yes — our import tools support calendar exports from Hootsuite. The onboarding team can help migrate your scheduled posts and teach you the AI features that will differentiate your content strategy.",
    },
    {
      question: "Why should we switch from Hootsuite to Trndinn?",
      answer: "Three reasons: 1) True AI content creation that learns your voice vs Hootsuite's basic AI helper, 2) 70% lower cost with better features for most teams, 3) Content Engine that generates SEO articles — something Hootsuite simply doesn't have.",
    },
    {
      question: "Is Trndinn's AI better than Hootsuite's?",
      answer: "Trndinn's AI is fundamentally different. Hootsuite uses generic AI writing assistance. Trndinn uses agentic AI trained on YOUR brand examples — it learns your voice, writing style, and content patterns to create authentic posts that sound like you wrote them.",
    },
  ],
  cta: {
    title: "Ready to leave Hootsuite's legacy behind?",
    subtitle: "Start free with 150 credits. See why modern teams are switching to agentic social media management with better AI and 70% lower cost.",
    primaryLabel: "Start Free Trial",
    secondaryLabel: "See Pricing Comparison",
  },
  relatedComparisons: [
    { name: "Buffer", href: "/vs/buffer", description: "Simple scheduler vs AI platform" },
    { name: "Postiz", href: "/vs/postiz", description: "Open-source vs agentic" },
    { name: "Predis", href: "/vs/predis", description: "AI tools head-to-head" },
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
          { "@type": "SoftwareApplication", name: "Hootsuite" },
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
          price: "29",
          priceCurrency: "USD",
          priceValidUntil: "2025-12-31",
          description: "Creator plan with 500 credits",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "127",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Hootsuite",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://hootsuite.com",
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
