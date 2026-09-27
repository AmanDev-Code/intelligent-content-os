/**
 * SEO alias slugs for the 7 image utility tools in Phase 4.
 *
 * 5 aliases per tool = 35 total alias URLs. Same interface as
 * image-converter-aliases.ts — each alias renders the same underlying
 * tool view but with a unique H1, eyebrow, subline, and metadata for
 * a distinct search-intent keyword cluster. Each self-canonicalizes so
 * Google indexes it independently.
 */

// Re-use the same ConverterAlias interface shape, typed locally as UtilityAlias
export interface UtilityAlias {
  /** URL slug — the full path is /tools/<slug> */
  slug: string;
  /** Primary tool slug this alias belongs to (for tool resolution). */
  canonical: string;
  /** SEO title — ≤50 chars (template appends " | Trndinn"). */
  seoTitle: string;
  /** SEO meta description — 140-160 chars. */
  seoDescription: string;
  /** Keywords for meta + internal reporting. */
  keywords: string[];
  /** H1 text before the gradient-highlighted word. */
  h1Prefix: string;
  /** The gradient-highlighted word/phrase in the H1. */
  h1Highlight: string;
  /** H1 text after the gradient word. */
  h1Suffix: string;
  /** Small primary-tinted eyebrow badge above the hero. */
  eyebrow: string;
  /** Hero paragraph shown under the H1. */
  heroSubline: string;
}

const ALIASES: UtilityAlias[] = [
  // ═══════════════════════ image-to-base64 ═══════════════════════
  {
    slug: "base64-encode-image",
    canonical: "image-to-base64",
    seoTitle: "Base64 Encode Image Online — Free, No Upload",
    seoDescription: "Base64 encode any image online free. No upload, no signup. Converts PNG, JPG, WebP to a data URI string instantly in your browser.",
    keywords: ["base64 encode image", "base64 encode image online"],
    h1Prefix: "Base64 encode",
    h1Highlight: "any image",
    h1Suffix: "online, free.",
    eyebrow: "Base64 Image Encoder — browser-based, zero upload",
    heroSubline: "Upload a PNG, JPG, or WebP and instantly get a Base64 data URI. Copy to clipboard or download as .txt — runs entirely in your browser.",
  },
  {
    slug: "convert-image-to-base64",
    canonical: "image-to-base64",
    seoTitle: "Convert Image to Base64 — Free Online Tool",
    seoDescription: "Convert any image to Base64 online free. No signup, no file upload to server. Get your data URI string instantly — browser-based processing.",
    keywords: ["convert image to base64", "convert image to base64 online"],
    h1Prefix: "Convert",
    h1Highlight: "image to Base64",
    h1Suffix: "— free, instant.",
    eyebrow: "Image to Base64 Converter — no server, no signup",
    heroSubline: "Convert any image file to a Base64-encoded data URI string. Paste straight into HTML, CSS, or JSON — no hosting needed.",
  },
  {
    slug: "image-to-data-url",
    canonical: "image-to-base64",
    seoTitle: "Image to Data URL Converter — Free Online",
    seoDescription: "Convert an image to a data URL (data URI) online free. Browser-based — no upload. Supports PNG, JPG, WebP, GIF, SVG. Copy or download instantly.",
    keywords: ["image to data url", "image data url converter", "convert image to data uri"],
    h1Prefix: "Convert image to",
    h1Highlight: "data URL",
    h1Suffix: "— inline it anywhere.",
    eyebrow: "Image to Data URL — embed images without file hosting",
    heroSubline: "Turn any image into a data: URI you can embed directly in HTML or CSS. Runs in your browser — nothing is uploaded.",
  },
  {
    slug: "image-base64-converter",
    canonical: "image-to-base64",
    seoTitle: "Image Base64 Converter — Free, Browser-Based",
    seoDescription: "Free image Base64 converter. Encode PNG, JPG, WebP, GIF to Base64 data URI. No upload, no login. Works in any browser instantly.",
    keywords: ["image base64 converter", "image to base64 converter free"],
    h1Prefix: "Image",
    h1Highlight: "Base64 converter",
    h1Suffix: "— free online.",
    eyebrow: "Free Image Base64 Converter — works in any browser",
    heroSubline: "Encode any image as Base64 and get a data URI you can use directly in code. Zero server uploads — all processing stays on your device.",
  },
  {
    slug: "encode-image-base64",
    canonical: "image-to-base64",
    seoTitle: "Encode Image as Base64 — Free Online Tool",
    seoDescription: "Encode any image as a Base64 string online. Free, no signup, no upload to server. Supports PNG, JPG, WebP, SVG. Download result as .txt.",
    keywords: ["encode image base64", "encode image as base64"],
    h1Prefix: "Encode",
    h1Highlight: "image as Base64",
    h1Suffix: "for free.",
    eyebrow: "Encode Image as Base64 — zero upload, instant result",
    heroSubline: "Encode any image file as a Base64 data URI string — copy it or download as a .txt file. Your image never leaves your browser.",
  },

  // ═══════════════════════ base64-to-image ═══════════════════════
  {
    slug: "decode-base64-image",
    canonical: "base64-to-image",
    seoTitle: "Decode Base64 Image — Free Online Decoder",
    seoDescription: "Decode a Base64 image string back to PNG or JPG. Paste your data URI, preview, and download instantly. Browser-based — no upload, no signup.",
    keywords: ["decode base64 image", "base64 image decoder online"],
    h1Prefix: "Decode",
    h1Highlight: "Base64 image",
    h1Suffix: "— preview and download.",
    eyebrow: "Base64 Image Decoder — paste, preview, download",
    heroSubline: "Paste any Base64 data URI and see the decoded image instantly. Download as PNG or JPG with one click — no server, no signup.",
  },
  {
    slug: "base64-to-png",
    canonical: "base64-to-image",
    seoTitle: "Base64 to PNG Converter — Free Online",
    seoDescription: "Convert a Base64 string back to a PNG image online free. Paste your data URI, preview, and download the PNG instantly. Browser-based processing.",
    keywords: ["base64 to png", "convert base64 to png online"],
    h1Prefix: "Convert",
    h1Highlight: "Base64 to PNG",
    h1Suffix: "— instant download.",
    eyebrow: "Base64 to PNG — free browser-based decoder",
    heroSubline: "Paste a Base64 data URI and download the decoded PNG file immediately. All decoding happens locally in your browser.",
  },
  {
    slug: "base64-image-converter",
    canonical: "base64-to-image",
    seoTitle: "Base64 Image Converter — Decode Online Free",
    seoDescription: "Online Base64 image converter. Paste any data URI and get the decoded image. Download as PNG or JPG. Free, no signup, no file upload needed.",
    keywords: ["base64 image converter", "base64 to image converter online"],
    h1Prefix: "Base64",
    h1Highlight: "image converter",
    h1Suffix: "— decode any data URI.",
    eyebrow: "Base64 Image Converter — decode data URIs instantly",
    heroSubline: "Convert any Base64 data URI back to a viewable, downloadable image. Supports PNG, JPG, WebP, and more.",
  },
  {
    slug: "base64-decoder-image",
    canonical: "base64-to-image",
    seoTitle: "Base64 Decoder for Images — Free Online",
    seoDescription: "Free Base64 decoder for images. Paste a Base64 data URI string and preview + download the image. No server upload, no account required.",
    keywords: ["base64 decoder image", "base64 image decode online free"],
    h1Prefix: "Base64 decoder",
    h1Highlight: "for images",
    h1Suffix: "— free, instant.",
    eyebrow: "Base64 Image Decoder — zero upload, instant preview",
    heroSubline: "Decode any Base64-encoded image string back to its original file. Preview in the browser and download — all in one step.",
  },
  {
    slug: "base64-to-jpg",
    canonical: "base64-to-image",
    seoTitle: "Base64 to JPG Converter — Free Online",
    seoDescription: "Convert Base64 data URI to JPG online free. Paste your string, preview the image, and download the JPG instantly. No signup, browser-based.",
    keywords: ["base64 to jpg", "convert base64 to jpg online"],
    h1Prefix: "Convert",
    h1Highlight: "Base64 to JPG",
    h1Suffix: "— free online.",
    eyebrow: "Base64 to JPG — paste, preview, download",
    heroSubline: "Paste a Base64 data URI and get the decoded JPG image. Download instantly — no server, no account needed.",
  },

  // ═══════════════════════ favicon-generator ═══════════════════════
  {
    slug: "ico-generator",
    canonical: "favicon-generator",
    seoTitle: "ICO Generator — Free Favicon ICO from PNG",
    seoDescription: "Generate a favicon.ico from any PNG, JPG, or SVG. Includes all sizes (16/32/48px) in a ZIP download. Free, no upload to server, no signup.",
    keywords: ["ico generator", "ico generator online free", "png to ico generator"],
    h1Prefix: "ICO generator",
    h1Highlight: "— create favicon.ico",
    h1Suffix: "for free.",
    eyebrow: "ICO Generator — browser-based, all favicon sizes",
    heroSubline: "Upload a PNG, JPG, or SVG and get a favicon.ico file plus all modern sizes in a single ZIP. Runs entirely in your browser.",
  },
  {
    slug: "favicon-maker-online",
    canonical: "favicon-generator",
    seoTitle: "Favicon Maker Online — Free, All Sizes",
    seoDescription: "Make a favicon online free. Upload any image and get favicon.ico, apple-touch-icon, and android-chrome sizes in a ZIP. No signup, browser-based.",
    keywords: ["favicon maker online", "favicon maker free online"],
    h1Prefix: "Favicon maker",
    h1Highlight: "online",
    h1Suffix: "— all sizes in one ZIP.",
    eyebrow: "Favicon Maker — free, instant, no signup",
    heroSubline: "Create a complete favicon package from any image. Download a ZIP with every size your website needs — all generated locally in your browser.",
  },
  {
    slug: "create-favicon-free",
    canonical: "favicon-generator",
    seoTitle: "Create a Favicon Free — No Signup, Instant ZIP",
    seoDescription: "Create a favicon from any image for free. Generates all required sizes (16px to 512px) plus site.webmanifest. Download as ZIP. Browser-based.",
    keywords: ["create favicon free", "create favicon from image free"],
    h1Prefix: "Create a",
    h1Highlight: "favicon",
    h1Suffix: "free — all sizes, instant ZIP.",
    eyebrow: "Create Favicon Free — no signup, instant download",
    heroSubline: "Upload any square image and create a complete favicon set for your website. Generates .ico, apple-touch-icon, android-chrome, and webmanifest.",
  },
  {
    slug: "favicon-creator-online",
    canonical: "favicon-generator",
    seoTitle: "Favicon Creator Online — Free Favicon Generator",
    seoDescription: "Online favicon creator. Upload PNG, JPG, or SVG and create all favicon sizes instantly. Free ZIP download with site.webmanifest included.",
    keywords: ["favicon creator online", "online favicon creator free"],
    h1Prefix: "Favicon creator",
    h1Highlight: "online",
    h1Suffix: "— free for any website.",
    eyebrow: "Favicon Creator — complete favicon set from one image",
    heroSubline: "Create all favicon sizes from a single image upload. Includes site.webmanifest — just drop the files into your site root and you are done.",
  },
  {
    slug: "png-to-favicon",
    canonical: "favicon-generator",
    seoTitle: "PNG to Favicon Converter — Free Online",
    seoDescription: "Convert a PNG to a favicon set free online. Generates favicon.ico (16/32/48px), apple-touch-icon (180px), and android-chrome (192/512px). ZIP download.",
    keywords: ["png to favicon", "convert png to favicon online free"],
    h1Prefix: "Convert",
    h1Highlight: "PNG to favicon",
    h1Suffix: "— all sizes, free.",
    eyebrow: "PNG to Favicon — browser-based, no upload",
    heroSubline: "Turn any PNG into a full favicon package. Get every size required for modern browsers, iOS, and Android — downloaded as a ready-to-deploy ZIP.",
  },

  // ═══════════════════════ background-remover ═══════════════════════
  {
    slug: "remove-background-free",
    canonical: "background-remover",
    seoTitle: "Remove Image Background Free — No Upload, AI",
    seoDescription: "Remove image background free with AI. Browser-based — images never uploaded to any server. No signup, no watermark. ONNX model runs locally.",
    keywords: ["remove background free", "remove image background free online"],
    h1Prefix: "Remove",
    h1Highlight: "image background free",
    h1Suffix: "— AI, no upload.",
    eyebrow: "Remove Background Free — AI runs in your browser",
    heroSubline: "AI background removal that runs entirely in your browser. No server upload, no watermark, no credits. Model downloads once and is cached for free future use.",
  },
  {
    slug: "bg-remover-online",
    canonical: "background-remover",
    seoTitle: "BG Remover Online — Free AI, Browser-Based",
    seoDescription: "Online BG remover — free AI background removal that runs locally in your browser. No upload, no signup, no watermark. Download transparent PNG.",
    keywords: ["bg remover online", "background remover online free"],
    h1Prefix: "BG remover",
    h1Highlight: "online",
    h1Suffix: "— free AI, no upload.",
    eyebrow: "BG Remover Online — AI runs locally, zero upload",
    heroSubline: "Remove backgrounds from photos automatically with AI. Runs in your browser — your image never leaves your device. Download a transparent PNG instantly.",
  },
  {
    slug: "remove-image-background",
    canonical: "background-remover",
    seoTitle: "Remove Image Background — Free AI Tool Online",
    seoDescription: "Remove image backgrounds with AI online. Browser-based ONNX model — no upload, no watermark, no signup. Transparent PNG output, free forever.",
    keywords: ["remove image background", "remove image background online free ai"],
    h1Prefix: "Remove",
    h1Highlight: "image background",
    h1Suffix: "with AI — free.",
    eyebrow: "Image Background Remover — AI-powered, browser-local",
    heroSubline: "AI automatically detects and removes the background from any photo. Outputs a transparent PNG — all processing happens locally, nothing uploaded.",
  },
  {
    slug: "transparent-background-maker",
    canonical: "background-remover",
    seoTitle: "Transparent Background Maker — Free AI Online",
    seoDescription: "Make an image background transparent free. AI-powered, browser-based — no server upload. Download as PNG with transparent background. No signup.",
    keywords: ["transparent background maker", "make image background transparent free"],
    h1Prefix: "Make background",
    h1Highlight: "transparent",
    h1Suffix: "— free AI tool.",
    eyebrow: "Transparent Background Maker — AI, no upload",
    heroSubline: "Automatically make the background of any image fully transparent using AI. Get a clean cutout PNG — runs in your browser, no upload required.",
  },
  {
    slug: "remove-bg-online",
    canonical: "background-remover",
    seoTitle: "Remove BG Online Free — No Watermark, No Upload",
    seoDescription: "Remove background online free — no watermark, no upload, no credits. AI runs via ONNX WebAssembly in your browser. Download transparent PNG instantly.",
    keywords: ["remove bg online", "remove bg online free no watermark"],
    h1Prefix: "Remove BG",
    h1Highlight: "online",
    h1Suffix: "— free, no watermark.",
    eyebrow: "Remove BG Free — the remove.bg alternative with zero upload",
    heroSubline: "Remove image backgrounds free with no watermark and no file upload. A local-first alternative to Remove.bg — AI runs entirely in your browser.",
  },

  // ═══════════════════════ image-to-text ═══════════════════════
  {
    slug: "ocr-online-free",
    canonical: "image-to-text",
    seoTitle: "OCR Online Free — Extract Text from Image",
    seoDescription: "Free online OCR — extract text from any image. Browser-based Tesseract.js, no upload, no email required. Supports 8 languages. Download as .txt.",
    keywords: ["ocr online free", "free online ocr tool"],
    h1Prefix: "OCR online",
    h1Highlight: "free",
    h1Suffix: "— extract text from any image.",
    eyebrow: "Free Online OCR — no email, no upload",
    heroSubline: "Extract text from photos and screenshots using OCR. Supports 8 languages — runs entirely in your browser via Tesseract.js WebAssembly. No upload, no account.",
  },
  {
    slug: "extract-text-from-image",
    canonical: "image-to-text",
    seoTitle: "Extract Text from Image — Free Online OCR",
    seoDescription: "Extract text from any image online free. Browser-based OCR via Tesseract.js — no upload, no signup. Supports English, Spanish, French, German, and more.",
    keywords: ["extract text from image", "extract text from image online free"],
    h1Prefix: "Extract text",
    h1Highlight: "from an image",
    h1Suffix: "— free OCR online.",
    eyebrow: "Extract Text from Image — OCR, browser-based",
    heroSubline: "Upload a photo or screenshot and extract all readable text. Supports 8 languages — OCR runs locally in your browser, nothing uploaded.",
  },
  {
    slug: "image-text-extractor",
    canonical: "image-to-text",
    seoTitle: "Image Text Extractor — Free Online OCR Tool",
    seoDescription: "Free image text extractor. OCR tool that extracts text from photos, screenshots, and scanned documents. Browser-based — no upload, 8 languages supported.",
    keywords: ["image text extractor", "image text extractor online free"],
    h1Prefix: "Image",
    h1Highlight: "text extractor",
    h1Suffix: "— OCR, 8 languages.",
    eyebrow: "Image Text Extractor — OCR, no upload required",
    heroSubline: "Extract text from any image file using browser-based OCR. Works on photos, PDFs rendered as images, screenshots, and scanned documents.",
  },
  {
    slug: "photo-to-text-converter",
    canonical: "image-to-text",
    seoTitle: "Photo to Text Converter — Free Online OCR",
    seoDescription: "Convert a photo to text free online. OCR technology extracts readable text from photos, screenshots, and scanned pages. Browser-based, no upload.",
    keywords: ["photo to text converter", "convert photo to text free"],
    h1Prefix: "Photo to",
    h1Highlight: "text converter",
    h1Suffix: "— free OCR.",
    eyebrow: "Photo to Text — browser OCR, no server upload",
    heroSubline: "Turn any photo into editable text using optical character recognition. Runs in your browser — no upload, no email, 8 languages supported.",
  },
  {
    slug: "picture-to-text-online",
    canonical: "image-to-text",
    seoTitle: "Picture to Text Online — Free OCR, No Signup",
    seoDescription: "Convert picture to text online free. No signup, no upload. OCR extracts text from any image in 8 languages. Download result as .txt file.",
    keywords: ["picture to text online", "picture to text converter free"],
    h1Prefix: "Picture to",
    h1Highlight: "text online",
    h1Suffix: "— free, no signup.",
    eyebrow: "Picture to Text — OCR, zero upload, 8 languages",
    heroSubline: "Extract text from pictures instantly — free, no signup. Upload a picture, select your language, and get editable text you can copy or download.",
  },

  // ═══════════════════════ qr-code-generator ═══════════════════════
  {
    slug: "qr-code-maker-free",
    canonical: "qr-code-generator",
    seoTitle: "QR Code Maker Free — Custom Colors, PNG & SVG",
    seoDescription: "Make a QR code free. Custom colors, error correction, margin. Download as PNG or SVG. No signup, no watermark. Browser-based, instant generation.",
    keywords: ["qr code maker free", "free qr code maker online"],
    h1Prefix: "QR code maker",
    h1Highlight: "free",
    h1Suffix: "— custom colors, PNG & SVG.",
    eyebrow: "Free QR Code Maker — no watermark, no signup",
    heroSubline: "Make a QR code in seconds with custom colors and error correction. Download as a clean PNG or scalable SVG — no watermark, no account needed.",
  },
  {
    slug: "generate-qr-code-online",
    canonical: "qr-code-generator",
    seoTitle: "Generate QR Code Online — Free, Instant",
    seoDescription: "Generate a QR code online free. Enter any URL or text, customize colors, and download PNG or SVG. Instant, no signup, no watermark.",
    keywords: ["generate qr code online", "generate qr code online free"],
    h1Prefix: "Generate QR code",
    h1Highlight: "online",
    h1Suffix: "— free, instant download.",
    eyebrow: "Generate QR Code Online — custom, instant, free",
    heroSubline: "Generate a QR code for any URL, text, or phone number. Customize the design and download PNG or SVG in seconds — completely free.",
  },
  {
    slug: "create-qr-code-free",
    canonical: "qr-code-generator",
    seoTitle: "Create QR Code Free — No Signup, No Watermark",
    seoDescription: "Create a QR code free with no signup and no watermark. Custom foreground/background colors, error correction, margin. Download PNG or vector SVG.",
    keywords: ["create qr code free", "create qr code online free"],
    h1Prefix: "Create a",
    h1Highlight: "QR code free",
    h1Suffix: "— no watermark, no signup.",
    eyebrow: "Create QR Code Free — clean download, no branding",
    heroSubline: "Create a QR code for any URL, text, or contact info. Custom colors, no watermark, instant PNG or SVG download. Zero signup required.",
  },
  {
    slug: "qr-code-creator",
    canonical: "qr-code-generator",
    seoTitle: "QR Code Creator — Custom Colors & Error Correction",
    seoDescription: "QR code creator with custom foreground/background colors, error correction levels (L/M/Q/H), and margin control. Free PNG and SVG download.",
    keywords: ["qr code creator", "qr code creator online free"],
    h1Prefix: "QR code",
    h1Highlight: "creator",
    h1Suffix: "— custom design, free download.",
    eyebrow: "QR Code Creator — colors, ECC, margin, PNG + SVG",
    heroSubline: "Build a QR code exactly how you want it — custom colors, error correction level, and margin. Download as PNG or SVG with no watermark.",
  },
  {
    slug: "free-qr-code-generator",
    canonical: "qr-code-generator",
    seoTitle: "Free QR Code Generator — PNG & SVG, No Watermark",
    seoDescription: "Free QR code generator with no watermark. Supports URLs, text, and contact info. Custom colors, error correction, PNG and SVG download. No signup.",
    keywords: ["free qr code generator", "free qr code generator no watermark"],
    h1Prefix: "Free",
    h1Highlight: "QR code generator",
    h1Suffix: "— no watermark, ever.",
    eyebrow: "Free QR Code Generator — clean output, zero signup",
    heroSubline: "The clean QR code generator — no watermark, no account, no branding. Custom colors and error correction. PNG and SVG download, always free.",
  },

  // ═══════════════════════ profile-pic-creator ═══════════════════════
  {
    slug: "avatar-maker-online",
    canonical: "profile-pic-creator",
    seoTitle: "Avatar Maker Online — Free Emoji Avatar Creator",
    seoDescription: "Create a custom avatar online free. Pick an emoji, background color, and shape. Download as PNG. No signup, no watermark. Browser-based.",
    keywords: ["avatar maker online", "free avatar maker online"],
    h1Prefix: "Avatar maker",
    h1Highlight: "online",
    h1Suffix: "— free emoji creator.",
    eyebrow: "Free Avatar Maker — emoji, color, shape, instant PNG",
    heroSubline: "Design a custom avatar using any emoji on a colored background. Choose circle or square, adjust size and rotation, download a clean PNG — free.",
  },
  {
    slug: "profile-picture-generator",
    canonical: "profile-pic-creator",
    seoTitle: "Profile Picture Generator — Free Emoji Avatar",
    seoDescription: "Generate a custom profile picture from an emoji. Choose background color, circle or square shape, 64–512px size. Free PNG download. No signup.",
    keywords: ["profile picture generator", "profile picture generator free"],
    h1Prefix: "Profile picture",
    h1Highlight: "generator",
    h1Suffix: "— emoji avatar, free.",
    eyebrow: "Profile Picture Generator — emoji-based, instant PNG",
    heroSubline: "Generate a profile picture from any emoji. Customize color, shape, and size up to 512px — download a PNG that works on any social platform.",
  },
  {
    slug: "create-profile-picture-free",
    canonical: "profile-pic-creator",
    seoTitle: "Create Profile Picture Free — Emoji Avatar Maker",
    seoDescription: "Create a profile picture free. Emoji-based avatar maker with custom background colors and shapes. Download as PNG. No signup, no watermark.",
    keywords: ["create profile picture free", "create custom profile picture free"],
    h1Prefix: "Create a",
    h1Highlight: "profile picture free",
    h1Suffix: "— emoji avatar.",
    eyebrow: "Create Profile Picture Free — no signup, no watermark",
    heroSubline: "Create a unique profile picture using an emoji on a custom background. Works for LinkedIn, Twitter/X, Instagram, and Discord. Download as PNG.",
  },
  {
    slug: "emoji-avatar-maker",
    canonical: "profile-pic-creator",
    seoTitle: "Emoji Avatar Maker — Free Profile Picture Creator",
    seoDescription: "Free emoji avatar maker. Pick any emoji, choose a background color and shape, and download a PNG profile picture. No signup, no watermark.",
    keywords: ["emoji avatar maker", "emoji avatar creator online free"],
    h1Prefix: "Emoji",
    h1Highlight: "avatar maker",
    h1Suffix: "— free PNG download.",
    eyebrow: "Emoji Avatar Maker — pick emoji, download PNG",
    heroSubline: "Turn any emoji into a profile picture. Customize the background color, shape, and rotation — then download a clean PNG with no watermark.",
  },
  {
    slug: "custom-avatar-creator",
    canonical: "profile-pic-creator",
    seoTitle: "Custom Avatar Creator — Free Emoji Profile Pic",
    seoDescription: "Custom avatar creator — build an emoji-based profile picture with your own colors and shapes. Free PNG download. No signup, works in any browser.",
    keywords: ["custom avatar creator", "custom avatar creator online free"],
    h1Prefix: "Custom",
    h1Highlight: "avatar creator",
    h1Suffix: "— emoji, color, shape.",
    eyebrow: "Custom Avatar Creator — emoji-based, fully customizable",
    heroSubline: "Build a completely custom avatar from an emoji. Choose background color, circle or square shape, size up to 512px, and emoji rotation. Free PNG download.",
  },
];

/** All utility alias slugs (35 total). */
export const IMAGE_UTILITY_ALIAS_SLUGS: string[] = ALIASES.map((a) => a.slug);

/** Map from slug → UtilityAlias for O(1) lookup. */
const ALIAS_MAP = new Map<string, UtilityAlias>(ALIASES.map((a) => [a.slug, a]));

/** Look up a utility alias by slug. Returns undefined if not found. */
export function getUtilityAlias(slug: string): UtilityAlias | undefined {
  return ALIAS_MAP.get(slug);
}

/** Type guard — returns true if slug matches a utility alias. */
export function isUtilityAliasSlug(slug: string): boolean {
  return ALIAS_MAP.has(slug);
}

export { ALIASES as IMAGE_UTILITY_ALIASES };
