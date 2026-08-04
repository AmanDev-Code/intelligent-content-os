import { getSiteUrl } from "@/lib/site";

interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  pageUrl?: string;
}

/**
 * HowToSchema - Schema.org HowTo structured data
 * Use on pages with step-by-step instructions to enable rich results in search.
 *
 * Example usage:
 * <HowToSchema
 *   name="How to Download Instagram Reels"
 *   description="Download any public Instagram Reel as HD MP4 in 3 steps."
 *   steps={[
 *     { name: "Copy the Reel link", text: "Open Instagram, find the Reel, tap Share > Copy Link." },
 *     { name: "Paste URL", text: "Paste the link into Trndinn's downloader input." },
 *     { name: "Download", text: "Tap Download to save the HD MP4 to your device." },
 *   ]}
 *   totalTime="PT30S"
 * />
 */
export function HowToSchema({
  name,
  description,
  steps,
  totalTime,
  pageUrl,
}: HowToSchemaProps) {
  const base = getSiteUrl().replace(/\/$/, "");
  const url = pageUrl || base;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    url,
    step: steps.map((step, index) => {
      const stepData: Record<string, unknown> = {
        "@type": "HowToStep",
        position: index + 1,
        name: step.name,
        text: step.text,
      };
      if (step.url) stepData.url = step.url;
      if (step.image) stepData.image = step.image;
      return stepData;
    }),
  };

  if (totalTime) {
    data.totalTime = totalTime;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
