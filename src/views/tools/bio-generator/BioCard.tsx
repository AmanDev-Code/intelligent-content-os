"use client";

/**
 * BioCard — Single bio variation card with text, char counter, keywords,
 * buzzwords, score panel, and action buttons (copy/regen/score).
 */

import { Check, Copy, Loader2, RefreshCcw, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import type { BioPlatform, BioPlatformResult, BioScoreResult, BioVariation } from "./types";
import { BioScorePanel } from "./BioScorePanel";

interface BioCardProps {
  platform: BioPlatform;
  variation: BioVariation;
  variationIndex: number;
  limit: number;
  softFold: number;
  score?: BioScoreResult;
  copiedKey: string | null;
  regenKey: string | null;
  scoring: string | null;
  onCopy: (platform: BioPlatform, idx: number, text: string) => void;
  onRegenerate: (platform: BioPlatform, idx: number) => void;
  onScore: (platform: BioPlatform, idx: number, text: string) => void;
}

export function BioCard({
  platform,
  variation: v,
  variationIndex: idx,
  limit,
  softFold,
  score,
  copiedKey,
  regenKey,
  scoring,
  onCopy,
  onRegenerate,
  onScore,
}: BioCardProps) {
  const key = `${platform}:${idx}`;
  const usagePct = Math.min(100, Math.round((v.charCount / limit) * 100));
  const overFold = v.charCount > softFold;
  const near = usagePct >= 85 && usagePct < 100;
  const over = !v.withinLimit;
  const isRegen = regenKey === key;
  const isScoring = scoring === key;

  return (
    <Card
      className={cn(
        "flex flex-col border-[hsl(var(--border))] transition-shadow hover:shadow-md",
        over && "border-[hsl(var(--destructive))]/50",
      )}
    >
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-[hsl(var(--primary))]/40 text-[hsl(var(--primary))]"
          >
            {["credibility", "outcome", "story"][idx] ?? `variant ${idx + 1}`}
          </Badge>
          {v.buzzwordsFound && v.buzzwordsFound.length > 0 && (
            <Badge
              variant="outline"
              className="border-[hsl(var(--warning))]/40 text-[hsl(var(--warning))] text-[10px]"
              title={`Contains: ${v.buzzwordsFound.join(", ")}`}
            >
              {v.buzzwordsFound.length} buzzword{v.buzzwordsFound.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <span
          className={cn(
            "text-xs font-medium tabular-nums",
            over
              ? "text-[hsl(var(--destructive))]"
              : near
                ? "text-[hsl(var(--warning))]"
                : "text-[hsl(var(--muted-foreground))]",
          )}
        >
          {v.charCount}/{limit}
        </span>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onCopy(platform, idx, v.text)}
          className="text-left rounded-md bg-[hsl(var(--muted))]/50 hover:bg-[hsl(var(--muted))] p-3 transition group cursor-pointer relative"
          title="Click to copy"
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed text-[hsl(var(--foreground))]">
            {v.text}
          </p>
          {overFold && platform === "linkedin" && (
            <p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">
              Cut at {softFold} chars on desktop — first line is what most viewers see.
            </p>
          )}
        </button>

        {/* Char usage bar */}
        <Progress
          value={usagePct}
          className={cn(
            "h-1.5",
            over
              ? "[&>div]:bg-[hsl(var(--destructive))]"
              : near
                ? "[&>div]:bg-[hsl(var(--warning))]"
                : "[&>div]:bg-[hsl(var(--primary))]",
          )}
        />

        {/* Recruiter keywords (LinkedIn) */}
        {platform === "linkedin" && v.keywordsFound && v.keywordsFound.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {v.keywordsFound.slice(0, 6).map((kw) => (
              <Badge
                key={kw}
                variant="outline"
                className="border-[hsl(var(--success))]/40 text-[hsl(var(--success))] text-[10px] font-normal"
              >
                {kw}
              </Badge>
            ))}
          </div>
        )}

        {/* Score */}
        {score && <BioScorePanel score={score} />}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => onCopy(platform, idx, v.text)}
            className="gap-1.5 flex-1 min-w-[100px]"
          >
            {copiedKey === key ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedKey === key ? "Copied" : "Copy"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRegenerate(platform, idx)}
            disabled={isRegen}
            className="gap-1.5"
            title="Regenerate this card only"
          >
            {isRegen ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onScore(platform, idx, v.text)}
            disabled={isScoring}
            className="gap-1.5"
            title="Score this bio 0-100"
          >
            {isScoring ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Star className="h-3.5 w-3.5" />
            )}
            {score ? "Rescore" : "Score"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
