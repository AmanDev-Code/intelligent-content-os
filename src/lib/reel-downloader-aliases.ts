/**
 * SEO alias slugs for the Instagram Reel Downloader tool.
 *
 * Each alias is a distinct URL Google indexes independently. They all render
 * the same underlying tool but each has its own H1, intro paragraph, metadata,
 * and self-referencing canonical — so Google can rank whichever page best
 * matches a given search intent (e.g. "instagram video downloader" vs
 * "save instagram reels" vs "ig reels downloader").
 *
 * The PRIMARY_SLUG is the "main" page used for internal linking and JSON-LD
 * references, but aliases are full peers in terms of indexing.
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
    seoTitle: "Instagram Video Downloader — Free HD MP4, No Watermark | Trndinn",
    seoDescription:
      "Download any Instagram video, Reel, or IGTV clip as HD MP4 for free. No watermark, no login, no signup. Works on all devices. Paste URL and save instantly.",
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
    seoTitle: "Save Instagram Reels Free — HD MP4, No Login | Trndinn",
    seoDescription:
      "Save Instagram Reels to your phone or PC as HD MP4 for free. No login, no watermark, no app install. Works on iPhone, Android, Mac, Windows. Save in seconds.",
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
    seoTitle: "Download Instagram Reel as MP4 Free — HD Quality, No Watermark | Trndinn",
    seoDescription:
      "Download any Instagram Reel as MP4 in HD for free. Original quality, no watermark, no compression, no login. Paste the URL and download instantly.",
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
    seoTitle: "Instagram Reel Saver Online — Free HD Download, No Login | Trndinn",
    seoDescription:
      "Save any public Instagram Reel as HD MP4 to your device. Free online Reel saver — no login, no watermark, no signup. Works on iPhone, Android, Mac, Windows.",
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

  // ─── New aliases: quality, abbreviation, conversion, feature, and mobile intent ───

  {
    slug: "download-instagram-reels-hd",
    seoTitle: "Download Instagram Reels HD — Full Quality MP4, No Watermark | Trndinn",
    seoDescription:
      "Download Instagram Reels in HD quality (720p/1080p) as MP4. Original resolution, no compression, no watermark, no login. Free and instant on any device.",
    keywords: [
      "download instagram reels hd",
      "instagram reels hd download",
      "hd reel downloader",
      "instagram reel download hd quality",
      "download reels full quality",
      "instagram reel 1080p download",
      "hd instagram video downloader",
    ],
    h1Prefix: "Download Reels in",
    h1Highlight: "full HD quality",
    h1Suffix: "— no compression.",
    eyebrow: "HD Instagram Reel Downloader — original 1080p quality",
    heroSubline:
      "Get the original HD file — not a compressed screen recording. Paste a Reel URL, download the full-quality MP4 instantly.",
  },
  {
    slug: "ig-reels-downloader",
    seoTitle: "IG Reels Downloader — Free, Fast, No Watermark | Trndinn",
    seoDescription:
      "Download IG Reels as HD MP4 for free. Fast, no watermark, no login, no app. Works on iPhone and Android. Paste the IG link and save instantly.",
    keywords: [
      "ig reels downloader",
      "ig reel download",
      "ig video downloader",
      "ig reels saver",
      "download ig reels",
      "ig downloader",
      "ig reel downloader online",
    ],
    h1Prefix: "Download",
    h1Highlight: "IG Reels",
    h1Suffix: "in seconds.",
    eyebrow: "Free IG Reel Downloader — paste link, get MP4",
    heroSubline:
      "The fastest way to download IG Reels. Paste the link, tap download. HD MP4, no watermark, no login.",
  },
  {
    slug: "instagram-reels-to-mp4",
    seoTitle: "Instagram Reels to MP4 — Free Converter, HD Quality | Trndinn",
    seoDescription:
      "Convert Instagram Reels to MP4 for free. Original HD quality, no watermark, no login. Works on any device — paste the Reel URL and get the MP4 file instantly.",
    keywords: [
      "instagram reels to mp4",
      "convert reel to mp4",
      "reel to mp4 converter",
      "instagram to mp4",
      "instagram reel converter",
      "convert instagram video to mp4",
      "reel to mp4 free",
    ],
    h1Prefix: "Convert",
    h1Highlight: "Instagram Reels to MP4",
    h1Suffix: "instantly.",
    eyebrow: "Free Instagram Reel to MP4 Converter — HD, no watermark",
    heroSubline:
      "Paste any Reel URL. Trndinn converts it to a clean HD MP4 file — no watermark, no compression, no login.",
  },
  {
    slug: "reels-downloader-no-watermark",
    seoTitle: "Reels Downloader No Watermark — Free HD Instagram Downloads | Trndinn",
    seoDescription:
      "Download Instagram Reels without watermark for free. Get clean HD MP4 files with no branding overlay, no login required. Works on all devices instantly.",
    keywords: [
      "reels downloader no watermark",
      "download reels without watermark",
      "instagram reel downloader no watermark",
      "no watermark reel download",
      "save reels without watermark",
      "watermark free reel downloader",
      "clean reel download",
    ],
    h1Prefix: "Download Reels",
    h1Highlight: "without watermark",
    h1Suffix: "— clean HD MP4.",
    eyebrow: "Zero Watermark Reel Downloader — original quality, free",
    heroSubline:
      "Tired of watermarked downloads? Trndinn fetches the original source file — clean HD MP4, no branding overlay, no login.",
  },
  {
    slug: "save-reels-to-gallery",
    seoTitle: "Save Reels to Gallery — Download Instagram Reels to Phone Free | Trndinn",
    seoDescription:
      "Save Instagram Reels directly to your phone gallery or camera roll. Free, no watermark, no app install. Works on iPhone (Photos) and Android (Gallery). Paste and save.",
    keywords: [
      "save reels to gallery",
      "save instagram reels to phone",
      "save reels to camera roll",
      "download reels to phone",
      "save instagram reel to gallery",
      "download reels to camera roll",
      "save reels iphone",
    ],
    h1Prefix: "Save Reels to your",
    h1Highlight: "phone gallery",
    h1Suffix: "instantly.",
    eyebrow: "Save Reels to Camera Roll — iPhone & Android, no app needed",
    heroSubline:
      "Paste the Reel link, tap download. The HD MP4 saves straight to your Photos (iPhone) or Gallery (Android). No app install, no login.",
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
