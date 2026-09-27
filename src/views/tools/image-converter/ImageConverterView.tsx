"use client";

/**
 * ImageConverterView — generic component that handles all 33 conversion tools.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge, Progress,
 *   Accordion, AccordionContent, AccordionItem, AccordionTrigger, Alert,
 *   AlertDescription, Slider, Separator.
 * Design tokens: --background, --foreground, --card, --card-foreground,
 *   --muted, --muted-foreground, --primary, --primary-foreground,
 *   --border, --destructive, --destructive-foreground, --ring.
 * Icons: Lucide only.
 * Motion: CSS only (no framer-motion — app UI).
 */

import { useState, useCallback } from "react";
import {
  Download,
  RotateCcw,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRight,
  FileImage,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
import { useImageProcessor } from "@/hooks/tools/useImageProcessor";
import { useFileDownload } from "@/hooks/tools/useFileDownload";
import { cn } from "@/lib/utils";
import type { ConversionTool } from "@/lib/image-converter-data";
import type { ConverterAlias } from "@/lib/image-converter-aliases";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  tool: ConversionTool;
  alias?: ConverterAlias;
  faqs: Array<{ question: string; answer: string }>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Formats where quality slider is meaningful (lossy output). */
const LOSSY_FORMATS = new Set(["jpg", "jpeg", "webp", "avif", "gif"]);

const TRUST_BADGES = [
  { icon: Zap, label: "No signup required" },
  { icon: Shield, label: "Images never leave your browser" },
  { icon: Clock, label: "Instant conversion" },
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

function getSizeDelta(original: number, converted: number): string {
  if (original === 0) return "";
  const delta = ((converted - original) / original) * 100;
  const sign = delta < 0 ? "" : "+";
  return `${sign}${delta.toFixed(1)}%`;
}

function getDeltaColor(original: number, converted: number): string {
  if (original === 0) return "";
  const delta = ((converted - original) / original) * 100;
  // Smaller file = good (green-ish), larger file = neutral (muted)
  return delta < -5
    ? "text-[hsl(142.1_76.2%_36.3%)]"
    : delta > 5
    ? "text-[hsl(var(--muted-foreground))]"
    : "text-[hsl(var(--muted-foreground))]";
}

function buildOutputFileName(inputName: string, toFormat: string): string {
  const dotIdx = inputName.lastIndexOf(".");
  const base = dotIdx > 0 ? inputName.slice(0, dotIdx) : inputName;
  // ico is image/x-icon but file extension is .ico
  const ext = toFormat === "image/x-icon" ? "ico" : toFormat;
  return `${base}.${ext}`;
}

// ---------------------------------------------------------------------------
// FileResultRow
// ---------------------------------------------------------------------------

interface FileResultRow {
  original: File;
  converted: File;
}

function ResultRow({ row }: { row: FileResultRow }) {
  const delta = getSizeDelta(row.original.size, row.converted.size);
  const deltaColor = getDeltaColor(row.original.size, row.converted.size);

  return (
    <li className="flex items-center justify-between gap-3 rounded-md bg-[hsl(var(--muted))] px-3 py-2 text-sm">
      <span className="flex items-center gap-2 truncate text-foreground">
        <FileImage className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" aria-hidden />
        <span className="truncate max-w-[180px] sm:max-w-xs">{row.converted.name}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2 text-xs">
        <span className="text-[hsl(var(--muted-foreground))]">
          {formatBytes(row.original.size)} → {formatBytes(row.converted.size)}
        </span>
        {delta && (
          <span className={cn("font-semibold", deltaColor)}>{delta}</span>
        )}
      </span>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ImageConverterView({ tool, alias, faqs }: Props) {
  const { convertImage } = useImageProcessor();
  const { downloadSingle, downloadMultiple } = useFileDownload();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FileResultRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);
  const [quality, setQuality] = useState(92);

  const isLossy = LOSSY_FORMATS.has(tool.toFormat);
  const isHeic = tool.fromFormat === "heic";
  const isDone = results.length > 0;

  // Resolve hero copy — alias overrides primary tool defaults for SEO variants.
  // Pattern matches HeroVariant in InstagramReelDownloaderView / AutoCaptionGeneratorView.
  const eyebrow = alias?.eyebrow ?? `Free ${tool.fromLabel} to ${tool.toLabel} Converter`;
  const heroSubline = alias?.heroSubline ?? tool.whyConvert;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setResults([]);
    setError(undefined);
    setProgress(0);
  }, []);

  const handleConvert = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setError(undefined);

    const newResults: FileResultRow[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const qualityFraction = isLossy ? quality / 100 : undefined;

        // Determine the target format string — for ICO, use "ico"
        const targetFmt = tool.toFormat === "ico" ? "ico" : tool.toFormat;

        const converted = await convertImage(file, targetFmt, qualityFraction);

        // Rename the output file to have the correct extension
        const outputName = buildOutputFileName(file.name, targetFmt);
        const renamedFile = new File([converted], outputName, {
          type: tool.toMime,
        });

        newResults.push({ original: file, converted: renamedFile });
        setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      setResults(newResults);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Conversion failed. Please check the file format and try again.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles, quality, isLossy, tool.toFormat, tool.toMime, convertImage]);

  const handleDownloadAll = useCallback(() => {
    const files = results.map((r) => r.converted);
    if (files.length === 1) {
      downloadSingle(files[0]);
    } else {
      downloadMultiple(files);
    }
  }, [results, downloadSingle, downloadMultiple]);

  const handleReset = useCallback(() => {
    setSelectedFiles([]);
    setResults([]);
    setError(undefined);
    setProgress(0);
  }, []);

  const hasFiles = selectedFiles.length > 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ─── Page header ─── */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full text-xs">
            {eyebrow}
          </Badge>
          <Badge variant="outline" className="rounded-full text-xs">
            {tool.fromLabel} → {tool.toLabel}
          </Badge>
        </div>
        {alias ? (
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl font-heading text-foreground">
            {alias.h1Prefix}{" "}
            <span className="gradient-text">{alias.h1Highlight}</span>{" "}
            {alias.h1Suffix}
          </h1>
        ) : (
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl font-heading text-foreground">
            {tool.h1}
          </h1>
        )}
        <p className="text-sm text-[hsl(var(--muted-foreground))] sm:text-base max-w-2xl">
          {heroSubline}
        </p>
      </div>

      {/* ─── Trust badges ─── */}
      <div className="flex flex-wrap gap-3" aria-label="Trust indicators">
        {TRUST_BADGES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1 text-xs text-[hsl(var(--muted-foreground))]"
          >
            <Icon className="h-3.5 w-3.5 text-[hsl(var(--primary))]" aria-hidden />
            {label}
          </div>
        ))}
      </div>

      {/* ─── HEIC notice ─── */}
      {isHeic && (
        <Alert>
          <Info className="h-4 w-4" aria-hidden />
          <AlertDescription>
            Your browser may not show a preview of HEIC files — the conversion will still work.
            HEIC decoding happens locally via WebAssembly; no files are uploaded.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Main tool card ─── */}
      <Card className="p-4 sm:p-6">
        <CardHeader className="px-0 pt-0 pb-2 sm:pb-4">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Upload {tool.fromLabel} {selectedFiles.length > 1 ? "files" : "file"}
          </h2>
        </CardHeader>

        <CardContent className="px-0 pb-0 space-y-4">
          {/* Dropzone */}
          {!isDone && (
            <ImageDropzone
              accept={tool.fromMime}
              multiple
              maxSizeMB={50}
              onFilesSelected={handleFilesSelected}
              disabled={isProcessing}
            />
          )}

          {/* Reset: show new dropzone button when done */}
          {isDone && !isProcessing && (
            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] py-4 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted)/0.6)] hover:text-foreground"
              aria-label="Upload new files"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Convert more {tool.fromLabel} files
            </button>
          )}

          {/* Quality slider — lossy formats only */}
          {isLossy && hasFiles && !isDone && (
            <div className="space-y-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="quality-slider"
                  className="text-sm font-medium text-foreground"
                >
                  Output quality
                </label>
                <span className="text-sm font-semibold text-[hsl(var(--primary))]" aria-live="polite">
                  {quality}%
                </span>
              </div>
              <Slider
                id="quality-slider"
                min={1}
                max={100}
                step={1}
                value={[quality]}
                onValueChange={([v]) => setQuality(v)}
                className="w-full"
                aria-label={`Output quality: ${quality}%`}
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                92% is visually identical to lossless for most images. Lower values produce smaller files.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive" role="alert" aria-live="assertive">
              <AlertCircle className="h-4 w-4" aria-hidden />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2" aria-live="polite" aria-busy="true">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">
                  Converting {tool.fromLabel} to {tool.toLabel}…
                </span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress
                value={progress}
                className="h-2"
                aria-label={`Conversion progress: ${progress}%`}
              />
            </div>
          )}

          {/* Results */}
          {isDone && !isProcessing && (
            <div
              className="space-y-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
              role="region"
              aria-label="Converted files ready to download"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="h-5 w-5 text-[hsl(142.1_76.2%_36.3%)]"
                  aria-hidden
                />
                <span className="font-semibold text-foreground">
                  {results.length === 1
                    ? "File converted — ready to download"
                    : `${results.length} files converted`}
                </span>
              </div>
              <ul className="space-y-2">
                {results.map((row, i) => (
                  <ResultRow key={i} row={row} />
                ))}
              </ul>
              {results.length > 1 && (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Average size change:{" "}
                  <strong className="text-foreground">
                    {getSizeDelta(
                      results.reduce((sum, r) => sum + r.original.size, 0),
                      results.reduce((sum, r) => sum + r.converted.size, 0)
                    )}
                  </strong>
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            {!isDone ? (
              <Button
                onClick={handleConvert}
                disabled={!hasFiles || isProcessing}
                size="lg"
                className="w-full sm:w-auto px-8 font-semibold"
                aria-label={`Convert to ${tool.toLabel}`}
              >
                {isProcessing ? (
                  <>
                    <span
                      className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                      aria-hidden
                    />
                    Converting…
                  </>
                ) : (
                  `Convert to ${tool.toLabel}`
                )}
              </Button>
            ) : (
              <Button
                onClick={handleDownloadAll}
                size="lg"
                className="w-full sm:w-auto px-8 font-semibold"
                aria-label={`Download ${results.length === 1 ? tool.toLabel : "all"} files`}
              >
                <Download className="mr-2 h-4 w-4" aria-hidden />
                {results.length === 1 ? `Download ${tool.toLabel}` : `Download all (${results.length})`}
              </Button>
            )}

            {(hasFiles || isDone) && !isProcessing && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                aria-label="Reset and start over"
              >
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
                Start over
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── How it works ─── */}
      <Card className="p-4 sm:p-6">
        <CardHeader className="px-0 pt-0 pb-2 sm:pb-4">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            How to convert {tool.fromLabel} to {tool.toLabel}
          </h2>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <ol className="space-y-3" aria-label="Conversion steps">
            {[
              {
                step: "1",
                title: `Upload your ${tool.fromLabel} file`,
                desc: `Drag and drop or click to select one or more ${tool.fromLabel} files. No size limit beyond available device memory.`,
              },
              {
                step: "2",
                title: "Adjust quality (optional)",
                desc: isLossy
                  ? `Set the output quality slider (default 92%). Higher quality = larger file. Lower quality = smaller file.`
                  : `No quality settings needed — ${tool.toLabel} uses lossless compression.`,
              },
              {
                step: "3",
                title: `Click "Convert to ${tool.toLabel}"`,
                desc: `Conversion happens entirely in your browser using the Canvas API. No uploads, no waiting for a server.`,
              },
              {
                step: "4",
                title: "Download your files",
                desc: `Click Download to save your ${tool.toLabel} ${results.length === 1 ? "file" : "files"}. Multiple files are downloaded individually.`,
              },
            ].map((s) => (
              <li key={s.step} className="flex gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-sm font-bold text-[hsl(var(--primary))]"
                  aria-hidden
                >
                  {s.step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* ─── Why convert section ─── */}
      <Card className="p-4 sm:p-6">
        <CardHeader className="px-0 pt-0 pb-2 sm:pb-4">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Why convert {tool.fromLabel} to {tool.toLabel}?
          </h2>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-base">
            {tool.whyConvert}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-3 text-sm text-foreground"
              >
                <Icon className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" aria-hidden />
                {label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── FAQ ─── */}
      {faqs.length > 0 && (
        <Card className="p-4 sm:p-6">
          <CardHeader className="px-0 pt-0 pb-2 sm:pb-4">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              Frequently asked questions
            </h2>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm font-medium text-foreground text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* ─── Related tools CTA ─── */}
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Explore all image conversion tools</h3>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              33 free image converters — PNG, JPG, WebP, AVIF, HEIC, ICO, TIFF, BMP, GIF and more.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 rounded-full" asChild>
            <Link href="/tools">
              All free tools
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* ─── SEO footer ─── */}
      <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
        Trndinn&apos;s {tool.fromLabel} to {tool.toLabel} converter is a free, browser-based tool.
        All conversion happens locally on your device using the HTML5 Canvas API
        {isHeic ? " and a WASM-based HEIC decoder" : ""}. No files are uploaded to any server.
        No signup, no watermark, no usage limit.
      </p>
    </div>
  );
}
