import type { Metadata } from "next";
import CareersPage from "@/views/CareersPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata, fetchMarketingH1Override } from "@/lib/serverSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/careers", {
    title: "Careers",
    description: `Open roles at ${siteName}. Join the team building AI-assisted social workflows.`,
  });
}

export default async function Page() {
  const h1Override = await fetchMarketingH1Override("/careers");
  return <CareersPage h1Override={h1Override} />;
}
