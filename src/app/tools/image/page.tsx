import type { Metadata } from "next";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { ImageToolsHubView } from "@/views/tools/ImageToolsHubView";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/tools/image", {
    title: "Free Image Tools — Converter, Compressor, Resizer",
    description:
      "49 free image tools: convert, compress, resize, crop, rotate, watermark, remove background, extract text, and more. No signup. No watermark. Instant in-browser processing.",
    keywords: [
      "free image tools",
      "image converter online",
      "image compressor",
      "image resizer",
      "crop image online",
      "remove background free",
      "image to webp",
      "jpg to png converter",
      "trndinn image tools",
    ],
  });
}

export default function ImageToolsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
          { name: "Image Tools", path: "/tools/image" },
        ]}
      />
      <ImageToolsHubView />
    </>
  );
}
