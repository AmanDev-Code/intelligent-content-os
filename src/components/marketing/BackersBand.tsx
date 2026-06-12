/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

type BackerItem = { key?: string; name?: string; href?: string };

/**
 * "Backed by" credibility band. Truthful program membership rendered with the
 * REAL official program logos:
 *  - NVIDIA Inception    -> official Inception badge, borderless: green eye kept in both
 *                           themes, wordmark + divider charcoal on light / white on dark
 *  - Google for Startups -> multicolor "Google" + theme-aware "for Startups" lockup
 *  - AWS Activate         -> official AWS smile + theme-aware "amazon" + "Activate"
 *  - ElevenLabs Grants    -> official ElevenLabs Grants wordmark (dark/white webp)
 *
 * Each brand ships a light and a dark asset. We render both and toggle them with
 * Tailwind's `dark:` class variants (driven by next-themes `attribute="class"`),
 * so the correct artwork is painted on the very first frame: no JS theme probe,
 * no hydration mismatch, no flash of the wrong logo. Logos sit on soft tint
 * chips (muted in light, a faint white wash in dark) with no border and no
 * shadow, so they feel embedded in the page canvas in both themes.
 */

/** Renders a light + dark image pair, toggled purely by the `dark` class. */
function ThemedLogo({
  light,
  dark,
  alt,
  imgClassName,
  width,
  height,
}: {
  light: string;
  dark: string;
  alt: string;
  imgClassName: string;
  width?: number;
  height?: number;
}): ReactNode {
  return (
    <>
      <img
        src={light}
        alt={alt}
        className={cn(imgClassName, "block dark:hidden")}
        loading="lazy"
        width={width}
        height={height}
      />
      <img
        src={dark}
        alt={alt}
        className={cn(imgClassName, "hidden dark:block")}
        loading="lazy"
        width={width}
        height={height}
      />
    </>
  );
}

/** One backer logo, centered and optically balanced inside the chip. */
function BackerLogo({ keyName, name }: { keyName: string; name: string }): ReactNode {
  switch (keyName) {
    case "nvidia":
      return (
        <ThemedLogo
          light="/backers/nvidia-inception-light.svg"
          dark="/backers/nvidia-inception-dark.svg"
          alt={`${name} program`}
          imgClassName="h-16 w-auto max-w-full object-contain sm:h-[72px]"
          width={167}
          height={72}
        />
      );
    case "google":
      return (
        <ThemedLogo
          light="/backers/google-for-startups.svg"
          dark="/backers/google-for-startups-dark.svg"
          alt={name}
          imgClassName="h-[22px] w-auto max-w-full object-contain sm:h-6"
          width={198}
          height={24}
        />
      );
    case "aws":
      return (
        <span className="flex min-w-0 items-center gap-2.5">
          <ThemedLogo
            light="/backers/aws-activate.svg"
            dark="/backers/aws-activate-dark.svg"
            alt="Amazon Web Services"
            imgClassName="h-9 w-auto max-w-full object-contain"
            width={60}
            height={36}
          />
          <span className="font-display text-xl font-medium tracking-tight text-[#232F3E] dark:text-white sm:text-[1.35rem]">
            Activate
          </span>
        </span>
      );
    case "elevenlabs":
      return (
        <ThemedLogo
          light="/backers/elevenlabs-grants-dark.webp"
          dark="/backers/elevenlabs-grants-white.webp"
          alt={name}
          imgClassName="h-6 w-auto max-w-full object-contain sm:h-7"
          width={204}
          height={28}
        />
      );
    default:
      return (
        <span className="font-display text-base font-semibold text-[#232F3E] dark:text-white">{name}</span>
      );
  }
}

export function BackersBand({
  title,
  subtitle,
  items,
}: {
  title?: string;
  subtitle?: string;
  items: BackerItem[];
}) {
  const heading = title ?? "Backed by the programs building what comes next";

  return (
    <section className="relative isolate overflow-hidden px-4 py-10 sm:px-6 md:py-16 lg:py-20">
      {/* Soft in-flow glow only — no opaque block, no border seams. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_120%_at_50%_-10%,hsl(var(--primary)/0.07),transparent_60%)] dark:bg-[radial-gradient(ellipse_70%_120%_at_50%_-10%,rgba(255,138,31,0.12),transparent_60%)]" />

      <div className="mx-auto w-full max-w-5xl">
        <Reveal className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {heading}
          </h2>
          {subtitle ? (
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </Reveal>

        <Reveal delay={100}>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {items.map((item, index) => {
              const name = item.name ?? "";
              const keyName = (item.key ?? "").toLowerCase();
              const cell = (
                <span
                  className={cn(
                    "group flex h-24 w-full min-w-0 items-center justify-center rounded-2xl px-5",
                    "bg-muted/40 dark:bg-white/[0.04]",
                    "transition-transform duration-300 hover:-translate-y-0.5",
                  )}
                >
                  <BackerLogo keyName={keyName} name={name} />
                </span>
              );
              return (
                <li key={item.key ?? index} className="min-w-0">
                  {item.href ? (
                    <Link
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${name} program (opens in a new tab)`}
                      className="block cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                    >
                      {cell}
                    </Link>
                  ) : (
                    cell
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-7 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground/80">
            Program acceptance reflects membership only and does not imply endorsement by NVIDIA, Google, AWS, or
            ElevenLabs.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
