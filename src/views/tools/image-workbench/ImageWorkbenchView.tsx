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
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Maximize2,
  Crop,
  RotateCw,
  Gauge,
  RefreshCw,
  GripVertical,
  ArrowRight,
  Monitor,
  Sparkles,
  Lock,
  Star,
  FileImage,
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
import { TrustStrip, type TrustFeature } from "@/views/tools/shared/TrustStrip";
import { TrustBadges, type TrustBadge } from "@/views/tools/shared/TrustBadges";
import { StepProgressBar, type Step } from "@/views/tools/shared/StepProgressBar";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar, SidebarWrapper } from "@/views/tools/image-tools/ImageToolsSidebar";
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

/** Format → color for hero illustration badges */
const FORMAT_COLORS: Record<string, string> = {
  jpg: "#EF4444",
  png: "#3B82F6",
  webp: "#10B981",
  gif: "#EC4899",
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PREMIUM_TRUST_BADGES: TrustBadge[] = [
  { icon: Sparkles, text: "No signup required" },
  { icon: Lock, text: "100% private" },
  { icon: Monitor, text: "Runs in your browser" },
  { icon: Star, text: "Support multiple formats" },
];

const TRUST_FEATURES: TrustFeature[] = [
  { icon: Monitor, title: "Works entirely in your browser", description: "No uploads, complete privacy." },
  { icon: FileImage, title: "Multi-operation pipeline", description: "Apply multiple edits at once." },
  { icon: Star, title: "Supports all formats", description: "JPG, PNG, WEBP, GIF, SVG, and more." },
  { icon: Sparkles, title: "High quality output", description: "Clean and optimized results." },
];

const STEPS: Step[] = [
  { number: 1, label: "Upload your image" },
  { number: 2, label: "Add operation" },
  { number: 3, label: "Build pipeline" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _uidCounter = 0;
function uid(): string {
  return `op-${++_uidCounter}`;
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
    <MarketingShell>
      <SidebarWrapper>
        <ImageToolsSidebar activeSlug="image-workbench" />
        <div className="flex-1 min-w-0 overflow-x-hidden bg-[hsl(var(--tool-bg))]">

          {/* Scoped keyframes for hero illustration */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes wb-float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
            @keyframes wb-float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
            @keyframes wb-float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
            @keyframes wb-float4 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
            @keyframes wb-sparkle { 0%,100%{opacity:0.2;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.6)} }
            @keyframes wb-glow-drift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(12px,-8px)} }
            @keyframes wb-glow-drift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-8px,10px)} }
            @keyframes wb-pulse-badge { 0%,100%{box-shadow:0 4px 20px rgba(249,115,22,0.15)} 50%{box-shadow:0 4px 35px rgba(249,115,22,0.35)} }
            @keyframes wb-dash { to { stroke-dashoffset: -20; } }
            @media(prefers-reduced-motion:reduce){
              .wb-float,.wb-sparkle-dot,.wb-glow,.wb-pulse,.wb-dash-line{animation:none!important}
            }
          `}} />

          {/* ── Premium Hero ─────────────────────────────────────────── */}
          <section className="relative overflow-hidden px-6 pt-10 pb-8 sm:px-10 sm:pt-14 sm:pb-10 lg:px-16">
            {/* Ambient glows */}
            <div
              className="wb-glow pointer-events-none absolute -top-32 right-[10%] h-[420px] w-[420px] rounded-full opacity-[0.18] blur-[100px]"
              style={{ background: "radial-gradient(circle, #F97316, transparent 70%)", animation: "wb-glow-drift1 6s ease-in-out infinite" }}
              aria-hidden
            />
            <div
              className="wb-glow pointer-events-none absolute top-[30%] right-[25%] h-[320px] w-[320px] rounded-full opacity-[0.12] blur-[80px]"
              style={{ background: "radial-gradient(circle, #8B5CF6, transparent 70%)", animation: "wb-glow-drift2 8s ease-in-out infinite" }}
              aria-hidden
            />

            <div className="relative mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center lg:gap-16">
              {/* ── Left: Text column ──────────────────────────────── */}
              <div className="flex-1 space-y-5">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}
                >
                  Free Online Image Workbench
                </span>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-display text-foreground leading-[1.1]">
                  Edit, convert, optimize —{" "}
                  <span className="gradient-text">all in one place.</span>
                </h1>

                <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Chain multiple image operations — resize, crop, rotate,
                  compress, convert — in a single pipeline. No uploads, no signup,
                  all in your browser.
                </p>

                <TrustBadges badges={PREMIUM_TRUST_BADGES} />
              </div>

              {/* ── Right: Animated 3D illustration ────────────────── */}
              <div className="relative hidden lg:block lg:w-[440px] lg:h-[380px]" aria-hidden>

                {/* Central image frame with glow border */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[160px] rounded-2xl overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #1a2744, #0f1a30)",
                    border: "1.5px solid rgba(249,115,22,0.3)",
                    boxShadow: "0 0 50px rgba(249,115,22,0.12), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  {/* Sun */}
                  <div
                    className="absolute top-5 right-8 w-8 h-8 rounded-full"
                    style={{
                      background: "radial-gradient(circle, #F59E0B, rgba(245,158,11,0.2))",
                      boxShadow: "0 0 24px rgba(245,158,11,0.4)",
                    }}
                  />
                  {/* Mountains */}
                  <svg className="absolute bottom-0 left-0 w-full h-[80px]" viewBox="0 0 220 80" fill="none" preserveAspectRatio="none">
                    <path d="M0 50 L40 18 L70 38 L110 8 L160 32 L220 12 L220 80 L0 80Z" fill="#0f2440" opacity="0.7" />
                    <path d="M0 58 L60 28 L100 48 L160 22 L220 42 L220 80 L0 80Z" fill="#0a1830" opacity="0.6" />
                  </svg>
                  {/* Reflection overlay */}
                  <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, transparent 40%, rgba(249,115,22,0.04) 100%)" }} />
                </div>

                {/* Connection lines (animated dashes) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 440 380" fill="none">
                  <path className="wb-dash-line" d="M120 80 C170 80, 170 150, 185 170" stroke="#F97316" strokeWidth="1.2" opacity="0.25" strokeDasharray="5 4" style={{ animation: "wb-dash 2s linear infinite" }} />
                  <path className="wb-dash-line" d="M340 65 C300 65, 290 150, 270 170" stroke="#3B82F6" strokeWidth="1.2" opacity="0.25" strokeDasharray="5 4" style={{ animation: "wb-dash 2.5s linear infinite" }} />
                  <path className="wb-dash-line" d="M110 290 C160 290, 170 240, 185 220" stroke="#10B981" strokeWidth="1.2" opacity="0.25" strokeDasharray="5 4" style={{ animation: "wb-dash 2.2s linear infinite" }} />
                  <path className="wb-dash-line" d="M360 300 C310 300, 290 240, 270 220" stroke="#8B5CF6" strokeWidth="1.2" opacity="0.25" strokeDasharray="5 4" style={{ animation: "wb-dash 2.8s linear infinite" }} />
                </svg>

                {/* ── Floating operation cards ── */}

                {/* Resize — top-left */}
                <div
                  className="wb-float absolute left-0 top-[30px] flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
                  style={{
                    background: "linear-gradient(135deg, #1a2744, #131d33)",
                    border: "1.2px solid rgba(249,115,22,0.45)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 24px rgba(249,115,22,0.1)",
                    animation: "wb-float1 4s ease-in-out infinite",
                  }}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(249,115,22,0.15)" }}>
                    <Maximize2 className="h-3.5 w-3.5" style={{ color: "#F97316" }} />
                  </div>
                  <span className="text-[13px] font-semibold text-[#e2e8f0]">Resize</span>
                </div>

                {/* Crop — top-right */}
                <div
                  className="wb-float absolute right-0 top-[15px] flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
                  style={{
                    background: "linear-gradient(135deg, #1a2744, #131d33)",
                    border: "1.2px solid rgba(59,130,246,0.45)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 24px rgba(59,130,246,0.1)",
                    animation: "wb-float2 5s ease-in-out infinite",
                  }}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(59,130,246,0.15)" }}>
                    <Crop className="h-3.5 w-3.5" style={{ color: "#3B82F6" }} />
                  </div>
                  <span className="text-[13px] font-semibold text-[#e2e8f0]">Crop</span>
                </div>

                {/* Rotate — bottom-left */}
                <div
                  className="wb-float absolute left-[5px] bottom-[75px] flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
                  style={{
                    background: "linear-gradient(135deg, #1a2744, #131d33)",
                    border: "1.2px solid rgba(16,185,129,0.45)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 24px rgba(16,185,129,0.1)",
                    animation: "wb-float3 4.5s ease-in-out infinite",
                  }}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(16,185,129,0.15)" }}>
                    <RotateCw className="h-3.5 w-3.5" style={{ color: "#10B981" }} />
                  </div>
                  <span className="text-[13px] font-semibold text-[#e2e8f0]">Rotate</span>
                </div>

                {/* Compress — bottom-right */}
                <div
                  className="wb-float absolute right-0 bottom-[60px] flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
                  style={{
                    background: "linear-gradient(135deg, #1a2744, #131d33)",
                    border: "1.2px solid rgba(139,92,246,0.45)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 24px rgba(139,92,246,0.1)",
                    animation: "wb-float4 5.5s ease-in-out infinite",
                  }}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(139,92,246,0.15)" }}>
                    <Gauge className="h-3.5 w-3.5" style={{ color: "#8B5CF6" }} />
                  </div>
                  <span className="text-[13px] font-semibold text-[#e2e8f0]">Compress</span>
                </div>

                {/* Format badges — center-bottom cluster */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[115px] flex gap-2">
                  {[
                    { label: "JPG", bg: "#EF4444" },
                    { label: "PNG", bg: "#3B82F6" },
                    { label: "WEBP", bg: "#10B981" },
                    { label: "GIF", bg: "#EC4899" },
                  ].map((fmt) => (
                    <span
                      key={fmt.label}
                      className="rounded-lg px-2.5 py-1 text-[10px] font-extrabold text-white tracking-wide"
                      style={{ background: fmt.bg, boxShadow: `0 4px 16px ${fmt.bg}40` }}
                    >
                      {fmt.label}
                    </span>
                  ))}
                </div>

                {/* "Run Pipeline" floating badge */}
                <div
                  className="wb-pulse absolute left-1/2 -translate-x-1/2 bottom-[18px] flex items-center gap-2 rounded-full px-5 py-2"
                  style={{
                    background: "linear-gradient(135deg, #1a2744, #131d33)",
                    border: "1.2px solid rgba(249,115,22,0.4)",
                    animation: "wb-pulse-badge 3s ease-in-out infinite",
                  }}
                >
                  <div
                    className="h-0 w-0"
                    style={{ borderLeft: "7px solid #F97316", borderTop: "4.5px solid transparent", borderBottom: "4.5px solid transparent" }}
                  />
                  <span className="text-xs font-bold" style={{ color: "#F97316" }}>Run Pipeline</span>
                </div>

                {/* Sparkle particles */}
                {[
                  { top: "12%", left: "8%",  bg: "#F97316", delay: "0s",   dur: "3s" },
                  { top: "6%",  right: "12%", bg: "#8B5CF6", delay: "1s",   dur: "4s" },
                  { top: "48%", left: "3%",  bg: "#10B981", delay: "1.5s", dur: "5s" },
                  { top: "32%", right: "3%", bg: "#F59E0B", delay: "0.8s", dur: "3s" },
                  { bottom: "18%", left: "12%", bg: "#3B82F6", delay: "0.5s", dur: "3.5s" },
                  { bottom: "12%", right: "8%", bg: "#F97316", delay: "2s",   dur: "4.5s" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="wb-sparkle-dot absolute h-1 w-1 rounded-full"
                    style={{
                      ...Object.fromEntries(Object.entries(s).filter(([k]) => ["top","left","right","bottom"].includes(k))),
                      background: s.bg,
                      animation: `wb-sparkle ${s.dur} ease-in-out infinite ${s.delay}`,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ── Step progress bar ─────────────────────────────────── */}
          <div className="px-6 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-6xl">
              <StepProgressBar steps={STEPS} activeStep={!hasFile ? 1 : pipeline.length === 0 ? 2 : 3} />
            </div>
          </div>

          {/* ── Tool workspace ────────────────────────────────────── */}
          <div className="px-6 py-6 sm:px-10 sm:py-8 lg:px-16">
            <div className="mx-auto max-w-6xl">
              <Card className="overflow-hidden border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))]">
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">

                  {/* ── Page header ─────────────────────────────── */}
                  <div className="space-y-2">
                    {alias ? (
                      <h2 className="text-xl font-bold tracking-tight sm:text-2xl font-heading text-foreground">
                        {alias.h1Prefix}{" "}
                        <span className="gradient-text">{alias.h1Highlight}</span>{" "}
                        {alias.h1Suffix}
                      </h2>
                    ) : (
                      <h2 className="text-xl font-bold tracking-tight sm:text-2xl font-heading text-foreground">
                        {tool.h1}
                      </h2>
                    )}
                  </div>

                  <Separator />

                  {/* ── Tool layout ─────────────────────────────── */}
                  <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
                    {/* Upload + pipeline */}
                    <div className="space-y-4">
                      {/* Upload */}
                      <Card className="p-0 overflow-hidden border-[hsl(var(--tool-border))]">
                        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 pb-2 sm:pb-3 bg-[hsl(var(--muted)/0.3)]">
                          <h3 className="font-semibold text-foreground text-sm">
                            1. Upload image
                          </h3>
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
                      <Card className="p-0 overflow-hidden border-[hsl(var(--tool-border))]">
                        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 pb-2 sm:pb-3 bg-[hsl(var(--muted)/0.3)]">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground text-sm">
                              2. Build pipeline
                            </h3>
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
                      <Card className="p-0 overflow-hidden border-[hsl(var(--tool-border))]">
                        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 pb-2 sm:pb-3 bg-[hsl(var(--muted)/0.3)]">
                          <h3 className="font-semibold text-foreground text-sm">
                            Add operation
                          </h3>
                        </CardHeader>
                        <CardContent className="px-4 py-4 sm:px-6 space-y-2">
                          {(Object.keys(OP_LABELS) as OpType[]).map((type) => {
                            const Icon = OP_ICONS[type];
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => addOp(type)}
                                className="flex w-full items-center gap-3 rounded-lg border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))] px-3 py-2 text-sm font-medium text-foreground hover:bg-[hsl(var(--muted))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
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
                      <Card className="p-0 overflow-hidden border-[hsl(var(--tool-border))]">
                        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 pb-2 sm:pb-3 bg-[hsl(var(--muted)/0.3)]">
                          <h3 className="font-semibold text-foreground text-sm">
                            3. Run pipeline
                          </h3>
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
                              <button
                                onClick={handleRunPipeline}
                                disabled={!hasFile || pipeline.length === 0 || isProcessing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                                aria-label="Run pipeline"
                              >
                                {isProcessing ? (
                                  <>
                                    <span
                                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                                      aria-hidden
                                    />
                                    Running…
                                  </>
                                ) : (
                                  <>
                                    Run Pipeline
                                    <ArrowRight className="h-4 w-4" aria-hidden />
                                  </>
                                )}
                              </button>
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
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Trust strip ───────────────────────────────────────── */}
          <div className="px-6 pb-6 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-6xl">
              <TrustStrip features={TRUST_FEATURES} />
            </div>
          </div>

          {/* ── AEO: What is an Image Workbench? ─────────────────── */}
          <section className="px-6 pb-8 sm:px-10 lg:px-16" aria-labelledby="aeo-heading">
            <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-2">
              {/* Info card */}
              <div className="rounded-2xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] p-6 sm:p-8">
                <h2 id="aeo-heading" className="text-xl font-bold tracking-tight sm:text-2xl font-heading text-foreground mb-4">
                  What is an image workbench?
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                  An image workbench is a multi-operation image editor that lets you chain
                  resize, crop, rotate, compress, and format-convert steps into a single
                  pipeline. Instead of running each operation separately, you build a
                  sequence and execute it all at once — saving time and preserving quality
                  by minimizing re-encoding.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                  The global image editing software market reached <strong>$1.1 billion</strong> in
                  2024 and is projected to grow at 6.3% CAGR through 2030{" "}
                  <span className="text-xs text-muted-foreground/70">[Grand View Research, 2024]</span>.
                  Browser-based tools now handle 78% of basic image operations that previously
                  required desktop software{" "}
                  <span className="text-xs text-muted-foreground/70">[Statista, 2024]</span>.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Trndinn&apos;s Image Workbench runs 100% in your browser using the Canvas API —
                  your images never leave your device. Build complex pipelines, preview
                  results instantly, and download optimized files in seconds.
                </p>
              </div>

              {/* Need more? CTA card */}
              <div
                className="flex flex-col justify-between rounded-2xl p-6 sm:p-8"
                style={{ background: "linear-gradient(135deg, hsl(var(--tool-surface)), hsl(280 60% 15% / 0.5))" }}
              >
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Need more?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Create social media graphics, schedule posts, and grow your brand
                    with AI-powered content tools. Trndinn handles everything from image
                    editing to publishing.
                  </p>
                </div>
                <a
                  href="/pricing"
                  className="inline-flex items-center gap-2 self-start rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                >
                  Create with Trndinn
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>
          </section>

          {/* ── FAQ ───────────────────────────────────────────────── */}
          {tool.faqs.length > 0 && (
            <section className="px-6 pb-8 sm:px-10 lg:px-16" aria-labelledby="faq-heading">
              <div className="mx-auto max-w-6xl">
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
                      className="border border-[hsl(var(--tool-border))] rounded-lg px-4"
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

                {/* Additional AEO Q&A items */}
                <Accordion type="single" collapsible className="w-full space-y-1 mt-1">
                  <AccordionItem value="aeo-1" className="border border-[hsl(var(--tool-border))] rounded-lg px-4">
                    <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                      Can I chain multiple operations in one go?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-[hsl(var(--muted-foreground))] pb-4 leading-relaxed">
                      Yes. The pipeline editor lets you stack resize, crop, rotate, compress, and
                      format-convert steps in any order. The workbench executes them sequentially,
                      minimizing quality loss by reducing the number of encode/decode cycles compared
                      to running each tool separately.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="aeo-2" className="border border-[hsl(var(--tool-border))] rounded-lg px-4">
                    <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                      Is my data safe?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-[hsl(var(--muted-foreground))] pb-4 leading-relaxed">
                      Absolutely. Every operation runs locally in your browser via the Canvas API.
                      Your images are never uploaded to any server. Once you close the tab,
                      all data is gone — there is nothing stored, cached, or logged on our end.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="aeo-3" className="border border-[hsl(var(--tool-border))] rounded-lg px-4">
                    <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                      What formats are supported?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-[hsl(var(--muted-foreground))] pb-4 leading-relaxed">
                      The Image Workbench accepts JPG, PNG, WEBP, and GIF as input. You can
                      convert between any of these formats as a pipeline step. Output quality
                      is configurable via the compress step (1-100% quality slider).
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          )}

          {/* ── More tools (internal links) ──────────────────────── */}
          <section className="px-6 pb-12 sm:px-10 lg:px-16" aria-labelledby="more-tools-heading">
            <div className="mx-auto max-w-6xl">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="more-tools-heading"
                  className="text-xl font-bold tracking-tight sm:text-2xl font-heading text-foreground"
                >
                  More image tools you&apos;ll love
                </h2>
                <a
                  href="/tools/image"
                  className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--primary))] hover:underline"
                >
                  View all tools
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { slug: "image-resizer", label: "Resize Image", desc: "Change image dimensions" },
                  { slug: "image-cropper", label: "Image Cropper", desc: "Crop to exact sizes" },
                  { slug: "background-remover", label: "Remove Background", desc: "AI-powered background removal" },
                  { slug: "compress-jpg", label: "Compress Image", desc: "Reduce file size" },
                ].map((t) => (
                  <a
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] p-3 transition-colors hover:border-[hsl(var(--primary)/0.4)]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.desc}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-[hsl(var(--primary))] transition-colors" aria-hidden />
                  </a>
                ))}
              </div>
            </div>
          </section>

        </div>
      </SidebarWrapper>
    </MarketingShell>
  );
}
