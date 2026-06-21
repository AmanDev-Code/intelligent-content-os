import type { MetadataRoute } from "next";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";
import { fetchAllBlogPathsForSitemap } from "@/lib/serverBlog";
import { getSiteUrl } from "@/lib/site";

// Re-generate the sitemap on every request (no ISR cache) so new blog posts
// appear in the sitemap immediately after publishing.
export const dynamic = "force-dynamic";

type StaticRoute = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  /** Real last-modified date. Omit for pages whose change date is unknown. */
  lastModified?: Date;
};

const STATIC_ROUTES: StaticRoute[] = [
  // High priority - Homepage
  { path: "",               changeFrequency: "weekly",  priority: 1.0, lastModified: new Date("2026-06-12") },

  // Marketing pages - High priority
  { path: "/features",      changeFrequency: "weekly",  priority: 0.9, lastModified: new Date("2026-06-12") },
  { path: "/pricing",       changeFrequency: "weekly",  priority: 0.9, lastModified: new Date("2026-06-12") },
  { path: "/compare/trndinn/postiz", changeFrequency: "monthly", priority: 0.8, lastModified: new Date("2026-06-20") },
  { path: "/mcp",           changeFrequency: "monthly", priority: 0.85, lastModified: new Date("2026-06-20") },
  { path: "/ai-agent",      changeFrequency: "monthly", priority: 0.85, lastModified: new Date("2026-06-20") },
  { path: "/content-engine", changeFrequency: "weekly", priority: 0.85, lastModified: new Date("2026-06-20") },

  // Content pages - Medium-high priority
  { path: BLOG_BASE_PATH,   changeFrequency: "weekly",  priority: 0.8 },
  { path: "/contact",       changeFrequency: "monthly", priority: 0.7, lastModified: new Date("2026-04-01") },
  { path: "/careers",       changeFrequency: "monthly", priority: 0.6, lastModified: new Date("2026-04-01") },

  // Comparison pages — programmatic SEO
  { path: "/compare/trndinn/buffer", changeFrequency: "monthly", priority: 0.7, lastModified: new Date("2026-06-20") },

  // Legal pages - Low priority but essential (canonical /legal/* routes)
  { path: "/legal/privacy",      changeFrequency: "yearly", priority: 0.3, lastModified: new Date("2026-05-02") },
  { path: "/legal/terms",        changeFrequency: "yearly", priority: 0.3, lastModified: new Date("2026-05-02") },
  { path: "/legal/cookies",      changeFrequency: "yearly", priority: 0.3, lastModified: new Date("2026-05-02") },
  { path: "/legal/aup",          changeFrequency: "yearly", priority: 0.3, lastModified: new Date("2026-05-02") },
  { path: "/legal/dpa",          changeFrequency: "yearly", priority: 0.3, lastModified: new Date("2026-05-02") },
  { path: "/legal/subprocessors",changeFrequency: "yearly", priority: 0.3, lastModified: new Date("2026-05-02") },
  { path: "/legal/refund",       changeFrequency: "yearly", priority: 0.3, lastModified: new Date("2026-05-02") },
  { path: "/legal/data-rights",  changeFrequency: "yearly", priority: 0.3, lastModified: new Date("2026-05-02") },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, changeFrequency, priority, lastModified }) => ({
    url: `${base}${path}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
  }));

  // Fetch all published posts via dedicated endpoint (no pagination cap).
  let blogEntries: MetadataRoute.Sitemap = [];
  const paths = await fetchAllBlogPathsForSitemap();
  blogEntries = paths.map((p) => ({
    url: `${base}${BLOG_BASE_PATH}/${p.path}`,
    lastModified: p.updated_at
      ? new Date(p.updated_at)
      : p.published_at
      ? new Date(p.published_at)
      : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...blogEntries];
}
