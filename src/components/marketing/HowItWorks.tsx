"use client";

import type { LucideIcon } from "lucide-react";
import { CalendarClock, FileText, Link2, Rocket } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

type Step = { key?: string; title?: string; body?: string };

const ICONS: Record<string, LucideIcon> = {
  connect: Link2,
  examples: FileText,
  generate: CalendarClock,
  publish: Rocket,
};

const ICON_FALLBACKS: LucideIcon[] = [Link2, FileText, CalendarClock, Rocket];

export function HowItWorks({
  title,
  subtitle,
  steps,
}: {
  title?: string;
  subtitle?: string;
  steps?: Step[];
}) {
  const items = steps?.length ? steps : [];

  return (
    <Section>
      <SectionHeading
        eyebrow="How it works"
        title={title ?? "Live in four steps, and you stay in control"}
        subtitle={
          subtitle ??
          "You bring the examples and the accounts. Trndinn does the heavy lifting, with your consent at every step."
        }
      />

      <div className="relative mt-8 md:mt-10">
        {/* Desktop: drawn horizontal connector through the milestone nodes */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-7 hidden lg:block"
          aria-hidden
        >
          <div className="mx-auto h-[2px] w-[78%] bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
        </div>

        {/* Mobile: drawn vertical connector down the left rail */}
        <div
          className="pointer-events-none absolute bottom-6 left-[27px] top-6 w-[2px] bg-gradient-to-b from-primary/45 via-primary/25 to-transparent lg:hidden"
          aria-hidden
        />

        <ol className="grid auto-rows-fr gap-8 lg:grid-cols-4 lg:gap-6">
          {items.map((step, index) => {
            const Icon = ICONS[step.key ?? ""] ?? ICON_FALLBACKS[index % ICON_FALLBACKS.length];
            return (
              <Reveal key={step.key ?? index} delay={index * 110} as="li" className="h-full">
                <div className="flex h-full flex-col gap-5 lg:flex-col lg:gap-0">
                  {/* Milestone node */}
                  <div className="relative shrink-0 lg:flex lg:justify-center">
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary dark:bg-[#0b1120]">
                      {/* Inner glow with overflow containment */}
                      <span className="absolute inset-0 overflow-hidden rounded-2xl">
                        <span className="absolute inset-[-2px] rounded-2xl bg-gradient-to-br from-primary/20 to-transparent dark:from-primary/30" />
                      </span>
                      <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10" />
                      <Icon className="relative h-6 w-6 text-primary" aria-hidden />
                      {/* Number badge - positioned to not overflow */}
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#ff8a1f] to-[#ff3d39] text-[10px] font-black text-white shadow-md">
                        {index + 1}
                      </span>
                    </span>
                  </div>

                  {/* Step content - equal height cards */}
                  <div
                    className={cn(
                      "flex min-w-0 flex-1 flex-col rounded-2xl border border-border/30 bg-card/70 p-5 backdrop-blur-md",
                      "transition-transform duration-300 hover:-translate-y-0.5",
                      "dark:bg-white/[0.04] lg:mt-6 lg:border-border/20 lg:bg-card/40 lg:p-5 lg:shadow-sm lg:hover:-translate-y-1",
                    )}
                  >
                    <h3 className="font-display text-lg font-bold tracking-tight text-foreground">{step.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
