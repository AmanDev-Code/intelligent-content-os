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

/**
 * Per-slug SEO copy for the /legal/* pages. The API returns bare document names ("Privacy Policy", "Terms of Service"),
 * which produce short 24-26 char <title>s once the root layout appends "| Trndinn". Search Console flagged these as
 * "Bad". We enrich here so each legal page renders a length-safe title (~48-58 chars) and a substantive description
 * (140-155 chars) that Google won't truncate.
 */
const LEGAL_SEO: Record<
  string,
  { title: string; description: string }
> = {
  privacy: {
    title: "Privacy Policy — Data Collection, Rights, Compliance",
    description:
      "How Trndinn collects, uses, and protects your data. Your rights under GDPR, CCPA/CPRA, and India DPDP, plus our platform-compliance commitments.",
  },
  terms: {
    title: "Terms of Service — Trndinn Platform Agreement",
    description:
      "Trndinn Terms of Service. Your rights and responsibilities, billing, acceptable use, service commitments, and platform-compliance obligations.",
  },
  cookies: {
    title: "Cookie Policy — How Trndinn Uses Cookies & Trackers",
    description:
      "The cookies and trackers Trndinn uses, why we use them, and how to manage your preferences. Includes analytics, functional, and marketing categories.",
  },
  aup: {
    title: "Acceptable Use Policy — Trndinn Community Rules",
    description:
      "What is and isn't allowed on Trndinn. Content guidelines, prohibited activities, and the enforcement process for keeping our platform safe and useful.",
  },
  dpa: {
    title: "Data Processing Addendum — Enterprise DPA & SCCs",
    description:
      "The Trndinn Data Processing Addendum covering GDPR Article 28, standard contractual clauses, sub-processors, and enterprise data-protection commitments.",
  },
  subprocessors: {
    title: "Sub-processors — Trndinn Vendors & Data Flows",
    description:
      "The current list of Trndinn sub-processors and connected platforms, the data each handles, and where they operate. Updated whenever vendors change.",
  },
  refund: {
    title: "Refund & Cancellation Policy — Billing at Trndinn",
    description:
      "Trndinn refund and cancellation policy. Billing cycles, cancellation windows, refund eligibility, credit handling, and how to contact billing support.",
  },
  "data-rights": {
    title: "Your Privacy Choices & Data Rights at Trndinn",
    description:
      "Exercise your privacy rights at Trndinn: access, delete, correct, port, and opt out of sale/share under GDPR, CCPA/CPRA, and India DPDP. Contact channels included.",
  },
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
  const enriched = LEGAL_SEO[slug];

  // Precedence: CMS explicit title → local enrichment map → last-resort fallback.
  // buildMarketingMetadata() strips a trailing "| Trndinn" so authoring in either style is safe.
  const rawApiTitle = meta?.title?.trim();
  const title =
    enriched?.title || rawApiTitle || `${siteName} Legal & Compliance`;

  const description =
    meta?.seoDescription?.trim() ||
    enriched?.description ||
    meta?.summary?.trim() ||
    `${siteName}'s ${(rawApiTitle || "legal").toLowerCase()} and related compliance terms.`;

  return buildMarketingMetadata(`/legal/${slug}`, {
    title,
    description,
    keywords: [
      `${siteName} legal`,
      rawApiTitle || slug,
      "terms",
      "privacy",
      "compliance",
      "GDPR",
      "CCPA",
    ],
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
