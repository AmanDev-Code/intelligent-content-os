"use client";

/**
 * ImageRotatorView — handles the image-rotator tool.
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
  RotateCw,
  FlipHorizontal,
  FlipVertical,
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
import { ImageEditShell } from "@/views/tools/image-tools/ImageEditShell";
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

type RotationPreset = {
  label: string;
  degrees: number;
  flipH?: boolean;
  flipV?: boolean;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  { icon: Zap, label: "No signup required" },
  { icon: Shield, label: "Images never leave your browser" },
  { icon: Clock, label: "Instant rotation" },
];

const ROTATION_PRESETS: RotationPreset[] = [
  { label: "90° CW", degrees: 90 },
  { label: "180°", degrees: 180 },
  { label: "270° CW", degrees: 270 },
  { label: "−90° (CCW)", degrees: -90 },
];

const FLIP_PRESETS: RotationPreset[] = [
  { label: "Flip Horizontal", degrees: 0, flipH: true },
  { label: "Flip Vertical", degrees: 0, flipV: true },
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
// Main component
// ---------------------------------------------------------------------------

export default function ImageRotatorView({ tool, alias }: Props) {
  const { rotateImage } = useImageProcessor();
  const { downloadSingle } = useFileDownload();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);
  const [activeOp, setActiveOp] = useState<RotationPreset | null>(null);

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
    setActiveOp(null);
  }, []);

  const handleApply = useCallback(
    async (preset: RotationPreset) => {
      if (!selectedFile) return;

      setActiveOp(preset);
      setIsProcessing(true);
      setProgress(10);
      setError(undefined);
      setResult(null);

      try {
        const rotated = await rotateImage(selectedFile, preset.degrees);
        setProgress(100);
        setResult(rotated);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Operation failed. Please try again.";
        setError(msg);
        setActiveOp(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedFile, rotateImage]
  );

  const handleDownload = useCallback(() => {
    if (result) downloadSingle(result);
  }, [result, downloadSingle]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
    setError(undefined);
    setProgress(0);
    setActiveOp(null);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ImageEditShell slug={tool.slug}>
      <Card className="p-0 overflow-hidden">
        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 pb-2 sm:pb-4 bg-[hsl(var(--muted)/0.3)]">
          <div className="flex items-center gap-2">
            <RotateCw className="h-5 w-5 text-[hsl(var(--primary))]" aria-hidden />
            <h2 className="font-semibold text-foreground">Rotate or flip image</h2>
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

          {/* Rotation presets */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Rotation</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Rotation options">
              {ROTATION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApply(preset)}
                  disabled={!hasFile || isProcessing}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50 disabled:cursor-not-allowed",
                    activeOp?.label === preset.label && isDone
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-foreground hover:bg-[hsl(var(--muted))]"
                  )}
                  aria-label={`Rotate ${preset.label}`}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Flip presets */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Flip</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Flip options">
              {FLIP_PRESETS.map((preset) => {
                const Icon = preset.flipH ? FlipHorizontal : FlipVertical;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApply(preset)}
                    disabled={!hasFile || isProcessing}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50 disabled:cursor-not-allowed",
                      activeOp?.label === preset.label && isDone
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-foreground hover:bg-[hsl(var(--muted))]"
                    )}
                    aria-label={preset.label}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {preset.label}
                  </button>
                );
              })}
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
                  Applying {activeOp?.label}…
                </span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress
                value={progress}
                className="h-2"
                aria-label={`Progress: ${progress}%`}
              />
            </div>
          )}

          {/* Result */}
          {isDone && !isProcessing && (
            <div
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 space-y-2"
              role="region"
              aria-label="Result"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="h-5 w-5 text-[hsl(142.1_76.2%_36.3%)]"
                  aria-hidden
                />
                <span className="font-semibold text-foreground">
                  {activeOp?.label} applied — ready to download
                </span>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {result.name} · {formatBytes(result.size)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            {isDone && (
              <Button
                onClick={handleDownload}
                size="lg"
                className="w-full sm:w-auto px-8 font-semibold"
                aria-label="Download result"
              >
                <Download className="mr-2 h-4 w-4" aria-hidden />
                Download
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
    </ImageEditShell>
  );
}
