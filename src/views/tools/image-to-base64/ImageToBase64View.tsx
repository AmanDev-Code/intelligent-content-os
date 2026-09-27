"use client";

/**
 * ImageToBase64View — encode any image to a Base64 data URI.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge,
 *   Accordion, AccordionContent, AccordionItem, AccordionTrigger,
 *   Alert, AlertDescription, Textarea, Separator.
 * Design tokens: --background, --foreground, --card, --card-foreground,
 *   --muted, --muted-foreground, --primary, --primary-foreground,
 *   --border, --destructive, --destructive-foreground, --ring.
 * Icons: Lucide only.
 * Processing: pure FileReader API — no server, no hook needed.
 */

import { useState, useCallback, useRef } from "react";
import {
  Copy,
  Download,
  RotateCcw,
  Zap,
  Shield,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ArrowRight,
  Check,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
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

// ---------------------------------------------------------------------------
// Core logic — pure browser FileReader
// ---------------------------------------------------------------------------

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ---------------------------------------------------------------------------
// Trust badges
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  { icon: Zap, label: "No signup required" },
  { icon: Shield, label: "Files never uploaded" },
  { icon: FileCode, label: "Pure browser API" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ImageToBase64View({ tool, alias }: Props) {
  const [dataUri, setDataUri] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const eyebrow = alias?.eyebrow ?? "Free Image to Base64 Converter — browser-based";
  const h1Prefix = alias?.h1Prefix ?? "Convert";
  const h1Highlight = alias?.h1Highlight ?? "image to Base64";
  const h1Suffix = alias?.h1Suffix ?? "— free, instant.";
  const heroSubline = alias?.heroSubline ?? tool.description;

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setError("");
    setDataUri("");
    setFileName(file.name);
    setIsProcessing(true);
    try {
      const result = await toBase64(file);
      setDataUri(result);
    } catch {
      setError("Failed to encode the image. Please try a different file.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!dataUri) return;
    try {
      await navigator.clipboard.writeText(dataUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the textarea text
      textareaRef.current?.select();
    }
  }, [dataUri]);

  const handleDownload = useCallback(() => {
    if (!dataUri) return;
    const blob = new Blob([dataUri], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const baseName = fileName.replace(/\.[^.]+$/, "");
    a.href = url;
    a.download = `${baseName}-base64.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [dataUri, fileName]);

  const handleReset = useCallback(() => {
    setDataUri("");
    setFileName("");
    setError("");
    setCopied(false);
  }, []);

  const isDone = !!dataUri;

  return (
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
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1 text-xs font-medium"
                >
                  <Icon className="h-3 w-3" aria-hidden="true" />
                  {label}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          Tool UI
      ---------------------------------------------------------------- */}
      <section className="px-4 pb-10 sm:pb-14" aria-label="Image to Base64 tool">
        <div className="mx-auto max-w-3xl">
          <Card className="p-4 sm:p-6">
            <CardHeader className="px-0 pt-0 pb-4 sm:pb-6">
              <h2 className="sr-only">Upload image and encode to Base64</h2>
            </CardHeader>

            <CardContent className="px-0 pb-0 space-y-6">
              {/* Step 1: Upload */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Step 1 — Upload image
                </p>
                <ImageDropzone
                  accept="image/*"
                  multiple={false}
                  maxSizeMB={50}
                  onFilesSelected={handleFilesSelected}
                  disabled={isProcessing}
                />
              </div>

              {/* Processing indicator */}
              {isProcessing && (
                <div
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent"
                    aria-hidden="true"
                  />
                  Encoding…
                </div>
              )}

              {/* Error */}
              {error && (
                <Alert variant="destructive" role="alert" aria-live="assertive">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Step 2: Result */}
              {isDone && !isProcessing && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Step 2 — Base64 result
                    </p>

                    <div
                      className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-3"
                      role="region"
                      aria-label="Base64 output"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className="h-5 w-5 text-[hsl(142.1_76.2%_36.3%)]"
                          aria-hidden="true"
                        />
                        <span className="font-semibold text-foreground text-sm">
                          Encoded successfully
                        </span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {(dataUri.length / 1024).toFixed(1)} KB string
                        </Badge>
                      </div>

                      <Textarea
                        ref={textareaRef}
                        value={dataUri}
                        readOnly
                        rows={5}
                        className="font-mono text-xs resize-none bg-[hsl(var(--muted))] text-foreground"
                        aria-label="Base64 data URI output"
                      />

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          onClick={handleCopy}
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto gap-2"
                          aria-label="Copy Base64 string to clipboard"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 text-[hsl(142.1_76.2%_36.3%)]" aria-hidden="true" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" aria-hidden="true" />
                              Copy to clipboard
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={handleDownload}
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto gap-2"
                          aria-label="Download Base64 string as .txt file"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          Download .txt
                        </Button>

                        <Button
                          onClick={handleReset}
                          size="sm"
                          variant="ghost"
                          className="w-full sm:w-auto gap-2 sm:ml-auto"
                          aria-label="Reset and encode another image"
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          Start over
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          How it works
      ---------------------------------------------------------------- */}
      <section
        className="px-4 pb-10 sm:pb-14"
        aria-labelledby="how-it-works-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="how-it-works-heading"
            className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            How it works
          </h2>
          <ol className="space-y-4" aria-label="Steps">
            {[
              {
                step: "1",
                title: "Upload any image",
                description: "Drop a PNG, JPG, WebP, GIF, SVG, or BMP file. It is read by the browser's FileReader API — never sent to a server.",
              },
              {
                step: "2",
                title: "Base64 string appears instantly",
                description: "The image is encoded as a data URI string (data:image/...;base64,...). The full string appears in the output box.",
              },
              {
                step: "3",
                title: "Copy or download",
                description: "Copy the data URI to clipboard for inline use in HTML/CSS, or download as a .txt file for later use.",
              },
            ].map(({ step, title, description }) => (
              <li
                key={step}
                className="flex gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-6"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))]"
                  aria-hidden="true"
                >
                  {step}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          FAQ
      ---------------------------------------------------------------- */}
      <section
        className="px-4 pb-10 sm:pb-14"
        aria-labelledby="faq-heading"
      >
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
      <section
        className="px-4 pb-16 sm:pb-24"
        aria-labelledby="related-tools-heading"
      >
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
              { slug: "base64-to-image", name: "Base64 to Image", description: "Decode a Base64 string back to an image" },
              { slug: "favicon-generator", name: "Favicon Generator", description: "Generate all favicon sizes from one image" },
              { slug: "image-to-text", name: "Image to Text (OCR)", description: "Extract text from any image" },
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
  );
}
