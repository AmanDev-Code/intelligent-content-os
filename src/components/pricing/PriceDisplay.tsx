"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowDown } from "lucide-react";

export type PriceDisplayProps = {
  /** Original/list price (crossed out when on sale) */
  listPrice: number;
  /** Discounted/offer price */
  offerPrice: number;
  /** Currency code */
  currency: "INR" | "USD";
  /** Billing period */
  period: "monthly" | "yearly";
  /** Whether to show strikethrough on list price */
  showStrikethrough?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Optional yearly total amount displayed below */
  yearlyTotal?: number | null;
};

const currencySymbols: Record<string, string> = {
  USD: "$",
  INR: "₹",
};

function formatMoney(
  amount: number,
  currency: string,
  compact: boolean = false,
): string {
  const symbol = currencySymbols[currency] || "$";
  const isWhole = amount % 1 === 0;
  const decimals = isWhole ? 0 : 2;

  if (compact && amount >= 1000) {
    if (currency === "INR") {
      // For INR, show in thousands (K)
      return `${symbol}${(amount / 1000).toFixed(1)}K`;
    }
    return `${symbol}${amount.toFixed(0)}`;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(amount);
  } catch {
    return `${symbol}${amount.toFixed(decimals)}`;
  }
}

function calculateSavings(listPrice: number, offerPrice: number): { amount: number; percent: number } {
  const amount = listPrice - offerPrice;
  const percent = listPrice > 0 ? Math.round((amount / listPrice) * 100) : 0;
  return { amount, percent };
}

/**
 * Reusable price display component with slashed list prices and savings badge.
 * Shows strikethrough on list price when on sale, displays "Save X%" badge.
 * Supports both INR and USD with proper formatting.
 */
export function PriceDisplay({
  listPrice,
  offerPrice,
  currency,
  period,
  showStrikethrough = false,
  size = "md",
  className,
  yearlyTotal,
}: PriceDisplayProps) {
  const isOnSale = showStrikethrough && listPrice > offerPrice && offerPrice >= 0;
  const savings = isOnSale ? calculateSavings(listPrice, offerPrice) : null;

  const sizeClasses = {
    sm: {
      container: "gap-1",
      strikethrough: "text-xs",
      mainPrice: "text-xl",
      period: "text-xs",
      badge: "text-[10px] px-1.5 py-0.5",
    },
    md: {
      container: "gap-2",
      strikethrough: "text-base",
      mainPrice: "text-3xl",
      period: "text-sm",
      badge: "text-xs px-2 py-0.5",
    },
    lg: {
      container: "gap-3",
      strikethrough: "text-lg",
      mainPrice: "text-4xl",
      period: "text-base",
      badge: "text-sm px-2.5 py-1",
    },
  };

  const classes = sizeClasses[size];

  // If offer price is 0 and there's no strikethrough, show "Free"
  if (offerPrice === 0 && !isOnSale) {
    return (
      <div className={cn("flex items-center", className)}>
        <span className={cn("font-heading font-black tracking-tight text-foreground", classes.mainPrice)}>
          Free
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Price row */}
      <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", classes.container)}>
        {/* Strikethrough list price */}
        {isOnSale && (
          <span className={cn("font-medium text-muted-foreground line-through", classes.strikethrough)}>
            {formatMoney(listPrice, currency)}
          </span>
        )}

        {/* Main offer price */}
        <div className="flex items-baseline gap-1">
          <span className={cn("font-heading font-black tracking-tight text-foreground", classes.mainPrice)}>
            {formatMoney(offerPrice, currency)}
          </span>
          <span className={cn("font-medium text-muted-foreground", classes.period)}>
            /mo
          </span>
        </div>

        {/* Savings badge */}
        {savings && savings.percent > 0 && (
          <Badge
            variant="default"
            className={cn(
              "border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
              classes.badge,
            )}
          >
            <ArrowDown className="mr-0.5 h-3 w-3" />
            Save {currencySymbols[currency]}{savings.amount.toFixed(0)}
          </Badge>
        )}
      </div>

      {/* Yearly total info */}
      {yearlyTotal && period === "yearly" && (
        <p className="mt-1 text-xs text-muted-foreground">
          ≈{" "}
          <span className="font-medium text-foreground">
            {formatMoney(yearlyTotal, currency)}
          </span>{" "}
          per year billed upfront
        </p>
      )}

      {/* Additional savings info for yearly */}
      {isOnSale && period === "yearly" && savings && (
        <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
          ~{savings.percent}% off vs paying monthly × 12
        </p>
      )}
    </div>
  );
}

export type CompactPriceDisplayProps = Pick<
  PriceDisplayProps,
  "listPrice" | "offerPrice" | "currency" | "showStrikethrough" | "className"
>;

/**
 * Compact price display for table rows or tight spaces.
 */
export function CompactPriceDisplay({
  listPrice,
  offerPrice,
  currency,
  showStrikethrough = false,
  className,
}: CompactPriceDisplayProps) {
  const isOnSale = showStrikethrough && listPrice > offerPrice && offerPrice >= 0;
  const savings = isOnSale ? calculateSavings(listPrice, offerPrice) : null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isOnSale && (
        <span className="text-sm text-muted-foreground line-through">
          {formatMoney(listPrice, currency)}
        </span>
      )}
      <span className="text-base font-semibold text-foreground">
        {formatMoney(offerPrice, currency)}
      </span>
      {savings && savings.percent > 0 && (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px]"
        >
          -{savings.percent}%
        </Badge>
      )}
    </div>
  );
}

export type PriceComparisonProps = {
  plans: Array<{
    name: string;
    planType: string;
    listMonthly: number;
    listYearly: number;
    offerMonthly: number;
    offerYearly: number;
  }>;
  currency: "INR" | "USD";
  isYearly: boolean;
  className?: string;
};

/**
 * Compare prices across multiple plans with sale indicators.
 */
export function PriceComparison({
  plans,
  currency,
  isYearly,
  className,
}: PriceComparisonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {plans.map((plan) => {
        const listPrice = isYearly ? plan.listYearly / 12 : plan.listMonthly;
        const offerPrice = isYearly ? plan.offerYearly / 12 : plan.offerMonthly;
        const isOnSale = listPrice > offerPrice;
        const savings = isOnSale ? calculateSavings(listPrice, offerPrice) : null;

        return (
          <div
            key={plan.planType}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3"
          >
            <span className="font-medium text-foreground">{plan.name}</span>
            <div className="flex items-center gap-3">
              {isOnSale && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatMoney(listPrice, currency)}
                </span>
              )}
              <span className="text-lg font-bold text-foreground">
                {formatMoney(offerPrice, currency)}
              </span>
              {savings && savings.percent > 0 && (
                <Badge
                  variant="default"
                  className="border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs"
                >
                  Save {savings.percent}%
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
