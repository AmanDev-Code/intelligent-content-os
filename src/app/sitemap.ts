import type { MetadataRoute } from "next";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";
import { fetchPublishedBlogPosts } from "@/lib/serverBlog";
import { getSiteUrl } from "@/lib/site";

// Re-generate the sitemap at most every hour so new posts appear quickly.
export const revalidate = 3600;

type StaticRoute = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const STATIC_ROUTES: StaticRoute[] = [
  { path: "",               changeFrequency: "weekly",  priority: 1.0 },
  { path: "/features",      changeFrequency: "monthly", priority: 0.9 },
  { path: "/pricing",       changeFrequency: "monthly", priority: 0.9 },
  { path: BLOG_BASE_PATH,   changeFrequency: "weekly",  priority: 0.8 },
  { path: "/contact",       changeFrequency: "monthly", priority: 0.7 },
  { path: "/careers",       changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy-policy",changeFrequency: "yearly",  priority: 0.3 },
  { path: "/terms-of-use",  changeFrequency: "yearly",  priority: 0.3 },
  { path: "/refund-policy", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // Fetch all published posts. On error (e.g. cold start), fall back gracefully.
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    // Fetch up to 500 posts; adjust if the blog grows beyond this.
    const { posts } = await fetchPublishedBlogPosts({ limit: 500 });
    blogEntries = posts
      .filter((p) => p.path && typeof p.path === "string")
      .map((p) => ({
        url: `${base}${BLOG_BASE_PATH}/${p.path as string}`,
        lastModified: p.updated_at
          ? new Date(p.updated_at as string)
          : p.published_at
          ? new Date(p.published_at as string)
          : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch {
    // Log but don't break the sitemap — static pages still get indexed.
    console.error("[sitemap] Failed to fetch blog posts");
  }

  return [...staticEntries, ...blogEntries];
}
