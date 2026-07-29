import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { WebApplicationSchema } from "@/components/seo/WebApplicationSchema";
import { getToolBySlug, TOOLS } from "@/lib/tools-data";
import { getSiteUrl } from "@/lib/site";
import InstagramReelDownloaderView from "@/views/tools/InstagramReelDownloaderView";

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
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  if (slug === "instagram-reel-downloader") {
    return buildMarketingMetadata("/tools/instagram-reel-downloader", {
      title: "Free Instagram Reel Downloader — Download Instagram Reels HD MP4",
      description:
        "Free Instagram Reel Downloader — download any public Instagram Reel as MP4 in HD quality without watermark. No login required. Save Instagram Reels instantly online with Trndinn.",
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

  return buildMarketingMetadata(`/tools/${slug}`, {
    title: `${tool.name} — Free Tool`,
    description: tool.description,
  });
}

export function generateStaticParams() {
  return TOOLS.filter((t) => t.live).map((t) => ({ slug: t.slug }));
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool || !tool.live) notFound();

  const base = getSiteUrl().replace(/\/$/, "");

  if (slug === "instagram-reel-downloader") {
    return (
      <>
        <BreadcrumbSchema
          items={[
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: "Instagram Reel Downloader", path: "/tools/instagram-reel-downloader" },
          ]}
        />
        <FAQPageSchema
          faqs={INSTAGRAM_REEL_FAQS}
          pageUrl={`${base}/tools/instagram-reel-downloader`}
        />
        <WebApplicationSchema
          name="Free Instagram Reel Downloader"
          description="Download any public Instagram Reel as MP4 in original HD quality. No login required, no watermark added."
          url="/tools/instagram-reel-downloader"
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
        <InstagramReelDownloaderView faqs={INSTAGRAM_REEL_FAQS} />
      </>
    );
  }

  // Generic tool placeholder for future tools
  notFound();
}
