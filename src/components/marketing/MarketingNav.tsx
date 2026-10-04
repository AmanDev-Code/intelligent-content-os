"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { TrndinnLogo } from "@/components/brand/TrndinnLogo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";
import { cn } from "@/lib/utils";

function blogNavActive(pathname: string): boolean {
  return pathname === BLOG_BASE_PATH || pathname.startsWith(`${BLOG_BASE_PATH}/`);
}

/** Check if current path is an image/video/audio tool page */
function isToolFamilyPage(pathname: string): boolean {
  return pathname.startsWith("/tools/");
}

const links = [
  { href: "/features", label: "Features" },
  { href: "/features#agentic", label: "Agentic" },
  { href: "/tools", label: "Tools" },
  { href: "/pricing", label: "Pricing" },
  { href: BLOG_BASE_PATH, label: "Blog" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
] as const;

export function MarketingNav() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const { session } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const primaryHref = session ? "/dashboard" : "/auth";
  const primaryLabel = session ? "Dashboard" : "Get started";
  const isToolPage = isToolFamilyPage(pathname);

  // On tool pages, hamburger opens both panels simultaneously
  const handleHamburger = useCallback(() => {
    setOpen(true);
    if (isToolPage) setToolsOpen(true);
  }, [isToolPage]);

  // Close both when navigating
  const closeAll = useCallback(() => {
    setOpen(false);
    setToolsOpen(false);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="shrink-0" aria-label="Trndinn home">
            <TrndinnLogo variant="full" priority className="max-w-[190px] sm:max-w-[220px]" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ href, label }) => {
              const active =
                href === BLOG_BASE_PATH
                  ? blogNavActive(pathname)
                  : href.includes("#")
                    ? pathname === href.split("#")[0]
                    : pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-foreground/75 hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : undefined}
              disabled={!mounted}
            >
              {!mounted ? <Sun className="h-4 w-4 opacity-50" /> : isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {!session && (
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex rounded-full" asChild>
                <Link href="/auth">Sign in</Link>
              </Button>
            )}
            <Button
              size="sm"
              className="hidden rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f] px-4 font-semibold text-white sm:inline-flex"
              asChild
            >
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>

            {/* Hamburger button — opens main menu (+ tools sidebar on tool pages) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              onClick={handleHamburger}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Single Sheet for main Trndinn menu — slides from RIGHT.
                modal={false} on tool pages so Radix doesn't trap focus/pointer
                events — that would block scrolling on the tools sidebar panel. */}
            <Sheet
              open={open}
              onOpenChange={(v) => { setOpen(v); if (!v) setToolsOpen(false); }}
              modal={!isToolPage}
            >
              <SheetContent side="right" className={cn(
                "border-0 bg-background/95 backdrop-blur-xl",
                isToolPage ? "w-[min(60%,220px)]" : "w-[min(100%,320px)]"
              )}>
                <div className="mt-8 flex flex-col gap-1">
                  {links.map(({ href, label }) => {
                    const mActive =
                      href === BLOG_BASE_PATH
                        ? blogNavActive(pathname)
                        : href.includes("#")
                          ? pathname === href.split("#")[0]
                          : pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={closeAll}
                        className={cn(
                          "rounded-xl px-3 py-3 text-base font-medium",
                          mActive ? "bg-primary/15 text-primary" : "text-foreground",
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })}
                  {!session && (
                    <Link href="/auth" onClick={closeAll} className="rounded-xl px-3 py-3 text-base font-medium">
                      Sign in
                    </Link>
                  )}
                  <Link
                    href={primaryHref}
                    onClick={closeAll}
                    className="mt-2 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f] px-4 py-3 text-center font-semibold text-white"
                  >
                    {primaryLabel}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Tools sidebar — OUTSIDE header to escape its stacking context.
          backdrop-blur on the sticky header creates a new stacking context that
          traps position:fixed children, so the panel must be a sibling. */}
      {isToolPage && (
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-[60] w-[min(55%,240px)] transform transition-transform duration-300 ease-in-out overflow-y-auto overscroll-contain md:hidden",
            toolsOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"
          )}
          style={{
            background: "hsl(var(--tool-bg))",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
          aria-hidden={!toolsOpen}
        >
          <ToolsSidebarMobile onNavigate={closeAll} pathname={pathname} />
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Compact mobile tools sidebar content
// ---------------------------------------------------------------------------

import {
  Minimize2,
  Layers,
  Wand2,
  Palette,
  Crop,
  RotateCcw,
  Stamp,
  ScanLine,
  User,
  Star,
  QrCode,
  FileCode2,
  ImageIcon,
} from "lucide-react";

const MOBILE_SECTIONS = [
  {
    title: "Optimize",
    items: [
      { slug: "compress-jpg", label: "Compress", icon: Minimize2, color: "#F97316" },
      { slug: "image-resizer", label: "Resize", icon: Layers, color: "#3B82F6" },
      { slug: "background-remover", label: "Remove BG", icon: Wand2, color: "#10B981" },
      { slug: "image-workbench", label: "Enhance", icon: Palette, color: "#8B5CF6" },
    ],
  },
  {
    title: "Edit",
    items: [
      { slug: "image-cropper", label: "Crop", icon: Crop, color: "#3B82F6" },
      { slug: "image-rotator", label: "Rotate", icon: RotateCcw, color: "#10B981" },
      { slug: "watermark-image", label: "Watermark", icon: Stamp, color: "#F97316" },
      { slug: "image-to-text", label: "OCR", icon: ScanLine, color: "#8B5CF6" },
      { slug: "profile-pic-creator", label: "Profile Pic", icon: User, color: "#EC4899" },
    ],
  },
  {
    title: "Generate",
    items: [
      { slug: "favicon-generator", label: "Favicon", icon: Star, color: "#F59E0B" },
      { slug: "qr-code-generator", label: "QR Code", icon: QrCode, color: "#06B6D4" },
      { slug: "image-to-base64", label: "To Base64", icon: FileCode2, color: "#8B5CF6" },
      { slug: "base64-to-image", label: "From Base64", icon: ImageIcon, color: "#6B7280" },
    ],
  },
];

function ToolsSidebarMobile({
  onNavigate,
  pathname,
}: {
  onNavigate: () => void;
  pathname: string;
}) {
  const activeSlug = pathname.split("/tools/")[1]?.split("/")[0] ?? "";

  return (
    <>
      <div className="px-3 pt-4 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "hsl(var(--primary))" }}>
          Image Tools
        </p>
      </div>
      {MOBILE_SECTIONS.map((section) => (
        <div key={section.title} className="px-2 pb-1">
          <p className="px-2 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            {section.title}
          </p>
          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive = item.slug === activeSlug;
            return (
              <Link
                key={item.slug}
                href={`/tools/${item.slug}`}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11.5px] transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive ? "font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
                style={isActive ? { background: `${item.color}20`, color: item.color } : undefined}
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-white"
                  style={{ background: item.color }}
                >
                  <Icon className="h-2.5 w-2.5" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
      {/* Popular conversions — compact */}
      <div className="px-2 pb-1">
        <p className="px-2 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Convert
        </p>
        {[
          { slug: "png-to-jpg", label: "PNG→JPG", color: "#3B82F6" },
          { slug: "jpg-to-png", label: "JPG→PNG", color: "#EF4444" },
          { slug: "webp-to-jpg", label: "WebP→JPG", color: "#10B981" },
          { slug: "webp-to-png", label: "WebP→PNG", color: "#10B981" },
          { slug: "heic-to-jpg", label: "HEIC→JPG", color: "#F59E0B" },
          { slug: "heic-to-png", label: "HEIC→PNG", color: "#F59E0B" },
          { slug: "svg-to-png", label: "SVG→PNG", color: "#F97316" },
          { slug: "png-to-ico", label: "PNG→ICO", color: "#3B82F6" },
          { slug: "jpg-to-ico", label: "JPG→ICO", color: "#EF4444" },
          { slug: "gif-to-jpg", label: "GIF→JPG", color: "#EC4899" },
          { slug: "jpg-to-webp", label: "JPG→WebP", color: "#EF4444" },
          { slug: "png-to-webp", label: "PNG→WebP", color: "#3B82F6" },
          { slug: "jpg-to-avif", label: "JPG→AVIF", color: "#EF4444" },
          { slug: "png-to-avif", label: "PNG→AVIF", color: "#3B82F6" },
          { slug: "bmp-to-jpg", label: "BMP→JPG", color: "#6B7280" },
          { slug: "bmp-to-png", label: "BMP→PNG", color: "#6B7280" },
          { slug: "tiff-to-jpg", label: "TIFF→JPG", color: "#6B7280" },
          { slug: "tiff-to-png", label: "TIFF→PNG", color: "#6B7280" },
          { slug: "avif-to-jpg", label: "AVIF→JPG", color: "#8B5CF6" },
          { slug: "avif-to-png", label: "AVIF→PNG", color: "#8B5CF6" },
          { slug: "gif-to-png", label: "GIF→PNG", color: "#EC4899" },
          { slug: "gif-to-webp", label: "GIF→WebP", color: "#EC4899" },
          { slug: "jpg-to-gif", label: "JPG→GIF", color: "#EF4444" },
          { slug: "png-to-gif", label: "PNG→GIF", color: "#3B82F6" },
          { slug: "webp-to-gif", label: "WebP→GIF", color: "#10B981" },
          { slug: "jpg-to-bmp", label: "JPG→BMP", color: "#EF4444" },
          { slug: "png-to-bmp", label: "PNG→BMP", color: "#3B82F6" },
          { slug: "webp-to-bmp", label: "WebP→BMP", color: "#10B981" },
          { slug: "jpg-to-tiff", label: "JPG→TIFF", color: "#EF4444" },
          { slug: "png-to-tiff", label: "PNG→TIFF", color: "#3B82F6" },
          { slug: "webp-to-tiff", label: "WebP→TIFF", color: "#10B981" },
          { slug: "webp-to-ico", label: "WebP→ICO", color: "#10B981" },
          { slug: "webp-to-avif", label: "WebP→AVIF", color: "#10B981" },
        ].map((t) => {
          const isActive = t.slug === activeSlug;
          return (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11.5px] transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
              style={isActive ? { background: `${t.color}20`, color: t.color } : undefined}
            >
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[7px] font-black text-white"
                style={{ background: t.color }}
              >
                {t.label.split("→")[0].slice(0, 3)}
              </span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
