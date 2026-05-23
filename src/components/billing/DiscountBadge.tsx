import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, Percent, DollarSign, X } from "lucide-react";
import { cn } from "@/lib/utils";

type DiscountType = "percentage" | "fixed";

type DiscountBadgeProps = {
  code: string;
  name?: string;
  discountType: DiscountType;
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  onClear?: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "outline";
  className?: string;
};

export function DiscountBadge({
  code,
  name,
  discountType,
  percentOff,
  amountOff,
  currency = "USD",
  onClear,
  size = "md",
  variant = "success",
  className,
}: DiscountBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] h-5 px-1.5 gap-0.5",
    md: "text-xs h-6 px-2 gap-1",
    lg: "text-sm h-8 px-3 gap-1.5",
  };

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  const clearButtonSizes = {
    sm: "h-4 w-4 -mr-0.5",
    md: "h-5 w-5 -mr-1",
    lg: "h-6 w-6 -mr-1.5",
  };

  const clearIconSizes = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  const getDisplayText = () => {
    const displayName = name || code;

    if (discountType === "percentage" && percentOff) {
      return `${displayName} (${percentOff}% off)`;
    }

    if (discountType === "fixed" && amountOff) {
      const symbol = currency === "USD" || currency === "AUD" ? "$" : "₹";
      return `${displayName} (-${symbol}${amountOff})`;
    }

    return displayName;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900/50 hover:bg-green-100 dark:hover:bg-green-900/30";
      case "outline":
        return "border-border bg-transparent text-foreground hover:bg-muted";
      case "default":
      default:
        return "bg-primary/10 text-primary hover:bg-primary/10";
    }
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors",
        sizeClasses[size],
        getVariantStyles(),
        className
      )}
    >
      <Tag className={cn(iconSizes[size], "shrink-0 opacity-70")} />

      {discountType === "percentage" ? (
        <Percent className={cn(iconSizes[size], "shrink-0 opacity-70")} />
      ) : (
        <DollarSign className={cn(iconSizes[size], "shrink-0 opacity-70")} />
      )}

      <span className="truncate max-w-[150px]">{getDisplayText()}</span>

      {onClear && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "shrink-0 p-0 hover:bg-transparent hover:text-current opacity-60 hover:opacity-100",
            clearButtonSizes[size]
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear();
          }}
          aria-label="Remove discount"
        >
          <X className={clearIconSizes[size]} />
        </Button>
      )}
    </Badge>
  );
}

// Pre-configured variants for convenience
export function PercentageBadge(props: Omit<DiscountBadgeProps, "discountType">) {
  return <DiscountBadge {...props} discountType="percentage" />;
}

export function FixedBadge(props: Omit<DiscountBadgeProps, "discountType">) {
  return <DiscountBadge {...props} discountType="fixed" />;
}

// Compact inline badge for use in price displays
export function InlineDiscountBadge({
  code,
  discountType,
  percentOff,
  amountOff,
  className,
}: {
  code: string;
  discountType: DiscountType;
  percentOff?: number;
  amountOff?: number;
  className?: string;
}) {
  if (discountType === "percentage" && percentOff) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium",
          className
        )}
      >
        <Percent className="h-3 w-3" />
        {percentOff}% off
        <span className="text-muted-foreground">({code})</span>
      </span>
    );
  }

  if (discountType === "fixed" && amountOff) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium",
          className
        )}
      >
        <DollarSign className="h-3 w-3" />
        ${amountOff} off
        <span className="text-muted-foreground">({code})</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium",
        className
      )}
    >
      <Tag className="h-3 w-3" />
      {code}
    </span>
  );
}
