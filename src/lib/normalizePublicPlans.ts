import type { PublicPlansPayload, SubscriptionPlanPayload } from "@/types/publicPlans";
import { getClientBillingProvider } from "@/lib/billingProvider";

export function normalizePublicPlansResponse(raw: unknown): PublicPlansPayload {
  if (raw && typeof raw === "object" && "plans" in raw && Array.isArray((raw as PublicPlansPayload).plans)) {
    const o = raw as PublicPlansPayload;
    return {
      plans: o.plans as SubscriptionPlanPayload[],
      pricingDisplay: o.pricingDisplay ?? {
        defaultCurrency: "USD",
        supportedCurrencies: ["USD", "INR"],
      },
      billingProvider: o.billingProvider === "polar" ? o.billingProvider : getClientBillingProvider(),
    };
  }

  if (Array.isArray(raw)) {
    return {
      plans: raw as SubscriptionPlanPayload[],
      pricingDisplay: { defaultCurrency: "USD", supportedCurrencies: ["USD", "INR"] },
      billingProvider: getClientBillingProvider(),
    };
  }

  return {
    plans: [],
    pricingDisplay: { defaultCurrency: "USD", supportedCurrencies: ["USD", "INR"] },
    billingProvider: getClientBillingProvider(),
  };
}
