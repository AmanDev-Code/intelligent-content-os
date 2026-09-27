"use client";

/**
 * ImageToolsSidebar — left navigation sidebar for all 49 image tools.
 *
 * Design rationale (researched against iLovePDF, iLoveIMG, Convertio, Notion):
 * none of the big converter sites use a persistent sidebar — they rely on a
 * mega-dropdown, which stops scaling past ~30 tools. A persistent, grouped,
 * collapsible sidebar is the right architecture at 49+ tools. Visual style
 * follows Notion's restraint rather than iLovePDF's bold color-swap: the
 * active state is a soft background tint (never color-alone), group headers
 * are small and muted, no per-tool icons (icons at this density add noise,
 * not scanability), and every group caps overflow at the same count so
 * total sidebar height stays predictable regardless of group count.
 *
 * Shadcn primitives: none (plain nav — Button/Badge not needed here).
 * Design tokens: --muted, --muted-foreground, --border, --primary,
 *   --primary-foreground, --card, --foreground, --accent, --background.
 * Icons: Lucide only, group headers only (14px, monochrome).
 * Responsive: hidden on mobile; replaced by a "Tools" trigger + sheet
 *   that reuses the exact same grouped/sticky-header list.
 * Accessible: nav landmark, aria-current, keyboard navigation.
 */

import { useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Minimize2,
  Scissors,
  Wrench,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface SidebarTool {
  slug: string;
  label: string;
}

interface SidebarGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  tools: SidebarTool[];
}

/** Every group collapses to this count before showing "+N more". Keeps
 *  total sidebar height predictable no matter how many groups exist. */
const OVERFLOW_THRESHOLD = 8;

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: "conversion",
    label: "Convert",
    icon: RefreshCw,
    tools: [
      { slug: "png-to-jpg", label: "PNG → JPG" },
      { slug: "jpg-to-png", label: "JPG → PNG" },
      { slug: "webp-to-jpg", label: "WebP → JPG" },
      { slug: "webp-to-png", label: "WebP → PNG" },
      { slug: "jpg-to-webp", label: "JPG → WebP" },
      { slug: "png-to-webp", label: "PNG → WebP" },
      { slug: "heic-to-jpg", label: "HEIC → JPG" },
      { slug: "heic-to-png", label: "HEIC → PNG" },
      { slug: "svg-to-png", label: "SVG → PNG" },
      { slug: "png-to-ico", label: "PNG → ICO" },
      { slug: "gif-to-jpg", label: "GIF → JPG" },
      { slug: "gif-to-png", label: "GIF → PNG" },
      { slug: "gif-to-webp", label: "GIF → WebP" },
      { slug: "bmp-to-jpg", label: "BMP → JPG" },
      { slug: "bmp-to-png", label: "BMP → PNG" },
      { slug: "tiff-to-jpg", label: "TIFF → JPG" },
      { slug: "tiff-to-png", label: "TIFF → PNG" },
      { slug: "jpg-to-avif", label: "JPG → AVIF" },
      { slug: "png-to-avif", label: "PNG → AVIF" },
      { slug: "webp-to-avif", label: "WebP → AVIF" },
      { slug: "avif-to-jpg", label: "AVIF → JPG" },
      { slug: "avif-to-png", label: "AVIF → PNG" },
      { slug: "jpg-to-gif", label: "JPG → GIF" },
      { slug: "png-to-gif", label: "PNG → GIF" },
      { slug: "webp-to-gif", label: "WebP → GIF" },
      { slug: "jpg-to-bmp", label: "JPG → BMP" },
      { slug: "png-to-bmp", label: "PNG → BMP" },
      { slug: "webp-to-bmp", label: "WebP → BMP" },
      { slug: "webp-to-tiff", label: "WebP → TIFF" },
      { slug: "jpg-to-tiff", label: "JPG → TIFF" },
      { slug: "png-to-tiff", label: "PNG → TIFF" },
      { slug: "jpg-to-ico", label: "JPG → ICO" },
      { slug: "webp-to-ico", label: "WebP → ICO" },
    ],
  },
  {
    id: "compression",
    label: "Compress",
    icon: Minimize2,
    tools: [
      { slug: "compress-jpg", label: "Compress JPG" },
      { slug: "compress-png", label: "Compress PNG" },
      { slug: "compress-webp", label: "Compress WebP" },
      { slug: "compress-gif", label: "Compress GIF" },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    icon: Scissors,
    tools: [
      { slug: "image-resizer", label: "Resize" },
      { slug: "image-cropper", label: "Crop" },
      { slug: "image-rotator", label: "Rotate & flip" },
      { slug: "watermark-image", label: "Watermark" },
      { slug: "image-workbench", label: "Workbench" },
    ],
  },
  {
    id: "utility",
    label: "Utilities",
    icon: Wrench,
    tools: [
      { slug: "image-to-base64", label: "Image → Base64" },
      { slug: "base64-to-image", label: "Base64 → Image" },
      { slug: "favicon-generator", label: "Favicon generator" },
      { slug: "background-remover", label: "Background remover" },
      { slug: "image-to-text", label: "Image to text (OCR)" },
      { slug: "qr-code-generator", label: "QR code generator" },
      { slug: "profile-pic-creator", label: "Profile pic creator" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Shared tool link row
// ---------------------------------------------------------------------------

function ToolLink({
  tool,
  isActive,
  onNavigate,
}: {
  tool: SidebarTool;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <li>
      <Link
        href={`/tools/${tool.slug}`}
        aria-current={isActive ? "page" : undefined}
        onClick={onNavigate}
        className={cn(
          "block w-full rounded-md px-2.5 py-[7px] text-[13px] leading-tight transition-colors duration-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1",
          isActive
            ? "bg-[hsl(var(--primary)/0.1)] font-medium text-[hsl(var(--primary))]"
            : "text-[hsl(var(--foreground)/0.72)] hover:bg-[hsl(var(--accent))] hover:text-foreground"
        )}
      >
        {tool.label}
      </Link>
    </li>
  );
}

// ---------------------------------------------------------------------------
// SidebarGroup — shared between desktop nav and mobile sheet
// ---------------------------------------------------------------------------

function SidebarGroupSection({
  group,
  activeSlug,
  onNavigate,
}: {
  group: SidebarGroup;
  activeSlug: string;
  onNavigate?: () => void;
}) {
  const [expanded, setExpanded] = useState(
    group.tools.some((t) => t.slug === activeSlug) &&
      group.tools.findIndex((t) => t.slug === activeSlug) >= OVERFLOW_THRESHOLD
  );

  const Icon = group.icon;
  const visibleTools = expanded ? group.tools : group.tools.slice(0, OVERFLOW_THRESHOLD);
  const hiddenCount = group.tools.length - OVERFLOW_THRESHOLD;

  return (
    <section aria-label={group.label}>
      {/* Group header — small, muted, restrained (Notion-style, not iLovePDF's bolder 14px) */}
      <div className="sticky top-0 z-10 flex items-center gap-1.5 bg-[hsl(var(--muted))] px-3 py-1.5">
        <Icon className="h-3 w-3 shrink-0 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
        <span className="text-[10.5px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          {group.label}
        </span>
      </div>

      <ul className="px-1.5 pb-1" role="list">
        {visibleTools.map((tool) => (
          <ToolLink
            key={tool.slug}
            tool={tool}
            isActive={tool.slug === activeSlug}
            onNavigate={onNavigate}
          />
        ))}
      </ul>

      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "mx-1.5 mb-2 flex items-center gap-1 rounded-md px-2.5 py-1",
            "text-[11.5px] text-[hsl(var(--muted-foreground))]",
            "hover:bg-[hsl(var(--accent))] hover:text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1"
          )}
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronUp className="h-3 w-3" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          )}
          {expanded ? "Show less" : `+${hiddenCount} more`}
        </button>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Mobile — "Tools" trigger opening the same grouped list as a sheet
// (a flat 49-pill horizontal scroll loses the grouping entirely; a sheet
// keeps parity with desktop at the cost of one extra tap)
// ---------------------------------------------------------------------------

function MobileToolsTrigger({ activeSlug }: { activeSlug: string }) {
  const [open, setOpen] = useState(false);
  const activeLabel =
    SIDEBAR_GROUPS.flatMap((g) => g.tools).find((t) => t.slug === activeSlug)?.label ??
    "Tools";

  return (
    <div className="lg:hidden border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-lg border border-[hsl(var(--border))]",
              "bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm font-medium text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <Layers className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" aria-hidden />
              {activeLabel}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" aria-hidden />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <nav aria-label="Image tools navigation" className="h-full overflow-y-auto py-1.5">
            <div className="border-b border-[hsl(var(--border))] px-3 py-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground)/0.7)]">
                Image tools
              </p>
            </div>
            <div className="space-y-0.5 py-1.5">
              {SIDEBAR_GROUPS.map((group) => (
                <SidebarGroupSection
                  key={group.id}
                  group={group}
                  activeSlug={activeSlug}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ImageToolsSidebarProps {
  activeSlug: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function ImageToolsSidebar({ activeSlug, className }: ImageToolsSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav
        aria-label="Image tools navigation"
        className={cn(
          "hidden lg:flex flex-col",
          "w-[240px] shrink-0",
          "border-r border-[hsl(var(--border))]",
          "bg-[hsl(var(--muted))]",
          "sticky top-0 h-screen overflow-y-auto",
          className
        )}
      >
        <div className="border-b border-[hsl(var(--border))] px-3 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground)/0.7)]">
            Image tools
          </p>
        </div>

        <div className="flex-1 py-1.5 space-y-0.5">
          {SIDEBAR_GROUPS.map((group) => (
            <SidebarGroupSection key={group.id} group={group} activeSlug={activeSlug} />
          ))}
        </div>
      </nav>

      {/* Mobile: single "Tools" trigger opening the grouped list in a sheet */}
      <MobileToolsTrigger activeSlug={activeSlug} />
    </>
  );
}
