"use client";

/**
 * AudioToolsShell — sidebar layout wrapping all 4 audio tool pages.
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
  Music,
  Mic,
  MessageSquareText,
  AudioWaveform,
  ChevronRight,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------

const AUDIO_NAV = [
  {
    slug: "audio-converter",
    label: "Audio Converter",
    icon: Music,
    description: "MP3, WAV, FLAC, AAC",
  },
  {
    slug: "audio-recorder",
    label: "Audio Recorder",
    icon: Mic,
    description: "Record from mic",
  },
  {
    slug: "text-to-speech",
    label: "Text to Speech",
    icon: MessageSquareText,
    description: "Natural browser voices",
  },
  {
    slug: "speech-to-text",
    label: "Speech to Text",
    icon: AudioWaveform,
    description: "Live transcription",
  },
] as const;

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
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* ── Sidebar ── */}
          <aside
            className="w-full shrink-0 lg:w-56 xl:w-60"
            aria-label="Audio tools navigation"
          >
            <nav>
              {/* Header */}
              <div className="mb-3 flex items-center gap-2 px-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(var(--primary)/0.12)]"
                  aria-hidden
                >
                  <Music className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                  Audio Tools
                </span>
              </div>

              {/* Nav list */}
              <ul className="flex flex-row gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0">
                {AUDIO_NAV.map(({ slug, label, icon: Icon, description }) => {
                  const isActive = resolvedSlug === slug;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/tools/${slug}`}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          // Base
                          "group flex min-w-max items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1",
                          // Responsive: pill on mobile, full block on desktop
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
                      {/* Description — desktop only, below the active item */}
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
