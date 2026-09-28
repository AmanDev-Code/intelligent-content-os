"use client";

/**
 * VideoToolsSidebar — shared left navigation sidebar for ALL video tools.
 *
 * Design: matches ImageToolsSidebar exactly — colored format badges,
 * POPULAR / CONVERT / RECORD / EDIT sections, search bar with ⌘K,
 * Trndinn CTA card at bottom.
 *
 * Sticky: position sticky, top 64px, max-height calc(100vh - 64px).
 * Mobile: Sheet trigger + SheetContent side="left".
 *
 * Shadcn primitives: Sheet, SheetContent, SheetTrigger.
 * Icons: Lucide only.
 * Accessible: nav landmark, aria-current, focus rings.
 */

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  ChevronDown,
  Video,
  Camera,
  Monitor,
  Clapperboard,
  Scissors,
  Merge,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Sidebar data — scoped to video-only tools
// ---------------------------------------------------------------------------

interface SidebarItem {
  slug: string;
  label: string;
  color: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
}

const SIDEBAR_POPULAR: SidebarItem[] = [
  { slug: "video-converter",  label: "MP4 Converter",    color: "#F97316", icon: Clapperboard },
  { slug: "screen-recorder",  label: "Screen Recorder",  color: "#3B82F6", icon: Monitor },
];

const SIDEBAR_CONVERT: SidebarItem[] = [
  { slug: "video-converter", label: "MP4 → WebM",  color: "#F97316" },
  { slug: "video-converter", label: "WebM → MP4",  color: "#3B82F6" },
  { slug: "video-converter", label: "MOV → MP4",   color: "#10B981" },
  { slug: "video-converter", label: "AVI → MP4",   color: "#8B5CF6" },
  { slug: "video-converter", label: "MKV → MP4",   color: "#EC4899" },
  { slug: "video-converter", label: "MP4 → GIF",   color: "#F59E0B" },
];

const SIDEBAR_RECORD: SidebarItem[] = [
  { slug: "video-recorder",  label: "Video Recorder",   color: "#EF4444", icon: Camera },
  { slug: "screen-recorder", label: "Screen Recorder",  color: "#3B82F6", icon: Monitor },
  { slug: "video-recorder",  label: "Webcam Recorder",  color: "#10B981", icon: Video },
];

const SIDEBAR_EDIT: SidebarItem[] = [
  { slug: "video-trimmer", label: "Video Trimmer", color: "#F97316", icon: Scissors, comingSoon: true },
  { slug: "video-merger",  label: "Video Merger",  color: "#8B5CF6", icon: Merge, comingSoon: true },
];

// Format → color for convert badge items
const FORMAT_COLORS: Record<string, string> = {
  mp4:  "#F97316",
  webm: "#3B82F6",
  mov:  "#10B981",
  avi:  "#8B5CF6",
  mkv:  "#EC4899",
  gif:  "#F59E0B",
};

// ---------------------------------------------------------------------------
// Sidebar content (shared between desktop nav and mobile sheet)
// ---------------------------------------------------------------------------

function SidebarContent({
  activeSlug,
  onNavigate,
}: {
  activeSlug: string;
  onNavigate?: () => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  // Filter ALL sections by search query
  const filteredPopular = q
    ? SIDEBAR_POPULAR.filter(t => `${t.label} ${t.slug}`.toLowerCase().includes(q))
    : SIDEBAR_POPULAR;

  const filteredConvert = q
    ? SIDEBAR_CONVERT.filter(t => `${t.label} ${t.slug}`.toLowerCase().includes(q))
    : SIDEBAR_CONVERT;

  const filteredRecord = q
    ? SIDEBAR_RECORD.filter(t => `${t.label} ${t.slug}`.toLowerCase().includes(q))
    : SIDEBAR_RECORD;

  const filteredEdit = q
    ? SIDEBAR_EDIT.filter(t => `${t.label} ${t.slug}`.toLowerCase().includes(q))
    : SIDEBAR_EDIT;

  return (
    <>
      {/* Search */}
      <div className="px-3 py-3 border-b" style={{ borderColor: "hsl(var(--tool-border))" }}>
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: "hsl(var(--tool-surface-dim))" }}>
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Search video tools"
          />
          <span className="hidden text-[10px] text-muted-foreground/60 sm:block">⌘K</span>
        </div>
      </div>

      <div className="flex-1 py-2 space-y-0.5 overflow-y-auto">
        {/* POPULAR */}
        {(!q || filteredPopular.length > 0) && (
          <div>
            <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Popular
            </p>
            {filteredPopular.map((t, i) => {
              const Icon = t.icon;
              const isActive = t.slug === activeSlug;
              return (
                <Link
                  key={`${t.slug}-popular-${i}`}
                  href={`/tools/${t.slug}`}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "mx-1.5 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  style={isActive ? {
                    background: `${t.color}20`,
                    color: t.color,
                  } : undefined}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white"
                    style={{ background: t.color }}
                    aria-hidden
                  >
                    {Icon ? <Icon className="h-3 w-3" /> : (
                      <span className="text-[9px] font-black">
                        {t.label.slice(0, 3).toUpperCase()}
                      </span>
                    )}
                  </span>
                  {t.label}
                  {isActive && (
                    <ArrowRight className="ml-auto h-3 w-3 shrink-0" aria-hidden />
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* CONVERT */}
        {(!q || filteredConvert.length > 0) && (
          <div>
            <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Convert
            </p>
            {filteredConvert.map((t, i) => {
              const isActive = t.slug === activeSlug;
              const fromFormat = t.label.split(" → ")[0].toLowerCase();
              const color = FORMAT_COLORS[fromFormat] ?? t.color;
              return (
                <Link
                  key={`${t.slug}-convert-${i}`}
                  href={`/tools/${t.slug}`}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "mx-1.5 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  style={isActive ? { background: `${color}20`, color } : undefined}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-black text-white"
                    style={{ background: color }}
                    aria-hidden
                  >
                    {fromFormat.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="truncate">{t.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* RECORD */}
        {(!q || filteredRecord.length > 0) && (
          <div>
            <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Record
            </p>
            {filteredRecord.map((t, i) => {
              const Icon = t.icon;
              const isActive = t.slug === activeSlug;
              return (
                <Link
                  key={`${t.slug}-record-${i}`}
                  href={`/tools/${t.slug}`}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "mx-1.5 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? "font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                  style={isActive ? { background: `${t.color}20`, color: t.color } : undefined}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white"
                    style={{ background: t.color }}
                    aria-hidden
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                  </span>
                  {t.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* EDIT */}
        {(!q || filteredEdit.length > 0) && (
          <div>
            <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Edit
            </p>
            {filteredEdit.map(t => {
              const Icon = t.icon;
              return (
                <span
                  key={t.slug}
                  className="mx-1.5 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] text-muted-foreground/40 cursor-default"
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/60"
                    style={{ background: `${t.color}60` }}
                    aria-hidden
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                  </span>
                  <span className="truncate">{t.label}</span>
                  <span className="ml-auto text-[9px] font-medium uppercase tracking-wider text-muted-foreground/40">
                    Soon
                  </span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Trndinn promo card at bottom */}
      <div className="mx-2 mb-3 mt-4 rounded-xl p-3" style={{ background: "linear-gradient(135deg, hsl(var(--tool-surface)), hsl(var(--tool-border)))", border: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <img src="/brand/icon-color.png" alt="" className="h-5 w-5" aria-hidden />
          <span className="text-[11px] font-semibold text-foreground">trndinn</span>
        </div>
        <p className="text-[10.5px] leading-relaxed text-muted-foreground">
          Create content, schedule posts and grow your brand with AI.
        </p>
        <Link
          href="/pricing"
          className="mt-2 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
        >
          Try Trndinn Free
          <ArrowUpRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Mobile — "Tools" trigger opening the same sidebar as a sheet
// ---------------------------------------------------------------------------

function MobileToolsTrigger({ activeSlug }: { activeSlug: string }) {
  const [open, setOpen] = useState(false);

  const activeLabel =
    SIDEBAR_POPULAR.find(t => t.slug === activeSlug)?.label ??
    SIDEBAR_RECORD.find(t => t.slug === activeSlug)?.label ??
    SIDEBAR_EDIT.find(t => t.slug === activeSlug)?.label ??
    "Video Tools";

  return (
    <div className="lg:hidden border-b" style={{ borderColor: "hsl(var(--tool-border))", background: "hsl(var(--tool-bg))" }}>
      <div className="px-4 py-2.5">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg border",
                "px-3 py-2 text-sm font-medium text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              style={{ borderColor: "hsl(var(--tool-border))", background: "hsl(var(--tool-surface-dim))" }}
            >
              <span className="flex items-center gap-2 truncate">
                <Video className="h-4 w-4 shrink-0" style={{ color: "#F97316" }} aria-hidden />
                {activeLabel}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <nav
              aria-label="Video tools navigation"
              className="flex h-full flex-col overflow-y-auto"
              style={{ background: "hsl(var(--tool-bg))" }}
            >
              <SidebarContent
                activeSlug={activeSlug}
                onNavigate={() => setOpen(false)}
              />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface VideoToolsSidebarProps {
  activeSlug: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function VideoToolsSidebar({ activeSlug, className }: VideoToolsSidebarProps) {
  return (
    <>
      {/* Desktop sidebar — sticky, same design as ImageToolsSidebar */}
      <nav
        aria-label="Video tools navigation"
        className={cn(
          "hidden lg:flex flex-col w-[210px] shrink-0",
          className
        )}
        style={{
          position: "sticky",
          top: "64px",
          height: "fit-content",
          maxHeight: "calc(100vh - 64px)",
          overflowY: "auto",
          background: "hsl(var(--tool-bg))",
        }}
      >
        <SidebarContent activeSlug={activeSlug} />
      </nav>

      {/* Mobile: sheet trigger */}
      <MobileToolsTrigger activeSlug={activeSlug} />
    </>
  );
}
