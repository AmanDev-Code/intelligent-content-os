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
  og_title?: string | null;
  og_description?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  structured_data?: unknown;
  /** Overrides the page's visible <h1> when set. Drives on-page ranking signal. */
  h1_override?: string | null;
  /** Primary active keyword for this route (`target_type=route`); drives title/description when CMS fields empty. */
  assignment_primary_keyword?: string | null;
};

export async function fetchStaticPageSeo(route: string): Promise<StaticPageSeoRow | null> {
  const base = apiBase();
  const url = `${base}/blog/page-seo?route=${encodeURIComponent(route)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 120 }, headers: { "ngrok-skip-browser-warning": "true" } });
    if (!res.ok) return null;
    const data = (await res.json()) as StaticPageSeoRow;
    if (!data || Object.keys(data).length === 0) return null;
    return data;
  } catch {
    return null;
  }
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
  const homeHeadlineDefault = `${siteName} — All-in-One Agentic Social Media Platform`;
  const resolvedOgTitle =
    seo?.og_title?.trim() ||
    (resolvedTitle === homeHeadlineDefault ? resolvedTitle : `${resolvedTitle} | ${siteName}`);
  const resolvedOgDescription = seo?.og_description?.trim() || description;
  const ogTitle = resolvedOgTitle;

  const meta: Metadata = {
    title: resolvedTitle === homeHeadlineDefault ? { absolute: resolvedTitle } : resolvedTitle,
    description,
    alternates: { canonical },
    robots: seo?.robots?.trim() || undefined,
    openGraph: {
      title: ogTitle,
      description: resolvedOgDescription,
      url: canonical,
      type: "website",
      siteName,
      locale: "en_US",
      images: seo?.og_image_url ? [{ url: seo.og_image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: resolvedOgDescription,
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

/**
 * Returns the admin-set h1_override for a marketing route, or null.
 * Use in server page.tsx to pass to the view component as the visible <h1>.
 */
export async function fetchMarketingH1Override(route: string): Promise<string | null> {
  const seo = await fetchStaticPageSeo(route);
  return seo?.h1_override?.trim() || null;
}

/**
 * Returns the raw structured_data from static_page_seo for a route, or null.
 * Used to inject custom JSON-LD into the page <head>.
 */
export async function fetchMarketingStructuredData(route: string): Promise<unknown | null> {
  const seo = await fetchStaticPageSeo(route);
  return seo?.structured_data ?? null;
}
