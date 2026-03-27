"use client";

import type { ReactNode } from "react";
import { MarketingFooter } from "./MarketingFooter";
import { MarketingNav } from "./MarketingNav";
import { cn } from "@/lib/utils";

export function MarketingShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative min-h-screen overflow-x-hidden bg-background text-foreground", className)}>
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.4] dark:opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border) / 0.4) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.4) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />
      <div className="pointer-events-none fixed -left-40 top-0 -z-10 h-[min(80vh,520px)] w-[min(80vw,520px)] rounded-full bg-gradient-to-br from-primary/25 via-orange-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none fixed -right-32 bottom-0 -z-10 h-[420px] w-[420px] rounded-full bg-gradient-to-tl from-red-500/15 via-primary/5 to-transparent blur-3xl" />
      <div className="pointer-events-none fixed left-1/3 top-1/2 -z-10 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[100px] dark:bg-cyan-400/10" />

      <MarketingNav />
      {children}
      <MarketingFooter />
    </div>
  );
}
