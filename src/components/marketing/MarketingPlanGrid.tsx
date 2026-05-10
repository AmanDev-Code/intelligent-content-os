"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateYearlyDiscount, SUBSCRIPTION_PLANS } from "@/config/plans";
import type { PricingDisplaySettings, PublicPlansPayload, SubscriptionPlanPayload } from "@/types/publicPlans";
import { getPublicPlansCached } from "@/lib/publicPlansCache";
import { cn } from "@/lib/utils";
import { formatPlanMoney, resolveDisplayedPrices, resolveYearlyBilledTotal } from "@/lib/planDisplayFormatting";

const PLAN_ORDER = ["free", "standard", "pro", "ultimate"] as const;
const CURRENCY_LS = "trndinn_display_currency";

function staticFreePlanFromConfig(): SubscriptionPlanPayload {
  const p = SUBSCRIPTION_PLANS.find((x) => x.id === "free");
  if (!p) {
    return {
      id: "static-free",
      planType: "free",
      name: "Free",
      description: "",
      creditsLimit: 0,
      priceMonthly: 0,
      priceYearly: 0,
      features: [],
      isActive: true,
      sortOrder: 0,
      displayPricing: null,
    };
  }
  return {
    id: "static-free",
    planType: "free",
    name: p.name,
    description: p.description,
    creditsLimit: p.credits,
    priceMonthly: p.pricing.monthly,
    priceYearly: p.pricing.yearly,
    features: [...p.features],
    isActive: true,
    sortOrder: 0,
    displayPricing: null,
  };
}

export type MarketingPlanGridProps = {
  intro?: { eyebrow: string; title: string; description?: string };
  className?: string;
  showBillingToggle?: boolean;
  annualLocked?: boolean;
  /** Parent-owned payload so /pricing shares currency with comparison table */
  payload?: PublicPlansPayload | null;
  currency?: string;
  onCurrencyChange?: (c: string) => void;
};

export function MarketingPlanGrid({
  intro,
  className,
  showBillingToggle = true,
  annualLocked,
  payload: controlledPayload,
  currency: controlledCurrency,
  onCurrencyChange,
}: MarketingPlanGridProps) {
  const [annual, setAnnual] = useState(true);
  const useAnnual = annualLocked !== undefined ? annualLocked : annual;

  const [uncontrolledPayload, setUncontrolledPayload] = useState<PublicPlansPayload | null>(
    controlledPayload ?? null,
  );
  const [uncontrolledCurrency, setUncontrolledCurrency] = useState("USD");

  useEffect(() => {
    setUncontrolledPayload(controlledPayload ?? null);
  }, [controlledPayload]);

  useEffect(() => {
    if (controlledPayload != null) return;
    let alive = true;
    void getPublicPlansCached().then((p) => {
      if (alive) setUncontrolledPayload(p);
    });
    return () => {
      alive = false;
    };
  }, [controlledPayload]);

  useEffect(() => {
    if (controlledCurrency !== undefined || typeof window === "undefined") return;
    const ls = window.localStorage.getItem(CURRENCY_LS);
    void getPublicPlansCached().then((p) => {
      const fallback = ls && p.pricingDisplay.supportedCurrencies.includes(ls) ? ls : p.pricingDisplay.defaultCurrency;
      setUncontrolledCurrency(fallback.toUpperCase());
    });
  }, [controlledCurrency]);

  const payload = controlledPayload ?? uncontrolledPayload;
  const currency = controlledCurrency ?? uncontrolledCurrency;
  const setCurrency = onCurrencyChange ?? ((c: string) => {
      setUncontrolledCurrency(c.toUpperCase());
      if (typeof window !== "undefined") {
        window.localStorage.setItem(CURRENCY_LS, c.toUpperCase());
      }
    });

  const pricingMeta: PricingDisplaySettings = payload?.pricingDisplay ?? {
    defaultCurrency: "USD",
    supportedCurrencies: ["USD", "INR"],
  };

  const orderedPlans = useMemo(() => {
    if (!payload?.plans?.length) {
      return SUBSCRIPTION_PLANS.filter((p) => PLAN_ORDER.includes(p.id as (typeof PLAN_ORDER)[number])).map((p) => ({
        planType: p.id,
        name: p.name,
        description: p.description,
        creditsLimit: p.credits,
        priceMonthly: p.pricing.monthly,
        priceYearly: p.pricing.yearly,
        features: p.features,
        popular: p.popular,
        displayPricing: null,
      }));
    }

    const byType = Object.fromEntries(payload.plans.map((p) => [p.planType, p]));

    const list: SubscriptionPlanPayload[] = [];
    for (const id of PLAN_ORDER) {
      const row = byType[id];
      if (row?.isActive === false && id !== "free") continue;
      if (!row && id !== "free") continue;
      if (row) list.push(row);
      else if (id === "free") list.push(staticFreePlanFromConfig());
    }
    return list;
  }, [payload]);

  const yearlyDiscountBanner = useMemo(() => {
    const proPayload = orderedPlans.find((p) => p.planType === "pro");
    if (!proPayload) return 0;
    return calculateYearlyDiscount(proPayload.priceMonthly, proPayload.priceYearly);
  }, [orderedPlans]);

  const popularPayload = orderedPlans.find((p) => p.planType === "pro");

  return (
    <div className={cn("mx-auto max-w-6xl px-4 sm:px-6", className)}>
      {intro && (
        <div className="mb-10 text-center md:mb-14">
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.28em] text-primary sm:text-sm">{intro.eyebrow}</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">{intro.title}</h2>
          {intro.description ? (
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">{intro.description}</p>
          ) : null}
        </div>
      )}

      <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pricing region</span>
          <Select
            value={currency}
            onValueChange={(v) => setCurrency(v)}
          >
            <SelectTrigger className="w-[180px]" aria-label="Select currency">
              <SelectValue placeholder={currency} />
            </SelectTrigger>
            <SelectContent>
              {pricingMeta.supportedCurrencies.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "USD" ? "United States Dollar (USD)" : c === "INR" ? "Indian Rupee (INR)" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showBillingToggle && annualLocked === undefined ? (
        <div className="mb-10 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-card/40 px-4 py-2 backdrop-blur-xl">
            <span className={cn("text-sm", !annual && "font-semibold text-foreground")}>Monthly</span>
            <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Toggle yearly billing" />
            <span className={cn("text-sm", annual && "font-semibold text-foreground")}>
              Yearly{" "}
              <span className="text-primary">
                {yearlyDiscountBanner > 0 ? `(~${yearlyDiscountBanner}% off vs monthly)` : "(save vs monthly × 12)"}
              </span>
            </span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {(orderedPlans as (SubscriptionPlanPayload & { popular?: boolean })[]).map((plan) => {
          const tierLabel = SUBSCRIPTION_PLANS.find((sp) => sp.id === plan.planType);
          const popular = tierLabel?.popular ?? false;
          const { mainAmount, strikeAmount, currencyCode, symbolFallback } = resolveDisplayedPrices(
            plan,
            currency,
            useAnnual,
          );
          const yearlyTotal = resolveYearlyBilledTotal(plan, currency);
          const isFree = plan.planType === "free" || (mainAmount === 0 && plan.priceMonthly === 0 && plan.priceYearly === 0);

          return (
            <article
              key={plan.planType}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-gradient-to-b from-card/70 to-card/35 p-6 shadow-xl backdrop-blur-2xl transition duration-300 hover:border-primary/30 hover:shadow-primary/10",
                popular ? "border-primary/45 ring-1 ring-primary/20 lg:scale-[1.02]" : "border-white/10",
              )}
            >
              {popular ? (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:text-[11px]">
                  Most popular
                </span>
              ) : null}
              <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-5">
                {isFree ? (
                  <span className="font-heading text-4xl font-black tracking-tight">Free</span>
                ) : (
                  <>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      {strikeAmount != null && strikeAmount > mainAmount ? (
                        <span className="text-lg font-semibold tracking-tight text-muted-foreground line-through">
                          {formatPlanMoney(strikeAmount, currencyCode, symbolFallback)}
                        </span>
                      ) : null}
                      <span className="font-heading text-4xl font-black tracking-tight">
                        {formatPlanMoney(mainAmount, currencyCode, symbolFallback)}
                        <span className="text-base font-medium text-muted-foreground">/mo</span>
                      </span>
                    </div>
                    {useAnnual && yearlyTotal != null ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        ≈{" "}
                        <span className="font-medium text-foreground">
                          {formatPlanMoney(yearlyTotal, currencyCode, symbolFallback)}
                        </span>{" "}
                        per year billed upfront
                      </p>
                    ) : null}
                    {useAnnual && popularPayload && yearlyDiscountBanner > 0 ? (
                      <p className="mt-1 text-xs text-primary">~{yearlyDiscountBanner}% off vs paying monthly × 12</p>
                    ) : null}
                  </>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-muted-foreground">
                {plan.features.map((f: string) => (
                  <li key={f} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={cn(
                  "mt-8 w-full rounded-full font-semibold",
                  popular ? "bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] text-white shadow-lg shadow-primary/20" : "border-white/15 bg-background/50",
                )}
                variant={popular ? "default" : "outline"}
                asChild
              >
                <Link href="/auth">{isFree ? "Start free" : "Choose plan"}</Link>
              </Button>
            </article>
          );
        })}
      </div>

      {!payload?.plans?.length && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Loading live plans from backend… Showing local defaults briefly if the API is slow.
        </p>
      )}
    </div>
  );
}
