import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";
import CompareVsPage, { type CompetitorVsConfig } from "@/views/CompareVsPage";

const ROUTE = "/vs/hootsuite";
const PUBLISHED = "2026-06-28";
const MODIFIED = "2026-08-03";

const PAGE_CONFIG: CompetitorVsConfig = {
  slug: "hootsuite",
  competitorName: "Hootsuite",
  route: ROUTE,
  seo: {
    title: "Trndinn vs Hootsuite — Modern AI Hootsuite Alternative",
    description:
      "Compare Trndinn vs Hootsuite: modern AI-powered social media management vs legacy enterprise scheduling. Better pricing, true AI, faster ROI. Start free — no card.",
    keywords: [
      "hootsuite alternative",
      "hootsuite alternative 2026",
      "AI hootsuite replacement",
      "trndinn vs hootsuite",
      "hootsuite competitor",
      "modern social media tool",
      "hootsuite pricing alternative",
      "modern social media management",
      "ai-powered social media tool",
      "enterprise social media tool",
    ],
  },
  hero: {
    eyebrow: "Trndinn vs Hootsuite",
    title: "Best Hootsuite Alternative for Modern Marketing Teams",
    subtitle:
      "Hootsuite built the enterprise social media category. Trndinn replaces complexity with AI agents that create, schedule, and grow — without the enterprise price tag.",
  },
  tldr: {
    entityDeclaration:
      "is a modern, AI-native social media platform that trains agents on your brand examples to create LinkedIn-first content, schedule it, and drive SEO growth through a built-in Content Engine.",
    differentiator:
      "which charges $99+/mo for a legacy 2008-era interface and a basic AI writing helper, Trndinn starts at $29/mo and includes true agentic content creation plus Brand Voice training.",
    stat: "Teams that switch from Hootsuite report saving 60–70% on tooling costs and a 3.2× engagement lift over manual posting. [Internal analytics, 2026]",
    badges: [
      "70% lower starting price",
      "Agentic AI content",
      "Brand Voice training",
      "Content Engine included",
    ],
  },
  stats: [
    { value: "70%", label: "Lower starting cost vs Hootsuite", icon: "trending" },
    { value: "3.2×", label: "Engagement lift over manual", icon: "sparkles" },
    { value: "8s", label: "Avg AI post generation", icon: "zap" },
    { value: "42", label: "Languages supported", icon: "globe" },
  ],
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
  useCases: {
    title: "Who should use Hootsuite vs Trndinn",
    subtitle: "Hootsuite still fits large enterprise buyers. Trndinn is the better fit for growth-focused modern teams.",
    rows: [
      {
        scenario: "Fortune 500 needing SOC 2 + SSO + SAML today",
        competitor: "Strong fit — mature enterprise controls",
        trndinn: "Not the fit yet — SSO on roadmap",
      },
      {
        scenario: "5–50 person marketing team on LinkedIn + X",
        competitor: "Overpriced for the features actually used",
        trndinn: "Ideal — Brand Voice + credits pricing",
      },
      {
        scenario: "Team wanting AI to write on-brand posts",
        competitor: "Basic AI helper only",
        trndinn: "Agentic AI trained on your examples",
      },
      {
        scenario: "Content marketing team needing SEO articles + social",
        competitor: "No content engine — buy a second tool",
        trndinn: "Content Engine covers articles + distribution",
      },
      {
        scenario: "Agency managing 5–20 client brands",
        competitor: "Enterprise seats scale expensively",
        trndinn: "Agency plan absorbs credits across clients",
      },
    ],
  },
  migration: {
    title: "How to switch from Hootsuite to Trndinn",
    subtitle: "Most teams migrate off Hootsuite in a single afternoon and cancel the following billing cycle.",
    steps: [
      {
        title: "Export accounts and calendar from Hootsuite",
        description:
          "Use Hootsuite's data export to pull scheduled posts, account lists, and analytics. Save the CSVs for migration.",
      },
      {
        title: "Connect accounts and train Brand Voice",
        description:
          "Reconnect LinkedIn (personal + Company Pages) and any other networks inside Trndinn, then paste your best posts to train Brand Voice on real examples.",
      },
      {
        title: "Import queue, review AI drafts, publish",
        description:
          "Upload the CSV of scheduled posts, let Trndinn suggest AI variants for each slot, approve, and go live. Cancel your Hootsuite seat afterwards.",
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
      answer:
        "Trndinn fits teams up to agency size. Hootsuite Enterprise still leads on SSO and compliance today. For teams under 50 users wanting AI content, Trndinn wins.",
    },
    {
      question: "Can Trndinn replace Hootsuite for our team?",
      answer:
        "Yes for LinkedIn scheduling, AI content, and Brand Voice. If you need TikTok, Pinterest, or YouTube scheduling today, check the Trndinn roadmap.",
    },
    {
      question: "Is Trndinn cheaper than Hootsuite?",
      answer:
        "Yes. Trndinn Creator is $29/mo with AI included. Hootsuite Professional is $99/mo. Most teams save 60–70% after switching.",
    },
    {
      question: "What's the best Hootsuite alternative in 2026?",
      answer:
        "Trndinn. It replaces Hootsuite's scheduling and adds agentic content creation, Brand Voice, and a Content Engine at a fraction of the cost.",
    },
    {
      question: "Does Trndinn have Hootsuite's social listening features?",
      answer:
        "Not yet. Social listening is on the Q4 2026 roadmap. Teams often pair Trndinn for publishing with a specialized listening tool today.",
    },
    {
      question: "Can I import my Hootsuite content calendar into Trndinn?",
      answer:
        "Yes. Trndinn imports Hootsuite CSV exports. Onboarding walks you through account reconnection and Brand Voice training in under an hour.",
    },
    {
      question: "Why should we switch from Hootsuite to Trndinn?",
      answer:
        "True AI content creation vs a basic helper, 60–70% lower cost, and a Content Engine that turns keywords into SEO articles Hootsuite can't produce.",
    },
    {
      question: "Is Trndinn's AI better than Hootsuite's?",
      answer:
        "Yes. Hootsuite uses generic AI writing. Trndinn's agents train on your brand examples so posts sound like your voice, not templated AI.",
    },
  ],
  cta: {
    title: "Ready to leave Hootsuite's legacy behind?",
    subtitle: "Start free with 150 credits. See why modern teams are switching to agentic social media management with better AI and 70% lower cost.",
    primaryLabel: "Start Free Trial",
    secondaryLabel: "See Pricing Comparison",
  },
  internalLinks: [
    {
      href: "/tools/auto-caption-generator",
      title: "Free Auto Caption Generator",
      subtitle: "Add captions to any video, no login",
      icon: "zap",
      featured: true,
    },
    { href: "/compare", title: "All comparisons", subtitle: "Trndinn vs every enterprise tool", icon: "scale" },
    { href: "/features", title: "Platform features", subtitle: "Brand Voice, agents, calendar", icon: "sparkles" },
    { href: "/pricing", title: "Trndinn pricing", subtitle: "Credits-based plans vs seat pricing", icon: "trending" },
    { href: "/mcp", title: "MCP integration", subtitle: "Agent-native protocol support", icon: "wrench" },
    { href: "/content-engine", title: "Content Engine", subtitle: "Keywords to SEO articles + posts", icon: "rocket" },
    { href: "/blog", title: "Trndinn blog", subtitle: "Enterprise migration playbooks", icon: "book" },
  ],
  relatedComparisons: [
    { name: "Buffer", href: "/vs/buffer", description: "Simple scheduler vs AI platform" },
    { name: "Postiz", href: "/vs/postiz", description: "Open-source vs agentic" },
    { name: "Predis", href: "/vs/predis", description: "AI tools head-to-head" },
    { name: "Taplio", href: "/vs/taplio", description: "LinkedIn-focused tools" },
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
          priceValidUntil: "2026-12-31",
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
        sameAs: [
          "https://en.wikipedia.org/wiki/Hootsuite",
          "https://www.linkedin.com/company/hootsuite",
          "https://www.crunchbase.com/organization/hootsuite",
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
