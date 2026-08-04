import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";
import CompareVsPage, { type CompetitorVsConfig } from "@/views/CompareVsPage";

const ROUTE = "/vs/postiz";
const PUBLISHED = "2026-06-28";
const MODIFIED = "2026-08-03";

const PAGE_CONFIG: CompetitorVsConfig = {
  slug: "postiz",
  competitorName: "Postiz",
  route: ROUTE,
  seo: {
    title: "Trndinn vs Postiz — Best AI Postiz Alternative for 2026",
    description:
      "Compare Trndinn vs Postiz: agentic AI content + Brand Voice vs open-source multi-channel scheduling. See which social media platform wins for your growth. Start free.",
    keywords: [
      "postiz alternative",
      "postiz alternative 2026",
      "AI postiz alternative",
      "trndinn vs postiz",
      "open source scheduler",
      "AI social media scheduler",
      "social media management comparison",
      "buffer vs postiz vs trndinn",
      "linkedin scheduling tool",
      "self-hosted social media tool",
    ],
  },
  hero: {
    eyebrow: "Trndinn vs Postiz",
    title: "Best Postiz Alternative for Agentic Content and LinkedIn Growth",
    subtitle:
      "Postiz schedules everywhere. Trndinn creates content everywhere. Choose between broad scheduling or brand-aware AI creation that drives growth.",
  },
  tldr: {
    entityDeclaration:
      "is a managed, AI-native growth platform that trains agents on your brand examples, publishes to LinkedIn with Company Pages + identity switching, and generates SEO articles through a built-in Content Engine.",
    differentiator:
      "which is an open-source scheduler focused on breadth (30+ networks, self-host, CLI, MCP) with only template-level AI, Trndinn is a fully managed SaaS built around agentic creation and brand-authentic output.",
    stat: "Trndinn users report a 3.2× engagement lift over manual posting and generate on-brand content in an average of 8 seconds — with zero infrastructure to maintain. [Internal analytics, 2026]",
    badges: [
      "Managed, no DevOps",
      "Brand Voice from examples",
      "Content Engine included",
      "LinkedIn-first depth",
    ],
  },
  stats: [
    { value: "3.2×", label: "Engagement lift vs manual", icon: "trending" },
    { value: "150K+", label: "Posts scheduled to date", icon: "sparkles" },
    { value: "42", label: "Languages supported", icon: "globe" },
    { value: "8s", label: "Avg AI content generation", icon: "zap" },
  ],
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
  useCases: {
    title: "Who should use Postiz vs Trndinn",
    subtitle: "Postiz wins on breadth and OSS control. Trndinn wins on content creation and LinkedIn depth.",
    rows: [
      {
        scenario: "Developer wanting self-hosted control + CLI",
        competitor: "Ideal — open-source with MCP + CLI",
        trndinn: "Not the fit — managed SaaS only",
      },
      {
        scenario: "Solo creator needing 20+ channel scheduling",
        competitor: "Strong fit — 30+ networks supported",
        trndinn: "LinkedIn-first, more channels rolling out",
      },
      {
        scenario: "B2B team focused on LinkedIn growth",
        competitor: "Basic LinkedIn scheduling only",
        trndinn: "Company Pages + identity + Brand Voice",
      },
      {
        scenario: "Marketing team wanting AI to draft on-brand posts",
        competitor: "Template-level AI, no Brand Voice",
        trndinn: "Agents trained on your examples",
      },
      {
        scenario: "Content team needing SEO articles + social",
        competitor: "No content engine",
        trndinn: "Content Engine covers articles + distribution",
      },
    ],
  },
  migration: {
    title: "How to switch from Postiz to Trndinn",
    subtitle: "Migrate from self-hosted or Postiz Cloud to Trndinn in a single session.",
    steps: [
      {
        title: "Export your Postiz queue",
        description:
          "Dump scheduled posts and connected accounts from your Postiz instance. CSV or JSON works — Trndinn accepts both.",
      },
      {
        title: "Connect accounts and train Brand Voice",
        description:
          "Reconnect LinkedIn (personal + Company Pages) inside Trndinn, then paste your top-performing posts to train Brand Voice on real examples.",
      },
      {
        title: "Import queue and shut down the box",
        description:
          "Import the export, review AI-suggested variants, and go live. Once posts publish cleanly, tear down your Postiz server or cancel Postiz Cloud.",
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
      answer:
        "Yes for teams that want AI content, Brand Voice, and SEO growth. Postiz wins on multi-channel breadth. Trndinn wins on content creation and LinkedIn depth.",
    },
    {
      question: "What's the main difference between Postiz and Trndinn?",
      answer:
        "Postiz is an open-source scheduler for 30+ platforms. Trndinn is an agentic content platform with Brand Voice training and a Content Engine.",
    },
    {
      question: "Is Postiz free vs Trndinn's paid model?",
      answer:
        "Postiz is free to self-host (plus hosting cost) or ~$20/mo hosted. Trndinn starts at $29/mo and includes AI content, Brand Voice, and support.",
    },
    {
      question: "Should I use Postiz or Trndinn for LinkedIn?",
      answer:
        "Trndinn. It supports Company Pages, identity switching, and Brand Voice tuned to your LinkedIn examples. Postiz supports LinkedIn but does not specialize.",
    },
    {
      question: "Can I self-host Trndinn like Postiz?",
      answer:
        "No. Trndinn is SaaS-only so AI models, security, and Content Engine stay fully managed. Choose Postiz if self-hosting is a hard requirement.",
    },
    {
      question: "Does Trndinn have Postiz's MCP server?",
      answer:
        "MCP is on the Trndinn roadmap. Today Trndinn offers API + webhooks on Team and Agency plans. Postiz remains the developer-first option.",
    },
    {
      question: "Which is better: Trndinn or Postiz for agencies?",
      answer:
        "Postiz for clients on many platforms. Trndinn for clients wanting Brand Voice, AI content, and SEO growth. Some agencies run both in parallel.",
    },
    {
      question: "Can I import from Postiz to Trndinn?",
      answer:
        "Yes. Trndinn accepts CSV or JSON exports of your Postiz queue and can help retrain Brand Voice on your top-performing posts.",
    },
  ],
  cta: {
    title: "Ready to upgrade from Postiz?",
    subtitle: "Stop managing infrastructure and start creating content that grows your brand. Start free with 150 credits.",
    primaryLabel: "Start Free Trial",
    secondaryLabel: "See Pricing",
  },
  internalLinks: [
    {
      href: "/tools/auto-caption-generator",
      title: "Free Auto Caption Generator",
      subtitle: "Add captions to any video, no login",
      icon: "zap",
      featured: true,
    },
    { href: "/compare", title: "All comparisons", subtitle: "Trndinn vs every scheduler", icon: "scale" },
    { href: "/features", title: "Platform features", subtitle: "Brand Voice, agents, calendar", icon: "sparkles" },
    { href: "/pricing", title: "Trndinn pricing", subtitle: "Credits-based plans compared", icon: "trending" },
    { href: "/mcp", title: "MCP integration", subtitle: "Agent-native protocol on the roadmap", icon: "wrench" },
    { href: "/content-engine", title: "Content Engine", subtitle: "Keywords to SEO articles + posts", icon: "rocket" },
    { href: "/blog", title: "Trndinn blog", subtitle: "OSS-to-SaaS migration playbooks", icon: "book" },
  ],
  relatedComparisons: [
    { name: "Buffer", href: "/vs/buffer", description: "Traditional scheduling comparison" },
    { name: "Hootsuite", href: "/vs/hootsuite", description: "Enterprise vs modern AI" },
    { name: "Predis", href: "/vs/predis", description: "AI content tools compared" },
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
        sameAs: [
          "https://github.com/gitroomhq/postiz-app",
          "https://x.com/nevocharli",
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
