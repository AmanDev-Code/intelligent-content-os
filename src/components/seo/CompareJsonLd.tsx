import { getSiteUrl, siteName } from "@/lib/site";
import {
  COMPARE_POSTIZ_FAQ,
  type CompareFaqItem,
} from "@/lib/marketing/comparePostiz";
import { buildAgenticFaqPageSchema } from "@/lib/marketing/agenticFaqSchema";

interface Props {
  faqs?: CompareFaqItem[];
}

/**
 * Comparison page structured data: SoftwareApplication entries for both products
 * plus FAQPage schema for comparison-specific questions.
 */
export function CompareJsonLd({ faqs = COMPARE_POSTIZ_FAQ }: Props) {
  const base = getSiteUrl().replace(/\/$/, "");
  const compareUrl = `${base}/compare/trndinn/postiz`;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${base}/#trndinn-app`,
        name: siteName,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: base,
        description:
          "All-in-one agentic social media platform with Brand Voice, Content Engine for SEO and distribution, and LinkedIn-first publishing.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free trial with 150 credits",
        },
        featureList: [
          "In-app AI Agent",
          "Brand Voice from your examples",
          "Content Engine for SEO and 31-platform distribution",
          "LinkedIn scheduling and Company Pages",
          "Public API v1 and webhooks",
          "Newsletter via Listmonk",
        ],
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${compareUrl}#postiz`,
        name: "Postiz",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://postiz.com",
        description:
          "All-in-one agentic social media scheduling tool with MCP server, CLI, and 30+ live channels.",
        featureList: [
          "30+ social media channels",
          "MCP server and CLI for AI agents",
          "Smart Agent in-app chat",
          "Visual content calendar",
          "Open-source and self-hostable",
          "AI image and video generation",
        ],
      },
      {
        ...buildAgenticFaqPageSchema(
          faqs.map((f) => ({ question: f.question, answer: f.answer })),
        ),
        "@id": `${compareUrl}#faq`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
