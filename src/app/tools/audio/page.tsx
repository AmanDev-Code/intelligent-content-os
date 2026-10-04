import type { Metadata } from "next";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { AudioToolsHubView } from "@/views/tools/AudioToolsHubView";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata("/tools/audio", {
    title: "Free Audio Tools — Converter, Recorder, TTS, STT",
    description:
      "Free audio tools: convert MP3, WAV, AAC, OGG, FLAC and more. Record audio, extract audio from video, text-to-speech, speech-to-text. All in-browser. No signup required.",
    keywords: [
      "free audio tools",
      "audio converter online",
      "mp3 to wav converter",
      "audio recorder online",
      "text to speech free",
      "speech to text online",
      "extract audio from video",
      "trndinn audio tools",
    ],
  });
}

export default function AudioToolsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
          { name: "Audio Tools", path: "/tools/audio" },
        ]}
      />
      <AudioToolsHubView />
    </>
  );
}
