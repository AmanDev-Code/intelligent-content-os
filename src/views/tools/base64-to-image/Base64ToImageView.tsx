"use client";

/**
 * Base64ToImageView — decode a Base64 data URI back to an image.
 *
 * Wrapped by ImageToolsShell which provides: MarketingShell, sidebar,
 * hero (eyebrow, animated H1, subline), FAQ accordion, SEO footer.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button, Badge,
 *   Alert, AlertDescription, Textarea, Separator.
 * Design tokens: --background, --foreground, --card, --card-foreground,
 *   --muted, --muted-foreground, --primary, --primary-foreground,
 *   --border, --destructive, --ring.
 * Icons: Lucide only.
 * Processing: pure atob() browser API — no server, no upload.
 */

import { useState, useCallback } from "react";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
// Core logic — pure browser atob()
// ---------------------------------------------------------------------------

function fromBase64(base64: string): File {
  // Normalise: strip whitespace that might have been pasted
  const clean = base64.trim();

  // If it looks like a raw base64 string without a data URI prefix,
  // default to PNG so atob still works.
  const dataUri = clean.startsWith("data:") ? clean : `data:image/png;base64,${clean}`;

  const arr = dataUri.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  const ext = mime === "image/jpeg" ? "jpg" : mime.split("/")[1] ?? "png";
  return new File([u8arr], `decoded-image.${ext}`, { type: mime });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Base64ToImageView({ tool, alias }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [decodedFile, setDecodedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isDone, setIsDone] = useState(false);

  const eyebrow = alias?.eyebrow ?? "Free Base64 to Image Decoder — browser-based";
  const h1Prefix = alias?.h1Prefix ?? "Decode";
  const h1Highlight = alias?.h1Highlight ?? "Base64 to image";
  const h1Suffix = alias?.h1Suffix ?? "— free, instant.";
  const heroSubline = alias?.heroSubline ?? tool.description;

  const handleDecode = useCallback(() => {
    setError("");
    setPreviewSrc("");
    setDecodedFile(null);
    setIsDone(false);

    if (!inputValue.trim()) {
      setError("Please paste a Base64 data URI string first.");
      return;
    }

    try {
      const file = fromBase64(inputValue);
      const objectUrl = URL.createObjectURL(file);
      setPreviewSrc(objectUrl);
      setDecodedFile(file);
      setIsDone(true);
    } catch {
      setError(
        "Failed to decode the Base64 string. Make sure it is a valid data URI (data:image/...;base64,...) or a raw Base64 string."
      );
    }
  }, [inputValue]);

  const handleDownload = useCallback(() => {
    if (!decodedFile) return;
    const url = URL.createObjectURL(decodedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = decodedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [decodedFile]);

  const handleReset = useCallback(() => {
    setInputValue("");
    setPreviewSrc("");
    setDecodedFile(null);
    setError("");
    setIsDone(false);
  }, []);

  return (
    <ImageToolsShell
      slug="base64-to-image"
      toolName="Base64 to Image Decoder"
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
      <section aria-label="Base64 to image decoder">
        <Card className="p-4 sm:p-6">
          <CardHeader className="px-0 pt-0 pb-4 sm:pb-6">
            <h2 className="sr-only">Paste Base64 string and decode</h2>
          </CardHeader>

          <CardContent className="px-0 pb-0 space-y-6">
            {/* Step 1: Input */}
            <div>
              <label
                htmlFor="base64-input"
                className="mb-3 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >
                Step 1 — Paste your Base64 string
              </label>
              <Textarea
                id="base64-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Paste data:image/png;base64,iVBORw0KGgo… or a raw Base64 string"
                rows={6}
                className="font-mono text-xs resize-none"
                aria-describedby="base64-input-hint"
                disabled={isDone}
              />
              <p id="base64-input-hint" className="mt-1.5 text-xs text-muted-foreground">
                Accepts full data URIs or raw Base64 strings (defaults to PNG if no MIME prefix).
              </p>
            </div>

            {/* Error */}
            {error && (
              <Alert variant="destructive" role="alert" aria-live="assertive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Decode button */}
            {!isDone && (
              <Button
                onClick={handleDecode}
                disabled={!inputValue.trim()}
                size="lg"
                className="w-full sm:w-auto px-8 font-semibold"
                aria-label="Decode Base64 to image"
              >
                Decode image
              </Button>
            )}

            {/* Step 2: Preview + Download */}
            {isDone && previewSrc && (
              <>
                <Separator />
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Step 2 — Preview and download
                  </p>

                  <div
                    className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-4"
                    role="region"
                    aria-label="Decoded image result"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="h-5 w-5 text-[hsl(142.1_76.2%_36.3%)]"
                        aria-hidden="true"
                      />
                      <span className="font-semibold text-foreground text-sm">
                        Decoded successfully
                      </span>
                      {decodedFile && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {decodedFile.name}
                        </Badge>
                      )}
                    </div>

                    {/* Image preview */}
                    <div className="flex justify-center rounded-lg bg-[hsl(var(--muted))] p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewSrc}
                        alt="Decoded image preview"
                        className="max-h-64 max-w-full rounded object-contain"
                      />
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        onClick={handleDownload}
                        size="sm"
                        className="w-full sm:w-auto gap-2 font-semibold"
                        aria-label="Download decoded image"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Download image
                      </Button>
                      <Button
                        onClick={handleReset}
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto gap-2"
                        aria-label="Reset and decode another string"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Decode another
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
