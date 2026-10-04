"use client";

/**
 * ImageCompressorView — premium image compression tool.
 *
 * Layout: MarketingShell > flex(ImageToolsSidebar | main).
 * Unified workspace: left = upload/settings, right = preview + EXIF data.
 * Multi-image: clickable result thumbnails switch comparison view.
 * Dropzone collapses to thumbnail strip after files are selected.
 *
 * Shadcn: Button, Badge, Progress, Slider, Alert.
 * Icons: Lucide only. Motion: CSS keyframes only. A11y: WCAG AA.
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Gauge,
  ArrowRight,
  Sparkles,
  Lock,
  Monitor,
  Star,
  Zap,
  Settings2,
  Scale,
  Eye,
  Info,
  Plus,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar, SidebarWrapper } from "@/views/tools/image-tools/ImageToolsSidebar";
import { TrustStrip, type TrustFeature } from "@/views/tools/shared/TrustStrip";
import { TrustBadges, type TrustBadge } from "@/views/tools/shared/TrustBadges";
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
import { ImageCompareSlider } from "@/views/tools/shared/ImageCompareSlider";
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
  origMeta?: ImgMeta;
  compMeta?: ImgMeta;
}

interface ImgMeta {
  width: number;
  height: number;
  type: string;
  size: number;
}

type CompressionPreset = "smart" | "balanced" | "max";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRUST_BADGES: TrustBadge[] = [
  { icon: Sparkles, text: "No signup required" },
  { icon: Lock, text: "100% private" },
  { icon: Monitor, text: "Runs in your browser" },
  { icon: Star, text: "Supports all devices" },
];

const TRUST_FEATURES: TrustFeature[] = [
  { icon: Zap, title: "Lightning fast", description: "Compress in seconds, not minutes." },
  { icon: Lock, title: "100% private", description: "Files never leave your device." },
  { icon: Monitor, title: "No installation", description: "Works in any modern browser." },
  { icon: Star, title: "High quality output", description: "Smart algorithms preserve quality." },
];

const PRESETS: Record<CompressionPreset, { label: string; sub: string; quality: number; icon: typeof Sparkles }> = {
  smart:    { label: "Smart",           sub: "Best balance",  quality: 80, icon: Sparkles },
  balanced: { label: "Balanced",        sub: "Good quality",  quality: 65, icon: Scale },
  max:      { label: "Max Compression", sub: "Smallest size", quality: 40, icon: Gauge },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtBytes(b: number): string {
  if (b === 0) return "0 B";
  const k = 1024;
  const s = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
}

function savingsPct(orig: number, comp: number): number {
  return orig === 0 ? 0 : Math.round(((orig - comp) / orig) * 100);
}

/** Extract width/height from a File using an Image element */
function getImgMeta(file: File): Promise<ImgMeta> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height, type: file.type || "image/jpeg", size: file.size });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0, type: file.type || "unknown", size: file.size });
    };
    img.src = url;
  });
}

function fmtType(mime: string): string {
  const ext = mime.split("/")[1]?.toUpperCase() || "?";
  return ext === "JPEG" ? "JPG" : ext;
}

// ---------------------------------------------------------------------------
// Inline thumbnail for upload strip
// ---------------------------------------------------------------------------

function UploadThumb({ file, active, onClick, onRemove }: {
  file: File; active: boolean; onClick: () => void; onRemove: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative shrink-0 h-12 w-12 rounded-lg overflow-hidden border-2 transition-all",
        active ? "border-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary)/0.3)]" : "border-[hsl(var(--tool-border))] hover:border-[hsl(var(--primary)/0.3)]"
      )}
    >
      {url && <img src={url} alt={file.name} className="h-full w-full object-cover" draggable={false} />}
      <span
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-bl-md bg-[hsl(var(--destructive))] text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-2.5 w-2.5" />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ImageCompressorView({ tool, alias }: Props) {
  const { compressImage } = useImageProcessor();
  const { downloadSingle, downloadMultiple } = useFileDownload();

  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<FileResultRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();
  const [quality, setQuality] = useState(80);
  const [preset, setPreset] = useState<CompressionPreset>("smart");
  const [outputFormat, setOutputFormat] = useState<"same" | "jpeg" | "png" | "webp">("same");
  const [preserveExif, setPreserveExif] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  // Object URLs for comparison slider
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);

  const done = results.length > 0;
  const hasFiles = files.length > 0;
  const eyebrow = alias?.eyebrow ?? `Free ${tool.name} — Browser-Based`;

  const totOrig = useMemo(() => results.reduce((s, r) => s + r.original.size, 0), [results]);
  const totComp = useMemo(() => results.reduce((s, r) => s + r.compressed.size, 0), [results]);
  const totPct = savingsPct(totOrig, totComp);

  const activeResult = results[activeIdx] ?? null;

  // Create/revoke object URLs for the active result
  useEffect(() => {
    if (activeResult) {
      const b = URL.createObjectURL(activeResult.original);
      const a = URL.createObjectURL(activeResult.compressed);
      setBeforeUrl(b);
      setAfterUrl(a);
      return () => { URL.revokeObjectURL(b); URL.revokeObjectURL(a); };
    }
    setBeforeUrl(null);
    setAfterUrl(null);
  }, [activeResult]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const onFiles = useCallback((f: File[]) => {
    setFiles(f); setResults([]); setError(undefined); setProgress(0); setActiveIdx(0);
  }, []);

  const removeFile = useCallback((idx: number) => {
    setFiles(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) { setResults([]); setError(undefined); setProgress(0); }
      return next;
    });
  }, []);

  const addMoreFiles = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const onPreset = useCallback((p: CompressionPreset) => {
    setPreset(p); setQuality(PRESETS[p].quality);
  }, []);

  const onCompress = useCallback(async () => {
    if (!files.length) return;
    setBusy(true); setProgress(0); setError(undefined); setActiveIdx(0);
    const rows: FileResultRow[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const origMeta = await getImgMeta(files[i]);
        const c = await compressImage(files[i], quality / 100, { preserveExif, outputFormat });
        const compMeta = await getImgMeta(c);
        rows.push({ original: files[i], compressed: c, origMeta, compMeta });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setResults(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed.");
    } finally { setBusy(false); }
  }, [files, quality, preserveExif, outputFormat, compressImage]);

  const onDownload = useCallback(() => {
    const out = results.map(r => r.compressed);
    out.length === 1 ? downloadSingle(out[0]) : downloadMultiple(out);
  }, [results, downloadSingle, downloadMultiple]);

  const onReset = useCallback(() => {
    setFiles([]); setResults([]); setError(undefined); setProgress(0); setActiveIdx(0);
  }, []);

  // Hidden file input for "add more" in the upload strip
  const addMoreRef = useCallback((node: HTMLInputElement | null) => {
    if (node) node.value = "";
  }, []);

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <MarketingShell>
      <SidebarWrapper>
        <ImageToolsSidebar activeSlug={tool.slug} />
        <div className="flex-1 min-w-0 overflow-x-hidden bg-[hsl(var(--tool-bg))]">

          {/* ════════════════ HERO ════════════════ */}
          <section className="relative overflow-x-clip px-6 pt-8 pb-5 sm:px-10 sm:pt-10 sm:pb-6 lg:px-14">
            <div className="pointer-events-none absolute -top-24 right-[5%] h-[380px] w-[380px] rounded-full opacity-[0.15] blur-[90px]" style={{ background: "radial-gradient(circle, #F97316, transparent 70%)" }} aria-hidden />
            <div className="pointer-events-none absolute top-[25%] right-[28%] h-[260px] w-[260px] rounded-full opacity-[0.08] blur-[70px]" style={{ background: "radial-gradient(circle, #8B5CF6, transparent 70%)" }} aria-hidden />

            <div className="relative mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
              <div className="flex-1 space-y-4">
                <span className="inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))" }}>
                  {eyebrow}
                </span>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] font-display text-foreground !leading-[1.15]">
                  Free <span className="gradient-text">JPG Compressor</span> —<br className="hidden sm:block" />
                  smaller size, same quality.
                </h1>
                <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                  Reduce JPG file size with real-time preview. Adjust the quality,
                  compare results, and download — no uploads, no signup, completely private.
                </p>
                <TrustBadges badges={TRUST_BADGES} />
              </div>
              <div className="relative hidden lg:block lg:w-[420px] shrink-0" aria-hidden>
                <Image src="/images/compressor-top.png" alt="" width={840} height={540} className="w-full h-auto drop-shadow-2xl" priority />
              </div>
            </div>
          </section>

          {/* ════════════════ WORKSPACE ════════════════ */}
          <div className="px-4 py-4 sm:px-8 sm:py-5 lg:px-10">
            <div className="mx-auto max-w-6xl">
              <div className="rounded-2xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] overflow-hidden">
                <div className="grid lg:grid-cols-[1fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-[hsl(var(--tool-border))]">

                  {/* ── LEFT COLUMN: Upload + Settings ── */}
                  <div className="flex flex-col divide-y divide-[hsl(var(--tool-border))]">

                    {/* Upload section — collapses to thumbnail strip when files exist */}
                    <div>
                      <div className="flex items-center gap-3 px-5 py-2 border-b border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}>1</span>
                        <span className="text-xs font-semibold text-foreground">Upload</span>
                        {hasFiles && <Badge variant="secondary" className="ml-auto text-[10px]">{files.length} file{files.length !== 1 ? "s" : ""}</Badge>}
                      </div>

                      {/* Show full dropzone only when no files */}
                      {!hasFiles && (
                        <div className="p-3">
                          <ImageDropzone
                            onFilesSelected={onFiles}
                            accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff"
                            maxSizeMB={50}
                            multiple
                          />
                        </div>
                      )}

                      {/* Compact thumbnail strip when files are selected */}
                      {hasFiles && (
                        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
                          {files.map((f, i) => (
                            <UploadThumb
                              key={`${f.name}-${f.size}-${i}`}
                              file={f}
                              active={done && activeIdx === i}
                              onClick={() => done && setActiveIdx(i)}
                              onRemove={() => removeFile(i)}
                            />
                          ))}
                          {/* Add more button */}
                          <label className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[hsl(var(--tool-border))] text-muted-foreground transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]">
                            <Plus className="h-4 w-4" aria-hidden />
                            <input
                              ref={addMoreRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff"
                              multiple
                              className="sr-only"
                              onChange={(e) => {
                                if (e.target.files?.length) {
                                  addMoreFiles(Array.from(e.target.files));
                                  e.target.value = "";
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Settings section */}
                    <div>
                      <div className="flex items-center gap-3 px-5 py-2 border-b border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", hasFiles ? "text-white" : "text-muted-foreground")} style={hasFiles ? { background: "linear-gradient(135deg, #F97316, #F59E0B)" } : { background: "hsl(var(--tool-surface-dim))", border: "1px solid hsl(var(--tool-border))" }}>2</span>
                        <span className="text-xs font-semibold text-foreground">Settings</span>
                      </div>
                      <div className="p-4 space-y-3">
                        {/* Presets */}
                        <div className="grid grid-cols-3 gap-2">
                          {(Object.entries(PRESETS) as [CompressionPreset, typeof PRESETS.smart][]).map(([k, v]) => {
                            const Icon = v.icon;
                            const on = preset === k;
                            return (
                              <button
                                key={k}
                                type="button"
                                onClick={() => onPreset(k)}
                                className={cn(
                                  "flex flex-col items-center gap-1 rounded-xl border py-2.5 px-2 transition-all",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                  on ? "border-[hsl(var(--primary))]" : "border-[hsl(var(--tool-border))] hover:border-[hsl(var(--primary)/0.3)]"
                                )}
                                style={on ? { background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.04))" } : { background: "hsl(var(--tool-surface-dim))" }}
                              >
                                <Icon className="h-4 w-4" style={{ color: on ? "#F97316" : "hsl(var(--muted-foreground))" }} aria-hidden />
                                <span className={cn("text-[11px] font-semibold", on ? "text-foreground" : "text-muted-foreground")}>{v.label}</span>
                                <span className="text-[9px] text-muted-foreground leading-none">{v.sub}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Stats row */}
                        {hasFiles && (
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { label: "Original", value: fmtBytes(files.reduce((s, f) => s + f.size, 0)), color: "" },
                              { label: "Estimated", value: `~${fmtBytes(Math.round(files.reduce((s, f) => s + f.size, 0) * (quality / 100)))}`, color: "#10B981" },
                              { label: "Savings", value: `~${100 - quality}%`, color: "#F97316" },
                            ].map(s => (
                              <div key={s.label} className="rounded-lg py-1.5 px-2 text-center border border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                                <p className="text-[8px] text-muted-foreground leading-tight uppercase tracking-wider">{s.label}</p>
                                <p className="text-xs font-bold" style={s.color ? { color: s.color } : undefined}>{s.value}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quality slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-foreground">Quality: {quality}%</span>
                            <Badge variant="secondary" className="text-[10px] tabular-nums h-5">{quality}%</Badge>
                          </div>
                          <Slider min={1} max={100} step={1} value={[quality]} onValueChange={([v]) => setQuality(v)} className="w-full" aria-label={`Quality: ${quality}%`} />
                          <div className="flex justify-between text-[8px] text-muted-foreground">
                            <span>Smaller file</span>
                            <span>Higher quality</span>
                          </div>
                        </div>

                        {/* Advanced: EXIF + format */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[hsl(var(--tool-border))] pt-2.5">
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Settings2 className="h-3 w-3" aria-hidden />Advanced</span>
                          <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer ml-auto">
                            <input type="checkbox" checked={preserveExif} onChange={(e) => setPreserveExif(e.target.checked)} className="accent-[hsl(var(--primary))] h-3 w-3" />
                            EXIF
                          </label>
                          <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value as "same" | "jpeg" | "png" | "webp")}
                            className="rounded-md border border-[hsl(var(--tool-border))] px-2 py-0.5 text-[10px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            style={{ background: "hsl(var(--tool-surface-dim))" }}
                            aria-label="Output format"
                          >
                            <option value="same">Same</option>
                            <option value="jpeg">JPG</option>
                            <option value="png">PNG</option>
                            <option value="webp">WEBP</option>
                          </select>
                        </div>

                        {/* Compress CTA */}
                        <button
                          onClick={onCompress}
                          disabled={!hasFiles || busy}
                          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                        >
                          {busy ? (
                            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> Compressing…</>
                          ) : (
                            <><Zap className="h-4 w-4" aria-hidden /> Compress Image <ArrowRight className="h-4 w-4" aria-hidden /></>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── RIGHT COLUMN: Preview + EXIF ── */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 px-5 py-2 border-b border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                      <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", done ? "text-white" : "text-muted-foreground")} style={done ? { background: "linear-gradient(135deg, #F97316, #F59E0B)" } : { background: "hsl(var(--tool-surface-dim))", border: "1px solid hsl(var(--tool-border))" }}>3</span>
                      <span className="text-xs font-semibold text-foreground">Preview</span>
                      {done && results.length > 1 && (
                        <Badge variant="secondary" className="ml-auto text-[10px]">{activeIdx + 1} / {results.length}</Badge>
                      )}
                    </div>

                    <div className="flex-1 p-4 flex flex-col">
                      {/* Error */}
                      {error && (
                        <Alert variant="destructive" role="alert" aria-live="assertive" className="mb-3">
                          <AlertCircle className="h-4 w-4" aria-hidden />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Progress */}
                      {busy && (
                        <div className="space-y-2 mb-3" aria-live="polite" aria-busy="true">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Compressing…</span>
                            <span className="font-medium text-foreground">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" aria-label={`Progress: ${progress}%`} />
                        </div>
                      )}

                      {/* Empty state */}
                      {!done && !busy && !error && (
                        <div className="flex flex-1 flex-col items-center justify-center text-center py-8">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-3 border border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                            <Eye className="h-5 w-5 text-muted-foreground" aria-hidden />
                          </div>
                          <p className="text-xs font-medium text-muted-foreground">Preview will appear here</p>
                          <p className="text-[10px] text-muted-foreground/50 mt-1">Upload &amp; compress to compare</p>
                        </div>
                      )}

                      {/* Results */}
                      {done && !busy && activeResult && (
                        <div className="flex flex-col flex-1 gap-3">
                          {/* Comparison slider */}
                          {beforeUrl && afterUrl && (
                            <ImageCompareSlider
                              beforeSrc={beforeUrl}
                              afterSrc={afterUrl}
                              beforeLabel={`Original · ${fmtBytes(activeResult.original.size)}`}
                              afterLabel={`Compressed · ${fmtBytes(activeResult.compressed.size)}`}
                              className="aspect-[16/10] flex-shrink-0"
                            />
                          )}

                          {/* EXIF / metadata comparison table */}
                          {activeResult.origMeta && activeResult.compMeta && (
                            <div className="rounded-lg border border-[hsl(var(--tool-border))] overflow-hidden" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[hsl(var(--tool-border))]">
                                <Info className="h-3 w-3 text-muted-foreground" aria-hidden />
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">File details</span>
                              </div>
                              <div className="grid grid-cols-[auto_1fr_1fr] text-[10px]">
                                {/* Header */}
                                <div className="px-3 py-1 border-b border-[hsl(var(--tool-border))]" />
                                <div className="px-3 py-1 border-b border-l border-[hsl(var(--tool-border))] font-semibold text-muted-foreground text-center">Original</div>
                                <div className="px-3 py-1 border-b border-l border-[hsl(var(--tool-border))] font-semibold text-[hsl(var(--primary))] text-center">Compressed</div>
                                {/* Dimensions */}
                                <div className="px-3 py-1 text-muted-foreground border-b border-[hsl(var(--tool-border))]">Size</div>
                                <div className="px-3 py-1 text-foreground text-center border-b border-l border-[hsl(var(--tool-border))]">{activeResult.origMeta.width}×{activeResult.origMeta.height}</div>
                                <div className="px-3 py-1 text-foreground text-center border-b border-l border-[hsl(var(--tool-border))]">{activeResult.compMeta.width}×{activeResult.compMeta.height}</div>
                                {/* Format */}
                                <div className="px-3 py-1 text-muted-foreground border-b border-[hsl(var(--tool-border))]">Format</div>
                                <div className="px-3 py-1 text-foreground text-center border-b border-l border-[hsl(var(--tool-border))]">{fmtType(activeResult.origMeta.type)}</div>
                                <div className="px-3 py-1 text-foreground text-center border-b border-l border-[hsl(var(--tool-border))]">{fmtType(activeResult.compMeta.type)}</div>
                                {/* File size */}
                                <div className="px-3 py-1 text-muted-foreground">File</div>
                                <div className="px-3 py-1 text-foreground text-center border-l border-[hsl(var(--tool-border))]">{fmtBytes(activeResult.original.size)}</div>
                                <div className="px-3 py-1 font-bold text-center border-l border-[hsl(var(--tool-border))]" style={{ color: "#10B981" }}>{fmtBytes(activeResult.compressed.size)}</div>
                              </div>
                            </div>
                          )}

                          {/* Multi-image result thumbnails */}
                          {results.length > 1 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                              {results.map((r, i) => (
                                <ResultThumb key={i} result={r} active={activeIdx === i} onClick={() => setActiveIdx(i)} />
                              ))}
                            </div>
                          )}

                          {/* Success + savings */}
                          <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "#10B981" }} aria-hidden />
                            <p className="text-[10px] text-foreground">
                              <strong>Ready!</strong>{" "}
                              {totPct > 0 ? `${totPct}% smaller — ${fmtBytes(totOrig)} → ${fmtBytes(totComp)}` : "Compressed."}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="mt-auto grid grid-cols-2 gap-2">
                            <button
                              onClick={onDownload}
                              className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                            >
                              <Download className="h-3.5 w-3.5" aria-hidden />
                              {results.length === 1 ? `Download (${fmtBytes(totComp)})` : `Download all (${results.length})`}
                            </button>
                            <Button onClick={onReset} variant="outline" size="sm" className="text-xs">
                              <RotateCcw className="mr-1 h-3 w-3" aria-hidden /> New batch
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ════════════════ TRUST STRIP ════════════════ */}
          <div className="px-6 py-6 sm:px-10 lg:px-14">
            <div className="mx-auto max-w-6xl">
              <TrustStrip features={TRUST_FEATURES} />
            </div>
          </div>

          {/* ════════════════ AEO CONTENT ════════════════ */}
          <section className="px-6 pb-8 sm:px-10 lg:px-14" aria-labelledby="aeo-h">
            <div className="mx-auto max-w-6xl grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] p-6">
                <h2 id="aeo-h" className="text-lg font-bold tracking-tight sm:text-xl font-heading text-foreground mb-3">What is image compression?</h2>
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>Image compression reduces file size by removing redundant data while preserving visual quality. Lossy compression (JPEG) achieves 60–80% size reduction with minimal perceptual difference — ideal for web, social media, and email.</p>
                  <p>Pages with optimized images load <strong>3.5× faster</strong> on average <span className="text-xs text-muted-foreground/60">[HTTP Archive, 2024]</span>. Compressed images reduce bandwidth costs by up to <strong>70%</strong> <span className="text-xs text-muted-foreground/60">[Cloudflare, 2024]</span>.</p>
                  <p>Trndinn&apos;s compressor uses smart algorithms to find the optimal quality-size balance. Everything runs in your browser — images never leave your device.</p>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-2xl p-6" style={{ background: "linear-gradient(135deg, hsl(var(--tool-surface)), hsl(280 60% 15% / 0.4))" }}>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Need more?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">Create social media graphics, schedule posts, and grow your brand with AI-powered tools.</p>
                </div>
                <a href="/pricing" className="inline-flex items-center gap-2 self-start rounded-xl px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 transition-all" style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}>
                  Create with Trndinn <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>
          </section>

          {/* ════════════════ FAQ ════════════════ */}
          {tool.faqs.length > 0 && (
            <section className="px-6 pb-8 sm:px-10 lg:px-14" aria-labelledby="faq-h">
              <div className="mx-auto max-w-6xl">
                <h2 id="faq-h" className="text-lg font-bold tracking-tight sm:text-xl font-heading mb-3 text-foreground">Frequently asked questions</h2>
                <div className="space-y-1.5">
                  {[...tool.faqs, {
                    question: "How much can I compress a JPG without losing quality?",
                    answer: "Most JPGs compress to 70–80% quality with no visible difference. The “Smart” preset finds this sweet spot automatically. For web, 65–75% reduces file size by 60–80%.",
                  }, {
                    question: "Is my data safe when compressing images online?",
                    answer: "Yes — Trndinn’s compressor runs entirely in your browser using the Canvas API. Images are never uploaded. When you close the tab, all data is gone.",
                  }].map((faq, i) => (
                    <details key={i} className="group rounded-xl border border-[hsl(var(--tool-border))]">
                      <summary className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                        {faq.question}
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden />
                      </summary>
                      <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.answer}</div>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ════════════════ MORE TOOLS ════════════════ */}
          <section className="px-6 pb-10 sm:px-10 lg:px-14" aria-labelledby="more-h">
            <div className="mx-auto max-w-6xl">
              <div className="flex items-center justify-between mb-3">
                <h2 id="more-h" className="text-lg font-bold tracking-tight sm:text-xl font-heading text-foreground">More image tools you&apos;ll love</h2>
                <a href="/tools/image" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--primary))] hover:underline">View all tools <ArrowRight className="h-3.5 w-3.5" aria-hidden /></a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { slug: "image-resizer",      label: "Resize Image",      desc: "Change image dimensions" },
                  { slug: "image-cropper",       label: "Image Cropper",     desc: "Crop to exact sizes" },
                  { slug: "background-remover",  label: "Remove Background", desc: "AI-powered removal" },
                  { slug: "image-workbench",     label: "Image Workbench",   desc: "Multi-op pipeline" },
                ].map(t => (
                  <a key={t.slug} href={`/tools/${t.slug}`} className="group flex items-center gap-3 rounded-xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] p-3 transition-colors hover:border-[hsl(var(--primary)/0.4)]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{t.desc}</p>
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

// ---------------------------------------------------------------------------
// Result thumbnail for multi-image switching
// ---------------------------------------------------------------------------

function ResultThumb({ result, active, onClick }: {
  result: FileResultRow; active: boolean; onClick: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(result.compressed);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [result.compressed]);

  const pct = savingsPct(result.original.size, result.compressed.size);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative shrink-0 h-10 w-10 rounded-lg overflow-hidden border-2 transition-all",
        active ? "border-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary)/0.3)]" : "border-[hsl(var(--tool-border))] hover:border-[hsl(var(--primary)/0.3)]"
      )}
    >
      {url && <img src={url} alt={result.compressed.name} className="h-full w-full object-cover" draggable={false} />}
      {pct > 0 && (
        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] font-bold text-white text-center leading-tight py-px">
          -{pct}%
        </span>
      )}
    </button>
  );
}
