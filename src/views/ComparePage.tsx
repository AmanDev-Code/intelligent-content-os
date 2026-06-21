"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Scale, Sparkles } from "lucide-react";
import { CompetitorComparisonTable } from "@/components/marketing/CompetitorComparisonTable";
import { FinalCta } from "@/components/marketing/FinalCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Button } from "@/components/ui/button";
import type { CompetitorComparisonConfig } from "@/lib/marketing/comparisons";
import { siteName } from "@/lib/site";

function highlightLastWord(title: string): ReactNode {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) {
    return <span className="text-gradient-brand animate-gradient-x">{title}</span>;
  }
  const last = words.pop() as string;
  return (
    <>
      {words.join(" ")} <span className="text-gradient-brand animate-gradient-x">{last}</span>
    </>
  );
}

function PlanCard({
  name,
  price,
  note,
  featured,
}: {
  name: string;
  price: string;
  note?: string;
  featured?: boolean;
}) {
  return (
    <div
      className={
        featured
          ? "rounded-2xl border border-primary/30 bg-primary/5 p-5 dark:bg-primary/10"
          : "rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md dark:bg-white/[0.03]"
      }
    >
      <p className="text-sm font-semibold text-foreground">{name}</p>
      <p className="mt-2 font-display text-2xl font-bold text-foreground">{price}</p>
      {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export default function ComparePage({
  config,
  h1Override,
}: {
  config: CompetitorComparisonConfig;
  h1Override?: string | null;
}) {
  const heroTitle = h1Override ?? config.hero.title;

  return (
    <MarketingShell>
      <main>
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(255,138,31,0.26),transparent_55%)]" />
          <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
          <div className="pointer-events-none absolute -right-24 top-1/3 -z-10 h-[380px] w-[380px] rounded-full bg-[#ff3d39]/10 blur-3xl dark:bg-[#ff3d39]/20" />

          <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-16 md:pb-20 md:pt-20">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md dark:bg-white/5 dark:text-white/70">
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                {config.hero.eyebrow}
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.1] tracking-tight text-foreground sm:mt-6 sm:text-5xl sm:leading-[1.05] md:text-6xl">
                {h1Override ? heroTitle : highlightLastWord(heroTitle)}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                {config.hero.subtitle}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white hover:opacity-90 sm:w-auto"
                  asChild
                >
                  <Link href="/auth">
                    Start free
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full border-0 bg-muted/70 px-8 font-semibold backdrop-blur-md hover:bg-muted dark:bg-white/10 dark:hover:bg-white/[0.16] sm:w-auto"
                  asChild
                >
                  <Link href="/pricing">View pricing</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        <Section>
          <SectionHeading
            eyebrow="Platform overview"
            title="Two different strengths"
            subtitle={`We respect what ${config.competitorName} does well. Here is how each platform is built.`}
          />

          <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2">
            <Reveal delay={40}>
              <article className="h-full rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-md dark:bg-white/[0.04] sm:p-8">
                <h2 className="font-display text-2xl font-bold text-foreground">{config.competitorOverview.title}</h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {config.competitorOverview.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </Reveal>
            <Reveal delay={80}>
              <article className="h-full rounded-2xl border border-primary/25 bg-primary/5 p-6 backdrop-blur-md dark:bg-primary/10 sm:p-8">
                <h2 className="font-display text-2xl font-bold text-foreground">{config.trndinnOverview.title}</h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {config.trndinnOverview.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </Reveal>
          </div>
        </Section>

        <CompetitorComparisonTable competitorName={config.competitorName} sections={config.sections} />

        <Section id="pricing">
          <SectionHeading
            eyebrow="Pricing"
            title="Pricing & plans"
            subtitle="Different models for different workflows — compare what fits yours."
          />

          <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-2">
            <Reveal delay={40}>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">{config.competitorName}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {config.pricingNotes.competitor.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {config.competitorPlans.map((plan) => (
                    <PlanCard key={plan.name} {...plan} />
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">{siteName}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {config.pricingNotes.trndinn.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {config.trndinnPlans.map((plan, index) => (
                    <PlanCard key={plan.name} {...plan} featured={index === 1} />
                  ))}
                </div>
                <div className="mt-5">
                  <Button variant="outline" className="rounded-full" asChild>
                    <Link href="/pricing">
                      See live pricing
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Section>

        <Section>
          <Reveal>
            <div className="rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-md dark:bg-white/[0.04] sm:p-8">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <Scale className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">{config.verdict.title}</h2>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">{config.verdict.body}</p>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-muted/40 p-4 dark:bg-white/[0.03]">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Choose {config.competitorName}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">{config.verdict.chooseCompetitor}</p>
                    </div>
                    <div className="rounded-xl bg-primary/8 p-4 dark:bg-primary/10">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Choose {siteName}</p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">{config.verdict.chooseTrndinn}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Section>

        <FinalCta
          title={config.cta.title}
          subtitle={config.cta.subtitle}
          primaryLabel="Start free"
          primaryHref="/auth"
          secondaryLabel="Explore features"
          secondaryHref="/features#agentic"
        />
      </main>
    </MarketingShell>
  );
}
