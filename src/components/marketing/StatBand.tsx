"use client";

import { Section } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

type Stat = { value?: string; label?: string };

export function StatBand({
  title,
  items,
  loading,
}: {
  title?: string;
  items: Stat[];
  loading?: boolean;
}) {
  return (
    <Section>
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-card/80 px-6 py-10 backdrop-blur-xl dark:bg-white/[0.04] sm:px-12 sm:py-12">
          <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-[#ff3d39]/10 blur-3xl" />

          {title ? (
            <h2 className="relative text-center font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
          ) : null}

          <div className="relative mt-8 grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {items.map((stat, index) => (
              <Reveal key={stat.label ?? index} delay={index * 70} className="text-center">
                {loading ? (
                  <div className="mx-auto h-10 w-20 animate-pulse rounded-lg bg-muted dark:bg-white/10" />
                ) : (
                  <p
                    className={cn(
                      "font-display text-4xl font-black tracking-tight sm:text-5xl",
                      "bg-gradient-to-br from-[#ff8a1f] to-[#ff3d39] bg-clip-text text-transparent",
                    )}
                  >
                    {stat.value}
                  </p>
                )}
                <p className="mt-2 text-sm leading-snug text-muted-foreground">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
