"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check, Sparkles, Zap, ShieldCheck, Download, ExternalLink, BookOpen, Wrench, Scale, Trophy, FileText, Video } from "lucide-react";

import { LandingFaq } from "@/components/marketing/LandingFaq";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ReelDownloaderCompetitor } from "@/lib/reel-downloader-competitors";
import { siteName } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Compact section padding override — halves default marketing rhythm on these pages. */
const TIGHT = "!py-6 sm:!py-8 md:!py-10";

type Props = {
  competitor: ReelDownloaderCompetitor;
  related: ReelDownloaderCompetitor[];
};

const TOOL_HREF = "/tools/instagram-reel-downloader";
const TOOLS_HREF = "/tools";

export default function ReelDownloaderCompareView({ competitor, related }: Props) {
  const heroTitle = `${siteName} vs ${competitor.name} — Instagram Reel Downloader Comparison`;

  return (
    <MarketingShell>
      <main>
        {/* ─── Breadcrumb (transparent — sits directly on page canvas, no band) ─── */}
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
              <Link href="/compare" className="hover:text-foreground">
                Compare
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground font-medium">
              {siteName} vs {competitor.name}
            </li>
          </ol>
        </nav>

        {/* ─── Hero (transparent — blends with MarketingShell canvas) ─── */}
        <section className="relative">
          <div className="mx-auto max-w-3xl px-4 pb-6 pt-6 text-center sm:px-6 sm:pb-10 sm:pt-8 md:pb-12 md:pt-10">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                {siteName} vs {competitor.name}
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.1] tracking-tight text-foreground text-balance sm:mt-6 sm:text-5xl md:text-6xl">
                {heroTitle}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg text-pretty">
                {competitor.wedgeSummary}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--destructive))] px-8 font-semibold text-primary-foreground hover:opacity-90 sm:w-auto"
                  asChild
                >
                  <Link href={TOOL_HREF}>
                    Try the free reel downloader
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full px-8 font-semibold sm:w-auto"
                  asChild
                >
                  <Link href="#comparison">See the comparison</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── TL;DR — entity-first AEO block ─── */}
        <Section className={TIGHT}>
          <Reveal>
            <div className="mx-auto max-w-3xl rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Zap className="h-4 w-4" aria-hidden />
                TL;DR
              </div>
              <p className="mt-3 text-base leading-relaxed text-foreground sm:text-lg">
                <strong>{siteName}</strong> is a free, browser-based Instagram Reel downloader that
                saves any public Reel as an HD MP4 in under 2 seconds — with zero ads, no watermark,
                no login, and no clone-domain confusion. Unlike <strong>{competitor.name}</strong>,{" "}
                {competitor.wedgeSummary.charAt(0).toLowerCase() + competitor.wedgeSummary.slice(1)}{" "}
                Trndinn also connects downloads to AI captions, scheduling, and Brand Voice — a real
                product behind the tool, not just an ad-monetized page. [Internal analytics, 2026]
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">Free forever</Badge>
                <Badge variant="secondary" className="rounded-full">No ads</Badge>
                <Badge variant="secondary" className="rounded-full">No watermark</Badge>
                <Badge variant="secondary" className="rounded-full">No login</Badge>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* ─── Two approaches ─── */}
        <Section className={TIGHT}>
          <SectionHeading
            eyebrow="Platform Overview"
            title="Two different approaches"
            subtitle={`We respect what ${competitor.name} does well. Here's how each tool works.`}
          />
          <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2">
            <Reveal delay={40}>
              <article className="h-full rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-md sm:p-8">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {competitor.name}: {competitor.tagline}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {competitor.positioning.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                <a
                  href={competitor.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Visit {competitor.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </article>
            </Reveal>
            <Reveal delay={80}>
              <article className="h-full rounded-2xl border border-primary/25 bg-primary/5 p-6 backdrop-blur-md sm:p-8">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {siteName}: Free reel downloads, real product behind it
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  <p>
                    {siteName}'s Instagram Reel Downloader is a browser-native tool built for
                    creators who want the download workflow to be instant, ad-free, and safe. Paste
                    the Reel link, tap download, save the HD MP4 — no login, no watermark, no
                    interstitials, no clone-domain confusion.
                  </p>
                  <p>
                    {siteName} sits inside a wider creator platform: AI captions, LinkedIn
                    publishing, Brand Voice, and a Content Engine. The reel downloader stays free
                    forever regardless of platform plan — schedule the reel you just downloaded in
                    one flow.
                  </p>
                </div>
                <Link
                  href={TOOL_HREF}
                  className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Try the free tool
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </article>
            </Reveal>
          </div>
        </Section>

        {/* ─── Why Trndinn wins ─── */}
        <Section className={cn(TIGHT, "bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent")}>
          <SectionHeading
            eyebrow="Why Switch"
            title={`Why choose ${siteName} over ${competitor.name}`}
            subtitle={competitor.wedgeSummary}
          />
          <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2">
            {competitor.wedgePoints.map((point, index) => (
              <Reveal key={point.title} delay={index * 60}>
                <Card className="h-full rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {point.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ─── Feature comparison table ─── */}
        <Section id="comparison" className={TIGHT}>
          <SectionHeading
            eyebrow="Head-to-Head"
            title={`${siteName} vs ${competitor.name}: Feature comparison`}
            subtitle="A factual side-by-side of the reel download workflow, safety, and product depth."
          />
          <Reveal delay={80} className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl bg-card/80 backdrop-blur-md md:mt-10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th scope="col" className="px-5 py-4 sm:px-7">Feature</th>
                    <th scope="col" className="px-5 py-4 sm:px-7">{competitor.name}</th>
                    <th scope="col" className="px-5 py-4 text-primary sm:px-7">{siteName}</th>
                  </tr>
                </thead>
                <tbody>
                  {competitor.comparisonRows.map((row, index) => (
                    <tr
                      key={row.feature}
                      className={cn(
                        "border-t border-border/40",
                        index % 2 === 1 && "bg-muted/25",
                      )}
                    >
                      <th
                        scope="row"
                        className="px-5 py-4 text-sm font-semibold text-foreground sm:px-7 sm:text-base"
                      >
                        {row.feature}
                      </th>
                      <td className="px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:px-7">
                        {row.competitor}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-foreground sm:px-7">
                        {row.trndinn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </Section>

        {/* ─── Pricing side-by-side ─── */}
        <Section id="pricing" className={TIGHT}>
          <SectionHeading
            eyebrow="Pricing"
            title={`${competitor.name} vs ${siteName} pricing`}
            subtitle={`Compare list prices as of ${new Date("2026-08-03").toLocaleDateString("en-US", { year: "numeric", month: "long" })}.`}
          />
          <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-2">
            <Reveal delay={40}>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {competitor.name}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {competitor.pricingNotes.map((note, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {competitor.pricingPlans.map((plan) => (
                    <div
                      key={plan.name}
                      className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md"
                    >
                      <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                      <p className="mt-2 font-display text-2xl font-bold text-foreground">
                        {plan.price}
                      </p>
                      {plan.note ? (
                        <p className="mt-2 text-sm text-muted-foreground">{plan.note}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">{siteName}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Instagram Reel Downloader is free forever — no ads, no watermark, no login</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>All free tools (Reel Downloader, Auto Captions, Video Downloader) are 100% free — no upsell, no limits</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Paid platform (LinkedIn scheduling, Brand Voice, AI Studio, Content Engine) ships separately — free tools stay free regardless</span>
                  </li>
                </ul>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <PlanCard name="Free forever" price="$0" note="All tools: Reel Downloader, Auto Captions, Video Downloader — no limits, no login" featured />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Trndinn&apos;s free tools have no paid tier, no credit system, and no usage caps. The paid platform (LinkedIn scheduling, AI content studio, multi-channel publishing) is a separate product at <Link href="/pricing" className="text-primary hover:underline">trndinn.com/pricing</Link>.
                </p>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* ─── Stat band ─── */}
        <Section className={TIGHT}>
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={<Zap className="h-5 w-5" />} value="<2s" label="Avg download time" />
            <StatCard icon={<Download className="h-5 w-5" />} value="1080p" label="HD quality" />
            <StatCard icon={<ShieldCheck className="h-5 w-5" />} value="0" label="Ads or watermarks" />
            <StatCard icon={<Sparkles className="h-5 w-5" />} value="1" label="Trusted domain" />
          </div>
        </Section>

        {/* ─── FAQ ─── */}
        <LandingFaq
          title={`${siteName} vs ${competitor.name}: Common questions`}
          items={competitor.faqs.map((f) => ({ q: f.question, a: f.answer }))}
        />

        {/* ─── Final CTA ─── */}
        <Section className={TIGHT}>
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-card/80 px-6 py-12 text-center backdrop-blur-xl sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_80%_at_50%_0%,hsl(var(--primary)/0.14),transparent_55%)]" />
              <h2 className="mx-auto max-w-3xl font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Ready to switch from {competitor.name}?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Paste a Reel link. Get the HD MP4 in under 2 seconds. No signup, no watermark, no
                ads.
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--destructive))] px-8 font-semibold text-primary-foreground hover:opacity-90 sm:w-auto"
                  asChild
                >
                  <Link href={TOOL_HREF}>
                    Try the free reel downloader
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 w-full rounded-full px-8 font-semibold sm:w-auto" asChild>
                  <Link href={TOOLS_HREF}>Browse all free tools</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* ─── Rich internal linking (5-7 links to full sitemap) ─── */}
        <Section className={cn(TIGHT, "border-t border-border/40")}>
          <SectionHeading
            eyebrow="Explore More"
            title="Keep the reel workflow tight"
            subtitle={`Everything else in the ${siteName} Instagram toolbox.`}
          />
          <div className="mx-auto mt-6 grid max-w-5xl gap-3 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
            <InternalLink
              href={TOOL_HREF}
              icon={<Video className="h-4 w-4" />}
              title="Instagram Reel Downloader"
              subtitle="The free tool itself — try it now"
              featured
            />
            <InternalLink
              href={`/alternatives/${competitor.slug}`}
              icon={<Trophy className="h-4 w-4" />}
              title={`Top ${competitor.name} alternatives`}
              subtitle="Ranked list with 5 alternatives"
            />
            <InternalLink
              href="/compare"
              icon={<Scale className="h-4 w-4" />}
              title="All comparisons"
              subtitle={`${siteName} vs every reel downloader`}
            />
            <InternalLink
              href="/tools/auto-caption-generator"
              icon={<Zap className="h-4 w-4" />}
              title="Auto Caption Generator"
              subtitle="Add captions to any Reel you downloaded"
            />
            <InternalLink
              href="/tools"
              icon={<Wrench className="h-4 w-4" />}
              title="All free tools"
              subtitle="The full free toolbox"
            />
            <InternalLink
              href="/pricing"
              icon={<Sparkles className="h-4 w-4" />}
              title="Platform pricing"
              subtitle="See paid plans + Content Engine"
            />
            <InternalLink
              href="/features"
              icon={<BookOpen className="h-4 w-4" />}
              title="Trndinn features"
              subtitle="Brand Voice, scheduler, agents"
            />
            <InternalLink
              href="/blog"
              icon={<FileText className="h-4 w-4" />}
              title="Reel blog hub"
              subtitle="How-tos, safety guides, tutorials"
            />
          </div>
        </Section>

        {/* ─── Related comparisons ─── */}
        <Section className={cn(TIGHT, "border-t border-border/40")}>
          <SectionHeading
            eyebrow="More Comparisons"
            title="Compare Trndinn with other reel downloaders"
            subtitle="See how Trndinn stacks up against the rest of the Instagram downloader category."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-10">
            {related.map((r, i) => (
              <Reveal key={r.slug} delay={i * 40}>
                <Link
                  href={`/compare/trndinn-vs-${r.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-foreground">
                      vs {r.name}
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
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="outline" className="rounded-full" asChild>
              <Link href={`/alternatives/${competitor.slug}`}>
                Top {competitor.name} alternatives
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href={TOOLS_HREF}>All free tools</Link>
            </Button>
          </div>
        </Section>
      </main>
    </MarketingShell>
  );
}

function InternalLink({
  href,
  icon,
  title,
  subtitle,
  featured,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-3 rounded-xl border p-3.5 transition-colors",
        featured
          ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
          : "border-border/60 bg-card/50 backdrop-blur-md hover:border-primary/30 hover:bg-primary/5",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          featured ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{subtitle}</p>
      </div>
      <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
    </Link>
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
      className={cn(
        "rounded-2xl p-5",
        featured
          ? "border border-primary/30 bg-primary/5"
          : "border border-border/60 bg-card/60 backdrop-blur-md",
      )}
    >
      <p className="text-sm font-semibold text-foreground">{name}</p>
      <p className="mt-2 font-display text-2xl font-bold text-foreground">{price}</p>
      {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 text-center backdrop-blur-md">
      <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
        {icon}
      </span>
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
