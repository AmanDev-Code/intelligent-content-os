import type { Metadata } from "next";

import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import CaptionAlternativeIndexView from "@/views/tools/CaptionAlternativeIndexView";
import { BIO_COMPETITORS } from "@/lib/bio-generator-competitors";
import { CAPTION_COMPETITORS } from "@/lib/caption-competitors";
import { REEL_DOWNLOADER_COMPETITORS } from "@/lib/reel-downloader-competitors";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";

const ROUTE = "/alternatives";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata(ROUTE, {
    title: `Best AI bio, caption & reel downloader alternatives 2026`,
    description: `Ranked lists of the best alternatives to Ahrefs, Pallyy, Copy.ai, Submagic, SnapInsta & more. ${siteName} is #1: free forever, no watermark, no signup.`,
    keywords: [
      // Bio competitors (per SEO PDF Section 5)
      "ahrefs bio generator alternative",
      "pallyy alternative",
      "copy.ai alternative",
      "quillbot alternative",
      "writesonic alternative",
      "predis ai alternative",
      "simplified alternative",
      "canva magic write alternative",
      "ai bio generator alternative",
      // Caption competitors
      "ai caption alternative",
      "submagic alternative",
      "captions ai alternative",
      "opus clip alternative",
      "veed alternative",
      "capcut alternative",
      // Reel downloader competitors
      "snapinsta alternative",
      "sssinstagram alternative",
      "savefrom alternative",
      "saveinsta alternative",
      "igram alternative",
      // Category
      "best free bio generator",
      "best free caption tool",
      "best free instagram reel downloader",
      "auto caption generator alternative",
      "instagram reel downloader alternative",
      "social media bio generator alternative",
    ],
  });
}

function structuredData() {
  const base = getSiteUrl().replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `AI tool alternatives`,
    description: `Best alternative pages for every AI bio generator, caption tool, and Instagram Reel downloader. ${siteName} ranks #1.`,
    url: `${base}${ROUTE}`,
    hasPart: [
      ...BIO_COMPETITORS.map((c) => ({
        "@type": "WebPage",
        name: `Best ${c.name} alternative`,
        url: `${base}/alternatives/${c.slug}`,
        description: c.wedgeSummary,
      })),
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
        bioCompetitors={BIO_COMPETITORS}
      />
    </>
  );
}
