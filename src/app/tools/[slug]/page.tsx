import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { WebApplicationSchema } from "@/components/seo/WebApplicationSchema";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { getToolBySlug, TOOLS } from "@/lib/tools-data";
import { getSiteUrl } from "@/lib/site";
import InstagramReelDownloaderView from "@/views/tools/InstagramReelDownloaderView";
import AutoCaptionGeneratorView from "@/views/tools/AutoCaptionGeneratorView";
import {
  REEL_DOWNLOADER_PRIMARY_SLUG,
  REEL_DOWNLOADER_ALIAS_SLUGS,
  getReelDownloaderAlias,
  isReelDownloaderSlug,
} from "@/lib/reel-downloader-aliases";
import {
  AUTO_CAPTION_PRIMARY_SLUG,
  AUTO_CAPTION_ALIAS_SLUGS,
  getAutoCaptionAlias,
  isAutoCaptionSlug,
} from "@/lib/auto-caption-aliases";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const INSTAGRAM_REEL_FAQS = [
  {
    question: "How do I download an Instagram Reel without watermark?",
    answer:
      "Copy the Reel's link from Instagram (tap Share > Copy Link), paste it into Trndinn's Instagram Reel Downloader, and tap Download. You get a clean HD MP4 with no watermark and no login.",
  },
  {
    question: "Is it free to download Instagram Reels?",
    answer:
      "Yes. Trndinn's Instagram Reel downloader is completely free with no signup, no watermark, and no download limit for public Reels. There is nothing to install.",
  },
  {
    question: "Is it safe/legal to download Instagram Reels?",
    answer:
      "Downloading public Reels for personal offline use is generally safe with a browser-based tool that requires no login. Always respect the original creator's rights and Instagram's terms before reusing content publicly.",
  },
  {
    question: "What is the best Instagram Reel downloader in 2026?",
    answer:
      "The best Instagram Reel downloaders in 2026 include Trndinn, SnapInsta, SSSInstagram, and Indown — ranked on speed, ad load, HD quality, and whether they add a watermark. Trndinn leads on a clean, ad-free, no-login experience.",
  },
  {
    question: "Can I download Instagram Reels on iPhone?",
    answer:
      "Yes. Open the Reel, tap Share > Copy Link, open Trndinn in Safari, paste the link, and tap Download — the HD MP4 saves to your Files or Photos. No app needed.",
  },
  {
    question: "How do I save just the audio from a Reel?",
    answer:
      "Paste the Reel link into Trndinn's Reel-to-MP3 tool to extract the original audio as an MP3 file — useful for saving trending sounds without the video.",
  },
  {
    question: "Do I need an app or account to download Reels?",
    answer:
      "No. Trndinn works entirely in your browser on any device — no app install, no Instagram login, and no account signup required to download public Reels.",
  },
  {
    question: "Why do downloaded Reels sometimes have a watermark?",
    answer:
      "Reels saved with Instagram's in-app option or with clip-first apps carry a watermark. A dedicated downloader like Trndinn fetches the original source file, so the MP4 has no watermark.",
  },
  {
    question: "Can I download private Reels?",
    answer:
      "No. Trndinn only downloads public Reels. Private Reels require the account owner's login and are not accessible to any public downloader tool. Respect creator privacy.",
  },
  {
    question: "How do I download Instagram Reels on Android?",
    answer:
      "Open the Reel in the Instagram app, tap Share > Copy Link, switch to Chrome, open Trndinn's Instagram Reel Downloader, paste the link, and tap Download. The HD MP4 saves to your Downloads folder.",
  },
];

const AUTO_CAPTION_FAQS = [
  {
    question: "How do I add captions to a video for free?",
    answer:
      "Upload your video to the Trndinn Auto Caption Generator, pick a caption style, and click Generate. AI transcribes audio, syncs word-by-word, and returns a captioned MP4. No login, no software install, no signup — free for videos up to 1.5 minutes.",
  },
  {
    question: "What video formats are supported?",
    answer:
      "MP4, MOV, and WebM up to 100 MB and 1.5 minutes. Output is always MP4 (H.264 + AAC) at your original resolution up to 1080p.",
  },
  {
    question: "How accurate are the AI-generated captions?",
    answer:
      "Trndinn uses faster-whisper (24,700+ GitHub stars, 4x faster than OpenAI Whisper) as the primary engine with word-level timestamps and 99+ language auto-detection. Accuracy is 95%+ for clear speech in English.",
  },
  {
    question: "Can I edit the captions before burning them in?",
    answer:
      "Not on the free tier — captions are generated and burned in one pass for speed. Inline transcript editing is available on the paid Creator plan.",
  },
  {
    question: "What caption styles are available?",
    answer:
      "Six presets: Hormozi (bold word-by-word yellow), MrBeast (chunky highlight), Minimal (clean sans-serif), Karaoke (full-line with active word colored), Typewriter (letter-by-letter), and Gradient Pop (bounce with gradient fill).",
  },
  {
    question: "What languages are supported?",
    answer:
      "99+ languages via faster-whisper auto-detect, including English, Hindi, Spanish, Portuguese, French, German, Japanese, Korean, Arabic, and Mandarin Chinese.",
  },
  {
    question: "Are my videos stored?",
    answer:
      "No. Uploads and captioned outputs are auto-deleted after 1 hour. Trndinn never trains AI on user videos and never shares content with third parties.",
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // ─── Reel Downloader Aliases ──────────────────────────────────────────
  const reelAlias = getReelDownloaderAlias(slug);
  if (reelAlias) {
    const meta = await buildMarketingMetadata(`/tools/${reelAlias.slug}`, {
      title: reelAlias.seoTitle,
      description: reelAlias.seoDescription,
      keywords: reelAlias.keywords,
    });
    return {
      ...meta,
      alternates: {
        ...(meta.alternates ?? {}),
        canonical: `/tools/${REEL_DOWNLOADER_PRIMARY_SLUG}`,
      },
    };
  }

  // ─── Auto Caption Aliases ─────────────────────────────────────────────
  const captionAlias = getAutoCaptionAlias(slug);
  if (captionAlias) {
    const meta = await buildMarketingMetadata(`/tools/${captionAlias.slug}`, {
      title: captionAlias.seoTitle,
      description: captionAlias.seoDescription,
      keywords: captionAlias.keywords,
    });
    return {
      ...meta,
      alternates: {
        ...(meta.alternates ?? {}),
        canonical: `/tools/${AUTO_CAPTION_PRIMARY_SLUG}`,
      },
    };
  }

  const tool = getToolBySlug(slug);
  if (!tool) return {};

  // ─── Primary: Instagram Reel Downloader ───────────────────────────────
  if (slug === REEL_DOWNLOADER_PRIMARY_SLUG) {
    return buildMarketingMetadata(`/tools/${REEL_DOWNLOADER_PRIMARY_SLUG}`, {
      // Root layout appends "| Trndinn" via title.template — don't bake it in here or it doubles.
      title: "Instagram Reel Downloader — Free, HD, No Watermark",
      description:
        "Download any public Instagram Reel as an HD MP4 in seconds. Free, no watermark, no login, no app. Paste a link and save. Try Trndinn's Reel downloader.",
      keywords: [
        "instagram reel downloader",
        "instagram reels downloader",
        "download instagram reels",
        "download instagram reel",
        "reel downloader online",
        "instagram video downloader",
        "download reels mp4",
        "instagram reel download hd",
        "save instagram reels",
        "reels downloader",
        "instagram reel downloader no watermark",
        "instagram reel downloader free",
        "instagram reel downloader online",
      ],
    });
  }

  // ─── Primary: Auto Caption Generator ──────────────────────────────────
  if (slug === AUTO_CAPTION_PRIMARY_SLUG) {
    return buildMarketingMetadata(`/tools/${AUTO_CAPTION_PRIMARY_SLUG}`, {
      // Root layout appends "| Trndinn" via title.template — don't bake it in here or it doubles.
      title: "Free Auto Caption Generator — Add Captions to Video",
      description:
        "Add auto-synced captions to any video for free. AI transcribes, syncs word-by-word, and burns styled subtitles onto your Reels, Shorts, and TikToks.",
      keywords: [
        "auto caption generator",
        "auto caption generator for video",
        "add captions to video free",
        "subtitle generator online",
        "auto subtitles for reels",
        "video caption maker",
        "burn subtitles into video",
        "ai subtitle generator",
        "free caption generator",
        "video to text captions",
        "reels caption tool",
        "shorts caption generator",
      ],
    });
  }

  // ─── Generic fallback ─────────────────────────────────────────────────
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
    ...REEL_DOWNLOADER_ALIAS_SLUGS.map((slug) => ({ slug })),
    ...AUTO_CAPTION_ALIAS_SLUGS.map((slug) => ({ slug })),
  ];
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const base = getSiteUrl().replace(/\/$/, "");

  // ─── Instagram Reel Downloader (primary + aliases) ────────────────────
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
          name={alias?.seoTitle.split(" — ")[0] ?? "Trndinn Instagram Reel Downloader"}
          description="Download any public Instagram Reel as an HD MP4 in seconds. Free, no watermark, no login, no app."
          url={`/tools/${REEL_DOWNLOADER_PRIMARY_SLUG}`}
          applicationCategory="MultimediaApplication"
          featureList={[
            "Download Instagram Reels as MP4",
            "Original HD quality (720p/1080p)",
            "No login required",
            "No watermark",
            "Instant download",
            "Works on mobile and desktop",
          ]}
        />
        <HowToSchema
          name="How to Download Instagram Reels Without Watermark"
          description="Download any public Instagram Reel as HD MP4 in 3 steps using Trndinn's free online tool. No login, no watermark, no app install."
          pageUrl={`${base}/tools/${REEL_DOWNLOADER_PRIMARY_SLUG}`}
          totalTime="PT30S"
          steps={[
            {
              name: "Copy the Reel link",
              text: "Open the Instagram app or website, find a public Reel, tap the Share icon, and select Copy Link.",
            },
            {
              name: "Paste it here",
              text: "Come back to Trndinn's Instagram Reel Downloader and paste the URL into the input field above.",
            },
            {
              name: "Tap Download — HD MP4, no watermark",
              text: "Click the Download button. The Reel saves to your device as an HD MP4 file with no watermark.",
            },
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

  // ─── Auto Caption Generator (primary + aliases) ───────────────────────
  if (isAutoCaptionSlug(slug)) {
    const alias = getAutoCaptionAlias(slug);
    const breadcrumbName = alias?.seoTitle.split(" — ")[0] ?? "Auto Caption Generator";
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
          faqs={AUTO_CAPTION_FAQS}
          pageUrl={`${base}/tools/${AUTO_CAPTION_PRIMARY_SLUG}`}
        />
        <WebApplicationSchema
          name={alias?.seoTitle.split(" — ")[0] ?? "Free Auto Caption Generator"}
          description="Add auto-synced captions to any video with AI transcription and 6 trending caption styles. No login required."
          url={`/tools/${AUTO_CAPTION_PRIMARY_SLUG}`}
          applicationCategory="MultimediaApplication"
          featureList={[
            "Auto-synced captions with AI",
            "6 caption styles (Hormozi, MrBeast, Minimal, Karaoke, Typewriter, Gradient Pop)",
            "Word-level timing accuracy",
            "99+ languages supported",
            "No login required",
            "MP4 output with burned-in captions",
            "SRT/VTT subtitle file download",
          ]}
        />
        <AutoCaptionGeneratorView
          faqs={AUTO_CAPTION_FAQS}
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
