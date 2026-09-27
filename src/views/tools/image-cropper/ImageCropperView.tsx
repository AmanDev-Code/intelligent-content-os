"use client";

/**
 * ImageCropperView — handles the image-cropper tool.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge,
 *   Progress, Accordion, AccordionContent, AccordionItem,
 *   AccordionTrigger, Alert, AlertDescription, Separator.
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
  Crop,
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
import { useImageProcessor } from "@/hooks/tools/useImageProcessor";
import { useFileDownload } from "@/hooks/tools/useFileDownload";
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
  { icon: Zap, label: "No signup required" },
  { icon: Shield, label: "Images never leave your browser" },
  { icon: Clock, label: "Instant crop" },
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
// DimensionInput — reusable labeled number input
// ---------------------------------------------------------------------------

function DimensionInput({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-xs font-medium text-[hsl(var(--muted-foreground))]"
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
        className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        aria-label={label}
      />
      {hint && (
        <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{hint}</p>
      )}
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
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);

  const [cropX, setCropX] = useState("0");
  const [cropY, setCropY] = useState("0");
  const [cropW, setCropW] = useState("800");
  const [cropH, setCropH] = useState("600");

  const isDone = result !== null;
  const hasFile = selectedFile !== null;

  const eyebrow = alias?.eyebrow ?? `Free ${tool.name} — No Signup`;
  const heroSubline = alias?.heroSubline ?? tool.description;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFile(files[0] ?? null);
    setResult(null);
    setError(undefined);
    setProgress(0);
  }, []);

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
      const cropped = await cropImage(selectedFile, { x, y, width: w, height: h });
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
    setSelectedFile(null);
    setResult(null);
    setError(undefined);
    setProgress(0);
    setCropX("0");
    setCropY("0");
    setCropW("800");
    setCropH("600");
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
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
            <Crop className="h-5 w-5 text-[hsl(var(--primary))]" aria-hidden />
            <h2 className="font-semibold text-foreground">Crop image</h2>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
          {/* Upload */}
          <ImageDropzone
            onFilesSelected={handleFilesSelected}
            accept="image/jpeg,image/png,image/webp,image/gif"
            maxSizeMB={50}
            multiple={false}
          />

          {/* Crop controls */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-foreground">
              Crop area (pixels)
            </legend>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <DimensionInput
                id="crop-x"
                label="X offset"
                value={cropX}
                onChange={setCropX}
                hint="Left edge"
              />
              <DimensionInput
                id="crop-y"
                label="Y offset"
                value={cropY}
                onChange={setCropY}
                hint="Top edge"
              />
              <DimensionInput
                id="crop-w"
                label="Width"
                value={cropW}
                onChange={setCropW}
                hint="Crop width"
              />
              <DimensionInput
                id="crop-h"
                label="Height"
                value={cropH}
                onChange={setCropH}
                hint="Crop height"
              />
            </div>

            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              The crop area starts at (X, Y) from the top-left corner and extends
              Width × Height pixels. Coordinates outside the image bounds are clamped.
            </p>
          </fieldset>

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
                <span className="text-[hsl(var(--muted-foreground))]">Cropping…</span>
                <span className="font-medium text-foreground">{progress}%</span>
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
            <div
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 space-y-2"
              role="region"
              aria-label="Crop result"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="h-5 w-5 text-[hsl(142.1_76.2%_36.3%)]"
                  aria-hidden
                />
                <span className="font-semibold text-foreground">
                  Image cropped — {cropW}×{cropH} px
                </span>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {result.name} · {formatBytes(result.size)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            {isDone ? (
              <Button
                onClick={handleDownload}
                size="lg"
                className="w-full sm:w-auto px-8 font-semibold"
                aria-label="Download cropped image"
              >
                <Download className="mr-2 h-4 w-4" aria-hidden />
                Download
              </Button>
            ) : (
              <Button
                onClick={handleCrop}
                disabled={!hasFile || isProcessing}
                size="lg"
                className="w-full sm:w-auto px-8 font-semibold"
                aria-label="Crop image"
              >
                {isProcessing ? (
                  <>
                    <span
                      className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                      aria-hidden
                    />
                    Cropping…
                  </>
                ) : (
                  "Crop Image"
                )}
              </Button>
            )}

            {(isDone || hasFile) && (
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
    </div>
  );
}
