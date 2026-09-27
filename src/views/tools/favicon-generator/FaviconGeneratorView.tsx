"use client";

/**
 * FaviconGeneratorView — generate all favicon sizes from an uploaded image.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge,
 *   Accordion, AccordionContent, AccordionItem, AccordionTrigger,
 *   Alert, AlertDescription, Progress, Separator.
 * Design tokens: --background, --foreground, --card, --card-foreground,
 *   --muted, --muted-foreground, --primary, --primary-foreground,
 *   --border, --destructive, --ring.
 * Icons: Lucide only.
 * Processing: Canvas API in browser — zero server upload.
 */

import { useState, useCallback } from "react";
import {
  Download,
  RotateCcw,
  Zap,
  Shield,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowRight,
  Globe,
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
import { useFileDownload } from "@/hooks/tools/useFileDownload";
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

// ---------------------------------------------------------------------------
// Favicon generation — Canvas API
// ---------------------------------------------------------------------------

const FAVICON_SIZES = [
  { size: 16, name: "favicon-16x16.png" },
  { size: 32, name: "favicon-32x32.png" },
  { size: 48, name: "favicon-48x48.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 192, name: "android-chrome-192x192.png" },
  { size: 512, name: "android-chrome-512x512.png" },
] as const;

const WEBMANIFEST_CONTENT = JSON.stringify(
  {
    name: "My App",
    short_name: "App",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  },
  null,
  2
);

async function resizeToCanvas(file: File, size: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        URL.revokeObjectURL(objectUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) resolve(blob);
          else reject(new Error(`Failed to generate ${size}x${size} PNG`));
        },
        "image/png",
        1.0
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for resizing"));
    };
    img.src = objectUrl;
  });
}

// ---------------------------------------------------------------------------
// Trust badges
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  { icon: Zap, label: "No signup required" },
  { icon: Shield, label: "Files never uploaded" },
  { icon: Globe, label: "All sizes + webmanifest" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FaviconGeneratorView({ tool, alias }: Props) {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const [isDone, setIsDone] = useState(false);

  const { downloadAsZip } = useFileDownload();

  const eyebrow = alias?.eyebrow ?? "Free Favicon Generator — all sizes, browser-based";
  const h1Prefix = alias?.h1Prefix ?? "Favicon generator";
  const h1Highlight = alias?.h1Highlight ?? "— all sizes";
  const h1Suffix = alias?.h1Suffix ?? "one click.";
  const heroSubline = alias?.heroSubline ?? tool.description;

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length === 0) return;
    setSourceFile(files[0]);
    setIsDone(false);
    setError("");
    setProgress(0);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!sourceFile) return;
    setError("");
    setIsProcessing(true);
    setProgress(0);

    try {
      const files: File[] = [];
      const total = FAVICON_SIZES.length;

      for (let i = 0; i < FAVICON_SIZES.length; i++) {
        const { size, name } = FAVICON_SIZES[i];
        const blob = await resizeToCanvas(sourceFile, size);
        files.push(new File([blob], name, { type: "image/png" }));
        setProgress(Math.round(((i + 1) / total) * 90));
      }

      // Add site.webmanifest
      const manifestBlob = new Blob([WEBMANIFEST_CONTENT], {
        type: "application/manifest+json",
      });
      files.push(new File([manifestBlob], "site.webmanifest", { type: "application/manifest+json" }));

      setProgress(95);
      await downloadAsZip(files, "favicon-package");
      setProgress(100);
      setIsDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate favicon package. Please try a square PNG image."
      );
    } finally {
      setIsProcessing(false);
    }
  }, [sourceFile, downloadAsZip]);

  const handleReset = useCallback(() => {
    setSourceFile(null);
    setIsDone(false);
    setError("");
    setProgress(0);
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
          Tool UI
      ---------------------------------------------------------------- */}
      <section className="px-4 pb-10 sm:pb-14" aria-label="Favicon generator tool">
        <div className="mx-auto max-w-3xl">
          <Card className="p-4 sm:p-6">
            <CardHeader className="px-0 pt-0 pb-4 sm:pb-6">
              <h2 className="sr-only">Upload image and generate favicon package</h2>
            </CardHeader>

            <CardContent className="px-0 pb-0 space-y-6">
              {/* Step 1: Upload */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Step 1 — Upload a square image (PNG recommended)
                </p>
                <ImageDropzone
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  multiple={false}
                  maxSizeMB={10}
                  onFilesSelected={handleFilesSelected}
                  disabled={isProcessing}
                />
                {sourceFile && !isProcessing && !isDone && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Selected: <span className="font-medium text-foreground">{sourceFile.name}</span>
                  </p>
                )}
              </div>

              {/* What will be generated */}
              <div className="rounded-lg bg-[hsl(var(--muted))] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Files in the ZIP
                </p>
                <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                  {[
                    "favicon-16x16.png",
                    "favicon-32x32.png",
                    "favicon-48x48.png",
                    "apple-touch-icon.png (180px)",
                    "android-chrome-192x192.png",
                    "android-chrome-512x512.png",
                    "site.webmanifest",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Package className="h-3 w-3 shrink-0 text-[hsl(var(--primary))]" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Error */}
              {error && (
                <Alert variant="destructive" role="alert" aria-live="assertive">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Progress */}
              {isProcessing && (
                <div className="space-y-2" aria-live="polite" aria-busy="true">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Generating sizes…</span>
                    <span className="font-medium text-foreground">{progress}%</span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2"
                    aria-label={`Generation progress: ${progress}%`}
                  />
                </div>
              )}

              {/* Success */}
              {isDone && !isProcessing && (
                <div
                  className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-[hsl(142.1_76.2%_36.3%)]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      Favicon package downloaded
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      favicon-package.zip contains 7 files — drop them all into your site root.
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Action buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button
                  onClick={handleGenerate}
                  disabled={!sourceFile || isProcessing}
                  size="lg"
                  className="w-full sm:w-auto px-8 font-semibold"
                  aria-label="Generate and download favicon ZIP"
                >
                  {isProcessing ? (
                    <>
                      <span
                        className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                        aria-hidden="true"
                      />
                      Generating…
                    </>
                  ) : isDone ? (
                    <>
                      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                      Download again
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                      Generate &amp; download ZIP
                    </>
                  )}
                </Button>

                {(sourceFile || isDone) && (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    disabled={isProcessing}
                    className="w-full sm:w-auto"
                    aria-label="Reset and start over"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                    Start over
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          How to install
      ---------------------------------------------------------------- */}
      <section className="px-4 pb-10 sm:pb-14" aria-labelledby="install-heading">
        <div className="mx-auto max-w-3xl">
          <h2
            id="install-heading"
            className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            How to install your favicon
          </h2>
          <ol className="space-y-4" aria-label="Installation steps">
            {[
              {
                step: "1",
                title: "Place files in your site root",
                description: "Copy all files from the ZIP into the root directory of your website (the same folder as index.html).",
              },
              {
                step: "2",
                title: "Add tags to your <head>",
                description: `Add: <link rel="icon" href="/favicon.ico"> and <link rel="apple-touch-icon" href="/apple-touch-icon.png"> and <link rel="manifest" href="/site.webmanifest">`,
              },
              {
                step: "3",
                title: "Update site.webmanifest",
                description: "Edit site.webmanifest to set your app's name and theme_color to match your brand.",
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
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground font-mono">
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
              { slug: "image-to-base64", name: "Image to Base64", description: "Encode any image as a data URI string" },
              { slug: "png-to-ico", name: "PNG to ICO", description: "Convert PNG to ICO format" },
              { slug: "background-remover", name: "Background Remover", description: "Remove image backgrounds with AI" },
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
