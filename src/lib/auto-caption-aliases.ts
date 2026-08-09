/**
 * SEO alias slugs for the Auto Caption Generator tool.
 *
 * Same pattern as reel-downloader-aliases.ts:
 * - Each alias is a distinct URL with unique H1/meta for different search intents
 * - Each self-canonicalizes (no cross-canonical to primary) so Google indexes independently
 * - Covers both "caption" and "subtitle" keyword clusters since users treat them as synonyms
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

  // ─── New aliases: subtitle intent, platform-specific, format, and "free" modifier ───

  {
    slug: 'ai-subtitle-generator',
    seoTitle: 'AI Subtitle Generator Free — 99+ Languages, Auto-Sync | Trndinn',
    seoDescription:
      'Generate subtitles with AI for free. 99+ languages, word-level timing, 95%+ accuracy. Export as burned-in MP4 or SRT/VTT file. No login, no watermark.',
    keywords: [
      'ai subtitle generator',
      'ai subtitle generator free',
      'automatic subtitle generator',
      'ai subtitles',
      'generate subtitles with ai',
      'subtitle generator ai',
      'auto subtitle generator online',
    ],
    h1Prefix: 'Generate',
    h1Highlight: 'AI subtitles',
    h1Suffix: 'in 99+ languages.',
    eyebrow: 'Free AI Subtitle Generator — 95%+ accuracy, no signup',
    heroSubline:
      'Upload your video. AI transcribes speech with word-level precision and generates perfectly-timed subtitles. Free, no login.',
  },
  {
    slug: 'caption-generator-for-tiktok',
    seoTitle: 'Caption Generator for TikTok — Free AI Captions, Trending Styles | Trndinn',
    seoDescription:
      'Add captions to TikTok videos for free. AI generates word-by-word captions in trending styles (Hormozi, MrBeast, Karaoke). No login, no watermark. Upload and go.',
    keywords: [
      'caption generator for tiktok',
      'tiktok captions',
      'tiktok caption generator',
      'add captions to tiktok',
      'tiktok subtitle generator',
      'auto captions tiktok',
      'tiktok video captions free',
    ],
    h1Prefix: 'Add trending',
    h1Highlight: 'captions to TikTok',
    h1Suffix: 'videos.',
    eyebrow: 'Free TikTok Caption Generator — viral styles, no login',
    heroSubline:
      'Upload your TikTok. Pick a trending caption style. Download with perfectly-synced captions burned in. No login needed.',
  },
  {
    slug: 'youtube-shorts-subtitle-generator',
    seoTitle: 'YouTube Shorts Subtitle Generator — Free AI Captions | Trndinn',
    seoDescription:
      'Add subtitles to YouTube Shorts for free. AI-synced word-by-word captions in 6 styles. Boost retention and reach viewers watching on mute. No login, no watermark.',
    keywords: [
      'youtube shorts subtitle generator',
      'youtube shorts captions',
      'add captions to shorts',
      'add subtitles to youtube shorts',
      'shorts caption generator',
      'youtube shorts subtitle maker',
      'auto captions youtube shorts',
    ],
    h1Prefix: 'Add',
    h1Highlight: 'subtitles to YouTube Shorts',
    h1Suffix: 'for free.',
    eyebrow: 'Free YouTube Shorts Caption Generator — boost retention',
    heroSubline:
      'Upload your Short. AI adds word-by-word subtitles that keep muted viewers watching. 6 styles, free, no signup.',
  },
  {
    slug: 'free-video-transcription-tool',
    seoTitle: 'Free Video Transcription Tool — AI Speech-to-Text Online | Trndinn',
    seoDescription:
      'Transcribe any video to text for free with AI. 99+ languages, word-level timestamps, 95%+ accuracy. Get captions burned in or export SRT/VTT. No login needed.',
    keywords: [
      'free video transcription tool',
      'video transcription online',
      'transcribe video to text',
      'video to text free',
      'speech to text video',
      'video transcription software free',
      'transcription tool online',
    ],
    h1Prefix: 'Transcribe',
    h1Highlight: 'any video to text',
    h1Suffix: 'with AI.',
    eyebrow: 'Free Video Transcription — 99+ languages, word-level timestamps',
    heroSubline:
      'Upload video. AI transcribes speech to text with word-level timing. Export as subtitles or get captions burned into the video.',
  },
  {
    slug: 'burn-subtitles-into-video',
    seoTitle: 'Burn Subtitles Into Video Free — Hardcode Captions Permanently | Trndinn',
    seoDescription:
      'Burn subtitles permanently into any video for free. AI generates and hardcodes captions directly into MP4 — no separate subtitle file needed. No login, no watermark.',
    keywords: [
      'burn subtitles into video',
      'hardcode subtitles',
      'burn in subtitles free',
      'embed subtitles in video',
      'hardburn captions',
      'open captions generator',
      'permanent subtitles video',
    ],
    h1Prefix: 'Burn',
    h1Highlight: 'subtitles into video',
    h1Suffix: 'permanently.',
    eyebrow: 'Free Subtitle Burner — hardcode captions into MP4',
    heroSubline:
      'Upload your video. AI transcribes and burns styled subtitles directly into the MP4. Permanent, no separate file needed.',
  },
  {
    slug: 'srt-generator-from-video',
    seoTitle: 'SRT Generator From Video — Free AI Subtitle File Maker | Trndinn',
    seoDescription:
      'Generate SRT subtitle files from any video for free. AI transcribes with word-level timing and exports as SRT or VTT. 99+ languages. No login, no signup.',
    keywords: [
      'srt generator from video',
      'srt generator',
      'generate srt file',
      'srt maker',
      'video to srt',
      'subtitle file generator',
      'srt file creator free',
      'vtt generator',
    ],
    h1Prefix: 'Generate',
    h1Highlight: 'SRT files from video',
    h1Suffix: 'with AI.',
    eyebrow: 'Free SRT/VTT Generator — AI-powered, no signup',
    heroSubline:
      'Upload video. AI transcribes and generates a perfectly-timed SRT or VTT subtitle file. Download instantly, free.',
  },
  {
    slug: 'ai-caption-generator-free',
    seoTitle: 'AI Caption Generator Free — Auto Captions for Any Video | Trndinn',
    seoDescription:
      'Free AI caption generator: upload any video and get word-by-word captions in 6 trending styles. No login, no watermark, no time limit on free tier. Try now.',
    keywords: [
      'ai caption generator free',
      'free caption generator',
      'free ai captions',
      'caption generator free online',
      'auto caption free',
      'ai video captions free',
      'free automatic captions',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'AI caption generator',
    h1Suffix: 'for any video.',
    eyebrow: '100% Free AI Captions — no login, no watermark, no catch',
    heroSubline:
      'Upload your video. AI adds styled captions word-by-word. Download the MP4. Completely free — no signup, no limits on caption generation.',
  },
  {
    slug: 'video-to-text-captions',
    seoTitle: 'Video to Text Captions — Free Speech-to-Text for Video | Trndinn',
    seoDescription:
      'Convert video to text captions for free. AI extracts speech, generates word-level captions, and burns them into MP4 or exports as SRT. 99+ languages, no login.',
    keywords: [
      'video to text captions',
      'video to text',
      'speech to text video',
      'convert video to captions',
      'video speech to text free',
      'extract text from video',
      'video to captions online',
    ],
    h1Prefix: 'Convert',
    h1Highlight: 'video to text captions',
    h1Suffix: 'instantly.',
    eyebrow: 'Free Video-to-Text — speech to captions in seconds',
    heroSubline:
      'Upload any video. AI converts speech to word-level text captions. Get them burned in or download the subtitle file. Free, no login.',
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
