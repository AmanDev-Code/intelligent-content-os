"use client";

/**
 * AudioRecorderView — records audio from the microphone using MediaRecorder API.
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
  Mic,
  MicOff,
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
import { cn } from "@/lib/utils";
import type { AudioTool } from "@/lib/audio-data";
import type { AudioAlias } from "@/lib/audio-aliases";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  tool: AudioTool;
  alias?: AudioAlias;
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

export default function AudioRecorderView({ tool, alias }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isSupported] = useState(
    () => typeof window !== "undefined" && "MediaRecorder" in window
  );

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const eyebrow = alias?.eyebrow ?? "Free Online Audio Recorder — no app, no signup";
  const heroSubline =
    alias?.heroSubline ??
    "Record from your microphone directly in the browser. Instant playback and download. No app install, no account needed.";

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(async () => {
    setPermissionError(null);
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const msg =
        err instanceof Error && err.name === "NotAllowedError"
          ? "Microphone access was denied. Please allow microphone access in your browser settings and try again."
          : "Could not access microphone. Make sure a microphone is connected and permission is granted.";
      setPermissionError(msg);
      return;
    }

    streamRef.current = stream;

    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach((t) => t.stop());
    };

    recorder.start();
    setIsRecording(true);
    setDuration(0);

    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
  }, [audioUrl]);

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
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
  }, [audioUrl]);

  const handleReset = useCallback(() => {
    stopRecording();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
    setPermissionError(null);
    chunksRef.current = [];
  }, [audioUrl, stopRecording]);

  const h1Prefix = alias?.h1Prefix ?? "";
  const h1Highlight = alias?.h1Highlight ?? tool.h1;
  const h1Suffix = alias?.h1Suffix ?? "";

  return (
    <div className="flex-1 space-y-4 sm:space-y-6">
      {/* ─── Hero ─── */}
      <div className="space-y-2">
        {eyebrow && (
          <Badge
            variant="secondary"
            className="rounded-full text-xs font-semibold uppercase tracking-wider"
          >
            <Mic className="mr-1 h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
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
            Your browser does not support the MediaRecorder API. Use Chrome, Firefox, or Safari to
            record audio.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Permission Error ─── */}
      {permissionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden />
          <AlertDescription>
            <p className="font-medium">Microphone permission required</p>
            <p className="mt-1">{permissionError}</p>
            <ul className="mt-2 list-disc pl-4 text-sm space-y-0.5">
              <li>Chrome: Click the camera icon in the address bar and allow microphone</li>
              <li>Firefox: Click the microphone icon in the address bar and allow access</li>
              <li>Safari: Go to Safari &gt; Settings for This Website &gt; Microphone &gt; Allow</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Mic permission info (before first use) ─── */}
      {!isRecording && !audioUrl && !permissionError && isSupported && (
        <Alert>
          <Info className="h-4 w-4" aria-hidden />
          <AlertDescription>
            Your browser will ask for microphone permission when you start recording. The recording
            stays in your browser — nothing is uploaded.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Main Card ─── */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-heading">Record Audio</h2>
            {audioUrl && (
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
          {/* Record controls */}
          {!audioUrl && (
            <div className="flex flex-col items-center gap-6 py-4">
              {/* Big record button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isSupported}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
                aria-pressed={isRecording}
                className={cn(
                  "flex h-24 w-24 items-center justify-center rounded-full border-4 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                  isRecording
                    ? "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] animate-pulse"
                    : "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.2)]",
                  !isSupported && "cursor-not-allowed opacity-40"
                )}
              >
                {isRecording ? (
                  <Square className="h-8 w-8" aria-hidden />
                ) : (
                  <Mic className="h-8 w-8" aria-hidden />
                )}
              </button>

              {/* Timer */}
              <div
                className="font-display text-4xl font-bold tabular-nums text-[hsl(var(--foreground))]"
                aria-live="polite"
                aria-label={`Recording duration: ${formatDuration(duration)}`}
              >
                {formatDuration(duration)}
              </div>

              {/* State label */}
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {isRecording ? (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-[hsl(var(--destructive))] animate-pulse"
                      aria-hidden
                    />
                    Recording… click the button to stop
                  </span>
                ) : (
                  "Click the button to start recording"
                )}
              </p>

              {/* Explicit stop button for accessibility */}
              {isRecording && (
                <Button
                  variant="destructive"
                  onClick={stopRecording}
                  className="rounded-full"
                  aria-label="Stop recording"
                >
                  <MicOff className="mr-1.5 h-4 w-4" aria-hidden />
                  Stop Recording
                </Button>
              )}
            </div>
          )}

          {/* Playback + download */}
          {audioUrl && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-4 space-y-3">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  Recording complete — {formatDuration(duration)}
                </p>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio
                  controls
                  src={audioUrl}
                  className="w-full"
                  aria-label="Recorded audio playback"
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
                    href="/tools/audio-converter"
                    className="text-[hsl(var(--primary))] hover:underline"
                  >
                    Audio Converter
                  </a>{" "}
                  to convert to MP3 or WAV.
                </p>
              </div>
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
  );
}
