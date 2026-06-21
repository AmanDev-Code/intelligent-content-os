"use client";

import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import type { CompareRow } from "@/lib/marketing/comparePostiz";
import { cn } from "@/lib/utils";

export function CompareTable({
  title = "Feature comparison",
  subtitle = "An honest look at where each platform leads — and where they overlap.",
  rows,
  postizLabel = "Postiz",
  trndinnLabel = "Trndinn",
}: {
  title?: string;
  subtitle?: string;
  rows: CompareRow[];
  postizLabel?: string;
  trndinnLabel?: string;
}) {
  return (
    <Section>
      <SectionHeading eyebrow="Compare" title={title} subtitle={subtitle} />

      <Reveal delay={80} className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl bg-card/80 backdrop-blur-md dark:bg-white/[0.04] md:mt-10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-white/[0.03]">
                <th scope="col" className="px-5 py-4 sm:px-7">
                  Capability
                </th>
                <th scope="col" className="px-5 py-4 sm:px-7">
                  {postizLabel}
                </th>
                <th scope="col" className="px-5 py-4 text-primary sm:px-7">
                  {trndinnLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.capability}
                  className={cn(
                    "border-t border-border/40",
                    index % 2 === 1 && "bg-muted/25 dark:bg-white/[0.02]",
                  )}
                >
                  <th
                    scope="row"
                    className="px-5 py-4 text-sm font-semibold text-foreground sm:px-7 sm:text-base"
                  >
                    {row.capability}
                  </th>
                  <td className="px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:px-7">
                    {row.postiz}
                  </td>
                  <td className="px-5 py-4 text-sm leading-relaxed text-foreground sm:px-7">
                    {row.trndinn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </Section>
  );
}
