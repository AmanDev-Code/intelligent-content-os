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
import type { ReelDownloaderCompetitor } from "@/lib/reel-downloader-competitors";
import { siteName } from "@/lib/site";
import { cn } from "@/lib/utils";

/* ─── Constants ─── */
const COMPARE_HUB_HREF = "/compare";
const ALTERNATIVES_HUB_HREF = "/alternatives";
const BLOG_HOW_TO_HREF =
  "/blog/how-to-download-instagram-reels-without-watermark";
const LAST_UPDATED = "August 2026";
const TOOLS_TESTED = 15;

/* ─── Compact section spacing ─── */
const TIGHT = "!py-6 sm:!py-8 md:!py-10";

type Props = {
  competitor: ReelDownloaderCompetitor;
  related: ReelDownloaderCompetitor[];
};

export default function ReelDownloaderAlternativeView({ competitor, related }: Props) {
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
                We tested {TOOLS_TESTED} Instagram Reel downloaders and ranked the top 5 by ad load,
                watermark policy, download speed, HD quality, and privacy. Here is what we found.
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
                <a
                  href={competitor.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="text-foreground underline underline-offset-2 hover:text-primary"
                >
                  {competitor.name}
                </a>{" "}
                alternative in 2026. It downloads Instagram Reels in HD 1080p with zero ads, no
                watermark, no login, and sub-2-second processing on a single trusted domain.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">Zero ads</Badge>
                <Badge variant="secondary" className="rounded-full">No watermark</Badge>
                <Badge variant="secondary" className="rounded-full">No login</Badge>
                <Badge variant="secondary" className="rounded-full">HD 1080p</Badge>
                <Badge variant="secondary" className="rounded-full">Under 2 seconds</Badge>
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
                  <FlaskConical className="h-4.5 w-4.5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
                    How we tested
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    We evaluated {TOOLS_TESTED} Instagram Reel downloaders across five criteria: ad
                    load (number of interstitials per download session), watermark policy, download
                    speed (time from paste to MP4 save), maximum video quality, and privacy posture
                    (extension permissions, credential requests, clone-domain risk). Each tool was
                    tested on 10 public Reels across desktop Chrome and mobile Safari in July 2026.
                    This page focuses on alternatives to{" "}
                    <a
                      href={competitor.url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="text-foreground underline underline-offset-2 hover:text-primary"
                    >
                      {competitor.name}
                    </a>.
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
                        {siteName} Instagram Reel Downloader
                      </h3>
                      <Badge className="rounded-full bg-primary text-primary-foreground">
                        <Trophy className="mr-1 h-3 w-3" /> Best pick
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {siteName} is a browser-based Instagram Reel downloader with genuinely zero
                      ads, no watermark, no login, and no clone-domain confusion. It processes any
                      public Reel as an HD 1080p MP4 in under 2 seconds. Unlike standalone
                      downloaders, it connects to a full creator suite: AI captions, scheduling,
                      Brand Voice, and LinkedIn publishing.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                          <ThumbsUp className="h-3.5 w-3.5" /> Pros
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Zero ads, zero interstitials, zero popups</li>
                          <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />HD 1080p in-browser, under 2 seconds</li>
                          <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Real product suite (schedule, caption, Brand Voice)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <ThumbsDown className="h-3.5 w-3.5" /> Cons
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <li className="flex gap-2"><span className="mt-0.5 text-muted-foreground">-</span>Bulk download not yet available (roadmap 2026)</li>
                          <li className="flex gap-2"><span className="mt-0.5 text-muted-foreground">-</span>Public Reels only (no private content)</li>
                          <li className="flex gap-2"><span className="mt-0.5 text-muted-foreground">-</span>Newer brand, still building domain authority</li>
                        </ul>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-muted-foreground">
                      <strong className="text-foreground">Pricing:</strong> Free forever. No premium
                      tier required for the downloader.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button size="sm" className="rounded-full" asChild>
                        <Link href="/tools/instagram-reel-downloader">
                          Try the free reel downloader
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
              Data collected July-August 2026. Based on testing{" "}
              <a
                href={competitor.url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                {competitor.name}
              </a>{" "}
              vs {siteName}.{" "}
              <Link
                href={`/compare/trndinn-vs-${competitor.slug}`}
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                See the full head-to-head comparison
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
              The bottom line: {competitor.name} {competitor.positioning[1]?.split(". Users")[0]?.toLowerCase().includes("the tradeoffs") ? competitor.positioning[1].split(". Users")[0].replace("The tradeoffs are", "has tradeoffs around") : "works for basic downloads but falls short for creators who need a complete workflow"}.{" "}
              <Link
                href="/tools/instagram-reel-downloader"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Try the {siteName} Instagram Reel Downloader free
              </Link>{" "}
              and see the difference firsthand.
            </p>
          </Reveal>
        </Section>

        {/* ─── Stats Band ─── */}
        <Section className={TIGHT}>
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard icon={<Zap className="h-5 w-5" />} value="<2s" label="Avg download time" />
            <StatCard icon={<Video className="h-5 w-5" />} value="1080p" label="Max HD quality" />
            <StatCard icon={<ShieldCheck className="h-5 w-5" />} value="0" label="Ads or popups" />
            <StatCard icon={<Sparkles className="h-5 w-5" />} value={String(TOOLS_TESTED)} label="Tools we tested" />
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
              href="/tools/instagram-reel-downloader"
              label="Try the Instagram Reel Downloader (free, no signup)"
            />
            <InternalLinkRow
              href={BLOG_HOW_TO_HREF}
              label="How to download Instagram Reels without watermark (step-by-step guide)"
            />
            <InternalLinkRow
              href={COMPARE_HUB_HREF}
              label="See all reel downloader comparisons"
            />
            <InternalLinkRow
              href={ALTERNATIVES_HUB_HREF}
              label="Browse all Instagram Reel downloader alternatives"
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
                Ready to try a cleaner alternative?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Paste any public Instagram Reel link and get the HD MP4 in under 2 seconds.
                No signup, no watermark, no ads. That is it.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" className="h-12 w-full rounded-full px-8 font-semibold sm:w-auto" asChild>
                  <Link href="/tools/instagram-reel-downloader">
                    Download a Reel free
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
            title="Compare more reel downloaders"
            subtitle="Browse alternative-to pages for every major Instagram Reel downloader."
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
function getStrengths(alt: ReelDownloaderCompetitor): string[] {
  // Derive strengths from comparison rows where competitor has a positive indicator
  const strengths: string[] = [];
  for (const row of alt.comparisonRows) {
    if (row.competitor.startsWith("✅") && strengths.length < 3) {
      strengths.push(`${row.feature}: ${row.competitor.replace("✅ ", "")}`);
    }
  }
  // Fallback if not enough check marks
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
