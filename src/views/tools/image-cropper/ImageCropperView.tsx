"use client";

/**
 * ImageCropperView — premium redesign matching .design-refs/20.png.
 *
 * Layout: MarketingShell > flex(ImageToolsSidebar | main).
 * Premium sections: ToolHero with 3D illustration, TrustBadges,
 *   StepProgressBar, workspace with dropzone + crop controls + live preview,
 *   orange gradient CTA, TrustStrip.
 *
 * Shadcn primitives: Card, CardContent, Button, Badge, Progress,
 *   Alert, AlertDescription, Select, SelectContent, SelectItem,
 *   SelectTrigger, SelectValue, Separator.
 * Design tokens: --tool-bg, --tool-surface, --tool-surface-dim,
 *   --tool-border, --primary, --primary-foreground, --foreground,
 *   --muted-foreground, --border, --ring.
 * Icons: Lucide only.
 * Motion: framer-motion for entrance animations, prefers-reduced-motion safe.
 */

import { useState, useCallback, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Download,
  RotateCcw,
  Zap,
  Shield,
  Globe,
  FileImage,
  Crop,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Maximize2,
  Image as ImageIcon,
  Scissors,
  Lock,
  RatioIcon,
  Layers,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar, SidebarWrapper } from "@/views/tools/image-tools/ImageToolsSidebar";
import { ToolHero } from "@/views/tools/shared/ToolHero";
import { StepProgressBar } from "@/views/tools/shared/StepProgressBar";
import { TrustStrip } from "@/views/tools/shared/TrustStrip";
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
import { useImageProcessor } from "@/hooks/tools/useImageProcessor";
import { useFileDownload } from "@/hooks/tools/useFileDownload";
import { cn } from "@/lib/utils";
import type { EditTool } from "@/lib/image-edit-data";
import type { EditAlias } from "@/lib/image-edit-aliases";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  tool: EditTool;
  alias?: EditAlias;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  { icon: Zap, text: "No signup required" },
  { icon: Shield, text: "100% private" },
  { icon: Globe, text: "Runs in browser" },
  { icon: FileImage, text: "Supports all formats" },
];

const STEPS = [
  { number: 1, label: "Upload Image", sublabel: "Choose or drag & drop" },
  { number: 2, label: "Set Crop Area", sublabel: "Adjust & preview" },
  { number: 3, label: "Download", sublabel: "Get high quality image" },
];

const TRUST_FEATURES = [
  {
    icon: Zap,
    title: "Instant cropping",
    description: "Crop images in real-time right in your browser.",
  },
  {
    icon: Lock,
    title: "100% private",
    description: "Your images never leave your device.",
  },
  {
    icon: RatioIcon,
    title: "Multiple aspect ratios",
    description: "Popular ratios or custom size in pixels.",
  },
  {
    icon: Layers,
    title: "Supports all formats",
    description: "JPG, PNG, WebP, GIF, BMP, TIFF and more.",
  },
];

const ASPECT_RATIOS = [
  { label: "Free", value: "free" },
  { label: "1:1", value: "1:1" },
  { label: "16:9", value: "16:9" },
  { label: "4:3", value: "4:3" },
  { label: "3:2", value: "3:2" },
  { label: "9:16", value: "9:16" },
] as const;

const SAMPLE_IMAGES = [
  "/images/tools/samples/landscape-1.jpg",
  "/images/tools/samples/landscape-2.jpg",
  "/images/tools/samples/portrait-1.jpg",
  "/images/tools/samples/animal-1.jpg",
  "/images/tools/samples/city-1.jpg",
  "/images/tools/samples/nature-1.jpg",
];

const OUTPUT_FORMATS = ["JPG", "PNG", "WEBP"] as const;

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
// DimensionInput — labeled number input with dark theme
// ---------------------------------------------------------------------------

function DimensionInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={0}
        max={99999}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-lg px-3 py-2.5 text-sm font-medium text-foreground",
          "bg-[hsl(var(--tool-surface-dim))]",
          "border border-[hsl(var(--tool-border))]",
          "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)]",
          "transition-colors"
        )}
        aria-label={label}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3D Hero Illustration
// ---------------------------------------------------------------------------

function CropperIllustration() {
  const shouldReduce = useReducedMotion();

  return (
    <div className="relative h-[280px] w-[320px] sm:h-[320px] sm:w-[380px]">
      {/* Warm glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Main image card with crop handles */}
      <motion.div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "h-[180px] w-[240px] sm:h-[200px] sm:w-[280px]",
          "rounded-xl border-2 border-[hsl(var(--primary)/0.5)]",
          "bg-gradient-to-br from-[hsl(var(--tool-surface))] to-[hsl(var(--tool-surface-dim))]",
          "shadow-2xl overflow-hidden"
        )}
        animate={
          shouldReduce
            ? undefined
            : { y: [0, -6, 0], rotate: [0, 1, 0] }
        }
        transition={
          shouldReduce
            ? undefined
            : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {/* Simulated image content */}
        <div className="h-full w-full bg-gradient-to-br from-sky-900/40 via-emerald-900/30 to-amber-900/20 flex items-center justify-center">
          <Crop className="h-12 w-12 text-[hsl(var(--primary)/0.4)]" aria-hidden="true" />
        </div>

        {/* Crop overlay handles */}
        {[
          "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
          "top-0 right-0 translate-x-1/2 -translate-y-1/2",
          "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
          "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
        ].map((pos, i) => (
          <div
            key={i}
            className={cn(
              "absolute h-3 w-3 rounded-full border-2",
              "border-white bg-[hsl(var(--primary))]",
              pos
            )}
            aria-hidden="true"
          />
        ))}

        {/* Dimension label */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          800 x 600
        </div>
      </motion.div>

      {/* Floating format badges */}
      {[
        { label: "JPG", top: "10%", right: "0%", delay: 0 },
        { label: "PNG", top: "28%", right: "-5%", delay: 0.1 },
        { label: "WEBP", top: "46%", right: "-2%", delay: 0.2 },
        { label: "GIF", top: "64%", right: "0%", delay: 0.3 },
        { label: "TIFF", top: "82%", right: "3%", delay: 0.4 },
      ].map(({ label, top, right, delay }) => (
        <motion.div
          key={label}
          className={cn(
            "absolute rounded-lg px-3 py-1.5 text-xs font-bold",
            "bg-[hsl(var(--tool-surface))] border border-[hsl(var(--tool-border))]",
            "text-foreground shadow-lg"
          )}
          style={{ top, right }}
          initial={shouldReduce ? undefined : { opacity: 0, x: 20 }}
          animate={shouldReduce ? undefined : { opacity: 1, x: 0 }}
          transition={
            shouldReduce ? undefined : { delay: 0.5 + delay, duration: 0.4 }
          }
        >
          {label}
        </motion.div>
      ))}

      {/* Handwritten label */}
      <motion.div
        className="absolute -top-2 right-4 sm:right-8"
        initial={shouldReduce ? undefined : { opacity: 0 }}
        animate={shouldReduce ? undefined : { opacity: 1 }}
        transition={shouldReduce ? undefined : { delay: 0.8, duration: 0.5 }}
      >
        <span className="font-serif text-sm italic text-muted-foreground/70">
          Crop to
        </span>
        <br />
        <span className="font-serif text-sm italic text-muted-foreground/70">
          exact size
        </span>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ImageCropperView({ tool, alias }: Props) {
  const { cropImage } = useImageProcessor();
  const { downloadSingle } = useFileDownload();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);

  const [cropX, setCropX] = useState("0");
  const [cropY, setCropY] = useState("0");
  const [cropW, setCropW] = useState("800");
  const [cropH, setCropH] = useState("600");
  const [aspectRatio, setAspectRatio] = useState("free");
  const [outputFormat, setOutputFormat] = useState<string>("JPG");

  const isDone = result !== null;
  const hasFile = selectedFile !== null;

  // Derive active step from state
  const activeStep = isDone ? 3 : hasFile ? 2 : 1;

  // Original image dimensions (from preview)
  const [origDimensions, setOrigDimensions] = useState<{
    w: number;
    h: number;
  } | null>(null);

  const shouldReduce = useReducedMotion();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFilesSelected = useCallback((files: File[]) => {
    const file = files[0] ?? null;
    setSelectedFile(file);
    setResult(null);
    setError(undefined);
    setProgress(0);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Read dimensions
      const img = new window.Image();
      img.onload = () => {
        setOrigDimensions({ w: img.naturalWidth, h: img.naturalHeight });
        // Default crop to full image
        setCropW(String(img.naturalWidth));
        setCropH(String(img.naturalHeight));
        setCropX("0");
        setCropY("0");
      };
      img.src = url;
    } else {
      setPreviewUrl(null);
      setOrigDimensions(null);
    }
  }, []);

  const handleAspectRatioChange = useCallback(
    (ratio: string) => {
      setAspectRatio(ratio);
      if (ratio === "free" || !origDimensions) return;

      const [wRatio, hRatio] = ratio.split(":").map(Number);
      if (!wRatio || !hRatio) return;

      const maxW = origDimensions.w;
      const maxH = origDimensions.h;

      // Fit the ratio within original dimensions
      let newW = maxW;
      let newH = Math.round(maxW * (hRatio / wRatio));
      if (newH > maxH) {
        newH = maxH;
        newW = Math.round(maxH * (wRatio / hRatio));
      }

      setCropW(String(newW));
      setCropH(String(newH));
      setCropX("0");
      setCropY("0");
    },
    [origDimensions]
  );

  const handleCrop = useCallback(async () => {
    if (!selectedFile) return;

    const x = parseInt(cropX, 10);
    const y = parseInt(cropY, 10);
    const w = parseInt(cropW, 10);
    const h = parseInt(cropH, 10);

    if ([x, y, w, h].some((v) => isNaN(v) || v < 0)) {
      setError("Please enter valid crop values (non-negative numbers).");
      return;
    }
    if (w <= 0 || h <= 0) {
      setError("Crop width and height must be greater than zero.");
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError(undefined);

    try {
      const cropped = await cropImage(selectedFile, {
        x,
        y,
        width: w,
        height: h,
      });
      setProgress(100);
      setResult(cropped);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Crop failed. Please check the values and try again.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, cropX, cropY, cropW, cropH, cropImage]);

  const handleDownload = useCallback(() => {
    if (result) downloadSingle(result);
  }, [result, downloadSingle]);

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(undefined);
    setProgress(0);
    setCropX("0");
    setCropY("0");
    setCropW("800");
    setCropH("600");
    setAspectRatio("free");
    setOrigDimensions(null);
  }, [previewUrl]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <MarketingShell>
      <SidebarWrapper>
        {/* Sidebar */}
        <ImageToolsSidebar activeSlug={tool.slug} />

        {/* Main content */}
        <div className="flex-1 min-w-0 bg-[hsl(var(--tool-bg))]">
          <main
            id="main-content"
            className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8"
            aria-label="Image Cropper tool"
          >
            {/* ── Premium Hero ── */}
            <ToolHero
              eyebrow="FREE IMAGE CROPPER — BROWSER-BASED"
              h1Prefix="Free"
              h1Highlight="Image Cropper"
              h1Suffix="Crop images to exact size."
              description="Crop any image to your exact dimensions using pixel coordinates. No uploads, no signup — all processing happens in your browser."
              trustBadges={TRUST_BADGES}
            >
              <CropperIllustration />
            </ToolHero>

            {/* ── Workspace Card ── */}
            <motion.section
              className="pb-8"
              initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
              animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
              transition={shouldReduce ? undefined : { delay: 0.4, duration: 0.5 }}
              aria-label="Crop workspace"
            >
              <Card
                className={cn(
                  "overflow-hidden border-[hsl(var(--tool-border))]",
                  "bg-[hsl(var(--tool-surface))]"
                )}
              >
                <CardContent className="p-0">
                  {/* Step Progress Bar */}
                  <div className="border-b border-[hsl(var(--tool-border))] px-4 py-5 sm:px-6 sm:py-6">
                    <StepProgressBar
                      steps={STEPS}
                      activeStep={activeStep}
                    />
                  </div>

                  {/* Workspace content: two-column layout */}
                  <div className="flex flex-col lg:flex-row">
                    {/* Left column: Upload + Crop Controls */}
                    <div className="flex-1 border-b lg:border-b-0 lg:border-r border-[hsl(var(--tool-border))] p-4 sm:p-6 space-y-6">
                      {/* Upload Dropzone */}
                      <ImageDropzone
                        onFilesSelected={handleFilesSelected}
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        maxSizeMB={50}
                        multiple={false}
                      />

                      {/* Sample images strip */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Try a sample image:
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {SAMPLE_IMAGES.map((src, i) => (
                            <button
                              key={i}
                              type="button"
                              className={cn(
                                "h-14 w-20 shrink-0 overflow-hidden rounded-lg",
                                "border border-[hsl(var(--tool-border))]",
                                "bg-[hsl(var(--tool-surface-dim))]",
                                "transition-all hover:border-[hsl(var(--primary)/0.5)] hover:scale-105",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"
                              )}
                              aria-label={`Load sample image ${i + 1}`}
                            >
                              <div className="h-full w-full bg-gradient-to-br from-sky-900/20 to-emerald-900/20" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-[hsl(var(--tool-border))]" />

                      {/* Crop Area Controls */}
                      <fieldset className="space-y-4">
                        <legend className="text-sm font-semibold text-foreground">
                          Crop area (pixels)
                        </legend>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <DimensionInput
                            id="crop-x"
                            label="X offset"
                            value={cropX}
                            onChange={setCropX}
                          />
                          <DimensionInput
                            id="crop-y"
                            label="Y offset"
                            value={cropY}
                            onChange={setCropY}
                          />
                          <DimensionInput
                            id="crop-w"
                            label="Width"
                            value={cropW}
                            onChange={setCropW}
                          />
                          <DimensionInput
                            id="crop-h"
                            label="Height"
                            value={cropH}
                            onChange={setCropH}
                          />
                        </div>
                      </fieldset>

                      {/* Aspect Ratio */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">
                            Aspect ratio
                          </span>
                          <Select
                            value={aspectRatio}
                            onValueChange={handleAspectRatioChange}
                          >
                            <SelectTrigger
                              className={cn(
                                "w-24 h-9 text-sm",
                                "bg-[hsl(var(--tool-surface-dim))]",
                                "border-[hsl(var(--tool-border))]"
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ASPECT_RATIOS.map(({ label, value }) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Quick ratio buttons */}
                        <div className="flex flex-wrap gap-1.5">
                          {ASPECT_RATIOS.map(({ label, value }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleAspectRatioChange(value)}
                              className={cn(
                                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                                "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
                                aspectRatio === value
                                  ? "text-white border-transparent"
                                  : "border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))] text-muted-foreground hover:border-[hsl(var(--primary)/0.3)] hover:text-foreground"
                              )}
                              style={
                                aspectRatio === value
                                  ? {
                                      background:
                                        "linear-gradient(135deg, #F97316, #F59E0B)",
                                    }
                                  : undefined
                              }
                              aria-pressed={aspectRatio === value}
                              aria-label={`Aspect ratio ${label}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right column: Live Preview */}
                    <div className="lg:w-[420px] p-4 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground font-display">
                          Live Preview
                        </h3>
                        {hasFile && (
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "text-xs gap-1.5",
                              "border-[hsl(var(--tool-border))]",
                              "bg-[hsl(var(--tool-surface-dim))]"
                            )}
                            aria-label="Fit to screen"
                          >
                            <Maximize2 className="h-3 w-3" aria-hidden="true" />
                            Fit to screen
                          </Button>
                        )}
                      </div>

                      {/* Preview area */}
                      <div
                        className={cn(
                          "relative flex items-center justify-center overflow-hidden rounded-xl",
                          "border border-[hsl(var(--tool-border))]",
                          "bg-[hsl(var(--tool-surface-dim))]",
                          "min-h-[260px] sm:min-h-[320px]"
                        )}
                      >
                        {previewUrl ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewUrl}
                              alt="Image preview with crop area"
                              className="max-h-[300px] max-w-full object-contain"
                            />
                            {/* Crop handles overlay */}
                            <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-md pointer-events-none">
                              {[
                                "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
                                "top-0 right-0 translate-x-1/2 -translate-y-1/2",
                                "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
                                "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
                                "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
                                "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
                                "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
                                "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
                              ].map((pos, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "absolute h-2.5 w-2.5 rounded-full",
                                    "bg-white border border-[hsl(var(--primary))]",
                                    "shadow-sm",
                                    pos
                                  )}
                                  aria-hidden="true"
                                />
                              ))}
                            </div>
                            {/* Size overlay */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                              {cropW} x {cropH}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                            <ImageIcon
                              className="h-12 w-12 opacity-30"
                              aria-hidden="true"
                            />
                            <p className="text-sm">
                              Upload an image to see preview
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Image info row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                            Original size
                          </p>
                          <p className="text-xs font-medium text-foreground">
                            {origDimensions
                              ? `${origDimensions.w} x ${origDimensions.h} px`
                              : "—"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                            Cropped size
                          </p>
                          <p className="text-xs font-medium text-foreground">
                            {hasFile ? `${cropW} x ${cropH} px` : "—"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                            Output format
                          </p>
                          <Select
                            value={outputFormat}
                            onValueChange={setOutputFormat}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-7 w-full text-xs",
                                "bg-[hsl(var(--tool-surface-dim))]",
                                "border-[hsl(var(--tool-border))]"
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {OUTPUT_FORMATS.map((fmt) => (
                                <SelectItem key={fmt} value={fmt}>
                                  {fmt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="px-4 sm:px-6 pb-4">
                      <Alert
                        variant="destructive"
                        role="alert"
                        aria-live="assertive"
                      >
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Progress */}
                  {isProcessing && (
                    <div
                      className="px-4 sm:px-6 pb-4 space-y-2"
                      aria-live="polite"
                      aria-busy="true"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Cropping...
                        </span>
                        <span className="font-medium text-foreground">
                          {progress}%
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-2"
                        aria-label={`Crop progress: ${progress}%`}
                      />
                    </div>
                  )}

                  {/* Result */}
                  {isDone && !isProcessing && (
                    <div className="px-4 sm:px-6 pb-4">
                      <div
                        className={cn(
                          "rounded-lg p-4 space-y-1",
                          "bg-[hsl(142_76%_36%/0.1)]",
                          "border border-[hsl(142_76%_36%/0.3)]"
                        )}
                        role="region"
                        aria-label="Crop result"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className="h-5 w-5 text-[hsl(142_76%_36%)]"
                            aria-hidden="true"
                          />
                          <span className="font-semibold text-foreground">
                            Image cropped — {cropW} x {cropH} px
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-7">
                          {result.name} · {formatBytes(result.size)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="border-t border-[hsl(var(--tool-border))] p-4 sm:p-6">
                    {isDone ? (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleDownload}
                          className={cn(
                            "flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5",
                            "text-base font-bold text-white",
                            "transition-all hover:opacity-90 hover:shadow-lg",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                          )}
                          style={{
                            background:
                              "linear-gradient(135deg, #F97316, #F59E0B)",
                          }}
                          aria-label="Download cropped image"
                        >
                          <Download className="h-5 w-5" aria-hidden="true" />
                          Crop &amp; Download Image
                        </button>
                        <Button
                          onClick={handleReset}
                          variant="outline"
                          size="lg"
                          className={cn(
                            "border-[hsl(var(--tool-border))]",
                            "bg-[hsl(var(--tool-surface-dim))]"
                          )}
                          aria-label="Reset and start over"
                        >
                          <RotateCcw
                            className="mr-2 h-4 w-4"
                            aria-hidden="true"
                          />
                          Start over
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleCrop}
                          disabled={!hasFile || isProcessing}
                          className={cn(
                            "flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5",
                            "text-base font-bold text-white",
                            "transition-all",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                            hasFile && !isProcessing
                              ? "hover:opacity-90 hover:shadow-lg"
                              : "opacity-50 cursor-not-allowed"
                          )}
                          style={{
                            background:
                              "linear-gradient(135deg, #F97316, #F59E0B)",
                          }}
                          aria-label="Crop and download image"
                        >
                          {isProcessing ? (
                            <>
                              <span
                                className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
                                aria-hidden="true"
                              />
                              Cropping...
                            </>
                          ) : (
                            <>
                              <Download
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                              Crop &amp; Download Image
                            </>
                          )}
                        </button>
                        {hasFile && (
                          <Button
                            onClick={handleReset}
                            variant="outline"
                            size="lg"
                            disabled={isProcessing}
                            className={cn(
                              "border-[hsl(var(--tool-border))]",
                              "bg-[hsl(var(--tool-surface-dim))]"
                            )}
                            aria-label="Reset and start over"
                          >
                            <RotateCcw
                              className="mr-2 h-4 w-4"
                              aria-hidden="true"
                            />
                            Start over
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* ── Trust Strip ── */}
            <motion.div
              className="pb-12"
              initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
              animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
              transition={
                shouldReduce ? undefined : { delay: 0.6, duration: 0.5 }
              }
            >
              <TrustStrip features={TRUST_FEATURES} />
            </motion.div>

            {/* ── AEO: What is Image Cropping? ── */}
            <section
              aria-labelledby="what-is-crop-heading"
              className="mt-8 rounded-xl border p-6"
              style={{
                background: "hsl(var(--tool-surface))",
                borderColor: "hsl(var(--tool-border))",
              }}
            >
              <h2 id="what-is-crop-heading" className="text-lg font-bold text-foreground mb-4">
                What is image cropping?
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                Image cropping is the process of removing unwanted outer areas from a photo to improve composition, change the aspect ratio, or focus on a specific subject. Unlike resizing, cropping removes pixels rather than scaling them — the remaining area retains its original resolution and quality.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                Trndinn&apos;s Image Cropper runs 100% in your browser using the HTML5 Canvas API. Your photos never leave your device. Supports pixel-perfect coordinates, preset aspect ratios (1:1, 16:9, 4:3, 3:2, 9:16), and outputs in JPG, PNG, WebP, GIF, BMP, and TIFF. Over 3.2 billion images are shared on social media daily [Photutorial, 2025], and proper cropping is the single fastest way to improve visual impact.
              </p>

              <h3 className="text-base font-semibold text-foreground mt-6 mb-3">
                Frequently asked questions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">How do I crop an image to exact pixel dimensions?</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Upload your image to Trndinn&apos;s Image Cropper, enter the exact Width and Height in pixels (plus optional X/Y offset), and click &quot;Crop &amp; Download.&quot; The output file is exactly the dimensions you specified.</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">What aspect ratio should I use for Instagram?</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Instagram supports 1:1 (square posts, 1080×1080), 4:5 (portrait, 1080×1350), and 16:9 (landscape, 1080×608). Stories and Reels use 9:16 (1080×1920). Use the preset buttons in our cropper to snap to these ratios instantly.</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Does cropping reduce image quality?</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">No — cropping preserves the original pixel data of the selected area. Only the removed outer portions are discarded. The cropped region remains at full resolution.</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Can I crop images without uploading to a server?</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Yes. Trndinn&apos;s Image Cropper processes everything locally in your browser. Your images never leave your device — it works offline too.</p>
                </div>
              </div>
            </section>

            {/* ── Need more? CTA ── */}
            <section
              aria-label="Try Trndinn"
              className="mt-6 flex flex-col gap-6 rounded-xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 border"
              style={{
                background: "linear-gradient(135deg, hsl(var(--tool-surface)) 0%, hsl(var(--tool-surface-dim)) 100%)",
                borderColor: "hsl(var(--tool-border))",
              }}
            >
              <div className="max-w-md">
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">Need more?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create social media graphics, OG images, and branded assets with AI.
                </p>
                <div className="mt-5">
                  <a
                    href="/features"
                    className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}
                  >
                    Try Trndinn
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </section>

            {/* ── More tools you'll love ── */}
            <section aria-label="Related tools" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">More image tools you&apos;ll love</h2>
                <a href="/tools/image" className="text-xs font-medium text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                  View all tools <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Image Resizer", desc: "Resize for any platform", href: "/tools/resize-image" },
                  { name: "Remove Background", desc: "AI background removal", href: "/tools/background-remover" },
                  { name: "Watermark Tool", desc: "Add text or image watermarks", href: "/tools/watermark-image" },
                  { name: "Image Rotator", desc: "Rotate and flip images", href: "/tools/rotate-image" },
                ].map((t) => (
                  <a
                    key={t.name}
                    href={t.href}
                    className="rounded-xl border p-4 hover:border-[hsl(var(--primary)/0.3)] transition-colors group"
                    style={{
                      background: "hsl(var(--tool-surface))",
                      borderColor: "hsl(var(--tool-border))",
                    }}
                  >
                    <p className="text-sm font-semibold text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                  </a>
                ))}
              </div>
            </section>

            {/* ── SEO footer note ── */}
            <div className="pb-8 px-2">
              <p className="text-xs leading-relaxed text-muted-foreground/60">
                Trndinn&apos;s Image Cropper is a free, browser-based tool. All
                processing happens locally on your device — no files are
                uploaded to any server. No signup, no watermark, no usage limit.
              </p>
            </div>
          </main>
        </div>
      </SidebarWrapper>
    </MarketingShell>
  );
}
