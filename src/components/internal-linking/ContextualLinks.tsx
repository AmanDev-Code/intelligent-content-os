"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles, Lightbulb, Link2 } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";
import { getContextualLinks, type PageType } from "@/lib/internalLinking";

export interface ContextualLinksProps {
  /** Content themes to detect contextual links for */
  themes: string[];
  /** Current page type for filtering */
  pageType: PageType;
  /** Visual variant */
  variant?: "inline" | "panel" | "card" | "footer";
  /** Maximum number of links to show */
  limit?: number;
  className?: string;
}

/**
 * Contextual links component - detects content themes and suggests
 * relevant internal linking destinations.
 * 
 * @example
 * // In a feature section about AI content:
 * <ContextualLinks 
 *   themes={["AI", "content"]} 
 *   pageType="features"
 *   variant="card"
 * />
 */
export function ContextualLinks({
  themes,
  pageType,
  variant = "inline",
  limit = 3,
  className,
}: ContextualLinksProps) {
  const links = getContextualLinks(themes, pageType).slice(0, limit);

  if (links.length === 0) return null;

  if (variant === "inline") {
    return (
      <span className={cn("text-muted-foreground", className)}>
        Learn more about{" "}
        {links.map((link, i) => (
          <span key={link.href}>
            {i > 0 && (i === links.length - 1 ? " and " : ", ")}
            <Link
              href={link.href}
              className="text-primary hover:underline underline-offset-2"
            >
              {link.anchorText}
            </Link>
          </span>
        ))}
        .
      </span>
    );
  }

  if (variant === "footer") {
    return (
      <div className={cn("mt-8 pt-6 border-t border-border/50", className)}>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Related:</span>{" "}
          {links.map((link, i) => (
            <span key={link.href}>
              {i > 0 && ", "}
              <Link
                href={link.href}
                className="hover:text-primary hover:underline underline-offset-2"
              >
                {link.anchorText}
              </Link>
            </span>
          ))}
        </p>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn(
        "rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm dark:bg-white/[0.03]",
        className
      )}>
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="h-4 w-4 text-primary" />
          <h4 className="font-display text-sm font-bold text-foreground">Related Resources</h4>
        </div>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowUpRight className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                <span className="group-hover:underline underline-offset-2">{link.anchorText}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Panel variant (default)
  return (
    <div className={cn("bg-muted/30 rounded-lg p-4", className)}>
      <h4 className="font-medium text-sm text-foreground mb-2">
        <Lightbulb className="h-4 w-4 inline mr-1 text-amber-500" />
        Related guides
      </h4>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/80 px-3 py-1 text-xs text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors"
          >
            {link.anchorText}
            <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Feature contextual link - for use in feature sections
 */
interface FeatureContextProps {
  feature: string;
  /** The guide or comparison to link to */
  linkTo: "guide" | "comparison";
  /** Specific page identifier */
  target: string;
  className?: string;
}

export function FeatureContext({ feature, linkTo, target, className }: FeatureContextProps) {
  const { GUIDES, COMPARISONS } = require("@/lib/internalLinking");

  let href: string;
  let text: string;

  if (linkTo === "guide") {
    const guide = GUIDES[target];
    if (!guide) return null;
    href = guide.href;
    text = `${feature} guide`;
  } else {
    const comparison = COMPARISONS[target];
    if (!comparison) return null;
    href = comparison.href;
    text = `${comparison.name} alternative`;
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 text-sm text-primary hover:underline underline-offset-2",
        className
      )}
    >
      <span>See our complete {text}</span>
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}

/**
 * FAQ link panel - adds links to guides within FAQ answers
 */
export interface FaqLinkPanelProps {
  /** Related topics for this FAQ */
  topics: string[];
  /** Recommended guide to link to */
  recommendedGuide?: {
    title: string;
    href: string;
  };
  className?: string;
}

export function FaqLinkPanel({ topics, recommendedGuide, className }: FaqLinkPanelProps) {
  const links = getContextualLinks(topics, "features").slice(0, 2);

  return (
    <div className={cn("mt-4 pt-4 border-t border-border/30", className)}>
      <p className="text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3 inline mr-1 text-primary" />
        Learn more:{" "}
        {links.map((link, i) => (
          <span key={link.href}>
            {i > 0 && ", "}
            <Link
              href={link.href}
              className="text-primary hover:underline underline-offset-2"
            >
              {link.anchorText}
            </Link>
          </span>
        ))}
        {recommendedGuide && (
          <>
            {" • "}
            <Link
              href={recommendedGuide.href}
              className="text-primary hover:underline underline-offset-2 font-medium"
            >
              {recommendedGuide.title}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
