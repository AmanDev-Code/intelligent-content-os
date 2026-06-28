"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { getAnchorTextSuggestions } from "@/lib/internalLinking";
import { ArrowUpRight } from "lucide-react";

type LinkVariant = "default" | "subtle" | "strong" | "cta";
type LinkSize = "sm" | "base" | "lg";

export interface LinkInlineProps {
  href: string;
  children?: React.ReactNode;
  /** SEO-optimized anchor text - will use suggestions if not provided */
  anchorText?: string;
  /** Context hint for generating anchor text suggestions */
  context?: string;
  /** Visual variant */
  variant?: LinkVariant;
  /** Text size */
  size?: LinkSize;
  /** Whether to show external link indicator */
  external?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to underline on hover only */
  hoverOnly?: boolean;
  /** Event tracking category */
  category?: string;
  /** Event tracking label */
  label?: string;
}

/**
 * SEO-optimized inline link component
 * 
 * Provides consistent styling for contextual internal links with
 * anchor text optimization for SEO.
 * 
 * @example
 * <LinkInline href="/guides/ai-social-media-marketing" context="AI content">
 *   Read our AI social media marketing guide
 * </LinkInline>
 * 
 * @example
 * <LinkInline 
 *   href="/vs/buffer" 
 *   anchorText="Buffer alternative comparison"
 *   variant="strong"
 * />
 */
export function LinkInline({
  href,
  children,
  anchorText,
  context,
  variant = "default",
  size = "base",
  external = false,
  className,
  hoverOnly = true,
  category,
  label,
}: LinkInlineProps) {
  // Generate SEO anchor text if not provided
  const finalText = children || anchorText || getAnchorTextSuggestions(href, context)[0];

  // Variant styles
  const variantStyles: Record<LinkVariant, string> = {
    default: "text-primary hover:text-primary/80",
    subtle: "text-muted-foreground hover:text-primary",
    strong: "font-semibold text-foreground hover:text-primary",
    cta: "font-semibold text-primary hover:underline",
  };

  // Size styles
  const sizeStyles: Record<LinkSize, string> = {
    sm: "text-xs",
    base: "text-sm",
    lg: "text-base",
  };

  // Underline handling
  const underlineClass = hoverOnly
    ? "no-underline hover:underline underline-offset-2"
    : "underline underline-offset-2";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-0.5 transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        underlineClass,
        className
      )}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      {...(category && { "data-event-category": category })}
      {...(label && { "data-event-label": label })}
      aria-label={typeof finalText === "string" ? finalText : undefined}
    >
      {finalText}
      {external && <ArrowUpRight className="h-3 w-3" aria-hidden />}
    </Link>
  );
}

/**
 * Context-aware link that automatically suggests relevant internal links
 * based on content themes detected in surrounding text.
 */
interface SmartLinkProps {
  theme: string;
  pageType: "homepage" | "features" | "pricing" | "blog" | "comparison" | "guide";
  fallbackText?: string;
  className?: string;
}

export function SmartLink({ theme, pageType, fallbackText, className }: SmartLinkProps) {
  const { getContextualLinks } = require("@/lib/internalLinking");
  const links = getContextualLinks([theme], pageType);

  if (links.length === 0) {
    return <span className={className}>{fallbackText || theme}</span>;
  }

  const link = links[0];
  return (
    <LinkInline
      href={link.href}
      anchorText={link.anchorText}
      variant="default"
      className={className}
    />
  );
}

/**
 * Content upgrade link - styled callout for converting readers to guides
 */
export interface ContentUpgradeProps {
  href: string;
  title: string;
  description: string;
  ctaText?: string;
  variant?: "inline" | "card" | "banner";
}

export function ContentUpgrade({
  href,
  title,
  description,
  ctaText = "Learn more",
  variant = "card",
}: ContentUpgradeProps) {
  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-1 text-sm">
        <span className="text-muted-foreground">Want to master {title.toLowerCase()}?</span>{" "}
        <LinkInline href={href} variant="strong" hoverOnly>
          {ctaText}
        </LinkInline>
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <div className="my-6 rounded-lg border border-primary/20 bg-primary/5 p-4 dark:bg-primary/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <LinkInline
            href={href}
            variant="cta"
            className="whitespace-nowrap"
          >
            {ctaText}
          </LinkInline>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className="my-6 rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm dark:bg-white/[0.03]">
      <h4 className="font-display text-base font-bold text-foreground">{title}</h4>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      <LinkInline
        href={href}
        variant="cta"
        className="mt-3 inline-flex"
      >
        {ctaText}
      </LinkInline>
    </div>
  );
}
