import type { Metadata } from "next";
import { GuidesHub } from "./GuidesHub";

export const metadata: Metadata = {
  title: "Expert Guides & Resources | Trndinn",
  description:
    "Master social media marketing with our comprehensive guides. Learn AI-powered content creation, LinkedIn automation, content repurposing strategies, and social media scheduling best practices.",
  keywords: [
    "social media marketing guides",
    "AI content marketing",
    "LinkedIn automation guide",
    "content repurposing strategies",
    "social media scheduling",
    "marketing tutorials",
    "social media tips",
  ],
  openGraph: {
    title: "Expert Guides & Resources | Trndinn",
    description:
      "Master social media marketing with our comprehensive guides covering AI content creation, LinkedIn automation, and more.",
    type: "website",
    url: "/guides",
  },
  twitter: {
    card: "summary_large_image",
    title: "Expert Guides & Resources | Trndinn",
    description:
      "Master social media marketing with our comprehensive guides.",
  },
  alternates: {
    canonical: "/guides",
  },
};

export default function GuidesPage() {
  return <GuidesHub />;
}
