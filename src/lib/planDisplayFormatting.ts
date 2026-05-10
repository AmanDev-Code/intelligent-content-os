import type { SubscriptionPlanPayload } from "@/types/publicPlans";

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

/** Returns list = anchor (strikethrough when offer present), main = offer or list. */
export function resolveDisplayedPrices(
  plan: SubscriptionPlanPayload,
  currency: string,
  yearly: boolean,
): {
  mainAmount: number;
  strikeAmount: number | null;
  currencyCode: string;
  symbolFallback: string;
} {
  const code = (currency || "USD").toUpperCase();
  const tier = plan.displayPricing?.[code] ?? plan.displayPricing?.USD ?? null;

  if (!tier) {
    const main =
      yearly && plan.priceYearly > 0 ? Math.round((plan.priceYearly / 12) * 100) / 100 : plan.priceMonthly;
    return {
      mainAmount: main,
      strikeAmount: null,
      currencyCode: "USD",
      symbolFallback: "$",
    };
  }

  const listPerMonth =
    yearly && tier.listYearly > 0 ? Math.round((tier.listYearly / 12) * 100) / 100 : tier.listMonthly;

  const offerWhole = yearly ? tier.offerYearly : tier.offerMonthly;
  const offerPerMonth =
    offerWhole == null
      ? null
      : yearly
        ? Math.round((offerWhole / 12) * 100) / 100
        : offerWhole;

  if (
    offerPerMonth != null &&
    offerPerMonth >= 0 &&
    listPerMonth > offerPerMonth &&
    !(plan.planType === "free" && listPerMonth === 0)
  ) {
    return {
      mainAmount: offerPerMonth,
      strikeAmount: listPerMonth,
      currencyCode: code,
      symbolFallback: tier.symbol,
    };
  }

  return {
    mainAmount: listPerMonth,
    strikeAmount: null,
    currencyCode: code,
    symbolFallback: tier.symbol,
  };
}

export function resolveYearlyBilledTotal(
  plan: SubscriptionPlanPayload,
  currency: string,
): number | null {
  const code = (currency || "USD").toUpperCase();
  const tier = plan.displayPricing?.[code] ?? plan.displayPricing?.USD ?? null;
  if (!tier) {
    return plan.priceYearly > 0 ? plan.priceYearly : null;
  }
  if (tier.offerYearly != null && tier.offerYearly >= 0) {
    return tier.offerYearly;
  }
  return tier.listYearly > 0 ? tier.listYearly : null;
}
