import type { Metadata } from "next";
import ContactPage from "@/views/ContactPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override } from "@/lib/serverSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/contact", {
    title: "Contact",
    description: `Contact ${siteName} for product questions, partnerships, and support. We read every message.`,
  });
}

export default async function Page() {
  const h1Override = await fetchMarketingH1Override("/contact");
  return <ContactPage h1Override={h1Override} />;
}
