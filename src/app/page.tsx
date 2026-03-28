import type { Metadata } from "next";
import Landing from "../views/Landing";
import { defaultDescription, getSiteUrl, siteName } from "@/lib/site";

const url = getSiteUrl();

export const metadata: Metadata = {
  description: defaultDescription,
  alternates: { canonical: `${url}/` },
  openGraph: {
    title: `${siteName} — AI social content platform`,
    description: defaultDescription,
    url: "/",
    type: "website",
    siteName,
    locale: "en_US",
  },
};

export default function HomePage() {
  return <Landing />;
}
