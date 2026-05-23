"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Save, Loader2, Plus, ToggleRight, ToggleLeft, IndianRupee, DollarSign, Percent, Calculator, RefreshCw } from "lucide-react";
import { api, apiClient, clearClientGetCache } from "@/lib/apiClient";
import { clearLaunchPricingClientCache } from "@/hooks/useActiveLaunchPricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const YEARLY_DISCOUNT_PERCENT = 17;

type LaunchPricingConfigRow = {
  id: string;
  label: string;
  inrStandard: number;
  inrPro: number;
  inrUltimate: number;
  usdStandard: number;
  usdPro: number;
  usdUltimate: number;
  enabled: boolean;
  conversionRate: number;
  createdAt: string;
  updatedAt: string;
};

function mapLaunchConfigFromApi(row: Record<string, unknown>): LaunchPricingConfigRow {
  return {
    id: String(row.id),
    label: String(row.label ?? ""),
    inrStandard: Number(row.standard_monthly_inr ?? 0),
    inrPro: Number(row.pro_monthly_inr ?? 0),
    inrUltimate: Number(row.ultimate_monthly_inr ?? 0),
    usdStandard: Number(row.standard_monthly_usd ?? 0),
    usdPro: Number(row.pro_monthly_usd ?? 0),
    usdUltimate: Number(row.ultimate_monthly_usd ?? 0),
    enabled: Boolean(row.is_active),
    conversionRate: Number(row.usd_conversion_rate ?? 83.5),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

type CurrencyRate = {
  rate: number;
  inrToUsd: number;
  usdToInr: number;
  displayPrimary?: string;
  displaySecondary?: string;
  source: string;
  updatedAt: string;
  lastUpdated?: string;
};

type FormState = {
  label: string;
  inrStandard: string;
  inrPro: string;
  inrUltimate: string;
  conversionRate: string;
};

const emptyForm = (): FormState => ({
  label: "",
  inrStandard: "99",
  inrPro: "149",
  inrUltimate: "99",
  conversionRate: "",
});

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

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function calculateYearlyPrice(monthlyPrice: number): number {
  // Apply 17% discount: yearly = monthly * 12 * (1 - 0.17)
  return Math.round(monthlyPrice * 12 * (1 - YEARLY_DISCOUNT_PERCENT / 100));
}

function calculateMonthlyEquivalent(yearlyPrice: number): number {
  // Reverse calculation
  return Math.round((yearlyPrice / 12 / (1 - YEARLY_DISCOUNT_PERCENT / 100)) * 100) / 100;
}

export function LaunchPricingAdmin() {
  const [configs, setConfigs] = useState<LaunchPricingConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currencyRate, setCurrencyRate] = useState<CurrencyRate | null>(null);
  const [refreshingRate, setRefreshingRate] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const applyCurrencyRate = useCallback((res: CurrencyRate) => {
    setCurrencyRate(res);
    const inrToUsd =
      res.inrToUsd ??
      res.rate ??
      (res.usdToInr && res.usdToInr > 0 ? 1 / res.usdToInr : undefined);
    if (inrToUsd) {
      setForm((f) => ({ ...f, conversionRate: String(inrToUsd) }));
    }
  }, []);

  const loadCurrencyRate = useCallback(async () => {
    try {
      const res = await api.admin.getExchangeRate();
      applyCurrencyRate(res as CurrencyRate);
    } catch (e) {
      console.warn("Failed to load currency rate:", e);
    }
  }, [applyCurrencyRate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [configsRes, rateRes] = await Promise.all([
        apiClient.get("/admin/launch-pricing"),
        apiClient.get("/admin/currency/rate").catch(() => null),
      ]);
      const rows = (configsRes as { data?: Record<string, unknown>[] }).data ?? [];
      setConfigs(rows.map(mapLaunchConfigFromApi));
      if (rateRes) {
        applyCurrencyRate(rateRes as CurrencyRate);
      }
    } catch (e) {
      toast.error(extractApiMessage(e));
    } finally {
      setLoading(false);
    }
  }, [applyCurrencyRate]);

  useEffect(() => {
    void load();
  }, [load]);

  // inrToUsd: how many USD per 1 INR (e.g. 0.0104)
  const usdToInrRate = useMemo(() => {
    if (currencyRate?.usdToInr && currencyRate.usdToInr > 0) return currencyRate.usdToInr;
    const inrToUsd = parseFloat(form.conversionRate);
    if (Number.isFinite(inrToUsd) && inrToUsd > 0) {
      return Math.round((1 / inrToUsd) * 100) / 100;
    }
    return 0;
  }, [currencyRate?.usdToInr, form.conversionRate]);

  const inrToUsdRate = useMemo(() => {
    if (currencyRate?.inrToUsd) return currencyRate.inrToUsd;
    if (usdToInrRate > 0) return 1 / usdToInrRate;
    const rate = parseFloat(form.conversionRate);
    return Number.isFinite(rate) && rate > 0 ? rate : 0;
  }, [currencyRate?.inrToUsd, usdToInrRate, form.conversionRate]);

  const conversionRate = inrToUsdRate;

  const calculatedPrices = useMemo(() => {
    const inrStandard = parseFloat(form.inrStandard) || 0;
    const inrPro = parseFloat(form.inrPro) || 0;
    const inrUltimate = parseFloat(form.inrUltimate) || 0;

    return {
      inr: {
        standard: { monthly: inrStandard, yearly: calculateYearlyPrice(inrStandard) },
        pro: { monthly: inrPro, yearly: calculateYearlyPrice(inrPro) },
        ultimate: { monthly: inrUltimate, yearly: calculateYearlyPrice(inrUltimate) },
      },
      usd: {
        standard: {
          monthly:
            usdToInrRate > 0
              ? Math.round((inrStandard / usdToInrRate) * 100) / 100
              : 0,
          yearly:
            usdToInrRate > 0
              ? Math.round((calculateYearlyPrice(inrStandard) / usdToInrRate) * 100) / 100
              : 0,
        },
        pro: {
          monthly:
            usdToInrRate > 0 ? Math.round((inrPro / usdToInrRate) * 100) / 100 : 0,
          yearly:
            usdToInrRate > 0
              ? Math.round((calculateYearlyPrice(inrPro) / usdToInrRate) * 100) / 100
              : 0,
        },
        ultimate: {
          monthly:
            usdToInrRate > 0
              ? Math.round((inrUltimate / usdToInrRate) * 100) / 100
              : 0,
          yearly:
            usdToInrRate > 0
              ? Math.round((calculateYearlyPrice(inrUltimate) / usdToInrRate) * 100) / 100
              : 0,
        },
      },
    };
  }, [form.inrStandard, form.inrPro, form.inrUltimate, usdToInrRate]);

  const handleCreate = async () => {
    if (!form.label.trim()) {
      toast.error("Label is required");
      return;
    }

    const inrStandard = parseFloat(form.inrStandard);
    const inrPro = parseFloat(form.inrPro);
    const inrUltimate = parseFloat(form.inrUltimate);

    if (!Number.isFinite(inrStandard) || inrStandard <= 0) {
      toast.error("Standard price must be a positive number");
      return;
    }
    if (!Number.isFinite(inrPro) || inrPro <= 0) {
      toast.error("Pro price must be a positive number");
      return;
    }
    if (!Number.isFinite(inrUltimate) || inrUltimate <= 0) {
      toast.error("Ultimate price must be a positive number");
      return;
    }

    setSaving(true);
    try {
      await apiClient.post("/admin/launch-pricing", {
        label: form.label.trim(),
        standardMonthlyInr: Math.round(inrStandard),
        proMonthlyInr: Math.round(inrPro),
        ultimateMonthlyInr: Math.round(inrUltimate),
        ...(usdToInrRate > 0 ? { usdConversionRate: usdToInrRate } : {}),
      });
      toast.success("Launch pricing configuration created");
      clearClientGetCache("/public/launch-pricing/active");
      clearLaunchPricingClientCache();
      setForm(emptyForm());
      setShowForm(false);
      await load();
    } catch (e) {
      toast.error(extractApiMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!form.label.trim()) {
      toast.error("Label is required");
      return;
    }

    const inrStandard = parseFloat(form.inrStandard);
    const inrPro = parseFloat(form.inrPro);
    const inrUltimate = parseFloat(form.inrUltimate);

    if (!Number.isFinite(inrStandard) || inrStandard <= 0) {
      toast.error("Standard price must be a positive number");
      return;
    }
    if (!Number.isFinite(inrPro) || inrPro <= 0) {
      toast.error("Pro price must be a positive number");
      return;
    }
    if (!Number.isFinite(inrUltimate) || inrUltimate <= 0) {
      toast.error("Ultimate price must be a positive number");
      return;
    }

    setSaving(true);
    try {
      await apiClient.put(`/admin/launch-pricing/${editingId}`, {
        label: form.label.trim(),
        standardMonthlyInr: Math.round(inrStandard),
        proMonthlyInr: Math.round(inrPro),
        ultimateMonthlyInr: Math.round(inrUltimate),
        ...(usdToInrRate > 0 ? { usdConversionRate: usdToInrRate } : {}),
      });
      toast.success("Launch pricing configuration updated");
      clearClientGetCache("/public/launch-pricing/active");
      clearLaunchPricingClientCache();
      setForm(emptyForm());
      setEditingId(null);
      setShowForm(false);
      await load();
    } catch (e) {
      toast.error(extractApiMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const [syncingPolarId, setSyncingPolarId] = useState<string | null>(null);

  const handleSyncPolar = async (id: string) => {
    setSyncingPolarId(id);
    try {
      const res = await apiClient.post(`/admin/launch-pricing/${id}/sync-polar`, {});
      const synced = res?.data?.synced ?? 0;
      toast.success(
        synced > 0
          ? `Synced ${synced} Polar product price(s)`
          : "Polar sync completed (check POLAR_PRODUCT_* env if nothing updated)",
      );
    } catch (e) {
      toast.error(extractApiMessage(e));
    } finally {
      setSyncingPolarId(null);
    }
  };

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await apiClient.post(`/admin/launch-pricing/${id}/toggle`, {
        isActive: !currentEnabled,
      });
      clearClientGetCache("/public/launch-pricing/active");
      clearLaunchPricingClientCache();
      const polarNote =
        !currentEnabled && res?.message
          ? " Polar catalog prices were synced."
          : !currentEnabled
            ? ""
            : " Polar catalog reverted to imported list prices.";
      toast.success(
        (currentEnabled ? "Configuration disabled" : "Configuration enabled") + polarNote,
      );
      await load();
    } catch (e) {
      toast.error(extractApiMessage(e));
    }
  };

  const handleEdit = (config: LaunchPricingConfigRow) => {
    setForm({
      label: config.label,
      inrStandard: String(config.inrStandard),
      inrPro: String(config.inrPro),
      inrUltimate: String(config.inrUltimate),
      conversionRate: String(config.conversionRate),
    });
    setEditingId(config.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(false);
  };

  const handleUpdateRate = async () => {
    try {
      await apiClient.put("/admin/currency/rate", { rate: conversionRate });
      toast.success("Currency conversion rate updated");
      await loadCurrencyRate();
    } catch (e) {
      toast.error(extractApiMessage(e));
    }
  };

  const handleRefreshFromForex = async () => {
    setRefreshingRate(true);
    try {
      const res = await api.admin.refreshExchangeRate();
      const data = (res as {
        data?: {
          count?: number;
          usdToInr?: number;
          inrToUsd?: number;
          lastUpdated?: string;
          source?: string;
        };
      })?.data;
      if (data?.usdToInr && data.usdToInr > 0) {
        const inrToUsd = data.inrToUsd ?? 1 / data.usdToInr;
        applyCurrencyRate({
          rate: inrToUsd,
          inrToUsd,
          usdToInr: data.usdToInr,
          displayPrimary: `1 USD = ${data.usdToInr.toFixed(2)} INR`,
          displaySecondary: `1 INR = ${inrToUsd.toFixed(6)} USD`,
          source: data.source ?? "forex-api",
          updatedAt: data.lastUpdated ?? new Date().toISOString(),
          lastUpdated: data.lastUpdated,
        });
      }
      clearClientGetCache("/admin/currency/rate");
      await loadCurrencyRate();
      toast.success(
        data?.usdToInr
          ? `Rates refreshed: 1 USD = ${data.usdToInr.toFixed(2)} INR (${data.count ?? 0} currencies)`
          : "Exchange rates refreshed from Forex API",
      );
    } catch (e) {
      toast.error(extractApiMessage(e));
    } finally {
      setRefreshingRate(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Launch Pricing
            </CardTitle>
            <CardDescription>
              Configure INR-based pricing with automatic USD conversion. INR is the primary currency;
              USD prices are auto-calculated.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (showForm) {
                handleCancelEdit();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm ? (
              <>Cancel</>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                New config
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Currency Rate Configuration */}
          <div className="rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Live Exchange Rate</span>
            </div>
            <div className="flex justify-end mb-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleRefreshFromForex()}
                disabled={refreshingRate}
              >
                {refreshingRate ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Refresh from Forex
              </Button>
            </div>
            <div className="mb-3">
              <p className="text-lg font-semibold font-mono">
                {currencyRate?.displayPrimary ?? `1 USD = ${usdToInrRate.toFixed(2)} INR`}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {currencyRate?.displaySecondary ??
                  `1 INR = ${inrToUsdRate.toFixed(6)} USD`}
              </p>
              {currencyRate?.source && (
                <p className="text-xs text-muted-foreground mt-1">
                  Source: {currencyRate.source}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 w-full">
                <Label htmlFor="conversion-rate" className="text-xs text-muted-foreground">
                  Manual override (1 USD = ? INR)
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="conversion-rate"
                    type="number"
                    step="0.01"
                    min="50"
                    max="150"
                    value={usdToInrRate}
                    onChange={(e) => {
                      const usdToInr = parseFloat(e.target.value);
                      if (Number.isFinite(usdToInr) && usdToInr > 0) {
                        // Convert back to INR to USD rate for storage
                        const inrToUsd = 1 / usdToInr;
                        setForm((f) => ({ ...f, conversionRate: String(inrToUsd) }));
                      }
                    }}
                    className="font-mono"
                    placeholder="83.5"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleUpdateRate}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {currencyRate && (
                  <span className="block">
                    Last updated:{" "}
                    {new Date(
                      currencyRate.lastUpdated || currencyRate.updatedAt,
                    ).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              USD prices = INR ÷ {usdToInrRate > 0 ? usdToInrRate.toFixed(2) : "—"} (live: 1 USD ={" "}
              {usdToInrRate > 0 ? usdToInrRate.toFixed(2) : "—"} INR)
            </p>
          </div>

          {/* Create/Edit Form */}
          {showForm && (
            <div className="rounded-lg border p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="config-label">Configuration Label</Label>
                <Input
                  id="config-label"
                  placeholder="e.g., Launch Offer, Summer Sale"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="inr-standard" className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Standard (Monthly)
                  </Label>
                  <Input
                    id="inr-standard"
                    type="number"
                    min="1"
                    value={form.inrStandard}
                    onChange={(e) => setForm((f) => ({ ...f, inrStandard: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inr-pro" className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Pro (Monthly)
                  </Label>
                  <Input
                    id="inr-pro"
                    type="number"
                    min="1"
                    value={form.inrPro}
                    onChange={(e) => setForm((f) => ({ ...f, inrPro: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inr-ultimate" className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Ultimate (Monthly)
                  </Label>
                  <Input
                    id="inr-ultimate"
                    type="number"
                    min="1"
                    value={form.inrUltimate}
                    onChange={(e) => setForm((f) => ({ ...f, inrUltimate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Calculated Prices Preview */}
              <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calculator className="h-4 w-4" />
                  Auto-Calculated Prices
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* INR Prices */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <IndianRupee className="h-4 w-4" />
                      INR (Primary)
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground">Standard Monthly</div>
                        <div className="font-mono font-medium">
                          ₹{calculatedPrices.inr.standard.monthly}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground">Standard Yearly</div>
                        <div className="font-mono font-medium">
                          ₹{calculatedPrices.inr.standard.yearly}
                          <span className="text-xs text-muted-foreground ml-1">
                            (-{YEARLY_DISCOUNT_PERCENT}%)
                          </span>
                        </div>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground">Pro Monthly</div>
                        <div className="font-mono font-medium">
                          ₹{calculatedPrices.inr.pro.monthly}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground">Pro Yearly</div>
                        <div className="font-mono font-medium">
                          ₹{calculatedPrices.inr.pro.yearly}
                          <span className="text-xs text-muted-foreground ml-1">
                            (-{YEARLY_DISCOUNT_PERCENT}%)
                          </span>
                        </div>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground">Ultimate Monthly</div>
                        <div className="font-mono font-medium">
                          ₹{calculatedPrices.inr.ultimate.monthly}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground">Ultimate Yearly</div>
                        <div className="font-mono font-medium">
                          ₹{calculatedPrices.inr.ultimate.yearly}
                          <span className="text-xs text-muted-foreground ml-1">
                            (-{YEARLY_DISCOUNT_PERCENT}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* USD Prices */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      USD (Auto-Converted)
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground">Standard Monthly</div>
                        <div className="font-mono font-medium">
                          ${calculatedPrices.usd.standard.monthly.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground">Standard Yearly</div>
                        <div className="font-mono font-medium">
                          ${calculatedPrices.usd.standard.yearly.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground">Pro Monthly</div>
                        <div className="font-mono font-medium">
                          ${calculatedPrices.usd.pro.monthly.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground">Pro Yearly</div>
                        <div className="font-mono font-medium">
                          ${calculatedPrices.usd.pro.yearly.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground">Ultimate Monthly</div>
                        <div className="font-mono font-medium">
                          ${calculatedPrices.usd.ultimate.monthly.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-background">
                        <div className="text-xs text-muted-foreground">Ultimate Yearly</div>
                        <div className="font-mono font-medium">
                          ${calculatedPrices.usd.ultimate.yearly.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <strong>Formulas:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>
                      USD Monthly = INR Monthly ÷ {usdToInrRate > 0 ? usdToInrRate.toFixed(2) : "—"}
                    </li>
                    <li>Yearly = Monthly × 12 × (1 - {YEARLY_DISCOUNT_PERCENT}%) = Monthly × {12 * (1 - YEARLY_DISCOUNT_PERCENT / 100)}</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    if (editingId) {
                      void handleUpdate();
                    } else {
                      void handleCreate();
                    }
                  }}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingId ? "Update Configuration" : "Create Configuration"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Existing Configurations List */}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading configurations…
            </div>
          ) : configs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No launch pricing configurations yet.</p>
          ) : (
            <div className="space-y-3">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{config.label}</span>
                      {config.enabled ? (
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Standard:</span>{" "}
                        <span className="font-mono">
                          ₹{config.inrStandard} / ${config.usdStandard.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pro:</span>{" "}
                        <span className="font-mono">
                          ₹{config.inrPro} / ${config.usdPro.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ultimate:</span>{" "}
                        <span className="font-mono">
                          ₹{config.inrUltimate} / ${config.usdUltimate.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Rate: 1 USD = {Math.round((1 / config.conversionRate) * 100) / 100} INR · Updated:{" "}
                      {new Date(config.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(config)}>
                      Edit
                    </Button>
                    {config.enabled ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={syncingPolarId === config.id}
                        onClick={() => handleSyncPolar(config.id)}
                      >
                        {syncingPolarId === config.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Sync Polar
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant={config.enabled ? "secondary" : "default"}
                      size="sm"
                      onClick={() => handleToggle(config.id, config.enabled)}
                    >
                      {config.enabled ? (
                        <>
                          <ToggleRight className="h-4 w-4 mr-1" />
                          Disable
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4 mr-1" />
                          Enable
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
