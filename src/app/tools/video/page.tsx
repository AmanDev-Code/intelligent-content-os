import type { Metadata } from "next";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { VideoToolsHubView } from "@/views/tools/VideoToolsHubView";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/tools/video", {
    title: "Free Video Tools — Converter, Recorder, Screen Recorder",
    description:
      "Free video tools: convert MP4, MOV, WebM and more, record from webcam, capture your screen, trim, extract audio, and compress video. All in-browser. No signup required.",
    keywords: [
      "free video tools",
      "video converter online",
      "mp4 to webm converter",
      "screen recorder online",
      "webcam recorder",
      "compress video online",
      "trim video online",
      "trndinn video tools",
    ],
  });
}

export default function VideoToolsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
          { name: "Video Tools", path: "/tools/video" },
        ]}
      />
      <VideoToolsHubView />
    </>
  );
}
