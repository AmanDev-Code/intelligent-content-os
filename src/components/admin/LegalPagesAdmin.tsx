"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RotateCcw, Save, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface LegalPage {
  slug: string;
  title: string;
  summary: string;
  body: string;
  seoDescription: string;
  version: string;
  effectiveDate: string;
  sortOrder: number;
  isPublished: boolean;
  isDefault: boolean;
  updatedAt: string | null;
}

export function LegalPagesAdmin() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<LegalPage>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await apiClient.get("/admin/site-content/legal")) as LegalPage[];
      setPages(data ?? []);
      if (!activeSlug && data?.length) setActiveSlug(data[0].slug);
    } catch {
      toast.error("Failed to load legal pages");
    } finally {
      setLoading(false);
    }
  }, [activeSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const active = pages.find((p) => p.slug === activeSlug) ?? null;
  const merged: LegalPage | null = active ? { ...active, ...edit } : null;
  const dirty = Object.keys(edit).length > 0;

  const selectPage = (slug: string) => {
    setActiveSlug(slug);
    setEdit({});
  };

  const save = async () => {
    if (!merged) return;
    setSaving(true);
    try {
      await apiClient.put(`/admin/site-content/legal/${merged.slug}`, {
        title: merged.title,
        summary: merged.summary,
        body: merged.body,
        seoDescription: merged.seoDescription,
        version: merged.version,
        effectiveDate: merged.effectiveDate,
        isPublished: merged.isPublished,
      });
      toast.success("Legal page saved");
      setEdit({});
      await load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!active) return;
    if (!confirm(`Reset “${active.title}” to the built-in default? Your custom edits will be discarded.`)) return;
    try {
      await apiClient.post(`/admin/site-content/legal/${active.slug}/reset`, {});
      toast.success("Reset to default");
      setEdit({});
      await load();
    } catch {
      toast.error("Reset failed");
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <div className="space-y-1">
        {pages.map((p) => (
          <button
            key={p.slug}
            onClick={() => selectPage(p.slug)}
            className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
              p.slug === activeSlug ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              {p.title}
            </span>
            {p.isDefault ? (
              <span className="text-[10px] opacity-70">default</span>
            ) : !p.isPublished ? (
              <span className="text-[10px] opacity-70">hidden</span>
            ) : null}
          </button>
        ))}
      </div>

      {merged ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {merged.title}
                  {active?.isDefault ? <Badge variant="outline">built-in default</Badge> : <Badge variant="secondary">customized</Badge>}
                </CardTitle>
                <CardDescription>
                  <code className="text-[11px]">/legal/{merged.slug}</code> · markdown body ·
                  <Link href={`/legal/${merged.slug}`} target="_blank" className="ml-1 inline-flex items-center gap-1 text-primary hover:underline">
                    preview <ExternalLink className="h-3 w-3" />
                  </Link>
                </CardDescription>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Switch
                  checked={merged.isPublished}
                  onCheckedChange={(c) => setEdit((e) => ({ ...e, isPublished: c }))}
                />
                Published
              </label>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              Template — pending legal review. Replace <code>[PLACEHOLDER]</code> tokens (entity, contact, governing law) and have counsel review before launch.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={merged.title} onChange={(e) => setEdit((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Version</Label>
                <Input value={merged.version} onChange={(e) => setEdit((p) => ({ ...p, version: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Effective date</Label>
                <Input
                  type="date"
                  value={(merged.effectiveDate || "").slice(0, 10)}
                  onChange={(e) => setEdit((p) => ({ ...p, effectiveDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Summary</Label>
                <Input value={merged.summary} onChange={(e) => setEdit((p) => ({ ...p, summary: e.target.value }))} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>SEO description</Label>
                <Input value={merged.seoDescription} onChange={(e) => setEdit((p) => ({ ...p, seoDescription: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Body (Markdown)</Label>
              <Textarea
                rows={22}
                className="font-mono text-xs leading-relaxed"
                value={merged.body}
                onChange={(e) => setEdit((p) => ({ ...p, body: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={save} disabled={!dirty || saving} className="cursor-pointer">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
              {!active?.isDefault && (
                <Button variant="outline" onClick={reset} className="cursor-pointer">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset to default
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
