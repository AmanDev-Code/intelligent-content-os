import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublishedBlogPost } from "@/lib/serverBlog";
import { getSiteUrl, siteName } from "@/lib/site";
import BlogPostView from "@/views/BlogPostView";

type Props = { params: Promise<{ path: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const slugPath = path.join("/");
  const post = await fetchPublishedBlogPost(slugPath);
  if (!post) {
    return { title: "Post not found" };
  }
  const site = getSiteUrl();
  const title = (post.seo_title as string)?.trim() || (post.title as string);
  const description =
    ((post.seo_description as string)?.trim() ||
      (post.excerpt as string)?.trim() ||
      `${post.title} — ${siteName}`) as string;
  const canonical =
    ((post.canonical_url as string)?.trim() ||
      `${site.replace(/\/$/, "")}/blogs/${slugPath}`) as string;
  const kw = (post.seo_keywords as string)?.trim();
  const keywords = kw ? kw.split(",").map((k) => k.trim()).filter(Boolean) : undefined;
  const og =
    ((post.og_image_url as string)?.trim() || (post.featured_image_url as string)?.trim()) || undefined;

  return {
    title,
    description,
    keywords,
    robots: (post.robots as string)?.trim() || undefined,
    alternates: { canonical },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: canonical,
      type: "article",
      siteName,
      locale: "en_US",
      images: og ? [{ url: og }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: og ? [og] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { path } = await params;
  const slugPath = path.join("/");
  const post = await fetchPublishedBlogPost(slugPath);
  if (!post) notFound();
  return <BlogPostView post={post as never} />;
}
