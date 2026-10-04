/**
 * Audio tool dataset — single source of truth for all 4 audio tools.
 *
 * Tools: audio-converter, audio-recorder, text-to-speech, speech-to-text.
 */

export interface AudioTool {
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

export const AUDIO_TOOLS: readonly AudioTool[] = [
  // ─────────────────────────── audio-converter ───────────────────────────
  {
    slug: "audio-converter",
    name: "Audio Converter",
    primaryKeyword: "audio converter online free",
    searchVolume: 110000,
    seoTitle: "Free Audio Converter — MP3, WAV, FLAC, AAC",
    seoDescription:
      "Convert audio files online free — MP3, WAV, FLAC, AAC, OGG, M4A. No upload, no signup, runs entirely in your browser. FFmpeg WASM powered.",
    h1: "Free Audio Converter — MP3, WAV, FLAC, AAC Online",
    description:
      "Convert audio files between any format — MP3, WAV, FLAC, AAC, OGG, M4A — entirely in your browser using FFmpeg WASM. No uploads, no signup, no file size limits.",
    processingEngine: "ffmpeg-wasm",
    faqs: [
      {
        question: "How does the audio converter work?",
        answer:
          "It uses FFmpeg compiled to WebAssembly (WASM) and runs entirely in your browser. Your audio file is never uploaded to any server — conversion happens locally on your device.",
      },
      {
        question: "Which audio formats are supported?",
        answer:
          "MP3, WAV, FLAC, AAC, OGG, and M4A. You can convert between any combination of these formats — for example WAV to MP3, FLAC to AAC, or OGG to M4A.",
      },
      {
        question: "Why does it take a moment to start the first conversion?",
        answer:
          "The first conversion downloads the FFmpeg WASM core (~33 MB) from a CDN and caches it in your browser. Subsequent conversions on the same device start instantly.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "There is no hard limit. The practical ceiling is your device's available RAM. Most modern browsers handle audio files up to several gigabytes without issue.",
      },
      {
        question: "Does audio quality change during conversion?",
        answer:
          "Lossless formats (WAV, FLAC) converted to each other preserve full quality. Converting to a lossy format (MP3, AAC, OGG) involves some quality trade-off by design. Converting from MP3 to WAV does not restore lost data — it only changes the container.",
      },
    ],
  },

  // ─────────────────────────── audio-recorder ───────────────────────────
  {
    slug: "audio-recorder",
    name: "Audio Recorder",
    primaryKeyword: "online audio recorder free",
    searchVolume: 70000,
    seoTitle: "Free Online Audio Recorder — No App",
    seoDescription:
      "Record audio online free, straight from your microphone. No app, no signup, no download. Works in Chrome, Firefox, and Safari. Download as WEBM.",
    h1: "Free Online Audio Recorder — No App",
    description:
      "Record audio directly from your microphone in the browser using the MediaRecorder API. No app to install, no account needed. Preview and download your recording as WEBM.",
    processingEngine: "native-api",
    faqs: [
      {
        question: "How do I record audio online without downloading software?",
        answer:
          "Use Trndinn's Audio Recorder. Click 'Start Recording', grant microphone permission when prompted, and your browser records directly using the MediaRecorder API. No app or plugin needed.",
      },
      {
        question: "What format does the recording download in?",
        answer:
          "Recordings download as WEBM, which is a royalty-free format supported by all modern browsers. If you need MP3 or WAV, use the Audio Converter tool to convert your WEBM recording.",
      },
      {
        question: "Why does my browser ask for microphone permission?",
        answer:
          "Browsers require explicit user permission before accessing the microphone. The recording stays in your browser — nothing is sent to a server. You can revoke microphone access from your browser settings at any time.",
      },
      {
        question: "Does the audio recorder work on mobile?",
        answer:
          "Yes. The MediaRecorder API is supported in Chrome for Android and Safari on iOS 14.3+. Microphone access works the same way — tap 'Start Recording' and allow mic access when prompted.",
      },
      {
        question: "Is there a recording time limit?",
        answer:
          "No. Recordings can be any length. Practical limits are your device's available RAM and storage, but typical voice memos and meetings record without issue.",
      },
    ],
  },

  // ─────────────────────────── text-to-speech ───────────────────────────
  {
    slug: "text-to-speech",
    name: "Text to Speech",
    primaryKeyword: "text to speech online free",
    searchVolume: 200000,
    seoTitle: "Free Text to Speech Online — Natural Voices",
    seoDescription:
      "Convert text to speech online free with natural browser voices. Adjust speed and pitch. Works in Chrome and Edge. No signup, no download, no watermark.",
    h1: "Free Text to Speech Online — Natural Voices",
    description:
      "Convert any text to speech using your browser's built-in Web Speech API. Choose from available voices, adjust rate and pitch, then play or listen. Completely free, no signup.",
    processingEngine: "native-api",
    faqs: [
      {
        question: "How does the text to speech tool work?",
        answer:
          "It uses the Web Speech API built into modern browsers. Voices are provided by your operating system and browser — no audio is sent to any server. Synthesis happens instantly, locally.",
      },
      {
        question: "Which browsers support the text to speech tool?",
        answer:
          "Chrome and Edge have the most voices and best synthesis quality. Firefox supports the Web Speech API with limited voices. Safari on macOS and iOS also works well with system voices.",
      },
      {
        question: "Can I download the audio as an MP3 or WAV?",
        answer:
          "The Web Speech API does not expose an audio stream for download. To record the output, use your system's audio recording software while playing through the tool, or use a dedicated TTS service with file export.",
      },
      {
        question: "How many characters can I convert at once?",
        answer:
          "The tool allows up to 5,000 characters per input. For longer content, split it into sections and play each sequentially.",
      },
      {
        question: "Why can I only see a few voices?",
        answer:
          "Available voices depend on your operating system and browser. Windows offers Microsoft voices, macOS offers Siri voices, and Chrome on Android offers Google's voices. Installing additional OS language packs adds more voices.",
      },
    ],
  },

  // ─────────────────────────── speech-to-text ───────────────────────────
  {
    slug: "speech-to-text",
    name: "Speech to Text",
    primaryKeyword: "speech to text online free",
    searchVolume: 150000,
    seoTitle: "Free Speech to Text Online — Voice Transcription",
    seoDescription:
      "Transcribe speech to text online free. Speak into your microphone and get a live transcript. Supports 8 languages. Chrome and Edge only. No signup required.",
    h1: "Free Speech to Text Online — Voice Transcription",
    description:
      "Transcribe speech to text in real time using your browser's SpeechRecognition API. Speak into your microphone and watch the transcript appear live. Copy or download as .txt.",
    processingEngine: "native-api",
    faqs: [
      {
        question: "How accurate is the speech to text transcription?",
        answer:
          "Accuracy depends on your microphone quality, background noise, and accent. Chrome's SpeechRecognition API uses Google's speech recognition backend and performs well for clear speech in quiet environments.",
      },
      {
        question: "Which languages are supported?",
        answer:
          "English (US/UK), Spanish, French, German, Portuguese, Italian, Japanese, and Chinese (Simplified). Select your language from the dropdown before starting.",
      },
      {
        question: "Why doesn't speech to text work in Firefox?",
        answer:
          "Firefox does not support the SpeechRecognition API as of 2026. Use Chrome or Edge for this tool. Safari on macOS 14+ has partial support.",
      },
      {
        question: "Does the tool send my voice to a server?",
        answer:
          "Chrome's SpeechRecognition API sends audio to Google's servers for processing. This is handled by the browser, not Trndinn — Trndinn receives only the text transcript, which is displayed locally and never stored.",
      },
      {
        question: "Can I transcribe a pre-recorded audio file?",
        answer:
          "This tool captures live microphone input only. To transcribe a pre-recorded file, play it through your speakers while the tool is listening, or use a dedicated transcription service for file-based input.",
      },
    ],
  },
];

/** All audio tool slugs. */
export const ALL_AUDIO_SLUGS: string[] = AUDIO_TOOLS.map((t) => t.slug);

/** Lookup an audio tool by slug. */
export function getAudioTool(slug: string): AudioTool | undefined {
  return AUDIO_TOOLS.find((t) => t.slug === slug);
}

/** Returns true if the slug matches a primary audio tool slug. */
export function isAudioSlug(slug: string): boolean {
  return ALL_AUDIO_SLUGS.includes(slug);
}
