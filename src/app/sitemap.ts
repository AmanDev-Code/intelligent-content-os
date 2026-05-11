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
  { path: "",               changeFrequency: "weekly",  priority: 1.0, lastModified: new Date("2026-05-10") },
  { path: "/features",      changeFrequency: "monthly", priority: 0.9, lastModified: new Date("2026-05-10") },
  { path: "/pricing",       changeFrequency: "monthly", priority: 0.9, lastModified: new Date("2026-05-10") },
  { path: BLOG_BASE_PATH,   changeFrequency: "weekly",  priority: 0.8 },
  { path: "/contact",       changeFrequency: "monthly", priority: 0.7, lastModified: new Date("2026-04-01") },
  { path: "/careers",       changeFrequency: "monthly", priority: 0.6, lastModified: new Date("2026-04-01") },
  { path: "/privacy-policy",changeFrequency: "yearly",  priority: 0.3, lastModified: new Date("2026-04-01") },
  { path: "/terms-of-use",  changeFrequency: "yearly",  priority: 0.3, lastModified: new Date("2026-04-01") },
  { path: "/refund-policy", changeFrequency: "yearly",  priority: 0.3, lastModified: new Date("2026-04-01") },
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
