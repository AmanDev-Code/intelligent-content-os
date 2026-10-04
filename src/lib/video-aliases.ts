/**
 * SEO alias slugs for all 3 video tools.
 *
 * 5 aliases per tool = 15 total alias URLs. Each alias renders the same
 * underlying tool but with a unique H1, eyebrow, subline, and metadata for
 * a distinct search-intent keyword cluster. Each self-canonicalizes to the
 * primary tool so Google indexes it independently.
 *
 * Interface mirrors image-converter-aliases.ts exactly.
 */

export interface VideoAlias {
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

const ALIASES: VideoAlias[] = [
  // ═══════════════════════ video-converter ═══════════════════════
  {
    slug: "mkv-to-mp4-online",
    canonical: "video-converter",
    seoTitle: "Free MKV to MP4 Converter Online — No Signup",
    seoDescription:
      "Convert MKV to MP4 online free. No signup, no upload. FFmpeg WASM runs in your browser — your video never leaves your device. Download instantly.",
    keywords: ["mkv to mp4", "mkv to mp4 online", "convert mkv to mp4 free"],
    h1Prefix: "Convert",
    h1Highlight: "MKV to MP4",
    h1Suffix: "online, free.",
    eyebrow: "Free MKV to MP4 Converter — no upload, no signup",
    heroSubline:
      "Upload an MKV and get a compatible MP4 in your browser. FFmpeg WASM processes the file locally — nothing is ever uploaded.",
  },
  {
    slug: "mov-to-mp4-converter-free",
    canonical: "video-converter",
    seoTitle: "Free MOV to MP4 Converter Online — Instant",
    seoDescription:
      "Convert MOV to MP4 online free. Instant browser-based conversion via FFmpeg WASM. No uploads, no signup, no watermark. Download your MP4 directly.",
    keywords: ["mov to mp4", "mov to mp4 converter free", "convert mov to mp4 online"],
    h1Prefix: "Convert",
    h1Highlight: "MOV to MP4",
    h1Suffix: "— free, browser-based.",
    eyebrow: "Free MOV to MP4 Converter — no app, no upload",
    heroSubline:
      "Convert QuickTime MOV files to universally compatible MP4 in your browser. FFmpeg WASM handles it locally — no upload, no watermark.",
  },
  {
    slug: "convert-video-online-free",
    canonical: "video-converter",
    seoTitle: "Convert Video Online Free — MP4, MOV, MKV",
    seoDescription:
      "Convert video online free — MP4, MOV, AVI, MKV, WEBM. No upload, no signup, FFmpeg WASM in your browser. Supports any video size your RAM allows.",
    keywords: ["convert video online free", "video converter online free", "online video converter free"],
    h1Prefix: "Convert",
    h1Highlight: "video online",
    h1Suffix: "— free, no upload.",
    eyebrow: "Free Video Converter — MP4, MOV, AVI, MKV, WEBM",
    heroSubline:
      "Upload any video and convert it to any supported format. FFmpeg WASM runs in your browser — no server upload, instant download.",
  },
  {
    slug: "mp4-converter-online",
    canonical: "video-converter",
    seoTitle: "Free MP4 Converter Online — Any Format to MP4",
    seoDescription:
      "Convert any video to MP4 online free. MOV, AVI, MKV, WEBM → MP4. FFmpeg WASM in your browser. No upload, no signup, no watermark.",
    keywords: ["mp4 converter online", "convert to mp4 online free", "online mp4 converter"],
    h1Prefix: "Convert",
    h1Highlight: "any video to MP4",
    h1Suffix: "online, free.",
    eyebrow: "Free MP4 Converter Online — MOV, AVI, MKV, WEBM to MP4",
    heroSubline:
      "Convert MOV, AVI, MKV, or WEBM to MP4 in your browser. FFmpeg WASM processes locally — no uploads, instant download.",
  },
  {
    slug: "webm-to-mp4-online",
    canonical: "video-converter",
    seoTitle: "Free WEBM to MP4 Converter Online",
    seoDescription:
      "Convert WEBM to MP4 online free. Browser-based FFmpeg WASM — no upload, no signup. Convert your WEBM recordings or videos to compatible MP4 instantly.",
    keywords: ["webm to mp4", "webm to mp4 online", "convert webm to mp4 free"],
    h1Prefix: "Convert",
    h1Highlight: "WEBM to MP4",
    h1Suffix: "for free.",
    eyebrow: "Free WEBM to MP4 Converter — browser-based, no upload",
    heroSubline:
      "Upload a WEBM recording and convert it to a widely compatible MP4. Runs entirely in your browser via FFmpeg WASM — nothing is uploaded.",
  },

  // ═══════════════════════ video-recorder ═══════════════════════
  {
    slug: "webcam-recorder-online",
    canonical: "video-recorder",
    seoTitle: "Free Webcam Recorder Online — No Download",
    seoDescription:
      "Record webcam video online free. No download, no signup, no app. Browser MediaRecorder API — live preview, then download as WEBM. Works on any device.",
    keywords: ["webcam recorder online", "online webcam recorder", "record webcam online free"],
    h1Prefix: "Free",
    h1Highlight: "webcam recorder",
    h1Suffix: "— no download.",
    eyebrow: "Free Online Webcam Recorder — no app, no signup",
    heroSubline:
      "Record from your webcam directly in the browser. See a live preview while recording, then download your video as WEBM.",
  },
  {
    slug: "online-video-recorder-free",
    canonical: "video-recorder",
    seoTitle: "Free Online Video Recorder — Webcam No App",
    seoDescription:
      "Record video online free from your webcam. No app to install, no signup. Browser MediaRecorder API captures video and audio. Download as WEBM.",
    keywords: ["online video recorder free", "free online video recorder", "record video online free"],
    h1Prefix: "Record",
    h1Highlight: "video online",
    h1Suffix: "— free, no app.",
    eyebrow: "Free Online Video Recorder — no download, no signup",
    heroSubline:
      "Record a video from your webcam in the browser. No app installation, no account. Click record, see your live preview, download the result.",
  },
  {
    slug: "record-webcam-online",
    canonical: "video-recorder",
    seoTitle: "Record Webcam Online Free — Instant Download",
    seoDescription:
      "Record your webcam online free. Instant download after recording. No app, no signup. Browser MediaRecorder API — works in Chrome, Edge, and Firefox.",
    keywords: ["record webcam online", "record webcam online free", "webcam recording online"],
    h1Prefix: "Record",
    h1Highlight: "your webcam",
    h1Suffix: "— free, instant download.",
    eyebrow: "Record Webcam Online — no app, instant download",
    heroSubline:
      "Open the recorder, allow camera access, and record. Live preview while you go. Download your recording the moment you stop.",
  },
  {
    slug: "video-recorder-no-download",
    canonical: "video-recorder",
    seoTitle: "Video Recorder Online — No Download Needed",
    seoDescription:
      "Record video online without downloading anything. Browser-based webcam recorder — no app, no extension, no signup. Works in any modern browser.",
    keywords: ["video recorder no download", "video recorder online no download", "record video without download"],
    h1Prefix: "Video recorder",
    h1Highlight: "with no download",
    h1Suffix: "needed.",
    eyebrow: "No download, no app — just record video",
    heroSubline:
      "Record video from your webcam without installing anything. Open the page, allow camera access, and record. Designed to work anywhere.",
  },
  {
    slug: "free-webcam-recorder",
    canonical: "video-recorder",
    seoTitle: "Free Webcam Recorder — No Signup, No App",
    seoDescription:
      "Free webcam recorder — record, preview, and download. No signup, no ads, no watermark. Browser MediaRecorder, works in Chrome, Edge, and Firefox.",
    keywords: ["free webcam recorder", "webcam recorder free", "free webcam recording tool"],
    h1Prefix: "Free",
    h1Highlight: "webcam recorder",
    h1Suffix: "— no ads, no watermark.",
    eyebrow: "Free Webcam Recorder — no signup, no watermark",
    heroSubline:
      "Record, preview, and download webcam video for free. No account, no ads, no watermark — clean video recording in your browser.",
  },

  // ═══════════════════════ screen-recorder ═══════════════════════
  {
    slug: "screen-recorder-online-free",
    canonical: "screen-recorder",
    seoTitle: "Free Screen Recorder Online — No Download",
    seoDescription:
      "Record your screen online free. No download, no extension, no signup. Chrome and Edge getDisplayMedia API — choose tab, window, or monitor. Download WEBM.",
    keywords: ["screen recorder online free", "online screen recorder free", "free screen recorder online"],
    h1Prefix: "Free",
    h1Highlight: "screen recorder",
    h1Suffix: "— no download.",
    eyebrow: "Free Online Screen Recorder — no app, Chrome and Edge",
    heroSubline:
      "Capture your screen without installing anything. Chrome shows a native screen picker — choose a tab, window, or monitor and start recording.",
  },
  {
    slug: "record-screen-no-download",
    canonical: "screen-recorder",
    seoTitle: "Record Screen Online — No Download Required",
    seoDescription:
      "Record your screen online without downloading software. Chrome and Edge getDisplayMedia API. No extension, no app, no signup. Download as WEBM.",
    keywords: ["record screen no download", "record screen online no download", "screen recording without download"],
    h1Prefix: "Record your screen",
    h1Highlight: "without downloading",
    h1Suffix: "anything.",
    eyebrow: "Screen Recording — no download, no app, no signup",
    heroSubline:
      "Use your browser to record your screen. Chrome and Edge support getDisplayMedia — no extension or app required. Download the recording as WEBM.",
  },
  {
    slug: "screen-capture-online",
    canonical: "screen-recorder",
    seoTitle: "Free Screen Capture Online — Record Screen",
    seoDescription:
      "Capture your screen online free. Record any tab, window, or full monitor. Chrome and Edge only. No download, no signup. Download your capture as WEBM.",
    keywords: ["screen capture online", "online screen capture free", "screen capture tool online"],
    h1Prefix: "Free",
    h1Highlight: "screen capture",
    h1Suffix: "— online, no signup.",
    eyebrow: "Free Online Screen Capture — record any tab or window",
    heroSubline:
      "Capture any part of your screen in the browser. Pick a tab, window, or full monitor, record, then download your capture as WEBM.",
  },
  {
    slug: "online-screen-recorder-chrome",
    canonical: "screen-recorder",
    seoTitle: "Online Screen Recorder for Chrome — Free",
    seoDescription:
      "Free screen recorder for Chrome — no extension needed. Chrome getDisplayMedia records your screen natively. No download, no signup. Export as WEBM.",
    keywords: ["online screen recorder chrome", "screen recorder chrome extension free", "chrome screen recorder online"],
    h1Prefix: "Screen recorder for",
    h1Highlight: "Chrome",
    h1Suffix: "— no extension needed.",
    eyebrow: "Chrome Screen Recorder — no extension, built into the browser",
    heroSubline:
      "Chrome's built-in getDisplayMedia API lets you record your screen without any extension. Just open this tool, click start, and Chrome handles the rest.",
  },
  {
    slug: "screen-recorder-no-software",
    canonical: "screen-recorder",
    seoTitle: "Screen Recorder — No Software to Install",
    seoDescription:
      "Record your screen without installing any software. Browser-native screen recorder using getDisplayMedia in Chrome and Edge. No app, no signup. Download WEBM.",
    keywords: ["screen recorder no software", "record screen without software", "screen recorder no install"],
    h1Prefix: "Screen recorder",
    h1Highlight: "with no software",
    h1Suffix: "to install.",
    eyebrow: "No software, no extension — just record your screen",
    heroSubline:
      "Record your screen without installing a single thing. Chrome and Edge's native getDisplayMedia API handles it all — just click start and go.",
  },
];

/** Map for O(1) lookup by slug. */
const ALIAS_MAP: Map<string, VideoAlias> = new Map(ALIASES.map((a) => [a.slug, a]));

/** All video alias slugs. */
export const VIDEO_ALIAS_SLUGS: string[] = ALIASES.map((a) => a.slug);

/** Lookup a video alias by slug. */
export function getVideoAlias(slug: string): VideoAlias | undefined {
  return ALIAS_MAP.get(slug);
}

/** Returns true if the slug is a known video alias slug. */
export function isVideoAliasSlug(slug: string): boolean {
  return ALIAS_MAP.has(slug);
}

export { ALIASES as VIDEO_ALIASES };
