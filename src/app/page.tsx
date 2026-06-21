import type { Metadata } from "next";
import Landing from "../views/Landing";
import { MarketingPageJsonLd } from "@/components/seo/MarketingPageJsonLd";
import { defaultDescription, siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override } from "@/lib/serverSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/", {
    title: `${siteName} — All-in-One Agentic Social Media Platform`,
    description: defaultDescription,
    keywords: [
      siteName,
      "agentic social media scheduling tool",
      "all-in-one social media tool",
      "AI social media agent",
      "social media scheduling",
      "LinkedIn scheduling",
      "Content Engine",
      "brand voice AI",
    ],
  });
}

export default async function HomePage() {
  const h1Override = await fetchMarketingH1Override("/");
  return (
    <>
      <MarketingPageJsonLd />
      <Landing h1Override={h1Override} />
    </>
  );
}
