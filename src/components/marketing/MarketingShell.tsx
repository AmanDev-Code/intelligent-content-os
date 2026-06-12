"use client";

import type { ReactNode } from "react";
import { AnnouncementMarquee } from "./AnnouncementMarquee";
import { MarketingFooter } from "./MarketingFooter";
import { MarketingNav } from "./MarketingNav";
import { cn } from "@/lib/utils";

export function MarketingShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        // ONE continuous page canvas for the whole marketing site (light parchment /
        // deep navy in dark). Every section sits transparently on top of this — no
        // per-section background blocks, so the page flows top-to-bottom with no seams.
        "relative min-h-screen overflow-x-hidden bg-background text-foreground dark:bg-[#070b16]",
        className,
      )}
    >
      {/* Fixed, viewport-clipped decoration layer. Wrapping in `overflow-hidden`
          is required: bare `fixed` blobs with negative offsets are positioned
          against the viewport and are NOT clipped by an ancestor's
          `overflow-x-hidden`, so they would push the document wider than the
          screen and create horizontal scroll on mobile. */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.4] dark:opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border) / 0.4) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.4) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div className="absolute -left-40 top-0 h-[min(80vh,520px)] w-[min(80vw,520px)] rounded-full bg-gradient-to-br from-primary/25 via-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-gradient-to-tl from-red-500/15 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[100px] dark:bg-cyan-400/10" />
      </div>

      <AnnouncementMarquee />
      <MarketingNav />
      <div className="min-w-0 w-full max-w-full overflow-x-clip">{children}</div>
      <MarketingFooter />
    </div>
  );
}
