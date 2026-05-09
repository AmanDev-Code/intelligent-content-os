import type { Metadata } from "next";
import CareersPage from "@/views/CareersPage";
import { siteName } from "@/lib/site";
import { buildMarketingMetadata } from "@/lib/serverSeo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/careers", {
    title: "Careers",
    description: `Open roles at ${siteName}. Join the team building AI-assisted social workflows.`,
  });
}

export default function Page() {
  return <CareersPage />;
}
