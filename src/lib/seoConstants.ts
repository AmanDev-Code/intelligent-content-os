/**
 * SEO Constants and Configuration for Trndinn
 * 
 * This file contains:
 * - Structured data types and schemas
 * - Crawler configurations
 * - URL patterns for SEO crawling
 * - Meta tag defaults
 */

// ============================================================================
// SITE CONFIGURATION
// ============================================================================

export const SEO_CONFIG = {
  /** Site name for meta titles */
  siteName: "Trndinn",
  
  /** Site tagline used in descriptions */
  tagline: "All-in-One Agentic Social Media Platform",
  
  /** Default locale */
  defaultLocale: "en-US",
  
  /** Supported locales for i18n */
  supportedLocales: ["en-US"] as const,
  
  /** Default Open Graph image */
  defaultOgImage: "/og/default.png",
  
  /** Default Twitter card type */
  defaultTwitterCard: "summary_large_image" as const,
  
  /** Maximum meta description length for truncation */
  maxMetaDescriptionLength: 160,
  
  /** Optimal meta title length */
  optimalMetaTitleLength: 60,
  
  /** Maximum OG title length */
  maxOgTitleLength: 60,
  
  /** Maximum OG description length */
  maxOgDescriptionLength: 200,
} as const;

// ============================================================================
// SCHEMA.ORG TYPES
// ============================================================================

export const SCHEMA_TYPES = {
  // Core types
  Organization: "Organization",
  WebSite: "WebSite",
  WebPage: "WebPage",
  WebApplication: "WebApplication",
  SoftwareApplication: "SoftwareApplication",
  Product: "Product",
  Offer: "Offer",
  
  // Content types
  Article: "Article",
  BlogPosting: "BlogPosting",
  NewsArticle: "NewsArticle",
  FAQPage: "FAQPage",
  HowTo: "HowTo",
  
  // Navigation types
  BreadcrumbList: "BreadcrumbList",
  SiteNavigationElement: "SiteNavigationElement",
  
  // Business types
  ContactPoint: "ContactPoint",
  AggregateRating: "AggregateRating",
  Review: "Review",
  
  // Image/Media types
  ImageObject: "ImageObject",
  VideoObject: "VideoObject",
} as const;

// ============================================================================
// CRAWLER CONFIGURATION
// ============================================================================

export const CRAWLER_CONFIG = {
  /** User agents that should be allowed */
  allowedCrawlers: [
    // Major search engines
    "Googlebot",
    "Googlebot-Image",
    "Googlebot-News",
    "Googlebot-Video",
    "Bingbot",
    "Slurp",
    "DuckDuckBot",
    "Baiduspider",
    "YandexBot",
    
    // Social media crawlers
    "Twitterbot",
    "facebookexternalhit",
    "LinkedInBot",
    "Pinterest",
    "Slackbot",
    "Discordbot",
    "TelegramBot",
    "WhatsApp",
    
    // AI/LLM crawlers (allowed for now for content discovery)
    "GPTBot",
    "ChatGPT-User",
    "Claude-Web",
    "ClaudeBot",
    "Anthropic-AI",
    "Google-Extended",
    "Applebot",
    "Applebot-Extended",
    "PerplexityBot",
    "PerplexityCrawler",
    "Cohere-ai",
    "CCBot",
    "Bytespider",
    "Meta-ExternalAgent",
  ],
  
  /** User agents that should be explicitly blocked */
  blockedCrawlers: [
    "MJ12bot", // Majestic SEO (heavy crawler)
    "AhrefsBot", // Can be rate-limited
    "SemrushBot", // Can be rate-limited
  ],
  
  /** Paths that should never be crawled */
  blockedPaths: [
    "/dashboard/",
    "/admin/",
    "/api/",
    "/_next/",
    "/auth/callback",
    "/reset-password",
    "/verify-email",
    "/invite/",
    "/platform-admin/",
    "/blog-admin/",
    "/careers-admin/",
    "/maintenance",
  ],
  
  /** Sitemap refresh interval in seconds */
  sitemapRefreshInterval: 86400, // 24 hours
  
  /** Default crawl delay for polite crawling (not all bots respect this) */
  defaultCrawlDelay: 1,
} as const;

// ============================================================================
// URL PATTERNS
// ============================================================================

export const URL_PATTERNS = {
  /** Public marketing pages (high priority) */
  marketingPages: [
    { pattern: "/", priority: 1.0, changeFreq: "weekly" as const },
    { pattern: "/features", priority: 0.9, changeFreq: "weekly" as const },
    { pattern: "/pricing", priority: 0.9, changeFreq: "weekly" as const },
    { pattern: "/ai-agent", priority: 0.85, changeFreq: "monthly" as const },
    { pattern: "/content-engine", priority: 0.85, changeFreq: "weekly" as const },
    { pattern: "/mcp", priority: 0.85, changeFreq: "monthly" as const },
  ],
  
  /** Content pages (medium priority) */
  contentPages: [
    { pattern: "/blog", priority: 0.8, changeFreq: "weekly" as const },
    { pattern: "/blog/*", priority: 0.7, changeFreq: "weekly" as const },
    { pattern: "/contact", priority: 0.7, changeFreq: "monthly" as const },
    { pattern: "/careers", priority: 0.6, changeFreq: "monthly" as const },
    { pattern: "/careers/*", priority: 0.6, changeFreq: "monthly" as const },
    { pattern: "/about-us", priority: 0.6, changeFreq: "monthly" as const },
  ],
  
  /** Comparison pages (SEO important) */
  comparisonPages: [
    { pattern: "/compare/trndinn/postiz", priority: 0.8, changeFreq: "monthly" as const },
    { pattern: "/compare/trndinn/buffer", priority: 0.7, changeFreq: "monthly" as const },
  ],
  
  /** Legal pages (low priority but essential) */
  legalPages: [
    { pattern: "/legal/privacy", priority: 0.3, changeFreq: "yearly" as const },
    { pattern: "/legal/terms", priority: 0.3, changeFreq: "yearly" as const },
    { pattern: "/legal/cookies", priority: 0.3, changeFreq: "yearly" as const },
    { pattern: "/legal/aup", priority: 0.3, changeFreq: "yearly" as const },
    { pattern: "/legal/dpa", priority: 0.3, changeFreq: "yearly" as const },
    { pattern: "/legal/refund", priority: 0.3, changeFreq: "yearly" as const },
  ],
  
  /** Internal/Admin pages (should be blocked) */
  internalPages: [
    "/dashboard/*",
    "/admin/*",
    "/api/*",
    "/platform-admin/*",
    "/blog-admin/*",
  ],
} as const;

// ============================================================================
// KEYWORD STRATEGY
// ============================================================================

export const KEYWORD_STRATEGY = {
  /** Primary brand keywords (always include) */
  brandKeywords: [
    "Trndinn",
    "agentic social media",
    "AI social media agent",
  ],
  
  /** High-volume informational keywords */
  informationalKeywords: [
    "social media scheduling",
    "content calendar",
    "AI content generation",
    "brand voice AI",
    "LinkedIn scheduling",
    "social media automation",
  ],
  
  /** Transactional/CRO keywords */
  transactionalKeywords: [
    "social media tool",
    "LinkedIn automation",
    "content creation platform",
    "post scheduler",
  ],
  
  /** Competitor comparison keywords */
  comparisonKeywords: [
    "Postiz alternative",
    "Buffer alternative",
    "Hootsuite alternative",
    "Sprout Social alternative",
    "best social media scheduler",
  ],
  
  /** Long-tail keywords */
  longTailKeywords: [
    "agentic social media scheduling tool",
    "all-in-one social media tool",
    "AI social media content creation",
    "LinkedIn company page scheduler",
    "social media content distribution",
  ],
} as const;

// ============================================================================
// CORE WEB VITALS TARGETS
// ============================================================================

export const CWV_TARGETS = {
  /** Largest Contentful Paint (LCP) - should be < 2.5s */
  lcpTarget: 2.5,
  
  /** First Input Delay (FID) - should be < 100ms */
  fidTarget: 100,
  
  /** Cumulative Layout Shift (CLS) - should be < 0.1 */
  clsTarget: 0.1,
  
  /** First Contentful Paint (FCP) - should be < 1.8s */
  fcpTarget: 1.8,
  
  /** Time to First Byte (TTFB) - should be < 0.8s */
  ttfbTarget: 0.8,
  
  /** Interaction to Next Paint (INP) - should be < 200ms */
  inpTarget: 200,
} as const;

// ============================================================================
// SOCIAL MEDIA CONFIGURATION
// ============================================================================

export const SOCIAL_CONFIG = {
  /** Twitter/X handle */
  twitter: "@trndinn",
  
  /** LinkedIn company page */
  linkedIn: "https://linkedin.com/company/trndinn",
  
  /** GitHub organization */
  github: "https://github.com/trndinn",
  
  /** YouTube channel (if/when created) */
  youtube: undefined,
  
  /** Facebook page (if/when created) */
  facebook: undefined,
} as const;

// ============================================================================
// EXPORT CONVENIENCE
// ============================================================================

/** Combines all keywords into a single array for meta tags */
export function getAllKeywords(): string[] {
  return [
    ...KEYWORD_STRATEGY.brandKeywords,
    ...KEYWORD_STRATEGY.informationalKeywords,
    ...KEYWORD_STRATEGY.transactionalKeywords,
    ...KEYWORD_STRATEGY.comparisonKeywords.slice(0, 3), // Limit comparisons
    ...KEYWORD_STRATEGY.longTailKeywords.slice(0, 3), // Limit long-tail
  ];
}

/** Gets keywords by category */
export function getKeywordsByCategory(category: keyof typeof KEYWORD_STRATEGY): string[] {
  return [...KEYWORD_STRATEGY[category]];
}
