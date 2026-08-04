import type { Metadata } from "next";

import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import CaptionCompareIndexView from "@/views/tools/CaptionCompareIndexView";
import { CAPTION_COMPETITORS } from "@/lib/caption-competitors";
import { CORE_COMPETITORS } from "@/lib/core-competitors";
import { REEL_DOWNLOADER_COMPETITORS } from "@/lib/reel-downloader-competitors";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";

const ROUTE = "/compare";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata(ROUTE, {
    title: `Compare ${siteName} vs Buffer, Hootsuite, SnapInsta & more`,
    description: `Head-to-head comparisons: ${siteName} platform vs Buffer, Hootsuite, Postiz — plus free tools vs Submagic, VEED, SnapInsta, SSSInstagram, SaveFrom, and more.`,
    keywords: [
      "trndinn comparisons",
      "buffer alternative",
      "hootsuite alternative",
      "postiz alternative",
      "taplio alternative",
      "predis alternative",
      "submagic alternative",
      "captions ai alternative",
      "opus clip alternative",
      "veed alternative",
      "capcut alternative",
      "snapinsta alternative",
      "sssinstagram alternative",
      "savefrom alternative",
      "saveinsta alternative",
      "igram alternative",
      "ai social media tool comparison",
      "ai caption tool comparison",
      "instagram reel downloader comparison",
    ],
  });
}

function structuredData() {
  const base = getSiteUrl().replace(/\/$/, "");
  const coreParts = CORE_COMPETITORS.map((c) => ({
    "@type": "WebPage",
    name: `${siteName} vs ${c.name}`,
    url: `${base}/vs/${c.slug}`,
    description: c.wedgeSummary,
  }));
  const captionParts = CAPTION_COMPETITORS.map((c) => ({
    "@type": "WebPage",
    name: `${siteName} vs ${c.name}`,
    url: `${base}/compare/trndinn-vs-${c.slug}`,
    description: c.wedgeSummary,
  }));
  const reelParts = REEL_DOWNLOADER_COMPETITORS.map((c) => ({
    "@type": "WebPage",
    name: `${siteName} vs ${c.name}`,
    url: `${base}/compare/trndinn-vs-${c.slug}`,
    description: c.wedgeSummary,
  }));
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${siteName} Comparisons`,
    description: `All ${siteName} vs competitor comparison pages — platform (Buffer, Hootsuite, Postiz, Predis, Taplio), Auto Caption Generator (Submagic, Captions.ai, Opus Clip, VEED, CapCut), and Instagram Reel Downloader (SnapInsta, SSSInstagram, SaveFrom, and more).`,
    url: `${base}${ROUTE}`,
    hasPart: [...coreParts, ...captionParts, ...reelParts],
  };
}

export default function Page() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Compare", path: ROUTE },
        ]}
      />
      <MarketingStructuredData data={structuredData()} />
      <CaptionCompareIndexView
        captionCompetitors={CAPTION_COMPETITORS}
        coreCompetitors={CORE_COMPETITORS}
        reelDownloaderCompetitors={REEL_DOWNLOADER_COMPETITORS}
      />
    </>
  );
}
