"use client";

/**
 * QRCodeGeneratorView — generate QR codes client-side using the qrcode library.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge,
 *   Accordion, AccordionContent, AccordionItem, AccordionTrigger,
 *   Alert, AlertDescription, Separator, Slider, Label.
 * Design tokens: --background, --foreground, --card, --card-foreground,
 *   --muted, --muted-foreground, --primary, --primary-foreground,
 *   --border, --destructive, --ring.
 * Icons: Lucide only.
 * Processing: qrcode npm package — fully client-side, no upload.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Download,
  RotateCcw,
  Zap,
  Shield,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { cn } from "@/lib/utils";
import type { UtilityTool } from "@/lib/image-utility-data";
import type { UtilityAlias } from "@/lib/image-utility-aliases";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  tool: UtilityTool;
  alias?: UtilityAlias;
}

type EccLevel = "L" | "M" | "Q" | "H";

const ECC_LABELS: Record<EccLevel, string> = {
  L: "L — Low (7%)",
  M: "M — Medium (15%)",
  Q: "Q — Quartile (25%)",
  H: "H — High (30%)",
};

// ---------------------------------------------------------------------------
// Trust badges
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  { icon: Zap, label: "No signup required" },
  { icon: Shield, label: "No watermark" },
  { icon: QrCode, label: "PNG & SVG download" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function QRCodeGeneratorView({ tool, alias }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [text, setText] = useState("https://trndinn.com");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [eccLevel, setEccLevel] = useState<EccLevel>("M");
  const [margin, setMargin] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const eyebrow = alias?.eyebrow ?? "Free QR Code Generator — custom colors, PNG & SVG";
  const h1Prefix = alias?.h1Prefix ?? "QR Code Generator";
  const h1Highlight = alias?.h1Highlight ?? "— custom colors";
  const h1Suffix = alias?.h1Suffix ?? "free PNG & SVG.";
  const heroSubline = alias?.heroSubline ?? tool.description;

  // Auto-generate on input change (debounced via useEffect)
  useEffect(() => {
    if (!text.trim()) {
      setHasGenerated(false);
      return;
    }
    const timer = setTimeout(() => {
      void generateQR();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fgColor, bgColor, eccLevel, margin]);

  const generateQR = useCallback(async () => {
    if (!text.trim() || !canvasRef.current) return;
    setError("");
    setIsGenerating(true);
    try {
      const QRCode = (await import("qrcode")).default;
      await QRCode.toCanvas(canvasRef.current, text.trim(), {
        width: 400,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: eccLevel,
        margin,
      });
      setHasGenerated(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate QR code. Check your input and try again."
      );
      setHasGenerated(false);
    } finally {
      setIsGenerating(false);
    }
  }, [text, fgColor, bgColor, eccLevel, margin]);

  const handleDownloadPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const handleDownloadSvg = useCallback(async () => {
    if (!text.trim()) return;
    try {
      const QRCode = (await import("qrcode")).default;
      const svgString = await QRCode.toString(text.trim(), {
        type: "svg",
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: eccLevel,
        margin,
      });
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.svg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SVG download failed.");
    }
  }, [text, fgColor, bgColor, eccLevel, margin]);

  const handleReset = useCallback(() => {
    setText("https://trndinn.com");
    setFgColor("#000000");
    setBgColor("#ffffff");
    setEccLevel("M");
    setMargin(4);
    setError("");
    setHasGenerated(false);
  }, []);

  return (
    <MarketingShell>
    <main className="flex-1 space-y-4 sm:space-y-6">
      {/* ----------------------------------------------------------------
          Hero
      ---------------------------------------------------------------- */}
      <section
        className="px-4 pt-10 pb-6 sm:pt-16 sm:pb-10 text-center"
        aria-labelledby="tool-heading"
      >
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))]">
            {eyebrow}
          </p>
          <h1
            id="tool-heading"
            className="font-display text-[clamp(1.875rem,4.5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-foreground"
          >
            {h1Prefix && <>{h1Prefix} </>}
            <span className="gradient-text">{h1Highlight}</span>
            {h1Suffix && <> {h1Suffix}</>}
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {heroSubline}
          </p>
          <ul
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
            aria-label="Tool features"
          >
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <li key={label}>
                <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium">
                  <Icon className="h-3 w-3" aria-hidden="true" />
                  {label}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          Tool UI — two-column on lg
      ---------------------------------------------------------------- */}
      <section className="px-4 pb-10 sm:pb-14" aria-label="QR code generator tool">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Controls */}
            <Card className="p-4 sm:p-6">
              <CardHeader className="px-0 pt-0 pb-4">
                <h2 className="text-base font-semibold text-foreground">Settings</h2>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-5">
                {/* Text input */}
                <div className="space-y-2">
                  <Label htmlFor="qr-text" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    URL or text
                  </Label>
                  <textarea
                    id="qr-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    placeholder="https://example.com or any text"
                    className={cn(
                      "w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]",
                      "px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2",
                      "resize-none",
                    )}
                    aria-describedby="qr-text-hint"
                  />
                  <p id="qr-text-hint" className="text-xs text-muted-foreground">
                    Include https:// for reliable URL scanning.
                  </p>
                </div>

                <Separator />

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qr-fg" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Foreground
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="qr-fg"
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="h-9 w-9 cursor-pointer rounded border border-[hsl(var(--border))] bg-transparent p-0.5"
                        aria-label="Foreground color"
                      />
                      <span className="font-mono text-xs text-muted-foreground">{fgColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qr-bg" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Background
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="qr-bg"
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-9 w-9 cursor-pointer rounded border border-[hsl(var(--border))] bg-transparent p-0.5"
                        aria-label="Background color"
                      />
                      <span className="font-mono text-xs text-muted-foreground">{bgColor}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Error correction */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Error correction
                  </Label>
                  <div
                    className="grid grid-cols-4 gap-1"
                    role="radiogroup"
                    aria-label="Error correction level"
                  >
                    {(["L", "M", "Q", "H"] as EccLevel[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        role="radio"
                        aria-checked={eccLevel === level}
                        onClick={() => setEccLevel(level)}
                        className={cn(
                          "rounded-md px-2 py-1.5 text-xs font-semibold transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                          eccLevel === level
                            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                            : "bg-[hsl(var(--muted))] text-muted-foreground hover:bg-[hsl(var(--accent))] hover:text-foreground",
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{ECC_LABELS[eccLevel]}</p>
                </div>

                <Separator />

                {/* Margin */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Margin
                    </Label>
                    <span className="text-xs font-medium text-foreground">{margin} modules</span>
                  </div>
                  <Slider
                    value={[margin]}
                    onValueChange={([v]) => setMargin(v)}
                    min={0}
                    max={10}
                    step={1}
                    aria-label={`Margin: ${margin} modules`}
                  />
                </div>

                {error && (
                  <Alert variant="destructive" role="alert" aria-live="assertive">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Reset */}
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  aria-label="Reset to defaults"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset to defaults
                </Button>
              </CardContent>
            </Card>

            {/* Preview + Downloads */}
            <Card className="p-4 sm:p-6">
              <CardHeader className="px-0 pt-0 pb-4">
                <h2 className="text-base font-semibold text-foreground">Preview</h2>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-5">
                {/* Canvas preview */}
                <div
                  className="flex min-h-[200px] items-center justify-center rounded-lg bg-[hsl(var(--muted))] p-4"
                  aria-label="QR code preview"
                  role="img"
                >
                  {isGenerating && (
                    <span
                      className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent"
                      aria-label="Generating QR code"
                    />
                  )}
                  <canvas
                    ref={canvasRef}
                    className={cn(
                      "max-w-full rounded transition-opacity",
                      isGenerating ? "opacity-50" : "opacity-100",
                      !hasGenerated && !isGenerating ? "hidden" : "block",
                    )}
                    aria-hidden="true"
                  />
                  {!hasGenerated && !isGenerating && (
                    <p className="text-sm text-muted-foreground">
                      Enter a URL or text to generate a QR code
                    </p>
                  )}
                </div>

                {/* Download buttons */}
                {hasGenerated && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="h-4 w-4 text-[hsl(142.1_76.2%_36.3%)]"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-foreground">
                        Ready to download
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        onClick={handleDownloadPng}
                        size="sm"
                        className="w-full sm:w-auto gap-2 font-semibold"
                        aria-label="Download QR code as PNG"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download PNG
                      </Button>
                      <Button
                        onClick={handleDownloadSvg}
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto gap-2"
                        aria-label="Download QR code as SVG"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download SVG
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      SVG is scalable — use it for print. PNG is 400×400px.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          FAQ
      ---------------------------------------------------------------- */}
      <section className="px-4 pb-10 sm:pb-14" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-3xl">
          <h2
            id="faq-heading"
            className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {tool.faqs.map(({ question, answer }, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 sm:px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-[hsl(var(--primary))] hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          Related tools
      ---------------------------------------------------------------- */}
      <section className="px-4 pb-16 sm:pb-24" aria-labelledby="related-tools-heading">
        <div className="mx-auto max-w-3xl">
          <h2
            id="related-tools-heading"
            className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Related tools
          </h2>
          <ul
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Related tools"
          >
            {[
              { slug: "profile-pic-creator", name: "Profile Picture Creator", description: "Create an emoji avatar for social profiles" },
              { slug: "favicon-generator", name: "Favicon Generator", description: "Generate all favicon sizes from one image" },
              { slug: "image-to-base64", name: "Image to Base64", description: "Encode any image as a data URI string" },
            ].map(({ slug, name, description }) => (
              <li key={slug}>
                <Link
                  href={`/tools/${slug}`}
                  className={cn(
                    "group flex h-full flex-col rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4",
                    "transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                  )}
                  aria-label={`Go to ${name}`}
                >
                  <h3 className="font-semibold text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                    {name}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{description}</p>
                  <span
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))]"
                    aria-hidden="true"
                  >
                    Try it
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
    </MarketingShell>
  );
}
