export const siteName = "Trndinn";

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8080")
  );
}

export const defaultDescription =
  "Trndinn is the AI social content platform: create, schedule, and measure content across channels—starting with LinkedIn, expanding to X, Instagram, Facebook, YouTube, Twitch, Reddit, with AI reels and deep analytics.";
