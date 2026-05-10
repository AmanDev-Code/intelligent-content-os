import { api, clearClientGetCache } from "@/lib/apiClient";
import type { PublicPlansPayload } from "@/types/publicPlans";
import { normalizePublicPlansResponse } from "@/lib/normalizePublicPlans";

let memoryCache: PublicPlansPayload | null = null;
let inflight: Promise<PublicPlansPayload> | null = null;

export function invalidatePublicPlansCache() {
  memoryCache = null;
  clearClientGetCache("/public/plans");
}

export async function getPublicPlansCached(): Promise<PublicPlansPayload> {
  if (memoryCache) return memoryCache;
  if (!inflight) {
    inflight = api.subscription
      .plans()
      .then((raw) => normalizePublicPlansResponse(raw))
      .then((d) => {
        memoryCache = d;
        return d;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}
