"use client";

/**
 * ImageToolsHubView — image tools category hub showing all 49 tools.
 * Dark-themed layout matching the converter pages.
 * Pulls real tool data from image-converter-data, image-edit-data, image-utility-data.
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  RefreshCw,
  Minimize2,
  Scissors,
  Wrench,
  Sparkles,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { CONVERSION_TOOLS } from "@/lib/image-converter-data";
import { EDIT_TOOLS } from "@/lib/image-edit-data";
import { UTILITY_TOOLS } from "@/lib/image-utility-data";

// ─── Format color for icon badges ────────────────────────────────────────────

const FORMAT_COLORS: Record<string, string> = {
  png: "#3B82F6", jpg: "#EF4444", jpeg: "#EF4444", webp: "#10B981",
  heic: "#F59E0B", heif: "#F59E0B", svg: "#F97316", avif: "#8B5CF6",
  gif: "#EC4899", bmp: "#6B7280", tiff: "#6B7280", tif: "#6B7280", ico: "#F59E0B",
};

function getColor(slug: string): string {
  const from = slug.split("-to-")[0] ?? slug;
  return FORMAT_COLORS[from] ?? "#F97316";
}

// ─── Section data ─────────────────────────────────────────────────────────────

interface SectionConfig {
  id: string;
  label: string;
  icon: typeof RefreshCw;
  accentColor: string;
  tools: Array<{ slug: string; name: string; description: string }>;
}

const SECTIONS: SectionConfig[] = [
  {
    id: "convert",
    label: "CONVERT",
    icon: RefreshCw,
    accentColor: "#F97316",
    tools: CONVERSION_TOOLS.map(t => ({
      slug: t.slug,
      name: `${t.fromLabel} → ${t.toLabel}`,
      description: t.whyConvert.slice(0, 80) + (t.whyConvert.length > 80 ? "…" : ""),
    })),
  },
  {
    id: "compress",
    label: "COMPRESS",
    icon: Minimize2,
    accentColor: "#10B981",
    tools: EDIT_TOOLS.filter(t =>
      t.slug.startsWith("compress-")
    ).map(t => ({
      slug: t.slug,
      name: t.name,
      description: t.description,
    })),
  },
  {
    id: "edit",
    label: "EDIT",
    icon: Scissors,
    accentColor: "#3B82F6",
    tools: EDIT_TOOLS.filter(t =>
      !t.slug.startsWith("compress-")
    ).map(t => ({
      slug: t.slug,
      name: t.name,
      description: t.description,
    })),
  },
  {
    id: "utility",
    label: "UTILITY",
    icon: Wrench,
    accentColor: "#8B5CF6",
    tools: UTILITY_TOOLS.map(t => ({
      slug: t.slug,
      name: t.name,
      description: t.description,
    })),
  },
];

const totalTools = SECTIONS.reduce((sum, s) => sum + s.tools.length, 0);

// ─── FloatingOrb ─────────────────────────────────────────────────────────────

function FloatingOrb({ className, color, delay = 0 }: { className: string; color: string; delay?: number }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-30 ${className}`}
      style={{ background: color }}
      animate={shouldReduce ? undefined : { x: [0, 20, -15, 0], y: [0, -30, 15, 0], scale: [1, 1.06, 0.97, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageToolsHubView() {
  const shouldReduce = useReducedMotion();

  return (
    <MarketingShell>
      <div style={{ background: "hsl(223 62% 7%)", color: "hsl(210 40% 98%)" }}>
        <main className="relative overflow-hidden">

          {/* Background orbs */}
          <FloatingOrb className="left-[-8%] top-[5%] h-[400px] w-[400px]" color="radial-gradient(circle, #F97316 0%, transparent 70%)" />
          <FloatingOrb className="right-[-6%] top-[20%] h-[350px] w-[350px]" color="radial-gradient(circle, #8B5CF6 0%, transparent 70%)" delay={4} />

          {/* Hero */}
          <section className="relative px-6 pb-10 pt-14 lg:px-10">
            <div className="mx-auto max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: "hsl(224 36% 14%)", border: "1px solid hsl(224 28% 22%)" }}
              >
                <Sparkles className="h-3 w-3 text-primary" aria-hidden />
                {totalTools} free tools · 100% browser-based
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.1] tracking-tight"
              >
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #F97316, #F59E0B)" }}>
                  Free
                </span>{" "}
                Image Tools
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground"
              >
                Convert, compress, resize, crop, remove backgrounds, generate favicons, extract text — all in your browser. No signup, no upload, no watermark.
              </motion.p>
            </div>
          </section>

          {/* Tool sections */}
          {SECTIONS.map((section, sIdx) => {
            const Icon = section.icon;
            return (
              <section key={section.id} className="px-6 pb-10 lg:px-10" id={section.id}>
                <div className="mx-auto max-w-5xl">
                  {/* Section header */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.35 }}
                    className="mb-5 flex items-center gap-3"
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: `${section.accentColor}20` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: section.accentColor }} aria-hidden />
                    </div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {section.label}
                    </h2>
                    <div className="flex-1 border-t" style={{ borderColor: "hsl(224 28% 18%)" }} aria-hidden />
                    <span className="text-xs text-muted-foreground">{section.tools.length} tools</span>
                  </motion.div>

                  {/* Tool grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {section.tools.map((tool, tIdx) => {
                      const badgeColor = getColor(tool.slug);
                      const badgeText = tool.slug.includes("-to-")
                        ? tool.slug.split("-to-")[0].toUpperCase().slice(0, 3)
                        : tool.name.slice(0, 2).toUpperCase();

                      return (
                        <motion.div
                          key={tool.slug}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-30px" }}
                          transition={{ duration: 0.3, delay: tIdx * 0.02 }}
                        >
                          <Link
                            href={`/tools/${tool.slug}`}
                            className="group flex items-start gap-3 rounded-xl p-3.5 transition-all duration-200"
                            style={{
                              background: "hsl(223 62% 9%)",
                              border: "1px solid hsl(224 28% 18%)",
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.borderColor = `${badgeColor}50`;
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.borderColor = "hsl(224 28% 18%)";
                            }}
                          >
                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[9px] font-black text-white"
                              style={{ background: badgeColor }}
                              aria-hidden
                            >
                              {badgeText}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {tool.name}
                              </p>
                              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                                {tool.description}
                              </p>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}

          {/* Bottom CTA */}
          <section className="px-6 pb-16 pt-6 lg:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
              >
                <span className="text-foreground">One platform for </span>
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #F97316, #F59E0B)" }}>
                  all your content
                </span>
              </motion.h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Convert images for free. Then schedule, publish, and grow — all from one place.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #F97316, #F59E0B)" }}
                >
                  Start free — $0.86/mo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  style={{ border: "1px solid hsl(224 28% 22%)" }}
                >
                  Back to all tools
                </Link>
              </div>
            </div>
          </section>

        </main>
      </div>
    </MarketingShell>
  );
}
