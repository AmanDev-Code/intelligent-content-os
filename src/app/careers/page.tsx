import type { Metadata } from "next";
import CareersPage from "@/views/CareersPage";
import { getSiteUrl, siteName } from "@/lib/site";

const url = getSiteUrl();

export const metadata: Metadata = {
  title: "Careers",
  description: `Open roles at ${siteName}. Join the team building AI-assisted social workflows.`,
  alternates: { canonical: `${url}/careers` },
  openGraph: {
    title: `Careers | ${siteName}`,
    description: "Explore open roles and apply with your profile, résumé, and screening answers.",
    url: "/careers",
    type: "website",
    siteName,
    locale: "en_US",
  },
};

export default function Page() {
  return <CareersPage />;
}
