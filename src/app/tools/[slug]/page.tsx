import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMarketingMetadata } from "@/lib/serverSeo";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { WebApplicationSchema } from "@/components/seo/WebApplicationSchema";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { getToolBySlug, TOOLS } from "@/lib/tools-data";
import { getSiteUrl } from "@/lib/site";
import { fetchPublishedBlogPosts } from "@/lib/serverBlog";
import InstagramReelDownloaderView from "@/views/tools/InstagramReelDownloaderView";
import AutoCaptionGeneratorView from "@/views/tools/AutoCaptionGeneratorView";
import BioGeneratorView from "@/views/tools/BioGeneratorView";
import ImageConverterView from "@/views/tools/ImageConverterView";
import ImageCompressorView from "@/views/tools/ImageCompressorView";
import ImageResizerView from "@/views/tools/ImageResizerView";
import ImageCropperView from "@/views/tools/ImageCropperView";
import ImageRotatorView from "@/views/tools/ImageRotatorView";
import WatermarkView from "@/views/tools/WatermarkView";
import ImageWorkbenchView from "@/views/tools/ImageWorkbenchView";
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
import {
  BIO_GENERATOR_PRIMARY_SLUG,
  BIO_GENERATOR_ALIAS_SLUGS,
  getBioGeneratorAlias,
  isBioGeneratorSlug,
} from "@/lib/bio-generator-aliases";
import {
  ALL_CONVERSION_SLUGS,
  getConversionTool,
  isConversionSlug,
} from "@/lib/image-converter-data";
import {
  IMAGE_CONVERTER_ALIAS_SLUGS,
  getConverterAlias,
  isConverterAliasSlug,
} from "@/lib/image-converter-aliases";
import {
  ALL_EDIT_SLUGS,
  getEditTool,
  isEditSlug,
} from "@/lib/image-edit-data";
import {
  IMAGE_EDIT_ALIAS_SLUGS,
  getEditAlias,
  isEditAliasSlug,
} from "@/lib/image-edit-aliases";
import {
  ALL_UTILITY_SLUGS,
  getUtilityTool,
  isUtilitySlug,
} from "@/lib/image-utility-data";
import {
  IMAGE_UTILITY_ALIAS_SLUGS,
  getUtilityAlias,
  isUtilityAliasSlug,
} from "@/lib/image-utility-aliases";
import ImageToBase64View from "@/views/tools/ImageToBase64View";
import Base64ToImageView from "@/views/tools/Base64ToImageView";
import FaviconGeneratorView from "@/views/tools/FaviconGeneratorView";
import BackgroundRemoverView from "@/views/tools/BackgroundRemoverView";
import ImageToTextView from "@/views/tools/ImageToTextView";
import QRCodeGeneratorView from "@/views/tools/QRCodeGeneratorView";
import ProfilePicCreatorView from "@/views/tools/ProfilePicCreatorView";
import AudioConverterView from "@/views/tools/AudioConverterView";
import AudioRecorderView from "@/views/tools/AudioRecorderView";
import TextToSpeechView from "@/views/tools/TextToSpeechView";
import SpeechToTextView from "@/views/tools/SpeechToTextView";
import VideoConverterView from "@/views/tools/VideoConverterView";
import VideoRecorderView from "@/views/tools/VideoRecorderView";
import ScreenRecorderView from "@/views/tools/ScreenRecorderView";
import {
  ALL_AUDIO_SLUGS,
  getAudioTool,
  isAudioSlug,
} from "@/lib/audio-data";
import {
  AUDIO_ALIAS_SLUGS,
  getAudioAlias,
  isAudioAliasSlug,
} from "@/lib/audio-aliases";
import {
  ALL_VIDEO_SLUGS,
  getVideoTool,
  isVideoSlug,
} from "@/lib/video-data";
import {
  VIDEO_ALIAS_SLUGS,
  getVideoAlias,
  isVideoAliasSlug,
} from "@/lib/video-aliases";

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
  // Each alias self-canonicalizes (buildMarketingMetadata defaults canonical to
  // the page's own URL). This lets Google index each alias independently for its
  // target keyword cluster while serving the same underlying tool.
  const reelAlias = getReelDownloaderAlias(slug);
  if (reelAlias) {
    return buildMarketingMetadata(`/tools/${reelAlias.slug}`, {
      title: reelAlias.seoTitle,
      description: reelAlias.seoDescription,
      keywords: reelAlias.keywords,
    });
  }

  // ─── Auto Caption Aliases ─────────────────────────────────────────────
  const captionAlias = getAutoCaptionAlias(slug);
  if (captionAlias) {
    return buildMarketingMetadata(`/tools/${captionAlias.slug}`, {
      title: captionAlias.seoTitle,
      description: captionAlias.seoDescription,
      keywords: captionAlias.keywords,
    });
  }

  // ─── Bio Generator Aliases ──────────────────────────────────────────────
  const bioAlias = getBioGeneratorAlias(slug);
  if (bioAlias) {
    return buildMarketingMetadata(`/tools/${bioAlias.slug}`, {
      title: bioAlias.seoTitle,
      description: bioAlias.seoDescription,
      keywords: bioAlias.keywords,
    });
  }

  // ─── Image Converter Aliases ─────────────────────────────────────────────
  const converterAlias = getConverterAlias(slug);
  if (converterAlias) {
    return buildMarketingMetadata(`/tools/${converterAlias.slug}`, {
      title: converterAlias.seoTitle,
      description: converterAlias.seoDescription,
      keywords: converterAlias.keywords,
    });
  }

  // ─── Image Converter primary tools ───────────────────────────────────────
  if (isConversionSlug(slug)) {
    const convTool = getConversionTool(slug)!;
    return buildMarketingMetadata(`/tools/${slug}`, {
      title: convTool.seoTitle,
      description: convTool.seoDescription,
      keywords: [
        convTool.primaryKeyword,
        `${convTool.fromLabel.toLowerCase()} to ${convTool.toLabel.toLowerCase()} converter`,
        `free ${convTool.fromLabel.toLowerCase()} to ${convTool.toLabel.toLowerCase()} converter`,
        `convert ${convTool.fromLabel.toLowerCase()} to ${convTool.toLabel.toLowerCase()}`,
        "free image converter",
        "online image converter",
      ],
    });
  }

  // ─── Image Edit Aliases ───────────────────────────────────────────────────
  const editAlias = getEditAlias(slug);
  if (editAlias) {
    return buildMarketingMetadata(`/tools/${editAlias.slug}`, {
      title: editAlias.seoTitle,
      description: editAlias.seoDescription,
      keywords: editAlias.keywords,
    });
  }

  // ─── Image Edit primary tools ─────────────────────────────────────────────
  if (isEditSlug(slug)) {
    const editTool = getEditTool(slug)!;
    return buildMarketingMetadata(`/tools/${slug}`, {
      title: editTool.seoTitle,
      description: editTool.seoDescription,
      keywords: [
        editTool.primaryKeyword,
        `free ${editTool.name.toLowerCase()} online`,
        `${editTool.name.toLowerCase()} no signup`,
        "free image editor online",
        "browser-based image editor",
      ],
    });
  }

  // ─── Image Utility Aliases ────────────────────────────────────────────────
  const utilityAlias = getUtilityAlias(slug);
  if (utilityAlias) {
    return buildMarketingMetadata(`/tools/${utilityAlias.slug}`, {
      title: utilityAlias.seoTitle,
      description: utilityAlias.seoDescription,
      keywords: utilityAlias.keywords,
    });
  }

  // ─── Image Utility primary tools ─────────────────────────────────────────
  if (isUtilitySlug(slug)) {
    const utilityTool = getUtilityTool(slug)!;
    return buildMarketingMetadata(`/tools/${slug}`, {
      title: utilityTool.seoTitle,
      description: utilityTool.seoDescription,
      keywords: [
        utilityTool.primaryKeyword,
        `free ${utilityTool.primaryKeyword} online`,
        `${utilityTool.primaryKeyword} no signup`,
        "free image utility tool",
        "browser-based image tool",
      ],
    });
  }

  // ─── Audio Aliases ────────────────────────────────────────────────────────
  const audioAlias = getAudioAlias(slug);
  if (audioAlias) {
    return buildMarketingMetadata(`/tools/${audioAlias.slug}`, {
      title: audioAlias.seoTitle,
      description: audioAlias.seoDescription,
      keywords: audioAlias.keywords,
    });
  }

  // ─── Audio primary tools ──────────────────────────────────────────────────
  if (isAudioSlug(slug)) {
    const audioTool = getAudioTool(slug)!;
    return buildMarketingMetadata(`/tools/${slug}`, {
      title: audioTool.seoTitle,
      description: audioTool.seoDescription,
      keywords: [
        audioTool.primaryKeyword,
        `free ${audioTool.name.toLowerCase()} online`,
        `${audioTool.name.toLowerCase()} no signup`,
        "free audio tool online",
        "browser-based audio tool",
      ],
    });
  }

  // ─── Video Aliases ────────────────────────────────────────────────────────
  const videoAlias = getVideoAlias(slug);
  if (videoAlias) {
    return buildMarketingMetadata(`/tools/${videoAlias.slug}`, {
      title: videoAlias.seoTitle,
      description: videoAlias.seoDescription,
      keywords: videoAlias.keywords,
    });
  }

  // ─── Video primary tools ──────────────────────────────────────────────────
  if (isVideoSlug(slug)) {
    const videoTool = getVideoTool(slug)!;
    return buildMarketingMetadata(`/tools/${slug}`, {
      title: videoTool.seoTitle,
      description: videoTool.seoDescription,
      keywords: [
        videoTool.primaryKeyword,
        `free ${videoTool.name.toLowerCase()} online`,
        `${videoTool.name.toLowerCase()} no signup`,
        "free video tool online",
        "browser-based video tool",
      ],
    });
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

  // ─── Primary: Social Media Bio Generator (per SEO expert PDF Section 7) ──
  // Title: 56 chars (fits ≤60 with " | Trndinn" append)
  // Description: 154 chars (fits ≤155)
  // Primary keywords: social media bio generator / instagram bio generator
  if (slug === BIO_GENERATOR_PRIMARY_SLUG) {
    return buildMarketingMetadata(`/tools/${BIO_GENERATOR_PRIMARY_SLUG}`, {
      title: "Free AI Social Media Bio Generator — No Signup",
      description:
        "Generate on-brand bios in seconds for Instagram, TikTok, X & LinkedIn. Free AI bio generator with live character counts, tones & emojis. No signup.",
      keywords: [
        "social media bio generator",
        "instagram bio generator",
        "ai bio generator",
        "free bio generator",
        "tiktok bio generator",
        "linkedin bio generator",
        "twitter bio generator",
        "ai caption generator",
        "instagram caption generator",
        "social media caption generator",
        "aesthetic bio generator",
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
    ...BIO_GENERATOR_ALIAS_SLUGS.map((slug) => ({ slug })),
    ...ALL_CONVERSION_SLUGS.map((slug) => ({ slug })),
    ...IMAGE_CONVERTER_ALIAS_SLUGS.map((slug) => ({ slug })),
    ...ALL_EDIT_SLUGS.map((slug) => ({ slug })),
    ...IMAGE_EDIT_ALIAS_SLUGS.map((slug) => ({ slug })),
    ...ALL_UTILITY_SLUGS.map((slug) => ({ slug })),
    ...IMAGE_UTILITY_ALIAS_SLUGS.map((slug) => ({ slug })),
    ...ALL_AUDIO_SLUGS.map((slug) => ({ slug })),
    ...AUDIO_ALIAS_SLUGS.map((slug) => ({ slug })),
    ...ALL_VIDEO_SLUGS.map((slug) => ({ slug })),
    ...VIDEO_ALIAS_SLUGS.map((slug) => ({ slug })),
  ];
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const base = getSiteUrl().replace(/\/$/, "");

  // ─── Instagram Reel Downloader (primary + aliases) ────────────────────
  if (isReelDownloaderSlug(slug)) {
    const alias = getReelDownloaderAlias(slug);
    const breadcrumbName = alias?.seoTitle.split(" — ")[0] ?? "Instagram Reel Downloader";

    // Fetch related blog posts tagged "instagram-reels" for the blog section
    const { posts: rawBlogPosts } = await fetchPublishedBlogPosts({
      tag: "instagram-reels",
      limit: 3,
    });
    const blogPosts = rawBlogPosts.map((p) => ({
      id: String(p.id ?? ""),
      path: String(p.path ?? ""),
      title: String(p.title ?? ""),
      excerpt: (p.excerpt as string) ?? undefined,
      featured_image_url: (p.featured_image_url as string) ?? undefined,
      featured_image_object_position: (p.featured_image_object_position as string) ?? undefined,
      published_at: (p.published_at as string) ?? undefined,
      reading_minutes: (p.reading_minutes as number) ?? undefined,
    }));

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
          blogPosts={blogPosts}
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

    const { posts: rawBlogPosts } = await fetchPublishedBlogPosts({ tag: "captions", limit: 3 });
    const blogPosts = rawBlogPosts.map((p) => ({
      id: String(p.id ?? ""),
      path: String(p.path ?? ""),
      title: String(p.title ?? ""),
      excerpt: String(p.excerpt ?? ""),
      featured_image_url: p.featured_image_url ? String(p.featured_image_url) : undefined,
      published_at: p.published_at ? String(p.published_at) : undefined,
      reading_minutes: typeof p.reading_minutes === "number" ? p.reading_minutes : undefined,
    }));

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
          blogPosts={blogPosts}
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

  // ─── Bio Generator (primary + aliases) ─────────────────────────────────
  if (isBioGeneratorSlug(slug)) {
    const alias = getBioGeneratorAlias(slug);
    const breadcrumbName = alias?.seoTitle.split(" — ")[0] ?? "AI Bio Generator";

    // ─── FAQs — AEO-optimized per PDF Section 8 ─────────────────────────
    // Each answer is ≤40 words, direct, and snippet-ready for featured snippets,
    // People-Also-Ask boxes, and voice answers. First sentence answers the
    // question directly (LLMs extract these verbatim).
    const BIO_GENERATOR_FAQS = [
      {
        question: "What is an AI bio generator?",
        answer:
          "An AI bio generator uses a language model to turn a few details — your niche, tone, and a call to action — into ready-to-use profile bios that fit each platform's character limit.",
      },
      {
        question: "How do I write a good Instagram bio?",
        answer:
          "1) Say who you are and who you help. 2) Add one proof point or personality line. 3) Include a clear call to action. 4) Keep it under 150 characters. Trndinn's bio generator does all four in one click.",
      },
      {
        question: "Is Trndinn's bio generator free?",
        answer:
          "Yes. Trndinn's AI bio generator is free with no signup, and it produces on-brand variations that already fit each platform's character limit.",
      },
      {
        question: "What is the best free AI bio generator in 2026?",
        answer:
          "The best free AI bio generators in 2026 include Trndinn, Ahrefs, Pallyy, and Copy.ai — ranked on tone control, platform character limits, output quality, and whether they require signup. Trndinn leads on platform-aware limits and no signup.",
      },
      {
        question: "How many characters can an Instagram bio be?",
        answer:
          "An Instagram bio can be up to 150 characters. TikTok allows 80, X (Twitter) allows 160, and LinkedIn's headline allows 220 — Trndinn's generator auto-fits your bio to each limit.",
      },
      {
        question: "Can AI write captions for Instagram and TikTok?",
        answer:
          "Yes. AI caption generators create platform-appropriate captions from a topic, photo description, or tone. Trndinn generates multiple caption options with hashtags and emojis tuned to each platform.",
      },
      {
        question: "Do I need to sign up to use a bio generator?",
        answer:
          "Not with Trndinn. Many bio tools gate output behind an email signup, but Trndinn generates and lets you copy bios instantly with no account required.",
      },
      {
        question: "What tone should my bio be?",
        answer:
          "Match your tone to your audience: professional for LinkedIn, witty or aesthetic for Instagram, punchy for TikTok. Trndinn lets you pick a tone and instantly re-generate the bio in that voice.",
      },
      {
        question: "Which platforms does the bio generator support?",
        answer:
          "LinkedIn (2,600 chars), Instagram (150), X/Twitter (160), TikTok (80), GitHub (160), YouTube (1,000), and a general-purpose format (300). Generate for all of them in a single run.",
      },
      {
        question: "How does Trndinn's bio scoring work?",
        answer:
          "Each bio is scored 0-100 across five dimensions: hook, clarity, platform fit, impact, and originality. The tool also returns three specific rewrite suggestions so you can improve the draft on the spot.",
      },
    ];

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
          faqs={BIO_GENERATOR_FAQS}
          pageUrl={`${base}/tools/${slug}`}
        />
        <WebApplicationSchema
          name={alias?.seoTitle.split(" — ")[0] ?? "Free AI Social Media Bio Generator"}
          description="Free AI bio generator for Instagram, TikTok, X, LinkedIn, GitHub, and YouTube. Platform-aware character limits, tones, emojis. No signup."
          url={`/tools/${slug}`}
          applicationCategory="BusinessApplication"
          featureList={[
            "AI bio generation for Instagram, TikTok, X, LinkedIn, GitHub, YouTube",
            "3 variations per platform (credibility, outcome, positioning)",
            "Live character counter for every platform limit",
            "12 tone options — professional, witty, aesthetic, and more",
            "Emoji layouts tuned per platform",
            "Anti-buzzword linter (removes 'passionate about', 'results-driven')",
            "Per-bio 0-100 scoring across 5 dimensions",
            "LinkedIn recruiter-keyword highlighting",
            "No signup, no watermark, no daily limit",
          ]}
        />
        <HowToSchema
          name="How to write a social media bio with AI"
          description="Generate on-brand bios for Instagram, TikTok, X, LinkedIn, GitHub, and YouTube in three steps using Trndinn's free AI bio generator. No signup, no watermark."
          pageUrl={`${base}/tools/${slug}`}
          totalTime="PT30S"
          steps={[
            {
              name: "Describe yourself",
              text: "Type your role, one win, and who reads your bio. Add optional facts, goals, and audience for a sharper result.",
            },
            {
              name: "Pick platforms and tone",
              text: "Select the platforms you need — Instagram, TikTok, X, LinkedIn, GitHub, or YouTube — and choose a tone (professional, witty, aesthetic, etc.).",
            },
            {
              name: "Copy your bio",
              text: "AI generates three variations per platform, each already inside the platform's character limit. Copy the one you love and paste it into your profile.",
            },
          ]}
        />
        <BioGeneratorView
          faqs={BIO_GENERATOR_FAQS}
          defaultPlatform={alias?.platformHint}
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

  // ─── Image Converter (primary + aliases) ─────────────────────────────────
  if (isConversionSlug(slug) || isConverterAliasSlug(slug)) {
    const alias = getConverterAlias(slug);
    const canonicalSlug = alias ? alias.canonical : slug;
    const convTool = getConversionTool(canonicalSlug);
    if (!convTool) notFound();
    const breadcrumbName = alias
      ? alias.seoTitle.split(" — ")[0]
      : convTool.h1;

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
          faqs={convTool.faqs}
          pageUrl={`${base}/tools/${canonicalSlug}`}
        />
        <WebApplicationSchema
          name={alias ? alias.seoTitle.split(" — ")[0] : convTool.h1}
          description={convTool.seoDescription}
          url={`/tools/${canonicalSlug}`}
          applicationCategory="MultimediaApplication"
          featureList={[
            `Convert ${convTool.fromLabel} to ${convTool.toLabel} online`,
            "Browser-based — images never uploaded to any server",
            "Batch conversion — multiple files at once",
            "Quality slider for lossy formats",
            "No signup, no watermark, no usage limits",
            "Works on desktop and mobile",
          ]}
        />
        <HowToSchema
          name={`How to convert ${convTool.fromLabel} to ${convTool.toLabel} free`}
          description={`Convert ${convTool.fromLabel} to ${convTool.toLabel} in 3 steps using Trndinn's free online converter. No signup, no watermark, no server uploads.`}
          pageUrl={`${base}/tools/${canonicalSlug}`}
          totalTime="PT30S"
          steps={[
            {
              name: `Upload your ${convTool.fromLabel} file`,
              text: `Click or drag and drop your ${convTool.fromLabel} file into the upload area. Multiple files are supported for batch conversion.`,
            },
            {
              name: "Convert",
              text: `Click "Convert to ${convTool.toLabel}". The conversion runs entirely in your browser — no files are uploaded to any server.`,
            },
            {
              name: `Download your ${convTool.toLabel}`,
              text: `Click Download to save your converted ${convTool.toLabel} file. Batch results can be downloaded individually.`,
            },
          ]}
        />
        <ImageConverterView
          tool={convTool}
          alias={alias}
          faqs={convTool.faqs}
        />
      </>
    );
  }

  // ─── Image Edit tools (primary + aliases) ────────────────────────────────
  if (isEditSlug(slug) || isEditAliasSlug(slug)) {
    const alias = getEditAlias(slug);
    const canonicalSlug = alias ? alias.canonical : slug;
    const editTool = getEditTool(canonicalSlug);
    if (!editTool) notFound();
    const breadcrumbName = alias
      ? alias.seoTitle.split(" — ")[0]
      : editTool.h1;

    const isCompressor = ["compress-jpg", "compress-png", "compress-webp", "compress-gif"].includes(canonicalSlug);

    const howToStepsCompressor = [
      {
        name: `Upload your image`,
        text: `Click or drag and drop your image into the upload area above.`,
      },
      {
        name: "Adjust the quality slider",
        text: "Set the quality percentage — 80% is the default sweet spot for 50%+ size reduction with no visible quality loss.",
      },
      {
        name: "Download your compressed image",
        text: "Click Compress Image, then Download. Your compressed file is ready instantly — no server upload, no watermark.",
      },
    ];

    const howToStepsResize = [
      {
        name: "Upload your image",
        text: "Click or drag and drop your image into the upload area above.",
      },
      {
        name: "Choose a platform preset or enter custom dimensions",
        text: "Pick a one-click preset for LinkedIn, Instagram, Twitter, YouTube, or Facebook — or enter exact pixel dimensions manually.",
      },
      {
        name: "Download your resized image",
        text: "Click Resize Image, then Download. Your resized image is ready instantly — all in your browser.",
      },
    ];

    const howToStepsGeneric = [
      {
        name: "Upload your image",
        text: "Click or drag and drop your image into the upload area above.",
      },
      {
        name: "Configure settings",
        text: `Adjust the settings for your ${editTool.name.toLowerCase()} operation.`,
      },
      {
        name: "Download your result",
        text: "Click the action button and download your processed image instantly — all browser-based, no upload.",
      },
    ];

    const howToSteps = isCompressor
      ? howToStepsCompressor
      : canonicalSlug === "image-resizer"
      ? howToStepsResize
      : howToStepsGeneric;

    const webAppFeatures = isCompressor
      ? [
          "Quality slider for precise compression control",
          "Browser-based — images never uploaded to any server",
          "Batch compression — multiple files at once",
          "Before/after file size comparison",
          "No signup, no watermark, no usage limits",
          "Works on desktop and mobile",
        ]
      : canonicalSlug === "image-resizer"
      ? [
          "Platform presets for LinkedIn, Instagram, Twitter, YouTube, Facebook",
          "Custom pixel dimension input",
          "Aspect ratio lock / unlock",
          "Browser-based — images never uploaded",
          "No signup, no watermark, no limits",
          "Works on desktop and mobile",
        ]
      : canonicalSlug === "image-cropper"
      ? [
          "Pixel-precise X/Y offset and dimension controls",
          "Browser-based — images never uploaded",
          "No signup, no watermark, no limits",
          "Works on desktop and mobile",
        ]
      : canonicalSlug === "image-rotator"
      ? [
          "Rotate 90°, 180°, 270°, −90°",
          "Flip horizontal and vertical",
          "Browser-based — images never uploaded",
          "No signup, no watermark, no limits",
        ]
      : canonicalSlug === "watermark-image"
      ? [
          "Text watermark with font size, color, opacity",
          "Image/logo watermark with opacity control",
          "9 position presets",
          "Browser-based — images never uploaded",
          "No signup, no watermark on output",
        ]
      : [
          "Multi-op pipeline: Resize, Crop, Rotate, Compress, Convert",
          "Chain unlimited operations in one pass",
          "Browser-based — images never uploaded",
          "No signup, no watermark, no limits",
        ];

    const ViewComponent =
      isCompressor
        ? ImageCompressorView
        : canonicalSlug === "image-resizer"
        ? ImageResizerView
        : canonicalSlug === "image-cropper"
        ? ImageCropperView
        : canonicalSlug === "image-rotator"
        ? ImageRotatorView
        : canonicalSlug === "watermark-image"
        ? WatermarkView
        : ImageWorkbenchView;

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
          faqs={editTool.faqs}
          pageUrl={`${base}/tools/${canonicalSlug}`}
        />
        <WebApplicationSchema
          name={alias ? alias.seoTitle.split(" — ")[0] : editTool.h1}
          description={editTool.seoDescription}
          url={`/tools/${canonicalSlug}`}
          applicationCategory="MultimediaApplication"
          featureList={webAppFeatures}
        />
        <HowToSchema
          name={`How to use the ${editTool.name}`}
          description={editTool.description}
          pageUrl={`${base}/tools/${canonicalSlug}`}
          totalTime="PT30S"
          steps={howToSteps}
        />
        <ViewComponent tool={editTool} alias={alias} />
      </>
    );
  }

  // ─── Image Utility tools (primary + aliases) ─────────────────────────────
  if (isUtilitySlug(slug) || isUtilityAliasSlug(slug)) {
    const alias = getUtilityAlias(slug);
    const canonicalSlug = alias ? alias.canonical : slug;
    const utilityTool = getUtilityTool(canonicalSlug);
    if (!utilityTool) notFound();
    const breadcrumbName = alias
      ? alias.seoTitle.split(" — ")[0]
      : utilityTool.h1;

    // Generative tools (no file upload) use different HowTo steps
    const isGenerative = ["qr-code-generator", "profile-pic-creator"].includes(canonicalSlug);

    const howToStepsUpload = [
      {
        name: "Upload your image",
        text: "Click or drag and drop your image into the upload area above.",
      },
      {
        name: "Process",
        text: `The tool runs entirely in your browser — no server upload, no signup required.`,
      },
      {
        name: "Download your result",
        text: "Click Download to save the output to your device instantly.",
      },
    ];

    const howToStepsQR = [
      {
        name: "Enter your content",
        text: "Type or paste the URL, text, phone number, or contact info you want to encode.",
      },
      {
        name: "Customize",
        text: "Choose foreground and background colors, error correction level (L/M/Q/H), and margin.",
      },
      {
        name: "Download PNG or SVG",
        text: "Click Download PNG for raster output or Download SVG for a scalable vector — no watermark, no branding.",
      },
    ];

    const howToStepsProfilePic = [
      {
        name: "Pick an emoji",
        text: "Choose any emoji from the grid as the centerpiece of your profile picture.",
      },
      {
        name: "Customize style",
        text: "Select background color, circle or square shape, output size (64–512px), and emoji rotation.",
      },
      {
        name: "Download PNG",
        text: "Click Download to save a clean PNG — no watermark, no account needed.",
      },
    ];

    const howToSteps =
      canonicalSlug === "qr-code-generator"
        ? howToStepsQR
        : canonicalSlug === "profile-pic-creator"
        ? howToStepsProfilePic
        : howToStepsUpload;

    const webAppFeatures: Record<string, string[]> = {
      "image-to-base64": [
        "Encode PNG, JPG, WebP, GIF, SVG to Base64 data URI",
        "Copy to clipboard or download as .txt",
        "Browser-based — image never uploaded to any server",
        "No signup, no file size limit",
      ],
      "base64-to-image": [
        "Paste any Base64 data URI and preview the decoded image",
        "Download as PNG or JPG with one click",
        "Browser-based — no server upload",
        "No signup, no daily limit",
      ],
      "favicon-generator": [
        "favicon.ico (16/32/48px multi-size)",
        "apple-touch-icon.png (180px)",
        "android-chrome-192x192.png and android-chrome-512x512.png",
        "site.webmanifest — ready to deploy",
        "ZIP download, browser-based Canvas API",
        "No signup, no upload to server",
      ],
      "background-remover": [
        "AI background removal via ONNX WebAssembly",
        "Zero server upload — model runs locally",
        "Full-resolution transparent PNG output",
        "No credits, no watermark, no signup",
        "Model cached after first download (~43 MB)",
      ],
      "image-to-text": [
        "OCR via Tesseract.js WebAssembly — runs locally",
        "Supports 8 languages: English, Spanish, French, German, Chinese, Japanese, Hindi, Arabic",
        "Download extracted text as .txt",
        "No server upload, no email required",
        "Works on photos, screenshots, scanned documents",
      ],
      "qr-code-generator": [
        "Custom foreground and background colors",
        "Error correction levels: L, M, Q, H",
        "Margin control",
        "Download as PNG or scalable SVG",
        "No watermark, no branding, browser-local generation",
        "No signup",
      ],
      "profile-pic-creator": [
        "80+ emoji choices",
        "Custom background color",
        "Circle or square shape",
        "Output sizes from 64px to 512px",
        "Emoji rotation control",
        "Clean PNG download — no watermark",
      ],
    };

    const features = webAppFeatures[canonicalSlug] ?? [
      "Browser-based — files never uploaded to any server",
      "No signup, no watermark, no daily limit",
      "Works on desktop and mobile",
    ];

    const ViewComponent =
      canonicalSlug === "image-to-base64"
        ? ImageToBase64View
        : canonicalSlug === "base64-to-image"
        ? Base64ToImageView
        : canonicalSlug === "favicon-generator"
        ? FaviconGeneratorView
        : canonicalSlug === "background-remover"
        ? BackgroundRemoverView
        : canonicalSlug === "image-to-text"
        ? ImageToTextView
        : canonicalSlug === "qr-code-generator"
        ? QRCodeGeneratorView
        : ProfilePicCreatorView;

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
          faqs={utilityTool.faqs}
          pageUrl={`${base}/tools/${canonicalSlug}`}
        />
        <WebApplicationSchema
          name={alias ? alias.seoTitle.split(" — ")[0] : utilityTool.h1}
          description={utilityTool.seoDescription}
          url={`/tools/${canonicalSlug}`}
          applicationCategory="UtilitiesApplication"
          featureList={features}
        />
        <HowToSchema
          name={`How to use ${utilityTool.name}`}
          description={utilityTool.description}
          pageUrl={`${base}/tools/${canonicalSlug}`}
          totalTime={isGenerative ? "PT15S" : "PT30S"}
          steps={howToSteps}
        />
        <ViewComponent tool={utilityTool} alias={alias} />
      </>
    );
  }

  // ─── Audio tools (primary + aliases) ────────────────────────────────────
  if (isAudioSlug(slug) || isAudioAliasSlug(slug)) {
    const alias = getAudioAlias(slug);
    const canonicalSlug = alias ? alias.canonical : slug;
    const audioTool = getAudioTool(canonicalSlug);
    if (!audioTool) notFound();
    const breadcrumbName = alias ? alias.seoTitle.split(" — ")[0] : audioTool.h1;

    // FFmpeg-WASM tools (audio-converter) use upload-based HowTo steps.
    // Native-API tools (recorder, TTS, STT) use generative/live steps.
    const isFFmpeg = audioTool.processingEngine === "ffmpeg-wasm";
    const isTTS = canonicalSlug === "text-to-speech";
    const isSTT = canonicalSlug === "speech-to-text";

    const howToSteps = isFFmpeg
      ? [
          {
            name: "Upload your audio file",
            text: "Click or drag and drop your audio file into the upload area. Supported formats: MP3, WAV, FLAC, AAC, OGG, M4A.",
          },
          {
            name: "Choose output format",
            text: "Select the target audio format from the dropdown — MP3, WAV, FLAC, AAC, OGG, or M4A.",
          },
          {
            name: "Click Convert — processing happens in your browser",
            text: "Click Convert. FFmpeg WASM runs entirely in your browser — your audio is never uploaded to any server. Download the result instantly.",
          },
        ]
      : isTTS
      ? [
          {
            name: "Type or paste your text",
            text: "Enter up to 5,000 characters of text in the input area.",
          },
          {
            name: "Choose a voice, speed, and pitch",
            text: "Select from available system voices and adjust the rate and pitch sliders to your preference.",
          },
          {
            name: "Press Play",
            text: "Click Play to hear the text read aloud by your browser's built-in speech synthesis. No signup, no watermark.",
          },
        ]
      : isSTT
      ? [
          {
            name: "Select your language",
            text: "Choose one of the 8 supported languages from the dropdown before starting.",
          },
          {
            name: "Click Start and speak",
            text: "Click Start Listening and speak into your microphone. A live transcript appears as you speak.",
          },
          {
            name: "Copy or download your transcript",
            text: "Click Copy to copy the transcript to your clipboard, or Download to save it as a .txt file.",
          },
        ]
      : [
          {
            name: "Click Start Recording",
            text: "Click the Start Recording button and allow microphone access when prompted by your browser.",
          },
          {
            name: "Record your audio",
            text: "Speak or record any sound. A live timer shows your recording duration. Everything is captured locally in your browser.",
          },
          {
            name: "Stop and download",
            text: "Click Stop, preview your recording, then click Download to save it as a WEBM file.",
          },
        ];

    const webAppFeatures = isFFmpeg
      ? [
          "Convert between MP3, WAV, FLAC, AAC, OGG, and M4A",
          "Browser-based FFmpeg WASM — audio never uploaded to any server",
          "No file size limit — practical ceiling is device RAM",
          "No signup, no watermark, no daily limit",
          "Works on desktop and mobile",
        ]
      : isTTS
      ? [
          "Browser Web Speech API — no server processing",
          "Multiple system voices — adjustable speed and pitch",
          "Up to 5,000 characters per session",
          "No signup, no watermark, no daily limit",
          "Works in Chrome, Edge, Firefox, and Safari",
        ]
      : isSTT
      ? [
          "Live speech-to-text via browser SpeechRecognition API",
          "8 languages: English, Spanish, French, German, Portuguese, Italian, Japanese, Chinese",
          "Copy transcript or download as .txt",
          "No signup, no file upload, no daily limit",
          "Works in Chrome and Edge",
        ]
      : [
          "Browser MediaRecorder API — audio never uploaded to any server",
          "Live preview and instant download as WEBM",
          "No app to install, no signup required",
          "Works on desktop and mobile (Chrome, Firefox, Safari)",
          "No recording time limit",
        ];

    const ViewComponent =
      canonicalSlug === "audio-converter"
        ? AudioConverterView
        : canonicalSlug === "audio-recorder"
        ? AudioRecorderView
        : canonicalSlug === "text-to-speech"
        ? TextToSpeechView
        : SpeechToTextView;

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
          faqs={audioTool.faqs}
          pageUrl={`${base}/tools/${canonicalSlug}`}
        />
        <WebApplicationSchema
          name={alias ? alias.seoTitle.split(" — ")[0] : audioTool.h1}
          description={audioTool.seoDescription}
          url={`/tools/${canonicalSlug}`}
          applicationCategory="MultimediaApplication"
          featureList={webAppFeatures}
        />
        <HowToSchema
          name={`How to use the ${audioTool.name}`}
          description={audioTool.description}
          pageUrl={`${base}/tools/${canonicalSlug}`}
          totalTime="PT30S"
          steps={howToSteps}
        />
        <ViewComponent tool={audioTool} alias={alias} />
      </>
    );
  }

  // ─── Video tools (primary + aliases) ────────────────────────────────────
  if (isVideoSlug(slug) || isVideoAliasSlug(slug)) {
    const alias = getVideoAlias(slug);
    const canonicalSlug = alias ? alias.canonical : slug;
    const videoTool = getVideoTool(canonicalSlug);
    if (!videoTool) notFound();
    const breadcrumbName = alias ? alias.seoTitle.split(" — ")[0] : videoTool.h1;

    const isFFmpeg = videoTool.processingEngine === "ffmpeg-wasm";
    const isWebcam = canonicalSlug === "video-recorder";

    const howToSteps = isFFmpeg
      ? [
          {
            name: "Upload your video file",
            text: "Click or drag and drop your video file into the upload area. Supported formats: MP4, MOV, AVI, MKV, WEBM.",
          },
          {
            name: "Choose output format",
            text: "Select the target video format from the dropdown — MP4, MOV, AVI, MKV, or WEBM.",
          },
          {
            name: "Click Convert — processing happens in your browser",
            text: "Click Convert. FFmpeg WASM runs entirely in your browser — your video is never uploaded to any server. Download the result when complete.",
          },
        ]
      : isWebcam
      ? [
          {
            name: "Click Start Recording",
            text: "Click Start Recording and allow camera and microphone access when prompted by your browser.",
          },
          {
            name: "Record your video",
            text: "Your webcam feed appears as a live preview. A timer shows your recording duration. Everything is captured locally.",
          },
          {
            name: "Stop and download",
            text: "Click Stop, preview your recording, then click Download to save it as a WEBM file.",
          },
        ]
      : [
          {
            name: "Click Start Recording",
            text: "Click Start Recording. Your browser will show a native screen picker — select a tab, window, or your entire monitor.",
          },
          {
            name: "Record your screen",
            text: "The screen recording starts immediately. A timer shows your recording duration. No software or extension is needed.",
          },
          {
            name: "Stop and download",
            text: "Click Stop Recording, preview your capture, then click Download to save it as a WEBM file.",
          },
        ];

    const webAppFeatures = isFFmpeg
      ? [
          "Convert between MP4, MOV, AVI, MKV, and WEBM",
          "Browser-based FFmpeg WASM — video never uploaded to any server",
          "No hard file size limit — practical ceiling is device RAM",
          "No signup, no watermark, no daily limit",
          "Works on desktop (Chrome, Edge, Firefox)",
        ]
      : isWebcam
      ? [
          "Browser MediaRecorder API — video never uploaded to any server",
          "Live webcam preview while recording",
          "Audio + video capture (or video-only if mic denied)",
          "No app to install, no signup required",
          "No recording time limit",
        ]
      : [
          "Browser getDisplayMedia API — no extension or app required",
          "Choose any tab, window, or full monitor to capture",
          "Works in Chrome 72+ and Edge 79+",
          "No signup, no watermark, no time limit",
          "Download recording as WEBM",
        ];

    const ViewComponent =
      canonicalSlug === "video-converter"
        ? VideoConverterView
        : canonicalSlug === "video-recorder"
        ? VideoRecorderView
        : ScreenRecorderView;

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
          faqs={videoTool.faqs}
          pageUrl={`${base}/tools/${canonicalSlug}`}
        />
        <WebApplicationSchema
          name={alias ? alias.seoTitle.split(" — ")[0] : videoTool.h1}
          description={videoTool.seoDescription}
          url={`/tools/${canonicalSlug}`}
          applicationCategory="MultimediaApplication"
          featureList={webAppFeatures}
        />
        <HowToSchema
          name={`How to use the ${videoTool.name}`}
          description={videoTool.description}
          pageUrl={`${base}/tools/${canonicalSlug}`}
          totalTime="PT30S"
          steps={howToSteps}
        />
        <ViewComponent tool={videoTool} alias={alias} />
      </>
    );
  }

  const tool = getToolBySlug(slug);
  if (!tool || !tool.live) notFound();

  // Generic tool placeholder for future tools
  notFound();
}
