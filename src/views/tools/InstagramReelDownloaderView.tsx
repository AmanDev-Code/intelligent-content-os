"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ClipboardPaste,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  Film,
  Wand2,
  Infinity as InfinityIcon,
  ChevronDown,
} from "lucide-react";
import { z } from "zod";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { InstaHowToVisual } from "@/components/tools/InstaHowToVisual";
import { TOOLS } from "@/lib/tools-data";
import { API_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useExperiment, trackExperimentConversion } from "@/hooks/useExperiment";

// ---------------------------------------------------------------------------
// Types & Validation
// ---------------------------------------------------------------------------

const instagramUrlSchema = z
  .string()
  .min(1, "Paste an Instagram Reel URL first ✨")
  .refine(
    (url) =>
      /^https?:\/\/(www\.)?instagram\.com\/(reel|reels|p)\/[\w-]+/i.test(url),
    "Hmm, that doesn't look like an Instagram Reel URL. Try again?",
  );

interface DownloadResult {
  videoUrl: string;
  thumbnail?: string;
  filename?: string;
  caption?: string;
  author?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Cycling placeholder examples
// ---------------------------------------------------------------------------
const PLACEHOLDER_EXAMPLES = [
  "https://instagram.com/reel/DAbC123XyZ/",
  "https://www.instagram.com/reel/DZhxxlNoM4Z/",
  "https://instagram.com/p/DXyz789AbC/",
  "https://www.instagram.com/reels/D4kLm2QrPn/",
];

// ---------------------------------------------------------------------------
// Decorative Doodle SVGs
// ---------------------------------------------------------------------------

const SparkleGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
      fill="currentColor"
    />
  </svg>
);

const CurvedArrow = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 60"
    className={className}
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 30 Q 30 5, 60 25 T 95 30"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeDasharray="0 0"
    />
    <path
      d="M87 22 L 95 30 L 87 38"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const DottedCircle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 60" className={className} fill="none" aria-hidden="true">
    <circle
      cx="30"
      cy="30"
      r="26"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="2 6"
      strokeLinecap="round"
    />
  </svg>
);

const FilmStripGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden="true">
    <rect
      x="4"
      y="8"
      width="32"
      height="24"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="8" cy="12" r="1" fill="currentColor" />
    <circle cx="8" cy="20" r="1" fill="currentColor" />
    <circle cx="8" cy="28" r="1" fill="currentColor" />
    <circle cx="32" cy="12" r="1" fill="currentColor" />
    <circle cx="32" cy="20" r="1" fill="currentColor" />
    <circle cx="32" cy="28" r="1" fill="currentColor" />
    <path d="M14 20 L 22 15 L 22 25 Z" fill="currentColor" />
  </svg>
);

const ZigzagLine = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 80 20"
    className={className}
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 10 L 12 4 L 22 16 L 32 4 L 42 16 L 52 4 L 62 16 L 72 4 L 78 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InstagramGradientIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="ig-icon-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80" />
        <stop offset="25%" stopColor="#F77737" />
        <stop offset="50%" stopColor="#E1306C" />
        <stop offset="75%" stopColor="#C13584" />
        <stop offset="100%" stopColor="#833AB4" />
      </linearGradient>
    </defs>
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="5"
      stroke="url(#ig-icon-grad)"
      strokeWidth="2"
    />
    <circle
      cx="12"
      cy="12"
      r="4.5"
      stroke="url(#ig-icon-grad)"
      strokeWidth="2"
    />
    <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig-icon-grad)" />
  </svg>
);

// ---------------------------------------------------------------------------
// Floating orb (background)
// ---------------------------------------------------------------------------

const FloatingOrb = ({
  className,
  color,
  delay = 0,
}: {
  className?: string;
  color: string;
  delay?: number;
}) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl opacity-40",
        className,
      )}
      style={{ background: color }}
      animate={
        shouldReduceMotion
          ? undefined
          : {
              x: [0, 30, -20, 0],
              y: [0, -40, 20, 0],
              scale: [1, 1.1, 0.95, 1],
            }
      }
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Cycling placeholder hook
// ---------------------------------------------------------------------------

function useCyclingPlaceholder(examples: string[], intervalMs = 3200) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % examples.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [examples.length, intervalMs]);
  return examples[index];
}

// ---------------------------------------------------------------------------
// Steps & Related tools
// ---------------------------------------------------------------------------

const STEPS = [
  {
    icon: ClipboardPaste,
    title: "Paste",
    caption: "Drop any Reel URL",
    accent: "from-[#833AB4] to-[#C13584]",
  },
  {
    icon: Wand2,
    title: "Poof",
    caption: "We extract it in a sec",
    accent: "from-[#C13584] to-[#E1306C]",
  },
  {
    icon: Download,
    title: "Save",
    caption: "MP4 in original quality",
    accent: "from-[#E1306C] to-[#F77737]",
  },
];

const relatedTools = TOOLS.filter(
  (t) => t.slug !== "instagram-reel-downloader",
).slice(0, 3);

// ---------------------------------------------------------------------------
// FAQ accordion item
// ---------------------------------------------------------------------------

function FaqItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
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
        <span className="font-display text-lg font-medium text-foreground sm:text-xl">
          {question}
        </span>
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
            <p className="max-w-2xl pb-6 pr-12 text-base leading-relaxed text-muted-foreground">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Optional hero variant used by programmatic-SEO alias URLs.
 * Each alias URL (/tools/instagram-video-downloader, etc.) passes a variant so
 * the H1, eyebrow, and subline match its target search intent, while the tool
 * functionality below the fold stays identical.
 */
export interface HeroVariant {
  h1Prefix: string;
  h1Highlight: string;
  h1Suffix: string;
  eyebrow: string;
  subline: string;
}

export default function InstagramReelDownloaderView({
  faqs,
  heroVariant,
}: {
  faqs: FAQItem[];
  heroVariant?: HeroVariant;
}) {
  // Default hero copy — used when this component is rendered on the primary
  // /tools/instagram-reel-downloader URL (no variant passed).
  const hero: HeroVariant = heroVariant ?? {
    h1Prefix: "Download any",
    h1Highlight: "Instagram Reel",
    h1Suffix: "in HD.",
    eyebrow: "Free Instagram Reel Downloader — no login, no watermark",
    subline:
      "Paste a Reel URL. Get the MP4. That's it — no signup, no watermark, no shady popups.",
  };
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DownloadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const placeholder = useCyclingPlaceholder(PLACEHOLDER_EXAMPLES);

  // ─── A/B test: CTA button copy ────────────────────────────────────────────
  // Reads from PostHog feature flag "reel-cta-copy" (set up in PostHog UI).
  // Add ?experiment_reel-cta-copy=save-mp4 to preview a variant locally.
  const ctaVariant = useExperiment("reel-cta-copy", [
    "yank-it",       // control — playful, on-brand
    "save-mp4",      // variant A — direct, action-verb
    "download-free", // variant B — free emphasis
  ] as const);

  const ctaCopy =
    ctaVariant === "save-mp4"
      ? "Save MP4"
      : ctaVariant === "download-free"
        ? "Download free"
        : "Yank it";

  // Parallax scroll effect for hero decorations
  const { scrollY } = useScroll();
  const yLeft = useTransform(scrollY, [0, 500], [0, -60]);
  const yRight = useTransform(scrollY, [0, 500], [0, 40]);
  const rotate = useTransform(scrollY, [0, 500], [0, 30]);

  // Track whether we've already auto-retried this URL after a video load
  // failure. Prevents infinite retry loops when the source is genuinely broken.
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  async function extractReel(reelUrl: string, refresh = false) {
    const res = await fetch(
      `${API_CONFIG.BASE_URL}/api/tools/instagram-reel-downloader/download`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: reelUrl, refresh }),
      },
    );

    const body = await res.json().catch(() => null);

    if (!res.ok || !body?.success) {
      throw new Error(
        body?.error || "Couldn't fetch that Reel. Try another URL?",
      );
    }

    // Extract clean shortcode from URL (strip query params and trailing slashes)
    const cleanPath = reelUrl.split("?")[0].replace(/\/+$/, "");
    const shortcode = cleanPath.split("/").filter(Boolean).pop() || "reel";
    const author = body.data.author || null;
    const caption = body.data.caption || null;

    // Build a short, SEO-friendly filename: trndinn-{author}-{shortcode}.mp4
    const nameParts = ["trndinn"];
    if (author) nameParts.push(author.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 20));
    nameParts.push(shortcode.slice(0, 16));
    const filename = `${nameParts.join("-")}.mp4`;

    return {
      videoUrl: body.data.videoUrl as string,
      thumbnail: (body.data.thumbnailUrl as string) || undefined,
      filename,
      caption: (caption as string) || undefined,
      author: (author as string) || undefined,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setRefreshAttempted(false);

    const parsed = instagramUrlSchema.safeParse(url.trim());
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    // Track CTA click as the experiment's conversion goal. PostHog auto-attaches
    // the feature-flag variant so we can compare click-through rates by variant.
    trackExperimentConversion("reel-cta-copy", "reel_cta_clicked", {
      url_provided: true,
    });
    try {
      const result = await extractReel(parsed.data);
      setResult(result);
      // Track a successful extraction as a secondary goal — more valuable
      // than a raw click because failed extractions don't count.
      trackExperimentConversion("reel-cta-copy", "reel_extracted", {
        engine_used: "unknown", // backend doesn't expose this in the client response
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went sideways. Try again?",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Called when the <video> element fails to load its source.
   * Instagram CDN URLs expire — if we have a cached result whose token has
   * already expired, we re-fetch once with refresh:true to force a fresh
   * extraction. Only retries once per submission.
   */
  async function handleVideoError() {
    if (refreshAttempted || !result) return;
    const parsed = instagramUrlSchema.safeParse(url.trim());
    if (!parsed.success) return;

    setRefreshAttempted(true);
    try {
      const fresh = await extractReel(parsed.data, true);
      setResult(fresh);
    } catch {
      // Silent — user can retry manually via the form
    }
  }

  async function handleDownload() {
    if (!result?.videoUrl) return;
    try {
      // Fetch through our backend proxy — bypasses Instagram CDN CORS.
      // Returns the video as a blob so we can trigger a proper browser download.
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/tools/instagram-reel-downloader/proxy-download`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoUrl: result.videoUrl,
            filename: result.filename || "trndinn-reel.mp4",
          }),
        },
      );

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = result.filename || "trndinn-reel.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Clean up after a short delay to ensure download starts
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: open video URL directly in a new tab
      window.open(result.videoUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <MarketingShell>
      <main className="relative overflow-hidden">
        {/* ==================================================================
            HERO — full viewport, tool as centerpiece, floating decorations
        ================================================================== */}
        <section
          ref={heroRef}
          className="relative flex min-h-[75vh] items-center justify-center px-4 py-14 sm:py-16"
        >
          {/* Background orbs — Instagram gradient palette */}
          <FloatingOrb
            className="left-[-10%] top-[10%] h-[420px] w-[420px]"
            color="radial-gradient(circle, #833AB4 0%, transparent 70%)"
          />
          <FloatingOrb
            className="right-[-8%] top-[20%] h-[380px] w-[380px]"
            color="radial-gradient(circle, #F77737 0%, transparent 70%)"
            delay={3}
          />
          <FloatingOrb
            className="bottom-[-15%] left-[30%] h-[500px] w-[500px]"
            color="radial-gradient(circle, #E1306C 0%, transparent 70%)"
            delay={6}
          />

          {/* Floating doodles — desktop only */}
          <motion.div
            style={shouldReduceMotion ? undefined : { y: yLeft }}
            className="pointer-events-none absolute left-[6%] top-[18%] hidden text-primary/40 lg:block"
          >
            <SparkleGlyph className="h-8 w-8" />
          </motion.div>

          <motion.div
            style={shouldReduceMotion ? undefined : { rotate }}
            className="pointer-events-none absolute right-[8%] top-[22%] hidden text-primary/30 lg:block"
            animate={
              shouldReduceMotion
                ? undefined
                : { rotate: [0, 360] }
            }
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <DottedCircle className="h-16 w-16" />
          </motion.div>

          <motion.div
            style={shouldReduceMotion ? undefined : { y: yRight }}
            className="pointer-events-none absolute right-[12%] top-[62%] hidden text-primary/40 lg:block"
          >
            <FilmStripGlyph className="h-14 w-14" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute left-[10%] top-[70%] hidden text-primary/30 lg:block"
            animate={
              shouldReduceMotion
                ? undefined
                : { rotate: [-8, 8, -8] }
            }
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <CurvedArrow className="h-14 w-24" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute right-[4%] bottom-[20%] hidden text-primary/40 lg:block"
            animate={
              shouldReduceMotion
                ? undefined
                : { y: [0, -10, 0] }
            }
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <SparkleGlyph className="h-6 w-6" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute left-[14%] bottom-[24%] hidden text-primary/30 lg:block"
            animate={
              shouldReduceMotion
                ? undefined
                : { rotate: [0, 20, 0] }
            }
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ZigzagLine className="h-6 w-20" />
          </motion.div>

          {/* CENTER STAGE — the tool */}
          <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            {/* Live pill */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-card/60 px-4 py-1.5 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <InstagramGradientIcon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium tracking-wide text-foreground/80">
                Free · No login · No watermark
              </span>
            </motion.div>

            {/* H1 — big, expressive, gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-tight text-foreground"
            >
              {hero.h1Prefix}{" "}
              <span className="relative inline-block">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #833AB4, #C13584, #E1306C, #F77737)",
                  }}
                >
                  {hero.h1Highlight}
                </span>
                {/* Underline scribble */}
                <motion.svg
                  viewBox="0 0 300 12"
                  className="absolute -bottom-1 left-0 h-3 w-full"
                  fill="none"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M2 8 Q 50 2, 100 6 T 200 6 T 298 8"
                    stroke="url(#underline-grad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 0.6 }}
                  />
                  <defs>
                    <linearGradient
                      id="underline-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#833AB4" />
                      <stop offset="50%" stopColor="#E1306C" />
                      <stop offset="100%" stopColor="#F77737" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
              <br />
              {hero.h1Suffix}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-4 text-sm font-medium uppercase tracking-widest text-primary/80"
            >
              {hero.eyebrow}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              {hero.subline}
            </motion.p>

            {/* Mobile-only quick-flow chip strip — sits just above the input.
                Desktop shows this same flow as full step cards further down. */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mt-6 flex items-center justify-center gap-1 sm:hidden"
              aria-label="Three-step flow: paste, extract, save"
            >
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={`${step.title}-hero-mobile`}
                    className="flex items-center gap-1"
                  >
                    <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 py-1 pl-1 pr-2.5 backdrop-blur-sm">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${
                            i === 0
                              ? "#833AB4, #C13584"
                              : i === 1
                                ? "#C13584, #E1306C"
                                : "#E1306C, #F77737"
                          })`,
                        }}
                      >
                        <Icon className="h-3 w-3" strokeWidth={2.4} />
                      </div>
                      <span className="text-[11px] font-semibold tracking-tight text-foreground">
                        {step.title}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-2.5 w-2.5 shrink-0 text-primary/40"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </motion.div>

            {/* Oversized glowing input */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              onSubmit={handleSubmit}
              className="relative mt-12 w-full max-w-2xl"
              noValidate
            >
              {/* Glowing gradient border wrapper */}
              <div className="group relative">
                {/* Animated gradient glow behind input */}
                <motion.div
                  className="absolute -inset-1 rounded-2xl opacity-70 blur-xl"
                  style={{
                    background:
                      "linear-gradient(90deg, #833AB4, #E1306C, #F77737, #833AB4)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : { backgroundPosition: ["0% 0%", "200% 0%"] }
                  }
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* Actual input container */}
                <div className="relative flex flex-col gap-3 rounded-2xl bg-card p-3 sm:flex-row sm:items-center sm:gap-2 sm:p-2 sm:pl-5">
                  <div className="flex-1">
                    <input
                      ref={inputRef}
                      type="url"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder={placeholder}
                      className={cn(
                        "h-14 w-full bg-transparent px-2 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none sm:text-lg",
                      )}
                      aria-label="Instagram Reel URL"
                      aria-describedby={error ? "url-error" : undefined}
                      disabled={loading}
                      autoComplete="url"
                    />
                  </div>

                  <motion.div
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading || !url.trim()}
                      size="lg"
                      className="h-14 w-full rounded-xl px-8 text-base font-semibold text-white shadow-lg shadow-primary/20 disabled:opacity-50 sm:w-auto"
                      style={{
                        background:
                          "linear-gradient(90deg, #833AB4, #E1306C, #F77737)",
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin text-white" />
                          <span>Fetching…</span>
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-5 w-5 text-white" />
                          <span>{ctaCopy}</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    id="url-error"
                    role="alert"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-4 flex items-start justify-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <span className="text-red-400 dark:text-red-300">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>

            {/* Helper text under input */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground/70"
            >
              Trndinn is a free online <strong className="text-foreground/90">Instagram Reel Downloader</strong>
              {" "}that lets you <strong className="text-foreground/90">download Instagram Reels</strong> in
              original high quality — save Reels to your phone, tablet, or computer
              without watermark. No app install, no login, no signup required.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-2 text-xs text-muted-foreground/50"
            >
              Works with{" "}
              <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">
                /reel/
              </code>{" "}
              ,{" "}
              <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">
                /reels/
              </code>{" "}
              and{" "}
              <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">
                /p/
              </code>{" "}
              URLs · Only public Reels are supported
            </motion.p>

            {/* Result card — dramatic reveal */}
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="mt-10 w-full max-w-md"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-card/60 p-6 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
                      >
                        <Film className="h-5 w-5 text-primary" />
                      </motion.div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground">
                          Sneaking behind the scenes…
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Extracting the video source
                        </p>
                      </div>
                    </div>
                    {/* Shimmer bar */}
                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted/40">
                      <motion.div
                        className="h-full w-1/3 rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, #833AB4, #E1306C, #F77737)",
                        }}
                        animate={{ x: ["-100%", "300%"] }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 30, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="mt-10 w-full max-w-sm"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-card p-1">
                    {/* Gradient border */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-40"
                      style={{
                        background:
                          "linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%)",
                      }}
                    />

                    <div className="relative rounded-2xl bg-card p-4">
                      {/* Real playable video preview.
                          onError auto-retries once with refresh:true if the
                          CDN URL has expired (common with cached results). */}
                      <VideoPlayer
                        src={result.videoUrl}
                        poster={result.thumbnail}
                        title={result.filename || "Instagram Reel"}
                        aspectRatio="9/16"
                        maxWidthClassName="max-w-[300px]"
                        crossOrigin={false}
                        onError={handleVideoError}
                      />

                      {/* Info + download */}
                      <div className="mt-4 flex flex-col items-center gap-3 text-center">
                        <div className="flex items-center gap-2">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 15,
                              delay: 0.2,
                            }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          </motion.div>
                          <span className="text-base font-semibold text-foreground">
                            Ready to download
                          </span>
                        </div>
                        {/* Show caption or author — not the URL */}
                        <p className="max-w-[280px] text-xs text-muted-foreground line-clamp-2">
                          {result.caption
                            ? result.caption
                            : result.author
                              ? `@${result.author}`
                              : "Instagram Reel"}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground/60">
                          {result.filename}
                        </p>
                        <motion.div
                          className="w-full"
                          whileHover={
                            shouldReduceMotion ? undefined : { scale: 1.02 }
                          }
                          whileTap={
                            shouldReduceMotion ? undefined : { scale: 0.98 }
                          }
                        >
                          <Button
                            onClick={handleDownload}
                            size="lg"
                            className="w-full rounded-xl px-8 py-3 text-base font-bold text-white shadow-lg"
                            style={{
                              background:
                                "linear-gradient(90deg, #22c55e, #16a34a)",
                            }}
                          >
                            <Download className="mr-2 h-5 w-5 text-white" />
                            <span>Save MP4</span>
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ==================================================================
            HOW IT WORKS — horizontal timeline with dotted track
        ================================================================== */}
        {/* Desktop-only "Paste → Poof → Save" conveyor-belt strip.
            The mobile version lives directly above the hero input, so we
            hide this section entirely on mobile to save vertical space. */}
        <section className="relative hidden px-4 py-6 sm:block sm:py-10">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative flex items-stretch gap-0 sm:flex-row"
            >
              {/* Dotted track line — exactly at vertical center of icon circles
                   Math: py-12 (3rem top pad) + h-16/2 (2rem half icon) = 5rem from top */}
              <div className="pointer-events-none absolute left-[10%] right-[10%]" style={{ top: "5rem" }}>
                <div className="h-px w-full border-t border-dashed border-primary/25" />
              </div>

              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="group relative flex flex-1 flex-col items-center gap-5 py-12"
                  >
                    {/* Glowing node on the track */}
                    <div className="relative">
                      {/* Pulse ring */}
                      <motion.div
                        className="absolute -inset-3 rounded-full opacity-0 group-hover:opacity-100"
                        style={{
                          background: `radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)`,
                        }}
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : { scale: [1, 1.2, 1] }
                        }
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      />
                      {/* Icon circle */}
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-card ring-4 ring-background">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                          style={{
                            background: `linear-gradient(135deg, ${
                              i === 0
                                ? "#833AB4, #C13584"
                                : i === 1
                                  ? "#C13584, #E1306C"
                                  : "#E1306C, #F77737"
                            })`,
                          }}
                        >
                          <Icon className="h-5 w-5" strokeWidth={2.2} />
                        </div>
                      </div>
                      {/* Step number — small, tucked under */}
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                        {i + 1}
                      </span>
                    </div>

                    {/* Text */}
                    <div className="text-center">
                      <p className="font-display text-lg font-semibold tracking-tight text-foreground">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.caption}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ==================================================================
            HOW TO DOWNLOAD — VISUAL 3-STEP MOCKUP
            Theme-aware phone mockups (light/dark PNGs → AVIF+WebP)
        ================================================================== */}
        <InstaHowToVisual />

        {/* ==================================================================
            HOW TO DOWNLOAD INSTAGRAM REELS — prose steps for SEO indexing
        ================================================================== */}
        <section className="relative px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-3xl">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              How to Download Instagram Reels Online
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-4 text-base leading-relaxed text-muted-foreground"
            >
              Downloading Instagram Reels with Trndinn&apos;s free Instagram
              Reel Downloader takes seconds. No app to install, no account to
              create — just paste a Reel URL and save the video to your device.
            </motion.p>

            <ol className="mt-8 space-y-6">
              <motion.li
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4 }}
                className="flex gap-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
                  1
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-foreground">
                    Copy the Instagram Reel link
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Open the Instagram app or website, find a public Reel you
                    want to download, tap the Share icon and select{" "}
                    <em>Copy Link</em>. This works for any Reel URL, Reels URL,
                    or standard Instagram post URL.
                  </p>
                </div>
              </motion.li>

              <motion.li
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="flex gap-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
                  2
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-foreground">
                    Paste the Reel URL into the downloader
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Come back to this page and paste the Instagram Reel URL
                    into the input field above. Our Instagram video downloader
                    engine extracts the direct MP4 source in under three
                    seconds. Works with{" "}
                    <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">/reel/</code>,{" "}
                    <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">/reels/</code>, and{" "}
                    <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">/p/</code> links.
                  </p>
                </div>
              </motion.li>

              <motion.li
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex gap-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
                  3
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-foreground">
                    Download and save the Instagram Reel
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Click <em>Save MP4</em> to download the Instagram Reel to
                    your device in original high quality, without watermark.
                    The MP4 is saved directly to your Downloads folder or
                    phone gallery — ready to view offline or share anywhere.
                  </p>
                </div>
              </motion.li>
            </ol>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-8 rounded-xl bg-card/50 p-5 text-sm leading-relaxed text-muted-foreground"
            >
              This Instagram Reels downloader works on every device — iPhone,
              iPad, Android phone or tablet, Mac, Windows PC, Chromebook,
              Linux. Because it&apos;s browser-based, there&apos;s no software
              to install and no account to create. Download unlimited Reels
              online in seconds.
            </motion.p>
          </div>
        </section>

        {/* ==================================================================
            FEATURES — checkmark grid (trust + SEO keyword density)
        ================================================================== */}
        <section className="relative px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-4xl">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Why use Trndinn&apos;s{" "}
              <span className="text-primary">Instagram Reel Downloader</span>?
            </motion.h2>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[
                {
                  title: "Original HD quality, without watermark",
                  desc: "Download Instagram Reels in the exact high quality Instagram stores — 720p or 1080p MP4, zero re-encoding, no watermark, no logo stamped on top.",
                },
                {
                  title: "Save Reels on any device",
                  desc: "Mobile, iPhone, iPad, Android, PC, Mac, or tablet. Save Instagram Reels directly to your gallery or Downloads folder — this Instagram Reel Downloader is fully browser-based.",
                },
                {
                  title: "No app install needed",
                  desc: "100% browser-based Instagram Reels downloader. Paste the link, tap download. No APK, no Chrome extension, no Play Store detour.",
                },
                {
                  title: "Always free, no login, no signup",
                  desc: "No account required. No hidden paywalls. This free Instagram Reel Downloader never asks for your Instagram credentials — ever.",
                },
                {
                  title: "Fast Instagram video downloader",
                  desc: "Multi-engine Instagram video downloader extracts most Reels in under 3 seconds. Results are cached for instant repeat downloads.",
                },
                {
                  title: "Download unlimited Reels",
                  desc: "No daily cap on downloads. Use this Instagram Reels downloader to save Reels as often as you like. Fair-use rate limiting keeps the service stable for everyone.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="flex gap-3"
                >
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />
                  <div>
                    <p className="font-medium text-foreground">{feature.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            EDITORIAL SEO CONTENT — flowing, magazine-style, no boxes
        ================================================================== */}
        <section className="relative px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-4xl">
            {/* Section pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-12 flex items-center justify-center gap-2"
            >
              <SparkleGlyph className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                The rundown
              </span>
              <SparkleGlyph className="h-4 w-4 text-primary" />
            </motion.div>

            {/* Lead paragraph — editorial style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <p className="text-2xl font-light leading-[1.5] tracking-tight text-foreground sm:text-3xl sm:leading-[1.4]">
                An{" "}
                <span className="font-display font-semibold">
                  Instagram Reel Downloader
                </span>{" "}
                is a free online tool that lets you{" "}
                <span className="font-display font-semibold">
                  save Instagram Reels
                </span>{" "}
                as MP4 video files — in original high quality, without
                watermark, no compression, no login pop-ups. Trndinn also
                works as an Instagram video downloader for standard posts and
                IGTV, giving you one clean way to download Instagram Reels and
                videos to any device.
              </p>
            </motion.div>

            {/* Decorative divider with doodle */}
            <div className="my-16 flex items-center justify-center gap-4 text-primary/30">
              <div className="h-px w-16 bg-current" />
              <FilmStripGlyph className="h-6 w-6" />
              <div className="h-px w-16 bg-current" />
            </div>

            {/* Why you'd want to do this — scattered layout */}
            <div className="space-y-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 gap-8 sm:grid-cols-[auto_1fr] sm:gap-12"
              >
                <div className="flex sm:pt-2">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #833AB4, #C13584)",
                    }}
                  >
                    <Film className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Repurpose across platforms
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Turn a viral Reel into a TikTok, YouTube Short, or LinkedIn
                    video without re-recording anything. The 9:16 aspect ratio
                    transfers perfectly — same hook, three more platforms, zero
                    extra shooting time.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 gap-8 sm:grid-cols-[1fr_auto] sm:gap-12"
              >
                {/* On mobile: icon first (order-1), text second (order-2)
                    On desktop: text left (sm:order-1), icon right (sm:order-2) */}
                <div className="order-2 sm:order-1 sm:text-right">
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Build a swipe file
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Save competitor Reels or trending formats to study hooks,
                    editing pace, captions, and CTAs. Great creators borrow
                    structure, not scripts.
                  </p>
                </div>
                <div className="order-1 flex sm:order-2 sm:pt-2">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #E1306C, #F77737)",
                    }}
                  >
                    <Zap className="h-6 w-6" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 gap-8 sm:grid-cols-[auto_1fr] sm:gap-12"
              >
                <div className="flex sm:pt-2">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #F77737, #FFDC80)",
                    }}
                  >
                    <InfinityIcon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    Keep it forever
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                    Reels get deleted, accounts get deactivated, apps go down.
                    Download the ones you love — mood boards, client pitches,
                    presentations, offline archives.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Zigzag divider */}
            <div className="my-20 flex items-center justify-center gap-4 text-primary/25">
              <ZigzagLine className="h-4 w-32" />
            </div>

            {/* Quick "is it legal" callout — sidebar style, no box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-[120px_1fr]"
            >
              <p className="font-display text-lg font-medium uppercase tracking-wider text-primary/70">
                Quick take
              </p>
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  Is downloading Reels legal?
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  Personal, non-commercial use is generally fine. Redistributing,
                  re-uploading, or monetizing content you didn&apos;t create can
                  violate copyright and Instagram&apos;s Terms of Service. Always
                  credit the original creator and get permission before
                  commercial use. Common sense stuff — but worth saying.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================
            FAQ — editorial accordion
        ================================================================== */}
        <section className="relative px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-4 flex items-center gap-2"
            >
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Questions people ask
              </span>
              <div className="h-px flex-1 bg-border" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
            >
              Good{" "}
              <span className="italic text-primary">questions</span>,
              honest answers.
            </motion.h2>

            <div className="mt-12">
              {faqs.map((faq, i) => (
                <FaqItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            WHAT IS AN INSTAGRAM REEL DOWNLOADER — AEO definition block
            (targets featured snippets / AI answer engines)
        ================================================================== */}
        <section className="relative px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-3xl">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              What is an Instagram Reel Downloader?
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground"
            >
              <p>
                An <strong className="text-foreground">Instagram Reel
                Downloader</strong> is an online tool that lets you download
                Reels, videos, and photos from Instagram without watermark by
                simply entering the URL of the content you want to save.
                Trndinn&apos;s Instagram Reels downloader extracts the original
                MP4 file in high quality so you can save Instagram Reels
                directly to your device for offline viewing, sharing, or
                repurposing.
              </p>
              <p>
                Since Instagram doesn&apos;t allow you to download Reels
                directly from the app or website, an Instagram Reel Downloader
                like Trndinn fills that gap. You can save any public Reel to
                your phone gallery, tablet, or computer and view it offline
                anytime — no Instagram login required, no watermark added.
              </p>
              <p className="text-sm italic text-muted-foreground/70">
                Note: Downloaded Instagram Reels are for personal, non-commercial
                use only. Always credit the original creator and get permission
                before re-uploading.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================
            USAGE NOTES & DISCLAIMERS
        ================================================================== */}
        <section className="relative px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-3xl space-y-12">
            {/* Rate limiting note */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Fair use &amp; rate limits
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                    <li>
                      • This tool is rate-limited to ensure stability for all
                      users. Aggressive or automated bulk requests will be
                      temporarily blocked.
                    </li>
                    <li>
                      • Only <strong>public Reels</strong> from public accounts
                      can be downloaded. Private account content is not
                      accessible.
                    </li>
                    <li>
                      • Please use a direct Reel link (not a story or DM share
                      link). Copy the URL from the Reel&apos;s share menu or your
                      browser address bar.
                    </li>
                    <li>
                      • If extraction fails, the Reel may be geo-restricted,
                      age-gated, or recently deleted. Try another public Reel.
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* DMCA Compliance */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
                DMCA Compliance
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Trndinn complies with 17 U.S.C. § 512 and the Digital Millennium
                Copyright Act (DMCA). It is our policy to respond to any
                infringement notices and take appropriate actions under the DMCA
                and other applicable intellectual property laws. If your
                copyrighted material has been posted on or linked from our site
                and you want it removed, please{" "}
                <Link href="/legal/dmca" className="text-primary underline underline-offset-2 hover:text-primary/80">
                  contact us
                </Link>{" "}
                with the details required under the DMCA, and we will respond
                promptly.
              </p>
            </motion.div>

            {/* Legal disclaimer */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Disclaimer &amp; Copyright Notice
              </h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  This tool is intended for personal, non-commercial use only.
                  Downloaded videos remain the intellectual property of their
                  original creators. You may not re-upload, redistribute, sell,
                  or monetize downloaded content without explicit permission from
                  the copyright holder.
                </p>
                <p>
                  Trndinn does not host, store, or cache any video content on its
                  servers. The tool acts as a technical intermediary that resolves
                  publicly available media URLs. All content is served directly
                  from Instagram&apos;s CDN infrastructure.
                </p>
                <p>
                  Instagram™ and the Instagram logo are registered trademarks of
                  Meta Platforms, Inc. Trndinn is not affiliated with, endorsed
                  by, or sponsored by Meta or Instagram in any way.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  By using this tool you acknowledge and agree to these terms. If
                  you are a content creator and believe your work is being
                  downloaded without authorization, you may file a DMCA takedown
                  request with Instagram directly.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================
            RELATED TOOLS — floating cards with parallax hover
        ================================================================== */}
        <section className="relative px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-12 flex items-end justify-between gap-8"
            >
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  More freebies
                </p>
                <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Keep exploring
                </h2>
              </div>
              <Link
                href="/tools"
                className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 sm:flex"
              >
                All tools <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {relatedTools.map((tool, i) => (
                <motion.div
                  key={tool.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                >
                  <Link
                    href={tool.live ? `/tools/${tool.slug}` : "/tools"}
                    className="group relative block h-full overflow-hidden rounded-2xl bg-card/50 p-8 transition-colors hover:bg-card"
                  >
                    {/* Gradient reveal on hover */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-10"
                      style={{
                        background:
                          "linear-gradient(135deg, #833AB4, #E1306C, #F77737)",
                      }}
                    />

                    <div className="relative flex h-full flex-col">
                      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                        <SparkleGlyph className="h-5 w-5" />
                      </div>

                      <h3 className="font-display text-xl font-semibold text-foreground">
                        {tool.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {tool.description}
                      </p>

                      <div className="mt-auto pt-6">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                          {tool.live ? "Try it" : "Coming soon"}
                          {tool.live && (
                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            FINAL CTA — big gradient, animated, no card wrapper
        ================================================================== */}
        <section className="relative overflow-hidden px-4 py-16 sm:py-24">
          {/* Decorative curved arrow leading in */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 0.3, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute left-[10%] top-[20%] hidden text-primary lg:block"
          >
            <CurvedArrow className="h-16 w-32 -rotate-12" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute right-[8%] bottom-[15%] hidden text-primary/40 lg:block"
            animate={
              shouldReduceMotion
                ? undefined
                : { rotate: [0, 360] }
            }
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <SparkleGlyph className="h-10 w-10" />
          </motion.div>

          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary">
                Ready for the upgrade?
              </p>
              <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
                Download.{" "}
                <span className="italic text-primary">Remix.</span>{" "}
                <br />
                Schedule. All at once.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Trndinn is what you upgrade to when yanking Reels stops being
                enough. Brand voice, AI captions, cross-platform scheduling — from
                $0.86/mo.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <motion.div
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                >
                  <Button
                    asChild
                    size="lg"
                    className="rounded-xl px-8 py-6 text-base font-semibold text-white shadow-xl shadow-primary/30"
                    style={{
                      background:
                        "linear-gradient(90deg, #833AB4, #E1306C, #F77737)",
                    }}
                  >
                    <Link href="/auth">
                      Start free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="rounded-xl px-8 py-6 text-base font-medium"
                >
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
