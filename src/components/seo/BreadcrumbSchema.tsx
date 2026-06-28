"use client";

import { getSiteUrl } from "@/lib/site";

interface BreadcrumbItem {
  /** Display name for the breadcrumb */
  name: string;
  /** URL path (relative, e.g., "/blog") */
  path: string;
}

interface BreadcrumbSchemaProps {
  /** Array of breadcrumb items in order from root to leaf */
  items: BreadcrumbItem[];
  /** Optional base URL override (defaults to site URL) */
  baseUrl?: string;
}

/**
 * BreadcrumbSchema - Structured data for breadcrumb navigation
 * Implements schema.org/BreadcrumbList for rich search results
 * 
 * Usage:
 * <BreadcrumbSchema
 *   items={[
 *     { name: "Home", path: "/" },
 *     { name: "Blog", path: "/blog" },
 *     { name: "Article Title", path: "/blog/article-title" }
 *   ]}
 * />
 * 
 * This generates breadcrumb markup that Google may display in search results
 * as clickable navigation paths.
 */
export function BreadcrumbSchema({ items, baseUrl }: BreadcrumbSchemaProps) {
  if (!items || items.length === 0) return null;

  const base = baseUrl || getSiteUrl().replace(/\/$/, "");

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Generates breadcrumb items for a blog post
 * Usage: generateBlogBreadcrumbs("my-post-slug", "Post Title")
 */
export function generateBlogBreadcrumbs(
  slugPath: string,
  postTitle: string,
  blogBasePath: string = "/blog"
): BreadcrumbItem[] {
  const segments = slugPath.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Home", path: "/" },
    { name: "Blog", path: blogBasePath },
  ];

  segments.forEach((seg, i) => {
    breadcrumbs.push({
      name: i === segments.length - 1 ? postTitle : seg.replace(/-/g, " "),
      path: `${blogBasePath}/${segments.slice(0, i + 1).join("/")}`,
    });
  });

  return breadcrumbs;
}

/**
 * Generates breadcrumb items for comparison pages
 * Usage: generateComparisonBreadcrumbs("trndinn", "buffer", "Buffer")
 */
export function generateComparisonBreadcrumbs(
  ourSlug: string,
  competitorSlug: string,
  competitorName: string
): BreadcrumbItem[] {
  return [
    { name: "Home", path: "/" },
    { name: "Comparisons", path: `/compare` },
    { name: `${ourSlug} vs ${competitorName}`, path: `/compare/${ourSlug}/${competitorSlug}` },
  ];
}

/**
 * Generates breadcrumb items for legal pages
 * Usage: generateLegalBreadcrumbs("Privacy Policy", "/legal/privacy")
 */
export function generateLegalBreadcrumbs(
  pageName: string,
  pagePath: string
): BreadcrumbItem[] {
  return [
    { name: "Home", path: "/" },
    { name: "Legal", path: "/legal" },
    { name: pageName, path: pagePath },
  ];
}

/**
 * PricingPageSchema - Structured data for pricing pages
 * Implements schema.org/Product with Offers for pricing information
 * 
 * Usage:
 * <PricingPageSchema
 *   name="Trndinn Pricing"
 *   description="Agentic social media platform pricing plans"
 *   plans={[
 *     { name: "Free", price: "0", priceCurrency: "USD", description: "150 credits" },
 *     { name: "Creator", price: "29", priceCurrency: "USD", description: "500 credits/month" }
 *   ]}
 * />
 */
interface PricingPlan {
  name: string;
  price: string;
  priceCurrency: string;
  description?: string;
  url?: string;
}

interface PricingPageSchemaProps {
  name: string;
  description: string;
  plans: PricingPlan[];
}

export function PricingPageSchema({
  name,
  description,
  plans,
}: PricingPageSchemaProps) {
  const base = getSiteUrl().replace(/\/$/, "");

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${base}/#pricing-product`,
        name,
        description,
        url: `${base}/pricing`,
        offers: plans.map((plan) => ({
          "@type": "Offer",
          name: plan.name,
          price: plan.price,
          priceCurrency: plan.priceCurrency,
          description: plan.description,
          url: plan.url || `${base}/pricing`,
          availability: "https://schema.org/InStock",
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${base}/#pricing-faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "How do credits work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Credits are consumed per AI action. Different actions cost different amounts based on complexity. Unused credits roll over monthly on paid plans.",
            },
          },
          {
            "@type": "Question",
            name: "Can I upgrade or downgrade anytime?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, you can change your plan at any time. When upgrading, you'll get immediate access to additional features and credits. When downgrading, changes take effect at the next billing cycle.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
