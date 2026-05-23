import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tag,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  Percent,
} from "lucide-react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

export type DiscountValidation = {
  valid: boolean;
  code: string;
  name: string;
  discountType: "percentage" | "fixed";
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  message?: string;
};

type PromoCodeInputProps = {
  onApply: (code: string, validated: DiscountValidation) => void;
  onClear: () => void;
  appliedCode?: string;
  planType: "standard" | "pro" | "ultimate";
  billingCycle: "monthly" | "yearly";
  originalPrice: number;
};

export function PromoCodeInput({
  onApply,
  onClear,
  appliedCode,
  planType,
  billingCycle,
  originalPrice,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatedData, setValidatedData] = useState<DiscountValidation | null>(null);

  const validate = useCallback(
    async (inputCode: string) => {
      if (!inputCode.trim()) {
        setError("Please enter a promo code");
        return null;
      }

      setIsValidating(true);
      setError(null);

      try {
        const res = await api.subscription.validateDiscount({
          code: inputCode.trim(),
          planType,
          billingCycle,
        });

        const validation: DiscountValidation = {
          valid: true,
          code: inputCode.trim(),
          name: res.name || inputCode.trim(),
          discountType: res.discountType === "fixed" ? "fixed" : "percentage",
          percentOff: res.percentOff ?? undefined,
          amountOff: res.amountOff ?? undefined,
          currency: res.currency ?? undefined,
        };

        setValidatedData(validation);
        onApply(inputCode.trim(), validation);
        toast.success(`Promo code "${validation.name}" applied successfully`);
        return validation;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Invalid promo code";
        setError(msg.slice(0, 200));
        setValidatedData(null);
        return null;
      } finally {
        setIsValidating(false);
      }
    },
    [planType, billingCycle, onApply]
  );

  const clear = useCallback(() => {
    setCode("");
    setValidatedData(null);
    setError(null);
    onClear();
  }, [onClear]);

  const getDiscountedPrice = useCallback(
    (price: number): number => {
      if (!validatedData?.valid) return price;

      if (validatedData.discountType === "percentage" && validatedData.percentOff) {
        return price * (1 - validatedData.percentOff / 100);
      }

      if (validatedData.discountType === "fixed" && validatedData.amountOff) {
        return Math.max(0, price - validatedData.amountOff);
      }

      return price;
    },
    [validatedData]
  );

  const getSavingsAmount = useCallback(
    (price: number): number => {
      return price - getDiscountedPrice(price);
    },
    [getDiscountedPrice]
  );

  const getSavingsDisplay = useCallback((): string | null => {
    if (!validatedData?.valid) return null;

    const savings = getSavingsAmount(originalPrice);

    if (validatedData.discountType === "percentage" && validatedData.percentOff) {
      return `${validatedData.percentOff}% off - saves $${savings.toFixed(2)}/${billingCycle === "yearly" ? "year" : "month"}`;
    }

    if (validatedData.discountType === "fixed" && validatedData.amountOff) {
      return `$${validatedData.amountOff} off - saves $${savings.toFixed(2)}/${billingCycle === "yearly" ? "year" : "month"}`;
    }

    return null;
  }, [validatedData, originalPrice, billingCycle, getSavingsAmount]);

  const isApplied = appliedCode && validatedData?.valid;
  const discountedPrice = isApplied ? getDiscountedPrice(originalPrice) : originalPrice;
  const savingsDisplay = getSavingsDisplay();

  return (
    <div className="space-y-3">
      {!isApplied ? (
        // Input Mode
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter promo code (e.g. SAVE20)"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && code.trim() && !isValidating) {
                    void validate(code);
                  }
                }}
                className="pl-10 font-mono uppercase"
                disabled={isValidating}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={!code.trim() || isValidating}
              onClick={() => void validate(code)}
              className="shrink-0"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        // Applied Mode
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {validatedData?.name || appliedCode}
                </p>
                {savingsDisplay && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {savingsDisplay}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
              >
                <Percent className="h-3 w-3 mr-1" />
                Applied
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={clear}
                title="Remove promo code"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Price Display */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Price:</span>
        {isApplied && originalPrice !== discountedPrice ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground line-through">
              ${originalPrice.toFixed(2)}
            </span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              ${discountedPrice.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">
              /{billingCycle === "yearly" ? "year" : "month"}
            </span>
          </div>
        ) : (
          <span className="text-lg font-bold">
            ${originalPrice.toFixed(2)}
            <span className="text-sm font-normal text-muted-foreground">
              /{billingCycle === "yearly" ? "year" : "month"}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
