"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarDays,
  Check,
  FileText,
  Image,
  Layers,
  Repeat,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

type Pillar = { key?: string; title?: string; body?: string };

const ICONS: Record<string, LucideIcon> = {
  generate: Sparkles,
  schedule: CalendarDays,
  publish: Send,
  analyze: BarChart3,
};

/** Fixed mock band height — all four cards share this vertical slice for row symmetry. */
const MOCK_BAND = "min-h-[148px]";

/** Shared inner preview surface; fills the mock band as a flex column. */
const MOCK_SURFACE =
  "flex h-full min-h-[148px] flex-col rounded-2xl bg-background/70 p-3.5 dark:bg-white/[0.03]";
const CHIP =
  "rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground dark:bg-white/[0.06]";

const GENERATE_LINES = [
  { w: "w-full", accent: false },
  { w: "w-11/12", accent: false },
  { w: "w-10/12", accent: false },
  { w: "w-2/3", accent: true },
] as const;

const GENERATE_TONES = ["Confident", "Warm", "Punchy"] as const;

const CONTENT_FORMATS: { icon: LucideIcon; label: string }[] = [
  { icon: FileText, label: "Post" },
  { icon: Image, label: "Image" },
  { icon: Layers, label: "Carousel" },
];

const MATCH_BY_STEP = [48, 68, 82, 94] as const;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

/** Cycles 1..lineCount so draft lines appear one-by-one, then resets. */
function useDraftReveal(lineCount: number, enabled: boolean) {
  const [visible, setVisible] = useState(enabled ? 1 : lineCount);

  useEffect(() => {
    if (!enabled) {
      setVisible(lineCount);
      return;
    }
    setVisible(1);
    const id = window.setInterval(() => {
      setVisible((prev) => (prev >= lineCount ? 1 : prev + 1));
    }, 750);
    return () => window.clearInterval(id);
  }, [enabled, lineCount]);

  return visible;
}

/** Compact outcome cue per card — turns the bottom space into a conversion signal. */
const OUTCOMES: string[] = [
  "On-brand in seconds, every time",
  "Set it once, runs for weeks",
  "Out the door on time, automatically",
  "See what works, do more of it",
];

/** Generate — Brand Voice draft composer with live drafting micro-motion. */
function GenerateMock() {
  const reduced = usePrefersReducedMotion();
  const visibleLines = useDraftReveal(GENERATE_LINES.length, !reduced);
  const matchPct = reduced ? 94 : MATCH_BY_STEP[visibleLines - 1];

  return (
    <div className={MOCK_SURFACE}>
      <div className="flex shrink-0 items-center gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5 dark:bg-white/[0.05]">
        <Sparkles className="h-3 w-3 shrink-0 text-primary" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
          Write a launch post in our voice...
        </span>
        {!reduced ? (
          <span
            className="h-3 w-0.5 shrink-0 bg-primary/70 motion-safe:animate-pulse motion-reduce:hidden"
            aria-hidden
          />
        ) : null}
      </div>

      {/* Content format selector — cycles through formats in sync with generation */}
      <div className="mt-2 flex shrink-0 items-center gap-1.5" aria-hidden>
        {CONTENT_FORMATS.map((fmt, i) => {
          const isActive = reduced ? i === 0 : i === (visibleLines - 1) % CONTENT_FORMATS.length;
          const FormatIcon = fmt.icon;
          return (
            <span
              key={fmt.label}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2 text-[10px] font-medium transition-all duration-300 motion-reduce:transition-none",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "bg-muted/50 text-muted-foreground/70 dark:bg-white/[0.04]",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors duration-300 motion-reduce:transition-none",
                  isActive
                    ? "bg-gradient-to-br from-primary/30 to-primary/10"
                    : "bg-transparent",
                )}
              >
                <FormatIcon
                  className={cn(
                    "h-3 w-3 shrink-0 transition-colors duration-300 motion-reduce:transition-none",
                    isActive
                      ? "text-primary drop-shadow-[0_1px_1px_rgba(255,138,31,0.35)]"
                      : "text-muted-foreground/60",
                  )}
                  aria-hidden
                />
              </span>
              {fmt.label}
            </span>
          );
        })}
      </div>

      <div className="mt-1.5 flex shrink-0 items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Brand Voice
        </span>
        <span className="truncate text-[11px] font-medium text-muted-foreground">
          from your examples
        </span>
      </div>

      <div
        className="mt-2 flex min-h-0 flex-1 flex-col rounded-xl bg-muted/25 px-2.5 py-2 dark:bg-white/[0.03]"
        aria-hidden
      >
        <div className="flex shrink-0 items-center gap-1.5 text-[9px] font-medium text-muted-foreground">
          {!reduced ? (
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary/40 motion-safe:animate-ping motion-reduce:hidden" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
          ) : null}
          <span className={cn(!reduced && "motion-safe:animate-pulse motion-reduce:animate-none")}>
            Generating...
          </span>
        </div>

        <div className="mt-1.5 flex flex-1 flex-col justify-center space-y-1.5">
          {GENERATE_LINES.map((line, i) => {
            const active = i < visibleLines;
            const typing = !reduced && i === visibleLines - 1;
            return (
              <div
                key={i}
                className={cn(
                  "relative h-2 overflow-hidden rounded-full transition-all duration-500 ease-out motion-reduce:transition-none",
                  line.w,
                  line.accent
                    ? "bg-gradient-to-r from-primary/70 to-primary/20"
                    : "bg-foreground/10",
                  active ? "opacity-100" : "opacity-20",
                  typing && "motion-safe:animate-shimmer motion-reduce:animate-none",
                  line.accent &&
                    active &&
                    "group-hover:w-11/12 motion-reduce:group-hover:w-2/3",
                )}
              />
            );
          })}
        </div>

        <div className="mt-1.5 flex shrink-0 items-center gap-1.5">
          <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary/35 transition-[width] duration-700 ease-out motion-reduce:transition-none"
              style={{ width: `${matchPct}%` }}
            />
          </div>
          <span className="shrink-0 text-[9px] font-medium tabular-nums text-muted-foreground/80">
            {matchPct}%
          </span>
        </div>
      </div>

      <div className="mt-2 flex shrink-0 items-end justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {GENERATE_TONES.map((tone, i) => (
            <span
              key={tone}
              className={cn(
                CHIP,
                "transition-all duration-300 motion-reduce:transition-none",
                "opacity-90 group-hover:opacity-100 group-hover:-translate-y-px",
              )}
              style={{ transitionDelay: `${i * 55}ms` }}
            >
              {tone}
            </span>
          ))}
        </div>
        <span
          className={cn(
            "shrink-0 text-[10px] font-semibold tabular-nums text-primary transition-transform duration-500",
            "group-hover:scale-105 motion-reduce:group-hover:scale-100",
          )}
        >
          {matchPct}% match
        </span>
      </div>
    </div>
  );
}

/** Schedule — a compact month calendar (no social icons). */
function ScheduleMock() {
  const scheduled = new Set([2, 5, 10, 16, 19, 23]);
  return (
    <div className={MOCK_SURFACE}>
      <div className="flex shrink-0 items-center justify-between gap-2">
        <span className="text-xs font-semibold text-foreground">March</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          <Repeat className="h-3 w-3" aria-hidden />
          Recurring
        </span>
      </div>
      <div className="mt-2 grid shrink-0 grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-1.5 grid flex-1 grid-cols-7 content-start gap-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "aspect-square min-w-0 rounded-md transition-colors duration-300",
              scheduled.has(i)
                ? "bg-primary/30 group-hover:bg-primary/45"
                : "bg-muted/50 dark:bg-white/[0.05]",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Publish — a delivery queue with statuses and live progress. */
function PublishMock() {
  const rows = [
    { done: true, w: "w-3/4", label: "Published", channel: "LinkedIn" },
    { done: true, w: "w-2/3", label: "Published", channel: "X" },
    { done: false, w: "w-5/6", label: "Queued", channel: "Instagram" },
    { done: false, w: "w-1/2", label: "Queued", channel: "Threads" },
  ];
  return (
    <div className={MOCK_SURFACE}>
      <div className="flex shrink-0 items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary/50 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Publishing
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">4 in queue</span>
      </div>
      <div className="mt-2 flex flex-1 flex-col justify-center space-y-1.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-md",
                row.done
                  ? "bg-primary/15 text-primary"
                  : "bg-muted/60 text-muted-foreground dark:bg-white/[0.06]",
              )}
            >
              {row.done ? (
                <Check className="h-2.5 w-2.5" aria-hidden />
              ) : (
                <span className="h-1 w-1 rounded-full bg-current" />
              )}
            </span>
            <span className={cn("h-2 min-w-0 flex-1 rounded-full bg-foreground/10", row.w)} />
            <span className="w-14 shrink-0 truncate text-[9px] font-medium text-muted-foreground">
              {row.channel}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 shrink-0 space-y-1.5">
        <div className="h-1 overflow-hidden rounded-full bg-muted/60 dark:bg-white/[0.06]">
          <div className="h-full w-3/5 rounded-full bg-primary/55 transition-all duration-500 group-hover:w-4/5" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">Next up in ~12m</span>
          <div className="flex flex-wrap gap-1">
            {["Retry-safe", "Within 60s"].map((chip) => (
              <span key={chip} className={CHIP}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Analyze — an engagement snapshot with bars + KPIs. */
function AnalyzeMock() {
  const bars = [34, 52, 41, 70, 88, 62, 76];
  const kpis = [
    { label: "Reach", value: "18.2k" },
    { label: "Clicks", value: "1,940" },
    { label: "Saves", value: "612" },
  ];
  return (
    <div className={MOCK_SURFACE}>
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground">Engagement</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              +24%
            </span>
            <TrendingUp className="h-3.5 w-3.5 text-primary" aria-hidden />
          </div>
        </div>
        <span className={CHIP}>Last 7 days</span>
      </div>
      <div className="mt-2 flex min-h-[3.5rem] flex-1 items-end gap-1.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="min-w-0 flex-1 origin-bottom rounded-md bg-gradient-to-t from-[#ff8a1f] to-[#ffb783] transition-transform duration-500 group-hover:scale-y-110"
            style={{ height: `${h}%`, opacity: 0.4 + (h / 100) * 0.6 }}
          />
        ))}
      </div>
      <div className="mt-2 grid shrink-0 grid-cols-3 gap-2">
        {kpis.map((kpi) => (
          <div key={kpi.label}>
            <div className="font-display text-sm font-bold text-foreground">{kpi.value}</div>
            <div className="text-[10px] font-medium text-muted-foreground">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MOCKS = [GenerateMock, ScheduleMock, PublishMock, AnalyzeMock];

export function BentoFeatures({
  title,
  subtitle,
  items,
}: {
  title?: string;
  subtitle?: string;
  items: Pillar[];
}) {
  return (
    <Section>
      <SectionHeading
        eyebrow="The workflow"
        title={title ?? "From prompt to published, one calm workflow"}
        subtitle={subtitle}
      />

      <div className="mt-8 grid items-stretch gap-4 md:mt-10 md:grid-cols-2 lg:gap-5">
        {items.map((item, index) => {
          const Icon = ICONS[item.key ?? ""] ?? Sparkles;
          const Mock = MOCKS[index % MOCKS.length];
          const outcome = OUTCOMES[index % OUTCOMES.length];
          return (
            <Reveal key={item.key ?? index} delay={index * 90} className="h-full">
              <div
                className={cn(
                  "group relative flex h-full min-w-0 w-full max-w-full flex-col overflow-hidden rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6",
                  "bg-muted/30 dark:bg-white/[0.04]",
                )}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

                {/* Zone 1: Header (fixed) */}
                <div className="relative shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </span>
                    <h3 className="min-w-0 font-display text-xl font-bold tracking-tight text-foreground">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-2 line-clamp-3 min-h-[4.125rem] text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>

                {/* Zone 2: Mock band (fixed min-height, no void above) */}
                <div className={cn("relative mt-4 shrink-0", MOCK_BAND)}>
                  <Mock />
                </div>

                {/* Zone 3: Outcome cue (pinned to card bottom) */}
                <div className="relative mt-auto flex shrink-0 items-center gap-2 pt-4 text-xs font-medium text-foreground/70">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0">{outcome}</span>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
