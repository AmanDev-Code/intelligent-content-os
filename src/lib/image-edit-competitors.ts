/**
 * Image Edit & Compression competitor dataset — single source of truth for
 * /alternatives/{slug} and /compare/trndinn-vs-{slug} pages.
 *
 * 5 competitors shared across all compression + edit tools:
 *   1. tinypng      — TinyPNG (compression-focused, 20 free/day limit)
 *   2. squoosh      — Squoosh by Google (single image, developer tool)
 *   3. picresize    — PicResize (resize-focused, dated UI)
 *   4. iloveimg-edit — iLoveIMG Edit (full suite but server-side)
 *   5. canva        — Canva (design tool with edit features, requires account)
 *
 * Same shape as image-converter-competitors.ts.
 */

export type ImageEditPricingPlan = {
  name: string;
  price: string;
  note?: string;
};

export type ImageEditComparisonRow = {
  feature: string;
  competitor: string;
  trndinn: string;
};

export type ImageEditFaq = {
  question: string;
  answer: string;
};

export type ImageEditWedgePoint = {
  title: string;
  description: string;
};

export type ImageEditCompetitor = {
  slug: string;
  name: string;
  url: string;
  targetKeyword: string;
  keywordDifficulty: number;
  monthlyVolume: number;
  tagline: string;
  overview: string;
  positioning: string[];
  pricingPlans: ImageEditPricingPlan[];
  pricingNotes: string[];
  weaknesses: string[];
  wedgeSummary: string;
  wedgePoints: ImageEditWedgePoint[];
  comparisonRows: ImageEditComparisonRow[];
  faqs: ImageEditFaq[];
  switchAngle: string;
};

export const IMAGE_EDIT_COMPETITORS: ImageEditCompetitor[] = [
  // ─── 1. TinyPNG ───────────────────────────────────────────────────────────
  {
    slug: "tinypng",
    name: "TinyPNG",
    url: "https://tinypng.com",
    targetKeyword: "tinypng alternative free",
    keywordDifficulty: 38,
    monthlyVolume: 27100,
    tagline: "Smart WebP, PNG, and JPEG compression",
    overview:
      "TinyPNG is one of the most popular compression tools on the web, known for its panda branding and effective lossy compression for PNG and JPEG. It has a generous free tier but caps at 20 images per day and 5 MB per file on the free plan.",
    positioning: [
      "Simple drag-and-drop compression",
      "Strong API for developer integration",
      "Trusted brand with years of usage data",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "20 images/day, 5 MB max" },
      { name: "Pro (API)", price: "$0.009/image", note: "After 500 free/month via API" },
      { name: "WordPress Plugin", price: "$0–$9/mo", note: "Per-site pricing" },
    ],
    pricingNotes: [
      "Free tier is limited to 20 compressions per day",
      "Batch processing on free tier is capped at 20 files total",
      "API access requires separate signup and billing setup",
    ],
    weaknesses: [
      "20 image/day hard cap on the free tier",
      "5 MB per file limit on free plan",
      "Files are uploaded to TinyPNG's servers — not browser-based",
      "No resize, crop, rotate, or watermark tools",
      "No pipeline/batch multi-operation editing",
    ],
    wedgeSummary:
      "TinyPNG is great for quick compression but hits a 20-image daily wall and requires server uploads. Trndinn compresses unlimited images entirely in your browser — no uploads, no daily limit.",
    wedgePoints: [
      {
        title: "No daily limits",
        description: "Trndinn has zero daily limits. TinyPNG caps free users at 20 images per day — hit that ceiling and you're blocked until midnight.",
      },
      {
        title: "Browser-based — no server uploads",
        description: "Trndinn uses the Canvas API so your images never leave your device. TinyPNG uploads every file to its servers for processing.",
      },
      {
        title: "Full edit suite",
        description: "Trndinn also resizes, crops, rotates, and watermarks images. TinyPNG does compression only.",
      },
      {
        title: "No file size cap",
        description: "Trndinn's browser-based engine handles any file size your device can load. TinyPNG limits free uploads to 5 MB.",
      },
      {
        title: "No signup required",
        description: "Trndinn works instantly with zero account. TinyPNG pushes you toward signup for API access and removes the daily limit.",
      },
    ],
    comparisonRows: [
      { feature: "Compression", competitor: "Yes — lossy PNG/JPG/WebP", trndinn: "Yes — quality slider, all formats" },
      { feature: "Daily free limit", competitor: "20 images/day", trndinn: "Unlimited" },
      { feature: "File size limit", competitor: "5 MB (free)", trndinn: "None" },
      { feature: "Server uploads", competitor: "Yes — files sent to TinyPNG servers", trndinn: "No — fully browser-based" },
      { feature: "Resize tool", competitor: "No", trndinn: "Yes — with platform presets" },
      { feature: "Crop tool", competitor: "No", trndinn: "Yes" },
      { feature: "Rotate / Flip", competitor: "No", trndinn: "Yes" },
      { feature: "Watermark tool", competitor: "No", trndinn: "Yes" },
      { feature: "Multi-op pipeline", competitor: "No", trndinn: "Yes — Image Workbench" },
      { feature: "Signup required", competitor: "No (but pushed for API)", trndinn: "No — never" },
    ],
    faqs: [
      {
        question: "What is the best free TinyPNG alternative in 2026?",
        answer: "The best free TinyPNG alternatives in 2026 include Trndinn, Squoosh, and iLoveIMG — ranked on daily limits, server uploads, and feature depth. Trndinn leads with no daily limit, no server uploads, and a full edit suite.",
      },
      {
        question: "Does TinyPNG upload my images to its servers?",
        answer: "Yes. TinyPNG processes all images on its own servers. Trndinn uses the Canvas API in your browser — your images never leave your device.",
      },
      {
        question: "Why does TinyPNG have a 20-image daily limit?",
        answer: "TinyPNG's free tier caps at 20 images per day to encourage API plan upgrades. Trndinn has no daily limit — compress as many images as you need for free.",
      },
      {
        question: "Can I compress more than 20 images a day for free?",
        answer: "Not on TinyPNG's free tier. Trndinn has no daily limit — compress unlimited images for free, entirely in your browser, with no signup required.",
      },
      {
        question: "Is there a free TinyPNG alternative without file size limits?",
        answer: "Yes. Trndinn's image compressor has no file size limit on the free tier — it runs in your browser so the only limit is your device's memory.",
      },
    ],
    switchAngle:
      "Switch from TinyPNG to Trndinn and compress unlimited images with no daily cap, no server uploads, and a full edit suite — all for free.",
  },

  // ─── 2. Squoosh ───────────────────────────────────────────────────────────
  {
    slug: "squoosh",
    name: "Squoosh",
    url: "https://squoosh.app",
    targetKeyword: "squoosh alternative free",
    keywordDifficulty: 29,
    monthlyVolume: 14800,
    tagline: "Make images smaller using best-in-class codecs — right in the browser.",
    overview:
      "Squoosh is Google's open-source image compression and conversion tool. It runs entirely in the browser using WebAssembly codecs and offers advanced compression settings. However, it processes only one image at a time and is aimed primarily at developers — the interface can overwhelm general users.",
    positioning: [
      "Browser-based WebAssembly compression",
      "Backed by Google Chrome Labs",
      "Open source with advanced codec options",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Fully free, open source" },
    ],
    pricingNotes: [
      "Completely free and open source",
      "No batch processing — one image at a time",
      "No resize, crop, rotate, or watermark tools",
    ],
    weaknesses: [
      "One image at a time — no batch processing",
      "Developer-focused UI that's overwhelming for general users",
      "No resize, crop, rotate, or watermark tools",
      "No platform presets for social media",
      "No multi-operation pipeline",
      "No download queue — each image must be exported separately",
    ],
    wedgeSummary:
      "Squoosh is powerful for developers compressing one image at a time but has no batch processing, no resize or crop, and a technical UI. Trndinn offers the same browser-based privacy with a simpler UX plus a full edit and resize suite.",
    wedgePoints: [
      {
        title: "Batch processing",
        description: "Trndinn lets you compress multiple images in one run. Squoosh handles exactly one image at a time — tedious for any real workflow.",
      },
      {
        title: "Social media platform presets",
        description: "Trndinn's Image Resizer has one-click presets for LinkedIn, Instagram, Twitter, YouTube, and Facebook. Squoosh has no resize tool at all.",
      },
      {
        title: "Non-technical UI",
        description: "Trndinn is designed for creators and marketers, not just developers. Squoosh's advanced codec controls confuse general users.",
      },
      {
        title: "Full edit suite",
        description: "Beyond compression, Trndinn offers resize, crop, rotate, watermark, and a multi-op Image Workbench. Squoosh is compression and conversion only.",
      },
      {
        title: "Multi-op pipeline",
        description: "Trndinn's Image Workbench chains multiple operations in one pass. Squoosh requires a separate tool for every other operation.",
      },
    ],
    comparisonRows: [
      { feature: "Browser-based (no uploads)", competitor: "Yes — WebAssembly", trndinn: "Yes — Canvas API" },
      { feature: "Batch processing", competitor: "No — one image at a time", trndinn: "Yes" },
      { feature: "Compression", competitor: "Yes — advanced codecs", trndinn: "Yes — quality slider" },
      { feature: "Resize tool", competitor: "No", trndinn: "Yes — with platform presets" },
      { feature: "Crop tool", competitor: "No", trndinn: "Yes" },
      { feature: "Rotate / Flip", competitor: "No", trndinn: "Yes" },
      { feature: "Watermark tool", competitor: "No", trndinn: "Yes" },
      { feature: "Platform presets (LinkedIn, IG etc.)", competitor: "No", trndinn: "Yes" },
      { feature: "UI complexity", competitor: "High — developer-oriented", trndinn: "Simple — creator-oriented" },
      { feature: "Multi-op pipeline", competitor: "No", trndinn: "Yes — Image Workbench" },
    ],
    faqs: [
      {
        question: "What is the best Squoosh alternative for non-developers?",
        answer: "Trndinn is the best Squoosh alternative for general users — same browser-based privacy but with a simple UI, batch processing, and a full edit suite including resize, crop, rotate, and watermark.",
      },
      {
        question: "Can Squoosh process multiple images at once?",
        answer: "No. Squoosh processes one image at a time. Trndinn supports batch compression for multiple images in a single run.",
      },
      {
        question: "Does Squoosh have a resize tool?",
        answer: "No. Squoosh is compression and format conversion only. Trndinn's Image Resizer has one-click presets for LinkedIn, Instagram, Twitter, YouTube, and Facebook.",
      },
      {
        question: "Is Squoosh safe — does it upload my images?",
        answer: "Squoosh is browser-based using WebAssembly — images are not uploaded to Google's servers. Trndinn is similarly browser-based using the Canvas API.",
      },
      {
        question: "Is there a Squoosh alternative with more features?",
        answer: "Yes. Trndinn offers Squoosh-level browser-based compression plus resize, crop, rotate, watermark, and a multi-op Image Workbench — all free, no signup.",
      },
    ],
    switchAngle:
      "Switch from Squoosh to Trndinn for the same browser-based privacy with batch processing, a simpler UI, and a full image edit suite — all free.",
  },

  // ─── 3. PicResize ─────────────────────────────────────────────────────────
  {
    slug: "picresize",
    name: "PicResize",
    url: "https://picresize.com",
    targetKeyword: "picresize alternative free",
    keywordDifficulty: 22,
    monthlyVolume: 9900,
    tagline: "Crop, resize, and edit images online",
    overview:
      "PicResize is a long-running web-based image resizer that covers crop, resize, and basic editing. It processes images server-side, has a dated UI, and lacks modern compression and platform presets. The tool predates the mobile-first and social media platform era.",
    positioning: [
      "Simple crop and resize",
      "Long-established brand (since 2004)",
      "No signup required for basic operations",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Server-side, 10 MB max" },
    ],
    pricingNotes: [
      "Free but files are uploaded to PicResize servers",
      "10 MB file size limit",
      "No batch processing",
    ],
    weaknesses: [
      "Server-side — images are uploaded to PicResize servers",
      "Dated UI from the pre-mobile era",
      "No platform presets for social media dimensions",
      "No quality compression slider",
      "No watermark tool",
      "No multi-op pipeline",
      "10 MB file size limit",
    ],
    wedgeSummary:
      "PicResize gets the job done for basic resize and crop but uploads your files to its servers, has no social media presets, and uses an interface designed in 2004. Trndinn is browser-based, modern, and purpose-built for social media dimensions.",
    wedgePoints: [
      {
        title: "Browser-based privacy",
        description: "Trndinn never uploads your images to any server. PicResize sends every file to its own servers for processing.",
      },
      {
        title: "Social media platform presets",
        description: "Trndinn has one-click presets for LinkedIn, Instagram, Twitter, YouTube, and Facebook. PicResize has no social media presets.",
      },
      {
        title: "Modern UI",
        description: "Trndinn is designed for 2026 — mobile-first, clean, and fast. PicResize's interface hasn't changed meaningfully since 2004.",
      },
      {
        title: "Compression quality control",
        description: "Trndinn offers a full quality slider for JPG, PNG, WebP, and GIF compression. PicResize has no dedicated compression tool.",
      },
      {
        title: "Full edit suite",
        description: "Trndinn offers compress, resize, crop, rotate, watermark, and a multi-op pipeline. PicResize covers resize and basic crop only.",
      },
    ],
    comparisonRows: [
      { feature: "Server uploads", competitor: "Yes — files sent to PicResize servers", trndinn: "No — fully browser-based" },
      { feature: "Resize tool", competitor: "Yes — basic", trndinn: "Yes — with platform presets" },
      { feature: "Crop tool", competitor: "Yes — basic", trndinn: "Yes — pixel-precise" },
      { feature: "Compression tool", competitor: "No quality slider", trndinn: "Yes — quality slider per format" },
      { feature: "Rotate / Flip", competitor: "Basic", trndinn: "Yes — 90/180/270 + flip H/V" },
      { feature: "Watermark tool", competitor: "No", trndinn: "Yes" },
      { feature: "Platform presets (LinkedIn, IG etc.)", competitor: "No", trndinn: "Yes" },
      { feature: "File size limit", competitor: "10 MB", trndinn: "None (browser memory)" },
      { feature: "Mobile-first UI", competitor: "No", trndinn: "Yes" },
      { feature: "Multi-op pipeline", competitor: "No", trndinn: "Yes — Image Workbench" },
    ],
    faqs: [
      {
        question: "What is the best PicResize alternative in 2026?",
        answer: "The best PicResize alternatives in 2026 include Trndinn, iLoveIMG, and Squoosh. Trndinn leads on browser-based privacy, social media presets, and a modern UI with a full edit suite.",
      },
      {
        question: "Does PicResize upload my images to its servers?",
        answer: "Yes. PicResize processes images server-side. Trndinn is fully browser-based — your images never leave your device.",
      },
      {
        question: "Does PicResize have LinkedIn or Instagram size presets?",
        answer: "No. PicResize has no social media platform presets. Trndinn's Image Resizer includes one-click presets for LinkedIn, Instagram, Twitter, YouTube, and Facebook.",
      },
      {
        question: "Is PicResize free?",
        answer: "Yes, PicResize is free. Trndinn is also free, with no signup required, no server uploads, and more tools including compression, watermarking, and a multi-op pipeline.",
      },
      {
        question: "Is there a PicResize alternative that doesn't upload files?",
        answer: "Yes. Trndinn runs entirely in your browser using the Canvas API — your images are never uploaded to any server.",
      },
    ],
    switchAngle:
      "Switch from PicResize to Trndinn for browser-based privacy, social media platform presets, and a modern UI — all free with no signup.",
  },

  // ─── 4. iLoveIMG Edit ─────────────────────────────────────────────────────
  {
    slug: "iloveimg-edit",
    name: "iLoveIMG",
    url: "https://www.iloveimg.com",
    targetKeyword: "iloveimg alternative free",
    keywordDifficulty: 34,
    monthlyVolume: 18100,
    tagline: "Every tool you could want to edit images in bulk",
    overview:
      "iLoveIMG is a comprehensive server-side image editing suite covering compression, resize, crop, rotate, watermark, and more. It has a generous free tier but requires file uploads to its servers, has daily rate limits on the free plan, and pushes users toward a paid subscription for bulk and API access.",
    positioning: [
      "Full-featured image editing suite",
      "Familiar brand from iLovePDF family",
      "Bulk processing on paid plans",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Limited daily operations, server uploads" },
      { name: "Premium", price: "$4/mo", note: "Annual billing — removes limits" },
    ],
    pricingNotes: [
      "Free tier has daily operation limits",
      "All files are uploaded to iLoveIMG servers",
      "API access requires premium plan",
    ],
    weaknesses: [
      "All images are uploaded to iLoveIMG's EU servers",
      "Daily operation limits on the free tier",
      "Requires account signup for bulk operations",
      "Paid plan required for API and advanced batch processing",
      "Slower than browser-based tools due to server round-trips",
    ],
    wedgeSummary:
      "iLoveIMG has a full feature set but sends every image to its servers, has daily limits on the free tier, and requires a paid plan for serious batch work. Trndinn is fully browser-based — unlimited, free, and faster with no uploads.",
    wedgePoints: [
      {
        title: "No server uploads ever",
        description: "Trndinn uses the Canvas API so your images never leave your device. iLoveIMG uploads every file to its servers in the EU.",
      },
      {
        title: "No daily limits",
        description: "Trndinn has zero operation limits. iLoveIMG's free tier caps daily usage and gates bulk operations behind a paid subscription.",
      },
      {
        title: "Faster processing",
        description: "Trndinn processes images locally in your browser — no round-trip server latency. iLoveIMG requires upload, server processing, and download.",
      },
      {
        title: "Always free",
        description: "Trndinn's full edit suite is free with no credit card, no trial expiry, and no premium tier. iLoveIMG's full capabilities require a $4/mo subscription.",
      },
      {
        title: "No signup required",
        description: "Trndinn works immediately with no account. iLoveIMG pushes users to create an account to unlock batch and API features.",
      },
    ],
    comparisonRows: [
      { feature: "Server uploads", competitor: "Yes — files sent to iLoveIMG EU servers", trndinn: "No — fully browser-based" },
      { feature: "Daily free limit", competitor: "Yes — rate limited", trndinn: "Unlimited" },
      { feature: "Compression", competitor: "Yes", trndinn: "Yes — quality slider per format" },
      { feature: "Resize with platform presets", competitor: "No presets", trndinn: "Yes — LinkedIn, IG, Twitter, YT, FB" },
      { feature: "Crop tool", competitor: "Yes", trndinn: "Yes — pixel-precise" },
      { feature: "Rotate / Flip", competitor: "Yes", trndinn: "Yes" },
      { feature: "Watermark tool", competitor: "Yes", trndinn: "Yes" },
      { feature: "Multi-op pipeline", competitor: "No — one tool at a time", trndinn: "Yes — Image Workbench" },
      { feature: "Signup required", competitor: "Required for bulk", trndinn: "Never" },
      { feature: "Paid plan needed for bulk", competitor: "Yes — $4/mo", trndinn: "No — always free" },
    ],
    faqs: [
      {
        question: "What is the best iLoveIMG alternative in 2026?",
        answer: "The best iLoveIMG alternatives in 2026 include Trndinn and Squoosh. Trndinn covers the same full edit suite — compress, resize, crop, rotate, watermark — without server uploads, daily limits, or a paid plan.",
      },
      {
        question: "Does iLoveIMG upload my images to its servers?",
        answer: "Yes. iLoveIMG processes all images on its own servers in the EU. Trndinn is fully browser-based — your images are never uploaded.",
      },
      {
        question: "Is iLoveIMG free for bulk image editing?",
        answer: "iLoveIMG has daily limits on the free tier and requires a $4/mo Premium plan for bulk operations. Trndinn is free with no bulk limits — no credit card, no trial.",
      },
      {
        question: "Is there a free iLoveIMG alternative with no daily limits?",
        answer: "Yes. Trndinn's full edit suite has no daily limits — compress, resize, crop, rotate, and watermark unlimited images for free, entirely in your browser.",
      },
      {
        question: "Does iLoveIMG have a free plan?",
        answer: "Yes, but the free plan has daily operation limits and requires server uploads. Trndinn is unlimited and browser-based — no uploads, no daily cap, no account.",
      },
    ],
    switchAngle:
      "Switch from iLoveIMG to Trndinn for the same full feature set without server uploads, daily limits, or a paid plan — all free in your browser.",
  },

  // ─── 5. Canva ─────────────────────────────────────────────────────────────
  {
    slug: "canva",
    name: "Canva",
    url: "https://www.canva.com",
    targetKeyword: "canva image editor alternative free",
    keywordDifficulty: 52,
    monthlyVolume: 22200,
    tagline: "Design anything. Publish anywhere.",
    overview:
      "Canva is a full design platform with image editing features. While it supports resize, crop, watermark-style overlays, and basic compression for exports, it requires an account, involves a complex UI built for design work, and gates the best export options behind a Canva Pro subscription.",
    positioning: [
      "Full design platform — not just image editing",
      "Massive template library",
      "Brand kit and team collaboration on paid plans",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Account required, limited exports" },
      { name: "Canva Pro", price: "$15/mo", note: "Annual — removes watermarks and background removal limits" },
      { name: "Canva Teams", price: "$10/user/mo", note: "Annual billing" },
    ],
    pricingNotes: [
      "Account required — no anonymous use",
      "Canva Pro needed for background removal, resize to custom dimensions, and premium exports",
      "Export quality and format options limited on free tier",
    ],
    weaknesses: [
      "Requires account signup — no anonymous editing",
      "Designed for graphic design, not quick image compression or resizing",
      "No dedicated compression quality slider",
      "Pro subscription required for full resize and export options",
      "Heavy UI — slow for simple tasks like rotating or cropping a single photo",
      "No multi-op pipeline for batch image processing",
    ],
    wedgeSummary:
      "Canva is a full design tool — powerful but overkill for image compression, resizing, or quick cropping. It requires an account and a $15/mo plan for full export quality. Trndinn is purpose-built for these tasks, browser-based, and always free with no account.",
    wedgePoints: [
      {
        title: "No account required",
        description: "Trndinn works instantly with zero signup. Canva requires an account for every operation, including basic resizing.",
      },
      {
        title: "Purpose-built for image editing",
        description: "Trndinn is a dedicated image tool — compressing a JPG takes 3 clicks. Canva is a design platform; image editing is a secondary feature buried in its UI.",
      },
      {
        title: "Free quality compression",
        description: "Trndinn offers a quality slider for JPG, PNG, WebP, and GIF compression at no cost. Canva's export quality is gated behind Canva Pro.",
      },
      {
        title: "No design bloat",
        description: "Trndinn's image tools are fast and focused. Canva loads a full design canvas, template picker, and asset library — overhead you don't need for a crop.",
      },
      {
        title: "Multi-op pipeline",
        description: "Trndinn's Image Workbench chains resize, crop, rotate, compress, and convert in one pass. Canva has no equivalent pipeline for pure image processing.",
      },
    ],
    comparisonRows: [
      { feature: "Signup required", competitor: "Yes — mandatory account", trndinn: "No — never" },
      { feature: "Compression with quality slider", competitor: "No — basic export only", trndinn: "Yes — per format" },
      { feature: "Resize with platform presets", competitor: "Paid feature (Canva Pro)", trndinn: "Free — LinkedIn, IG, Twitter, YT, FB" },
      { feature: "Crop tool", competitor: "Yes", trndinn: "Yes — pixel-precise" },
      { feature: "Rotate / Flip", competitor: "Yes", trndinn: "Yes" },
      { feature: "Watermark / text overlay", competitor: "Yes (design-focused)", trndinn: "Yes — dedicated watermark tool" },
      { feature: "Server uploads", competitor: "Yes — all files go to Canva servers", trndinn: "No — fully browser-based" },
      { feature: "Paid plan for full exports", competitor: "Yes — $15/mo Canva Pro", trndinn: "No — always free" },
      { feature: "Multi-op pipeline", competitor: "No", trndinn: "Yes — Image Workbench" },
      { feature: "Focused image tool", competitor: "No — full design platform", trndinn: "Yes — purpose-built" },
    ],
    faqs: [
      {
        question: "What is the best free Canva image editor alternative?",
        answer: "The best free Canva image editing alternatives in 2026 include Trndinn, iLoveIMG, and Squoosh. Trndinn covers compression, resize, crop, rotate, and watermark without an account or paid plan.",
      },
      {
        question: "Can I resize images in Canva for free?",
        answer: "Basic resize is available on Canva's free plan but resizing to custom dimensions requires Canva Pro ($15/mo). Trndinn's Image Resizer is completely free with no account needed.",
      },
      {
        question: "Does Canva compress images?",
        answer: "Canva exports images in JPG or PNG but doesn't offer a quality/compression slider on the free plan. Trndinn's compressor has a full quality slider for JPG, PNG, WebP, and GIF.",
      },
      {
        question: "Do I need a Canva account to edit images?",
        answer: "Yes. Canva requires an account for all operations. Trndinn has no account requirement — open the tool and start editing immediately.",
      },
      {
        question: "Is there a Canva alternative for quick image editing without signup?",
        answer: "Yes. Trndinn requires no signup for compress, resize, crop, rotate, watermark, or multi-op pipeline editing — all free, all browser-based.",
      },
    ],
    switchAngle:
      "Switch from Canva's image editing to Trndinn for purpose-built tools that are faster, free, require no account, and never upload your images.",
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

const COMPETITOR_MAP = new Map<string, ImageEditCompetitor>(
  IMAGE_EDIT_COMPETITORS.map((c) => [c.slug, c])
);

export const IMAGE_EDIT_COMPETITOR_SLUGS: string[] = IMAGE_EDIT_COMPETITORS.map(
  (c) => c.slug
);

export function getImageEditCompetitor(slug: string): ImageEditCompetitor | undefined {
  return COMPETITOR_MAP.get(slug);
}

/**
 * Returns up to 3 competitors related to the given slug (all except the
 * current one, capped at 3 for sidebar display).
 */
export function getRelatedImageEditCompetitors(
  slug: string
): ImageEditCompetitor[] {
  return IMAGE_EDIT_COMPETITORS.filter((c) => c.slug !== slug).slice(0, 3);
}
