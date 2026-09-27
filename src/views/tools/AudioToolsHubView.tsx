"use client";

/**
 * AudioToolsHubView — audio tools category hub.
 * Dark-themed layout matching the converter pages.
 */

import Link from "next/link";
import {
  ArrowRight,
  Music,
  Mic,
  MessageSquare,
  AudioLines,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";

// ---------------------------------------------------------------------------
// Tool registry — 4 audio tools
// ---------------------------------------------------------------------------

interface AudioTool {
  slug: string;
  name: string;
  description: string;
  icon: typeof Music;
}

const AUDIO_TOOLS: AudioTool[] = [
  {
    slug: "audio-converter",
    name: "Audio Converter",
    description: "Convert between MP3, WAV, AAC, OGG, FLAC, M4A, OPUS, AMR, AIFF and more.",
    icon: AudioLines,
  },
  {
    slug: "audio-recorder",
    name: "Audio Recorder",
    description: "Record audio directly from your microphone in the browser.",
    icon: Mic,
  },
  {
    slug: "text-to-speech",
    name: "Text to Speech",
    description: "Convert written text to natural-sounding AI voice audio.",
    icon: MessageSquare,
  },
  {
    slug: "speech-to-text",
    name: "Speech to Text",
    description: "Transcribe spoken audio to editable text with AI.",
    icon: Music,
  },
];

// ---------------------------------------------------------------------------
// Color constant
// ---------------------------------------------------------------------------

const COLOR_HSL = "217 91% 60%";

// ---------------------------------------------------------------------------
// Tool Card
// ---------------------------------------------------------------------------

function ToolCard({ tool }: { tool: AudioTool }) {
  const Icon = tool.icon;

  return (
    <li>
      <Link
        href={`/tools/${tool.slug}`}
        aria-label={tool.name}
        className="group flex h-full flex-col rounded-lg p-6 transition-all duration-200"
        style={{
          background: "hsl(223 62% 9%)",
          border: "1px solid hsl(224 28% 18%)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = `hsl(${COLOR_HSL})`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "hsl(224 28% 18%)";
        }}
      >
        <div
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `hsl(${COLOR_HSL} / 0.12)` }}
        >
          <Icon
            className="h-5 w-5"
            style={{ color: `hsl(${COLOR_HSL})` }}
            aria-hidden="true"
          />
        </div>
        <h3
          className="text-base font-semibold transition-colors duration-200"
          style={{ color: "hsl(210 40% 98%)" }}
        >
          {tool.name}
        </h3>
        <p
          className="mt-2 flex-1 text-sm leading-relaxed"
          style={{ color: "hsl(215 20.2% 65.1%)" }}
        >
          {tool.description}
        </p>
        <span
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold transition-colors duration-200"
          style={{ color: `hsl(${COLOR_HSL})` }}
        >
          Try it
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}

// ---------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------

export function AudioToolsHubView() {
  return (
    <MarketingShell>
      <div
        className="min-h-screen"
        style={{ background: "hsl(223 62% 7%)", color: "hsl(210 40% 98%)" }}
      >
        {/* Hero */}
        <section className="px-4 pt-16 pb-10 text-center sm:pt-24 sm:pb-14">
          <div className="mx-auto max-w-3xl space-y-4">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: `hsl(${COLOR_HSL})` }}
            >
              Free · No signup · In-browser
            </p>
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight">
              4{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, hsl(${COLOR_HSL}), hsl(240 91% 70%))`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Free
              </span>{" "}
              Audio Tools
            </h1>
            <p
              className="mx-auto max-w-xl text-base leading-relaxed sm:text-lg"
              style={{ color: "hsl(215 20.2% 65.1%)" }}
            >
              Convert audio formats, record from your microphone, text-to-speech
              and transcription — all in the browser using FFmpeg WebAssembly.
              Your files never leave your device.
            </p>
          </div>
        </section>

        {/* Tool grid */}
        <section
          className="px-4 pb-16 sm:pb-24"
          aria-labelledby="audio-tools-heading"
        >
          <div className="mx-auto max-w-4xl">
            <h2 id="audio-tools-heading" className="sr-only">
              All audio tools
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {AUDIO_TOOLS.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </ul>
          </div>
        </section>

        {/* Bottom spacer */}
        <div className="h-12 sm:h-20" aria-hidden="true" />
      </div>
    </MarketingShell>
  );
}
