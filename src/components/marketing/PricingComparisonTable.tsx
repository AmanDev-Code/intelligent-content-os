"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  CREDIT_USAGE_NOTE,
  PLAN_COMPARISON_ROWS,
  getPlanPriceCells,
  type PlanColumnId,
} from "@/config/plan-comparison";
import { calculateYearlyDiscount, SUBSCRIPTION_PLANS } from "@/config/plans";
import { cn } from "@/lib/utils";

const COLS: { id: PlanColumnId; label: string }[] = [
  { id: "free", label: "Free" },
  { id: "standard", label: "Standard" },
  { id: "pro", label: "Pro" },
  { id: "ultimate", label: "Ultimate" },
];

export function PricingComparisonTable() {
  const [annual, setAnnual] = useState(true);
  const prices = getPlanPriceCells(annual);

  const proPlan = SUBSCRIPTION_PLANS.find((p) => p.id === "pro");
  const yearlyDisc =
    proPlan && proPlan.pricing.monthly > 0 && proPlan.pricing.yearly > 0
      ? calculateYearlyDiscount(proPlan.pricing.monthly, proPlan.pricing.yearly)
      : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Plan comparison</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Numbers below align with the NestJS quota service and <code className="rounded bg-muted px-1 text-xs">PLAN_LIMITS</code>{" "}
            in the repo—credits are enforced server-side via Supabase views and job workers.
          </p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-card/40 px-4 py-2 backdrop-blur-xl">
          <span className={cn("text-sm", !annual && "font-semibold text-foreground")}>Monthly</span>
          <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Toggle yearly pricing display" />
          <span className={cn("text-sm", annual && "font-semibold text-foreground")}>
            Yearly {yearlyDisc > 0 ? <span className="text-primary">(~{yearlyDisc}% off)</span> : null}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gradient-to-b from-card/50 to-card/25 shadow-xl backdrop-blur-xl">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-background/40">
              <th className="px-4 py-4 font-heading font-semibold text-foreground sm:px-6">Capability</th>
              {COLS.map(({ id, label }) => (
                <th
                  key={id}
                  className={cn(
                    "px-3 py-4 font-heading font-semibold sm:px-4",
                    id === "pro" && "bg-primary/10 text-primary",
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span>{label}</span>
                    <span className="text-xs font-normal text-muted-foreground">{prices[id]}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARISON_ROWS.map((row) => (
              <tr key={row.feature} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3.5 text-muted-foreground sm:px-6">
                  <span className="inline-flex items-start gap-2">
                    {row.footnote ? <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/80" /> : null}
                    {row.feature}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-foreground/90 sm:px-4">{row.free}</td>
                <td className="px-3 py-3.5 text-foreground/90 sm:px-4">{row.standard}</td>
                <td className={cn("px-3 py-3.5 sm:px-4", "bg-primary/[0.06] font-medium text-foreground")}>{row.pro}</td>
                <td className="px-3 py-3.5 text-foreground/90 sm:px-4">{row.ultimate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{CREDIT_USAGE_NOTE}</p>
    </div>
  );
}
