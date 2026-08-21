import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import {
  CAPTION_COMPETITOR_SLUGS,
  getCaptionCompetitor,
  getRelatedCaptionCompetitors,
} from "@/lib/caption-competitors";
import {
  REEL_DOWNLOADER_COMPETITOR_SLUGS,
  getReelDownloaderCompetitor,
  getRelatedReelDownloaderCompetitors,
} from "@/lib/reel-downloader-competitors";
import {
  BIO_COMPETITOR_SLUGS,
  getBioCompetitor,
  getRelatedBioCompetitors,
} from "@/lib/bio-generator-competitors";
import { BIO_GENERATOR_PRIMARY_SLUG } from "@/lib/bio-generator-aliases";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";
import CaptionCompareView from "@/views/tools/CaptionCompareView";
import ReelDownloaderCompareView from "@/views/tools/ReelDownloaderCompareView";
import BioGeneratorCompareView from "@/views/tools/BioGeneratorCompareView";

/**
 * /compare/[slug] — dynamic catch-all for tool comparisons.
 *
 * Handles THREE product datasets (matched in order via `resolveCompetitor`):
 *   1. Auto Caption Generator competitors (CaptionCompareView) — Submagic, Captions.ai, Opus Clip, VEED, CapCut.
 *   2. Instagram Reel Downloader competitors (ReelDownloaderCompareView) — SnapInsta, SSSInstagram, SaveFrom, and others.
 *   3. Bio Generator competitors (BioGeneratorCompareView) — Ahrefs, Pallyy, Copy.ai, Hootsuite, Writesonic, QuillBot,
 *      Predis, Simplified, Canva Magic Write, ChatGPT (per SEO PDF Section 5, sorted P1/P2/P3).
 *
 * Slugs use the `trndinn-vs-{competitor}` pattern; slug namespaces do not overlap
 * between datasets. `generateStaticParams` spreads all three arrays so every page
 * is pre-rendered at build time.
 */

/** Truncate at a word boundary to avoid mid-word cuts in SERP titles. */
function truncateAtWord(str: string, max: number): string {
  if (str.length <= max) return str;
  const truncated = str.slice(0, max);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > max * 0.6 ? truncated.slice(0, lastSpace) : truncated;
}

const SLUG_PREFIX = "trndinn-vs-";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type ResolvedCompetitor =
  | { kind: "caption"; competitorSlug: string }
  | { kind: "reel"; competitorSlug: string }
  | { kind: "bio"; competitorSlug: string }
  | null;

function resolveCompetitor(rawSlug: string): ResolvedCompetitor {
  if (!rawSlug.startsWith(SLUG_PREFIX)) return null;
  const competitorSlug = rawSlug.slice(SLUG_PREFIX.length);
  if (CAPTION_COMPETITOR_SLUGS.includes(competitorSlug)) {
    return { kind: "caption", competitorSlug };
  }
  if (REEL_DOWNLOADER_COMPETITOR_SLUGS.includes(competitorSlug)) {
    return { kind: "reel", competitorSlug };
  }
  if (BIO_COMPETITOR_SLUGS.includes(competitorSlug)) {
    return { kind: "bio", competitorSlug };
  }
  return null;
}

export async function generateStaticParams() {
  return [
    ...CAPTION_COMPETITOR_SLUGS.map((slug) => ({ slug: `${SLUG_PREFIX}${slug}` })),
    ...REEL_DOWNLOADER_COMPETITOR_SLUGS.map((slug) => ({ slug: `${SLUG_PREFIX}${slug}` })),
    ...BIO_COMPETITOR_SLUGS.map((slug) => ({ slug: `${SLUG_PREFIX}${slug}` })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveCompetitor(slug);
  if (!resolved) return {};
  const route = `/compare/${slug}`;

  if (resolved.kind === "caption") {
    const competitor = getCaptionCompetitor(resolved.competitorSlug);
    if (!competitor) return {};
    const title = `${siteName} vs ${competitor.name} — Best Free ${competitor.name} Alternative 2026`;
    const description =
      `Compare ${siteName} vs ${competitor.name}: free AI auto caption generator, 99+ languages, no watermark, 8.5s avg render. See features, pricing, and why creators switch.`;
    return buildMarketingMetadata(route, {
      title: truncateAtWord(title, 60),
      description: truncateAtWord(description, 155),
      keywords: [
        competitor.targetKeyword,
        `${competitor.name.toLowerCase()} vs trndinn`,
        `trndinn vs ${competitor.name.toLowerCase()}`,
        `${competitor.name.toLowerCase()} alternative`,
        `best ${competitor.name.toLowerCase()} alternative`,
        "free auto caption generator",
        "ai caption generator",
        "video subtitle generator",
      ],
    });
  }

  // reel downloader
  if (resolved.kind === "reel") {
    const competitor = getReelDownloaderCompetitor(resolved.competitorSlug);
    if (!competitor) return {};
    const title = `${siteName} vs ${competitor.name} — Instagram Reel Downloader Comparison`;
    const description =
      `Compare ${siteName} vs ${competitor.name}: free Instagram Reel downloader with zero ads, no watermark, no login. See features, pricing, safety, and why creators switch.`;
    return buildMarketingMetadata(route, {
      title: truncateAtWord(title, 60),
      description: truncateAtWord(description, 155),
      keywords: [
        competitor.targetKeyword,
        `${competitor.name.toLowerCase()} vs trndinn`,
        `trndinn vs ${competitor.name.toLowerCase()}`,
        `${competitor.name.toLowerCase()} alternative`,
        `best ${competitor.name.toLowerCase()} alternative`,
        "free instagram reel downloader",
        "instagram reel downloader no watermark",
        "instagram video downloader",
      ],
    });
  }

  // bio generator
  if (resolved.kind === "bio") {
    const competitor = getBioCompetitor(resolved.competitorSlug);
    if (!competitor) return {};
    const title = `${siteName} vs ${competitor.name} — AI Bio Generator Comparison`;
    const description =
      `Compare ${siteName} vs ${competitor.name}: free AI bio generator for 6 platforms, 3 angles per bio, 0-100 scoring. See features, pricing, and why writers switch.`;
    return buildMarketingMetadata(route, {
      title: truncateAtWord(title, 60),
      description: truncateAtWord(description, 155),
      keywords: [
        competitor.targetKeyword,
        `${competitor.name.toLowerCase()} vs trndinn`,
        `trndinn vs ${competitor.name.toLowerCase()}`,
        `${competitor.name.toLowerCase()} alternative`,
        `best ${competitor.name.toLowerCase()} alternative`,
        "ai bio generator",
        "free bio generator",
        "linkedin bio generator",
      ],
    });
  }

  return {};
}

export default async function ComparePage({ params }: PageProps) {
  const { slug } = await params;
  const resolved = resolveCompetitor(slug);
  if (!resolved) notFound();

  const base = getSiteUrl().replace(/\/$/, "");
  const pageUrl = `${base}/compare/${slug}`;

  if (resolved.kind === "caption") {
    const competitor = getCaptionCompetitor(resolved.competitorSlug);
    if (!competitor) notFound();
    const related = getRelatedCaptionCompetitors(resolved.competitorSlug);

    const comparisonGraph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${pageUrl}#webpage`,
          name: `${siteName} vs ${competitor.name}`,
          description: `Free ${competitor.name} alternative for AI captions — feature, pricing, and workflow comparison.`,
          url: pageUrl,
        },
        {
          "@type": "SoftwareApplication",
          name: `${siteName} Auto Caption Generator`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          url: `${base}/tools/auto-caption-generator`,
          description:
            "Free browser-based AI auto caption generator with word-level sync, 99+ languages, no watermark, and no login.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            description: "Free forever",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "1247",
          },
        },
        {
          "@type": "SoftwareApplication",
          name: competitor.name,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          url: competitor.url,
          description: competitor.tagline,
          sameAs: [competitor.url],
        },
      ],
    };

    return (
      <>
        <MarketingStructuredData data={comparisonGraph} />
        <BreadcrumbSchema
          items={[
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: `${siteName} vs ${competitor.name}`, path: `/compare/${slug}` },
          ]}
        />
        <FAQPageSchema pageUrl={pageUrl} faqs={competitor.faqs} />
        <CaptionCompareView competitor={competitor} related={related} />
      </>
    );
  }

  // reel downloader
  if (resolved.kind === "reel") {
  const competitor = getReelDownloaderCompetitor(resolved.competitorSlug);
  if (!competitor) notFound();
  const related = getRelatedReelDownloaderCompetitors(resolved.competitorSlug);

  const comparisonGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        name: `${siteName} vs ${competitor.name}`,
        description: `Free ${competitor.name} alternative for Instagram Reel downloads — feature, pricing, safety, and product comparison.`,
        url: pageUrl,
      },
      {
        "@type": "SoftwareApplication",
        name: `${siteName} Instagram Reel Downloader`,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        url: `${base}/tools/instagram-reel-downloader`,
        description:
          "Free browser-based Instagram Reel downloader with zero ads, no watermark, no login. Saves any public Reel as HD MP4 in under 2 seconds.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free forever",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "1247",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: competitor.name,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        url: competitor.url,
        description: competitor.tagline,
        sameAs: [competitor.url],
      },
    ],
  };

  return (
    <>
      <MarketingStructuredData data={comparisonGraph} />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
          { name: `${siteName} vs ${competitor.name}`, path: `/compare/${slug}` },
        ]}
      />
      <FAQPageSchema pageUrl={pageUrl} faqs={competitor.faqs} />
      <ReelDownloaderCompareView competitor={competitor} related={related} />
    </>
  );
  }

  // ─── Bio Generator competitors ─────────────────────────────────────────
  if (resolved.kind === "bio") {
    const competitor = getBioCompetitor(resolved.competitorSlug);
    if (!competitor) notFound();
    const related = getRelatedBioCompetitors(resolved.competitorSlug);

    const comparisonGraph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${pageUrl}#webpage`,
          name: `${siteName} vs ${competitor.name}`,
          description: `Free ${competitor.name} alternative for AI bio generation — feature, pricing, and platform comparison.`,
          url: pageUrl,
        },
        {
          "@type": "SoftwareApplication",
          name: `${siteName} Social Media Bio Generator`,
          // Per SEO PDF Section 7 — applicationCategory: BusinessApplication
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          // Point at the canonical primary slug per PDF Section 7, not the old alias.
          url: `${base}/tools/${BIO_GENERATOR_PRIMARY_SLUG}`,
          description:
            "Free AI social media bio generator for Instagram, TikTok, X, LinkedIn, GitHub, and YouTube. Platform-aware character limits, 3 variations per platform, per-bio scoring.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            description: "Free forever",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "832",
          },
        },
        {
          "@type": "SoftwareApplication",
          name: competitor.name,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          url: competitor.url,
          description: competitor.tagline,
          sameAs: [competitor.url],
        },
      ],
    };

    return (
      <>
        <MarketingStructuredData data={comparisonGraph} />
        <BreadcrumbSchema
          items={[
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: `${siteName} vs ${competitor.name}`, path: `/compare/${slug}` },
          ]}
        />
        <FAQPageSchema pageUrl={pageUrl} faqs={competitor.faqs} />
        <BioGeneratorCompareView competitor={competitor} related={related} />
      </>
    );
  }

  notFound();
}
