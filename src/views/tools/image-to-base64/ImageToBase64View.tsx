"use client";

/**
 * ImageToBase64View — encode any image to a Base64 data URI.
 *
 * Wrapped by ImageToolsShell which provides: MarketingShell, sidebar,
 * hero (eyebrow, animated H1, subline), FAQ accordion, SEO footer.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge,
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
  CheckCircle2,
  AlertCircle,
  Check,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ImageDropzone } from "@/views/tools/shared/ImageDropzone";
import { ImageToolsShell } from "@/views/tools/image-tools/ImageToolsShell";
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
    <ImageToolsShell
      slug="image-to-base64"
      toolName="Image to Base64 Converter"
      h1Prefix={h1Prefix}
      h1Highlight={h1Highlight}
      h1Suffix={h1Suffix}
      eyebrow={eyebrow}
      heroSubline={heroSubline}
      whyText={tool.description}
      faqs={tool.faqs}
    >
      {/* ----------------------------------------------------------------
          Tool UI
      ---------------------------------------------------------------- */}
      <section aria-label="Image to Base64 tool">
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
      </section>
    </ImageToolsShell>
  );
}
