"use client";

import type { LucideIcon } from "lucide-react";
import { Layers, Repeat, Webhook } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

type Feature = { key?: string; title?: string; body?: string };

const ICONS: Record<string, LucideIcon> = {
  variants: Layers,
  recurring: Repeat,
  automation: Webhook,
};

export function SecondaryFeatures({
  title,
  subtitle,
  items,
}: {
  title?: string;
  subtitle?: string;
  items: Feature[];
}) {
  return (
    <Section>
      <SectionHeading
        eyebrow="More power"
        title={title ?? "Everything else you need to stay consistent"}
        subtitle={subtitle}
      />

      <div className="mt-10 grid gap-5 md:grid-cols-3 lg:gap-6">
        {items.map((item, index) => {
          const Icon = ICONS[item.key ?? ""] ?? Layers;
          return (
            <Reveal key={item.key ?? index} delay={index * 80}>
              <div className="group relative h-full overflow-hidden rounded-[1.5rem] bg-card/70 p-7 backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 dark:bg-white/[0.04] sm:p-8">
                <span className="absolute right-7 top-7 font-display text-3xl font-black text-foreground/[0.06]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5",
                    "transition-transform duration-300 group-hover:scale-105",
                  )}
                >
                  <Icon className="h-6 w-6 text-primary" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
