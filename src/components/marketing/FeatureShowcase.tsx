"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Images,
  Mic2,
  Palette,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Wand2,
  Webhook,
} from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa6";
import { Section } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { FALLBACK_FEATURE_SECTIONS, type FeatureSection } from "@/components/marketing/FeatureRows";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
 * Shared bits
 * ------------------------------------------------------------------------- */

function FeatureCopy({
  icon,
  tag,
  title,
  body,
  bullets,
}: {
  icon: ReactNode;
  tag: string;
  title?: string;
  body?: string;
  bullets?: string[];
}) {
  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
        {icon}
        {tag}
      </span>
      <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h3>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">{body}</p>
      {bullets?.length ? (
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-foreground/90 sm:text-base">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Elevated visual shell so every mock reads as a real, balanced in-card composition. */
function MockShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate w-full min-w-0 max-w-full overflow-hidden rounded-3xl bg-card/80 p-5 backdrop-blur-md dark:bg-white/[0.03] sm:p-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 -z-10 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
      {children}
    </div>
  );
}

function WindowDots() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Mock 1 — Brand Voice profile
 * ------------------------------------------------------------------------- */

function BrandVoiceMock() {
  const sliders = [
    { left: "Professional", right: "Playful", value: 38 },
    { left: "Concise", right: "Detailed", value: 62 },
    { left: "Bold", right: "Humble", value: 30 },
  ];
  return (
    <MockShell>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff8a1f] to-[#ff3d39] text-white">
            <Mic2 className="h-4 w-4" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">Brand Kit</p>
            <p className="text-xs text-muted-foreground">Built from your examples</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          Active
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {sliders.map((s) => (
          <div key={s.left}>
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>{s.left}</span>
              <span>{s.right}</span>
            </div>
            <div className="relative mt-1.5 h-2 rounded-full bg-muted dark:bg-white/10">
              <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39]" style={{ width: `${s.value}%` }} />
              <span
                className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-primary dark:bg-primary"
                style={{ left: `${s.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="h-3 w-3" aria-hidden /> Plain language
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
          No jargon
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          {["#ff8a1f", "#ff3d39", "#0b1120", "#22c55e"].map((c) => (
            <span key={c} className="h-4 w-4 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </span>
      </div>

      <div className="mt-5 rounded-2xl bg-muted/50 p-3.5 dark:bg-white/[0.05]">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Sample draft</p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
          &ldquo;Shipping beats perfect. Here are three lessons from our first launch week.&rdquo;
        </p>
      </div>
    </MockShell>
  );
}

/* ----------------------------------------------------------------------------
 * Mock 2 — AI content studio
 * ------------------------------------------------------------------------- */

function AiStudioMock() {
  return (
    <MockShell>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <WindowDots />
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden /> Content studio
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-muted/50 p-2 dark:bg-white/[0.05]">
        <Wand2 className="ml-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p className="min-w-0 flex-1 basis-[min(100%,12rem)] text-xs text-muted-foreground sm:basis-auto sm:truncate sm:text-sm">
          Write a launch post about our new feature
        </p>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-2.5 py-1.5 text-xs font-semibold text-white">
          Generate
        </span>
      </div>

      {/* Stack Post + Carousel on mobile; side-by-side from sm up */}
      <div className="mt-4 flex min-w-0 flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-3">
        <div className="min-w-0 rounded-xl bg-muted/50 p-3 dark:bg-white/[0.05] sm:col-span-1">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]/15 text-[#0A66C2]">
              <FaLinkedinIn className="h-3 w-3" aria-hidden />
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">Post</span>
          </div>
          <div className="mt-2 space-y-1.5">
            <span className="block h-1.5 w-full rounded-full bg-foreground/10 dark:bg-white/15" />
            <span className="block h-1.5 w-4/5 rounded-full bg-foreground/10 dark:bg-white/15" />
            <span className="block h-1.5 w-2/3 rounded-full bg-foreground/10 dark:bg-white/15" />
          </div>
        </div>
        <div className="min-w-0 rounded-xl bg-muted/50 p-3 dark:bg-white/[0.05] sm:col-span-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <Images className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0 truncate text-[10px] font-medium text-muted-foreground">Carousel · 4 slides</span>
          </div>
          <div className="mt-2 grid min-w-0 grid-cols-4 gap-1 sm:gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="aspect-[3/4] min-w-0 rounded-md bg-gradient-to-br from-primary/30 to-[#ff3d39]/15"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground dark:bg-white/[0.05]">
          <RefreshCw className="h-3.5 w-3.5 text-primary" aria-hidden /> Regenerate
        </span>
        <span className="min-w-0 truncate text-[11px] text-muted-foreground">Keep what works</span>
      </div>
    </MockShell>
  );
}

/* ----------------------------------------------------------------------------
 * Mock 3 — Calendar (full-width)
 * ------------------------------------------------------------------------- */

function CalendarMock() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chips: Record<number, string[]> = {
    0: ["9:00"],
    2: ["12:30"],
    3: ["10:00"],
    5: ["8:15"],
  };
  return (
    <MockShell>
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="text-sm font-semibold text-foreground">This week</span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-white/[0.05] sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[11px]">
          <RefreshCw className="h-3 w-3 shrink-0 text-primary" aria-hidden />
          <span className="hidden sm:inline">Recurring on</span>
          <span className="sm:hidden">Recurring</span>
        </span>
      </div>
      {/* Compact 7-col week grid — single-letter labels on mobile so all days fit */}
      <div className="mt-4 grid w-full min-w-0 grid-cols-7 gap-px sm:gap-1 md:gap-2">
        {days.map((d, i) => (
          <div key={d} className="flex min-w-0 flex-col">
            <span className="mb-1 text-center text-[9px] font-semibold uppercase tracking-tight text-muted-foreground sm:text-[10px]">
              <span className="sm:hidden">{d[0]}</span>
              <span className="hidden sm:inline">{d}</span>
            </span>
            <div className="flex min-h-[56px] min-w-0 flex-col gap-0.5 rounded-lg bg-muted/50 p-0.5 dark:bg-white/[0.05] sm:min-h-[88px] sm:gap-1 sm:p-1.5">
              {(chips[i] ?? []).map((time, idx) => (
                <span
                  key={idx}
                  className="flex w-full min-w-0 items-center justify-center rounded-md bg-gradient-to-b from-primary/20 to-[#ff3d39]/10 px-1 py-0.5 text-[8px] font-bold leading-none text-foreground tabular-nums sm:px-1.5 sm:py-1 sm:text-[10px]"
                >
                  {time}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MockShell>
  );
}

/* ----------------------------------------------------------------------------
 * Bento mocks — Publishing / API / Compliance
 * ------------------------------------------------------------------------- */

function PublishingMock() {
  const steps = [
    { label: "Scheduled", done: true },
    { label: "Publishing", done: true },
    { label: "Published", done: true },
  ];
  return (
    <ul className="mt-5 space-y-2.5">
      {steps.map((s, i) => (
        <li key={s.label} className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-white",
              i === steps.length - 1 ? "bg-emerald-500" : "bg-primary",
            )}
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="text-sm font-medium text-foreground/90">{s.label}</span>
          <span className="ml-auto text-[11px] text-muted-foreground">{i === 2 ? "in 42s" : "ok"}</span>
        </li>
      ))}
    </ul>
  );
}

function ApiMock() {
  return (
    <div className="mt-5 overflow-hidden rounded-xl bg-[#0b1120] p-3.5 font-mono text-[11px] leading-relaxed">
      <p className="text-emerald-400">POST /v1/posts</p>
      <p className="text-white/70">
        <span className="text-sky-300">&quot;status&quot;</span>: <span className="text-amber-300">&quot;scheduled&quot;</span>
      </p>
      <p className="mt-1 text-white/40">{"// HMAC-signed webhook on publish"}</p>
      <p className="text-white/70">
        <span className="text-sky-300">200</span> OK
      </p>
    </div>
  );
}

function ComplianceMock() {
  const items = ["You own your data", "No scraping or AI training on platform data", "Deleted on disconnect"];
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((it) => (
        <li key={it} className="flex items-start gap-2.5 text-sm text-foreground/90">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
          {it}
        </li>
      ))}
    </ul>
  );
}

function BentoCard({
  icon,
  title,
  body,
  children,
  className,
}: {
  icon: ReactNode;
  title?: string;
  body?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative isolate flex flex-col overflow-hidden rounded-3xl bg-card/70 p-6 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 dark:bg-white/[0.03]",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 -z-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-150" />
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Showcase
 * ------------------------------------------------------------------------- */

function findSection(sections: FeatureSection[], key: string): FeatureSection {
  return (
    sections.find((s) => s.key === key) ?? FALLBACK_FEATURE_SECTIONS.find((s) => s.key === key) ?? { key }
  );
}

export function FeatureShowcase({ sections }: { sections: FeatureSection[] }) {
  const rows = sections.length ? sections : FALLBACK_FEATURE_SECTIONS;
  const brandVoice = findSection(rows, "brand-voice");
  const aiStudio = findSection(rows, "ai-studio");
  const calendar = findSection(rows, "calendar");
  const publishing = findSection(rows, "publishing");
  const api = findSection(rows, "api");
  const compliance = findSection(rows, "compliance");

  return (
    <Section>
      <div className="space-y-10 sm:space-y-16">
        {/* Family 1 — split: copy left, mock right */}
        <Reveal>
          <div className="grid min-w-0 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="min-w-0">
              <FeatureCopy
                icon={<Mic2 className="h-3.5 w-3.5" aria-hidden />}
                tag="Brand Voice"
                title={brandVoice.title}
                body={brandVoice.body}
                bullets={brandVoice.bullets}
              />
            </div>
            <div className="min-w-0 w-full max-w-full">
              <BrandVoiceMock />
            </div>
          </div>
        </Reveal>

        {/* Family 2 — zigzag split: mock left, copy right (max 2 consecutive splits) */}
        <Reveal>
          <div className="grid min-w-0 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="min-w-0 lg:order-2">
              <FeatureCopy
                icon={<Sparkles className="h-3.5 w-3.5" aria-hidden />}
                tag="Generation"
                title={aiStudio.title}
                body={aiStudio.body}
                bullets={aiStudio.bullets}
              />
            </div>
            <div className="min-w-0 w-full max-w-full lg:order-1">
              <AiStudioMock />
            </div>
          </div>
        </Reveal>

        {/* Family 3 — full-width feature: copy on top, wide calendar mock below */}
        <Reveal>
          <div className="relative isolate min-w-0 w-full max-w-full overflow-hidden rounded-[2rem] bg-card/60 p-4 backdrop-blur-md dark:bg-white/[0.03] sm:p-6 lg:p-10">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_120%_at_85%_-20%,hsl(var(--primary)/0.1),transparent_60%)]" />
            <div className="grid min-w-0 items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
              <div className="min-w-0">
                <FeatureCopy
                  icon={<CalendarDays className="h-3.5 w-3.5" aria-hidden />}
                  tag="Planning"
                  title={calendar.title}
                  body={calendar.body}
                  bullets={calendar.bullets}
                />
              </div>
              <div className="min-w-0 w-full max-w-full">
                <CalendarMock />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Family 4 — bento grid: publishing / api / compliance */}
        <Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <BentoCard
              className="lg:row-span-1"
              icon={<Send className="h-5 w-5" aria-hidden />}
              title={publishing.title}
              body={publishing.body}
            >
              <PublishingMock />
            </BentoCard>
            <BentoCard
              icon={<Webhook className="h-5 w-5" aria-hidden />}
              title={api.title}
              body={api.body}
            >
              <ApiMock />
            </BentoCard>
            <BentoCard
              className="md:col-span-2 lg:col-span-1"
              icon={<ShieldCheck className="h-5 w-5" aria-hidden />}
              title={compliance.title}
              body={compliance.body}
            >
              <ComplianceMock />
            </BentoCard>
          </div>
        </Reveal>

        <Reveal>
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            Your examples, your accounts, your consent.
            <ArrowRight className="h-4 w-4 text-primary" aria-hidden />
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
