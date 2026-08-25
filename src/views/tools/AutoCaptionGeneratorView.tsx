"use client";

import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";
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
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Captions,
  Languages,
  Film,
  ChevronDown,
  FileVideo,
  X,
  ArrowRight,
  Type,
  Palette,
  Wand2,
  VolumeX,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Move,
  Loader2,
} from "lucide-react";
import { Rnd } from "react-rnd";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TOOLS } from "@/lib/tools-data";
import { API_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { analytics } from "@/services/analytics";
import { BlogRelatedPosts } from "@/components/blog/BlogRelatedPosts";
import { CAPTION_COMPETITORS } from "@/lib/caption-competitors";
import { useToolFeedback } from "@/hooks/useToolFeedback";
import { ToolFeedbackCard, ToolFeedbackButton } from "@/components/feedback/ToolFeedbackCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CaptionStyleId = "hormozi" | "mrbeast" | "minimal" | "karaoke" | "typewriter" | "gradient-pop";

interface StyleOption {
  id: CaptionStyleId;
  name: string;
  description: string;
  preview: string;
  gradient: string;
  mockText: string[];
}

interface FAQItem {
  question: string;
  answer: string;
}

interface HeroVariant {
  h1Prefix: string;
  h1Highlight: string;
  h1Suffix: string;
  eyebrow: string;
  subline: string;
}

interface BlogPost {
  id: string;
  path: string;
  title: string;
  excerpt: string;
  featured_image_url?: string;
  published_at?: string;
  reading_minutes?: number;
}

interface Props {
  faqs: FAQItem[];
  heroVariant?: HeroVariant;
  blogPosts?: BlogPost[];
}

type PipelineStage = "idle" | "uploading" | "probing" | "transcribing" | "rendering" | "complete" | "failed";

// ---------------------------------------------------------------------------
// Style presets with visual data
// ---------------------------------------------------------------------------

const STYLES: StyleOption[] = [
  {
    id: "hormozi",
    name: "Hormozi",
    description: "Bold, ALL CAPS, word-by-word yellow highlight",
    preview: "EVERY WORD pops",
    gradient: "from-amber-500 to-orange-600",
    mockText: ["ATTENTION", "IS THE", "NEW CURRENCY"],
  },
  {
    id: "mrbeast",
    name: "MrBeast",
    description: "Chunky white + colored stroke, mixed case",
    preview: "Big chunky text",
    gradient: "from-pink-500 to-purple-600",
    mockText: ["This is", "INSANE"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean light-weight, soft shadow, bottom-third",
    preview: "Clean and simple",
    gradient: "from-slate-400 to-slate-600",
    mockText: ["less is more"],
  },
  {
    id: "karaoke",
    name: "Karaoke",
    description: "Full line visible, active word in color",
    preview: "Follow along",
    gradient: "from-cyan-400 to-blue-500",
    mockText: ["follow", "the", "rhythm"],
  },
  {
    id: "typewriter",
    name: "Typewriter",
    description: "Monospace, letter-by-letter reveal",
    preview: "Type it out...",
    gradient: "from-emerald-400 to-teal-600",
    mockText: ["typing_"],
  },
  {
    id: "gradient-pop",
    name: "Gradient Pop",
    description: "Bold gradient text, bounce & scale pop",
    preview: "Pop & bounce",
    gradient: "from-rose-500 via-fuchsia-500 to-violet-500",
    mockText: ["GO VIRAL"],
  },
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
  <svg viewBox="0 0 100 60" className={className} fill="none" aria-hidden="true">
    <path
      d="M5 30 Q 30 5, 60 25 T 95 30"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
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

const WaveformGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 24" className={className} fill="none" aria-hidden="true">
    <rect x="2" y="8" width="3" height="8" rx="1.5" fill="currentColor" />
    <rect x="8" y="4" width="3" height="16" rx="1.5" fill="currentColor" />
    <rect x="14" y="6" width="3" height="12" rx="1.5" fill="currentColor" />
    <rect x="20" y="2" width="3" height="20" rx="1.5" fill="currentColor" />
    <rect x="26" y="5" width="3" height="14" rx="1.5" fill="currentColor" />
    <rect x="32" y="7" width="3" height="10" rx="1.5" fill="currentColor" />
  </svg>
);

const ZigzagLine = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 20" className={className} fill="none" aria-hidden="true">
    <path
      d="M2 10 L 12 4 L 22 16 L 32 4 L 42 16 L 52 4 L 62 16 L 72 4 L 78 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CaptionBubble = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 32" className={className} fill="none" aria-hidden="true">
    <rect x="2" y="2" width="36" height="22" rx="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 24 L 14 28 L 18 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="8" y1="10" x2="24" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
// FAQ Accordion Item
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
// Steps data
// ---------------------------------------------------------------------------

const STEPS = [
  {
    icon: Upload,
    title: "Upload",
    caption: "Drop your video file",
    accent: "from-amber-500 to-orange-500",
  },
  {
    icon: Languages,
    title: "Transcribe",
    caption: "AI detects speech in 99+ languages",
    accent: "from-orange-500 to-rose-500",
  },
  {
    icon: Palette,
    title: "Style",
    caption: "Pick your caption vibe",
    accent: "from-rose-500 to-pink-500",
  },
  {
    icon: Download,
    title: "Download",
    caption: "Captioned MP4 ready to post",
    accent: "from-pink-500 to-purple-500",
  },
];

// ---------------------------------------------------------------------------
// Stats data
// ---------------------------------------------------------------------------

const STATS = [
  { value: "85%", label: "of videos watched on mute", source: "Verizon Digital Media, 2019" },
  { value: "80%", label: "higher engagement with captions", source: "Facebook Business, 2016" },
  { value: "12%", label: "longer watch time", source: "Facebook IQ, 2019" },
  { value: "92%", label: "watch mobile video silently", source: "Verizon/Publicis, 2019" },
];

// ---------------------------------------------------------------------------
// FlipWord — cycles between "captions" and "subtitles" on the primary page
// to capture both keyword intents. Same pattern as ToolsHubView.
// ---------------------------------------------------------------------------

const CAPTION_FLIP_WORDS = ["captions", "subtitles"];
const CAPTION_FLIP_INTERVAL_MS = 2500;

function CaptionFlipWord() {
  const [index, setIndex] = useState(0);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % CAPTION_FLIP_WORDS.length);
    }, CAPTION_FLIP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  if (shouldReduce) {
    return <span className="text-gradient-brand">{CAPTION_FLIP_WORDS[index]}</span>;
  }

  return (
    <span className="inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={CAPTION_FLIP_WORDS[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-gradient-brand inline-block"
        >
          {CAPTION_FLIP_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main View
// ---------------------------------------------------------------------------

export default function AutoCaptionGeneratorView({ faqs, heroVariant, blogPosts }: Props) {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [styleId, setStyleId] = useState<CaptionStyleId>("hormozi");
  const [stage, setStage] = useState<PipelineStage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [srtContent, setSrtContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const feedback = useToolFeedback("auto-caption-generator", stage === "complete" || stage === "failed");
  const [isDragging, setIsDragging] = useState(false);

  // Caption position editor state
  const [objectPath, setObjectPath] = useState<string | null>(null);
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [frameLoading, setFrameLoading] = useState(false);
  const [captionPosition, setCaptionPosition] = useState({ x: 50, y: 80 }); // percentage
  const [fontSize, setFontSize] = useState(18);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Hero copy (default or alias variant)
  const hero: HeroVariant = heroVariant ?? {
    h1Prefix: "Add",
    h1Highlight: "viral captions",
    h1Suffix: "to any video.",
    eyebrow: "Free Auto Caption Generator — no login, no watermark",
    subline: "Upload your video. Pick a trending style. AI transcribes and burns styled captions directly into the MP4. Done.",
  };

  // Parallax scroll effect for hero decorations
  const { scrollY } = useScroll();
  const yLeft = useTransform(scrollY, [0, 500], [0, -60]);
  const yRight = useTransform(scrollY, [0, 500], [0, 40]);
  const rotate = useTransform(scrollY, [0, 500], [0, 30]);

  // File drop handler
  const handleFile = useCallback((f: File) => {
    const validTypes = ["video/mp4", "video/quicktime", "video/webm"];
    if (!validTypes.includes(f.type)) {
      setError("Unsupported format. Please upload MP4, MOV, or WebM.");
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setError("File too large (max 100 MB).");
      return;
    }
    setFile(f);
    setError(null);
    setDownloadUrl(null);
    setSrtContent(null);
    setStage("idle");
    setObjectPath(null);
    setFrameUrl(null);
    analytics.captionVideoUploaded({ file_size_mb: +(f.size / (1024 * 1024)).toFixed(2) });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Upload file and fetch first frame for position editor
  const handleUploadForFrame = useCallback(async () => {
    if (!file || objectPath) return;
    setFrameLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${API_CONFIG.BASE_URL}/api/tools/auto-caption-generator/upload`, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }
      const { objectPath: path } = await uploadRes.json();
      setObjectPath(path);

      // Fetch the first frame
      const frameRes = await fetch(
        `${API_CONFIG.BASE_URL}/api/tools/auto-caption-generator/frame?path=${encodeURIComponent(path)}`,
        { headers: { 'ngrok-skip-browser-warning': 'true' } }
      );
      if (frameRes.ok) {
        const blob = await frameRes.blob();
        setFrameUrl(URL.createObjectURL(blob));
      }
    } catch (err: any) {
      // Non-blocking — position editor just won't show frame
      console.warn("Frame fetch failed:", err.message);
    } finally {
      setFrameLoading(false);
    }
  }, [file, objectPath]);

  // Analytics: page view
  useEffect(() => {
    analytics.captionPageViewed();
  }, []);

  // Trigger frame upload when file is selected
  useEffect(() => {
    if (file && !objectPath && stage === "idle") {
      handleUploadForFrame();
    }
  }, [file, objectPath, stage, handleUploadForFrame]);

  // Generate captions
  const handleGenerate = async () => {
    if (!file) return;
    setError(null);
    setStage("uploading");
    setProgress(5);
    const startTime = Date.now();
    analytics.captionGenerationStarted();

    try {
      let path = objectPath;

      // If we don't have an objectPath yet (upload failed earlier), try again
      if (!path) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(`${API_CONFIG.BASE_URL}/api/tools/auto-caption-generator/upload`, {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.message || "Upload failed");
        }
        const uploadData = await uploadRes.json();
        path = uploadData.objectPath;
        setObjectPath(path);
      }

      // Step 2: Submit generate job with position data
      setStage("probing");
      setProgress(25);
      const genRes = await fetch(`${API_CONFIG.BASE_URL}/api/tools/auto-caption-generator/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputPath: path,
          styleId,
          fontSize,
          marginV: Math.round((100 - captionPosition.y) / 100 * 1280),
          alignment: alignment === 'left' ? 1 : alignment === 'center' ? 2 : 3,
        }),
      });

      const genData = await genRes.json();

      if (!genRes.ok) {
        throw new Error(genData.message || genData.reason || "Generation failed");
      }

      // Cached result — instant
      if (genData.cached) {
        setDownloadUrl(genData.downloadUrl);
        setStage("complete");
        setProgress(100);
        analytics.captionGenerationCompleted({ duration_ms: Date.now() - startTime });
        return;
      }

      // Step 4: Poll for progress
      const jobId = genData.jobId;
      setStage("transcribing");
      setProgress(40);

      await pollProgress(jobId);
      analytics.captionGenerationCompleted({ duration_ms: Date.now() - startTime });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setStage("failed");
      analytics.captionGenerationFailed({ error_type: "generation_error", message: err.message });
    }
  };

  const pollProgress = async (jobId: string) => {
    const maxAttempts = 120;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 500));

      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/tools/auto-caption-generator/result/${jobId}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setDownloadUrl(data.downloadUrl);
            setSrtContent(data.srtContent || null);
            setStage("complete");
            setProgress(100);
            return;
          }
        } else if (res.status === 404) {
          const p = Math.min(90, 40 + i * 0.8);
          setProgress(p);
          if (i > 20) setStage("rendering");
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Processing failed");
        }
      } catch (err: any) {
        if (err.message && err.message !== "Processing failed") continue;
        throw err;
      }
    }
    throw new Error("Processing timed out. Please try again.");
  };

  const handleReset = () => {
    setFile(null);
    setStage("idle");
    setProgress(0);
    setError(null);
    setDownloadUrl(null);
    setSrtContent(null);
    setObjectPath(null);
    setFrameUrl(null);
    setFrameLoading(false);
    setCaptionPosition({ x: 50, y: 80 });
    setFontSize(18);
    setAlignment('center');
  };

  const handleDownloadSrt = () => {
    if (!srtContent) return;
    analytics.captionDownloadClicked("srt");
    const blob = new Blob([srtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trndinn-captions-${styleId}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Related tools
  const relatedTools = TOOLS.filter(
    (t) => t.slug !== "auto-caption-generator" && t.live
  ).slice(0, 3);

  return (
    <MarketingShell>
      <main className="relative overflow-hidden">
        {/* ==================================================================
            HERO — full viewport, tool as centerpiece, floating decorations
        ================================================================== */}
        <section
          ref={heroRef}
          className="relative flex min-h-[80vh] items-center justify-center px-4 py-14 sm:py-16"
        >
          {/* Background orbs — warm orange/amber/pink palette */}
          <FloatingOrb
            className="left-[-10%] top-[10%] h-[420px] w-[420px]"
            color="radial-gradient(circle, hsl(21 95% 56%) 0%, transparent 70%)"
          />
          <FloatingOrb
            className="right-[-8%] top-[20%] h-[380px] w-[380px]"
            color="radial-gradient(circle, hsl(35 95% 60%) 0%, transparent 70%)"
            delay={3}
          />
          <FloatingOrb
            className="bottom-[-15%] left-[30%] h-[500px] w-[500px]"
            color="radial-gradient(circle, hsl(340 70% 55%) 0%, transparent 70%)"
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
            animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <DottedCircle className="h-16 w-16" />
          </motion.div>

          <motion.div
            style={shouldReduceMotion ? undefined : { y: yRight }}
            className="pointer-events-none absolute right-[12%] top-[62%] hidden text-primary/40 lg:block"
          >
            <CaptionBubble className="h-14 w-14" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute left-[10%] top-[70%] hidden text-primary/30 lg:block"
            animate={shouldReduceMotion ? undefined : { rotate: [-8, 8, -8] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <CurvedArrow className="h-14 w-24" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute right-[4%] bottom-[20%] hidden text-primary/40 lg:block"
            animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <WaveformGlyph className="h-8 w-12" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute left-[14%] bottom-[24%] hidden text-primary/30 lg:block"
            animate={shouldReduceMotion ? undefined : { rotate: [0, 20, 0] }}
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
              <Captions className="h-3.5 w-3.5 text-primary" />
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
                {/* Primary page: animated flip between "captions" / "subtitles". Alias pages: static highlight. */}
                {heroVariant ? (
                  <span className="text-gradient-brand">
                    {hero.h1Highlight}
                  </span>
                ) : (
                  <>
                    <span className="text-gradient-brand">viral </span>
                    <CaptionFlipWord />
                  </>
                )}
                {/* Underline scribble */}
                <motion.svg
                  viewBox="0 0 300 12"
                  className="absolute -bottom-1 left-0 h-3 w-full"
                  fill="none"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M2 8 Q 50 2, 100 6 T 200 6 T 298 8"
                    stroke="url(#caption-underline-grad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 0.6 }}
                  />
                  <defs>
                    <linearGradient
                      id="caption-underline-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="hsl(35 95% 60%)" />
                      <stop offset="50%" stopColor="hsl(21 95% 56%)" />
                      <stop offset="100%" stopColor="hsl(340 70% 55%)" />
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

            {/* Mobile-only quick-flow chip strip */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-1 sm:hidden"
              aria-label="Four-step flow: upload, transcribe, style, download"
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
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm",
                          step.accent
                        )}
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

            {/* ─── Upload Zone with Glass Effect ─────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative mt-12 w-full max-w-2xl"
            >
              {/* Glowing gradient border wrapper */}
              <div className="group relative">
                {/* Animated gradient glow behind card */}
                <motion.div
                  className="absolute -inset-1 rounded-2xl opacity-70 blur-xl"
                  style={{
                    background:
                      "linear-gradient(90deg, hsl(35 95% 60%), hsl(21 95% 56%), hsl(340 70% 55%), hsl(35 95% 60%))",
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

                {/* Actual tool container */}
                <div className="glass relative rounded-2xl p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    {/* Upload dropzone state */}
                    {!file && stage === "idle" && (
                      <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          "relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300",
                          isDragging
                            ? "border-primary bg-primary/5"
                            : "border-border/60 hover:border-primary/40"
                        )}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm"
                          className="hidden"
                          onChange={(e) =>
                            e.target.files?.[0] && handleFile(e.target.files[0])
                          }
                        />

                        <motion.div
                          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
                          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Upload className="h-7 w-7 text-primary" />
                        </motion.div>

                        <p className="font-display text-lg font-semibold text-foreground">
                          {isDragging ? "Drop it like it's hot" : "Drop your video here"}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          or click to browse
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground/70">
                          <span className="rounded-full bg-muted/50 px-2.5 py-1">MP4</span>
                          <span className="rounded-full bg-muted/50 px-2.5 py-1">MOV</span>
                          <span className="rounded-full bg-muted/50 px-2.5 py-1">WebM</span>
                          <span className="rounded-full bg-muted/50 px-2.5 py-1">Up to 1.5 min</span>
                          <span className="rounded-full bg-muted/50 px-2.5 py-1">Max 100 MB</span>
                        </div>
                      </motion.div>
                    )}

                    {/* File selected — style picker + position editor */}
                    {file && stage === "idle" && (
                      <motion.div
                        key="style-picker"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* File info bar */}
                        <div className="flex items-center gap-3 rounded-xl bg-card/80 p-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <FileVideo className="h-6 w-6 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                          <button
                            onClick={handleReset}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Style picker grid */}
                        <div>
                          <p className="mb-3 text-sm font-medium text-foreground">
                            Pick your caption style
                          </p>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {STYLES.map((s) => (
                              <motion.button
                                key={s.id}
                                onClick={() => { setStyleId(s.id); analytics.captionStyleSelected(s.id); }}
                                whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                                className={cn(
                                  "relative overflow-hidden rounded-xl p-3 text-left transition-all",
                                  styleId === s.id
                                    ? "bg-card ring-2 ring-primary"
                                    : "bg-card/60 hover:bg-card"
                                )}
                              >
                                {/* Mini caption preview — matches actual style rendering */}
                                <div className="mb-3 flex h-12 items-center justify-center rounded-lg bg-[#0a0a12]">
                                  {s.id === "hormozi" && (
                                    <span
                                      className="font-sans text-[11px] font-black uppercase"
                                      style={{
                                        color: "#FFD700",
                                        textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                                      }}
                                    >
                                      EVERY WORD
                                    </span>
                                  )}
                                  {s.id === "mrbeast" && (
                                    <span
                                      className="font-sans text-[12px] font-black"
                                      style={{
                                        color: "#FFF",
                                        textShadow: "-1.5px -1.5px 0 #E91E8C, 1.5px -1.5px 0 #E91E8C, -1.5px 1.5px 0 #E91E8C, 1.5px 1.5px 0 #E91E8C",
                                      }}
                                    >
                                      INSANE
                                    </span>
                                  )}
                                  {s.id === "minimal" && (
                                    <span
                                      className="font-sans text-[11px] font-light text-white/80"
                                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                                    >
                                      less is more
                                    </span>
                                  )}
                                  {s.id === "karaoke" && (
                                    <span className="font-sans text-[11px] font-semibold">
                                      <span className="text-white/40">follow </span>
                                      <span style={{ color: "hsl(21, 95%, 56%)" }}>the</span>
                                      <span className="text-white/40"> rhythm</span>
                                    </span>
                                  )}
                                  {s.id === "typewriter" && (
                                    <span
                                      className="text-[11px] text-emerald-300"
                                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    >
                                      typing<span className="animate-pulse">_</span>
                                    </span>
                                  )}
                                  {s.id === "gradient-pop" && (
                                    <span className={cn("bg-gradient-to-r bg-clip-text font-sans text-[13px] font-black text-transparent", s.gradient)}>
                                      GO VIRAL
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-semibold text-foreground">{s.name}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                                  {s.description}
                                </p>
                                {styleId === s.id && (
                                  <motion.div
                                    layoutId="style-check"
                                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"
                                  >
                                    <Check className="h-3 w-3" />
                                  </motion.div>
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* ─── Caption Position Editor ─────────────────────── */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Move className="h-4 w-4 text-primary" />
                            <p className="text-sm font-medium text-foreground">
                              Position your captions
                            </p>
                          </div>

                          {/* Video frame preview with draggable caption */}
                          <div className="flex justify-center">
                            <div
                              ref={previewContainerRef}
                              className="relative aspect-[9/16] max-h-[500px] w-full max-w-[281px] overflow-hidden rounded-xl bg-black"
                            >
                              {/* Frame image or loading/placeholder */}
                              {frameLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                              )}
                              {frameUrl && (
                                <img
                                  src={frameUrl}
                                  alt="Video first frame preview"
                                  className="absolute inset-0 h-full w-full object-cover"
                                />
                              )}
                              {!frameUrl && !frameLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#0a0a12]">
                                  <Film className="h-8 w-8 text-muted-foreground/40" />
                                </div>
                              )}

                              {/* Safe zone overlays — shows where platform UI covers content */}
                              {/* Top safe zone (status bar, back button, username) */}
                              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[15%] items-start justify-between px-3 pt-3">
                                <div className="rounded bg-white/10 px-2 py-1 backdrop-blur-sm">
                                  <span className="text-[8px] text-white/50">⚠️ Top safe zone</span>
                                </div>
                                <div className="h-3 w-8 rounded-full bg-white/10" />
                              </div>
                              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[15%] bg-gradient-to-b from-black/20 to-transparent" />

                              {/* Bottom safe zone (caption area, like/comment/share buttons, description) */}
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex h-[20%] items-end justify-between px-3 pb-3">
                                <div className="flex flex-col gap-1">
                                  <div className="h-2 w-16 rounded bg-white/10" />
                                  <div className="h-2 w-24 rounded bg-white/10" />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                  <div className="h-4 w-4 rounded-full bg-white/10" />
                                  <div className="h-4 w-4 rounded-full bg-white/10" />
                                  <div className="h-4 w-4 rounded-full bg-white/10" />
                                </div>
                              </div>
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[20%] bg-gradient-to-t from-black/20 to-transparent" />

                              {/* Draggable caption overlay */}
                              {previewContainerRef.current && (
                                <Rnd
                                  bounds="parent"
                                  enableResizing={false}
                                  position={{
                                    x: (captionPosition.x / 100) * (previewContainerRef.current?.offsetWidth ?? 281) - ((previewContainerRef.current?.offsetWidth ?? 281) * 0.9) / 2,
                                    y: (captionPosition.y / 100) * (previewContainerRef.current?.offsetHeight ?? 500),
                                  }}
                                  onDragStop={(_e, d) => {
                                    const container = previewContainerRef.current;
                                    if (!container) return;
                                    const captionWidth = container.offsetWidth * 0.9;
                                    const xCenter = d.x + captionWidth / 2;
                                    const xPercent = Math.max(0, Math.min(100, (xCenter / container.offsetWidth) * 100));
                                    const yPercent = Math.max(0, Math.min(100, (d.y / container.offsetHeight) * 100));
                                    setCaptionPosition({ x: xPercent, y: yPercent });
                                  }}
                                  className="group/rnd z-30"
                                  style={{ width: '90%' }}
                                  size={{ width: '90%', height: 'auto' }}
                                >
                                  <div
                                    className={cn(
                                      "cursor-grab rounded-lg border border-transparent px-3 py-2 transition-colors active:cursor-grabbing group-hover/rnd:border-primary/50",
                                    )}
                                    style={{
                                      textAlign: alignment,
                                      fontSize: `${fontSize}px`,
                                    }}
                                  >
                                    {/* Each style rendered exactly like the style card preview above */}
                                    {styleId === 'hormozi' && (
                                      <span
                                        className="font-sans font-black uppercase"
                                        style={{
                                          color: '#FFD700',
                                          textShadow: '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000',
                                        }}
                                      >
                                        SAMPLE CAPTION TEXT
                                      </span>
                                    )}
                                    {styleId === 'mrbeast' && (
                                      <span
                                        className="font-sans font-black"
                                        style={{
                                          color: '#FFFFFF',
                                          textShadow: '-2px -2px 0 #E91E8C, 2px -2px 0 #E91E8C, -2px 2px 0 #E91E8C, 2px 2px 0 #E91E8C',
                                        }}
                                      >
                                        Sample caption text
                                      </span>
                                    )}
                                    {styleId === 'minimal' && (
                                      <span
                                        className="font-sans font-light"
                                        style={{
                                          color: 'rgba(255,255,255,0.8)',
                                          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                                        }}
                                      >
                                        Sample caption text
                                      </span>
                                    )}
                                    {styleId === 'karaoke' && (
                                      <span className="font-sans font-semibold">
                                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Sample </span>
                                        <span style={{ color: 'hsl(21, 95%, 56%)' }}>caption</span>
                                        <span style={{ color: 'rgba(255,255,255,0.4)' }}> text</span>
                                      </span>
                                    )}
                                    {styleId === 'typewriter' && (
                                      <span
                                        className="text-emerald-300"
                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                      >
                                        Sample caption text<span className="animate-pulse">_</span>
                                      </span>
                                    )}
                                    {styleId === 'gradient-pop' && (
                                      <span
                                        className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text font-sans font-black uppercase text-transparent"
                                      >
                                        SAMPLE CAPTION TEXT
                                      </span>
                                    )}
                                  </div>
                                </Rnd>
                              )}
                            </div>
                          </div>

                          {/* Drag hint */}
                          <p className="text-center text-xs text-muted-foreground/70">
                            Drag to position your captions on the video
                          </p>

                          {/* Controls row: font size slider + alignment toggle */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                            {/* Font size slider */}
                            <div className="flex flex-1 items-center gap-3">
                              <label
                                htmlFor="caption-font-size"
                                className="shrink-0 text-xs font-medium text-muted-foreground"
                              >
                                Size
                              </label>
                              <Slider
                                id="caption-font-size"
                                min={12}
                                max={28}
                                step={1}
                                value={[fontSize]}
                                onValueChange={(val) => setFontSize(val[0])}
                                className="flex-1"
                                aria-label="Caption font size"
                              />
                              <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                                {fontSize}
                              </span>
                            </div>

                            {/* Alignment toggle group */}
                            <ToggleGroup
                              type="single"
                              value={alignment}
                              onValueChange={(val) => {
                                if (val) setAlignment(val as 'left' | 'center' | 'right');
                              }}
                              className="shrink-0"
                              aria-label="Caption text alignment"
                            >
                              <ToggleGroupItem value="left" aria-label="Align left" className="h-9 w-9 p-0">
                                <AlignLeft className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="center" aria-label="Align center" className="h-9 w-9 p-0">
                                <AlignCenter className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="right" aria-label="Align right" className="h-9 w-9 p-0">
                                <AlignRight className="h-4 w-4" />
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                        </div>

                        {/* Generate button */}
                        <motion.div
                          whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                        >
                          <Button
                            size="lg"
                            onClick={handleGenerate}
                            className="h-14 w-full rounded-xl text-base font-semibold text-white shadow-lg shadow-primary/20"
                            style={{
                              background:
                                "linear-gradient(90deg, hsl(35 95% 60%), hsl(21 95% 56%), hsl(340 70% 55%))",
                            }}
                          >
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generate Captions
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Processing state */}
                    {(stage === "uploading" || stage === "probing" || stage === "transcribing" || stage === "rendering") && (
                      <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-5 py-6"
                      >
                        {/* Simple, elegant status */}
                        <div className="flex flex-col items-center gap-5 text-center">
                          {/* Pulsing icon — no spinning, just a gentle breathe */}
                          <motion.div
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
                          >
                            {stage === "uploading" && <Upload className="h-6 w-6 text-primary" />}
                            {stage === "probing" && <Film className="h-6 w-6 text-primary" />}
                            {stage === "transcribing" && <Languages className="h-6 w-6 text-primary" />}
                            {stage === "rendering" && <Wand2 className="h-6 w-6 text-primary" />}
                          </motion.div>

                          <div>
                            <p className="font-heading text-base font-semibold text-foreground">
                              {stage === "uploading" && "Uploading your video..."}
                              {stage === "probing" && "Analyzing video..."}
                              {stage === "transcribing" && "AI is transcribing audio..."}
                              {stage === "rendering" && "Burning captions into video..."}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Usually 15–30 seconds • Don't close this tab
                            </p>
                          </div>
                        </div>

                        {/* Smooth continuous progress bar */}
                        <div className="mx-auto w-full max-w-xs">
                          <div className="relative h-1.5 overflow-hidden rounded-full bg-muted/30">
                            <motion.div
                              className="absolute inset-y-0 left-0 rounded-full bg-primary"
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                            {/* Subtle shimmer overlay */}
                            <motion.div
                              className="absolute inset-y-0 w-16 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              animate={{ x: ["-64px", "320px"] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                          </div>
                          <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
                            {Math.round(progress)}%
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Complete state — celebrate */}
                    {stage === "complete" && downloadUrl && (
                      <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6 py-4 text-center"
                      >
                        {/* Celebration icon with sparkles */}
                        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10"
                          >
                            <CheckCircle2 className="h-9 w-9 text-emerald-500" />
                          </motion.div>
                          {/* Floating sparkles */}
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute text-amber-400"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0.5, 1, 0.5],
                                x: [0, (i % 2 === 0 ? 1 : -1) * 30],
                                y: [0, -20 - i * 10],
                              }}
                              transition={{
                                duration: 1.2,
                                delay: 0.2 + i * 0.1,
                                ease: "easeOut",
                              }}
                            >
                              <SparkleGlyph className="h-4 w-4" />
                            </motion.div>
                          ))}
                        </div>

                        <div>
                          <p className="font-display text-xl font-bold text-foreground">
                            Captions burned successfully!
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Your video is ready to download
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <motion.div
                            className="flex-1"
                            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                          >
                            <Button
                              asChild
                              size="lg"
                              className="h-14 w-full rounded-xl text-base font-semibold text-white shadow-lg"
                              style={{
                                background: "linear-gradient(90deg, #22c55e, #16a34a)",
                              }}
                            >
                              <a href={downloadUrl} download onClick={() => analytics.captionDownloadClicked("mp4")}>
                                <Download className="mr-2 h-5 w-5" />
                                Download MP4
                              </a>
                            </Button>
                          </motion.div>
                          {srtContent && (
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={handleDownloadSrt}
                              className="h-14 rounded-xl text-base"
                            >
                              <Captions className="mr-2 h-5 w-5" />
                              Download SRT
                            </Button>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleReset}
                          className="mx-auto"
                        >
                          Caption another video
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mt-4 overflow-hidden rounded-xl border border-destructive/20 bg-card p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{error}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              This can happen if the video has no clear audio or if processing takes too long.
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReset}
                          className="mt-3 w-full"
                        >
                          <ArrowRight className="mr-2 h-3 w-3 rotate-180" />
                          Try again with a different video
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Tool Feedback — appears after complete or failed */}
            {(stage === "complete" || stage === "failed") && (
              <div className="flex flex-col items-center gap-3 mt-4">
                <ToolFeedbackCard
                  toolSlug="auto-caption-generator"
                  toolName="Auto Caption Generator"
                  visible={feedback.showCard}
                  onDismiss={feedback.dismiss}
                  onSubmit={feedback.submit}
                  submitting={feedback.submitting}
                  mode="auto"
                />
                {feedback.showButton && (
                  <ToolFeedbackButton onClick={feedback.openManual} />
                )}
              </div>
            )}

            {/* Helper text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground/70"
            >
              <strong className="text-foreground/90">Trndinn Auto Caption Generator</strong>{" "}
              adds trending caption styles to any video — Hormozi-style word-by-word reveals,
              MrBeast chunky highlights, and more. AI transcribes in 99+ languages.
            </motion.p>
          </div>
        </section>

        {/* ==================================================================
            HOW IT WORKS — horizontal timeline with dotted track
        ================================================================== */}
        <section className="relative hidden px-4 py-6 sm:block sm:py-10">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative flex items-stretch gap-0 sm:flex-row"
            >
              {/* Dotted track line */}
              <div
                className="pointer-events-none absolute left-[10%] right-[10%]"
                style={{ top: "5rem" }}
              >
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
                        animate={shouldReduceMotion ? undefined : { scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                      />
                      {/* Icon circle */}
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-card ring-4 ring-background">
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-white",
                            step.accent
                          )}
                        >
                          <Icon className="h-5 w-5" strokeWidth={2.2} />
                        </div>
                      </div>
                      {/* Step number */}
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
            ENTITY-FIRST TL;DR — AEO first 150 words
        ================================================================== */}
        <section className="relative px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <p className="text-2xl font-light leading-[1.5] tracking-tight text-foreground sm:text-3xl sm:leading-[1.4]">
                <span className="font-display font-semibold">Trndinn Auto Caption Generator</span>{" "}
                is a free browser tool that adds{" "}
                <span className="font-display font-semibold">auto-synced, styled captions</span>{" "}
                to any short-form video in under 30 seconds. Upload a video (up to 1.5 minutes),
                pick a style (Hormozi, MrBeast, Minimal, Karaoke, Typewriter, Gradient Pop),
                and download the captioned MP4 — no login, no watermark, no software install.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================
            WHY CAPTIONS MATTER — Bento grid stats
        ================================================================== */}
        <section className="relative px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-8 flex items-center gap-2"
            >
              <VolumeX className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                The silent majority
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Why captions{" "}
              <span className="italic text-primary">matter</span>
            </motion.h2>

            {/* Bento grid */}
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                  className="group relative overflow-hidden rounded-2xl bg-card/50 p-6 transition-colors hover:bg-card"
                >
                  {/* Gradient accent on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="relative">
                    <p className="font-display text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      {stat.source}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mt-8 text-base leading-relaxed text-muted-foreground"
            >
              80% of people are more likely to watch a full video when captions are available{" "}
              <span className="text-muted-foreground/60">[3PlayMedia, 2022]</span>.
              Captions aren&apos;t just an accessibility feature — they&apos;re a{" "}
              <strong className="text-foreground">growth lever</strong>.
            </motion.p>
          </div>
        </section>

        {/* ==================================================================
            CAPTION STYLE GALLERY — visual preview cards
        ================================================================== */}
        <section className="relative px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-4 flex items-center gap-2"
            >
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Style gallery
              </span>
              <div className="h-px flex-1 bg-border" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              6 trending caption styles
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-3 text-base text-muted-foreground"
            >
              Each style is designed to match the aesthetic of top creators and maximize retention.
            </motion.p>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {STYLES.map((style, i) => (
                <motion.div
                  key={style.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                  className="group relative overflow-hidden rounded-2xl bg-card/50 transition-colors hover:bg-card"
                >
                  {/* Mock video preview area — 9:16 feel */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#0a0a0f]">
                    {/* Subtle video gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#0f0f1a] to-[#0a0a12]" />
                    {/* Subtle waveform bars to indicate audio/video content */}
                    <div className="absolute inset-x-0 top-1/3 flex items-end justify-center gap-[3px] opacity-[0.08]">
                      {[20, 35, 28, 42, 18, 32, 24, 38, 22, 30, 26, 36, 20, 34, 28].map((h, i) => (
                        <div key={i} className="w-[3px] rounded-full bg-white" style={{ height: `${h}px` }} />
                      ))}
                    </div>

                    {/* === Per-style caption rendering === */}
                    <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center px-4">
                      {/* Hormozi: Yellow text, black outline, ALL CAPS, bold, word highlight */}
                      {style.id === "hormozi" && (
                        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                          {style.mockText.map((word, wi) => (
                            <span
                              key={wi}
                              className="font-sans text-[15px] font-black uppercase tracking-wide"
                              style={{
                                color: wi === 1 ? "#000" : "#FFD700",
                                backgroundColor: wi === 1 ? "#FFD700" : "transparent",
                                padding: wi === 1 ? "2px 8px" : "0",
                                borderRadius: wi === 1 ? "4px" : "0",
                                textShadow: wi !== 1
                                  ? "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000"
                                  : "none",
                              }}
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* MrBeast: White chunky text, colored stroke, large */}
                      {style.id === "mrbeast" && (
                        <div className="flex flex-wrap items-center justify-center gap-x-2">
                          {style.mockText.map((word, wi) => (
                            <span
                              key={wi}
                              className="font-sans text-[18px] font-black"
                              style={{
                                color: "#FFFFFF",
                                textShadow:
                                  "-2px -2px 0 #E91E8C, 2px -2px 0 #E91E8C, -2px 2px 0 #E91E8C, 2px 2px 0 #E91E8C, 0 0 8px rgba(233,30,140,0.4)",
                              }}
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Minimal: Clean, light, soft shadow, lowercase */}
                      {style.id === "minimal" && (
                        <span
                          className="font-sans text-[14px] font-light tracking-wide text-white/90"
                          style={{
                            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                          }}
                        >
                          {style.mockText.join(" ")}
                        </span>
                      )}

                      {/* Karaoke: Full line visible, active word highlighted */}
                      {style.id === "karaoke" && (
                        <div className="flex items-center gap-x-2">
                          {style.mockText.map((word, wi) => (
                            <span
                              key={wi}
                              className="font-sans text-[15px] font-semibold"
                              style={{
                                color: wi === 1 ? "hsl(21, 95%, 56%)" : "rgba(255,255,255,0.45)",
                                textShadow: wi === 1 ? "0 0 8px rgba(249,115,22,0.4)" : "none",
                                transition: "color 0.2s",
                              }}
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Typewriter: Monospace, cursor blink */}
                      {style.id === "typewriter" && (
                        <span
                          className="text-[14px] font-normal text-emerald-300"
                          style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
                        >
                          {style.mockText[0]}
                          <span className="animate-pulse text-emerald-400">|</span>
                        </span>
                      )}

                      {/* Gradient Pop: Bold gradient text, large */}
                      {style.id === "gradient-pop" && (
                        <span
                          className={cn(
                            "bg-gradient-to-r bg-clip-text font-sans text-[20px] font-black text-transparent",
                            style.gradient,
                          )}
                          style={{
                            WebkitTextStroke: "0.5px rgba(255,255,255,0.2)",
                          }}
                        >
                          {style.mockText.join(" ")}
                        </span>
                      )}
                    </div>

                    {/* Play indicator on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                        <div className="ml-0.5 border-l-[12px] border-y-[7px] border-l-white border-y-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-lg font-semibold text-foreground">
                        {style.name}
                      </p>
                      <Type className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {style.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            COMPARISON TABLE — styled with alternating rows
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
              How Trndinn{" "}
              <span className="text-primary">compares</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-8 overflow-hidden rounded-2xl border border-border/50"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="px-4 py-4 text-left font-medium text-foreground">Feature</th>
                      <th className="px-4 py-4 text-left font-bold text-primary">Trndinn</th>
                      <th className="px-4 py-4 text-left font-medium text-muted-foreground">Kapwing</th>
                      <th className="px-4 py-4 text-left font-medium text-muted-foreground">VEED</th>
                      <th className="px-4 py-4 text-left font-medium text-muted-foreground">CapCut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Price", "Free / $0.86/mo", "$16/mo", "$18/mo", "Free (app only)"],
                      ["No login needed", true, false, false, false],
                      ["Web-based", true, true, true, false],
                      ["Word-level animation", true, true, true, true],
                      ["Social scheduling", "Yes ($0.86/mo)", false, false, false],
                    ].map((row, i) => (
                      <tr
                        key={i}
                        className={cn(
                          "border-t border-border/30",
                          i % 2 === 1 && "bg-muted/10"
                        )}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{row[0]}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {typeof row[1] === "boolean" ? (
                            row[1] ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/40" />
                            )
                          ) : (
                            row[1]
                          )}
                        </td>
                        {[2, 3, 4].map((col) => (
                          <td key={col} className="px-4 py-3 text-muted-foreground">
                            {typeof row[col] === "boolean" ? (
                              row[col] ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground/40" />
                              )
                            ) : (
                              row[col]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            SUPPORTED FORMATS — clean table
        ================================================================== */}
        <section className="relative px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-3xl">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Supported formats
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-6 overflow-hidden rounded-xl border border-border/50"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Input</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Limits</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Output</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-t border-border/30">
                    <td className="px-4 py-3">MP4, MOV, WebM</td>
                    <td className="px-4 py-3">1.5 min, 100 MB</td>
                    <td className="px-4 py-3">MP4 (H.264 + AAC)</td>
                  </tr>
                  <tr className="border-t border-border/30 bg-muted/10">
                    <td className="px-4 py-3">Any resolution</td>
                    <td className="px-4 py-3">Max output 1080p</td>
                    <td className="px-4 py-3">+ SRT / VTT optional</td>
                  </tr>
                  <tr className="border-t border-border/30">
                    <td className="px-4 py-3">99+ languages</td>
                    <td className="px-4 py-3">2 videos / day free</td>
                    <td className="px-4 py-3">1-hour download window</td>
                  </tr>
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================
            FAIR USE / DMCA
        ================================================================== */}
        <section className="relative px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-3xl">
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
                    Fair use & copyright
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    This tool is for captioning your own content or content you have permission to use.
                    Trndinn does not store uploaded videos beyond 1 hour. We are not affiliated with
                    Instagram, TikTok, or YouTube. By using this tool you agree to our{" "}
                    <Link href="/legal/terms" className="text-primary underline underline-offset-2 hover:text-primary/80">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/legal/dmca" className="text-primary underline underline-offset-2 hover:text-primary/80">
                      DMCA policy
                    </Link>.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================
            BLOG — Caption Tips & Guides
        ================================================================== */}
        {blogPosts && blogPosts.length > 0 && (
          <section className="relative px-4 py-8 sm:py-12">
            <div className="mx-auto max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-2 flex items-end justify-between gap-8">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      From the blog
                    </p>
                    <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      Caption Tips &amp; Guides
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      Learn proven captioning techniques, accessibility best practices, and engagement strategies from our content team.
                    </p>
                  </div>
                </div>
                <BlogRelatedPosts posts={blogPosts} />
              </motion.div>
            </div>
          </section>
        )}

        {/* ==================================================================
            COMPARE & LEARN MORE — internal links for SEO
        ================================================================== */}
        <section className="relative px-4 py-6 sm:py-8">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-lg border border-border/40 bg-card/40 p-6"
            >
              <h3 className="font-display text-lg font-semibold text-foreground">
                Compare &amp; Learn More
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                See how Trndinn&apos;s Auto Caption Generator stacks up against popular captioning tools, or browse our full comparison and alternatives hubs.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {CAPTION_COMPETITORS.map((competitor) => (
                  <li key={competitor.slug}>
                    <Link
                      href={`/compare/trndinn-vs-${competitor.slug}`}
                      className="inline-flex items-center gap-1.5 text-primary underline-offset-2 hover:underline"
                    >
                      <ArrowRight className="h-3 w-3" />
                      Trndinn vs {competitor.name} — {competitor.wedgeSummary.toLowerCase().replace(/\.$/, "")}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/compare"
                    className="inline-flex items-center gap-1.5 text-primary underline-offset-2 hover:underline"
                  >
                    <ArrowRight className="h-3 w-3" />
                    All comparisons — full side-by-side breakdowns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/alternatives"
                    className="inline-flex items-center gap-1.5 text-primary underline-offset-2 hover:underline"
                  >
                    <ArrowRight className="h-3 w-3" />
                    Caption tool alternatives hub — find the right fit
                  </Link>
                </li>
              </ul>
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
                    href={`/tools/${tool.slug}`}
                    className="group relative block h-full overflow-hidden rounded-2xl bg-card/50 p-8 transition-colors hover:bg-card"
                  >
                    {/* Gradient reveal on hover */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-10"
                      style={{
                        background:
                          "linear-gradient(135deg, hsl(35 95% 60%), hsl(21 95% 56%), hsl(340 70% 55%))",
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
                          Try it
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
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
            FINAL CTA — big gradient, animated
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
            animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }}
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
                Caption.{" "}
                <span className="italic text-primary">Schedule.</span>{" "}
                <br />
                Grow. Repeat.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Trndinn is what you upgrade to when captioning Reels stops being enough.
                Brand voice, AI writing, cross-platform scheduling — from $0.86/mo.
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
                        "linear-gradient(90deg, hsl(35 95% 60%), hsl(21 95% 56%), hsl(340 70% 55%))",
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
