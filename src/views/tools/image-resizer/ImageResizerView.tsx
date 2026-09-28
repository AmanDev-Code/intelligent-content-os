"use client";

/**
 * ImageResizerView — handles the image-resizer tool.
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

import { useState, useCallback, useEffect } from "react";
import {
  Download,
  RotateCcw,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Lock,
  Unlock,
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

interface Preset {
  name: string;
  w: number;
  h: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  { icon: Zap, label: "No signup required" },
  { icon: Shield, label: "Images never leave your browser" },
  { icon: Clock, label: "Instant resize" },
];

const PRESETS: Record<string, Preset[]> = {
  LinkedIn: [
    { name: "Profile Photo", w: 400, h: 400 },
    { name: "Banner", w: 1584, h: 396 },
    { name: "Post", w: 1200, h: 628 },
  ],
  Instagram: [
    { name: "Square Post", w: 1080, h: 1080 },
    { name: "Story/Reel", w: 1080, h: 1920 },
    { name: "Portrait", w: 1080, h: 1350 },
  ],
  "Twitter/X": [
    { name: "Header", w: 1500, h: 500 },
    { name: "Post", w: 1200, h: 675 },
  ],
  YouTube: [
    { name: "Thumbnail", w: 1280, h: 720 },
    { name: "Channel Art", w: 2560, h: 1440 },
  ],
  Facebook: [
    { name: "Cover", w: 820, h: 312 },
    { name: "Post", w: 1200, h: 630 },
  ],
};

const PLATFORM_ORDER = ["LinkedIn", "Instagram", "Twitter/X", "YouTube", "Facebook"] as const;

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

export default function ImageResizerView({ tool, alias }: Props) {
  const { resizeImage } = useImageProcessor();
  const { downloadSingle } = useFileDownload();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);

  // Dimensions
  const [width, setWidth] = useState<string>("1200");
  const [height, setHeight] = useState<string>("628");
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Original image dimensions for aspect ratio calculation
  const [origWidth, setOrigWidth] = useState<number | null>(null);
  const [origHeight, setOrigHeight] = useState<number | null>(null);

  const isDone = result !== null;
  const hasFile = selectedFile !== null;

  const eyebrow = alias?.eyebrow ?? `Free ${tool.name} — No Signup`;
  const heroSubline = alias?.heroSubline ?? tool.description;

  // Load original image dimensions when file is selected
  useEffect(() => {
    if (!selectedFile) {
      setOrigWidth(null);
      setOrigHeight(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    const img = new Image();
    img.onload = () => {
      setOrigWidth(img.naturalWidth);
      setOrigHeight(img.naturalHeight);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [selectedFile]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFile(files[0] ?? null);
    setResult(null);
    setError(undefined);
    setProgress(0);
    setActivePreset(null);
  }, []);

  const handlePresetClick = useCallback((preset: Preset, label: string) => {
    setWidth(String(preset.w));
    setHeight(String(preset.h));
    setMaintainAspect(false);
    setActivePreset(label);
    setResult(null);
    setError(undefined);
  }, []);

  const handleWidthChange = useCallback(
    (val: string) => {
      setWidth(val);
      setActivePreset(null);
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
      setActivePreset(null);
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
    setError(undefined);

    try {
      const resized = await resizeImage(selectedFile, w, h, maintainAspect);
      setProgress(100);
      setResult(resized);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Resize failed. Please check the file and try again.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, width, height, maintainAspect, resizeImage]);

  const handleDownload = useCallback(() => {
    if (result) downloadSingle(result);
  }, [result, downloadSingle]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
    setError(undefined);
    setProgress(0);
    setActivePreset(null);
    setWidth("1200");
    setHeight("628");
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ImageEditShell slug={tool.slug}>
      <Card className="p-0 overflow-hidden">
        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 pb-2 sm:pb-4 bg-[hsl(var(--muted)/0.3)]">
          <div className="flex items-center gap-2">
            <Maximize2 className="h-5 w-5 text-[hsl(var(--primary))]" aria-hidden />
            <h2 className="font-semibold text-foreground">Resize image</h2>
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

          {/* Platform presets */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Platform presets
            </p>
            <div className="space-y-3">
              {PLATFORM_ORDER.map((platform) => (
                <div key={platform}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] mb-2">
                    {platform}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS[platform].map((preset) => {
                      const label = `${platform}-${preset.name}`;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => handlePresetClick(preset, label)}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                            activePreset === label
                              ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                              : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-foreground hover:bg-[hsl(var(--muted))]"
                          )}
                          aria-pressed={activePreset === label}
                        >
                          {preset.name}
                          <span className="ml-1.5 text-[10px] opacity-70">
                            {preset.w}×{preset.h}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Custom dimensions */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Custom dimensions (px)
            </p>
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="resize-width"
                  className="text-xs text-[hsl(var(--muted-foreground))]"
                >
                  Width
                </label>
                <input
                  id="resize-width"
                  type="number"
                  min={1}
                  max={10000}
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  aria-label="Width in pixels"
                />
              </div>

              <button
                type="button"
                onClick={() => setMaintainAspect((v) => !v)}
                className={cn(
                  "mb-0.5 rounded-lg border p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                  maintainAspect
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]"
                )}
                aria-label={maintainAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                title={maintainAspect ? "Click to unlock aspect ratio" : "Click to lock aspect ratio"}
              >
                {maintainAspect ? (
                  <Lock className="h-4 w-4" aria-hidden />
                ) : (
                  <Unlock className="h-4 w-4" aria-hidden />
                )}
              </button>

              <div className="flex-1 space-y-1">
                <label
                  htmlFor="resize-height"
                  className="text-xs text-[hsl(var(--muted-foreground))]"
                >
                  Height
                </label>
                <input
                  id="resize-height"
                  type="number"
                  min={1}
                  max={10000}
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  aria-label="Height in pixels"
                />
              </div>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {maintainAspect
                ? "Aspect ratio is locked — changing one dimension adjusts the other."
                : "Aspect ratio is unlocked — dimensions are set independently."}
            </p>
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
                <span className="text-[hsl(var(--muted-foreground))]">Resizing…</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress
                value={progress}
                className="h-2"
                aria-label={`Resize progress: ${progress}%`}
              />
            </div>
          )}

          {/* Result */}
          {isDone && !isProcessing && (
            <div
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 space-y-2"
              role="region"
              aria-label="Resize result"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="h-5 w-5 text-[hsl(142.1_76.2%_36.3%)]"
                  aria-hidden
                />
                <span className="font-semibold text-foreground">
                  Image resized — {width}×{height} px
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
                aria-label="Download resized image"
              >
                <Download className="mr-2 h-4 w-4" aria-hidden />
                Download
              </Button>
            ) : (
              <Button
                onClick={handleResize}
                disabled={!hasFile || isProcessing}
                size="lg"
                className="w-full sm:w-auto px-8 font-semibold"
                aria-label="Resize image"
              >
                {isProcessing ? (
                  <>
                    <span
                      className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                      aria-hidden
                    />
                    Resizing…
                  </>
                ) : (
                  "Resize Image"
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
    </ImageEditShell>
  );
}
