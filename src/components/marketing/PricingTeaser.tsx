"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";

type PlanHighlight = { name?: string; detail?: string };

export function PricingTeaser({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  highlights,
}: {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  highlights?: PlanHighlight[];
}) {
  return (
    <Section>
      <Reveal>
        <div className="grid items-center gap-10 rounded-[2rem] bg-card/80 p-8 backdrop-blur-md sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 dark:bg-white/[0.04]">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Pricing"
              title={title ?? "Start free. Scale when you're ready."}
              subtitle={
                subtitle ??
                "150 free credits to explore. Upgrade for more publishing power. Live prices are pulled from Polar at checkout."
              }
              className="max-w-none"
            />
            <Button
              size="lg"
              className="mt-8 h-12 cursor-pointer rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white transition-opacity hover:opacity-90"
              asChild
            >
              <Link href={ctaHref ?? "/pricing"}>
                {ctaLabel ?? "View plans"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {highlights?.length ? (
            <ul className="space-y-4">
              {highlights.map((plan, index) => (
                <li key={plan.name ?? index}>
                  <Reveal delay={index * 60}>
                    <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4 dark:bg-white/[0.05]">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="leading-snug">
                        <span className="block font-display font-bold text-foreground">{plan.name}</span>
                        <span className="mt-0.5 block text-sm text-foreground/75">{plan.detail}</span>
                      </span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Reveal>
    </Section>
  );
}
