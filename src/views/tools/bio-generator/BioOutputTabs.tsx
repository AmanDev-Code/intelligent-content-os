"use client";

/**
 * BioOutputTabs — Platform tabs + single-card carousel for bio variations.
 *
 * Instead of stacking all 3 bios vertically (which made the page feel like a
 * wall of text), we show ONE bio at a time with prev/next arrows. The user
 * flips through Credibility → Outcome → Story within the current platform tab.
 * Dot indicators at the bottom show position.
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { BioPlatform, BioPlatformResult, BioScoreResult } from "./types";
import { platformById } from "./constants";
import { BioCard } from "./BioCard";
import { cn } from "@/lib/utils";

interface BioOutputTabsProps {
  results: BioPlatformResult[];
  activeTab: BioPlatform | null;
  setActiveTab: (v: BioPlatform | null) => void;
  pendingPlatforms: Set<BioPlatform>;
  scores: Record<string, BioScoreResult>;
  scoring: string | null;
  copiedKey: string | null;
  regenKey: string | null;
  votes: Record<string, "up" | "down">;
  votingKey: string | null;
  onCopy: (platform: BioPlatform, idx: number, text: string) => void;
  onRegenerate: (platform: BioPlatform, idx: number) => Promise<void>;
  onScore: (platform: BioPlatform, idx: number, text: string) => Promise<void>;
  onVote: (platform: BioPlatform, idx: number, text: string, vote: "up" | "down") => Promise<void>;
}

export function BioOutputTabs({
  results,
  activeTab,
  setActiveTab,
  pendingPlatforms,
  scores,
  scoring,
  copiedKey,
  regenKey,
  votes,
  votingKey,
  onCopy,
  onRegenerate,
  onScore,
  onVote,
}: BioOutputTabsProps) {
  // Track the current variation index per platform so flipping tabs remembers position.
  const [indices, setIndices] = useState<Record<string, number>>({});

  if (!activeTab || (results.length === 0 && pendingPlatforms.size === 0)) {
    return null;
  }

  const setIdx = (platform: BioPlatform, idx: number) =>
    setIndices((prev) => ({ ...prev, [platform]: idx }));

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BioPlatform)}>
      <TabsList className="mb-4 flex flex-wrap gap-1 h-auto p-1 bg-[hsl(var(--muted))]/60">
        {results.map((r) => {
          const p = platformById(r.platform);
          const Icon = p.Icon;
          return (
            <TabsTrigger
              key={r.platform}
              value={r.platform}
              className="data-[state=active]:bg-[hsl(var(--card))] data-[state=active]:text-[hsl(var(--foreground))] gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{p.label}</span>
              <Badge variant="secondary" className="ml-1 text-[10px] h-4">
                {r.variations.length}
              </Badge>
            </TabsTrigger>
          );
        })}
        {/* Pending platforms — greyed-out placeholders with spinner */}
        {Array.from(pendingPlatforms).map((platform) => {
          const p = platformById(platform);
          const Icon = p.Icon;
          return (
            <div
              key={`pending-${platform}`}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-[hsl(var(--muted-foreground))] opacity-70"
              aria-live="polite"
              aria-label={`Generating ${p.label} bios`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{p.label}</span>
              <Loader2 className="h-3 w-3 animate-spin ml-0.5" />
            </div>
          );
        })}
      </TabsList>

      {results.map((r) => {
        const p = platformById(r.platform);
        const currentIdx = indices[r.platform] ?? 0;
        const count = r.variations.length;
        const variation = r.variations[currentIdx];
        if (!variation) return null;
        const key = `${r.platform}:${currentIdx}`;

        return (
          <TabsContent key={r.platform} value={r.platform} className="mt-0 space-y-3">
            {/* Meta strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[hsl(var(--muted))]/30 px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <span className="font-medium text-[hsl(var(--foreground))]">{p.label}</span>
                <span>·</span>
                <span>{r.limit.toLocaleString()} char limit</span>
                {r.softFold < r.limit && (
                  <>
                    <span>·</span>
                    <span>first {r.softFold} chars visible before truncation</span>
                  </>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                {currentIdx + 1} / {count}
              </span>
            </div>

            {/* Carousel: single card + navigation */}
            <div className="relative">
              {/* Prev arrow */}
              {count > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setIdx(r.platform, (currentIdx - 1 + count) % count)
                  }
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 h-8 w-8 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm hover:bg-[hsl(var(--muted))] hidden lg:flex"
                  aria-label="Previous bio variation"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}

              {/* The card */}
              <BioCard
                platform={r.platform}
                variation={variation}
                variationIndex={currentIdx}
                limit={r.limit}
                softFold={r.softFold}
                score={scores[key]}
                copiedKey={copiedKey}
                regenKey={regenKey}
                scoring={scoring}
                vote={votes[key] ?? null}
                voting={votingKey === key}
                onCopy={onCopy}
                onRegenerate={onRegenerate}
                onScore={onScore}
                onVote={onVote}
              />

              {/* Next arrow */}
              {count > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setIdx(r.platform, (currentIdx + 1) % count)
                  }
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 h-8 w-8 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm hover:bg-[hsl(var(--muted))] hidden lg:flex"
                  aria-label="Next bio variation"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Dots + mobile prev/next */}
            {count > 1 && (
              <div className="flex items-center justify-center gap-3 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setIdx(r.platform, (currentIdx - 1 + count) % count)
                  }
                  className="lg:hidden h-7 px-2 text-xs gap-1 text-[hsl(var(--muted-foreground))]"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </Button>

                <div className="flex items-center gap-1.5">
                  {r.variations.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setIdx(r.platform, dotIdx)}
                      aria-label={`Show variation ${dotIdx + 1}`}
                      aria-current={dotIdx === currentIdx}
                      className={cn(
                        "h-2 rounded-full transition-all",
                        dotIdx === currentIdx
                          ? "w-5 bg-[hsl(var(--primary))]"
                          : "w-2 bg-[hsl(var(--muted-foreground))]/40 hover:bg-[hsl(var(--muted-foreground))]/70",
                      )}
                    />
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setIdx(r.platform, (currentIdx + 1) % count)
                  }
                  className="lg:hidden h-7 px-2 text-xs gap-1 text-[hsl(var(--muted-foreground))]"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
