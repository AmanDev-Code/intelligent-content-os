"use client";

/**
 * BioPendingState — Loading/pending state shown while platforms are still generating.
 */

import { Loader2, Trophy } from "lucide-react";
import type { BioPlatform } from "./types";
import { platformById } from "./constants";

interface BioPendingStateProps {
  isGenerating: boolean;
  pendingPlatforms: Set<BioPlatform>;
  hasResults: boolean;
}

export function BioPendingState({ isGenerating, pendingPlatforms, hasResults }: BioPendingStateProps) {
  // Generating with no results yet — full loading state
  if (!hasResults && isGenerating) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border-2 border-dashed border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/5 p-10 text-center space-y-3">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        <h3 className="font-heading text-lg text-[hsl(var(--foreground))]">Writing your first bios…</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Each platform streams in as it finishes — you won&apos;t wait for the slowest one.
        </p>
        {pendingPlatforms.size > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {Array.from(pendingPlatforms).map((platform) => {
              const p = platformById(platform);
              const Icon = p.Icon;
              return (
                <span
                  key={platform}
                  className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 py-0.5 text-[11px] text-[hsl(var(--muted-foreground))]"
                >
                  <Icon className="h-3 w-3" />
                  {p.label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Empty state — no results, not generating
  if (!hasResults && !isGenerating) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border-2 border-dashed border-[hsl(var(--border))] p-10 text-center space-y-3">
        <Trophy className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))]" />
        <h3 className="font-heading text-lg text-[hsl(var(--foreground))]">Your bios will appear here</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Fill the form above and hit generate. You get 3 variations per platform (credibility / outcome / positioning angles). Each platform streams in the moment it&apos;s ready.
        </p>
      </div>
    );
  }

  return null;
}
