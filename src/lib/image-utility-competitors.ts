/**
 * image-utility-competitors.ts — competitor dataset for the 7 utility/AI image tools.
 *
 * 5 competitors: Remove.bg, TinyPNG, Favicon.io, OnlineOCR.net, QR Code Monkey.
 * Used for /alternatives/{slug} and /compare/trndinn-vs-{slug} pages.
 *
 * Same shape as image-converter-competitors.ts.
 */

export type ImageUtilityPricingPlan = {
  name: string;
  price: string;
  note?: string;
};

export type ImageUtilityComparisonRow = {
  feature: string;
  competitor: string;
  trndinn: string;
};

export type ImageUtilityFaq = {
  question: string;
  answer: string;
};

export type ImageUtilityWedgePoint = {
  title: string;
  description: string;
};

export type ImageUtilityCompetitor = {
  slug: string;
  name: string;
  url: string;
  targetKeyword: string;
  keywordDifficulty: number;
  monthlyVolume: number;
  tagline: string;
  overview: string;
  positioning: string[];
  pricingPlans: ImageUtilityPricingPlan[];
  pricingNotes: string[];
  weaknesses: string[];
  wedgeSummary: string;
  wedgePoints: ImageUtilityWedgePoint[];
  comparisonRows: ImageUtilityComparisonRow[];
  faqs: ImageUtilityFaq[];
  switchAngle: string;
};

export const IMAGE_UTILITY_COMPETITORS: readonly ImageUtilityCompetitor[] = [
  // ─────────────────────────── Remove.bg ───────────────────────────
  {
    slug: "remove-bg",
    name: "Remove.bg",
    url: "https://remove.bg",
    targetKeyword: "remove.bg alternative",
    keywordDifficulty: 58,
    monthlyVolume: 890000,
    tagline: "Best-known background removal service — but uploads images to remote servers and charges for HD downloads after one free preview.",
    overview:
      "Remove.bg is the most recognized online background removal service. It uses server-side AI to remove backgrounds from photos and outputs a transparent PNG. The service is fast and accurate, but every image is uploaded to their servers and HD downloads require paid credits.",
    positioning: [
      "Remove.bg built the background removal category and remains the default choice for non-technical users. Its AI is trained on a massive dataset and handles complex edges — hair, fur, transparent objects — better than most alternatives.",
      "The catch: every image you process is uploaded to Remove.bg's servers. Free users receive a low-resolution (0.25 megapixel) preview; downloading the full HD result consumes one paid credit. For high-volume use, costs add up quickly.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Low-res preview only (0.25 MP), image uploaded to servers" },
      { name: "Pay As You Go", price: "From $0.20/image", note: "HD downloads, images still uploaded" },
      { name: "Subscription", price: "From $9/mo", note: "40 HD images/mo, server processing" },
    ],
    pricingNotes: [
      "Free tier provides only a low-resolution (0.25 megapixel) preview",
      "HD downloads require paid credits — $0.20+ per image",
      "All images uploaded to Remove.bg servers regardless of tier",
    ],
    weaknesses: [
      "Images uploaded to remote servers — privacy risk for sensitive photos",
      "Free tier only provides low-resolution preview, not full HD",
      "HD downloads require paid credits",
      "No offline or browser-local processing option",
      "Costs scale with volume — expensive for batch use",
    ],
    wedgeSummary:
      "Trndinn's background remover runs via ONNX WebAssembly entirely in your browser — zero uploads, full resolution output, no credits, no watermark, completely free.",
    wedgePoints: [
      {
        title: "Zero uploads — images never leave your device",
        description:
          "Remove.bg uploads every image to their servers. Trndinn's background remover uses an ONNX model running via WebAssembly in your browser. Your photos are processed locally and never transmitted anywhere.",
      },
      {
        title: "Full resolution — no low-res preview gate",
        description:
          "Remove.bg's free tier outputs a 0.25 megapixel preview. Trndinn outputs the full original resolution transparent PNG with no resolution cap and no paid tier required.",
      },
      {
        title: "No credits — unlimited processing, always free",
        description:
          "Remove.bg charges per HD download. Trndinn's background remover is completely free with no credit system, no daily limit, and no subscription to unlock full quality.",
      },
      {
        title: "No watermark — clean transparent PNG",
        description:
          "Remove.bg free tier doesn't add a watermark, but gating HD resolution is a form of output degradation. Trndinn outputs clean, full-resolution transparent PNGs — always.",
      },
    ],
    comparisonRows: [
      { feature: "File privacy", competitor: "Uploaded to Remove.bg servers", trndinn: "✅ Never leaves your browser" },
      { feature: "Free output resolution", competitor: "0.25 MP preview only", trndinn: "✅ Full original resolution" },
      { feature: "HD download", competitor: "Requires paid credits", trndinn: "✅ Free, full resolution" },
      { feature: "Processing location", competitor: "Remote servers (cloud AI)", trndinn: "✅ Local ONNX WASM in browser" },
      { feature: "Signup required", competitor: "No (but credits require account)", trndinn: "✅ Never" },
      { feature: "Cost per image", competitor: "$0.20+ for HD", trndinn: "✅ Free forever" },
    ],
    faqs: [
      {
        question: "Is there a free Remove.bg alternative?",
        answer:
          "Yes. Trndinn's background remover is a free Remove.bg alternative that processes images locally in your browser via ONNX WebAssembly — no uploads, no credits, full resolution output.",
      },
      {
        question: "Does Remove.bg upload your images?",
        answer:
          "Yes. Remove.bg sends every image to their servers for processing. Trndinn's background remover runs entirely in your browser — your images never leave your device.",
      },
      {
        question: "How does Remove.bg compare to Trndinn?",
        answer:
          "Remove.bg is a well-known cloud service with excellent AI quality, but charges for HD and uploads your images. Trndinn is browser-local, free, full-resolution, and requires no account.",
      },
    ],
    switchAngle:
      "Switch from Remove.bg to get local processing, full-resolution output, no credits, and no server uploads — all free.",
  },

  // ─────────────────────────── TinyPNG ───────────────────────────
  {
    slug: "tinypng",
    name: "TinyPNG",
    url: "https://tinypng.com",
    targetKeyword: "tinypng alternative",
    keywordDifficulty: 52,
    monthlyVolume: 740000,
    tagline: "Excellent PNG/JPEG compression tool — but uploads images to servers and has no background removal, OCR, favicon generation, QR codes, or Base64 tools.",
    overview:
      "TinyPNG is a popular online image compression service that uses smart lossy compression to reduce PNG and JPEG file sizes. It's fast and effective, but is purpose-built for compression only — it has no other image utility features.",
    positioning: [
      "TinyPNG is the go-to compression tool for web developers who need to reduce image file sizes for faster page loads. Its WebP conversion and developer API are widely used in CI/CD pipelines.",
      "The limitation: TinyPNG is a one-trick tool. It compresses — it does not convert formats beyond PNG/JPEG/WebP, remove backgrounds, extract text, generate favicons, create QR codes, or handle Base64 encoding. For any utility beyond compression, you need a different tool.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "20 images/mo via web, images uploaded to servers" },
      { name: "Developer API", price: "From $25/yr", note: "500 compressions/mo, cloud processing" },
    ],
    pricingNotes: [
      "Free web tier: 20 images per month",
      "All images uploaded to TinyPNG servers",
      "Paid API required for more than 20/month",
    ],
    weaknesses: [
      "No background removal, OCR, favicon generation, QR codes, or Base64 tools",
      "Free tier limited to 20 images per month",
      "Images uploaded to TinyPNG's servers",
      "Only supports PNG, JPEG, and WebP — no broader format coverage",
      "No batch download ZIP for free tier",
    ],
    wedgeSummary:
      "Trndinn covers 7 utility tools — background removal, OCR, favicon generation, QR codes, Base64 encoding/decoding, and profile picture creation — all free, all browser-local.",
    wedgePoints: [
      {
        title: "7 utility tools, not just compression",
        description:
          "TinyPNG compresses images. Trndinn covers Base64 encoding/decoding, AI background removal, OCR text extraction, favicon generation, QR code creation, and profile picture design — all free.",
      },
      {
        title: "No upload limit — process as many files as you need",
        description:
          "TinyPNG's free tier allows only 20 images per month. Trndinn has no monthly limit, no daily cap, and no subscription required for any tool.",
      },
      {
        title: "Local browser processing — zero uploads",
        description:
          "TinyPNG uploads every file to their cloud. Trndinn processes all files locally in your browser via Canvas API, ONNX WASM, and Tesseract.js — your files never leave your device.",
      },
      {
        title: "No API key required — just open and use",
        description:
          "TinyPNG's batch processing requires an API key and developer setup. Trndinn's tools are open in the browser — no API, no configuration, no account.",
      },
    ],
    comparisonRows: [
      { feature: "Background removal", competitor: "Not available", trndinn: "✅ AI, browser-local, free" },
      { feature: "OCR / image to text", competitor: "Not available", trndinn: "✅ Tesseract.js, 8 languages" },
      { feature: "Favicon generator", competitor: "Not available", trndinn: "✅ All sizes + webmanifest ZIP" },
      { feature: "QR code generator", competitor: "Not available", trndinn: "✅ Custom colors, PNG + SVG" },
      { feature: "Base64 encoding", competitor: "Not available", trndinn: "✅ Pure browser, instant" },
      { feature: "Free monthly limit", competitor: "20 images/month", trndinn: "✅ Unlimited" },
    ],
    faqs: [
      {
        question: "Is there a free TinyPNG alternative?",
        answer:
          "For compression, Squoosh is a good free local alternative. For a broader utility toolkit — background removal, OCR, favicon generation, QR codes — Trndinn covers all of these free with browser-local processing.",
      },
      {
        question: "Does TinyPNG have background removal?",
        answer:
          "No. TinyPNG only compresses PNG, JPEG, and WebP images. Trndinn's background remover is free, browser-local, and requires no signup.",
      },
      {
        question: "How does TinyPNG compare to Trndinn?",
        answer:
          "TinyPNG is a focused compression tool. Trndinn is a broader image utility suite — compression tools plus background removal, OCR, favicon generation, QR codes, Base64, and profile picture creation.",
      },
    ],
    switchAngle:
      "Expand beyond compression — get background removal, OCR, favicon generation, QR codes, and Base64 tools, all free and browser-local.",
  },

  // ─────────────────────────── Favicon.io ───────────────────────────
  {
    slug: "favicon-io",
    name: "Favicon.io",
    url: "https://favicon.io",
    targetKeyword: "favicon.io alternative",
    keywordDifficulty: 42,
    monthlyVolume: 380000,
    tagline: "Purpose-built favicon generator with text and emoji options — but limited to favicon generation and doesn't include background removal, OCR, Base64, or QR tools.",
    overview:
      "Favicon.io is a dedicated favicon generation service that supports generating favicons from text, emoji, and uploaded images. It's clean and focused, but the toolset begins and ends with favicon generation.",
    positioning: [
      "Favicon.io is a clean, purpose-built tool for developers who need a quick favicon. It generates from text (with custom font), emoji, or image upload, and outputs a ZIP with all standard sizes. Widely linked in developer forums as the default recommendation.",
      "The gap: Favicon.io does one thing. It has no background removal, no OCR, no Base64 encoder/decoder, no QR code generator, and no profile picture creator. Users with broader image utility needs must use multiple separate tools.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "All favicon features free, images uploaded to server" },
    ],
    pricingNotes: [
      "Free to use for favicon generation",
      "Images are uploaded to Favicon.io servers for processing",
      "No other image utility tools available",
    ],
    weaknesses: [
      "Only generates favicons — no other utility tools",
      "Images uploaded to Favicon.io servers",
      "No background removal, OCR, Base64, or QR code features",
      "Limited customization beyond size and file selection",
      "Single-purpose tool requiring multiple sites for broader workflows",
    ],
    wedgeSummary:
      "Trndinn generates favicons locally in your browser with zero upload, and bundles background removal, OCR, QR codes, Base64 encoding, and profile picture creation in the same suite.",
    wedgePoints: [
      {
        title: "Local browser processing — no server upload",
        description:
          "Favicon.io uploads your image to their servers. Trndinn generates all favicon sizes using the Canvas API in your browser — your image never leaves your device.",
      },
      {
        title: "7 utility tools in one suite",
        description:
          "Favicon.io is a single-purpose tool. Trndinn adds AI background removal, OCR text extraction, QR code generation, Base64 encoding/decoding, and emoji avatar creation — all free in the same place.",
      },
      {
        title: "Includes site.webmanifest — ready to deploy",
        description:
          "Trndinn's favicon generator includes a correctly formatted site.webmanifest in the ZIP, so the favicon package is ready to drop into any website root without further configuration.",
      },
      {
        title: "No separate tools needed for different tasks",
        description:
          "After generating a favicon with Favicon.io, removing a background, extracting text, or creating a QR code each require visiting a different site. Trndinn handles all of these in one place.",
      },
    ],
    comparisonRows: [
      { feature: "Favicon generation", competitor: "✅ Yes (text, emoji, image)", trndinn: "✅ Yes (image upload, all sizes)" },
      { feature: "File privacy", competitor: "Images uploaded to server", trndinn: "✅ Canvas API — browser local" },
      { feature: "Background removal", competitor: "Not available", trndinn: "✅ AI ONNX, browser-local" },
      { feature: "OCR / image to text", competitor: "Not available", trndinn: "✅ Tesseract.js, 8 languages" },
      { feature: "QR code generator", competitor: "Not available", trndinn: "✅ Custom colors, PNG + SVG" },
      { feature: "Base64 encoder", competitor: "Not available", trndinn: "✅ Pure browser, instant" },
    ],
    faqs: [
      {
        question: "Is there a free Favicon.io alternative?",
        answer:
          "Yes. Trndinn's favicon generator creates all required sizes locally in your browser — no upload, no server. It also bundles background removal, OCR, and QR code tools that Favicon.io doesn't have.",
      },
      {
        question: "How does Favicon.io compare to Trndinn?",
        answer:
          "Favicon.io is a clean, single-purpose favicon tool that uploads images to their servers. Trndinn generates favicons locally in the browser and includes six other free utility tools in the same suite.",
      },
      {
        question: "Does Favicon.io upload my image?",
        answer:
          "Yes. Favicon.io processes image uploads on their servers. Trndinn's favicon generator uses the Canvas API locally — your image is never uploaded.",
      },
    ],
    switchAngle:
      "Get browser-local favicon generation with zero upload, plus six more utility tools — background removal, OCR, QR codes, Base64, and profile pictures — all in one place.",
  },

  // ─────────────────────────── OnlineOCR.net ───────────────────────────
  {
    slug: "onlineocr",
    name: "OnlineOCR.net",
    url: "https://www.onlineocr.net",
    targetKeyword: "onlineocr alternative",
    keywordDifficulty: 38,
    monthlyVolume: 270000,
    tagline: "Established OCR service with document format output — but requires email registration for more than 15 pages/hour and uploads files to remote servers.",
    overview:
      "OnlineOCR.net is a cloud-based OCR service supporting image and PDF input with output in Word, Excel, or plain text formats. It's useful for document conversion workflows, but requires account creation for extended use and uploads all files to remote servers.",
    positioning: [
      "OnlineOCR.net targets office workers who need to convert scanned documents to editable Word or Excel files. Its document output formats (DOCX, XLSX) differentiate it from basic OCR tools that only output plain text.",
      "The friction: guest access is limited to 15 pages per hour. Beyond that, email registration is required. All files are uploaded to OnlineOCR.net's servers — there is no local processing option. For simple image-to-text extraction, the registration requirement adds unnecessary friction.",
    ],
    pricingPlans: [
      { name: "Guest", price: "$0", note: "15 pages/hour, email for results, files uploaded to server" },
      { name: "Registered (Free)", price: "$0", note: "Unlimited pages, requires email account, files still uploaded" },
      { name: "Pro", price: "From $4.99/mo", note: "Higher limits, API access, cloud processing" },
    ],
    pricingNotes: [
      "Guest access limited to 15 pages per hour",
      "Email registration required for unlimited use",
      "All files uploaded to OnlineOCR.net servers regardless of tier",
    ],
    weaknesses: [
      "Requires email registration for more than 15 pages/hour",
      "Files uploaded to OnlineOCR.net servers",
      "Dated UX with significant friction",
      "No background removal, favicon, QR code, or Base64 tools",
      "Results emailed rather than instant browser download in some workflows",
    ],
    wedgeSummary:
      "Trndinn's OCR runs via Tesseract.js WebAssembly in your browser — no upload, no email required, 8 languages, instant text download, completely free.",
    wedgePoints: [
      {
        title: "No registration — open and use",
        description:
          "OnlineOCR.net requires email registration for more than 15 pages per hour. Trndinn's OCR tool requires zero account — open the page, upload an image, extract text.",
      },
      {
        title: "Local browser processing — no file upload",
        description:
          "OnlineOCR.net uploads all files to remote servers. Trndinn's OCR runs via Tesseract.js WebAssembly in your browser — images are processed locally and never transmitted anywhere.",
      },
      {
        title: "8 languages supported — no extra configuration",
        description:
          "Trndinn supports English, Spanish, French, German, Chinese (Simplified), Japanese, Hindi, and Arabic. Language data is downloaded on demand and cached — no account required to switch languages.",
      },
      {
        title: "Part of a broader utility suite",
        description:
          "OnlineOCR.net is OCR-only. After extracting text, users need other sites for background removal, favicon generation, or QR codes. Trndinn provides all of these in one free suite.",
      },
    ],
    comparisonRows: [
      { feature: "File privacy", competitor: "Uploaded to OnlineOCR.net servers", trndinn: "✅ Never leaves your browser" },
      { feature: "Registration required", competitor: "Yes (for >15 pages/hour)", trndinn: "✅ Never" },
      { feature: "Languages supported", competitor: "46 languages", trndinn: "8 most common languages" },
      { feature: "Processing location", competitor: "Remote cloud servers", trndinn: "✅ Local Tesseract.js WASM" },
      { feature: "Instant download", competitor: "Sometimes emailed", trndinn: "✅ Instant browser download" },
      { feature: "Free page limit", competitor: "15 pages/hour (guest)", trndinn: "✅ Unlimited" },
    ],
    faqs: [
      {
        question: "Is there a free OnlineOCR alternative?",
        answer:
          "Yes. Trndinn's image-to-text tool is a free OnlineOCR alternative that processes images locally in your browser — no upload, no email registration, 8 languages, instant text download.",
      },
      {
        question: "Does OnlineOCR.net upload my files?",
        answer:
          "Yes. OnlineOCR.net processes all files on their servers. Trndinn's OCR tool runs via Tesseract.js WebAssembly in your browser — your images never leave your device.",
      },
      {
        question: "How does OnlineOCR compare to Trndinn?",
        answer:
          "OnlineOCR.net supports more languages (46 vs 8) and outputs Word/Excel formats. Trndinn is simpler — browser-local, no registration, instant plain text download, and it's part of a broader free utility suite.",
      },
    ],
    switchAngle:
      "Switch from OnlineOCR for browser-local processing, no email registration, instant download, and a broader free utility toolkit.",
  },

  // ─────────────────────────── QR Code Monkey ───────────────────────────
  {
    slug: "qr-code-monkey",
    name: "QR Code Monkey",
    url: "https://www.qrcode-monkey.com",
    targetKeyword: "qr code monkey alternative",
    keywordDifficulty: 35,
    monthlyVolume: 450000,
    tagline: "Feature-rich QR code designer with logo embedding — but adds branding on free downloads and has no image utility tools beyond QR generation.",
    overview:
      "QR Code Monkey is a popular QR code generator with advanced design options: logo embedding, custom eye shapes, gradient colors, and frames. It's the go-to for branded QR codes. The free tier, however, adds QR Code Monkey attribution on certain download formats.",
    positioning: [
      "QR Code Monkey targets marketing teams and brand managers who need polished, on-brand QR codes — logo embedded, custom eye shapes, gradient fills. Its design depth exceeds most free QR generators.",
      "For simple URL or text QR codes without branding, the tool is more complex than necessary. The free tier includes QR Code Monkey attribution on some formats and lacks the broader utility toolkit — there is no background removal, OCR, favicon generation, or Base64 encoding.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Basic QR codes with branding on some formats, server-generated" },
      { name: "Pro", price: "From $4.99/mo", note: "No branding, API access, high-res, server-generated" },
    ],
    pricingNotes: [
      "Free tier includes QR Code Monkey attribution on certain download formats",
      "QR codes generated on their servers",
      "Pro required to remove branding and access API",
    ],
    weaknesses: [
      "Free downloads include QR Code Monkey branding on some formats",
      "QR codes generated on their servers — requires internet connection",
      "No background removal, OCR, favicon, or Base64 tools",
      "Complexity overkill for users who just need a clean URL QR code",
      "Pro subscription required to remove branding",
    ],
    wedgeSummary:
      "Trndinn generates QR codes locally in your browser — no server, no branding, custom colors, PNG and SVG download, completely free. Plus background removal, OCR, favicon generation, and Base64 tools.",
    wedgePoints: [
      {
        title: "No branding — clean downloads, always free",
        description:
          "QR Code Monkey adds attribution on free tier downloads. Trndinn generates QR codes via the qrcode library in your browser — every PNG and SVG download is completely clean, no attribution, no watermark.",
      },
      {
        title: "Browser-local — no server required",
        description:
          "QR Code Monkey sends QR generation to their servers. Trndinn generates QR codes entirely client-side using the qrcode npm library — works offline after page load, no server round-trip.",
      },
      {
        title: "Custom colors and ECC — no Pro required",
        description:
          "Trndinn supports custom foreground and background colors, error correction levels (L/M/Q/H), and margin control — all free. QR Code Monkey's advanced design features require a Pro subscription.",
      },
      {
        title: "Broader utility suite",
        description:
          "After making a QR code with QR Code Monkey, you still need separate tools for background removal, OCR, favicons, and Base64. Trndinn bundles all of these in one free suite.",
      },
    ],
    comparisonRows: [
      { feature: "Free download branding", competitor: "Attribution on some formats", trndinn: "✅ No branding ever" },
      { feature: "Processing location", competitor: "Server-generated", trndinn: "✅ Browser-local (qrcode lib)" },
      { feature: "Custom colors (free)", competitor: "Limited on free tier", trndinn: "✅ Full custom colors free" },
      { feature: "PNG download", competitor: "✅ Yes", trndinn: "✅ Yes" },
      { feature: "SVG download", competitor: "Paid only", trndinn: "✅ Free SVG download" },
      { feature: "Other utility tools", competitor: "QR only", trndinn: "✅ 7-tool suite (BG, OCR, favicon…)" },
    ],
    faqs: [
      {
        question: "Is there a free QR Code Monkey alternative?",
        answer:
          "Yes. Trndinn's QR code generator is a free alternative — no branding, custom colors, PNG and SVG download, error correction control, all browser-local. And it's part of a broader free utility suite.",
      },
      {
        question: "Does QR Code Monkey add branding on free downloads?",
        answer:
          "Yes, some formats include QR Code Monkey attribution on the free tier. Trndinn's QR codes are always clean with no attribution or watermark on any download format.",
      },
      {
        question: "How does QR Code Monkey compare to Trndinn?",
        answer:
          "QR Code Monkey has more advanced logo embedding and eye shape design options. Trndinn is simpler — custom colors, ECC, PNG and SVG — all free, no branding, browser-local. Plus six other utility tools.",
      },
    ],
    switchAngle:
      "Switch from QR Code Monkey for clean downloads with no branding, browser-local generation, free SVG, and a broader utility toolkit.",
  },
];

/** All image utility competitor slugs. */
export const IMAGE_UTILITY_COMPETITOR_SLUGS: string[] = IMAGE_UTILITY_COMPETITORS.map(
  (c) => c.slug
);

/** Look up an image utility competitor by slug. */
export function getImageUtilityCompetitor(
  slug: string
): ImageUtilityCompetitor | undefined {
  return IMAGE_UTILITY_COMPETITORS.find((c) => c.slug === slug);
}

/**
 * Returns up to 4 related competitors (all except the current one).
 * Used for the "related comparisons" section on compare/alternative pages.
 */
export function getRelatedImageUtilityCompetitors(
  currentSlug: string
): ImageUtilityCompetitor[] {
  return IMAGE_UTILITY_COMPETITORS.filter((c) => c.slug !== currentSlug).slice(0, 4);
}
