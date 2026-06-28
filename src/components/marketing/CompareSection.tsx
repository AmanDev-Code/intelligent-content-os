"use client";

import Link from "next/link";
import { ArrowRight, Scale, Layers, Bird, Code, Sparkles, Linkedin } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

type CompetitorCard = {
  key: string;
  name: string;
  tagline: string;
  href: string;
  color: string;
  icon: React.FC<{ className?: string }>;
};

const COMPETITORS: CompetitorCard[] = [
  {
    key: "buffer",
    name: "Buffer",
    tagline: "The scheduling pioneer",
    href: "/vs/buffer",
    color: "#ff8a1f",
    icon: Layers,
  },
  {
    key: "hootsuite",
    name: "Hootsuite",
    tagline: "Enterprise alternative",
    href: "/vs/hootsuite",
    color: "#ff3d39",
    icon: Bird,
  },
  {
    key: "postiz",
    name: "Postiz",
    tagline: "Open source alternative",
    href: "/vs/postiz",
    color: "#10b981",
    icon: Code,
  },
  {
    key: "predis",
    name: "Predis.ai",
    tagline: "AI content generator",
    href: "/vs/predis",
    color: "#8b5cf6",
    icon: Sparkles,
  },
  {
    key: "taplio",
    name: "Taplio",
    tagline: "LinkedIn-focused tool",
    href: "/vs/taplio",
    color: "#0A66C2",
    icon: Linkedin,
  },
];

function CompetitorCardComponent({ competitor }: { competitor: CompetitorCard }) {
  return (
    <Reveal>
      <Link
        href={competitor.href}
        className="group relative isolate flex h-full flex-col overflow-hidden rounded-2xl bg-card/70 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-card/90 dark:bg-white/[0.03] dark:hover:bg-white/[0.05] sm:p-6"
        aria-label={`Compare Trndinn vs ${competitor.name} - ${competitor.tagline}`}
      >
        {/* Hover glow effect - wrapped in overflow-hidden container for Safari */}
        <span className="absolute inset-0 overflow-hidden rounded-2xl">
          <span
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
            style={{ backgroundColor: `${competitor.color}20` }}
          />
        </span>

        {/* Brand color accent */}
        <div
          className="absolute left-0 top-0 h-full w-1 opacity-70 transition-opacity group-hover:opacity-100"
          style={{ backgroundColor: competitor.color }}
        />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {competitor.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{competitor.tagline}</p>
          </div>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: competitor.color }}
          >
            <competitor.icon className="h-5 w-5" />
          </span>
        </div>

        {/* CTA */}
        <div className="mt-auto flex items-center gap-2 pt-4">
          <span className="text-sm font-semibold text-primary group-hover:underline">
            See comparison
          </span>
          <ArrowRight
            className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </div>
      </Link>
    </Reveal>
  );
}

export type CompareSectionContent = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
};

export function CompareSection({
  title,
  subtitle,
  eyebrow,
}: CompareSectionContent = {}) {
  const sectionTitle =
    title ?? "The best Buffer alternative? Compare Trdninn vs popular tools";
  const sectionSubtitle =
    subtitle ??
    "See how Trndinn stacks up against the top social media schedulers, AI content generators, and LinkedIn growth tools.";
  const sectionEyebrow = eyebrow ?? "Compare";

  return (
    <Section
      id="compare"
      className="relative overflow-hidden"
      containerClassName="relative z-10"
    >
      {/* Background accents */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl dark:from-primary/10" />
      <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-[#ff3d39]/5 blur-3xl dark:bg-[#ff3d39]/10" />

      <SectionHeading
        eyebrow={sectionEyebrow}
        title={sectionTitle}
        subtitle={sectionSubtitle}
        align="center"
      />

      {/* Competitor Grid - Desktop: 3+2, Tablet: 2 columns, Mobile: 1 column */}
      <div className="mt-10 sm:mt-12">
        <nav aria-label="Competitor comparisons">
          <ul
            className={cn(
              "grid gap-4 sm:gap-5",
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              "[&>*:nth-child(4)]:sm:col-span-2 lg:[&>*:nth-child(4)]:col-span-1",
              "[&>*:nth-child(5)]:sm:col-span-2 lg:[&>*:nth-child(5)]:col-span-1"
            )}
          >
            {COMPETITORS.map((competitor) => (
              <li key={competitor.key}>
                <CompetitorCardComponent competitor={competitor} />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* SEO-optimized description */}
      <Reveal delay={100}>
        <footer className="mt-10 flex flex-col items-center text-center sm:mt-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Scale className="h-4 w-4 text-primary" aria-hidden />
            <span>
              AI social media scheduler comparison: Buffer alternative, Hootsuite
              alternative, Postiz alternative, Predis.ai alternative, Taplio
              alternative
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground/70">
            Trndinn vs Buffer, Trndinn vs Hootsuite, Trndinn vs Postiz, Trndinn
            vs Predis.ai, Trndinn vs Taplio — detailed feature-by-feature
            comparisons to help you choose the right social media management
            tool for your workflow.
          </p>
        </footer>
      </Reveal>
    </Section>
  );
}
