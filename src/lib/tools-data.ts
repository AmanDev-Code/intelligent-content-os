/** Central registry of all free tools on Trndinn. */

export type ToolCategory =
  | "Utility"
  | "Post Generator"
  | "Hook & Caption"
  | "Bio Generator"
  | "Hashtag"
  | "Analytics"
  | "Image Converter"
  | "Image Editor"
  | "Image Utility"
  | "Audio"
  | "Video";

export type ToolPlatform = "Instagram" | "LinkedIn" | "Twitter" | "TikTok" | "Multi-platform";

export interface ToolEntry {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  platform: ToolPlatform;
  isAI: boolean;
  /** Whether the tool page is live (vs coming soon). */
  live: boolean;
  /** Whether to show on the /tools hub page. Defaults to true for live tools if omitted. */
  showOnHub?: boolean;
}

export const TOOLS: ToolEntry[] = [
  {
    slug: "instagram-reel-downloader",
    name: "Instagram Reel Downloader",
    description: "Download any public Instagram Reel as MP4 in HD. No login, no watermark.",
    category: "Utility",
    platform: "Instagram",
    isAI: false,
    live: true,
  },
  {
    slug: "auto-caption-generator",
    name: "Auto Caption Generator",
    description: "Add AI-synced captions to any video. 6 styles, word-by-word timing, 99+ languages. Free.",
    category: "Utility",
    platform: "Multi-platform",
    isAI: true,
    live: true,
  },
  {
    slug: "bio-generator",
    name: "AI Bio Generator",
    description: "Write LinkedIn, Instagram, X, TikTok, GitHub, and YouTube bios in one run. 3 angles per platform, 0-100 scoring. Free, no login.",
    category: "Bio Generator",
    platform: "Multi-platform",
    isAI: true,
    live: true,
  },
  // ─── Category hub entries (shown on /tools hub page) ──────────────────
  {
    slug: "image",
    name: "Image Tools",
    description: "Convert, compress, resize, crop, remove backgrounds — 49 free image tools. All browser-based, no upload.",
    category: "Utility",
    platform: "Multi-platform",
    isAI: false,
    live: true,
  },
  {
    slug: "audio",
    name: "Audio Tools",
    description: "Convert audio formats, record your voice, text-to-speech and live transcription. 4 free tools.",
    category: "Utility",
    platform: "Multi-platform",
    isAI: false,
    live: true,
  },
  {
    slug: "video",
    name: "Video Tools",
    description: "Convert video formats, record from webcam, capture your screen. 3 free tools, browser-based.",
    category: "Utility",
    platform: "Multi-platform",
    isAI: false,
    live: true,
  },
  {
    slug: "linkedin-post-generator",
    name: "LinkedIn Post Generator",
    description: "Generate scroll-stopping LinkedIn posts with AI trained on viral patterns.",
    category: "Post Generator",
    platform: "LinkedIn",
    isAI: true,
    live: false,
  },
  {
    slug: "linkedin-hook-generator",
    name: "LinkedIn Hook Generator",
    description: "Create attention-grabbing first lines that stop the scroll on LinkedIn.",
    category: "Hook & Caption",
    platform: "LinkedIn",
    isAI: true,
    live: false,
  },
  {
    slug: "instagram-caption-generator",
    name: "Instagram Caption Generator",
    description: "Write engaging captions with relevant hashtags for maximum reach.",
    category: "Hook & Caption",
    platform: "Instagram",
    isAI: true,
    live: false,
  },
  {
    slug: "linkedin-headline-generator",
    name: "LinkedIn Headline Generator",
    description: "Craft a headline that gets you found and makes recruiters click.",
    category: "Bio Generator",
    platform: "LinkedIn",
    isAI: true,
    live: false,
  },
  {
    slug: "hashtag-generator",
    name: "Hashtag Generator",
    description: "Find trending and niche hashtags to boost post discoverability.",
    category: "Hashtag",
    platform: "Multi-platform",
    isAI: true,
    live: false,
  },

  // ─── Image Converters (33 tools) ───────────────────────────────────────────
  { slug: "png-to-jpg",   name: "PNG to JPG Converter",   description: "Convert PNG to JPG online free. No signup, instant download, browser-based.",          category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "jpg-to-png",   name: "JPG to PNG Converter",   description: "Convert JPG to PNG online free. Lossless output, no signup, instant download.",        category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "webp-to-jpg",  name: "WebP to JPG Converter",  description: "Convert WebP to JPG online free. No signup, instant download, browser-based.",         category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "webp-to-png",  name: "WebP to PNG Converter",  description: "Convert WebP to PNG online free. Lossless output, no signup, instant download.",       category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "jpg-to-webp",  name: "JPG to WebP Converter",  description: "Convert JPG to WebP online free. 25-35% smaller files, no signup.",                    category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "png-to-webp",  name: "PNG to WebP Converter",  description: "Convert PNG to WebP online free. Smaller files for faster websites. No signup.",       category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "heic-to-jpg",  name: "HEIC to JPG Converter",  description: "Convert iPhone HEIC photos to JPG online free. No signup, no upload.",                  category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "heic-to-png",  name: "HEIC to PNG Converter",  description: "Convert iPhone HEIC photos to lossless PNG free. No signup, browser-based.",           category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "svg-to-png",   name: "SVG to PNG Converter",   description: "Convert SVG to high-resolution PNG online free. No signup, instant download.",         category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "gif-to-jpg",   name: "GIF to JPG Converter",   description: "Convert GIF to JPG online free. Extract first frame as static JPG. No signup.",        category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "gif-to-png",   name: "GIF to PNG Converter",   description: "Convert GIF to PNG online free. Lossless first-frame extraction. No signup.",          category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "gif-to-webp",  name: "GIF to WebP Converter",  description: "Convert GIF to WebP online free. Smaller animated images for the web. No signup.",     category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "bmp-to-jpg",   name: "BMP to JPG Converter",   description: "Convert BMP to JPG online free. Reduce file size by 90%+. No signup.",                 category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "bmp-to-png",   name: "BMP to PNG Converter",   description: "Convert BMP to PNG online free. Lossless compression, no signup.",                     category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "tiff-to-jpg",  name: "TIFF to JPG Converter",  description: "Convert TIFF to JPG online free. Reduce large TIFF files for web sharing. No signup.", category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "tiff-to-png",  name: "TIFF to PNG Converter",  description: "Convert TIFF to PNG online free. Lossless output with universal compatibility.",       category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "jpg-to-avif",  name: "JPG to AVIF Converter",  description: "Convert JPG to AVIF online free. 50% smaller files with next-gen compression.",        category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "png-to-avif",  name: "PNG to AVIF Converter",  description: "Convert PNG to AVIF online free. Smallest file sizes for the web. No signup.",         category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "webp-to-avif", name: "WebP to AVIF Converter", description: "Convert WebP to AVIF online free. 20% smaller than WebP. No signup.",                  category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "avif-to-jpg",  name: "AVIF to JPG Converter",  description: "Convert AVIF to JPG online free. Universal compatibility. No signup.",                  category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "avif-to-png",  name: "AVIF to PNG Converter",  description: "Convert AVIF to PNG online free. Lossless output, no signup.",                         category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "jpg-to-gif",   name: "JPG to GIF Converter",   description: "Convert JPG to GIF online free. Create static GIF images from photos. No signup.",     category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "png-to-gif",   name: "PNG to GIF Converter",   description: "Convert PNG to GIF online free. Web-ready GIF output. No signup.",                     category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "webp-to-gif",  name: "WebP to GIF Converter",  description: "Convert WebP to GIF online free. Universal GIF compatibility. No signup.",             category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "jpg-to-bmp",   name: "JPG to BMP Converter",   description: "Convert JPG to BMP online free. Uncompressed bitmap for legacy software. No signup.",  category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "png-to-bmp",   name: "PNG to BMP Converter",   description: "Convert PNG to BMP online free. Uncompressed bitmap output. No signup.",               category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "webp-to-bmp",  name: "WebP to BMP Converter",  description: "Convert WebP to BMP online free. Legacy-compatible bitmap output. No signup.",         category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "jpg-to-tiff",  name: "JPG to TIFF Converter",  description: "Convert JPG to TIFF online free. Print-ready output for publishing. No signup.",       category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "png-to-tiff",  name: "PNG to TIFF Converter",  description: "Convert PNG to TIFF online free. Lossless print-quality output. No signup.",           category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "webp-to-tiff", name: "WebP to TIFF Converter", description: "Convert WebP to TIFF online free. Print-ready output for professional use. No signup.", category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "png-to-ico",   name: "PNG to ICO Converter",   description: "Convert PNG to ICO online free. Create favicons and Windows icons. No signup.",         category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "jpg-to-ico",   name: "JPG to ICO Converter",   description: "Convert JPG to ICO online free. Create favicons and Windows icons. No signup.",         category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "webp-to-ico",  name: "WebP to ICO Converter",  description: "Convert WebP to ICO online free. Create favicons and Windows icons. No signup.",        category: "Image Converter", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },

  // ─── Image Edit & Compression (9 tools) ───────────────────────────────────
  { slug: "compress-jpg",    name: "JPG Compressor",       description: "Compress JPG images online free. Quality slider, up to 90% size reduction. No signup, browser-based.",                        category: "Image Editor", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "compress-png",    name: "PNG Compressor",       description: "Compress PNG images online free. Preserves transparency. Up to 80% size reduction. No signup, browser-based.",                category: "Image Editor", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "compress-webp",   name: "WebP Compressor",      description: "Compress WebP images online free. Reduce file size 20-50% with quality control. No signup, browser-based.",                  category: "Image Editor", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "compress-gif",    name: "GIF Compressor",       description: "Compress GIF images online free. Reduce animated or static GIF size 30-70%. No signup, browser-based.",                      category: "Image Editor", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "image-resizer",   name: "Image Resizer",        description: "Resize images online free. Platform presets for LinkedIn, Instagram, Twitter, YouTube, Facebook. No signup.",                 category: "Image Editor", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "image-cropper",   name: "Image Cropper",        description: "Crop images online free. Pixel-precise crop area controls. No signup, browser-based, instant download.",                      category: "Image Editor", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "image-rotator",   name: "Image Rotator",        description: "Rotate and flip images online free. 90°, 180°, 270° and flip H/V. No signup, browser-based.",                                category: "Image Editor", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "watermark-image", name: "Image Watermark Tool", description: "Add text or image watermarks to photos online free. 9 positions, opacity control. No signup, browser-based.",                 category: "Image Editor", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "image-workbench", name: "Image Workbench",      description: "Multi-op image pipeline editor. Chain resize, crop, rotate, compress, convert in one run. No signup, browser-based.",        category: "Image Editor", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },

  // ─── Audio Tools (4 tools — Phase 7) ─────────────────────────────────────
  { slug: "audio-converter",  name: "Audio Converter",  description: "Convert audio files online free — MP3, WAV, FLAC, AAC, OGG, M4A. No upload, no signup, FFmpeg WASM in your browser.", category: "Audio", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "audio-recorder",   name: "Audio Recorder",   description: "Record audio online free from your microphone. No app, no signup. Browser MediaRecorder API. Download as WEBM.",          category: "Audio", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "text-to-speech",   name: "Text to Speech",   description: "Convert text to speech online free with natural browser voices. Adjust speed and pitch. No signup, no download.",           category: "Audio", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "speech-to-text",   name: "Speech to Text",   description: "Transcribe speech to text online free. Live transcript, 8 languages. Chrome and Edge. No signup, no upload.",               category: "Audio", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },

  // ─── Video Tools (3 tools — Phase 7) ─────────────────────────────────────
  { slug: "video-converter",  name: "Video Converter",  description: "Convert video files online free — MP4, MOV, AVI, MKV, WEBM. No upload, no signup, FFmpeg WASM in your browser.",           category: "Video", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "video-recorder",   name: "Video Recorder",   description: "Record webcam video online free. No app, no signup. Browser MediaRecorder API. Download as WEBM.",                           category: "Video", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "screen-recorder",  name: "Screen Recorder",  description: "Record your screen online free. No download, no extension. Chrome and Edge getDisplayMedia API. Download as WEBM.",          category: "Video", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },

  // ─── Image Utility / AI tools (7 tools — Phase 4) ────────────────────────
  { slug: "image-to-base64",    name: "Image to Base64 Converter", description: "Convert any image to a Base64 data URI instantly. Browser-based — files never leave your device. Free, no signup.",          category: "Image Utility", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "base64-to-image",    name: "Base64 to Image Converter", description: "Decode a Base64 data URI back to a PNG or JPG image. Preview and download instantly. Browser-based, no upload, no signup.",     category: "Image Utility", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "favicon-generator",  name: "Favicon Generator",         description: "Generate all favicon sizes from any PNG, JPG, or SVG. Downloads a ZIP with ico, apple-touch-icon, and webmanifest. Free.",      category: "Image Utility", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "background-remover", name: "Background Remover",        description: "Remove image backgrounds with AI — free, browser-based, no signup. ONNX model runs locally via WebAssembly. Zero uploads.",     category: "Image Utility", platform: "Multi-platform", isAI: true,  live: true, showOnHub: false },
  { slug: "image-to-text",      name: "Image to Text (OCR)",       description: "Extract text from any image using OCR. Supports 8 languages. Browser-based via Tesseract.js WASM — images never uploaded.",     category: "Image Utility", platform: "Multi-platform", isAI: true,  live: true, showOnHub: false },
  { slug: "qr-code-generator",  name: "QR Code Generator",         description: "Generate QR codes with custom colors, error correction, and margins. Download as PNG or SVG. Free, no signup, no watermark.",   category: "Image Utility", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
  { slug: "profile-pic-creator",name: "Profile Picture Creator",   description: "Create a custom profile picture from an emoji. Choose color, shape, size, rotation. Download as PNG. Free, no signup.",         category: "Image Utility", platform: "Multi-platform", isAI: false, live: true, showOnHub: false },
];

export function getToolBySlug(slug: string): ToolEntry | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolCategories(): ToolCategory[] {
  return [...new Set(TOOLS.map((t) => t.category))];
}
