import type { Metadata } from "next";
import { API_CONFIG } from "@/lib/constants";
import { getSiteUrl, siteName } from "@/lib/site";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || API_CONFIG.BASE_URL;
}

/** Row from `GET /blog/page-seo` — DB fields plus `assignment_primary_keyword` from SEO admin. */
export type StaticPageSeoRow = {
  route_path?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  og_image_url?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  structured_data?: unknown;
  /** Primary active keyword for this route (`target_type=route`); drives title/description when CMS fields empty. */
  assignment_primary_keyword?: string | null;
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

/**
 * Build Next.js metadata for a marketing route. Precedence:
 * 1. CMS overrides (`static_page_seo` via Blog Admin → SEO): title, description, canonical, robots, OG image — use these for full control.
 * 2. SEO admin keyword assignment: mark one keyword **Primary** for the route; its text becomes the default document title when (1) is empty,
 *    and description becomes "{phrase} — {siteName}" (one human phrase — never paste your whole keyword list here).
 * 3. Code fallbacks on this page when neither is set.
 */
export function mergeStaticSeo(
  route: string,
  seo: StaticPageSeoRow | null,
  fallback: { title: string; description: string; keywords?: string[] },
): Metadata {
  const primary = seo?.assignment_primary_keyword?.trim() || null;
  const site = getSiteUrl();
  const canonical =
    seo?.canonical_url?.trim() || `${site.replace(/\/$/, "")}${route.startsWith("/") ? route : `/${route}`}`;
  const resolvedTitle =
    seo?.seo_title?.trim() || (primary && primary.length > 0 ? primary : null) || fallback.title;
  const description =
    seo?.seo_description?.trim() ||
    (primary ? `${primary} — ${siteName}` : null) ||
    fallback.description;
  const kwFromSeo = seo?.seo_keywords?.trim();
  const keywords = kwFromSeo
    ? kwFromSeo.split(",").map((k) => k.trim()).filter(Boolean)
    : fallback.keywords;

  /** Matches root layout `metadata.title.default` — use absolute title so `title.template` does not append `| ${siteName}` again. */
  const homeHeadlineDefault = `${siteName} — AI social content platform`;
  const ogTitle =
    resolvedTitle === homeHeadlineDefault ? resolvedTitle : `${resolvedTitle} | ${siteName}`;

  const meta: Metadata = {
    title: resolvedTitle === homeHeadlineDefault ? { absolute: resolvedTitle } : resolvedTitle,
    description,
    alternates: { canonical },
    robots: seo?.robots?.trim() || undefined,
    openGraph: {
      title: ogTitle,
      description,
      url: canonical,
      type: "website",
      siteName,
      locale: "en_US",
      images: seo?.og_image_url ? [{ url: seo.og_image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: seo?.og_image_url ? [seo.og_image_url] : undefined,
    },
  };

  if (keywords?.length) {
    meta.keywords = keywords;
  }

  return meta;
}

/** Loads public SEO payload and merges with page-level defaults (server-only; ISR-friendly). */
export async function buildMarketingMetadata(
  route: string,
  fallback: { title: string; description: string; keywords?: string[] },
): Promise<Metadata> {
  const seo = await fetchStaticPageSeo(route);
  return mergeStaticSeo(route, seo, fallback);
}
