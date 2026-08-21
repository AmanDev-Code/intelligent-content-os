"use client";

/**
 * BioGeneratorCompareView — head-to-head "{Trndinn} vs {Competitor}" page.
 * Matches CaptionCompareView's structure with bio-tool competitor data.
 */

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Scale,
  Sparkles,
  Trophy,
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
import type { BioCompetitor } from "@/lib/bio-generator-competitors";
import { siteName } from "@/lib/site";
import { cn } from "@/lib/utils";

const TOOL_HREF = "/tools/bio-generator";

type Props = {
  competitor: BioCompetitor;
  related: BioCompetitor[];
};

export default function BioGeneratorCompareView({ competitor, related }: Props) {
  return (
    <MarketingShell>
      <main>
        {/* ── Breadcrumb ────────────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-6xl px-4 pt-4 text-sm text-muted-foreground sm:px-6"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span className="px-1.5">/</span>
            </li>
            <li>
              <Link href="/compare" className="hover:text-foreground">Compare</Link>
              <span className="px-1.5">/</span>
            </li>
            <li className="text-foreground">{siteName} vs {competitor.name}</li>
          </ol>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <Section className="!pt-8 !pb-10">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center space-y-4">
              <Badge
                variant="outline"
                className="mx-auto inline-flex items-center gap-1.5 border-[hsl(var(--primary))]/40 text-[hsl(var(--primary))]"
              >
                <Scale className="h-3.5 w-3.5" />
                Head-to-head • Updated 2026
              </Badge>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight">
                {siteName} vs {competitor.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A fair, feature-by-feature comparison of two AI bio generators. {competitor.tagline}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button asChild size="lg" className="gap-2">
                  <Link href={TOOL_HREF}>
                    <Zap className="h-4 w-4" />
                    Try {siteName} free
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                    Visit {competitor.name} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* ── Two-sided positioning ─────────────────────────────────────── */}
        <Section className="!py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h2 className="font-heading text-xl font-bold">{siteName}</h2>
                <Badge className="bg-[hsl(var(--primary))]">Free forever</Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {competitor.wedgeSummary} Purpose-built for bios with LinkedIn desktop-cut awareness,
                Instagram emoji layouts, X/TikTok tagline mechanics, and per-bio 0-100 scoring.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {competitor.wedgePoints.slice(0, 4).map((wp) => (
                  <li key={wp.title} className="flex items-start gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[hsl(var(--primary))] mt-0.5" />
                    <span className="text-foreground">
                      <span className="font-medium">{wp.title}.</span>{" "}
                      <span className="text-muted-foreground">{wp.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-heading text-xl font-bold">{competitor.name}</h2>
              </div>
              {competitor.positioning.map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-2">{p}</p>
              ))}
              <p className="mt-3 text-sm font-medium text-foreground">Pricing</p>
              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                {competitor.pricingPlans.map((pp) => (
                  <li key={pp.name} className="flex items-baseline gap-2">
                    <span className="font-medium text-foreground">{pp.name}</span>
                    <span className="text-[hsl(var(--primary))]">{pp.price}</span>
                    {pp.note && <span className="text-xs">— {pp.note}</span>}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        {/* ── Comparison table ─────────────────────────────────────────── */}
        <Section className="!py-8">
          <SectionHeading
            eyebrow="Head-to-head"
            title="Every feature, side-by-side"
            subtitle={`How ${siteName} stacks against ${competitor.name} on the features bio writers actually care about.`}
          />
          <Card className="mt-4 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">Feature</TableHead>
                  <TableHead>{competitor.name}</TableHead>
                  <TableHead className="bg-[hsl(var(--primary))]/5">{siteName}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitor.comparisonRows.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell className="font-medium">{row.feature}</TableCell>
                    <TableCell className="text-muted-foreground">{row.competitor}</TableCell>
                    <TableCell className={cn("bg-[hsl(var(--primary))]/5 font-medium")}>{row.trndinn}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Section>

        {/* ── Switch angle ─────────────────────────────────────────────── */}
        <Section className="!py-8">
          <Card className="p-6 text-center bg-gradient-to-br from-[hsl(var(--primary))]/10 to-transparent border-[hsl(var(--primary))]/30">
            <Sparkles className="mx-auto h-6 w-6 text-[hsl(var(--primary))] mb-2" />
            <p className="italic text-lg text-foreground max-w-2xl mx-auto">
              "{competitor.switchAngle}"
            </p>
            <p className="mt-2 text-xs text-muted-foreground uppercase tracking-wider">
              A common reason users switch
            </p>
          </Card>
        </Section>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <Section className="!py-8">
          <SectionHeading
            eyebrow="Answered"
            title={`${siteName} vs ${competitor.name} FAQ`}
          />
          <LandingFaq items={competitor.faqs.map((f) => ({ q: f.question, a: f.answer }))} />
        </Section>

        {/* ── Related comparisons ─────────────────────────────────────── */}
        {related.length > 0 && (
          <Section className="!py-8">
            <SectionHeading
              eyebrow="Related"
              title="More head-to-heads"
              subtitle={`Other bio generators compared against ${siteName}.`}
            />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/compare/trndinn-vs-${r.slug}`}
                  className="group rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition hover:border-[hsl(var(--primary))]/60"
                >
                  <p className="font-medium text-foreground flex items-center gap-1 group-hover:text-[hsl(var(--primary))]">
                    {siteName} vs {r.name}
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.tagline}</p>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <Section className="!py-10">
          <Card className="p-8 text-center">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold">
              Ready to write bios that get clicks?
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              {siteName}'s bio generator is free forever with no login. Generate for 6 platforms in
              one run and get 3 angles per platform.
            </p>
            <Button asChild size="lg" className="mt-5 gap-2">
              <Link href={TOOL_HREF}>
                <Zap className="h-4 w-4" />
                Try {siteName} free
              </Link>
            </Button>
          </Card>
        </Section>
      </main>
    </MarketingShell>
  );
}
