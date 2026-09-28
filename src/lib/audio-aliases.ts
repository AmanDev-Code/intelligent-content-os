/**
 * SEO alias slugs for all 4 audio tools.
 *
 * 5 aliases per tool = 20 total alias URLs. Each alias renders the same
 * underlying tool but with a unique H1, eyebrow, subline, and metadata for
 * a distinct search-intent keyword cluster. Each self-canonicalizes to the
 * primary tool so Google indexes it independently.
 *
 * Interface mirrors image-converter-aliases.ts exactly.
 */

export interface AudioAlias {
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

const ALIASES: AudioAlias[] = [
  // ═══════════════════════ audio-converter ═══════════════════════
  {
    slug: "mp3-to-wav-converter",
    canonical: "audio-converter",
    seoTitle: "Free MP3 to WAV Converter Online — No Signup",
    seoDescription:
      "Convert MP3 to WAV online free. No signup, instant download. FFmpeg WASM runs in your browser — your audio never leaves your device.",
    keywords: ["mp3 to wav", "mp3 to wav converter", "convert mp3 to wav online"],
    h1Prefix: "Convert",
    h1Highlight: "MP3 to WAV",
    h1Suffix: "for free.",
    eyebrow: "Free MP3 to WAV Converter — no signup, browser-based",
    heroSubline:
      "Upload any MP3 and get a lossless WAV in seconds. No signup, no watermark, runs entirely in your browser via FFmpeg WASM.",
  },
  {
    slug: "wav-to-mp3-online",
    canonical: "audio-converter",
    seoTitle: "Free WAV to MP3 Converter Online — Instant",
    seoDescription:
      "Convert WAV to MP3 online free. Instant, no signup, no file size limit. Browser-based FFmpeg WASM — audio never leaves your device.",
    keywords: ["wav to mp3", "wav to mp3 online", "convert wav to mp3 free"],
    h1Prefix: "Convert",
    h1Highlight: "WAV to MP3",
    h1Suffix: "online, free.",
    eyebrow: "WAV to MP3 Converter — instant, browser-based",
    heroSubline:
      "Upload a WAV, get a compressed MP3. No account, no watermark, FFmpeg WASM processes it locally.",
  },
  {
    slug: "flac-to-mp3-converter",
    canonical: "audio-converter",
    seoTitle: "Free FLAC to MP3 Converter Online — Fast",
    seoDescription:
      "Convert FLAC to MP3 online free. Fast browser-based conversion via FFmpeg WASM. No uploads, no signup, no watermark. Download instantly.",
    keywords: ["flac to mp3", "flac to mp3 converter", "convert flac to mp3 online free"],
    h1Prefix: "Convert",
    h1Highlight: "FLAC to MP3",
    h1Suffix: "— browser-based.",
    eyebrow: "Free FLAC to MP3 Converter — no upload, no signup",
    heroSubline:
      "Convert lossless FLAC to MP3 in your browser. FFmpeg WASM handles the conversion locally — no file upload, instant result.",
  },
  {
    slug: "convert-audio-online-free",
    canonical: "audio-converter",
    seoTitle: "Convert Audio Online Free — MP3, WAV, FLAC",
    seoDescription:
      "Convert audio files online free — MP3, WAV, FLAC, AAC, OGG, M4A. No signup, no upload, browser-based FFmpeg WASM. Download in any format.",
    keywords: ["convert audio online free", "audio converter online free", "online audio converter"],
    h1Prefix: "Convert",
    h1Highlight: "audio online",
    h1Suffix: "— free, no upload.",
    eyebrow: "Free Audio Converter — MP3, WAV, FLAC, AAC, OGG, M4A",
    heroSubline:
      "Upload any audio file and convert it to any supported format. FFmpeg WASM runs in your browser — nothing is ever uploaded.",
  },
  {
    slug: "audio-format-converter-free",
    canonical: "audio-converter",
    seoTitle: "Free Audio Format Converter — All Formats",
    seoDescription:
      "Free audio format converter supporting MP3, WAV, FLAC, AAC, OGG, M4A. Browser-based, no signup, no watermark. Convert any audio format online.",
    keywords: ["audio format converter", "audio format converter free", "free audio format converter"],
    h1Prefix: "Free",
    h1Highlight: "audio format converter",
    h1Suffix: "— all formats.",
    eyebrow: "Convert any audio format free — no signup, no watermark",
    heroSubline:
      "The simplest free audio format converter online. Supports MP3, WAV, FLAC, AAC, OGG, M4A — all processed locally via FFmpeg WASM.",
  },

  // ═══════════════════════ audio-recorder ═══════════════════════
  {
    slug: "online-voice-recorder",
    canonical: "audio-recorder",
    seoTitle: "Free Online Voice Recorder — No Download",
    seoDescription:
      "Record your voice online free. No download, no signup, no app. Browser MediaRecorder API — works in Chrome, Firefox, and Safari. Download as WEBM.",
    keywords: ["online voice recorder", "voice recorder online", "record voice online free"],
    h1Prefix: "Record",
    h1Highlight: "your voice",
    h1Suffix: "online, free.",
    eyebrow: "Free Online Voice Recorder — no app, no signup",
    heroSubline:
      "Record your microphone directly in the browser. No app to install, no account needed. Listen back and download your recording as WEBM.",
  },
  {
    slug: "record-audio-online-free",
    canonical: "audio-recorder",
    seoTitle: "Record Audio Online Free — No App Needed",
    seoDescription:
      "Record audio online free from your microphone. No app, no signup, no file upload. Works in Chrome, Firefox, and Safari. Download instantly.",
    keywords: ["record audio online free", "record audio online", "online audio recording free"],
    h1Prefix: "Record",
    h1Highlight: "audio online",
    h1Suffix: "— no app needed.",
    eyebrow: "Record audio free — no download, no signup",
    heroSubline:
      "Open the recorder, click record, and your browser captures your microphone. No app install required — download your audio the moment you stop.",
  },
  {
    slug: "microphone-recorder-online",
    canonical: "audio-recorder",
    seoTitle: "Free Microphone Recorder Online — Instant",
    seoDescription:
      "Record from your microphone online free. Instant playback and download. No app, no signup. Browser-native MediaRecorder API — works on all devices.",
    keywords: ["microphone recorder online", "online microphone recorder", "record microphone online free"],
    h1Prefix: "Free",
    h1Highlight: "microphone recorder",
    h1Suffix: "— browser-based.",
    eyebrow: "Online Microphone Recorder — no signup, instant download",
    heroSubline:
      "Record straight from your microphone in the browser. Instant playback, one-click download. Works on desktop and mobile.",
  },
  {
    slug: "voice-recorder-no-download",
    canonical: "audio-recorder",
    seoTitle: "Voice Recorder Online — No Download Required",
    seoDescription:
      "Record your voice online without downloading anything. Browser-based voice recorder — no app, no extension, no signup. Works in any modern browser.",
    keywords: ["voice recorder no download", "voice recorder online no download", "record voice without download"],
    h1Prefix: "Voice recorder",
    h1Highlight: "with no download",
    h1Suffix: "required.",
    eyebrow: "No download, no app — just record",
    heroSubline:
      "Record your voice online without installing anything. Open the page, allow microphone access, and record. That's it.",
  },
  {
    slug: "free-audio-recorder-online",
    canonical: "audio-recorder",
    seoTitle: "Free Audio Recorder Online — No Signup",
    seoDescription:
      "Free online audio recorder — record, playback, and download. No signup, no ads, no watermark. Browser-based MediaRecorder, works in Chrome and Firefox.",
    keywords: ["free audio recorder online", "audio recorder online free", "online audio recorder"],
    h1Prefix: "Free",
    h1Highlight: "audio recorder",
    h1Suffix: "— no signup.",
    eyebrow: "Free Audio Recorder Online — no ads, no watermark",
    heroSubline:
      "Record, listen back, and download your audio for free. No account, no ads, no watermark — just clean audio recording in your browser.",
  },

  // ═══════════════════════ text-to-speech ═══════════════════════
  {
    slug: "tts-online-free",
    canonical: "text-to-speech",
    seoTitle: "Free TTS Online — Text to Speech No Signup",
    seoDescription:
      "Free TTS online — convert text to speech instantly. Natural voices, adjustable speed and pitch. Works in Chrome and Edge. No signup, no watermark.",
    keywords: ["tts online free", "free tts online", "tts tool online"],
    h1Prefix: "Free",
    h1Highlight: "TTS online",
    h1Suffix: "— natural voices.",
    eyebrow: "Free TTS Tool — no signup, browser-native voices",
    heroSubline:
      "Turn any text into speech using your browser's built-in voices. Adjust speed and pitch. No account, no watermark, works instantly.",
  },
  {
    slug: "text-to-voice-converter",
    canonical: "text-to-speech",
    seoTitle: "Free Text to Voice Converter Online",
    seoDescription:
      "Convert text to voice online free. Choose from browser voices, adjust speed and pitch. Works in Chrome, Edge, Safari. No signup, instant playback.",
    keywords: ["text to voice converter", "text to voice online free", "convert text to voice"],
    h1Prefix: "Convert",
    h1Highlight: "text to voice",
    h1Suffix: "for free.",
    eyebrow: "Free Text to Voice Converter — browser-based, instant",
    heroSubline:
      "Type or paste any text and hear it spoken aloud instantly. Choose from available system voices and adjust the playback speed.",
  },
  {
    slug: "read-text-aloud-free",
    canonical: "text-to-speech",
    seoTitle: "Read Text Aloud Online Free — No App",
    seoDescription:
      "Read any text aloud online free. No app, no signup. Web Speech API in Chrome and Edge reads text with natural voices. Up to 5,000 characters.",
    keywords: ["read text aloud free", "read text aloud online free", "read text aloud no app"],
    h1Prefix: "Read",
    h1Highlight: "text aloud",
    h1Suffix: "online, free.",
    eyebrow: "Read Text Aloud Free — no app, no signup needed",
    heroSubline:
      "Paste any text and play it as speech. Great for proofreading, accessibility, and listening to articles. No app needed.",
  },
  {
    slug: "text-to-mp3-online",
    canonical: "text-to-speech",
    seoTitle: "Text to MP3 Online Free — Convert Text",
    seoDescription:
      "Convert text to speech online free. Browser Web Speech API plays text with natural voices. No signup. Note: audio plays in-browser; download requires system recording.",
    keywords: ["text to mp3 online", "text to mp3 free", "convert text to mp3 online"],
    h1Prefix: "Convert",
    h1Highlight: "text to speech",
    h1Suffix: "online, free.",
    eyebrow: "Text to Speech Online — natural voices, no signup",
    heroSubline:
      "Paste text and hear it spoken aloud via your browser's built-in speech synthesis. Choose voice, speed, and pitch. No account required.",
  },
  {
    slug: "free-tts-tool-online",
    canonical: "text-to-speech",
    seoTitle: "Free TTS Tool Online — Text to Speech",
    seoDescription:
      "Free TTS tool online — type text, pick a voice, and press play. Adjustable speed and pitch. Web Speech API in Chrome and Edge. No signup, no watermark.",
    keywords: ["free tts tool online", "tts tool free", "online tts tool"],
    h1Prefix: "Free",
    h1Highlight: "TTS tool",
    h1Suffix: "— type, pick voice, play.",
    eyebrow: "Free Online TTS Tool — no ads, no watermark",
    heroSubline:
      "The simplest free TTS tool online. Type your text, pick a voice, adjust speed and pitch, then press play. No signup required.",
  },

  // ═══════════════════════ speech-to-text ═══════════════════════
  {
    slug: "voice-to-text-online",
    canonical: "speech-to-text",
    seoTitle: "Free Voice to Text Online — No App",
    seoDescription:
      "Convert voice to text online free. No app, no signup. Chrome SpeechRecognition API gives a live transcript. Supports 8 languages. Copy or download as .txt.",
    keywords: ["voice to text online", "voice to text free", "voice to text online free"],
    h1Prefix: "Convert",
    h1Highlight: "voice to text",
    h1Suffix: "online, free.",
    eyebrow: "Free Voice to Text — no app, 8 languages, live transcript",
    heroSubline:
      "Speak into your microphone and watch the transcript appear in real time. Copy your text or download as a .txt file. No app or signup needed.",
  },
  {
    slug: "transcribe-audio-online-free",
    canonical: "speech-to-text",
    seoTitle: "Transcribe Audio Online Free — No Signup",
    seoDescription:
      "Transcribe audio to text online free. Speak or play audio near your mic and get a live transcript. Works in Chrome and Edge. No signup, no upload.",
    keywords: ["transcribe audio online free", "transcribe audio online", "online audio transcription free"],
    h1Prefix: "Transcribe",
    h1Highlight: "audio to text",
    h1Suffix: "— free, no signup.",
    eyebrow: "Free Audio Transcription — no signup, Chrome and Edge",
    heroSubline:
      "Get a real-time transcript of any speech. Works with your microphone — speak directly or play audio near it. Copy or download the result.",
  },
  {
    slug: "speech-recognition-online",
    canonical: "speech-to-text",
    seoTitle: "Free Speech Recognition Online — Live Transcript",
    seoDescription:
      "Free browser speech recognition. Speak and see a live transcript in 8 languages. No app, no signup. Chrome and Edge SpeechRecognition API.",
    keywords: ["speech recognition online", "online speech recognition free", "browser speech recognition"],
    h1Prefix: "Free",
    h1Highlight: "speech recognition",
    h1Suffix: "— live, in your browser.",
    eyebrow: "Browser Speech Recognition — 8 languages, no signup",
    heroSubline:
      "Your browser recognizes your speech and converts it to text in real time. Supports 8 languages, works entirely client-side in Chrome and Edge.",
  },
  {
    slug: "dictation-online-free",
    canonical: "speech-to-text",
    seoTitle: "Free Online Dictation — Speech to Text",
    seoDescription:
      "Dictate text online free with your microphone. Real-time speech to text in 8 languages. Chrome and Edge only. No signup, no app, copy or download transcript.",
    keywords: ["dictation online free", "online dictation tool", "free dictation online"],
    h1Prefix: "Free",
    h1Highlight: "online dictation",
    h1Suffix: "— speak to type.",
    eyebrow: "Online Dictation Tool — free, no app, 8 languages",
    heroSubline:
      "Dictate text by speaking into your microphone. The browser converts your speech to text in real time — edit, copy, or download the result.",
  },
  {
    slug: "audio-to-text-converter",
    canonical: "speech-to-text",
    seoTitle: "Free Audio to Text Converter — Live Transcript",
    seoDescription:
      "Convert audio to text online free. Speak or play audio near your microphone for a live transcript. 8 languages, Chrome and Edge. No signup required.",
    keywords: ["audio to text converter", "audio to text online free", "convert audio to text"],
    h1Prefix: "Convert",
    h1Highlight: "audio to text",
    h1Suffix: "— live, free.",
    eyebrow: "Free Audio to Text Converter — 8 languages, no signup",
    heroSubline:
      "Get a text transcript from live speech or audio. Works in Chrome and Edge — no file upload, no signup, copy or download your transcript.",
  },
];

/** Map for O(1) lookup by slug. */
const ALIAS_MAP: Map<string, AudioAlias> = new Map(ALIASES.map((a) => [a.slug, a]));

/** All audio alias slugs. */
export const AUDIO_ALIAS_SLUGS: string[] = ALIASES.map((a) => a.slug);

/** Lookup an audio alias by slug. */
export function getAudioAlias(slug: string): AudioAlias | undefined {
  return ALIAS_MAP.get(slug);
}

/** Returns true if the slug is a known audio alias slug. */
export function isAudioAliasSlug(slug: string): boolean {
  return ALIAS_MAP.has(slug);
}

export { ALIASES as AUDIO_ALIASES };
