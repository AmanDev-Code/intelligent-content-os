"use client";

/**
 * ToolHero — premium hero section for tool pages.
 * Includes: eyebrow pill badge, large headline with orange gradient word,
 * description text, optional trust badges, and a children slot for
 * 3D illustration or other decorative elements.
 *
 * Design tokens: --tool-bg, --tool-surface, --tool-border, --primary,
 *   --foreground, --muted-foreground.
 * Motion: framer-motion for entrance animations, prefers-reduced-motion safe.
 * Icons: Lucide only.
 */

import React, { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrustBadges, type TrustBadge } from "./TrustBadges";

export interface ToolHeroProps {
  /** Small pill badge text above the headline (e.g. "FREE AI BACKGROUND REMOVER") */
  eyebrow: string;
  /** Text before the highlighted word */
  h1Prefix: string;
  /** The word(s) rendered in orange gradient */
  h1Highlight: string;
  /** Text after the highlighted word */
  h1Suffix: string;
  /** Paragraph below the headline */
  description: string;
  /** Trust badge pills below the description */
  trustBadges?: TrustBadge[];
  /** Slot for 3D illustration, positioned to the right on desktop */
  children?: React.ReactNode;
  /** Additional class names for the outer section */
  className?: string;
}

/* ------------------------------------------------------------------
   Animation variants — prefers-reduced-motion handled by hook below.
   ------------------------------------------------------------------ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const fadeUpDelayed = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  },
});

const fadeIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const noMotion: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

/** Client-side hook: detect prefers-reduced-motion */
function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return prefersReduced;
}

export function ToolHero({
  eyebrow,
  h1Prefix,
  h1Highlight,
  h1Suffix,
  description,
  trustBadges,
  children,
  className,
}: ToolHeroProps) {
  const reduced = usePrefersReducedMotion();

  const v = (variants: Variants) => (reduced ? noMotion : variants);

  return (
    <section
      aria-labelledby="tool-hero-heading"
      className={cn(
        "relative overflow-hidden px-4 pt-8 pb-6 sm:pt-14 sm:pb-10",
        className
      )}
    >
      {/* Subtle radial glow behind illustration */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl sm:opacity-30"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: text content */}
        <motion.div
          className="flex max-w-2xl flex-col items-center text-center lg:items-start lg:text-left"
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow badge */}
          <motion.div variants={v(fadeUp)}>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-4 py-1.5",
                "border border-[hsl(var(--primary)/0.3)]",
                "bg-[hsl(var(--primary)/0.08)]",
                "text-xs font-bold uppercase tracking-widest",
                "text-[hsl(var(--primary))]"
              )}
            >
              {eyebrow}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            id="tool-hero-heading"
            variants={v(fadeUpDelayed(0.1))}
            className={cn(
              "mt-6 font-display font-bold leading-[1.1] tracking-tight text-foreground",
              "text-[clamp(2rem,5vw,3.75rem)]"
            )}
          >
            {h1Prefix}{" "}
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #F97316, #F59E0B)",
              }}
            >
              {h1Highlight}
            </span>{" "}
            {h1Suffix}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={v(fadeUpDelayed(0.2))}
            className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {description}
          </motion.p>

          {/* Trust badges */}
          {trustBadges && trustBadges.length > 0 && (
            <motion.div
              variants={v(fadeUpDelayed(0.3))}
              className="mt-6 w-full"
            >
              <TrustBadges
                badges={trustBadges}
                className="sm:justify-start"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Right: 3D illustration slot */}
        {children && (
          <motion.div
            variants={v(fadeIn)}
            initial="hidden"
            animate="visible"
            className="relative shrink-0 lg:max-w-[400px]"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}
