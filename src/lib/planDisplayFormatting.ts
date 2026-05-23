import type { LaunchPricingConfig } from "@/hooks/useActiveLaunchPricing";
import type { SubscriptionPlanPayload } from "@/types/publicPlans";
import { getLaunchPricingForPlan } from "@/lib/launchPricing";

export function formatPlanMoney(amount: number, currencyCode: string, symbolFallback: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${symbolFallback}${amount}`;
  }
}

function perMonthFromYearlyTotal(yearlyTotal: number): number {
  return yearlyTotal > 0 ? Math.round((yearlyTotal / 12) * 100) / 100 : 0;
}

function catalogTier(plan: SubscriptionPlanPayload, currency: string) {
  const code = (currency || "USD").toUpperCase();
  return plan.displayPricing?.[code] ?? plan.displayPricing?.USD ?? null;
}

export type ResolvedPlanPrices = {
  mainAmount: number;
  strikeAmount: number | null;
  yearlyTotal: number | null;
  currencyCode: string;
  symbolFallback: string;
  isOnSale: boolean;
  /** False when paid tier has no API/catalog price yet (show loading, not guesses). */
  pricingReady: boolean;
};

/**
 * Single source for marketing/billing cards.
 * Launch active → offer from launch config, strikethrough = catalog list from API only.
 * Launch inactive → catalog list from display_pricing (or Polar-synced priceMonthly/Yearly), no offer fields.
 */
export function resolvePlanCardPrices(
  plan: SubscriptionPlanPayload,
  currency: string,
  yearly: boolean,
  launchConfig?: LaunchPricingConfig | null,
): ResolvedPlanPrices {
  const code = (currency || "USD").toUpperCase();
  const tier = catalogTier(plan, currency);
  const symbolFallback = tier?.symbol ?? (code === "INR" ? "₹" : "$");

  if (launchConfig?.isActive) {
    const launchTier = getLaunchPricingForPlan(plan.planType, launchConfig, currency);
    if (launchTier) {
      const listPerMonth = yearly
        ? perMonthFromYearlyTotal(launchTier.listYearly)
        : launchTier.listMonthly;
      const offerPerMonth = yearly
        ? perMonthFromYearlyTotal(launchTier.offerYearly)
        : launchTier.offerMonthly;
      const strike =
        listPerMonth > offerPerMonth && !(plan.planType === "free" && listPerMonth === 0)
          ? listPerMonth
          : null;
      return {
        mainAmount: offerPerMonth,
        strikeAmount: strike,
        yearlyTotal: yearly ? launchTier.offerYearly : null,
        currencyCode: code,
        symbolFallback,
        isOnSale: strike != null,
        pricingReady: offerPerMonth > 0 || plan.planType === "free",
      };
    }
  }

  if (tier) {
    const listPerMonth = yearly ? perMonthFromYearlyTotal(tier.listYearly) : tier.listMonthly;
    return {
      mainAmount: listPerMonth,
      strikeAmount: null,
      yearlyTotal: yearly && tier.listYearly > 0 ? tier.listYearly : null,
      currencyCode: code,
      symbolFallback,
      isOnSale: false,
      pricingReady: listPerMonth > 0 || plan.planType === "free",
    };
  }

  if (plan.priceMonthly > 0 || plan.priceYearly > 0 || plan.planType === "free") {
    const main =
      yearly && plan.priceYearly > 0 ? perMonthFromYearlyTotal(plan.priceYearly) : plan.priceMonthly;
    return {
      mainAmount: main,
      strikeAmount: null,
      yearlyTotal: yearly && plan.priceYearly > 0 ? plan.priceYearly : null,
      currencyCode: "USD",
      symbolFallback: "$",
      isOnSale: false,
      pricingReady: true,
    };
  }

  return {
    mainAmount: 0,
    strikeAmount: null,
    yearlyTotal: null,
    currencyCode: code,
    symbolFallback,
    isOnSale: false,
    pricingReady: false,
  };
}

/** Catalog-only display (comparison table). Ignores display_pricing offer fields. */
export function resolveDisplayedPrices(
  plan: SubscriptionPlanPayload,
  currency: string,
  yearly: boolean,
  launchConfig?: LaunchPricingConfig | null,
): {
  mainAmount: number;
  strikeAmount: number | null;
  currencyCode: string;
  symbolFallback: string;
} {
  const resolved = resolvePlanCardPrices(plan, currency, yearly, launchConfig);
  return {
    mainAmount: resolved.mainAmount,
    strikeAmount: resolved.strikeAmount,
    currencyCode: resolved.currencyCode,
    symbolFallback: resolved.symbolFallback,
  };
}

export function resolveYearlyBilledTotal(
  plan: SubscriptionPlanPayload,
  currency: string,
  launchConfig?: LaunchPricingConfig | null,
): number | null {
  const code = (currency || "USD").toUpperCase();

  if (launchConfig?.isActive) {
    const launchTier = getLaunchPricingForPlan(plan.planType, launchConfig, currency);
    if (launchTier?.offerYearly != null && launchTier.offerYearly >= 0) {
      return launchTier.offerYearly;
    }
  }

  const tier = catalogTier(plan, currency);
  if (tier?.listYearly != null && tier.listYearly > 0) {
    return tier.listYearly;
  }
  return plan.priceYearly > 0 ? plan.priceYearly : null;
}

export function yearlyDiscountPercentFromPlan(
  plan: SubscriptionPlanPayload,
  currency: string,
): number {
  const tier = catalogTier(plan, currency);
  if (tier && tier.listMonthly > 0 && tier.listYearly > 0) {
    const monthlyTotal = tier.listMonthly * 12;
    return Math.round(((monthlyTotal - tier.listYearly) / monthlyTotal) * 100);
  }
  if (plan.priceMonthly > 0 && plan.priceYearly > 0) {
    const monthlyTotal = plan.priceMonthly * 12;
    return Math.round(((monthlyTotal - plan.priceYearly) / monthlyTotal) * 100);
  }
  return 0;
}
