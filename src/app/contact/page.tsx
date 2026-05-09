import type { Metadata } from "next";
import ContactPage from "@/views/ContactPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata } from "@/lib/serverSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/contact", {
    title: "Contact",
    description: `Contact ${siteName} for product questions, partnerships, and support. We read every message.`,
  });
}

export default function Page() {
  return <ContactPage />;
}
