"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ImageIcon,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

type Cta = { label?: string; href?: string };

export type LandingHeroContent = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  trustLine?: string;
};

/**
 * Splits the title so a single keyword renders with the animated brand gradient.
 * Prefers a known marketing keyword; otherwise falls back to the final word so
 * editor-customized titles still get a tasteful accent.
 */
function renderGradientTitle(title: string): ReactNode {
  const preferred = ["agents", "agentic", "autopilot", "control", "you control", "automatically", "on-brand"];
  const lower = title.toLowerCase();
  let match = preferred.find((kw) => lower.includes(kw));

  if (!match) {
    const words = title.trim().split(/\s+/);
    match = words[words.length - 1] ?? "";
  }
  if (!match) return title;

  const idx = lower.indexOf(match.toLowerCase());
  if (idx === -1) return title;

  const before = title.slice(0, idx);
  const hit = title.slice(idx, idx + match.length);
  const after = title.slice(idx + match.length);

  return (
    <>
      {before}
      <span className="text-gradient-brand motion-safe:animate-gradient-x">{hit}</span>
      {after}
    </>
  );
}

export function LandingHero({
  hero,
  loading,
}: {
  hero: LandingHeroContent;
  loading?: boolean;
}) {
  const eyebrow = hero.eyebrow ?? "All-in-one agentic social platform";
  const title = hero.title ?? "Run your social growth on autopilot with AI agents";
  const subtitle =
    hero.subtitle ??
    "Trndinn's agents draft on-brand posts from the examples you provide, schedule them on a visual calendar, and publish to the accounts you connect.";
  const primaryCta = hero.primaryCta ?? { label: "Start free — 150 credits", href: "/auth" };
  const secondaryCta = hero.secondaryCta ?? { label: "See agentic workflows", href: "/features#agentic" };
  const trustLine = hero.trustLine ?? "No card required. 150 free credits to start.";

  return (
    <section className="relative isolate overflow-hidden">
      {/* No opaque base fill — the hero sits on the one page canvas (MarketingShell).
          Only soft in-flow accents (radial glow + blobs + masked grid) sit on top and
          fade out, so the richer top melts seamlessly into the rest of the page. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(255,138,31,0.28),transparent_55%)]" />
      <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[460px] w-[460px] rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
      <div className="pointer-events-none absolute -right-24 top-1/3 -z-10 h-[420px] w-[420px] rounded-full bg-[#ff3d39]/10 blur-3xl dark:bg-[#ff3d39]/20" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-72 w-[80%] max-w-3xl -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[90px] dark:bg-cyan-500/10" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5] dark:opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--foreground) / 0.07) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.07) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent 75%)",
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-10 sm:gap-10 sm:px-6 sm:pb-16 sm:pt-16 md:pb-20 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* Copy column */}
        <div className="text-center lg:text-left">
          <Reveal immediate>
            <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/70 backdrop-blur-md dark:bg-white/5 dark:text-white/80">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              {eyebrow}
            </span>
          </Reveal>

          <Reveal immediate>
            <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.1] tracking-tight text-foreground sm:mt-6 sm:text-5xl sm:leading-[1.05] md:text-6xl lg:text-[4.1rem]">
              {renderGradientTitle(title)}
            </h1>
          </Reveal>

          <Reveal immediate>
            <p
              className={cn(
                "mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-foreground/80 sm:mt-6 sm:max-w-2xl sm:text-lg lg:mx-0",
                loading && "animate-pulse",
              )}
            >
              {subtitle}
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                className="h-12 w-full rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
                asChild
              >
                <Link href={primaryCta.href ?? "/auth"}>
                  {primaryCta.label ?? "Start free"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-full border-0 bg-muted/70 px-8 font-semibold text-foreground backdrop-blur-md hover:bg-muted hover:text-foreground dark:bg-white/10 dark:text-white dark:hover:bg-white/[0.16] dark:hover:text-white sm:w-auto"
                asChild
              >
                <Link href={secondaryCta.href ?? "/features#agentic"}>{secondaryCta.label ?? "See agentic workflows"}</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground sm:mt-6 lg:justify-start">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" aria-hidden />
              {trustLine}
            </p>
          </Reveal>
        </div>

        {/* Product visual mock */}
        <Reveal delay={160} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <HeroComposerMock />
        </Reveal>
      </div>
    </section>
  );
}

/** Pure CSS/JSX glass mock of the composer + calendar. No external images. */
function HeroComposerMock() {
  return (
    <div className="relative">
      {/* soft halo behind the card */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/30 via-[#ff3d39]/15 to-transparent blur-2xl" />

      {/* Composer card */}
      <div className="relative rounded-3xl bg-card/90 p-5 backdrop-blur-2xl dark:bg-white/[0.06] sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff8a1f] to-[#ff3d39] text-sm font-black text-white">
              T
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">New post</p>
              <p className="text-[11px] text-muted-foreground">Brand Voice · from your examples</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A66C2]/12 px-2.5 py-1 text-[11px] font-semibold text-[#0A66C2] dark:bg-[#0A66C2]/20 dark:text-[#7fb6ff]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0A66C2] dark:bg-[#4d97ff]" />
            LinkedIn
          </span>
        </div>

        {/* Draft body */}
        <div className="mt-4 space-y-2 rounded-2xl bg-muted/50 p-4 dark:bg-white/[0.05]">
          <div className="h-2.5 w-3/4 rounded-full bg-foreground/20" />
          <div className="h-2.5 w-full rounded-full bg-foreground/10" />
          <div className="h-2.5 w-5/6 rounded-full bg-foreground/10" />
          <div className="h-2.5 w-2/3 rounded-full bg-gradient-to-r from-primary/70 to-primary/10" />
        </div>

        {/* Media + actions */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted/50 dark:bg-white/[0.05]">
            <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-1/2 rounded-full bg-foreground/15" />
            <div className="h-2 w-1/3 rounded-full bg-foreground/10" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden />
            Tue · 9:00 AM
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-3.5 py-1.5 text-xs font-semibold text-white">
            <Send className="h-3.5 w-3.5" aria-hidden />
            Schedule
          </span>
        </div>
      </div>

      {/* Floating accent — mini calendar */}
      <div className="absolute -bottom-8 -left-4 hidden w-44 rotate-[-4deg] rounded-2xl bg-card/90 p-3 backdrop-blur-2xl animate-float dark:bg-white/[0.07] sm:block">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">This week</p>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 21 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "aspect-square rounded-[4px]",
                i === 4 || i === 10 || i === 16
                  ? "bg-gradient-to-br from-[#ff8a1f] to-[#ff3d39]"
                  : "bg-foreground/10",
              )}
            />
          ))}
        </div>
      </div>

      {/* Floating accent — published pill (kept inside bounds so it never clips on mobile) */}
      <div className="absolute -top-3 right-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-600 backdrop-blur-xl animate-float dark:text-emerald-300 sm:-right-3 sm:-top-5 [animation-delay:1.2s]">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        Published
      </div>
    </div>
  );
}
