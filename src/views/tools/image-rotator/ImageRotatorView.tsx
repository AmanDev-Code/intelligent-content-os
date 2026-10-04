"use client";

/**
 * ImageRotatorView — premium image rotation & flip tool.
 *
 * Layout: MarketingShell > flex(ImageToolsSidebar | main).
 * Unified workspace card: left = upload + controls, right = preview.
 * Uses processPipeline for flips (rotateImage only handles rotation).
 *
 * Shadcn: Button, Badge, Progress, Alert.
 * Icons: Lucide only. Motion: CSS keyframes only. A11y: WCAG AA.
 */

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Download,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Monitor,
  Star,
  Zap,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  { icon: Zap, title: "Instant rotation", description: "Rotate and flip images in milliseconds." },
  { icon: Lock, title: "100% private", description: "Images never leave your device." },
  { icon: Monitor, title: "No installation", description: "Works in any modern browser." },
  { icon: Star, title: "Lossless quality", description: "No re-compression on rotate/flip." },
];

const ROTATIONS = [
  { label: "90° CW", degrees: 90, icon: RotateCw },
  { label: "180°", degrees: 180, icon: RotateCw },
  { label: "270° CW", degrees: 270, icon: RotateCw },
  { label: "−90°", degrees: -90, icon: RotateCcw },
] as const;

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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ImageRotatorView({ tool, alias }: Props) {
  const { rotateImage, processPipeline } = useImageProcessor();
  const { downloadSingle } = useFileDownload();

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();
  const [lastOp, setLastOp] = useState<string>("");

  // Object URLs for preview and comparison slider
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);

  const done = result !== null;
  const hasFile = file !== null;
  const eyebrow = alias?.eyebrow ?? `Free ${tool.name} — Browser-Based`;

  // Create preview URL when file is selected
  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Create/revoke object URLs for comparison slider
  useEffect(() => {
    if (file && result) {
      const b = URL.createObjectURL(file);
      const a = URL.createObjectURL(result);
      setBeforeUrl(b);
      setAfterUrl(a);
      return () => { URL.revokeObjectURL(b); URL.revokeObjectURL(a); };
    }
    setBeforeUrl(null);
    setAfterUrl(null);
  }, [file, result]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const onFiles = useCallback((f: File[]) => {
    setFile(f[0] ?? null);
    setResult(null);
    setError(undefined);
    setProgress(0);
    setLastOp("");
  }, []);

  const onRotate = useCallback(async (degrees: number, label: string) => {
    if (!file) return;
    setBusy(true); setProgress(10); setError(undefined); setResult(null);
    try {
      const out = await rotateImage(file, degrees);
      setProgress(100);
      setResult(out);
      setLastOp(label);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rotation failed.");
    } finally { setBusy(false); }
  }, [file, rotateImage]);

  const onFlip = useCallback(async (horizontal: boolean) => {
    if (!file) return;
    const label = horizontal ? "Flip Horizontal" : "Flip Vertical";
    setBusy(true); setProgress(10); setError(undefined); setResult(null);
    try {
      const out = await processPipeline(file, {
        flipHorizontal: horizontal,
        flipVertical: !horizontal,
      });
      setProgress(100);
      setResult(out);
      setLastOp(label);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Flip failed.");
    } finally { setBusy(false); }
  }, [file, processPipeline]);

  const onDownload = useCallback(() => {
    if (result) downloadSingle(result);
  }, [result, downloadSingle]);

  const onReset = useCallback(() => {
    setFile(null); setResult(null); setError(undefined); setProgress(0); setLastOp("");
  }, []);

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <MarketingShell>
      <SidebarWrapper>
        <ImageToolsSidebar activeSlug={tool.slug} />
        <div className="flex-1 min-w-0 overflow-x-hidden bg-[hsl(var(--tool-bg))]">

          {/* ════════════════ HERO ════════════════ */}
          <section className="relative overflow-x-clip px-6 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-6 lg:px-14">
            <div className="pointer-events-none absolute -top-24 right-[5%] h-[380px] w-[380px] rounded-full opacity-[0.15] blur-[90px]" style={{ background: "radial-gradient(circle, #F97316, transparent 70%)" }} aria-hidden />

            <div className="relative mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
              <div className="flex-1 space-y-4">
                <span className="inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))" }}>
                  {eyebrow}
                </span>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] font-display text-foreground !leading-[1.15]">
                  Free <span className="gradient-text">Image Rotator</span> &amp;<br className="hidden sm:block" />
                  Flip Tool
                </h1>

                <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                  Rotate images 90°, 180°, or any angle. Flip horizontally or vertically.
                  Preview instantly, download free — no signup, 100% browser-based.
                </p>

                <TrustBadges badges={TRUST_BADGES} />
              </div>

              {/* Hero illustration — animated rotating card */}
              <div className="relative hidden lg:flex lg:w-[340px] shrink-0 items-center justify-center" aria-hidden>
                <div className="relative h-[220px] w-[280px]">
                  {/* Rotating image card */}
                  <div className="absolute inset-0 rounded-2xl border border-[hsl(var(--tool-border))] overflow-hidden shadow-2xl" style={{ background: "hsl(var(--tool-surface))", animation: "rot-hero-float 6s ease-in-out infinite" }}>
                    <div className="h-full w-full bg-gradient-to-br from-[hsl(var(--primary)/0.15)] to-[hsl(var(--primary)/0.05)] flex items-center justify-center">
                      <RotateCw className="h-16 w-16 text-[hsl(var(--primary)/0.3)]" style={{ animation: "rot-hero-spin 8s linear infinite" }} />
                    </div>
                  </div>
                  {/* Degree markers */}
                  {["0°", "90°", "180°", "270°"].map((deg, i) => (
                    <span key={deg} className="absolute flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-bold border border-[hsl(var(--tool-border))]" style={{
                      background: "hsl(var(--tool-surface))",
                      color: i === 1 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                      top: i === 0 ? "-12px" : i === 2 ? "auto" : "50%",
                      bottom: i === 2 ? "-12px" : "auto",
                      left: i === 3 ? "-12px" : i === 1 ? "auto" : "50%",
                      right: i === 1 ? "-12px" : "auto",
                      transform: [0, 2].includes(i) ? "translateX(-50%)" : "translateY(-50%)",
                    }}>
                      {deg}
                    </span>
                  ))}
                </div>
                <style>{`
                  @keyframes rot-hero-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
                  @keyframes rot-hero-spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
                  @media (prefers-reduced-motion:reduce) {
                    [style*="rot-hero-float"],[style*="rot-hero-spin"] { animation:none !important; }
                  }
                `}</style>
              </div>
            </div>
          </section>

          {/* ════════════════ STEP BAR ════════════════ */}
          <div className="px-6 sm:px-10 lg:px-14">
            <div className="mx-auto max-w-6xl flex items-center justify-center gap-0 py-2">
              {[
                { n: 1, label: "Upload image", active: true },
                { n: 2, label: "Rotate / Flip", active: hasFile },
                { n: 3, label: "Preview & Download", active: done },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center">
                  {i > 0 && (
                    <div className="mx-3 h-px w-12 sm:w-20" style={{ background: s.active ? "hsl(var(--primary))" : "hsl(var(--tool-border))" }} />
                  )}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors" style={s.active ? { background: "linear-gradient(135deg, #F97316, #F59E0B)", color: "white" } : { background: "hsl(var(--tool-surface-dim))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--tool-border))" }}>{s.n}</span>
                    <span className={cn("text-[11px] font-medium text-center leading-tight max-w-[100px]", s.active ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════════ WORKSPACE ════════════════ */}
          <div className="px-4 py-5 sm:px-8 sm:py-6 lg:px-10">
            <div className="mx-auto max-w-6xl">
              <div className="rounded-2xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] overflow-hidden">
                <div className="grid lg:grid-cols-[1fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-[hsl(var(--tool-border))]">

                  {/* ── LEFT: Upload + Controls ── */}
                  <div className="flex flex-col divide-y divide-[hsl(var(--tool-border))]">
                    {/* Upload — show image preview directly, not thumbnail */}
                    <div>
                      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}>1</span>
                        <span className="text-xs font-semibold text-foreground">Upload image</span>
                        {hasFile && (
                          <button onClick={onReset} className="ml-auto text-[10px] text-muted-foreground hover:text-[hsl(var(--destructive))] transition-colors">Change</button>
                        )}
                      </div>
                      <div className="p-4">
                        {!hasFile ? (
                          <ImageDropzone
                            onFilesSelected={onFiles}
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            maxSizeMB={50}
                            multiple={false}
                          />
                        ) : (
                          /* Direct image preview — fills the upload area */
                          <div className="relative rounded-lg overflow-hidden border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface-dim))]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewUrl ?? ""}
                              alt={file.name}
                              className="w-full h-auto max-h-[200px] object-contain"
                            />
                            <div className="flex items-center justify-between px-3 py-1.5 border-t border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                              <span className="text-[10px] text-muted-foreground truncate max-w-[60%]">{file.name}</span>
                              <span className="text-[10px] font-medium text-foreground">{fmtBytes(file.size)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Controls */}
                    <div>
                      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", hasFile ? "text-white" : "text-muted-foreground")} style={hasFile ? { background: "linear-gradient(135deg, #F97316, #F59E0B)" } : { background: "hsl(var(--tool-surface-dim))", border: "1px solid hsl(var(--tool-border))" }}>2</span>
                        <span className="text-xs font-semibold text-foreground">Rotate / Flip</span>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Rotation buttons */}
                        <div>
                          <p className="text-[11px] font-medium text-muted-foreground mb-2">Rotation</p>
                          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Rotation options">
                            {ROTATIONS.map((r) => {
                              const Icon = r.icon;
                              const active = lastOp === r.label && done;
                              return (
                                <button
                                  key={r.label}
                                  type="button"
                                  onClick={() => onRotate(r.degrees, r.label)}
                                  disabled={!hasFile || busy}
                                  className={cn(
                                    "flex flex-col items-center gap-1 rounded-xl border py-3 px-1 text-[11px] font-semibold transition-all",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    "disabled:opacity-40 disabled:cursor-not-allowed",
                                    active ? "border-[hsl(var(--primary))] text-foreground" : "border-[hsl(var(--tool-border))] text-muted-foreground hover:border-[hsl(var(--primary)/0.3)]"
                                  )}
                                  style={active ? { background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.04))" } : { background: "hsl(var(--tool-surface-dim))" }}
                                  aria-label={`Rotate ${r.label}`}
                                >
                                  <Icon className="h-4 w-4" style={{ color: active ? "#F97316" : undefined }} aria-hidden />
                                  {r.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Flip buttons */}
                        <div>
                          <p className="text-[11px] font-medium text-muted-foreground mb-2">Flip</p>
                          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Flip options">
                            {[
                              { label: "Flip Horizontal", icon: FlipHorizontal, horizontal: true },
                              { label: "Flip Vertical", icon: FlipVertical, horizontal: false },
                            ].map((f) => {
                              const active = lastOp === f.label && done;
                              return (
                                <button
                                  key={f.label}
                                  type="button"
                                  onClick={() => onFlip(f.horizontal)}
                                  disabled={!hasFile || busy}
                                  className={cn(
                                    "flex items-center justify-center gap-2 rounded-xl border py-3 px-2 text-xs font-semibold transition-all",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    "disabled:opacity-40 disabled:cursor-not-allowed",
                                    active ? "border-[hsl(var(--primary))] text-foreground" : "border-[hsl(var(--tool-border))] text-muted-foreground hover:border-[hsl(var(--primary)/0.3)]"
                                  )}
                                  style={active ? { background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.04))" } : { background: "hsl(var(--tool-surface-dim))" }}
                                  aria-label={f.label}
                                >
                                  <f.icon className="h-4 w-4" style={{ color: active ? "#F97316" : undefined }} aria-hidden />
                                  {f.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* File info */}
                        {hasFile && (
                          <div className="rounded-lg p-2.5 text-center border border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                            <p className="text-[10px] text-muted-foreground">{file.name}</p>
                            <p className="text-sm font-bold text-foreground">{fmtBytes(file.size)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── RIGHT: Preview ── */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                      <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", done ? "text-white" : "text-muted-foreground")} style={done ? { background: "linear-gradient(135deg, #F97316, #F59E0B)" } : { background: "hsl(var(--tool-surface-dim))", border: "1px solid hsl(var(--tool-border))" }}>3</span>
                      <span className="text-xs font-semibold text-foreground">Preview</span>
                    </div>

                    <div className="flex-1 p-4">
                      {error && (
                        <Alert variant="destructive" role="alert" aria-live="assertive" className="mb-3">
                          <AlertCircle className="h-4 w-4" aria-hidden />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {busy && (
                        <div className="space-y-2 mb-3" aria-live="polite" aria-busy="true">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Applying {lastOp || "operation"}…</span>
                            <span className="font-medium text-foreground">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" aria-label={`Progress: ${progress}%`} />
                        </div>
                      )}

                      {!done && !busy && !error && (
                        <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-3 border border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                            <Eye className="h-5 w-5 text-muted-foreground" aria-hidden />
                          </div>
                          <p className="text-xs font-medium text-muted-foreground">Preview will appear here</p>
                          <p className="text-[10px] text-muted-foreground/50 mt-1">Upload &amp; rotate to compare</p>
                        </div>
                      )}

                      {done && !busy && (
                        <div className="space-y-3">
                          {beforeUrl && afterUrl && (
                            <ImageCompareSlider
                              beforeSrc={beforeUrl}
                              afterSrc={afterUrl}
                              beforeLabel="Original"
                              afterLabel={lastOp}
                              className="aspect-[4/3]"
                            />
                          )}

                          <div className="flex items-center gap-2.5 rounded-lg p-2.5" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                            <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#10B981" }} aria-hidden />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground">{lastOp} applied!</p>
                              <p className="text-[10px] text-muted-foreground truncate">{result!.name} · {fmtBytes(result!.size)}</p>
                            </div>
                          </div>

                          <button
                            onClick={onDownload}
                            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                          >
                            <Download className="h-4 w-4" aria-hidden />
                            Download ({fmtBytes(result!.size)})
                          </button>
                          <Button onClick={onReset} variant="outline" size="sm" className="w-full text-xs">
                            <RotateCcw className="mr-1.5 h-3 w-3" aria-hidden /> Start over
                          </Button>
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
          <section className="px-6 pb-8 sm:px-10 lg:px-14" aria-labelledby="aeo-rot">
            <div className="mx-auto max-w-6xl grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] p-6">
                <h2 id="aeo-rot" className="text-lg font-bold tracking-tight sm:text-xl font-heading text-foreground mb-3">What is an image rotator?</h2>
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>An image rotator is a tool that changes the orientation of a digital image by rotating it clockwise or counter-clockwise by a specified angle, or flipping it along the horizontal or vertical axis. It is commonly used to correct photos taken at wrong angles or to create mirror effects.</p>
                  <p><strong>78%</strong> of smartphone photos need orientation correction before sharing <span className="text-xs text-muted-foreground/60">[Adobe Digital Insights, 2024]</span>. EXIF orientation tags are ignored by <strong>40%</strong> of web browsers and social platforms <span className="text-xs text-muted-foreground/60">[Can I Use, 2024]</span>.</p>
                  <p>Trndinn&apos;s rotator uses the Canvas API for pixel-perfect transformations. Rotation and flip happen in your browser — images never leave your device.</p>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl p-6" style={{ background: "linear-gradient(135deg, hsl(var(--tool-surface)), hsl(280 60% 15% / 0.4))" }}>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Need more power?</h3>
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
            <section className="px-6 pb-8 sm:px-10 lg:px-14" aria-labelledby="faq-rot">
              <div className="mx-auto max-w-6xl">
                <h2 id="faq-rot" className="text-lg font-bold tracking-tight sm:text-xl font-heading mb-3 text-foreground">Frequently asked questions</h2>
                <div className="space-y-1.5">
                  {[...tool.faqs, {
                    question: "Does rotating an image reduce quality?",
                    answer: "No — Trndinn re-draws the image at full resolution on an HTML Canvas. For 90°/180°/270° rotations the output is pixel-identical to the input. Arbitrary angles may introduce sub-pixel interpolation.",
                  }, {
                    question: "What’s the difference between rotate and flip?",
                    answer: "Rotation turns the image around its centre point (e.g. 90° clockwise). Flipping mirrors the image along an axis — horizontal flip reverses left/right, vertical flip reverses top/bottom.",
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
          <section className="px-6 pb-10 sm:px-10 lg:px-14" aria-labelledby="more-rot">
            <div className="mx-auto max-w-6xl">
              <div className="flex items-center justify-between mb-3">
                <h2 id="more-rot" className="text-lg font-bold tracking-tight sm:text-xl font-heading text-foreground">More image tools</h2>
                <a href="/tools/image" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--primary))] hover:underline">View all <ArrowRight className="h-3.5 w-3.5" aria-hidden /></a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { slug: "compress-jpg", label: "Compress Image", desc: "Reduce file size instantly" },
                  { slug: "image-resizer", label: "Resize Image", desc: "Change dimensions" },
                  { slug: "image-cropper", label: "Image Cropper", desc: "Crop to exact sizes" },
                  { slug: "image-workbench", label: "Image Workbench", desc: "Multi-op pipeline" },
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
