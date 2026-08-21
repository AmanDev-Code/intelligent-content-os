/** Central registry of all free tools on Trndinn. */

export type ToolCategory =
  | "Utility"
  | "Post Generator"
  | "Hook & Caption"
  | "Bio Generator"
  | "Hashtag"
  | "Analytics";

export type ToolPlatform = "Instagram" | "LinkedIn" | "Twitter" | "TikTok" | "Multi-platform";

export interface ToolEntry {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  platform: ToolPlatform;
  isAI: boolean;
  /** Whether the tool page is live (vs coming soon). */
  live: boolean;
}

export const TOOLS: ToolEntry[] = [
  {
    slug: "instagram-reel-downloader",
    name: "Instagram Reel Downloader",
    description: "Download any public Instagram Reel as MP4 in HD. No login, no watermark.",
    category: "Utility",
    platform: "Instagram",
    isAI: false,
    live: true,
  },
  {
    slug: "auto-caption-generator",
    name: "Auto Caption Generator",
    description: "Add AI-synced captions to any video. 6 styles, word-by-word timing, 99+ languages. Free.",
    category: "Utility",
    platform: "Multi-platform",
    isAI: true,
    live: true,
  },
  {
    slug: "bio-generator",
    name: "AI Bio Generator",
    description: "Write LinkedIn, Instagram, X, TikTok, GitHub, and YouTube bios in one run. 3 angles per platform, 0-100 scoring. Free, no login.",
    category: "Bio Generator",
    platform: "Multi-platform",
    isAI: true,
    live: true,
  },
  {
    slug: "linkedin-post-generator",
    name: "LinkedIn Post Generator",
    description: "Generate scroll-stopping LinkedIn posts with AI trained on viral patterns.",
    category: "Post Generator",
    platform: "LinkedIn",
    isAI: true,
    live: false,
  },
  {
    slug: "linkedin-hook-generator",
    name: "LinkedIn Hook Generator",
    description: "Create attention-grabbing first lines that stop the scroll on LinkedIn.",
    category: "Hook & Caption",
    platform: "LinkedIn",
    isAI: true,
    live: false,
  },
  {
    slug: "instagram-caption-generator",
    name: "Instagram Caption Generator",
    description: "Write engaging captions with relevant hashtags for maximum reach.",
    category: "Hook & Caption",
    platform: "Instagram",
    isAI: true,
    live: false,
  },
  {
    slug: "linkedin-headline-generator",
    name: "LinkedIn Headline Generator",
    description: "Craft a headline that gets you found and makes recruiters click.",
    category: "Bio Generator",
    platform: "LinkedIn",
    isAI: true,
    live: false,
  },
  {
    slug: "hashtag-generator",
    name: "Hashtag Generator",
    description: "Find trending and niche hashtags to boost post discoverability.",
    category: "Hashtag",
    platform: "Multi-platform",
    isAI: true,
    live: false,
  },
];

export function getToolBySlug(slug: string): ToolEntry | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolCategories(): ToolCategory[] {
  return [...new Set(TOOLS.map((t) => t.category))];
}
