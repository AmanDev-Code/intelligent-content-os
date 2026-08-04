import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";
import CompareVsPage, { type CompetitorVsConfig } from "@/views/CompareVsPage";

const ROUTE = "/vs/taplio";
const PUBLISHED = "2026-06-28";
const MODIFIED = "2026-08-03";

const PAGE_CONFIG: CompetitorVsConfig = {
  slug: "taplio",
  competitorName: "Taplio",
  route: ROUTE,
  seo: {
    title: "Trndinn vs Taplio — Best AI Taplio Alternative for LinkedIn",
    description:
      "Compare Trndinn vs Taplio for LinkedIn growth: AI content, Brand Voice, and Content Engine vs Taplio scheduling. Start free with 150 credits — no card required.",
    keywords: [
      "taplio alternative",
      "taplio alternative 2026",
      "AI taplio alternative",
      "trndinn vs taplio",
      "linkedin growth tool",
      "AI linkedin content creator",
      "taplio competitor",
      "best linkedin scheduling tool",
      "linkedin personal branding tool",
      "linkedin company pages tool",
    ],
  },
  hero: {
    eyebrow: "Trndinn vs Taplio",
    title: "Best Taplio Alternative for LinkedIn Growth",
    subtitle:
      "Taplio schedules LinkedIn posts. Trndinn grows LinkedIn with agentic AI, Brand Voice from your examples, and Content Engine for thought leadership at scale.",
  },
  tldr: {
    entityDeclaration:
      "is an AI-native LinkedIn growth platform that trains agents on your own posts to write in your voice, supports personal profiles AND Company Pages with identity switching, and generates SEO articles through a Content Engine.",
    differentiator:
      "which is a LinkedIn-only scheduler with a generic AI writer, no Company Pages support, and no SEO article workflow, Trndinn covers the full personal-brand-to-inbound-lead pipeline.",
    stat: "Trndinn Creator starts at $29/mo (25% below Taplio's $39/mo Starter) and users report a 3.2× engagement lift over generic AI content. [Internal analytics, 2026]",
    badges: [
      "25% cheaper than Taplio",
      "Company Pages supported",
      "Brand Voice from examples",
      "Content Engine included",
    ],
  },
  stats: [
    { value: "3.2×", label: "Engagement lift over generic AI", icon: "trending" },
    { value: "25%", label: "Cheaper starter vs Taplio", icon: "sparkles" },
    { value: "42", label: "Languages supported", icon: "globe" },
    { value: "8s", label: "Avg AI content generation", icon: "zap" },
  ],
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
  useCases: {
    title: "Who should use Taplio vs Trndinn",
    subtitle: "Both target LinkedIn, but Trndinn covers the growth workflow Taplio leaves on the table.",
    rows: [
      {
        scenario: "Solo operator scheduling personal LinkedIn posts",
        competitor: "Works — clean UI, decent basics",
        trndinn: "Cheaper starter, agentic drafts included",
      },
      {
        scenario: "B2B marketer running Company Pages",
        competitor: "Not supported today",
        trndinn: "Personal + Company Pages + identity switching",
      },
      {
        scenario: "Founder wanting posts to sound like them",
        competitor: "Generic AI templates",
        trndinn: "Brand Voice trained on your best posts",
      },
      {
        scenario: "Content lead needing SEO articles + LinkedIn",
        competitor: "No article workflow",
        trndinn: "Content Engine covers articles + distribution",
      },
      {
        scenario: "LinkedIn CRM heavy prospecting workflow",
        competitor: "Basic CRM features included",
        trndinn: "CRM on roadmap; strong content side today",
      },
    ],
  },
  migration: {
    title: "How to switch from Taplio to Trndinn",
    subtitle: "Move your LinkedIn workflow in a single session, personal profile and Company Pages included.",
    steps: [
      {
        title: "Export scheduled posts from Taplio",
        description:
          "Download your Taplio queue and any top-performing content you've published. Save the CSV plus your best 10–20 posts as Brand Voice training input.",
      },
      {
        title: "Connect LinkedIn and train Brand Voice",
        description:
          "Reconnect your personal profile AND Company Pages inside Trndinn, then paste your best posts to train Brand Voice on real, on-brand examples.",
      },
      {
        title: "Import queue and cancel Taplio",
        description:
          "Import the CSV, let Trndinn's agents draft on-brand variants, publish, and cancel Taplio at the next billing cycle.",
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
      answer:
        "Yes. Trndinn replaces Taplio's scheduling and adds Brand Voice, Company Pages, and a Content Engine that Taplio doesn't offer.",
    },
    {
      question: "What's the best alternative to Taplio in 2026?",
      answer:
        "Trndinn. It offers Brand Voice trained on your examples, Company Pages support, and SEO article generation at a lower starting price than Taplio.",
    },
    {
      question: "Does Trndinn support LinkedIn Company Pages like Taplio?",
      answer:
        "Better than Taplio. Trndinn supports personal profiles AND Company Pages with identity switching. Taplio supports personal profiles only.",
    },
    {
      question: "Is Trndinn cheaper than Taplio?",
      answer:
        "Yes. Trndinn Creator is $29/mo. Taplio Starter is $39/mo. Trndinn also includes Brand Voice training that Taplio doesn't offer at any tier.",
    },
    {
      question: "Can Trndinn really learn my writing style?",
      answer:
        "Yes. Paste 5–10 of your best-performing LinkedIn posts and Trndinn's agents learn tone, structure, and vocabulary to draft on-brand content.",
    },
    {
      question: "Does Trndinn have Taplio's CRM features?",
      answer:
        "Not yet. LinkedIn CRM is on the Trndinn roadmap. Today, Trndinn focuses on content that drives inbound leads instead of manual prospecting.",
    },
    {
      question: "Should I switch from Taplio to Trndinn?",
      answer:
        "Switch if you want Brand Voice, Company Pages, SEO articles, or lower cost. Most switchers see engagement improvements within four weeks.",
    },
    {
      question: "Can I import my Taplio content to Trndinn?",
      answer:
        "Yes. Trndinn imports Taplio CSV exports and can retrain Brand Voice on your top-performing Taplio posts during onboarding.",
    },
  ],
  cta: {
    title: "Ready to grow beyond Taplio?",
    subtitle: "The best Taplio alternative for LinkedIn growth. Start free with 150 credits and see the difference Brand Voice makes.",
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
    { href: "/compare", title: "All comparisons", subtitle: "Trndinn vs every LinkedIn tool", icon: "scale" },
    { href: "/features", title: "Platform features", subtitle: "Brand Voice, agents, calendar", icon: "sparkles" },
    { href: "/pricing", title: "Trndinn pricing", subtitle: "Credits-based plans compared", icon: "trending" },
    { href: "/mcp", title: "MCP integration", subtitle: "Agent-native protocol support", icon: "wrench" },
    { href: "/content-engine", title: "Content Engine", subtitle: "Turn LinkedIn posts into SEO articles", icon: "rocket" },
    { href: "/blog", title: "Trndinn blog", subtitle: "LinkedIn growth playbooks", icon: "book" },
  ],
  relatedComparisons: [
    { name: "Buffer", href: "/vs/buffer", description: "Traditional scheduling tools" },
    { name: "Hootsuite", href: "/vs/hootsuite", description: "Enterprise platforms" },
    { name: "Postiz", href: "/vs/postiz", description: "Open-source alternatives" },
    { name: "Predis", href: "/vs/predis", description: "AI content tools" },
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
          priceValidUntil: "2026-12-31",
          description: "Creator plan with Brand Voice training",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "127",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Taplio",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://taplio.com",
        description: PAGE_CONFIG.competitorOverview.paragraphs[0],
        sameAs: [
          "https://taplio.com",
          "https://www.linkedin.com/company/taplio",
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
