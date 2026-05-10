import type { Metadata } from "next";
import BlogMarketingIndexPage from "@/views/BlogMarketingIndexPage";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";
import { getSiteUrl, siteName } from "@/lib/site";
import { fetchMarketingH1Override } from "@/lib/serverSeo";

const url = getSiteUrl();
const blogPath = `${url.replace(/\/$/, "")}${BLOG_BASE_PATH}`;

export const metadata: Metadata = {
  title: "Blog",
  description: `Product updates, guides, and notes from the ${siteName} team.`,
  alternates: { canonical: blogPath },
  openGraph: {
    title: `Blog | ${siteName}`,
    description: "Stories on building the AI social workspace, growth, and what's shipping next.",
    url: BLOG_BASE_PATH,
    type: "website",
    siteName,
    locale: "en_US",
  },
};

export default async function Page() {
  const h1Override = await fetchMarketingH1Override("/blog");
  return <BlogMarketingIndexPage h1Override={h1Override} />;
}
