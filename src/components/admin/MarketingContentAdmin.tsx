"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ContentBlock {
  key: string;
  content: Record<string, unknown>;
  isDefault: boolean;
  updatedAt: string | null;
}

function prettyKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MarketingContentAdmin() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await apiClient.get("/admin/site-content/content")) as ContentBlock[];
      setBlocks(data ?? []);
      setDrafts({});
    } catch {
      toast.error("Failed to load marketing content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const draftFor = (b: ContentBlock) =>
    drafts[b.key] ?? JSON.stringify(b.content, null, 2);

  const save = async (b: ContentBlock) => {
    const raw = draftFor(b);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      toast.error(`Invalid JSON in “${prettyKey(b.key)}”`);
      return;
    }
    setSavingKey(b.key);
    try {
      await apiClient.put(`/admin/site-content/content/${b.key}`, { content: parsed });
      toast.success(`${prettyKey(b.key)} saved`);
      await load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSavingKey(null);
    }
  };

  const reset = async (b: ContentBlock) => {
    if (!confirm(`Reset “${prettyKey(b.key)}” to default copy?`)) return;
    try {
      await apiClient.post(`/admin/site-content/content/${b.key}/reset`, {});
      toast.success("Reset to default");
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
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Editable marketing copy for landing &amp; features sections. Edit values as JSON — keep keys intact.
        Saving publishes immediately (public cache refreshes within ~5 min).
      </p>
      {blocks.map((b) => {
        const dirty = drafts[b.key] !== undefined && drafts[b.key] !== JSON.stringify(b.content, null, 2);
        return (
          <Card key={b.key} className={dirty ? "border-primary/40" : undefined}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {prettyKey(b.key)}
                  {b.isDefault ? <Badge variant="outline">default</Badge> : <Badge variant="secondary">customized</Badge>}
                </CardTitle>
                <code className="text-[11px] text-muted-foreground">{b.key}</code>
              </div>
              <CardDescription>Structured content block consumed by the public site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={12}
                className="font-mono text-xs leading-relaxed"
                value={draftFor(b)}
                onChange={(e) => setDrafts((d) => ({ ...d, [b.key]: e.target.value }))}
              />
              <div className="flex items-center gap-2">
                <Button onClick={() => save(b)} disabled={!dirty || savingKey === b.key} className="cursor-pointer">
                  {savingKey === b.key ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
                {!b.isDefault && (
                  <Button variant="outline" onClick={() => reset(b)} className="cursor-pointer">
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
