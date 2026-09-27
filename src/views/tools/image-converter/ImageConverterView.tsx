"use client";

/**
 * ImageConverterView — professional converter UI for all 33 image conversion tools.
 * Uses ImageToolsShell for layout (sidebar + hero + AEO content).
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge,
 *   Progress, Slider, Alert, AlertDescription, Separator.
 * Design tokens: --background, --foreground, --card, --muted,
 *   --muted-foreground, --primary, --primary-foreground, --border,
 *   --destructive, --destructive-foreground, --ring, --chart-2.
 * Icons: Lucide only.
 * Motion: CSS only for tool UI (no framer-motion — shell handles animation).
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
  ArrowRightLeft,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
import { ImageToolsShell } from "@/views/tools/image-tools/ImageToolsShell";
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

interface FileResultRow {
  original: File;
  converted: File;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOSSY_FORMATS = new Set(["jpg", "jpeg", "webp", "avif", "gif"]);

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

function getSizeDelta(original: number, converted: number): {
  text: string;
  isSmaller: boolean;
} {
  if (original === 0) return { text: "", isSmaller: false };
  const delta = ((converted - original) / original) * 100;
  const sign = delta < 0 ? "" : "+";
  return {
    text: `${sign}${delta.toFixed(1)}%`,
    isSmaller: delta < -2,
  };
}

function buildOutputFileName(inputName: string, toFormat: string): string {
  const dotIdx = inputName.lastIndexOf(".");
  const base = dotIdx > 0 ? inputName.slice(0, dotIdx) : inputName;
  const ext = toFormat === "image/x-icon" ? "ico" : toFormat;
  return `${base}.${ext}`;
}

function getFormatColor(fmt: string): string {
  const map: Record<string, string> = {
    png: "hsl(221 83% 53%)",
    jpg: "hsl(var(--chart-1))",
    jpeg: "hsl(var(--chart-1))",
    webp: "hsl(142 71% 45%)",
    avif: "hsl(270 95% 65%)",
    heic: "hsl(var(--chart-1))",
    svg: "hsl(47 96% 53%)",
    gif: "hsl(var(--chart-4))",
    bmp: "hsl(var(--muted-foreground))",
    tiff: "hsl(var(--muted-foreground))",
    ico: "hsl(221 83% 53%)",
  };
  return map[fmt.toLowerCase()] ?? "hsl(var(--primary))";
}

// ---------------------------------------------------------------------------
// FormatCard — the from/to badge pair
// ---------------------------------------------------------------------------

function FormatCard({
  fromLabel,
  toLabel,
  fromFormat,
  toFormat,
}: {
  fromLabel: string;
  toLabel: string;
  fromFormat: string;
  toFormat: string;
}) {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <div
        className="flex h-16 w-20 flex-col items-center justify-center rounded-lg border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm"
        aria-label={`From: ${fromLabel}`}
      >
        <span
          className="text-lg font-bold"
          style={{ color: getFormatColor(fromFormat) }}
        >
          {fromLabel}
        </span>
        <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-0.5">
          source
        </span>
      </div>

      <div className="flex flex-col items-center gap-1" aria-hidden="true">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)]">
          <ArrowRightLeft className="h-4 w-4 text-[hsl(var(--primary))]" />
        </div>
      </div>

      <div
        className="flex h-16 w-20 flex-col items-center justify-center rounded-lg border-2 border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.06)] shadow-sm"
        aria-label={`To: ${toLabel}`}
      >
        <span
          className="text-lg font-bold"
          style={{ color: getFormatColor(toFormat) }}
        >
          {toLabel}
        </span>
        <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-0.5">
          output
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ResultRow
// ---------------------------------------------------------------------------

function ResultRow({ row }: { row: FileResultRow }) {
  const { text: delta, isSmaller } = getSizeDelta(
    row.original.size,
    row.converted.size
  );

  return (
    <li className="flex items-center justify-between gap-3 rounded-md bg-[hsl(var(--muted)/0.5)] px-3 py-2.5 text-sm">
      <span className="flex min-w-0 items-center gap-2">
        <FileImage
          className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]"
          aria-hidden
        />
        <span className="truncate max-w-[160px] sm:max-w-xs font-medium text-foreground">
          {row.converted.name}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2 text-xs">
        <span className="text-[hsl(var(--muted-foreground))]">
          {formatBytes(row.original.size)} → {formatBytes(row.converted.size)}
        </span>
        {delta && (
          <span
            className={cn(
              "font-semibold",
              isSmaller
                ? "text-[hsl(142_71%_38%)] dark:text-[hsl(142_71%_55%)]"
                : "text-[hsl(var(--muted-foreground))]"
            )}
          >
            {delta}
          </span>
        )}
      </span>
    </li>
  );
}

// ---------------------------------------------------------------------------
// ToolControls — the inner UI rendered as children of ImageToolsShell
// ---------------------------------------------------------------------------

function ToolControls({ tool, alias, faqs: _faqs }: Props) {
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
  const hasFiles = selectedFiles.length > 0;

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
        const targetFmt = tool.toFormat === "ico" ? "ico" : tool.toFormat;
        const converted = await convertImage(file, targetFmt, qualityFraction);
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

  return (
    <div className="space-y-4">
      {/* Format badge pair */}
      <FormatCard
        fromLabel={tool.fromLabel}
        toLabel={tool.toLabel}
        fromFormat={tool.fromFormat}
        toFormat={tool.toFormat}
      />

      {/* Trust row */}
      <div className="flex flex-wrap gap-2" aria-label="Trust indicators">
        {[
          { icon: Zap, label: "No signup" },
          { icon: Shield, label: "Never uploaded" },
          { icon: Clock, label: "Instant" },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1 text-[11px] text-[hsl(var(--muted-foreground))]"
          >
            <Icon className="h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
            {label}
          </span>
        ))}
      </div>

      {/* HEIC notice */}
      {isHeic && (
        <Alert>
          <Info className="h-4 w-4" aria-hidden />
          <AlertDescription className="text-sm">
            Your browser may not preview HEIC files — conversion still works.
            HEIC decoding happens locally via WebAssembly; no files are uploaded.
          </AlertDescription>
        </Alert>
      )}

      {/* Main card */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            {isDone
              ? `${results.length} file${results.length === 1 ? "" : "s"} converted`
              : `Upload ${tool.fromLabel} file${selectedFiles.length > 1 ? "s" : ""}`}
          </h2>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Drop zone or reset button */}
          {!isDone ? (
            <ImageDropzone
              accept={tool.fromMime}
              multiple
              maxSizeMB={50}
              onFilesSelected={handleFilesSelected}
              disabled={isProcessing}
            />
          ) : (
            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] py-4 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted)/0.6)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1"
              aria-label={`Upload new ${tool.fromLabel} files`}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Convert more {tool.fromLabel} files
            </button>
          )}

          {/* Quality slider */}
          {isLossy && hasFiles && !isDone && (
            <div className="space-y-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="quality-slider"
                  className="text-sm font-medium text-foreground"
                >
                  Output quality
                </label>
                <span
                  className="text-sm font-bold text-[hsl(var(--primary))]"
                  aria-live="polite"
                >
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
                92% is visually identical to lossless for most images.
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
                  Converting {tool.fromLabel} → {tool.toLabel}…
                </span>
                <span className="font-semibold text-foreground">{progress}%</span>
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
                  className="h-5 w-5 text-[hsl(142_71%_45%)]"
                  aria-hidden
                />
                <span className="font-semibold text-foreground">
                  {results.length === 1
                    ? "Ready to download"
                    : `${results.length} files ready`}
                </span>
              </div>
              <ul className="space-y-2" aria-label="Converted files">
                {results.map((row, i) => (
                  <ResultRow key={i} row={row} />
                ))}
              </ul>
              {results.length > 1 && (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Average size change:{" "}
                  <strong className="text-foreground">
                    {
                      getSizeDelta(
                        results.reduce((sum, r) => sum + r.original.size, 0),
                        results.reduce((sum, r) => sum + r.converted.size, 0)
                      ).text
                    }
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
                  <>
                    Convert to {tool.toLabel}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleDownloadAll}
                size="lg"
                className="w-full sm:w-auto px-8 font-semibold"
                aria-label={`Download ${results.length === 1 ? tool.toLabel + " file" : "all files"}`}
              >
                <Download className="mr-2 h-4 w-4" aria-hidden />
                {results.length === 1
                  ? `Download ${tool.toLabel}`
                  : `Download all (${results.length})`}
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

      {/* How it works */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            How to convert {tool.fromLabel} to {tool.toLabel}
          </h2>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3" aria-label="Conversion steps">
            {[
              {
                n: "1",
                title: `Upload your ${tool.fromLabel} file`,
                desc: `Drag and drop or click to select. Batch conversion supported — no file size limit beyond device memory.`,
              },
              {
                n: "2",
                title: isLossy ? "Set output quality" : "Ready to convert",
                desc: isLossy
                  ? `Adjust the quality slider (default 92%). Higher = larger file, better quality.`
                  : `${tool.toLabel} uses lossless compression — no quality settings needed.`,
              },
              {
                n: "3",
                title: `Click "Convert to ${tool.toLabel}"`,
                desc: `Conversion uses your browser's Canvas API. No uploads, no waiting for a server.`,
              },
              {
                n: "4",
                title: "Download",
                desc: `Your ${tool.toLabel} file downloads instantly. Multiple files download individually.`,
              },
            ].map((s) => (
              <li key={s.n} className="flex gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] text-sm font-bold text-[hsl(var(--primary))]"
                  aria-hidden
                >
                  {s.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
                    {s.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* CTA to all tools */}
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              All 49 free image tools
            </h3>
            <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
              Convert, compress, resize, crop, rotate, watermark, remove backgrounds and more.
            </p>
          </div>
          <Button
            variant="outline"
            className="shrink-0 rounded-full"
            asChild
          >
            <Link href="/tools">
              Browse all tools
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default export — wraps ToolControls in ImageToolsShell
// ---------------------------------------------------------------------------

export default function ImageConverterView({ tool, alias, faqs }: Props) {
  const eyebrow = alias?.eyebrow ?? `Free ${tool.fromLabel} to ${tool.toLabel} Converter`;
  const heroSubline = alias?.heroSubline ?? tool.whyConvert;

  // Derive H1 parts
  let h1Prefix = "";
  let h1Highlight = "";
  let h1Suffix = "";

  if (alias) {
    h1Prefix = alias.h1Prefix ?? "";
    h1Highlight = alias.h1Highlight ?? "";
    h1Suffix = alias.h1Suffix ?? "";
  } else {
    // Split tool.h1 — highlight the format names e.g. "Free PNG to JPG Converter"
    // → prefix="Free", highlight="PNG to JPG", suffix="Converter"
    h1Prefix = "Free";
    h1Highlight = `${tool.fromLabel} to ${tool.toLabel}`;
    h1Suffix = "Converter";
  }

  return (
    <ImageToolsShell
      slug={tool.slug}
      toolName={tool.h1}
      h1Prefix={h1Prefix}
      h1Highlight={h1Highlight}
      h1Suffix={h1Suffix}
      eyebrow={eyebrow}
      heroSubline={heroSubline}
      whyText={tool.whyConvert}
      faqs={faqs}
    >
      <ToolControls tool={tool} alias={alias} faqs={faqs} />
    </ImageToolsShell>
  );
}
