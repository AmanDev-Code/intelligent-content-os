import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// Advisory LLM/marketing context is also published at /llms.txt (text/plain).

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().replace(/\/$/, "");
  return {
    rules: [
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
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
