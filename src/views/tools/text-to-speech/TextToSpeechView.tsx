"use client";

/**
 * TextToSpeechView — converts text to speech using the Web Speech API.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge,
 *   Alert, AlertDescription, Separator, Accordion, AccordionItem,
 *   AccordionTrigger, AccordionContent, Slider.
 * Design tokens: --background, --foreground, --card, --muted,
 *   --muted-foreground, --primary, --primary-foreground, --border,
 *   --destructive, --ring.
 * Icons: Lucide only.
 * Motion: CSS only (no framer-motion — app UI).
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  Square,
  Volume2,
  Shield,
  Clock,
  Zap,
  AlertCircle,
  Info,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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
// Types
// ---------------------------------------------------------------------------

interface Props {
  tool: AudioTool;
  alias?: AudioAlias;
}

const MAX_CHARS = 5000;

// Group voices by language tag prefix (e.g. "en", "es")
function groupVoicesByLang(voices: SpeechSynthesisVoice[]): Map<string, SpeechSynthesisVoice[]> {
  const map = new Map<string, SpeechSynthesisVoice[]>();
  for (const v of voices) {
    const lang = v.lang.split("-")[0];
    if (!map.has(lang)) map.set(lang, []);
    map.get(lang)!.push(v);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TextToSpeechView({ tool, alias }: Props) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [text, setText] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window
  );

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const eyebrow = alias?.eyebrow ?? "Free Text to Speech — browser-native voices";
  const heroSubline =
    alias?.heroSubline ??
    "Convert any text to speech using your browser's built-in voices. Adjust speed and pitch. No signup, no download, completely free.";
  const h1Prefix = alias?.h1Prefix ?? "";
  const h1Highlight = alias?.h1Highlight ?? tool.h1;
  const h1Suffix = alias?.h1Suffix ?? "";

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const speak = useCallback(() => {
    if (!isSupported || !text.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices[selectedVoiceIndex] ?? null;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, text, voices, selectedVoiceIndex, rate, pitch]);

  const stopSpeaking = useCallback(() => {
    if (isSupported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const charCount = text.length;
  const groupedVoices = groupVoicesByLang(voices);

  return (
    <AudioToolsShell activeSlug="text-to-speech">
    <div className="flex-1 space-y-4 sm:space-y-6">
      {/* ─── Hero ─── */}
      <div className="space-y-2">
        {eyebrow && (
          <Badge
            variant="secondary"
            className="rounded-full text-xs font-semibold uppercase tracking-wider"
          >
            <Volume2 className="mr-1 h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
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
            Your browser does not support the Web Speech API. Use Chrome, Edge, or Safari for
            text to speech.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Compatibility note ─── */}
      {isSupported && (
        <Alert>
          <Info className="h-4 w-4" aria-hidden />
          <AlertDescription>
            Works best in Chrome and Edge, which have the most natural voices. Voice availability
            depends on your operating system — install OS language packs to add more voices.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Main Card ─── */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <h2 className="text-lg font-semibold font-heading">Text to Speech</h2>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Text input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="tts-textarea"
                className="text-sm font-medium text-[hsl(var(--foreground))]"
              >
                Enter text
              </label>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  charCount > MAX_CHARS
                    ? "text-[hsl(var(--destructive))]"
                    : "text-[hsl(var(--muted-foreground))]"
                )}
                aria-live="polite"
              >
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>
            <textarea
              id="tts-textarea"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              rows={6}
              placeholder="Type or paste text here to hear it spoken aloud…"
              disabled={!isSupported}
              className="w-full resize-y rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50"
              aria-describedby="tts-char-count"
            />
            <p id="tts-char-count" className="sr-only">
              {charCount} of {MAX_CHARS} characters used
            </p>
          </div>

          {/* Voice selector */}
          {voices.length > 0 && (
            <div className="space-y-1.5">
              <label
                htmlFor="tts-voice"
                className="text-sm font-medium text-[hsl(var(--foreground))]"
              >
                Voice
              </label>
              <select
                id="tts-voice"
                value={selectedVoiceIndex}
                onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                disabled={isSpeaking}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Array.from(groupedVoices.entries()).map(([lang, langVoices]) => (
                  <optgroup key={lang} label={lang.toUpperCase()}>
                    {langVoices.map((v) => {
                      const idx = voices.indexOf(v);
                      return (
                        <option key={idx} value={idx}>
                          {v.name} ({v.lang})
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {/* Rate slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                Speed
              </label>
              <span className="text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
                {rate.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[rate]}
              onValueChange={([v]) => setRate(v)}
              min={0.5}
              max={2}
              step={0.1}
              disabled={isSpeaking || !isSupported}
              aria-label={`Speech speed: ${rate.toFixed(1)}x`}
            />
            <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
              <span>0.5x</span>
              <span>2x</span>
            </div>
          </div>

          {/* Pitch slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                Pitch
              </label>
              <span className="text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
                {pitch.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[pitch]}
              onValueChange={([v]) => setPitch(v)}
              min={0}
              max={2}
              step={0.1}
              disabled={isSpeaking || !isSupported}
              aria-label={`Speech pitch: ${pitch.toFixed(1)}`}
            />
            <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            {!isSpeaking ? (
              <Button
                onClick={speak}
                disabled={!isSupported || !text.trim() || charCount > MAX_CHARS}
                className="rounded-full"
                aria-label="Play text to speech"
              >
                <Play className="mr-1.5 h-4 w-4" aria-hidden />
                Play
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={stopSpeaking}
                className="rounded-full"
                aria-label="Stop speech"
              >
                <Square className="mr-1.5 h-4 w-4" aria-hidden />
                Stop
              </Button>
            )}
          </div>

          {isSpeaking && (
            <p
              className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]"
              aria-live="polite"
            >
              <span
                className="inline-block h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse"
                aria-hidden
              />
              Speaking…
            </p>
          )}
        </CardContent>
      </Card>

      {/* ─── Feature Pills ─── */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="rounded-full gap-1.5">
          <Shield className="h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
          Text never uploaded
        </Badge>
        <Badge variant="outline" className="rounded-full gap-1.5">
          <Zap className="h-3 w-3 text-[hsl(var(--primary))]" aria-hidden />
          Web Speech API
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
