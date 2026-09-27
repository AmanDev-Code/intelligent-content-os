"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Image as ImageIcon,
  Music2,
  Video,
  Wrench,
  ArrowRight,
  Zap,
  ShieldCheck,
  Globe,
  Lock,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";

// ---------------------------------------------------------------------------
// Category data
// ---------------------------------------------------------------------------

const CATEGORIES = [
  {
    href: "/tools/image",
    icon: ImageIcon,
    title: "Image Tools",
    description:
      "Convert, compress, resize, crop, remove backgrounds and more.",
    count: "49 free tools",
    /** HSL string matching --primary / --chart-1 (orange) */
    colorHsl: "21 95% 56%",
    examples: [
      "PNG to JPG",
      "Compress Image",
      "Background Remover",
      "Favicon Generator",
    ],
  },
  {
    href: "/tools/audio",
    icon: Music2,
    title: "Audio Tools",
    description:
      "Convert audio formats, record your voice, text-to-speech and transcription.",
    count: "4 free tools",
    /** Vivid blue — no token exists, using complementary HSL */
    colorHsl: "217 91% 60%",
    examples: [
      "Audio Converter",
      "Voice Recorder",
      "Text to Speech",
      "Speech to Text",
    ],
  },
  {
    href: "/tools/video",
    icon: Video,
    title: "Video Tools",
    description:
      "Convert video formats, record from webcam, capture your screen.",
    count: "3 free tools",
    /** Matches --chart-5 (purple) */
    colorHsl: "270 95.2% 75.3%",
    examples: ["Video Converter", "Screen Recorder", "Webcam Recorder"],
  },
  {
    href: "/tools/image#utility",
    icon: Wrench,
    title: "Utility Tools",
    description: "QR codes, favicons, base64 encoding, OCR and more.",
    count: "7 free tools",
    /** Matches --chart-2 (green) */
    colorHsl: "142.1 76.2% 36.3%",
    examples: [
      "QR Code Generator",
      "Favicon Generator",
      "Image OCR",
      "Base64 Encoder",
    ],
  },
] as const;

// ---------------------------------------------------------------------------
// Trust strip items
// ---------------------------------------------------------------------------

const TRUST_ITEMS = [
  { icon: Lock, label: "No signup" },
  { icon: ShieldCheck, label: "Never uploaded" },
  { icon: Globe, label: "Works offline" },
  { icon: Zap, label: "Instant" },
];

// ---------------------------------------------------------------------------
// Category Card
// ---------------------------------------------------------------------------

function CategoryCard({
  category,
  index,
}: {
  category: (typeof CATEGORIES)[number];
  index: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: shouldReduceMotion ? 0 : index * 0.1,
      }}
      className="h-full"
    >
      <Link
        href={category.href}
        className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-transparent dark:bg-[hsl(223_62%_9%)]"
        style={
          {
            "--cat-color": category.colorHsl,
          } as React.CSSProperties
        }
        aria-label={`${category.title} — ${category.count}`}
      >
        {/* Hover border glow — appears on hover via group */}
        <div
          className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: `inset 0 0 0 1px hsl(${category.colorHsl})`,
          }}
          aria-hidden="true"
        />

        {/* Icon */}
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `hsl(${category.colorHsl} / 0.12)`,
          }}
        >
          <Icon
            className="h-6 w-6"
            style={{ color: `hsl(${category.colorHsl})` }}
            aria-hidden="true"
          />
        </div>

        {/* Title + count */}
        <div className="mb-2 flex items-center gap-3">
          <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
            {category.title}
          </h3>
          <span
            className="rounded-lg px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `hsl(${category.colorHsl} / 0.1)`,
              color: `hsl(${category.colorHsl})`,
            }}
          >
            {category.count}
          </span>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {category.description}
        </p>

        {/* Example tool names */}
        <div className="mb-6 flex flex-wrap gap-2">
          {category.examples.map((example) => (
            <span
              key={example}
              className="rounded-lg bg-muted/50 px-2 py-1 text-xs text-muted-foreground dark:bg-muted/30"
            >
              {example}
            </span>
          ))}
        </div>

        {/* Browse link — pushed to bottom */}
        <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
          Browse tools
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ToolsHubView() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <MarketingShell>
      <main className="relative overflow-hidden">
        {/* ==================================================================
            HERO
        ================================================================== */}
        <section className="relative flex min-h-[40vh] items-center justify-center px-4 pt-20 pb-8 sm:pt-28 sm:pb-12">
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-foreground"
            >
              <span className="gradient-text">Free tools</span> for images,
              audio &amp; video
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              No signup. No watermark. Everything runs in your browser.
            </motion.p>

            {/* Trust strip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
            >
              {TRUST_ITEMS.map(({ icon: TrustIcon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm"
                >
                  <TrustIcon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ==================================================================
            CATEGORY GRID
        ================================================================== */}
        <section className="px-4 pb-16 sm:pb-20">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {CATEGORIES.map((cat, i) => (
              <CategoryCard key={cat.title} category={cat} index={i} />
            ))}
          </div>
        </section>

        {/* ==================================================================
            FOOTER COPY
        ================================================================== */}
        <section className="px-4 pb-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-lg font-semibold text-foreground">
              56 tools and counting
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We ship new browser-based tools every week. Have a request?{" "}
              <Link
                href="/blog"
                className="font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
              >
                Check our blog
              </Link>{" "}
              for the latest updates.
            </p>
          </motion.div>
        </section>
      </main>
    </MarketingShell>
  );
}
