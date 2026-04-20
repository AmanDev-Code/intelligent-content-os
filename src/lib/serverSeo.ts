import type { Metadata } from "next";
import { API_CONFIG } from "@/lib/constants";
import { getSiteUrl, siteName } from "@/lib/site";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || API_CONFIG.BASE_URL;
}

export type StaticPageSeoRow = {
  route_path?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  og_image_url?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  structured_data?: unknown;
};

export async function fetchStaticPageSeo(route: string): Promise<StaticPageSeoRow | null> {
  const base = apiBase();
  const url = `${base}/blog/page-seo?route=${encodeURIComponent(route)}`;
  const res = await fetch(url, { next: { revalidate: 120 }, headers: { "ngrok-skip-browser-warning": "true" } });
  if (!res.ok) return null;
  const data = (await res.json()) as StaticPageSeoRow;
  if (!data || Object.keys(data).length === 0) return null;
  return data;
}

/** Merge CMS SEO row into Next metadata for marketing routes. */
export function mergeStaticSeo(
  route: string,
  seo: StaticPageSeoRow | null,
  fallback: { title: string; description: string; keywords?: string[] },
): Metadata {
  const site = getSiteUrl();
  const canonical = seo?.canonical_url?.trim() || `${site.replace(/\/$/, "")}${route.startsWith("/") ? route : `/${route}`}`;
  const title = seo?.seo_title?.trim() || fallback.title;
  const description = seo?.seo_description?.trim() || fallback.description;
  const kwFromSeo = seo?.seo_keywords?.trim();
  const keywords = kwFromSeo
    ? kwFromSeo.split(",").map((k) => k.trim()).filter(Boolean)
    : fallback.keywords;

  const meta: Metadata = {
    title,
    description,
    alternates: { canonical },
    robots: seo?.robots?.trim() || undefined,
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: canonical,
      type: "website",
      siteName,
      images: seo?.og_image_url ? [{ url: seo.og_image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: seo?.og_image_url ? [seo.og_image_url] : undefined,
    },
  };

  if (keywords?.length) {
    meta.keywords = keywords;
  }

  return meta;
}
