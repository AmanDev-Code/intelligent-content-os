"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clapperboard,
  Linkedin,
  Sparkles,
  Target,
  Video,
  Zap,
} from "lucide-react";
import { ChannelMarquee } from "@/components/marketing/ChannelMarquee";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { MARKETING_MARQUEE_CHANNELS } from "@/lib/marketing-channels";
import { cn } from "@/lib/utils";

const roadmap = [
  {
    quarter: "Q2",
    status: "Live now",
    title: "LinkedIn + core platform",
    body: "AI creation, calendar scheduling, media library, analytics, and billing are in production.",
  },
  {
    quarter: "Q3",
    status: "In progress",
    title: "Multi-channel publishing",
    body: "X, Instagram, Facebook, and YouTube scheduling with unified queue and reporting.",
  },
  {
    quarter: "Q3",
    status: "In progress",
    title: "LinkedIn outreach engine",
    body: "Intent-based connection paths to build a network and lead pipeline that fits your ICP.",
  },
  {
    quarter: "Q4",
    status: "Planned",
    title: "Twitch + Reddit expansion",
    body: "Community-led workflows and format-aware automation for conversation channels.",
  },
];

const bentoHighlights = [
  {
    icon: Zap,
    label: "Latency",
    stat: "< 2s",
    sub: "draft to variants",
    accent: "from-primary/25 to-transparent",
  },
  {
    icon: BarChart3,
    label: "Signal",
    stat: "Live",
    sub: "LinkedIn analytics",
    accent: "from-cyan-500/20 to-transparent",
  },
  {
    icon: Video,
    label: "Studio",
    stat: "1 → N",
    sub: "reels pipeline",
    accent: "from-red-500/15 to-transparent",
  },
];

export default function Landing() {
  const { session } = useAuth();
  const primaryHref = session ? "/dashboard" : "/auth";
  const primaryLabel = session ? "Open your workspace" : "Start free";

  return (
    <MarketingShell>
      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(255,138,31,0.22),transparent_50%)]" />
            <div className="absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[100px]" />
            <div className="absolute -right-24 top-1/2 h-[380px] w-[380px] rounded-full bg-red-500/10 blur-[90px]" />
            <div className="absolute bottom-0 left-1/2 h-64 w-[80%] max-w-3xl -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[80px]" />
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-6 pt-14 sm:px-6 sm:pb-8 sm:pt-16 md:pt-20">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md dark:border-white/15 dark:bg-background/50">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  The Kinetic Curator · Social workspace
                </span>
                <h1 className="mt-6 max-w-4xl font-heading text-[2.35rem] font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-[3.5rem] lg:leading-[1.02]">
                  One platform for{" "}
                  <span className="bg-gradient-to-r from-[#ffc14a] via-[#ff8a1f] to-[#ff5d4f] bg-clip-text text-transparent">
                    creation, scheduling, and signal
                  </span>
                  .
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  Trndinn is a premium control layer for teams who outgrew scattered tools—AI content, calendar truth, reels
                  prep, and analytics in one glass workspace.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white shadow-xl shadow-primary/30"
                    asChild
                  >
                    <Link href={primaryHref}>
                      {primaryLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 rounded-full border-border bg-secondary/60 hover:bg-secondary dark:border-white/20 dark:bg-background/50 dark:backdrop-blur-md" asChild>
                    <Link href="/features">Explore the platform</Link>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:gap-4">
                  {bentoHighlights.map(({ icon: Icon, label, stat, sub, accent }) => (
                    <div
                      key={label}
                      className={cn(
                        "relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 dark:border-white/10 dark:bg-gradient-to-br dark:from-card/70 dark:to-card/35 dark:shadow-xl dark:backdrop-blur-xl",
                      )}
                    >
                      <div className={cn("pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl", accent)} />
                      <div className="relative flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/40 dark:border-white/10 dark:bg-background/50">
                          <Icon className="h-5 w-5 text-primary" />
                        </span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                          <p className="mt-1 font-heading text-2xl font-black tracking-tight text-foreground">{stat}</p>
                          <p className="text-sm text-muted-foreground">{sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-y border-border/60 bg-gradient-to-b from-muted/25 via-muted/10 to-transparent dark:border-white/5">
            <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
              <p className="pb-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">
                Channels on the roadmap — LinkedIn live today
              </p>
              <ChannelMarquee channels={MARKETING_MARQUEE_CHANNELS} />
            </div>
          </div>
        </section>

        <section className="border-b border-border/60 bg-muted/20 py-8 dark:border-white/5 dark:bg-background/40 sm:py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h3 className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-foreground/90 sm:text-left">
              Ship faster
            </h3>
            {/* Mobile: tight 2 + 1 cluster — avoids full-width grid stretching */}
            <div className="mt-4 flex flex-col items-center gap-2.5 sm:hidden">
              <div className="flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-none dark:border-white/10 dark:bg-card/60">
                  <Linkedin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  LinkedIn live
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-none dark:border-white/10 dark:bg-card/60">
                  <Clapperboard className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  AI reels · roadmap
                </span>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-none dark:border-white/10 dark:bg-card/60">
                <Target className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                Outreach · Q3
              </span>
            </div>
            {/* Desktop: single relaxed row */}
            <div className="mt-4 hidden flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground sm:flex sm:justify-start">
              <span className="inline-flex items-center gap-2">
                <Linkedin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                LinkedIn publishing live
              </span>
              <span className="inline-flex items-center gap-2">
                <Clapperboard className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                AI reels on the roadmap
              </span>
              <span className="inline-flex items-center gap-2">
                <Target className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                Outreach engine in Q3
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
            <div className="rounded-[1.75rem] border border-border/80 bg-card p-8 dark:border-white/10 dark:bg-gradient-to-br dark:from-card/80 dark:to-card/40 dark:shadow-2xl dark:shadow-black/30 dark:backdrop-blur-2xl lg:col-span-7 lg:p-10">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">The engine</span>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">AI creation with brand memory</h2>
              <p className="mt-4 max-w-lg text-muted-foreground">
                From rough idea to post-ready drafts, hooks, and variants—with your tone and guardrails baked in.
              </p>
              <div className="mt-8 rounded-2xl border border-border/70 bg-muted/30 p-5 dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-md">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4 text-primary" />
                  Prompt → publish pipeline
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-muted dark:bg-white/10" />
                  <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-primary/50 to-primary/10" />
                </div>
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-border/80 bg-card p-8 dark:border-white/10 dark:bg-gradient-to-br dark:from-card/80 dark:to-card/40 dark:shadow-2xl dark:shadow-black/30 dark:backdrop-blur-2xl lg:col-span-5 lg:p-10">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">The matrix</span>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Scheduling that stays calm</h2>
              <p className="mt-4 text-muted-foreground">One calendar for queues, retries, and the windows that actually convert.</p>
              <div className="mt-8 grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square rounded-xl border transition-colors",
                      i === 2 || i === 5
                        ? "border-primary/40 bg-primary/15"
                        : "border-border/60 bg-muted/50 dark:border-white/10 dark:bg-background/40",
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/80 bg-card p-8 dark:border-white/10 dark:bg-gradient-to-br dark:from-card/80 dark:to-card/40 dark:shadow-2xl dark:shadow-black/30 dark:backdrop-blur-2xl lg:col-span-5 lg:p-10">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">The studio</span>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">One clip, all reels</h2>
              <p className="mt-4 text-muted-foreground">Upload once, reframe for vertical, layer kinetic captions, schedule per channel.</p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Smart face tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Kinetic subtitle styles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Hook-level analytics
                </li>
              </ul>
            </div>
            <div className="rounded-[1.75rem] border border-border/80 bg-card p-8 dark:border-white/10 dark:bg-gradient-to-br dark:from-card/80 dark:to-card/40 dark:shadow-2xl dark:shadow-black/30 dark:backdrop-blur-2xl lg:col-span-7 lg:p-10">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">The intelligence</span>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Analytics that tell you what to repeat</h2>
              <p className="mt-4 max-w-xl text-muted-foreground">Cadence, resonance, and patterns—not vanity charts you ignore by week two.</p>
              <div className="mt-8 flex items-end gap-2 sm:gap-3">
                {[35, 52, 40, 68, 88].map((h, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-md bg-gradient-to-t from-[#FF8A1F] to-[#ffb783]"
                    style={{ height: `${h * 1.6}px`, opacity: 0.3 + (h / 100) * 0.7 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-muted/15 py-16 dark:border-white/5">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-center font-heading text-3xl font-black text-foreground sm:text-4xl">Evolution timeline</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              A clear path from LinkedIn-first execution to full multi-channel growth.
            </p>
            <div className="relative mt-12">
              <div
                className="pointer-events-none absolute bottom-0 left-[19px] top-0 w-[2px] bg-gradient-to-b from-primary/40 via-primary/30 to-transparent sm:left-1/2 sm:-translate-x-1/2"
                aria-hidden
              />
              <div className="flex flex-col gap-10">
                {roadmap.map((item, i) => {
                  const isLeft = i % 2 === 0;
                  const isLive = item.status === "Live now";
                  return (
                    <div key={`${item.quarter}-${item.title}`}>
                      {/* Mobile: single column, left spine */}
                      <div className="relative flex items-center sm:hidden">
                        <div className="relative z-10 flex w-10 shrink-0 items-center justify-center">
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-background dark:border-[#0c101c] dark:bg-[#0c101c]",
                            )}
                          >
                            <span
                              className={cn(
                                "block h-2.5 w-2.5 rounded-full",
                                isLive ? "bg-primary shadow-[0_0_12px_rgba(255,138,31,0.5)]" : "bg-muted-foreground/40",
                              )}
                            />
                          </div>
                        </div>
                        <div className="h-[2px] w-4 shrink-0 bg-primary/40" aria-hidden />
                        <div
                          className={cn(
                            "min-w-0 flex-1 rounded-2xl border p-5",
                            "bg-card dark:bg-card/60",
                            isLive ? "border-primary/40" : "border-border/80 dark:border-white/10",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">{item.quarter}</span>
                            <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground dark:bg-white/5">
                              {item.status}
                            </span>
                          </div>
                          <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                        </div>
                      </div>

                      {/* Desktop: staggered */}
                      <div className="relative hidden items-center sm:flex">
                        {isLeft ? (
                          <>
                            <div className="flex w-[calc(50%-18px)] items-center justify-end">
                              <div
                                className={cn(
                                  "w-full max-w-sm rounded-2xl border p-5",
                                  "bg-card dark:bg-card/60",
                                  isLive ? "border-primary/40" : "border-border/80 dark:border-white/10",
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold uppercase tracking-wider text-primary">{item.quarter}</span>
                                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground dark:bg-white/5">
                                    {item.status}
                                  </span>
                                </div>
                                <h3 className="mt-3 text-right font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                                <p className="mt-2 text-right text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                              </div>
                            </div>
                            <div className="flex w-9 items-center justify-center">
                              <div className="h-[2px] flex-1 bg-primary/40" aria-hidden />
                              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-background bg-background dark:border-[#0c101c] dark:bg-[#0c101c]">
                                <span className={cn("block h-2.5 w-2.5 rounded-full", isLive ? "bg-primary shadow-[0_0_12px_rgba(255,138,31,0.5)]" : "bg-muted-foreground/40")} />
                              </div>
                              <div className="h-[2px] flex-1 bg-transparent" aria-hidden />
                            </div>
                            <div className="w-[calc(50%-18px)]" />
                          </>
                        ) : (
                          <>
                            <div className="w-[calc(50%-18px)]" />
                            <div className="flex w-9 items-center justify-center">
                              <div className="h-[2px] flex-1 bg-transparent" aria-hidden />
                              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-background bg-background dark:border-[#0c101c] dark:bg-[#0c101c]">
                                <span className={cn("block h-2.5 w-2.5 rounded-full", isLive ? "bg-primary shadow-[0_0_12px_rgba(255,138,31,0.5)]" : "bg-muted-foreground/40")} />
                              </div>
                              <div className="h-[2px] flex-1 bg-primary/40" aria-hidden />
                            </div>
                            <div className="flex w-[calc(50%-18px)] items-center justify-start">
                              <div
                                className={cn(
                                  "w-full max-w-sm rounded-2xl border p-5",
                                  "bg-card dark:bg-card/60",
                                  isLive ? "border-primary/40" : "border-border/80 dark:border-white/10",
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold uppercase tracking-wider text-primary">{item.quarter}</span>
                                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground dark:bg-white/5">
                                    {item.status}
                                  </span>
                                </div>
                                <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-red-500/5 px-8 py-12 text-center backdrop-blur-2xl dark:from-primary/20 dark:via-card/50 dark:to-red-500/10 dark:shadow-2xl dark:shadow-primary/10 sm:px-12 sm:py-14">
            <Video className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 font-heading text-3xl font-black tracking-tight sm:text-4xl">Ready to orchestrate growth?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Replace tool sprawl with one premium workflow for planning, publishing, and performance.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button className="rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white shadow-lg" asChild>
                <Link href={primaryHref}>{primaryLabel}</Link>
              </Button>
              <Button variant="outline" className="rounded-full border-border bg-secondary/60 hover:bg-secondary dark:border-white/20 dark:bg-background/40 dark:backdrop-blur-md" asChild>
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
