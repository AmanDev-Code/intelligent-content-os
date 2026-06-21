"use client";

import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";
import { CompareTable } from "@/components/marketing/CompareTable";
import { FinalCta } from "@/components/marketing/FinalCta";
import { LandingFaq } from "@/components/marketing/LandingFaq";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PositioningMatrix } from "@/components/marketing/PositioningMatrix";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Button } from "@/components/ui/button";
import {
  COMPARE_POSTIZ_FAQ,
  POSTIZ_COMPARE_ROWS,
} from "@/lib/marketing/comparePostiz";
import { siteName } from "@/lib/site";

const POSTIZ_STRENGTHS = [
  "30+ live social channels with cross-posting",
  "MCP server and CLI for Claude, ChatGPT, and Cursor",
  "Open-source with self-hosting option",
  "Smart Agent chat for end-to-end scheduling",
];

const TRNDINN_STRENGTHS = [
  "Content Engine: SEO articles, clusters, and 31-platform distribution",
  "Brand Voice built only from examples you provide",
  "LinkedIn depth: Company Pages and posting identity",
  "Credit-transparent pricing for AI-heavy workflows",
  "Newsletter campaigns via Listmonk",
];

export default function ComparePostizPage({ h1Override }: { h1Override?: string | null }) {
  const title =
    h1Override ?? "Trndinn vs Postiz: Agentic Scheduler vs Growth OS";
  const subtitle =
    "Both platforms use AI agents for social workflows. Postiz leads on channel breadth and agent protocols; Trndinn leads on growth depth, Brand Voice, and LinkedIn-first automation.";

  return (
    <MarketingShell>
      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(255,138,31,0.26),transparent_55%)]" />
          <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
          <div className="pointer-events-none absolute -right-24 top-1/3 -z-10 h-[380px] w-[380px] rounded-full bg-[#ff3d39]/10 blur-3xl dark:bg-[#ff3d39]/20" />

          <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-16 md:pb-20 md:pt-20">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md dark:bg-white/5 dark:text-white/70">
                <Scale className="h-3.5 w-3.5 text-primary" aria-hidden />
                Comparison
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.1] tracking-tight text-foreground sm:mt-6 sm:text-5xl sm:leading-[1.05] md:text-6xl">
                {title}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                {subtitle}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
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
                  className="h-12 w-full rounded-full border-border bg-background/40 px-8 font-semibold text-foreground backdrop-blur-md hover:bg-muted hover:text-foreground dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white sm:w-auto"
                  asChild
                >
                  <Link href="/features#agentic">See agentic workflows</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Honest intro */}
        <Section>
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Postiz is a mature agentic scheduler with impressive channel coverage and a real MCP/CLI
              story. {siteName} is an agentic growth OS that connects social publishing to SEO, distribution,
              and newsletter — with Brand Voice you control. This page compares both honestly so you can
              pick the right fit.
            </p>
          </Reveal>
        </Section>

        <PositioningMatrix />

        {/* Strengths side by side */}
        <Section>
          <SectionHeading
            eyebrow="At a glance"
            title="Where each platform shines"
            subtitle="No winner-takes-all — the right choice depends on whether you need maximum channels or maximum growth depth."
          />
          <div className="mx-auto mt-8 grid max-w-4xl gap-6 md:mt-10 md:grid-cols-2">
            <Reveal delay={40}>
              <div className="h-full rounded-2xl border border-border/50 bg-card/70 p-6 backdrop-blur-md dark:bg-white/[0.04] sm:p-8">
                <h3 className="font-display text-xl font-bold text-foreground">Postiz strengths</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Best when you need the widest live channel list and external agents driving scheduling
                  today.
                </p>
                <ul className="mt-5 space-y-3">
                  {POSTIZ_STRENGTHS.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="h-full rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card/70 to-card/50 p-6 backdrop-blur-md dark:from-primary/12 dark:via-white/[0.04] sm:p-8">
                <h3 className="font-display text-xl font-bold text-foreground">{siteName} strengths</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Best when LinkedIn, Brand Voice compliance, and an SEO-to-social growth loop matter more
                  than channel count.
                </p>
                <ul className="mt-5 space-y-3">
                  {TRNDINN_STRENGTHS.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </Section>

        <CompareTable rows={POSTIZ_COMPARE_ROWS} />

        <LandingFaq
          title="Trndinn vs Postiz — common questions"
          items={COMPARE_POSTIZ_FAQ.map((f) => ({ q: f.question, a: f.answer }))}
        />

        <FinalCta
          title="Ready to try the agentic growth OS?"
          subtitle="Start free with 150 credits. Connect LinkedIn, train Brand Voice from your examples, and explore Content Engine workflows."
          primaryLabel="Start free"
          primaryHref="/auth"
          secondaryLabel="View pricing"
          secondaryHref="/pricing"
        />
      </main>
    </MarketingShell>
  );
}
