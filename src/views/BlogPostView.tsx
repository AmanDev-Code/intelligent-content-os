"use client";

import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Badge } from "@/components/ui/badge";
import { MarkdownBody } from "@/components/blog/MarkdownBody";
import { cn } from "@/lib/utils";

type BlogPost = {
  path: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  body?: string;
  post_kind?: string;
  published_at?: string | null;
  author_display_name?: string | null;
  reading_minutes?: number | null;
  featured_image_url?: string | null;
  tags?: string[] | null;
  custom_css?: string | null;
};

const kindLabels: Record<string, string> = {
  article: "Article",
  changelog: "Changelog",
  release: "Release",
  guide: "Guide",
  news: "News",
  announcement: "Announcement",
};

export default function BlogPostView({ post }: { post: BlogPost }) {
  const segments = post.path.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [{ label: "Blog", href: "/blogs" }];
  let acc = "";
  for (const seg of segments) {
    acc = acc ? `${acc}/${seg}` : seg;
    crumbs.push({
      label: seg.replace(/-/g, " "),
      href: `/blogs/${acc}`,
    });
  }
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1] = { ...crumbs[crumbs.length - 1], label: post.title };
  }

  return (
    <MarketingShell>
      {post.custom_css ? <style dangerouslySetInnerHTML={{ __html: post.custom_css }} /> : null}
      <main className="pb-24">
        <article className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14 lg:max-w-4xl">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
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

          <header className="mt-8 border-b border-border/50 pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                {post.post_kind ? kindLabels[post.post_kind] || post.post_kind : "Post"}
              </p>
              {post.published_at ? (
                <time className="text-[11px] text-muted-foreground" dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              ) : null}
            </div>
            <h1 className="mt-4 font-heading text-3xl font-black tracking-tight sm:text-5xl">{post.title}</h1>
            {post.subtitle ? <p className="mt-3 text-lg text-muted-foreground sm:text-xl">{post.subtitle}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {post.author_display_name ? <span>By {post.author_display_name}</span> : null}
              {post.reading_minutes != null ? (
                <span className={cn(post.author_display_name && "before:content-['·'] before:px-1")}>
                  {post.reading_minutes} min read
                </span>
              ) : null}
            </div>
            {post.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[11px] font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
            ) : null}
          </header>

          {post.featured_image_url ? (
            <div className="mt-10 overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.featured_image_url} alt="" className="w-full object-cover" />
            </div>
          ) : null}

          {post.excerpt ? (
            <p className="mt-10 border-l-4 border-primary/60 pl-4 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
          ) : null}

          <div className="mt-10">
            <MarkdownBody markdown={post.body || ""} />
          </div>

          <footer className="mt-14 border-t border-border/50 pt-8">
            <Link href="/blogs" className="text-sm font-semibold text-primary hover:underline">
              ← All posts
            </Link>
          </footer>
        </article>
      </main>
    </MarketingShell>
  );
}
