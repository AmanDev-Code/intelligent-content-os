"use client";

/**
 * VideoToolsHubView — video tools category hub.
 * Thin client shell; content will be filled in Phase 2.
 */

import Link from "next/link";
import { ArrowRight, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VideoTool {
  slug: string;
  name: string;
  description: string;
  live: boolean;
}

const VIDEO_TOOLS: VideoTool[] = [
  // Conversion (8)
  { slug: "video-converter", name: "Video Converter", description: "Convert between MP4, MOV, WebM, AVI, MKV, FLV and more.", live: false },
  { slug: "mp4-to-webm", name: "MP4 to WebM", description: "Convert MP4 video to WebM for open-source web playback.", live: false },
  { slug: "webm-to-mp4", name: "WebM to MP4", description: "Convert WebM video to universally compatible MP4.", live: false },
  { slug: "mov-to-mp4", name: "MOV to MP4", description: "Convert Apple QuickTime MOV files to MP4.", live: false },
  { slug: "avi-to-mp4", name: "AVI to MP4", description: "Modernise old AVI videos by converting to MP4.", live: false },
  { slug: "mkv-to-mp4", name: "MKV to MP4", description: "Convert Matroska MKV containers to MP4.", live: false },
  { slug: "video-to-gif", name: "Video to GIF", description: "Convert a short video clip to an animated GIF.", live: false },
  { slug: "gif-to-video", name: "GIF to Video", description: "Convert animated GIFs to MP4 for social media.", live: false },

  // Editing (6)
  { slug: "video-trimmer", name: "Video Trimmer", description: "Trim video to a precise start and end time.", live: false },
  { slug: "video-compressor", name: "Video Compressor", description: "Reduce video file size while maintaining quality.", live: false },
  { slug: "video-merger", name: "Video Merger", description: "Combine multiple video clips into a single file.", live: false },
  { slug: "video-cropper", name: "Video Cropper", description: "Crop video to a custom frame or aspect ratio.", live: false },
  { slug: "video-speed-changer", name: "Video Speed Changer", description: "Speed up or slow down video playback rate.", live: false },
  { slug: "video-rotator", name: "Video Rotator", description: "Rotate portrait video to landscape or vice versa.", live: false },

  // Audio (3)
  { slug: "video-to-mp3", name: "Video to MP3", description: "Extract the audio track from any video as MP3.", live: false },
  { slug: "remove-audio-from-video", name: "Remove Audio from Video", description: "Strip the soundtrack from a video file entirely.", live: false },
  { slug: "add-audio-to-video", name: "Add Audio to Video", description: "Replace or overlay a new audio track on a video.", live: false },

  // Recording & capture (3)
  { slug: "screen-recorder", name: "Screen Recorder", description: "Record your screen, window, or browser tab directly in the browser.", live: false },
  { slug: "webcam-recorder", name: "Webcam Recorder", description: "Record video from your webcam with no software to install.", live: false },
  { slug: "screen-webcam-recorder", name: "Screen + Webcam Recorder", description: "Record screen with picture-in-picture webcam overlay.", live: false },

  // Subtitles & misc (4)
  { slug: "add-subtitles-to-video", name: "Add Subtitles to Video", description: "Burn SRT or VTT subtitles directly into your video.", live: false },
  { slug: "video-thumbnail-extractor", name: "Thumbnail Extractor", description: "Extract a specific frame from a video as an image.", live: false },
  { slug: "video-metadata", name: "Video Metadata Viewer", description: "Inspect codec, resolution, frame rate, and bitrate.", live: false },
  { slug: "video-to-frames", name: "Video to Frames", description: "Export every frame of a video as individual image files.", live: false },
];

export function VideoToolsHubView() {
  return (
    <main>
      {/* Hero */}
      <section className="px-4 pt-12 pb-8 text-center sm:pt-20 sm:pb-12">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))]">
            Free · No signup · In-browser
          </p>
          <h1 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-foreground">
            Free Video Tools
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Convert, trim, merge, compress, and record video — powered by FFmpeg WebAssembly.
            All processing happens locally in your browser.
          </p>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground/80">
            Video tools require SharedArrayBuffer (Chrome 92+, Firefox 79+, Edge 92+, Safari 15.2+).
          </p>
        </div>
      </section>

      {/* Tool grid */}
      <section
        className="px-4 pb-16 sm:pb-24"
        aria-labelledby="video-tools-heading"
      >
        <div className="mx-auto max-w-6xl">
          <h2 id="video-tools-heading" className="sr-only">
            All video tools
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VIDEO_TOOLS.map((tool) => (
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
                        <Video className="h-4 w-4" aria-hidden="true" />
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
