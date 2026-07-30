import type { Metadata } from "next";
import BlogMarketingIndexPage from "@/views/BlogMarketingIndexPage";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";
import { getSiteUrl, siteName } from "@/lib/site";
import { fetchMarketingH1Override } from "@/lib/serverSeo";

const url = getSiteUrl();
const blogPath = `${url.replace(/\/$/, "")}${BLOG_BASE_PATH}`;

export const metadata: Metadata = {
  title: "Trndinn Blog — AI, Social Media & Growth Playbooks",
  description: `AI social media strategy, LinkedIn growth playbooks, content repurposing tactics, and product updates from the ${siteName} team. New guides every week.`,
  keywords: [
    "trndinn blog",
    "AI social media blog",
    "LinkedIn growth blog",
    "content marketing playbooks",
    "social media strategy blog",
    "AI content creation",
  ],
  alternates: { canonical: blogPath },
  openGraph: {
    title: `Trndinn Blog — AI, Social Media & Growth Playbooks`,
    description: `AI social media strategy, LinkedIn growth playbooks, and product updates from the ${siteName} team.`,
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
