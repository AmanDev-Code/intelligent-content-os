"use client";

/**
 * ProfilePicCreatorView — Premium redesign of the canvas-based emoji avatar creator.
 *
 * Matches design ref: .design-refs/13.png
 * Layout: MarketingShell + ImageToolsSidebar (sidebar handled externally),
 *   ToolHero, TrustBadges, StepProgressBar, TrustStrip.
 *
 * Shadcn primitives: Card, CardContent, Button, Input, Separator, Slider, Label, Tabs.
 * Design tokens: --tool-bg, --tool-surface, --tool-surface-dim, --tool-border,
 *   --primary, --primary-foreground, --foreground, --muted-foreground.
 * Icons: Lucide only.
 * Processing: Canvas API — purely generative, no upload.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Download,
  RotateCcw,
  Search,
  Zap,
  ShieldCheck,
  Smile,
  ImageIcon,
  Gift,
  Sparkles,
  Monitor,
  ArrowRight,
  Palette,
  CircleDot,
  Square,
  RectangleHorizontal,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar, SidebarWrapper } from "@/views/tools/image-tools/ImageToolsSidebar";
import { ToolHero } from "@/views/tools/shared/ToolHero";
import { StepProgressBar } from "@/views/tools/shared/StepProgressBar";
import { TrustStrip, type TrustFeature } from "@/views/tools/shared/TrustStrip";
import type { TrustBadge } from "@/views/tools/shared/TrustBadges";
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

type Shape = "circle" | "square" | "rounded";

// ---------------------------------------------------------------------------
// Emoji data — 80+ popular emojis grouped by category
// ---------------------------------------------------------------------------

const EMOJI_CATEGORIES = {
  Smileys: [
    "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇",
    "🥰","😍","🤩","😘","😜","😎","🤓","🧐","😏","😒",
  ],
  People: [
    "👋","🤚","🖐️","✋","🤙","👊","✊","🤜","💪","🫶",
    "🙌","👏","🤝","🙏","✌️","🤞","👌","🫰","☝️","🫵",
  ],
  Animals: [
    "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
    "🦁","🐮","🐷","🐸","🐙","🦋","🐝","🦄","🐲","🦖",
  ],
  Objects: [
    "🚀","⭐","🌟","💫","🔥","💥","🌈","☀️","🌊","🌸",
    "💎","🏆","🎯","🎸","🎨","📚","💡","🔬","🎮","🌍",
  ],
  Symbols: [
    "❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","❣️",
    "💕","💞","💓","💗","💖","💘","💝","✨","🔥","⚡",
  ],
  Popular: [
    "😎","🚀","🔥","💎","🦄","🤩","😏","🐱","🎮","🎯",
    "💪","✨","🌊","🎨","☀️","🏆","💡","🌈","⭐","🐶",
  ],
} as const;

type EmojiCategory = keyof typeof EMOJI_CATEGORIES;

const ALL_EMOJIS = Object.values(EMOJI_CATEGORIES).flat();

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

// Popular style presets
const POPULAR_STYLES = [
  { name: "Gradient", emoji: "😎", bg: "linear-gradient(135deg, #f97316, #ec4899)", color: "#f97316" },
  { name: "Neon", emoji: "🤩", bg: "#0f0f23", color: "#06b6d4", glow: true },
  { name: "Glass", emoji: "😜", bg: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))", color: "#8b5cf6" },
  { name: "3D", emoji: "😀", bg: "linear-gradient(135deg, #6366f1, #a855f7)", color: "#a855f7" },
  { name: "Minimal", emoji: "🙂", bg: "#f8fafc", color: "#64748b" },
  { name: "Dark", emoji: "😈", bg: "#0f172a", color: "#1e293b" },
  { name: "Pastel", emoji: "🥰", bg: "linear-gradient(135deg, #fce7f3, #e0e7ff)", color: "#f9a8d4" },
];

// Platform size recommendations
const PLATFORM_SIZES = [
  { icon: "🔗", platform: "LinkedIn", size: "400×400px" },
  { icon: "📷", platform: "Instagram", size: "110×110px" },
  { icon: "𝕏", platform: "Twitter/X", size: "400×400px" },
  { icon: "📘", platform: "Facebook", size: "170×170px" },
  { icon: "🎮", platform: "Discord", size: "128×128px" },
  { icon: "💬", platform: "Slack", size: "512×512px" },
];

// Trust badges for hero
const HERO_BADGES: TrustBadge[] = [
  { icon: Zap, text: "No signup required" },
  { icon: ShieldCheck, text: "No upload needed" },
  { icon: Smile, text: "80+ emojis" },
  { icon: ImageIcon, text: "High quality PNG" },
];

// Trust strip features
const TRUST_FEATURES: TrustFeature[] = [
  { icon: Gift, title: "100% Free", description: "No signup, no limits." },
  { icon: Zap, title: "Instant download", description: "Get high-quality PNG in seconds." },
  { icon: ShieldCheck, title: "No upload needed", description: "Create directly in your browser." },
  { icon: Monitor, title: "Multiple sizes", description: "Perfect for all social media platforms." },
];

// Step definitions
const STEPS = [
  { number: 1, label: "Choose Emoji" },
  { number: 2, label: "Customize" },
  { number: 3, label: "Download" },
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
  } else if (shape === "rounded") {
    const radius = size * 0.15;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
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
  const shouldReduce = useReducedMotion();

  const [emoji, setEmoji] = useState("😎");
  const [bgColor, setBgColor] = useState("#6366f1");
  const [shape, setShape] = useState<Shape>("circle");
  const [size, setSize] = useState(512);
  const [rotation, setRotation] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<EmojiCategory>("Smileys");
  const [activeStep, setActiveStep] = useState(1);

  const eyebrow = alias?.eyebrow ?? "FREE PROFILE PICTURE CREATOR";
  const h1Prefix = alias?.h1Prefix ?? "Profile Picture Creator —";
  const h1Highlight = alias?.h1Highlight ?? "emoji avatar";
  const h1Suffix = alias?.h1Suffix ?? "free PNG download.";
  const heroDescription =
    "Create a unique profile picture using any emoji, choose your style, background, shape, and size. Download a high-quality PNG instantly — no account needed.";

  // Filter emojis based on search and category
  const filteredEmojis = useMemo(() => {
    if (searchQuery.trim()) {
      // Search across all emojis
      return ALL_EMOJIS.filter((e) => e.includes(searchQuery));
    }
    return EMOJI_CATEGORIES[activeCategory] as readonly string[];
  }, [searchQuery, activeCategory]);

  // Update active step based on user interaction
  useEffect(() => {
    if (bgColor !== "#6366f1" || shape !== "circle" || rotation !== 0) {
      setActiveStep(2);
    }
  }, [bgColor, shape, rotation]);

  // Re-render whenever any param changes
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    renderAvatar(preview, emoji, bgColor, shape, 256, rotation);
  }, [emoji, bgColor, shape, rotation]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderAvatar(canvas, emoji, bgColor, shape, size, rotation);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `profile-pic-${size}x${size}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setActiveStep(3);
  }, [emoji, bgColor, shape, size, rotation]);

  const handleReset = useCallback(() => {
    setEmoji("😎");
    setBgColor("#6366f1");
    setShape("circle");
    setSize(512);
    setRotation(0);
    setActiveStep(1);
  }, []);

  const handleSelectEmoji = useCallback((e: string) => {
    setEmoji(e);
    setActiveStep(1);
  }, []);

  const handleApplyStyle = useCallback((style: typeof POPULAR_STYLES[0]) => {
    setEmoji(style.emoji);
    // Use solid color for the style
    setBgColor(style.color);
    setActiveStep(2);
  }, []);

  const MotionDiv = shouldReduce ? "div" : motion.div;
  const motionProps = shouldReduce
    ? {}
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

  return (
    <MarketingShell>
      <SidebarWrapper>
        <ImageToolsSidebar activeSlug="profile-pic-creator" />

        <div className="flex-1 min-w-0">
          <main
            id="main-content"
            className="w-full"
            aria-label="Profile Picture Creator tool"
          >
            {/* Hidden canvas for download rendering at full size */}
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

            {/* ── Premium Hero ── */}
            <ToolHero
              eyebrow={eyebrow}
              h1Prefix={h1Prefix}
              h1Highlight={h1Highlight}
              h1Suffix={h1Suffix}
              description={heroDescription}
              trustBadges={HERO_BADGES}
            >
              {/* 3D Profile Pic Illustration */}
              <div className="relative w-[280px] h-[260px] sm:w-[340px] sm:h-[300px]" aria-hidden="true">
                {/* Glow backdrop */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-30"
                  style={{
                    background: "radial-gradient(circle, rgba(249,115,22,0.35) 0%, rgba(168,85,247,0.15) 50%, transparent 70%)",
                  }}
                />
                {/* Main avatar card */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div
                    className="flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-full border-4 shadow-2xl"
                    style={{
                      borderColor: "hsl(var(--primary))",
                      background: "linear-gradient(135deg, hsl(var(--tool-surface)), hsl(var(--tool-surface-dim)))",
                      animation: "pp-hero-float 5s ease-in-out infinite",
                    }}
                  >
                    <span className="text-6xl sm:text-7xl select-none drop-shadow-lg">😎</span>
                  </div>
                  {/* Size badge below */}
                  <div
                    className="mt-2 rounded-full px-3 py-1 text-[10px] font-bold shadow-md"
                    style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)", color: "white" }}
                  >
                    512 × 512 px
                  </div>
                </div>
                {/* Orbiting mini avatars */}
                {[
                  { emoji: "😍", top: "5%", left: "15%", delay: "0s", size: "text-3xl" },
                  { emoji: "🤩", top: "10%", right: "10%", delay: "0.8s", size: "text-2xl" },
                  { emoji: "😊", bottom: "15%", left: "8%", delay: "1.6s", size: "text-2xl" },
                  { emoji: "🥰", bottom: "10%", right: "15%", delay: "2.4s", size: "text-3xl" },
                ].map((e, i) => (
                  <div
                    key={i}
                    className="absolute flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-[hsl(var(--tool-border))] shadow-lg"
                    style={{
                      background: "hsl(var(--tool-surface))",
                      top: e.top, left: e.left, right: e.right, bottom: e.bottom,
                      animation: `pp-hero-orbit 4s ease-in-out infinite ${e.delay}`,
                    }}
                  >
                    <span className={cn("select-none", e.size)}>{e.emoji}</span>
                  </div>
                ))}
                {/* Feature labels */}
                <div className="absolute -right-2 top-[20%] flex flex-col gap-1.5">
                  {["Custom bg", "Any size", "PNG output"].map((label) => (
                    <span
                      key={label}
                      className="rounded-full px-2.5 py-0.5 text-[9px] font-semibold whitespace-nowrap bg-[hsl(var(--tool-surface))] border border-[hsl(var(--tool-border))] text-foreground/80"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <style>{`
                  @keyframes pp-hero-float { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.03) translateY(-4px)} }
                  @keyframes pp-hero-orbit { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
                  @media (prefers-reduced-motion:reduce) {
                    [style*="pp-hero-float"],[style*="pp-hero-orbit"] { animation:none !important; }
                  }
                `}</style>
              </div>
            </ToolHero>

            {/* Content area */}
            <div className="mx-auto w-full max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8 space-y-8">

              {/* ── Step Progress Bar ── */}
              <StepProgressBar steps={STEPS} activeStep={activeStep} />

              {/* ── Tool Workspace ── */}
              <MotionDiv {...motionProps}>
                <Card
                  className={cn(
                    "overflow-hidden",
                    "bg-[hsl(var(--tool-surface))]",
                    "border-[hsl(var(--tool-border))]"
                  )}
                >
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[hsl(var(--tool-border))]">

                      {/* ── Left: Emoji Picker + Controls ── */}
                      <div className="p-4 sm:p-6 space-y-5">
                        {/* Search bar */}
                        <div className="relative">
                          <Search
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search emoji (e.g. smile, cat, rocket...)"
                            className={cn(
                              "pl-9 h-10",
                              "bg-[hsl(var(--tool-surface-dim))]",
                              "border-[hsl(var(--tool-border))]",
                              "text-foreground placeholder:text-muted-foreground"
                            )}
                            aria-label="Search emojis"
                          />
                        </div>

                        {/* Category tabs */}
                        <div
                          className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none"
                          role="tablist"
                          aria-label="Emoji categories"
                        >
                          {(Object.keys(EMOJI_CATEGORIES) as EmojiCategory[]).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              role="tab"
                              aria-selected={activeCategory === cat && !searchQuery}
                              onClick={() => {
                                setActiveCategory(cat);
                                setSearchQuery("");
                              }}
                              className={cn(
                                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                                activeCategory === cat && !searchQuery
                                  ? "text-[hsl(var(--primary-foreground))] shadow-sm"
                                  : "bg-[hsl(var(--tool-surface-dim))] text-muted-foreground hover:text-foreground"
                              )}
                              style={
                                activeCategory === cat && !searchQuery
                                  ? { background: "linear-gradient(135deg, #F97316, #F59E0B)" }
                                  : undefined
                              }
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Emoji grid */}
                        <div
                          className={cn(
                            "grid grid-cols-8 sm:grid-cols-10 gap-1 rounded-lg p-2 max-h-52 overflow-y-auto",
                            "bg-[hsl(var(--tool-surface-dim))]",
                            "border border-[hsl(var(--tool-border))]"
                          )}
                          role="listbox"
                          aria-label="Emoji picker"
                          aria-activedescendant={`emoji-${emoji}`}
                        >
                          {filteredEmojis.map((e) => (
                            <button
                              key={e}
                              id={`emoji-${e}`}
                              type="button"
                              role="option"
                              aria-selected={emoji === e}
                              onClick={() => handleSelectEmoji(e)}
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-all",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                                emoji === e
                                  ? "ring-2 ring-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.15)] scale-110"
                                  : "hover:bg-[hsl(var(--tool-surface))] hover:scale-105",
                              )}
                              aria-label={`Select ${e} emoji`}
                            >
                              {e}
                            </button>
                          ))}
                          {filteredEmojis.length === 0 && (
                            <p className="col-span-full py-4 text-center text-xs text-muted-foreground">
                              No emojis found for &quot;{searchQuery}&quot;
                            </p>
                          )}
                        </div>

                        <Separator className="bg-[hsl(var(--tool-border))]" />

                        {/* Background color */}
                        <div className="space-y-2.5">
                          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Background Color
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
                                  "h-8 w-8 rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                                  bgColor === color
                                    ? "scale-125 border-foreground shadow-lg"
                                    : "border-transparent hover:scale-110",
                                )}
                                style={{ backgroundColor: color }}
                                aria-label={`Set background to ${color}`}
                                aria-pressed={bgColor === color}
                              />
                            ))}
                            {/* Custom color picker */}
                            <label
                              className={cn(
                                "relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full",
                                "border border-[hsl(var(--tool-border))]",
                                "bg-[hsl(var(--tool-surface-dim))]",
                                "hover:border-[hsl(var(--primary)/0.3)] transition-colors"
                              )}
                              aria-label="Custom color"
                            >
                              <Palette className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                              <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                aria-label="Custom background color picker"
                              />
                            </label>
                          </div>
                        </div>

                        <Separator className="bg-[hsl(var(--tool-border))]" />

                        {/* Shape */}
                        <div className="space-y-2.5">
                          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Shape
                          </Label>
                          <div
                            className="flex gap-2"
                            role="radiogroup"
                            aria-label="Avatar shape"
                          >
                            {([
                              { value: "circle" as Shape, label: "Circle", icon: CircleDot },
                              { value: "square" as Shape, label: "Square", icon: Square },
                              { value: "rounded" as Shape, label: "Rounded", icon: RectangleHorizontal },
                            ]).map((s) => (
                              <button
                                key={s.value}
                                type="button"
                                role="radio"
                                aria-checked={shape === s.value}
                                onClick={() => setShape(s.value)}
                                className={cn(
                                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                                  shape === s.value
                                    ? "text-[hsl(var(--primary-foreground))] shadow-md"
                                    : "bg-[hsl(var(--tool-surface-dim))] text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--tool-surface))]",
                                )}
                                style={
                                  shape === s.value
                                    ? { background: "linear-gradient(135deg, #F97316, #F59E0B)" }
                                    : undefined
                                }
                              >
                                <s.icon className="h-4 w-4" aria-hidden="true" />
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Size slider */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              Output size
                            </Label>
                            <span className="text-xs font-semibold text-foreground">
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
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>64px</span>
                            <span>256px</span>
                            <span>512px</span>
                          </div>
                        </div>

                        {/* Rotation */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              Rotation
                            </Label>
                            <span className="text-xs font-semibold text-foreground">{rotation}°</span>
                          </div>
                          <Slider
                            value={[rotation]}
                            onValueChange={([v]) => setRotation(v)}
                            min={-45}
                            max={45}
                            step={5}
                            aria-label={`Emoji rotation: ${rotation} degrees`}
                          />
                        </div>

                        {/* Reset */}
                        <Button
                          onClick={handleReset}
                          variant="outline"
                          size="sm"
                          className="gap-2 border-[hsl(var(--tool-border))] text-muted-foreground hover:text-foreground"
                          aria-label="Reset to defaults"
                        >
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                          Reset to defaults
                        </Button>
                      </div>

                      {/* ── Right: Live Preview + Download ── */}
                      <div className="p-4 sm:p-6 space-y-5">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <h2 className="text-base font-semibold text-foreground">Live Preview</h2>
                          <span className="rounded-md bg-[hsl(var(--tool-surface-dim))] px-2.5 py-1 text-xs font-mono text-muted-foreground">
                            {size} × {size}px
                          </span>
                        </div>

                        {/* Preview canvas */}
                        <div
                          className={cn(
                            "flex items-center justify-center rounded-xl p-8",
                            "bg-[hsl(var(--tool-surface-dim))]",
                            "border border-[hsl(var(--tool-border))]"
                          )}
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

                        {/* Emoji strip — quick emoji selector */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {["😎","😊","😜","😍","🤩","😏","🥰","🤓"].map((e) => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => handleSelectEmoji(e)}
                              className={cn(
                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-all",
                                "border border-[hsl(var(--tool-border))]",
                                "bg-[hsl(var(--tool-surface-dim))]",
                                "hover:border-[hsl(var(--primary)/0.4)] hover:scale-105",
                                emoji === e && "ring-2 ring-[hsl(var(--primary))] border-[hsl(var(--primary))]"
                              )}
                              aria-label={`Quick select ${e}`}
                            >
                              {e}
                            </button>
                          ))}
                        </div>

                        {/* Platform size table */}
                        <div
                          className={cn(
                            "rounded-xl p-4",
                            "bg-[hsl(var(--tool-surface-dim))]",
                            "border border-[hsl(var(--tool-border))]"
                          )}
                        >
                          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Recommended sizes by platform
                          </p>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            {PLATFORM_SIZES.map(({ icon, platform, size: rec }) => (
                              <div
                                key={platform}
                                className="flex items-center justify-between gap-2 text-xs"
                              >
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <span aria-hidden="true">{icon}</span>
                                  {platform}
                                </span>
                                <span className="font-medium text-foreground">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Download CTA */}
                        <button
                          onClick={handleDownload}
                          className={cn(
                            "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white transition-all",
                            "hover:opacity-90 active:scale-[0.98]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                            "shadow-lg"
                          )}
                          style={{
                            background: "linear-gradient(135deg, #F97316, #F59E0B)",
                          }}
                          aria-label={`Download profile picture as ${size}×${size}px PNG`}
                        >
                          <Download className="h-5 w-5" aria-hidden="true" />
                          Download {size}×{size}px PNG
                        </button>
                        <p className="text-center text-xs text-muted-foreground">
                          No watermark. No signup. Unlimited downloads.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </MotionDiv>

              {/* ── Popular Styles ── */}
              <MotionDiv
                {...(shouldReduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.1 } })}
              >
                <section aria-labelledby="popular-styles-heading" className="space-y-4">
                  <div>
                    <h2
                      id="popular-styles-heading"
                      className="text-xl font-bold text-foreground font-display sm:text-2xl"
                    >
                      Popular Styles
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Turn the same emoji into different vibe avatars.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {POPULAR_STYLES.map((style) => (
                      <button
                        key={style.name}
                        type="button"
                        onClick={() => handleApplyStyle(style)}
                        className={cn(
                          "group flex flex-col items-center gap-2 rounded-xl p-3 transition-all",
                          "bg-[hsl(var(--tool-surface))]",
                          "border border-[hsl(var(--tool-border))]",
                          "hover:border-[hsl(var(--primary)/0.4)] hover:shadow-lg hover:scale-105",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                        )}
                        aria-label={`Apply ${style.name} style`}
                      >
                        <div
                          className="flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-md"
                          style={{ background: style.bg || style.color }}
                        >
                          {style.emoji}
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                          {style.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </MotionDiv>

              {/* ── Trust Strip ── */}
              <MotionDiv
                {...(shouldReduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.2 } })}
              >
                <TrustStrip features={TRUST_FEATURES} />
              </MotionDiv>

              {/* ── AEO: What is a Profile Picture? ── */}
              <MotionDiv
                {...(shouldReduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.25 } })}
              >
                <section
                  aria-labelledby="what-is-pfp-heading"
                  className="rounded-xl border p-6"
                  style={{
                    background: "hsl(var(--tool-surface))",
                    borderColor: "hsl(var(--tool-border))",
                  }}
                >
                  <h2 id="what-is-pfp-heading" className="text-lg font-bold text-foreground mb-4">
                    What is a profile picture creator?
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                    A profile picture creator is a tool that generates custom avatars for social media accounts without requiring photo uploads or design skills. Trndinn&apos;s Profile Picture Creator turns any emoji into a polished, high-resolution PNG avatar with customizable backgrounds, shapes, and styles — entirely in your browser. No signup, no photo upload needed.
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                    Profile pictures are the single most-viewed element of any social media profile. LinkedIn profiles with a professional photo get 14× more views than those without [LinkedIn, 2024]. Each platform has specific size requirements: LinkedIn needs 400×400px, Instagram uses 110×110px (displayed) but stores 320×320px, Twitter/X recommends 400×400px, and Discord uses 128×128px.
                  </p>
                  <h3 className="text-base font-semibold text-foreground mt-6 mb-3">Frequently asked questions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">How do I create a free profile picture?</h4>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Pick an emoji, choose a background color and shape (circle, square, or rounded), then click Download. Trndinn generates a 512×512px PNG instantly — no account needed.</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">What size should my profile picture be?</h4>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">LinkedIn: 400×400px. Instagram: 110×110px (displayed). Twitter/X: 400×400px. Facebook: 170×170px. Discord: 128×128px. Slack: 512×512px. Trndinn outputs 512×512px which works perfectly on all platforms.</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Can I use an emoji as my LinkedIn profile picture?</h4>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Yes — emoji avatars are increasingly popular for personal branding, anonymous accounts, and placeholder profiles. Apply a professional gradient or glass style for a polished look that stands out in the feed.</p>
                    </div>
                  </div>
                </section>
              </MotionDiv>

              {/* ── Need more? CTA ── */}
              <MotionDiv
                {...(shouldReduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.3 } })}
              >
                <section
                  aria-label="Try Trndinn"
                  className="flex flex-col gap-6 rounded-xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 border"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--tool-surface)) 0%, hsl(var(--tool-surface-dim)) 100%)",
                    borderColor: "hsl(var(--tool-border))",
                  }}
                >
                  <div className="max-w-md">
                    <h2 className="text-xl font-bold text-foreground sm:text-2xl">Need more?</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Create social media graphics, OG images, and branded assets with AI.</p>
                    <div className="mt-5">
                      <a href="/features" className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all" style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}>
                        Try Trndinn <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </section>
              </MotionDiv>

              {/* ── More tools ── */}
              <MotionDiv
                {...(shouldReduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.35 } })}
              >
                <section aria-label="Related tools">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">More image tools you&apos;ll love</h2>
                    <a href="/tools/image" className="text-xs font-medium text-[hsl(var(--primary))] hover:underline flex items-center gap-1">View all tools <ArrowRight className="h-3 w-3" aria-hidden="true" /></a>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { name: "Remove Background", desc: "AI background removal", href: "/tools/background-remover" },
                      { name: "QR Code Generator", desc: "Custom colors, PNG & SVG", href: "/tools/qr-code-generator" },
                      { name: "Favicon Generator", desc: "All sizes in one ZIP", href: "/tools/favicon-generator" },
                      { name: "Image Resizer", desc: "Resize for any platform", href: "/tools/resize-image" },
                    ].map((t) => (
                      <a key={t.name} href={t.href} className="rounded-xl border p-4 hover:border-[hsl(var(--primary)/0.3)] transition-colors group" style={{ background: "hsl(var(--tool-surface))", borderColor: "hsl(var(--tool-border))" }}>
                        <p className="text-sm font-semibold text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                      </a>
                    ))}
                  </div>
                </section>
              </MotionDiv>

              {/* ── SEO footer ── */}
              <Separator className="bg-[hsl(var(--tool-border))]" />
              <p className="text-xs leading-relaxed text-muted-foreground/70">
                Trndinn&apos;s Profile Picture Creator is a free, browser-based tool. All
                processing happens locally on your device — no files are uploaded to any
                server. No signup, no watermark, no usage limit.
              </p>
            </div>
          </main>
        </div>
      </SidebarWrapper>
    </MarketingShell>
  );
}
