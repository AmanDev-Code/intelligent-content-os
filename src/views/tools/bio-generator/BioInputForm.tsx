"use client";

/**
 * BioInputForm — The entire form card for the Bio Generator.
 *
 * Layout matches BioLoom's clean pattern:
 * 1. Target Platform — horizontal scrolling tabs (not grid cards)
 * 2. About Yourself — textarea with char counter + Templates/Example
 * 3. Type + Tone — side by side dropdowns
 * 4. Focus Areas — chip multi-select (max 3)
 * 5. Written for + Add Emojis — dropdown + toggle
 * 6. Bio Length — segmented control (Short/Punchy, Balanced/Ideal, Full/Rich)
 * 7. Generate button — full width
 */

import { memo } from "react";
import {
  Award,
  BookOpen,
  Flame,
  Leaf,
  PenLine,
  Rocket,
  Smile,
  Sparkles,
  Target,
  Trophy,
  Wand2,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PLATFORMS, TONES, ROLE_TEMPLATES, FOCUS_AREAS } from "./constants";
import type { BioPlatform, BioTone, BioLength, BioType } from "./types";

interface BioInputFormProps {
  role: string;
  setRole: (v: string) => void;
  facts: string;
  setFacts: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
  audience: string;
  setAudience: (v: string) => void;
  length: BioLength;
  setLength: (v: BioLength) => void;
  emojis: boolean;
  setEmojis: (v: boolean) => void;
  tone: BioTone;
  setTone: (v: BioTone) => void;
  bioType: BioType;
  setBioType: (v: BioType) => void;
  focusAreas: string[];
  platforms: BioPlatform[];
  togglePlatform: (id: BioPlatform) => void;
  toggleFocusArea: (id: string) => void;
  loadTemplate: (tpl: { role: string; facts: string; goal: string; audience: string; label: string }) => void;
  isGenerating: boolean;
  submit: () => Promise<void>;
}

export const BioInputForm = memo(function BioInputForm({
  role,
  setRole,
  facts,
  setFacts,
  goal,
  setGoal,
  audience,
  setAudience,
  length,
  setLength,
  emojis,
  setEmojis,
  tone,
  setTone,
  bioType,
  setBioType,
  focusAreas,
  platforms,
  togglePlatform,
  toggleFocusArea,
  loadTemplate,
  isGenerating,
  submit,
}: BioInputFormProps) {
  return (
    <Card className="border-[hsl(var(--border))] shadow-lg shadow-[hsl(var(--primary))]/5 overflow-hidden">
      <CardContent className="p-0">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-[hsl(var(--primary))]" />
            Tell us about you
          </h2>
          <div className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
            <kbd className="rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-1.5 py-0.5 font-mono text-[10px]">
              ⌘/Ctrl + Enter
            </kbd>
            <span>to generate</span>
          </div>
        </div>

        {/* ── 1. Target Platform — horizontal scrolling tabs ──────── */}
        <div className="px-5 pb-4">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">
            Target Platform
          </p>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {PLATFORMS.map((p) => {
              const active = platforms.includes(p.id);
              const Icon = p.Icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition whitespace-nowrap",
                    active
                      ? "border border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/60",
                  )}
                  aria-pressed={active}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {p.label}
                  {active && (
                    <Badge variant="secondary" className="ml-0.5 text-[9px] h-4 px-1 font-bold">
                      {p.maxChars}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="border-t border-[hsl(var(--border))]" />

        {/* ── 2. Your Info section ────────────────────────────────── */}
        <div className="px-5 pt-4 pb-5 space-y-4">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            Your Info
          </p>

          {/* About Yourself */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio-about" className="text-sm font-medium">
                About Yourself <span className="text-[hsl(var(--destructive))]">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
                  {role.length}/500
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const tpl = ROLE_TEMPLATES[Math.floor(Math.random() * ROLE_TEMPLATES.length)]!;
                    loadTemplate(tpl);
                  }}
                  className="text-xs text-[hsl(var(--primary))] hover:underline font-medium"
                >
                  Templates
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole("Senior software engineer at a Series B fintech. Python, TypeScript, distributed systems, 8 years, ex-Stripe.");
                    toast.success("Example loaded — edit to match you");
                  }}
                  className="text-xs text-[hsl(var(--primary))] hover:underline font-medium"
                >
                  Example
                </button>
              </div>
            </div>
            <Textarea
              id="bio-about"
              value={role}
              onChange={(e) => setRole(e.target.value.slice(0, 500))}
              placeholder="Describe yourself — role, wins, personality, and what makes you unique."
              rows={4}
              maxLength={500}
              className="resize-none text-sm"
            />
          </div>

          {/* Type + Tone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Type</Label>
              <Select value={bioType} onValueChange={(v) => setBioType(v as BioType)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                Personal = "I'm a…" • Brand = "we / company name"
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as BioTone)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Focus Areas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Focus Areas{" "}
                <span className="text-[hsl(var(--muted-foreground))] font-normal text-[11px]">
                  (pick up to 3)
                </span>
              </Label>
              <span className="text-[11px] tabular-nums text-[hsl(var(--muted-foreground))]">
                {focusAreas.length}/3 selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {FOCUS_AREAS.map((f) => {
                const active = focusAreas.includes(f.id);
                const Icon = f.Icon;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFocusArea(f.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition",
                      active
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                        : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/50 hover:text-[hsl(var(--foreground))]",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written for + Emojis */}
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-sm font-medium">Written for</Label>
              <Select value={audience || "general"} onValueChange={setAudience}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General audience</SelectItem>
                  <SelectItem value="recruiters">Recruiters</SelectItem>
                  <SelectItem value="clients">Potential clients</SelectItem>
                  <SelectItem value="peers">Industry peers</SelectItem>
                  <SelectItem value="followers">Followers / fans</SelectItem>
                  <SelectItem value="investors">Investors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-0.5">
              <Switch
                id="bio-emojis"
                checked={emojis}
                onCheckedChange={setEmojis}
              />
              <Label htmlFor="bio-emojis" className="text-xs text-[hsl(var(--muted-foreground))] cursor-pointer whitespace-nowrap">
                Add Emojis
              </Label>
            </div>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="border-t border-[hsl(var(--border))]" />

        {/* ── Settings section ─────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-5 space-y-4">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            Settings
          </p>

          {/* Bio Length */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Bio Length</Label>
            <div className="grid grid-cols-3 rounded-lg border border-[hsl(var(--border))] overflow-hidden">
              {([
                { id: "short" as const, label: "Short", sub: "Punchy" },
                { id: "medium" as const, label: "Balanced", sub: "Ideal" },
                { id: "long" as const, label: "Full", sub: "Rich" },
              ]).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLength(opt.id)}
                  className={cn(
                    "py-2.5 px-3 text-center transition",
                    length === opt.id
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                      : "bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/60 hover:text-[hsl(var(--foreground))]",
                  )}
                >
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className={cn(
                    "text-[10px]",
                    length === opt.id ? "text-[hsl(var(--primary-foreground))]/70" : "text-[hsl(var(--muted-foreground))]"
                  )}>
                    {opt.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Generate button ──────────────────────────────────────── */}
        <div className="px-5 pb-5">
          <Button
            size="lg"
            onClick={submit}
            disabled={isGenerating || !role.trim() || platforms.length === 0}
            className="w-full gap-2 h-12 text-base"
          >
            {isGenerating ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-5.07-2.83 2.83M8.76 15.24l-2.83 2.83m12.14 0-2.83-2.83M8.76 8.76 5.93 5.93" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Generate {platforms.length} × 3 bios
              </>
            )}
          </Button>
          <p className="text-center text-[11px] text-[hsl(var(--muted-foreground))] mt-2">
            Press <kbd className="rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-1 py-0.5 font-mono text-[10px]">⌘ ↵</kbd> to generate
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
