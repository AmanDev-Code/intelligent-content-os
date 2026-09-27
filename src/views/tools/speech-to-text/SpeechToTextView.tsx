"use client";

/**
 * SpeechToTextView — transcribes speech to text using the Web Speech API.
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

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Copy,
  Download,
  Trash2,
  Shield,
  Clock,
  Zap,
  AlertCircle,
  Info,
  CheckCircle2,
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
import { AudioToolsShell } from "@/views/tools/audio-tools/AudioToolsShell";
import { cn } from "@/lib/utils";
import type { AudioTool } from "@/lib/audio-data";
import type { AudioAlias } from "@/lib/audio-aliases";

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

interface Props {
  tool: AudioTool;
  alias?: AudioAlias;
}

const SUPPORTED_LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "pt-BR", label: "Portuguese" },
  { code: "it-IT", label: "Italian" },
  { code: "ja-JP", label: "Japanese" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SpeechToTextView({ tool, alias }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const isSupported =
    typeof window !== "undefined" &&
    (("SpeechRecognition" in window) || ("webkitSpeechRecognition" in window));

  const eyebrow = alias?.eyebrow ?? "Free Speech to Text — live transcript, 8 languages";
  const heroSubline =
    alias?.heroSubline ??
    "Speak into your microphone and watch the transcript appear in real time. Copy or download as .txt. Chrome and Edge only.";
  const h1Prefix = alias?.h1Prefix ?? "";
  const h1Highlight = alias?.h1Highlight ?? tool.h1;
  const h1Suffix = alias?.h1Suffix ?? "";

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* already stopped */ }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    setError(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      let interim = "";
      let final = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript((prev) => prev + (prev ? " " : "") + final.trim());
      }
      setInterimTranscript(interim);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (e: any) => {
      setIsListening(false);
      setInterimTranscript("");

      if (e.error === "not-allowed") {
        setError(
          "Microphone access was denied. Please allow microphone access in your browser settings."
        );
      } else if (e.error === "no-speech") {
        setError("No speech detected. Make sure your microphone is working and try again.");
      } else if (e.error === "network") {
        setError(
          "Speech recognition requires an internet connection. Chrome sends audio to Google's servers for processing."
        );
      } else {
        setError(`Speech recognition error: ${e.error}. Try refreshing the page.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      setError("Could not start speech recognition. Try refreshing the page.");
      setIsListening(false);
    }
  }, [isSupported, selectedLanguage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const handleCopy = useCallback(async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — silently fail
    }
  }, [transcript]);

  const handleDownload = useCallback(() => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript]);

  const handleClear = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  const fullTranscript = transcript + (interimTranscript ? (transcript ? " " : "") + interimTranscript : "");

  return (
    <AudioToolsShell activeSlug="speech-to-text">
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
            Speech recognition is not supported in this browser. Use Chrome or Edge. Firefox does
            not support the SpeechRecognition API.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Chrome/Edge note ─── */}
      {isSupported && (
        <Alert>
          <Info className="h-4 w-4" aria-hidden />
          <AlertDescription>
            Works in Chrome and Edge. Firefox is not supported. Chrome uses Google&apos;s speech
            recognition backend — audio is sent to Google&apos;s servers for processing, not
            Trndinn&apos;s.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Error ─── */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ─── Main Card ─── */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <h2 className="text-lg font-semibold font-heading">Speech to Text</h2>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Language selector */}
          <div className="space-y-1.5">
            <label
              htmlFor="stt-language"
              className="text-sm font-medium text-[hsl(var(--foreground))]"
            >
              Language
            </label>
            <select
              id="stt-language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isListening}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start / Stop listening */}
          <div className="flex flex-col items-center gap-4 py-2">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!isSupported}
              aria-label={isListening ? "Stop listening" : "Start listening"}
              aria-pressed={isListening}
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                isListening
                  ? "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] animate-pulse"
                  : "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.2)]",
                !isSupported && "cursor-not-allowed opacity-40"
              )}
            >
              {isListening ? (
                <MicOff className="h-7 w-7" aria-hidden />
              ) : (
                <Mic className="h-7 w-7" aria-hidden />
              )}
            </button>

            <p
              className="text-sm text-[hsl(var(--muted-foreground))]"
              aria-live="polite"
            >
              {isListening ? (
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full bg-[hsl(var(--destructive))] animate-pulse"
                    aria-hidden
                  />
                  Listening… speak now
                </span>
              ) : (
                "Click the mic to start listening"
              )}
            </p>
          </div>

          {/* Live transcript */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="stt-transcript"
                className="text-sm font-medium text-[hsl(var(--foreground))]"
              >
                Transcript
              </label>
              {fullTranscript && (
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {fullTranscript.split(/\s+/).filter(Boolean).length} words
                </span>
              )}
            </div>
            <div
              id="stt-transcript"
              className="min-h-[140px] w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-3 text-sm leading-relaxed"
              aria-live="polite"
              aria-label="Speech transcript"
            >
              {transcript && (
                <span className="text-[hsl(var(--foreground))]">{transcript}</span>
              )}
              {interimTranscript && (
                <span className="text-[hsl(var(--muted-foreground))]">
                  {transcript ? " " : ""}
                  {interimTranscript}
                </span>
              )}
              {!transcript && !interimTranscript && (
                <span className="text-[hsl(var(--muted-foreground))]">
                  Your transcript will appear here as you speak…
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {(transcript || interimTranscript) && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="rounded-full gap-1.5"
                disabled={!transcript}
                aria-label="Copy transcript to clipboard"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--primary))]" aria-hidden />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="rounded-full gap-1.5"
                disabled={!transcript}
                aria-label="Download transcript as text file"
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                Download .txt
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="rounded-full gap-1.5 text-[hsl(var(--muted-foreground))]"
                aria-label="Clear transcript"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Feature Pills ─── */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="rounded-full gap-1.5">
          <Shield className="h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
          Transcript stays local
        </Badge>
        <Badge variant="outline" className="rounded-full gap-1.5">
          <Zap className="h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
          SpeechRecognition API
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
    </AudioToolsShell>
  );
}
