import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { WebApplicationSchema } from "@/components/seo/WebApplicationSchema";
import { getToolBySlug, TOOLS } from "@/lib/tools-data";
import { getSiteUrl } from "@/lib/site";
import InstagramReelDownloaderView from "@/views/tools/InstagramReelDownloaderView";
import {
  REEL_DOWNLOADER_PRIMARY_SLUG,
  REEL_DOWNLOADER_ALIAS_SLUGS,
  getReelDownloaderAlias,
  isReelDownloaderSlug,
} from "@/lib/reel-downloader-aliases";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const INSTAGRAM_REEL_FAQS = [
  {
    question: "Is it free to download Instagram Reels?",
    answer:
      "Yes, the Trndinn Instagram Reel Downloader is completely free. No signup, no login, no hidden costs. Paste a public Reel URL to download Instagram Reels and save Reels to your device as MP4 instantly.",
  },
  {
    question: "Do I need to log in to Instagram to use this tool?",
    answer:
      "No. This free Instagram Reel Downloader saves public Instagram Reels without requiring any Instagram login or authentication. Simply paste the Reel URL and hit download.",
  },
  {
    question: "What video quality can I download?",
    answer:
      "Instagram Reels are downloaded in their original high quality — typically 720p or 1080p HD MP4. Our Instagram video downloader does not compress or re-encode the video, so you get the same original quality Instagram stores.",
  },
  {
    question: "Is it legal to download Instagram Reels?",
    answer:
      "Downloading public content for personal use is generally permitted. However, re-uploading or redistributing someone else's content without permission may violate copyright laws and Instagram's Terms of Service. Always credit the original creator if you share their work.",
  },
  {
    question: "Does the downloaded video have a watermark?",
    answer:
      "No. The Trndinn Instagram Reel Downloader saves the original MP4 file without watermark — no logo, no branding, no overlay. Download Instagram Reels the way they were uploaded.",
  },
  {
    question: "Can I download Reels from private accounts?",
    answer:
      "No. This Instagram Reels downloader only works with publicly accessible Reels. If an account is private, you will not be able to download their content.",
  },
  {
    question: "How many Instagram Reels can I download?",
    answer:
      "There is no daily cap — you can download unlimited Reels with the Trndinn Instagram Reel Downloader. Fair-use rate limiting is applied to prevent abuse, but normal usage is never restricted.",
  },
  {
    question: "Does this Instagram Reel Downloader work on mobile?",
    answer:
      "Yes. Trndinn's Instagram Reels downloader works on any device with a browser — iPhone, iPad, Android phone or tablet, Mac, Windows PC, Chromebook. Save Instagram Reels directly to your phone gallery or Downloads folder.",
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Alias branch — a keyword-variant URL that renders the reel downloader.
  // Metadata is unique per alias, but the canonical points at the primary URL
  // so Google consolidates ranking signals without penalising duplicate content.
  const alias = getReelDownloaderAlias(slug);
  if (alias) {
    const meta = await buildMarketingMetadata(`/tools/${alias.slug}`, {
      title: alias.seoTitle,
      description: alias.seoDescription,
      keywords: alias.keywords,
    });
    return {
      ...meta,
      alternates: {
        ...(meta.alternates ?? {}),
        canonical: `/tools/${REEL_DOWNLOADER_PRIMARY_SLUG}`,
      },
    };
  }

  const tool = getToolBySlug(slug);
  if (!tool) return {};

  if (slug === REEL_DOWNLOADER_PRIMARY_SLUG) {
    return buildMarketingMetadata(`/tools/${REEL_DOWNLOADER_PRIMARY_SLUG}`, {
      title: "Free Instagram Reel Downloader — HD MP4, No Watermark | Trndinn",
      description:
        "Download any public Instagram Reel as HD MP4 for free — no watermark, no login, no app install. Works on iPhone, Android, Mac & PC. Paste a link and save in 3 seconds.",
      keywords: [
        "instagram reel downloader",
        "instagram reels downloader",
        "download instagram reel",
        "download instagram reels",
        "reel downloader online",
        "instagram video downloader",
        "download reels mp4",
        "instagram reel download hd",
        "save instagram reels",
        "reels downloader",
        "instagram reels saver",
        "instagram video download",
      ],
    });
  }

  // Generic fallback for any tool without dedicated SEO. Keeps positioning
  // consistent (brand-led, benefit-led, CTA) and ensures every tool page has
  // a proper meta description sized for SERPs.
  const generic = tool.description || "A free tool by Trndinn.";
  const description = `${generic} Free, no login, no signup. Part of Trndinn's free tools for creators and marketers.`;
  return buildMarketingMetadata(`/tools/${slug}`, {
    title: `${tool.name} — Free Tool by Trndinn`,
    description: description.length > 160 ? description.slice(0, 157) + "…" : description,
    keywords: [
      tool.name.toLowerCase(),
      `free ${tool.name.toLowerCase()}`,
      `${tool.name.toLowerCase()} online`,
      `${tool.platform.toLowerCase()} tools`,
      "trndinn tools",
      "free social media tools",
    ],
  });
}

export function generateStaticParams() {
  return [
    ...TOOLS.filter((t) => t.live).map((t) => ({ slug: t.slug })),
    // Also pre-render every alias slug so Next can statically export them.
    ...REEL_DOWNLOADER_ALIAS_SLUGS.map((slug) => ({ slug })),
  ];
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const base = getSiteUrl().replace(/\/$/, "");

  // Any reel-downloader slug (primary OR alias) renders the reel view.
  // Aliases pass down variant hero copy so the H1/eyebrow/subline differ
  // per URL for keyword targeting, while the tool functionality is identical.
  if (isReelDownloaderSlug(slug)) {
    const alias = getReelDownloaderAlias(slug);
    const breadcrumbName = alias?.seoTitle.split(" — ")[0] ?? "Instagram Reel Downloader";
    return (
      <>
        <BreadcrumbSchema
          items={[
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: breadcrumbName, path: `/tools/${slug}` },
          ]}
        />
        <FAQPageSchema
          faqs={INSTAGRAM_REEL_FAQS}
          pageUrl={`${base}/tools/${REEL_DOWNLOADER_PRIMARY_SLUG}`}
        />
        <WebApplicationSchema
          name={alias?.seoTitle.split(" — ")[0] ?? "Free Instagram Reel Downloader"}
          description="Download any public Instagram Reel as MP4 in original HD quality. No login required, no watermark added."
          url={`/tools/${REEL_DOWNLOADER_PRIMARY_SLUG}`}
          applicationCategory="UtilityApplication"
          featureList={[
            "Download Instagram Reels as MP4",
            "Original HD quality (720p/1080p)",
            "No login required",
            "No watermark",
            "Instant download",
            "Works on mobile and desktop",
          ]}
        />
        <InstagramReelDownloaderView
          faqs={INSTAGRAM_REEL_FAQS}
          heroVariant={
            alias
              ? {
                  h1Prefix: alias.h1Prefix,
                  h1Highlight: alias.h1Highlight,
                  h1Suffix: alias.h1Suffix,
                  eyebrow: alias.eyebrow,
                  subline: alias.heroSubline,
                }
              : undefined
          }
        />
      </>
    );
  }

  const tool = getToolBySlug(slug);
  if (!tool || !tool.live) notFound();

  // Generic tool placeholder for future tools
  notFound();
}
