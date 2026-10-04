"use client";

/**
 * TrustStrip — 4-column grid of feature cards below the tool workspace.
 * Each card has an icon in a colored circle, bold title, and muted description.
 * Grid: 1 col mobile, 2 cols sm, 4 cols lg.
 *
 * Design tokens: --tool-surface, --tool-surface-dim, --tool-border,
 *   --primary, --foreground, --muted-foreground.
 * Icons: Lucide only.
 */

import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrustFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface TrustStripProps {
  features: TrustFeature[];
  /** Additional class names for the outer container */
  className?: string;
}

export function TrustStrip({ features, className }: TrustStripProps) {
  if (!features.length) return null;

  return (
    <section
      aria-label="Why choose this tool"
      className={cn("w-full", className)}
    >
      <div
        className={cn(
          "grid gap-4",
          "grid-cols-1 sm:grid-cols-2",
          features.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
        )}
      >
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className={cn(
              "flex items-start gap-3 rounded-xl p-4",
              "bg-[hsl(var(--tool-surface))]",
              "border border-[hsl(var(--tool-border))]",
              "transition-colors hover:border-[hsl(var(--primary)/0.2)]"
            )}
          >
            {/* Icon circle */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                "bg-[hsl(var(--primary)/0.1)]"
              )}
            >
              <Icon
                className="h-5 w-5 text-[hsl(var(--primary))]"
                aria-hidden="true"
              />
            </div>

            {/* Text */}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
