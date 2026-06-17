import type { Metadata } from "next";
import { API_CONFIG } from "@/lib/constants";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import AboutUsPage from "@/views/AboutUsPage";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || API_CONFIG.BASE_URL;
}

async function fetchAboutUsContent(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${apiBase()}/public/site-content/about_us`, {
      next: { revalidate: 300 },
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: Record<string, unknown> } | null;
    return data?.content ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchAboutUsContent();
  const title = (content?.seoTitle as string)?.trim() || "About Us | Trndinn";
  const description =
    (content?.seoDescription as string)?.trim() ||
    "Learn about Trndinn's mission, values, and the team building the future of social content creation.";
  return buildMarketingMetadata("/about-us", {
    title,
    description,
    keywords: ["Trndinn", "about", "mission", "values", "team", "social content", "AI"],
  });
}

export default async function AboutUs() {
  const content = await fetchAboutUsContent();
  return <AboutUsPage content={content} />;
}
