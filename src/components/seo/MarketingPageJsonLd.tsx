import { AgenticFaqJsonLd } from "@/components/seo/AgenticFaqJsonLd";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";

interface Props {
  /** Optional CMS-managed JSON-LD from `static_page_seo.structured_data`. */
  structuredData?: unknown | null;
}

/**
 * Standard marketing-page structured data: agentic FAQPage schema plus any
 * route-specific JSON-LD from the SEO admin.
 */
export function MarketingPageJsonLd({ structuredData }: Props) {
  return (
    <>
      <AgenticFaqJsonLd />
      <MarketingStructuredData data={structuredData} />
    </>
  );
}
