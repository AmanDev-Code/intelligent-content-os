/**
 * Video tool dataset — single source of truth for all 3 video tools.
 *
 * Tools: video-converter, video-recorder, screen-recorder.
 */

export interface VideoTool {
  slug: string;
  name: string;
  primaryKeyword: string;
  searchVolume: number;
  /** SEO title — ≤50 chars (template appends " | Trndinn") */
  seoTitle: string;
  /** SEO meta description — 140-160 chars */
  seoDescription: string;
  h1: string;
  faqs: Array<{ question: string; answer: string }>;
  description: string;
  processingEngine: "ffmpeg-wasm" | "native-api";
}

export const VIDEO_TOOLS: readonly VideoTool[] = [
  // ─────────────────────────── video-converter ───────────────────────────
  {
    slug: "video-converter",
    name: "Video Converter",
    primaryKeyword: "video converter online free",
    searchVolume: 200000,
    seoTitle: "Free Video Converter Online — MP4, MOV, AVI",
    seoDescription:
      "Convert video files online free — MP4, MOV, AVI, MKV, WEBM. No upload, no signup, FFmpeg WASM in your browser. Supports files up to your device RAM.",
    h1: "Free Video Converter Online — MP4, MOV, AVI",
    description:
      "Convert video files between any popular format — MP4, MOV, AVI, MKV, WEBM — entirely in your browser using FFmpeg WASM. No uploads, no signup, no file size limits.",
    processingEngine: "ffmpeg-wasm",
    faqs: [
      {
        question: "How does the browser-based video converter work?",
        answer:
          "It uses FFmpeg compiled to WebAssembly (WASM) running entirely in your browser. Your video file is never uploaded — conversion happens locally on your device using your CPU.",
      },
      {
        question: "Which video formats are supported?",
        answer:
          "MP4, MOV, AVI, MKV, and WEBM. You can convert between any combination — for example MKV to MP4, MOV to WEBM, or AVI to MKV.",
      },
      {
        question: "Why does the first conversion take longer?",
        answer:
          "The first run downloads the FFmpeg WASM core (~33 MB) from a CDN and caches it in your browser. All subsequent conversions start immediately.",
      },
      {
        question: "Is there a file size limit for video conversion?",
        answer:
          "No hard limit. The practical ceiling is your device's available RAM. A 1 GB video file typically needs 2–3 GB of free RAM for processing. For very large files, a desktop with 8+ GB RAM is recommended.",
      },
      {
        question: "How long does video conversion take?",
        answer:
          "Conversion time depends on file size, target format, and your device's CPU speed. A 100 MB MP4 typically converts in 30–90 seconds. FFmpeg processes video using your browser's available CPU threads.",
      },
    ],
  },

  // ─────────────────────────── video-recorder ───────────────────────────
  {
    slug: "video-recorder",
    name: "Video Recorder",
    primaryKeyword: "online video recorder free",
    searchVolume: 40000,
    seoTitle: "Free Online Video Recorder — Webcam",
    seoDescription:
      "Record video online free from your webcam. No app, no signup, no download. MediaRecorder API — works in Chrome, Edge, and Firefox. Download as WEBM.",
    h1: "Free Online Video Recorder — Webcam",
    description:
      "Record video directly from your webcam in the browser using the MediaRecorder API. See a live preview while recording. No app to install, no account needed. Download as WEBM.",
    processingEngine: "native-api",
    faqs: [
      {
        question: "How do I record webcam video without downloading software?",
        answer:
          "Open the Video Recorder tool, click 'Start Recording', and allow camera and microphone access when prompted. Your browser records the webcam feed locally — nothing is uploaded.",
      },
      {
        question: "What format does the webcam recording download in?",
        answer:
          "Recordings download as WEBM with VP8/VP9 video codec. WEBM is supported natively in Chrome, Firefox, and Edge. To convert to MP4, use the Video Converter tool.",
      },
      {
        question: "Does the video recorder capture audio as well?",
        answer:
          "Yes. The recorder requests access to both your camera and microphone. If you want video-only, you can deny microphone access and the recording will proceed without audio.",
      },
      {
        question: "Can I record my screen instead of my webcam?",
        answer:
          "Use the Screen Recorder tool for screen capture. The Video Recorder is specifically for webcam recording via getUserMedia().",
      },
      {
        question: "Is there a recording duration limit?",
        answer:
          "No. Record as long as you need — practical limits are your device's available RAM and browser memory. Typical video calls and short demos record without issue.",
      },
    ],
  },

  // ─────────────────────────── screen-recorder ───────────────────────────
  {
    slug: "screen-recorder",
    name: "Screen Recorder",
    primaryKeyword: "screen recorder online free",
    searchVolume: 80000,
    seoTitle: "Free Screen Recorder Online — No Download",
    seoDescription:
      "Record your screen online free with no download, no software, no signup. Works in Chrome 72+ and Edge 79+. Browser-native getDisplayMedia API. Download as WEBM.",
    h1: "Free Screen Recorder Online — No Download",
    description:
      "Capture your screen in the browser using the getDisplayMedia API. Chrome and Edge show a native screen picker — select your tab, window, or entire monitor. No extension or app required.",
    processingEngine: "native-api",
    faqs: [
      {
        question: "Does the screen recorder work without installing anything?",
        answer:
          "Yes. Chrome 72+ and Edge 79+ support getDisplayMedia(), which lets you capture your screen without any extension, plugin, or downloaded app. Just open the tool and click 'Start Recording'.",
      },
      {
        question: "Can I record just one browser tab instead of the whole screen?",
        answer:
          "Yes. When you click 'Start Recording', your browser shows a native screen picker where you can choose to share a specific tab, a window, or your entire monitor.",
      },
      {
        question: "Does the screen recorder capture system audio?",
        answer:
          "Chrome on Windows supports capturing system audio via the screen picker. macOS does not allow system audio capture from browsers due to OS restrictions. Microphone audio can be added separately.",
      },
      {
        question: "Why doesn't screen recording work in Safari?",
        answer:
          "Safari does not support the getDisplayMedia() API as of 2026. Use Chrome or Edge for screen recording. Firefox has partial support starting from version 66.",
      },
      {
        question: "What format does the screen recording download in?",
        answer:
          "Screen recordings download as WEBM. Use the Video Converter tool to convert your recording to MP4, MOV, or another format if needed.",
      },
    ],
  },
];

/** All video tool slugs. */
export const ALL_VIDEO_SLUGS: string[] = VIDEO_TOOLS.map((t) => t.slug);

/** Lookup a video tool by slug. */
export function getVideoTool(slug: string): VideoTool | undefined {
  return VIDEO_TOOLS.find((t) => t.slug === slug);
}

/** Returns true if the slug matches a primary video tool slug. */
export function isVideoSlug(slug: string): boolean {
  return ALL_VIDEO_SLUGS.includes(slug);
}
