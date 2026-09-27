"use client";

/**
 * AudioToolsHubView — audio tools category hub.
 * Thin client shell; content will be filled in Phase 2.
 */

import Link from "next/link";
import { ArrowRight, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AudioTool {
  slug: string;
  name: string;
  description: string;
  live: boolean;
}

const AUDIO_TOOLS: AudioTool[] = [
  // Conversion (10)
  { slug: "audio-converter", name: "Audio Converter", description: "Convert between MP3, WAV, AAC, OGG, FLAC, M4A, OPUS, AMR, AIFF and more.", live: false },
  { slug: "mp3-to-wav", name: "MP3 to WAV", description: "Convert compressed MP3 audio to lossless WAV format.", live: false },
  { slug: "wav-to-mp3", name: "WAV to MP3", description: "Compress large WAV files to MP3 for easy sharing.", live: false },
  { slug: "mp3-to-ogg", name: "MP3 to OGG", description: "Convert MP3 to OGG Vorbis for open-source audio delivery.", live: false },
  { slug: "audio-to-mp3", name: "Audio to MP3", description: "Convert any audio format to widely compatible MP3.", live: false },
  { slug: "m4a-to-mp3", name: "M4A to MP3", description: "Convert Apple M4A/AAC files to universal MP3.", live: false },
  { slug: "flac-to-mp3", name: "FLAC to MP3", description: "Compress lossless FLAC audio to smaller MP3 files.", live: false },
  { slug: "ogg-to-mp3", name: "OGG to MP3", description: "Convert OGG Vorbis audio back to MP3 format.", live: false },
  { slug: "video-to-mp3", name: "Video to MP3", description: "Extract the audio track from any video file as MP3.", live: false },
  { slug: "video-to-audio", name: "Video to Audio", description: "Strip audio from video and save in your preferred format.", live: false },

  // Editing (5)
  { slug: "audio-trimmer", name: "Audio Trimmer", description: "Trim audio files to a precise start and end time.", live: false },
  { slug: "audio-merger", name: "Audio Merger", description: "Combine multiple audio clips into a single file.", live: false },
  { slug: "audio-cutter", name: "Audio Cutter", description: "Cut and extract a section of audio from any file.", live: false },
  { slug: "audio-splitter", name: "Audio Splitter", description: "Split one long audio file into multiple shorter clips.", live: false },
  { slug: "audio-speed-changer", name: "Audio Speed Changer", description: "Speed up or slow down audio without changing pitch.", live: false },

  // Processing (4)
  { slug: "audio-compressor", name: "Audio Compressor", description: "Reduce audio file size while preserving quality.", live: false },
  { slug: "audio-normalizer", name: "Audio Normalizer", description: "Normalise loudness levels across multiple audio files.", live: false },
  { slug: "audio-noise-reducer", name: "Noise Reducer", description: "Remove background noise and hiss from recordings.", live: false },
  { slug: "audio-equalizer", name: "Audio Equaliser", description: "Adjust frequency bands to fine-tune your audio.", live: false },

  // Recording & capture (3)
  { slug: "audio-recorder", name: "Audio Recorder", description: "Record audio directly from your microphone in the browser.", live: false },
  { slug: "text-to-speech", name: "Text to Speech", description: "Convert written text to natural-sounding AI voice audio.", live: false },
  { slug: "speech-to-text", name: "Speech to Text", description: "Transcribe spoken audio to editable text with AI.", live: false },

  // Metadata & misc (2)
  { slug: "audio-metadata", name: "Audio Metadata Editor", description: "Edit ID3 tags: title, artist, album, artwork and more.", live: false },
  { slug: "audio-waveform", name: "Audio Waveform Generator", description: "Generate a visual waveform image from any audio file.", live: false },
];

export function AudioToolsHubView() {
  return (
    <main>
      {/* Hero */}
      <section className="px-4 pt-12 pb-8 text-center sm:pt-20 sm:pb-12">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))]">
            Free · No signup · In-browser
          </p>
          <h1 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-foreground">
            Free Audio Tools
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Convert, trim, merge, record, and process audio — all in the browser using FFmpeg
            WebAssembly. Your files never leave your device.
          </p>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground/80">
            Audio tools use FFmpeg WASM. Your browser requires
            SharedArrayBuffer support (Chrome 92+, Firefox 79+, Edge 92+, Safari 15.2+).
          </p>
        </div>
      </section>

      {/* Tool grid */}
      <section
        className="px-4 pb-16 sm:pb-24"
        aria-labelledby="audio-tools-heading"
      >
        <div className="mx-auto max-w-6xl">
          <h2 id="audio-tools-heading" className="sr-only">
            All audio tools
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIO_TOOLS.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={tool.live ? `/tools/${tool.slug}` : "#"}
                  aria-label={`${tool.name}${!tool.live ? " — coming soon" : ""}`}
                  className={
                    !tool.live ? "pointer-events-none cursor-default" : ""
                  }
                  tabIndex={tool.live ? undefined : -1}
                >
                  <div className="group flex h-full flex-col rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                        <Music className="h-4 w-4" aria-hidden="true" />
                      </div>
                      {!tool.live && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          Soon
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground flex-1">
                      {tool.description}
                    </p>
                    {tool.live && (
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))]">
                        Try it
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
