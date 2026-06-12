import type { Metadata } from "next";
import { API_CONFIG } from "@/lib/constants";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { siteName } from "@/lib/site";
import LegalPage from "@/views/LegalPage";

/** Canonical legal slugs served by `GET /public/legal/:slug`. */
const LEGAL_SLUGS = [
  "privacy",
  "terms",
  "cookies",
  "aup",
  "dpa",
  "subprocessors",
  "refund",
  "data-rights",
] as const;

type LegalMeta = {
  slug: string;
  title?: string | null;
  summary?: string | null;
  seoDescription?: string | null;
};

function apiBase(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || API_CONFIG.BASE_URL;
}

async function fetchLegalMeta(slug: string): Promise<LegalMeta | null> {
  try {
    const res = await fetch(`${apiBase()}/public/legal/${slug}`, {
      next: { revalidate: 300 },
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as LegalMeta;
    if (!data || !data.slug) return null;
    return data;
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await fetchLegalMeta(slug);
  const title = meta?.title?.trim() || "Legal";
  const description =
    meta?.seoDescription?.trim() ||
    meta?.summary?.trim() ||
    `Read ${siteName}'s ${title.toLowerCase()} and related legal terms.`;
  return buildMarketingMetadata(`/legal/${slug}`, {
    title,
    description,
    keywords: ["Trndinn legal", title, "terms", "privacy", "compliance"],
  });
}

export default async function LegalSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LegalPage slug={slug} />;
}
