"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, RefreshCw, Tag } from "lucide-react";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { DiscountCodeRow } from "@/types/discountCodes";

const PLAN_OPTIONS = ["standard", "pro", "ultimate"] as const;
const CYCLE_OPTIONS = ["monthly", "yearly"] as const;

function extractApiMessage(err: unknown): string {
  if (!(err instanceof Error)) return "Request failed";
  const m = err.message;
  const idx = m.indexOf(" - ");
  if (idx === -1) return m;
  const tail = m.slice(idx + 3);
  try {
    const j = JSON.parse(tail) as {
      message?: string | string[];
      polarSyncError?: string;
    };
    if (j.polarSyncError) return j.polarSyncError;
    if (Array.isArray(j.message)) return j.message.join(", ");
    if (typeof j.message === "string") return j.message;
  } catch {
    /* ignore */
  }
  return tail.slice(0, 400);
}

type FormState = {
  code: string;
  name: string;
  discountType: "percentage" | "fixed";
  percentOff: string;
  amountOff: string;
  currency: string;
  planTypes: string[];
  billingCycles: string[];
  duration: "once" | "forever" | "repeating";
  durationInMonths: string;
  expiresAt: string;
  maxRedemptions: string;
};

const emptyForm = (): FormState => ({
  code: "",
  name: "",
  discountType: "percentage",
  percentOff: "10",
  amountOff: "",
  currency: "USD",
  planTypes: [],
  billingCycles: [],
  duration: "once",
  durationInMonths: "",
  expiresAt: "",
  maxRedemptions: "",
});

export function DiscountCodesAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<DiscountCodeRow[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.discountCodesList();
      setRows(res.data || []);
    } catch (e) {
      toast.error(extractApiMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePlan = (plan: string) => {
    setForm((f) => ({
      ...f,
      planTypes: f.planTypes.includes(plan)
        ? f.planTypes.filter((p) => p !== plan)
        : [...f.planTypes, plan],
    }));
  };

  const toggleCycle = (cycle: string) => {
    setForm((f) => ({
      ...f,
      billingCycles: f.billingCycles.includes(cycle)
        ? f.billingCycles.filter((c) => c !== cycle)
        : [...f.billingCycles, cycle],
    }));
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.admin.discountCodesCreate({
        code: form.code,
        name: form.name,
        discountType: form.discountType,
        percentOff:
          form.discountType === "percentage" ? Number(form.percentOff) : undefined,
        amountOff:
          form.discountType === "fixed" ? Number(form.amountOff) : undefined,
        currency: form.currency,
        planTypes: form.planTypes.length ? form.planTypes : undefined,
        billingCycles: form.billingCycles.length ? form.billingCycles : undefined,
        duration: form.duration,
        durationInMonths:
          form.duration === "repeating" && form.durationInMonths
            ? Number(form.durationInMonths)
            : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
      });
      toast.success("Discount code created and synced to Polar");
      setForm(emptyForm());
      setShowForm(false);
      await load();
    } catch (e) {
      toast.error(extractApiMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await api.admin.discountCodesDeactivate(id);
      toast.success("Discount deactivated");
      await load();
    } catch (e) {
      toast.error(extractApiMessage(e));
    }
  };

  const handleSync = async (id: string) => {
    try {
      await api.admin.discountCodesSync(id);
      toast.success("Polar sync completed");
      await load();
    } catch (e) {
      toast.error(extractApiMessage(e));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Discount codes
          </CardTitle>
          <CardDescription>
            Codes sync to Polar on save. Customers enter them at checkout or via{" "}
            <code className="text-[11px]">/billing?code=SAVE10</code>.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4 mr-1" />
          New code
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {showForm && (
          <div className="grid gap-4 rounded-lg border p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dc-code">Code</Label>
                <Input
                  id="dc-code"
                  placeholder="SAVE20"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dc-name">Display name</Label>
                <Input
                  id="dc-name"
                  placeholder="20% off launch"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.discountType}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, discountType: v as "percentage" | "fixed" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage off</SelectItem>
                    <SelectItem value="fixed">Fixed amount off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.discountType === "percentage" ? (
                <div className="space-y-2">
                  <Label>Percent off</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={form.percentOff}
                    onChange={(e) => setForm((f) => ({ ...f, percentOff: e.target.value }))}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Amount off</Label>
                    <Input
                      type="number"
                      min={0.01}
                      step="0.01"
                      value={form.amountOff}
                      onChange={(e) => setForm((f) => ({ ...f, amountOff: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input
                      value={form.currency}
                      onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={form.duration}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      duration: v as "once" | "forever" | "repeating",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                    <SelectItem value="repeating">Repeating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.duration === "repeating" && (
              <div className="space-y-2 max-w-xs">
                <Label>Duration (months)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.durationInMonths}
                  onChange={(e) => setForm((f) => ({ ...f, durationInMonths: e.target.value }))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Plans (empty = all)</Label>
              <div className="flex flex-wrap gap-2">
                {PLAN_OPTIONS.map((p) => (
                  <Button
                    key={p}
                    type="button"
                    size="sm"
                    variant={form.planTypes.includes(p) ? "default" : "outline"}
                    onClick={() => togglePlan(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Billing cycles (empty = both)</Label>
              <div className="flex flex-wrap gap-2">
                {CYCLE_OPTIONS.map((c) => (
                  <Button
                    key={c}
                    type="button"
                    size="sm"
                    variant={form.billingCycles.includes(c) ? "default" : "outline"}
                    onClick={() => toggleCycle(c)}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Expires (optional)</Label>
                <Input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Max redemptions (optional)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxRedemptions}
                  onChange={(e) => setForm((f) => ({ ...f, maxRedemptions: e.target.value }))}
                />
              </div>
            </div>

            <Button type="button" disabled={saving} onClick={() => void handleCreate()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create &amp; sync to Polar
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading codes…
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No discount codes yet.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold">{row.code}</span>
                    {!row.active && <Badge variant="secondary">Inactive</Badge>}
                    <Badge
                      variant={
                        row.polar_sync_status === "synced"
                          ? "default"
                          : row.polar_sync_status === "error"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      Polar: {row.polar_sync_status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{row.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {row.discount_type === "percentage"
                      ? `${row.percent_off}% off`
                      : `${row.amount_off} ${row.currency} off`}
                    {" · "}
                    Redemptions: {row.redemption_count}
                    {row.max_redemptions != null ? ` / ${row.max_redemptions}` : ""}
                  </p>
                  {row.polar_sync_error && (
                    <p className="text-xs text-destructive mt-1">{row.polar_sync_error}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {row.polar_sync_status === "error" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleSync(row.id)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry sync
                    </Button>
                  )}
                  {row.active && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => void handleDeactivate(row.id)}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
