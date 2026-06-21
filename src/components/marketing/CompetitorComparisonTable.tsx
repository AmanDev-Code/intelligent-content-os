"use client";

import { Check, Clock, Minus, X } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import type { ComparisonCell, ComparisonSection } from "@/lib/marketing/comparisons";
import { cn } from "@/lib/utils";

function CellValue({ value }: { value: ComparisonCell }) {
  if (value === true) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <Check className="h-4 w-4" aria-hidden />
        <span className="sr-only">Yes</span>
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <X className="h-4 w-4" aria-hidden />
        <span className="sr-only">No</span>
      </span>
    );
  }

  if (value === "partial") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
        <Minus className="h-3.5 w-3.5" aria-hidden />
        Limited
      </span>
    );
  }

  if (value === "roadmap") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
        <Clock className="h-3.5 w-3.5" aria-hidden />
        Roadmap
      </span>
    );
  }

  return <span className="text-xs font-medium leading-snug text-foreground sm:text-sm">{value}</span>;
}

export function CompetitorComparisonTable({
  competitorName,
  sections,
}: {
  competitorName: string;
  sections: ComparisonSection[];
}) {
  return (
    <Section id="comparison">
      <SectionHeading
        eyebrow="Feature matrix"
        title="Side-by-side comparison"
        subtitle="An honest look at where each platform shines — no trash talk, just fit."
      />

      <div className="mt-8 space-y-8 md:mt-10">
        {sections.map((section, sectionIndex) => (
          <Reveal key={section.title} delay={sectionIndex * 40}>
            <div className="overflow-hidden rounded-2xl bg-card/80 backdrop-blur-md dark:bg-white/[0.04]">
              <div className="border-b border-border/60 bg-muted/40 px-5 py-4 dark:bg-white/[0.03] sm:px-7">
                <h3 className="font-display text-lg font-semibold text-foreground">{section.title}</h3>
              </div>

              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 bg-muted/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:gap-4 sm:px-7">
                <span>Capability</span>
                <span className="w-[5.5rem] text-center sm:w-24">{competitorName}</span>
                <span className="w-[5.5rem] text-center text-primary sm:w-24">Trndinn</span>
              </div>

              <ul>
                {section.rows.map((row, index) => (
                  <li
                    key={row.label}
                    className={cn(
                      "grid grid-cols-[1fr_auto_auto] items-center gap-3 px-5 py-4 sm:gap-4 sm:px-7",
                      index % 2 === 1 && "bg-muted/25 dark:bg-white/[0.02]",
                    )}
                  >
                    <span className="text-sm font-medium text-foreground sm:text-base">{row.label}</span>
                    <span className="flex w-[5.5rem] justify-center sm:w-24">
                      <CellValue value={row.competitor} />
                    </span>
                    <span className="flex w-[5.5rem] justify-center sm:w-24">
                      <CellValue value={row.trndinn} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
