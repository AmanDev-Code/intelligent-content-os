"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Minus,
  Sparkles,
  ExternalLink,
  BookOpen,
  Zap,
  Scale,
  Wrench,
  Trophy,
  Video,
  Globe,
  ShieldCheck,
  TrendingUp,
  FileText,
  Users,
  Rocket,
} from "lucide-react";
import { FinalCta } from "@/components/marketing/FinalCta";
import { LandingFaq } from "@/components/marketing/LandingFaq";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComparisonBreadcrumb } from "@/components/internal-linking/BreadcrumbNav";
import { getGuidesForComparison, type ComparisonKey } from "@/lib/internalLinking";
import { siteName } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Compact section padding override — halves default marketing rhythm on comparison pages. */
const TIGHT = "!py-6 sm:!py-8 md:!py-10";

// Types for the page configuration
export type FeatureHighlight = {
  title: string;
  description: string;
  winner: "trndinn" | "competitor" | string;
};

export type ComparisonTableRow = {
  feature: string;
  [key: string]: string;
};

export type ComparisonTable = {
  title: string;
  rows: ComparisonTableRow[];
};

export type PricingPlan = {
  name: string;
  price: string;
  note?: string;
};

export type PricingSection = {
  competitorPlans: PricingPlan[];
  trndinnPlans: PricingPlan[];
  notes: {
    competitor: string[];
    trndinn: string[];
  };
};

export type WhyTrndinnPoint = {
  title: string;
  description: string;
};

export type WhyTrndinnWins = {
  title: string;
  points: WhyTrndinnPoint[];
};

export type Testimonial = {
  quote: string;
  author: string;
  company: string;
};

export type FAQ = {
  question: string;
  answer: string;
};

export type CTASection = {
  title: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
};

export type RelatedComparison = {
  name: string;
  href: string;
  description: string;
};

/** AEO entity-first TL;DR block. */
export type TldrBlock = {
  entityDeclaration: string;
  differentiator: string;
  stat: string;
  badges: string[];
};

/** Single stat cell in the 4-metric benchmark band. */
export type StatItem = {
  value: string;
  label: string;
  icon?: StatIconKey;
};

export type UseCaseRow = {
  scenario: string;
  competitor: string;
  trndinn: string;
};

export type UseCasesSection = {
  title: string;
  subtitle?: string;
  rows: UseCaseRow[];
};

export type MigrationStep = {
  title: string;
  description: string;
};

export type MigrationSection = {
  title: string;
  subtitle?: string;
  steps: MigrationStep[];
};

export type InternalLinkItem = {
  href: string;
  title: string;
  subtitle: string;
  icon?: InternalIconKey;
  featured?: boolean;
};

export type StatIconKey = "zap" | "globe" | "shield" | "sparkles" | "trending" | "trophy";
export type InternalIconKey =
  | "zap"
  | "sparkles"
  | "scale"
  | "wrench"
  | "book"
  | "trophy"
  | "video"
  | "file"
  | "globe"
  | "shield"
  | "trending"
  | "rocket";

export type CompetitorVsConfig = {
  slug: string;
  competitorName: string;
  route: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  /** Optional entity-first AEO block rendered near the top. */
  tldr?: TldrBlock;
  /** Optional 4-stat benchmark band for GEO citation. */
  stats?: StatItem[];
  competitorOverview: {
    title: string;
    paragraphs: string[];
  };
  trndinnOverview: {
    title: string;
    paragraphs: string[];
  };
  featureHighlights: FeatureHighlight[];
  comparisonTable: ComparisonTable;
  pricing: PricingSection;
  whyTrndinnWins: WhyTrndinnWins;
  /** Optional "who should use each" table. */
  useCases?: UseCasesSection;
  /** Optional 3-step migration guide. */
  migration?: MigrationSection;
  testimonials: Testimonial[];
  faqs: FAQ[];
  cta: CTASection;
  /** Optional rich internal-linking block. Falls back to relatedComparisons if absent. */
  internalLinks?: InternalLinkItem[];
  relatedComparisons: RelatedComparison[];
};

// ─── Icon resolvers ───

function resolveStatIcon(key: StatIconKey | undefined): ReactNode {
  switch (key) {
    case "globe":
      return <Globe className="h-5 w-5" aria-hidden />;
    case "shield":
      return <ShieldCheck className="h-5 w-5" aria-hidden />;
    case "sparkles":
      return <Sparkles className="h-5 w-5" aria-hidden />;
    case "trending":
      return <TrendingUp className="h-5 w-5" aria-hidden />;
    case "trophy":
      return <Trophy className="h-5 w-5" aria-hidden />;
    case "zap":
    default:
      return <Zap className="h-5 w-5" aria-hidden />;
  }
}

function resolveInternalIcon(key: InternalIconKey | undefined): ReactNode {
  switch (key) {
    case "sparkles":
      return <Sparkles className="h-4 w-4" aria-hidden />;
    case "scale":
      return <Scale className="h-4 w-4" aria-hidden />;
    case "wrench":
      return <Wrench className="h-4 w-4" aria-hidden />;
    case "book":
      return <BookOpen className="h-4 w-4" aria-hidden />;
    case "trophy":
      return <Trophy className="h-4 w-4" aria-hidden />;
    case "video":
      return <Video className="h-4 w-4" aria-hidden />;
    case "file":
      return <FileText className="h-4 w-4" aria-hidden />;
    case "globe":
      return <Globe className="h-4 w-4" aria-hidden />;
    case "shield":
      return <ShieldCheck className="h-4 w-4" aria-hidden />;
    case "trending":
      return <TrendingUp className="h-4 w-4" aria-hidden />;
    case "rocket":
      return <Rocket className="h-4 w-4" aria-hidden />;
    case "zap":
    default:
      return <Zap className="h-4 w-4" aria-hidden />;
  }
}

// Utility functions
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

// Components
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
          ? "border border-primary/30 bg-primary/5 dark:bg-primary/10"
          : "border border-border/60 bg-card/60 backdrop-blur-md dark:bg-white/[0.03]",
      )}
    >
      <p className="text-sm font-semibold text-foreground">{name}</p>
      <p className="mt-2 font-display text-2xl font-bold text-foreground">{price}</p>
      {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}

function FeatureHighlightCard({
  highlight,
  index,
  competitorName,
}: {
  highlight: FeatureHighlight;
  index: number;
  competitorName: string;
}) {
  const isTrndinn = highlight.winner === "trndinn";
  const isCompetitor =
    highlight.winner === "competitor" || highlight.winner.toLowerCase() === competitorName.toLowerCase();

  return (
    <Reveal delay={index * 40}>
      <div
        className={cn(
          "h-full rounded-2xl border p-6 sm:p-8",
          isTrndinn
            ? "border-primary/25 bg-primary/5 dark:bg-primary/10"
            : "border-border/60 bg-card/60 backdrop-blur-md dark:bg-white/[0.04]",
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              isTrndinn
                ? "bg-primary/15 text-primary"
                : isCompetitor
                  ? "bg-muted text-foreground"
                  : "bg-muted/60 text-muted-foreground",
            )}
          >
            {isTrndinn ? (
              <>
                <Check className="h-3.5 w-3.5" />
                {siteName} Wins
              </>
            ) : isCompetitor ? (
              <>
                <span>{competitorName} Wins</span>
              </>
            ) : (
              <>
                <Minus className="h-3.5 w-3.5" />
                Tie
              </>
            )}
          </span>
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-foreground">{highlight.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{highlight.description}</p>
      </div>
    </Reveal>
  );
}

function ComparisonTableSection({
  table,
  competitorName,
}: {
  table: ComparisonTable;
  competitorName: string;
}) {
  const competitorKey =
    Object.keys(table.rows[0] || {}).find(
      (key) => key !== "feature" && key.toLowerCase() !== "trndinn",
    ) || competitorName.toLowerCase();

  return (
    <Section className={TIGHT}>
      <SectionHeading eyebrow="Features" title={table.title} />

      <Reveal
        delay={80}
        className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl bg-card/80 backdrop-blur-md dark:bg-white/[0.04] md:mt-10"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-white/[0.03]">
                <th scope="col" className="px-5 py-4 sm:px-7">
                  Feature
                </th>
                <th scope="col" className="px-5 py-4 sm:px-7">
                  {competitorName}
                </th>
                <th scope="col" className="px-5 py-4 text-primary sm:px-7">
                  {siteName}
                </th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, index) => (
                <tr
                  key={row.feature}
                  className={cn(
                    "border-t border-border/40",
                    index % 2 === 1 && "bg-muted/25 dark:bg-white/[0.02]",
                  )}
                >
                  <th
                    scope="row"
                    className="px-5 py-4 text-sm font-semibold text-foreground sm:px-7 sm:text-base"
                  >
                    {row.feature}
                  </th>
                  <td className="px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:px-7">
                    {row[competitorKey] || row[competitorName.toLowerCase()]}
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
  );
}

function WhyTrndinnWinsSection({
  whyTrndinnWins,
  competitorName,
}: {
  whyTrndinnWins: WhyTrndinnWins;
  competitorName: string;
}) {
  return (
    <Section className={cn(TIGHT, "bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent")}>
      <SectionHeading
        eyebrow="Why Choose Us"
        title={whyTrndinnWins.title}
        subtitle={`How ${siteName} delivers results that ${competitorName} simply cannot match.`}
      />

      <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2">
        {whyTrndinnWins.points.map((point, index) => (
          <Reveal key={point.title} delay={index * 60}>
            <div className="h-full rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 dark:from-primary/10 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{point.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {point.description}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <Section className={TIGHT}>
      <SectionHeading
        eyebrow="Testimonials"
        title="What teams are saying"
        subtitle="Real feedback from teams who made the switch."
      />

      <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2">
        {testimonials.map((testimonial, index) => (
          <Reveal key={index} delay={index * 80}>
            <div className="h-full rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-md dark:bg-white/[0.04] sm:p-8">
              <blockquote className="text-base leading-relaxed text-foreground sm:text-lg">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {testimonial.author[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function RelatedComparisonsSection({
  comparisons,
  currentSlug,
}: {
  comparisons: RelatedComparison[];
  currentSlug: string;
}) {
  return (
    <Section className={cn(TIGHT, "border-t border-border/40")}>
      <SectionHeading
        eyebrow="More Comparisons"
        title="Compare with other tools"
        subtitle="See how we stack up against the competition."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-10">
        {comparisons
          .filter((comp) => !comp.href.includes(currentSlug))
          .map((comparison, index) => (
            <Reveal key={comparison.name} delay={index * 40}>
              <Link
                href={comparison.href}
                className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-primary/5 dark:bg-white/[0.04] dark:hover:bg-primary/10"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-foreground">vs {comparison.name}</h3>
                  <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{comparison.description}</p>
              </Link>
            </Reveal>
          ))}
      </div>
    </Section>
  );
}

// Related Guides Section - internal linking for comparison pages
function RelatedGuidesSection({ competitorKey }: { competitorKey: string }) {
  const guides = getGuidesForComparison(competitorKey as ComparisonKey);

  if (guides.length === 0) return null;

  return (
    <Section className={cn(TIGHT, "border-t border-border/40 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent")}>
      <SectionHeading
        eyebrow="Learn More"
        title={`Master ${competitorKey === "taplio" ? "LinkedIn" : "these features"}`}
        subtitle="Deep-dive guides to help you get the most from these capabilities."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-10">
        {guides.map((guide, index) => (
          <Reveal key={guide.key} delay={index * 40}>
            <Link
              href={guide.href}
              className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-md transition-all hover:border-primary/30 hover:bg-primary/5 hover:-translate-y-0.5 dark:bg-white/[0.04] dark:hover:bg-primary/10"
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: guide.color }}
                >
                  <BookOpen className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {guide.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {guide.excerpt}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
                <span>Read guide</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
              {/* SEO keywords */}
              <div className="mt-3 flex flex-wrap gap-1">
                {guide.keywords.slice(0, 2).map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

// ─── New AEO/GEO sub-components ───

function TldrSection({ tldr, competitorName }: { tldr: TldrBlock; competitorName: string }) {
  return (
    <Section className={TIGHT}>
      <Reveal>
        <div className="mx-auto max-w-3xl rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Zap className="h-4 w-4" aria-hidden />
            TL;DR
          </div>
          <p className="mt-3 text-base leading-relaxed text-foreground sm:text-lg">
            <strong>{siteName}</strong> {tldr.entityDeclaration} Unlike{" "}
            <strong>{competitorName}</strong>, {tldr.differentiator} {tldr.stat}
          </p>
          {tldr.badges.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {tldr.badges.map((badge) => (
                <Badge key={badge} variant="secondary" className="rounded-full">
                  {badge}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </Reveal>
    </Section>
  );
}

function StatBandSection({ stats }: { stats: StatItem[] }) {
  return (
    <Section className={TIGHT}>
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/60 bg-card/60 p-5 text-center backdrop-blur-md dark:bg-white/[0.04]"
          >
            <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              {resolveStatIcon(stat.icon)}
            </span>
            <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function UseCasesSectionBlock({
  useCases,
  competitorName,
}: {
  useCases: UseCasesSection;
  competitorName: string;
}) {
  return (
    <Section className={TIGHT}>
      <SectionHeading
        eyebrow="Who Should Use Each"
        title={useCases.title}
        subtitle={
          useCases.subtitle ??
          `Pick the tool that matches your workflow — ${competitorName} or ${siteName}.`
        }
      />
      <Reveal
        delay={80}
        className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl bg-card/80 backdrop-blur-md dark:bg-white/[0.04] md:mt-10"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:bg-white/[0.03]">
                <th scope="col" className="px-5 py-4 sm:px-7">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    Scenario
                  </span>
                </th>
                <th scope="col" className="px-5 py-4 sm:px-7">
                  {competitorName}
                </th>
                <th scope="col" className="px-5 py-4 text-primary sm:px-7">
                  {siteName}
                </th>
              </tr>
            </thead>
            <tbody>
              {useCases.rows.map((row, index) => (
                <tr
                  key={row.scenario}
                  className={cn(
                    "border-t border-border/40",
                    index % 2 === 1 && "bg-muted/25 dark:bg-white/[0.02]",
                  )}
                >
                  <th
                    scope="row"
                    className="px-5 py-4 text-sm font-semibold text-foreground sm:px-7 sm:text-base"
                  >
                    {row.scenario}
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
  );
}

function MigrationSectionBlock({
  migration,
  competitorName,
}: {
  migration: MigrationSection;
  competitorName: string;
}) {
  return (
    <Section className={TIGHT}>
      <SectionHeading
        eyebrow="Migration Guide"
        title={migration.title}
        subtitle={
          migration.subtitle ?? `Move from ${competitorName} to ${siteName} in three steps.`
        }
      />
      <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:mt-10 md:grid-cols-3">
        {migration.steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 60}>
            <div className="relative h-full rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-md dark:bg-white/[0.04] sm:p-7">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
                {i + 1}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function InternalLinksSection({
  links,
  competitorName,
}: {
  links: InternalLinkItem[];
  competitorName: string;
}) {
  return (
    <Section className={cn(TIGHT, "border-t border-border/40")}>
      <SectionHeading
        eyebrow="Explore More"
        title={`Keep exploring the ${siteName} platform`}
        subtitle={`Everything else you can pair with the ${competitorName} comparison.`}
      />
      <div className="mx-auto mt-6 grid max-w-5xl gap-3 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <InternalLink
            key={link.href}
            href={link.href}
            icon={resolveInternalIcon(link.icon)}
            title={link.title}
            subtitle={link.subtitle}
            featured={link.featured}
          />
        ))}
      </div>
    </Section>
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
          : "border-border/60 bg-card/50 backdrop-blur-md hover:border-primary/30 hover:bg-primary/5 dark:bg-white/[0.04]",
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

// Main component
export default function CompareVsPage({
  config,
  h1Override,
}: {
  config: CompetitorVsConfig;
  h1Override?: string | null;
}) {
  const heroTitle = h1Override ?? config.hero.title;

  return (
    <MarketingShell>
      <main>
        {/* Breadcrumb Navigation (transparent — sits on shell canvas) */}
        <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-5">
          <ComparisonBreadcrumb competitorName={config.competitorName} />
        </div>

        {/* Hero Section — transparent, no radial backdrop */}
        <section className="relative">
          <div className="mx-auto max-w-3xl px-4 pb-6 pt-6 text-center sm:px-6 sm:pb-10 sm:pt-8 md:pb-12 md:pt-10">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md dark:bg-white/5 dark:text-white/70">
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                {config.hero.eyebrow}
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.1] tracking-tight text-foreground sm:mt-6 sm:text-5xl sm:leading-[1.05] md:text-6xl text-balance">
                {h1Override ? heroTitle : highlightLastWord(heroTitle)}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg text-pretty">
                {config.hero.subtitle}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--destructive))] px-8 font-semibold text-primary-foreground hover:opacity-90 sm:w-auto"
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
                  className="h-12 w-full rounded-full border-0 bg-muted/70 px-8 font-semibold backdrop-blur-md hover:bg-muted dark:bg-white/10 dark:hover:bg-white/[0.16] sm:w-auto"
                  asChild
                >
                  <Link href="/pricing">View pricing</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* TL;DR — entity-first AEO block */}
        {config.tldr ? (
          <TldrSection tldr={config.tldr} competitorName={config.competitorName} />
        ) : null}

        {/* Stat band — GEO benchmark metrics */}
        {config.stats && config.stats.length > 0 ? <StatBandSection stats={config.stats} /> : null}

        {/* Platform Overview Section */}
        <Section className={TIGHT}>
          <SectionHeading
            eyebrow="Platform Overview"
            title="Two different approaches"
            subtitle={`We respect what ${config.competitorName} does well. Here is how each platform works.`}
          />

          <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2">
            <Reveal delay={40}>
              <article className="h-full rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-md dark:bg-white/[0.04] sm:p-8">
                <h2 className="font-display text-2xl font-bold text-foreground">{config.competitorOverview.title}</h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {config.competitorOverview.paragraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </Reveal>
            <Reveal delay={80}>
              <article className="h-full rounded-2xl border border-primary/25 bg-primary/5 p-6 backdrop-blur-md dark:bg-primary/10 sm:p-8">
                <h2 className="font-display text-2xl font-bold text-foreground">{config.trndinnOverview.title}</h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {config.trndinnOverview.paragraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </Reveal>
          </div>
        </Section>

        {/* Feature Highlights Section */}
        <Section className={TIGHT}>
          <SectionHeading
            eyebrow="Head-to-Head"
            title="Key differentiators"
            subtitle={`Where ${siteName} stands out against ${config.competitorName}.`}
          />

          <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2 lg:grid-cols-3">
            {config.featureHighlights.map((highlight, index) => (
              <FeatureHighlightCard
                key={highlight.title}
                highlight={highlight}
                index={index}
                competitorName={config.competitorName}
              />
            ))}
          </div>
        </Section>

        {/* Comparison Table Section */}
        <ComparisonTableSection table={config.comparisonTable} competitorName={config.competitorName} />

        {/* Who should use each */}
        {config.useCases ? (
          <UseCasesSectionBlock useCases={config.useCases} competitorName={config.competitorName} />
        ) : null}

        {/* Pricing Section */}
        <Section id="pricing" className={TIGHT}>
          <SectionHeading
            eyebrow="Pricing"
            title="Pricing comparison"
            subtitle={`Compare ${config.competitorName} vs ${siteName} pricing.`}
          />

          <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-2">
            <Reveal delay={40}>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">{config.competitorName}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {config.pricing.notes.competitor.map((note, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {config.pricing.competitorPlans.map((plan) => (
                    <PlanCard key={plan.name} {...plan} />
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">{siteName}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {config.pricing.notes.trndinn.map((note, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {config.pricing.trndinnPlans.map((plan, index) => (
                    <PlanCard key={plan.name} {...plan} featured={index === 1} />
                  ))}
                </div>
                <div className="mt-5">
                  <Button variant="outline" className="rounded-full" asChild>
                    <Link href="/pricing">
                      See live pricing
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* Why Trndinn Wins Section */}
        <WhyTrndinnWinsSection whyTrndinnWins={config.whyTrndinnWins} competitorName={config.competitorName} />

        {/* Migration guide */}
        {config.migration ? (
          <MigrationSectionBlock migration={config.migration} competitorName={config.competitorName} />
        ) : null}

        {/* Testimonials Section */}
        <TestimonialsSection testimonials={config.testimonials} />

        {/* FAQ Section */}
        <Section className={TIGHT}>
          <LandingFaq
            title={`${siteName} vs ${config.competitorName}: Common questions`}
            items={config.faqs.map((faq) => ({ q: faq.question, a: faq.answer }))}
          />
        </Section>

        {/* Final CTA */}
        <FinalCta
          title={config.cta.title}
          subtitle={config.cta.subtitle}
          primaryLabel={config.cta.primaryLabel}
          primaryHref="/auth"
          secondaryLabel={config.cta.secondaryLabel}
          secondaryHref="/pricing"
        />

        {/* Rich internal linking */}
        {config.internalLinks && config.internalLinks.length > 0 ? (
          <InternalLinksSection links={config.internalLinks} competitorName={config.competitorName} />
        ) : null}

        {/* Related Guides - Internal Linking */}
        <RelatedGuidesSection competitorKey={config.slug} />

        {/* Related Comparisons */}
        <RelatedComparisonsSection comparisons={config.relatedComparisons} currentSlug={config.slug} />
      </main>
    </MarketingShell>
  );
}
