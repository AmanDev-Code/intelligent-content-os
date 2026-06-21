import {
  AGENTIC_DEFINITION_FAQ,
  buildAgenticFaqPageSchema,
  type AgenticFaqItem,
} from "@/lib/marketing/agenticFaqSchema";

interface Props {
  faqs?: AgenticFaqItem[];
}

/** FAQPage JSON-LD for agentic positioning — inject on marketing routes. */
export function AgenticFaqJsonLd({ faqs = AGENTIC_DEFINITION_FAQ }: Props) {
  const data = buildAgenticFaqPageSchema(faqs);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
