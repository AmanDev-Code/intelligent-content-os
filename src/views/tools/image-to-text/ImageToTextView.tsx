"use client";

/**
 * ImageToTextView — OCR via Tesseract.js lazy-loaded WASM.
 *
 * Wrapped by ImageToolsShell which provides: MarketingShell, sidebar,
 * hero (eyebrow, animated H1, subline), FAQ accordion, SEO footer.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge,
 *   Alert, AlertDescription, Progress, Separator, Textarea,
 *   Select, SelectContent, SelectItem, SelectTrigger, SelectValue.
 * Design tokens: --background, --foreground, --card, --card-foreground,
 *   --muted, --muted-foreground, --primary, --primary-foreground,
 *   --border, --destructive, --ring.
 * Icons: Lucide only.
 * Processing: Tesseract.js WASM — lazy loaded, language data cached.
 */

import { useState, useCallback } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type Status = "idle" | "processing" | "done" | "error";

// ---------------------------------------------------------------------------
// Language options
// ---------------------------------------------------------------------------

const LANGUAGES = [
  { value: "eng", label: "English" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
  { value: "jpn", label: "Japanese" },
  { value: "hin", label: "Hindi" },
  { value: "ara", label: "Arabic" },
] as const;

// ---------------------------------------------------------------------------
// OCR logic — lazy loaded Tesseract.js
// ---------------------------------------------------------------------------

async function extractText(
  file: File,
  language: string,
  onProgress: (pct: number) => void
): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(language, 1, {
    logger: (m: { progress: number }) => {
      if (typeof m.progress === "number") {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });
  const { data } = await worker.recognize(file);
  await worker.terminate();
  return data.text;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ImageToTextView({ tool, alias }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState("eng");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const eyebrow = alias?.eyebrow ?? "Free Image to Text OCR — Tesseract.js, browser-local";
  const h1Prefix = alias?.h1Prefix ?? "Extract text";
  const h1Highlight = alias?.h1Highlight ?? "from an image";
  const h1Suffix = alias?.h1Suffix ?? "— free OCR online.";
  const heroSubline = alias?.heroSubline ?? tool.description;

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length === 0) return;
    setSourceFile(files[0]);
    setStatus("idle");
    setExtractedText("");
    setErrorMsg("");
    setProgress(0);
  }, []);

  const handleExtract = useCallback(async () => {
    if (!sourceFile) return;
    setStatus("processing");
    setProgress(0);
    setExtractedText("");
    setErrorMsg("");

    try {
      const text = await extractText(sourceFile, language, (pct) => {
        setProgress(pct);
      });
      setExtractedText(text.trim());
      setProgress(100);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "OCR failed. Please try a clearer image with better contrast."
      );
    }
  }, [sourceFile, language]);

  const handleCopy = useCallback(async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op — user can manually select text
    }
  }, [extractedText]);

  const handleDownload = useCallback(() => {
    if (!extractedText || !sourceFile) return;
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const baseName = sourceFile.name.replace(/\.[^.]+$/, "");
    a.href = url;
    a.download = `${baseName}-text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [extractedText, sourceFile]);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setSourceFile(null);
    setExtractedText("");
    setErrorMsg("");
    setProgress(0);
    setCopied(false);
  }, []);

  const isProcessing = status === "processing";

  return (
    <ImageToolsShell
      slug="image-to-text"
      toolName="Image to Text (OCR)"
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
      <section aria-label="Image to text OCR tool">
        <Card className="p-4 sm:p-6">
          <CardHeader className="px-0 pt-0 pb-4 sm:pb-6">
            <h2 className="sr-only">Upload image and extract text</h2>
          </CardHeader>

          <CardContent className="px-0 pb-0 space-y-6">
            {/* Step 1: Upload */}
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Step 1 — Upload image
              </p>
              <ImageDropzone
                accept="image/png,image/jpeg,image/jpg,image/webp,image/tiff"
                multiple={false}
                maxSizeMB={20}
                onFilesSelected={handleFilesSelected}
                disabled={isProcessing}
              />
              {sourceFile && !isProcessing && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{sourceFile.name}</span>
                </p>
              )}
            </div>

            {/* Step 2: Language */}
            <Separator />
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Step 2 — Select language
              </p>
              <Select
                value={language}
                onValueChange={setLanguage}
                disabled={isProcessing}
              >
                <SelectTrigger
                  className="w-full sm:w-64"
                  aria-label="Select OCR language"
                >
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Language data is downloaded on first use and cached by your browser.
              </p>
            </div>

            {/* Error */}
            {status === "error" && (
              <Alert variant="destructive" role="alert" aria-live="assertive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2" aria-live="polite" aria-busy="true">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Extracting text…</span>
                  <span className="font-medium text-foreground">{progress}%</span>
                </div>
                <Progress
                  value={progress}
                  className="h-2"
                  aria-label={`OCR progress: ${progress}%`}
                />
              </div>
            )}

            {/* Step 3: Extract button */}
            {!isProcessing && status !== "done" && (
              <>
                <Separator />
                <Button
                  onClick={handleExtract}
                  disabled={!sourceFile || isProcessing}
                  size="lg"
                  className="w-full sm:w-auto px-8 font-semibold"
                  aria-label="Extract text from image"
                >
                  Extract text
                </Button>
              </>
            )}

            {/* Step 4: Result */}
            {status === "done" && extractedText !== undefined && (
              <>
                <Separator />
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Step 3 — Extracted text
                  </p>

                  <div
                    className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-3"
                    role="region"
                    aria-label="Extracted text result"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="h-5 w-5 text-[hsl(142.1_76.2%_36.3%)]"
                        aria-hidden="true"
                      />
                      <span className="font-semibold text-foreground text-sm">
                        Text extracted
                      </span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {extractedText.length} chars
                      </Badge>
                    </div>

                    {extractedText ? (
                      <Textarea
                        value={extractedText}
                        readOnly
                        rows={8}
                        className="resize-y bg-[hsl(var(--muted))] text-sm"
                        aria-label="Extracted text output"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No text was found in the image. Try a clearer image or a different language setting.
                      </p>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        onClick={handleCopy}
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto gap-2"
                        disabled={!extractedText}
                        aria-label="Copy extracted text to clipboard"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-[hsl(142.1_76.2%_36.3%)]" aria-hidden="true" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" aria-hidden="true" />
                            Copy text
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleDownload}
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto gap-2"
                        disabled={!extractedText}
                        aria-label="Download extracted text as .txt file"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download .txt
                      </Button>

                      <Button
                        onClick={handleReset}
                        size="sm"
                        variant="ghost"
                        className="w-full sm:w-auto gap-2 sm:ml-auto"
                        aria-label="Extract text from another image"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Try another
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
