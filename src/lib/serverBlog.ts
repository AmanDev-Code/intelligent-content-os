import { API_CONFIG } from "@/lib/constants";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || API_CONFIG.BASE_URL;
}

export async function fetchPublishedBlogPost(path: string): Promise<Record<string, unknown> | null> {
  const base = apiBase();
  const url = `${base}/blog/post?path=${encodeURIComponent(path)}`;
  const res = await fetch(url, { next: { revalidate: 60 }, headers: { "ngrok-skip-browser-warning": "true" } });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json() as Promise<Record<string, unknown>>;
}

export async function fetchAllBlogPathsForSitemap(): Promise<
  { path: string; published_at: string | null; updated_at: string | null }[]
> {
  const base = apiBase();
  const url = `${base}/blog/sitemap-paths`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    if (!res.ok) return [];
    return res.json() as Promise<{ path: string; published_at: string | null; updated_at: string | null }[]>;
  } catch {
    return [];
  }
}

export async function fetchPublishedBlogPosts(params?: {
  post_kind?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}): Promise<{ posts: Record<string, unknown>[] }> {
  const base = apiBase();
  const sp = new URLSearchParams();
  if (params?.post_kind) sp.set("post_kind", params.post_kind);
  if (params?.tag) sp.set("tag", params.tag);
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  const q = sp.toString();
  const url = `${base}/blog/posts${q ? `?${q}` : ""}`;
  const res = await fetch(url, { next: { revalidate: 30 }, headers: { "ngrok-skip-browser-warning": "true" } });
  if (!res.ok) return { posts: [] };
  return res.json() as Promise<{ posts: Record<string, unknown>[] }>;
}
