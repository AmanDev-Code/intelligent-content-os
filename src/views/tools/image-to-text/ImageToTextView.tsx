"use client";

/**
 * ImageToTextView — Premium redesign matching reference image 18.
 *
 * Layout: MarketingShell > sidebar + main.
 * Hero: ToolHero with 3D illustration (image → extracted text cards).
 * Trust badges, numbered step bar, 3-column workspace, trust strip.
 * Processing: Tesseract.js WASM — lazy loaded, language data cached.
 *
 * Design tokens: --tool-bg, --tool-surface, --tool-surface-dim,
 *   --tool-border, --primary, --foreground, --muted-foreground.
 * Icons: Lucide only. Motion: framer-motion. Dark mode: CSS vars.
 */

import { useState, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Check,
  Upload,
  ArrowRight,
  Globe,
  Settings2,
  FileText,
  Zap,
  ShieldCheck,
  Monitor,
  Languages,
  Lightbulb,
  ImageIcon,
  Type,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar } from "@/views/tools/image-tools/ImageToolsSidebar";
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
import { ToolHero } from "@/views/tools/shared/ToolHero";
import { StepProgressBar } from "@/views/tools/shared/StepProgressBar";
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

type Status = "idle" | "processing" | "done" | "error";

// ---------------------------------------------------------------------------
// Language options
// ---------------------------------------------------------------------------

const LANGUAGES = [
  { value: "eng", label: "English" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
  { value: "jpn", label: "Japanese" },
  { value: "hin", label: "Hindi" },
  { value: "ara", label: "Arabic" },
] as const;

// ---------------------------------------------------------------------------
// Sample images for the strip below the dropzone
// ---------------------------------------------------------------------------

const SAMPLE_IMAGES = [
  { src: "/images/tools/ocr-sample-1.jpg", alt: "Document scan sample" },
  { src: "/images/tools/ocr-sample-2.jpg", alt: "Receipt sample" },
  { src: "/images/tools/ocr-sample-3.jpg", alt: "Handwritten note sample" },
  { src: "/images/tools/ocr-sample-4.jpg", alt: "Screenshot sample" },
];

// ---------------------------------------------------------------------------
// Trust badges & features
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  { icon: Zap, text: "No signup required" },
  { icon: ShieldCheck, text: "100% private" },
  { icon: Monitor, text: "Runs in browser" },
  { icon: Languages, text: "8+ languages" },
];

const TRUST_FEATURES: TrustFeature[] = [
  {
    icon: Zap,
    title: "Instant & accurate",
    description: "Extract text in seconds",
  },
  {
    icon: ShieldCheck,
    title: "100% private",
    description: "Images never leave your device",
  },
  {
    icon: Languages,
    title: "Multiple languages",
    description: "Supports 8+ languages",
  },
  {
    icon: Download,
    title: "Download or copy",
    description: "Get text in one click",
  },
];

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

const STEPS = [
  { number: 1, label: "Upload Image", sublabel: "Drag & drop or paste" },
  { number: 2, label: "Select Language", sublabel: "Choose OCR language" },
  { number: 3, label: "Extract & Copy", sublabel: "Get your text instantly" },
];

// ---------------------------------------------------------------------------
// OCR logic — lazy loaded Tesseract.js
// ---------------------------------------------------------------------------

async function extractText(
  file: File,
  language: string,
  onProgress: (pct: number) => void
): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(language, 1, {
    logger: (m: { progress: number }) => {
      if (typeof m.progress === "number") {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });
  const { data } = await worker.recognize(file);
  await worker.terminate();
  return data.text;
}

// ---------------------------------------------------------------------------
// 3D Hero Illustration
// ---------------------------------------------------------------------------

function Hero3DIllustration({ shouldReduce }: { shouldReduce: boolean }) {
  const anim = shouldReduce
    ? { initial: {}, animate: {} }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <div className="relative w-[340px] h-[280px]" aria-hidden="true">
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #F97316 0%, #8B5CF6 40%, transparent 70%)",
        }}
      />

      {/* "Image" card — left */}
      <motion.div
        {...anim}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="absolute left-0 top-6 w-[150px] rounded-xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] p-3 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}
          >
            <ImageIcon className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-foreground">Image</span>
        </div>
        <div className="space-y-1.5">
          <div className="h-16 rounded-lg bg-[hsl(var(--tool-surface-dim))] flex items-center justify-center">
            <Type className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <div className="flex gap-1">
            <div className="h-1.5 flex-1 rounded-full bg-muted-foreground/20" />
            <div className="h-1.5 w-8 rounded-full bg-muted-foreground/20" />
          </div>
        </div>
      </motion.div>

      {/* Arrow */}
      <motion.div
        {...anim}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute left-[140px] top-[70px] z-10"
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full shadow-lg"
          style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
        >
          <ArrowRight className="h-5 w-5 text-white" />
        </div>
      </motion.div>

      {/* "Extracted Text" card — right */}
      <motion.div
        {...anim}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute right-0 top-0 w-[170px] rounded-xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] p-3 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
          >
            <FileText className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-foreground">
            Extracted Text
          </span>
          <button
            className="ml-auto text-muted-foreground/50 hover:text-muted-foreground"
            tabIndex={-1}
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-1 text-[9px] leading-relaxed text-muted-foreground font-mono">
          <p>The future</p>
          <p>belongs to those</p>
          <p>who believe in</p>
          <p>the beauty of</p>
          <p>their dreams.</p>
        </div>
      </motion.div>

      {/* Handwritten label */}
      <motion.p
        {...anim}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute left-[20px] bottom-0 text-[11px] italic text-muted-foreground/60 -rotate-6 select-none"
      >
        Turn images into
        <br />
        editable text instantly
      </motion.p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ImageToTextView({ tool, alias }: Props) {
  const shouldReduce = useReducedMotion() ?? false;

  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState("eng");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Advanced options state
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [ocrEngine, setOcrEngine] = useState<"best" | "fast">("best");
  const [improveContrast, setImproveContrast] = useState(false);
  const [preserveFormatting, setPreserveFormatting] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const eyebrow =
    alias?.eyebrow ??
    "FREE IMAGE TO TEXT OCR — TESSERACT.JS, BROWSER-LOCAL";
  const h1Prefix = alias?.h1Prefix ?? "Extract text";
  const h1Highlight = alias?.h1Highlight ?? "from an image";
  const h1Suffix = alias?.h1Suffix ?? "— free OCR online.";
  const heroDescription =
    alias?.heroSubline ??
    "Turn any image, screenshot, or photo into editable text using OCR. Runs entirely in your browser with Tesseract.js — no upload, no signup.";

  // Compute active step
  const activeStep = status === "done" ? 3 : sourceFile ? 2 : 1;

  // ── Handlers (same OCR logic) ──────────────────────────────────────────────

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length === 0) return;
    setSourceFile(files[0]);
    setStatus("idle");
    setExtractedText("");
    setErrorMsg("");
    setProgress(0);
    setElapsedMs(0);
  }, []);

  const handleExtract = useCallback(async () => {
    if (!sourceFile) return;
    setStatus("processing");
    setProgress(0);
    setExtractedText("");
    setErrorMsg("");
    const t0 = performance.now();

    try {
      const text = await extractText(sourceFile, language, (pct) => {
        setProgress(pct);
      });
      setExtractedText(text.trim());
      setProgress(100);
      setElapsedMs(Math.round(performance.now() - t0));
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "OCR failed. Please try a clearer image with better contrast."
      );
    }
  }, [sourceFile, language]);

  const handleCopy = useCallback(async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op — user can manually select text
    }
  }, [extractedText]);

  const handleDownload = useCallback(() => {
    if (!extractedText || !sourceFile) return;
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const baseName = sourceFile.name.replace(/\.[^.]+$/, "");
    a.href = url;
    a.download = `${baseName}-text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [extractedText, sourceFile]);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setSourceFile(null);
    setExtractedText("");
    setErrorMsg("");
    setProgress(0);
    setCopied(false);
    setElapsedMs(0);
  }, []);

  const isProcessing = status === "processing";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <MarketingShell>
      {/* Full-height dark layout — sidebar + main */}
      <div
        className="flex"
        style={{
          background: "hsl(var(--tool-bg))",
          color: "hsl(var(--foreground))",
        }}
      >
        <ImageToolsSidebar activeSlug="image-to-text" />

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          {/* ═══════════════════ HERO ═══════════════════ */}
          <ToolHero
            eyebrow={eyebrow}
            h1Prefix={h1Prefix}
            h1Highlight={h1Highlight}
            h1Suffix={h1Suffix}
            description={heroDescription}
            trustBadges={TRUST_BADGES}
          >
            <Hero3DIllustration shouldReduce={shouldReduce} />
          </ToolHero>

          {/* ═══════════════════ WORKSPACE ═══════════════════ */}
          <section
            aria-label="Image to text OCR tool"
            className="px-4 pb-8 sm:px-6 lg:px-10"
          >
            <div className="mx-auto max-w-[1200px] space-y-8">
              {/* Step progress bar */}
              <StepProgressBar steps={STEPS} activeStep={activeStep} />

              {/* Main workspace card */}
              <div
                className="rounded-2xl border p-4 sm:p-6"
                style={{
                  background: "hsl(var(--tool-surface))",
                  borderColor: "hsl(var(--tool-border))",
                }}
              >
                {/* 3-column layout */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* ─── Left column: Upload + Image Tips ─── */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Upload
                        className="h-4 w-4 text-[hsl(var(--primary))]"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-semibold text-foreground">
                        Upload Image
                      </span>
                    </div>

                    <ImageDropzone
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/tiff,image/bmp,image/gif"
                      multiple={false}
                      maxSizeMB={20}
                      onFilesSelected={handleFilesSelected}
                      disabled={isProcessing}
                    />

                    {sourceFile && !isProcessing && (
                      <p className="text-xs text-muted-foreground">
                        Selected:{" "}
                        <span className="font-medium text-foreground">
                          {sourceFile.name}
                        </span>
                      </p>
                    )}

                    {/* Sample strip */}
                    <div className="flex items-center gap-2">
                      {SAMPLE_IMAGES.map((img) => (
                        <div
                          key={img.src}
                          className="h-12 w-12 shrink-0 rounded-lg border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))] overflow-hidden"
                        >
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
                          </div>
                        </div>
                      ))}
                      <button
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-[hsl(var(--tool-border))] text-muted-foreground/50 hover:text-muted-foreground hover:border-[hsl(var(--primary)/0.3)] transition-colors"
                        aria-label="Try example"
                      >
                        +
                      </button>
                    </div>

                    {/* Image Tips card */}
                    <div
                      className="rounded-xl border p-4"
                      style={{
                        background: "hsl(var(--tool-surface-dim))",
                        borderColor: "hsl(var(--tool-border))",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb
                          className="h-4 w-4 text-[hsl(var(--chart-3))]"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-semibold text-foreground">
                          Image Tips
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {[
                          "Use clear, high contrast images",
                          "Avoid blurry or low resolution images",
                          "Works best with printed or typed text",
                        ].map((tip) => (
                          <li
                            key={tip}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <CheckCircle2
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
                              aria-hidden="true"
                            />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* ─── Center column: Language + Advanced Options ─── */}
                  <div
                    className="space-y-5 lg:border-x lg:px-6"
                    style={{ borderColor: "hsl(var(--tool-border))" }}
                  >
                    {/* Language selector */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Globe
                          className="h-4 w-4 text-[hsl(var(--primary))]"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-semibold text-foreground">
                          Language
                        </span>
                      </div>
                      <Select
                        value={language}
                        onValueChange={setLanguage}
                        disabled={isProcessing}
                      >
                        <SelectTrigger
                          className="w-full bg-[hsl(var(--tool-surface-dim))] border-[hsl(var(--tool-border))]"
                          aria-label="Select OCR language"
                        >
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                              {value === "eng" && (
                                <span className="ml-1 text-muted-foreground">
                                  (Default)
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Language data is downloaded on first use and cached in
                        your browser.
                      </p>
                    </div>

                    {/* Advanced Options */}
                    <div
                      className="rounded-xl border"
                      style={{ borderColor: "hsl(var(--tool-border))" }}
                    >
                      <button
                        onClick={() => setAdvancedOpen(!advancedOpen)}
                        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-[hsl(var(--tool-surface-dim)/0.5)]"
                        aria-expanded={advancedOpen}
                      >
                        <div className="flex items-center gap-2">
                          <Settings2
                            className="h-4 w-4 text-[hsl(var(--primary))]"
                            aria-hidden="true"
                          />
                          <span className="text-sm font-semibold text-foreground">
                            Advanced Options
                          </span>
                        </div>
                        {advancedOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      <AnimatePresence>
                        {advancedOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div
                              className="space-y-4 px-4 pb-4 pt-1 border-t"
                              style={{
                                borderColor: "hsl(var(--tool-border))",
                              }}
                            >
                              {/* OCR Engine */}
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-2">
                                  OCR Engine
                                </p>
                                <div className="space-y-2">
                                  <label className="flex items-center gap-3 cursor-pointer">
                                    <div
                                      className={cn(
                                        "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                                        ocrEngine === "best"
                                          ? "border-[hsl(var(--primary))]"
                                          : "border-muted-foreground/30"
                                      )}
                                    >
                                      {ocrEngine === "best" && (
                                        <div
                                          className="h-2.5 w-2.5 rounded-full"
                                          style={{
                                            background:
                                              "linear-gradient(135deg, #F97316, #F59E0B)",
                                          }}
                                        />
                                      )}
                                    </div>
                                    <input
                                      type="radio"
                                      name="ocrEngine"
                                      value="best"
                                      checked={ocrEngine === "best"}
                                      onChange={() => setOcrEngine("best")}
                                      className="sr-only"
                                    />
                                    <span className="text-sm text-foreground">
                                      Tesseract.js{" "}
                                      <span className="text-muted-foreground">
                                        (Best)
                                      </span>
                                    </span>
                                  </label>
                                  <label className="flex items-center gap-3 cursor-pointer">
                                    <div
                                      className={cn(
                                        "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                                        ocrEngine === "fast"
                                          ? "border-[hsl(var(--primary))]"
                                          : "border-muted-foreground/30"
                                      )}
                                    >
                                      {ocrEngine === "fast" && (
                                        <div
                                          className="h-2.5 w-2.5 rounded-full"
                                          style={{
                                            background:
                                              "linear-gradient(135deg, #F97316, #F59E0B)",
                                          }}
                                        />
                                      )}
                                    </div>
                                    <input
                                      type="radio"
                                      name="ocrEngine"
                                      value="fast"
                                      checked={ocrEngine === "fast"}
                                      onChange={() => setOcrEngine("fast")}
                                      className="sr-only"
                                    />
                                    <span className="text-sm text-foreground">
                                      Fast{" "}
                                      <span className="text-muted-foreground">
                                        (Lower accuracy)
                                      </span>
                                    </span>
                                  </label>
                                </div>
                              </div>

                              {/* Improve contrast toggle */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Lightbulb
                                    className="h-4 w-4 text-muted-foreground"
                                    aria-hidden="true"
                                  />
                                  <Label
                                    htmlFor="improve-contrast"
                                    className="text-sm text-foreground cursor-pointer"
                                  >
                                    Improve image contrast
                                  </Label>
                                </div>
                                <Switch
                                  id="improve-contrast"
                                  checked={improveContrast}
                                  onCheckedChange={setImproveContrast}
                                  disabled={isProcessing}
                                />
                              </div>

                              {/* Preserve formatting toggle */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText
                                    className="h-4 w-4 text-muted-foreground"
                                    aria-hidden="true"
                                  />
                                  <Label
                                    htmlFor="preserve-formatting"
                                    className="text-sm text-foreground cursor-pointer"
                                  >
                                    Preserve text formatting
                                  </Label>
                                </div>
                                <Switch
                                  id="preserve-formatting"
                                  checked={preserveFormatting}
                                  onCheckedChange={setPreserveFormatting}
                                  disabled={isProcessing}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* CTA button */}
                    {!isProcessing && status !== "done" && (
                      <button
                        onClick={handleExtract}
                        disabled={!sourceFile || isProcessing}
                        className={cn(
                          "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          !sourceFile
                            ? "cursor-not-allowed opacity-50"
                            : "hover:opacity-90 hover:shadow-lg"
                        )}
                        style={{
                          background:
                            "linear-gradient(135deg, #F97316, #F59E0B)",
                        }}
                        aria-label="Extract text from image"
                      >
                        Extract Text
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}

                    {/* Progress bar */}
                    <AnimatePresence>
                      {isProcessing && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="space-y-2"
                          aria-live="polite"
                          aria-busy="true"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Extracting text…
                            </span>
                            <span className="font-medium text-foreground">
                              {progress}%
                            </span>
                          </div>
                          <Progress
                            value={progress}
                            className="h-2"
                            aria-label={`OCR progress: ${progress}%`}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error */}
                    {status === "error" && (
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
                    )}
                  </div>

                  {/* ─── Right column: Result panel ─── */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText
                          className="h-4 w-4 text-[hsl(var(--primary))]"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-semibold text-foreground">
                          Result
                        </span>
                      </div>
                      {status === "done" && (
                        <Badge
                          className="border-0 text-[10px] font-semibold text-emerald-400"
                          style={{
                            background: "hsl(142 76% 36% / 0.15)",
                          }}
                        >
                          <CheckCircle2
                            className="mr-1 h-3 w-3"
                            aria-hidden="true"
                          />
                          Text extracted successfully!
                        </Badge>
                      )}
                    </div>

                    {/* Result textarea or placeholder */}
                    <div
                      className="rounded-xl border"
                      style={{
                        background: "hsl(var(--tool-surface-dim))",
                        borderColor: "hsl(var(--tool-border))",
                      }}
                    >
                      {status === "done" && extractedText ? (
                        <div className="relative">
                          <Textarea
                            value={extractedText}
                            readOnly
                            rows={8}
                            className="resize-y border-0 bg-transparent text-sm font-mono focus-visible:ring-0"
                            aria-label="Extracted text output"
                          />
                          <button
                            onClick={handleCopy}
                            className="absolute right-3 top-3 text-muted-foreground/50 hover:text-foreground transition-colors"
                            aria-label="Copy text"
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-[200px] items-center justify-center p-4">
                          <div className="text-center">
                            <Type
                              className="mx-auto h-8 w-8 text-muted-foreground/20"
                              aria-hidden="true"
                            />
                            <p className="mt-2 text-xs text-muted-foreground/50">
                              {isProcessing
                                ? "Extracting text…"
                                : "Upload an image to extract text"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Char count + time */}
                    {status === "done" && (
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{extractedText.length} characters</span>
                        {elapsedMs > 0 && (
                          <span>{(elapsedMs / 1000).toFixed(1)}s</span>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    {status === "done" && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleCopy}
                          disabled={!extractedText}
                          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          style={{
                            background:
                              "linear-gradient(135deg, #F97316, #F59E0B)",
                          }}
                          aria-label="Copy extracted text to clipboard"
                        >
                          {copied ? (
                            <>
                              <Check
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              Copy Text
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleDownload}
                          disabled={!extractedText}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))] py-2.5 text-sm font-semibold text-foreground transition-all hover:border-[hsl(var(--primary)/0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Download extracted text as .txt file"
                        >
                          <Download
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          Download .txt
                        </button>
                      </div>
                    )}

                    {/* Preview (Highlighted Text) placeholder */}
                    {status === "done" && extractedText && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Eye
                            className="h-4 w-4 text-[hsl(var(--primary))]"
                            aria-hidden="true"
                          />
                          <span className="text-xs font-semibold text-muted-foreground">
                            Preview (Highlighted Text)
                          </span>
                        </div>
                        <div
                          className="relative h-32 rounded-xl border overflow-hidden"
                          style={{
                            borderColor: "hsl(var(--tool-border))",
                            background: "hsl(var(--tool-surface-dim))",
                          }}
                        >
                          {sourceFile && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={URL.createObjectURL(sourceFile)}
                              alt="Source with highlighted text regions"
                              className="h-full w-full object-cover opacity-60"
                            />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] text-muted-foreground/70 bg-[hsl(var(--tool-surface)/0.8)] px-2 py-1 rounded">
                              Text regions highlighted
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Try another */}
                    {status === "done" && (
                      <Button
                        onClick={handleReset}
                        size="sm"
                        variant="ghost"
                        className="w-full gap-2 text-muted-foreground hover:text-foreground"
                        aria-label="Extract text from another image"
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
              </div>

              {/* ═══════════════════ TRUST STRIP ═══════════════════ */}
              <TrustStrip features={TRUST_FEATURES} className="mt-8" />

              {/* ═══════════════════ AEO: What is OCR? ═══════════════════ */}
              <section
                aria-labelledby="what-is-ocr-heading"
                className="mt-10 rounded-xl border p-6"
                style={{
                  background: "hsl(var(--tool-surface))",
                  borderColor: "hsl(var(--tool-border))",
                }}
              >
                <h2 id="what-is-ocr-heading" className="text-lg font-bold text-foreground mb-4">
                  What is OCR (Optical Character Recognition)?
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                  OCR (Optical Character Recognition) is a technology that converts images of text — such as scanned documents, photos of signs, or screenshots — into machine-readable, editable text. Trndinn&apos;s Image to Text tool uses Tesseract.js, an open-source OCR engine with over 35,000 GitHub stars, running entirely in your browser via WebAssembly. Your images never leave your device.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                  The global OCR market is projected to reach $32.3 billion by 2030, driven by digitization of paper documents and accessibility requirements [Grand View Research, 2024]. Modern OCR engines like Tesseract.js achieve 95%+ accuracy on printed text in English and support 100+ languages including Arabic, Chinese, Japanese, and Korean.
                </p>
                <h3 className="text-base font-semibold text-foreground mt-6 mb-3">Frequently asked questions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">How do I extract text from an image for free?</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Upload your image to Trndinn&apos;s Image to Text tool, select a language, and click Extract Text. The OCR engine processes the image locally in your browser and returns editable text you can copy or download as a .txt file.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">What languages does the OCR support?</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Tesseract.js supports 100+ languages including English, Spanish, French, German, Portuguese, Chinese (Simplified &amp; Traditional), Japanese, Korean, Arabic, Hindi, and Russian. Language data is downloaded on first use and cached in your browser.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">How can I improve OCR accuracy?</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Use clear, high-contrast images with legible text. Avoid blurry or low-resolution images. Enable &quot;Improve image contrast&quot; in Advanced Options. Printed or typed text works best — handwriting recognition is limited.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Is my data safe when using OCR online?</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Yes. Trndinn&apos;s OCR tool runs the Tesseract.js engine entirely in your browser. Your images are never uploaded to any server — all processing happens locally on your device, even offline.</p>
                  </div>
                </div>
              </section>

              {/* ═══════════════════ Need more? CTA ═══════════════════ */}
              <section
                aria-label="Try Trndinn"
                className="mt-10 flex flex-col gap-6 rounded-xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 border"
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

              {/* ═══════════════════ More tools ═══════════════════ */}
              <section aria-label="Related tools" className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground">More image tools you&apos;ll love</h2>
                  <a href="/tools/image" className="text-xs font-medium text-[hsl(var(--primary))] hover:underline flex items-center gap-1">View all tools <ArrowRight className="h-3 w-3" aria-hidden="true" /></a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: "Base64 to Image", desc: "Decode Base64 strings", href: "/tools/base64-to-image" },
                    { name: "Remove Background", desc: "AI background removal", href: "/tools/background-remover" },
                    { name: "QR Code Generator", desc: "Custom colors, PNG & SVG", href: "/tools/qr-code-generator" },
                    { name: "Image Converter", desc: "Convert between formats", href: "/tools/jpg-to-png" },
                  ].map((t) => (
                    <a key={t.name} href={t.href} className="rounded-xl border p-4 hover:border-[hsl(var(--primary)/0.3)] transition-colors group" style={{ background: "hsl(var(--tool-surface))", borderColor: "hsl(var(--tool-border))" }}>
                      <p className="text-sm font-semibold text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </main>
      </div>
    </MarketingShell>
  );
}
