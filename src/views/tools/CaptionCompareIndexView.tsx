"use client";

import Link from "next/link";
import { ArrowRight, Zap, Trophy, Scale, FileText, Wrench, Sparkles, Rocket } from "lucide-react";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CaptionCompetitor } from "@/lib/caption-competitors";
import type { CoreCompetitor } from "@/lib/core-competitors";
import type { ReelDownloaderCompetitor } from "@/lib/reel-downloader-competitors";
import { siteName } from "@/lib/site";

type Props = {
  captionCompetitors: readonly CaptionCompetitor[];
  coreCompetitors: readonly CoreCompetitor[];
  reelDownloaderCompetitors?: readonly ReelDownloaderCompetitor[];
};

/**
 * /compare — hub page listing ALL comparison pages in one place.
 *
 * Two sections:
 * 1. Core platform comparisons (/vs/*) — Trndinn (whole platform) vs Buffer, Hootsuite, Postiz, Predis, Taplio
 * 2. Auto caption tool comparisons (/compare/trndinn-vs-*) — Trndinn's caption tool vs Submagic, Captions.ai, Opus Clip, VEED, CapCut
 *
 * Breadcrumb is transparent (no background band) so it blends with the shell canvas.
 */
export default function CaptionCompareIndexView({ captionCompetitors, coreCompetitors, reelDownloaderCompetitors }: Props) {
  return (
    <MarketingShell>
      <main>
        {/* ─── Breadcrumb (no background, blends with page canvas) ─── */}
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-6xl px-4 pt-4 text-sm text-muted-foreground sm:px-6 sm:pt-5"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground font-medium">Compare</li>
          </ol>
        </nav>

        {/* ─── Hero (transparent — blends with MarketingShell canvas) ─── */}
        <section className="relative">
          <div className="mx-auto max-w-3xl px-4 pb-8 pt-6 text-center sm:px-6 sm:pb-10 sm:pt-8">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md">
                <Scale className="h-3.5 w-3.5 text-primary" aria-hidden />
                {siteName} comparisons
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-4 font-display text-[1.9rem] font-black leading-[1.1] tracking-tight text-foreground text-balance sm:mt-5 sm:text-5xl">
                Compare {siteName} with every tool that matters
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg text-pretty">
                Two categories of head-to-head breakdowns: the {siteName} platform vs
                classic social media schedulers, and the free {siteName} Auto Caption
                Generator vs every leading AI caption tool.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--destructive))] px-8 font-semibold text-primary-foreground hover:opacity-90 sm:w-auto"
                  asChild
                >
                  <Link href="/pricing">
                    Start free — 150 credits
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full px-8 font-semibold sm:w-auto"
                  asChild
                >
                  <Link href="/alternatives">Browse alternatives</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── Section 1: Core platform comparisons ─── */}
        <Section className="!py-6 sm:!py-8 md:!py-10">
          <SectionHeading
            eyebrow="Platform"
            title={`${siteName} vs social media platforms`}
            subtitle="Head-to-head breakdowns against the leading social media scheduling and AI content tools."
          />
          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
            {coreCompetitors.map((c, i) => (
              <Reveal key={c.slug} delay={i * 40}>
                <Link
                  href={`/vs/${c.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {siteName} vs
                      </p>
                      <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                        {c.name}
                      </h3>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {c.wedgeSummary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                    <span className="rounded-full bg-muted/60 px-2 py-0.5 capitalize">
                      {c.category.replace("-", " ")}
                    </span>
                    <span className="rounded-full bg-muted/60 px-2 py-0.5">
                      {c.targetKeyword}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ─── Section 2: Caption tool comparisons ─── */}
        <Section className="!py-6 sm:!py-8 md:!py-10 border-t border-border/40">
          <SectionHeading
            eyebrow="Free tool"
            title="Auto Caption Generator vs AI caption tools"
            subtitle={`How ${siteName}'s free caption tool stacks up against the leading AI caption apps.`}
          />
          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
            {captionCompetitors.map((c, i) => (
              <Reveal key={c.slug} delay={i * 40}>
                <Link
                  href={`/compare/trndinn-vs-${c.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {siteName} vs
                      </p>
                      <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                        {c.name}
                      </h3>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {c.wedgeSummary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                    <span className="rounded-full bg-muted/60 px-2 py-0.5">caption tool</span>
                    <span className="rounded-full bg-muted/60 px-2 py-0.5">
                      {c.targetKeyword}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ─── Section 3: Instagram Reel Downloader comparisons ─── */}
        {reelDownloaderCompetitors && reelDownloaderCompetitors.length > 0 && (
          <Section className="!py-6 sm:!py-8 md:!py-10 border-t border-border/40">
            <SectionHeading
              eyebrow="Free tool"
              title="Instagram Reel Downloader vs competitors"
              subtitle={`How ${siteName}'s free Reel downloader compares to the ad-heavy incumbents — no ads, no watermark, no login.`}
            />
            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
              {reelDownloaderCompetitors.map((c, i) => (
                <Reveal key={c.slug} delay={i * 40}>
                  <Link
                    href={`/compare/trndinn-vs-${c.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {siteName} vs
                        </p>
                        <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                          {c.name}
                        </h3>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {c.wedgeSummary}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                      <span className="rounded-full bg-muted/60 px-2 py-0.5">reel downloader</span>
                      <span className="rounded-full bg-muted/60 px-2 py-0.5">
                        {c.targetKeyword}
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {/* ─── Related resources ─── */}
        <Section className="!py-6 sm:!py-8 md:!py-10 border-t border-border/40">
          <SectionHeading
            eyebrow="Keep exploring"
            title="Related resources"
            subtitle="Alternatives, the free tool, and everything else in the ecosystem."
          />
          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-3">
            <Reveal>
              <Card className="h-full rounded-2xl border border-primary/25 bg-primary/5 p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Zap className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground">
                  Free caption tool
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Auto AI captions — 6 styles, word-level sync, 99+ languages, no login.
                </p>
                <Link
                  href="/tools/auto-caption-generator"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Open the tool
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            </Reveal>
            <Reveal delay={60}>
              <Card className="h-full rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Trophy className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground">
                  Alternative-to pages
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Ranked "best alternative to" pages for every caption tool in 2026.
                </p>
                <Link
                  href="/alternatives"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Browse alternatives
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            </Reveal>
            <Reveal delay={120}>
              <Card className="h-full rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Sparkles className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground">
                  Platform features
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Brand Voice, agentic AI, Content Engine, LinkedIn publishing.
                </p>
                <Link
                  href="/features"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  See features
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            </Reveal>
          </div>

          <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2 sm:mt-8">
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/tools">
                <Wrench className="mr-1.5 h-3.5 w-3.5" />
                All free tools
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/blog">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Blog hub
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/ai-agent">
                <Rocket className="mr-1.5 h-3.5 w-3.5" />
                AI agents
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/content-engine">Content Engine</Link>
            </Button>
          </div>
        </Section>
      </main>
    </MarketingShell>
  );
}
