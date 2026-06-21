export const siteName = "Trndinn";

/** Site tagline - used in SEO and marketing copy */
export const siteTagline = "All-in-One Agentic Social Media Platform";

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8080")
  );
}

/** Default meta description optimized for SEO with targeted keywords */
export const defaultDescription =
  "Trndinn is the all-in-one agentic platform for creating, scheduling, managing, and growing social media — with AI agents, Brand Voice from your examples, and a Content Engine for SEO and distribution. LinkedIn live today. Start free with 150 credits.";

/** Extended keywords for SEO based on competitor analysis */
export const siteKeywords = [
  "agentic social media",
  "agentic social media scheduling tool",
  "all-in-one social media tool",
  "AI social media agent",
  "AI social media tool",
  "LinkedIn scheduling",
  "social media automation",
  "AI content generation",
  "brand voice AI",
  "content calendar",
  "social media analytics",
  "post scheduler",
  "content creation platform",
  "LinkedIn automation",
  "content scheduling",
  "social media AI",
  "content marketing platform",
  "SEO content distribution",
];

/** Twitter/X handle for social sharing */
export const twitterHandle = "@trndinn";

/** LinkedIn company page URL */
export const linkedInCompany = "https://linkedin.com/company/trndinn";

/** GitHub repository URL */
export const githubUrl = "https://github.com/trndinn";

/** Support email */
export const supportEmail = "support@trndinn.com";

/** Compliance / legal / privacy inquiries */
export const complianceEmail = "compliance@trndinn.com";

/** Support URL */
export const supportUrl = "https://trndinn.com/contact";

/** App version for caching purposes */
export const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";
