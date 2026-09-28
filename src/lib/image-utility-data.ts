/**
 * image-utility-data.ts — single source of truth for the 7 utility/AI image tools
 * in Phase 4 of the Trndinn media tools suite.
 *
 * Tools: image-to-base64, base64-to-image, favicon-generator,
 *        background-remover, image-to-text, qr-code-generator, profile-pic-creator
 */

export interface UtilityTool {
  slug: string;
  name: string;
  primaryKeyword: string;
  searchVolume: number;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  faqs: Array<{ question: string; answer: string }>;
  description: string;
  processingEngine: "pure-js" | "canvas" | "onnx-wasm" | "tesseract-wasm";
}

export const UTILITY_TOOLS: readonly UtilityTool[] = [
  // ─────────────────────────── image-to-base64 ───────────────────────────
  {
    slug: "image-to-base64",
    name: "Image to Base64 Converter",
    primaryKeyword: "image to base64",
    searchVolume: 110000,
    seoTitle: "Image to Base64 Converter — Free, No Upload",
    seoDescription:
      "Convert any image to a Base64 data URI instantly. Browser-based — files never leave your device. Free, no signup, no file size limit.",
    h1: "Convert Image to Base64 — free, browser-based",
    description:
      "Encode any PNG, JPG, WebP, GIF, or SVG as a Base64 data URI in your browser. Copy the result directly into CSS, HTML, or JSON — no server, no signup.",
    processingEngine: "pure-js",
    faqs: [
      {
        question: "What is a Base64 image?",
        answer:
          "A Base64 image is an image file encoded as a text string using the Base64 alphabet. It can be embedded directly in HTML (<img src=\"data:image/png;base64,...\">), CSS (background-image: url(...)), or JSON without hosting the file separately.",
      },
      {
        question: "Does the image get uploaded anywhere?",
        answer:
          "No. The conversion happens entirely in your browser using the FileReader API. Your image never leaves your device.",
      },
      {
        question: "What image formats are supported?",
        answer:
          "PNG, JPG/JPEG, WebP, GIF, SVG, BMP, ICO — any format your browser can read via FileReader.",
      },
      {
        question: "How do I use the Base64 string in HTML?",
        answer:
          "Copy the full data URI (it starts with data:image/...) and use it as the src attribute of an <img> tag, or as a CSS background-image url() value.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "No server-imposed limit. The practical limit is your device's available RAM. For very large images (>10 MB), the resulting Base64 string will be large; consider whether inline embedding is the right choice.",
      },
    ],
  },

  // ─────────────────────────── base64-to-image ───────────────────────────
  {
    slug: "base64-to-image",
    name: "Base64 to Image Converter",
    primaryKeyword: "base64 to image",
    searchVolume: 90000,
    seoTitle: "Base64 to Image Converter — Free Online Decoder",
    seoDescription:
      "Decode a Base64 data URI back to a PNG, JPG, or WebP image. Preview and download instantly — browser-based, no upload, no signup.",
    h1: "Decode Base64 back to an image — free online",
    description:
      "Paste any Base64 data URI and instantly preview the decoded image. Download as PNG or JPG with one click — runs entirely in your browser.",
    processingEngine: "pure-js",
    faqs: [
      {
        question: "What is Base64 decoding for images?",
        answer:
          "Base64 decoding converts a text-encoded image string (starting with data:image/...) back to a binary image file you can view and download.",
      },
      {
        question: "What formats does the Base64 string need to be in?",
        answer:
          "Paste a full data URI — for example: data:image/png;base64,iVBORw0KGgo... The tool automatically detects the image type from the MIME prefix.",
      },
      {
        question: "What if my Base64 string has no data URI prefix?",
        answer:
          "If you have a raw Base64 string without the data:image/... prefix, the tool will attempt to decode it as PNG by default. You can also manually prepend the correct MIME prefix.",
      },
      {
        question: "Is this tool free?",
        answer:
          "Yes — completely free, no account required, no file size limits. The decoding runs in your browser using the atob() API.",
      },
    ],
  },

  // ─────────────────────────── favicon-generator ───────────────────────────
  {
    slug: "favicon-generator",
    name: "Favicon Generator",
    primaryKeyword: "favicon generator",
    searchVolume: 165000,
    seoTitle: "Free Favicon Generator — All Sizes, Download ZIP",
    seoDescription:
      "Generate all favicon sizes from any PNG, JPG, or SVG. Downloads a ZIP with favicon.ico, apple-touch-icon, android-chrome, and site.webmanifest. Free, no upload.",
    h1: "Favicon Generator — all sizes, one click",
    description:
      "Upload any image and get a complete favicon package: favicon.ico (16/32/48px), apple-touch-icon (180px), android-chrome (192px and 512px), and a site.webmanifest — all in a single ZIP download.",
    processingEngine: "canvas",
    faqs: [
      {
        question: "What files does the favicon generator create?",
        answer:
          "The generator outputs favicon.ico (containing 16×16, 32×32, and 48×48 PNG frames), apple-touch-icon.png (180×180), android-chrome-192x192.png, android-chrome-512x512.png, and a site.webmanifest linking them all.",
      },
      {
        question: "What image format should I upload?",
        answer:
          "PNG works best — ideally a square image at 512×512 or larger. JPG and SVG are also supported. The tool uses the Canvas API to resize to each required size.",
      },
      {
        question: "How do I add the favicon to my website?",
        answer:
          "Place all files in your site root and add these tags to your <head>: <link rel=\"icon\" href=\"/favicon.ico\"> and <link rel=\"apple-touch-icon\" href=\"/apple-touch-icon.png\">. Reference the site.webmanifest with <link rel=\"manifest\" href=\"/site.webmanifest\">.",
      },
      {
        question: "Does the tool create a true .ico file?",
        answer:
          "The favicon.ico in the ZIP is a PNG-format file with an .ico extension, which is supported by all modern browsers. Chrome and Safari use the PNG favicons; only older IE requires a true binary ICO — for most projects this is not a concern.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "No server limit. The Canvas API processes files locally in your browser. Very large source images (>20 MB) may be slow on low-end devices.",
      },
    ],
  },

  // ─────────────────────────── background-remover ───────────────────────────
  {
    slug: "background-remover",
    name: "Background Remover",
    primaryKeyword: "background remover",
    searchVolume: 1200000,
    seoTitle: "Free AI Background Remover — No Signup, No Upload",
    seoDescription:
      "Remove image backgrounds automatically with AI — free, browser-based, no signup. Runs via ONNX WebAssembly locally. First run downloads model (~43 MB, cached after).",
    h1: "Remove image background free — AI, browser-based",
    description:
      "AI-powered background removal that runs entirely in your browser. No server upload, no signup. Uses an ONNX segmentation model via WebAssembly — model downloads once (~43 MB) and is cached for all future uses.",
    processingEngine: "onnx-wasm",
    faqs: [
      {
        question: "How does the AI background removal work?",
        answer:
          "The tool uses @imgly/background-removal, an ONNX image segmentation model that runs via WebAssembly entirely in your browser. The model detects foreground subjects and removes the background, outputting a transparent PNG.",
      },
      {
        question: "Why does it download 43 MB on first use?",
        answer:
          "The ONNX model file is ~43 MB and must be downloaded to your browser before processing. After the first download, it is cached by your browser — subsequent uses are instant with no re-download.",
      },
      {
        question: "Does my image get uploaded to a server?",
        answer:
          "No. The entire process — model execution and image processing — happens locally in your browser using WebAssembly. Your image never leaves your device.",
      },
      {
        question: "What output format does it produce?",
        answer:
          "The output is a transparent PNG. The background is replaced with full transparency (alpha channel), which you can then place over any color or new background.",
      },
      {
        question: "How does this compare to Remove.bg?",
        answer:
          "Remove.bg uploads your images to their servers and charges for HD downloads. Trndinn's background remover is fully local — no upload, no credits, no watermark. Quality is comparable for most subjects.",
      },
    ],
  },

  // ─────────────────────────── image-to-text ───────────────────────────
  {
    slug: "image-to-text",
    name: "Image to Text (OCR)",
    primaryKeyword: "image to text",
    searchVolume: 550000,
    seoTitle: "Free Image to Text — Online OCR, No Signup",
    seoDescription:
      "Extract text from any image using OCR. Supports 8 languages. Browser-based via Tesseract.js WASM — images never uploaded. Free, no signup.",
    h1: "Extract text from an image — free online OCR",
    description:
      "Optical character recognition (OCR) that runs in your browser via Tesseract.js WebAssembly. Upload a photo or screenshot, select your language, and extract the text — no server upload, no signup.",
    processingEngine: "tesseract-wasm",
    faqs: [
      {
        question: "What is OCR?",
        answer:
          "OCR (Optical Character Recognition) is the process of detecting and extracting written or printed text from an image. This tool uses Tesseract.js, a WebAssembly port of Google's Tesseract OCR engine.",
      },
      {
        question: "What languages are supported?",
        answer:
          "English, Spanish, French, German, Chinese (Simplified), Japanese, Hindi, and Arabic. Each language requires a small language data file that is downloaded on first use and cached by your browser.",
      },
      {
        question: "How accurate is the OCR?",
        answer:
          "Accuracy depends on image quality. Clear, high-contrast printed text on a clean background achieves 95%+ accuracy. Handwriting, unusual fonts, low-resolution images, or heavy compression reduce accuracy significantly.",
      },
      {
        question: "Does the image get uploaded anywhere?",
        answer:
          "No. Tesseract.js runs entirely via WebAssembly in your browser. Your image and the extracted text never leave your device.",
      },
      {
        question: "What image types work best for OCR?",
        answer:
          "High-resolution screenshots, scanned documents at 300 DPI or higher, and photos taken in good lighting with minimal blur produce the best results. Avoid heavily compressed JPEGs for text extraction.",
      },
    ],
  },

  // ─────────────────────────── qr-code-generator ───────────────────────────
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    primaryKeyword: "qr code generator",
    searchVolume: 2400000,
    seoTitle: "Free QR Code Generator — Custom Colors, PNG & SVG",
    seoDescription:
      "Generate QR codes instantly with custom colors, error correction, and margins. Download as PNG or SVG. Free, no signup, no watermark.",
    h1: "QR Code Generator — custom colors, free PNG & SVG download",
    description:
      "Create QR codes for any URL, text, or contact info. Customize foreground and background colors, error correction level, and margin. Download as a high-resolution PNG or vector SVG — no signup, no watermark.",
    processingEngine: "pure-js",
    faqs: [
      {
        question: "What can I encode in a QR code?",
        answer:
          "Any text up to ~4,296 characters: URLs, Wi-Fi credentials, contact cards (vCard), phone numbers, email addresses, or plain text. For URLs, include https:// for reliable scanning.",
      },
      {
        question: "What is error correction level?",
        answer:
          "Error correction allows QR codes to be scanned even when partially damaged or obscured. L (7%) is the lowest with the simplest pattern; M (15%) is standard; Q (25%) allows moderate damage; H (30%) is best for QR codes with logos overlaid.",
      },
      {
        question: "Can I download the QR code as a vector (SVG)?",
        answer:
          "Yes. The SVG download produces a scalable vector file — perfect for print materials at any size without quality loss.",
      },
      {
        question: "Does the tool add a watermark?",
        answer:
          "No. Downloads are clean PNG and SVG files with no watermark, branding, or embedded tracking.",
      },
      {
        question: "Can I use custom colors?",
        answer:
          "Yes. You can set both the foreground (module) color and background color. For reliable scanning, maintain high contrast — dark modules on a light background. Avoid red-on-black combinations which confuse some scanners.",
      },
    ],
  },

  // ─────────────────────────── profile-pic-creator ───────────────────────────
  {
    slug: "profile-pic-creator",
    name: "Profile Picture Creator",
    primaryKeyword: "profile picture maker",
    searchVolume: 90000,
    seoTitle: "Free Profile Picture Creator — Emoji Avatar Maker",
    seoDescription:
      "Create a custom profile picture from an emoji. Choose background color, shape, size, and rotation. Download as PNG. Free, no signup, no watermark.",
    h1: "Profile Picture Creator — emoji avatar, free PNG download",
    description:
      "Design a custom profile picture using any emoji on a colored background. Choose circle or square shape, customize size up to 512px, and adjust rotation. Download a clean PNG instantly — no account needed.",
    processingEngine: "canvas",
    faqs: [
      {
        question: "What sizes can I generate?",
        answer:
          "You can generate profile pictures from 64px to 512px. For most platforms: LinkedIn uses 400×400px, Twitter/X 400×400px, Facebook 170×170px, and Instagram 110×110px. The 512px output covers all of these.",
      },
      {
        question: "Can I use any emoji?",
        answer:
          "The tool includes a curated grid of 80+ popular emojis. The emoji is rendered by your OS/browser — so it will match the native look of the emoji on your system.",
      },
      {
        question: "What output format does it produce?",
        answer:
          "A PNG file with no background transparency (the background color you choose is filled). This ensures it looks correct on all platforms regardless of their dark/light mode settings.",
      },
      {
        question: "Is there a limit on how many I can create?",
        answer:
          "No. Generate as many as you want — there are no daily limits, no account required, and no watermark on any download.",
      },
    ],
  },
];

/** All utility tool slugs. */
export const ALL_UTILITY_SLUGS: string[] = UTILITY_TOOLS.map((t) => t.slug);

/** Look up a utility tool by slug. Returns undefined if not found. */
export function getUtilityTool(slug: string): UtilityTool | undefined {
  return UTILITY_TOOLS.find((t) => t.slug === slug);
}

/** Type guard — returns true if slug matches a utility tool. */
export function isUtilitySlug(slug: string): boolean {
  return ALL_UTILITY_SLUGS.includes(slug);
}
