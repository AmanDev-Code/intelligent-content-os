export const siteName = "Trndinn";

/** Site tagline - used in SEO and marketing copy */
export const siteTagline = "AI-Native Social Media Platform & Free Creator Tools";

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8080")
  );
}

/** Default meta description optimized for SEO with targeted keywords.
 * Kept under 160 chars so Google doesn't truncate it in the SERP snippet. */
export const defaultDescription =
  "Trndinn: free Instagram Reel downloader, AI social media tools, Brand Voice, visual calendar, and Content Engine. No signup for free tools. Start free today.";

/** Extended keywords for SEO based on competitor analysis */
export const siteKeywords = [
  "free instagram reel downloader",
  "free social media tools",
  "instagram video downloader no watermark",
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
