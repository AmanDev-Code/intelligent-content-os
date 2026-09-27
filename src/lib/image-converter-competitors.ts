/**
 * Image Converter competitor dataset — single source of truth for
 * /alternatives/{slug} and /compare/trndinn-vs-{slug} pages.
 *
 * Same shape as bio-generator-competitors.ts.
 * 5 competitors: Convertio, iLoveIMG, CloudConvert, Zamzar, Squoosh.
 */

export type ImageConverterPricingPlan = {
  name: string;
  price: string;
  note?: string;
};

export type ImageConverterComparisonRow = {
  feature: string;
  competitor: string;
  trndinn: string;
};

export type ImageConverterFaq = {
  question: string;
  answer: string;
};

export type ImageConverterWedgePoint = {
  title: string;
  description: string;
};

export type ImageConverterCompetitor = {
  slug: string;
  name: string;
  url: string;
  targetKeyword: string;
  keywordDifficulty: number;
  monthlyVolume: number;
  tagline: string;
  overview: string;
  positioning: string[];
  pricingPlans: ImageConverterPricingPlan[];
  pricingNotes: string[];
  weaknesses: string[];
  wedgeSummary: string;
  wedgePoints: ImageConverterWedgePoint[];
  comparisonRows: ImageConverterComparisonRow[];
  faqs: ImageConverterFaq[];
  switchAngle: string;
};

export const IMAGE_CONVERTER_COMPETITORS: readonly ImageConverterCompetitor[] = [
  // ─────────────────────────── Convertio ───────────────────────────
  {
    slug: "convertio",
    name: "Convertio",
    url: "https://convertio.co",
    targetKeyword: "convertio image converter",
    monthlyVolume: 2200000,
    keywordDifficulty: 72,
    tagline: "Popular cloud-based file converter with 300+ formats — but uploads your files to remote servers and gates batch conversion behind a paid plan.",
    overview: "Convertio is a cloud-based file converter supporting 300+ formats across documents, images, audio, and video. It processes files on remote servers, which means your images leave your device.",
    positioning: [
      "Convertio is one of the most recognized file conversion brands online, built around a simple paste-or-upload interface that handles 300+ format combinations. Its breadth is its main selling point — documents, audio, video, and images all in one place.",
      "The trade-off: all processing happens on Convertio's remote servers. Files are uploaded, converted, and stored temporarily in the cloud. The free tier is limited to 100 MB per file and 25 conversions per day, and batch conversion requires a paid subscription.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "100 MB limit, 25 conversions/day, cloud processing" },
      { name: "Light", price: "$9.99/mo", note: "500 MB limit, 25 conversions/day" },
      { name: "Premium", price: "$14.99/mo", note: "1 GB limit, unlimited conversions" },
    ],
    pricingNotes: [
      "Free tier caps at 25 conversions per day and 100 MB per file",
      "Batch conversion requires paid plan",
      "Files are uploaded to Convertio's servers regardless of tier",
    ],
    weaknesses: [
      "Files uploaded to remote servers — privacy risk for sensitive images",
      "Free tier limited to 25 conversions per day",
      "Batch conversion requires paid subscription",
      "Cloud processing introduces latency and network dependency",
      "No offline capability — requires internet for every conversion",
    ],
    wedgeSummary: "Trndinn converts images entirely in your browser using the Canvas API — zero uploads, zero server round-trips, unlimited batch processing, and instant results.",
    wedgePoints: [
      {
        title: "Zero uploads — images never leave your device",
        description: "Convertio uploads every file to their servers. Trndinn's converter runs entirely in your browser via the Canvas API. Your images are processed locally and never transmitted anywhere.",
      },
      {
        title: "Unlimited conversions — no daily cap",
        description: "Convertio's free tier allows 25 conversions per day. Trndinn has no daily limit, no file count cap, and no subscription required to convert as many images as you need.",
      },
      {
        title: "Instant processing — no upload/download round-trip",
        description: "Cloud converters add latency for upload, server processing, and download. Trndinn converts locally in milliseconds — a 10 MB PNG to JPG completes before Convertio finishes uploading.",
      },
      {
        title: "33 image formats — purpose-built for images",
        description: "Trndinn focuses on the 33 most common image conversion pairs with a tool dedicated to each one. Convertio's generalist approach means image tools aren't optimized for quality or speed.",
      },
    ],
    comparisonRows: [
      { feature: "File privacy", competitor: "Uploaded to Convertio servers", trndinn: "✅ Never leaves your browser" },
      { feature: "Free conversions/day", competitor: "25 per day", trndinn: "✅ Unlimited" },
      { feature: "Batch conversion", competitor: "Paid plan only", trndinn: "✅ Free, unlimited" },
      { feature: "Processing speed", competitor: "Upload + server + download", trndinn: "✅ Instant — local Canvas API" },
      { feature: "File size limit", competitor: "100 MB (free)", trndinn: "✅ Limited by device RAM only" },
      { feature: "Signup required", competitor: "No (but account unlocks limits)", trndinn: "✅ Never" },
    ],
    faqs: [
      { question: "Is Convertio safe to use?", answer: "Convertio uploads files to remote servers for processing. For sensitive images, this is a privacy risk. Trndinn converts in your browser — images never leave your device." },
      { question: "Is there a free Convertio alternative?", answer: "Yes. Trndinn is a free Convertio alternative that converts images locally in your browser. No uploads, no daily limits, no signup required." },
      { question: "How do I convert images without uploading them?", answer: "Use Trndinn's image converter. All 33 conversion tools run entirely in your browser via the Canvas API. Files are processed locally and never transmitted to any server." },
    ],
    switchAngle: "Switch from Convertio to get local processing, no upload limits, and unlimited daily conversions — all free.",
  },

  // ─────────────────────────── iLoveIMG ───────────────────────────
  {
    slug: "iloveimg",
    name: "iLoveIMG",
    url: "https://iloveimg.com",
    targetKeyword: "iloveimg",
    monthlyVolume: 450000,
    keywordDifficulty: 65,
    tagline: "Image editing suite with compression, resizing, and conversion — but cloud-based processing and a hard 30-image free tier limit.",
    overview: "iLoveIMG is a browser-accessible image tool suite covering compression, resizing, cropping, and format conversion. Files are processed on their servers and temporarily stored in the cloud.",
    positioning: [
      "iLoveIMG positions itself as a complete image editing suite for non-technical users — compression, resizing, cropping, watermarking, and conversion in one place. The UX is polished and beginner-friendly.",
      "The limitation: all processing happens on iLoveIMG's servers. The free tier allows up to 30 images per task and limits advanced features. Their conversion tool supports common formats but doesn't cover the full range of modern formats like AVIF.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "30 images per task, cloud processing, ads" },
      { name: "Premium", price: "$3.75/mo", note: "Unlimited images, no ads, priority processing" },
    ],
    pricingNotes: [
      "Free tier limited to 30 images per task",
      "All processing happens on iLoveIMG's servers",
      "Ads on the free tier",
    ],
    weaknesses: [
      "Files uploaded to remote servers",
      "Free tier limited to 30 images per task",
      "Ads on the free tier",
      "Limited AVIF and ICO support",
      "Network-dependent — slow on poor connections",
    ],
    wedgeSummary: "Trndinn processes all images locally in your browser. No uploads, no 30-image cap, no ads, and full support for AVIF, ICO, TIFF, and HEIC.",
    wedgePoints: [
      {
        title: "Local processing — no uploads, no privacy risk",
        description: "iLoveIMG uploads your images to their servers. Trndinn's tools run entirely in your browser — images are processed locally and never transmitted anywhere.",
      },
      {
        title: "No image count limit — process as many as you need",
        description: "iLoveIMG's free tier caps at 30 images per task. Trndinn has no per-task limit, no daily limit, and no subscription to unlock batch processing.",
      },
      {
        title: "AVIF, ICO, HEIC support — every modern format",
        description: "Trndinn covers all 33 conversion pairs including AVIF (next-gen), ICO (favicons), HEIC (iPhone photos), and TIFF (print). iLoveIMG's converter doesn't support AVIF or ICO.",
      },
      {
        title: "Zero ads — clean, distraction-free interface",
        description: "iLoveIMG shows ads on the free tier. Trndinn has no ads, no upsells during conversion, and no watermarks on output files.",
      },
    ],
    comparisonRows: [
      { feature: "File privacy", competitor: "Uploaded to iLoveIMG servers", trndinn: "✅ Never leaves your browser" },
      { feature: "Free image limit", competitor: "30 images per task", trndinn: "✅ Unlimited" },
      { feature: "AVIF support", competitor: "Not supported", trndinn: "✅ Full AVIF support" },
      { feature: "ICO / favicon support", competitor: "Not supported", trndinn: "✅ PNG/JPG/WebP → ICO" },
      { feature: "Ads on free tier", competitor: "Yes", trndinn: "✅ No ads" },
      { feature: "Signup required", competitor: "No (account unlocks features)", trndinn: "✅ Never" },
    ],
    faqs: [
      { question: "Is there a free iLoveIMG alternative?", answer: "Yes. Trndinn offers all core image conversions for free — locally in your browser, with no upload limits, no ads, and support for AVIF, HEIC, and ICO formats iLoveIMG doesn't cover." },
      { question: "How does iLoveIMG compare to Trndinn?", answer: "iLoveIMG is a polished cloud-based suite. Trndinn is browser-native — faster on good hardware, fully private, no 30-image cap, and supports AVIF and ICO formats." },
      { question: "Does iLoveIMG support AVIF?", answer: "No. Trndinn supports AVIF conversion (JPG, PNG, WebP → AVIF and back), making it the better choice for web performance optimization." },
    ],
    switchAngle: "Switch from iLoveIMG for local processing, unlimited batch, AVIF/ICO support, and zero ads.",
  },

  // ─────────────────────────── CloudConvert ───────────────────────────
  {
    slug: "cloudconvert",
    name: "CloudConvert",
    url: "https://cloudconvert.com",
    targetKeyword: "cloudconvert image",
    monthlyVolume: 740000,
    keywordDifficulty: 68,
    tagline: "Professional cloud API with 200+ formats — but charges per conversion after 25 free daily conversions and uploads everything to Amazon S3.",
    overview: "CloudConvert is a professional-grade file conversion API and web tool supporting 200+ formats with advanced options. It's built for developers and businesses that need API access to conversion workflows.",
    positioning: [
      "CloudConvert is the developer-first choice for file conversion. Its API integrates into business workflows, supports webhooks, custom conversion options, and enterprise SLAs. The web interface is a consumer-friendly layer on top of the same infrastructure.",
      "For casual image conversion, CloudConvert is overkill and expensive. The free tier allows 25 conversions per day, after which you pay per conversion minute. Files are processed on AWS infrastructure and stored temporarily in the cloud.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "25 conversions/day, files uploaded to AWS" },
      { name: "Pay As You Go", price: "From $6/100 mins", note: "Charged per conversion minute" },
      { name: "Packages", price: "From $13/mo", note: "Prepaid conversion minutes" },
    ],
    pricingNotes: [
      "Free tier: 25 conversions/day, no API access",
      "Paid tiers billed per conversion minute",
      "Files stored on AWS S3 during processing",
    ],
    weaknesses: [
      "Files uploaded to Amazon S3 — cloud storage during conversion",
      "Free tier limited to 25 conversions per day",
      "Complex pricing — billed per conversion minute",
      "Overkill for simple image format conversion",
      "Requires internet connection — no local processing",
    ],
    wedgeSummary: "Trndinn converts images locally in your browser — no AWS uploads, no per-conversion billing, and no 25-conversion daily cap. It's the right tool when you just need to convert images.",
    wedgePoints: [
      {
        title: "No cloud uploads — complete privacy",
        description: "CloudConvert uploads files to Amazon S3 for processing. Trndinn converts entirely in your browser. Your images are processed locally and never stored anywhere.",
      },
      {
        title: "Free and unlimited — no conversion minute billing",
        description: "CloudConvert charges per conversion minute after 25 free daily conversions. Trndinn is completely free with no conversion caps, no billing, and no account needed.",
      },
      {
        title: "Instant results — no API overhead",
        description: "CloudConvert routes requests through an API, job queue, and cloud infrastructure. Trndinn converts locally in milliseconds with no network round-trip.",
      },
      {
        title: "Purpose-built for images — not a generalist converter",
        description: "CloudConvert handles every file type. Trndinn focuses on the 33 most common image conversion pairs, with quality sliders, HEIC support, and ICO generation built specifically for images.",
      },
    ],
    comparisonRows: [
      { feature: "File privacy", competitor: "Uploaded to Amazon S3", trndinn: "✅ Never leaves your browser" },
      { feature: "Free conversions/day", competitor: "25 per day", trndinn: "✅ Unlimited" },
      { feature: "Pricing model", competitor: "Per conversion minute", trndinn: "✅ Free forever" },
      { feature: "Processing location", competitor: "Cloud (AWS)", trndinn: "✅ Local browser (Canvas API)" },
      { feature: "Setup required", competitor: "API key for developers", trndinn: "✅ None — open URL and convert" },
      { feature: "Signup required", competitor: "Yes (free tier)", trndinn: "✅ Never" },
    ],
    faqs: [
      { question: "Is there a free CloudConvert alternative?", answer: "Yes. Trndinn is a free CloudConvert alternative for image conversion. No account, no conversion limits, no billing — images converted locally in your browser." },
      { question: "Does CloudConvert upload files to the cloud?", answer: "Yes. CloudConvert processes files on Amazon S3. Trndinn converts in your browser — files never leave your device." },
      { question: "Is CloudConvert free?", answer: "CloudConvert offers 25 free conversions per day. After that, you pay per conversion minute. Trndinn is free with no daily limit." },
    ],
    switchAngle: "Switch from CloudConvert for private local processing, no per-conversion billing, and unlimited batch conversion.",
  },

  // ─────────────────────────── Zamzar ───────────────────────────
  {
    slug: "zamzar",
    name: "Zamzar",
    url: "https://zamzar.com",
    targetKeyword: "zamzar image converter",
    monthlyVolume: 550000,
    keywordDifficulty: 60,
    tagline: "Established cloud converter founded in 2006 — but sends results by email, limits free conversions to 3 per day, and stores files on remote servers.",
    overview: "Zamzar is one of the original online file converters, founded in 2006. It supports a wide range of file types and offers both web and API interfaces. Converted files can be delivered via email or direct download.",
    positioning: [
      "Zamzar built its reputation as the first mainstream online file converter. Its email-delivery model was practical in 2006 when browsers couldn't handle large file processing, but it's now a relic compared to modern browser-native tools.",
      "The free tier allows only 3 conversions per day, files are uploaded to Zamzar's servers, and results are optionally delivered by email. Paid plans unlock higher limits and API access. For simple image conversion, the workflow adds unnecessary friction.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "3 conversions/day, 50 MB file limit, cloud processing" },
      { name: "Basic", price: "$9/mo", note: "25 conversions/day, 200 MB limit" },
      { name: "Pro", price: "$20/mo", note: "100 conversions/day, 400 MB limit" },
    ],
    pricingNotes: [
      "Free tier: 3 conversions/day with 50 MB file limit",
      "Files uploaded to Zamzar servers during conversion",
      "Email delivery is still the primary workflow trigger",
    ],
    weaknesses: [
      "Free tier limited to only 3 conversions per day",
      "Files uploaded to Zamzar's remote servers",
      "Email-delivery workflow adds friction",
      "Dated UX compared to modern alternatives",
      "Limited support for newer formats like AVIF",
    ],
    wedgeSummary: "Trndinn converts images locally in your browser — no uploads, no 3-conversion daily cap, no email workflow, and instant results.",
    wedgePoints: [
      {
        title: "Unlimited conversions — not just 3 per day",
        description: "Zamzar's free tier allows only 3 conversions per day. Trndinn has no daily limit, no file count cap, and no subscription required regardless of how many images you convert.",
      },
      {
        title: "Instant download — no email workflow",
        description: "Zamzar's legacy model involves emailing converted files. Trndinn processes locally and shows a download button in seconds — no inbox check, no waiting.",
      },
      {
        title: "Zero uploads — images never leave your device",
        description: "Zamzar uploads every file to its servers. Trndinn converts in your browser via the Canvas API — your images are never transmitted anywhere.",
      },
      {
        title: "Modern format support — AVIF, HEIC, ICO",
        description: "Zamzar's image support doesn't cover AVIF or ICO generation. Trndinn supports all 33 modern conversion pairs including next-gen AVIF and favicon ICO output.",
      },
    ],
    comparisonRows: [
      { feature: "Free conversions/day", competitor: "3 per day", trndinn: "✅ Unlimited" },
      { feature: "File privacy", competitor: "Uploaded to Zamzar servers", trndinn: "✅ Never leaves your browser" },
      { feature: "Delivery method", competitor: "Email or direct download", trndinn: "✅ Instant browser download" },
      { feature: "Free file size limit", competitor: "50 MB", trndinn: "✅ Limited by device RAM only" },
      { feature: "AVIF support", competitor: "Not supported", trndinn: "✅ Full AVIF support" },
      { feature: "ICO / favicon support", competitor: "Limited", trndinn: "✅ PNG/JPG/WebP → ICO" },
    ],
    faqs: [
      { question: "Is there a free Zamzar alternative?", answer: "Yes. Trndinn is a free Zamzar alternative with no 3-conversion daily limit, no file uploads, instant downloads, and support for AVIF and ICO formats Zamzar doesn't cover." },
      { question: "How does Zamzar compare to Trndinn?", answer: "Zamzar is cloud-based with a 3-conversion daily limit on its free tier. Trndinn is browser-native — unlimited conversions, local processing, instant download, no email workflow." },
      { question: "Why does Zamzar send files by email?", answer: "Zamzar was built in 2006 when cloud processing took minutes. Today, browser-native converters like Trndinn process images in milliseconds locally — no email needed." },
    ],
    switchAngle: "Switch from Zamzar for unlimited daily conversions, instant downloads, and local browser processing with no uploads.",
  },

  // ─────────────────────────── Squoosh ───────────────────────────
  {
    slug: "squoosh",
    name: "Squoosh",
    url: "https://squoosh.app",
    targetKeyword: "squoosh image compressor",
    monthlyVolume: 110000,
    keywordDifficulty: 45,
    tagline: "Google's excellent local image compressor — but handles one image at a time with no batch mode and no ICO, TIFF, or GIF output.",
    overview: "Squoosh is Google's open-source image compression tool that runs entirely in the browser. It's excellent for comparing compression codecs side-by-side and for single-image optimization.",
    positioning: [
      "Squoosh is arguably the best single-image compression tool available. Built by Google Chrome Labs, it runs entirely in your browser via WebAssembly, supports AVIF/WebP/MozJPEG encoding, and shows a live side-by-side quality comparison.",
      "The gap: Squoosh is a single-file, single-tab tool. There is no batch mode — you must open a new tab for each image. Output formats are limited to web-optimized codecs (MozJPEG, WebP, AVIF, OxiPNG) — no ICO generation, no TIFF output, and no HEIC input support.",
    ],
    pricingPlans: [
      { name: "Free (open source)", price: "$0", note: "All features free — Google Chrome Labs project" },
    ],
    pricingNotes: [
      "Completely free and open source",
      "No batch conversion — one image per session",
      "Limited output formats — no ICO, TIFF, BMP, GIF output",
    ],
    weaknesses: [
      "No batch conversion — one image at a time only",
      "No ICO, TIFF, BMP, or GIF output formats",
      "No HEIC input support",
      "Can feel complex for users who just want a quick conversion",
      "No download-all or ZIP functionality",
    ],
    wedgeSummary: "Trndinn adds batch conversion, 33 format pairs (including ICO, TIFF, GIF, HEIC), and a simpler workflow on top of the same browser-native, privacy-first approach Squoosh pioneered.",
    wedgePoints: [
      {
        title: "Batch conversion — process all images at once",
        description: "Squoosh processes one image per session. Trndinn supports batch upload and converts all files at once, downloadable individually or as a ZIP.",
      },
      {
        title: "33 format pairs — not just web codecs",
        description: "Squoosh outputs MozJPEG, WebP, AVIF, and OxiPNG. Trndinn covers all 33 conversion pairs including ICO (favicons), TIFF (print), BMP (legacy), GIF, and HEIC input.",
      },
      {
        title: "HEIC input — convert iPhone photos",
        description: "Squoosh doesn't support HEIC input from iPhones. Trndinn's HEIC decoder (WASM-based) converts .heic files to JPG or PNG directly in your browser.",
      },
      {
        title: "Simpler UX for conversions — no codec tuning required",
        description: "Squoosh's codec picker is powerful but overwhelming for users who just need to convert PNG to JPG. Trndinn presents a single purpose-built tool per conversion pair.",
      },
    ],
    comparisonRows: [
      { feature: "Batch conversion", competitor: "Not supported (1 at a time)", trndinn: "✅ Full batch support" },
      { feature: "ICO / favicon output", competitor: "Not supported", trndinn: "✅ PNG/JPG/WebP → ICO" },
      { feature: "TIFF output", competitor: "Not supported", trndinn: "✅ Any format → TIFF" },
      { feature: "HEIC input", competitor: "Not supported", trndinn: "✅ HEIC → JPG/PNG" },
      { feature: "GIF output", competitor: "Not supported", trndinn: "✅ JPG/PNG/WebP → GIF" },
      { feature: "File privacy", competitor: "✅ Local (WASM)", trndinn: "✅ Local (Canvas API + WASM)" },
    ],
    faqs: [
      { question: "Is there a Squoosh alternative with batch conversion?", answer: "Yes. Trndinn is a browser-native image converter like Squoosh but with batch conversion, ICO/TIFF/HEIC support, and 33 dedicated conversion tools — all free, no signup." },
      { question: "How does Squoosh compare to Trndinn?", answer: "Squoosh is the best single-image codec optimizer. Trndinn focuses on format conversion — supporting 33 pairs, batch mode, HEIC input, and ICO output that Squoosh doesn't have." },
      { question: "Does Squoosh support HEIC files?", answer: "No. Squoosh cannot open HEIC files from iPhones. Trndinn's HEIC-to-JPG and HEIC-to-PNG tools handle this with a WASM decoder, entirely in your browser." },
    ],
    switchAngle: "Add batch conversion and HEIC/ICO/TIFF support to the local-first approach you love about Squoosh.",
  },
];

/** All image converter competitor slugs. */
export const IMAGE_CONVERTER_COMPETITOR_SLUGS: string[] = IMAGE_CONVERTER_COMPETITORS.map(
  (c) => c.slug
);

/** Lookup an image converter competitor by slug. */
export function getImageConverterCompetitor(
  slug: string
): ImageConverterCompetitor | undefined {
  return IMAGE_CONVERTER_COMPETITORS.find((c) => c.slug === slug);
}

/**
 * Returns up to 4 related competitors (all except the current one).
 * Used for the "related comparisons" section on compare/alternative pages.
 */
export function getRelatedImageConverterCompetitors(
  currentSlug: string
): ImageConverterCompetitor[] {
  return IMAGE_CONVERTER_COMPETITORS.filter((c) => c.slug !== currentSlug).slice(0, 4);
}
