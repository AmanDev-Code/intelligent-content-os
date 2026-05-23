import { useState, useCallback, useMemo } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

export type ValidatedDiscount = {
  valid: boolean;
  code: string;
  name: string;
  discountType: "percentage" | "fixed";
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  message?: string;
};

type UsePromoCodeReturn = {
  code: string;
  setCode: (code: string) => void;
  validatedCode: ValidatedDiscount | null;
  isValidating: boolean;
  error: string | null;
  validate: (code: string) => Promise<ValidatedDiscount | null>;
  clear: () => void;
  getDiscountedPrice: (originalPrice: number) => number;
  getSavingsAmount: (originalPrice: number) => number;
  getSavingsDisplay: (originalPrice: number) => string | null;
  isApplied: boolean;
};

export function usePromoCode(
  planType: "standard" | "pro" | "ultimate",
  billingCycle: "monthly" | "yearly"
): UsePromoCodeReturn {
  const [code, setCodeState] = useState("");
  const [validatedCode, setValidatedCode] = useState<ValidatedDiscount | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCode = useCallback((newCode: string) => {
    setCodeState(newCode.toUpperCase());
    // Clear validation when code changes manually
    if (newCode.trim() === "") {
      setValidatedCode(null);
      setError(null);
    }
  }, []);

  const validate = useCallback(
    async (inputCode: string): Promise<ValidatedDiscount | null> => {
      const trimmedCode = inputCode.trim().toUpperCase();

      if (!trimmedCode) {
        setError("Please enter a promo code");
        return null;
      }

      setIsValidating(true);
      setError(null);

      try {
        const res = await api.subscription.validateDiscount({
          code: trimmedCode,
          planType,
          billingCycle,
        });

        // Check if the response indicates the code is invalid
        if (res.valid === false) {
          setError("Invalid promo code");
          setValidatedCode(null);
          return null;
        }

        const validation: ValidatedDiscount = {
          valid: true,
          code: trimmedCode,
          name: res.name || trimmedCode,
          discountType: res.discountType === "fixed" ? "fixed" : "percentage",
          percentOff: res.percentOff ?? undefined,
          amountOff: res.amountOff ?? undefined,
          currency: res.currency ?? undefined,
        };

        setValidatedCode(validation);
        setError(null);
        toast.success(`Promo code "${validation.name}" applied`);
        return validation;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Invalid promo code";
        setError(msg.slice(0, 200));
        setValidatedCode(null);
        return null;
      } finally {
        setIsValidating(false);
      }
    },
    [planType, billingCycle]
  );

  const clear = useCallback(() => {
    setCodeState("");
    setValidatedCode(null);
    setError(null);
  }, []);

  const getDiscountedPrice = useCallback(
    (originalPrice: number): number => {
      if (!validatedCode?.valid) return originalPrice;

      if (validatedCode.discountType === "percentage" && validatedCode.percentOff) {
        return originalPrice * (1 - validatedCode.percentOff / 100);
      }

      if (validatedCode.discountType === "fixed" && validatedCode.amountOff) {
        return Math.max(0, originalPrice - validatedCode.amountOff);
      }

      return originalPrice;
    },
    [validatedCode]
  );

  const getSavingsAmount = useCallback(
    (originalPrice: number): number => {
      return originalPrice - getDiscountedPrice(originalPrice);
    },
    [getDiscountedPrice]
  );

  const getSavingsDisplay = useCallback(
    (originalPrice: number): string | null => {
      if (!validatedCode?.valid) return null;

      const savings = getSavingsAmount(originalPrice);
      const period = billingCycle === "yearly" ? "year" : "month";

      if (validatedCode.discountType === "percentage" && validatedCode.percentOff) {
        return `${validatedCode.percentOff}% off · saves $${savings.toFixed(2)}/${period}`;
      }

      if (validatedCode.discountType === "fixed" && validatedCode.amountOff) {
        return `$${validatedCode.amountOff} off · saves $${savings.toFixed(2)}/${period}`;
      }

      return null;
    },
    [validatedCode, billingCycle, getSavingsAmount]
  );

  const isApplied = useMemo(
    () => validatedCode?.valid === true && validatedCode.code === code.trim(),
    [validatedCode, code]
  );

  return {
    code,
    setCode,
    validatedCode,
    isValidating,
    error,
    validate,
    clear,
    getDiscountedPrice,
    getSavingsAmount,
    getSavingsDisplay,
    isApplied,
  };
}
