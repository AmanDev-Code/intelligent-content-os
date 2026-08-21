"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Trophy, Wrench, FileText, Scale } from "lucide-react";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { BioCompetitor } from "@/lib/bio-generator-competitors";
import type { CaptionCompetitor } from "@/lib/caption-competitors";
import type { ReelDownloaderCompetitor } from "@/lib/reel-downloader-competitors";
import { siteName } from "@/lib/site";

type Props = {
  competitors: readonly CaptionCompetitor[];
  reelDownloaderCompetitors?: readonly ReelDownloaderCompetitor[];
  bioCompetitors?: readonly BioCompetitor[];
};

/**
 * /alternatives — hub page listing all alternative-to pages.
 * Three sections: Bio Generator, Auto Caption Generator, Instagram Reel Downloader.
 * Cross-links to /compare, tool page, blog, pricing.
 * Breadcrumb is transparent (no background band).
 */
export default function CaptionAlternativeIndexView({
  competitors,
  reelDownloaderCompetitors,
  bioCompetitors,
}: Props) {
  return (
    <MarketingShell>
      <main>
        {/* ─── Breadcrumb (no background) ─── */}
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-6xl px-4 pt-6 text-sm text-muted-foreground sm:px-6"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground font-medium">Alternatives</li>
          </ol>
        </nav>

        {/* ─── Hero (transparent — blends with MarketingShell canvas) ─── */}
        <section className="relative">
          <div className="mx-auto max-w-3xl px-4 pb-8 pt-6 text-center sm:px-6 sm:pb-10 sm:pt-8">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md">
                <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden />
                Best AI tool alternatives
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-4 font-display text-[1.9rem] font-black leading-[1.1] tracking-tight text-foreground text-balance sm:mt-5 sm:text-5xl">
                Best alternative to every AI bio, caption &amp; reel tool in 2026
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg text-pretty">
                Ranked lists of the best alternatives to Ahrefs, Pallyy, Copy.ai, Submagic,
                SnapInsta and every leading tool. Each page ranks the top 5 with {siteName}
                at #1 — free forever, no watermark, no signup.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--destructive))] px-8 font-semibold text-primary-foreground hover:opacity-90 sm:w-auto"
                  asChild
                >
                  <Link href="/tools/auto-caption-generator">
                    Try the free caption tool
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full px-8 font-semibold sm:w-auto"
                  asChild
                >
                  <Link href="/compare">See head-to-head comparisons</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── Bio Generator alternatives (largest addressable volume) ─── */}
        {bioCompetitors && bioCompetitors.length > 0 && (
          <Section className="!py-8 sm:!py-10">
            <SectionHeading
              eyebrow="Bio generator"
              title="Social Media Bio Generator alternatives"
              subtitle="Ranked by free-tier value, platform-aware character limits, tone control, and whether they require signup."
            />
            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
              {bioCompetitors.map((c, i) => (
                <Reveal key={c.slug} delay={i * 40}>
                  <Link
                    href={`/alternatives/${c.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                          Best alternative to
                        </p>
                        <h2 className="mt-1 font-display text-xl font-bold text-foreground">
                          {c.name}
                        </h2>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {c.wedgeSummary}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                      <span className="rounded-full bg-muted/60 px-2 py-0.5">bio generator</span>
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

        {/* ─── Auto Caption alternatives grid ─── */}
        <Section className="!py-8 sm:!py-10 border-t border-border/40">
          <SectionHeading
            eyebrow="Auto caption tool"
            title="AI Auto Caption Generator alternatives"
            subtitle="Ranked by free-tier value, caption quality, language coverage, and export flexibility."
          />
          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
            {competitors.map((c, i) => (
              <Reveal key={c.slug} delay={i * 40}>
                <Link
                  href={`/alternatives/${c.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Best alternative to
                      </p>
                      <h2 className="mt-1 font-display text-xl font-bold text-foreground">
                        {c.name}
                      </h2>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {c.wedgeSummary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                    <span className="rounded-full bg-muted/60 px-2 py-0.5">
                      {c.targetKeyword}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ─── Reel Downloader alternatives grid ─── */}
        {reelDownloaderCompetitors && reelDownloaderCompetitors.length > 0 && (
          <Section className="!py-8 sm:!py-10 border-t border-border/40">
            <SectionHeading
              eyebrow="Reel downloader"
              title="Instagram Reel Downloader alternatives"
              subtitle="Ranked by ad load, watermark policy, HD quality, download speed, and product depth."
            />
            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
              {reelDownloaderCompetitors.map((c, i) => (
                <Reveal key={c.slug} delay={i * 40}>
                  <Link
                    href={`/alternatives/${c.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                          Best alternative to
                        </p>
                        <h2 className="mt-1 font-display text-xl font-bold text-foreground">
                          {c.name}
                        </h2>
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
        <Section className="!py-8 sm:!py-10 border-t border-border/40">
          <SectionHeading
            eyebrow="Keep exploring"
            title="Related resources"
          />
          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-3">
            <Reveal>
              <Card className="h-full rounded-2xl border border-primary/25 bg-primary/5 p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Zap className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground">
                  The free caption tool
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Try {siteName} — the top alternative for every tool on this list.
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
                  <Scale className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground">
                  Head-to-head compare
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Feature-by-feature comparison pages for every AI caption tool.
                </p>
                <Link
                  href="/compare"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Browse comparisons
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            </Reveal>
            <Reveal delay={120}>
              <Card className="h-full rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Wrench className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground">
                  All free tools
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Reel downloader, auto captions, LinkedIn generator, more.
                </p>
                <Link
                  href="/tools"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  See the toolbox
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            </Reveal>
          </div>

          <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2 sm:mt-8">
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/blog">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Caption blog hub
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/features">Explore the platform</Link>
            </Button>
          </div>
        </Section>
      </main>
    </MarketingShell>
  );
}
