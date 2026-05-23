"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { api, clearClientGetCache } from "@/lib/apiClient";
import { invalidatePublicPlansCache } from "@/lib/publicPlansCache";
import type {
  AdminUpdateSubscriptionPlanBody,
  PlanDisplayPricingMap,
  PlanDisplayTier,
  BillingCatalogLivePayload,
  PricingDisplaySettings,
  SubscriptionPlanPayload,
} from "@/types/publicPlans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const PLAN_TYPES = ["free", "standard", "pro", "ultimate"] as const;
type PlanType = (typeof PLAN_TYPES)[number];

type TierForm = {
  symbol: string;
  listMonthly: string;
  listYearly: string;
  offerMonthly: string;
  offerYearly: string;
};

type PlanForm = {
  name: string;
  description: string;
  features: string[];
  tierByCurrency: Record<string, TierForm>;
};

function parseSupportedList(raw: string): string[] {
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => /^[A-Z]{3}$/.test(s));
}

function tierFormFromTier(t?: PlanDisplayTier | null): TierForm {
  if (!t) {
    return { symbol: "", listMonthly: "", listYearly: "", offerMonthly: "", offerYearly: "" };
  }
  return {
    symbol: t.symbol ?? "",
    listMonthly: String(t.listMonthly ?? ""),
    listYearly: String(t.listYearly ?? ""),
    offerMonthly: t.offerMonthly != null ? String(t.offerMonthly) : "",
    offerYearly: t.offerYearly != null ? String(t.offerYearly) : "",
  };
}

function buildTierFormsForCodes(
  codes: string[],
  existing: PlanDisplayPricingMap | null | undefined,
): Record<string, TierForm> {
  const out: Record<string, TierForm> = {};
  for (const c of codes) {
    const t = existing?.[c];
    out[c] = tierFormFromTier(t ?? null);
    if (!out[c].symbol && c === "USD") out[c].symbol = "$";
  }
  return out;
}

function parseOffer(raw: string): number | null {
  const s = raw.trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function displayPricingFromTierForms(
  codes: string[],
  tierByCurrency: Record<string, TierForm>,
): PlanDisplayPricingMap | null {
  const out: PlanDisplayPricingMap = {};
  for (const code of codes) {
    const row = tierByCurrency[code];
    if (!row) continue;
    const listMonthly = Number(row.listMonthly);
    const listYearly = Number(row.listYearly);
    if (!Number.isFinite(listMonthly) || !Number.isFinite(listYearly)) continue;
    const symbol = row.symbol.trim() || code;
    out[code] = {
      symbol,
      listMonthly,
      listYearly,
      offerMonthly: parseOffer(row.offerMonthly),
      offerYearly: parseOffer(row.offerYearly),
    };
  }
  return Object.keys(out).length ? out : null;
}

function planToBody(form: PlanForm, codes: string[]): AdminUpdateSubscriptionPlanBody {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    features: form.features.map((f) => f.trim()).filter(Boolean),
    displayPricing: displayPricingFromTierForms(codes, form.tierByCurrency),
  };
}

function stablePlanSnapshot(form: PlanForm, codes: string[]): string {
  return JSON.stringify(planToBody(form, codes));
}

function formatMoneyMajor(amount: number | null, currency: string | null): string {
  if (amount == null || currency == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function extractApiMessage(err: unknown): string {
  if (!(err instanceof Error)) return "Request failed";
  const m = err.message;
  const idx = m.indexOf(" - ");
  if (idx === -1) return m;
  const tail = m.slice(idx + 3);
  try {
    const j = JSON.parse(tail) as { message?: string | string[] };
    if (Array.isArray(j.message)) return j.message.join(", ");
    if (typeof j.message === "string") return j.message;
  } catch {
    /* ignore */
  }
  return tail.slice(0, 400);
}

export function PricingPlansAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalogLive, setCatalogLive] = useState<BillingCatalogLivePayload | null>(null);
  const [importingCatalog, setImportingCatalog] = useState(false);

  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [supportedInput, setSupportedInput] = useState("USD, INR");

  const [planForms, setPlanForms] = useState<Record<PlanType, PlanForm | null>>({
    free: null,
    standard: null,
    pro: null,
    ultimate: null,
  });

  const [initialPricingKey, setInitialPricingKey] = useState("");
  const [initialPlanKeys, setInitialPlanKeys] = useState<Record<PlanType, string>>({
    free: "",
    standard: "",
    pro: "",
    ultimate: "",
  });

  const supportedCodes = useMemo(() => {
    const parsed = parseSupportedList(supportedInput);
    const dc = defaultCurrency.trim().toUpperCase();
    if (dc && /^[A-Z]{3}$/.test(dc) && !parsed.includes(dc)) {
      return [dc, ...parsed];
    }
    return parsed.length ? parsed : dc && /^[A-Z]{3}$/.test(dc) ? [dc] : ["USD"];
  }, [supportedInput, defaultCurrency]);

  const ensureTierKeys = useCallback((form: PlanForm, codes: string[]): PlanForm => {
    const nextTiers = { ...form.tierByCurrency };
    for (const c of codes) {
      if (!nextTiers[c]) nextTiers[c] = buildTierFormsForCodes([c], null)[c];
    }
    for (const k of Object.keys(nextTiers)) {
      if (!codes.includes(k)) delete nextTiers[k];
    }
    return { ...form, tierByCurrency: nextTiers };
  }, []);

  const refreshCatalogSnapshot = useCallback(async () => {
    clearClientGetCache("/admin/subscription-plans/billing-catalog-live");
    try {
      const snap = await api.admin.subscriptionPlansBillingCatalogLive();
      setCatalogLive(snap);
      return snap;
    } catch (e) {
      setCatalogLive(null);
      toast.error(extractApiMessage(e));
      return null;
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [meta, plans] = await Promise.all([
        api.admin.subscriptionPlansPricingDisplayGet(),
        api.admin.subscriptionPlansList(),
      ]);
      void refreshCatalogSnapshot();

      const m: PricingDisplaySettings = meta;
      setDefaultCurrency(m.defaultCurrency);
      setSupportedInput(m.supportedCurrencies.join(", "));

      const byType = Object.fromEntries(plans.map((p) => [p.planType, p])) as Record<
        string,
        SubscriptionPlanPayload
      >;

      const nextForms: Record<PlanType, PlanForm> = {} as Record<PlanType, PlanForm>;
      const mergedCodes = [...new Set([...m.supportedCurrencies.map((c) => c.toUpperCase()), m.defaultCurrency.toUpperCase()])];

      for (const pt of PLAN_TYPES) {
        const row = byType[pt];
        const codesForRow = mergedCodes;
        if (row) {
          nextForms[pt] = {
            name: row.name,
            description: row.description,
            features: row.features?.length ? [...row.features] : [""],
            tierByCurrency: buildTierFormsForCodes(codesForRow, row.displayPricing ?? null),
          };
        } else {
          nextForms[pt] = {
            name: pt,
            description: "",
            features: [""],
            tierByCurrency: buildTierFormsForCodes(codesForRow, null),
          };
        }
      }

      setPlanForms(nextForms);

      const ik: Record<PlanType, string> = {} as Record<PlanType, string>;
      for (const pt of PLAN_TYPES) {
        ik[pt] = stablePlanSnapshot(nextForms[pt], mergedCodes);
      }
      setInitialPlanKeys(ik);

      setInitialPricingKey(
        JSON.stringify({
          defaultCurrency: m.defaultCurrency.toUpperCase(),
          supportedCurrencies: m.supportedCurrencies.map((c) => c.toUpperCase()),
        }),
      );
    } catch (e) {
      toast.error(extractApiMessage(e));
    } finally {
      setLoading(false);
    }
  }, [refreshCatalogSnapshot]);

  useEffect(() => {
    void load();
  }, [load]);

  const supportedKey = supportedCodes.join("|");
  useEffect(() => {
    setPlanForms((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const pt of PLAN_TYPES) {
        const f = next[pt];
        if (!f) continue;
        const u = ensureTierKeys(f, supportedCodes);
        if (JSON.stringify(u.tierByCurrency) !== JSON.stringify(f.tierByCurrency)) {
          next[pt] = u;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [supportedKey, ensureTierKeys, supportedCodes]);

  async function handleSave() {
    const dc = defaultCurrency.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(dc)) {
      toast.error("Default currency must be a 3-letter ISO code (e.g. USD).");
      return;
    }
    let supported = parseSupportedList(supportedInput);
    if (!supported.length) {
      toast.error("Add at least one supported currency (3-letter codes).");
      return;
    }
    if (!supported.includes(dc)) {
      supported = [dc, ...supported];
      setSupportedInput(supported.join(", "));
    }

    const pricingPayload: PricingDisplaySettings = {
      defaultCurrency: dc,
      supportedCurrencies: [...new Set(supported)],
    };

    const pricingDirty =
      JSON.stringify({
        defaultCurrency: pricingPayload.defaultCurrency,
        supportedCurrencies: pricingPayload.supportedCurrencies,
      }) !== initialPricingKey;

    const updates: { planType: PlanType; body: AdminUpdateSubscriptionPlanBody }[] = [];
    for (const pt of PLAN_TYPES) {
      const form = planForms[pt];
      if (!form) continue;
      const body = planToBody(form, supportedCodes);
      if (stablePlanSnapshot(form, supportedCodes) !== initialPlanKeys[pt]) {
        updates.push({ planType: pt, body });
      }
    }

    if (!pricingDirty && updates.length === 0) {
      toast.message("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      if (pricingDirty) {
        await api.admin.subscriptionPlansPricingDisplayPut(pricingPayload);
      }
      let billingCatalogSynced = false;
      for (const u of updates) {
        const res = await api.admin.subscriptionPlansUpdate(u.planType, u.body);
        if (res.billingCatalogSynced) billingCatalogSynced = true;
      }
      invalidatePublicPlansCache();
      clearClientGetCache("/admin/subscription-plans/billing-catalog-live");
      clearClientGetCache("/admin/subscription-plans");
      void refreshCatalogSnapshot();
      if (pricingDirty || updates.length > 0) {
        if (billingCatalogSynced) {
          toast.success("Saved. Polar catalog updated.");
        } else {
          toast.success("Pricing display saved. Public plans cache cleared.");
        }
      }
      await load();
    } catch (e) {
      toast.error(extractApiMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading && PLAN_TYPES.some((pt) => !planForms[pt])) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm p-4">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading plans…
      </div>
    );
  }

  async function handleImportFromCatalog() {
    const okConfirm = window.confirm(
      "Import list prices from the Polar catalog into Supabase for Standard, Pro, and Ultimate?\n\n" +
        "This sets display list amounts from the catalog (checkout truth), clears offer fields on that catalog-currency tier, and updates legacy price_monthly / price_yearly.",
    );
    if (!okConfirm) return;
    setImportingCatalog(true);
    try {
      const result = await api.admin.subscriptionPlansImportFromBillingCatalog();
      invalidatePublicPlansCache();
      clearClientGetCache("/admin/subscription-plans/billing-catalog-live");
      clearClientGetCache("/admin/subscription-plans");
      for (const w of result.warnings) toast.message(w);
      toast.success(`Imported Polar catalog → ${result.updatedPlanTypes.join(", ")}`);
      await load();
    } catch (e) {
      toast.error(extractApiMessage(e));
    } finally {
      setImportingCatalog(false);
    }
  }

  function catalogSlotsFor(plan: PlanType): {
    monthly: string;
    yearly: string;
    moId?: string;
    yrId?: string;
  } | null {
    if (plan === "free" || !catalogLive?.items.length) return null;
    const m = catalogLive.items.find((x) => x.planType === plan && x.billingCycle === "monthly");
    const y = catalogLive.items.find((x) => x.planType === plan && x.billingCycle === "yearly");
    let mo =
      m?.error ?? (m?.amountMajor != null && m.currencyCode ? formatMoneyMajor(m.amountMajor, m.currencyCode) : "—");
    let yr =
      y?.error ?? (y?.amountMajor != null && y.currencyCode ? formatMoneyMajor(y.amountMajor, y.currencyCode) : "—");
    if (m && !m.error && (m.amountMajor == null || !m.currencyCode)) mo = "—";
    if (y && !y.error && (y.amountMajor == null || !y.currencyCode)) yr = "—";
    return {
      monthly: mo,
      yearly: yr,
      moId: m?.priceId,
      yrId: y?.priceId,
    };
  }

  function dbListSnapshot(plan: PlanType): string {
    const f = planForms[plan];
    if (!f) return "—";
    const dc = defaultCurrency.trim().toUpperCase();
    const row = f.tierByCurrency[dc];
    if (!row) return `no ${dc} row`;
    return `${dc} mo ${row.listMonthly || "—"} / yr ${row.listYearly || "—"} (offer ${row.offerMonthly || "—"} / ${row.offerYearly || "—"})`;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Display pricing</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Marketing and billing UIs read from the same public plans API. Edits invalidate the frontend cache after save.
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => void handleSave()} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save all changes
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Polar catalog (live)</CardTitle>
            <CardDescription>
              Checkout totals follow these Polar product or price IDs ({catalogLive?.apiKeyConfigured ? `fetched ${new Date(catalogLive.fetchedAt).toLocaleString()}` : "missing POLAR_ACCESS_TOKEN — server-side only"})
              . Saving display pricing can update Polar when catalog sync is enabled; use Import after you change prices in the Polar dashboard.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => void refreshCatalogSnapshot()}>
              Refresh catalog
            </Button>
            <Button type="button" size="sm" disabled={importingCatalog || !catalogLive?.apiKeyConfigured} onClick={() => void handleImportFromCatalog()}>
              {importingCatalog ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Import from Polar → DB
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!catalogLive?.apiKeyConfigured && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Set `POLAR_ACCESS_TOKEN` on the backend and restart to load catalog rows.
            </p>
          )}
          <div className="overflow-x-auto rounded-md border text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="p-2 font-medium">Plan</th>
                  <th className="p-2 font-medium">Polar monthly</th>
                  <th className="p-2 font-medium">Polar yearly</th>
                  <th className="p-2 font-medium">Your DB lists (preview)</th>
                </tr>
              </thead>
              <tbody>
                {(["standard", "pro", "ultimate"] as const).map((pt) => {
                  const catalog = catalogSlotsFor(pt);
                  return (
                    <tr key={pt} className="border-b">
                      <td className="p-2 font-medium capitalize">{pt}</td>
                      <td className="p-2 font-mono text-xs">
                        {catalog?.monthly ?? "—"}
                        {catalog?.moId ? <div className="text-muted-foreground">{catalog.moId}</div> : null}
                      </td>
                      <td className="p-2 font-mono text-xs">
                        {catalog?.yearly ?? "—"}
                        {catalog?.yrId ? <div className="text-muted-foreground">{catalog.yrId}</div> : null}
                      </td>
                      <td className="p-2 text-xs text-muted-foreground">{dbListSnapshot(pt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Currency defaults</CardTitle>
          <CardDescription>Supported currencies determine which tier rows appear on each plan.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="default-currency">Default currency</Label>
            <Input
              id="default-currency"
              maxLength={3}
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value.toUpperCase())}
              className="font-mono uppercase"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="supported-currencies">Supported currencies</Label>
            <Input
              id="supported-currencies"
              placeholder="USD, INR, EUR"
              value={supportedInput}
              onChange={(e) => setSupportedInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Comma or space separated 3-letter ISO codes.</p>
          </div>
        </CardContent>
      </Card>

      {PLAN_TYPES.map((pt) => {
        const form = planForms[pt];
        if (!form) return null;

        const setForm = (patch: Partial<PlanForm> | ((f: PlanForm) => PlanForm)) => {
          setPlanForms((prev) => {
            const cur = prev[pt];
            if (!cur) return prev;
            const next = typeof patch === "function" ? patch(cur) : { ...cur, ...patch };
            return { ...prev, [pt]: next };
          });
        };

        return (
          <Card key={pt}>
            <CardHeader>
              <CardTitle className="text-base capitalize">{pt}</CardTitle>
              <CardDescription>Name, description, feature bullets, and per-currency list/offer amounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ name: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ description: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Features</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForm((f) => ({ ...f, features: [...f.features, ""] }))}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add bullet
                  </Button>
                </div>
                <ul className="space-y-2">
                  {form.features.map((feat, i) => (
                    <li key={i} className="flex gap-2">
                      <Input
                        value={feat}
                        onChange={(e) =>
                          setForm((f) => {
                            const features = [...f.features];
                            features[i] = e.target.value;
                            return { ...f, features };
                          })
                        }
                        placeholder="Feature line"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        aria-label="Remove feature"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            features: f.features.filter((_, j) => j !== i),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Display amounts by currency</Label>
                <p className="text-xs text-muted-foreground">
                  List prices are required per currency row for it to be saved. Leave offer fields empty when not on sale.
                </p>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-left">
                        <th className="p-2 font-medium">Code</th>
                        <th className="p-2 font-medium">Symbol</th>
                        <th className="p-2 font-medium">List mo</th>
                        <th className="p-2 font-medium">List yr</th>
                        <th className="p-2 font-medium">Offer mo</th>
                        <th className="p-2 font-medium">Offer yr</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportedCodes.map((code) => {
                        const row = form.tierByCurrency[code] ?? tierFormFromTier(null);
                        return (
                          <tr key={code} className="border-b">
                            <td className="p-2 font-mono">{code}</td>
                            <td className="p-2">
                              <Input
                                className="h-8 font-mono"
                                value={row.symbol}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    tierByCurrency: {
                                      ...f.tierByCurrency,
                                      [code]: { ...row, symbol: e.target.value },
                                    },
                                  }))
                                }
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                className="h-8"
                                inputMode="decimal"
                                value={row.listMonthly}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    tierByCurrency: {
                                      ...f.tierByCurrency,
                                      [code]: { ...row, listMonthly: e.target.value },
                                    },
                                  }))
                                }
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                className="h-8"
                                inputMode="decimal"
                                value={row.listYearly}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    tierByCurrency: {
                                      ...f.tierByCurrency,
                                      [code]: { ...row, listYearly: e.target.value },
                                    },
                                  }))
                                }
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                className="h-8"
                                inputMode="decimal"
                                value={row.offerMonthly}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    tierByCurrency: {
                                      ...f.tierByCurrency,
                                      [code]: { ...row, offerMonthly: e.target.value },
                                    },
                                  }))
                                }
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                className="h-8"
                                inputMode="decimal"
                                value={row.offerYearly}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    tierByCurrency: {
                                      ...f.tierByCurrency,
                                      [code]: { ...row, offerYearly: e.target.value },
                                    },
                                  }))
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
