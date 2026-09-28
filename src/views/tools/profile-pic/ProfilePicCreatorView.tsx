"use client";

/**
 * ProfilePicCreatorView — canvas-based emoji avatar creator.
 *
 * Shadcn primitives: Card, CardContent, CardHeader, Button,
 *   Separator, Slider, Label.
 * Design tokens: --background, --foreground, --card, --card-foreground,
 *   --muted, --muted-foreground, --primary, --primary-foreground,
 *   --border, --ring.
 * Icons: Lucide only.
 * Processing: Canvas API — purely generative, no upload.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Download,
  RotateCcw,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ImageToolsShell } from "@/views/tools/image-tools/ImageToolsShell";
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

type Shape = "circle" | "square";

// ---------------------------------------------------------------------------
// Emoji grid — 80+ popular emojis grouped by category
// ---------------------------------------------------------------------------

const EMOJIS = [
  // Faces
  "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇",
  "🥰","😍","🤩","😘","😜","😎","🤓","🧐","😏","😒",
  // Gestures & people
  "👋","🤚","🖐️","✋","🤙","👊","✊","🤜","💪","🫶",
  "🙌","👏","🤝","🙏","✌️","🤞","👌","🫰","☝️","🫵",
  // Animals
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
  "🦁","🐮","🐷","🐸","🐙","🦋","🐝","🦄","🐲","🦖",
  // Food & drink
  "🍎","🍊","🍋","🍇","🍓","🫐","🍑","🍍","🥑","🌽",
  "🍕","🍔","🍜","🍣","🧁","🎂","🍩","🧇","☕","🧃",
  // Objects
  "🚀","⭐","🌟","💫","🔥","💥","🌈","☀️","🌊","🌸",
  "💎","🏆","🎯","🎸","🎨","📚","💡","🔬","🎮","🌍",
] as const;

// Preset background colors
const BG_PRESETS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#1e293b", // slate-900
  "#ffffff", // white
  "#f1f5f9", // slate-100
];

// ---------------------------------------------------------------------------
// Canvas rendering
// ---------------------------------------------------------------------------

function renderAvatar(
  canvas: HTMLCanvasElement,
  emoji: string,
  bgColor: string,
  shape: Shape,
  size: number,
  rotation: number
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;

  ctx.clearRect(0, 0, size, size);

  // Background
  ctx.save();
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.clip();
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
  }

  // Emoji — draw centered with rotation
  ctx.translate(size / 2, size / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.font = `${Math.round(size * 0.6)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, 0, 0);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProfilePicCreatorView({ tool, alias }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const [emoji, setEmoji] = useState("😀");
  const [bgColor, setBgColor] = useState("#6366f1");
  const [shape, setShape] = useState<Shape>("circle");
  const [size, setSize] = useState(512);
  const [rotation, setRotation] = useState(0);

  const eyebrow = alias?.eyebrow ?? "Free Profile Picture Creator — emoji avatar, no upload";
  const h1Prefix = alias?.h1Prefix ?? "Profile Picture Creator";
  const h1Highlight = alias?.h1Highlight ?? "— emoji avatar";
  const h1Suffix = alias?.h1Suffix ?? "free PNG download.";
  const heroSubline = alias?.heroSubline ?? tool.description;

  // Re-render whenever any param changes
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    // Preview is always rendered at 256px for display
    renderAvatar(preview, emoji, bgColor, shape, 256, rotation);
  }, [emoji, bgColor, shape, rotation]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Render at chosen size for download
    renderAvatar(canvas, emoji, bgColor, shape, size, rotation);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `profile-pic-${size}x${size}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [emoji, bgColor, shape, size, rotation]);

  const handleReset = useCallback(() => {
    setEmoji("😀");
    setBgColor("#6366f1");
    setShape("circle");
    setSize(512);
    setRotation(0);
  }, []);

  return (
    <ImageToolsShell
      slug="profile-pic-creator"
      toolName="Profile Picture Creator"
      h1Prefix={h1Prefix}
      h1Highlight={h1Highlight}
      h1Suffix={h1Suffix}
      eyebrow={eyebrow}
      heroSubline={heroSubline}
      whyText="A unique profile picture helps you stand out on LinkedIn, Twitter, Discord, and Slack. This tool lets you create a colorful emoji avatar in seconds — pick an emoji, choose a background, and download at any size. Everything runs in your browser."
      faqs={tool.faqs}
    >
      {/* ----------------------------------------------------------------
          Tool UI — two-column on lg
      ---------------------------------------------------------------- */}
      <section aria-label="Profile picture creator tool">
        {/* Hidden canvas for download rendering at full size */}
        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Controls */}
            <Card className="p-4 sm:p-6">
              <CardHeader className="px-0 pt-0 pb-4">
                <h2 className="text-base font-semibold text-foreground">Customize</h2>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-5">
                {/* Emoji picker */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Choose emoji
                  </Label>
                  <div
                    className="grid grid-cols-10 gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-2 max-h-40 overflow-y-auto"
                    role="listbox"
                    aria-label="Emoji picker"
                    aria-activedescendant={`emoji-${emoji}`}
                  >
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        id={`emoji-${e}`}
                        type="button"
                        role="option"
                        aria-selected={emoji === e}
                        onClick={() => setEmoji(e)}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded text-lg transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                          emoji === e
                            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                            : "hover:bg-[hsl(var(--accent))]",
                        )}
                        aria-label={`Select ${e} emoji`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selected: <span className="text-lg leading-none">{emoji}</span>
                  </p>
                </div>

                <Separator />

                {/* Background color */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Background color
                  </Label>
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Background color presets"
                  >
                    {BG_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBgColor(color)}
                        className={cn(
                          "h-7 w-7 rounded-full border-2 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                          bgColor === color
                            ? "scale-125 border-[hsl(var(--foreground))]"
                            : "border-transparent hover:scale-110",
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={`Set background to ${color}`}
                        aria-pressed={bgColor === color}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border border-[hsl(var(--border))] bg-transparent p-0.5"
                      aria-label="Custom background color"
                    />
                    <span className="font-mono text-xs text-muted-foreground">{bgColor}</span>
                  </div>
                </div>

                <Separator />

                {/* Shape */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Shape
                  </Label>
                  <div
                    className="flex gap-2"
                    role="radiogroup"
                    aria-label="Avatar shape"
                  >
                    {(["circle", "square"] as Shape[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={shape === s}
                        onClick={() => setShape(s)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                          shape === s
                            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                            : "bg-[hsl(var(--muted))] text-muted-foreground hover:bg-[hsl(var(--accent))] hover:text-foreground",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Size */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Output size
                    </Label>
                    <span className="text-xs font-medium text-foreground">
                      {size}×{size}px
                    </span>
                  </div>
                  <Slider
                    value={[size]}
                    onValueChange={([v]) => setSize(v)}
                    min={64}
                    max={512}
                    step={64}
                    aria-label={`Output size: ${size}×${size}px`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>64px</span>
                    <span>512px</span>
                  </div>
                </div>

                <Separator />

                {/* Rotation */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Emoji rotation
                    </Label>
                    <span className="text-xs font-medium text-foreground">{rotation}°</span>
                  </div>
                  <Slider
                    value={[rotation]}
                    onValueChange={([v]) => setRotation(v)}
                    min={-45}
                    max={45}
                    step={5}
                    aria-label={`Emoji rotation: ${rotation} degrees`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>-45°</span>
                    <span>0°</span>
                    <span>+45°</span>
                  </div>
                </div>

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

            {/* Preview + Download */}
            <Card className="p-4 sm:p-6">
              <CardHeader className="px-0 pt-0 pb-4">
                <h2 className="text-base font-semibold text-foreground">Preview</h2>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-5">
                {/* Live preview canvas */}
                <div
                  className="flex items-center justify-center rounded-lg bg-[hsl(var(--muted))] p-6"
                  role="img"
                  aria-label={`Profile picture preview: ${emoji} emoji on ${bgColor} ${shape} background`}
                >
                  <canvas
                    ref={previewRef}
                    width={256}
                    height={256}
                    className="rounded"
                    aria-hidden="true"
                  />
                </div>

                {/* Platform size hints */}
                <div className="rounded-lg bg-[hsl(var(--muted))] p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Recommended sizes by platform
                  </p>
                  <ul className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    {[
                      ["LinkedIn", "400×400px"],
                      ["Twitter/X", "400×400px"],
                      ["Facebook", "170×170px"],
                      ["Instagram", "110×110px"],
                      ["Discord", "128×128px"],
                      ["Slack", "512×512px"],
                    ].map(([platform, rec]) => (
                      <li key={platform} className="flex justify-between gap-1">
                        <span>{platform}</span>
                        <span className="font-medium text-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Download */}
                <div className="space-y-2">
                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="w-full gap-2 font-semibold"
                    aria-label={`Download profile picture as ${size}×${size}px PNG`}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download {size}×{size}px PNG
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    No watermark. No signup. Unlimited downloads.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </ImageToolsShell>
  );
}
