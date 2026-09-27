"use client";

/**
 * ToolsSidebar — shared left navigation for all image/utility tool pages.
 *
 * Extracted from ImageConverterView so every tool page can use the same
 * dark sidebar with search, categories (POPULAR / CONVERT / OPTIMIZE / GENERATE),
 * and the Trndinn promo card.
 *
 * Shadcn primitives: none (pure HTML + Tailwind).
 * Design tokens: uses inline hsl() values matching the dark sidebar theme.
 * Icons: Lucide only.
 */

import { useState } from "react";
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  Minimize2,
  Crop,
  Wand2,
  Layers,
  Palette,
  Star,
  QrCode,
  FileCode2,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { CONVERSION_TOOLS } from "@/lib/image-converter-data";

// ─── Sidebar data ────────────────────────────────────────────────────────────

const SIDEBAR_POPULAR = [
  { slug: "png-to-jpg",  label: "PNG → JPG",  color: "#EF4444" },
  { slug: "jpg-to-png",  label: "JPG → PNG",  color: "#3B82F6" },
  { slug: "webp-to-jpg", label: "WebP → JPG", color: "#10B981" },
  { slug: "heic-to-jpg", label: "HEIC → JPG", color: "#F59E0B" },
];

const SIDEBAR_OPTIMIZE = [
  { slug: "compress-jpg",       label: "Compress Image",    color: "#F97316", icon: Minimize2 },
  { slug: "image-resizer",      label: "Resize Image",      color: "#3B82F6", icon: Layers },
  { slug: "background-remover", label: "Remove Background", color: "#10B981", icon: Wand2 },
  { slug: "image-workbench",    label: "Enhance Image",     color: "#8B5CF6", icon: Palette },
];

const SIDEBAR_GENERATE = [
  { slug: "favicon-generator",  label: "Favicon Generator",  color: "#F59E0B", icon: Star },
  { slug: "qr-code-generator",  label: "QR Code Generator",  color: "#06B6D4", icon: QrCode },
  { slug: "image-to-base64",    label: "Image to Base64",    color: "#8B5CF6", icon: FileCode2 },
];

/** Format → color for sidebar convert items */
const FORMAT_COLORS: Record<string, string> = {
  png:  "#3B82F6",
  jpg:  "#EF4444",
  jpeg: "#EF4444",
  webp: "#10B981",
  heic: "#F59E0B",
  heif: "#F59E0B",
  svg:  "#F97316",
  avif: "#8B5CF6",
  gif:  "#EC4899",
  bmp:  "#6B7280",
  tiff: "#6B7280",
  tif:  "#6B7280",
  ico:  "#F59E0B",
};

// ─── Component ───────────────────────────────────────────────────────────────

export interface ToolsSidebarProps {
  activeSlug: string;
}

export function ToolsSidebar({ activeSlug }: ToolsSidebarProps) {
  const [query, setQuery] = useState("");

  // Filter CONVERSION_TOOLS by query for the CONVERT section
  const filteredConvert = query.trim()
    ? CONVERSION_TOOLS.filter(t =>
        `${t.fromLabel} ${t.toLabel} ${t.slug}`.toLowerCase().includes(query.toLowerCase())
      )
    : CONVERSION_TOOLS;

  return (
    <nav
      className="hidden lg:flex flex-col w-[210px] shrink-0"
      style={{
        position: "sticky",
        top: "64px",
        height: "calc(100vh - 64px)",
        overflowY: "auto",
        background: "hsl(223 62% 6%)",
        borderRight: "1px solid hsl(224 28% 18%)",
      }}
      aria-label="Image tools navigation"
    >
      {/* Search */}
      <div className="px-3 py-3 border-b" style={{ borderColor: "hsl(224 28% 18%)" }}>
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: "hsl(224 36% 14%)" }}>
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Search tools"
          />
          <span className="hidden text-[10px] text-muted-foreground/60 sm:block">⌘K</span>
        </div>
      </div>

      <div className="flex-1 py-2 space-y-0.5">
        {/* POPULAR — hide when searching */}
        {!query.trim() && (
          <div>
            <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Popular
            </p>
            {SIDEBAR_POPULAR.map(t => {
              const isActive = t.slug === activeSlug;
              return (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
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
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-black text-white"
                    style={{ background: t.color }}
                    aria-hidden
                  >
                    {t.label.split(" → ")[0].slice(0, 3)}
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

        {/* CONVERT — all from CONVERSION_TOOLS */}
        <div>
          <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Convert
          </p>
          {filteredConvert.map(t => {
            const isActive = t.slug === activeSlug;
            const color = FORMAT_COLORS[t.fromFormat] ?? "#F97316";
            return (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
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
                  {t.fromLabel.slice(0, 3).toUpperCase()}
                </span>
                <span className="truncate">{t.fromLabel} → {t.toLabel}</span>
              </Link>
            );
          })}
          {filteredConvert.length === 0 && (
            <p className="px-3 py-2 text-[11px] text-muted-foreground/60">No tools found</p>
          )}
        </div>

        {/* OPTIMIZE — hide when searching */}
        {!query.trim() && (
          <div>
            <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Optimize
            </p>
            {SIDEBAR_OPTIMIZE.map(t => {
              const Icon = t.icon;
              const isActive = t.slug === activeSlug;
              return (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
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
                    <Icon className="h-3 w-3" />
                  </span>
                  {t.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* GENERATE — hide when searching */}
        {!query.trim() && (
          <div>
            <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Generate
            </p>
            {SIDEBAR_GENERATE.map(t => {
              const Icon = t.icon;
              const isActive = t.slug === activeSlug;
              return (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
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
                    <Icon className="h-3 w-3" />
                  </span>
                  {t.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Trndinn promo card at bottom */}
      <div className="mx-2 mb-3 rounded-xl p-3" style={{ background: "linear-gradient(135deg, hsl(223 62% 12%), hsl(224 36% 18%))", border: "1px solid hsl(224 28% 24%)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded" style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}>
            <span className="text-[9px] font-black text-white">T</span>
          </div>
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
          Try Trndinn
          <ArrowUpRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    </nav>
  );
}
