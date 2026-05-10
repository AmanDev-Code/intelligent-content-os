export type PlanDisplayTier = {
  symbol: string;
  listMonthly: number;
  listYearly: number;
  offerMonthly: number | null;
  offerYearly: number | null;
};

export type PlanDisplayPricingMap = Record<string, PlanDisplayTier>;

export type SubscriptionPlanPayload = {
  id: string;
  planType: string;
  name: string;
  description: string;
  creditsLimit: number;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  displayPricing?: PlanDisplayPricingMap | null;
};

export type PricingDisplaySettings = {
  defaultCurrency: string;
  supportedCurrencies: string[];
};

export type PublicPlansPayload = {
  plans: SubscriptionPlanPayload[];
  pricingDisplay: PricingDisplaySettings;
};

/** Body for `PUT /admin/subscription-plans/:planType` (optional fields per Nest DTO). */
export type AdminUpdateSubscriptionPlanBody = {
  name?: string;
  description?: string;
  creditsLimit?: number;
  priceMonthly?: number;
  priceYearly?: number;
  features?: string[];
  sortOrder?: number;
  isActive?: boolean;
  displayPricing?: PlanDisplayPricingMap | null;
};

/** Response from `PUT /admin/subscription-plans/:planType`. */
export type AdminUpdateSubscriptionPlanResponse = {
  ok: true;
  paddleCatalogUpdated?: boolean;
};

export type PaddleCatalogLiveSlot = {
  planType: "standard" | "pro" | "ultimate";
  billingCycle: "monthly" | "yearly";
  priceId: string;
  amountMajor: number | null;
  currencyCode: string | null;
  httpStatus?: number;
  error?: string;
};

export type PaddleCatalogLivePayload = {
  fetchedAt: string;
  apiKeyConfigured: boolean;
  items: PaddleCatalogLiveSlot[];
};

export type ImportFromPaddleCatalogResponse = {
  ok: true;
  updatedPlanTypes: Array<"standard" | "pro" | "ultimate">;
  warnings: string[];
};
