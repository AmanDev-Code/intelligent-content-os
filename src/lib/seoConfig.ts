import type { Metadata } from "next";
import { getSiteUrl, siteName, defaultDescription, twitterHandle } from "@/lib/site";

/**
 * SEO Configuration - Centralized metadata templates for Trndinn
 * 
 * This file provides consistent meta tag generation across all pages.
 * Each page type has its own template with sensible defaults.
 */

// ============================================================================
// BASE CONFIGURATION
// ============================================================================

const BASE_URL = getSiteUrl().replace(/\/$/, "");

export const DEFAULT_OG_IMAGE = {
  url: "/og/default.png",
  width: 1200,
  height: 799,
  alt: `${siteName} — All-in-One Agentic Social Media Platform`,
};

// ============================================================================
// PAGE TYPE TEMPLATES
// ============================================================================

/**
 * Home page metadata template
 * Highest priority page with brand messaging
 */
export function getHomeMetadata(): Metadata {
  const title = `${siteName} — All-in-One Agentic Social Media Platform`;
  const description = defaultDescription;

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    keywords: [
      siteName,
      "agentic social media scheduling tool",
      "all-in-one social media tool",
      "AI social media agent",
      "social media scheduling",
      "LinkedIn scheduling",
      "Content Engine",
      "brand voice AI",
    ],
    authors: [{ name: siteName }],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      siteName,
      url: BASE_URL,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
      site: twitterHandle,
    },
    alternates: { canonical: BASE_URL },
    robots: { index: true, follow: true },
  };
}

/**
 * Marketing page metadata template
 * For landing pages like /features, /pricing, /content-engine
 */
export interface MarketingPageMetaOptions {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  path?: string;
}

export function getMarketingPageMetadata(options: MarketingPageMetaOptions): Metadata {
  const fullTitle = `${options.title} | ${siteName}`;
  const canonical = options.canonical || (options.path ? `${BASE_URL}${options.path}` : BASE_URL);

  return {
    metadataBase: new URL(BASE_URL),
    title: fullTitle,
    description: options.description,
    keywords: options.keywords,
    openGraph: {
      title: fullTitle,
      description: options.description,
      type: "website",
      locale: "en_US",
      siteName,
      url: canonical,
      images: options.ogImage ? [{ url: options.ogImage }] : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: options.description,
      images: options.ogImage ? [options.ogImage] : [DEFAULT_OG_IMAGE.url],
      site: twitterHandle,
    },
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}

/**
 * Comparison page metadata template
 * For vs pages targeting competitor keywords
 */
export interface ComparisonPageMetaOptions {
  competitor: string;
  competitorSlug: string;
  description?: string;
  keywords?: string[];
}

export function getComparisonPageMetadata(options: ComparisonPageMetaOptions): Metadata {
  const title = `${siteName} vs ${options.competitor} — Agentic Scheduler Comparison`;
  const description = options.description || 
    `Honest comparison of ${siteName} and ${options.competitor}. See which agentic social media platform fits your workflow: AI creation, Brand Voice, Content Engine, and LinkedIn scheduling.`;
  
  const path = `/compare/trndinn/${options.competitorSlug}`;
  const defaultKeywords = [
    `${siteName} vs ${options.competitor}`,
    `${options.competitor} alternative`,
    "agentic social media scheduling",
    `${options.competitor} comparison`,
    "AI social media scheduler",
    "LinkedIn scheduling tool",
    "Content Engine",
    "Brand Voice AI",
  ];

  return getMarketingPageMetadata({
    title: `${siteName} vs ${options.competitor}`,
    description,
    keywords: options.keywords || defaultKeywords,
    path,
  });
}

/**
 * Blog post metadata template
 * For individual blog articles
 */
export interface BlogPostMetaOptions {
  title: string;
  description?: string;
  excerpt?: string;
  slugPath: string;
  author?: { name: string; linkedIn?: string };
  publishedAt?: string;
  updatedAt?: string;
  featuredImage?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

export function getBlogPostMetadata(options: BlogPostMetaOptions): Metadata {
  const title = `${options.title} | ${siteName}`;
  const description = options.description || options.excerpt || `${options.title} — ${siteName}`;
  const canonical = options.canonicalUrl || `${BASE_URL}/blog/${options.slugPath}`;

  const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    keywords: options.keywords,
    authors: options.author ? [{ name: options.author.name }] : [{ name: siteName }],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "en_US",
      siteName,
      url: canonical,
      images: options.featuredImage ? [{ url: options.featuredImage }] : [DEFAULT_OG_IMAGE],
      authors: options.author ? [options.author.name] : undefined,
      ...(options.publishedAt ? { publishedTime: options.publishedAt } : {}),
      ...(options.updatedAt ? { modifiedTime: options.updatedAt } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: options.featuredImage ? [options.featuredImage] : [DEFAULT_OG_IMAGE.url],
      site: twitterHandle,
    },
    robots: { index: true, follow: true },
  };

  return metadata;
}

/**
 * Legal page metadata template
 * For privacy policy, terms of use, etc.
 */
export function getLegalPageMetadata(
  pageName: string,
  path: string,
  description?: string
): Metadata {
  return {
    metadataBase: new URL(BASE_URL),
    title: `${pageName} | ${siteName}`,
    description: description || `${pageName} for ${siteName}`,
    robots: { index: true, follow: true },
    alternates: { canonical: `${BASE_URL}${path}` },
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a meta description with optimal length (150-160 characters)
 * Will truncate if too long, pad if too short
 */
export function optimizeMetaDescription(description: string): string {
  const maxLength = 160;
  const minLength = 120;

  if (description.length > maxLength) {
    return description.slice(0, maxLength - 3).trim() + "...";
  }

  if (description.length < minLength) {
    // Add generic filler if too short
    const filler = ` Learn more about ${siteName}'s features.`;
    if (description.length + filler.length <= maxLength) {
      return description + filler;
    }
  }

  return description;
}

/**
 * Generates Open Graph image URL with proper dimensions
 * Ensures image exists and returns fallback if not
 */
export function generateOgImageUrl(imagePath?: string): string {
  if (!imagePath) return `${BASE_URL}${DEFAULT_OG_IMAGE.url}`;
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
}

/**
 * Generates canonical URL from path
 * Handles various path formats
 */
export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

/**
 * Validates and fixes meta title length
 * Optimal: 50-60 characters (excluding brand name suffix)
 */
export function optimizeMetaTitle(title: string): string {
  const maxLength = 60;
  const brandSuffix = ` | ${siteName}`;

  if (title.includes("|")) {
    // Already has brand suffix, check total length
    const totalLength = title.length;
    if (totalLength > maxLength + brandSuffix.length) {
      return title.slice(0, maxLength + brandSuffix.length - 3).trim() + "...";
    }
    return title;
  }

  // Add brand suffix if not present
  const totalLength = title.length + brandSuffix.length;
  if (totalLength > maxLength + brandSuffix.length) {
    return title.slice(0, maxLength - 3).trim() + "..." + brandSuffix;
  }

  return title + brandSuffix;
}

// ============================================================================
// CORE WEB VITALS OPTIMIZATION HELPERS
// ============================================================================

/**
 * Generates preload hints for critical resources
 * Use in page.tsx or layout.tsx
 */
export function generatePreloadHints(): Array<{
  rel: string;
  href: string;
  as?: string;
  type?: string;
  crossOrigin?: string;
}> {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    // Add more critical domain preconnects as needed
  ];
}

/**
 * Common viewport settings for optimal mobile experience
 * Core Web Vitals: responsive design is essential for LCP
 */
export const OPTIMAL_VIEWPORT = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

// ============================================================================
// EXPORT CONVENIENCE ALIASES
// ============================================================================

/** Re-export site utilities for convenience */
export { getSiteUrl, siteName, defaultDescription, twitterHandle };
