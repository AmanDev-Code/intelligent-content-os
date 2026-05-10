import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import {
  buildMarketingMetadata,
  fetchMarketingH1Override,
  fetchMarketingStructuredData,
} from "@/lib/serverSeo";
import { siteName } from "@/lib/site";
import TermsOfUse from "@/views/TermsOfUse";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/terms-of-use", {
    title: "Terms of Use",
    description: `Read the ${siteName} Terms of Use — the rules and conditions governing your use of our AI social media platform.`,
    keywords: [
      "terms of use",
      "terms of service",
      "user agreement",
      "Trndinn terms",
      "SaaS terms",
      "subscription terms",
      "acceptable use",
    ],
  });
}

export default async function TermsOfUsePage() {
  const [h1Override, structuredData] = await Promise.all([
    fetchMarketingH1Override("/terms-of-use"),
    fetchMarketingStructuredData("/terms-of-use"),
  ]);
  return (
    <>
      <MarketingStructuredData data={structuredData} />
      <TermsOfUse h1Override={h1Override} />
    </>
  );
}
