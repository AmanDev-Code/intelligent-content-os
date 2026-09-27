"use client";

/**
 * ImageToolsSidebar — left navigation sidebar for all 49 image tools.
 *
 * Shadcn primitives: Badge, Button.
 * Design tokens: --muted, --muted-foreground, --border, --primary,
 *   --primary-foreground, --card, --foreground, --accent, --background.
 * Icons: Lucide only.
 * Responsive: hidden on mobile (replaced by horizontal pill strip in parent).
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
} from "lucide-react";
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
  collapsible?: boolean;
  topCount?: number; // how many to show before "See all"
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: "conversion",
    label: "Convert",
    icon: RefreshCw,
    topCount: 10,
    collapsible: true,
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
      { slug: "image-rotator", label: "Rotate & Flip" },
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
      { slug: "favicon-generator", label: "Favicon Generator" },
      { slug: "background-remover", label: "Background Remover" },
      { slug: "image-to-text", label: "Image to Text (OCR)" },
      { slug: "qr-code-generator", label: "QR Code Generator" },
      { slug: "profile-pic-creator", label: "Profile Pic Creator" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ImageToolsSidebarProps {
  activeSlug: string;
  onToolChange?: (slug: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// SidebarGroup component
// ---------------------------------------------------------------------------

function SidebarGroupSection({
  group,
  activeSlug,
}: {
  group: SidebarGroup;
  activeSlug: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const Icon = group.icon;
  const top = group.topCount ?? group.tools.length;
  const visibleTools =
    group.collapsible && !expanded ? group.tools.slice(0, top) : group.tools;
  const hiddenCount = group.tools.length - top;

  return (
    <section aria-label={group.label}>
      {/* Sticky category header */}
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-[hsl(var(--muted))] px-3 py-2">
        <Icon
          className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--primary))]"
          aria-hidden="true"
        />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          {group.label}
        </span>
      </div>

      {/* Tool links */}
      <ul className="px-1.5 pb-1" role="list">
        {visibleTools.map((tool) => {
          const isActive = tool.slug === activeSlug;
          return (
            <li key={tool.slug}>
              <Link
                href={`/tools/${tool.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full items-center rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1",
                  isActive
                    ? "bg-[hsl(var(--primary)/0.12)] font-semibold text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--foreground)/0.75)] hover:bg-[hsl(var(--accent))] hover:text-foreground"
                )}
              >
                {tool.label}
                {isActive && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* See all / collapse toggle */}
      {group.collapsible && hiddenCount > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "mx-1.5 mb-2 flex w-[calc(100%-12px)] items-center gap-1.5 rounded-md px-2.5 py-1.5",
            "text-[12px] font-medium text-[hsl(var(--muted-foreground))]",
            "hover:bg-[hsl(var(--accent))] hover:text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1"
          )}
          aria-expanded={expanded}
          aria-controls={`sidebar-group-${group.id}-overflow`}
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
// Mobile pill strip
// ---------------------------------------------------------------------------

function MobilePillStrip({ activeSlug }: { activeSlug: string }) {
  const allTools = SIDEBAR_GROUPS.flatMap((g) => g.tools);
  return (
    <nav
      aria-label="Image tools navigation"
      className="lg:hidden overflow-x-auto scrollbar-none border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]"
    >
      <div className="flex gap-2 px-4 py-2.5 min-w-max">
        {allTools.map((tool) => {
          const isActive = tool.slug === activeSlug;
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1",
                isActive
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-foreground"
              )}
            >
              {tool.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function ImageToolsSidebar({
  activeSlug,
  className,
}: ImageToolsSidebarProps) {
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
          "overflow-y-auto",
          "sticky top-0 h-screen",
          className
        )}
      >
        {/* Sidebar header */}
        <div className="border-b border-[hsl(var(--border))] px-3 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground)/0.6)]">
            Image Tools
          </p>
        </div>

        <div className="flex-1 overflow-y-auto py-1.5 space-y-0.5">
          {SIDEBAR_GROUPS.map((group) => (
            <SidebarGroupSection
              key={group.id}
              group={group}
              activeSlug={activeSlug}
            />
          ))}
        </div>
      </nav>

      {/* Mobile pill strip */}
      <MobilePillStrip activeSlug={activeSlug} />
    </>
  );
}
