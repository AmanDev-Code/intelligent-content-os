"use client";

/**
 * ImageToBase64View — encode any image to a Base64 data URI.
 *
 * Layout: MarketingShell > flex(ImageToolsSidebar | main).
 * Unified workspace card: left = upload, right = output.
 * Processing: pure FileReader API — no server, no hook needed.
 *
 * Shadcn: Button, Badge, Alert, Textarea.
 * Icons: Lucide only. Motion: CSS keyframes only. A11y: WCAG AA.
 */

import { useState, useCallback, useRef } from "react";
import {
  Copy,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Check,
  ArrowRight,
  Sparkles,
  Lock,
  Monitor,
  Star,
  Code2,
  Eye,
  FileImage,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar, SidebarWrapper } from "@/views/tools/image-tools/ImageToolsSidebar";
import { TrustStrip, type TrustFeature } from "@/views/tools/shared/TrustStrip";
import { TrustBadges, type TrustBadge } from "@/views/tools/shared/TrustBadges";
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
// Constants
// ---------------------------------------------------------------------------

const TRUST_BADGES: TrustBadge[] = [
  { icon: Sparkles, text: "No signup required" },
  { icon: Lock, text: "100% private" },
  { icon: Monitor, text: "Runs in your browser" },
  { icon: Star, text: "Supports all formats" },
];

const TRUST_FEATURES: TrustFeature[] = [
  { icon: Zap, title: "Instant encoding", description: "Convert any image to Base64 in milliseconds." },
  { icon: Lock, title: "100% private", description: "Images never leave your device." },
  { icon: Code2, title: "Ready to embed", description: "Copy the data URI straight into HTML/CSS." },
  { icon: Monitor, title: "No installation", description: "Works in any modern browser." },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtBytes(b: number): string {
  if (b === 0) return "0 B";
  const k = 1024;
  const s = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ImageToBase64View({ tool, alias }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dataUri, setDataUri] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const done = !!dataUri;
  const hasFile = file !== null;
  const eyebrow = alias?.eyebrow ?? "Free Image to Base64 — Browser-Based";

  // ── Handlers ──────────────────────────────────────────────────────────

  const onFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    setDataUri("");
    setError(undefined);
    setCopied(false);
    setBusy(true);
    try {
      const result = await toBase64(f);
      setDataUri(result);
    } catch {
      setError("Failed to encode the image. Please try a different file.");
    } finally {
      setBusy(false);
    }
  }, []);

  const onCopy = useCallback(async () => {
    if (!dataUri) return;
    try {
      await navigator.clipboard.writeText(dataUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      textareaRef.current?.select();
    }
  }, [dataUri]);

  const onDownload = useCallback(() => {
    if (!dataUri || !file) return;
    const blob = new Blob([dataUri], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/\.[^.]+$/, "")}-base64.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [dataUri, file]);

  const onReset = useCallback(() => {
    setFile(null);
    setDataUri("");
    setError(undefined);
    setCopied(false);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <MarketingShell>
      <SidebarWrapper>
        <ImageToolsSidebar activeSlug="image-to-base64" />
        <div className="flex-1 min-w-0 overflow-x-hidden bg-[hsl(var(--tool-bg))]">

          {/* ════════════════ HERO ════════════════ */}
          <section className="relative overflow-x-clip px-6 pt-8 pb-5 sm:px-10 sm:pt-10 sm:pb-6 lg:px-14">
            <div className="pointer-events-none absolute -top-24 right-[5%] h-[380px] w-[380px] rounded-full opacity-[0.15] blur-[90px]" style={{ background: "radial-gradient(circle, #F97316, transparent 70%)" }} aria-hidden />

            <div className="relative mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
              <div className="flex-1 space-y-4">
                <span className="inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))" }}>
                  {eyebrow}
                </span>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] font-display text-foreground !leading-[1.15]">
                  Convert <span className="gradient-text">Image to Base64</span><br className="hidden sm:block" />
                  — free, instant.
                </h1>

                <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                  Encode any image to a Base64 data URI you can embed directly in HTML, CSS, or JSON.
                  No uploads, no server — everything runs in your browser.
                </p>

                <TrustBadges badges={TRUST_BADGES} />
              </div>

              {/* Hero illustration — image → code visual */}
              <div className="relative hidden lg:flex lg:w-[340px] shrink-0 items-center justify-center" aria-hidden>
                <div className="relative h-[200px] w-[300px]">
                  {/* Image card */}
                  <div className="absolute left-0 top-2 h-[120px] w-[130px] rounded-xl border border-[hsl(var(--tool-border))] overflow-hidden shadow-lg" style={{ background: "hsl(var(--tool-surface))", animation: "b64-float 5s ease-in-out infinite" }}>
                    <div className="h-full w-full bg-gradient-to-br from-[hsl(var(--primary)/0.12)] to-[hsl(var(--primary)/0.04)] flex items-center justify-center">
                      <FileImage className="h-10 w-10 text-[hsl(var(--primary)/0.4)]" />
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute left-[140px] top-[48px] flex items-center gap-1" style={{ animation: "b64-pulse 2s ease-in-out infinite" }}>
                    <div className="h-px w-8 bg-[hsl(var(--primary)/0.5)]" />
                    <ArrowRight className="h-4 w-4 text-[hsl(var(--primary))]" />
                  </div>
                  {/* Code block */}
                  <div className="absolute right-0 top-0 h-[140px] w-[130px] rounded-xl border border-[hsl(var(--tool-border))] overflow-hidden shadow-lg" style={{ background: "hsl(var(--tool-surface))", animation: "b64-float 5s ease-in-out infinite 0.5s" }}>
                    <div className="p-2.5 font-mono text-[7px] leading-[1.5] text-muted-foreground break-all">
                      <span className="text-[hsl(var(--primary))]">data:</span>image/png;<br />base64,<br />iVBORw0KGg<br />oAAAANSU<br />hEUgAAA<span className="text-[hsl(var(--primary))]">...</span>
                    </div>
                  </div>
                  {/* Size badge */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border border-[hsl(var(--tool-border))] px-3 py-1 text-[9px] font-bold text-muted-foreground" style={{ background: "hsl(var(--tool-surface))" }}>
                    Embed-ready data URI
                  </div>
                </div>
                <style>{`
                  @keyframes b64-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
                  @keyframes b64-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
                  @media (prefers-reduced-motion:reduce) {
                    [style*="b64-float"],[style*="b64-pulse"] { animation:none !important; }
                  }
                `}</style>
              </div>
            </div>
          </section>

          {/* ════════════════ STEP BAR ════════════════ */}
          <div className="px-6 sm:px-10 lg:px-14">
            <div className="mx-auto max-w-6xl flex items-center justify-center gap-0 py-2">
              {[
                { n: 1, label: "Upload image", active: true },
                { n: 2, label: "Base64 output", active: done },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center">
                  {i > 0 && (
                    <div className="mx-3 h-px w-16 sm:w-24" style={{ background: s.active ? "hsl(var(--primary))" : "hsl(var(--tool-border))" }} />
                  )}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors" style={s.active ? { background: "linear-gradient(135deg, #F97316, #F59E0B)", color: "white" } : { background: "hsl(var(--tool-surface-dim))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--tool-border))" }}>{s.n}</span>
                    <span className={cn("text-[11px] font-medium text-center leading-tight max-w-[100px]", s.active ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════════ WORKSPACE ════════════════ */}
          <div className="px-4 py-5 sm:px-8 sm:py-6 lg:px-10">
            <div className="mx-auto max-w-6xl">
              <div className="rounded-2xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] overflow-hidden">
                <div className="grid lg:grid-cols-[1fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-[hsl(var(--tool-border))]">

                  {/* ── LEFT: Upload ── */}
                  <div>
                    <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}>1</span>
                      <span className="text-xs font-semibold text-foreground">Upload image</span>
                      {hasFile && <Badge variant="secondary" className="ml-auto text-[10px]">{file.name}</Badge>}
                    </div>
                    <div className="p-4">
                      <ImageDropzone
                        onFilesSelected={onFiles}
                        accept="image/*"
                        maxSizeMB={50}
                        multiple={false}
                        disabled={busy}
                      />

                      {/* Processing */}
                      {busy && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite" aria-busy="true">
                          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" aria-hidden />
                          Encoding…
                        </div>
                      )}

                      {error && (
                        <Alert variant="destructive" role="alert" aria-live="assertive" className="mt-3">
                          <AlertCircle className="h-4 w-4" aria-hidden />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {/* File info when loaded */}
                      {hasFile && !busy && (
                        <div className="mt-3 rounded-lg p-2.5 border border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground truncate mr-2">{file.name}</span>
                            <span className="font-bold text-foreground shrink-0">{fmtBytes(file.size)}</span>
                          </div>
                          {done && (
                            <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-[hsl(var(--tool-border))]">
                              <span className="text-muted-foreground">Base64 string</span>
                              <span className="font-bold text-foreground">{fmtBytes(dataUri.length)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── RIGHT: Output ── */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                      <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", done ? "text-white" : "text-muted-foreground")} style={done ? { background: "linear-gradient(135deg, #F97316, #F59E0B)" } : { background: "hsl(var(--tool-surface-dim))", border: "1px solid hsl(var(--tool-border))" }}>2</span>
                      <span className="text-xs font-semibold text-foreground">Base64 output</span>
                      {done && <Badge variant="secondary" className="ml-auto text-[10px]">{fmtBytes(dataUri.length)}</Badge>}
                    </div>

                    <div className="flex-1 p-4">
                      {!done && !busy && (
                        <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-3 border border-[hsl(var(--tool-border))]" style={{ background: "hsl(var(--tool-surface-dim))" }}>
                            <Code2 className="h-5 w-5 text-muted-foreground" aria-hidden />
                          </div>
                          <p className="text-xs font-medium text-muted-foreground">Base64 output will appear here</p>
                          <p className="text-[10px] text-muted-foreground/50 mt-1">Upload an image to encode</p>
                        </div>
                      )}

                      {done && (
                        <div className="space-y-3">
                          {/* Success banner */}
                          <div className="flex items-center gap-2.5 rounded-lg p-2.5" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                            <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#10B981" }} aria-hidden />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground">Encoded successfully</p>
                              <p className="text-[10px] text-muted-foreground">{fmtBytes(dataUri.length)} data URI string</p>
                            </div>
                          </div>

                          {/* Textarea */}
                          <Textarea
                            ref={textareaRef}
                            value={dataUri}
                            readOnly
                            rows={8}
                            className="font-mono text-[10px] resize-none bg-[hsl(var(--tool-surface-dim))] text-foreground border-[hsl(var(--tool-border))]"
                            aria-label="Base64 data URI output"
                          />

                          {/* Actions */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={onCopy}
                              className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                            >
                              {copied ? (
                                <><Check className="h-3.5 w-3.5" aria-hidden /> Copied!</>
                              ) : (
                                <><Copy className="h-3.5 w-3.5" aria-hidden /> Copy to clipboard</>
                              )}
                            </button>
                            <Button onClick={onDownload} variant="outline" size="sm" className="w-full text-xs gap-1.5">
                              <Download className="h-3.5 w-3.5" aria-hidden /> Download .txt
                            </Button>
                          </div>

                          <Button onClick={onReset} variant="outline" size="sm" className="w-full text-xs">
                            <RotateCcw className="mr-1.5 h-3 w-3" aria-hidden /> Encode another
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ════════════════ TRUST STRIP ════════════════ */}
          <div className="px-6 py-6 sm:px-10 lg:px-14">
            <div className="mx-auto max-w-6xl">
              <TrustStrip features={TRUST_FEATURES} />
            </div>
          </div>

          {/* ════════════════ AEO CONTENT ════════════════ */}
          <section className="px-6 pb-8 sm:px-10 lg:px-14" aria-labelledby="aeo-b64">
            <div className="mx-auto max-w-6xl grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] p-6">
                <h2 id="aeo-b64" className="text-lg font-bold tracking-tight sm:text-xl font-heading text-foreground mb-3">What is Base64 image encoding?</h2>
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>Base64 encoding converts binary image data into an ASCII text string that can be embedded directly in HTML, CSS, or JSON. The encoded string is prefixed with a data URI scheme (<code className="text-xs">data:image/png;base64,</code>) so browsers render it without an additional HTTP request.</p>
                  <p>Inline Base64 images eliminate one round-trip per asset, reducing page load for small icons and sprites by up to <strong>30%</strong> <span className="text-xs text-muted-foreground/60">[Google Web Fundamentals, 2024]</span>. The trade-off: Base64 inflates file size by ~<strong>33%</strong>, so it&apos;s best for images under 10 KB.</p>
                  <p>Trndinn&apos;s encoder uses the browser&apos;s native FileReader API. Your images never leave your device — encoding happens entirely in-memory.</p>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl p-6" style={{ background: "linear-gradient(135deg, hsl(var(--tool-surface)), hsl(280 60% 15% / 0.4))" }}>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Build with Trndinn</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">Create social media graphics, schedule posts, and grow your brand with AI-powered tools.</p>
                </div>
                <a href="/pricing" className="inline-flex items-center gap-2 self-start rounded-xl px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 transition-all" style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}>
                  Try Trndinn free <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>
          </section>

          {/* ════════════════ FAQ ════════════════ */}
          {tool.faqs.length > 0 && (
            <section className="px-6 pb-8 sm:px-10 lg:px-14" aria-labelledby="faq-b64">
              <div className="mx-auto max-w-6xl">
                <h2 id="faq-b64" className="text-lg font-bold tracking-tight sm:text-xl font-heading mb-3 text-foreground">Frequently asked questions</h2>
                <div className="space-y-1.5">
                  {[...tool.faqs, {
                    question: "When should I use Base64 images instead of regular image files?",
                    answer: "Base64 is ideal for small images (under 10 KB) like icons, logos, and UI sprites where eliminating an HTTP request outweighs the 33% size increase. For larger images, a regular file served from a CDN is more efficient.",
                  }, {
                    question: "Does Base64 encoding reduce image quality?",
                    answer: "No — Base64 is a lossless encoding. It represents the exact same binary data in a text format. The image quality is identical to the original file.",
                  }].map((faq, i) => (
                    <details key={i} className="group rounded-xl border border-[hsl(var(--tool-border))]">
                      <summary className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                        {faq.question}
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden />
                      </summary>
                      <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.answer}</div>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ════════════════ MORE TOOLS ════════════════ */}
          <section className="px-6 pb-10 sm:px-10 lg:px-14" aria-labelledby="more-b64">
            <div className="mx-auto max-w-6xl">
              <div className="flex items-center justify-between mb-3">
                <h2 id="more-b64" className="text-lg font-bold tracking-tight sm:text-xl font-heading text-foreground">More image tools</h2>
                <a href="/tools/image" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--primary))] hover:underline">View all <ArrowRight className="h-3.5 w-3.5" aria-hidden /></a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { slug: "base64-to-image", label: "Base64 to Image", desc: "Decode Base64 to image" },
                  { slug: "compress-jpg", label: "Compress Image", desc: "Reduce file size" },
                  { slug: "image-resizer", label: "Resize Image", desc: "Change dimensions" },
                  { slug: "image-workbench", label: "Image Workbench", desc: "Multi-op pipeline" },
                ].map(t => (
                  <a key={t.slug} href={`/tools/${t.slug}`} className="group flex items-center gap-3 rounded-xl border border-[hsl(var(--tool-border))] bg-[hsl(var(--tool-surface))] p-3 transition-colors hover:border-[hsl(var(--primary)/0.4)]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{t.desc}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-[hsl(var(--primary))] transition-colors" aria-hidden />
                  </a>
                ))}
              </div>
            </div>
          </section>

        </div>
      </SidebarWrapper>
    </MarketingShell>
  );
}
