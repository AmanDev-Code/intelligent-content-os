"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SUBSCRIPTION_PLANS, calculateYearlyDiscount } from "@/config/plans";
import { cn } from "@/lib/utils";

const MARKETING_PLAN_IDS = ["free", "standard", "pro", "ultimate"] as const;

export type MarketingPlanGridProps = {
  /** Intro shown above the grid (e.g. features page). */
  intro?: { eyebrow: string; title: string; description?: string };
  className?: string;
  /** When false, billing is fixed to monthly (still shows yearly-equivalent note on pricing page via parent). */
  showBillingToggle?: boolean;
  /** Force annual display without toggle (e.g. compact embed). */
  annualLocked?: boolean;
};

export function MarketingPlanGrid({
  intro,
  className,
  showBillingToggle = true,
  annualLocked,
}: MarketingPlanGridProps) {
  const [annual, setAnnual] = useState(true);
  const useAnnual = annualLocked !== undefined ? annualLocked : annual;

  const plans = SUBSCRIPTION_PLANS.filter((p) => MARKETING_PLAN_IDS.includes(p.id as (typeof MARKETING_PLAN_IDS)[number]));

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

      {showBillingToggle && annualLocked === undefined ? (
        <div className="mb-10 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-card/40 px-4 py-2 backdrop-blur-xl">
            <span className={cn("text-sm", !annual && "font-semibold text-foreground")}>Monthly</span>
            <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Toggle yearly billing" />
            <span className={cn("text-sm", annual && "font-semibold text-foreground")}>
              Yearly <span className="text-primary">(save vs monthly × 12)</span>
            </span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {plans.map((plan) => {
          const monthly = plan.pricing.monthly;
          const yearly = plan.pricing.yearly;
          const display = useAnnual && yearly > 0 ? Math.round((yearly / 12) * 100) / 100 : monthly;
          const discount = monthly > 0 && yearly > 0 ? calculateYearlyDiscount(monthly, yearly) : 0;

          return (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-gradient-to-b from-card/70 to-card/35 p-6 shadow-xl backdrop-blur-2xl transition duration-300 hover:border-primary/30 hover:shadow-primary/10",
                plan.popular ? "border-primary/45 ring-1 ring-primary/20 lg:scale-[1.02]" : "border-white/10",
              )}
            >
              {plan.popular ? (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:text-[11px]">
                  Most popular
                </span>
              ) : null}
              <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-5">
                {monthly === 0 && yearly === 0 ? (
                  <span className="font-heading text-4xl font-black tracking-tight">$0</span>
                ) : (
                  <span className="font-heading text-4xl font-black tracking-tight">
                    ${display}
                    <span className="text-base font-medium text-muted-foreground">/mo</span>
                  </span>
                )}
                {discount > 0 && useAnnual ? <p className="mt-1 text-xs text-primary">~{discount}% off yearly</p> : null}
              </div>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={cn(
                  "mt-8 w-full rounded-full font-semibold",
                  plan.popular ? "bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] text-white shadow-lg shadow-primary/20" : "border-white/15 bg-background/50",
                )}
                variant={plan.popular ? "default" : "outline"}
                asChild
              >
                <Link href="/auth">{plan.id === "free" ? "Start free" : "Choose plan"}</Link>
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
