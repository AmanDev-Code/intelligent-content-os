import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";
import CompareVsPage, { type CompetitorVsConfig } from "@/views/CompareVsPage";

const ROUTE = "/vs/predis";
const PUBLISHED = "2026-06-28";
const MODIFIED = "2026-08-03";

const PAGE_CONFIG: CompetitorVsConfig = {
  slug: "predis",
  competitorName: "Predis",
  route: ROUTE,
  seo: {
    title: "Trndinn vs Predis.ai — Best AI Predis Alternative in 2026",
    description:
      "Compare Trndinn vs Predis.ai: Brand Voice from your examples, Content Engine, and agentic workflows vs generic AI post generation. See which AI platform wins. Start free.",
    keywords: [
      "predis alternative",
      "predis.ai alternative 2026",
      "AI predis alternative",
      "trndinn vs predis",
      "AI content generator",
      "AI social media tool",
      "brand voice ai",
      "ai content scheduler",
      "ai social media manager",
      "predis vs competitors",
    ],
  },
  hero: {
    eyebrow: "Trndinn vs Predis",
    title: "Best Predis Alternative for Brand-Authentic AI Content",
    subtitle:
      "Both platforms use AI. Predis focuses on quick content generation. Trndinn adds Brand Voice from your examples and a Content Engine for sustainable growth.",
  },
  tldr: {
    entityDeclaration:
      "is an AI-native growth platform whose agents learn your brand voice from your own examples, then create LinkedIn-first posts and long-form SEO articles through a Content Engine.",
    differentiator:
      "which generates fast, template-driven social posts and design assets from generic prompts, Trndinn produces authentic, brand-aligned content that compounds through SEO distribution.",
    stat: "Trndinn users report a 3.2× engagement lift over generic AI output and generate on-brand posts in an average of 8 seconds. [Internal analytics, 2026]",
    badges: [
      "Brand Voice from examples",
      "Content Engine included",
      "Agentic (not static) AI",
      "LinkedIn-first depth",
    ],
  },
  stats: [
    { value: "3.2×", label: "Engagement lift vs generic AI", icon: "trending" },
    { value: "150K+", label: "Posts scheduled to date", icon: "sparkles" },
    { value: "42", label: "Languages supported", icon: "globe" },
    { value: "8s", label: "Avg AI content generation", icon: "zap" },
  ],
  competitorOverview: {
    title: "Predis: Quick AI Content Generation",
    paragraphs: [
      "Predis launched in 2021 as an AI-powered content creation tool. It quickly generates social media posts, captions, hashtags, and even designs using AI templates. It's popular among creators who need fast content without extensive customization.",
      "Predis strengths include rapid content generation, built-in design tools, and content ideas based on competitor analysis. However, its AI produces more generic content — it lacks deep brand voice training and doesn't offer the agentic workflows that learn and improve over time. The focus is on quantity over quality.",
    ],
  },
  trndinnOverview: {
    title: "Trndinn: Agentic AI That Learns Your Voice",
    paragraphs: [
      "Trndinn approaches AI differently. Instead of generic content templates, our agents learn YOUR brand voice from examples you provide. Every post sounds authentically yours — not just AI-generated content that could come from anyone.",
      "But Trndinn goes further with the Content Engine that turns SEO keywords into articles and distributes them across channels. While Predis creates individual posts, Trndinn creates a complete content ecosystem — posts, articles, and distribution that compound over time. This is agentic AI vs standalone AI.",
    ],
  },
  featureHighlights: [
    {
      title: "Brand Voice Training",
      description: "Trndinn learns from YOUR examples. Predis uses generic templates that sound like everyone else.",
      winner: "trndinn" as const,
    },
    {
      title: "Content Speed",
      description: "Predis generates content faster with pre-built templates. Trndinn takes longer but produces better, more authentic content.",
      winner: "predis" as const,
    },
    {
      title: "Content Engine (SEO)",
      description: "Trndinn has a full Content Engine for articles + social. Predis focuses on social posts only.",
      winner: "trndinn" as const,
    },
    {
      title: "Design Capabilities",
      description: "Predis includes Canva-like design tools. Trndinn focuses on content quality and distribution.",
      winner: "predis" as const,
    },
    {
      title: "Agentic Workflows",
      description: "Trndinn agents learn and improve. Predis uses static prompts without learning.",
      winner: "trndinn" as const,
    },
    {
      title: "LinkedIn Optimization",
      description: "Both support LinkedIn, but Trndinn is purpose-built for LinkedIn growth strategies.",
      winner: "trndinn" as const,
    },
  ],
  comparisonTable: {
    title: "Feature Comparison: AI That Learns vs AI That Generates",
    rows: [
      { feature: "AI Content Generation", predis: "✅ Fast templates", trndinn: "✅ Agentic from examples" },
      { feature: "Brand Voice Training", predis: "❌ Generic only", trndinn: "✅ Learn from YOUR posts" },
      { feature: "Output Quality", predis: "Generic, templated", trndinn: "Authentic, brand-aligned" },
      { feature: "Content Engine (SEO)", predis: "❌ Not available", trndinn: "✅ Full article generation" },
      { feature: "Scheduling & Calendar", predis: "✅ Basic calendar", trndinn: "✅ Visual drag-and-drop" },
      { feature: "Design Tools", predis: "✅ Built-in Canva-like", trndinn: "AI image generation" },
      { feature: "Learning Over Time", predis: "❌ Static prompts", trndinn: "✅ Agentic improvement" },
      { feature: "Competitor Analysis", predis: "✅ Included", trndinn: "🔄 Coming soon" },
      { feature: "Repurposing Content", predis: "✅ Auto variants", trndinn: "✅ Multi-format export" },
      { feature: "LinkedIn Deep Features", predis: "✅ Standard support", trndinn: "✅ Company Pages + identity" },
      { feature: "Pricing", predis: "$29-99/mo", trndinn: "$29-299/mo credits-based" },
      { feature: "Free Tier", predis: "15 posts", trndinn: "150 credits" },
    ],
  },
  pricing: {
    competitorPlans: [
      { name: "Free", price: "$0", note: "15 AI posts, basic features" },
      { name: "Lite", price: "$29/mo", note: "Unlimited AI content" },
      { name: "Premium", price: "$59/mo", note: "Team collaboration" },
      { name: "Agency", price: "$139+/mo", note: "Multiple brands" },
    ],
    trndinnPlans: [
      { name: "Free", price: "150 credits", note: "14-day trial, no card required" },
      { name: "Creator", price: "$29/mo", note: "500 credits, Brand Voice" },
      { name: "Team", price: "$99/mo", note: "2,000 credits, API access" },
      { name: "Agency", price: "$299/mo", note: "10,000 credits, Content Engine" },
    ],
    notes: {
      competitor: [
        "Lower starting price with free tier",
        "Built-in design tools included",
        "Unlimited AI on paid plans",
        "Basic competitor analysis features",
      ],
      trndinn: [
        "Credits-based = transparent AI costs",
        "Content Engine adds massive value",
        "Brand Voice training on all paid plans",
        "Agentic workflows improve over time",
      ],
    },
  },
  whyTrndinnWins: {
    title: "Why Trndinn Beats Predis for Serious Growth",
    points: [
      {
        title: "Your Brand Voice, Not Generic AI",
        description: "Predis produces content that sounds like AI. Trndinn produces content that sounds like YOU — trained from your best examples, not generic templates.",
      },
      {
        title: "Content Engine: The Missing Piece",
        description: "Predis creates social posts. Trndinn creates social posts PLUS SEO articles PLUS distribution. One platform replaces three tools.",
      },
      {
        title: "Agentic AI That Improves",
        description: "Trndinn's agents learn what works for YOUR audience and get better over time. Predis uses the same static prompts every time.",
      },
      {
        title: "Growth-Focused, Not Just Content-Focused",
        description: "Predis helps you make content. Trndinn helps you GROW — with content designed for engagement, SEO, and compounding results.",
      },
    ],
  },
  useCases: {
    title: "Who should use Predis vs Trndinn",
    subtitle: "Predis is a fast content factory. Trndinn is a brand-aligned growth system.",
    rows: [
      {
        scenario: "Creator needing 30 quick posts a week",
        competitor: "Strong fit — template speed wins",
        trndinn: "Fewer, higher-quality on-brand posts",
      },
      {
        scenario: "Founder who needs posts to sound like them",
        competitor: "Generic AI output — sounds like everyone",
        trndinn: "Brand Voice learned from your examples",
      },
      {
        scenario: "B2B team using LinkedIn Company Pages",
        competitor: "Basic LinkedIn support",
        trndinn: "Company Pages + identity switching",
      },
      {
        scenario: "Marketing team wanting SEO articles + social",
        competitor: "No content engine",
        trndinn: "Content Engine turns keywords into articles",
      },
      {
        scenario: "Design-heavy Instagram-first workflow",
        competitor: "Built-in Canva-style editor",
        trndinn: "AI image gen + external design tools",
      },
    ],
  },
  migration: {
    title: "How to switch from Predis to Trndinn",
    subtitle: "Move from templated AI to brand-authentic content in a single session.",
    steps: [
      {
        title: "Export your Predis content",
        description:
          "Download recent posts, scheduled queue, and any brand assets from Predis. Save CSVs and design exports for reference.",
      },
      {
        title: "Connect accounts and train Brand Voice",
        description:
          "Reconnect LinkedIn (personal + Company Pages) in Trndinn and paste 5–10 of your best-performing organic posts to train Brand Voice.",
      },
      {
        title: "Rebuild the queue with agentic drafts",
        description:
          "Let Trndinn's agents draft on-brand replacements for each scheduled slot. Approve, publish, and cancel Predis.",
      },
    ],
  },
  testimonials: [
    {
      quote: "We tried Predis first but the content felt too generic. Trndinn's Brand Voice training made a massive difference — our posts finally sound like us.",
      author: "Content Lead",
      company: "B2B Marketing Agency",
    },
    {
      quote: "The Content Engine alone is worth switching. Predis made posts. Trndinn makes our entire content strategy — articles, social, everything.",
      author: "Founder",
      company: "SaaS Startup",
    },
  ],
  faqs: [
    {
      question: "Is Trndinn better than Predis?",
      answer:
        "Yes for brand-authentic content and long-term growth. Predis is faster for generic output. Trndinn wins on Brand Voice, Content Engine, and agentic AI.",
    },
    {
      question: "What's the main difference between Trndinn and Predis?",
      answer:
        "Trndinn trains on your own examples for Brand Voice; Predis uses generic templates. Trndinn also has a Content Engine for SEO articles Predis lacks.",
    },
    {
      question: "Is Predis cheaper than Trndinn?",
      answer:
        "Entry pricing is similar at ~$29/mo. Predis offers unlimited generic AI. Trndinn includes Brand Voice and a Content Engine that replaces separate SEO tools.",
    },
    {
      question: "Which AI tool generates better content: Trndinn or Predis?",
      answer:
        "Trndinn for authentic, brand-aligned content. Predis for fast, high-volume generic output. Trndinn learns your voice, Predis does not.",
    },
    {
      question: "Can I use Trndinn and Predis together?",
      answer:
        "Yes, but most teams find one is enough. Pair Predis for design-heavy Instagram posts with Trndinn for LinkedIn Brand Voice content.",
    },
    {
      question: "Does Trndinn have Predis's design features?",
      answer:
        "No native Canva-style editor. Trndinn generates AI images and integrates with Canva/Figma. Predis wins on built-in visual design for now.",
    },
    {
      question: "Why choose Trndinn over Predis?",
      answer:
        "Brand Voice from your examples, Content Engine for SEO, agentic AI that improves, and growth-focused strategy — none of which Predis offers today.",
    },
    {
      question: "Is Trndinn a good Predis alternative for agencies?",
      answer:
        "Yes. Trndinn's Brand Voice trains per client, and credits-based Agency pricing scales cleanly across brands. Content Engine adds SEO deliverables.",
    },
  ],
  cta: {
    title: "Ready for AI that sounds like your brand?",
    subtitle: "See the difference between generic AI and YOUR AI. Start free with 150 credits — no credit card required.",
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
    { href: "/compare", title: "All comparisons", subtitle: "Trndinn vs every AI content tool", icon: "scale" },
    { href: "/features", title: "Platform features", subtitle: "Brand Voice, agents, calendar", icon: "sparkles" },
    { href: "/pricing", title: "Trndinn pricing", subtitle: "Credits-based plans compared", icon: "trending" },
    { href: "/mcp", title: "MCP integration", subtitle: "Agent-native protocol support", icon: "wrench" },
    { href: "/content-engine", title: "Content Engine", subtitle: "Keywords to SEO articles + posts", icon: "rocket" },
    { href: "/blog", title: "Trndinn blog", subtitle: "AI content strategy playbooks", icon: "book" },
  ],
  relatedComparisons: [
    { name: "Buffer", href: "/vs/buffer", description: "Traditional vs agentic scheduling" },
    { name: "Hootsuite", href: "/vs/hootsuite", description: "Legacy vs modern AI" },
    { name: "Postiz", href: "/vs/postiz", description: "Open-source alternatives" },
    { name: "Taplio", href: "/vs/taplio", description: "LinkedIn AI tools" },
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
          { "@type": "SoftwareApplication", name: "Predis.ai" },
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
        name: "Predis.ai",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://predis.ai",
        description: PAGE_CONFIG.competitorOverview.paragraphs[0],
        sameAs: [
          "https://predis.ai",
          "https://www.linkedin.com/company/predis-ai",
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
