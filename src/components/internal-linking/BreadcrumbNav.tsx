"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBreadcrumbItems, type PageType } from "@/lib/internalLinking";

export interface BreadcrumbNavProps {
  /** Page type for default breadcrumb generation (optional when items is provided) */
  pageType?: PageType;
  pageName?: string;
  /** Custom items to override defaults */
  items?: Array<{ label: string; href: string }>;
  /** Additional CSS classes for container */
  className?: string;
  /** Whether to use schema.org structured data */
  withSchema?: boolean;
}

/**
 * SEO-optimized breadcrumb navigation component
 * 
 * Provides consistent breadcrumb trails across the site that help
 * with both user navigation and SEO structured data.
 * 
 * @example
 * <BreadcrumbNav pageType="comparison" pageName="vs Buffer" withSchema />
 * 
 * @example
 * <BreadcrumbNav 
 *   items={[
 *     { label: "Home", href: "/" },
 *     { label: "Blog", href: "/blog" },
 *     { label: "Current Post", href: "#" }
 *   ]} 
 *   withSchema 
 * />
 */
export function BreadcrumbNav({
  pageType,
  pageName,
  items,
  className,
  withSchema = true,
}: BreadcrumbNavProps) {
  const breadcrumbItems = items || (pageType ? getBreadcrumbItems(pageType, pageName) : [{ label: "Home", href: "/" }]);
  const isLast = (index: number) => index === breadcrumbItems.length - 1;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("w-full", className)}
    >
      {/* Structured data for SEO */}
      {withSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": breadcrumbItems.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.label,
                "item": item.href.startsWith("http")
                  ? item.href
                  : `${process.env.NEXT_PUBLIC_SITE_URL || ""}${item.href}`,
              })),
            }),
          }}
        />
      )}

      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href + index} className="flex items-center">
            {index === 0 ? (
              // Home icon for first item
              <Link
                href={item.href}
                className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
                <span className="sr-only">{item.label}</span>
              </Link>
            ) : isLast(index) ? (
              // Current page (not a link)
              <span
                className="font-medium text-foreground"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              // Regular link
              <Link
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            )}

            {/* Separator */}
            {!isLast(index) && (
              <ChevronRight
                className="mx-1 h-4 w-4 shrink-0 text-muted-foreground/50"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Compact breadcrumb for tight spaces (mobile, cards, etc.)
 */
interface CompactBreadcrumbProps {
  items: Array<{ label: string; href: string }>;
  className?: string;
}

export function CompactBreadcrumb({ items, className }: CompactBreadcrumbProps) {
  const visibleItems = items.slice(-2); // Show only last 2 items

  return (
    <nav aria-label="Breadcrumb" className={cn("w-full", className)}>
      <ol className="flex items-center gap-1 text-xs text-muted-foreground">
        {items.length > 2 && (
          <>
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">…</li>
          </>
        )}
        {visibleItems.map((item, index) => (
          <li key={item.href + index} className="flex items-center">
            <Link
              href={item.href}
              className={cn(
                "hover:text-foreground",
                index === visibleItems.length - 1 && "font-medium text-foreground"
              )}
            >
              {item.label}
            </Link>
            {index < visibleItems.length - 1 && (
              <ChevronRight className="mx-0.5 h-3 w-3" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Breadcrumb specifically for guide pages
 */
interface GuideBreadcrumbProps {
  guideTitle: string;
  guideHref: string;
  className?: string;
}

export function GuideBreadcrumb({ guideTitle, guideHref, className }: GuideBreadcrumbProps) {
  return (
    <BreadcrumbNav
      items={[
        { label: "Home", href: "/" },
        { label: "Guides", href: "/guides" },
        { label: guideTitle, href: guideHref },
      ]}
      withSchema
      className={className}
    />
  );
}

/**
 * Breadcrumb specifically for comparison pages
 */
interface ComparisonBreadcrumbProps {
  competitorName: string;
  className?: string;
}

export function ComparisonBreadcrumb({ competitorName, className }: ComparisonBreadcrumbProps) {
  return (
    <BreadcrumbNav
      items={[
        { label: "Home", href: "/" },
        { label: "Compare", href: "#" },
        { label: `vs ${competitorName}`, href: `#` },
      ]}
      withSchema
      className={className}
    />
  );
}
