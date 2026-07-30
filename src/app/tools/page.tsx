import type { Metadata } from "next";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import ToolsHubView from "@/views/tools/ToolsHubView";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/tools", {
    title: "Free Social Media Tools by Trndinn — No Login, No Signup",
    description:
      "Trndinn free tools: Instagram Reel Downloader, LinkedIn post generator, hook generator, hashtag finder & more. HD quality, no watermark, no signup. Try now.",
    keywords: [
      "free social media tools",
      "instagram reel downloader",
      "linkedin post generator",
      "linkedin hook generator",
      "hashtag generator",
      "social media growth tools",
      "free marketing tools",
      "trndinn tools",
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
