"use client";

/**
 * VideoToolsShell — sidebar layout wrapping all 3 video tool pages.
 *
 * Shadcn primitives: none (layout-only shell; tool content is children).
 * Design tokens: --background, --foreground, --card, --card-foreground,
 *   --muted, --muted-foreground, --primary, --primary-foreground,
 *   --border, --sidebar-background, --sidebar-foreground,
 *   --sidebar-primary, --sidebar-accent, --sidebar-border.
 * Icons: Lucide only.
 * Motion: CSS only.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Video,
  Camera,
  Monitor,
  Clapperboard,
  ChevronRight,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------

const VIDEO_NAV = [
  {
    slug: "video-converter",
    label: "Video Converter",
    icon: Clapperboard,
    description: "MP4, MOV, AVI, MKV, WEBM",
  },
  {
    slug: "video-recorder",
    label: "Video Recorder",
    icon: Camera,
    description: "Record from webcam",
  },
  {
    slug: "screen-recorder",
    label: "Screen Recorder",
    icon: Monitor,
    description: "Capture your screen",
  },
] as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface VideoToolsShellProps {
  children: ReactNode;
  /** Override the active slug (defaults to reading pathname). */
  activeSlug?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VideoToolsShell({ children, activeSlug }: VideoToolsShellProps) {
  const pathname = usePathname();
  const resolvedSlug =
    activeSlug ?? pathname.split("/").filter(Boolean).at(-1) ?? "";

  return (
    <MarketingShell>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* ── Sidebar ── */}
          <aside
            className="w-full shrink-0 lg:w-56 xl:w-60"
            aria-label="Video tools navigation"
          >
            <nav>
              {/* Header */}
              <div className="mb-3 flex items-center gap-2 px-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(var(--primary)/0.12)]"
                  aria-hidden
                >
                  <Video className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                  Video Tools
                </span>
              </div>

              {/* Nav list */}
              <ul className="flex flex-row gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0">
                {VIDEO_NAV.map(({ slug, label, icon: Icon, description }) => {
                  const isActive = resolvedSlug === slug;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/tools/${slug}`}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group flex min-w-max items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1",
                          "lg:min-w-0 lg:w-full",
                          isActive
                            ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-semibold"
                            : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isActive
                              ? "text-[hsl(var(--primary))]"
                              : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]"
                          )}
                          aria-hidden
                        />
                        <span className="flex-1 truncate">{label}</span>
                        {isActive && (
                          <ChevronRight
                            className="hidden h-3.5 w-3.5 shrink-0 text-[hsl(var(--primary))] lg:block"
                            aria-hidden
                          />
                        )}
                      </Link>
                      {isActive && (
                        <p className="hidden px-3 pb-1 text-xs text-[hsl(var(--muted-foreground))] lg:block">
                          {description}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* ── Main content ── */}
          <main className="min-w-0 flex-1" id="main-content">
            {children}
          </main>
        </div>
      </div>
    </MarketingShell>
  );
}
