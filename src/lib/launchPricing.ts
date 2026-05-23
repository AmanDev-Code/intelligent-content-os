import type { LaunchPricingConfig, LaunchPricingCurrencyTier } from "@/hooks/useActiveLaunchPricing";

export function getLaunchPricingForPlan(
  planType: string,
  launchConfig: LaunchPricingConfig | null | undefined,
  currency: string,
): LaunchPricingCurrencyTier | null {
  if (!launchConfig?.isActive || !launchConfig.plans?.length) return null;
  const plan = launchConfig.plans.find((p) => p.planType === planType);
  if (!plan) return null;
  const code = (currency || "USD").toUpperCase();
  if (code === "INR" && plan.INR) return plan.INR;
  if (code === "USD" && plan.USD) return plan.USD;
  return plan.USD ?? plan.INR ?? null;
}
