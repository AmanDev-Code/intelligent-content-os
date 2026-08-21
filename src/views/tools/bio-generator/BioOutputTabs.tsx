"use client";

/**
 * BioOutputTabs — Tabs for per-platform result cards with copy/regen/score.
 * Renders the platform tabs + pending platform indicators + BioCard grid.
 */

import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { BioPlatform, BioPlatformResult, BioScoreResult } from "./types";
import { platformById } from "./constants";
import { BioCard } from "./BioCard";

interface BioOutputTabsProps {
  results: BioPlatformResult[];
  activeTab: BioPlatform | null;
  setActiveTab: (v: BioPlatform | null) => void;
  pendingPlatforms: Set<BioPlatform>;
  scores: Record<string, BioScoreResult>;
  scoring: string | null;
  copiedKey: string | null;
  regenKey: string | null;
  onCopy: (platform: BioPlatform, idx: number, text: string) => void;
  onRegenerate: (platform: BioPlatform, idx: number) => Promise<void>;
  onScore: (platform: BioPlatform, idx: number, text: string) => Promise<void>;
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
  onCopy,
  onRegenerate,
  onScore,
}: BioOutputTabsProps) {
  if (!activeTab || (results.length === 0 && pendingPlatforms.size === 0)) {
    return null;
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BioPlatform)}>
      <TabsList className="mb-6 flex flex-wrap gap-1 h-auto p-1 bg-[hsl(var(--muted))]/60">
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
        return (
          <TabsContent key={r.platform} value={r.platform} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {r.variations.map((v, idx) => (
                <BioCard
                  key={`${r.platform}:${idx}`}
                  platform={r.platform}
                  variation={v}
                  variationIndex={idx}
                  limit={r.limit}
                  softFold={r.softFold}
                  score={scores[`${r.platform}:${idx}`]}
                  copiedKey={copiedKey}
                  regenKey={regenKey}
                  scoring={scoring}
                  onCopy={onCopy}
                  onRegenerate={onRegenerate}
                  onScore={onScore}
                />
              ))}
            </div>

            <p className="text-xs text-[hsl(var(--muted-foreground))] text-center pt-2">
              {p.label} limit: {r.limit.toLocaleString()} chars &bull; First {r.softFold} chars
              visible before truncation
            </p>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
