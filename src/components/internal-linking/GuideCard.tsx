"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Brain, Linkedin, RefreshCcw, CalendarClock } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";
import type { Guide, GuideKey } from "@/lib/internalLinking";

export interface GuideCardProps {
  guide: Guide;
  index?: number;
  variant?: "default" | "compact" | "featured";
  showImage?: boolean;
}

// Guide-specific icons, gradients, and images
const GUIDE_VISUALS: Record<GuideKey, {
  icon: React.FC<{ className?: string }>;
  gradient: string;
  bgGradient: string;
  image: string;
  imageDark: string;
}> = {
  "ai-social-media-marketing": {
    icon: Brain,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    bgGradient: "from-violet-500/30 via-purple-500/20 to-fuchsia-500/10",
    image: "/images/guides/ai-social-media-marketing.jpg",
    imageDark: "/images/guides/ai-social-media-marketing-dark.jpg",
  },
  "linkedin-automation": {
    icon: Linkedin,
    gradient: "from-blue-500 via-blue-600 to-blue-700",
    bgGradient: "from-blue-500/30 via-blue-600/20 to-blue-700/10",
    image: "/images/guides/linkedin-automation.jpg",
    imageDark: "/images/guides/linkedin-automation-dark.jpg",
  },
  "content-repurposing": {
    icon: RefreshCcw,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    bgGradient: "from-emerald-500/30 via-teal-500/20 to-cyan-500/10",
    image: "/images/guides/content-repurposing.jpg",
    imageDark: "/images/guides/content-repurposing-dark.jpg",
  },
  "social-media-scheduling": {
    icon: CalendarClock,
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    bgGradient: "from-orange-500/30 via-amber-500/20 to-yellow-500/10",
    image: "/images/guides/social-media-scheduling.jpg",
    imageDark: "/images/guides/social-media-scheduling-dark.jpg",
  },
};

const FALLBACK_GRADIENTS = [
  "from-violet-500/20 to-violet-500/5",
  "from-blue-500/20 to-blue-500/5",
  "from-emerald-500/20 to-emerald-500/5",
  "from-amber-500/20 to-amber-500/5",
];

export function GuideCard({ guide, index = 0, variant = "default", showImage = true }: GuideCardProps) {
  const guideVisual = GUIDE_VISUALS[guide.key];
  const fallbackGradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
  const IconComponent = guideVisual?.icon || BookOpen;

  if (variant === "compact") {
    return (
      <Reveal delay={index * 40}>
        <Link
          href={guide.href}
          className="group flex h-full flex-col rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5 dark:bg-white/[0.03] dark:hover:bg-primary/10"
          aria-label={`${guide.title}: ${guide.excerpt}`}
        >
          <div className="flex items-start gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition-transform group-hover:scale-110"
              style={{ backgroundColor: guide.color }}
            >
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {guide.title}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                {guide.excerpt}
              </p>
            </div>
          </div>
        </Link>
      </Reveal>
    );
  }

  if (variant === "featured") {
    return (
      <Reveal delay={index * 60}>
        <Link
          href={guide.href}
          className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg dark:bg-white/[0.04]"
          aria-label={`${guide.title}: ${guide.excerpt}`}
        >
          {/* Brand accent bar */}
          <div
            className="absolute left-0 top-0 h-full w-1 opacity-70 transition-opacity group-hover:opacity-100"
            style={{ backgroundColor: guide.color }}
          />

          {showImage && (
            <div className="relative h-48 overflow-hidden">
              {/* Real guide images with light/dark support */}
              {guideVisual ? (
                <>
                  <Image
                    src={guideVisual.image}
                    alt={`${guide.title} guide`}
                    width={600}
                    height={315}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 dark:hidden"
                  />
                  <Image
                    src={guideVisual.imageDark}
                    alt={`${guide.title} guide`}
                    width={600}
                    height={315}
                    className="hidden h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 dark:block"
                  />
                </>
              ) : (
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br",
                    fallbackGradient
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconComponent className="h-16 w-16 text-foreground/20" />
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span
                className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
                style={{ backgroundColor: guide.color }}
              >
                <BookOpen className="h-3 w-3" />
                Guide
              </span>
            </div>
          )}

          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {guide.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
              {guide.excerpt}
            </p>
            <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
              <span>Read guide</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Hover glow effect */}
          <div
            className="pointer-events-none absolute -right-10 -top-10 -z-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
            style={{ backgroundColor: `${guide.color}20` }}
          />
        </Link>
      </Reveal>
    );
  }

  // Default variant
  return (
    <Reveal delay={index * 50}>
      <Link
        href={guide.href}
        className={cn(
          "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-card/90 dark:bg-white/[0.03] dark:hover:bg-white/[0.05] sm:p-6"
        )}
        aria-label={`${guide.title}: ${guide.excerpt}`}
      >
        {/* Brand color accent */}
        <div
          className="absolute left-0 top-0 h-full w-1 opacity-70 transition-opacity group-hover:opacity-100"
          style={{ backgroundColor: guide.color }}
        />

        {/* Hover glow effect */}
        <div
          className="pointer-events-none absolute -right-10 -top-10 -z-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
          style={{ backgroundColor: `${guide.color}20` }}
        />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl group-hover:text-primary transition-colors">
              {guide.title}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{guide.excerpt}</p>
          </div>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: guide.color }}
          >
            <BookOpen className="h-5 w-5" />
          </span>
        </div>

        {/* Keywords for SEO */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {guide.keywords.slice(0, 3).map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center rounded-full border border-border/50 px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-auto flex items-center gap-2 pt-4">
          <span className="text-sm font-semibold text-primary group-hover:underline">
            Read guide
          </span>
          <ArrowRight
            className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </div>
      </Link>
    </Reveal>
  );
}
