"use client";

/**
 * FreeToolsStrip — Internal-linking section that surfaces our free tools
 * (Instagram Reel Downloader, and future ones) from landing / feature pages.
 *
 * Design intent:
 * - Feels like a natural landing rhythm section (mirrors GuidesSection).
 * - Highlights the live tool (Instagram Reel Downloader) as the hero card,
 *   with lighter "coming soon" chips for the rest so the strip fills nicely.
 * - Uses tokens only (no hard-coded hex). Works in light + dark.
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Download, Hash, MessageSquare, Sparkles } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { cn } from "@/lib/utils";

interface StripTool {
  slug: string;
  name: string;
  blurb: string;
  icon: React.ElementType;
  live: boolean;
}

const TOOLS: StripTool[] = [
  {
    slug: "instagram-reel-downloader",
    name: "Instagram Reel Downloader",
    blurb: "Save any public Reel as HD MP4. No watermark. No login.",
    icon: Download,
    live: true,
  },
  {
    slug: "instagram-caption-generator",
    name: "Instagram Caption Generator",
    blurb: "AI-written captions with hashtags built in.",
    icon: MessageSquare,
    live: false,
  },
  {
    slug: "linkedin-post-generator",
    name: "LinkedIn Post Generator",
    blurb: "Scroll-stopping LinkedIn posts trained on viral patterns.",
    icon: Sparkles,
    live: false,
  },
  {
    slug: "hashtag-generator",
    name: "Hashtag Generator",
    blurb: "Find trending and niche hashtags in seconds.",
    icon: Hash,
    live: false,
  },
];

export function FreeToolsStrip() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Section
      id="free-tools"
      className="relative overflow-hidden"
      containerClassName="relative z-10"
    >
      {/* Ambient background — matches the guides section rhythm */}
      <div className="pointer-events-none absolute -right-32 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
      <div className="pointer-events-none absolute -left-32 bottom-0 -z-10 h-[300px] w-[300px] rounded-full bg-fuchsia-500/5 blur-3xl dark:bg-fuchsia-500/10" />

      <SectionHeading
        eyebrow="Free tools"
        title="Free tools while you're here"
        subtitle={
          <>
            No signup, no paywall. Try our free{" "}
            <Link
              href="/tools/instagram-reel-downloader"
              className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              Instagram Reel Downloader
            </Link>{" "}
            — or{" "}
            <Link
              href="/tools"
              className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              browse the full toolbox
            </Link>
            .
          </>
        }
        align="center"
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((tool, i) => {
          const Icon = tool.icon;
          const href = tool.live ? `/tools/${tool.slug}` : "/tools";
          return (
            <motion.div
              key={tool.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={shouldReduceMotion ? undefined : { y: -4 }}
            >
              <Link
                href={href}
                className={cn(
                  "group relative flex h-full flex-col rounded-2xl border p-5 transition-colors",
                  tool.live
                    ? "border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10"
                    : "border-border/50 bg-card/40 hover:border-border hover:bg-card/70",
                )}
                aria-label={`${tool.name}${tool.live ? "" : " — coming soon"}`}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "mb-4 flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                    tool.live
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </div>

                {/* Name + status */}
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={cn(
                      "font-display text-base font-semibold leading-snug tracking-tight",
                      tool.live ? "text-foreground" : "text-foreground/80",
                    )}
                  >
                    {tool.name}
                  </h3>
                  {tool.live ? (
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      Live
                    </span>
                  ) : (
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Soon
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {tool.blurb}
                </p>

                <div
                  className={cn(
                    "mt-auto flex items-center gap-1 pt-4 text-xs font-medium",
                    tool.live ? "text-primary" : "text-muted-foreground/70",
                  )}
                >
                  {tool.live ? "Use it now" : "Preview on the tools hub"}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
