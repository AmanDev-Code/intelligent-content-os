import type { Metadata } from "next";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import ToolsHubView from "@/views/tools/ToolsHubView";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/tools", {
    title: "Free Social Media Tools — Grow Faster",
    description:
      "Free tools to grow your social media: Instagram Reel downloader, LinkedIn post generator, hook generator, hashtag finder, and more. No signup required.",
    keywords: [
      "free social media tools",
      "instagram reel downloader",
      "linkedin post generator",
      "social media growth tools",
      "free marketing tools",
      "content creation tools",
      "hashtag generator",
    ],
  });
}

export default function ToolsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
        ]}
      />
      <ToolsHubView />
    </>
  );
}
