import type { Metadata } from "next";
import BlogsPage from "@/views/BlogsPage";
import { getSiteUrl, siteName } from "@/lib/site";

const url = getSiteUrl();

export const metadata: Metadata = {
  title: "Blog",
  description: `Product updates, engineering notes, and guides from ${siteName}.`,
  alternates: { canonical: `${url}/blogs` },
  openGraph: {
    title: `Blog | ${siteName}`,
    description: "Releases, changelogs, and how we build Trndinn.",
    url: "/blogs",
    type: "website",
    siteName,
    locale: "en_US",
  },
};

export default function Page() {
  return <BlogsPage />;
}
