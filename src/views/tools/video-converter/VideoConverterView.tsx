"use client";

/**
 * VideoConverterView — converts video files between formats using FFmpeg WASM.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge, Progress,
 *   Accordion, AccordionContent, AccordionItem, AccordionTrigger, Alert,
 *   AlertDescription, Separator.
 * Design tokens: --background, --foreground, --card, --card-foreground,
 *   --muted, --muted-foreground, --primary, --primary-foreground,
 *   --border, --destructive, --destructive-foreground, --ring.
 * Icons: Lucide only.
 * Motion: CSS only (no framer-motion — app UI).
 */

import { useState, useEffect, useCallback } from "react";
import {
  Download,
  RotateCcw,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  Video,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
import { useFfmpeg } from "@/hooks/tools/useFfmpeg";
import { cn } from "@/lib/utils";
import type { VideoTool } from "@/lib/video-data";
import type { VideoAlias } from "@/lib/video-aliases";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VIDEO_FORMATS = ["mp4", "mov", "avi", "mkv", "webm"] as const;
type VideoFormat = (typeof VIDEO_FORMATS)[number];

const FORMAT_LABELS: Record<VideoFormat, string> = {
  mp4: "MP4",
  mov: "MOV",
  avi: "AVI",
  mkv: "MKV",
  webm: "WEBM",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  tool: VideoTool;
  alias?: VideoAlias;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VideoConverterView({ tool, alias }: Props) {
  const { load, convert, isLoaded, isProcessing, progress, error, reset } = useFfmpeg();

  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<VideoFormat>("mp4");
  const [outputFile, setOutputFile] = useState<File | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const h1Prefix = alias?.h1Prefix ?? "";
  const h1Highlight = alias?.h1Highlight ?? tool.h1;
  const h1Suffix = alias?.h1Suffix ?? "";
  const eyebrow = alias?.eyebrow ?? "Free Video Converter — no signup, browser-based";
  const heroSubline =
    alias?.heroSubline ??
    "Convert video between any format in your browser. FFmpeg WASM processes files locally — nothing is ever uploaded.";

  // Pre-load FFmpeg WASM on mount.
  useEffect(() => {
    load();
  }, [load]);

  // Clean up object URL on unmount or new conversion.
  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      if (files[0]) {
        setFile(files[0]);
        setOutputFile(null);
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        setOutputUrl(null);
        reset();
      }
    },
    [outputUrl, reset]
  );

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setIsConverting(true);
    try {
      const result = await convert(file, "video", targetFormat);
      setOutputFile(result);
      setOutputUrl(URL.createObjectURL(result));
    } catch {
      // Error is surfaced via useFfmpeg error state.
    } finally {
      setIsConverting(false);
    }
  }, [file, targetFormat, convert]);

  const handleReset = useCallback(() => {
    setFile(null);
    setOutputFile(null);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl(null);
    reset();
  }, [outputUrl, reset]);

  const handleDownload = useCallback(() => {
    if (!outputUrl || !outputFile) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = outputFile.name;
    a.click();
  }, [outputUrl, outputFile]);

  const sourceExt = file?.name.split(".").pop()?.toUpperCase() ?? "";
  const isActive = isConverting || isProcessing;

  return (
    <div className="flex-1 space-y-4 sm:space-y-6">
      {/* ─── Hero ─── */}
      <div className="space-y-2">
        {eyebrow && (
          <Badge
            variant="secondary"
            className="rounded-full text-xs font-semibold uppercase tracking-wider"
          >
            <Zap className="mr-1 h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
            {eyebrow}
          </Badge>
        )}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl font-heading">
          {alias ? (
            <>
              {h1Prefix && <span>{h1Prefix} </span>}
              <span className="gradient-text">{h1Highlight}</span>
              {h1Suffix && <span> {h1Suffix}</span>}
            </>
          ) : (
            <span className="gradient-text">{h1Highlight}</span>
          )}
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] max-w-2xl">{heroSubline}</p>
      </div>

      {/* ─── WASM Loading Notice ─── */}
      {!isLoaded && !error && (
        <Alert>
          <Info className="h-4 w-4" aria-hidden />
          <AlertDescription>
            FFmpeg loads once (~33 MB), then caches in your browser. Subsequent conversions start
            instantly. Larger video files may take several minutes depending on your CPU speed.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Error ─── */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ─── Main Card ─── */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-heading">Convert Video</h2>
            {(file || outputFile) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isActive}
                aria-label="Reset and start over"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Step 1: Upload */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              1. Upload video file
            </p>
            <ImageDropzone
              accept="video/*,.mp4,.mov,.avi,.mkv,.webm,.flv,.wmv,.m4v"
              onFilesSelected={handleFilesSelected}
              disabled={isActive}
            />
            {file && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Selected:{" "}
                <span className="font-medium text-[hsl(var(--foreground))]">{file.name}</span>{" "}
                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Step 2: Format selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              2. Choose output format
            </p>
            <div
              className="grid grid-cols-3 gap-2 sm:grid-cols-5"
              role="group"
              aria-label="Output video format"
            >
              {VIDEO_FORMATS.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setTargetFormat(fmt)}
                  disabled={isActive}
                  aria-pressed={targetFormat === fmt}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                    targetFormat === fmt
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)]",
                    isActive && "cursor-not-allowed opacity-50"
                  )}
                >
                  {FORMAT_LABELS[fmt]}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Convert */}
          {file && !outputFile && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                3. Convert
                {sourceExt && (
                  <span className="ml-1 text-[hsl(var(--muted-foreground))]">
                    ({sourceExt} → {FORMAT_LABELS[targetFormat]})
                  </span>
                )}
              </p>
              <Button
                onClick={handleConvert}
                disabled={isActive || !isLoaded}
                className="w-full sm:w-auto"
                aria-busy={isActive}
              >
                {isActive ? (
                  <>
                    <span
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                      aria-hidden
                    />
                    Converting…
                  </>
                ) : (
                  <>
                    <Video className="mr-1.5 h-4 w-4" aria-hidden />
                    Convert to {FORMAT_LABELS[targetFormat]}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Progress bar */}
          {isActive && (
            <div className="space-y-1.5" aria-live="polite" aria-label="Conversion progress">
              <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>Processing… this may take a few minutes for large files</span>
                <span>{progress}%</span>
              </div>
              <Progress
                value={progress}
                className="h-2"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          )}

          {/* Output: preview + download */}
          {outputFile && outputUrl && (
            <div className="space-y-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary))]" aria-hidden />
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                  Conversion complete
                </span>
                <Badge variant="secondary" className="rounded-full text-xs">
                  {FORMAT_LABELS[targetFormat]}
                </Badge>
              </div>

              {/* Video preview */}
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                controls
                src={outputUrl}
                className="w-full rounded-lg"
                aria-label={`Preview of converted ${FORMAT_LABELS[targetFormat]} file`}
              />

              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {outputFile.name} · {(outputFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>

              <Button onClick={handleDownload} className="w-full sm:w-auto">
                <Download className="mr-1.5 h-4 w-4" aria-hidden />
                Download {FORMAT_LABELS[targetFormat]}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Feature Pills ─── */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="rounded-full gap-1.5">
          <Shield className="h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
          Files never uploaded
        </Badge>
        <Badge variant="outline" className="rounded-full gap-1.5">
          <Zap className="h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
          FFmpeg WASM — browser-native
        </Badge>
        <Badge variant="outline" className="rounded-full gap-1.5">
          <Clock className="h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
          No signup required
        </Badge>
      </div>

      <Separator />

      {/* ─── FAQ ─── */}
      {tool.faqs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold font-heading tracking-tight">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {tool.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
