/** Agentic definition FAQ — used for FAQPage JSON-LD on marketing routes (P1 #14). */
export type AgenticFaqItem = {
  question: string;
  answer: string;
};

export const AGENTIC_DEFINITION_FAQ: AgenticFaqItem[] = [
  {
    question: "What is agentic social media scheduling?",
    answer:
      "Agentic social media scheduling means AI agents complete multi-step workflows — draft on-brand posts, adapt per platform, schedule on a calendar, publish, and distribute — with minimal UI friction. On Trndinn, agents act with your consent; today that includes the in-app Agent, Public API v1, webhooks, and Content Engine. LinkedIn is live today.",
  },
  {
    question: "What does agentic mean on Trndinn?",
    answer:
      "Agentic means AI that completes multi-step workflows — draft, adapt per platform, schedule, publish, and distribute — with minimal UI friction. Today that includes the in-app Agent, Brand Kit, calendar, Public API v1, webhooks, and Content Engine. MCP and CLI for external agents like Claude and ChatGPT are on the roadmap.",
  },
  {
    question: "How is Trndinn different from Postiz?",
    answer:
      "Both platforms use agentic AI for social workflows. Trndinn differentiates with Brand Voice built only from examples you provide (no feed scraping), deep LinkedIn workflows, and a Content Engine for SEO articles, clusters, and 31-platform distribution. Postiz leads today on live channel breadth and shipped MCP/CLI for external agents — we're building MCP and CLI with Trndinn's Brand Voice and Content Engine baked in.",
  },
  {
    question: "Can I connect Claude/ChatGPT today?",
    answer:
      "Use Public API v1 and signed webhooks to wire Trndinn into your automation stack today. A dedicated MCP server and CLI for Claude, ChatGPT, and Cursor are coming soon — subscribe for updates when they ship.",
  },
];

export function buildAgenticFaqPageSchema(faqs: AgenticFaqItem[] = AGENTIC_DEFINITION_FAQ) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
