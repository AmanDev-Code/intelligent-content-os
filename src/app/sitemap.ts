import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().replace(/\/$/, "");
  const paths = ["", "/features", "/pricing", "/contact", "/auth", "/privacy-policy", "/terms-of-use"];
  const now = new Date();

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
