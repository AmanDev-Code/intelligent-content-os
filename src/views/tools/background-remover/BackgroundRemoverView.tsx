"use client";

/**
 * BackgroundRemoverView — AI background removal via @imgly/background-removal
 * lazy-loaded ONNX WebAssembly model.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge,
 *   Accordion, AccordionContent, AccordionItem, AccordionTrigger,
 *   Alert, AlertDescription, Progress, Separator.
 * Design tokens: --background, --foreground, --card, --card-foreground,
 *   --muted, --muted-foreground, --primary, --primary-foreground,
 *   --border, --destructive, --ring.
 * Icons: Lucide only.
 * Processing: ONNX WASM — model ~43 MB, downloaded once and cached.
 */

import { useState, useCallback } from "react";
import {
  Download,
  RotateCcw,
  Zap,
  Shield,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRight,
  ScanLine,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

type Status = "idle" | "loading-model" | "processing" | "done" | "error";

// ---------------------------------------------------------------------------
// Trust badges
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  { icon: Zap, label: "No signup required" },
  { icon: Shield, label: "Images never uploaded" },
  { icon: ScanLine, label: "AI runs in browser" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BackgroundRemoverView({ tool, alias }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [originalSrc, setOriginalSrc] = useState<string>("");
  const [resultSrc, setResultSrc] = useState<string>("");
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [sourceFileName, setSourceFileName] = useState<string>("");

  const eyebrow = alias?.eyebrow ?? "Free AI Background Remover — ONNX, browser-local";
  const h1Prefix = alias?.h1Prefix ?? "Remove";
  const h1Highlight = alias?.h1Highlight ?? "image background";
  const h1Suffix = alias?.h1Suffix ?? "with AI — free.";
  const heroSubline = alias?.heroSubline ?? tool.description;

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSourceFileName(file.name);
    setStatus("idle");
    setErrorMsg("");
    setProgress(0);
    setResultSrc("");
    setResultFile(null);

    // Show original preview
    const originalUrl = URL.createObjectURL(file);
    setOriginalSrc(originalUrl);

    setStatus("loading-model");
    setProgress(5);

    try {
      // Lazy import to avoid SSR — model is ~43 MB, cached after first load
      const { removeBackground } = await import("@imgly/background-removal");

      setStatus("processing");
      setProgress(20);

      const resultBlob = await removeBackground(file, {
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 70) + 20;
            setProgress(Math.min(pct, 95));
          }
        },
      });

      const outputName = file.name.replace(/\.[^.]+$/, "") + "-no-bg.png";
      const outputFile = new File([resultBlob], outputName, { type: "image/png" });
      const resultUrl = URL.createObjectURL(outputFile);
      setResultSrc(resultUrl);
      setResultFile(outputFile);
      setProgress(100);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Background removal failed. Try a clear photo with a distinct subject."
      );
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!resultFile) return;
    const url = URL.createObjectURL(resultFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = resultFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [resultFile]);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setOriginalSrc("");
    setResultSrc("");
    setResultFile(null);
    setErrorMsg("");
    setSourceFileName("");
  }, []);

  const isProcessing = status === "loading-model" || status === "processing";

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
          Tool UI
      ---------------------------------------------------------------- */}
      <section className="px-4 pb-10 sm:pb-14" aria-label="Background remover tool">
        <div className="mx-auto max-w-3xl">
          <Card className="p-4 sm:p-6">
            <CardHeader className="px-0 pt-0 pb-4 sm:pb-6">
              <h2 className="sr-only">Upload image and remove background</h2>
            </CardHeader>

            <CardContent className="px-0 pb-0 space-y-6">
              {/* Model size notice */}
              <Alert className="border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                <Info className="h-4 w-4" aria-hidden="true" />
                <AlertDescription className="text-sm text-muted-foreground">
                  <strong className="text-foreground">First use only:</strong> downloads the AI model (~43 MB). After
                  that, it is cached in your browser — all future uses are instant with no re-download.
                </AlertDescription>
              </Alert>

              {/* Upload — only show when idle */}
              {status === "idle" && (
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Upload your photo
                  </p>
                  <ImageDropzone
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple={false}
                    maxSizeMB={25}
                    onFilesSelected={handleFilesSelected}
                    disabled={false}
                  />
                </div>
              )}

              {/* Progress — loading model or processing */}
              {isProcessing && (
                <div className="space-y-3" aria-live="polite" aria-busy="true">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-foreground font-medium">
                      {status === "loading-model"
                        ? "Loading AI model… (first run downloads ~43 MB)"
                        : "Removing background…"}
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2"
                    aria-label={`Progress: ${progress}%`}
                  />
                  <p className="text-xs text-muted-foreground">{progress}% complete</p>
                </div>
              )}

              {/* Error */}
              {status === "error" && (
                <div className="space-y-4">
                  <Alert variant="destructive" role="alert" aria-live="assertive">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    <AlertDescription>{errorMsg}</AlertDescription>
                  </Alert>
                  <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Try another image
                  </Button>
                </div>
              )}

              {/* Result: side-by-side preview */}
              {status === "done" && originalSrc && resultSrc && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Result
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2
                        className="h-5 w-5 text-[hsl(142.1_76.2%_36.3%)]"
                        aria-hidden="true"
                      />
                      <span className="font-semibold text-foreground text-sm">
                        Background removed successfully
                      </span>
                    </div>

                    {/* Side-by-side comparison */}
                    <div
                      className="grid grid-cols-2 gap-3"
                      role="region"
                      aria-label="Before and after comparison"
                    >
                      <div>
                        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Original
                        </p>
                        <div className="rounded-lg overflow-hidden bg-[hsl(var(--muted))] aspect-square flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={originalSrc}
                            alt={`Original: ${sourceFileName}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Background removed
                        </p>
                        {/* Checkerboard pattern indicates transparency */}
                        <div
                          className="rounded-lg overflow-hidden aspect-square flex items-center justify-center"
                          style={{
                            backgroundImage:
                              "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--background)) 0% 50%)",
                            backgroundSize: "20px 20px",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resultSrc}
                            alt="Background removed — transparent PNG"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Button
                        onClick={handleDownload}
                        size="lg"
                        className="w-full sm:w-auto gap-2 font-semibold"
                        aria-label="Download transparent PNG"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download PNG
                      </Button>
                      <Button
                        onClick={handleReset}
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto gap-2"
                        aria-label="Remove background from another image"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Try another image
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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
              { slug: "image-to-text", name: "Image to Text (OCR)", description: "Extract text from any image" },
              { slug: "favicon-generator", name: "Favicon Generator", description: "Generate all favicon sizes from one image" },
              { slug: "png-to-jpg", name: "PNG to JPG Converter", description: "Convert PNG images to JPG" },
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
