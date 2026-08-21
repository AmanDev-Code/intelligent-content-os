"use client";

/**
 * BioScorePanel — 5-dimension score display with tips.
 */

import { cn } from "@/lib/utils";
import type { BioScoreResult } from "./types";

interface BioScorePanelProps {
  score: BioScoreResult;
}

function scoreColor(value: number, max = 20): string {
  const pct = value / max;
  if (pct >= 0.85) return "text-[hsl(var(--success))]";
  if (pct >= 0.6) return "text-[hsl(var(--primary))]";
  if (pct >= 0.35) return "text-[hsl(var(--warning))]";
  return "text-[hsl(var(--destructive))]";
}

export function BioScorePanel({ score }: BioScorePanelProps) {
  return (
    <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Bio score</span>
        <span className={cn("text-lg font-bold tabular-nums", scoreColor(score.overall, 100))}>
          {score.overall}
          <span className="text-xs text-[hsl(var(--muted-foreground))]">/100</span>
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1 text-[10px] text-center">
        {(
          [
            ["Hook", score.dimensions.hook],
            ["Clarity", score.dimensions.clarity],
            ["Fit", score.dimensions.platformFit],
            ["Impact", score.dimensions.impact],
            ["Original", score.dimensions.originality],
          ] as Array<[string, number]>
        ).map(([lbl, n]) => (
          <div key={lbl} className="space-y-0.5">
            <div className={cn("font-bold tabular-nums", scoreColor(n))}>{n}</div>
            <div className="text-[hsl(var(--muted-foreground))]">{lbl}</div>
          </div>
        ))}
      </div>
      {score.tips.length > 0 && (
        <ul className="pt-1 border-t border-[hsl(var(--border))] space-y-1">
          {score.tips.map((tip, i) => (
            <li key={i} className="text-[11px] text-[hsl(var(--muted-foreground))] flex gap-1.5">
              <span className="text-[hsl(var(--primary))]">→</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
