"use client";

/**
 * ImageCompressorView — handles all 4 compression tools:
 *   compress-jpg, compress-png, compress-webp, compress-gif
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge,
 *   Progress, Accordion, AccordionContent, AccordionItem,
 *   AccordionTrigger, Alert, AlertDescription, Slider, Separator.
 * Design tokens: --background, --foreground, --card, --card-foreground,
 *   --muted, --muted-foreground, --primary, --primary-foreground,
 *   --border, --destructive, --ring.
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
  FileImage,
  Gauge,
} from "lucide-react";

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
import { MarketingShell } from "@/components/marketing/MarketingShell";
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

interface FileResultRow {
  original: File;
  compressed: File;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  { icon: Zap, label: "No signup required" },
  { icon: Shield, label: "Images never leave your browser" },
  { icon: Clock, label: "Instant compression" },
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

function getSavings(original: number, compressed: number): string {
  if (original === 0) return "";
  const pct = ((original - compressed) / original) * 100;
  if (pct <= 0) return "No reduction";
  return `−${pct.toFixed(1)}% smaller`;
}

function getSavingsColor(original: number, compressed: number): string {
  if (original === 0) return "";
  const pct = ((original - compressed) / original) * 100;
  return pct >= 5
    ? "text-[hsl(142.1_76.2%_36.3%)]"
    : "text-[hsl(var(--muted-foreground))]";
}

function getQualityLabel(q: number): string {
  if (q >= 90) return "Highest quality";
  if (q >= 80) return "High quality (recommended)";
  if (q >= 65) return "Medium quality";
  if (q >= 50) return "Low quality";
  return "Very low quality";
}

// ---------------------------------------------------------------------------
// ResultRow
// ---------------------------------------------------------------------------

function ResultRow({ row }: { row: FileResultRow }) {
  const savings = getSavings(row.original.size, row.compressed.size);
  const savingsColor = getSavingsColor(row.original.size, row.compressed.size);

  return (
    <li className="flex items-center justify-between gap-3 rounded-md bg-[hsl(var(--muted))] px-3 py-2 text-sm">
      <span className="flex items-center gap-2 truncate text-foreground">
        <FileImage
          className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]"
          aria-hidden
        />
        <span className="truncate max-w-[160px] sm:max-w-xs">{row.compressed.name}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2 text-xs">
        <span className="text-[hsl(var(--muted-foreground))]">
          {formatBytes(row.original.size)} → {formatBytes(row.compressed.size)}
        </span>
        {savings && (
          <span className={cn("font-semibold", savingsColor)}>{savings}</span>
        )}
      </span>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ImageCompressorView({ tool, alias }: Props) {
  const { compressImage } = useImageProcessor();
  const { downloadSingle, downloadMultiple } = useFileDownload();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FileResultRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);
  const [quality, setQuality] = useState(80);

  const isDone = results.length > 0;
  const hasFiles = selectedFiles.length > 0;

  const eyebrow = alias?.eyebrow ?? `Free ${tool.name} — No Signup`;
  const heroSubline = alias?.heroSubline ?? tool.description;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setResults([]);
    setError(undefined);
    setProgress(0);
  }, []);

  const handleCompress = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setError(undefined);

    const newResults: FileResultRow[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const compressed = await compressImage(file, quality / 100);
        newResults.push({ original: file, compressed });
        setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }
      setResults(newResults);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Compression failed. Please check the file and try again.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles, quality, compressImage]);

  const handleDownloadAll = useCallback(() => {
    const files = results.map((r) => r.compressed);
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <MarketingShell>
    <div
      style={{ background: "hsl(223 62% 7%)", color: "hsl(210 40% 98%)" }}
    >
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-4 sm:space-y-6">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full text-xs">
            {eyebrow}
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

        <p className="text-[hsl(var(--muted-foreground))] max-w-2xl text-sm sm:text-base leading-relaxed">
          {heroSubline}
        </p>

        <ul className="flex flex-wrap gap-2 pt-1" aria-label="Tool features">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <li key={label}>
              <Badge variant="outline" className="gap-1.5 text-xs font-medium">
                <Icon className="h-3 w-3" aria-hidden />
                {label}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* ── Tool card ───────────────────────────────────────────────────── */}
      <Card className="p-0 overflow-hidden">
        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 pb-2 sm:pb-4 bg-[hsl(var(--muted)/0.3)]">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-[hsl(var(--primary))]" aria-hidden />
            <h2 className="font-semibold text-foreground">Compress image</h2>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
          {/* Upload */}
          <ImageDropzone
            onFilesSelected={handleFilesSelected}
            accept="image/jpeg,image/png,image/webp,image/gif"
            maxSizeMB={50}
            multiple
          />

          {/* Quality slider */}
          <div className="space-y-3" aria-label="Compression quality">
            <div className="flex items-center justify-between">
              <label
                htmlFor="quality-slider"
                className="text-sm font-medium text-foreground"
              >
                Quality
              </label>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs text-[hsl(var(--muted-foreground))]"
                  aria-live="polite"
                >
                  {getQualityLabel(quality)}
                </span>
                <Badge variant="secondary" className="text-xs tabular-nums">
                  {quality}%
                </Badge>
              </div>
            </div>
            <Slider
              id="quality-slider"
              min={1}
              max={100}
              step={1}
              value={[quality]}
              onValueChange={([v]) => setQuality(v)}
              aria-label={`Quality: ${quality}%`}
              aria-valuemin={1}
              aria-valuemax={100}
              aria-valuenow={quality}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
              <span>Smaller file</span>
              <span>Higher quality</span>
            </div>
          </div>

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
                  Compressing…
                </span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress
                value={progress}
                className="h-2"
                aria-label={`Compression progress: ${progress}%`}
              />
            </div>
          )}

          {/* Results */}
          {isDone && !isProcessing && (
            <div
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 space-y-3"
              role="region"
              aria-label="Compression results"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="h-5 w-5 text-[hsl(142.1_76.2%_36.3%)]"
                  aria-hidden
                />
                <span className="font-semibold text-foreground">
                  {results.length === 1
                    ? "Image compressed — ready to download"
                    : `${results.length} images compressed`}
                </span>
              </div>
              <ul className="space-y-2" aria-label="Compressed files">
                {results.map((row, i) => (
                  <ResultRow key={i} row={row} />
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            {isDone ? (
              <Button
                onClick={handleDownloadAll}
                size="lg"
                className="w-full sm:w-auto px-8 font-semibold"
                aria-label="Download compressed files"
              >
                <Download className="mr-2 h-4 w-4" aria-hidden />
                {results.length === 1 ? "Download" : `Download all (${results.length})`}
              </Button>
            ) : (
              <Button
                onClick={handleCompress}
                disabled={!hasFiles || isProcessing}
                size="lg"
                className="w-full sm:w-auto px-8 font-semibold"
                aria-label="Compress selected files"
              >
                {isProcessing ? (
                  <>
                    <span
                      className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                      aria-hidden
                    />
                    Compressing…
                  </>
                ) : (
                  "Compress Image"
                )}
              </Button>
            )}

            {(isDone || hasFiles) && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                disabled={isProcessing}
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

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      {tool.faqs.length > 0 && (
        <section aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="text-xl font-bold tracking-tight sm:text-2xl font-heading mb-4 text-foreground"
          >
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-1">
            {tool.faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-[hsl(var(--border))] rounded-lg px-4"
              >
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[hsl(var(--muted-foreground))] pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}
    </main>
    </div>
    </MarketingShell>
  );
}
