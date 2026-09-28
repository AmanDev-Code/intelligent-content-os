"use client";

/**
 * AudioToolsShell — sidebar layout wrapping all audio tool pages.
 *
 * Uses AudioToolsSidebar (same design as ImageToolsSidebar) in a
 * flex layout matching ImageToolsShell's pattern.
 *
 * Shadcn primitives: none (layout-only shell; tool content is children).
 * Design tokens: --tool-bg, --tool-surface, --tool-border, --background,
 *   --foreground, --muted-foreground, --border.
 * Icons: Lucide only.
 * Motion: CSS only.
 */

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { AudioToolsSidebar } from "./AudioToolsSidebar";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AudioToolsShellProps {
  children: ReactNode;
  /** Override the active slug (defaults to reading pathname). */
  activeSlug?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AudioToolsShell({ children, activeSlug }: AudioToolsShellProps) {
  const pathname = usePathname();
  const resolvedSlug =
    activeSlug ?? pathname.split("/").filter(Boolean).at(-1) ?? "";

  return (
    <MarketingShell>
      {/* Sidebar lives outside the scrollable content area */}
      <div className="flex min-h-screen">
        {/* Left sidebar — desktop only, mobile shows sheet trigger inside */}
        <AudioToolsSidebar activeSlug={resolvedSlug} />

        {/* Main content column */}
        <div className="flex-1 min-w-0">
          {/* Mobile sheet trigger is rendered by AudioToolsSidebar internally */}

          <main
            id="main-content"
            className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8"
            aria-label="Audio tool"
          >
            {children}
          </main>
        </div>
      </div>
    </MarketingShell>
  );
}
