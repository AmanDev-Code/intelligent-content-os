"use client";

/**
 * ImageToolsSidebar — shared left navigation sidebar for ALL image tools.
 *
 * Desktop: position:fixed background lane (full viewport height, always),
 *          sticky nav inside a 210px flex column.
 * Mobile:  hidden — tools accessed via hamburger menu.
 *
 * Icons: Lucide only.
 * Accessible: nav landmark, aria-current, focus rings.
 */

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Layers,
  Minimize2,
  Wand2,
  Palette,
  Star,
  QrCode,
  FileCode2,
  Crop,
  RotateCcw,
  Stamp,
  ImageIcon,
  ScanLine,
  ArrowUpRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CONVERSION_TOOLS } from "@/lib/image-converter-data";

// ---------------------------------------------------------------------------
// Sidebar data — exact same as original converter sidebar
// ---------------------------------------------------------------------------

const SIDEBAR_POPULAR = [
  { slug: "jpg-to-ico",  label: "JPG → ICO",  color: "#F59E0B" },
  { slug: "png-to-ico",  label: "PNG → ICO",  color: "#3B82F6" },
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

const SIDEBAR_EDIT = [
  { slug: "image-cropper",    label: "Image Cropper",    color: "#3B82F6", icon: Crop },
  { slug: "image-rotator",    label: "Image Rotator",    color: "#10B981", icon: RotateCcw },
  { slug: "watermark-image",  label: "Add Watermark",    color: "#F97316", icon: Stamp },
  { slug: "image-to-text",    label: "Image to Text",    color: "#8B5CF6", icon: ScanLine },
  { slug: "profile-pic-creator", label: "Profile Picture", color: "#EC4899", icon: User },
];

const SIDEBAR_GENERATE = [
  { slug: "favicon-generator",  label: "Favicon Generator",  color: "#F59E0B", icon: Star },
  { slug: "qr-code-generator",  label: "QR Code Generator",  color: "#06B6D4", icon: QrCode },
  { slug: "image-to-base64",    label: "Image to Base64",    color: "#8B5CF6", icon: FileCode2 },
  { slug: "base64-to-image",    label: "Base64 to Image",    color: "#6B7280", icon: ImageIcon },
];

// Format → color for sidebar convert items
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
  const filteredConvert = q
    ? CONVERSION_TOOLS.filter(t =>
        `${t.fromLabel} ${t.toLabel} ${t.slug} ${t.primaryKeyword} ${t.seoDescription} ${t.whyConvert}`.toLowerCase().includes(q)
      )
    : CONVERSION_TOOLS;

  const filteredPopular = q
    ? SIDEBAR_POPULAR.filter(t => `${t.label} ${t.slug}`.toLowerCase().includes(q))
    : SIDEBAR_POPULAR;

  const filteredOptimize = q
    ? SIDEBAR_OPTIMIZE.filter(t => `${t.label} ${t.slug}`.toLowerCase().includes(q))
    : SIDEBAR_OPTIMIZE;

  const filteredEdit = q
    ? SIDEBAR_EDIT.filter(t => `${t.label} ${t.slug}`.toLowerCase().includes(q))
    : SIDEBAR_EDIT;

  const filteredGenerate = q
    ? SIDEBAR_GENERATE.filter(t => `${t.label} ${t.slug}`.toLowerCase().includes(q))
    : SIDEBAR_GENERATE;

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
            aria-label="Search image tools"
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
            {filteredPopular.map(t => {
              const isActive = t.slug === activeSlug;
              return (
                <Link
                  key={t.slug}
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

        {/* CONVERT — all conversions from CONVERSION_TOOLS */}
        {(!q || filteredConvert.length > 0) && (
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
        )}

        {/* OPTIMIZE */}
        {(!q || filteredOptimize.length > 0) && (
          <div>
            <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Optimize
            </p>
            {filteredOptimize.map(t => {
              const Icon = t.icon;
              const isActive = t.slug === activeSlug;
              return (
                <Link
                  key={t.slug}
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
                    <Icon className="h-3 w-3" />
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
              const isActive = t.slug === activeSlug;
              return (
                <Link
                  key={t.slug}
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
                    <Icon className="h-3 w-3" />
                  </span>
                  {t.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* GENERATE */}
        {(!q || filteredGenerate.length > 0) && (
          <div>
            <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Generate
            </p>
            {filteredGenerate.map(t => {
              const Icon = t.icon;
              const isActive = t.slug === activeSlug;
              return (
                <Link
                  key={t.slug}
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
    <div
      className={cn(
        "hidden lg:flex lg:flex-col w-[210px] shrink-0",
        className
      )}
      style={{
        background: "hsl(var(--tool-bg))",
        borderRight: "1px solid hsl(var(--tool-border))",
      }}
    >
      {/* No sticky, no height cap — sidebar content flows with page */}
      <nav
        aria-label="Image tools navigation"
        className="flex flex-col flex-1"
      >
        <SidebarContent activeSlug={activeSlug} />
      </nav>
    </div>
  );
}

/**
 * SidebarWrapper — simple flex row container.
 */
export function SidebarWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-screen", className)}>
      {children}
    </div>
  );
}
