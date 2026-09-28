/**
 * Video competitor dataset — single source of truth for
 * /alternatives/{slug} and /compare/trndinn-vs-{slug} pages.
 *
 * 5 competitors: convertio (video), veed (screen/video), loom (screen),
 * cloudconvert (video), freeconvert (video).
 *
 * Same shape as audio-competitors.ts / image-converter-competitors.ts.
 */

export type VideoCompetitorPricingPlan = {
  name: string;
  price: string;
  note?: string;
};

export type VideoCompetitorComparisonRow = {
  feature: string;
  competitor: string;
  trndinn: string;
};

export type VideoCompetitorFaq = {
  question: string;
  answer: string;
};

export type VideoCompetitorWedgePoint = {
  title: string;
  description: string;
};

export type VideoCompetitor = {
  slug: string;
  name: string;
  url: string;
  targetKeyword: string;
  keywordDifficulty: number;
  monthlyVolume: number;
  tagline: string;
  overview: string;
  positioning: string[];
  pricingPlans: VideoCompetitorPricingPlan[];
  pricingNotes: string[];
  weaknesses: string[];
  wedgeSummary: string;
  wedgePoints: VideoCompetitorWedgePoint[];
  comparisonRows: VideoCompetitorComparisonRow[];
  faqs: VideoCompetitorFaq[];
  switchAngle: string;
};

export const VIDEO_COMPETITORS: readonly VideoCompetitor[] = [
  // ─────────────────────────── Convertio ───────────────────────────
  {
    slug: "convertio",
    name: "Convertio",
    url: "https://convertio.co",
    targetKeyword: "convertio video converter",
    monthlyVolume: 2200000,
    keywordDifficulty: 72,
    tagline:
      "Popular cloud-based converter with video support — but uploads files to remote servers and limits free conversions to 25 per day.",
    overview:
      "Convertio is a cloud-based file converter supporting 300+ format combinations including MP4, MOV, AVI, and MKV. Video files are uploaded to Convertio's servers for processing with daily limits on the free tier.",
    positioning: [
      "Convertio is one of the most recognised online conversion brands. Its video converter handles MP4, MOV, AVI, MKV, WEBM, and many more through a simple upload interface with optional quality settings.",
      "The trade-off: all processing happens on Convertio's remote servers. Files are uploaded, converted, and stored temporarily. The free tier limits users to 25 conversions per day and 100 MB per file — a significant constraint for video files.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "100 MB limit, 25 conversions/day, cloud processing" },
      { name: "Light", price: "$9.99/mo", note: "500 MB limit, 25 conversions/day" },
      { name: "Premium", price: "$14.99/mo", note: "1 GB limit, unlimited conversions" },
    ],
    pricingNotes: [
      "Free tier caps at 100 MB per video file — severely limiting for video",
      "Free tier limited to 25 conversions per day",
      "All video files uploaded to Convertio's servers",
    ],
    weaknesses: [
      "100 MB free tier limit is too small for most video files",
      "Video files uploaded to remote servers — privacy risk",
      "Free tier limited to 25 conversions per day",
      "Network upload time for large video files adds significant delay",
      "No screen recorder or webcam recorder",
    ],
    wedgeSummary:
      "Trndinn converts video entirely in your browser using FFmpeg WASM — zero uploads, no 100 MB cap, unlimited conversions, instant local processing.",
    wedgePoints: [
      {
        title: "No 100 MB cap — convert any size video",
        description:
          "Convertio's free tier limits video files to 100 MB — far too small for most recordings. Trndinn's FFmpeg WASM processes videos limited only by your device RAM, handling files of several gigabytes.",
      },
      {
        title: "Zero uploads — video never leaves your device",
        description:
          "Convertio uploads every video to their servers. Trndinn converts locally in your browser — your video files are never transmitted anywhere.",
      },
      {
        title: "No queue — conversion starts immediately",
        description:
          "Cloud converters process a queue of jobs from all users. Trndinn converts locally using your CPU — there is no queue, no wait, and processing starts the moment you click convert.",
      },
      {
        title: "Screen recorder and webcam recorder included",
        description:
          "Convertio only converts existing files. Trndinn includes a screen recorder and webcam recorder — capture and convert, all in one browser-native toolkit.",
      },
    ],
    comparisonRows: [
      { feature: "Free file size limit", competitor: "100 MB (too small for video)", trndinn: "✅ Device RAM only" },
      { feature: "File privacy", competitor: "Uploaded to Convertio servers", trndinn: "✅ Never leaves your browser" },
      { feature: "Free conversions/day", competitor: "25 per day", trndinn: "✅ Unlimited" },
      { feature: "Screen recorder", competitor: "Not included", trndinn: "✅ Free browser recorder" },
      { feature: "Webcam recorder", competitor: "Not included", trndinn: "✅ Free MediaRecorder tool" },
      { feature: "Signup required", competitor: "No (account unlocks limits)", trndinn: "✅ Never" },
    ],
    faqs: [
      {
        question: "Is there a free Convertio alternative for video?",
        answer:
          "Yes. Trndinn converts video in your browser via FFmpeg WASM — no 100 MB cap, no daily limit, no upload. It also includes screen and webcam recorders.",
      },
      {
        question: "Can Convertio convert large video files for free?",
        answer:
          "No. Convertio's free tier limits video files to 100 MB. Trndinn processes video locally in your browser with no hard size limit — practical ceiling is your device RAM.",
      },
      {
        question: "How do I convert video without uploading it?",
        answer:
          "Use Trndinn's Video Converter. FFmpeg WASM runs entirely in your browser. Video files are processed locally and never transmitted to any server.",
      },
    ],
    switchAngle:
      "Switch from Convertio for local video processing with no file size cap, no daily limits, and free screen/webcam recorders.",
  },

  // ─────────────────────────── VEED ───────────────────────────
  {
    slug: "veed",
    name: "VEED",
    url: "https://veed.io",
    targetKeyword: "veed screen recorder",
    monthlyVolume: 700000,
    keywordDifficulty: 65,
    tagline:
      "Feature-rich online video editor and screen recorder — but watermarks all free tier exports and requires account creation.",
    overview:
      "VEED is an online video editing platform that includes a screen recorder, webcam recorder, subtitling, trimming, and a full video editing suite. Free tier exports include a VEED watermark.",
    positioning: [
      "VEED is the go-to for creators who need more than just recording — it combines screen capture, webcam overlay, subtitle generation, and video editing in one tool. The quality is high and the UX is polished.",
      "For users who just need a clean screen recording or video conversion, VEED adds significant friction. The free tier watermarks every export, requires account creation, and routes all video through their cloud servers.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Watermark on all exports, cloud processing, account required" },
      { name: "Basic", price: "$18/mo", note: "No watermark, 1 GB storage" },
      { name: "Pro", price: "$30/mo", note: "No watermark, 5 GB storage, AI features" },
    ],
    pricingNotes: [
      "All free tier exports include a VEED watermark",
      "Account creation required to save or download",
      "Video stored on VEED's cloud servers",
    ],
    weaknesses: [
      "Watermark on all free tier exports",
      "Account required to download recordings",
      "Video files uploaded to and stored on VEED servers",
      "Overkill for simple screen recording or conversion",
      "Paid plan required for watermark removal",
    ],
    wedgeSummary:
      "Trndinn records your screen and webcam with zero watermark, no account required, and local-only storage — no cloud upload, no subscription.",
    wedgePoints: [
      {
        title: "Zero watermark — clean recordings, always",
        description:
          "VEED adds its watermark to all free tier exports. Trndinn has no watermark on any recording or converted file — ever. No paid tier to remove it.",
      },
      {
        title: "No account required — start recording immediately",
        description:
          "VEED requires account creation before you can download recordings. Trndinn works without any account — open the tool, click record, download.",
      },
      {
        title: "Local storage — recordings never uploaded",
        description:
          "VEED processes and stores video on their cloud servers. Trndinn's recorder uses the browser MediaRecorder API — recordings are created and saved locally, never transmitted.",
      },
      {
        title: "Video conversion included alongside recording",
        description:
          "VEED focuses on video editing. Trndinn includes a screen recorder, webcam recorder, and video format converter — all browser-native, all free.",
      },
    ],
    comparisonRows: [
      { feature: "Watermark on exports", competitor: "Yes (free tier)", trndinn: "✅ No watermark ever" },
      { feature: "Account required", competitor: "Yes, to download", trndinn: "✅ Never" },
      { feature: "File privacy", competitor: "Uploaded to VEED servers", trndinn: "✅ Local browser only" },
      { feature: "Video format converter", competitor: "Limited (cloud, watermarked)", trndinn: "✅ Free FFmpeg WASM" },
      { feature: "Webcam recorder", competitor: "✅ Yes (watermarked free)", trndinn: "✅ Yes, no watermark" },
      { feature: "Screen recorder", competitor: "✅ Yes (watermarked free)", trndinn: "✅ Yes, no watermark" },
    ],
    faqs: [
      {
        question: "Is there a free VEED alternative without watermark?",
        answer:
          "Yes. Trndinn's screen and webcam recorders have zero watermark on all recordings — no paid tier, no account, just clean video downloads.",
      },
      {
        question: "How does VEED compare to Trndinn for screen recording?",
        answer:
          "VEED is a feature-rich video editor with screen recording. Trndinn is browser-native with no watermark, no account, and no cloud upload — ideal for quick clean recordings.",
      },
      {
        question: "Does VEED require a subscription to remove watermarks?",
        answer:
          "Yes. VEED requires a paid plan (from $18/mo) to remove watermarks. Trndinn has no watermark at any tier — it's free forever.",
      },
    ],
    switchAngle:
      "Switch from VEED for watermark-free screen and webcam recording with no account and no cloud upload.",
  },

  // ─────────────────────────── Loom ───────────────────────────
  {
    slug: "loom",
    name: "Loom",
    url: "https://loom.com",
    targetKeyword: "loom screen recorder alternative",
    monthlyVolume: 1200000,
    keywordDifficulty: 68,
    tagline:
      "Beloved async video messaging tool — but requires desktop app install, caps free users at 5 minutes per recording, and stores everything in the cloud.",
    overview:
      "Loom is a popular async video communication tool used by teams and individuals to record screen + webcam videos and share them via links. It is widely used in remote work for replacing meetings and onboarding videos.",
    positioning: [
      "Loom is the gold standard for async video messaging. It records screen + webcam simultaneously, generates shareable links instantly, and integrates with tools like Slack, Notion, and email. The UX is polished and the viewer experience is excellent.",
      "For quick screen captures without the Loom ecosystem, the free tier's 5-minute recording cap and app install requirement are friction points. Free recordings are stored on Loom's servers and there is no local-only option.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "5-minute recording cap, 25 videos, app required" },
      { name: "Business", price: "$12.50/mo", note: "Unlimited recording time, unlimited videos, AI features" },
    ],
    pricingNotes: [
      "Free tier: 5-minute recording cap per video",
      "Free tier: 25 video storage limit",
      "Desktop app required for full features",
    ],
    weaknesses: [
      "5-minute recording limit on the free tier",
      "Desktop app installation required",
      "All recordings stored on Loom's servers",
      "Free tier limited to 25 stored videos",
      "Requires Loom account to record",
    ],
    wedgeSummary:
      "Trndinn records your screen with no time limit, no app install, no account, and stores recordings locally — not on any cloud server.",
    wedgePoints: [
      {
        title: "No time limit — record as long as you need",
        description:
          "Loom caps free recordings at 5 minutes. Trndinn has no recording time limit — record 30-second demos or 2-hour tutorials with no subscription.",
      },
      {
        title: "No app to install — works in the browser",
        description:
          "Loom requires its desktop app for full functionality. Trndinn uses the browser's native getDisplayMedia API — no download, no install, open the page and record.",
      },
      {
        title: "No account required — instant recording",
        description:
          "Loom requires creating an account before you can record. Trndinn works without any account — no signup, no email, just record and download.",
      },
      {
        title: "Local storage — recordings stay on your device",
        description:
          "Loom stores all recordings on their cloud servers. Trndinn downloads recordings directly to your device using the browser — no cloud storage, no vendor lock-in.",
      },
    ],
    comparisonRows: [
      { feature: "Free recording time limit", competitor: "5 minutes", trndinn: "✅ No limit" },
      { feature: "App install required", competitor: "Yes (desktop app)", trndinn: "✅ Browser-only, no install" },
      { feature: "Account required", competitor: "Yes", trndinn: "✅ Never" },
      { feature: "Recording storage", competitor: "Loom cloud servers", trndinn: "✅ Local device download" },
      { feature: "Video format converter", competitor: "Not included", trndinn: "✅ Free FFmpeg WASM" },
      { feature: "Webcam recorder", competitor: "✅ Yes (screen + cam)", trndinn: "✅ Yes (dedicated tool)" },
    ],
    faqs: [
      {
        question: "Is there a free Loom alternative without time limits?",
        answer:
          "Yes. Trndinn's screen and webcam recorders have no time limit, no account requirement, no app install, and recordings stay on your device.",
      },
      {
        question: "How does Loom compare to Trndinn for screen recording?",
        answer:
          "Loom is better for async team video messaging with sharing links and integrations. Trndinn is better when you need a quick clean recording without an account, app, or time cap.",
      },
      {
        question: "Can I record my screen for free without Loom?",
        answer:
          "Yes. Trndinn's Screen Recorder uses Chrome/Edge's getDisplayMedia API — no Loom account, no app, no 5-minute limit. Download the recording directly.",
      },
    ],
    switchAngle:
      "Switch from Loom for unlimited recording time, no app install, no account, and local-only storage.",
  },

  // ─────────────────────────── CloudConvert ───────────────────────────
  {
    slug: "cloudconvert",
    name: "CloudConvert",
    url: "https://cloudconvert.com",
    targetKeyword: "cloudconvert video converter",
    monthlyVolume: 740000,
    keywordDifficulty: 68,
    tagline:
      "Professional cloud API with 200+ formats including video — but charges per conversion minute and uploads everything to Amazon S3.",
    overview:
      "CloudConvert is a professional-grade file conversion API and web tool supporting video formats including MP4, MOV, AVI, MKV, and WEBM. It is built for developers and businesses needing API access to conversion pipelines.",
    positioning: [
      "CloudConvert is the developer-first choice for video conversion workflows. Its API supports webhooks, custom FFmpeg parameters, and enterprise SLAs. The web interface provides a consumer-friendly layer on top.",
      "For casual video conversion, CloudConvert is overkill and expensive. The free tier allows 25 conversions per day, charges per conversion minute after that, and uploads all files to Amazon S3.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "25 conversions/day, files uploaded to AWS S3" },
      { name: "Pay As You Go", price: "From $6/100 mins", note: "Charged per conversion minute" },
      { name: "Packages", price: "From $13/mo", note: "Prepaid conversion minutes" },
    ],
    pricingNotes: [
      "Free tier: 25 conversions/day, no API access",
      "Paid tiers billed per conversion minute — video files consume many minutes",
      "All video files uploaded to and processed on Amazon S3",
    ],
    weaknesses: [
      "Video files uploaded to Amazon S3 — cloud storage during conversion",
      "Per-conversion-minute billing — large video files cost more",
      "Free tier limited to 25 conversions per day",
      "No screen recorder or webcam recorder",
      "Requires internet — no local processing",
    ],
    wedgeSummary:
      "Trndinn converts video locally in your browser using FFmpeg WASM — no AWS uploads, no per-minute billing, no 25-conversion cap, and includes free screen and webcam recorders.",
    wedgePoints: [
      {
        title: "No AWS uploads — complete video privacy",
        description:
          "CloudConvert uploads video to Amazon S3 for processing. Trndinn converts entirely in your browser — video files are never stored or transmitted anywhere.",
      },
      {
        title: "Free and unlimited — no per-minute billing",
        description:
          "CloudConvert charges per conversion minute after 25 free daily conversions. A 1 GB video conversion can consume significant credits. Trndinn is completely free with no conversion caps or billing.",
      },
      {
        title: "Screen and webcam recorders included",
        description:
          "CloudConvert only converts existing files. Trndinn includes a screen recorder (getDisplayMedia) and webcam recorder (MediaRecorder) alongside the format converter.",
      },
      {
        title: "No setup — open and convert",
        description:
          "CloudConvert requires API keys for developer use and account creation for the web tool. Trndinn requires nothing — open the URL, drop your file, and convert.",
      },
    ],
    comparisonRows: [
      { feature: "File privacy", competitor: "Uploaded to Amazon S3", trndinn: "✅ Never leaves your browser" },
      { feature: "Free conversions/day", competitor: "25 per day", trndinn: "✅ Unlimited" },
      { feature: "Pricing model", competitor: "Per conversion minute", trndinn: "✅ Free forever" },
      { feature: "Screen recorder", competitor: "Not included", trndinn: "✅ Free getDisplayMedia tool" },
      { feature: "Webcam recorder", competitor: "Not included", trndinn: "✅ Free MediaRecorder tool" },
      { feature: "Signup required", competitor: "Yes (free tier)", trndinn: "✅ Never" },
    ],
    faqs: [
      {
        question: "Is there a free CloudConvert alternative for video?",
        answer:
          "Yes. Trndinn converts video in your browser via FFmpeg WASM — no AWS upload, no per-minute billing, no daily limit. It also includes screen and webcam recorders.",
      },
      {
        question: "How expensive is CloudConvert for video conversion?",
        answer:
          "CloudConvert charges per conversion minute. Large video files can consume significant credits quickly. Trndinn is completely free with no conversion caps.",
      },
      {
        question: "Does CloudConvert upload video files to the cloud?",
        answer:
          "Yes. CloudConvert processes files on Amazon S3. Trndinn converts in your browser — video files never leave your device.",
      },
    ],
    switchAngle:
      "Switch from CloudConvert for private local video processing with no per-minute billing and free screen/webcam recorders.",
  },

  // ─────────────────────────── FreeConvert ───────────────────────────
  {
    slug: "freeconvert",
    name: "FreeConvert",
    url: "https://freeconvert.com",
    targetKeyword: "freeconvert video converter",
    monthlyVolume: 380000,
    keywordDifficulty: 58,
    tagline:
      "General-purpose cloud converter with video support — but free tier limited to 25 conversions per day and 1 GB file size, with queue delays.",
    overview:
      "FreeConvert is an online file conversion tool supporting video formats including MP4, MOV, AVI, MKV, and WEBM. Video files are processed on cloud servers with a free tier cap of 25 daily conversions and 1 GB file size.",
    positioning: [
      "FreeConvert is a popular generalist converter that handles video alongside documents, images, and audio. It supports optional quality settings for video conversion, including resolution and codec choices.",
      "The limitation: all processing is server-side. Free users get 25 conversions per day and a 1 GB file size limit. Large video files often exceed the free limit. Queue delays are common during peak hours.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "25 conversions/day, 1 GB file limit, cloud processing" },
      { name: "Pro", price: "$9.99/mo", note: "Unlimited conversions, 4 GB file limit, priority queue" },
    ],
    pricingNotes: [
      "Free tier: 25 conversions/day with 1 GB file limit",
      "Queue delays during peak hours on free tier",
      "All video files uploaded to FreeConvert servers",
    ],
    weaknesses: [
      "1 GB file limit on free tier — constraining for high-resolution video",
      "Queue wait times during peak hours",
      "Video files uploaded to remote servers",
      "No screen recorder or webcam recorder",
      "25 conversion daily cap on free tier",
    ],
    wedgeSummary:
      "Trndinn processes video locally in your browser — no 1 GB cap, no queue delays, no daily limit, and includes free screen and webcam recorders.",
    wedgePoints: [
      {
        title: "No queue — conversion starts immediately",
        description:
          "FreeConvert queues jobs on their cloud servers and has delays during peak hours. Trndinn converts locally using your CPU — there is no queue and conversion starts the moment you click.",
      },
      {
        title: "No 1 GB cap — convert large video files",
        description:
          "FreeConvert's free tier limits video files to 1 GB. Trndinn's FFmpeg WASM has no hard limit — the practical ceiling is your device RAM, supporting multi-gigabyte video files.",
      },
      {
        title: "Local processing — video never uploaded",
        description:
          "FreeConvert uploads your video to their servers. Trndinn converts locally in your browser — your video files are never transmitted anywhere.",
      },
      {
        title: "Screen and webcam recorders included",
        description:
          "FreeConvert only converts existing files. Trndinn includes a browser-native screen recorder and webcam recorder alongside the video format converter.",
      },
    ],
    comparisonRows: [
      { feature: "Free file size limit", competitor: "1 GB", trndinn: "✅ Device RAM only" },
      { feature: "Queue delays", competitor: "Yes, peak hours", trndinn: "✅ None — local processing" },
      { feature: "File privacy", competitor: "Uploaded to FreeConvert servers", trndinn: "✅ Never leaves your browser" },
      { feature: "Free conversions/day", competitor: "25 per day", trndinn: "✅ Unlimited" },
      { feature: "Screen recorder", competitor: "Not included", trndinn: "✅ Free getDisplayMedia tool" },
      { feature: "Signup required", competitor: "No (account unlocks limits)", trndinn: "✅ Never" },
    ],
    faqs: [
      {
        question: "Is there a free FreeConvert alternative for video?",
        answer:
          "Yes. Trndinn converts video in your browser via FFmpeg WASM — no 1 GB cap, no queue, no daily limit. It also includes screen and webcam recorders.",
      },
      {
        question: "How does FreeConvert compare to Trndinn for video?",
        answer:
          "FreeConvert is cloud-based with a 1 GB cap and queue delays. Trndinn is browser-native — no cap, no queue, local processing, and includes recorders.",
      },
      {
        question: "Does FreeConvert have a file size limit for video?",
        answer:
          "Yes. FreeConvert's free tier limits video files to 1 GB. Trndinn processes locally with no hard limit — just your device RAM.",
      },
    ],
    switchAngle:
      "Switch from FreeConvert for local video processing with no file size cap, no queue delays, and free recorders.",
  },
];

/** All video competitor slugs. */
export const VIDEO_COMPETITOR_SLUGS: string[] = VIDEO_COMPETITORS.map((c) => c.slug);

/** Lookup a video competitor by slug. */
export function getVideoCompetitor(slug: string): VideoCompetitor | undefined {
  return VIDEO_COMPETITORS.find((c) => c.slug === slug);
}

/**
 * Returns up to 4 related competitors (all except the current one).
 * Used for the "related comparisons" section on compare/alternative pages.
 */
export function getRelatedVideoCompetitors(currentSlug: string): VideoCompetitor[] {
  return VIDEO_COMPETITORS.filter((c) => c.slug !== currentSlug).slice(0, 4);
}
