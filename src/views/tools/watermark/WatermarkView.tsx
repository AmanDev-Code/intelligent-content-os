"use client";

/**
 * WatermarkView — premium redesigned watermark-image tool page.
 *
 * Layout: MarketingShell + ImageToolsSidebar (sidebar handled externally).
 * Premium sections: ToolHero, TrustBadges, StepProgressBar, TrustStrip.
 * All canvas watermark rendering logic preserved from original.
 *
 * Design tokens: --tool-bg, --tool-surface, --tool-surface-dim, --tool-border,
 *   --primary, --primary-foreground, --foreground, --muted-foreground.
 * Orange gradient CTA: linear-gradient(135deg, #F97316, #F59E0B) — inline only.
 * Icons: Lucide only.
 * Motion: framer-motion for entrance animations, prefers-reduced-motion safe.
 * Font: font-sans (Poppins), font-heading (Poppins 600+), font-display (Space Grotesk).
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Download,
  RotateCcw,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stamp,
  Type,
  Image as ImageIcon,
  Upload,
  Link2,
  Layers,
  Paintbrush,
  Lock,
  Wifi,
  ArrowRight,
  Plus,
  Maximize2,
  ToggleLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar } from "@/views/tools/image-tools/ImageToolsSidebar";
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
import { ToolHero } from "@/views/tools/shared/ToolHero";
import { StepProgressBar, type Step } from "@/views/tools/shared/StepProgressBar";
import { TrustStrip, type TrustFeature } from "@/views/tools/shared/TrustStrip";
import { useImageProcessor } from "@/hooks/tools/useImageProcessor";
import { useFileDownload } from "@/hooks/tools/useFileDownload";
import { cn } from "@/lib/utils";
import type { WatermarkConfig } from "@/hooks/tools/useImageProcessor";
import type { EditTool } from "@/lib/image-edit-data";
import type { EditAlias } from "@/lib/image-edit-aliases";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  tool: EditTool;
  alias?: EditAlias;
}

type WatermarkType = "text" | "image";
type WatermarkPosition = WatermarkConfig["position"];
type UploadTab = "upload" | "url" | "samples";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HERO_TRUST_BADGES = [
  { icon: Zap, text: "No signup required" },
  { icon: Shield, text: "100% private" },
  { icon: Wifi, text: "Works offline in browser" },
  { icon: Layers, text: "Both text & image watermark" },
];

const STEPS: Step[] = [
  { number: 1, label: "Upload your image" },
  { number: 2, label: "Watermark settings" },
  { number: 3, label: "Preview" },
];

const TRUST_FEATURES: TrustFeature[] = [
  {
    icon: Paintbrush,
    title: "Fully customizable",
    description: "Adjust text, font, color, opacity, position and more.",
  },
  {
    icon: Layers,
    title: "Both text & image",
    description: "Add text or your own logo as watermark.",
  },
  {
    icon: Lock,
    title: "100% private",
    description: "Images never leave your device.",
  },
  {
    icon: Download,
    title: "Instant download",
    description: "Get your watermarked image in high quality.",
  },
];

const POSITION_OPTIONS: { label: string; value: WatermarkPosition }[] = [
  { label: "Top Left", value: "top-left" },
  { label: "Top Center", value: "top-center" },
  { label: "Top Right", value: "top-right" },
  { label: "Center", value: "center" },
  { label: "Bottom Left", value: "bottom-left" },
  { label: "Bottom Center", value: "bottom-center" },
  { label: "Bottom Right", value: "bottom-right" },
];

const POSITION_GRID: { value: WatermarkPosition; row: number; col: number }[] = [
  { value: "top-left", row: 0, col: 0 },
  { value: "top-center", row: 0, col: 1 },
  { value: "top-right", row: 0, col: 2 },
  { value: "center", row: 1, col: 1 },
  { value: "bottom-left", row: 2, col: 0 },
  { value: "bottom-center", row: 2, col: 1 },
  { value: "bottom-right", row: 2, col: 2 },
];

const SAMPLE_IMAGES = [
  "/samples/mountain-sunset.jpg",
  "/samples/city-skyline.jpg",
  "/samples/nature-forest.jpg",
  "/samples/ocean-beach.jpg",
  "/samples/portrait-woman.jpg",
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return prefersReduced;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const noMotion: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ---------------------------------------------------------------------------
// 3D Hero Illustration
// ---------------------------------------------------------------------------

function WatermarkHeroIllustration() {
  return (
    <div className="relative w-[340px] h-[280px]" aria-hidden="true">
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-3xl blur-3xl opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)",
        }}
      />
      {/* Photo card */}
      <div
        className="absolute left-4 top-6 w-[240px] h-[160px] rounded-2xl overflow-hidden border-2 shadow-2xl"
        style={{
          borderColor: "hsl(var(--tool-border))",
          background: "linear-gradient(135deg, hsl(var(--tool-surface)), hsl(var(--tool-surface-dim)))",
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
        </div>
        {/* Watermark overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-2xl font-bold opacity-40 rotate-[-20deg] select-none"
            style={{ color: "hsl(var(--primary))" }}
          >
            &copy; trndinn
          </span>
        </div>
      </div>
      {/* Floating labels */}
      <div
        className="absolute right-0 top-0 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-lg"
        style={{
          background: "linear-gradient(135deg, #F97316, #F59E0B)",
          color: "#fff",
        }}
      >
        Text
      </div>
      <div
        className="absolute right-4 top-10 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-lg border"
        style={{
          background: "hsl(var(--tool-surface))",
          borderColor: "hsl(var(--tool-border))",
          color: "hsl(var(--foreground))",
        }}
      >
        Image / Logo
      </div>
      {/* Protect your content label */}
      <div
        className="absolute right-2 bottom-10 rounded-full px-3 py-1 text-[10px] font-medium italic"
        style={{
          background: "hsl(var(--primary) / 0.1)",
          color: "hsl(var(--primary))",
          border: "1px solid hsl(var(--primary) / 0.2)",
        }}
      >
        Protect your content
      </div>
      {/* Style label */}
      <div
        className="absolute left-6 bottom-4 font-serif italic text-sm text-muted-foreground/50 select-none"
      >
        Pour watermark / Your style
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function WatermarkView({ tool, alias }: Props) {
  const { addWatermarkToImage } = useImageProcessor();
  const { downloadSingle } = useFileDownload();
  const reduced = usePrefersReducedMotion();

  const v = (variants: Variants) => (reduced ? noMotion : variants);

  // ── Core state ────────────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);

  // Upload tab
  const [activeUploadTab, setActiveUploadTab] = useState<UploadTab>("upload");

  // Watermark config
  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
  const [watermarkText, setWatermarkText] = useState("© My Name");
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState("#ffffff");
  const [position, setPosition] = useState<WatermarkPosition>("bottom-right");
  const [opacity, setOpacity] = useState(60);
  const [watermarkImageSrc, setWatermarkImageSrc] = useState<string | undefined>(undefined);
  const [addShadow, setAddShadow] = useState(false);
  const [addBackground, setAddBackground] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [tileWatermark, setTileWatermark] = useState(false);

  const isDone = result !== null;
  const hasFile = selectedFile !== null;

  // Compute active step
  const activeStep = isDone ? 3 : hasFile ? 2 : 1;

  // Generate preview URL when file is selected
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // Generate result URL when result is available
  useEffect(() => {
    if (!result) {
      setResultUrl(null);
      return;
    }
    const url = URL.createObjectURL(result);
    setResultUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  // Image dimensions state
  const [imageDims, setImageDims] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    if (!previewUrl) {
      setImageDims(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => setImageDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = previewUrl;
  }, [previewUrl]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFile(files[0] ?? null);
    setResult(null);
    setError(undefined);
    setProgress(0);
  }, []);

  const handleWatermarkImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setWatermarkImageSrc(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleAddWatermark = useCallback(async () => {
    if (!selectedFile) return;

    if (watermarkType === "text" && !watermarkText.trim()) {
      setError("Please enter watermark text.");
      return;
    }
    if (watermarkType === "image" && !watermarkImageSrc) {
      setError("Please upload a watermark image.");
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError(undefined);
    setResult(null);

    const config: WatermarkConfig = {
      type: watermarkType,
      text: watermarkType === "text" ? watermarkText : undefined,
      watermarkImage: watermarkType === "image" ? watermarkImageSrc : undefined,
      position,
      opacity: opacity / 100,
      fontSize: watermarkType === "text" ? fontSize : undefined,
      color: watermarkType === "text" ? color : undefined,
    };

    try {
      const watermarked = await addWatermarkToImage(selectedFile, config);
      setProgress(100);
      setResult(watermarked);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Watermark failed. Please check the file and try again.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [
    selectedFile,
    watermarkType,
    watermarkText,
    watermarkImageSrc,
    position,
    opacity,
    fontSize,
    color,
    addWatermarkToImage,
  ]);

  const handleDownload = useCallback(() => {
    if (result) downloadSingle(result);
  }, [result, downloadSingle]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
    setError(undefined);
    setProgress(0);
    setPreviewUrl(null);
    setResultUrl(null);
    setImageDims(null);
  }, []);

  // ── Upload tab buttons ────────────────────────────────────────────────────

  const uploadTabs: { id: UploadTab; label: string; icon: typeof Upload }[] = [
    { id: "upload", label: "Upload Image", icon: Upload },
    { id: "url", label: "Paste URL", icon: Link2 },
    { id: "samples", label: "Sample Images", icon: ImageIcon },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <MarketingShell>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <ImageToolsSidebar activeSlug={tool.slug} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <main
            id="main-content"
            className="w-full"
            style={{ background: "hsl(var(--tool-bg))" }}
            aria-label="Add Watermark tool"
          >
            {/* ─── Hero ─────────────────────────────────────── */}
            <ToolHero
              eyebrow="FREE IMAGE WATERMARK TOOL — BROWSER-BASED"
              h1Prefix="Add"
              h1Highlight="watermark"
              h1Suffix="to your image — free & easy."
              description="Protect your images with a text or image watermark. Customize position, style, opacity, and more — no signup, no upload to server."
              trustBadges={HERO_TRUST_BADGES}
            >
              <WatermarkHeroIllustration />
            </ToolHero>

            {/* ─── Tool Workspace ───────────────────────────── */}
            <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6 lg:px-8">
              {/* Step progress bar */}
              <motion.div
                variants={v(fadeUp)}
                initial="hidden"
                animate="visible"
                className="mb-6"
              >
                <StepProgressBar steps={STEPS} activeStep={activeStep} />
              </motion.div>

              {/* Main workspace card */}
              <motion.div
                variants={v(fadeUp)}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border overflow-hidden"
                style={{
                  background: "hsl(var(--tool-surface))",
                  borderColor: "hsl(var(--tool-border))",
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x" style={{ borderColor: "hsl(var(--tool-border))" }}>

                  {/* ── Column 1: Upload ──────────────────────── */}
                  <div className="lg:col-span-4 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                      >
                        1
                      </span>
                      <h2 className="text-sm font-semibold text-foreground">Upload your image</h2>
                    </div>

                    {/* Upload tabs */}
                    <div className="flex gap-1.5" role="tablist" aria-label="Upload method">
                      {uploadTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeUploadTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setActiveUploadTab(tab.id)}
                            className={cn(
                              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                              isActive
                                ? "text-white shadow-md"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                            style={
                              isActive
                                ? { background: "linear-gradient(135deg, #F97316, #F59E0B)" }
                                : { background: "hsl(var(--tool-surface-dim))" }
                            }
                          >
                            <Icon className="h-3.5 w-3.5" aria-hidden />
                            <span className="hidden sm:inline">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Dropzone */}
                    {activeUploadTab === "upload" && (
                      <ImageDropzone
                        onFilesSelected={handleFilesSelected}
                        accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff"
                        maxSizeMB={50}
                        multiple={false}
                      />
                    )}

                    {activeUploadTab === "url" && (
                      <div className="space-y-2">
                        <input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          className="w-full rounded-lg border px-3 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                          style={{ borderColor: "hsl(var(--tool-border))" }}
                          aria-label="Image URL"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Paste a direct image URL to add a watermark.
                        </p>
                      </div>
                    )}

                    {activeUploadTab === "samples" && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Try with a sample image:</p>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="h-14 w-14 shrink-0 rounded-lg border cursor-pointer transition-all hover:border-[hsl(var(--primary))] hover:scale-105"
                              style={{
                                borderColor: "hsl(var(--tool-border))",
                                background: "hsl(var(--tool-surface-dim))",
                              }}
                            >
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
                              </div>
                            </div>
                          ))}
                          <div
                            className="h-14 w-14 shrink-0 rounded-lg border border-dashed cursor-pointer flex items-center justify-center transition-all hover:border-[hsl(var(--primary))]"
                            style={{ borderColor: "hsl(var(--tool-border))" }}
                          >
                            <Plus className="h-4 w-4 text-muted-foreground" aria-hidden />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Supported formats note */}
                    <p className="text-[10px] text-muted-foreground/60">
                      Supports: JPG, PNG, JPEG, WebP, GIF, BMP, TIFF (Max 50 MB)
                    </p>
                  </div>

                  {/* ── Column 2: Watermark Settings ─────────── */}
                  <div className="lg:col-span-4 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                      >
                        2
                      </span>
                      <h2 className="text-sm font-semibold text-foreground">Watermark settings</h2>
                    </div>

                    {/* Watermark type toggle */}
                    <div
                      className="flex gap-1.5"
                      role="group"
                      aria-label="Select watermark type"
                    >
                      <button
                        type="button"
                        onClick={() => setWatermarkType("text")}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                          watermarkType !== "text" && "text-muted-foreground hover:text-foreground"
                        )}
                        style={
                          watermarkType === "text"
                            ? { background: "linear-gradient(135deg, #F97316, #F59E0B)", color: "#fff" }
                            : { background: "hsl(var(--tool-surface-dim))" }
                        }
                        aria-pressed={watermarkType === "text"}
                      >
                        <Type className="h-3.5 w-3.5" aria-hidden />
                        Text Watermark
                      </button>
                      <button
                        type="button"
                        onClick={() => setWatermarkType("image")}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                          watermarkType !== "image" && "text-muted-foreground hover:text-foreground"
                        )}
                        style={
                          watermarkType === "image"
                            ? { background: "linear-gradient(135deg, #F97316, #F59E0B)", color: "#fff" }
                            : { background: "hsl(var(--tool-surface-dim))" }
                        }
                        aria-pressed={watermarkType === "image"}
                      >
                        <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                        Image / Logo
                      </button>
                    </div>

                    {/* Text watermark settings */}
                    {watermarkType === "text" && (
                      <div className="space-y-3">
                        {/* Watermark text */}
                        <div className="space-y-1">
                          <label
                            htmlFor="watermark-text"
                            className="text-[11px] font-medium text-muted-foreground"
                          >
                            Watermark text
                          </label>
                          <input
                            id="watermark-text"
                            type="text"
                            value={watermarkText}
                            onChange={(e) => setWatermarkText(e.target.value)}
                            placeholder="© Your Name or Brand"
                            className="w-full rounded-lg border px-3 py-2 text-sm text-foreground bg-transparent placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                            style={{ borderColor: "hsl(var(--tool-border))" }}
                            aria-label="Watermark text"
                          />
                        </div>

                        {/* Font + Font size row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground">
                              Font
                            </label>
                            <select
                              className="w-full rounded-lg border px-2.5 py-2 text-xs text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                              style={{ borderColor: "hsl(var(--tool-border))" }}
                              aria-label="Font family"
                            >
                              <option>Poppins</option>
                              <option>Space Grotesk</option>
                              <option>Arial</option>
                              <option>Georgia</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground">
                              Text color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="h-8 w-10 cursor-pointer rounded border bg-transparent p-0.5 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                                style={{ borderColor: "hsl(var(--tool-border))" }}
                                aria-label="Text color picker"
                              />
                              <span className="text-xs text-muted-foreground font-mono">
                                {color}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Font size slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-medium text-muted-foreground">
                              Font size: {fontSize}px
                            </label>
                          </div>
                          <Slider
                            min={8}
                            max={120}
                            step={1}
                            value={[fontSize]}
                            onValueChange={([v]) => setFontSize(v)}
                            aria-label={`Font size: ${fontSize}px`}
                            className="[&_[role=slider]]:bg-[hsl(var(--primary))]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Image watermark upload */}
                    {watermarkType === "image" && (
                      <div className="space-y-2">
                        <label
                          htmlFor="watermark-image-upload"
                          className="text-[11px] font-medium text-muted-foreground"
                        >
                          Watermark image (PNG with transparency recommended)
                        </label>
                        <input
                          id="watermark-image-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleWatermarkImageUpload}
                          className="w-full cursor-pointer rounded-lg border px-3 py-2 text-xs text-foreground bg-transparent file:mr-3 file:rounded file:border-0 file:px-2 file:py-1 file:text-xs file:font-medium focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                          style={{
                            borderColor: "hsl(var(--tool-border))",
                          }}
                          aria-label="Upload watermark image"
                        />
                        {watermarkImageSrc && (
                          <p className="flex items-center gap-1 text-xs" style={{ color: "hsl(142.1 76.2% 36.3%)" }}>
                            <CheckCircle2 className="h-3 w-3" aria-hidden />
                            Watermark image loaded.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Opacity */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Opacity
                        </label>
                        <Badge
                          variant="secondary"
                          className="text-[10px] tabular-nums px-1.5 py-0"
                        >
                          {opacity}%
                        </Badge>
                      </div>
                      <Slider
                        min={1}
                        max={100}
                        step={1}
                        value={[opacity]}
                        onValueChange={([v]) => setOpacity(v)}
                        aria-label={`Opacity: ${opacity}%`}
                        className="[&_[role=slider]]:bg-[hsl(var(--primary))]"
                      />
                    </div>

                    {/* Position grid */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Position
                      </label>
                      <div className="grid grid-cols-3 gap-1 w-fit" role="radiogroup" aria-label="Watermark position">
                        {[0, 1, 2].map((row) =>
                          [0, 1, 2].map((col) => {
                            const cell = POSITION_GRID.find(
                              (p) => p.row === row && p.col === col
                            );
                            if (!cell) {
                              // Empty cells (row 1 col 0 and row 1 col 2)
                              return (
                                <div
                                  key={`${row}-${col}`}
                                  className="h-6 w-6 rounded"
                                  style={{ background: "hsl(var(--tool-surface-dim))" }}
                                />
                              );
                            }
                            const isActive = position === cell.value;
                            return (
                              <button
                                key={cell.value}
                                role="radio"
                                aria-checked={isActive}
                                aria-label={POSITION_OPTIONS.find(o => o.value === cell.value)?.label}
                                onClick={() => setPosition(cell.value)}
                                className={cn(
                                  "h-6 w-6 rounded transition-all",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                                )}
                                style={
                                  isActive
                                    ? { background: "linear-gradient(135deg, #F97316, #F59E0B)" }
                                    : { background: "hsl(var(--tool-surface-dim))", border: "1px solid hsl(var(--tool-border))" }
                                }
                              />
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Toggle options: Shadow, Background, Rotate, Tile */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="shadow-toggle" className="text-[11px] text-muted-foreground cursor-pointer">
                          Add shadow
                        </Label>
                        <Switch
                          id="shadow-toggle"
                          checked={addShadow}
                          onCheckedChange={setAddShadow}
                          aria-label="Add shadow to watermark"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="bg-toggle" className="text-[11px] text-muted-foreground cursor-pointer">
                          Add background
                        </Label>
                        <Switch
                          id="bg-toggle"
                          checked={addBackground}
                          onCheckedChange={setAddBackground}
                          aria-label="Add background to watermark"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="rotate-select" className="text-[11px] text-muted-foreground">
                          Rotate
                        </Label>
                        <select
                          id="rotate-select"
                          value={rotation}
                          onChange={(e) => setRotation(Number(e.target.value))}
                          className="rounded border px-2 py-1 text-xs text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                          style={{ borderColor: "hsl(var(--tool-border))" }}
                          aria-label="Watermark rotation"
                        >
                          <option value={0}>0°</option>
                          <option value={-45}>-45°</option>
                          <option value={-90}>-90°</option>
                          <option value={45}>45°</option>
                          <option value={90}>90°</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="tile-toggle" className="text-[11px] text-muted-foreground cursor-pointer">
                          Tile watermark
                        </Label>
                        <Switch
                          id="tile-toggle"
                          checked={tileWatermark}
                          onCheckedChange={setTileWatermark}
                          aria-label="Tile watermark across image"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Column 3: Preview ─────────────────────── */}
                  <div className="lg:col-span-4 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                        >
                          3
                        </span>
                        <h2 className="text-sm font-semibold text-foreground">Preview</h2>
                      </div>
                      {(previewUrl || resultUrl) && (
                        <button
                          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Fit to screen"
                        >
                          <Maximize2 className="h-3 w-3" aria-hidden />
                          Fit to screen
                        </button>
                      )}
                    </div>

                    {/* Preview area */}
                    <div
                      className="relative aspect-video w-full rounded-xl border overflow-hidden flex items-center justify-center"
                      style={{
                        background: "hsl(var(--tool-surface-dim))",
                        borderColor: "hsl(var(--tool-border))",
                      }}
                    >
                      {resultUrl ? (
                        <img
                          src={resultUrl}
                          alt="Watermarked image preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Original image preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                          <ImageIcon className="h-10 w-10" aria-hidden />
                          <p className="text-xs">Upload an image to preview</p>
                        </div>
                      )}

                      {/* Processing overlay */}
                      {isProcessing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 backdrop-blur-sm">
                          <span
                            className="h-8 w-8 animate-spin rounded-full border-3 border-current border-t-transparent"
                            style={{ color: "#F97316" }}
                            aria-hidden
                          />
                          <p className="text-xs font-medium text-white">
                            Adding watermark… {progress}%
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Sample strip below preview */}
                    {previewUrl && (
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="h-12 w-12 shrink-0 rounded-lg border cursor-pointer overflow-hidden transition-all hover:border-[hsl(var(--primary))]"
                            style={{ borderColor: "hsl(var(--tool-border))" }}
                          >
                            <div
                              className="w-full h-full"
                              style={{
                                background: "hsl(var(--tool-surface-dim))",
                              }}
                            >
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-muted-foreground/20" aria-hidden />
                              </div>
                            </div>
                          </div>
                        ))}
                        <div
                          className="h-12 w-12 shrink-0 rounded-lg border border-dashed flex items-center justify-center cursor-pointer transition-all hover:border-[hsl(var(--primary))]"
                          style={{ borderColor: "hsl(var(--tool-border))" }}
                        >
                          <Plus className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                        </div>
                      </div>
                    )}

                    {/* Image info */}
                    {hasFile && (
                      <div className="space-y-1 text-[11px] text-muted-foreground">
                        {imageDims && (
                          <p>
                            Original: {imageDims.w} &times; {imageDims.h}
                          </p>
                        )}
                        {result && imageDims && (
                          <p>
                            Output: {imageDims.w} &times; {imageDims.h} &bull;{" "}
                            {selectedFile?.type.split("/")[1]?.toUpperCase() ?? "JPG"} &bull;{" "}
                            ~{formatBytes(result.size)}
                          </p>
                        )}
                        {!result && selectedFile && (
                          <p>
                            {selectedFile.name} &bull; {formatBytes(selectedFile.size)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Error */}
                    {error && (
                      <Alert variant="destructive" role="alert" aria-live="assertive">
                        <AlertCircle className="h-4 w-4" aria-hidden />
                        <AlertDescription className="text-xs">{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* CTA button */}
                    {isDone ? (
                      <button
                        onClick={handleDownload}
                        className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                        style={{
                          background: "linear-gradient(135deg, #F97316, #F59E0B)",
                        }}
                        aria-label="Download watermarked image"
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        Download Image
                        <ArrowRight className="h-4 w-4 ml-1" aria-hidden />
                      </button>
                    ) : (
                      <button
                        onClick={handleAddWatermark}
                        disabled={!hasFile || isProcessing}
                        className={cn(
                          "flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                          (!hasFile || isProcessing) && "opacity-50 cursor-not-allowed"
                        )}
                        style={{
                          background: "linear-gradient(135deg, #F97316, #F59E0B)",
                        }}
                        aria-label="Add watermark to image"
                      >
                        {isProcessing ? (
                          <>
                            <span
                              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                              aria-hidden
                            />
                            Adding watermark…
                          </>
                        ) : (
                          <>
                            <Stamp className="h-4 w-4" aria-hidden />
                            Add Watermark
                            <ArrowRight className="h-4 w-4 ml-1" aria-hidden />
                          </>
                        )}
                      </button>
                    )}

                    {/* Reset link */}
                    {(isDone || hasFile) && (
                      <button
                        onClick={handleReset}
                        disabled={isProcessing}
                        className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                        aria-label="Reset and start over"
                      >
                        <RotateCcw className="inline h-3 w-3 mr-1" aria-hidden />
                        Start over
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* ─── Trust Strip ─────────────────────────────── */}
              <motion.div
                variants={v(fadeUp)}
                initial="hidden"
                animate="visible"
                className="mt-10"
              >
                <TrustStrip features={TRUST_FEATURES} />
              </motion.div>

              {/* ─── SEO Footer ──────────────────────────────── */}
              <Separator className="my-10" />
              <p className="text-xs leading-relaxed text-muted-foreground/60 max-w-2xl">
                Trndinn&apos;s Add Watermark tool is a free, browser-based tool.
                All processing happens locally on your device — no files are
                uploaded to any server. No signup, no watermark, no usage limit.
              </p>
            </div>
          </main>
        </div>
      </div>
    </MarketingShell>
  );
}
