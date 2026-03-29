"use client";

import type { ComponentProps, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  Cloud,
  Database,
  Download,
  Layers,
  Mic,
  Palette,
  Play,
  Server,
  Sparkles,
  Workflow,
} from "lucide-react";
import { ChannelMarquee } from "@/components/marketing/ChannelMarquee";
import { FlowingWaveBackdrop } from "@/components/marketing/FlowingWaveBackdrop";
import { MarketingPlanGrid } from "@/components/marketing/MarketingPlanGrid";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { EvolutionTimeline } from "@/components/marketing/EvolutionTimeline";
import { Button } from "@/components/ui/button";
import { CREDIT_USAGE_NOTE, BACKEND_MONTHLY_CREDITS } from "@/config/plan-comparison";
import { useAuth } from "@/contexts/AuthContext";
import { MARKETING_MARQUEE_CHANNELS } from "@/lib/marketing-channels";
import { marketingRoadmap } from "@/lib/marketing-roadmap";
import { cn } from "@/lib/utils";

const REELS_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBnN7J4TyewgIl75t7m5voBF5-Fw7gV_OyTpzowtcfeKGEw4JhuTnzmEEwGHHTs2StGfrthWZt3L8yX6ZKDDUqG6CZWUAModT_jRM5ljZWnZ0SI4yx9FiQcX8sxvwH3YiVZsiqsgNL6MXR4k51GvvzWVe7QChdArcx_MzJWd7-CWGHy_l5lGoLXrNLc3DaGrMFwMr_GwbDT3U0VI3Zfc6KkanpDusHRWW0k53hRRTWdJ7fg9RaVDbnl6BCLhaft3y70--vyTqgBH94";

const chartHeights = [30, 45, 60, 55, 85, 100, 70] as const;

function KineticGradient({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "bg-gradient-to-br from-[#FF8A1F] to-[#ffb783] bg-clip-text text-transparent",
        className,
      )}
    >
      {children}
    </span>
  );
}

function GlassPanel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border border-border/80 bg-card/90 backdrop-blur-2xl",
        "dark:border-white/10 dark:bg-[rgba(46,52,71,0.28)] dark:shadow-xl dark:shadow-black/40",
        className,
      )}
      {...props}
    />
  );
}

const stackItems = [
  {
    icon: Layers,
    title: "Client · Next.js 15",
    body: "App Router, React, Tailwind, Radix primitives, Supabase auth session in the browser.",
  },
  {
    icon: Server,
    title: "API · NestJS",
    body: "Fastify platform, Swagger docs, structured modules for content, media, scheduling, and quota.",
  },
  {
    icon: Workflow,
    title: "Jobs · BullMQ + Redis",
    body: "Generation and media pipelines run out-of-band so the UI stays fast while workers process credits-backed jobs.",
  },
  {
    icon: Database,
    title: "Data · Supabase Postgres",
    body: "User quota view, credit transactions via RPC, and RLS-aligned access patterns the API enforces.",
  },
  {
    icon: Cloud,
    title: "Media · MinIO",
    body: "Object storage for uploads and generated assets behind signed flows from the media service.",
  },
];

export default function FeaturesPage() {
  const { session } = useAuth();
  const primaryHref = session ? "/dashboard" : "/auth";

  return (
    <MarketingShell>
      <main className="pb-24">
        {/* Hero */}
        <section id="features" className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(255,138,31,0.18),transparent_50%)]" />
            <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-primary/12 blur-[100px]" />
            <div className="absolute -right-24 top-1/2 h-72 w-72 rounded-full bg-[#00b5f5]/8 blur-[90px]" />
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-6 pt-12 sm:px-6 sm:pb-8 sm:pt-16 md:pt-20">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md dark:border-white/15 dark:bg-background/50">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                The Celestial Interface
              </span>
              <h1 className="mt-6 font-heading text-[2.25rem] font-black leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                One Pulse,{" "}
                <KineticGradient>Infinite Channels.</KineticGradient>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg md:text-xl">
                Orchestrate your entire digital presence through a single high-performance instrument. Automated,
                predictive, and weightless.
              </p>
              <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ffb783] px-8 text-base font-semibold text-[#4f2500] sm:h-14 sm:w-auto sm:px-10 sm:text-lg dark:shadow-lg dark:shadow-primary/25"
                  asChild
                >
                  <Link href={primaryHref}>Initialize console</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full border-border bg-secondary/60 px-8 text-base font-semibold hover:bg-secondary sm:h-14 sm:w-auto sm:px-10 sm:text-lg dark:border-white/15 dark:bg-background/40 dark:hover:bg-white/5"
                  asChild
                >
                  <a href="#ai-tools">Explore AI engine</a>
                </Button>
              </div>
            </div>
          </div>

          {/* Marquee — flows naturally, no border */}
          <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            <p className="pb-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">
              Channel surface — LinkedIn live, more networks shipping on the same queue
            </p>
            <ChannelMarquee channels={MARKETING_MARQUEE_CHANNELS} />
          </div>
        </section>

        {/* Bento: AI Content Engine + Neural Shortcuts */}
        <section id="ai-tools" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-7xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-700">
            <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
              <div className="relative min-h-[300px] overflow-hidden rounded-[1.75rem] border border-border/80 bg-card dark:border-white/10 dark:bg-transparent dark:shadow-2xl dark:shadow-black/30 lg:col-span-8 lg:min-h-[340px]">
                <FlowingWaveBackdrop />
                <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-between p-8 sm:min-h-0 sm:p-10">
                  <div>
                    <div className="inline-flex items-center gap-2 text-primary">
                      <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} />
                      <span className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                        AI Content Engine
                      </span>
                    </div>
                    <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                      Generate pixel-perfect drafts, high-conversion copy, and campaign narratives in seconds. The engine
                      pairs with Trndinn&apos;s job workers and credit ledger—every run is metered server-side so teams stay
                      inside their monthly pool ({BACKEND_MONTHLY_CREDITS.standard}–{BACKEND_MONTHLY_CREDITS.ultimate}{" "}
                      credits on paid tiers).
                    </p>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-2">
                    <span className="rounded-full border border-orange-200/90 bg-orange-50/95 px-4 py-2 text-xs font-semibold text-orange-800 backdrop-blur-sm dark:border-white/15 dark:bg-black/30 dark:text-[#fb923c] sm:text-sm">
                      Generative Art
                    </span>
                    <span className="rounded-full border border-teal-200/90 bg-teal-50/95 px-4 py-2 text-xs font-semibold text-teal-800 backdrop-blur-sm dark:border-teal-400/25 dark:bg-teal-950/40 dark:text-teal-300 sm:text-sm">
                      Copy Synth
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-border/80 bg-card p-8 backdrop-blur-xl dark:border-white/10 dark:bg-gradient-to-b dark:from-[#1a1f2e] dark:to-[#0a0f18] dark:shadow-xl lg:col-span-4 lg:min-h-0">
                <div className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-teal-500/15 blur-3xl dark:bg-teal-500/10" />
                <div>
                  <div className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400">
                    <Brain className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.5} />
                    <span className="font-heading text-lg font-bold text-foreground sm:text-xl">Neural Shortcuts</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Predictive UI patterns in the app surface your next action—templates, schedules, and media hooks
                    appear before you hunt through menus. Built on the same dashboard that reads live quota from Supabase.
                  </p>
                </div>
                <p className="mt-6 text-xs uppercase tracking-wider text-teal-700 dark:text-teal-400/90">
                  Live in product · LinkedIn-first workspace
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              {[
                {
                  icon: Sparkles,
                  title: "AI Captioning",
                  text: "Context-aware drafts tuned for LinkedIn today, expandable to each network's tone as channels roll on.",
                },
                {
                  icon: Mic,
                  title: "Voice & Variants",
                  text: "Multi-variant outputs from one prompt so you can A/B hooks without leaving the generation queue.",
                },
                {
                  icon: Palette,
                  title: "Media & Carousels",
                  text: "Image and carousel flows deduct credits per job in the API—failed runs trigger refunds in the ledger.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-border/80 bg-card/70 p-6 backdrop-blur-xl transition-all duration-500 hover:border-primary/25 dark:border-white/10 dark:bg-card/40 md:p-8"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 transition-transform group-hover:scale-105">
                    <Icon className="h-6 w-6 text-primary" strokeWidth={1.75} />
                  </div>
                  <h4 className="font-heading text-lg font-bold text-foreground">{title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform stack */}
        <section id="platform" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="text-center font-heading text-xs font-semibold uppercase tracking-[0.28em] text-primary">End-to-end stack</p>
            <h2 className="mt-3 text-center font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What actually ships in the repo
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-sm text-muted-foreground sm:text-base">
              Trndinn pairs a Next.js client with a NestJS API, Redis-backed workers, Supabase for auth and quota views,
              and MinIO for media. Credits are enforced in{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">QuotaService</code> with monthly pools matching
              marketing plans.
            </p>
            <p className="mx-auto mt-3 max-w-3xl text-center text-xs text-muted-foreground">{CREDIT_USAGE_NOTE}</p>

            <div className="mt-8 flex gap-3 overflow-x-auto pb-4 sm:hidden">
              {stackItems.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="w-[75vw] shrink-0 rounded-2xl border border-border/80 bg-card p-5 dark:border-white/10 dark:bg-card/60"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-heading text-sm font-semibold text-foreground">{title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {stackItems.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border/80 bg-card p-6 transition-transform hover:-translate-y-0.5 dark:border-white/10 dark:bg-card/60"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-heading font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap — same Evolution timeline as Landing */}
        <section id="roadmap" className="scroll-mt-24 px-4 py-8 sm:px-6 sm:py-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            <EvolutionTimeline
              heading={
                <>
                  <h2 className="mb-3 font-heading text-xs font-semibold uppercase tracking-[0.3em] text-primary sm:text-sm">
                    Evolution
                  </h2>
                  <h3 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                    Kinetic Roadmap
                  </h3>
                  <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                    A clear path from LinkedIn-first execution to full multi-channel growth.
                  </p>
                </>
              }
              milestones={marketingRoadmap.map((item) => ({
                quarter: item.quarter,
                status: item.status,
                isLive: item.status === "Live now",
                title: item.title,
                body: item.body,
                icons: (
                  <div className="flex flex-wrap gap-1.5">
                    {item.icons.map(({ Icon, color }, idx) => (
                      <span
                        key={idx}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/30 dark:border-white/8 dark:bg-white/[0.04]"
                      >
                        <Icon className={cn("h-4 w-4", color)} aria-hidden />
                      </span>
                    ))}
                  </div>
                ),
              }))}
            />
          </div>
        </section>

        {/* Reels */}
        <section id="reels" className="scroll-mt-24 overflow-hidden px-4 py-16 sm:px-6 sm:py-20 md:py-28">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
            <div className="relative w-full lg:w-1/2 lg:shrink-0">
              <div className="relative overflow-hidden rounded-2xl border border-border/80 dark:border-white/10 dark:shadow-2xl dark:shadow-black/30">
                <div className="relative aspect-video w-full">
                  <Image
                    src={REELS_IMAGE}
                    alt="AI video editing interface with timeline and neon orange controls"
                    fill
                    className="object-cover opacity-60"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <button
                  type="button"
                  aria-label="Play preview"
                  className="absolute bottom-4 left-4 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900/45 text-white shadow-lg backdrop-blur-md transition-transform hover:scale-105 dark:bg-black/50 sm:bottom-5 sm:left-5 sm:h-16 sm:w-16"
                >
                  <Play className="ml-0.5 h-6 w-6 fill-white text-white sm:h-7 sm:w-7" />
                </button>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <h2 className="mb-3 font-heading text-xs font-semibold uppercase tracking-[0.3em] text-primary sm:text-sm">
                Repurposing engine
              </h2>
              <h3 className="mb-6 font-heading text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                <span className="block sm:inline">One Clip, </span>
                <KineticGradient className="block sm:inline">All Reels.</KineticGradient>
              </h3>
              <p className="mb-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Upload once. Our AI automatically detects the core narrative, trims for different platform lengths, and
                formats for 9:16, 1:1, and 16:9 using context-aware padding.
              </p>
              <ul className="mb-8 space-y-3 sm:mb-10 sm:space-y-4">
                {[
                  "Auto-captioning in 40+ languages",
                  "Emotion-based color grading",
                  "Smart face-tracking crop & kinetic typography",
                  "Automated hook generation from one long-form upload",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-foreground sm:text-base">
                    <CheckCircle2 className="h-5 w-5 shrink-0 fill-emerald-500/20 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="rounded-md bg-gradient-to-br from-[#FF8A1F] to-[#ffb783] px-8 py-6 font-bold text-[#4f2500] hover:opacity-95 dark:shadow-lg dark:shadow-primary/20"
                asChild
              >
                <Link href={primaryHref}>Start repurposing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Analytics */}
        <section id="analytics" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col items-start justify-between gap-6 md:mb-14 md:flex-row md:items-end">
              <div>
                <h2 className="mb-3 font-heading text-xs font-semibold uppercase tracking-[0.3em] text-primary sm:text-sm">
                  Precision data
                </h2>
                <h3 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  Sleek, Predictive Analytics
                </h3>
              </div>
              <Button
                variant="outline"
                className="rounded-md border-border bg-background px-5 py-2 font-heading text-[10px] font-semibold uppercase tracking-widest hover:bg-muted dark:border-white/15 dark:bg-white/[0.06] dark:hover:bg-white/10"
                asChild
              >
                <Link href="/contact" className="inline-flex items-center gap-2">
                  Request report
                  <Download className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              <GlassPanel className="relative flex min-h-[300px] flex-col overflow-hidden rounded-xl p-6 sm:min-h-[380px] sm:p-8 lg:col-span-2 lg:min-h-[400px]">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
                  <h4 className="font-heading font-semibold text-foreground">Growth Frequency</h4>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-xs text-muted-foreground">Projected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                      <span className="text-xs text-muted-foreground">Actual</span>
                    </div>
                  </div>
                </div>
                <div className="mt-auto flex min-h-[180px] flex-1 items-end gap-1.5 pt-8 sm:min-h-[220px] sm:gap-2 sm:pt-12">
                  {chartHeights.map((h, i) => {
                    const opacities = [0.2, 0.3, 0.4, 0.6, 0.8, 1, 0.7] as const;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 rounded-t-sm bg-gradient-to-t from-[#FF8A1F] to-[#ffb783]",
                          i === 5 && "shadow-[0_0_24px_rgba(255,138,31,0.28)] dark:shadow-[0_0_30px_rgba(255,138,31,0.35)]",
                        )}
                        style={{ height: `${h}%`, opacity: opacities[i] ?? 0.5 }}
                      />
                    );
                  })}
                </div>
              </GlassPanel>
              <GlassPanel className="flex flex-col justify-between rounded-xl p-6 sm:p-8">
                <div>
                  <h4 className="mb-5 font-heading font-semibold text-foreground sm:mb-6">Audience Velocity</h4>
                  <div className="text-4xl font-bold text-foreground sm:text-5xl">+248%</div>
                  <p className="mt-2 text-sm text-primary">Predictive trend detected</p>
                </div>
                <div className="mt-8 space-y-4 sm:mt-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Viral Probability</span>
                    <span className="text-foreground">82%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted dark:bg-white/10">
                    <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-[#FF8A1F] to-[#ffb783]" />
                  </div>
                </div>
              </GlassPanel>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="investment" className="scroll-mt-24 px-0 py-16 sm:py-20 md:py-24">
          <MarketingPlanGrid
            intro={{
              eyebrow: "Investment",
              title: "Scale your signal",
              description:
                "Same credit pools the API enforces—Free 50, Standard 500, Pro 2,000, Ultimate 10,000 monthly credits—with billing via Paddle.",
            }}
            className="max-w-6xl"
          />
          <p className="mx-auto mt-10 max-w-xl px-4 text-center text-sm text-muted-foreground">
            Need procurement, invoices, or a custom bundle?{" "}
            <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
              Contact sales
            </Link>
            .
          </p>
        </section>
      </main>
    </MarketingShell>
  );
}
