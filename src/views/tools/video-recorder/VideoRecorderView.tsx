"use client";

/**
 * VideoRecorderView — records video from webcam using MediaRecorder API.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge,
 *   Alert, AlertDescription, Separator, Accordion, AccordionItem,
 *   AccordionTrigger, AccordionContent.
 * Design tokens: --background, --foreground, --card, --muted,
 *   --muted-foreground, --primary, --primary-foreground, --border,
 *   --destructive, --ring.
 * Icons: Lucide only.
 * Motion: CSS only (no framer-motion — app UI).
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Video,
  VideoOff,
  Square,
  Download,
  RotateCcw,
  Shield,
  Clock,
  Zap,
  AlertCircle,
  Info,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { VideoToolsShell } from "@/views/tools/video-tools/VideoToolsShell";
import { cn } from "@/lib/utils";
import type { VideoTool } from "@/lib/video-data";
import type { VideoAlias } from "@/lib/video-aliases";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  tool: VideoTool;
  alias?: VideoAlias;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VideoRecorderView({ tool, alias }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isSupported] = useState(
    () => typeof window !== "undefined" && "MediaRecorder" in window
  );

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);

  const eyebrow = alias?.eyebrow ?? "Free Online Video Recorder — no app, no signup";
  const heroSubline =
    alias?.heroSubline ??
    "Record from your webcam directly in the browser. See a live preview while recording. No app install, no account needed.";
  const h1Prefix = alias?.h1Prefix ?? "";
  const h1Highlight = alias?.h1Highlight ?? tool.h1;
  const h1Suffix = alias?.h1Suffix ?? "";

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(async () => {
    setPermissionError(null);
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      const msg =
        err instanceof Error && err.name === "NotAllowedError"
          ? "Camera access was denied. Please allow camera and microphone access in your browser settings and try again."
          : "Could not access camera. Make sure a camera is connected and permission is granted.";
      setPermissionError(msg);
      return;
    }

    streamRef.current = stream;

    // Show live webcam preview
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = stream;
      liveVideoRef.current.play().catch(() => {
        // Autoplay may be blocked on some browsers
      });
    }

    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach((t) => t.stop());
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = null;
      }
    };

    recorder.start();
    setIsRecording(true);
    setDuration(0);

    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
  }, [videoUrl]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
  }, [videoUrl]);

  const handleReset = useCallback(() => {
    stopRecording();
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setDuration(0);
    setPermissionError(null);
    chunksRef.current = [];
  }, [videoUrl, stopRecording]);

  return (
    <VideoToolsShell activeSlug="video-recorder">
    <div className="flex-1 space-y-4 sm:space-y-6">
      {/* ─── Hero ─── */}
      <div className="space-y-2">
        {eyebrow && (
          <Badge
            variant="secondary"
            className="rounded-full text-xs font-semibold uppercase tracking-wider"
          >
            <Video className="mr-1 h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
            {eyebrow}
          </Badge>
        )}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl font-heading">
          {alias ? (
            <>
              {h1Prefix && <span>{h1Prefix} </span>}
              <span className="gradient-text">{h1Highlight}</span>
              {h1Suffix && <span> {h1Suffix}</span>}
            </>
          ) : (
            <span className="gradient-text">{h1Highlight}</span>
          )}
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] max-w-2xl">{heroSubline}</p>
      </div>

      {/* ─── Browser Support Warning ─── */}
      {!isSupported && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden />
          <AlertDescription>
            Your browser does not support the MediaRecorder API. Use Chrome, Firefox, or Edge to
            record video.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Permission Error ─── */}
      {permissionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden />
          <AlertDescription>
            <p className="font-medium">Camera permission required</p>
            <p className="mt-1">{permissionError}</p>
            <ul className="mt-2 list-disc pl-4 text-sm space-y-0.5">
              <li>Chrome: Click the camera icon in the address bar and allow access</li>
              <li>Firefox: Click the camera icon in the address bar and allow access</li>
              <li>Edge: Click the lock icon in the address bar and allow camera and microphone</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Permission info (before first use) ─── */}
      {!isRecording && !videoUrl && !permissionError && isSupported && (
        <Alert>
          <Info className="h-4 w-4" aria-hidden />
          <AlertDescription>
            Your browser will ask for camera and microphone permission when you start recording.
            The recording stays in your browser — nothing is uploaded.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Main Card ─── */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-heading">Record Webcam</h2>
            {videoUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isRecording}
                aria-label="Reset and record again"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Record again
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Live webcam preview (shown while recording) */}
          <div
            className={cn(
              "relative overflow-hidden rounded-lg bg-[hsl(var(--muted))]",
              !isRecording && !videoUrl ? "h-0" : "aspect-video"
            )}
            aria-label="Webcam preview"
          >
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={liveVideoRef}
              muted
              playsInline
              className={cn(
                "w-full h-full object-cover",
                (!isRecording || videoUrl) && "hidden"
              )}
              aria-label="Live webcam preview"
            />

            {/* Recording indicator overlay */}
            {isRecording && (
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[hsl(var(--background)/0.8)] px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                <span
                  className="inline-block h-2 w-2 rounded-full bg-[hsl(var(--destructive))] animate-pulse"
                  aria-hidden
                />
                <span className="text-[hsl(var(--foreground))]">{formatDuration(duration)}</span>
              </div>
            )}
          </div>

          {/* Record controls */}
          {!videoUrl && (
            <div className="flex flex-col items-center gap-4 py-2">
              {/* Big record button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isSupported}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
                aria-pressed={isRecording}
                className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                  isRecording
                    ? "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]"
                    : "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.2)]",
                  !isSupported && "cursor-not-allowed opacity-40"
                )}
              >
                {isRecording ? (
                  <Square className="h-7 w-7" aria-hidden />
                ) : (
                  <Video className="h-7 w-7" aria-hidden />
                )}
              </button>

              {/* Timer (when not recording) */}
              {!isRecording && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Click to start recording your webcam
                </p>
              )}

              {/* Explicit stop button */}
              {isRecording && (
                <Button
                  variant="destructive"
                  onClick={stopRecording}
                  className="rounded-full"
                  aria-label="Stop recording"
                >
                  <VideoOff className="mr-1.5 h-4 w-4" aria-hidden />
                  Stop Recording
                </Button>
              )}
            </div>
          )}

          {/* Playback + download */}
          {videoUrl && (
            <div className="space-y-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-4">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                Recording complete — {formatDuration(duration)}
              </p>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                controls
                src={videoUrl}
                className="w-full rounded-lg"
                aria-label="Recorded video playback"
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleDownload} className="rounded-full">
                  <Download className="mr-1.5 h-4 w-4" aria-hidden />
                  Download WEBM
                </Button>
                <Button variant="outline" onClick={handleReset} className="rounded-full">
                  <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden />
                  Record again
                </Button>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Downloads as WEBM. Use the{" "}
                <a
                  href="/tools/video-converter"
                  className="text-[hsl(var(--primary))] hover:underline"
                >
                  Video Converter
                </a>{" "}
                to convert to MP4 or MOV.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Feature Pills ─── */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="rounded-full gap-1.5">
          <Shield className="h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
          Recording never uploaded
        </Badge>
        <Badge variant="outline" className="rounded-full gap-1.5">
          <Zap className="h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
          MediaRecorder API
        </Badge>
        <Badge variant="outline" className="rounded-full gap-1.5">
          <Clock className="h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
          No signup required
        </Badge>
      </div>

      <Separator />

      {/* ─── FAQ ─── */}
      {tool.faqs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold font-heading tracking-tight">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {tool.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
    </VideoToolsShell>
  );
}
