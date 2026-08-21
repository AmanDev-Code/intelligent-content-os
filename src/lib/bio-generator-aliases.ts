/**
 * SEO alias slugs for the Bio Generator tool.
 *
 * SOURCE OF TRUTH: Trndinn_AI_Bio_Caption_Generator_SEO_Analysis.pdf (3 Aug 2026)
 * Prepared by SEO expert — keyword volumes from Semrush/Ahrefs-class data.
 *
 * Architecture:
 * - PRIMARY slug is `social-media-bio-generator` (Section 7 of the PDF) — resolves
 *   through the tool page route with its own dedicated metadata, not through this array.
 * - 14 ALIAS entries below, each its own URL with unique H1/meta targeting a distinct
 *   keyword cluster. The commented "#4" slot in the numbered list belongs to the primary
 *   slug itself (`social-media-bio-generator`, 18,100/mo) and lives in the route — that's
 *   why the numbered comments go 1, 2, 3, (#4 = primary), 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15.
 * - Each alias self-canonicalizes (no cross-canonical to primary) so Google indexes
 *   them independently for their target keywords.
 * - Covers all transactional keywords from the PDF Section 3 + Section 4.
 *
 * URL count in sitemap: 1 primary + 14 aliases = 15 tool page URLs.
 * Total addressable monthly search volume across all 15: ~235,000+
 *
 * IMPORTANT: seoTitle must be ≤50 chars because the template appends " | Trndinn"
 * (10 chars) making the full title ≤60 chars for SERP display.
 */

export const BIO_GENERATOR_PRIMARY_SLUG = 'social-media-bio-generator';

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
  platformHint: BioAliasPlatformHint;
}

const ALIASES: BioGeneratorAlias[] = [
  // ─── #1 HEAD MONEY TERM — 40,500/mo ───────────────────────────────────────
  {
    slug: 'instagram-bio-generator',
    seoTitle: 'Instagram Bio Generator — Free AI, No Signup',
    seoDescription:
      'Free Instagram bio generator. AI writes 3 bios tuned to the 150-char limit with emoji bullets and a CTA line. No signup. Copy-paste in seconds.',
    keywords: [
      'instagram bio generator',
      'instagram bio generator free',
      'free instagram bio generator',
      'ig bio generator',
      'insta bio generator',
      'instagram bio maker',
      'ai instagram bio generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'Instagram bio generator',
    h1Suffix: 'with 150-char precision.',
    eyebrow: 'AI-powered • Free forever • No signup • 150-char optimized',
    heroSubline:
      'Type your niche, pick a tone, hit generate. AI writes 3 Instagram bios that fit the 150-char limit with emoji bullets and a clear CTA. Copy and paste.',
    platformHint: 'instagram',
  },

  // ─── #2 — 33,100/mo ────────────────────────────────────────────────────────
  {
    slug: 'ai-caption-generator',
    seoTitle: 'AI Caption Generator — Free for All Platforms',
    seoDescription:
      'Free AI caption generator for Instagram, LinkedIn, TikTok & X. Platform-aware character limits, tone control, and emojis. No signup required.',
    keywords: [
      'ai caption generator',
      'ai caption generator free',
      'caption generator ai',
      'ai social media caption generator',
      'free ai caption generator',
      'instagram caption generator ai',
      'ai post caption generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'AI caption generator',
    h1Suffix: 'for every platform.',
    eyebrow: 'AI-powered • Free forever • No signup • Multi-platform',
    heroSubline:
      'Generate platform-ready captions for Instagram, LinkedIn, TikTok, and X in one run. AI respects each platform\'s character limits and native style.',
    platformHint: 'general',
  },

  // ─── #3 — 27,100/mo ────────────────────────────────────────────────────────
  {
    slug: 'instagram-caption-generator',
    seoTitle: 'Instagram Caption Generator — Free AI Writer',
    seoDescription:
      'Free Instagram caption generator. AI writes engaging captions with hashtags, emojis, and CTAs tuned to IG\'s algorithm. No signup. Instant results.',
    keywords: [
      'instagram caption generator',
      'instagram caption generator free',
      'free instagram caption generator',
      'ig caption generator',
      'caption generator for instagram',
      'ai instagram caption generator',
      'insta caption maker',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'Instagram caption generator',
    h1Suffix: 'with hashtags & CTAs.',
    eyebrow: 'AI-powered • Free forever • No signup • Hashtag-ready',
    heroSubline:
      'Describe your post or photo. AI writes 3 captions with relevant hashtags, emojis, and a call-to-action designed for Instagram engagement.',
    platformHint: 'instagram',
  },

  // ─── #4 — 18,100/mo (this is also the PRIMARY but as its own alias entry
  //     for the map — the primary slug renders from the same data) ─────────────
  // NOTE: The primary page `/tools/social-media-bio-generator` uses its own
  // metadata in the page.tsx route. This alias covers the hub keyword when
  // someone types it slightly differently.

  // ─── #5 — 14,800/mo ────────────────────────────────────────────────────────
  {
    slug: 'ai-bio-generator',
    seoTitle: 'AI Bio Generator — Free for 6 Platforms',
    seoDescription:
      'AI bio generator that writes for LinkedIn, Instagram, X, TikTok, GitHub & YouTube. 3 variations per platform. Free, no signup, no watermark.',
    keywords: [
      'ai bio generator',
      'ai bio writer',
      'ai bio maker',
      'ai profile bio generator',
      'ai bio generator free',
      'chatgpt bio generator',
      'artificial intelligence bio generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'AI bio generator',
    h1Suffix: 'for every platform.',
    eyebrow: 'AI-powered • Free forever • No signup • 6 platforms in one run',
    heroSubline:
      'One input, six platforms. AI writes 3 bio variations each for LinkedIn, Instagram, X, TikTok, GitHub, and YouTube. Copy the ones that sound like you.',
    platformHint: 'general',
  },

  // ─── #6 — 12,100/mo ────────────────────────────────────────────────────────
  {
    slug: 'social-media-bio-generator-free',
    seoTitle: 'Free Social Media Bio Generator — No Signup',
    seoDescription:
      'Free social media bio generator. No signup, no credit limits. AI writes platform-aware bios for Instagram, LinkedIn, X, TikTok & more. Instant results.',
    keywords: [
      'free bio generator',
      'free social media bio generator',
      'bio generator free',
      'free bio maker',
      'social media bio generator free',
      'free ai bio generator',
      'bio generator no signup',
    ],
    h1Prefix: '100% free',
    h1Highlight: 'social media bio generator',
    h1Suffix: '— no signup, no limits.',
    eyebrow: 'Free forever • No signup • No credit limits • Unlimited generations',
    heroSubline:
      'No email, no paywall, no daily cap. AI writes 3 platform-specific bios per run with tone control, emoji options, and live character counts.',
    platformHint: 'general',
  },

  // ─── #7 — 9,900/mo ─────────────────────────────────────────────────────────
  {
    slug: 'tiktok-bio-generator',
    seoTitle: 'TikTok Bio Generator — Free 80-Char AI',
    seoDescription:
      'Free TikTok bio generator. AI writes 3 punchy 80-char taglines that answer "why follow?" in one glance. No signup. Instant copy-paste.',
    keywords: [
      'tiktok bio generator',
      'tiktok bio ideas generator',
      'tiktok bio maker',
      'tiktok bio writer',
      'tiktok bio ai',
      'tik tok bio generator',
      'tiktok bio for creators',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'TikTok bio generator',
    h1Suffix: 'built for 80 chars.',
    eyebrow: 'AI-powered • Free forever • No signup • 80-char tagline optimized',
    heroSubline:
      'AI writes 3 TikTok taglines that answer "why should I follow?" in a single glance — every one built for the tight 80-char limit.',
    platformHint: 'tiktok',
  },

  // ─── #8 — 9,900/mo (old primary, now an alias) ─────────────────────────────
  {
    slug: 'bio-generator',
    seoTitle: 'Bio Generator — Free AI for Any Platform',
    seoDescription:
      'Free AI bio generator for LinkedIn, Instagram, X, TikTok, GitHub & YouTube. 3 variations per platform with tone and emoji control. No signup.',
    keywords: [
      'bio generator',
      'bio generator free',
      'bio maker',
      'bio writer',
      'bio creator',
      'profile bio generator',
      'online bio generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'bio generator',
    h1Suffix: 'for any social platform.',
    eyebrow: 'AI-powered • Free forever • No signup • 6 platforms',
    heroSubline:
      'Enter your details, pick your platforms, and get 3 on-brand bio variations per network — all tuned to each platform\'s character limits.',
    platformHint: 'general',
  },

  // ─── #9 — 8,100/mo ─────────────────────────────────────────────────────────
  {
    slug: 'linkedin-bio-generator',
    seoTitle: 'LinkedIn Bio Generator — Free AI Writer',
    seoDescription:
      'Free LinkedIn bio generator. AI writes recruiter-optimized About sections and headlines with your role, skills & outcomes. No login. 3 variations.',
    keywords: [
      'linkedin bio generator',
      'linkedin bio generator free',
      'linkedin bio writer',
      'linkedin about generator',
      'linkedin summary generator',
      'linkedin about section generator',
      'ai linkedin bio generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'LinkedIn bio generator',
    h1Suffix: 'that gets recruiter clicks.',
    eyebrow: 'AI-powered • Free forever • No login • Recruiter-optimized',
    heroSubline:
      'Enter your role and one outcome. AI writes 3 LinkedIn About drafts front-loaded for the 210-char desktop cut, with recruiter keywords woven in.',
    platformHint: 'linkedin',
  },

  // ─── #10 — 6,600/mo ────────────────────────────────────────────────────────
  {
    slug: 'twitter-bio-generator',
    seoTitle: 'Twitter Bio Generator — Free 160-Char AI',
    seoDescription:
      'Free Twitter/X bio generator. AI writes 3 bios inside the 160-char limit with role, focus & personality. No login. Copy and paste instantly.',
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
    eyebrow: 'AI-powered • Free forever • No login • 160-char optimized',
    heroSubline:
      'AI writes 3 X bios in the 160-char budget with the [role] · [focus] · [personality] structure that reads best on Twitter/X.',
    platformHint: 'twitter',
  },

  // ─── #11 — 6,600/mo ────────────────────────────────────────────────────────
  {
    slug: 'social-media-caption-generator',
    seoTitle: 'Social Media Caption Generator — Free AI',
    seoDescription:
      'Free social media caption generator for Instagram, LinkedIn, TikTok & X. AI writes platform-tuned captions with hashtags and emojis. No signup.',
    keywords: [
      'social media caption generator',
      'social media caption generator free',
      'caption generator for social media',
      'free caption generator',
      'ai caption generator social media',
      'social post caption generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'social media caption generator',
    h1Suffix: 'for every network.',
    eyebrow: 'AI-powered • Free forever • No signup • Multi-platform captions',
    heroSubline:
      'One topic, every platform. AI generates captions tuned to Instagram, LinkedIn, TikTok, and X with proper hashtags, emojis, and tone.',
    platformHint: 'general',
  },

  // ─── #12 — 5,400/mo ────────────────────────────────────────────────────────
  {
    slug: 'aesthetic-bio-generator',
    seoTitle: 'Aesthetic Bio Generator — Free AI Fonts & Emojis',
    seoDescription:
      'Free aesthetic bio generator for Instagram & TikTok. AI writes bios with aesthetic fonts, symbols & emojis that match Gen-Z visual style. No signup.',
    keywords: [
      'aesthetic bio generator',
      'aesthetic instagram bio generator',
      'aesthetic bio maker',
      'aesthetic bio ideas generator',
      'cute bio generator',
      'aesthetic bio for instagram',
      'gen z bio generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'aesthetic bio generator',
    h1Suffix: 'with fonts & emojis.',
    eyebrow: 'AI-powered • Free forever • No signup • Aesthetic fonts & symbols',
    heroSubline:
      'AI writes 3 aesthetic bios with emoji layouts, symbols, and line breaks tuned for the Instagram and TikTok visual style.',
    platformHint: 'instagram',
  },

  // ─── #13 — 4,400/mo ────────────────────────────────────────────────────────
  {
    slug: 'youtube-description-generator',
    seoTitle: 'YouTube Description Generator — Free AI',
    seoDescription:
      'Free YouTube description generator. AI writes channel and video descriptions optimized for search with timestamps, links & CTAs. No signup.',
    keywords: [
      'youtube description generator',
      'youtube description generator free',
      'youtube channel description generator',
      'youtube video description generator',
      'ai youtube description writer',
      'youtube about generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'YouTube description generator',
    h1Suffix: 'optimized for search.',
    eyebrow: 'AI-powered • Free forever • No signup • SEO-tuned descriptions',
    heroSubline:
      'AI writes channel descriptions (first 100 chars visible) and video descriptions with content pillars, timestamps, and a subscribe CTA.',
    platformHint: 'youtube',
  },

  // ─── #14 — 4,400/mo ────────────────────────────────────────────────────────
  {
    slug: 'linkedin-headline-generator',
    seoTitle: 'LinkedIn Headline Generator — Free AI Writer',
    seoDescription:
      'Free LinkedIn headline generator. AI writes 3 recruiter-optimized headlines with your role, value prop & keywords. No signup. Instant results.',
    keywords: [
      'linkedin headline generator',
      'linkedin headline generator free',
      'linkedin headline writer',
      'linkedin headline ai',
      'professional headline generator',
      'linkedin title generator',
      'ai linkedin headline generator',
    ],
    h1Prefix: 'Free',
    h1Highlight: 'LinkedIn headline generator',
    h1Suffix: 'that signals your value.',
    eyebrow: 'AI-powered • Free forever • No signup • Recruiter-keyword loaded',
    heroSubline:
      'AI writes 3 LinkedIn headlines (220-char max) packed with role keywords, outcome signals, and a personality hook. Front-loaded for recruiter search.',
    platformHint: 'linkedin',
  },

  // ─── #15 — 3,600/mo ────────────────────────────────────────────────────────
  {
    slug: 'professional-bio-generator',
    seoTitle: 'Professional Bio Generator — Free AI Writer',
    seoDescription:
      'Free professional bio generator. AI writes speaker, author & executive bios in first or third person. Multiple lengths. No signup required.',
    keywords: [
      'professional bio generator',
      'professional bio writer',
      'speaker bio generator',
      'author bio generator',
      'executive bio generator',
      'third person bio generator',
      'about me generator professional',
    ],
    h1Prefix: 'Write a',
    h1Highlight: 'professional bio',
    h1Suffix: 'in 30 seconds.',
    eyebrow: 'AI-powered • Free forever • Speaker · Author · Executive ready',
    heroSubline:
      'AI writes 3 professional bios for speaker decks, book jackets, and company pages. First or third person. Short, medium, or long.',
    platformHint: 'general',
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
