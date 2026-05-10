import type { Metadata } from "next";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import {
  buildMarketingMetadata,
  fetchMarketingH1Override,
  fetchMarketingStructuredData,
} from "@/lib/serverSeo";
import { siteName } from "@/lib/site";
import PrivacyPolicy from "@/views/PrivacyPolicy";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/privacy-policy", {
    title: "Privacy Policy",
    description: `Read ${siteName}'s Privacy Policy to understand how we collect, use, and protect your personal data.`,
    keywords: [
      "privacy policy",
      "data protection",
      "personal data",
      "GDPR",
      "Cookie policy companion",
      "Trndinn privacy",
      "SaaS privacy",
    ],
  });
}

export default async function PrivacyPolicyPage() {
  const [h1Override, structuredData] = await Promise.all([
    fetchMarketingH1Override("/privacy-policy"),
    fetchMarketingStructuredData("/privacy-policy"),
  ]);
  return (
    <>
      <MarketingStructuredData data={structuredData} />
      <PrivacyPolicy h1Override={h1Override} />
    </>
  );
}
