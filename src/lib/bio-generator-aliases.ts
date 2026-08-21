/**
 * SEO alias slugs for the Bio Generator tool.
 *
 * Same pattern as auto-caption-aliases.ts + reel-downloader-aliases.ts:
 * - Each alias is its own URL with unique H1/meta targeting a distinct search intent.
 * - Each self-canonicalizes (no cross-canonical to primary) so Google indexes them
 *   as independent pages for their target keyword clusters — the fix for the
 *   indexing issue we hit on earlier tools.
 * - Covers LinkedIn, Instagram, X/Twitter, TikTok, YouTube, and generic "bio"
 *   keyword clusters. Total addressable monthly search volume ≈ 49,000+.
 *
 * Volume estimates (Ahrefs/Semrush-class, US) from the PRD in Notion:
 *   bio generator                   9,900
 *   linkedin bio generator          5,400
 *   instagram bio generator free    6,600
 *   ai bio generator                4,400
 *   professional bio writer         2,900
 *   linkedin summary generator      3,200
 *   bio generator for instagram     4,100
 *   tiktok bio generator            2,400
 *   twitter bio generator           2,100
 *   bio maker online                1,800
 *   linkedin about section generator 1,900
 *   social media bio generator      2,200
 *   short bio generator             1,600
 */

export const BIO_GENERATOR_PRIMARY_SLUG = 'bio-generator';

/** Optional per-alias platform preselection so /tools/linkedin-bio-generator
 *  boots with LinkedIn pre-checked. Kept as a suggestion — the view still
 *  lets users flip other platforms on. */
export type BioAliasPlatformHint =
  | 'linkedin'
  | 'instagram'
  | 'twitter'
  | 'tiktok'
  | 'youtube'
  | 'github'
  | 'general';

export interface BioGeneratorAlias {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  h1Prefix: string;
  h1Highlight: string;
  h1Suffix: string;
  eyebrow: string;
  heroSubline: string;
  /** Preselected platform when landing on this alias. Falls back to "general". */
  platformHint: BioAliasPlatformHint;
}

const ALIASES: BioGeneratorAlias[] = [
  {
    slug: 'linkedin-bio-generator',
    seoTitle: 'LinkedIn Bio Generator — Free AI Headlines & About',
    seoDescription:
      'Free LinkedIn bio generator. AI writes recruiter-optimized About sections and headlines with your role, skills, and outcomes. No login. 3 variations per run.',
    keywords: [
      'linkedin bio generator',
      'linkedin bio generator free',
      'linkedin bio writer',
      'linkedin bio maker',
      'ai linkedin bio generator',
      'linkedin bio ai',
      'free linkedin bio generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'LinkedIn bio generator',
    h1Suffix: 'that gets recruiter clicks.',
    eyebrow: 'AI-powered • Free forever • No login • Recruiter-optimized',
    heroSubline:
      'Enter your role and one outcome. AI writes 3 LinkedIn About drafts front-loaded for the 210-char desktop cut, with recruiter keywords woven in.',
    platformHint: 'linkedin',
  },
  {
    slug: 'instagram-bio-generator-free',
    seoTitle: 'Instagram Bio Generator Free — AI 150-Char Bios',
    seoDescription:
      'Free Instagram bio generator. AI writes 3 bio variations tuned to the 150-char limit with emoji bullets and a call-to-action. No login required. Try instantly.',
    keywords: [
      'instagram bio generator free',
      'free instagram bio generator',
      'instagram bio maker',
      'instagram bio writer',
      'insta bio generator',
      'ig bio generator',
      'ai instagram bio generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'Instagram bio generator',
    h1Suffix: 'made for 150 chars.',
    eyebrow: 'AI-powered • Free forever • No login • Emoji-ready',
    heroSubline:
      'Type your niche and drop in one line about you. AI writes 3 punchy Instagram bios that fit the 150-char limit with a clear CTA. Copy and paste.',
    platformHint: 'instagram',
  },
  {
    slug: 'ai-bio-generator',
    seoTitle: 'AI Bio Generator — Free Writer for 6 Platforms',
    seoDescription:
      'AI bio generator that writes for LinkedIn, Instagram, X, TikTok, GitHub, and YouTube in one run. 3 variations per platform. Free, no login, no watermark.',
    keywords: [
      'ai bio generator',
      'ai bio writer',
      'ai bio maker',
      'artificial intelligence bio generator',
      'ai profile bio generator',
      'ai bio creator',
      'chatgpt bio generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'AI bio generator',
    h1Suffix: 'for every platform.',
    eyebrow: 'AI-powered • Free forever • No login • 6 platforms in one run',
    heroSubline:
      'One input, six platforms. AI writes 3 bio variations each for LinkedIn, Instagram, X, TikTok, GitHub, and YouTube. Copy the ones you love.',
    platformHint: 'general',
  },
  {
    slug: 'professional-bio-generator',
    seoTitle: 'Professional Bio Generator — Free AI Writer',
    seoDescription:
      'Write professional bios in seconds. AI generator crafts speaker, author, and executive bios in first- or third-person. Multiple lengths. Free, no login.',
    keywords: [
      'professional bio generator',
      'professional bio writer',
      'speaker bio generator',
      'author bio generator',
      'executive bio generator',
      'third person bio generator',
      'about me generator',
    ],
    h1Prefix: 'Write a',
    h1Highlight: 'professional bio',
    h1Suffix: 'in 30 seconds.',
    eyebrow: 'AI-powered • Free forever • Speaker · Author · Executive-ready',
    heroSubline:
      'AI writes 3 professional bios calibrated for speaker decks, book jackets, and company pages. First- or third-person. Short, medium, or long.',
    platformHint: 'general',
  },
  {
    slug: 'linkedin-summary-generator',
    seoTitle: 'LinkedIn Summary Generator — Free AI About',
    seoDescription:
      'Free LinkedIn summary generator. AI writes About sections with a story-arc structure, recruiter keywords, and a clear CTA. 3 drafts per run, no login.',
    keywords: [
      'linkedin summary generator',
      'linkedin about generator',
      'linkedin about section generator',
      'linkedin summary writer',
      'linkedin summary ai',
      'about section linkedin generator',
      'linkedin bio summary generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'LinkedIn summary generator',
    h1Suffix: 'for the About section.',
    eyebrow: 'AI-powered • Free forever • Story-arc structured • Recruiter-tuned',
    heroSubline:
      'AI writes 3 LinkedIn About drafts with a hook → what-you-do → wins → CTA arc. Every draft front-loads the 210-char desktop cut.',
    platformHint: 'linkedin',
  },
  {
    slug: 'bio-generator-for-instagram',
    seoTitle: 'Bio Generator for Instagram — Free AI Emoji Bios',
    seoDescription:
      'Bio generator for Instagram: AI writes 3 bios tuned to the 150-char limit with emoji bullets, line breaks, and a native call-to-action. Free, instant, no login.',
    keywords: [
      'bio generator for instagram',
      'instagram profile bio generator',
      'instagram bio ideas generator',
      'insta bio ideas',
      'instagram bio maker free',
      'ig bio ideas',
      'instagram bio for boys',
      'instagram bio for girls',
    ],
    h1Prefix: 'Bio generator',
    h1Highlight: 'for Instagram',
    h1Suffix: 'with emoji layouts.',
    eyebrow: 'AI-powered • Free forever • 150-char optimized • Emoji-ready',
    heroSubline:
      'Type your niche. AI writes 3 Instagram bios with emoji bullets, tight line breaks, and a CTA to your link — all inside 150 chars.',
    platformHint: 'instagram',
  },
  {
    slug: 'tiktok-bio-generator',
    seoTitle: 'TikTok Bio Generator — Free 80-Char AI Writer',
    seoDescription:
      'Free TikTok bio generator. AI writes 3 punchy 80-char taglines optimized for the "why follow" answer. No login required. Instant results.',
    keywords: [
      'tiktok bio generator',
      'tiktok bio ideas generator',
      'tiktok bio ai',
      'tiktok bio writer',
      'tiktok bio maker',
      'tiktok bio for creators',
      'tik tok bio generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'TikTok bio generator',
    h1Suffix: 'built for 80 chars.',
    eyebrow: 'AI-powered • Free forever • One-line tagline optimized',
    heroSubline:
      'AI writes 3 TikTok taglines that answer "why follow?" in a single glance — every one built for the 80-char limit.',
    platformHint: 'tiktok',
  },
  {
    slug: 'twitter-bio-generator',
    seoTitle: 'Twitter (X) Bio Generator — Free 160-Char AI',
    seoDescription:
      'Free Twitter/X bio generator. AI writes 3 bios inside the 160-char limit with role, focus, and personality dialed in. No login. Copy and paste.',
    keywords: [
      'twitter bio generator',
      'x bio generator',
      'twitter bio ai',
      'twitter bio writer',
      'twitter bio ideas generator',
      'x profile bio generator',
      'ai twitter bio generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'Twitter (X) bio generator',
    h1Suffix: 'for the 160-char limit.',
    eyebrow: 'AI-powered • Free forever • 160-char optimized',
    heroSubline:
      'AI writes 3 X bios in the 160-char budget with the [role at company] · [focus] · [personality] structure that reads best on X.',
    platformHint: 'twitter',
  },
  {
    slug: 'bio-maker-online',
    seoTitle: 'Bio Maker Online — Free AI for Any Platform',
    seoDescription:
      'Bio maker online: free AI creates 3 bio variations for any platform with tone, length, and emoji controls. LinkedIn, Instagram, X, TikTok in one run.',
    keywords: [
      'bio maker online',
      'bio maker free',
      'online bio maker',
      'bio creator online',
      'bio maker ai',
      'best bio maker online',
      'free bio maker no login',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'bio maker online',
    h1Suffix: 'for any social platform.',
    eyebrow: 'AI-powered • Free forever • Any platform • No login',
    heroSubline:
      'Pick your platforms, dial the tone, hit generate. AI writes 3 bio variations per platform tuned to each network\'s limits and native format.',
    platformHint: 'general',
  },
  {
    slug: 'linkedin-about-section-generator',
    seoTitle: 'LinkedIn About Section Generator — Free AI',
    seoDescription:
      'AI About section generator for LinkedIn. Writes 3 story-arc drafts inside the 2,600-char cap with recruiter keywords and a clear CTA. Free, no login.',
    keywords: [
      'linkedin about section generator',
      'linkedin about generator',
      'linkedin about writer',
      'linkedin about section examples',
      'about section ai generator',
      'linkedin about section ai',
      'linkedin about me generator',
    ],
    h1Prefix: 'AI',
    h1Highlight: 'LinkedIn About section generator',
    h1Suffix: 'tuned for 2,600 chars.',
    eyebrow: 'AI-powered • Free forever • Story-arc structure',
    heroSubline:
      'AI writes 3 LinkedIn About drafts with a hook → context → proof → CTA arc, all inside the 2,600-char cap and front-loaded for desktop truncation.',
    platformHint: 'linkedin',
  },
  {
    slug: 'social-media-bio-generator',
    seoTitle: 'Social Media Bio Generator — Free AI Writer',
    seoDescription:
      'Free social media bio generator. AI writes bios for LinkedIn, Instagram, X, TikTok, GitHub, and YouTube in one run — every bio inside its platform limit.',
    keywords: [
      'social media bio generator',
      'social media bio writer',
      'social bio generator',
      'multi-platform bio generator',
      'social profile bio generator',
      'social bio ai generator',
      'bio generator for social media',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'social media bio generator',
    h1Suffix: 'for every network.',
    eyebrow: 'AI-powered • Free forever • 6 platforms • One input',
    heroSubline:
      'One prompt. Six platforms. AI writes 3 bio variations each for LinkedIn, Instagram, X, TikTok, GitHub, and YouTube in seconds.',
    platformHint: 'general',
  },
  {
    slug: 'short-bio-generator',
    seoTitle: 'Short Bio Generator — Free AI for Tight Limits',
    seoDescription:
      'Free short bio generator. AI writes 3 tight bios in 50, 100, or 160 char lengths for Twitter, TikTok, GitHub, or any short-form field. No login.',
    keywords: [
      'short bio generator',
      'short bio writer',
      'short bio maker',
      'short bio for social media',
      'short bio examples generator',
      'short professional bio generator',
      'micro bio generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'short bio generator',
    h1Suffix: 'for tight limits.',
    eyebrow: 'AI-powered • Free forever • 50-160 char lengths',
    heroSubline:
      'AI writes 3 short bios tuned to short-form profile fields on X, TikTok, GitHub, and about-me sections. Every draft respects the target length.',
    platformHint: 'twitter',
  },
];

const ALIAS_MAP = new Map(ALIASES.map((a) => [a.slug, a]));

export const BIO_GENERATOR_ALIAS_SLUGS: string[] = ALIASES.map((a) => a.slug);

export const BIO_GENERATOR_ALL_SLUGS: string[] = [
  BIO_GENERATOR_PRIMARY_SLUG,
  ...BIO_GENERATOR_ALIAS_SLUGS,
];

export function getBioGeneratorAlias(slug: string): BioGeneratorAlias | undefined {
  return ALIAS_MAP.get(slug);
}

export function isBioGeneratorSlug(slug: string): boolean {
  return slug === BIO_GENERATOR_PRIMARY_SLUG || ALIAS_MAP.has(slug);
}
