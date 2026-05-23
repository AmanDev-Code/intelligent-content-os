import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import {
  buildMarketingMetadata,
  fetchMarketingH1Override,
  fetchMarketingStructuredData,
} from "@/lib/serverSeo";
import { siteName } from "@/lib/site";
import RefundPolicy from "@/views/RefundPolicy";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/refund-policy", {
    title: "Refund Policy",
    description: `Read ${siteName}'s refund policy — subscription billing corrections, wrongful charges, and fraud-related requests.`,
    keywords: [
      "refund policy",
      "subscription refund",
      "billing disputes",
      "money back policy",
      "Polar refunds",
      "Trndinn refunds",
      "SaaS refund policy",
    ],
  });
}

export default async function RefundPolicyPage() {
  const [h1Override, structuredData] = await Promise.all([
    fetchMarketingH1Override("/refund-policy"),
    fetchMarketingStructuredData("/refund-policy"),
  ]);
  return (
    <>
      <MarketingStructuredData data={structuredData} />
      <RefundPolicy h1Override={h1Override} />
    </>
  );
}
