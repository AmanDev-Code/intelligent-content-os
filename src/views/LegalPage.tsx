"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

type LegalPageData = {
  slug: string;
  title: string;
  summary?: string | null;
  body: string;
  seoDescription?: string | null;
  version?: string | number | null;
  effectiveDate?: string | null;
  sortOrder?: number | null;
  isPublished?: boolean;
  isDefault?: boolean;
  updatedAt?: string | null;
};

type TocItem = { id: string; text: string };

/** Internal-only blockquote line that must never reach end users. */
const INTERNAL_NOTE_PREFIX = "> **internal note";

function stripInternalNotes(markdown: string): string {
  return markdown
    .split("\n")
    .filter((line) => !line.trim().toLowerCase().startsWith(INTERNAL_NOTE_PREFIX))
    .join("\n");
}

/** Collapse a heading's text into a stable, URL-safe anchor id. */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Flatten React children (from react-markdown) into a plain string for ids. */
function childrenToText(children: ReactNode): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join("");
  if (typeof children === "object" && "props" in (children as { props?: { children?: ReactNode } })) {
    return childrenToText((children as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

/** Build the in-page table of contents from level-2 (`##`) markdown headings. */
function buildToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  let inFence = false;
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^##\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;
    const text = match[1].replace(/[`*_~]/g, "").trim();
    if (!text) continue;
    let id = slugifyHeading(text) || "section";
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    items.push({ id, text });
  }
  return items;
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function HeaderSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-28 rounded bg-muted" />
      <div className="h-10 w-3/4 rounded bg-muted" />
      <div className="h-4 w-full max-w-2xl rounded bg-muted" />
      <div className="h-4 w-2/3 max-w-xl rounded bg-muted" />
    </div>
  );
}

function BodySkeleton() {
  return (
    <div className="mt-12 animate-pulse space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={cn("h-4 rounded bg-muted", i % 3 === 0 ? "w-1/3" : i % 4 === 0 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export default function LegalPage({ slug }: { slug: string }) {
  const [page, setPage] = useState<LegalPageData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setPage(null);
    apiClient
      .get(`/public/legal/${slug}`)
      .then((data: LegalPageData) => {
        if (!active) return;
        if (!data || !data.slug || data.isPublished === false) {
          setStatus("notfound");
          return;
        }
        setPage(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setStatus("notfound");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const cleanBody = useMemo(() => (page?.body ? stripInternalNotes(page.body) : ""), [page?.body]);
  const toc = useMemo(() => buildToc(cleanBody), [cleanBody]);

  const markdownComponents: Components = useMemo(() => {
    const headingId = (children: ReactNode) => slugifyHeading(childrenToText(children));
    return {
      h1: ({ children }) => (
        <h2 id={headingId(children)} className="scroll-mt-28">
          {children}
        </h2>
      ),
      h2: ({ children }) => (
        <h2 id={headingId(children)} className="scroll-mt-28">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 id={headingId(children)} className="scroll-mt-28">
          {children}
        </h3>
      ),
    };
  }, []);

  const effective = formatDate(page?.effectiveDate);
  const updated = formatDate(page?.updatedAt);
  const versionLabel = page?.version != null && String(page.version).trim() !== "" ? String(page.version) : null;
  const metaParts: string[] = [];
  if (versionLabel) metaParts.push(`Version ${versionLabel}`);
  if (effective) metaParts.push(`Effective ${effective}`);
  if (updated) metaParts.push(`Last updated ${updated}`);

  return (
    <MarketingShell>
      <main className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-primary focus-visible:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>

        {status === "loading" ? (
          <>
            <div className="mt-8 rounded-2xl border border-border/50 p-6 sm:p-8 glass">
              <HeaderSkeleton />
            </div>
            <BodySkeleton />
          </>
        ) : status === "notfound" ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-border/50 px-6 py-20 text-center glass">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText className="h-7 w-7" aria-hidden />
            </div>
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Page not found
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              We couldn&apos;t find the legal document you were looking for. It may have been moved or
              is no longer available.
            </p>
            <Link
              href="/"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Return home
            </Link>
          </div>
        ) : page ? (
          <>
            <header className="mt-8 rounded-2xl border border-border/50 p-6 shadow-sm sm:p-8 glass">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
                Legal
              </div>
              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                {page.title}
              </h1>
              {page.summary?.trim() ? (
                <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                  {page.summary.trim()}
                </p>
              ) : null}
              {metaParts.length > 0 ? (
                <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground/90">
                  {metaParts.map((part, i) => (
                    <span key={part} className="inline-flex items-center gap-2">
                      {i > 0 ? <span aria-hidden className="text-border">·</span> : null}
                      {part}
                    </span>
                  ))}
                </p>
              ) : null}
            </header>

            <div className="mt-10 gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem]">
              <article className="order-1 min-w-0">
                <div
                  className={cn(
                    "prose prose-neutral max-w-none dark:prose-invert",
                    "prose-headings:font-display prose-headings:tracking-tight prose-headings:scroll-mt-28",
                    "prose-h2:mt-12 prose-h2:text-2xl prose-h3:text-xl",
                    "prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
                    "prose-strong:text-foreground",
                    "prose-table:overflow-hidden prose-table:rounded-lg prose-th:bg-muted/60 prose-th:px-3 prose-th:py-2",
                    "prose-td:border-border/60 prose-td:px-3 prose-td:py-2",
                    "prose-li:marker:text-primary/70 prose-blockquote:border-l-primary",
                  )}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {cleanBody}
                  </ReactMarkdown>
                </div>
              </article>

              {toc.length > 1 ? (
                <aside className="order-2 mt-12 hidden lg:mt-0 lg:block">
                  <nav aria-label="On this page" className="sticky top-24">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      On this page
                    </p>
                    <ul className="space-y-1.5 border-l border-border/60 text-sm">
                      {toc.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className="-ml-px block border-l-2 border-transparent py-0.5 pl-3 text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:border-primary focus-visible:text-foreground"
                          >
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </aside>
              ) : null}
            </div>
          </>
        ) : null}
      </main>
    </MarketingShell>
  );
}
