"use client";

import { Check, X } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

type ComparisonRow = { label?: string; manual?: boolean; trndinn?: boolean };

function CellIcon({ value }: { value?: boolean }) {
  if (value) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <Check className="h-4 w-4" aria-hidden />
        <span className="sr-only">Yes</span>
      </span>
    );
  }
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <X className="h-4 w-4" aria-hidden />
      <span className="sr-only">No</span>
    </span>
  );
}

export function ComparisonBand({
  title,
  subtitle,
  manualLabel,
  trndinnLabel,
  rows,
}: {
  title?: string;
  subtitle?: string;
  manualLabel?: string;
  trndinnLabel?: string;
  rows: ComparisonRow[];
}) {
  return (
    <Section>
      <SectionHeading
        eyebrow="Why switch"
        title={title ?? "Stop juggling tabs. Start publishing with confidence."}
        subtitle={
          subtitle ??
          "Manual posting works until it doesn't. Missed slots, off-brand drafts, and no single source of truth."
        }
      />

      <Reveal delay={80} className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl bg-card/80 backdrop-blur-md dark:bg-white/[0.04] md:mt-10">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 bg-muted/40 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:px-7 dark:bg-white/[0.03]">
          <span>Capability</span>
          <span className="w-20 text-center">{manualLabel ?? "Manual"}</span>
          <span className="w-20 text-center text-primary">{trndinnLabel ?? "Trndinn"}</span>
        </div>
        <ul>
          {rows.map((row, index) => (
            <li
              key={row.label ?? index}
              className={cn(
                "grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 sm:px-7",
                index % 2 === 1 && "bg-muted/25 dark:bg-white/[0.02]",
              )}
            >
              <span className="text-sm font-medium text-foreground sm:text-base">{row.label}</span>
              <span className="flex w-20 justify-center">
                <CellIcon value={row.manual} />
              </span>
              <span className="flex w-20 justify-center">
                <CellIcon value={row.trndinn} />
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
