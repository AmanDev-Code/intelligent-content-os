import type { Metadata } from "next";

import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { MarketingStructuredData } from "@/components/seo/MarketingStructuredData";
import CaptionCompareIndexView from "@/views/tools/CaptionCompareIndexView";
import { BIO_COMPETITORS } from "@/lib/bio-generator-competitors";
import { CAPTION_COMPETITORS } from "@/lib/caption-competitors";
import { CORE_COMPETITORS } from "@/lib/core-competitors";
import { REEL_DOWNLOADER_COMPETITORS } from "@/lib/reel-downloader-competitors";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { getSiteUrl, siteName } from "@/lib/site";

const ROUTE = "/compare";

export async function generateMetadata(): Promise<Metadata> {
  return buildMarketingMetadata(ROUTE, {
    title: `Compare ${siteName} vs Ahrefs, Pallyy, Copy.ai & more`,
    description: `Head-to-head comparisons: ${siteName} vs Ahrefs, Pallyy, Copy.ai, Hootsuite, Submagic, SnapInsta and every major tool across bio, caption, and reel downloading.`,
    keywords: [
      "trndinn comparisons",
      // Bio competitors (per SEO PDF Section 5)
      "ahrefs bio generator alternative",
      "pallyy alternative",
      "copy.ai alternative",
      "quillbot alternative",
      "writesonic alternative",
      "predis ai alternative",
      "simplified alternative",
      "canva magic write alternative",
      "chatgpt vs bio generator",
      // Caption competitors
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
      // Platform competitors
      "buffer alternative",
      "hootsuite alternative",
      "postiz alternative",
      "taplio alternative",
      // Category
      "ai bio generator comparison",
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
  const bioParts = BIO_COMPETITORS.map((c) => ({
    "@type": "WebPage",
    name: `${siteName} vs ${c.name}`,
    url: `${base}/compare/trndinn-vs-${c.slug}`,
    description: c.wedgeSummary,
  }));
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${siteName} Comparisons`,
    description: `All ${siteName} vs competitor comparison pages — platform (Buffer, Hootsuite, Postiz, Predis, Taplio), Bio Generator (Ahrefs, Pallyy, Copy.ai, Hootsuite, Writesonic, QuillBot, Predis, Simplified, Canva, ChatGPT), Auto Caption Generator (Submagic, Captions.ai, Opus Clip, VEED, CapCut), and Instagram Reel Downloader (SnapInsta, SSSInstagram, SaveFrom, and more).`,
    url: `${base}${ROUTE}`,
    hasPart: [...coreParts, ...bioParts, ...captionParts, ...reelParts],
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
        bioCompetitors={BIO_COMPETITORS}
      />
    </>
  );
}
