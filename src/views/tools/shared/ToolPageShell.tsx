"use client";

/**
 * ToolPageShell — shared layout for all image/audio/video tool pages.
 * Shadcn primitives: Card, CardHeader, CardContent, Badge, Button,
 *   Progress, Accordion, AccordionItem, AccordionTrigger, AccordionContent,
 *   Separator, Alert, AlertDescription.
 * Design tokens: --background, --foreground, --card, --card-foreground,
 *   --muted, --muted-foreground, --primary, --primary-foreground,
 *   --border, --destructive, --destructive-foreground.
 */

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  RotateCcw,
  ArrowRight,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageDropzone } from "./ImageDropzone";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToolPageShellProps {
  // Hero
  toolName: string;
  description: string;
  eyebrow?: string;
  h1Prefix?: string;
  h1Highlight?: string;
  h1Suffix?: string;

  // Tool state
  acceptedFormats: string;
  maxFileSizeMB?: number;
  isProcessing: boolean;
  progress: number;
  processedFiles: File[];
  error?: string;
  onFilesSelected: (files: File[]) => void;
  onProcess: () => void;
  onReset: () => void;

  // Children: tool-specific settings rendered between upload and process button
  children?: React.ReactNode;

  // SEO / content
  faqs?: Array<{ question: string; answer: string }>;
  relatedTools?: Array<{ slug: string; name: string; description: string }>;
  howItWorks?: Array<{ step: string; title: string; description: string }>;
}

// ---------------------------------------------------------------------------
// Trust badges
// ---------------------------------------------------------------------------

const TRUST_BADGES = [
  { icon: Zap, label: "No signup required" },
  { icon: Shield, label: "Files never stored" },
  { icon: Clock, label: "Instant processing" },
];

// ---------------------------------------------------------------------------
// Processing panel
// ---------------------------------------------------------------------------

interface ProcessingPanelProps {
  isProcessing: boolean;
  progress: number;
  processedFiles: File[];
  error?: string;
  onProcess: () => void;
  onReset: () => void;
  hasFiles: boolean;
}

function ProcessingPanel({
  isProcessing,
  progress,
  processedFiles,
  error,
  onProcess,
  onReset,
  hasFiles,
}: ProcessingPanelProps) {
  const isDone = processedFiles.length > 0;

  return (
    <div className="space-y-4">
      {/* Error state */}
      {error && (
        <Alert
          variant="destructive"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Progress bar */}
      {isProcessing && (
        <div className="space-y-2" aria-live="polite" aria-busy="true">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processing…</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2"
            aria-label={`Processing progress: ${progress}%`}
          />
        </div>
      )}

      {/* Success: download area */}
      {isDone && !isProcessing && (
        <div
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-6 space-y-3"
          role="region"
          aria-label="Download results"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="h-5 w-5 text-[hsl(142.1_76.2%_36.3%)]"
              aria-hidden="true"
            />
            <span className="font-semibold text-foreground">
              {processedFiles.length === 1
                ? "File ready to download"
                : `${processedFiles.length} files ready`}
            </span>
          </div>

          <ul className="space-y-2">
            {processedFiles.map((file, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-md bg-[hsl(var(--muted))] px-3 py-2 text-sm"
              >
                <span className="truncate text-foreground max-w-[65%]">
                  {file.name}
                </span>
                <span className="text-muted-foreground text-xs ml-2 shrink-0">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button
          onClick={onProcess}
          disabled={!hasFiles || isProcessing}
          size="lg"
          className="w-full sm:w-auto px-8 font-semibold"
          aria-label="Process files"
        >
          {isProcessing ? (
            <>
              <span
                className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
              Processing…
            </>
          ) : isDone ? (
            <>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Download
            </>
          ) : (
            "Process"
          )}
        </Button>

        {(isDone || hasFiles) && (
          <Button
            onClick={onReset}
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ToolPageShell({
  toolName,
  description,
  eyebrow,
  h1Prefix,
  h1Highlight,
  h1Suffix,
  acceptedFormats,
  maxFileSizeMB = 50,
  isProcessing,
  progress,
  processedFiles,
  error,
  onFilesSelected,
  onProcess,
  onReset,
  children,
  faqs,
  relatedTools,
  howItWorks,
}: ToolPageShellProps) {
  const hasFiles = processedFiles.length > 0;

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
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))]">
              {eyebrow}
            </p>
          )}

          <h1
            id="tool-heading"
            className="font-display text-[clamp(1.875rem,4.5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-foreground"
          >
            {h1Prefix && <>{h1Prefix} </>}
            {h1Highlight ? (
              <>
                <span className="gradient-text">{h1Highlight}</span>
                {h1Suffix && <> {h1Suffix}</>}
              </>
            ) : (
              toolName
            )}
          </h1>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>

          {/* Trust badges */}
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
      <section
        className="px-4 pb-10 sm:pb-14"
        aria-label={`${toolName} tool`}
      >
        <div className="mx-auto max-w-3xl">
          <Card className="p-4 sm:p-6">
            <CardHeader className="px-0 pt-0 pb-4 sm:pb-6">
              <h2 className="sr-only">Upload and process</h2>
            </CardHeader>

            <CardContent className="px-0 pb-0 space-y-6">
              {/* Step 1: Upload */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Step 1 — Upload
                </p>
                <ImageDropzone
                  accept={acceptedFormats}
                  multiple
                  maxSizeMB={maxFileSizeMB}
                  onFilesSelected={onFilesSelected}
                  disabled={isProcessing}
                />
              </div>

              {/* Step 2: Tool-specific settings (via children) */}
              {children && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Step 2 — Settings
                    </p>
                    {children}
                  </div>
                </>
              )}

              {/* Step 3: Process & Download */}
              <Separator />
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Step {children ? "3" : "2"} — Process
                </p>
                <ProcessingPanel
                  isProcessing={isProcessing}
                  progress={progress}
                  processedFiles={processedFiles}
                  error={error}
                  onProcess={onProcess}
                  onReset={onReset}
                  hasFiles={hasFiles}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          How it works
      ---------------------------------------------------------------- */}
      {howItWorks && howItWorks.length > 0 && (
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
              {howItWorks.map(({ step, title, description: desc }) => (
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
                      {desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------
          FAQ
      ---------------------------------------------------------------- */}
      {faqs && faqs.length > 0 && (
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
              {faqs.map(({ question, answer }, i) => (
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
      )}

      {/* ----------------------------------------------------------------
          Related tools
      ---------------------------------------------------------------- */}
      {relatedTools && relatedTools.length > 0 && (
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
              className={cn(
                "grid gap-4",
                relatedTools.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              )}
              aria-label="Related tools"
            >
              {relatedTools.map(({ slug, name, description: desc }) => (
                <li key={slug}>
                  <Link
                    href={`/tools/${slug}`}
                    className="group flex h-full flex-col rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
                    aria-label={`Go to ${name}`}
                  >
                    <h3 className="font-semibold text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                      {name}
                    </h3>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">
                      {desc}
                    </p>
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
      )}
    </main>
  );
}
