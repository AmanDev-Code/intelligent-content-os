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
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";
import CaptionCompareView from "@/views/tools/CaptionCompareView";
import ReelDownloaderCompareView from "@/views/tools/ReelDownloaderCompareView";

/**
 * /compare/[slug] — dynamic catch-all for tool comparisons.
 *
 * Handles TWO product datasets:
 *   1. Caption tool competitors (CaptionCompareView) — Submagic, Captions.ai, etc.
 *   2. Reel downloader competitors (ReelDownloaderCompareView) — SnapInsta, SSSInstagram, etc.
 *
 * Slugs are the `trndinn-vs-{competitor}` pattern. The competitor slug portion
 * is looked up in the caption dataset first, then the reel downloader dataset.
 * Slug namespaces do not overlap between the two datasets.
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
  return null;
}

export async function generateStaticParams() {
  return [
    ...CAPTION_COMPETITOR_SLUGS.map((slug) => ({ slug: `${SLUG_PREFIX}${slug}` })),
    ...REEL_DOWNLOADER_COMPETITOR_SLUGS.map((slug) => ({ slug: `${SLUG_PREFIX}${slug}` })),
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
