"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";

type FinalCtaProps = {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function FinalCta({
  title = "Ready to run your social on autopilot?",
  subtitle = "Bring your examples, connect your accounts, and let Trndinn handle the rest, with your consent and full ownership of your data.",
  primaryLabel = "Start free",
  primaryHref = "/auth",
  secondaryLabel = "See agentic workflows",
  secondaryHref = "/features#agentic",
}: FinalCtaProps) {
  return (
    <Section>
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-card/80 px-6 py-12 text-center backdrop-blur-xl dark:bg-white/[0.04] sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_80%_at_50%_0%,hsl(var(--primary)/0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_90%_80%_at_50%_0%,rgba(255,138,31,0.3),transparent_55%)]" />
          <div className="pointer-events-none absolute -left-20 top-0 -z-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30" />
          <div className="pointer-events-none absolute -right-16 bottom-0 -z-10 h-64 w-64 rounded-full bg-[#ff3d39]/10 blur-3xl dark:bg-[#ff3d39]/20" />

          <h2 className="mx-auto max-w-3xl font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {subtitle}
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="h-12 w-full rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
              asChild
            >
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full border-0 bg-muted/70 px-8 font-semibold text-foreground backdrop-blur-md hover:bg-muted hover:text-foreground dark:bg-white/10 dark:text-white dark:hover:bg-white/[0.16] dark:hover:text-white sm:w-auto"
              asChild
            >
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
