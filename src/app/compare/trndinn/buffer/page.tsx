import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import { BUFFER_COMPARISON } from "@/lib/marketing/comparisons";
import { buildMarketingMetadata, fetchMarketingH1Override, fetchMarketingStructuredData } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";
import ComparePage from "@/views/ComparePage";

const ROUTE = BUFFER_COMPARISON.route;

function defaultStructuredData() {
  const base = getSiteUrl().replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: BUFFER_COMPARISON.seo.title,
        description: BUFFER_COMPARISON.seo.description,
        url: `${base}${ROUTE}`,
      },
      {
        "@type": "SoftwareApplication",
        name: siteName,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: base,
        description: BUFFER_COMPARISON.trndinnOverview.paragraphs[0],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free tier with 150 credits",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Buffer",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://buffer.com",
        description: BUFFER_COMPARISON.competitorOverview.paragraphs[0],
      },
    ],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata(ROUTE, BUFFER_COMPARISON.seo);
}

export default async function Page() {
  const [h1Override, structuredData] = await Promise.all([
    fetchMarketingH1Override(ROUTE),
    fetchMarketingStructuredData(ROUTE),
  ]);

  return (
    <>
      <MarketingStructuredData data={structuredData ?? defaultStructuredData()} />
      <ComparePage config={BUFFER_COMPARISON} h1Override={h1Override} />
    </>
  );
}
