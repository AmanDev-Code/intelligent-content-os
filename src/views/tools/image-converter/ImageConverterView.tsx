"use client";

/**
 * ImageConverterView — handles all 33 image conversion tools.
 *
 * Structure mirrors InstagramReelDownloaderView exactly:
 *   MarketingShell → Hero (orbs + doodles + tool UI) → How it works →
 *   Features → Image Toolbox → Compare & Learn More → FAQ → Related tools → CTA
 *
 * Color identity: primary orange (#F97316) → amber (#F59E0B) gradient (not Instagram purple).
 * All Trndinn design tokens: hsl(var(--token)) only. No hex except inline gradients.
 * Framer Motion for hero + section reveals. prefers-reduced-motion safe.
 */

import { useState, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  Upload,
  Download,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Zap,
  ShieldCheck,
  Minimize2,
  Crop,
  Image as ImageIcon,
  QrCode,
  Wand2,
  FileCode2,
} from "lucide-react";
import Link from "next/link";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useImageProcessor } from "@/hooks/tools/useImageProcessor";
import { useFileDownload } from "@/hooks/tools/useFileDownload";
import { IMAGE_CONVERTER_COMPETITORS } from "@/lib/image-converter-competitors";
import { cn } from "@/lib/utils";
import type { ConversionTool } from "@/lib/image-converter-data";
import type { ConverterAlias } from "@/lib/image-converter-aliases";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  tool: ConversionTool;
  alias?: ConverterAlias;
  faqs: Array<{ question: string; answer: string }>;
}

interface ResultRow {
  original: File;
  converted: File;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LOSSY_FORMATS = new Set(["jpg", "jpeg", "webp", "avif", "gif"]);

// Image tool gradient — orange → amber (distinct from Instagram's purple)
const IMG_GRADIENT = "linear-gradient(90deg, #F97316, #FB923C, #F59E0B, #F97316)";
const IMG_GRADIENT_STATIC = "linear-gradient(90deg, #F97316, #F59E0B)";

// Related image tools shown in the "Toolbox" section at the bottom
const IMAGE_TOOLBOX = [
  { slug: "compress-jpg",       icon: Minimize2,  title: "Compress JPG",      desc: "Reduce JPG file size without visible quality loss." },
  { slug: "compress-png",       icon: Minimize2,  title: "Compress PNG",      desc: "Shrink PNG files while keeping full transparency." },
  { slug: "image-resizer",      icon: ImageIcon,  title: "Image Resizer",     desc: "Resize to exact pixels or social media presets." },
  { slug: "image-cropper",      icon: Crop,       title: "Image Cropper",     desc: "Crop to any aspect ratio or free-form area." },
  { slug: "background-remover", icon: Wand2,      title: "Remove Background", desc: "AI-powered background removal. Transparent PNG output." },
  { slug: "qr-code-generator",  icon: QrCode,     title: "QR Code Generator", desc: "Generate QR codes for any URL. PNG + SVG download." },
];

// ─── Decorative SVGs ──────────────────────────────────────────────────────────

const SparkleGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor" />
  </svg>
);

const DottedCircle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 60" className={className} fill="none" aria-hidden="true">
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      return <circle key={i} cx={30 + 24 * Math.cos(angle)} cy={30 + 24 * Math.sin(angle)} r="2.5" fill="currentColor" opacity={0.6 - i * 0.03} />;
    })}
  </svg>
);

const ZigzagLine = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 24" className={className} fill="none" aria-hidden="true">
    <path d="M2 12L14 4L26 20L38 4L50 20L62 4L78 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ConvertGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
    <path d="M8 20h16M20 14l6 6-6 6M24 12H8M12 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── FloatingOrb ─────────────────────────────────────────────────────────────

function FloatingOrb({ className, color, delay = 0 }: { className: string; color: string; delay?: number }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className={cn("pointer-events-none absolute rounded-full blur-3xl opacity-35", className)}
      style={{ background: color }}
      animate={shouldReduce ? undefined : { x: [0, 25, -15, 0], y: [0, -35, 20, 0], scale: [1, 1.08, 0.96, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ─── FaqItem ─────────────────────────────────────────────────────────────────

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-border/40 last:border-b-0"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between gap-6 py-6 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-lg font-medium text-foreground sm:text-xl">{question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 pr-12 text-base leading-relaxed text-muted-foreground">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── CompactDropzone ─────────────────────────────────────────────────────────

function CompactDropzone({
  fromLabel,
  fromMime,
  onFiles,
  disabled,
}: {
  fromLabel: string;
  fromMime: string;
  onFiles: (f: File[]) => void;
  disabled?: boolean;
}) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Upload ${fromLabel} file`}
      aria-disabled={disabled}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); if (!disabled) { const f = Array.from(e.dataTransfer.files); if (f.length) onFiles(f); } }}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) inputRef.current?.click(); }}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-10 text-center transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        drag
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border/60 bg-card/40 hover:border-primary/50 hover:bg-primary/3",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {/* Gradient glow on drag */}
      {drag && (
        <div className="absolute inset-0 -z-10 rounded-2xl opacity-20 blur-xl" style={{ background: IMG_GRADIENT_STATIC }} />
      )}

      {/* Upload icon */}
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105"
        style={{ background: "hsl(var(--primary) / 0.1)" }}
      >
        <Upload className="h-6 w-6 text-primary" aria-hidden />
      </div>

      <div>
        <p className="text-base font-semibold text-foreground">
          Drop <span className="text-primary">{fromLabel}</span> files here
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          or{" "}
          <span className="text-primary underline underline-offset-2 hover:text-primary/80">
            click to browse
          </span>
          {" "}· batch supported · up to 50 MB each
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={fromMime}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => { const f = Array.from(e.target.files ?? []); if (f.length) onFiles(f); }}
        aria-hidden
      />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtBytes(b: number): string {
  if (!b) return "0 B";
  const k = 1024;
  const s = ["B", "KB", "MB"];
  const i = Math.min(Math.floor(Math.log(b) / Math.log(k)), 2);
  return `${(b / k ** i).toFixed(1)} ${s[i]}`;
}

function outName(name: string, fmt: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}.${fmt === "image/x-icon" ? "ico" : fmt}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ImageConverterView({ tool, alias, faqs }: Props) {
  const { convertImage } = useImageProcessor();
  const { downloadSingle, downloadMultiple } = useFileDownload();
  const shouldReduce = useReducedMotion();

  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(92);

  const isLossy = LOSSY_FORMATS.has(tool.toFormat);
  const isHeic  = ["heic", "heif"].includes(tool.fromFormat);
  const done    = results.length > 0;
  const hasFiles = files.length > 0;

  // Parallax scroll for hero doodles
  const { scrollY } = useScroll();
  const yLeft  = useTransform(scrollY, [0, 500], [0, -50]);
  const yRight = useTransform(scrollY, [0, 500], [0, 35]);

  // Hero copy — alias overrides primary
  const hero = {
    h1Prefix:  alias?.h1Prefix    ?? "Free",
    h1Highlight: alias?.h1Highlight ?? `${tool.fromLabel} to ${tool.toLabel}`,
    h1Suffix:  alias?.h1Suffix    ?? "Converter",
    eyebrow:   alias?.eyebrow     ?? `100% browser-based · zero upload risk`,
    subline:   alias?.heroSubline ?? tool.whyConvert,
  };

  const handleFiles = useCallback((incoming: File[]) => {
    setFiles(incoming); setResults([]); setError(null); setProgress(0);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!files.length) return;
    setBusy(true); setProgress(0); setError(null);
    const out: ResultRow[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const q = isLossy ? quality / 100 : undefined;
        const converted = await convertImage(f, tool.toFormat === "ico" ? "ico" : tool.toFormat, q);
        out.push({ original: f, converted: new File([converted], outName(f.name, tool.toFormat), { type: tool.toMime }) });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setResults(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed — please try again.");
    } finally {
      setBusy(false);
    }
  }, [files, quality, isLossy, tool.toFormat, tool.toMime, convertImage]);

  const handleDownload = useCallback(() => {
    const fs = results.map(r => r.converted);
    fs.length === 1 ? downloadSingle(fs[0]) : downloadMultiple(fs);
  }, [results, downloadSingle, downloadMultiple]);

  const handleReset = useCallback(() => {
    setFiles([]); setResults([]); setError(null); setProgress(0);
  }, []);

  return (
    <MarketingShell>
      <main className="relative overflow-hidden">

        {/* ================================================================
            HERO — full viewport, floating orbs, doodles, tool as centerpiece
        ================================================================ */}
        <section className="relative flex min-h-[80vh] items-center justify-center px-4 py-14 sm:py-16">

          {/* Background orbs — warm orange/amber palette */}
          <FloatingOrb className="left-[-8%] top-[8%] h-[420px] w-[420px]"  color="radial-gradient(circle, hsl(21 95% 56% / 0.35) 0%, transparent 70%)" />
          <FloatingOrb className="right-[-6%] top-[18%] h-[360px] w-[360px]" color="radial-gradient(circle, hsl(38 92% 50% / 0.3) 0%, transparent 70%)" delay={3} />
          <FloatingOrb className="bottom-[-12%] left-[28%] h-[480px] w-[480px]" color="radial-gradient(circle, hsl(21 95% 56% / 0.2) 0%, transparent 70%)" delay={6} />

          {/* Desktop doodles */}
          <motion.div style={shouldReduce ? undefined : { y: yLeft }} className="pointer-events-none absolute left-[6%] top-[18%] hidden text-primary/35 lg:block">
            <SparkleGlyph className="h-8 w-8" />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute right-[8%] top-[22%] hidden text-primary/25 lg:block"
            animate={shouldReduce ? undefined : { rotate: [0, 360] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <DottedCircle className="h-16 w-16" />
          </motion.div>
          <motion.div style={shouldReduce ? undefined : { y: yRight }} className="pointer-events-none absolute right-[10%] top-[60%] hidden text-primary/35 lg:block">
            <ConvertGlyph className="h-14 w-14" />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute left-[10%] top-[68%] hidden text-primary/25 lg:block"
            animate={shouldReduce ? undefined : { rotate: [-8, 8, -8] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ZigzagLine className="h-6 w-20" />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute right-[4%] bottom-[18%] hidden text-primary/35 lg:block"
            animate={shouldReduce ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <SparkleGlyph className="h-5 w-5" />
          </motion.div>

          {/* CENTER STAGE */}
          <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center">

            {/* Live pill */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-card/70 px-4 py-1.5 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-medium tracking-wide text-foreground/80">
                {hero.eyebrow}
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-bold leading-[1.06] tracking-tight text-foreground"
            >
              {hero.h1Prefix}{" "}
              <span className="relative inline-block">
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: IMG_GRADIENT_STATIC }}
                >
                  {hero.h1Highlight}
                </span>
                {/* Underline scribble */}
                <motion.svg viewBox="0 0 300 12" className="absolute -bottom-1 left-0 h-3 w-full" fill="none" aria-hidden>
                  <motion.path
                    d="M2 8 Q 50 2, 100 6 T 200 6 T 298 8"
                    stroke="url(#conv-underline)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 0.6 }}
                  />
                  <defs>
                    <linearGradient id="conv-underline" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
              {hero.h1Suffix && <><br />{hero.h1Suffix}</>}
            </motion.h1>

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              {hero.subline}
            </motion.p>

            {/* Trust chips */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.38 }}
              className="mt-5 flex flex-wrap items-center justify-center gap-3"
            >
              {[
                { icon: Zap,        label: "No signup" },
                { icon: ShieldCheck, label: "Never uploaded" },
                { icon: CheckCircle2, label: "Instant" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur-sm"
                >
                  <Icon className="h-3 w-3 text-primary" aria-hidden />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* ── TOOL UI ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-10 w-full max-w-2xl"
            >
              {/* Glowing card wrapper */}
              <div className="group relative">
                <motion.div
                  className="absolute -inset-0.5 rounded-2xl opacity-50 blur-lg"
                  style={{ background: IMG_GRADIENT, backgroundSize: "200% 100%" }}
                  animate={shouldReduce ? undefined : { backgroundPosition: ["0% 0%", "200% 0%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />

                <div className="relative rounded-2xl bg-card p-5 sm:p-6">
                  {/* Format pair display */}
                  <div className="mb-5 flex items-center justify-center gap-4">
                    <div className="flex h-14 w-20 flex-col items-center justify-center rounded-xl border-2 border-border bg-muted/30">
                      <span className="text-base font-black tracking-tight text-foreground">{tool.fromLabel}</span>
                      <span className="mt-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">source</span>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                      <ArrowRight className="h-3.5 w-3.5 text-primary" aria-hidden />
                    </div>
                    <div className="relative flex h-14 w-20 flex-col items-center justify-center rounded-xl border-2" style={{ borderColor: "hsl(var(--primary) / 0.4)", background: "hsl(var(--primary) / 0.06)" }}>
                      <span className="text-base font-black tracking-tight text-primary">{tool.toLabel}</span>
                      <span className="mt-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">output</span>
                    </div>
                  </div>

                  {/* HEIC notice */}
                  {isHeic && (
                    <div className="mb-4 flex gap-2.5 rounded-xl bg-muted/50 px-3.5 py-3 text-sm text-muted-foreground">
                      <span className="mt-0.5 shrink-0 text-primary">ⓘ</span>
                      Your browser won&apos;t preview HEIC files but conversion works fine — HEIC decoding runs locally via WebAssembly.
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {!done ? (
                      <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <CompactDropzone fromLabel={tool.fromLabel} fromMime={tool.fromMime} onFiles={handleFiles} disabled={busy} />

                        {/* Quality slider */}
                        {isLossy && hasFiles && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 space-y-2 rounded-xl border border-border/50 bg-muted/20 px-4 py-3"
                          >
                            <div className="flex items-center justify-between">
                              <label htmlFor="quality-slider" className="text-sm font-medium text-foreground">Quality</label>
                              <span className="text-sm font-bold text-primary" aria-live="polite">{quality}%</span>
                            </div>
                            <Slider id="quality-slider" min={1} max={100} step={1} value={[quality]} onValueChange={([v]) => setQuality(v)} aria-label={`Output quality: ${quality}%`} />
                            <p className="text-[11px] text-muted-foreground">92% is visually identical to lossless for most images.</p>
                          </motion.div>
                        )}

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 flex gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm"
                          >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                            <span className="text-destructive">{error}</span>
                          </motion.div>
                        )}

                        {busy && (
                          <div className="mt-4 space-y-1.5">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-muted-foreground">Converting {tool.fromLabel} → {tool.toLabel}…</span>
                              <span className="text-primary">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                          </div>
                        )}

                        <motion.div whileHover={shouldReduce ? undefined : { scale: 1.01 }} whileTap={shouldReduce ? undefined : { scale: 0.98 }} className="mt-4">
                          <Button
                            onClick={handleConvert}
                            disabled={!hasFiles || busy}
                            size="lg"
                            className="h-14 w-full rounded-xl text-base font-semibold text-white shadow-lg shadow-primary/25 disabled:opacity-50"
                            style={{ background: hasFiles ? IMG_GRADIENT_STATIC : undefined }}
                          >
                            {busy ? (
                              <><span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />Converting…</>
                            ) : (
                              <><Download className="mr-2 h-5 w-5" aria-hidden />Convert to {tool.toLabel}</>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />
                            <span className="font-semibold text-foreground">{results.length === 1 ? "Ready to download" : `${results.length} files ready`}</span>
                          </div>
                          <ul className="space-y-2 text-sm">
                            {results.map((r, i) => {
                              const delta = ((r.converted.size - r.original.size) / r.original.size) * 100;
                              return (
                                <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-background/60 px-3 py-2">
                                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">{r.converted.name}</span>
                                  <span className="shrink-0 text-xs text-muted-foreground">{fmtBytes(r.original.size)} → {fmtBytes(r.converted.size)}</span>
                                  {delta < -1 && <span className="shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{delta.toFixed(0)}%</span>}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        <div className="mt-4 flex gap-3">
                          <Button onClick={handleDownload} size="lg" className="flex-1 font-semibold" style={{ background: IMG_GRADIENT_STATIC }}>
                            <Download className="mr-2 h-4 w-4" aria-hidden />
                            {results.length === 1 ? `Download ${tool.toLabel}` : `Download all (${results.length})`}
                          </Button>
                          <Button onClick={handleReset} variant="outline" size="lg" aria-label="Convert more files">
                            <RotateCcw className="h-4 w-4" aria-hidden />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================================================================
            HOW IT WORKS — 3-step horizontal timeline
        ================================================================ */}
        <section className="relative hidden px-4 py-12 sm:block sm:py-16">
          <div className="mx-auto max-w-5xl">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-10 text-center font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              How to convert {tool.fromLabel} to {tool.toLabel}
            </motion.h2>

            <div className="relative flex items-start justify-center gap-0">
              {/* Connecting track */}
              <div className="absolute left-1/2 top-8 h-0.5 w-[calc(66%-8rem)] -translate-x-1/2 bg-border/40" aria-hidden />

              {[
                { icon: Upload,  title: `Upload ${tool.fromLabel}`, caption: "Drag & drop or click to browse. Batch supported — no file size limit." },
                { icon: Zap,     title: isLossy ? "Set quality" : "Instant conversion", caption: isLossy ? `Adjust quality (default 92%). Higher = better quality, larger file.` : `${tool.toLabel} is lossless — no settings needed.` },
                { icon: Download, title: "Download", caption: "Converts in your browser. Nothing uploaded. Download instantly." },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex flex-1 flex-col items-center gap-4 px-6 text-center"
                  >
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                      <Icon className="h-7 w-7 text-primary" aria-hidden />
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold tracking-tight text-foreground">{step.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{step.caption}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================
            AEO CONTENT — entity-first TL;DR + features
        ================================================================ */}
        <section className="relative px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Why convert
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {tool.fromLabel} vs {tool.toLabel} — when to convert
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {tool.whyConvert}
              </p>
            </motion.div>

            {/* Features grid */}
            <motion.ul
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {[
                "100% browser-based — images never leave your device",
                "No signup, no account, no watermark added",
                "Batch conversion — upload multiple files at once",
                `${isLossy ? "Quality slider" : "Lossless conversion"} — full control over output`,
                "Supports drag & drop and file browser upload",
                "Works on any device — phone, tablet, desktop",
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {feat}
                </li>
              ))}
            </motion.ul>
          </div>
        </section>

        {/* ================================================================
            IMAGE TOOLBOX — related image tools (same pattern as Reel Downloader)
        ================================================================ */}
        <section className="relative px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Image Tools
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                More free image tools
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {IMAGE_TOOLBOX.map((t, i) => {
                const Icon = t.icon;
                return (
                  <motion.div
                    key={t.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    <Link
                      href={`/tools/${t.slug}`}
                      className="group flex h-full flex-col rounded-xl border border-border/60 bg-card/60 p-5 transition-all duration-200 hover:border-primary/30 hover:bg-card hover:shadow-sm"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-sm font-semibold text-foreground">{t.title}</h3>
                      <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                        Try it free <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-6 text-center text-sm text-muted-foreground"
            >
              <Link href="/tools/image" className="text-primary hover:underline underline-offset-2">
                Browse all 49 free image tools →
              </Link>
            </motion.p>
          </div>
        </section>

        {/* ================================================================
            COMPARE & LEARN MORE — competitor links (same pattern as Reel Downloader)
        ================================================================ */}
        <section className="relative px-4 py-6 sm:py-8">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-xl border border-border/40 bg-card/40 p-6"
            >
              <h3 className="font-display text-lg font-semibold text-foreground">
                Compare &amp; Learn More
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                See how Trndinn&apos;s image converter stacks up against the alternatives, or read our format conversion guides.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {IMAGE_CONVERTER_COMPETITORS.slice(0, 5).map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/compare/trndinn-vs-${c.slug}`}
                      className="inline-flex items-center gap-1.5 text-primary underline-offset-2 hover:underline"
                    >
                      <ArrowRight className="h-3 w-3" />
                      Trndinn vs {c.name} — {c.tagline}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/compare" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary underline-offset-2 hover:underline">
                    <ArrowRight className="h-3 w-3" />
                    See all comparisons →
                  </Link>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* ================================================================
            FAQ
        ================================================================ */}
        {faqs.length > 0 && (
          <section className="relative px-4 py-12 sm:py-16">
            <div className="mx-auto max-w-3xl">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="mb-6 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              >
                Frequently asked questions
              </motion.h2>
              <div>
                {faqs.map((faq, i) => (
                  <FaqItem key={i} question={faq.question} answer={faq.answer} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================================================================
            FINAL CTA
        ================================================================ */}
        <section className="relative px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
            >
              <span className="text-foreground">One platform for </span>
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: IMG_GRADIENT_STATIC }}>
                all your content
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-4 text-base leading-relaxed text-muted-foreground"
            >
              Convert images for free. Then schedule, publish, and grow — all from one place.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Button asChild size="lg" className="px-8 font-semibold text-white shadow-lg shadow-primary/25" style={{ background: IMG_GRADIENT_STATIC }}>
                <Link href="/pricing">Start free — $0.86/mo</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/tools">Browse all free tools</Link>
              </Button>
            </motion.div>
          </div>
        </section>

      </main>
    </MarketingShell>
  );
}
