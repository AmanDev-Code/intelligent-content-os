"use client";

/**
 * BackgroundRemoverView — Premium redesigned AI background removal tool.
 *
 * Matches reference design (.design-refs/14.png):
 * - ToolHero with eyebrow pill, gradient headline, 3D illustration
 * - TrustBadges row (No signup, 100% private, Images never uploaded, AI runs in browser, High quality edges)
 * - StepProgressBar (Upload Image → Process → Download)
 * - Tabbed upload (Upload Image / Paste URL / Samples) + AI Model dropdown
 * - 3-column workspace: dropzone | original+result side-by-side | Edit Options panel
 * - Big orange "Download PNG" CTA
 * - TrustStrip (Lightning fast, 100% private, No upload, High quality)
 * - Content cards (Works with any image, Perfect for, Export ready)
 *
 * Processing: @imgly/background-removal ONNX WASM — model ~43 MB, cached after first load.
 * Wrapped in MarketingShell + ImageToolsSidebar directly (not ImageToolsShell)
 * so we can use the premium ToolHero instead of the basic shell hero.
 *
 * Design tokens: --tool-bg, --tool-surface, --tool-surface-dim, --tool-border,
 *   --primary, --foreground, --muted-foreground.
 * Icons: Lucide only.
 * Motion: framer-motion, prefers-reduced-motion safe.
 * Dark mode: fully CSS-variable driven.
 */

import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Download,
  RotateCcw,
  Zap,
  Shield,
  CheckCircle2,
  AlertCircle,
  Info,
  ScanLine,
  Upload,
  Link2,
  Image as ImageIcon,
  Eye,
  Sparkles,
  MonitorSmartphone,
  Lock,
  CloudOff,
  Star,
  ArrowRight,
  Layers,
  Users,
  FileImage,
  Palette,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar } from "@/views/tools/image-tools/ImageToolsSidebar";
import { ToolHero } from "@/views/tools/shared/ToolHero";
import { TrustBadges, type TrustBadge } from "@/views/tools/shared/TrustBadges";
import { StepProgressBar, type Step } from "@/views/tools/shared/StepProgressBar";
import { TrustStrip, type TrustFeature } from "@/views/tools/shared/TrustStrip";
import { cn } from "@/lib/utils";
import type { UtilityTool } from "@/lib/image-utility-data";
import type { UtilityAlias } from "@/lib/image-utility-aliases";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  tool: UtilityTool;
  alias?: UtilityAlias;
}

type Status = "idle" | "loading-model" | "processing" | "done" | "error";
type InputTab = "upload" | "url" | "samples";
type BgMode = "transparent" | "solid" | "custom";

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const HERO_TRUST_BADGES: TrustBadge[] = [
  { icon: Zap, text: "No signup required" },
  { icon: Shield, text: "100% private" },
  { icon: CloudOff, text: "Images never uploaded" },
  { icon: ScanLine, text: "AI runs in browser" },
  { icon: Star, text: "High quality edges" },
];

const STEPS: Step[] = [
  { number: 1, label: "Upload Image" },
  { number: 2, label: "Process" },
  { number: 3, label: "Download" },
];

const TRUST_FEATURES: TrustFeature[] = [
  {
    icon: Zap,
    title: "Lightning fast",
    description: "Results in seconds",
  },
  {
    icon: Shield,
    title: "100% private",
    description: "Runs in your browser",
  },
  {
    icon: CloudOff,
    title: "No upload",
    description: "Your images never leave device",
  },
  {
    icon: Star,
    title: "High quality",
    description: "Clean edges, no artifacts",
  },
];

const SAMPLE_IMAGES = [
  { src: "/tools/samples/person-portrait.jpg", alt: "Portrait photo" },
  { src: "/tools/samples/product-shoe.jpg", alt: "Product photo" },
  { src: "/tools/samples/pet-dog.jpg", alt: "Pet photo" },
  { src: "/tools/samples/car-side.jpg", alt: "Car photo" },
  { src: "/tools/samples/food-plate.jpg", alt: "Food photo" },
  { src: "/tools/samples/logo-sample.png", alt: "Logo" },
];

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------

const SECTION_HIDDEN = { opacity: 0, y: 20 };
const SECTION_VISIBLE = { opacity: 1, y: 0 };

function AnimatedSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={SECTION_HIDDEN}
      animate={SECTION_VISIBLE}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 3D Hero Illustration
// ---------------------------------------------------------------------------

function HeroIllustration() {
  return (
    <div className="relative w-[320px] h-[260px] sm:w-[380px] sm:h-[300px]">
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* "From this" label */}
      <span
        className="absolute -top-2 left-4 text-sm italic text-muted-foreground/70 font-display"
        aria-hidden="true"
      >
        From this
      </span>

      {/* Original image card */}
      <div
        className={cn(
          "absolute left-0 top-6 h-[180px] w-[150px] sm:h-[210px] sm:w-[170px]",
          "rounded-xl overflow-hidden border-2",
          "border-[hsl(var(--tool-border))]",
          "bg-[hsl(var(--tool-surface))]",
          "shadow-xl"
        )}
      >
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-900/20 to-orange-900/20">
          <ImageIcon className="h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-foreground/80"
          style={{ background: "hsl(var(--tool-surface-dim) / 0.9)" }}
        >
          Original
        </div>
      </div>

      {/* Arrow */}
      <div className="absolute left-[155px] top-[100px] sm:left-[175px] sm:top-[110px] z-10">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
        >
          <ArrowRight className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
      </div>

      {/* "To this" label */}
      <span
        className="absolute -top-2 right-4 text-sm italic text-muted-foreground/70 font-display"
        aria-hidden="true"
      >
        To this
      </span>

      {/* Result image card */}
      <div
        className={cn(
          "absolute right-0 top-6 h-[180px] w-[150px] sm:h-[210px] sm:w-[170px]",
          "rounded-xl overflow-hidden border-2",
          "shadow-xl"
        )}
        style={{
          borderColor: "hsl(var(--primary) / 0.4)",
          backgroundImage:
            "repeating-conic-gradient(hsl(var(--tool-surface-dim)) 0% 25%, hsl(var(--tool-surface)) 0% 50%)",
          backgroundSize: "16px 16px",
        }}
      >
        <div className="flex h-full items-center justify-center">
          <ImageIcon className="h-12 w-12 text-[hsl(var(--primary))] opacity-40" aria-hidden="true" />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest"
          style={{
            background: "linear-gradient(135deg, #F97316, #F59E0B)",
            color: "white",
          }}
        >
          Transparent PNG
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BackgroundRemoverView({ tool, alias }: Props) {
  // ---- Tool state ----
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [originalSrc, setOriginalSrc] = useState<string>("");
  const [resultSrc, setResultSrc] = useState<string>("");
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [sourceFileName, setSourceFileName] = useState<string>("");

  // ---- UI state ----
  const [activeTab, setActiveTab] = useState<InputTab>("upload");
  const [urlInput, setUrlInput] = useState("");
  const [bgMode, setBgMode] = useState<BgMode>("transparent");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [refineEdges, setRefineEdges] = useState(true);
  const [removeShadows, setRemoveShadows] = useState(false);
  const [autoEnhance, setAutoEnhance] = useState(true);

  const eyebrow =
    alias?.eyebrow ?? "FREE AI BACKGROUND REMOVER — ONNX, BROWSER-LOCAL";
  const h1Prefix = alias?.h1Prefix ?? "Remove";
  const h1Highlight = alias?.h1Highlight ?? "image background";
  const h1Suffix = alias?.h1Suffix ?? "with AI — free.";
  const heroSubline =
    alias?.heroSubline ??
    "Upload an image and get a clean, transparent PNG instantly. No server upload, no signup, runs entirely in your browser using an ONNX model.";

  // ---- Derived ----
  const isProcessing = status === "loading-model" || status === "processing";
  const activeStep = status === "idle" ? 1 : status === "done" ? 3 : 2;

  // ---- Handlers ----
  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSourceFileName(file.name);
    setStatus("idle");
    setErrorMsg("");
    setProgress(0);
    setResultSrc("");
    setResultFile(null);

    const originalUrl = URL.createObjectURL(file);
    setOriginalSrc(originalUrl);

    setStatus("loading-model");
    setProgress(5);

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      setStatus("processing");
      setProgress(20);

      const resultBlob = await removeBackground(file, {
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 70) + 20;
            setProgress(Math.min(pct, 95));
          }
        },
      });

      const outputName = file.name.replace(/\.[^.]+$/, "") + "-no-bg.png";
      const outputFile = new File([resultBlob], outputName, {
        type: "image/png",
      });
      const resultUrl = URL.createObjectURL(outputFile);
      setResultSrc(resultUrl);
      setResultFile(outputFile);
      setProgress(100);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Background removal failed. Try a clear photo with a distinct subject."
      );
    }
  }, []);

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "pasted-image.png", {
            type: "image/png",
          });
          handleFilesSelected([file]);
        }
      }, "image/png");
    };
    img.onerror = () => {
      setErrorMsg("Could not load image from URL. Check the URL and try again.");
      setStatus("error");
    };
    img.src = urlInput.trim();
  }, [urlInput, handleFilesSelected]);

  const handleDownload = useCallback(() => {
    if (!resultFile) return;
    const url = URL.createObjectURL(resultFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = resultFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [resultFile]);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setOriginalSrc("");
    setResultSrc("");
    setResultFile(null);
    setErrorMsg("");
    setSourceFileName("");
    setUrlInput("");
  }, []);

  // ---- Tab items ----
  const tabs: { id: InputTab; label: string; icon: React.ElementType }[] = [
    { id: "upload", label: "Upload Image", icon: Upload },
    { id: "url", label: "Paste URL", icon: Link2 },
    { id: "samples", label: "Samples", icon: ImageIcon },
  ];

  return (
    <MarketingShell>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <ImageToolsSidebar activeSlug="background-remover" />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <main
            id="main-content"
            className="mx-auto w-full max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8"
            aria-label="Background Remover tool"
          >
            {/* ── Hero ── */}
            <ToolHero
              eyebrow={eyebrow}
              h1Prefix={h1Prefix}
              h1Highlight={h1Highlight}
              h1Suffix={h1Suffix}
              description={heroSubline}
              trustBadges={HERO_TRUST_BADGES}
            >
              <HeroIllustration />
            </ToolHero>

            {/* ── Step Progress ── */}
            <AnimatedSection delay={0.1} className="mb-8">
              <StepProgressBar steps={STEPS} activeStep={activeStep} />
            </AnimatedSection>

            {/* ── Tool Workspace ── */}
            <AnimatedSection delay={0.15}>
              <Card
                className="overflow-hidden border"
                style={{
                  background: "hsl(var(--tool-surface))",
                  borderColor: "hsl(var(--tool-border))",
                }}
              >
                <CardContent className="p-0">
                  {/* Tab bar + AI Model selector */}
                  <div
                    className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    style={{ borderColor: "hsl(var(--tool-border))" }}
                  >
                    {/* Tabs */}
                    <div className="flex gap-1">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              isActive
                                ? "text-white shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--tool-surface-dim))]"
                            )}
                            style={
                              isActive
                                ? {
                                    background:
                                      "linear-gradient(135deg, #F97316, #F59E0B)",
                                  }
                                : undefined
                            }
                            aria-pressed={isActive}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* AI Model dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        AI Model (ONNX)
                      </span>
                      <select
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-medium",
                          "bg-[hsl(var(--tool-surface-dim))] text-foreground",
                          "border-[hsl(var(--tool-border))]",
                          "focus:outline-none focus:ring-2 focus:ring-ring"
                        )}
                        defaultValue="default"
                        aria-label="Select AI model"
                      >
                        <option value="default">Default (Best)</option>
                      </select>
                    </div>
                  </div>

                  {/* Workspace content — 3-column layout on desktop */}
                  <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_1fr_280px]">
                    {/* Left: Upload area / URL input / Samples */}
                    <div
                      className="border-b p-4 sm:p-6 lg:border-b-0 lg:border-r"
                      style={{ borderColor: "hsl(var(--tool-border))" }}
                    >
                      {/* Model notice */}
                      <Alert
                        className="mb-4 border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))]"
                      >
                        <Info className="h-4 w-4" aria-hidden="true" />
                        <AlertDescription className="text-xs text-muted-foreground">
                          <strong className="text-foreground">First use:</strong>{" "}
                          downloads AI model (~43 MB). Cached after — future uses
                          are instant.
                        </AlertDescription>
                      </Alert>

                      {/* Tab: Upload */}
                      {activeTab === "upload" && !isProcessing && status !== "done" && (
                        <div>
                          <ImageDropzone
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            multiple={false}
                            maxSizeMB={25}
                            onFilesSelected={handleFilesSelected}
                            disabled={false}
                          />
                        </div>
                      )}

                      {/* Tab: Paste URL */}
                      {activeTab === "url" && !isProcessing && status !== "done" && (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={urlInput}
                              onChange={(e) => setUrlInput(e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className={cn(
                                "flex-1 rounded-lg border px-3 py-2.5 text-sm",
                                "bg-[hsl(var(--tool-surface-dim))] text-foreground",
                                "border-[hsl(var(--tool-border))]",
                                "placeholder:text-muted-foreground/50",
                                "focus:outline-none focus:ring-2 focus:ring-ring"
                              )}
                              aria-label="Image URL"
                            />
                            <Button
                              onClick={handleUrlSubmit}
                              disabled={!urlInput.trim()}
                              className="shrink-0 font-semibold text-white"
                              style={{
                                background:
                                  "linear-gradient(135deg, #F97316, #F59E0B)",
                              }}
                            >
                              Load
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Paste a direct link to a JPG, PNG, or WebP image
                          </p>
                        </div>
                      )}

                      {/* Tab: Samples */}
                      {activeTab === "samples" && !isProcessing && status !== "done" && (
                        <div>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Try a sample image
                          </p>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                            {SAMPLE_IMAGES.map((sample) => (
                              <button
                                key={sample.src}
                                className={cn(
                                  "aspect-square overflow-hidden rounded-lg border",
                                  "border-[hsl(var(--tool-border))]",
                                  "bg-[hsl(var(--tool-surface-dim))]",
                                  "transition-all hover:border-[hsl(var(--primary))] hover:scale-105",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                )}
                                aria-label={`Use ${sample.alt}`}
                                onClick={() => {
                                  /* Samples are placeholders — would fetch the file */
                                }}
                              >
                                <div className="flex h-full items-center justify-center">
                                  <FileImage
                                    className="h-6 w-6 text-muted-foreground/40"
                                    aria-hidden="true"
                                  />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Progress — loading model or processing */}
                      {isProcessing && (
                        <div
                          className="space-y-3"
                          aria-live="polite"
                          aria-busy="true"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent shrink-0"
                              aria-hidden="true"
                            />
                            <span className="text-sm text-foreground font-medium">
                              {status === "loading-model"
                                ? "Loading AI model… (first run downloads ~43 MB)"
                                : "Removing background…"}
                            </span>
                          </div>
                          <Progress
                            value={progress}
                            className="h-2"
                            aria-label={`Progress: ${progress}%`}
                          />
                          <p className="text-xs text-muted-foreground">
                            {progress}% complete
                          </p>
                        </div>
                      )}

                      {/* Error */}
                      {status === "error" && (
                        <div className="space-y-4">
                          <Alert
                            variant="destructive"
                            role="alert"
                            aria-live="assertive"
                          >
                            <AlertCircle
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            <AlertDescription>{errorMsg}</AlertDescription>
                          </Alert>
                          <Button
                            onClick={handleReset}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <RotateCcw
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            Try another image
                          </Button>
                        </div>
                      )}

                      {/* Sample strip below dropzone */}
                      {activeTab === "upload" &&
                        status === "idle" && (
                          <div className="mt-4 flex items-center gap-2">
                            {SAMPLE_IMAGES.slice(0, 6).map((sample, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-10 w-10 shrink-0 rounded-lg overflow-hidden",
                                  "border border-[hsl(var(--tool-border))]",
                                  "bg-[hsl(var(--tool-surface-dim))]",
                                  "transition-colors hover:border-[hsl(var(--primary)/0.4)]"
                                )}
                              >
                                <div className="flex h-full items-center justify-center">
                                  <FileImage
                                    className="h-4 w-4 text-muted-foreground/30"
                                    aria-hidden="true"
                                  />
                                </div>
                              </div>
                            ))}
                            <button
                              className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                                "border border-dashed border-[hsl(var(--tool-border))]",
                                "text-muted-foreground/50 hover:text-muted-foreground",
                                "transition-colors hover:border-[hsl(var(--primary)/0.3)]"
                              )}
                              aria-label="More samples"
                              onClick={() => setActiveTab("samples")}
                            >
                              +
                            </button>
                          </div>
                        )}
                    </div>

                    {/* Center: Original + Result side-by-side */}
                    <div
                      className="border-b p-4 sm:p-6 lg:border-b-0 lg:border-r"
                      style={{ borderColor: "hsl(var(--tool-border))" }}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {/* Original */}
                        <div>
                          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Original Image
                          </p>
                          <div
                            className={cn(
                              "aspect-square rounded-xl overflow-hidden flex items-center justify-center",
                              "border border-[hsl(var(--tool-border))]",
                              "bg-[hsl(var(--tool-surface-dim))]"
                            )}
                          >
                            {originalSrc ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={originalSrc}
                                alt={`Original: ${sourceFileName}`}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                                <ImageIcon
                                  className="h-10 w-10"
                                  aria-hidden="true"
                                />
                                <span className="text-[10px] uppercase tracking-widest">
                                  Original
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Result */}
                        <div>
                          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Background Removed
                          </p>
                          <div
                            className={cn(
                              "aspect-square rounded-xl overflow-hidden flex items-center justify-center",
                              "border border-[hsl(var(--tool-border))]"
                            )}
                            style={{
                              backgroundImage:
                                "repeating-conic-gradient(hsl(var(--tool-surface-dim)) 0% 25%, hsl(var(--tool-surface)) 0% 50%)",
                              backgroundSize: "16px 16px",
                            }}
                          >
                            {resultSrc ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={resultSrc}
                                alt="Background removed — transparent PNG"
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                                <Eye
                                  className="h-10 w-10"
                                  aria-hidden="true"
                                />
                                <span className="text-[10px] uppercase tracking-widest">
                                  Result
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Success badge */}
                      {status === "done" && (
                        <div className="mt-3 flex items-center gap-2">
                          <CheckCircle2
                            className="h-4 w-4 text-emerald-500"
                            aria-hidden="true"
                          />
                          <span className="text-xs font-semibold text-emerald-500">
                            Background removed successfully
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Edit Options panel */}
                    <div className="p-4 sm:p-6">
                      <h3 className="mb-4 text-sm font-bold text-foreground">
                        Edit Options
                      </h3>

                      {/* Background mode */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Background
                        </p>

                        {(
                          [
                            { id: "transparent" as const, label: "Transparent" },
                            { id: "solid" as const, label: "Solid color" },
                            { id: "custom" as const, label: "Custom color" },
                          ] as const
                        ).map((option) => (
                          <label
                            key={option.id}
                            className={cn(
                              "flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 transition-colors",
                              bgMode === option.id
                                ? "bg-[hsl(var(--primary)/0.1)]"
                                : "hover:bg-[hsl(var(--tool-surface-dim))]"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                bgMode === option.id
                                  ? "border-[hsl(var(--primary))]"
                                  : "border-[hsl(var(--tool-border))]"
                              )}
                            >
                              {bgMode === option.id && (
                                <div
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #F97316, #F59E0B)",
                                  }}
                                />
                              )}
                            </div>
                            <span className="text-sm text-foreground">
                              {option.label}
                            </span>
                            <input
                              type="radio"
                              name="bg-mode"
                              value={option.id}
                              checked={bgMode === option.id}
                              onChange={() => setBgMode(option.id)}
                              className="sr-only"
                            />
                          </label>
                        ))}

                        {/* Color picker for custom */}
                        {bgMode === "custom" && (
                          <div className="ml-8 flex items-center gap-2">
                            <input
                              type="color"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
                              aria-label="Custom background color"
                            />
                            <input
                              type="text"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              className={cn(
                                "w-24 rounded-lg border px-2 py-1 text-xs font-mono",
                                "bg-[hsl(var(--tool-surface-dim))] text-foreground",
                                "border-[hsl(var(--tool-border))]"
                              )}
                              aria-label="Hex color value"
                            />
                          </div>
                        )}
                      </div>

                      <Separator className="my-4" />

                      {/* Toggle options */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <Label
                            htmlFor="refine-edges"
                            className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                          >
                            <Sparkles
                              className="h-4 w-4 text-[hsl(var(--primary))]"
                              aria-hidden="true"
                            />
                            Refine edges
                          </Label>
                          <Switch
                            id="refine-edges"
                            checked={refineEdges}
                            onCheckedChange={setRefineEdges}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <Label
                            htmlFor="remove-shadows"
                            className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                          >
                            <Sparkles
                              className="h-4 w-4 text-[hsl(var(--primary))]"
                              aria-hidden="true"
                            />
                            Remove shadows
                          </Label>
                          <Switch
                            id="remove-shadows"
                            checked={removeShadows}
                            onCheckedChange={setRemoveShadows}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <Label
                            htmlFor="auto-enhance"
                            className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                          >
                            <Sparkles
                              className="h-4 w-4 text-[hsl(var(--primary))]"
                              aria-hidden="true"
                            />
                            Auto enhance
                          </Label>
                          <Switch
                            id="auto-enhance"
                            checked={autoEnhance}
                            onCheckedChange={setAutoEnhance}
                          />
                        </div>
                      </div>

                      <Separator className="my-4" />

                      {/* Download CTA */}
                      <button
                        onClick={handleDownload}
                        disabled={!resultFile}
                        className={cn(
                          "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          !resultFile && "opacity-50 cursor-not-allowed"
                        )}
                        style={{
                          background:
                            "linear-gradient(135deg, #F97316, #F59E0B)",
                        }}
                        aria-label="Download transparent PNG"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download PNG
                      </button>

                      {/* Try another */}
                      {status === "done" && (
                        <Button
                          onClick={handleReset}
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full gap-2"
                        >
                          <RotateCcw
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          Try another image
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* ── Trust Strip ── */}
            <AnimatedSection delay={0.2} className="mt-10">
              <TrustStrip features={TRUST_FEATURES} />
            </AnimatedSection>

            {/* ── Content Cards ── */}
            <AnimatedSection delay={0.25} className="mt-10">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Works with any image */}
                <Card
                  className="overflow-hidden border"
                  style={{
                    background: "hsl(var(--tool-surface))",
                    borderColor: "hsl(var(--tool-border))",
                  }}
                >
                  <CardContent className="p-5">
                    <h3 className="text-base font-bold text-foreground mb-2">
                      Works with any image
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      People, products, logos, illustrations and more.
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[Users, Layers, Palette].map((Icon, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded-lg",
                            "bg-[hsl(var(--tool-surface-dim))]",
                            "border border-[hsl(var(--tool-border))]"
                          )}
                        >
                          <Icon
                            className="h-6 w-6 text-muted-foreground/40"
                            aria-hidden="true"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Perfect for */}
                <Card
                  className="overflow-hidden border"
                  style={{
                    background: "hsl(var(--tool-surface))",
                    borderColor: "hsl(var(--tool-border))",
                  }}
                >
                  <CardContent className="p-5">
                    <h3 className="text-base font-bold text-foreground mb-2">
                      Perfect for
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      E-commerce, social media, profile pictures, and
                      thumbnails.
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[MonitorSmartphone, Users, ImageIcon].map((Icon, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded-lg",
                            "bg-[hsl(var(--tool-surface-dim))]",
                            "border border-[hsl(var(--tool-border))]"
                          )}
                        >
                          <Icon
                            className="h-6 w-6 text-muted-foreground/40"
                            aria-hidden="true"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Export ready */}
                <Card
                  className="overflow-hidden border"
                  style={{
                    background: "hsl(var(--tool-surface))",
                    borderColor: "hsl(var(--tool-border))",
                  }}
                >
                  <CardContent className="p-5">
                    <h3 className="text-base font-bold text-foreground mb-2">
                      Export ready
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Clean transparent PNG with high-quality edges.
                    </p>
                    <div className="mt-4 flex gap-2">
                      {["PNG", "JPG", "WEBP"].map((fmt) => (
                        <span
                          key={fmt}
                          className={cn(
                            "inline-flex items-center justify-center rounded-lg px-4 py-2",
                            "text-xs font-bold uppercase tracking-wider text-white"
                          )}
                          style={{
                            background:
                              fmt === "PNG"
                                ? "#3B82F6"
                                : fmt === "JPG"
                                ? "#EF4444"
                                : "#10B981",
                          }}
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>

            {/* ── FAQ ── */}
            {tool.faqs && tool.faqs.length > 0 && (
              <AnimatedSection delay={0.3} className="mt-10">
                <section aria-labelledby="faq-heading">
                  <h2
                    id="faq-heading"
                    className="mb-4 text-lg font-bold text-foreground font-display"
                  >
                    Frequently asked questions
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {tool.faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="text-sm font-medium text-foreground text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              </AnimatedSection>
            )}

            {/* ── SEO footer ── */}
            <AnimatedSection delay={0.35} className="mt-10">
              <Separator className="mb-6" />
              <p className="text-xs leading-relaxed text-muted-foreground/70">
                Trndinn&apos;s Background Remover is a free, browser-based AI
                tool powered by ONNX WebAssembly. All processing happens locally
                on your device — no files are uploaded to any server. No signup,
                no watermark, no usage limit.
              </p>
            </AnimatedSection>
          </main>
        </div>
      </div>
    </MarketingShell>
  );
}
