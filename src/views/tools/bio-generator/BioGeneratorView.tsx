"use client";

/**
 * BioGeneratorView — Full-page editorial experience for the Bio Generator tool.
 *
 * Mirrors the flowing, section-per-scroll rhythm of AutoCaptionGeneratorView:
 * hero → tool → how-it-works → entity-first TL;DR → stats → platform limits →
 * FAQ → related blog → compare hub → related tools → final CTA.
 *
 * Structural choices:
 * - No section borders or card wrappers between sections — just generous whitespace.
 * - framer-motion for reveal animations, `useReducedMotion` for accessibility.
 * - All colors go through `hsl(var(--token))` via Tailwind theme + inline gradients.
 * - The tool UI (form + streaming output) is preserved unchanged from the previous
 *   orchestrator — `BioInputForm` + `BioOutputTabs` + `useBioStream` still drive it.
 */

import Link from "next/link";
import { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  PenLine,
  Sliders,
  Copy,
  Users,
  MessageSquareHeart,
  TrendingUp,
  Eye,
} from "lucide-react";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { BlogRelatedPosts, type RelatedPost } from "@/components/blog/BlogRelatedPosts";
import { TOOLS } from "@/lib/tools-data";
import { BIO_COMPETITORS } from "@/lib/bio-generator-competitors";
import { cn } from "@/lib/utils";

import { BioHero } from "./BioHero";
import { BioInputForm } from "./BioInputForm";
import { BioOutputTabs } from "./BioOutputTabs";
import { BioPendingState } from "./BioPendingState";
import { useBioStream } from "./use-bio-stream";
import type { BioPlatform, BioGeneratorViewHeroVariant } from "./types";
import { useToolFeedback } from "@/hooks/useToolFeedback";
import { ToolFeedbackCard, ToolFeedbackButton } from "@/components/feedback/ToolFeedbackCard";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BioGeneratorViewProps {
  heroVariant?: BioGeneratorViewHeroVariant;
  defaultPlatform?: BioPlatform;
  faqs: Array<{ question: string; answer: string }>;
  blogPosts?: RelatedPost[];
}

// ---------------------------------------------------------------------------
// Decorative glyphs (shared visual language with caption generator)
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

// ---------------------------------------------------------------------------
// Floating orb (background ambience)
// ---------------------------------------------------------------------------

function FloatingOrb({
  className,
  color,
  delay = 0,
}: {
  className?: string;
  color: string;
  delay?: number;
}) {
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
}

// ---------------------------------------------------------------------------
// FAQ item — matches caption generator's editorial accordion pattern
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
        className="group flex w-full items-center justify-between gap-6 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
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
// Static data
// ---------------------------------------------------------------------------

const STEPS = [
  {
    icon: PenLine,
    title: "Describe yourself",
    caption: "Type your role, one win, and who reads your bio.",
    accent: "from-amber-500 to-orange-500",
  },
  {
    icon: Sliders,
    title: "Pick platforms & tone",
    caption: "Select Instagram, LinkedIn, X, or all. Dial your tone.",
    accent: "from-orange-500 to-rose-500",
  },
  {
    icon: Copy,
    title: "Copy your bios",
    caption: "3 variations per platform appear instantly. Copy the one you love.",
    accent: "from-rose-500 to-pink-500",
  },
];

const STATS = [
  {
    icon: Eye,
    value: "7 seconds",
    label: "Average time visitors spend on your profile",
    source: "Microsoft, 2023",
  },
  {
    icon: Users,
    value: "40%",
    label: "More profile visits when bio is complete",
    source: "LinkedIn Internal, 2024",
  },
  {
    icon: MessageSquareHeart,
    value: "3.5×",
    label: "More DMs with a clear call-to-action",
    source: "Later, 2023",
  },
  {
    icon: TrendingUp,
    value: "80%",
    label: "Of hiring managers check social profiles first",
    source: "CareerBuilder, 2024",
  },
];

const PLATFORM_LIMITS: Array<{
  platform: string;
  limit: string;
  visible: string;
  practice: string;
}> = [
  {
    platform: "Instagram",
    limit: "150",
    visible: "All 150",
    practice: "Emoji bullets, one CTA",
  },
  {
    platform: "TikTok",
    limit: "80",
    visible: "All 80",
    practice: "One tagline, no URLs",
  },
  {
    platform: "X / Twitter",
    limit: "160",
    visible: "All 160",
    practice: "[role] · [topic] · [note]",
  },
  {
    platform: "LinkedIn",
    limit: "2,600",
    visible: "First 210",
    practice: "Front-load identity line",
  },
  {
    platform: "GitHub",
    limit: "160",
    visible: "All 160",
    practice: "Stack/tools, not adjectives",
  },
  {
    platform: "YouTube",
    limit: "1,000",
    visible: "First 100",
    practice: "Value prop in opening line",
  },
];

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

export default function BioGeneratorView({
  heroVariant,
  defaultPlatform,
  faqs,
  blogPosts,
}: BioGeneratorViewProps) {
  const bio = useBioStream(defaultPlatform);
  const shouldReduceMotion = useReducedMotion();
  const feedback = useToolFeedback("bio-generator", bio.results.length > 0 && !bio.isGenerating);

  // Subtle parallax for hero decorations — same rhythm as caption generator.
  const { scrollY } = useScroll();
  const yLeft = useTransform(scrollY, [0, 500], [0, -60]);
  const yRight = useTransform(scrollY, [0, 500], [0, 40]);

  // Related tools — exclude the current tool and only surface live ones.
  const relatedTools = TOOLS.filter(
    (t) => t.slug !== "bio-generator" && t.live,
  ).slice(0, 3);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "auto" : "smooth" });
    }
  };

  return (
    <MarketingShell>
      <main className="relative overflow-hidden">
        {/* ==================================================================
            HERO — alias-aware headline + decorative ambience
        ================================================================== */}
        <section className="relative px-4">
          {/* Warm ambient orbs — orange/amber/pink to match caption tool */}
          <FloatingOrb
            className="left-[-10%] top-[6%] h-[420px] w-[420px]"
            color="radial-gradient(circle, hsl(21 95% 56%) 0%, transparent 70%)"
          />
          <FloatingOrb
            className="right-[-8%] top-[18%] h-[380px] w-[380px]"
            color="radial-gradient(circle, hsl(35 95% 60%) 0%, transparent 70%)"
            delay={3}
          />

          {/* Floating doodles — desktop only, gentle parallax */}
          <motion.div
            style={shouldReduceMotion ? undefined : { y: yLeft }}
            className="pointer-events-none absolute left-[6%] top-[18%] hidden text-primary/40 lg:block"
          >
            <SparkleGlyph className="h-8 w-8" />
          </motion.div>

          <motion.div
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
            <ZigzagLine className="h-6 w-20" />
          </motion.div>

          <div className="relative z-10">
            <BioHero variant={heroVariant} />
          </div>
        </section>

        {/* ==================================================================
            TOOL UI — side-by-side form + streaming output
            (preserved from previous orchestrator; the hook drives everything)
        ================================================================== */}
        <section id="bio-tool" className="relative mx-auto max-w-7xl px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-start">
            {/* LEFT: form — full column, no internal scroll */}
            <div>
              <BioInputForm
                role={bio.form.role}
                setRole={bio.setRole}
                facts={bio.form.facts}
                setFacts={bio.setFacts}
                goal={bio.form.goal}
                setGoal={bio.setGoal}
                audience={bio.form.audience}
                setAudience={bio.setAudience}
                length={bio.form.length}
                setLength={bio.setLength}
                emojis={bio.form.emojis}
                setEmojis={bio.setEmojis}
                tone={bio.form.tone}
                setTone={bio.setTone}
                bioType={bio.form.bioType}
                setBioType={bio.setBioType}
                focusAreas={bio.form.focusAreas}
                platforms={bio.form.platforms}
                togglePlatform={bio.togglePlatform}
                toggleFocusArea={bio.toggleFocusArea}
                loadTemplate={bio.loadTemplate}
                isGenerating={bio.isGenerating}
                submit={bio.submit}
              />
            </div>

            {/* RIGHT: streaming output */}
            <div ref={bio.outputRef} className="min-h-[400px]">
              {bio.results.length === 0 && bio.isGenerating && (
                <BioPendingState
                  pendingPlatforms={bio.pendingPlatforms}
                  isGenerating={bio.isGenerating}
                  hasResults={false}
                />
              )}

              {(bio.results.length > 0 ||
                (bio.pendingPlatforms.size > 0 && bio.activeTab)) &&
                bio.activeTab && (
                  <BioOutputTabs
                    results={bio.results}
                    activeTab={bio.activeTab}
                    setActiveTab={bio.setActiveTab}
                    pendingPlatforms={bio.pendingPlatforms}
                    scores={bio.scores}
                    scoring={bio.scoring}
                    copiedKey={bio.copiedKey}
                    regenKey={bio.regenKey}
                    votes={bio.votes}
                    votingKey={bio.votingKey}
                    onCopy={bio.copyBio}
                    onRegenerate={bio.regenerateOne}
                    onScore={bio.scoreOne}
                    onVote={bio.voteBio}
                  />
                )}

              {bio.results.length === 0 && !bio.isGenerating && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-lg border-2 border-dashed border-border p-10 text-center space-y-4">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg text-foreground">
                      Ready to generate
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
                      Fill in your details and click Generate to create 3 personalised
                      bios per platform.
                    </p>
                  </div>
                </div>
              )}

              {/* Tool Feedback — appears after bios are generated (alongside thumbs up/down) */}
              {bio.results.length > 0 && !bio.isGenerating && (
                <div className="flex flex-col items-center gap-3 mt-4">
                  <ToolFeedbackCard
                    toolSlug="bio-generator"
                    toolName="AI Bio Generator"
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
            </div>
          </div>
        </section>

        {/* ==================================================================
            HOW IT WORKS — horizontal dotted timeline (3 steps)
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
                className="pointer-events-none absolute left-[16%] right-[16%]"
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
                    <div className="relative">
                      <motion.div
                        className="absolute -inset-3 rounded-full opacity-0 group-hover:opacity-100"
                        style={{
                          background:
                            "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
                        }}
                        animate={
                          shouldReduceMotion ? undefined : { scale: [1, 1.2, 1] }
                        }
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-card ring-4 ring-background">
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-white",
                            step.accent,
                          )}
                        >
                          <Icon className="h-5 w-5" strokeWidth={2.2} />
                        </div>
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                        {i + 1}
                      </span>
                    </div>

                    <div className="text-center">
                      <p className="font-display text-lg font-semibold tracking-tight text-foreground">
                        {step.title}
                      </p>
                      <p className="mt-1 max-w-[16rem] text-sm text-muted-foreground">
                        {step.caption}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Mobile-only stacked step list — keeps the same content accessible below sm */}
        <section className="relative px-4 py-8 sm:hidden">
          <div className="mx-auto max-w-md space-y-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={`${step.title}-mobile`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-3 rounded-lg bg-card/50 p-4"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white",
                      step.accent,
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold text-foreground">
                      {i + 1}. {step.title}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {step.caption}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ==================================================================
            ENTITY-FIRST TL;DR — AEO paragraph, no heading
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
                <span className="font-display font-semibold">
                  Trndinn Bio Generator
                </span>{" "}
                is a free browser tool that writes{" "}
                <span className="font-display font-semibold">
                  platform-aware social media bios
                </span>{" "}
                for Instagram (150 chars), TikTok (80 chars), X/Twitter (160 chars),
                LinkedIn (2,600 chars), GitHub (160 chars), and YouTube (1,000 chars)
                in one run. Enter your niche, pick a tone, and get 3 on-brand
                variations per platform — no login, no watermark, no daily limit.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================
            WHY YOUR BIO MATTERS — bento grid stats
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
              <Users className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                First-impression math
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Why your bio{" "}
              <span className="italic text-primary">matters</span>
            </motion.h2>

            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                    className="group relative overflow-hidden rounded-2xl bg-card/50 p-6 transition-colors hover:bg-card"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="relative">
                      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                        {stat.value}
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/60">
                        [{stat.source}]
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mt-8 text-base leading-relaxed text-muted-foreground"
            >
              A bio isn&apos;t decoration — it&apos;s the sentence that decides whether
              a stranger follows, DMs, hires, or scrolls past. Get it right once, and
              every impression compounds. Trndinn&apos;s Bio Generator is built to
              make that one sentence a{" "}
              <strong className="text-foreground">growth lever</strong> across every
              platform you show up on.
            </motion.p>
          </div>
        </section>

        {/* ==================================================================
            PLATFORM LIMITS TABLE
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
                Character limits
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
              Every platform has a{" "}
              <span className="text-primary">different ceiling</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-3 max-w-2xl text-base text-muted-foreground"
            >
              Trndinn auto-fits every variation to the exact character budget below —
              no manual counting, no truncated CTAs on mobile.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 overflow-hidden rounded-2xl border border-border/50"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="px-4 py-4 text-left font-medium text-foreground">
                        Platform
                      </th>
                      <th className="px-4 py-4 text-left font-medium text-foreground">
                        Character Limit
                      </th>
                      <th className="px-4 py-4 text-left font-medium text-foreground">
                        What&apos;s Visible
                      </th>
                      <th className="px-4 py-4 text-left font-medium text-foreground">
                        Best Practice
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLATFORM_LIMITS.map((row, i) => (
                      <tr
                        key={row.platform}
                        className={cn(
                          "border-t border-border/30",
                          i % 2 === 1 && "bg-muted/10",
                        )}
                      >
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {row.platform}
                        </td>
                        <td className="px-4 py-3 font-mono text-foreground">
                          {row.limit}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.visible}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.practice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================
            FAQ — editorial accordion, AEO-optimized questions
        ================================================================== */}
        {faqs.length > 0 && (
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
        )}

        {/* ==================================================================
            BLOG — Bio tips & guides
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
                      Bio Tips &amp; Guides
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      Playbooks on writing bios that convert — platform tone, CTA
                      patterns, and the small tweaks that lift profile visits.
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
                See how Trndinn&apos;s Bio Generator stacks up against popular bio
                tools, or browse our full comparison and alternatives hubs.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {BIO_COMPETITORS.map((competitor) => (
                  <li key={competitor.slug}>
                    <Link
                      href={`/compare/trndinn-vs-${competitor.slug}`}
                      className="inline-flex items-center gap-1.5 text-primary underline-offset-2 hover:underline"
                    >
                      <ArrowRight className="h-3 w-3" />
                      Trndinn vs {competitor.name} —{" "}
                      {competitor.wedgeSummary.toLowerCase().replace(/\.$/, "")}
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
                    Bio tool alternatives hub — find the right fit
                  </Link>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* ==================================================================
            RELATED TOOLS — floating cards with parallax hover
        ================================================================== */}
        {relatedTools.length > 0 && (
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
        )}

        {/* ==================================================================
            FINAL CTA — big gradient, animated orbs, scroll back to the tool
        ================================================================== */}
        <section className="relative overflow-hidden px-4 py-16 sm:py-24">
          <FloatingOrb
            className="left-[10%] top-[10%] h-[280px] w-[280px]"
            color="radial-gradient(circle, hsl(35 95% 60%) 0%, transparent 70%)"
          />
          <FloatingOrb
            className="right-[8%] bottom-[10%] h-[320px] w-[320px]"
            color="radial-gradient(circle, hsl(340 70% 55%) 0%, transparent 70%)"
            delay={4}
          />

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

          <div className="relative mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary">
                Ready when you are
              </p>
              <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
                Your bio is your{" "}
                <span className="italic text-primary">first impression</span>.
                <br />
                Make it count.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Three variations per platform, tuned to every character limit,
                delivered in seconds. No login, no watermark, no daily cap.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <motion.div
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                >
                  <Button
                    size="lg"
                    onClick={scrollToTop}
                    className="rounded-xl px-8 py-6 text-base font-semibold text-white shadow-xl shadow-primary/30"
                    style={{
                      background:
                        "linear-gradient(90deg, hsl(35 95% 60%), hsl(21 95% 56%), hsl(340 70% 55%))",
                    }}
                  >
                    Generate my bio
                    <ArrowRight className="ml-2 h-4 w-4" />
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
