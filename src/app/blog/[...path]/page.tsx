import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublishedBlogPost, fetchPublishedBlogPosts } from "@/lib/serverBlog";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";
import { getSiteUrl, siteName } from "@/lib/site";
import BlogPostView from "@/views/BlogPostView";
import type { RelatedPost } from "@/components/blog/BlogRelatedPosts";
import { BlogJsonLd } from "@/components/seo/BlogJsonLd";

type Props = { params: Promise<{ path: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const slugPath = path.join("/");
  const post = await fetchPublishedBlogPost(slugPath);
  if (!post) {
    return { title: "Post not found" };
  }
  const site = getSiteUrl();

  // Strip any pre-baked " | Trndinn" (or " — Trndinn") suffix — Next.js root layout template will apply
  // "| Trndinn" exactly once, so leaving one in the raw seo_title would produce "Title | Trndinn | Trndinn".
  const rawTitle = (post.seo_title as string)?.trim() || (post.title as string);
  const brandSuffix = new RegExp(`\\s*[|—-]\\s*${siteName}\\s*$`, "i");
  const title = rawTitle.replace(brandSuffix, "").trim() || (post.title as string);

  const description =
    ((post.seo_description as string)?.trim() ||
      (post.excerpt as string)?.trim() ||
      `${post.title} — ${siteName}`) as string;

  // Validate DB-supplied canonical: must parse as http(s). Falls through to the computed URL for garbage
  // like "Canonical URL https://…" that a legacy row got seeded with.
  const computedCanonical = `${site.replace(/\/$/, "")}${BLOG_BASE_PATH}/${slugPath}`;
  const rawCanonical = (post.canonical_url as string | undefined)?.trim();
  let canonical = computedCanonical;
  if (rawCanonical) {
    try {
      const u = new URL(rawCanonical);
      if (u.protocol === "https:" || u.protocol === "http:") {
        canonical = u.toString();
      }
    } catch {
      // malformed value — keep the computed fallback
    }
  }

  const kw = (post.seo_keywords as string)?.trim();
  const keywords = kw ? kw.split(",").map((k) => k.trim()).filter(Boolean) : undefined;
  const og =
    ((post.og_image_url as string)?.trim() || (post.featured_image_url as string)?.trim()) || undefined;

  const authorName = (post.author_display_name as string | undefined)?.trim();
  // OG title is not subject to Next.js `title.template`, so we assemble the brand form here explicitly.
  const ogTitle = `${title} | ${siteName}`;

  return {
    title,
    description,
    keywords,
    robots: (post.robots as string)?.trim() || undefined,
    alternates: { canonical },
    authors: authorName ? [{ name: authorName }] : undefined,
    openGraph: {
      title: ogTitle,
      description,
      url: canonical,
      type: "article",
      siteName,
      locale: "en_US",
      images: og ? [{ url: og }] : undefined,
      ...(authorName ? { authors: [authorName] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: og ? [og] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { path } = await params;
  const slugPath = path.join("/");

  const [post, { posts: allPosts }] = await Promise.all([
    fetchPublishedBlogPost(slugPath),
    fetchPublishedBlogPosts({ limit: 10 }),
  ]);

  if (!post) notFound();

  const currentId = post.id as string | undefined;
  const relatedPosts: RelatedPost[] = (allPosts as unknown as RelatedPost[])
    .filter((p) => p.id !== currentId)
    .slice(0, 3);

  return (
    <>
      <BlogJsonLd post={post} slugPath={slugPath} />
      <BlogPostView post={post as never} relatedPosts={relatedPosts} />
    </>
  );
}
