import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// Advisory LLM/marketing context is also published at /llms.txt (text/plain).
// This robots.ts generates dynamic robots.txt with comprehensive crawler rules.

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().replace(/\/$/, "");
  return {
    rules: [
      // Default rules for all crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/dashboard",
          "/(dashboard)/",
          "/admin/",
          "/api/",
          "/maintenance",
          "/_next/",
          "/auth/callback",
          "/reset-password",
          "/verify-email",
          "/invite/",
          "/platform-admin/",
          "/blog-admin/",
          "/careers-admin/",
        ],
      },
      // Major search engines - explicit permissions
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
      },
      {
        userAgent: "Googlebot-News",
        allow: "/blog",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
      {
        userAgent: "Slurp",
        allow: "/",
      },
      {
        userAgent: "DuckDuckBot",
        allow: "/",
      },
      {
        userAgent: "Baiduspider",
        allow: "/",
      },
      {
        userAgent: "YandexBot",
        allow: "/",
      },
      // Social media crawlers - allow for link preview generation
      {
        userAgent: "Twitterbot",
        allow: "/",
      },
      {
        userAgent: "facebookexternalhit",
        allow: "/",
      },
      {
        userAgent: "LinkedInBot",
        allow: "/",
      },
      {
        userAgent: "Pinterest",
        allow: "/",
      },
      {
        userAgent: "Slackbot",
        allow: "/",
      },
      {
        userAgent: "Discordbot",
        allow: "/",
      },
      // AI/LLM Crawlers - allow for content discovery and training
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "Anthropic-AI",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "Applebot",
        allow: "/",
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "Cohere-ai",
        allow: "/",
      },
      {
        userAgent: "CCBot",
        allow: "/",
      },
      {
        userAgent: "Bytespider",
        allow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
