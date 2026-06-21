"use client";

import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CheckCircle2,
  Globe,
  Mic2,
  Send,
  ShieldCheck,
  Sparkles,
  Webhook,
} from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

export type FeatureSection = {
  key?: string;
  title?: string;
  body?: string;
  bullets?: string[];
};

const ICONS: Record<string, LucideIcon> = {
  "brand-voice": Mic2,
  "ai-studio": Sparkles,
  calendar: CalendarDays,
  publishing: Send,
  api: Webhook,
  compliance: ShieldCheck,
  "content-engine": Globe,
};

/** Short category labels for the eyebrow pill (distinct from each row's title). */
const EYEBROWS: Record<string, string> = {
  "brand-voice": "Brand Voice",
  "ai-studio": "Generation",
  calendar: "Planning",
  publishing: "Delivery",
  api: "Automation",
  compliance: "Trust",
  "content-engine": "Growth",
};

/**
 * Compliance-safe fallback used when the API/default content ships no sections
 * (the frontend default `features_page.sections` is empty). Mirrors the backend
 * defaults so the page is rich, not thin.
 */
export const FALLBACK_FEATURE_SECTIONS: FeatureSection[] = [
  {
    key: "brand-voice",
    title: "Brand Voice from your examples",
    body: "Paste your best posts and brand guidelines. Trndinn builds a voice profile from the examples you provide, so drafts sound like you, with zero scraping of your feeds.",
    bullets: [
      "Bring your own examples and writing samples",
      "Tone, do and don't, and brand colors in one Brand Kit",
      "Consistent voice across every draft",
    ],
  },
  {
    key: "ai-studio",
    title: "AI content studio",
    body: "Generate posts, images, and carousels from your inputs. Refine with one click and keep what works.",
    bullets: [
      "Text, image, and carousel generation",
      "Regenerate single assets or whole sets",
      "Credit-based: use credits on any action",
    ],
  },
  {
    key: "calendar",
    title: "Calendar and scheduling",
    body: "Plan visually with a drag-and-drop calendar. Recurring schedules keep your cadence steady automatically.",
    bullets: ["Day, week, and month views", "Drag-and-drop reschedule", "Recurring workflows (RRULE)"],
  },
  {
    key: "publishing",
    title: "Reliable publishing",
    body: "Publish and schedule to the accounts you connect. Automatic retries, dead-letter handling, and full logs keep delivery dependable.",
    bullets: [
      "Publishes within 60s of schedule",
      "Retry with backoff and failure alerts",
      "Complete publish history and logs",
    ],
  },
  {
    key: "api",
    title: "API and webhooks",
    body: "Automate with a stable Public API v1 and signed webhooks for post lifecycle events.",
    bullets: ["Create, schedule, and check status via API", "HMAC-signed webhooks", "Per-plan rate limits"],
  },
  {
    key: "compliance",
    title: "Compliant by design",
    body: "You own your data; we comply with every connected platform's policies and delete platform data on disconnect.",
    bullets: [
      "No scraping, no AI training on platform data",
      "Retention caps honored per platform",
      "GDPR, CCPA, and DPDP aligned",
    ],
  },
  {
    key: "content-engine",
    title: "Content Engine",
    body: "From keyword to published article to 31-platform distribution and newsletter. SEO, AEO, and GEO scoring built in.",
    bullets: [
      "SEO article generation with quality scoring",
      "Content clusters and internal linking",
      "31-platform distribution and newsletter campaigns",
    ],
  },
];

/** Abstract, icon-forward decorative panel. Not a literal UI screenshot. */
function RowVisual({ icon: Icon, index }: { icon: LucideIcon; index: number }) {
  const accent = index % 3;
  return (
    <div className="glass-strong glow-ring relative aspect-[4/3] w-full overflow-hidden rounded-3xl p-7">
      {/* Layered glow + geometric accents, varied per row */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-gradient-to-br from-primary/25 to-transparent blur-2xl" />
      {accent === 0 ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
      ) : accent === 1 ? (
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-gradient-to-tr from-[#ff3d39]/20 to-transparent blur-2xl" />
      ) : (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      )}

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/20 to-transparent">
            <Icon className="h-8 w-8 text-primary" aria-hidden />
          </span>
          <span className="font-display text-6xl font-black leading-none text-foreground/[0.06]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-auto flex items-end gap-2">
          {[40, 64, 52, 80, 60].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-lg bg-gradient-to-t from-primary/50 to-primary/10"
              style={{ height: `${h}px`, opacity: 0.4 + (h / 100) * 0.6 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeatureRows({ sections }: { sections: FeatureSection[] }) {
  const rows = sections.length ? sections : FALLBACK_FEATURE_SECTIONS;

  return (
    <Section>
      <div className="space-y-16 sm:space-y-20">
        {rows.map((section, index) => {
          const Icon = ICONS[section.key ?? ""] ?? Sparkles;
          const eyebrow = EYEBROWS[section.key ?? ""] ?? `Step ${String(index + 1).padStart(2, "0")}`;
          const reversed = index % 2 === 1;
          return (
            <Reveal key={section.key ?? index}>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className={cn(reversed && "lg:order-2")}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {eyebrow}
                  </span>
                  <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {section.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {section.body}
                  </p>
                  {section.bullets?.length ? (
                    <ul className="mt-6 space-y-3">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3 text-sm text-foreground/90 sm:text-base">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className={cn(reversed && "lg:order-1")}>
                  <RowVisual icon={Icon} index={index} />
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
