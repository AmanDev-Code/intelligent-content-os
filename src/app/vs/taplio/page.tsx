import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";
import CompareVsPage from "@/views/CompareVsPage";

const ROUTE = "/vs/taplio";

const PAGE_CONFIG = {
  slug: "taplio",
  competitorName: "Taplio",
  route: ROUTE,
  seo: {
    title: "Trndinn vs Taplio (2025) — Best Taplio Alternative & LinkedIn Growth Tool",
    description:
      "Looking for a Taplio alternative? Compare Trndinn vs Taplio for LinkedIn growth: AI content creation, Brand Voice, and Content Engine vs basic scheduling. Start free with 150 credits.",
    keywords: [
      "taplio alternative",
      "taplio alternative 2025",
      "linkedin growth tool",
      "linkedin ai tool",
      "ai linkedin content creator",
      "linkedin automation tool",
      "trndinn vs taplio",
      "taplio competitor",
      "best linkedin scheduling tool",
      "linkedin personal branding tool",
    ],
  },
  hero: {
    eyebrow: "Trndinn vs Taplio",
    title: "The Best Taplio Alternative for LinkedIn Growth",
    subtitle:
      "Taplio schedules LinkedIn posts. Trndinn grows LinkedIn with agentic AI, Brand Voice from your examples, and Content Engine for thought leadership at scale.",
  },
  competitorOverview: {
    title: "Taplio: LinkedIn Scheduling Specialist",
    paragraphs: [
      "Taplio (founded 2021) built its reputation as a LinkedIn-first scheduling tool. It offers a clean posting experience, basic AI writing assistant, and some engagement features like CRM for connections. For simple LinkedIn scheduling, it works well.",
      "Taplio's limitations show when you need more than scheduling: generic AI that doesn't learn your voice, no Brand Voice training from examples, no Content Engine for SEO articles, and pricing that escalates quickly. It's a scheduler, not a growth platform — a point driven home when comparing to Trndinn's agentic capabilities.",
    ],
  },
  trndinnOverview: {
    title: "Trndinn: LinkedIn Growth Engine",
    paragraphs: [
      "Trndinn approaches LinkedIn as a growth channel, not just a publishing platform. Our agentic AI learns your authentic voice from examples you provide — no generic, templated content. We combine this with Content Engine that turns thought leadership into SEO articles and multi-platform distribution.",
      "LinkedIn is our flagship channel with deep support: personal posts, Company Pages, identity switching, and content optimized for LinkedIn's algorithm. Whether you're building personal brand, generating leads, or establishing thought leadership, Trndinn provides the tools Taplio doesn't even know are missing.",
    ],
  },
  featureHighlights: [
    {
      title: "Brand Voice Training",
      description: "Trndinn learns YOUR voice from examples. Taplio uses generic AI templates.",
      winner: "trndinn" as const,
    },
    {
      title: "Content Engine (SEO)",
      description: "Trndinn turns LinkedIn posts into SEO articles. Taplio has no content engine.",
      winner: "trndinn" as const,
    },
    {
      title: "LinkedIn Scheduling",
      description: "Both handle LinkedIn scheduling. Trndinn adds Company Pages and identity switching.",
      winner: "trndinn" as const,
    },
    {
      title: "Lead Generation",
      description: "Taplio has basic CRM features. Trndinn focuses on content that generates inbound leads.",
      winner: "tie" as const,
    },
    {
      title: "Pricing Value",
      description: "Trndinn Creator at $29/mo. Taplio starts at $39/mo with fewer features.",
      winner: "trndinn" as const,
    },
    {
      title: "AI Quality",
      description: "Trndinn's agentic AI learns and improves. Taplio uses static prompts.",
      winner: "trndinn" as const,
    },
  ],
  comparisonTable: {
    title: "Feature Comparison: LinkedIn Growth vs Scheduling",
    rows: [
      { feature: "LinkedIn Scheduling", taplio: "✅ Core feature", trndinn: "✅ + identity picker" },
      { feature: "LinkedIn Company Pages", taplio: "❌ Not supported", trndinn: "✅ Full support" },
      { feature: "Brand Voice Training", taplio: "❌ Generic AI only", trndinn: "✅ Learn from YOUR posts" },
      { feature: "AI Content Generation", taplio: "Basic templates", trndinn: "Agentic from examples" },
      { feature: "Content Engine (SEO)", taplio: "❌ Not available", trndinn: "✅ Article generation" },
      { feature: "Lead Generation CRM", taplio: "✅ Basic features", trndinn: "🔄 Coming soon" },
      { feature: "Analytics & Insights", taplio: "✅ Post stats", trndinn: "✅ Growth-focused" },
      { feature: "Team Collaboration", taplio: "❌ Limited", trndinn: "✅ Team & Agency plans" },
      { feature: "LinkedIn Carousel Posts", taplio: "✅ Supported", trndinn: "✅ AI-generated" },
      { feature: "Starting Price", taplio: "$39/mo", trndinn: "$29/mo" },
      { feature: "Free Trial", taplio: "7 days", trndinn: "14 days (150 credits)" },
      { feature: "Other Platforms", taplio: "LinkedIn only", trndinn: "Multi-platform coming" },
    ],
  },
  pricing: {
    competitorPlans: [
      { name: "Starter", price: "$39/mo", note: "1 user, limited scheduling" },
      { name: "Standard", price: "$69/mo", note: "Limited AI, analytics" },
      { name: "Pro", price: "$129/mo", note: "Full features, team" },
    ],
    trndinnPlans: [
      { name: "Free", price: "150 credits", note: "14-day trial, no card required" },
      { name: "Creator", price: "$29/mo", note: "500 credits, Brand Voice" },
      { name: "Team", price: "$99/mo", note: "2,000 credits, API access" },
      { name: "Agency", price: "$299/mo", note: "10,000 credits, Content Engine" },
    ],
    notes: {
      competitor: [
        "LinkedIn-only focus limits versatility",
        "Basic AI doesn't improve over time",
        "No content creation beyond social posts",
        "Company Pages not supported",
        "CRM features are fairly basic",
      ],
      trndinn: [
        "25% lower starting price",
        "Brand Voice training on all paid plans",
        "Content Engine included at Agency tier",
        "Company Pages + identity switching",
        "AI learns and improves over time",
      ],
    },
  },
  whyTrndinnWins: {
    title: "Why Trndinn Is the Better Taplio Alternative",
    points: [
      {
        title: "Brand Voice That Sounds Like YOU",
        description: "Taplio's AI produces generic LinkedIn posts. Trndinn learns your authentic voice from examples — every post sounds like you wrote it, not like AI-generated content.",
      },
      {
        title: "Company Pages Support",
        description: "Taplio ignores Company Pages. Trndinn supports personal profiles AND Company Pages with identity switching — essential for B2B marketing and employee advocacy.",
      },
      {
        title: "From LinkedIn Posts to SEO Articles",
        description: "Turn your LinkedIn thought leadership into SEO-optimized articles with Trndinn's Content Engine. Repurpose your best ideas for organic search traffic. Taplio can't do this.",
      },
      {
        title: "Agentic AI That Learns",
        description: "Taplio's AI uses the same prompts every time. Trndinn's agents learn what works for YOUR audience and continuously improve your content strategy.",
      },
      {
        title: "Better Value, More Features",
        description: "Trndinn Creator at $29/mo includes Brand Voice. Taplio Starter at $39/mo has limited features. You get more value for less money.",
      },
    ],
  },
  testimonials: [
    {
      quote: "We switched from Taplio because the content felt too generic. Trndinn's Brand Voice training changed everything — our engagement rate doubled in 30 days.",
      author: "LinkedIn Creator",
      company: "Personal Brand",
    },
    {
      quote: "Managing both personal and Company Pages in one tool was a game-changer. Taplio couldn't do this. Plus the Content Engine turns our posts into articles for our blog.",
      author: "Marketing Manager",
      company: "B2B Tech Company",
    },
  ],
  faqs: [
    {
      question: "Is Trndinn a good Taplio alternative?",
      answer: "Yes — Trndinn replaces Taplio's scheduling while adding Brand Voice training, Company Pages support, and Content Engine that Taplio lacks. If you want authentic LinkedIn content that actually grows your presence, Trndinn is the superior Taplio alternative.",
    },
    {
      question: "What's the best alternative to Taplio in 2025?",
      answer: "For LinkedIn-focused creators and teams, Trndinn is the best Taplio alternative. Unlike Taplio's basic AI and scheduling-only approach, Trndinn offers Brand Voice training from your examples and Content Engine for thought leadership at scale.",
    },
    {
      question: "Does Trndinn support LinkedIn Company Pages like Taplio?",
      answer: "Better than Taplio — Trndinn supports BOTH personal profiles AND Company Pages. Taplio only does personal profiles. Trndinn also has identity switching so you can manage multiple accounts easily.",
    },
    {
      question: "Is Trndinn cheaper than Taplio?",
      answer: "Yes. Trndinn Creator starts at $29/mo. Taplio Starter is $39/mo. Plus Trndinn includes Brand Voice training, which Taplio doesn't offer at any price. You get more features for 25% less.",
    },
    {
      question: "Can Trndinn really learn my writing style?",
      answer: "Yes. Unlike Taplio's generic AI, Trndinn analyzes examples of your best posts to learn your unique voice, tone, and writing patterns. The AI then creates content that sounds authentically like you.",
    },
    {
      question: "Does Trndinn have Taplio's CRM features?",
      answer: "Trndinn focuses on content creation and growth rather than CRM. We believe great content generates inbound leads without manual CRM management. However, lead management features are on our Q2 roadmap.",
    },
    {
      question: "Should I switch from Taplio to Trndinn?",
      answer: "Switch if you: 1) Want authentic content that sounds like you, not AI soup, 2) Need Company Page support, 3) Want to turn LinkedIn content into SEO articles, 4) Are looking for better value and more features. Most switchers see engagement improvements within weeks.",
    },
    {
      question: "Can I import my Taplio content to Trndinn?",
      answer: "Yes. We can help migrate your scheduled posts and train your Brand Voice on your best-performing Taplio content. The onboarding team will have you creating better content within minutes.",
    },
  ],
  cta: {
    title: "Ready to grow beyond Taplio?",
    subtitle: "The best Taplio alternative for LinkedIn growth. Start free with 150 credits and see the difference Brand Voice makes.",
    primaryLabel: "Start Free Trial",
    secondaryLabel: "Compare Pricing",
  },
  relatedComparisons: [
    { name: "Buffer", href: "/vs/buffer", description: "Traditional scheduling tools" },
    { name: "Hootsuite", href: "/vs/hootsuite", description: "Enterprise platforms" },
    { name: "Postiz", href: "/vs/postiz", description: "Open-source alternatives" },
    { name: "Predis", href: "/vs/predis", description: "AI content tools" },
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
          { "@type": "SoftwareApplication", name: "Taplio" },
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
          description: "Creator plan with Brand Voice training",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "89",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Taplio",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://taplio.com",
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
