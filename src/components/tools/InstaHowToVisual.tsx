"use client";

/**
 * InstaHowToVisual — Three-step visual walkthrough of the Instagram Reel
 * download flow, rendered as floating phone mockups with theme-aware images.
 *
 * Images live at /public/tools/insta/{light,dark}{1,2,3}.{avif,webp,png}
 * - AVIF: ~40KB each (best modern browsers)
 * - WebP: ~80KB each (fallback for older browsers)
 * - PNG: ~1.9MB (only used if browser refuses both — should never fire)
 *
 * Theme swap is CSS-only via Tailwind dark: variants. Both light and dark
 * images are declared in the DOM, but only one is visible at a time.
 * Browsers still fetch both, so we lazy-load below the fold and use
 * decoding="async" to keep them off the critical path.
 */

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step {
  n: number;
  title: string;
  caption: string;
  imgBase: string; // e.g. "1" → light1/dark1
  accent: string; // gradient for the number pill
}

const STEPS: Step[] = [
  {
    n: 1,
    title: "Copy the Instagram link",
    caption:
      "On Instagram, open the post, Reel, or Story you want to save. Tap Share (or the •••) and choose Copy link.",
    imgBase: "1",
    accent: "from-[#833AB4] to-[#C13584]",
  },
  {
    n: 2,
    title: "Paste it into Trndinn",
    caption:
      "Come back here and paste the Instagram URL into the field above. Our engine extracts the direct MP4 in seconds.",
    imgBase: "2",
    accent: "from-[#C13584] to-[#E1306C]",
  },
  {
    n: 3,
    title: "Choose quality & save",
    caption:
      "Preview the Reel, then click Save MP4. Downloads to your device in original HD quality — no watermark, no compression.",
    imgBase: "3",
    accent: "from-[#E1306C] to-[#F77737]",
  },
];

// ─── Phone frame with theme-aware image ───────────────────────────────────────

function PhoneMock({ imgBase, alt }: { imgBase: string; alt: string }) {
  // Fixed aspect-ratio container guarantees all 3 mockups render at the exact
  // same visual size even though the source PNGs have slightly different
  // native ratios (905x1737, 943x1667, 885x1777). object-contain preserves
  // each phone's shape without cropping.
  return (
    <div className="relative mx-auto w-full max-w-[240px]">
      {/* Ambient glow behind the phone — theme-adaptive */}
      <div
        className="absolute -inset-6 rounded-[3rem] opacity-40 blur-3xl dark:opacity-25"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(225,48,108,0.35), transparent 65%)",
        }}
        aria-hidden="true"
      />

      {/* Uniform aspect-ratio slot — every phone gets the same box */}
      <div className="relative aspect-[9/19] w-full">
        {/* LIGHT theme image */}
        <picture className="absolute inset-0 block dark:hidden">
          <source
            type="image/avif"
            srcSet={`/tools/insta/light${imgBase}.avif`}
          />
          <source
            type="image/webp"
            srcSet={`/tools/insta/light${imgBase}.webp`}
          />
          <img
            src={`/tools/insta/light${imgBase}.png`}
            alt={alt}
            width={900}
            height={1900}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain drop-shadow-2xl"
          />
        </picture>

        {/* DARK theme image */}
        <picture className="absolute inset-0 hidden dark:block">
          <source
            type="image/avif"
            srcSet={`/tools/insta/dark${imgBase}.avif`}
          />
          <source
            type="image/webp"
            srcSet={`/tools/insta/dark${imgBase}.webp`}
          />
          <img
            src={`/tools/insta/dark${imgBase}.png`}
            alt={alt}
            width={900}
            height={1900}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain drop-shadow-2xl"
          />
        </picture>
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function InstaHowToVisual() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:py-28">
      {/* Ambient decorative gradients — theme adaptive */}
      <div
        className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full opacity-30 blur-3xl dark:opacity-20"
        style={{
          background:
            "radial-gradient(circle, #833AB4 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full opacity-30 blur-3xl dark:opacity-20"
        style={{
          background:
            "radial-gradient(circle, #F77737 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-xs font-medium uppercase tracking-widest text-primary"
          >
            The 3-step flow
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            How to Download from{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #833AB4, #E1306C, #F77737)",
              }}
            >
              Instagram
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            A simple 3-step process to download any public Instagram Reel,
            video, or photo.
          </motion.p>
        </div>

        {/* Steps grid with connector track */}
        <div className="relative mt-16 sm:mt-20">
          {/* Dotted connector — desktop only, sits behind the phones */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-[35%] hidden w-full text-primary/25 lg:block"
            viewBox="0 0 1000 40"
            preserveAspectRatio="none"
          >
            <path
              d="M 100 20 Q 350 -10, 500 20 T 900 20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="2 8"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative grid grid-cols-1 gap-14 sm:gap-16 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={
                  shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.3 } }
                }
                className="group flex flex-col items-center"
              >
                <PhoneMock imgBase={step.imgBase} alt={`Step ${step.n}: ${step.title}`} />

                {/* Number + title */}
                <div className="mt-6 flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md",
                      step.accent,
                    )}
                  >
                    {step.n}
                  </span>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                    {step.title}
                  </h3>
                </div>

                {/* Caption */}
                <p className="mt-3 max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
                  {step.caption}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
