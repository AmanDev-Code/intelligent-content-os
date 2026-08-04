import type { Metadata } from "next";

import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import CaptionAlternativeIndexView from "@/views/tools/CaptionAlternativeIndexView";
import { CAPTION_COMPETITORS } from "@/lib/caption-competitors";
import { REEL_DOWNLOADER_COMPETITORS } from "@/lib/reel-downloader-competitors";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";

const ROUTE = "/alternatives";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata(ROUTE, {
    title: `Best AI caption & reel downloader alternatives 2026 — ${siteName}`,
    description: `Ranked lists of the best alternatives to Submagic, Captions.ai, SnapInsta, SSSInstagram, SaveFrom & more. ${siteName} is #1: free forever, no watermark, no login.`,
    keywords: [
      "ai caption alternative",
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
      "best free caption tool",
      "best free instagram reel downloader",
      "auto caption generator alternative",
      "instagram reel downloader alternative",
    ],
  });
}

function structuredData() {
  const base = getSiteUrl().replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `AI tool alternatives`,
    description: `Best alternative pages for every AI caption tool and Instagram Reel downloader. ${siteName} ranks #1.`,
    url: `${base}${ROUTE}`,
    hasPart: [
      ...CAPTION_COMPETITORS.map((c) => ({
        "@type": "WebPage",
        name: `Best ${c.name} alternative`,
        url: `${base}/alternatives/${c.slug}`,
        description: c.wedgeSummary,
      })),
      ...REEL_DOWNLOADER_COMPETITORS.map((c) => ({
        "@type": "WebPage",
        name: `Best ${c.name} alternative`,
        url: `${base}/alternatives/${c.slug}`,
        description: c.wedgeSummary,
      })),
    ],
  };
}

export default function Page() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Alternatives", path: ROUTE },
        ]}
      />
      <MarketingStructuredData data={structuredData()} />
      <CaptionAlternativeIndexView
        competitors={CAPTION_COMPETITORS}
        reelDownloaderCompetitors={REEL_DOWNLOADER_COMPETITORS}
      />
    </>
  );
}
