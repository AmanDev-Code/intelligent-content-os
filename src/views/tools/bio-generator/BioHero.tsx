"use client";

/**
 * BioHero — Hero section with alias-variant support for the Bio Generator tool.
 */

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BioGeneratorViewHeroVariant } from "./types";

interface BioHeroProps {
  variant?: BioGeneratorViewHeroVariant;
}

const DEFAULT_HERO: BioGeneratorViewHeroVariant = {
  h1Prefix: "Write your",
  h1Highlight: "bio",
  h1Suffix: "for every platform in 30 seconds.",
  eyebrow: "AI-powered • Free forever • No login • 6 platforms in one run",
  subline:
    "Type your role and one outcome. AI writes 3 bio variations for LinkedIn, Instagram, X, TikTok, GitHub, and YouTube — each tuned to the platform.",
};

export function BioHero({ variant }: BioHeroProps) {
  const hero = variant ?? DEFAULT_HERO;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:pt-16 sm:pb-10">
      <div className="mx-auto max-w-3xl text-center space-y-4">
        <Badge
          variant="outline"
          className="mx-auto inline-flex items-center gap-1.5 border-[hsl(var(--primary))]/40 text-[hsl(var(--primary))]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {hero.eyebrow}
        </Badge>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          {hero.h1Prefix}{" "}
          <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70 bg-clip-text text-transparent">
            {hero.h1Highlight}
          </span>{" "}
          {hero.h1Suffix}
        </h1>
        <p className="text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
          {hero.subline}
        </p>
      </div>
    </section>
  );
}
