"use client";

/**
 * Base64ToImageView — Premium redesign of the Base64 to Image decoder.
 *
 * Uses direct MarketingShell + ImageToolsSidebar (not ImageToolsShell)
 * so we can render the premium ToolHero, StepProgressBar, TrustBadges,
 * TrustStrip, and custom workspace layout.
 *
 * Shadcn primitives: Card, CardContent, Button, Badge, Tabs, TabsList,
 *   TabsTrigger, TabsContent.
 * Design tokens: --tool-bg, --tool-surface, --tool-surface-dim,
 *   --tool-border, --primary, --foreground, --muted-foreground.
 * Icons: Lucide only.
 * Processing: pure atob() browser API — no server, no upload.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Zap,
  Shield,
  Monitor,
  Lock,
  FileCode2,
  Image as ImageIcon,
  Sparkles,
  Code2,
  Upload,
  Play,
  Trash2,
  Info,
  ArrowRight,
  FileImage,
  Layers,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar, SidebarWrapper } from "@/views/tools/image-tools/ImageToolsSidebar";
import { ToolHero } from "@/views/tools/shared/ToolHero";
import { TrustBadges, type TrustBadge } from "@/views/tools/shared/TrustBadges";
import { StepProgressBar, type Step } from "@/views/tools/shared/StepProgressBar";
import { TrustStrip, type TrustFeature } from "@/views/tools/shared/TrustStrip";

import type { UtilityTool } from "@/lib/image-utility-data";
import type { UtilityAlias } from "@/lib/image-utility-aliases";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  tool: UtilityTool;
  alias?: UtilityAlias;
}

type OutputFormat = "png" | "jpg";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HERO_BADGES: TrustBadge[] = [
  { icon: Zap, text: "No signup required" },
  { icon: Lock, text: "100% private" },
  { icon: Monitor, text: "Runs in browser" },
  { icon: Shield, text: "Supports data URI & raw" },
];

const STEPS: Step[] = [
  { number: 1, label: "Paste Base64" },
  { number: 2, label: "Configure" },
  { number: 3, label: "Download" },
];

const TRUST_FEATURES: TrustFeature[] = [
  {
    icon: Zap,
    title: "Instant decoding",
    description: "Get your image in seconds.",
  },
  {
    icon: Shield,
    title: "100% private",
    description: "Everything runs in your browser.",
  },
  {
    icon: Lock,
    title: "No upload required",
    description: "Your data never leaves your device.",
  },
  {
    icon: CheckCircle2,
    title: "Supports all formats",
    description: "Works with PNG, JPG, WebP and more.",
  },
];

const SAMPLE_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVQYV2P8z8BQz0AEYBxVOHIUAgBGWAkFdPb0jgAAAABJRU5ErkJggg==";

// ---------------------------------------------------------------------------
// Core logic — pure browser atob()
// ---------------------------------------------------------------------------

function fromBase64(base64: string, outputFormat: OutputFormat): { file: File; dataUrl: string } {
  const clean = base64.trim();
  const dataUri = clean.startsWith("data:") ? clean : `data:image/png;base64,${clean}`;

  const arr = dataUri.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const detectedMime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  // If output format differs from detected, we keep the detected for the file
  // but name according to user's choice
  const mime = outputFormat === "jpg" ? "image/jpeg" : detectedMime;
  const ext = outputFormat === "jpg" ? "jpg" : detectedMime.split("/")[1] ?? "png";
  const file = new File([u8arr], `decoded-image.${ext}`, { type: mime });
  const dataUrl = dataUri;

  return { file, dataUrl };
}

/** Format bytes to human string */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// 3D Illustration
// ---------------------------------------------------------------------------

function HeroIllustration() {
  const reduced = useReducedMotion();

  return (
    <div className="relative h-[280px] w-[340px]" aria-hidden="true">
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3) 0%, transparent 70%)",
        }}
      />

      {/* Base64 Input card */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 20, rotate: -3 }}
        animate={reduced ? {} : { opacity: 1, y: 0, rotate: -3 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={cn(
          "absolute left-0 top-4 w-[200px] rounded-xl p-3",
          "border border-[hsl(var(--tool-border))]",
          "bg-[hsl(var(--tool-surface))]",
          "shadow-lg"
        )}
      >
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          Base64 Input
        </p>
        <div className="space-y-0.5 font-mono text-[9px] text-muted-foreground/70 leading-relaxed">
          <p>data:image/png;base64,</p>
          <p>iVBORw0KGgoAAAANSUhEUgAA...</p>
          <p className="text-muted-foreground/40">...</p>
        </div>
      </motion.div>

      {/* Decoded Image label card */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: -20, rotate: 3 }}
        animate={reduced ? {} : { opacity: 1, y: 0, rotate: 3 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className={cn(
          "absolute right-0 top-0 rounded-xl px-3 py-2",
          "border border-[hsl(var(--primary)/0.3)]",
          "bg-[hsl(var(--primary)/0.1)]",
          "shadow-lg"
        )}
      >
        <p className="text-xs font-bold text-[hsl(var(--primary))]">
          Decoded Image
        </p>
      </motion.div>

      {/* Format badges */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, scale: 0.8 }}
        animate={reduced ? {} : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute bottom-8 right-2 flex gap-2"
      >
        <span
          className="rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
        >
          PNG
        </span>
        <span
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-bold shadow-lg",
            "border border-[hsl(var(--tool-border))]",
            "bg-[hsl(var(--tool-surface))]",
            "text-foreground"
          )}
        >
          JPG
        </span>
      </motion.div>

      {/* Decorative sparkle */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, rotate: -45 }}
        animate={reduced ? {} : { opacity: 0.6, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute right-12 top-20"
      >
        <Sparkles className="h-6 w-6 text-[hsl(var(--primary)/0.5)]" />
      </motion.div>

      {/* Image placeholder card */}
      <motion.div
        initial={reduced ? {} : { opacity: 0, x: 20 }}
        animate={reduced ? {} : { opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className={cn(
          "absolute bottom-16 left-12 flex h-[100px] w-[140px] items-center justify-center rounded-xl",
          "border border-[hsl(var(--tool-border))]",
          "bg-[hsl(var(--tool-surface-dim))]",
          "shadow-lg"
        )}
      >
        <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Line Numbers for code editor
// ---------------------------------------------------------------------------

function LineNumbers({ count }: { count: number }) {
  return (
    <div
      className="select-none pr-3 text-right font-mono text-xs leading-[1.625rem] text-muted-foreground/40"
      aria-hidden="true"
    >
      {Array.from({ length: Math.max(count, 5) }, (_, i) => (
        <div key={i + 1}>{i + 1}</div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Base64ToImageView({ tool, alias }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [decodedFile, setDecodedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isDone, setIsDone] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");
  const [activeTab, setActiveTab] = useState("paste");
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reduced = useReducedMotion();

  const eyebrow =
    alias?.eyebrow ?? "FREE BASE64 TO IMAGE DECODER — BROWSER-BASED";
  const h1Prefix = alias?.h1Prefix ?? "Decode";
  const h1Highlight = alias?.h1Highlight ?? "Base64";
  const h1Suffix = alias?.h1Suffix ?? "to image — free, instant.";
  const heroDescription =
    alias?.heroSubline ??
    "Paste any Base64 string (data URI or raw) and instantly preview the decoded image. Download as PNG or JPG — runs entirely in your browser. No upload, no signup.";

  const charCount = inputValue.length;
  const lineCount = useMemo(
    () => (inputValue ? inputValue.split("\n").length : 1),
    [inputValue]
  );

  const activeStep = isDone ? 3 : inputValue.trim() ? 2 : 1;

  // Load dimensions on preview
  useEffect(() => {
    if (!previewSrc) {
      setImageDimensions(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = previewSrc;
  }, [previewSrc]);

  const handleDecode = useCallback(() => {
    setError("");
    setPreviewSrc("");
    setDecodedFile(null);
    setIsDone(false);
    setImageDimensions(null);

    if (!inputValue.trim()) {
      setError("Please paste a Base64 data URI string first.");
      return;
    }

    try {
      const { file, dataUrl } = fromBase64(inputValue, outputFormat);
      const objectUrl = URL.createObjectURL(file);
      setPreviewSrc(objectUrl);
      setDecodedFile(file);
      setIsDone(true);
    } catch {
      setError(
        "Failed to decode the Base64 string. Make sure it is a valid data URI (data:image/...;base64,...) or a raw Base64 string."
      );
    }
  }, [inputValue, outputFormat]);

  const handleDownload = useCallback(() => {
    if (!decodedFile) return;
    const url = URL.createObjectURL(decodedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = decodedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [decodedFile]);

  const handleReset = useCallback(() => {
    setInputValue("");
    setPreviewSrc("");
    setDecodedFile(null);
    setError("");
    setIsDone(false);
    setImageDimensions(null);
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setInputValue(text);
        setActiveTab("paste");
      };
      reader.readAsText(file);
    },
    []
  );

  const handleTrySample = useCallback(() => {
    setInputValue(SAMPLE_BASE64);
    setActiveTab("paste");
  }, []);

  const handleClear = useCallback(() => {
    handleReset();
  }, [handleReset]);

  const detectedFormat = useMemo(() => {
    if (!decodedFile) return "-";
    const type = decodedFile.type;
    if (type.includes("png")) return "PNG";
    if (type.includes("jpeg") || type.includes("jpg")) return "JPG";
    if (type.includes("webp")) return "WebP";
    if (type.includes("gif")) return "GIF";
    return type.split("/")[1]?.toUpperCase() ?? "-";
  }, [decodedFile]);

  return (
    <MarketingShell>
      <SidebarWrapper>
        {/* Left sidebar */}
        <ImageToolsSidebar activeSlug="base64-to-image" />

        {/* Main content */}
        <div className="flex-1 min-w-0 bg-[hsl(var(--tool-bg))]">
          <main
            id="main-content"
            className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8"
            aria-label="Base64 to Image Decoder tool"
          >
            {/* ── Premium Hero ── */}
            <ToolHero
              eyebrow={eyebrow}
              h1Prefix={h1Prefix}
              h1Highlight={h1Highlight}
              h1Suffix={h1Suffix}
              description={heroDescription}
              trustBadges={HERO_BADGES}
            >
              <HeroIllustration />
            </ToolHero>

            {/* ── Tool Workspace ── */}
            <section
              aria-label="Base64 to image decoder workspace"
              className="mt-6 space-y-6 pb-16"
            >
              {/* Step Progress Bar */}
              <StepProgressBar steps={STEPS} activeStep={activeStep} />

              {/* Main workspace card */}
              <Card
                className={cn(
                  "overflow-hidden border-[hsl(var(--tool-border))]",
                  "bg-[hsl(var(--tool-surface))]"
                )}
              >
                <CardContent className="p-0">
                  {/* Tabbed input header */}
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <div className="border-b border-[hsl(var(--tool-border))]">
                      <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-0 bg-transparent p-0">
                        <TabsTrigger
                          value="paste"
                          className={cn(
                            "relative rounded-none border-0 px-5 py-3.5 text-sm font-medium",
                            "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                            "text-muted-foreground data-[state=active]:text-foreground"
                          )}
                          style={
                            activeTab === "paste"
                              ? {
                                  background:
                                    "linear-gradient(135deg, #F97316, #F59E0B)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  backgroundClip: "text",
                                }
                              : undefined
                          }
                        >
                          <Code2 className="mr-2 h-4 w-4" style={
                            activeTab === "paste"
                              ? { color: "#F97316" }
                              : undefined
                          } />
                          Paste Base64
                          {activeTab === "paste" && (
                            <motion.div
                              layoutId="tab-indicator"
                              className="absolute bottom-0 left-0 right-0 h-0.5"
                              style={{
                                background:
                                  "linear-gradient(135deg, #F97316, #F59E0B)",
                              }}
                            />
                          )}
                        </TabsTrigger>

                        <TabsTrigger
                          value="upload"
                          className={cn(
                            "relative rounded-none border-0 px-5 py-3.5 text-sm font-medium",
                            "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                            "text-muted-foreground data-[state=active]:text-foreground"
                          )}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload File
                          {activeTab === "upload" && (
                            <motion.div
                              layoutId="tab-indicator"
                              className="absolute bottom-0 left-0 right-0 h-0.5"
                              style={{
                                background:
                                  "linear-gradient(135deg, #F97316, #F59E0B)",
                              }}
                            />
                          )}
                        </TabsTrigger>

                        <TabsTrigger
                          value="sample"
                          className={cn(
                            "relative rounded-none border-0 px-5 py-3.5 text-sm font-medium",
                            "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                            "text-muted-foreground data-[state=active]:text-foreground"
                          )}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Try Sample
                          {activeTab === "sample" && (
                            <motion.div
                              layoutId="tab-indicator"
                              className="absolute bottom-0 left-0 right-0 h-0.5"
                              style={{
                                background:
                                  "linear-gradient(135deg, #F97316, #F59E0B)",
                              }}
                            />
                          )}
                        </TabsTrigger>

                        <TabsTrigger
                          value="clear"
                          className={cn(
                            "relative rounded-none border-0 px-5 py-3.5 text-sm font-medium",
                            "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                            "text-muted-foreground data-[state=active]:text-foreground"
                          )}
                          onClick={handleClear}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Tab content area + preview panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px]">
                      {/* Left: input area */}
                      <div className="border-r border-[hsl(var(--tool-border))] p-4 sm:p-6">
                        <TabsContent value="paste" className="mt-0">
                          {/* Code editor with line numbers */}
                          <div
                            className={cn(
                              "flex rounded-lg border border-[hsl(var(--tool-border))]",
                              "bg-[hsl(var(--tool-surface-dim))]",
                              "overflow-hidden"
                            )}
                          >
                            <LineNumbers count={lineCount} />
                            <textarea
                              ref={textareaRef}
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              placeholder="Paste your Base64 string here..."
                              rows={10}
                              disabled={isDone}
                              className={cn(
                                "flex-1 resize-none bg-transparent py-1.5 pr-4 font-mono text-xs",
                                "leading-[1.625rem] text-foreground",
                                "placeholder:text-muted-foreground/40",
                                "focus:outline-none",
                                "disabled:opacity-50"
                              )}
                              aria-label="Base64 input"
                              aria-describedby="base64-hint"
                            />
                          </div>

                          {/* Info row below textarea */}
                          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Info className="h-3 w-3" aria-hidden="true" />
                              Supports full data URIs or raw Base64 strings
                              (defaults to PNG if no MIME prefix).
                            </span>
                            <span id="base64-hint">
                              {charCount.toLocaleString()} characters
                            </span>
                          </div>
                        </TabsContent>

                        <TabsContent value="upload" className="mt-0">
                          <div
                            className={cn(
                              "flex flex-col items-center justify-center gap-3",
                              "rounded-lg border-2 border-dashed border-[hsl(var(--tool-border))]",
                              "bg-[hsl(var(--tool-surface-dim))]",
                              "p-10",
                              "transition-colors hover:border-[hsl(var(--primary)/0.3)]"
                            )}
                          >
                            <Upload className="h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                              Upload a text file containing Base64 data
                            </p>
                            <label className="cursor-pointer">
                              <span
                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #F97316, #F59E0B)",
                                }}
                              >
                                Choose file
                              </span>
                              <input
                                type="file"
                                accept=".txt,.b64,.base64,.text"
                                onChange={handleFileUpload}
                                className="sr-only"
                                aria-label="Upload Base64 file"
                              />
                            </label>
                          </div>
                        </TabsContent>

                        <TabsContent value="sample" className="mt-0">
                          <div
                            className={cn(
                              "flex flex-col items-center justify-center gap-3",
                              "rounded-lg border border-[hsl(var(--tool-border))]",
                              "bg-[hsl(var(--tool-surface-dim))]",
                              "p-10"
                            )}
                          >
                            <Play className="h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                              Load a sample Base64 string to try the decoder
                            </p>
                            <Button
                              onClick={handleTrySample}
                              className="font-semibold text-white"
                              style={{
                                background:
                                  "linear-gradient(135deg, #F97316, #F59E0B)",
                              }}
                            >
                              Load sample
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="clear" className="mt-0">
                          <div
                            className={cn(
                              "flex flex-col items-center justify-center gap-3",
                              "rounded-lg border border-[hsl(var(--tool-border))]",
                              "bg-[hsl(var(--tool-surface-dim))]",
                              "p-10"
                            )}
                          >
                            <Trash2 className="h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                              {inputValue
                                ? "Input cleared. Switch to Paste Base64 to start fresh."
                                : "Nothing to clear. Paste some Base64 data to get started."}
                            </p>
                          </div>
                        </TabsContent>

                        {/* Output Format toggle */}
                        <div className="mt-4">
                          <p className="mb-2 text-sm font-semibold text-foreground">
                            Output Format
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setOutputFormat("png")}
                              className={cn(
                                "rounded-lg px-5 py-2 text-sm font-bold transition-all",
                                outputFormat === "png"
                                  ? "text-white shadow-md"
                                  : "border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))] text-muted-foreground hover:text-foreground"
                              )}
                              style={
                                outputFormat === "png"
                                  ? {
                                      background:
                                        "linear-gradient(135deg, #F97316, #F59E0B)",
                                    }
                                  : undefined
                              }
                              aria-pressed={outputFormat === "png"}
                            >
                              PNG
                            </button>
                            <button
                              onClick={() => setOutputFormat("jpg")}
                              className={cn(
                                "rounded-lg px-5 py-2 text-sm font-bold transition-all",
                                outputFormat === "jpg"
                                  ? "text-white shadow-md"
                                  : "border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))] text-muted-foreground hover:text-foreground"
                              )}
                              style={
                                outputFormat === "jpg"
                                  ? {
                                      background:
                                        "linear-gradient(135deg, #F97316, #F59E0B)",
                                    }
                                  : undefined
                              }
                              aria-pressed={outputFormat === "jpg"}
                            >
                              JPG
                            </button>
                          </div>
                        </div>

                        {/* Error */}
                        {error && (
                          <Alert
                            variant="destructive"
                            role="alert"
                            aria-live="assertive"
                            className="mt-4"
                          >
                            <AlertCircle
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        {/* Decode CTA */}
                        <button
                          onClick={isDone ? handleReset : handleDecode}
                          disabled={!isDone && !inputValue.trim()}
                          className={cn(
                            "mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white transition-all",
                            "disabled:cursor-not-allowed disabled:opacity-40",
                            "hover:shadow-lg hover:shadow-[#F97316]/20"
                          )}
                          style={{
                            background:
                              "linear-gradient(135deg, #F97316, #F59E0B)",
                          }}
                          aria-label={
                            isDone
                              ? "Reset and decode another"
                              : "Decode Base64 to image"
                          }
                        >
                          {isDone ? (
                            <>
                              <RotateCcw
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              Decode Another
                            </>
                          ) : (
                            <>
                              <Sparkles
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              Decode Image
                              <ArrowRight
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </>
                          )}
                        </button>
                      </div>

                      {/* Right: Image Preview panel */}
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base font-semibold text-foreground">
                            Image Preview
                          </h3>
                          {!isDone && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-medium"
                            >
                              Waiting for input
                            </Badge>
                          )}
                        </div>

                        {/* Preview area */}
                        <div
                          className={cn(
                            "flex min-h-[200px] items-center justify-center rounded-xl",
                            "border border-dashed border-[hsl(var(--tool-border))]",
                            "bg-[hsl(var(--tool-surface-dim))]",
                            "overflow-hidden"
                          )}
                        >
                          {isDone && previewSrc ? (
                            <img
                              ref={previewImgRef}
                              src={previewSrc}
                              alt="Decoded image preview"
                              className="max-h-[240px] max-w-full rounded-lg object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-3 p-8 text-center">
                              <div
                                className={cn(
                                  "flex h-14 w-14 items-center justify-center rounded-xl",
                                  "bg-[hsl(var(--tool-surface))]"
                                )}
                              >
                                <ImageIcon className="h-7 w-7 text-muted-foreground/40" />
                              </div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Your decoded image will appear here
                              </p>
                              <p className="text-xs text-muted-foreground/60">
                                Paste a Base64 string and click decode to preview
                                the image.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Image Info */}
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-semibold text-foreground">
                            Image Info
                          </h4>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Dimensions
                              </span>
                              <span className="font-medium text-foreground">
                                {imageDimensions
                                  ? `${imageDimensions.width} x ${imageDimensions.height}`
                                  : "–"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                File size
                              </span>
                              <span className="font-medium text-foreground">
                                {decodedFile
                                  ? formatBytes(decodedFile.size)
                                  : "–"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Format
                              </span>
                              <span className="font-medium text-foreground">
                                {detectedFormat}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Download button */}
                        <Button
                          onClick={handleDownload}
                          disabled={!decodedFile}
                          variant="outline"
                          className={cn(
                            "mt-4 w-full gap-2 font-semibold",
                            "border-[hsl(var(--tool-border))]",
                            "disabled:opacity-40"
                          )}
                          aria-label="Download decoded image"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Trust Strip */}
              <TrustStrip features={TRUST_FEATURES} className="mt-8" />

              {/* Content: What is Base64? + Cross-link */}
              <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* What is Base64? card */}
                <Card
                  className={cn(
                    "overflow-hidden border-[hsl(var(--tool-border))]",
                    "bg-[hsl(var(--tool-surface))]"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold font-display text-foreground">
                          What is Base64?
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          Base64 is a text-based encoding format that converts
                          binary data (such as images) into a string of ASCII
                          characters. It&apos;s commonly used in web development
                          to embed images directly in HTML, CSS or JSON.
                        </p>
                        <a
                          href="#"
                          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[hsl(var(--primary))] hover:underline"
                        >
                          Learn more
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <div
                        className={cn(
                          "hidden shrink-0 items-center justify-center rounded-xl sm:flex",
                          "h-20 w-20",
                          "bg-[hsl(var(--primary)/0.08)]"
                        )}
                      >
                        <FileCode2 className="h-10 w-10 text-[hsl(var(--primary)/0.5)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Need to encode? cross-link card */}
                <Card
                  className={cn(
                    "overflow-hidden border-[hsl(var(--tool-border))]",
                    "bg-[hsl(var(--tool-surface))]"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold font-display text-foreground">
                          Need to encode an image instead?
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          Convert your image to a Base64 string with our image
                          encoder tool &mdash; also free and browser-based.
                        </p>
                        <a
                          href="/tools/image-to-base64"
                          className={cn(
                            "mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white",
                            "hover:shadow-lg hover:shadow-[#F97316]/20 transition-shadow"
                          )}
                          style={{
                            background:
                              "linear-gradient(135deg, #F97316, #F59E0B)",
                          }}
                        >
                          Go to Image to Base64
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </div>
                      <div
                        className={cn(
                          "hidden shrink-0 items-center justify-center rounded-xl sm:flex",
                          "h-20 w-20",
                          "bg-[hsl(var(--primary)/0.08)]"
                        )}
                      >
                        <Layers className="h-10 w-10 text-[hsl(var(--primary)/0.5)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── FAQ ── */}
              <section
                aria-labelledby="b64-faq-heading"
                className="mt-8"
              >
                <h2 id="b64-faq-heading" className="text-lg font-bold text-foreground font-display mb-4">
                  Frequently asked questions
                </h2>
                <div className="space-y-4">
                  <div className="rounded-xl border p-4" style={{ background: "hsl(var(--tool-surface))", borderColor: "hsl(var(--tool-border))" }}>
                    <h3 className="text-sm font-semibold text-foreground">How do I decode a Base64 string to an image?</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Paste the Base64 string (with or without the data:image/... prefix) into the text area and click &quot;Decode Image.&quot; The decoded image appears instantly in the preview panel. Download as PNG or JPG.</p>
                  </div>
                  <div className="rounded-xl border p-4" style={{ background: "hsl(var(--tool-surface))", borderColor: "hsl(var(--tool-border))" }}>
                    <h3 className="text-sm font-semibold text-foreground">What is the difference between a data URI and raw Base64?</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">A data URI includes a MIME type prefix like &quot;data:image/png;base64,&quot; followed by the encoded data. Raw Base64 is just the encoded characters without the prefix. Trndinn supports both — if no prefix is detected, it defaults to PNG.</p>
                  </div>
                  <div className="rounded-xl border p-4" style={{ background: "hsl(var(--tool-surface))", borderColor: "hsl(var(--tool-border))" }}>
                    <h3 className="text-sm font-semibold text-foreground">Is there a size limit for Base64 decoding?</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">There&apos;s no hard limit in Trndinn since processing happens in your browser. Very large strings (10MB+) may be slow depending on your device. For typical images (under 5MB encoded), decoding is instant.</p>
                  </div>
                  <div className="rounded-xl border p-4" style={{ background: "hsl(var(--tool-surface))", borderColor: "hsl(var(--tool-border))" }}>
                    <h3 className="text-sm font-semibold text-foreground">Is my Base64 data safe?</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Yes. Everything runs locally in your browser — your Base64 string is never sent to any server. This makes it safe for decoding sensitive images like screenshots of private data or API responses.</p>
                  </div>
                </div>
              </section>

              {/* ── Need more? CTA ── */}
              <section
                aria-label="Try Trndinn"
                className="mt-8 flex flex-col gap-6 rounded-xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 border"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--tool-surface)) 0%, hsl(var(--tool-surface-dim)) 100%)",
                  borderColor: "hsl(var(--tool-border))",
                }}
              >
                <div className="max-w-md">
                  <h2 className="text-xl font-bold text-foreground sm:text-2xl">Need more?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Create social media graphics, OG images, and branded assets with AI.</p>
                  <div className="mt-5">
                    <a href="/features" className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all" style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}>
                      Try Trndinn <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </section>

              {/* ── More tools ── */}
              <section aria-label="Related tools" className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground">More image tools you&apos;ll love</h2>
                  <a href="/tools/image" className="text-xs font-medium text-[hsl(var(--primary))] hover:underline flex items-center gap-1">View all tools <ArrowRight className="h-3 w-3" aria-hidden="true" /></a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: "Image to Text (OCR)", desc: "Extract text from images", href: "/tools/image-to-text" },
                    { name: "QR Code Generator", desc: "Custom colors, PNG & SVG", href: "/tools/qr-code-generator" },
                    { name: "Favicon Generator", desc: "All sizes in one ZIP", href: "/tools/favicon-generator" },
                    { name: "Remove Background", desc: "AI background removal", href: "/tools/background-remover" },
                  ].map((t) => (
                    <a key={t.name} href={t.href} className="rounded-xl border p-4 hover:border-[hsl(var(--primary)/0.3)] transition-colors group" style={{ background: "hsl(var(--tool-surface))", borderColor: "hsl(var(--tool-border))" }}>
                      <p className="text-sm font-semibold text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                    </a>
                  ))}
                </div>
              </section>

              {/* SEO footer note */}
              <p className="mt-8 text-xs leading-relaxed text-muted-foreground/60">
                Trndinn&apos;s Base64 to Image Decoder is a free, browser-based
                tool. All processing happens locally on your device &mdash; no
                files are uploaded to any server. No signup, no watermark, no
                usage limit.
              </p>
            </section>
          </main>
        </div>
      </SidebarWrapper>
    </MarketingShell>
  );
}
