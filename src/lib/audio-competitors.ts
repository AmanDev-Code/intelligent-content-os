/**
 * Audio competitor dataset — single source of truth for
 * /alternatives/{slug} and /compare/trndinn-vs-{slug} pages.
 *
 * 5 competitors: convertio (audio), freeconvert (audio), speechnotes (STT),
 * naturalreader (TTS), vocaroo (recorder).
 *
 * Same shape as image-converter-competitors.ts.
 */

export type AudioCompetitorPricingPlan = {
  name: string;
  price: string;
  note?: string;
};

export type AudioCompetitorComparisonRow = {
  feature: string;
  competitor: string;
  trndinn: string;
};

export type AudioCompetitorFaq = {
  question: string;
  answer: string;
};

export type AudioCompetitorWedgePoint = {
  title: string;
  description: string;
};

export type AudioCompetitor = {
  slug: string;
  name: string;
  url: string;
  targetKeyword: string;
  keywordDifficulty: number;
  monthlyVolume: number;
  tagline: string;
  overview: string;
  positioning: string[];
  pricingPlans: AudioCompetitorPricingPlan[];
  pricingNotes: string[];
  weaknesses: string[];
  wedgeSummary: string;
  wedgePoints: AudioCompetitorWedgePoint[];
  comparisonRows: AudioCompetitorComparisonRow[];
  faqs: AudioCompetitorFaq[];
  switchAngle: string;
};

export const AUDIO_COMPETITORS: readonly AudioCompetitor[] = [
  // ─────────────────────────── Convertio ───────────────────────────
  {
    slug: "convertio",
    name: "Convertio",
    url: "https://convertio.co",
    targetKeyword: "convertio audio converter",
    monthlyVolume: 2200000,
    keywordDifficulty: 72,
    tagline:
      "Popular cloud-based file converter with audio support — but uploads files to remote servers and limits free conversions to 25 per day.",
    overview:
      "Convertio is a cloud-based file converter supporting 300+ format combinations including audio. Audio files are uploaded to Convertio's servers for processing, which introduces privacy concerns and daily conversion limits.",
    positioning: [
      "Convertio is one of the most recognised online file conversion brands. Its audio converter handles MP3, WAV, FLAC, AAC, OGG, and many other formats via a simple upload interface.",
      "The trade-off: all processing happens on Convertio's remote servers. Files are uploaded, converted, and stored temporarily. The free tier limits users to 25 conversions per day and 100 MB per file.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "100 MB limit, 25 conversions/day, cloud processing" },
      { name: "Light", price: "$9.99/mo", note: "500 MB limit, 25 conversions/day" },
      { name: "Premium", price: "$14.99/mo", note: "1 GB limit, unlimited conversions" },
    ],
    pricingNotes: [
      "Free tier caps at 25 audio conversions per day",
      "All audio files uploaded to Convertio's servers",
      "Batch audio conversion requires paid plan",
    ],
    weaknesses: [
      "Audio files uploaded to remote servers — privacy risk",
      "Free tier limited to 25 conversions per day",
      "Batch conversion requires paid subscription",
      "Network-dependent — requires internet for every conversion",
      "No local processing option",
    ],
    wedgeSummary:
      "Trndinn converts audio entirely in your browser using FFmpeg WASM — zero uploads, zero server round-trips, unlimited batch processing, instant results.",
    wedgePoints: [
      {
        title: "Zero uploads — audio never leaves your device",
        description:
          "Convertio uploads every audio file to their servers. Trndinn's converter runs entirely in your browser via FFmpeg WASM. Your audio is processed locally and never transmitted anywhere.",
      },
      {
        title: "Unlimited conversions — no daily cap",
        description:
          "Convertio's free tier allows 25 conversions per day. Trndinn has no daily limit, no file count cap, and no subscription required to convert as many audio files as you need.",
      },
      {
        title: "Instant processing — no upload/download round-trip",
        description:
          "Cloud converters add latency for upload, server processing, and download. Trndinn converts locally using FFmpeg WASM — a 50 MB WAV to MP3 completes before Convertio finishes uploading.",
      },
      {
        title: "Purpose-built audio tools — recorder, TTS, STT included",
        description:
          "Convertio handles format conversion only. Trndinn includes an audio recorder, text-to-speech, and speech-to-text tool alongside the converter — a complete browser-native audio toolkit.",
      },
    ],
    comparisonRows: [
      { feature: "File privacy", competitor: "Uploaded to Convertio servers", trndinn: "✅ Never leaves your browser" },
      { feature: "Free conversions/day", competitor: "25 per day", trndinn: "✅ Unlimited" },
      { feature: "Batch conversion", competitor: "Paid plan only", trndinn: "✅ Free, unlimited" },
      { feature: "Processing location", competitor: "Cloud (Convertio servers)", trndinn: "✅ Local browser (FFmpeg WASM)" },
      { feature: "Audio recorder", competitor: "Not included", trndinn: "✅ Free browser recorder" },
      { feature: "Signup required", competitor: "No (account unlocks limits)", trndinn: "✅ Never" },
    ],
    faqs: [
      {
        question: "Is Convertio safe to use for audio files?",
        answer:
          "Convertio uploads audio files to remote servers for processing. For sensitive recordings, this is a privacy risk. Trndinn converts in your browser — audio never leaves your device.",
      },
      {
        question: "Is there a free Convertio audio alternative?",
        answer:
          "Yes. Trndinn converts audio locally in your browser via FFmpeg WASM. No uploads, no daily limits, no signup — and it includes an audio recorder and speech tools.",
      },
      {
        question: "How do I convert audio without uploading it?",
        answer:
          "Use Trndinn's Audio Converter. FFmpeg WASM runs entirely in your browser. Files are processed locally and never transmitted to any server.",
      },
    ],
    switchAngle:
      "Switch from Convertio for local audio processing, no upload limits, and a complete browser audio toolkit.",
  },

  // ─────────────────────────── FreeConvert ───────────────────────────
  {
    slug: "freeconvert",
    name: "FreeConvert",
    url: "https://freeconvert.com",
    targetKeyword: "freeconvert audio converter",
    monthlyVolume: 380000,
    keywordDifficulty: 58,
    tagline:
      "General-purpose cloud converter with audio support — but free tier limited to 25 conversions per day and files uploaded to remote servers.",
    overview:
      "FreeConvert is an online file conversion tool supporting audio, video, document, and image formats. Audio files are processed on their cloud servers with a free tier cap of 25 daily conversions and 1 GB file size.",
    positioning: [
      "FreeConvert positions itself as a free alternative to premium cloud converters. It supports a wide range of audio formats — MP3, WAV, FLAC, AAC, OGG, M4A — with optional quality and bitrate settings.",
      "The limitation: all processing is server-side. Free users get 25 conversions per day and 1 GB file size limit. The paid plan unlocks higher limits and queue priority.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "25 conversions/day, 1 GB file limit, cloud processing" },
      { name: "Pro", price: "$9.99/mo", note: "Unlimited conversions, 4 GB file limit, priority queue" },
    ],
    pricingNotes: [
      "Free tier: 25 conversions/day with 1 GB file limit",
      "All audio files uploaded to FreeConvert servers",
      "Queue wait time on free tier during peak hours",
    ],
    weaknesses: [
      "Audio files uploaded to remote servers",
      "Free tier limited to 25 conversions per day",
      "Queue delays on the free tier during peak hours",
      "No built-in recorder or speech tools",
      "Network-dependent processing",
    ],
    wedgeSummary:
      "Trndinn processes audio locally in your browser. No uploads, no 25-conversion cap, no queue delays, and it includes an audio recorder, TTS, and speech-to-text.",
    wedgePoints: [
      {
        title: "Local processing — no uploads, instant start",
        description:
          "FreeConvert uploads your audio to their servers and queues the job. Trndinn's FFmpeg WASM runs in your browser — conversion starts the moment you click, with no queue wait.",
      },
      {
        title: "Unlimited conversions — no daily cap",
        description:
          "FreeConvert's free tier caps at 25 conversions per day. Trndinn has no cap — convert as many files as you need, as often as you need, with no subscription.",
      },
      {
        title: "Complete audio toolkit — not just a converter",
        description:
          "FreeConvert only converts file formats. Trndinn includes an audio recorder, text-to-speech, and speech-to-text tool alongside the format converter.",
      },
      {
        title: "Zero privacy risk — files never leave your device",
        description:
          "FreeConvert stores your files on their servers during processing. Trndinn processes audio locally — your recordings and audio files are never transmitted anywhere.",
      },
    ],
    comparisonRows: [
      { feature: "File privacy", competitor: "Uploaded to FreeConvert servers", trndinn: "✅ Never leaves your browser" },
      { feature: "Free conversions/day", competitor: "25 per day", trndinn: "✅ Unlimited" },
      { feature: "Queue delays", competitor: "Yes, peak hours", trndinn: "✅ None — local processing" },
      { feature: "Audio recorder", competitor: "Not included", trndinn: "✅ Free browser recorder" },
      { feature: "Text to speech", competitor: "Not included", trndinn: "✅ Free Web Speech API" },
      { feature: "Signup required", competitor: "No (account unlocks limits)", trndinn: "✅ Never" },
    ],
    faqs: [
      {
        question: "Is there a free FreeConvert alternative for audio?",
        answer:
          "Yes. Trndinn converts audio in your browser — no upload, no daily limit, no queue. It also includes an audio recorder, TTS, and STT tool.",
      },
      {
        question: "How does FreeConvert compare to Trndinn for audio?",
        answer:
          "FreeConvert is cloud-based with a 25-conversion daily cap. Trndinn is browser-native — unlimited conversions, local processing, no queue, and a complete audio toolkit.",
      },
      {
        question: "Does FreeConvert upload my audio files?",
        answer:
          "Yes. FreeConvert processes files on remote servers. Trndinn converts in your browser — files never leave your device.",
      },
    ],
    switchAngle:
      "Switch from FreeConvert for local processing, no daily limits, and a complete browser audio toolkit.",
  },

  // ─────────────────────────── Speechnotes ───────────────────────────
  {
    slug: "speechnotes",
    name: "Speechnotes",
    url: "https://speechnotes.co",
    targetKeyword: "speechnotes speech to text",
    monthlyVolume: 200000,
    keywordDifficulty: 48,
    tagline:
      "Dedicated web-based dictation tool — but limited to speech-to-text only, with premium features gated behind a subscription.",
    overview:
      "Speechnotes is a dedicated online dictation tool built around Google's speech recognition. It offers a clean writing-focused interface and cloud save via Google Drive. Advanced features like punctuation commands and custom dictionaries are premium.",
    positioning: [
      "Speechnotes is purpose-built for dictation and note-taking. It has a distraction-free editor, auto-punctuation, and Google Drive integration. The speech recognition quality is strong for English dictation.",
      "Speechnotes focuses exclusively on speech-to-text. It does not include audio conversion, audio recording, or text-to-speech. Premium features like custom vocabulary and dedicated support require a paid plan.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Basic dictation, ads, limited features" },
      { name: "Premium", price: "$6.99/mo", note: "No ads, custom dictionary, offline, priority support" },
    ],
    pricingNotes: [
      "Free tier includes ads",
      "Custom vocabulary and offline mode are premium-only",
      "Speech-to-text only — no audio conversion or TTS",
    ],
    weaknesses: [
      "Speech-to-text only — no audio conversion, recorder, or TTS",
      "Ads on the free tier",
      "Custom dictionary requires paid plan",
      "Offline mode requires paid plan",
      "Chrome and Edge only for best results",
    ],
    wedgeSummary:
      "Trndinn's speech-to-text tool is completely free with no ads, and pairs with an audio converter, recorder, and text-to-speech tool in one browser-native suite.",
    wedgePoints: [
      {
        title: "Zero ads — no upsell during transcription",
        description:
          "Speechnotes shows ads on the free tier. Trndinn has no ads, no interruptions, and no premium tier for the speech-to-text tool — it's completely free.",
      },
      {
        title: "Complete audio toolkit — not just STT",
        description:
          "Speechnotes only does speech-to-text. Trndinn includes speech-to-text, text-to-speech, audio recording, and audio conversion — all free, all in the browser.",
      },
      {
        title: "8 languages — no subscription required",
        description:
          "Trndinn's STT tool supports English, Spanish, French, German, Portuguese, Italian, Japanese, and Chinese — all free. Speechnotes' language support beyond English is part of the premium tier.",
      },
      {
        title: "Copy + download as .txt — no account needed",
        description:
          "Speechnotes saves to Google Drive, requiring a Google account. Trndinn lets you copy or download the transcript as .txt with no account, no login, no cloud dependency.",
      },
    ],
    comparisonRows: [
      { feature: "Ads on free tier", competitor: "Yes", trndinn: "✅ No ads" },
      { feature: "Audio converter", competitor: "Not included", trndinn: "✅ Free FFmpeg WASM converter" },
      { feature: "Text to speech", competitor: "Not included", trndinn: "✅ Free Web Speech API" },
      { feature: "Audio recorder", competitor: "Not included", trndinn: "✅ Free browser recorder" },
      { feature: "Custom vocabulary", competitor: "Premium only", trndinn: "N/A (browser API)" },
      { feature: "Account required", competitor: "Google Drive save needs account", trndinn: "✅ Never" },
    ],
    faqs: [
      {
        question: "Is there a free Speechnotes alternative?",
        answer:
          "Yes. Trndinn's speech-to-text tool is completely free with no ads, no account, and support for 8 languages. It also includes audio conversion, recording, and TTS.",
      },
      {
        question: "How does Speechnotes compare to Trndinn?",
        answer:
          "Speechnotes is a dedicated dictation app with ads on the free tier. Trndinn is a broader audio toolkit — free STT, TTS, recorder, and converter — all browser-native with no ads.",
      },
      {
        question: "Does Speechnotes require a Google account?",
        answer:
          "Cloud saving to Google Drive requires a Google account. Trndinn's STT tool stores nothing — you copy or download the transcript locally.",
      },
    ],
    switchAngle:
      "Switch from Speechnotes for a no-ads STT tool plus audio recording, TTS, and conversion in one free suite.",
  },

  // ─────────────────────────── NaturalReader ───────────────────────────
  {
    slug: "naturalreader",
    name: "NaturalReader",
    url: "https://naturalreaders.com",
    targetKeyword: "naturalreader text to speech",
    monthlyVolume: 450000,
    keywordDifficulty: 55,
    tagline:
      "Established TTS platform with AI voices — but natural AI voices and audio download are premium features gated behind a paid plan.",
    overview:
      "NaturalReader is a feature-rich TTS platform that converts text to speech using both standard and AI-generated voices. It supports PDFs, Word documents, and web pages. AI voices and commercial use require paid plans.",
    positioning: [
      "NaturalReader is one of the most well-known TTS tools, offering a broad range of voices including AI-generated natural voices. It supports text input, PDF upload, and direct web page reading.",
      "The limitation: natural AI voices and audio file export are locked behind paid plans. The free tier uses standard computer voices and does not allow downloading the generated audio as a file.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Standard voices only, no audio download, limited characters" },
      { name: "Plus", price: "$9.99/mo", note: "AI voices, audio download, PDF support" },
      { name: "Premium", price: "$19.99/mo", note: "Commercial use, more AI voices, priority" },
    ],
    pricingNotes: [
      "AI voices require paid plan",
      "Audio file download requires paid plan",
      "Free tier uses standard computer voices only",
    ],
    weaknesses: [
      "AI voices and audio download are paid features",
      "Free tier limited to basic computer voices",
      "No audio conversion, recording, or STT tools",
      "Commercial use requires premium plan",
      "Character limits on the free tier",
    ],
    wedgeSummary:
      "Trndinn's TTS tool is completely free using your browser's built-in voices — no paywall, no character limits, and it pairs with a free audio converter, recorder, and STT tool.",
    wedgePoints: [
      {
        title: "Completely free — no voice paywall",
        description:
          "NaturalReader gates AI voices behind paid plans. Trndinn uses your browser's built-in system voices — completely free, with no paywall, no trial credits, and no subscription.",
      },
      {
        title: "No character limits — read any length",
        description:
          "NaturalReader limits characters on the free tier. Trndinn allows up to 5,000 characters per session with no paid tier for the TTS tool.",
      },
      {
        title: "Complete audio toolkit alongside TTS",
        description:
          "NaturalReader does TTS only. Trndinn includes TTS, speech-to-text, audio recording, and audio conversion — all free, all browser-native.",
      },
      {
        title: "No account needed — use instantly",
        description:
          "NaturalReader requires account creation for cloud features. Trndinn works without any account — open the tool and start converting text to speech immediately.",
      },
    ],
    comparisonRows: [
      { feature: "AI voices", competitor: "Paid plans only", trndinn: "Browser system voices (free)" },
      { feature: "Audio file download", competitor: "Paid plans only", trndinn: "In-browser playback (free)" },
      { feature: "Character limit (free)", competitor: "Limited on free tier", trndinn: "✅ 5,000 chars free" },
      { feature: "Audio converter", competitor: "Not included", trndinn: "✅ Free FFmpeg WASM converter" },
      { feature: "Speech to text", competitor: "Not included", trndinn: "✅ Free browser STT" },
      { feature: "Account required", competitor: "For cloud features", trndinn: "✅ Never" },
    ],
    faqs: [
      {
        question: "Is there a free NaturalReader alternative?",
        answer:
          "Yes. Trndinn's TTS tool is completely free using browser system voices — no paywall, no character limits. It also includes STT, audio recording, and audio conversion.",
      },
      {
        question: "How does NaturalReader compare to Trndinn for TTS?",
        answer:
          "NaturalReader has superior AI voices but gates them behind a paid plan. Trndinn uses free browser voices — good quality, no cost, and no account required.",
      },
      {
        question: "Can I download TTS audio for free?",
        answer:
          "NaturalReader requires a paid plan to download audio. Trndinn's TTS plays audio through the browser. To capture it as a file, use your system's audio recording software while playing.",
      },
    ],
    switchAngle:
      "Switch from NaturalReader for a fully free TTS tool plus audio recording, conversion, and STT in one suite.",
  },

  // ─────────────────────────── Vocaroo ───────────────────────────
  {
    slug: "vocaroo",
    name: "Vocaroo",
    url: "https://vocaroo.com",
    targetKeyword: "vocaroo voice recorder",
    monthlyVolume: 1500000,
    keywordDifficulty: 52,
    tagline:
      "Simple, popular online voice recorder — but uploads recordings to Vocaroo's servers and auto-deletes them after a few weeks.",
    overview:
      "Vocaroo is one of the most popular online voice recorders, known for its simplicity. It records audio via the browser microphone and provides a shareable URL. Recordings are stored on Vocaroo's servers and deleted after approximately three months.",
    positioning: [
      "Vocaroo built its reputation on simplicity — one button, instant recording, shareable link. It is widely used for quick voice messages, podcasting demos, and classroom tools.",
      "The trade-off: all recordings are uploaded to Vocaroo's servers. There is no local storage option. Recordings are auto-deleted after approximately three months, and the tool offers no advanced features like audio conversion or speech-to-text.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Cloud storage, auto-deleted after ~3 months" },
    ],
    pricingNotes: [
      "Recordings uploaded to and stored on Vocaroo's servers",
      "Auto-deletion after approximately 3 months",
      "No format conversion, TTS, or STT tools",
    ],
    weaknesses: [
      "Recordings uploaded to Vocaroo's servers — not private",
      "Auto-deletion after ~3 months",
      "No download in formats other than MP3/OGG",
      "No audio conversion, TTS, or STT tools",
      "No timer or duration indicator during recording",
    ],
    wedgeSummary:
      "Trndinn records audio entirely in your browser using the MediaRecorder API — nothing is uploaded, nothing is auto-deleted, and it pairs with a full audio toolkit.",
    wedgePoints: [
      {
        title: "Local recording — never uploaded to a server",
        description:
          "Vocaroo uploads every recording to their servers. Trndinn's recorder uses the MediaRecorder API entirely in your browser — your recording is created and stored locally, never transmitted.",
      },
      {
        title: "Recordings never auto-deleted",
        description:
          "Vocaroo auto-deletes recordings after approximately three months. Trndinn recordings download to your device — they're yours to keep forever.",
      },
      {
        title: "Complete audio toolkit — not just a recorder",
        description:
          "Vocaroo is a recorder only. Trndinn includes audio recording, audio format conversion (MP3, WAV, FLAC), text-to-speech, and speech-to-text — all free and browser-native.",
      },
      {
        title: "Live timer and duration display",
        description:
          "Vocaroo provides minimal UI feedback during recording. Trndinn shows a live timer, duration, and recording state indicator so you always know how long you've been recording.",
      },
    ],
    comparisonRows: [
      { feature: "File privacy", competitor: "Uploaded to Vocaroo servers", trndinn: "✅ Never leaves your browser" },
      { feature: "Auto-deletion", competitor: "~3 months", trndinn: "✅ Never — saved locally" },
      { feature: "Audio converter", competitor: "Not included", trndinn: "✅ Free FFmpeg WASM converter" },
      { feature: "Text to speech", competitor: "Not included", trndinn: "✅ Free Web Speech API" },
      { feature: "Speech to text", competitor: "Not included", trndinn: "✅ Free SpeechRecognition API" },
      { feature: "Live recording timer", competitor: "Not shown", trndinn: "✅ Live duration display" },
    ],
    faqs: [
      {
        question: "Is there a free Vocaroo alternative?",
        answer:
          "Yes. Trndinn's Audio Recorder works entirely in your browser — nothing is uploaded, nothing is auto-deleted, and it comes with audio conversion, TTS, and STT tools.",
      },
      {
        question: "Are Vocaroo recordings private?",
        answer:
          "No. Vocaroo uploads recordings to their servers and provides a public URL. Trndinn records locally — your audio never leaves your browser.",
      },
      {
        question: "How long does Vocaroo keep recordings?",
        answer:
          "Vocaroo auto-deletes recordings after approximately three months. Trndinn recordings download to your device and are never stored remotely.",
      },
    ],
    switchAngle:
      "Switch from Vocaroo for private local recording, no auto-deletion, and a complete browser audio toolkit.",
  },
];

/** All audio competitor slugs. */
export const AUDIO_COMPETITOR_SLUGS: string[] = AUDIO_COMPETITORS.map((c) => c.slug);

/** Lookup an audio competitor by slug. */
export function getAudioCompetitor(slug: string): AudioCompetitor | undefined {
  return AUDIO_COMPETITORS.find((c) => c.slug === slug);
}

/**
 * Returns up to 4 related competitors (all except the current one).
 * Used for the "related comparisons" section on compare/alternative pages.
 */
export function getRelatedAudioCompetitors(currentSlug: string): AudioCompetitor[] {
  return AUDIO_COMPETITORS.filter((c) => c.slug !== currentSlug).slice(0, 4);
}
