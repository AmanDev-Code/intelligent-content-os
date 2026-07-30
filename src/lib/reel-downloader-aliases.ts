/**
 * SEO alias slugs for the Instagram Reel Downloader tool.
 *
 * Each alias is a distinct URL Google indexes independently, but they all
 * render the same underlying tool. Each has its own H1, intro paragraph, and
 * metadata so it can rank for a different search intent (e.g. "instagram video
 * downloader" vs "save instagram reels").
 *
 * All aliases declare rel="canonical" pointing to the primary URL. This is
 * NOT cloaking — content differs, but the canonical is honest. Google treats
 * aliases as related variants and ranks whichever text matches the query best.
 *
 * The PRIMARY_SLUG is the one canonical URL every alias points to.
 */

export const REEL_DOWNLOADER_PRIMARY_SLUG = "instagram-reel-downloader";

export interface ReelDownloaderAlias {
  /** URL slug — the full path is /tools/<slug> */
  slug: string;
  /** SEO title — 50-60 chars, targets one specific search query */
  seoTitle: string;
  /** SEO meta description — 140-160 chars */
  seoDescription: string;
  /** Keyword array for meta keywords + internal reporting */
  keywords: string[];
  /** H1 shown to visitors — differs from title for higher CTR */
  h1Prefix: string;
  /** H1 highlighted word (rendered with the brand gradient) */
  h1Highlight: string;
  /** H1 suffix — the trailing "in HD." or similar */
  h1Suffix: string;
  /** Small primary-tinted eyebrow that sits above the hero */
  eyebrow: string;
  /** Hero paragraph shown under the H1 */
  heroSubline: string;
}

const ALIASES: ReelDownloaderAlias[] = [
  {
    slug: "instagram-video-downloader",
    seoTitle: "Trndinn Instagram Video Downloader — HD MP4, No Watermark",
    seoDescription:
      "Free Trndinn Instagram video downloader: save any public Instagram video, Reel, or IGTV clip as HD MP4. No watermark, no login, no signup. Try it now.",
    keywords: [
      "instagram video downloader",
      "download instagram video",
      "instagram video download",
      "save instagram video",
      "instagram video saver",
      "download IG video",
      "instagram video mp4",
    ],
    h1Prefix: "Download any",
    h1Highlight: "Instagram video",
    h1Suffix: "in HD.",
    eyebrow: "Free Instagram Video Downloader — no login, no watermark",
    heroSubline:
      "Paste any Instagram video URL. Get the MP4. No signup, no watermark, no shady popups.",
  },
  {
    slug: "save-instagram-reels",
    seoTitle: "Save Instagram Reels Free — Trndinn Reel Saver Online",
    seoDescription:
      "Save Instagram Reels to your phone or PC as HD MP4 with Trndinn's free Reel saver. Works on iPhone, Android, Mac, Windows. No login, no watermark. Save in seconds.",
    keywords: [
      "save instagram reels",
      "save instagram reel",
      "instagram reel saver",
      "save reels to phone",
      "save reels to gallery",
      "save reels iphone",
      "save reels android",
    ],
    h1Prefix: "Save any",
    h1Highlight: "Instagram Reel",
    h1Suffix: "to your device.",
    eyebrow: "Free Instagram Reel Saver — save Reels in seconds",
    heroSubline:
      "Save any public Reel to your phone, tablet, or computer as HD MP4. No signup, no watermark.",
  },
  {
    slug: "download-instagram-reel-mp4",
    seoTitle: "Download Instagram Reel MP4 Free — Trndinn HD Downloader",
    seoDescription:
      "Download any Instagram Reel as MP4 in HD with Trndinn's free MP4 downloader. Original quality, no watermark, no compression, no login. Paste URL & download.",
    keywords: [
      "download instagram reel mp4",
      "instagram reel mp4 download",
      "reel to mp4",
      "instagram to mp4",
      "download reel as mp4",
      "instagram reel hd mp4",
      "mp4 reel downloader",
    ],
    h1Prefix: "Get any",
    h1Highlight: "Instagram Reel",
    h1Suffix: "as HD MP4.",
    eyebrow: "Free Instagram Reel MP4 Downloader — HD, no watermark",
    heroSubline:
      "Paste a Reel URL. Get the original MP4 in HD. No compression, no watermark, no login.",
  },
  {
    slug: "instagram-reel-saver",
    seoTitle: "Instagram Reel Saver — Free Trndinn Reel Downloader Online",
    seoDescription:
      "Instagram Reel Saver by Trndinn: paste any public Reel link and save as HD MP4 to your device. Free, no login, no watermark, no signup. Works on any device.",
    keywords: [
      "instagram reel saver",
      "reel saver",
      "reels saver",
      "save reels online",
      "instagram saver",
      "IG reel saver",
      "reel saver online",
    ],
    h1Prefix: "The fastest way to",
    h1Highlight: "save Instagram Reels",
    h1Suffix: "online.",
    eyebrow: "Free Instagram Reel Saver — no login, no watermark",
    heroSubline:
      "Paste any public Reel URL and Trndinn saves it to your device as HD MP4. Free, no signup, no shady popups.",
  },
];

const ALIAS_MAP = new Map(ALIASES.map((a) => [a.slug, a]));

/** All alias slugs (excludes the primary slug itself). */
export const REEL_DOWNLOADER_ALIAS_SLUGS: string[] = ALIASES.map((a) => a.slug);

/** All slugs that render the reel downloader (primary + aliases). */
export const REEL_DOWNLOADER_ALL_SLUGS: string[] = [
  REEL_DOWNLOADER_PRIMARY_SLUG,
  ...REEL_DOWNLOADER_ALIAS_SLUGS,
];

/** Fetch an alias definition by slug (returns undefined if not an alias). */
export function getReelDownloaderAlias(slug: string): ReelDownloaderAlias | undefined {
  return ALIAS_MAP.get(slug);
}

/** True if the given slug renders the reel downloader (primary or any alias). */
export function isReelDownloaderSlug(slug: string): boolean {
  return slug === REEL_DOWNLOADER_PRIMARY_SLUG || ALIAS_MAP.has(slug);
}
