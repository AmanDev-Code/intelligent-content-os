export type BillingProviderKind = "polar";

/**
 * Client-side billing provider for checkout and copy (Polar only).
 */
export function getClientBillingProvider(): BillingProviderKind {
  return "polar";
}

/** Prefer server truth from `/public/plans` or `/subscription/billing` when present. */
export function resolveBillingProvider(
  fromApi: BillingProviderKind | undefined | null,
): BillingProviderKind {
  if (fromApi === "polar") return "polar";
  return getClientBillingProvider();
}
