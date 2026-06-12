"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type PlanType = "free" | "standard" | "pro" | "ultimate";

interface PlanMeta {
  planType: PlanType;
  publicName: string;
  tagline: string;
  credits: number;
  creditsAsOutput: string;
  highlight: string;
  featured: boolean;
  features: string[];
  ctaLabel: string;
}

interface PricingMeta {
  plans: PlanMeta[];
  faqs: { q: string; a: string }[];
  trustBadges: string[];
  annualNote: string;
}

const linesToArr = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export function PricingMetaAdmin() {
  const [meta, setMeta] = useState<PricingMeta | null>(null);
  const [isDefault, setIsDefault] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await apiClient.get("/admin/site-content/pricing-meta")) as {
        meta: PricingMeta;
        isDefault: boolean;
      };
      setMeta(res.meta);
      setIsDefault(res.isDefault);
      setDirty(false);
    } catch {
      toast.error("Failed to load pricing metadata");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = (fn: (m: PricingMeta) => PricingMeta) => {
    setMeta((m) => (m ? fn(m) : m));
    setDirty(true);
  };

  const updatePlan = (i: number, patch: Partial<PlanMeta>) =>
    update((m) => ({ ...m, plans: m.plans.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) }));

  const save = async () => {
    if (!meta) return;
    setSaving(true);
    try {
      await apiClient.put("/admin/site-content/pricing-meta", { meta });
      toast.success("Pricing metadata saved");
      await load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!confirm("Reset pricing display metadata to defaults?")) return;
    try {
      await apiClient.post("/admin/site-content/pricing-meta/reset", {});
      toast.success("Reset to defaults");
      await load();
    } catch {
      toast.error("Reset failed");
    }
  };

  if (loading || !meta) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
        Prices, discounts &amp; billing cycles come live from Polar — this screen only controls display copy
        (names, taglines, feature bullets, credits, FAQ, badges). It never sets prices.
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={isDefault ? "outline" : "secondary"}>{isDefault ? "using defaults" : "customized"}</Badge>
        <Button onClick={save} disabled={!dirty || saving} className="cursor-pointer">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
        {!isDefault && (
          <Button variant="outline" onClick={reset} className="cursor-pointer">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {meta.plans.map((p, i) => (
          <Card key={p.planType}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base capitalize">
                {p.publicName}
                <Badge variant="outline" className="font-mono text-[10px]">{p.planType}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Public name</Label>
                  <Input value={p.publicName} onChange={(e) => updatePlan(i, { publicName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>CTA label</Label>
                  <Input value={p.ctaLabel} onChange={(e) => updatePlan(i, { ctaLabel: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Credits</Label>
                  <Input
                    type="number"
                    value={String(p.credits)}
                    onChange={(e) => updatePlan(i, { credits: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Highlight badge</Label>
                  <Input value={p.highlight} onChange={(e) => updatePlan(i, { highlight: e.target.value })} placeholder="Most popular" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Tagline</Label>
                <Input value={p.tagline} onChange={(e) => updatePlan(i, { tagline: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Credits as output</Label>
                <Input value={p.creditsAsOutput} onChange={(e) => updatePlan(i, { creditsAsOutput: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Feature bullets (one per line)</Label>
                <Textarea
                  rows={6}
                  className="text-xs"
                  value={p.features.join("\n")}
                  onChange={(e) => updatePlan(i, { features: linesToArr(e.target.value) })}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Switch checked={p.featured} onCheckedChange={(c) => updatePlan(i, { featured: c })} />
                Featured (emphasized card)
              </label>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Page copy</CardTitle>
          <CardDescription>Trust badges, annual note, and FAQ.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Annual note</Label>
            <Input value={meta.annualNote} onChange={(e) => update((m) => ({ ...m, annualNote: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Trust badges (one per line)</Label>
            <Textarea
              rows={4}
              className="text-xs"
              value={meta.trustBadges.join("\n")}
              onChange={(e) => update((m) => ({ ...m, trustBadges: linesToArr(e.target.value) }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>FAQ (JSON: array of {`{ q, a }`})</Label>
            <Textarea
              rows={10}
              className="font-mono text-xs"
              defaultValue={JSON.stringify(meta.faqs, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  if (Array.isArray(parsed)) update((m) => ({ ...m, faqs: parsed }));
                } catch {
                  /* ignore until valid */
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
