"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Download,
  Wand2,
  Hash,
  User,
  BarChart3,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import {
  TOOLS,
  getToolCategories,
  type ToolCategory,
  type ToolEntry,
} from "@/lib/tools-data";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Category icons (for upcoming tools that don't have artwork yet)
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<ToolCategory, typeof Download> = {
  Utility: Download,
  "Post Generator": Wand2,
  "Hook & Caption": Sparkles,
  "Bio Generator": User,
  Hashtag: Hash,
  Analytics: BarChart3,
};

// ---------------------------------------------------------------------------
// Tool Artwork Components — unique visual per live tool
// ---------------------------------------------------------------------------

function InstagramReelArtwork() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] p-6">
      {/* Floating reel frames */}
      <motion.div
        className="absolute left-4 top-4 h-14 w-10 rounded-lg bg-white/10 backdrop-blur-sm"
        animate={{ y: [0, -4, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="mt-2 flex justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-white/40" />
        </div>
        <div className="mx-2 mt-1 space-y-0.5">
          <div className="h-0.5 w-full rounded bg-white/30" />
          <div className="h-0.5 w-3/4 rounded bg-white/20" />
        </div>
      </motion.div>

      <motion.div
        className="absolute right-5 top-6 h-12 w-9 rounded-lg bg-white/10 backdrop-blur-sm"
        animate={{ y: [0, 5, 0], rotate: [2, -2, 2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="mt-1.5 flex justify-center">
          <div className="h-5 w-5 rounded-full border-2 border-white/30" />
        </div>
      </motion.div>

      {/* Center: phone mockup with play button */}
      <div className="relative z-10 flex h-32 w-20 flex-col items-center justify-center rounded-xl bg-black/30 ring-2 ring-white/20 backdrop-blur-md">
        {/* Status bar */}
        <div className="absolute top-1.5 h-1 w-6 rounded-full bg-white/30" />
        {/* Play button */}
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-[#E1306C]">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.div>
        {/* Bottom bar */}
        <div className="absolute bottom-2 flex gap-1">
          <div className="h-1 w-1 rounded-full bg-white/60" />
          <div className="h-1 w-1 rounded-full bg-white/30" />
          <div className="h-1 w-1 rounded-full bg-white/30" />
        </div>
      </div>

      {/* Download arrow floating */}
      <motion.div
        className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        <Download className="h-4 w-4 text-white" />
      </motion.div>

      {/* Scattered dots */}
      <div className="absolute bottom-6 left-6 h-1.5 w-1.5 rounded-full bg-white/40" />
      <div className="absolute right-12 top-3 h-1 w-1 rounded-full bg-white/50" />
      <div className="absolute bottom-3 left-12 h-1 w-1 rounded-full bg-white/30" />
    </div>
  );
}

// Placeholder artwork for coming-soon tools (subtle, muted)
function ComingSoonArtwork({ category }: { category: ToolCategory }) {
  const Icon = CATEGORY_ICONS[category];
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-t-2xl bg-muted/30 dark:bg-white/[0.03]">
      {/* Grid dots pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }} />
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 dark:bg-white/[0.05]">
        <Icon className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <div className="absolute bottom-3 right-3 rounded-full bg-muted/60 px-2 py-0.5 text-[9px] font-medium text-muted-foreground/60">
        Soon
      </div>
    </div>
  );
}

// Map of slug → artwork component for live tools
function getToolArtwork(tool: ToolEntry) {
  if (!tool.live) return <ComingSoonArtwork category={tool.category} />;

  switch (tool.slug) {
    case "instagram-reel-downloader":
      return <InstagramReelArtwork />;
    default:
      return <ComingSoonArtwork category={tool.category} />;
  }
}

// ---------------------------------------------------------------------------
// Tool card with artwork
// ---------------------------------------------------------------------------

function ToolCard({ tool, index }: { tool: ToolEntry; index: number }) {
  const isLive = tool.live;
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      whileHover={shouldReduceMotion ? undefined : { y: -6 }}
      className="h-full"
    >
      <Link
        href={isLive ? `/tools/${tool.slug}` : "#"}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300",
          "bg-card/50 hover:bg-card/80 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]",
          !isLive && "pointer-events-none",
        )}
        aria-label={`${tool.name}${!isLive ? " — coming soon" : ""}`}
      >
        {/* Artwork area */}
        <div className="relative h-44 w-full overflow-hidden">
          {getToolArtwork(tool)}
        </div>

        {/* Content area */}
        <div className="flex flex-1 flex-col p-6">
          {/* Tags row */}
          <div className="mb-3 flex items-center gap-2">
            {tool.isAI && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                <Sparkles className="h-2.5 w-2.5" />
                AI
              </span>
            )}
            <span className="rounded-md bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground dark:bg-white/[0.05]">
              {tool.platform}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display text-xl font-bold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
            {tool.name}
          </h3>

          {/* Description */}
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {tool.description}
          </p>

          {/* Action */}
          <div className="mt-5">
            {isLive ? (
              <motion.span
                className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-white"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              >
                Use tool
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </motion.span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/50">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                Coming soon
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Decorative elements
// ---------------------------------------------------------------------------

const SparkleGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
      fill="currentColor"
    />
  </svg>
);

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
        "pointer-events-none absolute rounded-full blur-3xl opacity-25",
        className,
      )}
      style={{ background: color }}
      animate={
        shouldReduceMotion
          ? undefined
          : { x: [0, 20, -15, 0], y: [0, -30, 15, 0], scale: [1, 1.08, 0.96, 1] }
      }
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ToolsHubView() {
  const categories = getToolCategories();
  const [active, setActive] = useState<ToolCategory | "All">("All");
  const shouldReduceMotion = useReducedMotion();

  const filtered =
    active === "All" ? TOOLS : TOOLS.filter((t) => t.category === active);

  const liveCount = TOOLS.filter((t) => t.live).length;
  const totalCount = TOOLS.length;

  return (
    <MarketingShell>
      <main className="relative overflow-hidden">
        {/* Background orbs */}
        <FloatingOrb
          className="left-[-12%] top-[5%] h-[500px] w-[500px]"
          color="radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)"
        />
        <FloatingOrb
          className="right-[-10%] top-[25%] h-[400px] w-[400px]"
          color="radial-gradient(circle, hsl(270 95% 75%) 0%, transparent 70%)"
          delay={4}
        />
        <FloatingOrb
          className="bottom-[5%] left-[25%] h-[350px] w-[350px]"
          color="radial-gradient(circle, hsl(0 84% 60%) 0%, transparent 70%)"
          delay={8}
        />

        {/* ==================================================================
            HERO
        ================================================================== */}
        <section className="relative flex min-h-[50vh] items-center justify-center px-4 pt-20 pb-8 sm:pt-28 sm:pb-12">
          {/* Floating sparkles */}
          <motion.div
            className="pointer-events-none absolute left-[8%] top-[30%] hidden text-primary/25 lg:block"
            animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <SparkleGlyph className="h-8 w-8" />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute right-[10%] top-[28%] hidden text-primary/20 lg:block"
            animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <SparkleGlyph className="h-5 w-5" />
          </motion.div>

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            {/* Live counter */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-card/60 px-4 py-1.5 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-foreground/80">
                {liveCount} live · {totalCount - liveCount} shipping soon
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[1.08] tracking-tight text-foreground"
            >
              Free tools that
              <br />
              actually{" "}
              <span className="gradient-text">slap</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            >
              Download, generate, optimize — no signup, no credit card, no
              annoying paywalls.{" "}
              <span className="text-foreground/80">Just paste and go.</span>
            </motion.p>
          </div>
        </section>

        {/* ==================================================================
            CATEGORY FILTER with motion pill
        ================================================================== */}
        <section className="px-4 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {["All", ...categories].map((cat) => {
              const isActive = active === cat;
              return (
                <motion.button
                  key={cat}
                  onClick={() => setActive(cat as ToolCategory | "All")}
                  className={cn(
                    "relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "linear-gradient(90deg, hsl(var(--primary)), hsl(0 84% 60%))",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-full bg-muted/40 dark:bg-white/[0.04]" />
                  )}
                  <span className="relative z-10">{cat}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </section>

        {/* ==================================================================
            TOOL GRID — cards with artwork
        ================================================================== */}
        <section className="px-4 pb-28 sm:pb-36">
          <div className="mx-auto max-w-6xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((tool, i) => (
                  <ToolCard key={tool.slug} tool={tool} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <p className="text-lg text-muted-foreground">
                  No tools in this category yet. They&apos;re cooking. 🍳
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* ==================================================================
            CTA
        ================================================================== */}
        <section className="relative px-4 pb-28 sm:pb-36">
          <motion.div
            className="pointer-events-none absolute right-[12%] top-[20%] hidden text-primary/20 lg:block"
            animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
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
                Want the full suite?
              </p>
              <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
                All tools.{" "}
                <span className="italic text-primary">One platform.</span>
                <br />
                Zero context switching.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Trndinn connects downloading, generating, and scheduling into
                one flow — so you stop juggling 12 different tabs.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <motion.div
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                >
                  <Button
                    asChild
                    size="lg"
                    className="rounded-xl px-8 py-6 text-base font-semibold text-white shadow-xl shadow-primary/25"
                    style={{
                      background: "linear-gradient(90deg, hsl(var(--primary)), hsl(0 84% 60%))",
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
