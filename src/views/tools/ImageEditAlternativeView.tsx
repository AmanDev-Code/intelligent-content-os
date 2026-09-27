"use client";

/**
 * ImageEditAlternativeView — alternatives page for image edit/compression tool competitors.
 * Follows ImageConverterAlternativeView pattern exactly.
 *
 * Shadcn primitives: Badge, Button, Card.
 * Marketing components: MarketingShell, Reveal, Section, SectionHeading, LandingFaq.
 * Design tokens: --primary, --primary-foreground, --card, --muted, --muted-foreground,
 *   --foreground, --border.
 * Icons: Lucide only.
 */

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Check,
  ExternalLink,
  FlaskConical,
  Scale,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  Gauge,
  Zap,
} from "lucide-react";

import { LandingFaq } from "@/components/marketing/LandingFaq";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ImageEditCompetitor } from "@/lib/image-edit-competitors";
import { siteName } from "@/lib/site";
import { cn } from "@/lib/utils";

const TOOL_HREF = "/tools/compress-jpg";
const COMPARE_HUB_HREF = "/compare";
const ALTERNATIVES_HUB_HREF = "/alternatives";
const LAST_UPDATED = "September 2026";
const TOOLS_TESTED = 8;

const TIGHT = "!py-6 sm:!py-8 md:!py-10";

type Props = {
  competitor: ImageEditCompetitor;
  related: ImageEditCompetitor[];
};

function getStrengths(c: ImageEditCompetitor): string[] {
  return c.positioning.slice(0, 3);
}

function getWeaknesses(c: ImageEditCompetitor): string[] {
  return c.weaknesses.slice(0, 3);
}

export default function ImageEditAlternativeView({ competitor, related }: Props) {
  const allRanked = [competitor, ...related];

  return (
    <MarketingShell>
      <main className="bg-[hsl(var(--tool-bg))] text-foreground">
        {/* ─── Breadcrumb ─── */}
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-6xl px-4 pt-4 text-sm text-muted-foreground sm:px-6 sm:pt-5"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground">Home</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={ALTERNATIVES_HUB_HREF} className="hover:text-foreground">
                Alternatives
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-foreground">{competitor.name}</li>
          </ol>
        </nav>

        {/* ─── Hero ─── */}
        <section className="relative">
          <div className="mx-auto max-w-3xl px-4 pb-6 pt-6 text-center sm:px-6 sm:pb-10 sm:pt-8 md:pb-12 md:pt-10">
            <Reveal>
              <div className="flex items-center justify-center gap-3">
                <Badge variant="secondary" className="rounded-full text-xs">
                  <Calendar className="mr-1 h-3 w-3" aria-hidden />
                  Last updated: {LAST_UPDATED}
                </Badge>
              </div>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-5 font-display text-[1.75rem] font-black leading-[1.1] tracking-tight text-foreground sm:mt-6 sm:text-4xl md:text-5xl">
                Best {competitor.name} Alternatives in 2026
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                We tested {TOOLS_TESTED} online image editing tools and ranked the top 5 by privacy
                (local vs. cloud processing), daily limits, feature coverage, and pricing. Here is
                what we found.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ─── TL;DR / Quick Answer (AEO) ─── */}
        <Section className={TIGHT}>
          <Reveal>
            <div className="mx-auto max-w-3xl rounded-lg border border-primary/25 bg-primary/5 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground sm:text-xl">
                <Zap className="h-5 w-5 text-primary" aria-hidden />
                What is the best {competitor.name} alternative?
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                <strong className="text-foreground">{siteName}</strong> is the best free{" "}
                {competitor.name} alternative in 2026. It compresses, resizes, crops, rotates, and
                watermarks images entirely in your browser — 9 dedicated tools, no server uploads,
                no daily limits, and no login required.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">Free forever</Badge>
                <Badge variant="secondary" className="rounded-full">No uploads</Badge>
                <Badge variant="secondary" className="rounded-full">No login</Badge>
                <Badge variant="secondary" className="rounded-full">9 edit tools</Badge>
                <Badge variant="secondary" className="rounded-full">No daily limits</Badge>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* ─── Methodology ─── */}
        <Section className={TIGHT}>
          <Reveal>
            <div className="mx-auto max-w-3xl rounded-lg border border-border/60 bg-card/60 p-5 backdrop-blur-md sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <FlaskConical className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
                    How we tested
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    We evaluated {TOOLS_TESTED} online image editing tools across six criteria: file
                    privacy (local browser processing vs. server upload), daily operation limits,
                    feature breadth (compression, resize, crop, rotate, watermark), processing speed,
                    UI clarity, and pricing transparency. Each tool was tested across desktop Chrome
                    and mobile Safari in September 2026.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* ─── Ranked List (Top 5) ─── */}
        <Section id="top-alternatives" className={TIGHT}>
          <SectionHeading
            eyebrow="2026 Ranking"
            title={`Top 5 ${competitor.name} alternatives, ranked`}
            subtitle="Based on our testing methodology. Trndinn is our top pick."
          />

          <ol className="mx-auto mt-8 max-w-4xl space-y-6 md:mt-10">
            {/* #1 — Trndinn */}
            <Reveal>
              <li className="rounded-lg border border-primary/40 bg-primary/5 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-2xl font-black text-primary-foreground"
                    aria-label="Rank 1"
                  >
                    1
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-xl font-bold text-foreground">
                        {siteName} Image Tools
                      </h3>
                      <Badge className="rounded-full bg-primary text-primary-foreground">
                        <Trophy className="mr-1 h-3 w-3" /> Best pick
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {siteName} is a free browser-based image editing suite with 9 dedicated tools
                      covering compression (JPG, PNG, WebP, GIF), resize with platform presets, crop,
                      rotate/flip, watermark, and a multi-op Image Workbench. Every operation runs
                      locally via the Canvas API — no uploads, unlimited usage, no watermark, no login.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                          <ThumbsUp className="h-3.5 w-3.5" /> Pros
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            Completely free — no watermark, no daily cap
                          </li>
                          <li className="flex gap-2">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            Local browser processing — zero uploads
                          </li>
                          <li className="flex gap-2">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            9 tools including multi-op Image Workbench
                          </li>
                        </ul>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <ThumbsDown className="h-3.5 w-3.5" /> Cons
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="mt-0.5 text-muted-foreground">-</span>
                            Browser-only (no desktop app)
                          </li>
                          <li className="flex gap-2">
                            <span className="mt-0.5 text-muted-foreground">-</span>
                            Performance depends on device hardware
                          </li>
                          <li className="flex gap-2">
                            <span className="mt-0.5 text-muted-foreground">-</span>
                            Newer brand, still building recognition
                          </li>
                        </ul>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-muted-foreground">
                      <strong className="text-foreground">Pricing:</strong> Free forever. All 9
                      image editing tools, unlimited usage, no login — completely free with no paid
                      tier for the image tools.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button size="sm" className="rounded-full" asChild>
                        <Link href={TOOL_HREF}>
                          Try the free image tools
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            </Reveal>

            {/* #2-5 — Competitors */}
            {allRanked.map((alt, index) => (
              <Reveal key={alt.slug} delay={(index + 1) * 50}>
                <li className="rounded-lg border border-border/60 bg-card/60 p-5 backdrop-blur-md sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted font-display text-2xl font-black text-muted-foreground"
                      aria-label={`Rank ${index + 2}`}
                    >
                      {index + 2}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-xl font-bold text-foreground">
                          {alt.name}
                        </h3>
                        <a
                          href={alt.url}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {new URL(alt.url).hostname}
                        </a>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {alt.positioning[0]}
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                            <ThumbsUp className="h-3.5 w-3.5" /> What it does well
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {getStrengths(alt).map((s, i) => (
                              <li key={i} className="flex gap-2">
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <ThumbsDown className="h-3.5 w-3.5" /> Limitations
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {getWeaknesses(alt).map((w, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="mt-0.5 text-muted-foreground">-</span>
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground">
                        <strong className="text-foreground">Why it ranks below {siteName}:</strong>{" "}
                        {alt.switchAngle}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button size="sm" variant="outline" className="rounded-full" asChild>
                          <Link href={`/compare/trndinn-vs-${alt.slug}`}>
                            {siteName} vs {alt.name}
                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </Section>

        {/* ─── Comparison table ─── */}
        <Section id="comparison-table" className={TIGHT}>
          <SectionHeading
            eyebrow="Side-by-Side"
            title="Feature comparison table"
            subtitle={`How ${siteName} compares to ${competitor.name} on the features that matter.`}
          />
          <Reveal delay={80} className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl bg-card/80 backdrop-blur-md md:mt-10">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Feature</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">{competitor.name}</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-primary">{siteName}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitor.comparisonRows.map((row, index) => (
                    <TableRow
                      key={row.feature}
                      className={cn(index % 2 === 1 && "bg-muted/25")}
                    >
                      <TableCell className="font-semibold text-foreground">
                        {row.feature}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.competitor}</TableCell>
                      <TableCell className="font-semibold text-foreground">{row.trndinn}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Reveal>
        </Section>

        {/* ─── Final CTA ─── */}
        <Section className={TIGHT}>
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-card/80 px-6 py-12 text-center backdrop-blur-xl sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_80%_at_50%_0%,hsl(var(--primary)/0.14),transparent_55%)]" />
              <Badge className="rounded-full bg-primary/15 text-primary">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                No uploads. No login. No limits.
              </Badge>
              <h2 className="mx-auto mt-5 max-w-3xl font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
                The best free {competitor.name} alternative is already here
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {siteName} offers compress, resize, crop, rotate, watermark, and pipeline editing —
                all browser-based, all free, with no account required.
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--destructive))] px-8 font-semibold text-primary-foreground hover:opacity-90 sm:w-auto"
                  asChild
                >
                  <Link href={TOOL_HREF}>
                    Try the free image tools
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full px-8 font-semibold sm:w-auto"
                  asChild
                >
                  <Link href={`/compare/trndinn-vs-${competitor.slug}`}>
                    {siteName} vs {competitor.name}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* ─── FAQ ─── */}
        <LandingFaq
          title={`${competitor.name} alternatives: Common questions`}
          items={competitor.faqs.map((f) => ({ q: f.question, a: f.answer }))}
        />

        {/* ─── Related links ─── */}
        <Section className={cn(TIGHT, "border-t border-border/40")}>
          <SectionHeading
            eyebrow="Keep Exploring"
            title="More comparisons and free tools"
            subtitle="Every way to compare and explore the Trndinn image editing ecosystem."
          />
          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
            {allRanked.slice(0, 3).map((r) => (
              <Link
                key={r.slug}
                href={`/compare/trndinn-vs-${r.slug}`}
                className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-3.5 backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Scale className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {siteName} vs {r.name}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    Full comparison with pricing table
                  </p>
                </div>
                <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </Link>
            ))}
            <Link
              href={COMPARE_HUB_HREF}
              className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-3.5 backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Scale className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">All comparisons</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {siteName} vs every image tool
                </p>
              </div>
              <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            </Link>
            <Link
              href="/tools/compress-jpg"
              className="group flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 p-3.5 transition-colors hover:bg-primary/10"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Gauge className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">JPG Compressor</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  Compress JPG free — no upload needed
                </p>
              </div>
              <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            </Link>
            <Link
              href="/tools"
              className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-3.5 backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">All free tools</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  The full free toolbox
                </p>
              </div>
              <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            </Link>
          </div>
        </Section>
      </main>
    </MarketingShell>
  );
}
