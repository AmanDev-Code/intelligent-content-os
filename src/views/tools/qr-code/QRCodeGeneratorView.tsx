"use client";

/**
 * QRCodeGeneratorView — premium redesign matching reference image 17.
 *
 * Layout: MarketingShell + ImageToolsSidebar (sidebar handled externally).
 * Premium hero with ToolHero, TrustBadges, StepProgressBar, TrustStrip.
 * Content type tabs, Customize Design panel, Live Preview, Popular Use Cases.
 *
 * Shadcn primitives: Card, CardContent, Button, Slider, Label,
 *   Alert, AlertDescription, Separator, Tabs, TabsList, TabsTrigger, TabsContent.
 * Design tokens: --tool-bg, --tool-surface, --tool-surface-dim, --tool-border,
 *   --primary, --primary-foreground, --foreground, --muted-foreground.
 * Icons: Lucide only.
 * Processing: qrcode npm package — fully client-side, no upload.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Zap,
  Shield,
  Globe,
  FileImage,
  Link2,
  FileText,
  Contact,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  Sparkles,
  Palette,
  Lock,
  MonitorSmartphone,
  QrCode,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar, SidebarWrapper } from "@/views/tools/image-tools/ImageToolsSidebar";
import { ToolHero } from "@/views/tools/shared/ToolHero";
import { StepProgressBar, type Step } from "@/views/tools/shared/StepProgressBar";
import { TrustStrip, type TrustFeature } from "@/views/tools/shared/TrustStrip";
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

type EccLevel = "L" | "M" | "Q" | "H";
type ContentType = "url" | "text" | "contact" | "wifi" | "email" | "phone" | "sms" | "whatsapp";

const CONTENT_TYPES: { id: ContentType; label: string; icon: typeof Link2 }[] = [
  { id: "url", label: "URL", icon: Link2 },
  { id: "text", label: "Text", icon: FileText },
  { id: "contact", label: "Contact", icon: Contact },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "email", label: "Email", icon: Mail },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
];

const FG_SWATCHES = ["#F97316", "#8B5CF6", "#06B6D4", "#3B82F6", "#EC4899", "#000000"];
const BG_SWATCHES = ["#1E293B", "#3B82F6", "#EC4899", "#10B981", "#FFFFFF"];

const STEPS: Step[] = [
  { number: 1, label: "Enter content" },
  { number: 2, label: "Customize" },
  { number: 3, label: "Download" },
];

const TRUST_FEATURES: TrustFeature[] = [
  { icon: Zap, title: "Instant generation", description: "Create QR codes in seconds." },
  { icon: Shield, title: "100% private", description: "Everything runs in your browser." },
  { icon: Palette, title: "Fully customizable", description: "Colors, error correction, and more." },
  { icon: MonitorSmartphone, title: "Multiple formats", description: "Download as PNG or vector SVG." },
];

const POPULAR_USE_CASES = [
  { icon: Globe, label: "Website" },
  { icon: FileText, label: "Text" },
  { icon: Contact, label: "Contact" },
  { icon: Wifi, label: "Wi-Fi" },
  { icon: Mail, label: "Email" },
  { icon: Phone, label: "Phone" },
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: MessageSquare, label: "Social Media" },
];

// ---------------------------------------------------------------------------
// 3D Illustration component
// ---------------------------------------------------------------------------

function QRIllustration() {
  const shouldReduce = useReducedMotion();

  const labels = ["Links", "Text", "Contact", "Wi-Fi", "Email", "WhatsApp"];

  return (
    <div className="relative w-[320px] h-[280px] select-none" aria-hidden="true">
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3), transparent 70%)",
        }}
      />

      {/* QR Code card */}
      <motion.div
        initial={{ y: 0 }}
        animate={
          shouldReduce
            ? { y: 0 }
            : {
                y: [-8, 8, -8],
                transition: { repeat: Infinity, duration: 4, ease: "easeInOut" },
              }
        }
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className="flex h-[160px] w-[160px] items-center justify-center rounded-2xl border shadow-2xl"
          style={{
            background: "hsl(var(--tool-surface))",
            borderColor: "hsl(var(--tool-border))",
            boxShadow: "0 0 40px hsl(var(--primary) / 0.15)",
          }}
        >
          <QrCode className="h-24 w-24 text-[hsl(var(--primary))]" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Floating labels */}
      {labels.map((label, i) => {
        const angle = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
        const rx = 140;
        const ry = 120;
        const x = Math.cos(angle) * rx;
        const y = Math.sin(angle) * ry;

        return (
          <motion.div
            key={label}
            className="absolute left-1/2 top-1/2"
            style={{ x: x - 32, y: y - 12 }}
            initial={shouldReduce ? {} : { opacity: 0, scale: 0.8 }}
            animate={shouldReduce ? {} : { opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
          >
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-lg"
              style={{
                background: "hsl(var(--tool-surface))",
                border: "1px solid hsl(var(--tool-border))",
                color: "hsl(var(--foreground))",
              }}
            >
              {label}
            </span>
          </motion.div>
        );
      })}

      {/* Handwritten label */}
      <motion.p
        className="absolute -top-2 right-0 text-sm italic text-muted-foreground/60 font-display -rotate-6"
        initial={shouldReduce ? {} : { opacity: 0 }}
        animate={shouldReduce ? {} : { opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        Turn anything
        <br />
        into a QR code
      </motion.p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function QRCodeGeneratorView({ tool, alias }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Core QR state
  const [text, setText] = useState("https://trndinn.com");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [eccLevel, setEccLevel] = useState<EccLevel>("M");
  const [margin, setMargin] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  // UI state
  const [contentType, setContentType] = useState<ContentType>("url");
  const [activeStep, setActiveStep] = useState(1);

  const eyebrow = alias?.eyebrow ?? "FREE QR CODE GENERATOR — CUSTOM COLORS, PNG & SVG";
  const h1Prefix = alias?.h1Prefix ?? "QR Code Generator —";
  const h1Highlight = alias?.h1Highlight ?? "custom colors";
  const h1Suffix = alias?.h1Suffix ?? "free PNG & SVG.";
  const heroDescription =
    "Create QR codes for any URL, text, or contact info. Customize colors, add a logo, adjust error correction level, and download as high-resolution PNG or vector SVG — no signup, no watermark.";

  const trustBadges = [
    { icon: Zap, text: "No signup required" },
    { icon: Shield, text: "100% private" },
    { icon: Globe, text: "Runs in browser" },
    { icon: FileImage, text: "PNG & SVG download" },
  ];

  // Compute active step based on state
  useEffect(() => {
    if (hasGenerated) {
      setActiveStep(3);
    } else if (fgColor !== "#000000" || bgColor !== "#ffffff") {
      setActiveStep(2);
    } else {
      setActiveStep(1);
    }
  }, [hasGenerated, fgColor, bgColor]);

  // Auto-generate on input change (debounced via useEffect)
  useEffect(() => {
    if (!text.trim()) {
      setHasGenerated(false);
      return;
    }
    const timer = setTimeout(() => {
      void generateQR();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fgColor, bgColor, eccLevel, margin]);

  const generateQR = useCallback(async () => {
    if (!text.trim() || !canvasRef.current) return;
    setError("");
    setIsGenerating(true);
    try {
      const QRCode = (await import("qrcode")).default;
      await QRCode.toCanvas(canvasRef.current, text.trim(), {
        width: 400,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: eccLevel,
        margin,
      });
      setHasGenerated(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate QR code. Check your input and try again."
      );
      setHasGenerated(false);
    } finally {
      setIsGenerating(false);
    }
  }, [text, fgColor, bgColor, eccLevel, margin]);

  const handleDownloadPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const handleDownloadSvg = useCallback(async () => {
    if (!text.trim()) return;
    try {
      const QRCode = (await import("qrcode")).default;
      const svgString = await QRCode.toString(text.trim(), {
        type: "svg",
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: eccLevel,
        margin,
      });
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.svg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SVG download failed.");
    }
  }, [text, fgColor, bgColor, eccLevel, margin]);

  const handleReset = useCallback(() => {
    setText("https://trndinn.com");
    setFgColor("#000000");
    setBgColor("#ffffff");
    setEccLevel("M");
    setMargin(4);
    setError("");
    setHasGenerated(false);
    setContentType("url");
  }, []);

  // Generate content-type placeholders
  const getPlaceholder = (type: ContentType) => {
    switch (type) {
      case "url": return "https://trndinn.com";
      case "text": return "Enter your text here...";
      case "contact": return "BEGIN:VCARD\nVERSION:3.0\nN:Doe;John\nTEL:+1234567890\nEND:VCARD";
      case "wifi": return "WIFI:T:WPA;S:NetworkName;P:Password;;";
      case "email": return "mailto:hello@trndinn.com";
      case "phone": return "tel:+1234567890";
      case "sms": return "sms:+1234567890?body=Hello";
      case "whatsapp": return "https://wa.me/1234567890";
    }
  };

  const getInputLabel = (type: ContentType) => {
    switch (type) {
      case "url": return "URL or Link";
      case "text": return "Your Text";
      case "contact": return "vCard Data";
      case "wifi": return "Wi-Fi Network String";
      case "email": return "Email Address";
      case "phone": return "Phone Number";
      case "sms": return "SMS Number & Message";
      case "whatsapp": return "WhatsApp Number";
    }
  };

  return (
    <MarketingShell>
      <SidebarWrapper>
        {/* Sidebar */}
        <ImageToolsSidebar activeSlug="qr-code-generator" />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <main
            id="main-content"
            className="w-full"
            style={{ background: "hsl(var(--tool-bg))" }}
            aria-label="QR Code Generator tool"
          >
            {/* ─── Premium Hero ─── */}
            <ToolHero
              eyebrow={eyebrow}
              h1Prefix={h1Prefix}
              h1Highlight={h1Highlight}
              h1Suffix={h1Suffix}
              description={heroDescription}
              trustBadges={trustBadges}
            >
              <QRIllustration />
            </ToolHero>

            {/* ─── Step Progress Bar ─── */}
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <StepProgressBar
                steps={STEPS}
                activeStep={activeStep}
                className="py-6"
              />
            </div>

            {/* ─── Tool Workspace ─── */}
            <section
              aria-label="QR code generator workspace"
              className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-6 lg:px-8"
            >
              <div
                className="rounded-2xl border p-4 sm:p-6 lg:p-8"
                style={{
                  background: "hsl(var(--tool-surface))",
                  borderColor: "hsl(var(--tool-border))",
                }}
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
                  {/* ── Left column: Content + Customize ── */}
                  <div className="space-y-6">
                    {/* Content Type Tabs */}
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Content type">
                        {CONTENT_TYPES.map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            role="tab"
                            aria-selected={contentType === id}
                            onClick={() => {
                              setContentType(id);
                              setText(getPlaceholder(id));
                            }}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                              contentType === id
                                ? "text-white shadow-md"
                                : "border text-muted-foreground hover:text-foreground"
                            )}
                            style={
                              contentType === id
                                ? { background: "linear-gradient(135deg, #F97316, #F59E0B)" }
                                : { borderColor: "hsl(var(--tool-border))", background: "hsl(var(--tool-surface-dim))" }
                            }
                          >
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Input field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="qr-text"
                          className="text-sm font-medium text-foreground"
                        >
                          {getInputLabel(contentType)}
                        </Label>
                        <div className="relative">
                          {contentType === "url" && (
                            <Link2
                              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                              aria-hidden="true"
                            />
                          )}
                          <input
                            id="qr-text"
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={getPlaceholder(contentType)}
                            className={cn(
                              "w-full rounded-lg border py-3 text-sm text-foreground placeholder:text-muted-foreground",
                              "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-1",
                              contentType === "url" ? "pl-10 pr-4" : "px-4"
                            )}
                            style={{
                              borderColor: "hsl(var(--tool-border))",
                              background: "hsl(var(--tool-surface-dim))",
                            }}
                            aria-describedby="qr-text-hint"
                          />
                        </div>
                        <p id="qr-text-hint" className="text-xs text-muted-foreground">
                          {contentType === "url"
                            ? "Enter a URL to create a QR code. e.g. https://trndinn.com"
                            : `Enter ${contentType} content to encode in your QR code.`}
                        </p>
                      </div>
                    </div>

                    <Separator style={{ background: "hsl(var(--tool-border))" }} />

                    {/* Customize Design / Add Logo / Advanced tabs */}
                    <Tabs defaultValue="customize" className="w-full">
                      <TabsList
                        className="w-full justify-start gap-0 rounded-lg p-1"
                        style={{ background: "hsl(var(--tool-surface-dim))" }}
                      >
                        <TabsTrigger
                          value="customize"
                          className="flex-1 gap-1.5 rounded-md text-sm data-[state=active]:bg-[hsl(var(--tool-surface))] data-[state=active]:shadow-sm"
                        >
                          <Palette className="h-3.5 w-3.5" aria-hidden="true" />
                          Customize Design
                        </TabsTrigger>
                        <TabsTrigger
                          value="logo"
                          className="flex-1 gap-1.5 rounded-md text-sm data-[state=active]:bg-[hsl(var(--tool-surface))] data-[state=active]:shadow-sm"
                        >
                          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                          Add Logo
                          <span
                            className="ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase text-white"
                            style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                          >
                            PRO
                          </span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="advanced"
                          className="flex-1 rounded-md text-sm data-[state=active]:bg-[hsl(var(--tool-surface))] data-[state=active]:shadow-sm"
                        >
                          Advanced
                        </TabsTrigger>
                      </TabsList>

                      {/* ── Customize Design tab ── */}
                      <TabsContent value="customize" className="mt-4 space-y-5">
                        {/* Colors row */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          {/* Foreground Color */}
                          <div className="space-y-2.5">
                            <Label className="text-xs font-semibold text-muted-foreground">
                              Foreground Color
                            </Label>
                            <div className="flex items-center gap-2">
                              {FG_SWATCHES.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setFgColor(c)}
                                  className={cn(
                                    "h-7 w-7 rounded-full border-2 transition-all",
                                    fgColor === c
                                      ? "border-white ring-2 ring-[hsl(var(--primary))] scale-110"
                                      : "border-transparent hover:scale-105"
                                  )}
                                  style={{ background: c }}
                                  aria-label={`Foreground color ${c}`}
                                />
                              ))}
                              <div className="flex items-center gap-1.5 ml-1">
                                <input
                                  type="color"
                                  value={fgColor}
                                  onChange={(e) => setFgColor(e.target.value)}
                                  className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                                  aria-label="Custom foreground color"
                                />
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  {fgColor}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Background Color */}
                          <div className="space-y-2.5">
                            <Label className="text-xs font-semibold text-muted-foreground">
                              Background Color
                            </Label>
                            <div className="flex items-center gap-2">
                              {BG_SWATCHES.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setBgColor(c)}
                                  className={cn(
                                    "h-7 w-7 rounded-full border-2 transition-all",
                                    bgColor === c
                                      ? "border-white ring-2 ring-[hsl(var(--primary))] scale-110"
                                      : "border-transparent hover:scale-105",
                                    c === "#FFFFFF" && "border-[hsl(var(--tool-border))]"
                                  )}
                                  style={{ background: c }}
                                  aria-label={`Background color ${c}`}
                                />
                              ))}
                              <div className="flex items-center gap-1.5 ml-1">
                                <input
                                  type="color"
                                  value={bgColor}
                                  onChange={(e) => setBgColor(e.target.value)}
                                  className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                                  aria-label="Custom background color"
                                />
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  {bgColor}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* ── Add Logo tab ── */}
                      <TabsContent value="logo" className="mt-4">
                        <div
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center"
                          style={{ borderColor: "hsl(var(--tool-border))" }}
                        >
                          <div
                            className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                            style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                          >
                            <Lock className="h-5 w-5 text-white" aria-hidden="true" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            Logo overlay is a PRO feature
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Upgrade to Trndinn Pro to add your logo to QR codes.
                          </p>
                          <Button
                            size="sm"
                            className="mt-4 gap-1.5 text-sm font-semibold text-white"
                            style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                            asChild
                          >
                            <a href="/pricing">
                              Upgrade to Pro
                              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          </Button>
                        </div>
                      </TabsContent>

                      {/* ── Advanced tab ── */}
                      <TabsContent value="advanced" className="mt-4 space-y-5">
                        {/* Error correction */}
                        <div className="space-y-2.5">
                          <Label className="text-xs font-semibold text-muted-foreground">
                            Error Correction Level
                          </Label>
                          <div
                            className="grid grid-cols-4 gap-1.5"
                            role="radiogroup"
                            aria-label="Error correction level"
                          >
                            {(["L", "M", "Q", "H"] as EccLevel[]).map((level) => (
                              <button
                                key={level}
                                type="button"
                                role="radio"
                                aria-checked={eccLevel === level}
                                onClick={() => setEccLevel(level)}
                                className={cn(
                                  "rounded-lg px-3 py-2 text-sm font-semibold transition-all",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                                  eccLevel === level
                                    ? "text-white shadow-md"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                                style={
                                  eccLevel === level
                                    ? { background: "linear-gradient(135deg, #F97316, #F59E0B)" }
                                    : { background: "hsl(var(--tool-surface-dim))", border: "1px solid hsl(var(--tool-border))" }
                                }
                              >
                                {level}
                                <span className="block text-[10px] font-normal opacity-70">
                                  {level === "L" && "7%"}
                                  {level === "M" && "15%"}
                                  {level === "Q" && "25%"}
                                  {level === "H" && "30%"}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Margin */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-muted-foreground">
                              Quiet Zone (Margin)
                            </Label>
                            <span className="text-xs font-medium text-foreground">
                              {margin} modules
                            </span>
                          </div>
                          <Slider
                            value={[margin]}
                            onValueChange={([v]) => setMargin(v)}
                            min={0}
                            max={10}
                            step={1}
                            aria-label={`Margin: ${margin} modules`}
                          />
                        </div>

                        {/* Reset */}
                        <Button
                          onClick={handleReset}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          style={{ borderColor: "hsl(var(--tool-border))" }}
                          aria-label="Reset to defaults"
                        >
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                          Reset to defaults
                        </Button>
                      </TabsContent>
                    </Tabs>

                    {error && (
                      <Alert variant="destructive" role="alert" aria-live="assertive">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* ── Right column: Live Preview ── */}
                  <div className="space-y-4">
                    <div
                      className="rounded-xl border p-4 sm:p-6"
                      style={{
                        background: "hsl(var(--tool-surface-dim))",
                        borderColor: "hsl(var(--tool-border))",
                      }}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">
                          Live Preview
                        </h3>
                        <span className="rounded-full border px-2.5 py-0.5 text-[10px] text-muted-foreground"
                          style={{ borderColor: "hsl(var(--tool-border))" }}
                        >
                          400 x 400 px
                        </span>
                      </div>

                      {/* Canvas preview */}
                      <div
                        className="flex min-h-[280px] items-center justify-center rounded-lg p-4"
                        style={{ background: bgColor }}
                        aria-label="QR code preview"
                        role="img"
                      >
                        {isGenerating && (
                          <span
                            className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                            style={{ borderColor: "hsl(var(--primary))" }}
                            aria-label="Generating QR code"
                          />
                        )}
                        <canvas
                          ref={canvasRef}
                          className={cn(
                            "max-w-full rounded transition-opacity",
                            isGenerating ? "opacity-50" : "opacity-100",
                            !hasGenerated && !isGenerating ? "hidden" : "block"
                          )}
                          aria-hidden="true"
                        />
                        {!hasGenerated && !isGenerating && (
                          <div className="flex flex-col items-center gap-2">
                            <QrCode className="h-12 w-12 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">
                              Enter content to preview
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Success indicator */}
                      {hasGenerated && (
                        <div className="mt-3 flex items-center justify-center gap-1.5">
                          <CheckCircle2
                            className="h-4 w-4"
                            style={{ color: "#22C55E" }}
                            aria-hidden="true"
                          />
                          <span className="text-sm font-medium" style={{ color: "#22C55E" }}>
                            Looks good!
                          </span>
                        </div>
                      )}

                      {/* Download buttons */}
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={handleDownloadPng}
                          disabled={!hasGenerated}
                          className={cn(
                            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                            !hasGenerated && "opacity-50 cursor-not-allowed"
                          )}
                          style={{
                            background: "linear-gradient(135deg, #F97316, #F59E0B)",
                          }}
                          aria-label="Download QR code as PNG"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          Download PNG
                          <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                        </button>
                        <button
                          onClick={handleDownloadSvg}
                          disabled={!hasGenerated}
                          className={cn(
                            "flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold text-foreground transition-all",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
                            "hover:border-[hsl(var(--primary)/0.3)]",
                            !hasGenerated && "opacity-50 cursor-not-allowed"
                          )}
                          style={{
                            borderColor: "hsl(var(--tool-border))",
                            background: "hsl(var(--tool-surface))",
                          }}
                          aria-label="Download QR code as SVG"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          Download SVG
                        </button>
                      </div>

                      {/* Info line */}
                      <p className="mt-3 text-center text-[11px] text-muted-foreground">
                        400x400 px&ensp;|&ensp;PNG&ensp;|&ensp;High quality&ensp;|&ensp;No watermark
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── Trust Strip ─── */}
            <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
              <TrustStrip features={TRUST_FEATURES} />
            </div>

            {/* ─── Popular Use Cases ─── */}
            <section
              aria-labelledby="use-cases-heading"
              className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-6 lg:px-8"
            >
              <h2
                id="use-cases-heading"
                className="mb-1 text-xl font-bold text-foreground font-display"
              >
                Popular use cases
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Create QR codes for everything you need.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {POPULAR_USE_CASES.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      const mapping: Record<string, ContentType> = {
                        Website: "url",
                        Text: "text",
                        Contact: "contact",
                        "Wi-Fi": "wifi",
                        Email: "email",
                        Phone: "phone",
                        WhatsApp: "whatsapp",
                        "Social Media": "url",
                      };
                      const ct = mapping[label] || "url";
                      setContentType(ct);
                      setText(getPlaceholder(ct));
                      // Scroll to workspace
                      document.querySelector('[aria-label="QR code generator workspace"]')?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                      "hover:border-[hsl(var(--primary)/0.3)] hover:shadow-md",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
                    )}
                    style={{
                      background: "hsl(var(--tool-surface))",
                      borderColor: "hsl(var(--tool-border))",
                    }}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: "hsl(var(--primary) / 0.1)" }}
                    >
                      <Icon className="h-5 w-5 text-[hsl(var(--primary))]" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* ─── FAQ ─── */}
            {tool.faqs && tool.faqs.length > 0 && (
              <section
                aria-labelledby="faq-heading"
                className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-6 lg:px-8"
              >
                <h2
                  id="faq-heading"
                  className="mb-6 text-xl font-bold text-foreground font-display"
                >
                  Frequently asked questions
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {tool.faqs.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="rounded-xl border px-4 sm:px-6"
                      style={{
                        background: "hsl(var(--tool-surface))",
                        borderColor: "hsl(var(--tool-border))",
                      }}
                    >
                      <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:text-[hsl(var(--primary))] hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}

            {/* ─── AEO: What is a QR Code? ─── */}
            <section
              aria-labelledby="what-is-qr-heading"
              className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-6 lg:px-8"
            >
              <div
                className="rounded-xl border p-6"
                style={{
                  background: "hsl(var(--tool-surface))",
                  borderColor: "hsl(var(--tool-border))",
                }}
              >
                <h2 id="what-is-qr-heading" className="text-lg font-bold text-foreground mb-4">
                  What is a QR code?
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                  A QR (Quick Response) code is a two-dimensional barcode that stores data as a pattern of black and white squares. Invented by Denso Wave in 1994 for automotive tracking, QR codes are now used globally for contactless payments, marketing, and information sharing. Over 89% of smartphone users have scanned a QR code at least once [Statista, 2025].
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                  Trndinn&apos;s QR Code Generator creates high-resolution QR codes entirely in your browser — no server upload, no signup, no watermark. Customize foreground and background colors, adjust error correction levels, and download as lossless PNG or scalable SVG for print.
                </p>
                <h3 className="text-base font-semibold text-foreground mt-6 mb-3">
                  Common questions about QR codes
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Do QR codes expire?</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Static QR codes (like the ones Trndinn generates) never expire. The data is encoded directly in the pattern — as long as the destination URL exists, the code works forever.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">What&apos;s the maximum data a QR code can hold?</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">A single QR code can store up to 4,296 alphanumeric characters or 7,089 numeric digits. For URLs, keep them under 2,000 characters for reliable scanning across all devices.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Should I download PNG or SVG?</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Use PNG for digital screens (social media, websites, presentations). Use SVG for print materials (business cards, posters, packaging) — SVG scales to any size without losing quality.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── Need more? CTA ─── */}
            <section
              aria-label="Try Trndinn"
              className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-6 lg:px-8"
            >
              <div
                className="flex flex-col gap-6 rounded-xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 border"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--tool-surface)) 0%, hsl(var(--tool-surface-dim)) 100%)",
                  borderColor: "hsl(var(--tool-border))",
                }}
              >
                <div className="max-w-md">
                  <h2 className="text-xl font-bold text-foreground sm:text-2xl">Need more?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create social media graphics, OG images, and branded assets with AI.
                  </p>
                  <div className="mt-5">
                    <a
                      href="/features"
                      className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                      style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}
                    >
                      Try Trndinn
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── More tools you'll love ─── */}
            <section
              aria-label="Related tools"
              className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-6 lg:px-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">More image tools you&apos;ll love</h2>
                <a href="/tools/image" className="text-xs font-medium text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                  View all tools <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Favicon Generator", desc: "All sizes in one ZIP", href: "/tools/favicon-generator" },
                  { name: "Remove Background", desc: "AI background removal", href: "/tools/background-remover" },
                  { name: "Image Resizer", desc: "Resize for any platform", href: "/tools/resize-image" },
                  { name: "Image to Base64", desc: "Encode images as Base64", href: "/tools/image-to-base64" },
                ].map((t) => (
                  <a
                    key={t.name}
                    href={t.href}
                    className="rounded-xl border p-4 hover:border-[hsl(var(--primary)/0.3)] transition-colors group"
                    style={{
                      background: "hsl(var(--tool-surface))",
                      borderColor: "hsl(var(--tool-border))",
                    }}
                  >
                    <p className="text-sm font-semibold text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                  </a>
                ))}
              </div>
            </section>

            {/* ─── SEO footer ─── */}
            <div className="mx-auto max-w-[1200px] px-4 pb-12 sm:px-6 lg:px-8">
              <Separator
                className="mb-6"
                style={{ background: "hsl(var(--tool-border))" }}
              />
              <p className="text-xs leading-relaxed text-muted-foreground/70">
                Trndinn&apos;s QR Code Generator is a free, browser-based tool.
                All processing happens locally on your device — no files are
                uploaded to any server. No signup, no watermark, no usage limit.
              </p>
            </div>
          </main>
        </div>
      </SidebarWrapper>
    </MarketingShell>
  );
}
