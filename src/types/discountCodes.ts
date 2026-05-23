export type DiscountCodeRow = {
  id: string;
  code: string;
  name: string;
  discount_type: "percentage" | "fixed";
  percent_off: number | null;
  amount_off: number | null;
  currency: string;
  plan_types: string[] | null;
  billing_cycles: string[] | null;
  duration: "once" | "forever" | "repeating";
  duration_in_months: number | null;
  polar_discount_id: string | null;
  active: boolean;
  expires_at: string | null;
  max_redemptions: number | null;
  redemption_count: number;
  polar_sync_status: "pending" | "synced" | "error" | "skipped";
  polar_sync_error: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateDiscountCodeBody = {
  code: string;
  name: string;
  discountType: "percentage" | "fixed";
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  planTypes?: string[];
  billingCycles?: string[];
  duration?: "once" | "forever" | "repeating";
  durationInMonths?: number;
  expiresAt?: string;
  maxRedemptions?: number;
};
