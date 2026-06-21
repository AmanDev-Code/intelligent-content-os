"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Bot, Building2, LineChart, Sparkles } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

type SegmentStat = { value: string; label: string };

type Segment = {
  key: string;
  icon: LucideIcon;
  tabLabel: string;
  teaser: string;
  title: string;
  body: string;
  highlights: string[];
  stats: [SegmentStat, SegmentStat];
  note: string;
  cta?: { label: string; href: string };
};

const SEGMENTS: Segment[] = [
  {
    key: "agentic",
    icon: Bot,
    tabLabel: "Agentic",
    teaser: "Agents that act, not just suggest",
    title: "Agentic creators and automation builders",
    body: "Tell Trndinn's Agent what to publish — or wire your stack via Public API v1 and signed webhooks. MCP and CLI coming soon for Claude, ChatGPT, and Cursor.",
    highlights: ["In-app Agent", "API + webhooks", "MCP coming soon"],
    stats: [
      { value: "1", label: "prompt to scheduled post" },
      { value: "API", label: "v1 + HMAC webhooks today" },
    ],
    note: "Agents draft, schedule, and publish in-product — you set the boundaries.",
    cta: { label: "See agentic workflows", href: "/features#agentic" },
  },
  {
    key: "linkedin",
    icon: Building2,
    tabLabel: "LinkedIn-first",
    teaser: "B2B depth, not breadth theater",
    title: "LinkedIn-first teams",
    body: "Personal profiles and Company Pages, posting identity picker, and Brand Voice built from your examples — not scraped from feeds.",
    highlights: ["Company Pages", "Brand Voice", "No scraping"],
    stats: [
      { value: "Live", label: "LinkedIn publishing today" },
      { value: "0", label: "feed scraping" },
    ],
    note: "Best agentic LinkedIn workflow today — more channels on the roadmap.",
  },
  {
    key: "content-engine",
    icon: LineChart,
    tabLabel: "Content Engine",
    teaser: "SEO → publish → distribute",
    title: "Growth and SEO leads",
    body: "Turn keywords into articles, distribute to 31 platforms, interlink, score SEO/AEO/GEO, and email your list — one agentic loop.",
    highlights: ["SEO articles", "31-platform distribution", "Newsletter"],
    stats: [
      { value: "31", label: "distribution platforms" },
      { value: "1", label: "keyword-to-newsletter loop" },
    ],
    note: "Social fed by search growth — not just calendar prompts.",
    cta: { label: "Explore features", href: "/features" },
  },
];

const CARD_SURFACE =
  "bg-muted/30 dark:bg-white/[0.04] transition-colors duration-300 hover:bg-muted/45 dark:hover:bg-white/[0.06] motion-reduce:transition-none";

const FOUNDER_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const FOUNDER_DRAFT_HEIGHTS = [78, 92, 68, 100, 85, 58, 44];

const CYCLING_PROMPTS = [
  "Paste your best post…",
  "Generate week of drafts…",
  "Schedule in one click…",
] as const;

const DRAFT_PIPELINE = [
  { label: "Thread hook", status: "Draft" as const, widths: ["w-[88%]", "w-[62%]", "w-[45%]"] },
  { label: "Product launch", status: "Scheduled" as const, widths: ["w-[72%]", "w-[54%]", "w-[68%]"] },
  { label: "Weekly recap", status: "Ready" as const, widths: ["w-[94%]", "w-[48%]", "w-[58%]"] },
] as const;

const STATUS_STYLES: Record<(typeof DRAFT_PIPELINE)[number]["status"], string> = {
  Draft: "bg-muted-foreground/15 text-muted-foreground",
  Scheduled: "bg-primary/15 text-primary",
  Ready: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

const CLIENTS = [
  { name: "Acme Co.", initial: "A", tone: "Professional", voice: ["w-[90%]", "w-[58%]"] },
  { name: "Northwind", initial: "N", tone: "Playful", voice: ["w-[76%]", "w-[66%]"] },
  { name: "Studio 9", initial: "S", tone: "Bold", voice: ["w-[84%]", "w-[50%]"] },
] as const;

const GROWTH_DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const GROWTH_TIMES: Record<number, string[]> = {
  0: ["9:00", "14:30"],
  1: ["11:00"],
  2: ["12:30"],
  3: ["10:00", "16:45"],
  4: ["8:30"],
  5: ["8:15", "13:00"],
  6: ["10:30"],
};

const TOP_POSTS = [
  { label: "Tue", h: 48 },
  { label: "Thu", h: 72 },
  { label: "Sat", h: 91 },
] as const;

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

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function useCyclingIndex(length: number, intervalMs: number, enabled: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled || length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs, length]);

  return index;
}

function MockLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
      {children}
    </span>
  );
}

function SkeletonLine({ className, shimmer = false }: { className?: string; shimmer?: boolean }) {
  return (
    <div
      className={cn(
        "relative h-1.5 overflow-hidden rounded-full bg-foreground/10",
        className,
        shimmer && "motion-safe:animate-shimmer motion-reduce:animate-none",
      )}
    />
  );
}

function TypewriterPrompt() {
  const reduced = usePrefersReducedMotion();
  const index = useCyclingIndex(CYCLING_PROMPTS.length, 3200, !reduced);

  return (
    <div
      className="flex min-w-0 items-center gap-2 rounded-xl bg-background/40 px-3 py-2 dark:bg-white/[0.03]"
      aria-hidden
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/15">
        <Sparkles className="h-3 w-3 text-primary" />
      </span>
      <span
        className={cn(
          "min-w-0 truncate text-xs font-medium text-muted-foreground transition-opacity duration-500",
          !reduced && "motion-safe:opacity-100",
        )}
        key={reduced ? "static" : index}
      >
        {reduced ? CYCLING_PROMPTS[0] : CYCLING_PROMPTS[index]}
      </span>
      {!reduced ? (
        <span className="ml-auto h-3.5 w-0.5 shrink-0 bg-primary/60 motion-safe:animate-pulse motion-reduce:hidden" />
      ) : null}
    </div>
  );
}

function DraftPipeline() {
  return (
    <div className="space-y-2" aria-hidden>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <MockLabel>Draft pipeline</MockLabel>
        <span className="text-[9px] font-medium tabular-nums text-muted-foreground/70">3 active</span>
      </div>

      <div className="space-y-1.5">
        {DRAFT_PIPELINE.map((draft, i) => (
          <div
            key={draft.label}
            className={cn(
              "min-w-0 rounded-xl bg-background/50 p-2.5 transition-colors duration-300 dark:bg-white/[0.03]",
              "group-hover:bg-background/70 dark:group-hover:bg-white/[0.05]",
              "motion-reduce:transition-none",
            )}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className="flex min-w-0 items-center justify-between gap-2">
              <span className="truncate text-[11px] font-semibold text-foreground/90">{draft.label}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                  STATUS_STYLES[draft.status],
                  draft.status === "Draft" && "motion-safe:animate-pulse motion-reduce:animate-none",
                )}
              >
                {draft.status}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {draft.widths.map((w, j) => (
                <SkeletonLine
                  key={j}
                  className={w}
                  shimmer={draft.status === "Draft" && j === 0}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FoundersVisual() {
  const { ref, inView } = useInView(0.15);
  const reduced = usePrefersReducedMotion();
  const barsActive = inView || reduced;

  return (
    <div ref={ref} className="flex h-full min-h-0 flex-col justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-4">
        <TypewriterPrompt />
        <DraftPipeline />
      </div>

      <div className="min-w-0 rounded-2xl bg-background/50 p-4 dark:bg-white/[0.03]" aria-hidden>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <MockLabel>Sample week</MockLabel>
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {["1 brand", "7 drafts", "5 scheduled"].map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-background/60 px-2 py-0.5 text-[9px] font-semibold text-muted-foreground transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary motion-reduce:transition-none dark:bg-white/[0.06]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 grid min-w-0 grid-cols-7 gap-0.5 sm:gap-1">
          {FOUNDER_DAYS.map((day, i) => (
            <div key={day} className="flex min-w-0 flex-col items-center gap-1">
              <span className="text-[8px] font-medium text-muted-foreground sm:text-[9px]">
                <span className="sm:hidden">{day[0]}</span>
                <span className="hidden sm:inline">{day}</span>
              </span>
              <div className="relative flex h-[4.5rem] w-full min-w-0 items-end justify-center rounded-md bg-background/40 dark:bg-white/[0.04] sm:h-20">
                <div
                  className={cn(
                    "w-[62%] max-w-full origin-bottom rounded-sm bg-gradient-to-t from-[#ff8a1f] to-[#ffb783] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                    barsActive ? "scale-y-100" : "scale-y-[0.2]",
                    "group-hover:brightness-110 motion-reduce:brightness-100",
                  )}
                  style={{
                    height: `${FOUNDER_DRAFT_HEIGHTS[i]}%`,
                    transitionDelay: barsActive ? `${i * 50}ms` : "0ms",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgencyVisual() {
  const reduced = usePrefersReducedMotion();
  const activeIndex = useCyclingIndex(CLIENTS.length, 2800, !reduced);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <MockLabel>Client voices</MockLabel>
        <span className="inline-flex items-center gap-1 rounded-full bg-background/60 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary motion-reduce:transition-none dark:bg-white/[0.06]">
          <Sparkles className="h-3 w-3 text-primary/80" aria-hidden />
          Brand Kit
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-2.5" aria-hidden>
        {CLIENTS.map((client, i) => {
          const isActive = reduced ? i === 0 : i === activeIndex;
          return (
            <div
              key={client.name}
              className={cn(
                "flex min-w-0 items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                isActive
                  ? "bg-primary/10 dark:bg-primary/15"
                  : "bg-background/40 dark:bg-white/[0.03]",
                "group-hover:bg-primary/10 dark:group-hover:bg-primary/15",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-opacity duration-500 motion-reduce:transition-none",
                  isActive
                    ? "bg-gradient-to-br from-[#ff8a1f] to-[#ff3d39] text-white motion-safe:animate-pulse motion-reduce:animate-none"
                    : "bg-background/70 text-muted-foreground dark:bg-white/[0.08]",
                )}
              >
                {client.initial}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <p
                    className={cn(
                      "truncate text-xs font-semibold transition-colors duration-300 motion-reduce:transition-none sm:text-sm",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {client.name}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium transition-colors duration-300 motion-reduce:transition-none",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "bg-muted-foreground/10 text-muted-foreground/80",
                    )}
                  >
                    {client.tone}
                  </span>
                </div>
                <div className="mt-2 space-y-1.5">
                  {client.voice.map((w, j) => (
                    <SkeletonLine key={j} className={w} shimmer={isActive && j === 0} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GrowthVisual() {
  const { ref, inView } = useInView(0.15);
  const reduced = usePrefersReducedMotion();
  const barsActive = inView || reduced;

  return (
    <div ref={ref} className="flex h-full min-h-0 flex-col justify-between gap-4">
      <div className="space-y-3">
        <MockLabel>Your calendar</MockLabel>

        <div className="grid min-w-0 grid-cols-7 gap-px sm:gap-0.5 md:gap-1" aria-hidden>
          {GROWTH_DAYS.map((d, i) => {
            const times = GROWTH_TIMES[i] ?? [];
            const hasPosts = times.length > 0;
            return (
              <div key={`${d}-${i}`} className="flex min-w-0 flex-col">
                <span className="mb-0.5 text-center text-[8px] font-medium text-muted-foreground sm:text-[9px] md:mb-1 md:text-[11px]">
                  {d}
                </span>
                <div
                  className={cn(
                    "flex min-h-[52px] min-w-0 flex-col gap-0.5 rounded-md p-0.5 transition-colors duration-300 sm:min-h-[64px] sm:p-1 md:min-h-[78px] md:gap-1 md:p-1.5 motion-reduce:transition-none",
                    hasPosts
                      ? "bg-primary/8 group-hover:bg-primary/12 dark:bg-primary/10"
                      : "bg-background/50 dark:bg-white/[0.04]",
                  )}
                >
                  {times.map((time) => (
                    <span
                      key={time}
                      className="flex w-full min-w-0 items-center justify-center rounded-sm bg-gradient-to-b from-primary/25 to-[#ff3d39]/15 px-0.5 py-0.5 text-[9px] font-bold tabular-nums leading-none text-foreground transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none sm:text-[10px] md:rounded-md md:px-1 md:py-1 md:text-xs lg:text-sm"
                    >
                      {time}
                    </span>
                  ))}
                  {!hasPosts ? (
                    <span className="flex flex-1 items-center justify-center text-[9px] text-muted-foreground/30 md:text-xs">
                      ·
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-background/50 p-3 dark:bg-white/[0.03]" aria-hidden>
        <div className="flex min-w-0 items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
              Top posts this week
            </p>
            <p className="mt-0.5 text-[9px] text-muted-foreground/60">Engagement trend</p>
          </div>
          <div className="flex shrink-0 items-end gap-2">
            {TOP_POSTS.map(({ label, h }, i) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="relative flex h-14 w-3 items-end sm:w-3.5">
                  <div
                    className={cn(
                      "w-full origin-bottom rounded-sm bg-gradient-to-t from-primary/80 to-primary/30 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                      barsActive ? "scale-y-100" : "scale-y-[0.25]",
                      "group-hover:from-primary group-hover:to-primary/40",
                    )}
                    style={{
                      height: `${h}%`,
                      transitionDelay: barsActive ? `${i * 90}ms` : "0ms",
                    }}
                  />
                </div>
                <span className="text-[7px] font-medium text-muted-foreground/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const VISUALS: Record<string, () => ReactNode> = {
  agentic: FoundersVisual,
  linkedin: AgencyVisual,
  "content-engine": GrowthVisual,
};

function ActivePanel({ segment }: { segment: Segment }) {
  const Icon = segment.icon;
  const Visual = VISUALS[segment.key];

  return (
    <div className="relative min-w-0">
      {/* Soft radial glow fills the narrative-side whitespace on desktop. Borderless, shadowless, decorative only. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-1/2 hidden h-72 w-72 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-3xl lg:block dark:bg-primary/[0.08]"
      />

      <div className="relative grid min-w-0 gap-7 lg:grid-cols-2 lg:items-stretch lg:gap-10">
        {/* Narrative column: top-aligned with an outcome strip + accent note so it fills the mock height with intent. */}
        <div className="flex min-w-0 flex-col">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background/60 dark:bg-white/[0.06]">
            <Icon
              className="h-6 w-6 text-primary transition-colors duration-300 group-hover:text-[#ff8a1f] motion-reduce:transition-none"
              aria-hidden
            />
          </span>

          <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {segment.title}
          </h3>

          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
            {segment.body}
          </p>

          <ul className="mt-5 flex min-w-0 flex-wrap gap-2">
            {segment.highlights.map((item) => (
              <li
                key={item}
                className="rounded-full bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground dark:bg-white/[0.06]"
              >
                {item}
              </li>
            ))}
          </ul>

          {/* Outcome strip: borderless metric pair that anchors the column with real signal. */}
          <dl className="mt-7 flex min-w-0 flex-wrap gap-x-10 gap-y-4">
            {segment.stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <dt className="font-display text-2xl font-bold leading-none tracking-tight text-foreground sm:text-3xl">
                  {stat.value}
                </dt>
                <dd className="mt-1.5 max-w-[14rem] text-xs leading-snug text-foreground/75">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>

          {/* Accent note: thin gradient rule + supporting microcopy for added rhythm. */}
          <div className="mt-6 flex min-w-0 items-start gap-3">
            <span
              aria-hidden
              className="mt-1 h-9 w-0.5 shrink-0 rounded-full bg-gradient-to-b from-[#ff8a1f] to-[#ff3d39]"
            />
            <p className="min-w-0 text-sm leading-relaxed text-muted-foreground/90">
              {segment.note}
            </p>
          </div>

          {segment.cta ? (
            <Link
              href={segment.cta.href}
              className="mt-7 inline-flex w-fit cursor-pointer items-center gap-1 text-sm font-semibold text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {segment.cta.label}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                aria-hidden
              />
            </Link>
          ) : null}
        </div>

        {/* Mock column: stable min-height on desktop; each mock flex-fills it */}
        <div className="min-w-0">
          <div className="flex h-full min-h-0 flex-col rounded-2xl bg-background/40 p-4 dark:bg-white/[0.02] sm:p-5 lg:min-h-[24rem]">
            {Visual ? <Visual /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonaShowcase() {
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (next: number) => {
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = SEGMENTS.length - 1;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTab(index === last ? 0 : index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTab(index === 0 ? last : index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(last);
        break;
      default:
        break;
    }
  };

  const activeSegment = SEGMENTS[active];

  return (
    <div className="min-w-0">
      <div
        role="tablist"
        aria-label="Who Trndinn is for"
        className="grid min-w-0 gap-3 sm:grid-cols-3 sm:gap-4"
      >
        {SEGMENTS.map((segment, i) => {
          const Icon = segment.icon;
          const isActive = i === active;
          return (
            <button
              key={segment.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`persona-tab-${segment.key}`}
              aria-selected={isActive}
              aria-controls={`persona-panel-${segment.key}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(event) => onKeyDown(event, i)}
              className={cn(
                "group flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl p-4 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none motion-reduce:transition-none",
                isActive
                  ? "bg-primary/10 dark:bg-primary/[0.14]"
                  : CARD_SURFACE,
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 motion-reduce:transition-none",
                  isActive
                    ? "bg-primary/15"
                    : "bg-background/60 dark:bg-white/[0.06]",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-300 motion-reduce:transition-none",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                  )}
                  aria-hidden
                />
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate font-display text-sm font-bold tracking-tight transition-colors duration-300 motion-reduce:transition-none sm:text-base",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {segment.tabLabel}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground/80">
                  {segment.teaser}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 sm:mt-5">
        <div
          key={reduced ? "static" : active}
          role="tabpanel"
          id={`persona-panel-${activeSegment.key}`}
          aria-labelledby={`persona-tab-${activeSegment.key}`}
          className={cn(
            "group min-w-0 overflow-hidden rounded-[1.75rem] p-5 sm:p-7 lg:p-8",
            CARD_SURFACE,
            !reduced && "animate-fade-in-up",
          )}
        >
          <ActivePanel segment={activeSegment} />
        </div>
      </div>
    </div>
  );
}

export function AudienceSegments() {
  return (
    <Section id="who-its-for">
      <SectionHeading
        eyebrow="WHO IT'S FOR"
        title="Who is Trndinn for?"
        subtitle="Agentic creators, LinkedIn-first teams, and growth leads who want one platform — not five tabs."
      />

      <Reveal className="mt-8 min-w-0 md:mt-10">
        <PersonaShowcase />
      </Reveal>
    </Section>
  );
}
