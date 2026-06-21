/** Normalize `GET /admin/blog/posts` — API returns `{ posts: [...] }`, not a bare array. */
export function parseAdminBlogPostsList<T = Record<string, unknown>>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { posts?: unknown }).posts)) {
    return (data as { posts: T[] }).posts;
  }
  return [];
}
