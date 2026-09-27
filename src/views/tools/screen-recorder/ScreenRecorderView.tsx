"use client";

/**
 * ScreenRecorderView — records the screen using getDisplayMedia API.
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
  Monitor,
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

export default function ScreenRecorderView({ tool, alias }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isSupported] = useState(
    () =>
      typeof window !== "undefined" &&
      "MediaRecorder" in window &&
      typeof navigator.mediaDevices?.getDisplayMedia === "function"
  );

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const eyebrow = alias?.eyebrow ?? "Free Screen Recorder — no app, no extension needed";
  const heroSubline =
    alias?.heroSubline ??
    "Capture your screen in the browser using Chrome or Edge's built-in screen picker. No extension, no app, no signup. Download as WEBM.";
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
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" } as MediaTrackConstraints,
        audio: true,
      });
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setPermissionError(
            "Screen capture was cancelled or denied. Click 'Start Recording' and select a screen, window, or tab in the browser picker."
          );
        } else if (err.name === "NotSupportedError") {
          setPermissionError(
            "Screen capture is not supported in this browser. Use Chrome 72+ or Edge 79+."
          );
        } else {
          setPermissionError(`Screen capture failed: ${err.message}`);
        }
      } else {
        setPermissionError("Could not start screen recording. Try using Chrome or Edge.");
      }
      return;
    }

    streamRef.current = stream;

    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoUrl(URL.createObjectURL(blob));
    };

    // If user stops sharing via the browser's native controls, stop our recorder too
    stream.getVideoTracks()[0].onended = () => {
      stopRecordingInternal(recorder);
    };

    recorder.start();
    setIsRecording(true);
    setDuration(0);

    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
  }, [videoUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecordingInternal = useCallback(
    (recorder: MediaRecorder) => {
      if (recorder.state !== "inactive") recorder.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setIsRecording(false);
    },
    []
  );

  const stopRecording = useCallback(() => {
    if (recorderRef.current) {
      stopRecordingInternal(recorderRef.current);
    }
  }, [stopRecordingInternal]);

  const handleDownload = useCallback(() => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `screen-recording-${Date.now()}.webm`;
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
    <VideoToolsShell activeSlug="screen-recorder">
    <div className="flex-1 space-y-4 sm:space-y-6">
      {/* ─── Hero ─── */}
      <div className="space-y-2">
        {eyebrow && (
          <Badge
            variant="secondary"
            className="rounded-full text-xs font-semibold uppercase tracking-wider"
          >
            <Monitor className="mr-1 h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
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
            Screen recording requires Chrome 72+ or Edge 79+. Safari does not support
            getDisplayMedia(). Firefox has partial support from version 66.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Info note ─── */}
      {isSupported && !isRecording && !videoUrl && (
        <Alert>
          <Info className="h-4 w-4" aria-hidden />
          <AlertDescription>
            When you click "Start Recording", your browser will show a native screen picker. Select
            a tab, window, or monitor. No extension or app required.{" "}
            <strong>Note:</strong> Safari does not support screen recording. Use Chrome or Edge.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Permission Error ─── */}
      {permissionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden />
          <AlertDescription>{permissionError}</AlertDescription>
        </Alert>
      )}

      {/* ─── Main Card ─── */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-heading">Screen Recorder</h2>
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
        <CardContent className="space-y-6">
          {/* Controls */}
          {!videoUrl && (
            <div className="flex flex-col items-center gap-6 py-6">
              {/* Big record button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isSupported}
                aria-label={isRecording ? "Stop screen recording" : "Start screen recording"}
                aria-pressed={isRecording}
                className={cn(
                  "flex h-24 w-24 items-center justify-center rounded-full border-4 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                  isRecording
                    ? "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]"
                    : "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.2)]",
                  !isSupported && "cursor-not-allowed opacity-40"
                )}
              >
                {isRecording ? (
                  <Square className="h-8 w-8" aria-hidden />
                ) : (
                  <Monitor className="h-8 w-8" aria-hidden />
                )}
              </button>

              {/* Timer */}
              {isRecording && (
                <div
                  className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2"
                  aria-live="polite"
                  aria-label={`Recording duration: ${formatDuration(duration)}`}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(var(--destructive))] animate-pulse"
                    aria-hidden
                  />
                  <span className="font-display text-lg font-bold tabular-nums text-[hsl(var(--foreground))]">
                    {formatDuration(duration)}
                  </span>
                </div>
              )}

              {/* State label */}
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center max-w-xs">
                {isRecording
                  ? "Recording in progress. Click the button or your browser's stop button to finish."
                  : "Click to open the screen picker and choose what to capture."}
              </p>

              {/* Explicit stop button */}
              {isRecording && (
                <Button
                  variant="destructive"
                  onClick={stopRecording}
                  className="rounded-full"
                  aria-label="Stop screen recording"
                >
                  <Square className="mr-1.5 h-4 w-4" aria-hidden />
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
                aria-label="Screen recording playback"
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
          getDisplayMedia API
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
