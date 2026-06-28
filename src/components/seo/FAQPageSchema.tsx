import { getSiteUrl, siteName } from "@/lib/site";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQPageSchemaProps {
  faqs: FAQItem[];
  pageUrl?: string;
}

/**
 * FAQPageSchema - FAQPage structured data (Schema.org)
 * Use on any page with FAQ content to enable rich snippets in search results
 * 
 * Example usage:
 * <FAQPageSchema 
 *   pageUrl={`${base}/compare/trndinn/postiz`}
 *   faqs={[
 *     { question: "What is...", answer: "Answer..." },
 *   ]}
 * />
 */
export function FAQPageSchema({ faqs, pageUrl }: FAQPageSchemaProps) {
  const base = getSiteUrl().replace(/\/$/, "");
  const url = pageUrl || base;

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * ComparisonFAQSchema - Pre-built FAQ for comparison pages
 * Combines generic agentic questions with comparison-specific ones
 */
interface ComparisonFAQProps {
  competitorName: string;
  pageUrl: string;
}

export function ComparisonFAQSchema({ competitorName, pageUrl }: ComparisonFAQProps) {
  const base = getSiteUrl().replace(/\/$/, "");
  const faqs: FAQItem[] = [
    {
      question: `What is agentic social media scheduling?`,
      answer: `Agentic social media scheduling means AI agents complete multi-step workflows — draft on-brand posts, adapt per platform, schedule on a calendar, publish, and distribute — with minimal UI friction. On Trndinn, agents act with your consent; today that includes the in-app Agent, Public API v1, webhooks, and Content Engine.`,
    },
    {
      question: `How is Trndinn different from ${competitorName}?`,
      answer: `Trndinn differentiates with Brand Voice built only from examples you provide (no feed scraping), deep LinkedIn workflows, and a Content Engine for SEO articles and multi-platform distribution. Compare the features above to see which platform fits your needs.`,
    },
    {
      question: `Can I try Trndinn for free?`,
      answer: `Yes. Start free with 150 credits — no card required. Connect LinkedIn, train Brand Voice from your examples, and experience agentic scheduling without any commitment.`,
    },
  ];

  return <FAQPageSchema faqs={faqs} pageUrl={pageUrl} />;
}

/**
 * ProductFAQSchema - Pre-built FAQ for product/marketing pages
 */
export function ProductFAQSchema() {
  const base = getSiteUrl().replace(/\/$/, "");
  const faqs: FAQItem[] = [
    {
      question: "What is agentic social media scheduling?",
      answer: "Agentic social media scheduling means AI agents complete multi-step workflows — draft on-brand posts, adapt per platform, schedule on a calendar, publish, and distribute — with minimal UI friction. On Trndinn, agents act with your consent; today that includes the in-app Agent, Public API v1, webhooks, and Content Engine.",
    },
    {
      question: "What does agentic mean on Trndinn?",
      answer: "Agentic means AI that completes multi-step workflows — draft, adapt per platform, schedule, publish, and distribute — with minimal UI friction. Today that includes the in-app Agent, Brand Kit, calendar, Public API v1, webhooks, and Content Engine.",
    },
    {
      question: "Can I connect Claude/ChatGPT today?",
      answer: "Use Public API v1 and signed webhooks to wire Trndinn into your automation stack today. A dedicated MCP server and CLI for Claude, ChatGPT, and Cursor are coming soon.",
    },
  ];

  return <FAQPageSchema faqs={faqs} pageUrl={`${base}/features`} />;
}
