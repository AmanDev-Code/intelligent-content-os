"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Badge } from "@/components/ui/badge";
import { MarkdownBody } from "@/components/blog/MarkdownBody";
import { BlogAuthorCard } from "@/components/blog/BlogAuthorCard";
import { BlogRelatedPosts, type RelatedPost } from "@/components/blog/BlogRelatedPosts";
import { BlogPostShareAndSummarize } from "@/components/blog/BlogPostShareAndSummarize";
import { blogCategoryPillClass, displayCategoryLabel } from "@/lib/blogContentCategory";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";
import { getSiteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { cssObjectPositionForFeaturedImage } from "@/lib/blogFeaturedImagePosition";

type BlogPost = {
  id?: string;
  path: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  body?: string;
  /** Editorial category pill (marketing blog). */
  content_category?: string | null;
  post_kind?: string;
  published_at?: string | null;
  author_display_name?: string | null;
  author_bio?: string | null;
  author_avatar_url?: string | null;
  author_role?: string | null;
  author_linkedin_url?: string | null;
  reading_minutes?: number | null;
  featured_image_url?: string | null;
  featured_image_object_position?: string | null;
  tags?: string[] | null;
  custom_css?: string | null;
};

export default function BlogPostView({
  post,
  relatedPosts = [],
}: {
  post: BlogPost;
  relatedPosts?: RelatedPost[];
}) {
  const segments = post.path.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [{ label: "Blog", href: BLOG_BASE_PATH }];
  let acc = "";
  for (const seg of segments) {
    acc = acc ? `${acc}/${seg}` : seg;
    crumbs.push({
      label: seg.replace(/-/g, " "),
      href: `${BLOG_BASE_PATH}/${acc}`,
    });
  }
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1] = { ...crumbs[crumbs.length - 1], label: post.title };
  }

  const showAuthorBioCard = !!(post.author_display_name?.trim());

  const kindLabels: Record<string, string> = {
    article: "Article",
    changelog: "Changelog",
    release: "Release",
    guide: "Guide",
    news: "News",
    announcement: "Announcement",
  };
  const categoryPillLabel = displayCategoryLabel(
    post.content_category,
    post.post_kind,
    kindLabels,
  );
  const showCategoryPill = categoryPillLabel.trim().length > 0;

  const publicArticleUrl = `${getSiteUrl().replace(/\/$/, "")}${BLOG_BASE_PATH}/${post.path}`;
  const subtitleText = post.subtitle?.trim() || "";
  const excerptText = post.excerpt?.trim() || "";

  return (
    <MarketingShell>
      {post.custom_css ? <style dangerouslySetInnerHTML={{ __html: post.custom_css }} /> : null}
      <main className="pb-24">
        <article className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 sm:pt-12 lg:max-w-4xl">
          <Link
            href={BLOG_BASE_PATH}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All posts
          </Link>

          <nav aria-label="Breadcrumb" className="mt-3 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            {crumbs.map((c, i) => (
              <span key={c.href} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
                {i === crumbs.length - 1 ? (
                  <span className="font-medium text-foreground">{c.label}</span>
                ) : (
                  <Link href={c.href} className="hover:text-foreground">
                    {c.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <header className="mt-8">
            {showCategoryPill ? (
              <span
                className={cn(
                  blogCategoryPillClass(categoryPillLabel),
                  "inline-flex w-fit max-w-full self-start text-[11px]",
                )}
              >
                {categoryPillLabel}
              </span>
            ) : null}
            <h1 className="mt-4 font-serif text-3xl font-semibold leading-[1.12] tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
              {post.title}
            </h1>
            {subtitleText ? (
              <p className="mt-3 max-w-3xl text-base font-normal leading-relaxed text-muted-foreground sm:text-lg">
                {subtitleText}
              </p>
            ) : null}
            {post.reading_minutes != null ? (
              <p className="mt-4 text-xs text-muted-foreground">{post.reading_minutes} min read</p>
            ) : null}
          </header>

          <BlogPostShareAndSummarize
            title={post.title}
            articleUrl={publicArticleUrl}
            publishedAt={post.published_at}
            authorDisplayName={post.author_display_name}
            placement="preCover"
          />

          {post.featured_image_url ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-border/50 bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.featured_image_url}
                alt=""
                className="w-full object-cover"
                style={{
                  objectPosition: cssObjectPositionForFeaturedImage(
                    post.featured_image_object_position,
                    "hero",
                  ),
                }}
              />
            </div>
          ) : null}

          {excerptText ? (
            <p className="mt-5 max-w-3xl border-l-4 border-primary pl-4 text-base font-normal italic leading-relaxed text-muted-foreground sm:text-lg">
              {excerptText}
            </p>
          ) : null}

          {post.tags?.length ? (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <Badge key={t} variant="outline" className="px-2 py-0 text-[10px] font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="mt-8">
            <MarkdownBody markdown={post.body || ""} />
          </div>

          {showAuthorBioCard ? (
            <BlogAuthorCard
              name={post.author_display_name!}
              role={post.author_role}
              bio={post.author_bio}
              avatarUrl={post.author_avatar_url}
              linkedinUrl={post.author_linkedin_url}
            />
          ) : null}

          <BlogRelatedPosts posts={relatedPosts} />

          <footer className="mt-10 border-t border-border/40 pt-8">
            <Link href={BLOG_BASE_PATH} className="text-sm font-semibold text-primary hover:underline">
              ← All posts
            </Link>
          </footer>
        </article>
      </main>
    </MarketingShell>
  );
}
