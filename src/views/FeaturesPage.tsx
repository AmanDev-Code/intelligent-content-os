"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Reveal } from "@/components/marketing/Reveal";
import { type FeatureSection } from "@/components/marketing/FeatureRows";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import { ProductRoadmap, type RoadmapContent } from "@/components/marketing/ProductRoadmap";
import { BackersBand } from "@/components/marketing/BackersBand";
import { ChannelCloud } from "@/components/marketing/ChannelCloud";
import { FinalCta } from "@/components/marketing/FinalCta";
import { Button } from "@/components/ui/button";
import { DEFAULT_MARKETING_CONTENT, useSiteContent } from "@/lib/marketing/siteContent";

/** Highlights the final word of the title with the animated brand gradient. */
function highlightLastWord(title: string): ReactNode {
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

export default function FeaturesPage({ h1Override }: { h1Override?: string | null }) {
  const { content } = useSiteContent();

  const featuresContent = content.features_page ?? DEFAULT_MARKETING_CONTENT.features_page;
  const eyebrow: string = featuresContent?.eyebrow ?? "Features";
  const title: string = h1Override ?? featuresContent?.title ?? "Everything you need to publish with confidence";
  const subtitle: string =
    featuresContent?.subtitle ??
    "A complete workflow: generate from your own examples, schedule with precision, publish reliably, and learn from results.";
  const sections: FeatureSection[] = featuresContent?.sections ?? [];

  const backers = content.landing_backers ?? DEFAULT_MARKETING_CONTENT.landing_backers;
  const integrations = content.landing_integrations ?? DEFAULT_MARKETING_CONTENT.landing_integrations;
  const roadmap: RoadmapContent = content.features_roadmap ?? DEFAULT_MARKETING_CONTENT.features_roadmap;

  return (
    <MarketingShell>
      <main>
        {/* Hero — sits on the one page canvas; only soft in-flow accents on top. */}
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(255,138,31,0.26),transparent_55%)]" />
          <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
          <div className="pointer-events-none absolute -right-24 top-1/3 -z-10 h-[380px] w-[380px] rounded-full bg-[#ff3d39]/10 blur-3xl dark:bg-[#ff3d39]/20" />
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5] dark:opacity-100"
            style={{
              backgroundImage:
                "linear-gradient(to right, hsl(var(--foreground) / 0.07) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.07) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 80% 60% at 50% 25%, black, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 25%, black, transparent 75%)",
            }}
          />

          <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-16 md:pb-20 md:pt-20">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md dark:bg-white/5 dark:text-white/70">
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                {eyebrow}
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.1] tracking-tight text-foreground sm:mt-6 sm:text-5xl sm:leading-[1.05] md:text-6xl">
                {h1Override ? title : highlightLastWord(title)}
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
                  <Link href="/pricing">View pricing</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        <BackersBand
          title={backers?.title}
          subtitle={backers?.subtitle}
          items={backers?.items ?? DEFAULT_MARKETING_CONTENT.landing_backers.items}
        />

        <FeatureShowcase sections={sections} />

        <ProductRoadmap content={roadmap} />

        <ChannelCloud
          title={integrations?.title}
          subtitle={integrations?.subtitle}
          channels={integrations?.channels ?? DEFAULT_MARKETING_CONTENT.landing_integrations.channels}
        />

        <FinalCta
          title="One workflow for your whole social presence"
          subtitle="Generate from your own examples, schedule with precision, and publish to the accounts you connect. You own your data, and we comply with every platform's policies."
        />
      </main>
    </MarketingShell>
  );
}
