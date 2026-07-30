import type { Metadata } from "next";
import CareersPage from "@/views/CareersPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override } from "@/lib/serverSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/careers", {
    title: "Careers at Trndinn — Build the Agentic Social Media OS",
    description: `Join ${siteName} and help build the agentic social media platform. Open roles in engineering, design, growth, and marketing. Remote-friendly. See open positions.`,
    keywords: [
      "trndinn careers",
      "trndinn jobs",
      "AI startup jobs",
      "social media startup careers",
      "remote engineering jobs",
      "SaaS startup careers",
    ],
  });
}

export default async function Page() {
  const h1Override = await fetchMarketingH1Override("/careers");
  return <CareersPage h1Override={h1Override} />;
}
