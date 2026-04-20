"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2 } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

type PostCard = {
  id: string;
  path: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  post_kind?: string;
  published_at?: string | null;
  featured_image_url?: string | null;
  tags?: string[] | null;
};

const kindLabels: Record<string, string> = {
  article: "Article",
  changelog: "Changelog",
  release: "Release",
  guide: "Guide",
  news: "News",
  announcement: "Announcement",
};

export default function BlogsPage() {
  const [posts, setPosts] = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.blog.listPublished({ post_kind: kind || undefined, limit: 48 });
        if (cancelled) return;
        setPosts((res.posts || []) as PostCard[]);
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
  }, [kind]);

  return (
    <MarketingShell>
      <main className="pb-24">
        <section className="relative overflow-hidden px-4 pt-12 sm:px-6 sm:pt-16">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-0 h-[min(50vw,420px)] w-[min(50vw,420px)] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-red-500/10 blur-[90px]" />
          </div>
          <div className="mx-auto max-w-6xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-card/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              Blog & updates
            </p>
            <h1 className="mt-5 font-heading text-4xl font-black tracking-tight sm:text-6xl">Ideas, releases, and how we build.</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Product news, engineering notes, and guides—same design system as the rest of the site, readable in light or
              dark mode on any screen.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Button
                type="button"
                variant={kind === "" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setKind("")}
              >
                All
              </Button>
              {["article", "release", "changelog", "guide", "news"].map((k) => (
                <Button
                  key={k}
                  type="button"
                  variant={kind === k ? "default" : "outline"}
                  size="sm"
                  className="rounded-full capitalize"
                  onClick={() => setKind(k)}
                >
                  {kindLabels[k] || k}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
          {loading ? (
            <div className="flex justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center text-sm text-destructive">{error}</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No published posts yet. Check back soon.</p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {posts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/blogs/${p.path}`}
                    className={cn(
                      "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-sm transition-all",
                      "hover:border-primary/35 hover:shadow-lg hover:shadow-primary/10",
                    )}
                  >
                    {p.featured_image_url ? (
                      <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.featured_image_url}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] w-full bg-gradient-to-br from-primary/20 via-transparent to-red-500/10" />
                    )}
                    <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        {p.post_kind ? (
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                            {kindLabels[p.post_kind] || p.post_kind}
                          </Badge>
                        ) : null}
                        {p.published_at ? (
                          <time className="text-[11px] text-muted-foreground" dateTime={p.published_at}>
                            {new Date(p.published_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </time>
                        ) : null}
                      </div>
                      <h2 className="font-heading text-lg font-bold leading-snug tracking-tight sm:text-xl">{p.title}</h2>
                      {p.subtitle ? <p className="text-sm text-muted-foreground">{p.subtitle}</p> : null}
                      {p.excerpt ? (
                        <p className="line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                      ) : null}
                      <span className="mt-auto pt-2 text-sm font-semibold text-primary group-hover:underline">
                        Read →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </MarketingShell>
  );
}
