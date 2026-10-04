"use client";

/**
 * TrustBadges — compact horizontal row of pill badges with icon + text.
 * Always fits in a single row. Horizontal scroll on very small screens.
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
  className?: string;
}

export function TrustBadges({ badges, className }: TrustBadgesProps) {
  if (!badges.length) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 pb-0.5",
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
            "inline-flex shrink-0 items-center gap-1.5",
            "rounded-full border border-[hsl(var(--tool-border))]",
            "bg-[hsl(var(--tool-surface))]",
            "px-2.5 py-1.5 sm:px-3 sm:py-1.5",
            "text-[11px] sm:text-xs font-medium",
            "text-foreground/90",
            "transition-colors hover:border-[hsl(var(--primary)/0.3)]"
          )}
        >
          <Icon
            className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-[hsl(var(--primary))]"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">{text}</span>
        </div>
      ))}
    </div>
  );
}
