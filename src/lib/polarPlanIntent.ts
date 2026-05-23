import type { PolarBillingCycle, PolarPlanType } from "@/lib/polar";

const INTENT_KEY = "trndinn_polar_plan_intent";
const RETURN_KIND_KEY = "trndinn_polar_return_kind";

export type PolarPlanIntent = {
  planType: PolarPlanType;
  billingCycle: PolarBillingCycle;
};

export type PolarReturnKind = "portal" | "checkout";

export function storePolarPlanIntent(intent: PolarPlanIntent): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent));
}

export function readPolarPlanIntent(): PolarPlanIntent | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(INTENT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PolarPlanIntent;
    if (
      parsed?.planType &&
      (parsed.billingCycle === "monthly" || parsed.billingCycle === "yearly")
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function clearPolarPlanIntent(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(INTENT_KEY);
}

export function markPolarReturnKind(kind: PolarReturnKind): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RETURN_KIND_KEY, kind);
}

export function consumePolarReturnKind(): PolarReturnKind | null {
  if (typeof window === "undefined") return null;
  const kind = sessionStorage.getItem(RETURN_KIND_KEY);
  sessionStorage.removeItem(RETURN_KIND_KEY);
  return kind === "portal" || kind === "checkout" ? kind : null;
}
