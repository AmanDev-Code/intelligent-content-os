import type { Metadata } from "next";
import Landing from "../views/Landing";
import { defaultDescription, siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override } from "@/lib/serverSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/", {
    title: `${siteName} — AI social content platform`,
    description: defaultDescription,
    keywords: [
      siteName,
      "AI content",
      "social media scheduling",
      "LinkedIn",
      "X Twitter",
      "Instagram scheduling",
      "YouTube Shorts",
      "AI reels",
      "social media analytics",
      "content creation platform",
    ],
  });
}

export default async function HomePage() {
  const h1Override = await fetchMarketingH1Override("/");
  return <Landing h1Override={h1Override} />;
}
