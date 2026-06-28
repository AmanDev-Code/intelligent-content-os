/**
 * Internal Linking Strategy for Trndinn
 * 
 * Provides utilities for SEO-optimized internal linking throughout the site.
 * - Contextual link mapping based on content themes
 * - Guide relationship mapping
 * - Comparison page cross-referencing
 * - Anchor text recommendations for SEO
 */

export type PageType = 
  | "homepage" 
  | "features" 
  | "pricing" 
  | "blog" 
  | "comparison" 
  | "guide" 
  | "about"
  | "ai-agent"
  | "content-engine"
  | "mcp";

export type GuideKey = 
  | "ai-social-media-marketing" 
  | "linkedin-automation"
  | "content-repurposing"
  | "social-media-scheduling";

export type ComparisonKey = 
  | "buffer" 
  | "hootsuite"
  | "predis"
  | "postiz"
  | "taplio";

export interface Guide {
  key: GuideKey;
  href: string;
  title: string;
  excerpt: string;
  description: string;
  keywords: string[];
  relatedComparisons: ComparisonKey[];
  relatedBlogTopics: string[];
  color: string;
  icon?: string;
}

export interface Comparison {
  key: ComparisonKey;
  href: string;
  name: string;
  description: string;
  features: string[];
  relatedGuides: GuideKey[];
  anchorTexts: string[];
}

export interface ContextualLink {
  href: string;
  anchorText: string;
  context: string;
  pageTypes: PageType[];
}

// Guide definitions with SEO metadata
export const GUIDES: Record<GuideKey, Guide> = {
  "ai-social-media-marketing": {
    key: "ai-social-media-marketing",
    href: "/guides/ai-social-media-marketing",
    title: "AI Social Media Marketing",
    excerpt: "Master AI-powered social media strategies that boost engagement and save hours of manual work.",
    description: "Complete guide to leveraging AI for social media marketing, from content generation to performance analytics.",
    keywords: ["AI social media marketing", "AI content generation", "social media automation", "marketing AI tools"],
    relatedComparisons: ["predis", "buffer"],
    relatedBlogTopics: ["AI content", "content strategy", "automation"],
    color: "#8b5cf6", // Violet
  },
  "linkedin-automation": {
    key: "linkedin-automation",
    href: "/guides/linkedin-automation",
    title: "LinkedIn Automation",
    excerpt: "Build your LinkedIn presence on autopilot with proven automation strategies that maintain authenticity.",
    description: "Learn how to automate LinkedIn posting, engagement, and growth while maintaining a personal touch.",
    keywords: ["LinkedIn automation", "LinkedIn scheduling", "LinkedIn growth", "social selling"],
    relatedComparisons: ["taplio", "buffer"],
    relatedBlogTopics: ["LinkedIn", "B2B marketing", "personal branding"],
    color: "#0A66C2", // LinkedIn blue
  },
  "content-repurposing": {
    key: "content-repurposing",
    href: "/guides/content-repurposing",
    title: "Content Repurposing",
    excerpt: "Multiply your content output by 10x without creating new content from scratch.",
    description: "Turn one piece of content into dozens of platform-optimized posts with smart repurposing strategies.",
    keywords: ["content repurposing", "content recycling", "content syndication", "content distribution"],
    relatedComparisons: ["postiz", "predis"],
    relatedBlogTopics: ["content strategy", "productivity", "content creation"],
    color: "#10b981", // Emerald
  },
  "social-media-scheduling": {
    key: "social-media-scheduling",
    href: "/guides/social-media-scheduling",
    title: "Social Media Scheduling",
    excerpt: "The complete guide to scheduling across all platforms with optimal timing strategies.",
    description: "Master the art of social media scheduling, from best posting times to cross-platform workflows.",
    keywords: ["social media scheduling", "post scheduler", "best time to post", "content calendar"],
    relatedComparisons: ["buffer", "hootsuite", "postiz"],
    relatedBlogTopics: ["scheduling", "productivity", "time management"],
    color: "#6366f1", // Indigo
  },
};

// Comparison page definitions with SEO anchor texts
export const COMPARISONS: Record<ComparisonKey, Comparison> = {
  buffer: {
    key: "buffer",
    href: "/vs/buffer",
    name: "Buffer",
    description: "The scheduling pioneer and longtime industry standard",
    features: ["scheduling", "analytics", "team collaboration"],
    relatedGuides: ["social-media-scheduling", "ai-social-media-marketing"],
    anchorTexts: [
      "Buffer alternative comparison",
      "Best Buffer alternative",
      "Replace Buffer with Trndinn",
      "Buffer vs Trndinn features",
      "Switch from Buffer",
    ],
  },
  hootsuite: {
    key: "hootsuite",
    href: "/vs/hootsuite",
    name: "Hootsuite",
    description: "The enterprise social media management platform",
    features: ["enterprise", "scheduling", "monitoring"],
    relatedGuides: ["social-media-scheduling", "linkedin-automation"],
    anchorTexts: [
      "Hootsuite alternative",
      "Hootsuite vs Trndinn comparison",
      "Best Hootsuite alternative for teams",
      "Replace Hootsuite",
      "Hootsuite pricing comparison",
    ],
  },
  predis: {
    key: "predis",
    href: "/vs/predis",
    name: "Predis.ai",
    description: "AI-powered content generation platform",
    features: ["AI content", "content generation", "automation"],
    relatedGuides: ["ai-social-media-marketing", "content-repurposing"],
    anchorTexts: [
      "Predis.ai alternative",
      "Best AI content generator alternative",
      "Predis vs Trndinn",
      "AI content tool comparison",
      "Replace Predis.ai",
    ],
  },
  postiz: {
    key: "postiz",
    href: "/vs/postiz",
    name: "Postiz",
    description: "Open-source social media scheduling tool",
    features: ["open source", "scheduling", "self-hosted"],
    relatedGuides: ["social-media-scheduling", "content-repurposing"],
    anchorTexts: [
      "Postiz alternative",
      "Best Postiz alternative",
      "Postiz vs Trndinn comparison",
      "Open source scheduler alternative",
      "Replace Postiz",
    ],
  },
  taplio: {
    key: "taplio",
    href: "/vs/taplio",
    name: "Taplio",
    description: "LinkedIn-focused growth and scheduling tool",
    features: ["LinkedIn", "personal brand", "growth"],
    relatedGuides: ["linkedin-automation", "ai-social-media-marketing"],
    anchorTexts: [
      "Taplio alternative",
      "Best Taplio alternative for LinkedIn",
      "Taplio vs Trndinn comparison",
      "LinkedIn automation tool comparison",
      "Replace Taplio",
    ],
  },
};

// Contextual links database - maps content themes to internal links
export const CONTEXTUAL_LINKS: Record<string, ContextualLink[]> = {
  "AI": [
    { href: "/guides/ai-social-media-marketing", anchorText: "AI social media marketing guide", context: "AI content", pageTypes: ["homepage", "features", "blog", "ai-agent"] },
    { href: "/ai-agent", anchorText: "AI social media agent", context: "agent capabilities", pageTypes: ["homepage", "features", "blog"] },
  ],
  "scheduling": [
    { href: "/guides/social-media-scheduling", anchorText: "social media scheduling guide", context: "scheduling features", pageTypes: ["homepage", "features", "pricing", "blog"] },
    { href: "/guides/linkedin-automation", anchorText: "LinkedIn scheduling guide", context: "LinkedIn scheduling", pageTypes: ["features", "blog"] },
  ],
  "LinkedIn": [
    { href: "/guides/linkedin-automation", anchorText: "LinkedIn automation guide", context: "LinkedIn growth", pageTypes: ["homepage", "features", "blog", "comparison"] },
    { href: "/vs/taplio", anchorText: "Taplio alternative comparison", context: "LinkedIn tools", pageTypes: ["blog", "features"] },
  ],
  "content": [
    { href: "/guides/content-repurposing", anchorText: "content repurposing guide", context: "content strategy", pageTypes: ["homepage", "features", "blog", "content-engine"] },
    { href: "/content-engine", anchorText: "AI Content Engine", context: "content generation", pageTypes: ["homepage", "features", "blog"] },
  ],
};

/**
 * Get related guides for a specific page type
 * @param pageType - The type of page requesting related content
 * @param limit - Maximum number of guides to return
 * @returns Array of related guides
 */
export function getRelatedGuides(pageType: PageType, limit: number = 4): Guide[] {
  const priorityMap: Record<PageType, GuideKey[]> = {
    "homepage": ["ai-social-media-marketing", "linkedin-automation", "content-repurposing", "social-media-scheduling"],
    "features": ["ai-social-media-marketing", "content-repurposing", "social-media-scheduling", "linkedin-automation"],
    "pricing": ["social-media-scheduling", "ai-social-media-marketing"],
    "blog": ["ai-social-media-marketing", "linkedin-automation", "content-repurposing"],
    "comparison": ["social-media-scheduling", "ai-social-media-marketing"],
    "guide": ["content-repurposing", "social-media-scheduling"],
    "about": ["ai-social-media-marketing", "linkedin-automation"],
    "ai-agent": ["ai-social-media-marketing", "content-repurposing"],
    "content-engine": ["content-repurposing", "ai-social-media-marketing"],
    "mcp": ["ai-social-media-marketing", "content-repurposing"],
  };

  const guides = priorityMap[pageType] || [];
  return guides
    .slice(0, limit)
    .map((key) => GUIDES[key])
    .filter(Boolean);
}

/**
 * Get related comparison pages for a specific feature or topic
 * @param feature - The feature or topic to find comparisons for
 * @param limit - Maximum number of comparisons to return
 * @returns Array of related comparisons
 */
export function getRelatedComparisons(feature: string, limit: number = 3): Comparison[] {
  const featureMap: Record<string, ComparisonKey[]> = {
    "scheduling": ["buffer", "hootsuite", "postiz"],
    "AI": ["predis"],
    "LinkedIn": ["taplio", "buffer"],
    "content": ["predis", "postiz"],
    "enterprise": ["hootsuite"],
    "open source": ["postiz"],
    "analytics": ["buffer", "hootsuite"],
    "team": ["hootsuite", "buffer"],
  };

  const normalizedFeature = feature.toLowerCase();
  const comparisons = featureMap[normalizedFeature] || [];
  
  return comparisons
    .slice(0, limit)
    .map((key) => COMPARISONS[key])
    .filter(Boolean);
}

/**
 * Get guides related to a specific comparison competitor
 * @param competitorKey - The competitor key (e.g., "buffer", "taplio")
 * @returns Array of related guides
 */
export function getGuidesForComparison(competitorKey: ComparisonKey): Guide[] {
  const comparison = COMPARISONS[competitorKey];
  if (!comparison) return [];
  
  return comparison.relatedGuides
    .map((key) => GUIDES[key])
    .filter(Boolean);
}

/**
 * Get comparison pages related to a specific guide
 * @param guideKey - The guide key
 * @returns Array of related comparisons
 */
export function getComparisonsForGuide(guideKey: GuideKey): Comparison[] {
  const guide = GUIDES[guideKey];
  if (!guide) return [];
  
  return guide.relatedComparisons
    .map((key) => COMPARISONS[key])
    .filter(Boolean);
}

/**
 * Get all guides as an array
 * @returns Array of all guides
 */
export function getAllGuides(): Guide[] {
  return Object.values(GUIDES);
}

/**
 * Get all comparison pages as an array
 * @returns Array of all comparisons
 */
export function getAllComparisons(): Comparison[] {
  return Object.values(COMPARISONS);
}

/**
 * Suggest anchor text variations for a link
 * @param href - The URL to get anchor texts for
 * @param context - Optional context for better suggestions
 * @returns Array of anchor text suggestions
 */
export function getAnchorTextSuggestions(href: string, context?: string): string[] {
  // Find matching comparison
  const comparison = Object.values(COMPARISONS).find((c) => c.href === href);
  if (comparison) {
    return comparison.anchorTexts;
  }

  // Find matching guide
  const guide = Object.values(GUIDES).find((g) => g.href === href);
  if (guide) {
    return [
      `${guide.title.toLowerCase()} guide`,
      `complete ${guide.keywords[0] || "guide"}`,
      `${guide.title} tutorial`,
      `learn about ${guide.keywords[0] || guide.title.toLowerCase()}`,
    ];
  }

  // Fallback based on context
  if (context) {
    return [`${context} guide`, `learn more about ${context}`, `${context} resources`];
  }

  return ["learn more", "read our guide", "see details"];
}

/**
 * Get contextual links for specific content themes
 * @param themes - Array of content themes detected in the content
 * @param pageType - The current page type
 * @returns Array of relevant contextual links
 */
export function getContextualLinks(themes: string[], pageType: PageType): ContextualLink[] {
  const results: ContextualLink[] = [];
  
  for (const theme of themes) {
    const links = CONTEXTUAL_LINKS[theme] || [];
    const relevant = links.filter((link) => link.pageTypes.includes(pageType));
    results.push(...relevant);
  }
  
  // Deduplicate by href
  const seen = new Set<string>();
  return results.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

/**
 * Generate breadcrumb items for a page
 * @param pageType - The type of page
 * @param pageName - The name of the specific page
 * @returns Array of breadcrumb items
 */
export function getBreadcrumbItems(pageType: PageType, pageName?: string): Array<{ label: string; href: string }> {
  const baseItems: Record<PageType, Array<{ label: string; href: string }>> = {
    homepage: [{ label: "Home", href: "/" }],
    features: [
      { label: "Home", href: "/" },
      { label: "Features", href: "/features" },
    ],
    pricing: [
      { label: "Home", href: "/" },
      { label: "Pricing", href: "/pricing" },
    ],
    blog: [
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
    ],
    comparison: [
      { label: "Home", href: "/" },
      { label: "Compare", href: "#" },
    ],
    guide: [
      { label: "Home", href: "/" },
      { label: "Guides", href: "/guides" },
    ],
    about: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about-us" },
    ],
    "ai-agent": [
      { label: "Home", href: "/" },
      { label: "AI Agent", href: "/ai-agent" },
    ],
    "content-engine": [
      { label: "Home", href: "/" },
      { label: "Content Engine", href: "/content-engine" },
    ],
    mcp: [
      { label: "Home", href: "/" },
      { label: "MCP", href: "/mcp" },
    ],
  };

  const items = baseItems[pageType] || [{ label: "Home", href: "/" }];
  
  if (pageName) {
    items.push({ label: pageName, href: "#" });
  }
  
  return items;
}
