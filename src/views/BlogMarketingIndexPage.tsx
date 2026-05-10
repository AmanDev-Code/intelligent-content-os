"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2 } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { cn } from "@/lib/utils";
import { api } from "@/lib/apiClient";
import { blogCategoryPillClass, displayCategoryLabel } from "@/lib/blogContentCategory";
import { cssObjectPositionForFeaturedImage } from "@/lib/blogFeaturedImagePosition";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";

const KIND_LABELS: Record<string, string> = {
  article: "Article",
  changelog: "Changelog",
  release: "Release",
  guide: "Guide",
  news: "News",
  announcement: "Announcement",
};

export type MarketingPostCard = {
  id: string;
  path: string;
  title: string;
  excerpt?: string | null;
  post_kind?: string;
  published_at?: string | null;
  featured_image_url?: string | null;
  featured_image_object_position?: string | null;
  author_display_name?: string | null;
  /** Dedicated editorial bucket (distinct from structural post_kind). */
  content_category?: string | null;
};

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function PostImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-primary/[0.12] via-muted/80 to-orange-400/[0.1] dark:from-primary/20 dark:via-muted dark:to-orange-400/15",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5] bg-[radial-gradient(circle_at_1px_1px,hsl(var(--foreground)/0.07)_1px,transparent_0)] [background-size:18px_18px]"
        aria-hidden
      />
    </div>
  );
}

function CategoryPill({
  category,
  post_kind,
  className,
}: {
  category?: string | null;
  post_kind?: string | null;
  className?: string;
}) {
  const label = displayCategoryLabel(category, post_kind, KIND_LABELS);
  if (!label.trim()) return null;
  return (
    <span
      className={cn(
        blogCategoryPillClass(label),
        "inline-flex w-fit max-w-full self-start",
        className,
      )}
    >
      {label}
    </span>
  );
}

export default function BlogMarketingIndexPage({ h1Override }: { h1Override?: string | null }) {
  const [posts, setPosts] = useState<MarketingPostCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        const res = await api.blog.listPublished({ limit: 48 });
        if (cancelled) return;
        setPosts((res.posts || []) as MarketingPostCard[]);
        setError(null);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load posts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [featured, rest] = useMemo(() => {
    if (!posts.length) return [null, [] as MarketingPostCard[]];
    return [posts[0], posts.slice(1)];
  }, [posts]);

  return (
    <MarketingShell>
      <main className="pb-28">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14 lg:pb-16 lg:pt-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Home
          </Link>
          <h1 className="mt-10 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-[3.35rem] sm:leading-[1.05]">
            {h1Override ?? "Trndinn Blog: Social Media Growth Tips"}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Practical notes from the Trndinn team — how teams scale social workflows, ship product, and tune growth without
            losing the spark in their feeds.
          </p>
        </div>

        <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6">
          {loading ? (
            <div className="flex justify-center py-28 text-muted-foreground">
              <Loader2 className="h-9 w-9 animate-spin" aria-label="Loading" />
            </div>
          ) : error ? (
            <p className="text-center text-sm text-destructive">{error}</p>
          ) : !featured ? (
            <p className="text-center text-sm text-muted-foreground">No published posts yet. Check back soon.</p>
          ) : (
            <>
              <Link
                href={`${BLOG_BASE_PATH}/${featured.path}`}
                className="group grid gap-6 overflow-hidden rounded-3xl border border-border/50 bg-card/80 p-4 shadow-sm ring-1 ring-black/[0.03] transition-all hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 dark:bg-card/60 dark:ring-white/[0.06] sm:grid-cols-2 sm:gap-0 sm:p-0"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl sm:aspect-auto sm:min-h-[280px] sm:rounded-l-3xl sm:rounded-r-none">
                  {featured.featured_image_url ? (
                    <Image
                      src={featured.featured_image_url}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      style={{
                        objectPosition: cssObjectPositionForFeaturedImage(
                          featured.featured_image_object_position,
                          "listing",
                        ),
                      }}
                      sizes="(max-width: 640px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <PostImagePlaceholder className="h-full w-full" />
                  )}
                </div>
                <div className="flex flex-col justify-center gap-4 px-2 py-2 sm:px-10 sm:py-10">
                  <CategoryPill category={featured.content_category} post_kind={featured.post_kind} />
                  <h2 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[1.875rem] sm:leading-snug md:text-[2rem]">
                    {featured.title}
                  </h2>
                  {featured.excerpt ? (
                    <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {featured.published_at ? (
                      <time dateTime={featured.published_at}>{formatDate(featured.published_at)}</time>
                    ) : null}
                    {featured.author_display_name ? (
                      <span className="text-foreground/90">{featured.author_display_name}</span>
                    ) : null}
                  </div>
                  <span className="text-sm font-semibold text-primary group-hover:underline">Read more →</span>
                </div>
              </Link>

              {rest.length > 0 ? (
                <ul className="grid gap-8 md:grid-cols-3">
                  {rest.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`${BLOG_BASE_PATH}/${p.path}`}
                        className={cn(
                          "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm ring-1 ring-black/[0.03]",
                          "transition-all hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 dark:bg-card/60 dark:ring-white/[0.06]",
                        )}
                      >
                        <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl">
                          {p.featured_image_url ? (
                            <Image
                              src={p.featured_image_url}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              style={{
                                objectPosition: cssObjectPositionForFeaturedImage(
                                  p.featured_image_object_position,
                                  "listing",
                                ),
                              }}
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          ) : (
                            <PostImagePlaceholder className="h-full w-full" />
                          )}
                          <div className="absolute left-4 top-4">
                            <CategoryPill
                              category={p.content_category}
                              post_kind={p.post_kind}
                              className="shadow-sm backdrop-blur-[2px]"
                            />
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-2 p-5">
                          {p.published_at ? (
                            <time
                              className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground"
                              dateTime={p.published_at}
                            >
                              {formatDate(p.published_at)}
                            </time>
                          ) : null}
                          <h3 className="font-serif text-xl font-semibold leading-snug tracking-tight text-foreground">
                            {p.title}
                          </h3>
                          {p.excerpt ? (
                            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                          ) : null}
                          <span className="mt-auto pt-3 text-sm font-semibold text-primary group-hover:underline">
                            Read more →
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </div>
      </main>
    </MarketingShell>
  );
}
