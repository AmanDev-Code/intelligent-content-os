"use client";

/**
 * WatermarkView — handles the watermark-image tool.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge,
 *   Progress, Accordion, AccordionContent, AccordionItem,
 *   AccordionTrigger, Alert, AlertDescription, Separator, Slider.
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
  Stamp,
  Type,
  Image as ImageIcon,
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
import { ImageEditShell } from "@/views/tools/image-tools/ImageEditShell";
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
import { useImageProcessor } from "@/hooks/tools/useImageProcessor";
import { useFileDownload } from "@/hooks/tools/useFileDownload";
import { cn } from "@/lib/utils";
import type { WatermarkConfig } from "@/hooks/tools/useImageProcessor";
import type { EditTool } from "@/lib/image-edit-data";
import type { EditAlias } from "@/lib/image-edit-aliases";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  tool: EditTool;
  alias?: EditAlias;
}

type WatermarkType = "text" | "image";
type WatermarkPosition = WatermarkConfig["position"];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  { icon: Zap, label: "No signup required" },
  { icon: Shield, label: "Images never leave your browser" },
  { icon: Clock, label: "Instant watermark" },
];

const POSITION_OPTIONS: { label: string; value: WatermarkPosition }[] = [
  { label: "Top Left", value: "top-left" },
  { label: "Top Center", value: "top-center" },
  { label: "Top Right", value: "top-right" },
  { label: "Center", value: "center" },
  { label: "Bottom Left", value: "bottom-left" },
  { label: "Bottom Center", value: "bottom-center" },
  { label: "Bottom Right", value: "bottom-right" },
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

export default function WatermarkView({ tool, alias }: Props) {
  const { addWatermarkToImage } = useImageProcessor();
  const { downloadSingle } = useFileDownload();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);

  // Watermark config
  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
  const [watermarkText, setWatermarkText] = useState("© My Name");
  const [fontSize, setFontSize] = useState(32);
  const [color, setColor] = useState("#ffffff");
  const [position, setPosition] = useState<WatermarkPosition>("bottom-right");
  const [opacity, setOpacity] = useState(60);
  const [watermarkImageSrc, setWatermarkImageSrc] = useState<string | undefined>(undefined);

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

  const handleWatermarkImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setWatermarkImageSrc(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleAddWatermark = useCallback(async () => {
    if (!selectedFile) return;

    if (watermarkType === "text" && !watermarkText.trim()) {
      setError("Please enter watermark text.");
      return;
    }
    if (watermarkType === "image" && !watermarkImageSrc) {
      setError("Please upload a watermark image.");
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError(undefined);
    setResult(null);

    const config: WatermarkConfig = {
      type: watermarkType,
      text: watermarkType === "text" ? watermarkText : undefined,
      watermarkImage: watermarkType === "image" ? watermarkImageSrc : undefined,
      position,
      opacity: opacity / 100,
      fontSize: watermarkType === "text" ? fontSize : undefined,
      color: watermarkType === "text" ? color : undefined,
    };

    try {
      const watermarked = await addWatermarkToImage(selectedFile, config);
      setProgress(100);
      setResult(watermarked);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Watermark failed. Please check the file and try again.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [
    selectedFile,
    watermarkType,
    watermarkText,
    watermarkImageSrc,
    position,
    opacity,
    fontSize,
    color,
    addWatermarkToImage,
  ]);

  const handleDownload = useCallback(() => {
    if (result) downloadSingle(result);
  }, [result, downloadSingle]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
    setError(undefined);
    setProgress(0);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ImageEditShell slug={tool.slug}>
      <Card className="p-0 overflow-hidden">
        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 pb-2 sm:pb-4 bg-[hsl(var(--muted)/0.3)]">
          <div className="flex items-center gap-2">
            <Stamp className="h-5 w-5 text-[hsl(var(--primary))]" aria-hidden />
            <h2 className="font-semibold text-foreground">Add watermark</h2>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
          {/* Upload */}
          <ImageDropzone
            onFilesSelected={handleFilesSelected}
            accept="image/jpeg,image/png,image/webp"
            maxSizeMB={50}
            multiple={false}
          />

          {/* Watermark type toggle */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Watermark type</p>
            <div
              className="flex gap-2"
              role="group"
              aria-label="Select watermark type"
            >
              <button
                type="button"
                onClick={() => setWatermarkType("text")}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                  watermarkType === "text"
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-foreground hover:bg-[hsl(var(--muted))]"
                )}
                aria-pressed={watermarkType === "text"}
              >
                <Type className="h-4 w-4" aria-hidden />
                Text
              </button>
              <button
                type="button"
                onClick={() => setWatermarkType("image")}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                  watermarkType === "image"
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-foreground hover:bg-[hsl(var(--muted))]"
                )}
                aria-pressed={watermarkType === "image"}
              >
                <ImageIcon className="h-4 w-4" aria-hidden />
                Image / Logo
              </button>
            </div>
          </div>

          {/* Text watermark settings */}
          {watermarkType === "text" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="watermark-text"
                  className="text-xs font-medium text-[hsl(var(--muted-foreground))]"
                >
                  Watermark text
                </label>
                <input
                  id="watermark-text"
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="© Your Name or Brand"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-foreground placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  aria-label="Watermark text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="watermark-fontsize"
                    className="text-xs font-medium text-[hsl(var(--muted-foreground))]"
                  >
                    Font size: {fontSize}px
                  </label>
                  <Slider
                    id="watermark-fontsize"
                    min={8}
                    max={120}
                    step={1}
                    value={[fontSize]}
                    onValueChange={([v]) => setFontSize(v)}
                    aria-label={`Font size: ${fontSize}px`}
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="watermark-color"
                    className="text-xs font-medium text-[hsl(var(--muted-foreground))]"
                  >
                    Text color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="watermark-color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-9 w-14 cursor-pointer rounded-lg border border-[hsl(var(--border))] bg-transparent p-0.5 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                      aria-label="Text color picker"
                    />
                    <span className="text-sm text-[hsl(var(--muted-foreground))] font-mono">
                      {color}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image watermark settings */}
          {watermarkType === "image" && (
            <div className="space-y-2">
              <label
                htmlFor="watermark-image-upload"
                className="text-xs font-medium text-[hsl(var(--muted-foreground))]"
              >
                Watermark image (PNG with transparency recommended)
              </label>
              <input
                id="watermark-image-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleWatermarkImageUpload}
                className="w-full cursor-pointer rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-foreground file:mr-3 file:rounded file:border-0 file:bg-[hsl(var(--muted))] file:px-2 file:py-1 file:text-xs file:font-medium file:text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                aria-label="Upload watermark image"
              />
              {watermarkImageSrc && (
                <p className="text-xs text-[hsl(142.1_76.2%_36.3%)]">
                  Watermark image loaded.
                </p>
              )}
            </div>
          )}

          {/* Position */}
          <div className="space-y-2">
            <label
              htmlFor="watermark-position"
              className="text-xs font-medium text-[hsl(var(--muted-foreground))]"
            >
              Position
            </label>
            <select
              id="watermark-position"
              value={position}
              onChange={(e) => setPosition(e.target.value as WatermarkPosition)}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              aria-label="Watermark position"
            >
              {POSITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="watermark-opacity"
                className="text-xs font-medium text-[hsl(var(--muted-foreground))]"
              >
                Opacity
              </label>
              <Badge variant="secondary" className="text-xs tabular-nums">
                {opacity}%
              </Badge>
            </div>
            <Slider
              id="watermark-opacity"
              min={1}
              max={100}
              step={1}
              value={[opacity]}
              onValueChange={([v]) => setOpacity(v)}
              aria-label={`Opacity: ${opacity}%`}
              aria-valuemin={1}
              aria-valuemax={100}
              aria-valuenow={opacity}
            />
            <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
              <span>Subtle</span>
              <span>Visible</span>
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
                  Adding watermark…
                </span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress
                value={progress}
                className="h-2"
                aria-label={`Watermark progress: ${progress}%`}
              />
            </div>
          )}

          {/* Result */}
          {isDone && !isProcessing && (
            <div
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 space-y-2"
              role="region"
              aria-label="Watermark result"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="h-5 w-5 text-[hsl(142.1_76.2%_36.3%)]"
                  aria-hidden
                />
                <span className="font-semibold text-foreground">
                  Watermark added — ready to download
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
                aria-label="Download watermarked image"
              >
                <Download className="mr-2 h-4 w-4" aria-hidden />
                Download
              </Button>
            ) : (
              <Button
                onClick={handleAddWatermark}
                disabled={!hasFile || isProcessing}
                size="lg"
                className="w-full sm:w-auto px-8 font-semibold"
                aria-label="Add watermark"
              >
                {isProcessing ? (
                  <>
                    <span
                      className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                      aria-hidden
                    />
                    Adding watermark…
                  </>
                ) : (
                  "Add Watermark"
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
