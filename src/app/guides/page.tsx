import type { Metadata } from "next";
import { GuidesHub } from "./GuidesHub";

export const metadata: Metadata = {
  title: "Trndinn Guides — AI, LinkedIn & Content Marketing Playbooks",
  description:
    "Free Trndinn guides on AI social media, LinkedIn automation, content repurposing, and scheduling workflows. Step-by-step playbooks written by growth practitioners.",
  keywords: [
    "trndinn guides",
    "AI social media guide",
    "LinkedIn automation guide",
    "content repurposing playbook",
    "social media scheduling tutorial",
    "content marketing tutorials",
    "social media marketing tips",
  ],
  openGraph: {
    title: "Trndinn Guides — AI, LinkedIn & Content Marketing Playbooks",
    description:
      "Free step-by-step guides on AI social media, LinkedIn automation, content repurposing, and scheduling — from the Trndinn team.",
    type: "website",
    url: "/guides",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trndinn Guides — AI, LinkedIn & Content Marketing Playbooks",
    description:
      "Free step-by-step guides on AI social media, LinkedIn automation, and content repurposing.",
  },
  alternates: {
    canonical: "/guides",
  },
};

export default function GuidesPage() {
  return <GuidesHub />;
}
