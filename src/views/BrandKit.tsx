"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Palette,
  Loader2,
  Plus,
  X,
  Upload,
  Sparkles,
  ImageIcon,
  Wand2,
  Trash2,
  Type,
  MessageSquareQuote,
  Images,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/error-handler";
import {
  uploadImageFile,
  ACCEPT_IMAGE,
} from "@/components/media/uploadImageFile";
import { ColorPicker, HEX_RE } from "@/components/brand/ColorPicker";
import type {
  BrandProfile,
  BrandProfileInput,
  BrandAsset,
  ExtractedBrandKit,
} from "@/types/brandProfile";

const MAX_VOICE_EXAMPLES = 5;
const MAX_ASSETS = 20;
const MAX_ASSET_BYTES = 10 * 1024 * 1024;
const SMART_IMPORT_COST = 0.5;

interface BrandFormState {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tone: string;
  targetAudience: string;
  voiceExamples: string[];
  doUse: string[];
  doNotUse: string[];
  additionalInformation: string;
  assets: BrandAsset[];
}

function emptyForm(): BrandFormState {
  return {
    name: "",
    logoUrl: null,
    primaryColor: "",
    secondaryColor: "",
    accentColor: "",
    tone: "",
    targetAudience: "",
    voiceExamples: [""],
    doUse: [],
    doNotUse: [],
    additionalInformation: "",
    assets: [],
  };
}

function profileToForm(p: BrandProfile): BrandFormState {
  return {
    name: p.name ?? "",
    logoUrl: p.logo_url,
    primaryColor: p.primary_color ?? "",
    secondaryColor: p.secondary_color ?? "",
    accentColor: p.accent_color ?? "",
    tone: p.tone ?? "",
    targetAudience: p.target_audience ?? "",
    voiceExamples: p.voice_examples?.length ? p.voice_examples : [""],
    doUse: p.do_use ?? [],
    doNotUse: p.do_not_use ?? [],
    additionalInformation: p.additional_information ?? "",
    assets: Array.isArray(p.assets) ? p.assets : [],
  };
}

function formToPayload(f: BrandFormState): BrandProfileInput {
  const norm = (c: string) => (c.trim() ? c.trim() : null);
  return {
    name: f.name.trim(),
    logoUrl: f.logoUrl,
    primaryColor: norm(f.primaryColor),
    secondaryColor: norm(f.secondaryColor),
    accentColor: norm(f.accentColor),
    tone: f.tone.trim() || null,
    targetAudience: f.targetAudience.trim() || null,
    voiceExamples: f.voiceExamples.map((v) => v.trim()).filter(Boolean),
    doUse: f.doUse,
    doNotUse: f.doNotUse,
    additionalInformation: f.additionalInformation.trim() || null,
    assets: f.assets,
  };
}

const safeHex = (c: string) => (HEX_RE.test(c.trim()) ? c.trim() : undefined);

/** Compact section heading used inside the editor card. */
function SectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Type;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h2 className="text-sm font-semibold">{title}</h2>
      {hint && (
        <span className="text-[11px] text-muted-foreground">· {hint}</span>
      )}
    </div>
  );
}

/** Chip-style list for the do/don't vocabulary lists. */
function TagInput({
  values,
  onChange,
  accent,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  accent: "use" | "avoid";
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (!values.some((x) => x.toLowerCase() === v.toLowerCase())) {
      onChange([...values, v]);
    }
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={accent === "use" ? "Add a word to favor" : "Add a word to avoid"}
          className="h-9"
        />
        <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <Badge
              key={v}
              variant="secondary"
              className={
                accent === "avoid"
                  ? "gap-1 bg-destructive/10 text-destructive hover:bg-destructive/15"
                  : "gap-1"
              }
            >
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="ml-0.5 rounded-full hover:bg-foreground/10"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function CompletenessRing({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx={32} cy={32} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={6} />
        <circle
          cx={32}
          cy={32}
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
        {value}%
      </span>
    </div>
  );
}

export default function BrandKit() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assetUploading, setAssetUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [smartText, setSmartText] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [form, setForm] = useState<BrandFormState>(emptyForm());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const assetInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof BrandFormState>(key: K, value: BrandFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.brandProfiles.list();
        if (cancelled) return;
        if (list.length > 0) {
          setProfileId(list[0].id);
          setForm(profileToForm(list[0]));
        }
      } catch (error) {
        if (!cancelled) toast.error(getErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const colorsValid = useMemo(
    () =>
      [form.primaryColor, form.secondaryColor, form.accentColor].every(
        (c) => !c.trim() || HEX_RE.test(c.trim()),
      ),
    [form.primaryColor, form.secondaryColor, form.accentColor],
  );

  const completeness = useMemo(() => {
    const checks = [
      form.name.trim(),
      form.logoUrl,
      form.primaryColor.trim(),
      form.secondaryColor.trim(),
      form.accentColor.trim(),
      form.tone.trim(),
      form.targetAudience.trim(),
      form.voiceExamples.some((v) => v.trim()),
      form.doUse.length > 0,
      form.doNotUse.length > 0,
      form.additionalInformation.trim(),
      form.assets.length > 0,
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  }, [form]);

  const applyExtracted = (ex: ExtractedBrandKit) => {
    setForm((prev) => {
      const mergeArr = (cur: string[], add?: string[]) => {
        if (!add?.length) return cur;
        const seen = new Set(cur.map((x) => x.toLowerCase()));
        const out = [...cur];
        for (const a of add) {
          if (!seen.has(a.toLowerCase())) {
            out.push(a);
            seen.add(a.toLowerCase());
          }
        }
        return out;
      };
      let voice = prev.voiceExamples.filter((v) => v.trim());
      if (ex.voiceExamples?.length) {
        const seen = new Set(voice.map((v) => v.toLowerCase()));
        for (const v of ex.voiceExamples) {
          if (voice.length >= MAX_VOICE_EXAMPLES) break;
          if (!seen.has(v.toLowerCase())) {
            voice.push(v);
            seen.add(v.toLowerCase());
          }
        }
      }
      if (voice.length === 0) voice = [""];
      const extraInfo = ex.additionalInformation
        ? prev.additionalInformation.trim()
          ? `${prev.additionalInformation.trim()}\n\n${ex.additionalInformation}`
          : ex.additionalInformation
        : prev.additionalInformation;
      return {
        ...prev,
        name: prev.name.trim() || ex.name || prev.name,
        tone: prev.tone.trim() || ex.tone || prev.tone,
        targetAudience:
          prev.targetAudience.trim() || ex.targetAudience || prev.targetAudience,
        primaryColor: prev.primaryColor.trim() || ex.primaryColor || prev.primaryColor,
        secondaryColor:
          prev.secondaryColor.trim() || ex.secondaryColor || prev.secondaryColor,
        accentColor: prev.accentColor.trim() || ex.accentColor || prev.accentColor,
        voiceExamples: voice,
        doUse: mergeArr(prev.doUse, ex.doUse),
        doNotUse: mergeArr(prev.doNotUse, ex.doNotUse),
        additionalInformation: extraInfo,
      };
    });
  };

  const handleExtract = async () => {
    const text = smartText.trim();
    if (text.length < 5) {
      toast.error("Paste a bit more text for the AI to read.");
      return;
    }
    setExtracting(true);
    try {
      const { extracted } = await api.brandProfiles.extract(text);
      const filled = Object.values(extracted).filter(
        (v) => v != null && (Array.isArray(v) ? v.length > 0 : true),
      ).length;
      if (filled === 0) {
        toast.message("Couldn't find brand details in that text. Try adding more.");
        return;
      }
      applyExtracted(extracted);
      setSmartText("");
      toast.success(`Imported ${filled} field${filled > 1 ? "s" : ""} — review and save.`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExtracting(false);
    }
  };

  const handleLogo = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      set("logoUrl", url);
      toast.success("Logo uploaded.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAssets = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MAX_ASSETS - form.assets.length;
    if (remaining <= 0) {
      toast.error(`You can add up to ${MAX_ASSETS} images.`);
      return;
    }
    const chosen = Array.from(files).slice(0, remaining);
    setAssetUploading(true);
    try {
      const uploaded: BrandAsset[] = [];
      for (const file of chosen) {
        if (file.size > MAX_ASSET_BYTES) {
          toast.error(`"${file.name}" is over 10MB and was skipped.`);
          continue;
        }
        try {
          const url = await uploadImageFile(file);
          uploaded.push({ url, label: file.name.slice(0, 200) });
        } catch (error) {
          toast.error(getErrorMessage(error));
        }
      }
      if (uploaded.length) {
        setForm((prev) => ({
          ...prev,
          assets: [...prev.assets, ...uploaded].slice(0, MAX_ASSETS),
        }));
        toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} added.`);
      }
      if (files.length > remaining) {
        toast.message(`Only ${remaining} more allowed — extras were skipped.`);
      }
    } finally {
      setAssetUploading(false);
      if (assetInputRef.current) assetInputRef.current.value = "";
    }
  };

  const removeAsset = (url: string) =>
    set("assets", form.assets.filter((a) => a.url !== url));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Please give your brand a name.");
      return;
    }
    if (!colorsValid) {
      toast.error("Please fix the brand colors (use hex like #1A2B3C).");
      return;
    }
    setSaving(true);
    try {
      const payload = formToPayload(form);
      const saved = profileId
        ? await api.brandProfiles.update(profileId, payload)
        : await api.brandProfiles.create(payload);
      setProfileId(saved.id);
      setForm(profileToForm(saved));
      toast.success("Brand kit saved.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const addExample = () =>
    set("voiceExamples", [...form.voiceExamples, ""].slice(0, MAX_VOICE_EXAMPLES));
  const updateExample = (i: number, v: string) =>
    set("voiceExamples", form.voiceExamples.map((e, idx) => (idx === i ? v : e)));
  const removeExample = (i: number) =>
    set("voiceExamples", form.voiceExamples.filter((_, idx) => idx !== i));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const primary = safeHex(form.primaryColor);
  const secondary = safeHex(form.secondaryColor);
  const accent = safeHex(form.accentColor);
  const initial = form.name.trim()?.[0]?.toUpperCase() || "B";
  const sampleText =
    form.voiceExamples.find((v) => v.trim())?.trim() ||
    form.tone.trim() ||
    "Your generated posts will sound like this — on-brand, every time.";

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Palette className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Brand Kit</h1>
          <p className="text-xs text-muted-foreground">
            Teach the AI your voice and look so every post sounds like you.
          </p>
        </div>
        {profileId && (
          <Badge variant="secondary" className="ml-auto hidden shrink-0 gap-1.5 sm:flex">
            <Sparkles className="h-3.5 w-3.5" />
            Saved
          </Badge>
        )}
      </div>

      {/* Smart Import — the fast path. AI fills everything from one paste. */}
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-transparent">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <div className="flex items-start gap-3 lg:w-64 lg:shrink-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Wand2 className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold">Smart Import</h2>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  Paste a ChatGPT brand dump, your Tailwind colors, or rough
                  notes. AI fills every field below — no manual setup.
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Textarea
                value={smartText}
                onChange={(e) => setSmartText(e.target.value)}
                placeholder={`Brand: Acme AI — calm, expert voice for SaaS founders.\nColors: primary #4F46E5, accent emerald-500. Avoid "synergy". Use "ship", "clarity".`}
                rows={3}
                className="resize-y bg-background/70 text-sm"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">
                  {SMART_IMPORT_COST} credits · nothing saves until you press Save
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleExtract}
                  disabled={extracting || smartText.trim().length < 5}
                >
                  {extracting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-1.5">Reading…</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      <span className="ml-1.5">Extract with AI</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Studio: editor (left) + live preview (right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Editor */}
        <Card className="lg:col-span-2">
          <CardContent className="space-y-5 p-5">
            {/* Identity */}
            <SectionTitle icon={Type} title="Identity" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-1.5">
                <Label htmlFor="brand-name" className="text-xs">
                  Brand name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="brand-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Acme AI"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Logo</Label>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                    {form.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_IMAGE}
                    className="hidden"
                    onChange={(e) => handleLogo(e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span className="ml-1.5">{form.logoUrl ? "Replace" : "Upload"}</span>
                  </Button>
                  {form.logoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground"
                      aria-label="Remove logo"
                      onClick={() => set("logoUrl", null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ColorPicker
                label="Primary"
                value={form.primaryColor}
                onChange={(v) => set("primaryColor", v)}
              />
              <ColorPicker
                label="Secondary"
                value={form.secondaryColor}
                onChange={(v) => set("secondaryColor", v)}
              />
              <ColorPicker
                label="Accent"
                value={form.accentColor}
                onChange={(v) => set("accentColor", v)}
              />
            </div>

            <Separator />

            {/* Voice */}
            <SectionTitle icon={MessageSquareQuote} title="Voice" hint="how the AI should write" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="brand-tone" className="text-xs">Tone</Label>
                <Textarea
                  id="brand-tone"
                  value={form.tone}
                  onChange={(e) => set("tone", e.target.value)}
                  placeholder="Warm but expert. Short sentences. No hype."
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brand-audience" className="text-xs">Target audience</Label>
                <Textarea
                  id="brand-audience"
                  value={form.targetAudience}
                  onChange={(e) => set("targetAudience", e.target.value)}
                  placeholder="Early-stage SaaS founders and indie hackers."
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">
                Example posts
                <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                  paste up to {MAX_VOICE_EXAMPLES} of your best
                </span>
              </Label>
              {form.voiceExamples.map((ex, i) => (
                <div key={i} className="flex gap-2">
                  <Textarea
                    value={ex}
                    onChange={(e) => updateExample(i, e.target.value)}
                    placeholder={`Example post #${i + 1}`}
                    rows={2}
                    className="resize-none text-sm"
                  />
                  {form.voiceExamples.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-muted-foreground"
                      aria-label="Remove example"
                      onClick={() => removeExample(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {form.voiceExamples.length < MAX_VOICE_EXAMPLES && (
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={addExample}>
                  <Plus className="h-4 w-4" />
                  <span className="ml-1.5">Add example</span>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-emerald-600 dark:text-emerald-400">Words to use</Label>
                <TagInput values={form.doUse} onChange={(v) => set("doUse", v)} accent="use" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-destructive">Words to avoid</Label>
                <TagInput values={form.doNotUse} onChange={(v) => set("doNotUse", v)} accent="avoid" />
              </div>
            </div>

            <Separator />

            {/* Resources */}
            <div className="flex items-center justify-between">
              <SectionTitle icon={Images} title="Brand resources" hint="logos, screenshots — 10MB each" />
              <Badge variant="outline" className="shrink-0 text-[11px]">
                {form.assets.length}/{MAX_ASSETS}
              </Badge>
            </div>
            <input
              ref={assetInputRef}
              type="file"
              accept={ACCEPT_IMAGE}
              multiple
              className="hidden"
              onChange={(e) => handleAssets(e.target.files)}
            />
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {form.assets.map((asset) => (
                <div
                  key={asset.url}
                  className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.url} alt={asset.label || "Resource"} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => removeAsset(asset.url)}
                    className="absolute right-1 top-1 rounded bg-background/80 p-1 text-destructive opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {form.assets.length < MAX_ASSETS && (
                <button
                  type="button"
                  onClick={() => assetInputRef.current?.click()}
                  disabled={assetUploading}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  {assetUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span className="text-[10px]">Add</span>
                </button>
              )}
            </div>

            <Separator />

            {/* Additional info */}
            <SectionTitle icon={Sparkles} title="Additional information" hint="anything else the AI should know" />
            <Textarea
              value={form.additionalInformation}
              onChange={(e) => set("additionalInformation", e.target.value)}
              placeholder="e.g. We sell a $29/mo scheduling tool. Mention the free trial. Never use exclamation marks."
              rows={3}
              className="resize-none text-sm"
            />
          </CardContent>
        </Card>

        {/* Live preview + save (sticky on desktop) */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card className="overflow-hidden">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <CompletenessRing value={completeness} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Brand strength</p>
                  <p className="text-[11px] text-muted-foreground">
                    {completeness < 100
                      ? "Fill more for sharper, on-brand AI output."
                      : "Fully tuned — your AI is dialed in."}
                  </p>
                </div>
              </div>

              {/* Live preview card */}
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="h-1.5 w-full" style={{ background: primary || "hsl(var(--muted))" }} />
                <div className="space-y-3 p-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg text-sm font-bold text-white"
                      style={{ background: primary || "hsl(var(--primary))" }}
                    >
                      {form.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.logoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initial
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {form.name.trim() || "Your brand"}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {form.targetAudience.trim() || "Your audience"}
                      </p>
                    </div>
                  </div>

                  {(primary || secondary || accent) && (
                    <div className="flex gap-1.5">
                      {[primary, secondary, accent].filter(Boolean).map((c, i) => (
                        <div
                          key={i}
                          className="h-6 flex-1 rounded-md border border-border"
                          style={{ background: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  )}

                  <div className="rounded-lg bg-muted/40 p-2.5">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ background: accent || primary || "hsl(var(--primary))" }}
                      />
                      <span className="text-[11px] font-medium">
                        {form.name.trim() || "Your brand"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">· now</span>
                    </div>
                    <p className="line-clamp-3 text-[11px] leading-relaxed text-foreground/80">
                      {sampleText}
                    </p>
                    {form.doUse.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {form.doUse.slice(0, 3).map((w) => (
                          <span
                            key={w}
                            className="rounded-full px-1.5 py-0.5 text-[10px]"
                            style={{
                              background: (accent || primary || "#F97316") + "22",
                              color: accent || primary || undefined,
                            }}
                          >
                            #{w.replace(/\s+/g, "")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saving || uploading || assetUploading}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-1.5">Saving…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span className="ml-1.5">Save brand kit</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
