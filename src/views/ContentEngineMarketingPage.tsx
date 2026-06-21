"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  Globe,
  Layers,
  Mail,
  Search,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { ComparisonBand } from "@/components/marketing/ComparisonBand";
import { FinalCta } from "@/components/marketing/FinalCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WORKFLOW_STEPS = [
  {
    key: "research",
    title: "Research",
    body: "Keyword discovery, cluster planning, and competitor-aware briefs — so every article targets real search intent.",
  },
  {
    key: "generate",
    title: "Generate",
    body: "AI SEO articles with seo_title, seo_description, quality scoring (SEO, AEO, GEO, E-E-A-T), schema, and images.",
  },
  {
    key: "publish",
    title: "Publish",
    body: "Publish to your blog with internal links, structured data, and on-site optimization baked in.",
  },
  {
    key: "distribute",
    title: "Distribute",
    body: "Adapt each article for 31 platforms — Tier 1 auto-publish, Tier 2/3 with agent-generated copies you approve.",
  },
  {
    key: "track",
    title: "Track",
    body: "Rank tracking, performance scoring, newsletter campaigns, and backlink opportunities — close the growth loop.",
  },
] as const;

const WORKFLOW_ICONS: Record<string, LucideIcon> = {
  research: Search,
  generate: Sparkles,
  publish: Send,
  distribute: Globe,
  track: TrendingUp,
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "SEO article generation",
    body: "Full wizard from keyword to publish-ready article with seo_title, seo_description, and multi-dimensional quality scoring.",
  },
  {
    icon: Layers,
    title: "Content clusters",
    body: "Pillar pages plus supporting articles — build topical authority instead of one-off posts.",
  },
  {
    icon: Globe,
    title: "31-platform distribution",
    body: "One article becomes platform-native copies for LinkedIn, Medium, Dev.to, and 28 more destinations.",
  },
  {
    icon: Mail,
    title: "Newsletter",
    body: "Listmonk campaigns from your content — grow an owned audience, not just social rent.",
  },
  {
    icon: BarChart3,
    title: "Rank tracking",
    body: "Track keyword positions over time and spot movers — organic growth you can measure.",
  },
  {
    icon: TrendingUp,
    title: "SEO, AEO & GEO scoring",
    body: "Score every article for traditional search, AI answer engines, and generative search — optimize where discovery happens.",
  },
] as const;

const COMPARISON_ROWS = [
  { label: "AI SEO article generation with scoring", manual: false, trndinn: true },
  { label: "Content clusters and internal linking", manual: false, trndinn: true },
  { label: "31-platform distribution from articles", manual: false, trndinn: true },
  { label: "Newsletter campaigns from content", manual: false, trndinn: true },
  { label: "Rank tracking and optimization loop", manual: false, trndinn: true },
  { label: "Queue and schedule social posts only", manual: true, trndinn: false },
] as const;

function highlightLastWord(title: string) {
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

export default function ContentEngineMarketingPage({ h1Override }: { h1Override?: string | null }) {
  const title = h1Override ?? "Grow organic traffic with an agentic Content Engine";

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
                <Globe className="h-3.5 w-3.5 text-primary" aria-hidden />
                Content Engine
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.1] tracking-tight text-foreground sm:mt-6 sm:text-5xl sm:leading-[1.05] md:text-6xl">
                {h1Override ? title : highlightLastWord(title)}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                Turn keywords into SEO articles, content clusters, 31-platform distribution, newsletter
                campaigns, and rank tracking — one agentic loop that feeds your social presence.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground/90">
                Content Engine is available in Team and Agency workspaces today (admin console). Start free to
                explore the platform — we&apos;re expanding self-serve access.
              </p>
            </Reveal>
            <Reveal delay={200}>
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

        {/* Workflow */}
        <Section>
          <SectionHeading
            eyebrow="The loop"
            title="Research → Generate → Publish → Distribute → Track"
            subtitle="Schedulers stop at the queue. Content Engine closes the loop from keyword research to organic growth and owned audience."
          />

          <div className="relative mt-8 md:mt-10">
            <div
              className="pointer-events-none absolute left-0 right-0 top-7 hidden lg:block"
              aria-hidden
            >
              <div className="mx-auto h-[2px] w-[82%] bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
            </div>
            <div
              className="pointer-events-none absolute bottom-6 left-[27px] top-6 w-[2px] bg-gradient-to-b from-primary/45 via-primary/25 to-transparent lg:hidden"
              aria-hidden
            />

            <ol className="grid gap-8 lg:grid-cols-5 lg:gap-4">
              {WORKFLOW_STEPS.map((step, index) => {
                const Icon = WORKFLOW_ICONS[step.key] ?? Sparkles;
                return (
                  <Reveal key={step.key} delay={index * 90} as="li">
                    <div className="flex gap-5 lg:flex-col lg:gap-0">
                      <div className="relative shrink-0 lg:flex lg:justify-center">
                        <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary dark:bg-[#0b1120]">
                          <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/15 to-transparent dark:from-primary/25" />
                          <Icon className="relative h-6 w-6 text-primary" aria-hidden />
                          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#ff8a1f] to-[#ff3d39] text-[11px] font-black text-white">
                            {index + 1}
                          </span>
                        </span>
                      </div>
                      <div
                        className={cn(
                          "min-w-0 flex-1 rounded-2xl bg-card/70 p-5 backdrop-blur-md",
                          "dark:bg-white/[0.04] lg:mt-6 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none",
                        )}
                      >
                        <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </Section>

        {/* Feature grid */}
        <Section className="pt-0 sm:pt-2">
          <SectionHeading
            eyebrow="Capabilities"
            title="Everything schedulers-only tools don't ship"
            subtitle="Built for growth leads who need search, distribution, and newsletter — not just a posting queue."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 md:mt-10">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 60}>
                <div className="h-full rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12">
                    <feature.icon className="h-5 w-5 text-primary" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Differentiation */}
        <ComparisonBand
          title="Schedulers queue posts. Content Engine grows traffic."
          subtitle="Most tools stop at scheduling. Trndinn connects SEO articles, multi-platform distribution, and newsletter into one agentic workflow."
          manualLabel="Schedulers only"
          trndinnLabel="Content Engine"
          rows={[...COMPARISON_ROWS]}
        />

        <FinalCta
          title="Ready to grow with Content Engine?"
          subtitle="Start free on Trndinn — explore agentic scheduling today. Content Engine is included in Team and Agency workspaces; contact us if you need early access."
          primaryLabel="Start free"
          primaryHref="/auth"
          secondaryLabel="See agentic workflows"
          secondaryHref="/features#agentic"
        />
      </main>
    </MarketingShell>
  );
}
