"use client";

import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";
import type { Guide, Comparison } from "@/lib/internalLinking";
import { getComparisonsForGuide, getGuidesForComparison } from "@/lib/internalLinking";

export interface RelatedGuidesProps {
  /** If showing on a comparison page, pass the competitor key */
  comparisonKey?: string;
  /** If showing on a guide page, pass the guide key */
  guideKey?: string;
  /** Maximum number of guides to show */
  limit?: number;
  /** Custom title override */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Display related guides for a comparison page or vice versa.
 * Creates bidirectional internal linking between comparisons and guides.
 * 
 * @example
 * // On /vs/buffer page:
 * <RelatedGuides comparisonKey="buffer" />
 * 
 * @example
 * // On /guides/linkedin-automation page:
 * <RelatedGuides guideKey="linkedin-automation" />
 */
export function RelatedGuides({
  comparisonKey,
  guideKey,
  limit = 3,
  title,
  className,
}: RelatedGuidesProps) {
  let items: (Guide | Comparison)[] = [];
  let sectionTitle: string;
  let sectionSubtitle: string;

  if (comparisonKey) {
    // Showing guides related to a comparison
    items = getGuidesForComparison(comparisonKey as any);
    sectionTitle = title || "Want to master these features?";
    sectionSubtitle = "Deep-dive guides to help you get the most from these capabilities";
  } else if (guideKey) {
    // Showing comparisons related to a guide
    items = getComparisonsForGuide(guideKey as any);
    sectionTitle = title || "Compare tools for this workflow";
    sectionSubtitle = "See how Trndinn stacks up against alternatives";
  } else {
    return null;
  }

  // Limit items
  const displayItems = items.slice(0, limit);

  if (displayItems.length === 0) return null;

  return (
    <section className={cn("mt-16 border-t border-border/50 pt-10", className)}>
      <div className="mb-6">
        <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
          {sectionTitle}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{sectionSubtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayItems.map((item, index) => {
          const key = "key" in item ? (item as Guide).key : (item as Comparison).name;
          return (
            <Reveal key={key} delay={index * 60}>
              <RelatedItemCard item={item} type={comparisonKey ? "guide" : "comparison"} />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

interface RelatedItemCardProps {
  item: Guide | Comparison;
  type: "guide" | "comparison";
}

function RelatedItemCard({ item, type }: RelatedItemCardProps) {
  const isGuide = type === "guide";
  const href = isGuide ? (item as Guide).href : (item as Comparison).href;
  const title = isGuide
    ? (item as Guide).title
    : `vs ${(item as Comparison).name}`;
  const description = isGuide
    ? (item as Guide).excerpt
    : (item as Comparison).description;
  const color = isGuide ? (item as Guide).color : "#6366f1";
  const keywords = isGuide
    ? (item as Guide).keywords.slice(0, 2)
    : (item as Comparison).features.slice(0, 2);

  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5 dark:bg-white/[0.03] dark:hover:bg-primary/10"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold"
            style={{ backgroundColor: color }}
          >
            {isGuide ? <BookOpen className="h-4 w-4" /> : (item as Comparison).name.charAt(0)}
          </span>
          <h4 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h4>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground line-clamp-2 flex-1">{description}</p>

      {/* Tags for SEO */}
      <div className="mt-3 flex flex-wrap gap-1">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="inline-flex rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            {keyword}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
        <span>{isGuide ? "Read guide" : "See comparison"}</span>
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

/**
 * Related content panel for blog posts - suggests guides based on content themes
 */
export interface BlogRelatedGuidesProps {
  /** Content themes detected in the blog post */
  themes: string[];
  /** Maximum guides to show */
  limit?: number;
  className?: string;
}

export function BlogRelatedGuides({ themes, limit = 3, className }: BlogRelatedGuidesProps) {
  const { GUIDES, getContextualLinks } = require("@/lib/internalLinking");
  const { LinkInline } = require("./LinkInline");
  const { GuideCard } = require("./GuideCard");

  // Find relevant contextual links from themes
  const links = getContextualLinks(themes, "blog");
  const guideHrefs = links
    .filter((l: any) => l.href.startsWith("/guides/"))
    .slice(0, limit)
    .map((l: any) => l.href);

  // Get full guide objects
  const guides = guideHrefs
    .map((href: string) => Object.values(GUIDES).find((g: any) => g.href === href))
    .filter(Boolean);

  if (guides.length === 0) return null;

  return (
    <section className={cn("my-12 border-t border-border/50 pt-8", className)}>
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-bold text-foreground">
          Related Guides
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide: any, index: number) => (
          <GuideCard key={guide.key} guide={guide} index={index} variant="compact" />
        ))}
      </div>

      {/* SEO footer with keywords */}
      <p className="mt-6 text-xs text-muted-foreground/70">
        Learn more about{" "}
        {themes.map((theme, i) => (
          <span key={theme}>
            {i > 0 && (i === themes.length - 1 ? " and " : ", ")}
            <LinkInline href="#" context={theme} variant="subtle" size="sm">
              {theme.toLowerCase()}
            </LinkInline>
          </span>
        ))}{" "}
        with our comprehensive guides.
      </p>
    </section>
  );
}

/**
 * Content upgrade callout for blog posts
 */
interface ContentUpgradeSectionProps {
  /** Primary topic of the blog post */
  topic: string;
  /** Related guide if available */
  relatedGuide?: {
    title: string;
    href: string;
    description: string;
  };
  className?: string;
}

export function ContentUpgradeSection({ topic, relatedGuide, className }: ContentUpgradeSectionProps) {
  if (!relatedGuide) return null;

  return (
    <div className={cn("my-10 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 dark:bg-emerald-500/10", className)}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-lg font-bold text-foreground">
            Want to master {topic.toLowerCase()}?
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">{relatedGuide.description}</p>
          <Link
            href={relatedGuide.href}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Read our complete guide
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
