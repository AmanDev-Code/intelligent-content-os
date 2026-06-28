"use client";

import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { GuideCard } from "@/components/internal-linking/GuideCard";
import { getAllGuides, getAllComparisons } from "@/lib/internalLinking";
import { BookOpen, ArrowRight, Sparkles, Zap, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";

const BENEFITS = [
  {
    icon: Sparkles,
    title: "AI-Powered Strategies",
    description: "Learn to leverage artificial intelligence for content creation and optimization.",
  },
  {
    icon: Zap,
    title: "Automation Workflows",
    description: "Set up systems that work for you 24/7, saving hours of manual work.",
  },
  {
    icon: Target,
    title: "Platform-Specific Tips",
    description: "Tailored advice for LinkedIn, Twitter/X, and other major platforms.",
  },
  {
    icon: TrendingUp,
    title: "Growth Tactics",
    description: "Proven strategies used by top creators and marketing professionals.",
  },
];

export function GuidesHub() {
  const guides = getAllGuides();
  const comparisons = getAllComparisons();

  return (
    <MarketingShell>
      {/* Hero Section */}
      <Section className="relative overflow-hidden pt-20 sm:pt-24 lg:pt-28">
        {/* Background decoration */}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/10 to-transparent blur-3xl dark:from-primary/20" />
        <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-3xl dark:bg-emerald-500/10" />

        <div className="text-center">
          <Reveal>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <BookOpen className="h-4 w-4" />
              Free Resources
            </div>
          </Reveal>

          <Reveal delay={50}>
            <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Expert Guides &{" "}
              <span className="bg-gradient-to-r from-primary via-orange-500 to-red-500 bg-clip-text text-transparent">
                Resources
              </span>
            </h1>
          </Reveal>

          <Reveal delay={100}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Master social media marketing with our comprehensive guides. From AI-powered content 
              creation to automated scheduling — everything you need to scale your social presence.
            </p>
          </Reveal>

          {/* Stats */}
          <Reveal delay={150}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">{guides.length}</span>
                Expert Guides
              </span>
              <span className="hidden h-4 w-px bg-border sm:block" />
              <span className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">{comparisons.length}</span>
                Tool Comparisons
              </span>
              <span className="hidden h-4 w-px bg-border sm:block" />
              <span className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">100%</span>
                Free to Read
              </span>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Guides Grid */}
      <Section id="guides" className="pt-8">
        <SectionHeading
          eyebrow="In-Depth Guides"
          title="Comprehensive marketing guides"
          subtitle="Step-by-step tutorials covering everything from AI content strategies to platform-specific automation."
          align="center"
        />

        <div className="mt-12">
          <ul className="grid gap-6 sm:grid-cols-2 lg:gap-8">
            {guides.map((guide, index) => (
              <li key={guide.key}>
                <GuideCard guide={guide} index={index} variant="featured" />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Benefits Grid */}
      <Section className="pt-8">
        <SectionHeading
          eyebrow="What You'll Learn"
          title="Skills that drive results"
          subtitle="Our guides are designed to give you actionable skills you can implement immediately."
          align="center"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 50}>
              <div className="group relative rounded-2xl border border-border/60 bg-card/50 p-6 transition-all hover:border-primary/30 hover:bg-card/80">
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Tool Comparisons */}
      <Section className="pt-8">
        <SectionHeading
          eyebrow="Comparisons"
          title="Find your perfect tool"
          subtitle="See how Trndinn compares to other popular social media management platforms."
          align="center"
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((comparison, index) => (
            <Reveal key={comparison.key} delay={index * 40}>
              <Link
                href={comparison.href}
                className="group flex items-center justify-between rounded-xl border border-border/60 bg-card/50 p-4 transition-all hover:border-primary/30 hover:bg-card/80"
              >
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Trndinn vs {comparison.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {comparison.description}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="pb-20 pt-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-orange-500/10 p-8 sm:p-12">
            {/* Background decoration */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

            <div className="relative text-center">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Ready to put these strategies into action?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Start your free trial and let our AI help you implement everything you've learned in these guides.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 font-semibold transition-all hover:bg-muted"
                >
                  Explore Features
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>
    </MarketingShell>
  );
}
