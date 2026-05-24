"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBSCRIPTION_PLANS } from "@/config/plans";
import type { PricingDisplaySettings, PublicPlansPayload, SubscriptionPlanPayload } from "@/types/publicPlans";
import { getPublicPlansCached } from "@/lib/publicPlansCache";
import { cn } from "@/lib/utils";
import { resolvePlanCardPrices, yearlyDiscountPercentFromPlan } from "@/lib/planDisplayFormatting";
import { PriceDisplay } from "@/components/pricing/PriceDisplay";
import { useAuth } from "@/contexts/AuthContext";
import type { LaunchPricingConfig } from "@/hooks/useActiveLaunchPricing";

const PLAN_INTENT_KEY = "trndinn_pricing_intent";

interface PlanIntent {
  planType: string;
  billingCycle: "monthly" | "yearly";
  timestamp: number;
}

function PlanButton({
  planType,
  isFree,
  popular,
}: {
  planType: string;
  isFree: boolean;
  popular: boolean;
}) {
  const { session } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (session) {
      // User is logged in - go to subscription/upgrade
      router.push("/subscription");
    } else {
      // User is not logged in - save intent and redirect to auth with returnTo
      const cycleElement = document.querySelector('[data-billing-toggle]') as HTMLInputElement;
      const isAnnual = cycleElement?.checked ?? true;
      const billingCycle = isAnnual ? "yearly" : "monthly";

      const intent: PlanIntent = {
        planType,
        billingCycle,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(PLAN_INTENT_KEY, JSON.stringify(intent));

      // Redirect to auth with returnTo pointing to pricing with the selected plan
      const returnTo = `/pricing?plan=${planType}&cycle=${billingCycle}`;
      router.push(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
    }
  };

  return (
    <Button
      className={cn(
        "mt-8 w-full rounded-full font-semibold",
        popular
          ? "bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] text-white shadow-lg shadow-primary/20"
          : "border-white/15 bg-background/50",
      )}
      variant={popular ? "default" : "outline"}
      onClick={handleClick}
    >
      {isFree ? "Start free" : "Choose plan"}
    </Button>
  );
}

const PLAN_ORDER = ["free", "standard", "pro", "ultimate"] as const;
const CURRENCY_LS = "trndinn_display_currency";

function staticFreePlanFromConfig(): SubscriptionPlanPayload {
  const p = SUBSCRIPTION_PLANS.find((x) => x.id === "free");
  return {
    id: "static-free",
    planType: "free",
    name: p?.name ?? "Free",
    description: p?.description ?? "",
    creditsLimit: p?.credits ?? 0,
    priceMonthly: 0,
    priceYearly: 0,
    features: p ? [...p.features] : [],
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
  /** Active launch pricing config to show offer badges and slashed prices */
  activeLaunchConfig?: LaunchPricingConfig | null;
};

export function MarketingPlanGrid({
  intro,
  className,
  showBillingToggle = true,
  annualLocked,
  payload: controlledPayload,
  currency: controlledCurrency,
  onCurrencyChange,
  activeLaunchConfig,
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

  const plansLoading = !payload?.plans?.length;

  const orderedPlans = useMemo(() => {
    if (!payload?.plans?.length) {
      return [];
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
    return yearlyDiscountPercentFromPlan(proPayload, currency);
  }, [orderedPlans, currency]);

  if (plansLoading) {
    return (
      <div className={cn("mx-auto max-w-6xl px-4 py-16 text-center sm:px-6", className)}>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Loading plans…</p>
      </div>
    );
  }

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
          <Select value={currency} onValueChange={(v) => setCurrency(v)}>
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
        {orderedPlans.map((plan) => {
          const tierMeta = SUBSCRIPTION_PLANS.find((sp) => sp.id === plan.planType);
          const popular = plan.planType === "pro" || tierMeta?.popular === true;
          const resolved = resolvePlanCardPrices(plan, currency, useAnnual, activeLaunchConfig);
          const isFree =
            plan.planType === "free" ||
            (resolved.mainAmount === 0 && plan.priceMonthly === 0 && plan.priceYearly === 0);

          return (
            <article
              key={plan.planType}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-gradient-to-b from-card/70 to-card/35 p-6 shadow-xl backdrop-blur-2xl transition duration-300 hover:border-primary/30 hover:shadow-primary/10",
                popular ? "border-primary/45 ring-1 ring-primary/20 lg:scale-[1.02]" : "border-white/10",
              )}
            >
              {activeLaunchConfig?.isActive && activeLaunchConfig.badgeText && plan.planType !== "free" ? (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:text-[11px]">
                  <Sparkles className="inline mr-1 h-3 w-3" />
                  {activeLaunchConfig.badgeText}
                </span>
              ) : popular ? (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:text-[11px]">
                  Most popular
                </span>
              ) : null}

              <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-5 min-h-[4.5rem]">
                {isFree ? (
                  <span className="font-heading text-4xl font-black tracking-tight">Free</span>
                ) : !resolved.pricingReady ? (
                  <span className="text-sm text-muted-foreground">Price unavailable</span>
                ) : (
                  <PriceDisplay
                    listPrice={resolved.strikeAmount ?? resolved.mainAmount}
                    offerPrice={resolved.mainAmount}
                    currency={(resolved.currencyCode as "INR" | "USD") ?? "USD"}
                    period={useAnnual ? "yearly" : "monthly"}
                    showStrikethrough={resolved.isOnSale}
                    yearlyTotal={useAnnual ? resolved.yearlyTotal : null}
                  />
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

              <PlanButton
                planType={plan.planType}
                isFree={isFree}
                popular={popular}
              />
            </article>
          );
        })}
      </div>
    </div>
  );
}
