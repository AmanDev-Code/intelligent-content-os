"use client";

/**
 * ImageWorkbenchView — multi-operation pipeline editor.
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
  Plus,
  Trash2,
  Maximize2,
  Crop,
  RotateCw,
  Gauge,
  RefreshCw,
  Play,
  GripVertical,
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
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
import { useImageProcessor } from "@/hooks/tools/useImageProcessor";
import { useFileDownload } from "@/hooks/tools/useFileDownload";
import { cn } from "@/lib/utils";
import type { PipelineOptions } from "@/hooks/tools/useImageProcessor";
import type { EditTool } from "@/lib/image-edit-data";
import type { EditAlias } from "@/lib/image-edit-aliases";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  tool: EditTool;
  alias?: EditAlias;
}

type OpType = "resize" | "crop" | "rotate" | "compress" | "convert";

interface Op {
  id: string;
  type: OpType;
  // Resize
  resizeWidth?: number;
  resizeHeight?: number;
  maintainAspect?: boolean;
  // Crop
  cropX?: number;
  cropY?: number;
  cropW?: number;
  cropH?: number;
  // Rotate
  rotateDegrees?: number;
  flipH?: boolean;
  flipV?: boolean;
  // Compress
  quality?: number;
  // Convert
  convertFormat?: string;
}

const OP_LABELS: Record<OpType, string> = {
  resize: "Resize",
  crop: "Crop",
  rotate: "Rotate / Flip",
  compress: "Compress",
  convert: "Convert Format",
};

const OP_ICONS: Record<OpType, React.ElementType> = {
  resize: Maximize2,
  crop: Crop,
  rotate: RotateCw,
  compress: Gauge,
  convert: RefreshCw,
};

const OUTPUT_FORMATS = ["jpg", "png", "webp", "gif"];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  { icon: Zap, label: "No signup required" },
  { icon: Shield, label: "Images never leave your browser" },
  { icon: Clock, label: "Multi-op pipeline" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function defaultOp(type: OpType): Op {
  switch (type) {
    case "resize":
      return { id: uid(), type, resizeWidth: 1200, resizeHeight: 628, maintainAspect: true };
    case "crop":
      return { id: uid(), type, cropX: 0, cropY: 0, cropW: 800, cropH: 600 };
    case "rotate":
      return { id: uid(), type, rotateDegrees: 90, flipH: false, flipV: false };
    case "compress":
      return { id: uid(), type, quality: 80 };
    case "convert":
      return { id: uid(), type, convertFormat: "webp" };
  }
}

function buildPipelineOptions(ops: Op[]): PipelineOptions {
  const opts: PipelineOptions = {};

  for (const op of ops) {
    switch (op.type) {
      case "resize":
        opts.resize = {
          mode: "exact",
          width: op.resizeWidth ?? 1200,
          height: op.resizeHeight ?? 628,
          maintainAspect: op.maintainAspect ?? true,
        };
        break;
      case "crop":
        // Encode crop as a resize-contain approximation since PipelineOptions
        // doesn't have a direct crop field — we call cropImage separately in
        // pipeline execution instead.
        break;
      case "rotate":
        if (op.rotateDegrees) opts.rotate = op.rotateDegrees;
        if (op.flipH) opts.flipHorizontal = true;
        if (op.flipV) opts.flipVertical = true;
        break;
      case "compress":
        opts.quality = (op.quality ?? 80) / 100;
        break;
      case "convert":
        opts.format = op.convertFormat ?? "webp";
        break;
    }
  }

  return opts;
}

// ---------------------------------------------------------------------------
// OpCard — renders settings for a single pipeline step
// ---------------------------------------------------------------------------

function OpCard({
  op,
  index,
  total,
  onChange,
  onRemove,
}: {
  op: Op;
  index: number;
  total: number;
  onChange: (updated: Op) => void;
  onRemove: () => void;
}) {
  const Icon = OP_ICONS[op.type];

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[hsl(var(--muted)/0.4)]">
        <div className="flex items-center gap-3">
          <GripVertical
            className="h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0"
            aria-hidden
          />
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Icon className="h-4 w-4 text-[hsl(var(--primary))]" aria-hidden />
            {index + 1}. {OP_LABELS[op.type]}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          aria-label={`Remove ${OP_LABELS[op.type]} step`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* Settings */}
      <div className="px-4 py-4 space-y-3">
        {op.type === "resize" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor={`resize-w-${op.id}`}
                  className="text-xs text-[hsl(var(--muted-foreground))]"
                >
                  Width (px)
                </label>
                <input
                  id={`resize-w-${op.id}`}
                  type="number"
                  min={1}
                  value={op.resizeWidth ?? 1200}
                  onChange={(e) =>
                    onChange({ ...op, resizeWidth: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor={`resize-h-${op.id}`}
                  className="text-xs text-[hsl(var(--muted-foreground))]"
                >
                  Height (px)
                </label>
                <input
                  id={`resize-h-${op.id}`}
                  type="number"
                  min={1}
                  value={op.resizeHeight ?? 628}
                  onChange={(e) =>
                    onChange({ ...op, resizeHeight: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={op.maintainAspect ?? true}
                onChange={(e) =>
                  onChange({ ...op, maintainAspect: e.target.checked })
                }
                className="rounded border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))]"
                aria-label="Maintain aspect ratio"
              />
              Maintain aspect ratio
            </label>
          </div>
        )}

        {op.type === "crop" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ["X offset", "cropX", 0],
                ["Y offset", "cropY", 0],
                ["Width", "cropW", 800],
                ["Height", "cropH", 600],
              ] as [string, keyof Op, number][]
            ).map(([lbl, key, fallback]) => (
              <div key={key} className="space-y-1">
                <label
                  htmlFor={`crop-${key}-${op.id}`}
                  className="text-xs text-[hsl(var(--muted-foreground))]"
                >
                  {lbl}
                </label>
                <input
                  id={`crop-${key}-${op.id}`}
                  type="number"
                  min={0}
                  value={(op[key] as number) ?? fallback}
                  onChange={(e) =>
                    onChange({
                      ...op,
                      [key]: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
              </div>
            ))}
          </div>
        )}

        {op.type === "rotate" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor={`rotate-deg-${op.id}`}
                className="text-xs text-[hsl(var(--muted-foreground))]"
              >
                Rotation degrees
              </label>
              <select
                id={`rotate-deg-${op.id}`}
                value={op.rotateDegrees ?? 90}
                onChange={(e) =>
                  onChange({ ...op, rotateDegrees: parseInt(e.target.value, 10) })
                }
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                aria-label="Rotation degrees"
              >
                <option value={90}>90° CW</option>
                <option value={180}>180°</option>
                <option value={270}>270° CW</option>
                <option value={-90}>−90° (CCW)</option>
                <option value={0}>No rotation (flip only)</option>
              </select>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={op.flipH ?? false}
                  onChange={(e) => onChange({ ...op, flipH: e.target.checked })}
                  className="rounded border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  aria-label="Flip horizontal"
                />
                Flip H
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={op.flipV ?? false}
                  onChange={(e) => onChange({ ...op, flipV: e.target.checked })}
                  className="rounded border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  aria-label="Flip vertical"
                />
                Flip V
              </label>
            </div>
          </div>
        )}

        {op.type === "compress" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`compress-q-${op.id}`}
                className="text-xs text-[hsl(var(--muted-foreground))]"
              >
                Quality
              </label>
              <Badge variant="secondary" className="text-xs tabular-nums">
                {op.quality ?? 80}%
              </Badge>
            </div>
            <Slider
              id={`compress-q-${op.id}`}
              min={1}
              max={100}
              step={1}
              value={[op.quality ?? 80]}
              onValueChange={([v]) => onChange({ ...op, quality: v })}
              aria-label={`Compression quality: ${op.quality ?? 80}%`}
            />
          </div>
        )}

        {op.type === "convert" && (
          <div className="space-y-1">
            <label
              htmlFor={`convert-fmt-${op.id}`}
              className="text-xs text-[hsl(var(--muted-foreground))]"
            >
              Output format
            </label>
            <select
              id={`convert-fmt-${op.id}`}
              value={op.convertFormat ?? "webp"}
              onChange={(e) => onChange({ ...op, convertFormat: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              aria-label="Output format"
            >
              {OUTPUT_FORMATS.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ImageWorkbenchView({ tool, alias }: Props) {
  const { processPipeline, cropImage } = useImageProcessor();
  const { downloadSingle } = useFileDownload();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);
  const [pipeline, setPipeline] = useState<Op[]>([
    defaultOp("resize"),
    defaultOp("compress"),
  ]);

  const isDone = result !== null;
  const hasFile = selectedFile !== null;

  const eyebrow = alias?.eyebrow ?? `Free ${tool.name} — No Signup`;
  const heroSubline = alias?.heroSubline ?? tool.description;

  // ── Pipeline management ───────────────────────────────────────────────────

  const addOp = useCallback((type: OpType) => {
    setPipeline((prev) => [...prev, defaultOp(type)]);
  }, []);

  const updateOp = useCallback((id: string, updated: Op) => {
    setPipeline((prev) => prev.map((op) => (op.id === id ? updated : op)));
  }, []);

  const removeOp = useCallback((id: string) => {
    setPipeline((prev) => prev.filter((op) => op.id !== id));
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFile(files[0] ?? null);
    setResult(null);
    setError(undefined);
    setProgress(0);
  }, []);

  const handleRunPipeline = useCallback(async () => {
    if (!selectedFile || pipeline.length === 0) return;

    setIsProcessing(true);
    setProgress(5);
    setError(undefined);
    setResult(null);

    try {
      let current: File = selectedFile;
      const total = pipeline.length;

      for (let i = 0; i < total; i++) {
        const op = pipeline[i];

        if (op.type === "crop") {
          // cropImage is not in PipelineOptions — execute directly
          current = await cropImage(current, {
            x: op.cropX ?? 0,
            y: op.cropY ?? 0,
            width: op.cropW ?? 800,
            height: op.cropH ?? 600,
          });
        } else {
          // Build single-op PipelineOptions and run via processPipeline
          const opts = buildPipelineOptions([op]);
          current = await processPipeline(current, opts);
        }

        setProgress(Math.round(((i + 1) / total) * 90) + 5);
      }

      setProgress(100);
      setResult(current);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Pipeline failed. Please check your settings and try again.";
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, pipeline, processPipeline, cropImage]);

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

      {/* ── Tool layout ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Upload + pipeline */}
        <div className="space-y-4">
          {/* Upload */}
          <Card className="p-0 overflow-hidden">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 pb-2 sm:pb-3 bg-[hsl(var(--muted)/0.3)]">
              <h2 className="font-semibold text-foreground text-sm">
                1. Upload image
              </h2>
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6">
              <ImageDropzone
                onFilesSelected={handleFilesSelected}
                accept="image/jpeg,image/png,image/webp,image/gif"
                maxSizeMB={50}
                multiple={false}
              />
            </CardContent>
          </Card>

          {/* Pipeline */}
          <Card className="p-0 overflow-hidden">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 pb-2 sm:pb-3 bg-[hsl(var(--muted)/0.3)]">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground text-sm">
                  2. Build pipeline
                </h2>
                <Badge variant="outline" className="text-xs">
                  {pipeline.length} {pipeline.length === 1 ? "step" : "steps"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6 space-y-3">
              {pipeline.length === 0 && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">
                  No steps yet — add operations from the sidebar.
                </p>
              )}

              {pipeline.map((op, i) => (
                <OpCard
                  key={op.id}
                  op={op}
                  index={i}
                  total={pipeline.length}
                  onChange={(updated) => updateOp(op.id, updated)}
                  onRemove={() => removeOp(op.id)}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — add ops + run */}
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 pb-2 sm:pb-3 bg-[hsl(var(--muted)/0.3)]">
              <h2 className="font-semibold text-foreground text-sm">
                Add operation
              </h2>
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6 space-y-2">
              {(Object.keys(OP_LABELS) as OpType[]).map((type) => {
                const Icon = OP_ICONS[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addOp(type)}
                    className="flex w-full items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-medium text-foreground hover:bg-[hsl(var(--muted))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                    aria-label={`Add ${OP_LABELS[type]} step`}
                  >
                    <Icon
                      className="h-4 w-4 text-[hsl(var(--primary))]"
                      aria-hidden
                    />
                    <span>{OP_LABELS[type]}</span>
                    <Plus
                      className="ml-auto h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]"
                      aria-hidden
                    />
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Run panel */}
          <Card className="p-0 overflow-hidden">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 pb-2 sm:pb-3 bg-[hsl(var(--muted)/0.3)]">
              <h2 className="font-semibold text-foreground text-sm">
                3. Run pipeline
              </h2>
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6 space-y-4">
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
                      Running pipeline…
                    </span>
                    <span className="font-medium text-foreground">{progress}%</span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2"
                    aria-label={`Pipeline progress: ${progress}%`}
                  />
                </div>
              )}

              {/* Result */}
              {isDone && !isProcessing && (
                <div
                  className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 space-y-1"
                  role="region"
                  aria-label="Pipeline result"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className="h-4 w-4 text-[hsl(142.1_76.2%_36.3%)]"
                      aria-hidden
                    />
                    <span className="text-sm font-semibold text-foreground">
                      Pipeline complete
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {result.name} · {formatBytes(result.size)}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                {isDone ? (
                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="w-full font-semibold"
                    aria-label="Download result"
                  >
                    <Download className="mr-2 h-4 w-4" aria-hidden />
                    Download
                  </Button>
                ) : (
                  <Button
                    onClick={handleRunPipeline}
                    disabled={!hasFile || pipeline.length === 0 || isProcessing}
                    size="lg"
                    className="w-full font-semibold"
                    aria-label="Run pipeline"
                  >
                    {isProcessing ? (
                      <>
                        <span
                          className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                          aria-hidden
                        />
                        Running…
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" aria-hidden />
                        Run Pipeline
                      </>
                    )}
                  </Button>
                )}

                {(isDone || hasFile) && (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="default"
                    disabled={isProcessing}
                    className="w-full"
                    aria-label="Reset"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
