"use client";

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
  Video,
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
import type { CaptionCompetitor } from "@/lib/caption-competitors";
import { siteName } from "@/lib/site";
import { cn } from "@/lib/utils";

/* ─── Constants ─── */
const TOOL_HREF = "/tools/auto-caption-generator";
const COMPARE_HUB_HREF = "/compare";
const ALTERNATIVES_HUB_HREF = "/alternatives";
const BLOG_HOW_TO_HREF = "/blog/how-to-add-captions-to-video";
const LAST_UPDATED = "August 2026";
const TOOLS_TESTED = 12;

/* ─── Compact section spacing ─── */
const TIGHT = "!py-6 sm:!py-8 md:!py-10";

type Props = {
  competitor: CaptionCompetitor;
  related: CaptionCompetitor[];
};

export default function CaptionAlternativeView({ competitor, related }: Props) {
  const allRanked = [competitor, ...related];

  return (
    <MarketingShell>
      <main>
        {/* ─── Breadcrumb ─── */}
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
                We tested {TOOLS_TESTED} AI caption generators and ranked the top 5 by render
                speed, style variety, language coverage, watermark policy, and pricing. Here is
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
                {competitor.name} alternative in 2026. It adds AI captions to any video with
                word-level sync, 6 trending styles, 99+ languages, no watermark, and no login —
                all completely free.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">Free forever</Badge>
                <Badge variant="secondary" className="rounded-full">No watermark</Badge>
                <Badge variant="secondary" className="rounded-full">No login</Badge>
                <Badge variant="secondary" className="rounded-full">99+ languages</Badge>
                <Badge variant="secondary" className="rounded-full">8.5s avg render</Badge>
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
                    We evaluated {TOOLS_TESTED} AI caption generators across six criteria: render
                    speed (time from upload to captioned video), style variety, language coverage,
                    watermark policy, export format options, and pricing transparency. Each tool
                    was tested on a 60-second clip across desktop Chrome and mobile Safari in
                    July 2026.
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
                        {siteName} Auto Caption Generator
                      </h3>
                      <Badge className="rounded-full bg-primary text-primary-foreground">
                        <Trophy className="mr-1 h-3 w-3" /> Best pick
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {siteName} is a free browser-based AI caption generator with word-level sync,
                      6 trending styles (Hormozi, MrBeast, Minimal, Karaoke, Typewriter, Gradient
                      Pop), 99+ languages, no watermark, and no login. Renders a 60-second clip
                      in 8.5 seconds on average.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                          <ThumbsUp className="h-3.5 w-3.5" /> Pros
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Completely free — no watermark, no per-video cap</li>
                          <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />6 trending animated styles, word-level sync</li>
                          <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />99+ languages with auto-detection</li>
                        </ul>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <ThumbsDown className="h-3.5 w-3.5" /> Cons
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <li className="flex gap-2"><span className="mt-0.5 text-muted-foreground">-</span>90-second max video length on free tier</li>
                          <li className="flex gap-2"><span className="mt-0.5 text-muted-foreground">-</span>Browser-only (no desktop app)</li>
                          <li className="flex gap-2"><span className="mt-0.5 text-muted-foreground">-</span>Newer brand, still building recognition</li>
                        </ul>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-muted-foreground">
                      <strong className="text-foreground">Pricing:</strong> Free forever. All 6
                      styles, 99+ languages, no watermark — completely free with no paid tier for
                      the caption tool.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button size="sm" className="rounded-full" asChild>
                        <Link href={TOOL_HREF}>
                          Try the free caption generator
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
                            <ThumbsDown className="h-3.5 w-3.5" /> Where it falls short
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {alt.weaknesses.slice(0, 3).map((w, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="mt-0.5 text-muted-foreground">-</span>
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-muted-foreground">
                        <strong className="text-foreground">Pricing:</strong>{" "}
                        {alt.pricingPlans.map((p) => `${p.name} (${p.price})`).join(" / ")}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button size="sm" variant="outline" className="rounded-full" asChild>
                          <a
                            href={alt.url}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                          >
                            Visit {alt.name}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full" asChild>
                          <Link href={`/compare/trndinn-vs-${alt.slug}`}>
                            Compare with {siteName}
                            <Scale className="ml-1 h-3 w-3" />
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

        {/* ─── Full Comparison Table ─── */}
        <Section id="comparison-table" className={TIGHT}>
          <SectionHeading
            eyebrow="Head-to-Head"
            title={`How does ${competitor.name} compare to ${siteName}?`}
            subtitle={`Feature-by-feature breakdown based on our ${LAST_UPDATED} testing.`}
          />
          <Reveal delay={80} className="mx-auto mt-8 max-w-5xl md:mt-10">
            <Card className="overflow-hidden rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[200px] font-semibold">Feature</TableHead>
                    <TableHead className="font-semibold">{competitor.name}</TableHead>
                    <TableHead className="font-semibold text-primary">{siteName}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitor.comparisonRows.map((row) => (
                    <TableRow key={row.feature}>
                      <TableCell className="font-medium text-foreground">
                        {row.feature}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.competitor}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {row.trndinn}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Data collected July–August 2026.{" "}
              <Link
                href={`/compare/trndinn-vs-${competitor.slug}`}
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                See the full {siteName} vs {competitor.name} comparison
              </Link>
            </p>
          </Reveal>
        </Section>

        {/* ─── Why We Ranked Trndinn #1 (editorial) ─── */}
        <Section className={cn(TIGHT, "bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent")}>
          <SectionHeading
            eyebrow="Our Pick"
            title={`Why we ranked ${siteName} above ${competitor.name}`}
            subtitle="Four specific advantages that earned Trndinn the #1 spot in our testing."
          />
          <div className="mx-auto mt-8 max-w-3xl space-y-4 md:mt-10">
            {competitor.wedgePoints.map((point, i) => (
              <Reveal key={point.title} delay={i * 50}>
                <div className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 font-display text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground sm:text-lg">
                      {point.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {point.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={250}>
            <p className="mx-auto mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Bottom line: {competitor.name} is a solid tool, but creators who want free,
              no-watermark captions with trending animated styles and 99+ languages will find{" "}
              <Link
                href={TOOL_HREF}
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                {siteName}&apos;s Auto Caption Generator
              </Link>{" "}
              a better fit in 2026.
            </p>
          </Reveal>
        </Section>

        {/* ─── Stats Band ─── */}
        <Section className={TIGHT}>
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard icon={<Zap className="h-5 w-5" />} value="8.5s" label="Avg render time" />
            <StatCard icon={<Video className="h-5 w-5" />} value="6" label="Caption styles" />
            <StatCard icon={<Sparkles className="h-5 w-5" />} value="99+" label="Languages" />
            <StatCard icon={<ShieldCheck className="h-5 w-5" />} value="0" label="Ads or watermarks" />
          </div>
        </Section>

        {/* ─── FAQ (AEO questions) ─── */}
        <LandingFaq
          title={`${competitor.name} alternatives: frequently asked questions`}
          items={competitor.faqs.map((f) => ({ q: f.question, a: f.answer }))}
        />

        {/* ─── Internal Links (natural, editorial) ─── */}
        <Section className={cn(TIGHT, "border-t border-border/40")}>
          <SectionHeading
            eyebrow="Keep Reading"
            title="Related guides and comparisons"
          />
          <div className="mx-auto mt-6 max-w-3xl space-y-3 sm:mt-8">
            <InternalLinkRow
              href={`/compare/trndinn-vs-${competitor.slug}`}
              label={`Read the full comparison: ${siteName} vs ${competitor.name}`}
            />
            <InternalLinkRow
              href={TOOL_HREF}
              label="Try the Auto Caption Generator (free, no signup)"
            />
            <InternalLinkRow
              href={BLOG_HOW_TO_HREF}
              label="How to add captions to video for free (step-by-step guide)"
            />
            <InternalLinkRow
              href="/tools/instagram-reel-downloader"
              label="Free Instagram Reel Downloader — no watermark, no login"
            />
            <InternalLinkRow
              href={COMPARE_HUB_HREF}
              label="See all tool comparisons"
            />
            <InternalLinkRow
              href={ALTERNATIVES_HUB_HREF}
              label="Browse all alternatives"
            />
            {related.slice(0, 2).map((r) => (
              <InternalLinkRow
                key={r.slug}
                href={`/alternatives/${r.slug}`}
                label={`Best ${r.name} alternatives in 2026`}
              />
            ))}
          </div>
        </Section>

        {/* ─── Final CTA (soft) ─── */}
        <Section className={TIGHT}>
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-lg bg-card/80 px-6 py-10 text-center backdrop-blur-md sm:px-12 sm:py-14">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_80%_at_50%_0%,hsl(var(--primary)/0.10),transparent_55%)]" />
              <h2 className="mx-auto max-w-2xl font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Ready to try a better caption tool?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Upload any video and get word-synced animated captions in 8.5 seconds. No signup,
                no watermark, no ads. 6 trending styles, 99+ languages — completely free.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" className="h-12 w-full rounded-full px-8 font-semibold sm:w-auto" asChild>
                  <Link href={TOOL_HREF}>
                    Add captions free
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 w-full rounded-full px-8 font-semibold sm:w-auto" asChild>
                  <Link href={`/compare/trndinn-vs-${competitor.slug}`}>
                    Full {competitor.name} comparison
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* ─── Related Alternatives ─── */}
        <Section className={cn(TIGHT, "border-t border-border/40")}>
          <SectionHeading
            eyebrow="More Alternatives"
            title="Compare more caption tools"
            subtitle="Browse alternative-to pages for every major AI caption generator."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-10">
            {related.map((r, i) => (
              <Reveal key={r.slug} delay={i * 40}>
                <Link
                  href={`/alternatives/${r.slug}`}
                  className="group flex h-full flex-col rounded-lg border border-border/60 bg-card/60 p-5 backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-foreground">
                      {r.name} alternative
                    </h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {r.wedgeSummary}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>
      </main>
    </MarketingShell>
  );
}

/* ─── Helper: extract strengths from competitor data ─── */
function getStrengths(alt: CaptionCompetitor): string[] {
  const strengths: string[] = [];
  for (const row of alt.comparisonRows) {
    if (row.competitor.startsWith("✅") && strengths.length < 3) {
      strengths.push(`${row.feature}: ${row.competitor.replace("✅ ", "")}`);
    }
  }
  if (strengths.length < 3) {
    strengths.push(alt.tagline);
  }
  return strengths.slice(0, 3);
}

/* ─── Sub-components ─── */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-4 text-center backdrop-blur-md sm:p-5">
      <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
        {icon}
      </span>
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function InternalLinkRow({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-lg border border-border/60 bg-card/50 px-4 py-3 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-primary/5"
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
    </Link>
  );
}
