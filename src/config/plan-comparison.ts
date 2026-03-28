import { PLAN_LIMITS, SUBSCRIPTION_PLANS } from "@/config/plans";

/** Mirrors backend `QuotaService` monthly pools (see backend/src/services/quota.service.ts). */
export const BACKEND_MONTHLY_CREDITS = {
  free: 50,
  standard: 500,
  pro: 2000,
  ultimate: 10000,
} as const;

/** Default text-generation check uses ~1.5 credits; image jobs often ~1+ (see media controller). */
export const CREDIT_USAGE_NOTE =
  "Credits deduct per job: typical text generation ~1.5 credits in quota checks; images ~1 credit; carousels scale with complexity. Pools reset on your billing cycle.";

export type PlanColumnId = "free" | "standard" | "pro" | "ultimate";

export type ComparisonRow = {
  feature: string;
  free: string;
  standard: string;
  pro: string;
  ultimate: string;
  footnote?: boolean;
};

function approxRuns(credits: number, perJob = 1.5): string {
  const n = Math.floor(credits / perJob);
  return `~${n} typical runs`;
}

export const PLAN_COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Monthly AI credits (backend pool)",
    free: `${BACKEND_MONTHLY_CREDITS.free}`,
    standard: `${BACKEND_MONTHLY_CREDITS.standard}`,
    pro: `${BACKEND_MONTHLY_CREDITS.pro}`,
    ultimate: `${BACKEND_MONTHLY_CREDITS.ultimate}`,
  },
  {
    feature: "Rough capacity (≈1.5 cr / text job)",
    free: approxRuns(BACKEND_MONTHLY_CREDITS.free),
    standard: approxRuns(BACKEND_MONTHLY_CREDITS.standard),
    pro: approxRuns(BACKEND_MONTHLY_CREDITS.pro),
    ultimate: approxRuns(BACKEND_MONTHLY_CREDITS.ultimate),
    footnote: true,
  },
  {
    feature: "Channel targets (roadmap capacity)",
    free: "Trial focus",
    standard: `${PLAN_LIMITS.standard.channels}`,
    pro: `${PLAN_LIMITS.pro.channels}`,
    ultimate: `${PLAN_LIMITS.ultimate.channels}`,
  },
  {
    feature: "Team seats (target)",
    free: "1",
    standard: `${PLAN_LIMITS.standard.teamMembers}`,
    pro: `${PLAN_LIMITS.pro.teamMembers}`,
    ultimate: `${PLAN_LIMITS.ultimate.teamMembers}`,
  },
  {
    feature: "API access",
    free: "—",
    standard: "—",
    pro: "Included",
    ultimate: "Included",
  },
  {
    feature: "API volume target (calls / mo)",
    free: "—",
    standard: "—",
    pro: `${PLAN_LIMITS.pro.apiCalls.toLocaleString()}`,
    ultimate: `${PLAN_LIMITS.ultimate.apiCalls.toLocaleString()}`,
  },
];

export function getPlanPriceCells(annual: boolean): Record<PlanColumnId, string> {
  const out = {} as Record<PlanColumnId, string>;
  for (const id of ["free", "standard", "pro", "ultimate"] as PlanColumnId[]) {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === id);
    if (!plan) continue;
    const m = plan.pricing.monthly;
    const y = plan.pricing.yearly;
    if (m === 0 && y === 0) {
      out[id] = "$0";
    } else {
      const display = annual && y > 0 ? Math.round((y / 12) * 100) / 100 : m;
      out[id] = `$${display}/mo`;
    }
  }
  return out;
}
