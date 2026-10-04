"use client";

/**
 * FaviconGeneratorView — premium redesign matching reference image 12.
 *
 * Layout: MarketingShell > flex > ImageToolsSidebar + main content
 * Sections: ToolHero with 3D illustration, TrustBadges, StepProgressBar,
 *   3-column workspace (upload / preview / advanced options),
 *   orange CTA, result grid, TrustStrip, "What's included", "Works everywhere".
 *
 * Shadcn primitives: Card, CardContent, Button, Progress, Alert,
 *   AlertDescription, Checkbox, Label, RadioGroup, RadioGroupItem, Separator.
 * Design tokens: --tool-bg, --tool-surface, --tool-surface-dim, --tool-border,
 *   --primary, --foreground, --muted-foreground.
 * Icons: Lucide only.
 * Motion: framer-motion, prefers-reduced-motion safe.
 * Processing: Canvas API in browser — zero server upload.
 */

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowRight,
  Upload,
  Zap,
  Lock,
  Monitor,
  Globe,
  FileCode2,
  Smartphone,
  Apple,
  Image as ImageIcon,
  Crop,
  Sparkles,
  Chrome,
  ChevronUp,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Plus,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
import { TrustStrip, type TrustFeature } from "@/views/tools/shared/TrustStrip";
import { TrustBadges } from "@/views/tools/shared/TrustBadges";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar, SidebarWrapper } from "@/views/tools/image-tools/ImageToolsSidebar";
import { useFileDownload } from "@/hooks/tools/useFileDownload";
import { cn } from "@/lib/utils";
import type { UtilityTool } from "@/lib/image-utility-data";
import type { UtilityAlias } from "@/lib/image-utility-aliases";
import type { TrustBadge } from "@/views/tools/shared/TrustBadges";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  tool: UtilityTool;
  alias?: UtilityAlias;
}

// ---------------------------------------------------------------------------
// Favicon size config
// ---------------------------------------------------------------------------

interface FaviconSize {
  size: number;
  name: string;
  label: string;
  description: string;
}

const ALL_FAVICON_SIZES: FaviconSize[] = [
  { size: 16, name: "favicon-16x16.png", label: "16 × 16", description: "favicon.ico" },
  { size: 32, name: "favicon-32x32.png", label: "32 × 32", description: "" },
  { size: 48, name: "favicon-48x48.png", label: "48 × 48", description: "" },
  { size: 180, name: "apple-touch-icon.png", label: "180 × 180", description: "Apple Touch" },
  { size: 192, name: "android-chrome-192x192.png", label: "192 × 192", description: "Android Chrome" },
  { size: 512, name: "android-chrome-512x512.png", label: "512 × 512", description: "Android Chrome" },
];

const WEBMANIFEST_CONTENT = JSON.stringify(
  {
    name: "My App",
    short_name: "App",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  },
  null,
  2
);

// ---------------------------------------------------------------------------
// Canvas resize helper
// ---------------------------------------------------------------------------

async function resizeToCanvas(
  file: File,
  size: number,
  transparent: boolean = false
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        URL.revokeObjectURL(objectUrl);
        return;
      }
      if (!transparent) {
        // Fill with white background for non-transparent mode
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
      }
      // transparent mode: canvas is already transparent by default
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) resolve(blob);
          else reject(new Error(`Failed to generate ${size}x${size} PNG`));
        },
        "image/png",
        1.0
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for resizing"));
    };
    img.src = objectUrl;
  });
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const TRUST_BADGES: TrustBadge[] = [
  { icon: Sparkles, text: "No signup required" },
  { icon: Lock, text: "100% private" },
  { icon: Package, text: "All sizes + webmanifest" },
  { icon: Globe, text: "Works offline" },
];

const TRUST_FEATURES: TrustFeature[] = [
  { icon: Zap, title: "Instant generation", description: "All sizes in seconds" },
  { icon: Lock, title: "100% private", description: "Files never leave your browser" },
  { icon: Monitor, title: "Browser-based", description: "No installation needed" },
  { icon: Globe, title: "Perfect for all platforms", description: "Windows, macOS, Android, iOS" },
];

const ZIP_CONTENTS = [
  { icon: ImageIcon, name: "favicon.ico", detail: "16x16, 32x32, 48x48 (combined)" },
  { icon: Apple, name: "apple-touch-icon.png", detail: "180x180 (iOS)" },
  { icon: Smartphone, name: "android-chrome-192x192.png", detail: "192x192 (Android)" },
  { icon: Smartphone, name: "android-chrome-512x512.png", detail: "512x512 (Android)" },
  { icon: FileCode2, name: "site.webmanifest", detail: "PWA manifest file" },
];

const BROWSER_PLATFORMS = [
  { label: "Chrome", icon: Chrome },
  { label: "Edge", icon: Globe },
  { label: "Safari", icon: Globe },
  { label: "Firefox", icon: Globe },
  { label: "Windows", icon: Monitor },
  { label: "macOS", icon: Apple },
  { label: "Android", icon: Smartphone },
  { label: "iOS", icon: Smartphone },
];

const SOCIAL_ICONS = [
  { label: "Instagram", icon: Instagram, color: "#E4405F" },
  { label: "X", icon: Twitter, color: "#1DA1F2" },
  { label: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  { label: "YouTube", icon: Youtube, color: "#FF0000" },
];

// ---------------------------------------------------------------------------
// 3D Illustration for hero
// ---------------------------------------------------------------------------

function FaviconHeroIllustration() {
  // A small favicon "logo" (mountain + sun) reused at every size
  const Logo = ({ className }: { className?: string }) => (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: "linear-gradient(160deg, #7C6FF0 0%, #4F46E5 55%, #312E81 100%)" }}
    >
      {/* sun */}
      <div
        className="absolute rounded-full"
        style={{ width: "26%", height: "26%", right: "16%", top: "16%", background: "linear-gradient(135deg, #FDBA74, #F97316)" }}
      />
      {/* mountains */}
      <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        <polygon points="0,40 14,20 26,40" fill="#1E1B4B" opacity="0.9" />
        <polygon points="16,40 28,16 40,40" fill="#312E81" opacity="0.95" />
      </svg>
    </div>
  );

  const sizeCard = (label: string, boxH: string, key: string, delay: number) => (
    <motion.div
      key={key}
      className="flex flex-col items-center gap-1"
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
    >
      <div
        className={cn("rounded-lg border border-[hsl(var(--tool-border))] shadow-lg shadow-black/30", boxH)}
        style={{ overflow: "hidden" }}
      >
        <Logo className="h-full w-full" />
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
    </motion.div>
  );

  return (
    <div className="relative h-[300px] w-[380px] sm:h-[340px] sm:w-[440px]" aria-hidden="true">
      {/* Warm glow behind */}
      <div
        className="absolute inset-0 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle at 60% 40%, hsl(var(--primary) / 0.35) 0%, transparent 70%)" }}
      />

      {/* Source photo card (left) */}
      <motion.div
        className="absolute left-[2%] top-[22%] h-24 w-24 rounded-2xl border-2 shadow-xl shadow-black/40"
        style={{ borderColor: "#8B5CF680", overflow: "hidden", transform: "rotate(-8deg)" }}
        initial={{ opacity: 0, x: -24, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.55, ease: "easeOut" }}
      >
        <Logo className="h-full w-full" />
      </motion.div>

      {/* Orange swoosh arrow (source → ICO) */}
      <motion.svg
        className="absolute left-[27%] top-[24%] h-16 w-24"
        viewBox="0 0 100 60"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <defs>
          <linearGradient id="favSwoosh" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <path d="M4 46 Q52 4 92 26" stroke="url(#favSwoosh)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M84 16 L94 26 L82 32" stroke="url(#favSwoosh)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.svg>

      {/* ICO card (big, glowing) */}
      <motion.div
        className="absolute left-[40%] top-[6%] flex flex-col items-center gap-1.5"
        initial={{ opacity: 0, y: 20, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.45, duration: 0.55, ease: "easeOut" }}
      >
        <div
          className="h-20 w-20 rounded-2xl border-2"
          style={{
            borderColor: "#F9731699",
            boxShadow: "0 0 30px #F9731650, 0 0 60px #F9731625",
            overflow: "hidden",
          }}
        >
          <Logo className="h-full w-full" />
        </div>
        <span className="text-xs font-bold tracking-wider text-foreground">ICO</span>
      </motion.div>

      {/* Top row: 16 / 32 / 48 px */}
      <div className="absolute right-[2%] top-[6%] flex items-start gap-3">
        {sizeCard("16px", "h-8 w-8", "16", 0.7)}
        {sizeCard("32px", "h-9 w-9", "32", 0.78)}
        {sizeCard("48px", "h-10 w-10", "48", 0.86)}
      </div>

      {/* Bottom row: 180 / 192 / 512 px */}
      <div className="absolute left-[38%] bottom-[10%] flex items-end gap-3">
        {sizeCard("180px", "h-9 w-9", "180", 0.94)}
        {sizeCard("192px", "h-10 w-10", "192", 1.02)}
        {sizeCard("512px", "h-12 w-12", "512", 1.1)}
      </div>

      {/* Webmanifest code card (right) */}
      <motion.div
        className="absolute right-[1%] top-[40%] flex flex-col items-center gap-1 rounded-xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] px-3 py-2.5 shadow-lg shadow-black/30"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.0, duration: 0.4 }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}
        >
          <span className="font-mono text-sm font-bold text-white">&lt;/&gt;</span>
        </div>
        <span className="text-[9px] font-medium text-muted-foreground">site.webmanifest</span>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabbed upload header
// ---------------------------------------------------------------------------

function UploadTabs({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: "upload", label: "Upload Image", icon: Upload },
    { id: "url", label: "Enter URL", icon: Globe },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-[hsl(var(--tool-border))] pb-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors",
              "border-b-2 -mb-px",
              isActive
                ? "border-[hsl(var(--primary))] text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            style={isActive ? { borderBottomColor: "#F97316" } : undefined}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generated file preview card
// ---------------------------------------------------------------------------

function GeneratedFileCard({ size, name, previewUrl }: { size: number; name: string; previewUrl?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className={cn(
          "flex items-center justify-center rounded-lg",
          "bg-[hsl(var(--tool-surface-dim))] border border-[hsl(var(--tool-border))]",
          "h-16 w-16 sm:h-20 sm:w-20 overflow-hidden"
        )}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={`${size}x${size} favicon preview`}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <ImageIcon className="h-6 w-6 text-muted-foreground/50" aria-hidden="true" />
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground">{size} x {size}</p>
        <p className="text-[10px] text-muted-foreground">{name}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FaviconGeneratorView({ tool, alias }: Props) {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [generatedPreviews, setGeneratedPreviews] = useState<Map<number, string>>(new Map());

  // Advanced options state
  const [enabledSizes, setEnabledSizes] = useState<Set<number>>(
    new Set(ALL_FAVICON_SIZES.map((s) => s.size))
  );
  const [bgOption, setBgOption] = useState<"original" | "transparent">("original");

  // URL input state
  const [urlInput, setUrlInput] = useState("");

  const { downloadAsZip } = useFileDownload();

  const eyebrow = alias?.eyebrow ?? "FREE FAVICON GENERATOR";
  const h1Prefix = alias?.h1Prefix ?? "Favicon generator";
  const h1Highlight = alias?.h1Highlight ?? "— all sizes, one click.";
  const h1Suffix = alias?.h1Suffix ?? "";
  const heroDescription =
    "Upload any image and get a complete favicon package: favicon.ico (16/32/48px), apple-touch-icon (180px), android-chrome (192px and 512px), and a site.webmanifest — all in a single ZIP download.";

  const selectedSizes = useMemo(
    () => ALL_FAVICON_SIZES.filter((s) => enabledSizes.has(s.size)),
    [enabledSizes]
  );

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSourceFile(file);
    setIsDone(false);
    setError("");
    setProgress(0);
    setGeneratedPreviews(new Map());

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleLoadUrl = useCallback(async () => {
    const url = urlInput.trim();
    if (!url) return;
    setError("");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch image");
      const blob = await res.blob();
      if (!blob.type.startsWith("image/"))
        throw new Error("URL does not point to an image");
      const name = url.split("/").pop()?.split("?")[0] || "image.png";
      const file = new File([blob], name, { type: blob.type });
      handleFilesSelected([file]);
      setActiveTab("upload");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to load image from URL. Make sure it's a direct image link."
      );
    }
  }, [urlInput, handleFilesSelected]);

  const toggleSize = useCallback((size: number) => {
    setEnabledSizes((prev) => {
      const next = new Set(prev);
      if (next.has(size)) {
        if (next.size > 1) next.delete(size);
      } else {
        next.add(size);
      }
      return next;
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!sourceFile || selectedSizes.length === 0) return;
    setError("");
    setIsProcessing(true);
    setProgress(0);

    try {
      const files: File[] = [];
      const total = selectedSizes.length;
      const previews = new Map<number, string>();

      const useTransparent = bgOption === "transparent";
      for (let i = 0; i < selectedSizes.length; i++) {
        const { size, name } = selectedSizes[i];
        const blob = await resizeToCanvas(sourceFile, size, useTransparent);
        files.push(new File([blob], name, { type: "image/png" }));
        // Store preview URL for result grid
        previews.set(size, URL.createObjectURL(blob));
        setProgress(Math.round(((i + 1) / total) * 90));
      }

      // Add site.webmanifest
      const manifestBlob = new Blob([WEBMANIFEST_CONTENT], {
        type: "application/manifest+json",
      });
      files.push(new File([manifestBlob], "site.webmanifest", { type: "application/manifest+json" }));

      setProgress(95);
      setGeneratedPreviews(previews);
      await downloadAsZip(files, "favicon-package");
      setProgress(100);
      setIsDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate favicon package. Please try a square PNG image."
      );
    } finally {
      setIsProcessing(false);
    }
  }, [sourceFile, selectedSizes, bgOption, downloadAsZip]);

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    generatedPreviews.forEach((url) => URL.revokeObjectURL(url));
    setSourceFile(null);
    setPreviewUrl("");
    setIsDone(false);
    setError("");
    setProgress(0);
    setGeneratedPreviews(new Map());
    setEnabledSizes(new Set(ALL_FAVICON_SIZES.map((s) => s.size)));
  }, [previewUrl, generatedPreviews]);

  return (
    <MarketingShell>
      <SidebarWrapper>
        {/* Sidebar */}
        <ImageToolsSidebar activeSlug="favicon-generator" />

        {/* Main content */}
        <div className="flex-1 min-w-0 overflow-x-hidden bg-[hsl(var(--tool-bg))]">
          {/* ── Hero (converter skeleton: left text column + absolute-right illustration) ── */}
          <section
            className="relative overflow-x-clip px-6 pb-8 pt-8 lg:px-10 lg:pt-10"
            style={{
              background: "linear-gradient(180deg, hsl(var(--tool-surface)) 0%, hsl(var(--tool-bg)) 100%)",
            }}
          >
            {/* 3D illustration — absolute right on desktop */}
            <div
              className="pointer-events-none absolute right-0 top-0 hidden h-full w-[46%] items-center justify-center pr-6 lg:flex"
              aria-hidden="true"
            >
              <FaviconHeroIllustration />
            </div>

            {/* Left column */}
            <div className="relative z-10 max-w-[680px]">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))]">
                {eyebrow}
              </span>
              <h1 className="mt-3 font-display text-[clamp(1.75rem,4.5vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-foreground">
                {h1Prefix}{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, #F97316, #F59E0B)" }}
                >
                  {h1Highlight}
                </span>
                {h1Suffix ? <> {h1Suffix}</> : null}
              </h1>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                {heroDescription}
              </p>
              <div className="mt-5">
                <TrustBadges badges={TRUST_BADGES} className="sm:justify-start" />
              </div>

              {/* Illustration on mobile (below text) */}
              <div className="mt-8 flex justify-center lg:hidden">
                <FaviconHeroIllustration />
              </div>
            </div>
          </section>

          <main
            id="main-content"
            className="px-6 pb-16 pt-6 lg:px-10 space-y-10"
            aria-label="Favicon Generator tool"
          >
            {/* ── Tool Workspace ── */}
            <Card
              className={cn(
                "overflow-hidden bg-[hsl(var(--tool-surface))]"
              )}
              style={{
                border: "1px solid #F9731640",
                boxShadow: "0 0 40px #F9731618, 0 0 80px #8B5CF610",
              }}
            >
              <CardContent className="p-0">
                {/* Upload tabs header */}
                <div className="px-4 pt-4 sm:px-6 sm:pt-6">
                  <UploadTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {/* 3-column workspace */}
                <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-3">
                  {/* Left: Upload / Dropzone */}
                  <div className="space-y-4">
                    {activeTab === "upload" && (
                      <ImageDropzone
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        multiple={false}
                        maxSizeMB={10}
                        onFilesSelected={handleFilesSelected}
                        disabled={isProcessing}
                      />
                    )}
                    {activeTab === "url" && (
                      <div className="space-y-3">
                        <label htmlFor="favicon-url-input" className="text-sm font-medium text-foreground">
                          Image URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="favicon-url-input"
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLoadUrl()}
                            placeholder="https://example.com/logo.png"
                            className={cn(
                              "w-full rounded-lg border border-[hsl(var(--tool-border))] px-4 py-3",
                              "bg-[hsl(var(--tool-surface-dim))] text-foreground text-sm",
                              "placeholder:text-muted-foreground/60",
                              "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                            )}
                          />
                          <Button
                            size="sm"
                            onClick={handleLoadUrl}
                            disabled={!urlInput.trim()}
                            className="shrink-0 self-end"
                            aria-label="Load image from URL"
                          >
                            Load
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Paste a direct image URL to generate favicons from.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Center: Preview (Square crop) */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Preview <span className="text-muted-foreground font-normal">(Square crop)</span>
                    </h3>
                    <div
                      className={cn(
                        "relative flex items-center justify-center rounded-xl overflow-hidden",
                        "border border-[hsl(var(--tool-border))]",
                        "bg-[hsl(var(--tool-surface-dim))]",
                        "aspect-square"
                      )}
                    >
                      {previewUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrl}
                            alt="Favicon source preview"
                            className="h-full w-full object-cover"
                          />
                          {/* Crop overlay corners */}
                          <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-lg pointer-events-none" />
                          <div className="absolute top-3 left-3 h-3 w-3 border-t-2 border-l-2 border-white/80 rounded-tl pointer-events-none" />
                          <div className="absolute top-3 right-3 h-3 w-3 border-t-2 border-r-2 border-white/80 rounded-tr pointer-events-none" />
                          <div className="absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2 border-white/80 rounded-bl pointer-events-none" />
                          <div className="absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-white/80 rounded-br pointer-events-none" />
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/50 p-8">
                          <Crop className="h-8 w-8" aria-hidden="true" />
                          <p className="text-xs text-center">Upload an image to preview</p>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right: Advanced Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Advanced Options</h3>
                      <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>

                    {/* Icon Sizes */}
                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Icon Sizes
                      </p>
                      <div className="space-y-2">
                        {ALL_FAVICON_SIZES.map(({ size, label, description }) => (
                          <div key={size} className="flex items-center gap-2.5">
                            <Checkbox
                              id={`size-${size}`}
                              checked={enabledSizes.has(size)}
                              onCheckedChange={() => toggleSize(size)}
                              className="border-[hsl(var(--tool-border))] data-[state=checked]:bg-[hsl(var(--primary))] data-[state=checked]:border-[hsl(var(--primary))]"
                            />
                            <Label
                              htmlFor={`size-${size}`}
                              className="text-xs text-foreground cursor-pointer"
                            >
                              {label}
                              {description && (
                                <span className="text-muted-foreground"> ({description})</span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-[hsl(var(--tool-border))]" />

                    {/* Background */}
                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Background
                      </p>
                      <div className="space-y-2">
                        {(
                          [
                            { id: "original", label: "Keep original" },
                            { id: "transparent", label: "Make transparent" },
                          ] as const
                        ).map(({ id, label }) => (
                          <label key={id} className="flex items-center gap-2.5 cursor-pointer">
                            <div
                              className={cn(
                                "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors",
                                bgOption === id
                                  ? "border-[hsl(var(--primary))]"
                                  : "border-[hsl(var(--tool-border))]"
                              )}
                              onClick={() => setBgOption(id)}
                              role="radio"
                              aria-checked={bgOption === id}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === " " || e.key === "Enter") setBgOption(id);
                              }}
                            >
                              {bgOption === id && (
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                                />
                              )}
                            </div>
                            <span className="text-xs text-foreground">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="px-4 pb-4 sm:px-6">
                    <Alert variant="destructive" role="alert" aria-live="assertive">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Progress */}
                {isProcessing && (
                  <div className="px-4 pb-4 sm:px-6" aria-live="polite" aria-busy="true">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Generating sizes...</span>
                        <span className="font-medium text-foreground">{progress}%</span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-2"
                        aria-label={`Generation progress: ${progress}%`}
                      />
                    </div>
                  </div>
                )}

                {/* Big orange CTA */}
                <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                  <button
                    onClick={handleGenerate}
                    disabled={!sourceFile || isProcessing || selectedSizes.length === 0}
                    className={cn(
                      "w-full rounded-xl py-4 px-6 text-base font-bold text-white",
                      "flex items-center justify-center gap-2",
                      "transition-all duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.01]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2"
                    )}
                    style={{
                      background: "linear-gradient(135deg, #F97316, #F59E0B)",
                    }}
                    aria-label="Generate and download favicon package"
                  >
                    {isProcessing ? (
                      <>
                        <span
                          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                          aria-hidden="true"
                        />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Favicon Package
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* ── Conversion Result (Preview) ── */}
            {isDone && !isProcessing && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                aria-label="Conversion result"
                className={cn(
                  "rounded-xl border border-[hsl(var(--tool-border))] p-4 sm:p-6",
                  "bg-[hsl(var(--tool-surface))]"
                )}
              >
                <h2 className="text-base font-semibold text-foreground mb-4">
                  Conversion Result (Preview)
                </h2>

                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  {/* Left: status + buttons */}
                  <div className="space-y-4 sm:w-[240px] shrink-0">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className="h-6 w-6 shrink-0 text-emerald-500"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          Your favicon package is ready!
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Download all sizes and files in a single ZIP.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleGenerate}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-lg py-2.5 px-4",
                          "text-sm font-bold text-white",
                          "hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                        )}
                        style={{
                          background: "linear-gradient(135deg, #F97316, #F59E0B)",
                        }}
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download All Files (ZIP)
                      </button>
                    </div>
                  </div>

                  {/* Right: generated files grid */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      Generated Files
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {selectedSizes.map(({ size, name }) => (
                        <GeneratedFileCard
                          key={size}
                          size={size}
                          name={name}
                          previewUrl={generatedPreviews.get(size)}
                        />
                      ))}
                      {/* Webmanifest card */}
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div
                          className={cn(
                            "flex items-center justify-center rounded-lg",
                            "bg-[hsl(var(--tool-surface-dim))] border border-[hsl(var(--tool-border))]",
                            "h-16 w-16 sm:h-20 sm:w-20"
                          )}
                        >
                          <FileCode2 className="h-6 w-6 text-muted-foreground/50" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">manifest</p>
                          <p className="text-[10px] text-muted-foreground">site.webmanifest</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reset button */}
                <div className="mt-4 pt-4 border-t border-[hsl(var(--tool-border))]">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="border-[hsl(var(--tool-border))] text-foreground"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                    Start over with a new image
                  </Button>
                </div>
              </motion.section>
            )}

            {/* ── Trust Strip ── */}
            <TrustStrip features={TRUST_FEATURES} />

            {/* ── What's included + Works everywhere ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* What's included in the ZIP? */}
              <section
                aria-labelledby="zip-contents-heading"
                className={cn(
                  "rounded-xl border border-[hsl(var(--tool-border))] p-6",
                  "bg-[hsl(var(--tool-surface))]"
                )}
              >
                <h2
                  id="zip-contents-heading"
                  className="text-lg font-bold text-foreground mb-1"
                >
                  What&apos;s included in the ZIP?
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Everything you need for your website and apps.
                </p>

                <ul className="space-y-3">
                  {ZIP_CONTENTS.map(({ icon: Icon, name, detail }) => (
                    <li key={name} className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          "bg-[hsl(var(--tool-surface-dim))]"
                        )}
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">{detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Works everywhere */}
              <section
                aria-labelledby="works-everywhere-heading"
                className={cn(
                  "rounded-xl border border-[hsl(var(--tool-border))] p-6",
                  "bg-[hsl(var(--tool-surface))]"
                )}
              >
                <h2
                  id="works-everywhere-heading"
                  className="text-lg font-bold text-foreground mb-1"
                >
                  Works everywhere
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Use your favicon across all platforms.
                </p>

                <div className="grid grid-cols-4 gap-4">
                  {BROWSER_PLATFORMS.map(({ label, icon: Icon }) => (
                    <div key={label} className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl",
                          "bg-[hsl(var(--tool-surface-dim))]",
                          "border border-[hsl(var(--tool-border))]"
                        )}
                      >
                        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ── AEO: What is a Favicon? ── */}
            <section
              aria-labelledby="what-is-favicon-heading"
              className={cn(
                "rounded-xl border border-[hsl(var(--tool-border))] p-6",
                "bg-[hsl(var(--tool-surface))]"
              )}
            >
              <h2 id="what-is-favicon-heading" className="text-lg font-bold text-foreground mb-4">
                What is a favicon?
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                A favicon (short for &quot;favorite icon&quot;) is the small icon displayed in browser tabs, bookmarks, history lists, and mobile home screens next to your site&apos;s name. Modern browsers expect multiple sizes — from 16x16 for tab icons up to 512x512 for Android splash screens. A complete favicon package includes an ICO file (multi-size), an Apple Touch Icon (180x180), Android Chrome icons (192 and 512), and a site.webmanifest that tells browsers where to find them.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                According to HTTP Archive data, over 60% of the top one million websites serve a properly configured favicon [HTTP Archive, 2024]. Sites without one show a generic globe or blank icon, which reduces perceived credibility and makes tabs harder to identify.
              </p>
              <h3 className="text-base font-semibold text-foreground mt-6 mb-3">Frequently asked questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">What size should a favicon be?</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">You need multiple sizes: 16x16 and 32x32 for browser tabs, 48x48 for Windows shortcuts, 180x180 for iOS, and 192x192 plus 512x512 for Android. Trndinn generates all of these from a single image.</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Do I need a site.webmanifest file?</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Yes, if you want your site to work as a Progressive Web App (PWA) or display correctly on Android home screens. The manifest tells the browser which icons to use, your app name, and theme colors. Trndinn includes one in every download.</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Can I use a transparent background for my favicon?</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Yes. Select &quot;Make transparent&quot; in the Background options before generating. Transparent favicons work well for logos and icons but may look off for photos — test in a browser tab to confirm it looks right.</p>
                </div>
              </div>
            </section>

            {/* ── Need more? CTA ── */}
            <section
              aria-label="Try Trndinn"
              className={cn(
                "flex flex-col gap-6 rounded-xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8",
                "border border-[hsl(var(--tool-border))]"
              )}
              style={{
                background: "linear-gradient(135deg, hsl(var(--tool-surface)) 0%, hsl(var(--tool-surface-dim)) 100%)",
              }}
            >
              {/* Left: text + purple CTA */}
              <div className="max-w-md">
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                  Need more?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create social media icons, OG images, and brand assets with AI.
                </p>
                <div className="mt-5">
                  <button
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-6 py-3",
                      "text-sm font-bold text-white",
                      "hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                    )}
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
                    }}
                  >
                    Try Trndinn
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Right: social icons */}
              <div className="flex items-center gap-3">
                {SOCIAL_ICONS.map(({ label, icon: Icon, color }) => (
                  <div
                    key={label}
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      "border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))]"
                    )}
                    title={label}
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                ))}
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    "border border-dashed border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))]",
                    "text-muted-foreground/50"
                  )}
                  aria-hidden="true"
                >
                  <Plus className="h-5 w-5" />
                </div>
              </div>
            </section>

            {/* ── How to install your favicon ── */}
            <section aria-labelledby="install-heading">
              <h2
                id="install-heading"
                className="mb-6 text-lg font-bold text-foreground"
              >
                How to install your favicon
              </h2>
              <ol className="space-y-4" aria-label="Installation steps">
                {[
                  {
                    step: "1",
                    title: "Place files in your site root",
                    description: "Copy all files from the ZIP into the root directory of your website (the same folder as index.html).",
                  },
                  {
                    step: "2",
                    title: "Add tags to your <head>",
                    description: `Add: <link rel="icon" href="/favicon.ico"> and <link rel="apple-touch-icon" href="/apple-touch-icon.png"> and <link rel="manifest" href="/site.webmanifest">`,
                  },
                  {
                    step: "3",
                    title: "Update site.webmanifest",
                    description: "Edit site.webmanifest to set your app's name and theme_color to match your brand.",
                  },
                ].map(({ step, title, description }) => (
                  <li
                    key={step}
                    className={cn(
                      "flex gap-4 rounded-xl p-4 sm:p-6",
                      "border border-[hsl(var(--tool-border))]",
                      "bg-[hsl(var(--tool-surface))]"
                    )}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                      aria-hidden="true"
                    >
                      {step}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground font-mono">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* ── SEO footer ── */}
            <p className="text-xs leading-relaxed text-muted-foreground/70">
              Trndinn&apos;s Favicon Generator is a free, browser-based tool. All
              processing happens locally on your device — no files are
              uploaded to any server. No signup, no watermark, no usage limit.
            </p>
          </main>
        </div>
      </SidebarWrapper>
    </MarketingShell>
  );
}
