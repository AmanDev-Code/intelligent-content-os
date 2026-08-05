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
 * 2. Code fallbacks on this page — the safety net that always produces sensible, length-safe copy.
 *
 * Note: `assignment_primary_keyword` from the SEO admin is used as a keyword signal only (added to `<meta keywords>`).
 * It is NEVER used as the visible `<title>` or `<meta description>` — that would let one raw keyword replace a well-crafted
 * title. A mis-assignment on `/features` once made every user see "hootsuite alternative | Trndinn" as the page title.
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

  // CMS explicit override > code fallback. Keywords never win the title/description slot.
  const resolvedTitleRaw = seo?.seo_title?.trim() || fallback.title;
  const description = seo?.seo_description?.trim() || fallback.description;

  // Strip a trailing `| Trndinn` (or ` — Trndinn`) suffix that anyone may have baked into the source string.
  // Next.js root layout applies `title.template: "%s | Trndinn"` exactly once, so any pre-baked suffix would double up.
  const suffixPattern = new RegExp(`\\s*[|—-]\\s*${escapeRegex(siteName)}\\s*$`, "i");
  const resolvedTitle = resolvedTitleRaw.replace(suffixPattern, "").trim() || fallback.title;

  // Merge SEO-admin primary keyword into the keywords list (deduplicated, case-insensitive).
  const kwFromSeo = seo?.seo_keywords?.trim();
  const baseKeywords = kwFromSeo
    ? kwFromSeo.split(",").map((k) => k.trim()).filter(Boolean)
    : fallback.keywords ?? [];
  const keywords = primary
    ? [primary, ...baseKeywords.filter((k) => k.toLowerCase() !== primary.toLowerCase())]
    : baseKeywords;

  /**
   * Root layout declares `title.template: "%s | Trndinn"`. If the resolved title already renders the brand
   * (e.g. the homepage headline "Trndinn — All-in-One …" or a legacy fallback ending in "| Trndinn"), we pass
   * `{ absolute }` to opt out of the template and avoid a doubled suffix.
   */
  const containsBrand = resolvedTitle.toLowerCase().includes(siteName.toLowerCase());
  const titleForMeta = containsBrand ? { absolute: resolvedTitle } : resolvedTitle;

  // OG/Twitter titles are NOT subject to `title.template`, so we produce the full "Title | Trndinn" form ourselves —
  // but only when the resolved title doesn't already contain the brand.
  const ogTitle =
    seo?.og_title?.trim() || (containsBrand ? resolvedTitle : `${resolvedTitle} | ${siteName}`);
  const resolvedOgDescription = seo?.og_description?.trim() || description;

  // Dev-time nudge: too-long titles/descriptions get truncated in SERPs. Never blocks the build.
  if (process.env.NODE_ENV !== "production") {
    const finalTitle = containsBrand ? resolvedTitle : `${resolvedTitle} | ${siteName}`;
    if (finalTitle.length > 60) {
      console.warn(`[serverSeo] Title over 60 chars on ${route} (${finalTitle.length}): "${finalTitle}"`);
    }
    if (description.length > 160) {
      console.warn(`[serverSeo] Description over 160 chars on ${route} (${description.length})`);
    }
  }

  const meta: Metadata = {
    title: titleForMeta,
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

/** Escape a string for use inside a RegExp literal. */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
