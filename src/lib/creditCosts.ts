import { useEffect, useState } from "react";
import { api, type CreditCostMatrix } from "@/lib/apiClient";

/**
 * Sprint 1.9b — frontend credit-cost helpers.
 *
 * The AUTHORITATIVE cost matrix lives on the backend (`credit-costs.ts`,
 * exposed via `GET /credits/costs`). This module fetches it once (module-level
 * cache shared across all components) and provides helpers that compute the
 * same numbers the backend charges. `DEFAULT_CREDIT_COSTS` below is ONLY a
 * first-paint / offline safety net mirror — it is never the source of truth.
 *
 * IMPORTANT distinction (mirrors backend):
 *  - Post Now & Schedule image/carousel costs are FLAT (do NOT scale by count).
 *  - Generate / Regenerate costs SCALE per image / per slide.
 */

export type CreditContentType = "text" | "image" | "carousel";

/** Safety-net fallback mirror of the backend matrix (NOT the source of truth). */
export const DEFAULT_CREDIT_COSTS: CreditCostMatrix = {
  postNow: { text: 2.5, image: 6, carousel: 12 },
  schedule: { text: 4, image: 7.5, carousel: 15 },
  reschedule: 0,
  pdfAddOn: 12,
  generate: { textBase: 2, imagePerUnit: 3, slidePerUnit: 2.5 },
  regenerate: { singleImage: 3, imagePerUnit: 3, slidePerUnit: 2.5 },
  legacyGenerate: 1.5,
  aiTextFormatting: 0.5,
};

export function postNowCost(
  m: CreditCostMatrix,
  contentType: CreditContentType,
  opts?: { pdf?: boolean },
): number {
  const base = m.postNow[contentType] ?? m.postNow.text;
  return base + (opts?.pdf ? m.pdfAddOn : 0);
}

export function scheduleCost(
  m: CreditCostMatrix,
  contentType: CreditContentType,
  opts?: { pdf?: boolean },
): number {
  const base = m.schedule[contentType] ?? m.schedule.text;
  return base + (opts?.pdf ? m.pdfAddOn : 0);
}

export function generateCost(
  m: CreditCostMatrix,
  contentType: CreditContentType,
  imageCount = 1,
  slideCount = 2,
): number {
  const base = m.generate.textBase;
  if (contentType === "image") {
    return base + m.generate.imagePerUnit * Math.max(0, imageCount);
  }
  if (contentType === "carousel") {
    return base + m.generate.slidePerUnit * Math.max(0, slideCount);
  }
  return base;
}

export function regenerateSingleImageCost(m: CreditCostMatrix): number {
  return m.regenerate.singleImage;
}

export function regenerateAllImagesCost(
  m: CreditCostMatrix,
  imageCount: number,
): number {
  return m.regenerate.imagePerUnit * Math.max(0, imageCount);
}

export function regenerateCarouselCost(
  m: CreditCostMatrix,
  slideCount: number,
): number {
  return m.regenerate.slidePerUnit * Math.max(0, slideCount);
}

// Module-level shared fetch so the matrix is loaded once per session.
let cachedMatrix: CreditCostMatrix | null = null;
let inflight: Promise<CreditCostMatrix> | null = null;

async function loadCreditCostMatrix(): Promise<CreditCostMatrix> {
  if (cachedMatrix) return cachedMatrix;
  if (!inflight) {
    inflight = api.credits
      .costs()
      .then((res) => {
        cachedMatrix = res.costs;
        return cachedMatrix;
      })
      .catch((err) => {
        // Never block the UI — fall back to the mirror.
        console.error("creditCosts: failed to load /credits/costs", err);
        return DEFAULT_CREDIT_COSTS;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * React hook that returns the live credit-cost matrix (defaults until loaded).
 * All components share the same cached fetch.
 */
export function useCreditCosts(): CreditCostMatrix {
  const [matrix, setMatrix] = useState<CreditCostMatrix>(
    cachedMatrix ?? DEFAULT_CREDIT_COSTS,
  );

  useEffect(() => {
    let cancelled = false;
    void loadCreditCostMatrix().then((m) => {
      if (!cancelled) setMatrix(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return matrix;
}
