import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";
import CompareVsPage from "@/views/CompareVsPage";

const ROUTE = "/vs/predis";

const PAGE_CONFIG = {
  slug: "predis",
  competitorName: "Predis",
  route: ROUTE,
  seo: {
    title: "Trndinn vs Predis (2025) — Best Predis Alternative & AI Content Generator",
    description:
      "Comparing Trndinn vs Predis? Both use AI for social media, but Trndinn's Brand Voice training, Content Engine, and agentic workflows set it apart. See which AI platform wins for your growth. Start free.",
    keywords: [
      "predis alternative",
      "predis alternative 2025",
      "best ai content generator",
      "trndinn vs predis",
      "ai social media tool comparison",
      "ai content creator tools",
      "brand voice ai",
      "ai content scheduler",
      "ai social media manager",
      "predis vs competitors",
    ],
  },
  hero: {
    eyebrow: "Trndinn vs Predis",
    title: "AI vs AI: The Better Choice for Social Media Growth",
    subtitle:
      "Both platforms use AI. Predis focuses on quick content generation. Trndinn adds Brand Voice from your examples and a Content Engine for sustainable growth.",
  },
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
      answer: "If you need authentic brand voice and growth-focused content, Trndinn wins. Predis is faster for generic content creation. But Trndinn's Brand Voice training, Content Engine, and agentic workflows create better long-term results. For creators prioritizing quality and SEO, Trndinn is the better Predis alternative.",
    },
    {
      question: "What's the main difference between Trndinn and Predis?",
      answer: "The key difference is Brand Voice training. Predis uses generic AI templates. Trndinn learns YOUR voice from examples. Plus Trndinn has a Content Engine (SEO articles) that Predis completely lacks. Trndinn's AI is agentic — it learns and improves over time.",
    },
    {
      question: "Is Predis cheaper than Trndinn?",
      answer: "Entry pricing is similar (~$29/mo), but value differs. Predis offers unlimited AI but with generic output. Trndinn gives fewer posts but higher quality with Brand Voice. Plus Trndinn's Content Engine replaces separate SEO tools, saving money overall.",
    },
    {
      question: "Which AI tool generates better content: Trndinn or Predis?",
      answer: "For authentic, brand-aligned content — Trndinn. For fast, volume-focused generic content — Predis. Trndinn's content is better because it's trained on YOUR examples, not generic templates. Readers can tell the difference.",
    },
    {
      question: "Can I use Trndinn and Predis together?",
      answer: "Most teams find one sufficient. If you want both, use Predis for quick design-heavy content and Trndinn for strategic, SEO-driven posts. But Trndinn's Content Engine often replaces the need for Predis entirely.",
    },
    {
      question: "Does Trndinn have Predis's design features?",
      answer: "Trndinn focuses on content quality and distribution rather than design tools. For design-heavy posts, integrate with Canva or use Predis alongside. Most growth-focused teams find Trndinn's content engine more valuable than built-in design.",
    },
    {
      question: "Why choose Trndinn over Predis?",
      answer: "Four reasons: 1) Authentic Brand Voice vs generic templates, 2) Content Engine for SEO that Predis lacks, 3) Agentic AI that improves vs static generation, 4) Growth-focused content strategy vs just post creation."
    },
    {
      question: "Is Trndinn a good Predis alternative for agencies?",
      answer: "Absolutely. Trndinn's Brand Voice training is ideal for managing multiple client voices authentically. The Content Engine lets agencies offer SEO + social packages. And credits-based pricing scales better than Predis's per-account model."
    },
  ],
  cta: {
    title: "Ready for AI that sounds like your brand?",
    subtitle: "See the difference between generic AI and YOUR AI. Start free with 150 credits — no credit card required.",
    primaryLabel: "Start Free Trial",
    secondaryLabel: "Compare Pricing",
  },
  relatedComparisons: [
    { name: "Buffer", href: "/vs/buffer", description: "Traditional vs agentic scheduling" },
    { name: "Hootsuite", href: "/vs/hootsuite", description: "Legacy vs modern AI" },
    { name: "Postiz", href: "/vs/postiz", description: "Open-source alternatives" },
    { name: "Taplio", href: "/vs/taplio", description: "LinkedIn AI tools" },
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
          { "@type": "SoftwareApplication", name: "Predis" },
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
        name: "Predis",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://predis.ai",
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
