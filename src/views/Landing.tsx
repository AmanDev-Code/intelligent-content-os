"use client";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { LandingHero, type LandingHeroContent } from "@/components/marketing/LandingHero";
import { BackersBand } from "@/components/marketing/BackersBand";
import { ChannelCloud } from "@/components/marketing/ChannelCloud";
import { BentoFeatures } from "@/components/marketing/BentoFeatures";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { AudienceSegments } from "@/components/marketing/AudienceSegments";
import { ComparisonBand } from "@/components/marketing/ComparisonBand";
import { CompareSection } from "@/components/marketing/CompareSection";
import { GuidesSection } from "@/components/internal-linking/GuidesSection";
import { SecondaryFeatures } from "@/components/marketing/SecondaryFeatures";
import { StatBand } from "@/components/marketing/StatBand";
import { TrustBand } from "@/components/marketing/TrustBand";
import { Testimonials } from "@/components/marketing/Testimonials";
import { PricingTeaser } from "@/components/marketing/PricingTeaser";
import { LandingFaq } from "@/components/marketing/LandingFaq";
import { FinalCta } from "@/components/marketing/FinalCta";
import { DEFAULT_MARKETING_CONTENT, useSiteContent } from "@/lib/marketing/siteContent";

export default function Landing({ h1Override }: { h1Override?: string | null }) {
  const { content, loading } = useSiteContent();

  const hero = (content.landing_hero ?? DEFAULT_MARKETING_CONTENT.landing_hero) as LandingHeroContent;
  const backers = content.landing_backers ?? DEFAULT_MARKETING_CONTENT.landing_backers;
  const pillars = content.landing_pillars ?? DEFAULT_MARKETING_CONTENT.landing_pillars;
  const how = content.landing_how ?? DEFAULT_MARKETING_CONTENT.landing_how;
  const comparison = content.landing_comparison ?? DEFAULT_MARKETING_CONTENT.landing_comparison;
  const secondary = content.landing_secondary_features ?? DEFAULT_MARKETING_CONTENT.landing_secondary_features;
  const stats = content.landing_stats ?? DEFAULT_MARKETING_CONTENT.landing_stats;
  const integrations = content.landing_integrations ?? DEFAULT_MARKETING_CONTENT.landing_integrations;
  const trust = content.landing_trust ?? DEFAULT_MARKETING_CONTENT.landing_trust;
  const pricingTeaser = content.landing_pricing_teaser ?? DEFAULT_MARKETING_CONTENT.landing_pricing_teaser;
  const faq = content.landing_faq ?? DEFAULT_MARKETING_CONTENT.landing_faq;

  const heroContent: LandingHeroContent = h1Override ? { ...hero, title: h1Override } : hero;

  return (
    <MarketingShell>
      <main>
        <LandingHero hero={heroContent} loading={loading} />

        <BackersBand
          title={backers?.title}
          subtitle={backers?.subtitle}
          items={backers?.items ?? DEFAULT_MARKETING_CONTENT.landing_backers.items}
        />

        <ChannelCloud
          title={integrations?.title}
          subtitle={integrations?.subtitle}
          channels={integrations?.channels ?? DEFAULT_MARKETING_CONTENT.landing_integrations.channels}
        />

        <BentoFeatures
          title={pillars?.title}
          subtitle={pillars?.subtitle}
          items={pillars?.items ?? DEFAULT_MARKETING_CONTENT.landing_pillars.items}
        />

        <HowItWorks
          title={how?.title}
          subtitle={how?.subtitle}
          steps={how?.steps ?? DEFAULT_MARKETING_CONTENT.landing_how.steps}
        />

        <AudienceSegments />

        <ComparisonBand
          title={comparison?.title}
          subtitle={comparison?.subtitle}
          manualLabel={comparison?.manualLabel}
          trndinnLabel={comparison?.trndinnLabel}
          rows={comparison?.rows ?? DEFAULT_MARKETING_CONTENT.landing_comparison.rows}
        />

        <CompareSection />

        <GuidesSection
          eyebrow="Expert Resources"
          title="Master social media with our guides"
          subtitle="Step-by-step tutorials on AI content generation, LinkedIn automation, content repurposing, and scheduling workflows."
          guideOrder={[
            "ai-social-media-marketing",
            "linkedin-automation",
            "content-repurposing",
            "social-media-scheduling",
          ]}
        />

        <StatBand
          title={stats?.title}
          items={stats?.items ?? DEFAULT_MARKETING_CONTENT.landing_stats.items}
          loading={loading}
        />

        <SecondaryFeatures
          title={secondary?.title}
          subtitle={secondary?.subtitle}
          items={secondary?.items ?? DEFAULT_MARKETING_CONTENT.landing_secondary_features.items}
        />

        <TrustBand
          title={trust?.title}
          subtitle={trust?.subtitle}
          disclaimer={trust?.disclaimer}
          items={trust?.items ?? DEFAULT_MARKETING_CONTENT.landing_trust.items}
        />

        <Testimonials />

        <PricingTeaser
          title={pricingTeaser?.title}
          subtitle={pricingTeaser?.subtitle}
          ctaLabel={pricingTeaser?.ctaLabel}
          ctaHref={pricingTeaser?.ctaHref}
          highlights={pricingTeaser?.highlights ?? DEFAULT_MARKETING_CONTENT.landing_pricing_teaser.highlights}
        />

        <LandingFaq
          title={faq?.title}
          items={faq?.items ?? DEFAULT_MARKETING_CONTENT.landing_faq.items}
        />

        <FinalCta />
      </main>
    </MarketingShell>
  );
}
