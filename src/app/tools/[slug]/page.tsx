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

  const tool = getToolBySlug(slug);
  if (!tool || !tool.live) notFound();

  // Generic tool placeholder for future tools
  notFound();
}
