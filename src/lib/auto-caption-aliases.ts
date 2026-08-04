/**
 * SEO alias slugs for the Auto Caption Generator tool.
 *
 * Same pattern as reel-downloader-aliases.ts:
 * - Each alias is a distinct URL with unique H1/meta for different search intents
 * - All carry rel="canonical" pointing to the primary URL
 * - Google indexes each independently, ranking signals consolidate at primary
 */

export const AUTO_CAPTION_PRIMARY_SLUG = 'auto-caption-generator';

export interface AutoCaptionAlias {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  h1Prefix: string;
  h1Highlight: string;
  h1Suffix: string;
  eyebrow: string;
  heroSubline: string;
}

const ALIASES: AutoCaptionAlias[] = [
  {
    slug: 'add-subtitles-to-video-free',
    seoTitle: 'Add Subtitles to Video Free — AI Auto-Sync, No Login | Trndinn',
    seoDescription:
      'Add subtitles to any video for free with AI. Auto-synced word-by-word, 6 caption styles, 99+ languages. No login, no watermark, no app install. Upload and download.',
    keywords: [
      'add subtitles to video free',
      'add subtitles to video online',
      'free subtitle generator',
      'add captions to video',
      'subtitle video online',
      'auto subtitles free',
    ],
    h1Prefix: 'Add',
    h1Highlight: 'subtitles to any video',
    h1Suffix: 'for free.',
    eyebrow: 'Free Online Subtitle Generator — no login, no watermark',
    heroSubline:
      'Upload your video. AI syncs subtitles word-by-word and burns them in. Download the MP4. Done.',
  },
  {
    slug: 'subtitle-generator-online',
    seoTitle: 'Subtitle Generator Online Free — AI-Powered, 99+ Languages | Trndinn',
    seoDescription:
      'Generate subtitles online for free. AI transcribes and syncs captions word-by-word. 6 styles including Hormozi and MrBeast. 99+ languages. No login needed.',
    keywords: [
      'subtitle generator online',
      'subtitle generator free',
      'online subtitle maker',
      'generate subtitles automatically',
      'ai subtitle generator',
      'subtitle creator online',
    ],
    h1Prefix: 'Generate',
    h1Highlight: 'subtitles online',
    h1Suffix: 'with AI.',
    eyebrow: 'Free AI Subtitle Generator — 99+ languages, no signup',
    heroSubline:
      'Paste or upload a video. AI generates word-level subtitles in seconds. Six styles. Free forever.',
  },
  {
    slug: 'auto-subtitles-for-reels',
    seoTitle: 'Auto Subtitles for Reels — Free Caption Generator for Instagram | Trndinn',
    seoDescription:
      'Add auto subtitles to Instagram Reels for free. AI-synced captions in trending styles (Hormozi, MrBeast, Karaoke). No login, no app. Upload, style, download.',
    keywords: [
      'auto subtitles for reels',
      'add captions to reels',
      'instagram reel captions',
      'auto caption reels',
      'subtitle generator for reels',
      'caption reels free',
    ],
    h1Prefix: 'Auto',
    h1Highlight: 'subtitles for Reels',
    h1Suffix: 'in seconds.',
    eyebrow: 'Free Auto Captions for Instagram Reels — trending styles',
    heroSubline:
      'Upload your Reel. Pick a trending style. Download with captions burned in. No login needed.',
  },
  {
    slug: 'video-caption-maker',
    seoTitle: 'Video Caption Maker Free — Word-by-Word AI Captions | Trndinn',
    seoDescription:
      'Make captions for any video with AI. Word-by-word sync, 6 trending styles, burned directly into MP4. Free, no login, works on any device. Upload and download.',
    keywords: [
      'video caption maker',
      'caption maker for video',
      'video caption generator',
      'make captions for video',
      'caption video online',
      'video captioner free',
    ],
    h1Prefix: 'Make',
    h1Highlight: 'video captions',
    h1Suffix: 'with AI.',
    eyebrow: 'Free Video Caption Maker — word-by-word sync, no login',
    heroSubline:
      'Upload any video. AI transcribes and makes styled captions. Download the captioned MP4 instantly.',
  },
];

const ALIAS_MAP = new Map(ALIASES.map((a) => [a.slug, a]));

/** All alias slugs (excludes the primary slug itself). */
export const AUTO_CAPTION_ALIAS_SLUGS: string[] = ALIASES.map((a) => a.slug);

/** All slugs that render the auto-caption tool (primary + aliases). */
export const AUTO_CAPTION_ALL_SLUGS: string[] = [
  AUTO_CAPTION_PRIMARY_SLUG,
  ...AUTO_CAPTION_ALIAS_SLUGS,
];

/** Fetch an alias definition by slug (returns undefined if not an alias). */
export function getAutoCaptionAlias(slug: string): AutoCaptionAlias | undefined {
  return ALIAS_MAP.get(slug);
}

/** True if the given slug renders the auto-caption tool (primary or any alias). */
export function isAutoCaptionSlug(slug: string): boolean {
  return slug === AUTO_CAPTION_PRIMARY_SLUG || ALIAS_MAP.has(slug);
}
