"use client";

/**
 * ImageConverterView — matches the reference design:
 * - Left sidebar with colored icon badges, search, categories (POPULAR/CONVERT/OPTIMIZE/GENERATE)
 * - Dark space-theme main area (deep navy)
 * - Hero: 3D floating format cards (FROM → TO) with neon glow + "From this / To this" labels
 * - Tool workspace: tabbed upload + split preview + advanced settings
 * - Trust features row, info cards, related tools strip
 *
 * Trndinn tokens: hsl(var(--token)) for all non-gradient colors.
 * Gradients use inline style only (brand orange #F97316 / amber #F59E0B + dark navy).
 * framer-motion for hero 3D card entrance + section reveals.
 * prefers-reduced-motion safe. WCAG AA.
 */

import { useState, useCallback, useRef, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  Search,
  Upload,
  Link2,
  ImageIcon,
  Download,
  ArrowRight,
  ArrowLeftRight,
  RotateCcw,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Zap,
  ShieldCheck,
  Wifi,
  Layers,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar } from "@/views/tools/image-tools/ImageToolsSidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useImageProcessor } from "@/hooks/tools/useImageProcessor";
import { useFileDownload } from "@/hooks/tools/useFileDownload";
import { IMAGE_CONVERTER_COMPETITORS } from "@/lib/image-converter-competitors";
import { cn } from "@/lib/utils";
import { CONVERSION_TOOLS } from "@/lib/image-converter-data";
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

// Format → gradient for the 3D hero card glow
const FORMAT_GLOW: Record<string, string> = {
  png:  "#3B82F6",
  jpg:  "#F97316",
  jpeg: "#F97316",
  webp: "#10B981",
  avif: "#8B5CF6",
  heic: "#F59E0B",
  heif: "#F59E0B",
  svg:  "#F97316",
  gif:  "#EC4899",
  bmp:  "#6B7280",
  tiff: "#6B7280",
  tif:  "#6B7280",
  ico:  "#F59E0B",
};

function getGlow(fmt: string) {
  return FORMAT_GLOW[fmt.toLowerCase()] ?? "#F97316";
}

// ─── Sidebar ─── uses shared ImageToolsSidebar from image-tools/ ─────────────

// ─── 3D Hero Format Cards ─────────────────────────────────────────────────────

function Hero3DCards({
  fromLabel,
  toLabel,
  fromFormat,
  toFormat,
  shouldReduce,
}: {
  fromLabel: string;
  toLabel: string;
  fromFormat: string;
  toFormat: string;
  shouldReduce: boolean | null;
}) {
  const fromGlow = getGlow(fromFormat);
  const toGlow   = getGlow(toFormat);

  return (
    <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[42%] lg:flex items-center justify-center pr-8" aria-hidden>
      {/* "From this" label */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="absolute left-[8%] top-[22%] flex flex-col items-center gap-1 text-muted-foreground"
        style={{ fontFamily: "cursive" }}
      >
        <span className="text-sm italic">From this</span>
        <svg viewBox="0 0 40 30" className="h-6 w-10 rotate-45 text-muted-foreground/60" fill="none">
          <path d="M5 5 Q20 2, 35 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M28 16 L35 20 L30 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      {/* "To this" label */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute right-[6%] top-[16%] flex flex-col items-end gap-1 text-muted-foreground"
        style={{ fontFamily: "cursive" }}
      >
        <span className="text-sm italic">To this</span>
        <svg viewBox="0 0 40 30" className="h-6 w-10 -scale-x-100 rotate-45 text-muted-foreground/60" fill="none">
          <path d="M5 5 Q20 2, 35 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M28 16 L35 20 L30 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      {/* FROM card */}
      <motion.div
        initial={{ opacity: 0, x: -40, rotateY: 20 }}
        animate={{ opacity: 1, x: 0, rotateY: shouldReduce ? 0 : -12 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: 800, transformStyle: "preserve-3d" }}
        className="relative mr-[-20px]"
      >
        <div
          className="relative h-36 w-28 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(var(--tool-surface)), hsl(var(--tool-border)))",
            border: `2px solid ${fromGlow}40`,
            boxShadow: `0 0 30px ${fromGlow}30, 0 0 60px ${fromGlow}15, inset 0 1px 0 ${fromGlow}20`,
            transform: "rotateY(-12deg) rotateX(4deg)",
          }}
        >
          {/* Gradient placeholder image */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${fromGlow}30 0%, hsl(var(--tool-bg)) 100%)`,
            }}
          />
          {/* Mountain-like placeholder */}
          <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 112 144" fill="none">
            <defs>
              <linearGradient id="fromSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fromGlow} stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--tool-bg))" stopOpacity="1" />
              </linearGradient>
            </defs>
            <rect width="112" height="144" fill="url(#fromSky)" />
            <polygon points="20,120 56,50 92,120" fill="hsl(var(--tool-border))" opacity="0.9" />
            <polygon points="0,120 35,70 65,120" fill="hsl(var(--tool-surface-dim))" opacity="0.8" />
          </svg>
          {/* Format label */}
          <div className="absolute bottom-0 left-0 right-0 py-2 text-center" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
            <span className="text-xs font-black tracking-wider text-white">{fromLabel.toUpperCase()}</span>
          </div>
        </div>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
        style={{
          background: "linear-gradient(135deg, #F97316, #F59E0B)",
          borderColor: "#F97316",
          boxShadow: "0 0 20px #F9731640",
        }}
      >
        <ArrowRight className="h-5 w-5 text-white" aria-hidden />
      </motion.div>

      {/* TO card */}
      <motion.div
        initial={{ opacity: 0, x: 40, rotateY: -20 }}
        animate={{ opacity: 1, x: 0, rotateY: shouldReduce ? 0 : 12 }}
        transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: 800, transformStyle: "preserve-3d" }}
        className="relative ml-[-20px]"
      >
        <div
          className="relative h-40 w-32 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(var(--tool-surface)), hsl(var(--tool-border)))",
            border: `2px solid ${toGlow}60`,
            boxShadow: `0 0 40px ${toGlow}40, 0 0 80px ${toGlow}20, inset 0 1px 0 ${toGlow}30`,
            transform: "rotateY(12deg) rotateX(-4deg)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${toGlow}40 0%, hsl(var(--tool-bg)) 100%)`,
            }}
          />
          <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 128 160" fill="none">
            <defs>
              <linearGradient id="toSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={toGlow} stopOpacity="0.7" />
                <stop offset="100%" stopColor="hsl(var(--tool-bg))" stopOpacity="1" />
              </linearGradient>
            </defs>
            <rect width="128" height="160" fill="url(#toSky)" />
            <polygon points="20,140 64,55 108,140" fill="hsl(var(--tool-border))" opacity="0.9" />
            <polygon points="0,140 40,80 72,140" fill="hsl(var(--tool-surface-dim))" opacity="0.8" />
          </svg>
          {/* Neon corner glow */}
          <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: `inset 0 0 20px ${toGlow}20` }} />
          <div className="absolute bottom-0 left-0 right-0 py-2 text-center" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
            <span className="text-xs font-black tracking-wider text-white">{toLabel.toUpperCase()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Format Swap Row (interactive dropdowns) ─────────────────────────────────

/** Build lookup maps once — which "to" formats exist for each "from", and vice versa. */
const FROM_FORMATS = [...new Set(CONVERSION_TOOLS.map(t => t.fromFormat))].sort();

/** from → Set<to> */
const FROM_TO_MAP = new Map<string, Set<string>>();
/** to → Set<from> */
const TO_FROM_MAP = new Map<string, Set<string>>();

for (const t of CONVERSION_TOOLS) {
  if (!FROM_TO_MAP.has(t.fromFormat)) FROM_TO_MAP.set(t.fromFormat, new Set());
  FROM_TO_MAP.get(t.fromFormat)!.add(t.toFormat);
  if (!TO_FROM_MAP.has(t.toFormat)) TO_FROM_MAP.set(t.toFormat, new Set());
  TO_FROM_MAP.get(t.toFormat)!.add(t.fromFormat);
}

/** Uppercase label for a format key */
function fmtLabel(fmt: string): string {
  return fmt.toUpperCase();
}

function FormatSwapRow({
  currentFrom,
  currentTo,
  fromGlow,
  toGlow,
  reverseExists,
  reverseSlug,
  router,
}: {
  currentFrom: string;
  currentTo: string;
  fromGlow: string;
  toGlow: string;
  reverseExists: boolean;
  reverseSlug: string;
  router: ReturnType<typeof useRouter>;
}) {
  /** Available "to" options given the current "from" selection. */
  const toOptions = useMemo(
    () => [...(FROM_TO_MAP.get(currentFrom) ?? [])].sort(),
    [currentFrom],
  );

  /** Navigate to the new slug when either dropdown changes. */
  const navigateTo = useCallback(
    (from: string, to: string) => {
      const slug = `${from}-to-${to}`;
      if (CONVERSION_TOOLS.some(t => t.slug === slug)) {
        router.push(`/tools/${slug}`);
      }
    },
    [router],
  );

  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newFrom = e.target.value;
      // If the current "to" is available for the new "from", keep it; otherwise pick the first available
      const availableTos = FROM_TO_MAP.get(newFrom);
      const newTo = availableTos?.has(currentTo) ? currentTo : [...(availableTos ?? [])][0];
      if (newFrom && newTo) navigateTo(newFrom, newTo);
    },
    [currentTo, navigateTo],
  );

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newTo = e.target.value;
      navigateTo(currentFrom, newTo);
    },
    [currentFrom, navigateTo],
  );

  /* Shared select styles — blends into the dark hero using tool CSS variables */
  const selectClass =
    "appearance-none cursor-pointer rounded-lg pl-3 pr-7 py-1.5 text-sm font-bold text-white border-0 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 " +
    "transition-shadow";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className="mt-5 flex items-center gap-3"
    >
      {/* FROM dropdown */}
      <div className="relative inline-flex">
        <label htmlFor="hero-from-format" className="sr-only">
          Source format
        </label>
        <select
          id="hero-from-format"
          value={currentFrom}
          onChange={handleFromChange}
          className={selectClass}
          style={{
            background: fromGlow,
            boxShadow: `0 0 12px ${fromGlow}40`,
          }}
        >
          {FROM_FORMATS.map(fmt => (
            <option key={fmt} value={fmt} style={{ background: "#1a1a2e", color: "#fff" }}>
              {fmtLabel(fmt)}
            </option>
          ))}
        </select>
        {/* Custom chevron overlay */}
        <ChevronDown
          className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/70"
          aria-hidden
        />
      </div>

      {/* Swap button */}
      {reverseExists ? (
        <button
          onClick={() => router.push(`/tools/${reverseSlug}`)}
          title="Swap conversion direction"
          aria-label={`Swap to ${fmtLabel(currentTo)} to ${fmtLabel(currentFrom)}`}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)", boxShadow: "0 0 12px #F9731640" }}
        >
          <ArrowLeftRight className="h-4 w-4 text-white" aria-hidden />
        </button>
      ) : (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)", boxShadow: "0 0 12px #F9731640" }}
          aria-hidden
        >
          <ArrowRight className="h-4 w-4 text-white" />
        </div>
      )}

      {/* TO dropdown */}
      <div className="relative inline-flex">
        <label htmlFor="hero-to-format" className="sr-only">
          Target format
        </label>
        <select
          id="hero-to-format"
          value={currentTo}
          onChange={handleToChange}
          className={selectClass}
          style={{
            background: toGlow,
            boxShadow: `0 0 12px ${toGlow}40`,
          }}
        >
          {toOptions.map(fmt => (
            <option key={fmt} value={fmt} style={{ background: "#1a1a2e", color: "#fff" }}>
              {fmtLabel(fmt)}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/70"
          aria-hidden
        />
      </div>
    </motion.div>
  );
}

// ─── FaqItem ─────────────────────────────────────────────────────────────────

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="border-b last:border-b-0"
      style={{ borderColor: "hsl(var(--tool-border))" }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
      >
        <span className="text-base font-medium text-foreground">{question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-primary"
          style={{ background: "hsl(var(--primary) / 0.12)" }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-5 pr-10 text-sm leading-relaxed text-muted-foreground">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ImageConverterView({ tool, alias, faqs }: Props) {
  const { convertImage } = useImageProcessor();
  const { downloadSingle, downloadMultiple } = useFileDownload();
  const shouldReduce = useReducedMotion();
  const router = useRouter();

  const [tab, setTab] = useState<"upload" | "url" | "search">("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [urlFetching, setUrlFetching] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(92);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLossy = LOSSY_FORMATS.has(tool.toFormat);
  const isHeic  = ["heic", "heif"].includes(tool.fromFormat);
  const done    = results.length > 0;
  const hasFiles = files.length > 0;

  const hero = {
    h1Prefix:   alias?.h1Prefix    ?? "Turn any",
    h1Highlight: alias?.h1Highlight ?? `${tool.fromLabel} into ${tool.toLabel}`,
    h1Suffix:   alias?.h1Suffix    ?? "— instantly.",
    eyebrow:    alias?.eyebrow     ?? `Free ${tool.fromLabel} to ${tool.toLabel} Converter`,
    subline:    alias?.heroSubline ?? tool.whyConvert,
  };

  // Swap button — navigate to reverse conversion if it exists
  const reverseSlug = `${tool.toFormat}-to-${tool.fromFormat}`;
  const reverseExists = CONVERSION_TOOLS.some(t => t.slug === reverseSlug);

  const handleFiles = useCallback((incoming: File[]) => {
    setFiles(incoming); setResults([]); setError(null); setProgress(0);
  }, []);

  const handleFetchUrl = useCallback(async () => {
    if (!urlInput.trim()) return;
    setUrlFetching(true);
    setUrlError(null);
    try {
      const res = await fetch(urlInput.trim());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) throw new Error("URL does not point to an image");
      const filename = urlInput.split("/").pop()?.split("?")[0] || "image";
      const file = new File([blob], filename, { type: blob.type });
      handleFiles([file]);
      setTab("upload"); // switch to upload tab to show the file
    } catch (e) {
      setUrlError(e instanceof Error ? e.message : "Failed to fetch image. Check the URL and try again.");
    } finally {
      setUrlFetching(false);
    }
  }, [urlInput, handleFiles]);

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

  const fromGlow = getGlow(tool.fromFormat);
  const toGlow   = getGlow(tool.toFormat);

  return (
    <MarketingShell>
    {/* Full-height dark layout — sidebar + main */}
    <div
      className="flex"
      style={{ background: "hsl(var(--tool-bg))", color: "hsl(var(--foreground))" }}
    >
      <ImageToolsSidebar activeSlug={tool.slug} />

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">

        {/* ════════════════════════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden px-6 pb-12 pt-10 lg:px-10 lg:pt-12"
          style={{
            background: "linear-gradient(180deg, hsl(var(--tool-surface)) 0%, hsl(var(--tool-bg)) 100%)",
          }}
        >
          {/* 3D cards (desktop, absolutely positioned on the right) */}
          <Hero3DCards
            fromLabel={tool.fromLabel}
            toLabel={tool.toLabel}
            fromFormat={tool.fromFormat}
            toFormat={tool.toFormat}
            shouldReduce={shouldReduce}
          />

          {/* Left: headline + trust + tool workspace */}
          <div className="relative z-10 max-w-[680px]">
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-5 inline-flex rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: "hsl(var(--tool-surface-dim))", border: "1px solid hsl(var(--border))" }}
            >
              {hero.eyebrow}
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="font-display text-[clamp(2rem,4.5vw,3.8rem)] font-bold leading-[1.08] tracking-tight"
            >
              {hero.h1Prefix}{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #F97316, #F59E0B)" }}
              >
                {hero.h1Highlight}
              </span>
              {hero.h1Suffix && <> {hero.h1Suffix}</>}
            </motion.h1>

            {/* Format swap row — interactive dropdowns */}
            <FormatSwapRow
              currentFrom={tool.fromFormat}
              currentTo={tool.toFormat}
              fromGlow={fromGlow}
              toGlow={toGlow}
              reverseExists={reverseExists}
              reverseSlug={reverseSlug}
              router={router}
            />

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 }}
              className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground"
            >
              {hero.subline}
            </motion.p>

            {/* 3 trust features */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.32 }}
              className="mt-6 flex flex-wrap gap-6"
            >
              {[
                { icon: Zap,        title: "Instant conversion", sub: "No waiting" },
                { icon: ShieldCheck, title: "100% private",       sub: "Files never uploaded" },
                { icon: Wifi,        title: "Works offline",      sub: "In your browser" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "hsl(var(--tool-surface-dim))", border: "1px solid hsl(var(--border))" }}
                  >
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            TOOL WORKSPACE
        ════════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "hsl(var(--tool-surface))",
              borderColor: `${fromGlow}30`,
              boxShadow: `0 0 40px ${fromGlow}10`,
            }}
          >
            {/* Tabs */}
            <div className="flex items-center gap-0 border-b px-4 pt-1" style={{ borderColor: "hsl(var(--tool-border))" }}>
              {[
                { key: "upload", label: "Upload Image", icon: Upload },
                { key: "url",    label: "Enter URL",    icon: Link2 },
                { key: "search", label: "Search Image", icon: Search, badge: "NEW" },
              ].map(({ key, label, icon: Icon, badge }) => (
                <button
                  key={key}
                  onClick={() => setTab(key as typeof tab)}
                  className={cn(
                    "flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none",
                    tab === key
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                  {badge && (
                    <span className="ml-1 rounded px-1 py-0.5 text-[9px] font-bold text-white" style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Workspace body */}
            <div className="flex flex-col gap-0 lg:flex-row">

              {/* Upload zone (left) */}
              <div className="flex-1 p-5 lg:border-r" style={{ borderColor: "hsl(var(--tool-border))" }}>
                {tab === "upload" && (
                  <div>
                    {/* Drop zone */}
                    <div
                      role="button"
                      tabIndex={busy ? -1 : 0}
                      aria-label={`Upload ${tool.fromLabel} file`}
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={e => { e.preventDefault(); setDragging(false); const f = Array.from(e.dataTransfer.files); if (f.length) handleFiles(f); }}
                      onClick={() => inputRef.current?.click()}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 text-center transition-all duration-200 cursor-pointer",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        dragging
                          ? "border-primary scale-[1.01]"
                          : "border-muted-foreground/20 hover:border-primary/40"
                      )}
                      style={dragging ? { background: `${fromGlow}08` } : { background: "hsl(var(--tool-surface-dim))" }}
                    >
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-xl"
                        style={{ background: `${fromGlow}20`, border: `1px solid ${fromGlow}30` }}
                      >
                        <Upload className="h-6 w-6" style={{ color: fromGlow }} aria-hidden />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          Drag &amp; drop your <span style={{ color: fromGlow }}>{tool.fromLabel}</span> image here
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          or{" "}
                          <span className="underline underline-offset-2 cursor-pointer" style={{ color: fromGlow }}>
                            click to browse
                          </span>{" "}
                          (up to 50 MB)
                        </p>
                      </div>

                      {/* Format + size pills */}
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {[tool.fromLabel.toUpperCase(), ...(isHeic ? ["HEIF"] : []), "MAX 50MB"].map(f => (
                          <span
                            key={f}
                            className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground"
                            style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--tool-surface-dim))" }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>

                      <input
                        ref={inputRef}
                        type="file"
                        accept={tool.fromMime}
                        multiple
                        className="sr-only"
                        tabIndex={-1}
                        onChange={e => { const f = Array.from(e.target.files ?? []); if (f.length) handleFiles(f); }}
                        aria-hidden
                      />
                    </div>

                    {/* Browse Files button */}
                    <button
                      onClick={() => inputRef.current?.click()}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                    >
                      <Upload className="h-4 w-4" aria-hidden />
                      Browse Files
                    </button>

                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Supported: {tool.fromLabel.toUpperCase()}{isHeic ? ", HEIF" : ""} · Max size: 50 MB
                    </p>

                    {/* Thumbnail strip (when files selected) */}
                    {hasFiles && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {files.slice(0, 5).map((f, i) => (
                          <div
                            key={i}
                            className="relative h-12 w-12 overflow-hidden rounded-lg border"
                            style={{ borderColor: "hsl(var(--border))" }}
                          >
                            <img
                              src={URL.createObjectURL(f)}
                              alt={f.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                        {files.length > 5 && (
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-lg border text-xs text-muted-foreground"
                            style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--tool-surface-dim))" }}
                          >
                            +{files.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {tab === "url" && (
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-foreground" htmlFor="url-input">
                      Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="url-input"
                        type="url"
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 rounded-xl border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        style={{ background: "hsl(var(--tool-surface-dim))", borderColor: "hsl(var(--border))" }}
                        onKeyDown={e => { if (e.key === "Enter") handleFetchUrl(); }}
                      />
                      <button
                        onClick={handleFetchUrl}
                        disabled={!urlInput.trim() || urlFetching}
                        className="rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                      >
                        {urlFetching ? "Fetching…" : "Fetch"}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Paste a direct image URL (JPG, PNG, WebP, etc.) to convert it.</p>
                    {urlError && <p className="text-xs text-destructive">{urlError}</p>}
                  </div>
                )}

                {tab === "search" && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                    <Search className="h-10 w-10 text-muted-foreground/40" aria-hidden />
                    <p className="text-sm text-muted-foreground">Search by image — coming soon.</p>
                  </div>
                )}
              </div>

              {/* Preview / result (right) */}
              <div className="flex flex-col p-5 lg:w-[380px]">
                <AnimatePresence mode="wait">
                  {!done ? (
                    <motion.div key="pre" className="flex flex-1 flex-col gap-4">
                      <div className="flex gap-4">
                        {/* Original */}
                        <div className="flex-1">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">Original {tool.fromLabel}</p>
                          <div
                            className="flex h-28 items-center justify-center rounded-xl"
                            style={{ background: "hsl(var(--tool-surface-dim))", border: "1px dashed hsl(var(--border))" }}
                          >
                            {hasFiles && files[0] ? (
                              <img src={URL.createObjectURL(files[0])} alt="original" className="h-full w-full rounded-xl object-cover" />
                            ) : (
                              <ImageIcon className="h-8 w-8 text-muted-foreground/30" aria-hidden />
                            )}
                          </div>
                          {hasFiles && files[0] && (
                            <p className="mt-1 text-[10px] text-muted-foreground">{files[0].name.slice(0, 16)} · {fmtBytes(files[0].size)}</p>
                          )}
                        </div>

                        {/* Arrow / Swap */}
                        <div className="flex flex-col items-center justify-center">
                          {reverseExists ? (
                            <button
                              onClick={() => router.push(`/tools/${reverseSlug}`)}
                              title={`Switch to ${tool.toLabel} → ${tool.fromLabel}`}
                              aria-label={`Swap to ${tool.toLabel} to ${tool.fromLabel}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)", boxShadow: "0 0 12px #F9731640" }}
                            >
                              <ArrowLeftRight className="h-4 w-4 text-white" aria-hidden />
                            </button>
                          ) : (
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full"
                              style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)", boxShadow: "0 0 12px #F9731640" }}
                              aria-hidden
                            >
                              <ArrowRight className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Converted preview */}
                        <div className="flex-1">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">Converted {tool.toLabel}</p>
                          <div
                            className="flex h-28 items-center justify-center rounded-xl"
                            style={{ background: "hsl(var(--tool-surface-dim))", border: `1px dashed ${toGlow}40` }}
                          >
                            <span className="text-xs font-bold" style={{ color: toGlow }}>{tool.toLabel}</span>
                          </div>
                          <p className="mt-1 text-[10px] text-muted-foreground">After conversion</p>
                        </div>
                      </div>

                      {/* Quality slider */}
                      {isLossy && hasFiles && (
                        <div className="rounded-xl p-3 space-y-2" style={{ background: "hsl(var(--tool-surface-dim))", border: "1px solid hsl(var(--tool-border))" }}>
                          <div className="flex justify-between">
                            <label htmlFor="quality" className="text-xs font-medium text-foreground">Quality</label>
                            <span className="text-xs font-bold text-primary">{quality}%</span>
                          </div>
                          <Slider id="quality" min={1} max={100} step={1} value={[quality]} onValueChange={([v]) => setQuality(v)} />
                          <p className="text-[10px] text-muted-foreground">92% is visually identical to lossless for most images.</p>
                        </div>
                      )}

                      {/* Error */}
                      {error && (
                        <div className="flex gap-2 rounded-xl p-3 text-sm" style={{ background: "hsl(0 62% 30% / 0.2)", border: "1px solid hsl(0 62% 30% / 0.4)" }}>
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                          <span className="text-destructive">{error}</span>
                        </div>
                      )}

                      {/* Progress */}
                      {busy && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Converting…</span>
                            <span className="font-medium text-primary">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="result" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col gap-3">
                      <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: "hsl(142 71% 45% / 0.12)", border: "1px solid hsl(142 71% 45% / 0.25)" }}>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                        <span className="text-sm font-semibold text-foreground">{results.length === 1 ? "Ready to download" : `${results.length} files ready`}</span>
                      </div>
                      <ul className="space-y-2">
                        {results.map((r, i) => {
                          const delta = ((r.converted.size - r.original.size) / r.original.size) * 100;
                          return (
                            <li key={i} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                              <span className="min-w-0 flex-1 truncate font-medium text-foreground">{r.converted.name}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">{fmtBytes(r.original.size)} → {fmtBytes(r.converted.size)}</span>
                              {delta < -1 && <span className="shrink-0 text-xs font-semibold text-emerald-400">{delta.toFixed(0)}%</span>}
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Convert / Download button — full width */}
            <div className="border-t p-4" style={{ borderColor: "hsl(var(--tool-border))" }}>
              {!done ? (
                <button
                  onClick={handleConvert}
                  disabled={!hasFiles || busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ background: "linear-gradient(90deg, #F97316, #F59E0B)", boxShadow: hasFiles ? "0 0 24px #F9731630" : "none" }}
                >
                  {busy ? (
                    <><RefreshCw className="h-5 w-5 animate-spin" aria-hidden />Converting…</>
                  ) : (
                    <>Convert to {tool.toLabel} <ArrowRight className="h-5 w-5" aria-hidden /></>
                  )}
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ background: "linear-gradient(90deg, #F97316, #F59E0B)", boxShadow: "0 0 24px #F9731630" }}
                  >
                    <Download className="h-5 w-5" aria-hidden />
                    {results.length === 1 ? `Download ${tool.toLabel}` : `Download all (${results.length})`}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center rounded-xl px-4 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ background: "hsl(var(--tool-surface-dim))", border: "1px solid hsl(var(--tool-border))" }}
                    aria-label="Convert more files"
                  >
                    <RotateCcw className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            4 TRUST FEATURES
        ════════════════════════════════════════════════════════════════ */}
        <section className="px-6 py-6 lg:px-10">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { icon: Zap,          title: "No signup",           sub: "Get started instantly" },
              { icon: ShieldCheck,  title: "Private & secure",    sub: "Files never leave your device" },
              { icon: CheckCircle2, title: "High quality output", sub: "Multiple format options" },
              { icon: Layers,       title: "Batch conversion",    sub: "Convert multiple files at once" },
            ].map(({ icon: Icon, title, sub }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="flex items-start gap-3 rounded-xl p-4"
                style={{ background: "hsl(var(--tool-surface))", border: "1px solid hsl(var(--tool-border))" }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "hsl(var(--primary) / 0.12)" }}>
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            INFO CARDS + CTA
        ════════════════════════════════════════════════════════════════ */}
        <section className="px-6 pb-6 lg:px-10">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* What is this format? */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-2xl p-6"
              style={{ background: "hsl(var(--tool-surface))", border: "1px solid hsl(var(--tool-border))" }}
            >
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
                <span className="text-[80px] font-black text-foreground">{tool.toLabel}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">What is {tool.toLabel} format?</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tool.whyConvert}</p>
              <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-2">
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>

            {/* Need more? CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative overflow-hidden rounded-2xl p-6"
              style={{ background: "linear-gradient(135deg, hsl(var(--tool-surface)), hsl(var(--tool-surface-dim)))", border: "1px solid hsl(var(--primary) / 0.2)" }}
            >
              {/* Floating icons decoration */}
              <div className="absolute right-4 top-4 flex gap-2 opacity-60">
                {[fromGlow, toGlow, "#8B5CF6"].map((c, i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold"
                    style={{ background: c, transform: `rotate(${(i - 1) * 8}deg)` }}
                  >
                    {i === 0 ? tool.fromLabel.slice(0, 3) : i === 1 ? tool.toLabel.slice(0, 3) : "AI"}
                  </div>
                ))}
              </div>
              <h3 className="text-lg font-bold text-foreground">Need more?</h3>
              <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-muted-foreground">
                Generate content, schedule posts, and grow your brand with Trndinn AI — from $0.86/mo.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
              >
                Create with Trndinn <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            MORE IMAGE TOOLS
        ════════════════════════════════════════════════════════════════ */}
        <section className="px-6 pb-6 lg:px-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">More image tools you&apos;ll love</h2>
            <Link href="/tools/image" className="text-sm font-medium text-primary hover:underline underline-offset-2">
              View all tools →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { slug: "png-to-ico",         label: "PNG → ICO",         color: "#F59E0B", desc: "Convert PNG to ICO" },
              { slug: "image-resizer",       label: "Resize Image",      color: "#3B82F6", desc: "Resize to any dimensions" },
              { slug: "compress-jpg",        label: "Compress Image",    color: "#F97316", desc: "Reduce image file size" },
              { slug: "background-remover",  label: "Remove Background", color: "#10B981", desc: "AI background removal" },
            ].map((t, i) => (
              <motion.div
                key={t.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link
                  href={`/tools/${t.slug}`}
                  className="group flex items-center gap-3 rounded-xl p-3 transition-colors"
                  style={{ background: "hsl(var(--tool-surface))", border: "1px solid hsl(var(--tool-border))" }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white"
                    style={{ background: t.color }}
                  >
                    {t.label.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{t.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            COMPARE
        ════════════════════════════════════════════════════════════════ */}
        <section className="px-6 pb-6 lg:px-10">
          <div
            className="rounded-2xl p-6"
            style={{ background: "hsl(var(--tool-surface))", border: "1px solid hsl(var(--tool-border))" }}
          >
            <h3 className="text-base font-semibold text-foreground">Compare &amp; Learn More</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {IMAGE_CONVERTER_COMPETITORS.slice(0, 4).map(c => (
                <Link
                  key={c.slug}
                  href={`/compare/trndinn-vs-${c.slug}`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowRight className="h-3 w-3 shrink-0" aria-hidden />
                  Trndinn vs {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            FAQ
        ════════════════════════════════════════════════════════════════ */}
        {faqs.length > 0 && (
          <section className="px-6 pb-12 lg:px-10">
            <h2 className="mb-2 text-xl font-bold text-foreground">Frequently asked questions</h2>
            <div className="mt-4">
              {faqs.map((faq, i) => (
                <FaqItem key={i} question={faq.question} answer={faq.answer} index={i} />
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
    </MarketingShell>
  );
}
