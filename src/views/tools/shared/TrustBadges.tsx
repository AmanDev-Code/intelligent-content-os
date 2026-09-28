"use client";

/**
 * TrustBadges — horizontal row of pill badges with icon + text.
 * Matches the premium tool page design: dark pill with subtle border,
 * icon tinted with primary color, horizontal scroll on mobile.
 *
 * Design tokens: --tool-surface, --tool-border, --primary, --foreground.
 * Icons: Lucide only.
 */

import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrustBadge {
  icon: LucideIcon;
  text: string;
}

export interface TrustBadgesProps {
  badges: TrustBadge[];
  /** Additional class names for the outer container */
  className?: string;
}

export function TrustBadges({ badges, className }: TrustBadgesProps) {
  if (!badges.length) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none",
        // Center on larger screens, scroll on mobile
        "sm:flex-wrap sm:justify-center sm:overflow-x-visible sm:pb-0",
        className
      )}
      role="list"
      aria-label="Tool features"
    >
      {badges.map(({ icon: Icon, text }) => (
        <div
          key={text}
          role="listitem"
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full",
            "border border-[hsl(var(--tool-border))]",
            "bg-[hsl(var(--tool-surface))]",
            "px-4 py-2 text-sm font-medium",
            "text-foreground/90",
            "transition-colors hover:border-[hsl(var(--primary)/0.3)]"
          )}
        >
          <Icon
            className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">{text}</span>
        </div>
      ))}
    </div>
  );
}
