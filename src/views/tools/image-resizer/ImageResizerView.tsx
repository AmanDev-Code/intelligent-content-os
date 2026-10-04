"use client";

/**
 * ImageResizerView — Premium redesigned image resizer tool.
 *
 * Matches reference design (.design-refs/21.png):
 * - Premium hero with eyebrow pill, gradient headline, 3D illustration
 * - TrustBadges row (No signup, 100% private, Runs in browser, Supports all formats)
 * - StepProgressBar (Upload & Resize → Preview & Adjust → Download)
 * - Social media preset cards (Custom, LinkedIn, Instagram, YouTube, Twitter/X, Facebook)
 * - Custom dimensions with width/height/link toggle + checkboxes
 * - Preview panel with original vs resized comparison + output format
 * - Big orange "Download Resized Image →" CTA
 * - TrustStrip (Instant resizing, 100% private, Multiple presets, High quality)
 * - AEO content sections
 *
 * Processing: Canvas API in browser — zero server upload.
 * Wrapped in MarketingShell + ImageToolsSidebar directly.
 *
 * Design tokens: --tool-bg, --tool-surface, --tool-surface-dim, --tool-border,
 *   --primary, --foreground, --muted-foreground.
 * Icons: Lucide only.
 * Motion: framer-motion, prefers-reduced-motion safe.
 * Dark mode: fully CSS-variable driven.
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Download,
  RotateCcw,
  Zap,
  Shield,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  ArrowRight,
  Upload,
  Globe,
  Monitor,
  Sparkles,
  Image as ImageIcon,
  Link2,
  Search,
  Linkedin,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  ChevronDown,
  Crop,
  FileImage,
  Star,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
import { TrustStrip, type TrustFeature } from "@/views/tools/shared/TrustStrip";
import { TrustBadges, type TrustBadge } from "@/views/tools/shared/TrustBadges";
import { StepProgressBar, type Step } from "@/views/tools/shared/StepProgressBar";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar, SidebarWrapper } from "@/views/tools/image-tools/ImageToolsSidebar";
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

interface SocialPreset {
  id: string;
  platform: string;
  icon: React.ComponentType<{ className?: string }>;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOCIAL_PRESETS: SocialPreset[] = [
  { id: "custom", platform: "Custom\nSize", icon: Crop, width: 0, height: 0 },
  { id: "linkedin", platform: "LinkedIn", icon: Linkedin, width: 400, height: 400 },
  { id: "instagram", platform: "Instagram", icon: Instagram, width: 1080, height: 1080 },
  { id: "youtube", platform: "YouTube\nThumbnail", icon: Youtube, width: 1280, height: 720 },
  { id: "twitter", platform: "Twitter / X", icon: Twitter, width: 1500, height: 500 },
  { id: "facebook", platform: "Facebook", icon: Facebook, width: 1200, height: 630 },
];

const OUTPUT_FORMATS = ["JPG", "PNG", "WEBP"] as const;

const TRUST_BADGES: TrustBadge[] = [
  { icon: Sparkles, text: "No signup required" },
  { icon: Shield, text: "100% private" },
  { icon: Monitor, text: "Runs in your browser" },
  { icon: Star, text: "Supports all formats" },
];

const TRUST_FEATURES: TrustFeature[] = [
  { icon: Zap, title: "Instant resizing", description: "Resize images in real-time in your browser." },
  { icon: Shield, title: "100% private", description: "Your images never leave your device." },
  { icon: FileImage, title: "Multiple presets", description: "Ready-made sizes for all social platforms." },
  { icon: Star, title: "High quality output", description: "Crisp and clear results with preserved quality." },
];

const STEPS: Step[] = [
  { number: 1, label: "Upload & Resize", sublabel: "Choose image and size" },
  { number: 2, label: "Preview & Adjust", sublabel: "See changes live" },
  { number: 3, label: "Download", sublabel: "Get high quality image" },
];

const SAMPLE_IMAGES = [
  { src: "/tools/samples/mountain.jpg", alt: "Mountain landscape" },
  { src: "/tools/samples/forest.jpg", alt: "Forest path" },
  { src: "/tools/samples/ocean.jpg", alt: "Ocean waves" },
  { src: "/tools/samples/city.jpg", alt: "City skyline" },
  { src: "/tools/samples/flower.jpg", alt: "Flower macro" },
];

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

function ResizerHeroIllustration() {
  return (
    <div className="relative h-[280px] w-[380px] sm:h-[320px] sm:w-[440px]" aria-hidden="true">
      {/* Warm glow */}
      <div
        className="absolute inset-0 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.35) 0%, transparent 70%)" }}
      />

      {/* Main image card */}
      <motion.div
        className="absolute left-[8%] top-[10%] h-40 w-56 rounded-2xl border-2 shadow-xl shadow-black/40 overflow-hidden"
        style={{ borderColor: "#8B5CF680" }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.55 }}
      >
        <div
          className="h-full w-full"
          style={{ background: "linear-gradient(160deg, #7C6FF0 0%, #4F46E5 55%, #312E81 100%)" }}
        >
          <svg viewBox="0 0 224 160" className="h-full w-full" fill="none" aria-hidden="true">
            <circle cx="170" cy="35" r="18" fill="#FDBA74" opacity="0.9" />
            <polygon points="0,160 70,60 130,160" fill="#1E1B4B" opacity="0.9" />
            <polygon points="80,160 150,40 224,160" fill="#312E81" opacity="0.95" />
          </svg>
        </div>
        {/* Resize handles */}
        <div className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-[hsl(var(--primary))] bg-white" />
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-[hsl(var(--primary))] bg-white" />
        <div className="absolute right-1/2 -bottom-1 translate-x-1/2 h-3 w-3 rounded-full border-2 border-[hsl(var(--primary))] bg-white" />
      </motion.div>

      {/* Handwritten label */}
      <motion.div
        className="absolute right-[12%] top-[2%] -rotate-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        <p className="font-serif text-sm italic text-muted-foreground/80">Resize</p>
        <p className="font-serif text-sm italic text-muted-foreground/80">for any platform</p>
      </motion.div>

      {/* Orange arrow */}
      <motion.svg
        className="absolute left-[60%] top-[18%] h-14 w-20"
        viewBox="0 0 80 56"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <defs>
          <linearGradient id="resizerSwoosh" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <path d="M4 40 Q40 4 72 20" stroke="url(#resizerSwoosh)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M64 12 L74 20 L62 26" stroke="url(#resizerSwoosh)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.svg>

      {/* Resize icon badge */}
      <motion.div
        className="absolute right-[8%] top-[12%] flex h-14 w-14 items-center justify-center rounded-2xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] shadow-lg shadow-black/30"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.45 }}
      >
        <Maximize2 className="h-7 w-7 text-[hsl(var(--primary))]" />
      </motion.div>

      {/* Dimension labels */}
      <motion.div
        className="absolute left-[6%] bottom-[32%] rounded-lg border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        800 × 600
      </motion.div>

      <motion.div
        className="absolute right-[15%] bottom-[20%] rounded-lg px-3 py-1.5 text-sm font-bold text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)", boxShadow: "0 0 20px #F9731640" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        1920 × 1080
      </motion.div>

      {/* Platform badges */}
      {[
        { label: "LinkedIn", top: "40%", right: "0%" },
        { label: "Instagram", top: "52%", right: "2%" },
        { label: "YouTube", top: "64%", right: "0%" },
        { label: "Twitter / X", top: "76%", right: "2%" },
        { label: "Facebook", top: "88%", right: "0%" },
      ].map((badge, i) => (
        <motion.div
          key={badge.label}
          className="absolute rounded-md border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm"
          style={{ top: badge.top, right: badge.right }}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 + i * 0.08, duration: 0.35 }}
        >
          {badge.label}
        </motion.div>
      ))}

      {/* Handwritten bottom label */}
      <motion.p
        className="absolute bottom-[4%] right-[20%] font-serif text-xs italic text-muted-foreground/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.4 }}
      >
        Custom size too!
      </motion.p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload tabs
// ---------------------------------------------------------------------------

function UploadTabs({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: "upload", label: "Upload Image", icon: Upload },
    { id: "url", label: "Paste URL", icon: Link2 },
    { id: "sample", label: "Sample Images", icon: ImageIcon },
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
// Component
// ---------------------------------------------------------------------------

export default function ImageResizerView({ tool, alias }: Props) {
  const { resizeImage } = useImageProcessor();
  const { downloadSingle } = useFileDownload();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [result, setResult] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [activeStep, setActiveStep] = useState(1);
  const [urlInput, setUrlInput] = useState("");

  // Dimensions
  const [width, setWidth] = useState<string>("1200");
  const [height, setHeight] = useState<string>("800");
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [highQuality, setHighQuality] = useState(true);
  const [preserveMetadata, setPreserveMetadata] = useState(false);
  const [outputFormat, setOutputFormat] = useState<string>("JPG");
  const [activePreset, setActivePreset] = useState<string>("custom");

  // Original dimensions
  const [origWidth, setOrigWidth] = useState<number | null>(null);
  const [origHeight, setOrigHeight] = useState<number | null>(null);

  const isDone = result !== null;

  const eyebrow = alias?.eyebrow ?? "FREE IMAGE RESIZER — BROWSER-BASED";
  const h1Prefix = alias?.h1Prefix ?? "Free";
  const h1Highlight = alias?.h1Highlight ?? "Image Resizer";
  const h1Suffix = alias?.h1Suffix ?? "";
  const heroDescription =
    "Resize any image to exact pixel dimensions or pick a platform preset for LinkedIn, Instagram, Twitter, YouTube, or Facebook. No uploads, no signup — runs entirely in your browser.";

  // Load original dimensions
  useEffect(() => {
    if (!selectedFile) {
      setOrigWidth(null);
      setOrigHeight(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setActiveStep(2);
    const img = new Image();
    img.onload = () => {
      setOrigWidth(img.naturalWidth);
      setOrigHeight(img.naturalHeight);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // ── Handlers ──

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length === 0) return;
    setSelectedFile(files[0]);
    setResult(null);
    setResultUrl("");
    setError("");
    setProgress(0);
  }, []);

  const handleLoadUrl = useCallback(async () => {
    const url = urlInput.trim();
    if (!url) return;
    setError("");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch image");
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) throw new Error("URL does not point to an image");
      const name = url.split("/").pop()?.split("?")[0] || "image.jpg";
      const file = new File([blob], name, { type: blob.type });
      setSelectedFile(file);
      setResult(null);
      setResultUrl("");
      setProgress(0);
      setActiveTab("upload");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load image from URL. Make sure it's a direct image link.");
    }
  }, [urlInput]);

  const handlePresetClick = useCallback((preset: SocialPreset) => {
    setActivePreset(preset.id);
    if (preset.id !== "custom" && preset.width > 0) {
      setWidth(String(preset.width));
      setHeight(String(preset.height));
      setMaintainAspect(false);
    }
    setResult(null);
    setResultUrl("");
    setError("");
  }, []);

  const handleWidthChange = useCallback(
    (val: string) => {
      setWidth(val);
      setActivePreset("custom");
      if (maintainAspect && origWidth && origHeight) {
        const w = parseInt(val, 10);
        if (!isNaN(w) && w > 0) {
          setHeight(String(Math.round((w / origWidth) * origHeight)));
        }
      }
    },
    [maintainAspect, origWidth, origHeight]
  );

  const handleHeightChange = useCallback(
    (val: string) => {
      setHeight(val);
      setActivePreset("custom");
      if (maintainAspect && origWidth && origHeight) {
        const h = parseInt(val, 10);
        if (!isNaN(h) && h > 0) {
          setWidth(String(Math.round((h / origHeight) * origWidth)));
        }
      }
    },
    [maintainAspect, origWidth, origHeight]
  );

  const handleResize = useCallback(async () => {
    if (!selectedFile) return;
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      setError("Please enter valid width and height values.");
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError("");

    try {
      const resized = await resizeImage(selectedFile, w, h, maintainAspect);
      setProgress(100);
      setResult(resized);
      setResultUrl(URL.createObjectURL(resized));
      setActiveStep(3);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Resize failed. Please try again.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, width, height, maintainAspect, resizeImage]);

  const handleDownload = useCallback(() => {
    if (result) downloadSingle(result);
  }, [result, downloadSingle]);

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setSelectedFile(null);
    setPreviewUrl("");
    setResult(null);
    setResultUrl("");
    setError("");
    setProgress(0);
    setActiveStep(1);
    setActivePreset("custom");
    setWidth("1200");
    setHeight("800");
  }, [previewUrl, resultUrl]);

  const estimatedSize = useMemo(() => {
    if (!selectedFile || !origWidth || !origHeight) return null;
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    if (isNaN(w) || isNaN(h)) return null;
    const ratio = (w * h) / (origWidth * origHeight);
    return Math.round(selectedFile.size * ratio);
  }, [selectedFile, origWidth, origHeight, width, height]);

  return (
    <MarketingShell>
      <SidebarWrapper>
        {/* Sidebar */}
        <ImageToolsSidebar activeSlug="image-resizer" />

        {/* Main content */}
        <div className="flex-1 min-w-0 overflow-x-hidden bg-[hsl(var(--tool-bg))]">
          {/* ── Hero ── */}
          <section
            className="relative overflow-x-clip px-6 pb-8 pt-8 lg:px-10 lg:pt-10"
            style={{
              background: "linear-gradient(180deg, hsl(var(--tool-surface)) 0%, hsl(var(--tool-bg)) 100%)",
            }}
          >
            <div
              className="pointer-events-none absolute right-0 top-0 hidden h-full w-[46%] items-center justify-center pr-6 lg:flex"
              aria-hidden="true"
            >
              <ResizerHeroIllustration />
            </div>

            <div className="relative z-10 max-w-[680px]">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-4 py-1.5",
                  "border border-[hsl(var(--primary)/0.3)]",
                  "bg-[hsl(var(--primary)/0.08)]",
                  "text-xs font-bold uppercase tracking-widest",
                  "text-[hsl(var(--primary))]"
                )}
              >
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

              <div className="mt-6 flex justify-center lg:hidden">
                <ResizerHeroIllustration />
              </div>
            </div>
          </section>

          <main id="main-content" className="px-6 pb-16 pt-6 lg:px-10 space-y-10" aria-label="Image Resizer tool">
            {/* ── Step Progress Bar ── */}
            <StepProgressBar steps={STEPS} activeStep={activeStep} />

            {/* ── Tool Workspace ── */}
            <Card
              className="overflow-hidden bg-[hsl(var(--tool-surface))]"
              style={{
                border: "1px solid #F9731640",
                boxShadow: "0 0 40px #F9731618, 0 0 80px #8B5CF610",
              }}
            >
              <CardContent className="p-0">
                {/* ── Step 1: Upload ── */}
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Left: Upload + Presets */}
                    <div className="space-y-5">
                      {/* Upload tabs */}
                      <UploadTabs activeTab={activeTab} onTabChange={setActiveTab} />

                      {activeTab === "upload" && (
                        <ImageDropzone
                          accept="image/jpeg,image/png,image/jpg,image/webp,image/gif,image/bmp,image/tiff"
                          multiple={false}
                          maxSizeMB={50}
                          onFilesSelected={handleFilesSelected}
                          disabled={isProcessing}
                        />
                      )}
                      {activeTab === "url" && (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={urlInput}
                              onChange={(e) => setUrlInput(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleLoadUrl()}
                              placeholder="https://example.com/image.jpg"
                              className={cn(
                                "flex-1 rounded-lg border border-[hsl(var(--tool-border))] px-4 py-3",
                                "bg-[hsl(var(--tool-surface-dim))] text-foreground text-sm",
                                "placeholder:text-muted-foreground/60",
                                "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                              )}
                              aria-label="Image URL"
                            />
                            <button
                              onClick={handleLoadUrl}
                              disabled={!urlInput.trim()}
                              className="shrink-0 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                            >
                              Load
                            </button>
                          </div>
                        </div>
                      )}
                      {activeTab === "sample" && (
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
                          {SAMPLE_IMAGES.map((sample, i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-16 w-16 shrink-0 rounded-lg overflow-hidden cursor-pointer",
                                "border border-[hsl(var(--tool-border))]",
                                "bg-[hsl(var(--tool-surface-dim))]",
                                "hover:border-[hsl(var(--primary)/0.5)] transition-colors"
                              )}
                            >
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-muted-foreground/40" aria-hidden="true" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quick resize for social media */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground">Quick resize for social media</p>
                          <button className="text-xs font-medium text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                            View all presets <ArrowRight className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {SOCIAL_PRESETS.map((preset) => {
                            const Icon = preset.icon;
                            const isActive = activePreset === preset.id;
                            return (
                              <button
                                key={preset.id}
                                onClick={() => handlePresetClick(preset)}
                                className={cn(
                                  "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all",
                                  "hover:border-[hsl(var(--primary)/0.5)]",
                                  isActive
                                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]"
                                    : "border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))]"
                                )}
                                aria-pressed={isActive}
                              >
                                <div
                                  className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                                    isActive
                                      ? "bg-[hsl(var(--primary)/0.15)]"
                                      : "bg-[hsl(var(--tool-surface))]"
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      "h-5 w-5",
                                      isActive ? "text-[hsl(var(--primary))]" : "text-muted-foreground"
                                    )}
                                    aria-hidden="true"
                                  />
                                </div>
                                <span className="text-[10px] font-medium text-center leading-tight text-foreground whitespace-pre-line">
                                  {preset.platform}
                                </span>
                                {preset.width > 0 && (
                                  <span className="text-[9px] text-muted-foreground">
                                    {preset.width}×{preset.height}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom dimensions */}
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-foreground">Custom dimensions (px)</p>
                        <div className="flex items-end gap-3">
                          <div className="flex-1 space-y-1">
                            <label htmlFor="resize-width" className="text-xs text-muted-foreground">Width</label>
                            <input
                              id="resize-width"
                              type="number"
                              min={1}
                              max={10000}
                              value={width}
                              onChange={(e) => handleWidthChange(e.target.value)}
                              className={cn(
                                "w-full rounded-lg border border-[hsl(var(--tool-border))] px-3 py-2.5 text-sm text-foreground",
                                "bg-[hsl(var(--tool-surface-dim))]",
                                "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                              )}
                              aria-label="Width in pixels"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => setMaintainAspect((v) => !v)}
                            className={cn(
                              "mb-0.5 rounded-lg border p-2.5 transition-colors",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                              maintainAspect
                                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                                : "border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))] text-muted-foreground"
                            )}
                            aria-label={maintainAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                          >
                            {maintainAspect ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          </button>

                          <div className="flex-1 space-y-1">
                            <label htmlFor="resize-height" className="text-xs text-muted-foreground">Height</label>
                            <input
                              id="resize-height"
                              type="number"
                              min={1}
                              max={10000}
                              value={height}
                              onChange={(e) => handleHeightChange(e.target.value)}
                              className={cn(
                                "w-full rounded-lg border border-[hsl(var(--tool-border))] px-3 py-2.5 text-sm text-foreground",
                                "bg-[hsl(var(--tool-surface-dim))]",
                                "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                              )}
                              aria-label="Height in pixels"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">&nbsp;</span>
                            <div
                              className={cn(
                                "rounded-lg border border-[hsl(var(--tool-border))] px-3 py-2.5 text-sm text-muted-foreground",
                                "bg-[hsl(var(--tool-surface-dim))]"
                              )}
                            >
                              px
                            </div>
                          </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="maintain-aspect"
                              checked={maintainAspect}
                              onCheckedChange={(c) => setMaintainAspect(!!c)}
                              className="border-[hsl(var(--tool-border))] data-[state=checked]:bg-[hsl(var(--primary))] data-[state=checked]:border-[hsl(var(--primary))]"
                            />
                            <Label htmlFor="maintain-aspect" className="text-xs text-foreground cursor-pointer">
                              Maintain aspect ratio
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="high-quality"
                              checked={highQuality}
                              onCheckedChange={(c) => setHighQuality(!!c)}
                              className="border-[hsl(var(--tool-border))] data-[state=checked]:bg-[hsl(var(--primary))] data-[state=checked]:border-[hsl(var(--primary))]"
                            />
                            <Label htmlFor="high-quality" className="text-xs text-foreground cursor-pointer">
                              High quality output
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="preserve-meta"
                              checked={preserveMetadata}
                              onCheckedChange={(c) => setPreserveMetadata(!!c)}
                              className="border-[hsl(var(--tool-border))] data-[state=checked]:bg-[hsl(var(--tool-border))] data-[state=checked]:border-[hsl(var(--tool-border))]"
                            />
                            <Label htmlFor="preserve-meta" className="text-xs text-muted-foreground cursor-pointer">
                              Preserve metadata (EXIF)
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Preview</h3>
                        <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                          <Maximize2 className="h-3 w-3" aria-hidden="true" />
                          Fit to screen
                        </button>
                      </div>

                      <div
                        className={cn(
                          "relative flex items-center justify-center rounded-xl overflow-hidden",
                          "border border-[hsl(var(--tool-border))]",
                          "bg-[hsl(var(--tool-surface-dim))]",
                          "aspect-[4/3] min-h-[240px]"
                        )}
                      >
                        {previewUrl ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resultUrl || previewUrl}
                              alt="Image preview"
                              className="h-full w-full object-contain p-2"
                            />
                            {/* Original vs Resized labels */}
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="rounded-md bg-[hsl(var(--tool-surface))] px-2 py-0.5 text-[10px] font-medium text-foreground border border-[hsl(var(--tool-border))]">
                                Original
                              </span>
                              {origWidth && origHeight && (
                                <span className="rounded-md bg-[hsl(var(--tool-surface))] px-2 py-0.5 text-[10px] text-muted-foreground border border-[hsl(var(--tool-border))]">
                                  {origWidth} × {origHeight}
                                </span>
                              )}
                            </div>
                            {isDone && (
                              <div className="absolute top-3 right-3 flex gap-2">
                                <span className="rounded-md px-2 py-0.5 text-[10px] font-medium text-white" style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}>
                                  Resized
                                </span>
                                <span className="rounded-md bg-[hsl(var(--tool-surface))] px-2 py-0.5 text-[10px] text-muted-foreground border border-[hsl(var(--tool-border))]">
                                  {width} × {height}
                                </span>
                              </div>
                            )}
                            {/* Resize handles overlay */}
                            <div className="absolute inset-6 border-2 border-dashed border-white/20 rounded-lg pointer-events-none" />
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-lg bg-black/60 px-3 py-1.5 text-[11px] text-white">
                              <span>&lt;&gt;</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground/50 p-8">
                            <ImageIcon className="h-10 w-10" aria-hidden="true" />
                            <p className="text-xs text-center">Upload an image to preview</p>
                          </div>
                        )}
                      </div>

                      {/* Size info row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))] p-3 text-center">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Original size</p>
                          <p className="text-xs font-semibold text-foreground">
                            {origWidth && origHeight ? `${origWidth} × ${origHeight} px` : "—"}
                          </p>
                          {selectedFile && (
                            <p className="text-[10px] text-muted-foreground">{formatBytes(selectedFile.size)}</p>
                          )}
                        </div>
                        <div className="rounded-lg border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))] p-3 text-center">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">New size</p>
                          <p className="text-xs font-semibold text-foreground">
                            {width} × {height} px
                          </p>
                          {estimatedSize && (
                            <p className="text-[10px] text-muted-foreground">~ {formatBytes(estimatedSize)}</p>
                          )}
                        </div>
                        <div className="rounded-lg border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))] p-3 text-center">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Output format</p>
                          <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value)}
                            className="w-full rounded border-0 bg-transparent text-xs font-semibold text-foreground text-center focus:outline-none cursor-pointer"
                            aria-label="Output format"
                          >
                            {OUTPUT_FORMATS.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <Alert variant="destructive" role="alert" aria-live="assertive">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Progress */}
                  {isProcessing && (
                    <div className="space-y-2" aria-live="polite" aria-busy="true">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Resizing...</span>
                        <span className="font-medium text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" aria-label={`Resize progress: ${progress}%`} />
                    </div>
                  )}

                  {/* Big orange CTA */}
                  <button
                    onClick={isDone ? handleDownload : handleResize}
                    disabled={!selectedFile || isProcessing}
                    className={cn(
                      "w-full rounded-xl py-4 px-6 text-base font-bold text-white",
                      "flex items-center justify-center gap-2",
                      "transition-all duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.01]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2"
                    )}
                    style={{
                      background: isDone
                        ? "linear-gradient(135deg, #EC4899, #F97316)"
                        : "linear-gradient(135deg, #F97316, #F59E0B)",
                    }}
                    aria-label={isDone ? "Download resized image" : "Resize image"}
                  >
                    {isProcessing ? (
                      <>
                        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                        Resizing...
                      </>
                    ) : isDone ? (
                      <>
                        <Download className="h-5 w-5" aria-hidden="true" />
                        Download Resized Image
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        Download Resized Image
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                      </>
                    )}
                  </button>

                  {isDone && (
                    <div className="flex justify-center">
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
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── Trust Strip ── */}
            <TrustStrip features={TRUST_FEATURES} />

            {/* ── AEO Content: What is Image Resizing? ── */}
            <section
              aria-labelledby="what-is-heading"
              className={cn(
                "rounded-xl border border-[hsl(var(--tool-border))] p-6",
                "bg-[hsl(var(--tool-surface))]"
              )}
            >
              <h2 id="what-is-heading" className="text-lg font-bold text-foreground mb-4">
                What is image resizing?
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                Image resizing is the process of changing the pixel dimensions of a digital image — making it larger or smaller while preserving visual quality. Trndinn&apos;s free Image Resizer runs 100% in your browser using the Canvas API, which means your photos never leave your device and there is zero server upload.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                Social media platforms require specific image dimensions for optimal display. LinkedIn recommends 400×400px for profile photos and 1584×396px for banners. Instagram posts perform best at 1080×1080px, while YouTube thumbnails need 1280×720px [Google, 2026]. Using the wrong dimensions can result in cropping, pixelation, or poor engagement.
              </p>

              <h3 className="text-base font-semibold text-foreground mt-6 mb-3">
                Frequently asked questions
              </h3>
              <div className="space-y-4">
                {[
                  {
                    q: "How do I resize an image online for free?",
                    a: "Upload your image to Trndinn's Image Resizer, pick a social media preset or enter custom pixel dimensions, and click Download. The resized image saves instantly — no signup, no watermark, no file size limit.",
                  },
                  {
                    q: "What size should my LinkedIn profile picture be?",
                    a: "LinkedIn recommends a profile photo of 400×400 pixels (minimum 200×200px). Use Trndinn's LinkedIn preset to resize any image to the exact dimensions in one click.",
                  },
                  {
                    q: "Does resizing reduce image quality?",
                    a: "Enlarging an image beyond its original resolution can reduce sharpness. Trndinn uses high-quality bicubic interpolation by default to minimize quality loss. For best results, start with an image larger than your target size.",
                  },
                  {
                    q: "Can I resize images without uploading to a server?",
                    a: "Yes. Trndinn's Image Resizer processes everything locally in your browser using the HTML5 Canvas API. Your images never leave your device — it works offline too.",
                  },
                  {
                    q: "What image formats are supported?",
                    a: "JPG, JPEG, PNG, WebP, GIF, BMP, and TIFF. Output is available in JPG, PNG, or WebP format.",
                  },
                ].map(({ q, a }) => (
                  <div key={q}>
                    <h4 className="text-sm font-semibold text-foreground">{q}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── More tools you'll love ── */}
            <section aria-label="Related tools">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">More image tools you&apos;ll love</h2>
                <a href="/tools/image" className="text-xs font-medium text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                  View all tools <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Image Cropper", desc: "Crop to exact dimensions", href: "/tools/image-cropper" },
                  { name: "Compress Image", desc: "Reduce file size", href: "/tools/compress-jpg" },
                  { name: "Remove Background", desc: "AI background removal", href: "/tools/background-remover" },
                  { name: "Image Converter", desc: "Convert between formats", href: "/tools/jpg-to-png" },
                ].map((t) => (
                  <a
                    key={t.name}
                    href={t.href}
                    className={cn(
                      "rounded-xl border border-[hsl(var(--tool-border))] p-4",
                      "bg-[hsl(var(--tool-surface))]",
                      "hover:border-[hsl(var(--primary)/0.3)] transition-colors",
                      "group"
                    )}
                  >
                    <p className="text-sm font-semibold text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                  </a>
                ))}
              </div>
            </section>

            {/* ── SEO footer ── */}
            <p className="text-xs leading-relaxed text-muted-foreground/70">
              Trndinn&apos;s Image Resizer is a free, browser-based tool that resizes images to any dimension instantly. All processing happens locally on your device — no files are uploaded to any server. No signup, no watermark, no usage limit. Perfect for resizing images for LinkedIn, Instagram, Twitter, YouTube, Facebook, and any other platform.
            </p>
          </main>
        </div>
      </SidebarWrapper>
    </MarketingShell>
  );
}
