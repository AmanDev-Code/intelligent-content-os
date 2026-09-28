"use client";

/**
 * ImageToolsShell — outer layout shell wrapping all 49 image tool pages.
 *
 * Shadcn primitives: Accordion, AccordionContent, AccordionItem,
 *   AccordionTrigger, Badge, Separator.
 * Design tokens: --background, --foreground, --card, --muted,
 *   --muted-foreground, --primary, --primary-foreground, --border, --ring.
 * Motion: framer-motion for H1 word reveal + section fades (marketing page).
 *   prefers-reduced-motion safe via useReducedMotion().
 * Icons: Lucide only.
 * Dark mode: fully CSS-variable driven.
 * Accessible: semantic HTML, ARIA labels, visible focus rings.
 */

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ImageToolsSidebar } from "./ImageToolsSidebar";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ImageToolsShellProps {
  // Identity
  slug: string;
  toolName: string;
  h1Prefix: string;
  h1Highlight: string;
  h1Suffix: string;
  eyebrow: string;
  heroSubline: string;

  // SEO content
  whyText: string;
  faqs: Array<{ question: string; answer: string }>;

  // Tool UI slot
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Animation helpers — inline transitions avoid framer-motion Variants typing issues
// ---------------------------------------------------------------------------

const WORD_HIDDEN = { opacity: 0, y: 16 };
const WORD_VISIBLE = { opacity: 1, y: 0 };

const SECTION_HIDDEN = { opacity: 0, y: 20 };
const SECTION_VISIBLE = { opacity: 1, y: 0 };

// ---------------------------------------------------------------------------
// AnimatedH1
// ---------------------------------------------------------------------------

function AnimatedH1({
  prefix,
  highlight,
  suffix,
}: {
  prefix: string;
  highlight: string;
  suffix: string;
}) {
  const shouldReduce = useReducedMotion();

  const words = [
    ...prefix.split(" ").filter(Boolean).map((w) => ({ text: w, type: "normal" as const })),
    ...highlight.split(" ").filter(Boolean).map((w) => ({ text: w, type: "highlight" as const })),
    ...suffix.split(" ").filter(Boolean).map((w) => ({ text: w, type: "normal" as const })),
  ];

  return (
    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl font-heading text-foreground flex flex-wrap gap-x-2 gap-y-1">
      {words.map((word, i) =>
        shouldReduce ? (
          <span
            key={i}
            className={word.type === "highlight" ? "gradient-text" : ""}
          >
            {word.text}
          </span>
        ) : (
          <motion.span
            key={i}
            initial={WORD_HIDDEN}
            animate={WORD_VISIBLE}
            transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
            className={word.type === "highlight" ? "gradient-text" : ""}
          >
            {word.text}
          </motion.span>
        )
      )}
    </h1>
  );
}

// ---------------------------------------------------------------------------
// AnimatedSection
// ---------------------------------------------------------------------------

function AnimatedSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={SECTION_HIDDEN}
      animate={SECTION_VISIBLE}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function ImageToolsShell({
  slug,
  toolName,
  h1Prefix,
  h1Highlight,
  h1Suffix,
  eyebrow,
  heroSubline,
  whyText,
  faqs,
  children,
}: ImageToolsShellProps) {
  return (
    <MarketingShell>
      {/* Sidebar lives outside the scrollable content area */}
      <div className="flex min-h-screen">
        {/* Left sidebar — desktop only, mobile shows pill strip inside */}
        <ImageToolsSidebar activeSlug={slug} />

        {/* Main content column */}
        <div className="flex-1 min-w-0">
          {/* Mobile pill strip is rendered by ImageToolsSidebar internally */}

          <main
            id="main-content"
            className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8"
            aria-label={`${toolName} tool`}
          >
            <div className="space-y-6 sm:space-y-8">

              {/* ── Hero ── */}
              <AnimatedSection delay={0}>
                <div className="space-y-3">
                  <Badge
                    variant="secondary"
                    className="rounded-full text-xs font-medium"
                  >
                    {eyebrow}
                  </Badge>

                  <AnimatedH1
                    prefix={h1Prefix}
                    highlight={h1Highlight}
                    suffix={h1Suffix}
                  />

                  <p className="max-w-xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-base">
                    {heroSubline}
                  </p>
                </div>
              </AnimatedSection>

              {/* ── Tool UI slot ── */}
              <AnimatedSection delay={0.1}>
                {children}
              </AnimatedSection>

              {/* ── Why use / AEO content ── */}
              {whyText && (
                <AnimatedSection delay={0.18}>
                  <section aria-labelledby="why-heading">
                    <h2
                      id="why-heading"
                      className="mb-3 text-base font-semibold text-foreground sm:text-lg"
                    >
                      Why use this tool?
                    </h2>
                    <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-base">
                      {whyText}
                    </p>
                  </section>
                </AnimatedSection>
              )}

              {/* ── FAQ ── */}
              {faqs.length > 0 && (
                <AnimatedSection delay={0.24}>
                  <section aria-labelledby="faq-heading">
                    <h2
                      id="faq-heading"
                      className="mb-3 text-base font-semibold text-foreground sm:text-lg"
                    >
                      Frequently asked questions
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                      {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`faq-${i}`}>
                          <AccordionTrigger className="text-sm font-medium text-foreground text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </section>
                </AnimatedSection>
              )}

              <Separator />

              {/* ── SEO footer note ── */}
              <AnimatedSection delay={0.3}>
                <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground)/0.7)]">
                  Trndinn&apos;s {toolName} is a free, browser-based tool. All
                  processing happens locally on your device — no files are
                  uploaded to any server. No signup, no watermark, no usage
                  limit.
                </p>
              </AnimatedSection>

            </div>
          </main>
        </div>
      </div>
    </MarketingShell>
  );
}
