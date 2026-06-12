"use client";

import { CheckCircle2, Circle, Loader, type LucideIcon } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

type Phase = { tag?: string; name?: string; value?: string };
type Lane = {
  key?: string;
  label?: string;
  caption?: string;
  status?: "live" | "progress" | "planned" | string;
  phases?: Phase[];
};

export type RoadmapContent = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  legendLive?: string;
  legendProgress?: string;
  legendPlanned?: string;
  lanes?: Lane[];
};

const STATUS_STYLE: Record<
  string,
  { Icon: LucideIcon; dot: string; chip: string; accent: string; spin?: boolean }
> = {
  live: {
    Icon: CheckCircle2,
    dot: "bg-emerald-500",
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    accent: "from-emerald-400 to-emerald-500/30",
  },
  progress: {
    Icon: Loader,
    dot: "bg-primary",
    chip: "bg-primary/10 text-primary",
    accent: "from-primary to-primary/30",
    spin: true,
  },
  planned: {
    Icon: Circle,
    dot: "bg-muted-foreground/50",
    chip: "bg-muted/60 text-muted-foreground dark:bg-white/[0.07]",
    accent: "from-muted-foreground/40 to-transparent",
  },
};

function styleFor(status?: string) {
  return STATUS_STYLE[(status ?? "planned").toLowerCase()] ?? STATUS_STYLE.planned;
}

/** One compact phase card that lives on a horizontal scroll-snap rail. */
function PhaseCard({ phase, accent, dot }: { phase: Phase; accent: string; dot: string }) {
  return (
    <li className="shrink-0 snap-start">
      <div className="flex h-full w-[13.5rem] flex-col overflow-hidden rounded-2xl bg-card/70 p-4 backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 dark:bg-white/[0.04] sm:w-[15.5rem]">
        <span className={cn("h-1 w-9 rounded-full bg-gradient-to-r", accent)} aria-hidden />
        <div className="mt-3 flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot)} aria-hidden />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {phase.tag}
          </span>
        </div>
        <p className="mt-1.5 font-display text-[0.95rem] font-bold leading-snug tracking-tight text-foreground">
          {phase.name}
        </p>
        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{phase.value}</p>
      </div>
    </li>
  );
}

export function ProductRoadmap({ content }: { content: RoadmapContent }) {
  const lanes = content.lanes ?? [];
  const legend = [
    { label: content.legendLive ?? "Live", style: STATUS_STYLE.live },
    { label: content.legendProgress ?? "In progress", style: STATUS_STYLE.progress },
    { label: content.legendPlanned ?? "Planned", style: STATUS_STYLE.planned },
  ];

  return (
    <Section id="roadmap">
      {/* Soft in-flow accent only; no block background or seams. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,hsl(var(--primary)/0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(255,138,31,0.12),transparent_70%)]" />

      <SectionHeading
        eyebrow={content.eyebrow ?? "Product roadmap"}
        title={content.title ?? "Where Trndinn is today, and where it is headed"}
        subtitle={content.subtitle}
      />

      <Reveal className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {legend.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className={cn("h-2.5 w-2.5 rounded-full", l.style.dot)} />
            {l.label}
          </span>
        ))}
      </Reveal>

      {/* Three short status rails (Now / Next / Later). Each lane is ONE horizontal
          scroll-snap row regardless of how many phases it holds, so the section
          stays compact on every screen and never becomes an endless mobile stack. */}
      <div className="mt-10 space-y-8 sm:space-y-10">
        {lanes.map((lane, laneIndex) => {
          const s = styleFor(lane.status);
          const count = lane.phases?.length ?? 0;
          const laneLabel = legend.find((l) => l.style === s)?.label;
          return (
            <Reveal key={lane.key ?? laneIndex} delay={laneIndex * 60}>
              <div>
                {/* Lane header */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    {lane.label}
                  </h3>
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", s.chip)}>
                    <s.Icon className={cn("h-3.5 w-3.5", s.spin && "motion-safe:animate-spin")} aria-hidden />
                    {laneLabel}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lane.caption}
                    {count ? <span className="text-muted-foreground/60"> · {count} phases</span> : null}
                  </span>
                </div>

                {/* Scroll-snap rail, inset within the section gutters (never glued to
                    the screen edge). A soft right fade hints there is more to swipe. */}
                <div className="relative mt-4">
                  <ul className="rail-x flex gap-3 overflow-x-auto pb-1">
                    {(lane.phases ?? []).map((p, i) => (
                      <PhaseCard key={p.name ?? i} phase={p} accent={s.accent} dot={s.dot} />
                    ))}
                  </ul>
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent dark:from-[#070b16]" />
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-8">
        <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-muted-foreground/80">
          Roadmap reflects current plans and may evolve. Every capability runs on the accounts you connect, with your
          consent, and we comply with each platform&apos;s policies.
        </p>
      </Reveal>
    </Section>
  );
}
