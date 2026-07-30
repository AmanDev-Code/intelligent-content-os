import type { Metadata } from "next";
import ContactPage from "@/views/ContactPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override } from "@/lib/serverSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/contact", {
    title: "Contact Trndinn — Sales, Support & Partnerships",
    description: `Get in touch with ${siteName}: product questions, sales inquiries, partnership requests, and customer support. We read every message and reply within one business day.`,
    keywords: [
      "contact trndinn",
      "trndinn support",
      "trndinn sales",
      "partnership inquiry",
      "customer service",
      "trndinn contact form",
    ],
  });
}

export default async function Page() {
  const h1Override = await fetchMarketingH1Override("/contact");
  return <ContactPage h1Override={h1Override} />;
}
