"use client";

/**
 * BioCard — Single bio variation card with text, char counter, keywords,
 * buzzwords, score panel, and action buttons (copy/regen/score).
 */

import { Check, Copy, Loader2, RefreshCcw, Star, ThumbsDown, ThumbsUp } from "lucide-react";

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
  /**
   * Which vote (if any) the user has cast on this card. `null` = no vote yet.
   * We show the icon in "active" state so the user knows their vote registered,
   * but we NEVER show aggregate counts — that stays admin-only.
   */
  vote: "up" | "down" | null;
  voting: boolean;
  onCopy: (platform: BioPlatform, idx: number, text: string) => void;
  onRegenerate: (platform: BioPlatform, idx: number) => void;
  onScore: (platform: BioPlatform, idx: number, text: string) => void;
  onVote: (platform: BioPlatform, idx: number, text: string, vote: "up" | "down") => void;
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
  vote,
  voting,
  onCopy,
  onRegenerate,
  onScore,
  onVote,
}: BioCardProps) {
  const key = `${platform}:${idx}`;
  const usagePct = Math.min(100, Math.round((v.charCount / limit) * 100));
  const overFold = v.charCount > softFold;
  const near = usagePct >= 85 && usagePct < 100;
  const over = !v.withinLimit;
  const isRegen = regenKey === key;
  const isScoring = scoring === key;

  const angleLabel = ["Credibility", "Outcome", "Story"][idx] ?? `Variant ${idx + 1}`;

  return (
    <Card
      className={cn(
        "border-[hsl(var(--border))] transition-shadow hover:shadow-md",
        over && "border-[hsl(var(--destructive))]/50",
      )}
    >
      <CardHeader className="pb-2 pt-3 px-4 flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 min-w-0">
          <Badge
            variant="outline"
            className="border-[hsl(var(--primary))]/40 text-[hsl(var(--primary))] uppercase text-[10px] tracking-wider font-semibold px-2 py-0.5"
          >
            {angleLabel}
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
            "text-xs font-medium tabular-nums shrink-0",
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
      <CardContent className="px-4 pb-4 pt-0 flex flex-col gap-3">
        {/* Bio text — wide, generous padding, reads like a real bio not a chip */}
        <button
          type="button"
          onClick={() => onCopy(platform, idx, v.text)}
          className="text-left rounded-md bg-[hsl(var(--muted))]/40 hover:bg-[hsl(var(--muted))]/70 border border-transparent hover:border-[hsl(var(--border))] px-4 py-3.5 transition group cursor-pointer relative"
          title="Click to copy"
        >
          <p className="text-[15px] leading-[1.65] whitespace-pre-wrap text-[hsl(var(--foreground))]">
            {v.text}
          </p>
          {overFold && platform === "linkedin" && (
            <p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">
              Cut at {softFold} chars on desktop — first line is what most viewers see.
            </p>
          )}
        </button>

        {/* Char usage — thin subtle bar, not the loud orange stripe */}
        <div className="h-0.5 w-full rounded-full bg-[hsl(var(--muted))]/60 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              over
                ? "bg-[hsl(var(--destructive))]"
                : near
                  ? "bg-[hsl(var(--warning))]"
                  : "bg-[hsl(var(--primary))]/50",
            )}
            style={{ width: `${Math.min(100, usagePct)}%` }}
          />
        </div>

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

        {/* Action bar — primary Copy left, ghost regen + score, thumbs right */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="default"
            onClick={() => onCopy(platform, idx, v.text)}
            className="gap-1.5 flex-1 h-9"
          >
            {copiedKey === key ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy bio
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRegenerate(platform, idx)}
            disabled={isRegen}
            className="gap-1.5 h-9 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            title="Regenerate this bio only"
          >
            {isRegen ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Regenerate</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onScore(platform, idx, v.text)}
            disabled={isScoring}
            className="gap-1.5 h-9 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            title="Score this bio 0-100"
          >
            {isScoring ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Star className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{score ? "Rescore" : "Score"}</span>
          </Button>

          {/* Thumbs — one-tap reaction. No counts shown; admin-only aggregates. */}
          <div className="flex items-center rounded-md border border-[hsl(var(--border))] overflow-hidden">
            <button
              type="button"
              onClick={() => onVote(platform, idx, v.text, "up")}
              disabled={voting}
              aria-label="Rate this bio: helpful"
              aria-pressed={vote === "up"}
              title={vote === "up" ? "Marked helpful — tap again to change" : "Helpful"}
              className={cn(
                "inline-flex items-center justify-center h-9 w-9 transition",
                vote === "up"
                  ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--success))]",
                voting && "opacity-60 cursor-wait",
              )}
            >
              {voting && vote === "up" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ThumbsUp className={cn("h-3.5 w-3.5", vote === "up" && "fill-current")} />
              )}
            </button>
            <div className="w-px h-6 bg-[hsl(var(--border))]" aria-hidden />
            <button
              type="button"
              onClick={() => onVote(platform, idx, v.text, "down")}
              disabled={voting}
              aria-label="Rate this bio: not helpful"
              aria-pressed={vote === "down"}
              title={vote === "down" ? "Marked not helpful — tap again to change" : "Not helpful"}
              className={cn(
                "inline-flex items-center justify-center h-9 w-9 transition",
                vote === "down"
                  ? "bg-[hsl(var(--destructive))]/15 text-[hsl(var(--destructive))]"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--destructive))]",
                voting && "opacity-60 cursor-wait",
              )}
            >
              {voting && vote === "down" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ThumbsDown className={cn("h-3.5 w-3.5", vote === "down" && "fill-current")} />
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
