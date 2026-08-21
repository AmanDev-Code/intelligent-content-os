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

import { memo, useEffect, useRef, useState } from "react";
import {
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { PLATFORMS, TONES, ROLE_TEMPLATES, FOCUS_AREAS, AUDIENCE_OPTIONS } from "./constants";
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

/**
 * PlatformStrip — Compact platform row.
 * - Icon-only pills so all 7 platforms fit in a row on desktop
 * - No visible scrollbar; a chevron appears when there's more to the right
 * - Active pill shows the char-count badge inline
 */
function PlatformStrip({
  platforms,
  togglePlatform,
}: {
  platforms: BioPlatform[];
  togglePlatform: (id: BioPlatform) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasOverflowLeft, setHasOverflowLeft] = useState(false);
  const [hasOverflowRight, setHasOverflowRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setHasOverflowLeft(el.scrollLeft > 4);
      setHasOverflowRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="px-5 pb-3">
      <p className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1.5">
        Target Platform
      </p>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {PLATFORMS.map((p) => {
            const active = platforms.includes(p.id);
            const Icon = p.Icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlatform(p.id)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium transition whitespace-nowrap",
                  active
                    ? "border border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/60",
                )}
                aria-pressed={active}
                title={`${p.label} — ${p.hint}`}
              >
                <Icon className="h-3 w-3 shrink-0" />
                <span>{p.label}</span>
                {active && (
                  <Badge variant="secondary" className="ml-0.5 text-[9px] h-3 px-1 font-bold">
                    {p.maxChars}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
        {hasOverflowLeft && (
          <button
            type="button"
            aria-label="Scroll platforms left"
            onClick={() => scrollRef.current?.scrollBy({ left: -120, behavior: "smooth" })}
            className="absolute left-0 top-0 bottom-0 flex items-center justify-start pr-8 pl-1 bg-gradient-to-r from-[hsl(var(--card))] via-[hsl(var(--card))]/85 to-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {hasOverflowRight && (
          <button
            type="button"
            aria-label="Scroll platforms right"
            onClick={() => scrollRef.current?.scrollBy({ left: 120, behavior: "smooth" })}
            className="absolute right-0 top-0 bottom-0 flex items-center justify-end pl-8 pr-1 bg-gradient-to-l from-[hsl(var(--card))] via-[hsl(var(--card))]/85 to-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * PopoverClose — Single template row inside the Templates popover.
 * Clicking loads the template AND closes the popover (via a synthetic click
 * on the trigger, since Radix's PopoverClose primitive isn't imported here).
 */
function PopoverClose({
  tpl,
  onSelect,
}: {
  tpl: (typeof ROLE_TEMPLATES)[number];
  onSelect: (t: (typeof ROLE_TEMPLATES)[number]) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        onSelect(tpl);
        // Close the popover by dispatching Escape (Radix listens for it).
        e.currentTarget.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      }}
      className="text-left rounded-md px-2 py-1.5 hover:bg-[hsl(var(--muted))]/60 transition"
    >
      <div className="text-xs font-medium text-[hsl(var(--foreground))]">{tpl.label}</div>
      <div className="text-[10px] text-[hsl(var(--muted-foreground))] line-clamp-1">
        {tpl.role}
      </div>
    </button>
  );
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
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="font-heading text-base font-semibold flex items-center gap-2">
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

        {/* ── 1. Target Platform — compact pills with chevron indicator ─ */}
        <PlatformStrip
          platforms={platforms}
          togglePlatform={togglePlatform}
        />

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="border-t border-[hsl(var(--border))]" />

        {/* ── 2. Your Info section ────────────────────────────────── */}
        <div className="px-5 pt-3 pb-3 space-y-3">
          <p className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            Your Info
          </p>

          {/* About Yourself */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio-about" className="text-xs font-medium">
                About Yourself <span className="text-[hsl(var(--destructive))]">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] tabular-nums text-[hsl(var(--muted-foreground))]">
                  {role.length}/500
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="text-[11px] text-[hsl(var(--primary))] hover:underline font-medium"
                    >
                      Templates
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={6}
                    className="w-80 p-1 max-h-[320px] overflow-y-auto"
                  >
                    <p className="px-2 pt-1.5 pb-1 text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-medium">
                      Pick a starter — you can edit after
                    </p>
                    <div className="flex flex-col">
                      {ROLE_TEMPLATES.map((tpl) => (
                        <PopoverClose key={tpl.label} tpl={tpl} onSelect={loadTemplate} />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <button
                  type="button"
                  onClick={() => {
                    setRole("Senior software engineer at a Series B fintech. Python, TypeScript, distributed systems, 8 years, ex-Stripe.");
                    toast.success("Example loaded — edit to match you");
                  }}
                  className="text-[11px] text-[hsl(var(--primary))] hover:underline font-medium"
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
              rows={3}
              maxLength={500}
              className="resize-none text-sm"
            />
          </div>

          {/* Type + Tone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Type</Label>
              <Select value={bioType} onValueChange={(v) => setBioType(v as BioType)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as BioTone)}>
                <SelectTrigger className="h-8 text-sm">
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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">
                Focus Areas{" "}
                <span className="text-[hsl(var(--muted-foreground))] font-normal text-[10px]">
                  (pick up to 3)
                </span>
              </Label>
              <span className="text-[10px] tabular-nums text-[hsl(var(--muted-foreground))]">
                {focusAreas.length}/3 selected
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {FOCUS_AREAS.map((f) => {
                const active = focusAreas.includes(f.id);
                const Icon = f.Icon;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFocusArea(f.id)}
                    className={cn(
                      "inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition",
                      active
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                        : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/50 hover:text-[hsl(var(--foreground))]",
                    )}
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written for + Emojis */}
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs font-medium">Written for</Label>
              <Select value={audience || "general"} onValueChange={setAudience}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Switch
                id="bio-emojis"
                checked={emojis}
                onCheckedChange={setEmojis}
              />
              <Label htmlFor="bio-emojis" className="text-[11px] text-[hsl(var(--muted-foreground))] cursor-pointer whitespace-nowrap">
                Add Emojis
              </Label>
            </div>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="border-t border-[hsl(var(--border))]" />

        {/* ── Settings + Bio Length ─────────────────────────────────── */}
        <div className="px-5 pt-3 pb-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
              Bio Length
            </p>
          </div>
          <div className="grid grid-cols-3 rounded-md border border-[hsl(var(--border))] overflow-hidden">
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
                  "py-1.5 px-3 text-center transition",
                  length === opt.id
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/60 hover:text-[hsl(var(--foreground))]",
                )}
              >
                <div className="text-xs font-medium leading-tight">{opt.label}</div>
                <div className={cn(
                  "text-[9px] leading-tight",
                  length === opt.id ? "text-[hsl(var(--primary-foreground))]/70" : "text-[hsl(var(--muted-foreground))]"
                )}>
                  {opt.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Generate button ──────────────────────────────────────── */}
        <div className="px-5 pb-4 pt-1">
          <Button
            size="default"
            onClick={submit}
            disabled={isGenerating || !role.trim() || platforms.length === 0}
            className="w-full gap-2 h-10 text-sm"
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
        </div>
      </CardContent>
    </Card>
  );
});
