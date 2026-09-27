"use client";

/**
 * VideoToolsHubView — video tools category hub.
 * Dark-themed layout matching the converter pages.
 */

import Link from "next/link";
import {
  ArrowRight,
  Video,
  Monitor,
  Camera,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";

// ---------------------------------------------------------------------------
// Tool registry — 3 video tools
// ---------------------------------------------------------------------------

interface VideoTool {
  slug: string;
  name: string;
  description: string;
  icon: typeof Video;
}

const VIDEO_TOOLS: VideoTool[] = [
  {
    slug: "video-converter",
    name: "Video Converter",
    description: "Convert between MP4, MOV, WebM, AVI, MKV, FLV and more.",
    icon: Video,
  },
  {
    slug: "video-recorder",
    name: "Video Recorder",
    description: "Record video from your webcam with no software to install.",
    icon: Camera,
  },
  {
    slug: "screen-recorder",
    name: "Screen Recorder",
    description: "Record your screen, window, or browser tab directly in the browser.",
    icon: Monitor,
  },
];

// ---------------------------------------------------------------------------
// Color constant
// ---------------------------------------------------------------------------

const COLOR_HSL = "270 95.2% 75.3%";

// ---------------------------------------------------------------------------
// Tool Card
// ---------------------------------------------------------------------------

function ToolCard({ tool }: { tool: VideoTool }) {
  const Icon = tool.icon;

  return (
    <li>
      <Link
        href={`/tools/${tool.slug}`}
        aria-label={tool.name}
        className="group flex h-full flex-col rounded-lg p-6 transition-all duration-200"
        style={{
          background: "hsl(var(--tool-surface))",
          border: "1px solid hsl(var(--tool-border))",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = `hsl(${COLOR_HSL})`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--tool-border))";
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
          style={{ color: "hsl(var(--foreground))" }}
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

export function VideoToolsHubView() {
  return (
    <MarketingShell>
      <div
        className="min-h-screen"
        style={{ background: "hsl(var(--tool-bg))", color: "hsl(var(--foreground))" }}
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
              3{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, hsl(${COLOR_HSL}), hsl(290 80% 65%))`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Free
              </span>{" "}
              Video Tools
            </h1>
            <p
              className="mx-auto max-w-xl text-base leading-relaxed sm:text-lg"
              style={{ color: "hsl(215 20.2% 65.1%)" }}
            >
              Convert video formats, record from your webcam, capture your
              screen — powered by FFmpeg WebAssembly. All processing happens
              locally in your browser.
            </p>
          </div>
        </section>

        {/* Tool grid */}
        <section
          className="px-4 pb-16 sm:pb-24"
          aria-labelledby="video-tools-heading"
        >
          <div className="mx-auto max-w-4xl">
            <h2 id="video-tools-heading" className="sr-only">
              All video tools
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {VIDEO_TOOLS.map((tool) => (
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
