"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/apiClient";

export type InternalPlanType = "free" | "standard" | "pro" | "ultimate";

export interface LivePricePlan {
  planType: InternalPlanType;
  monthly: number | null;
  yearly: number | null;
  currency: string;
  source: "polar" | "fallback";
}

export interface LivePricing {
  source: "polar" | "fallback" | "mixed";
  currency: string;
  fetchedAt: string;
  plans: LivePricePlan[];
}

export interface PlanDisplayMeta {
  planType: InternalPlanType;
  publicName: string;
  tagline: string;
  credits: number;
  creditsAsOutput: string;
  highlight: string;
  featured: boolean;
  features: string[];
  ctaLabel: string;
}

export interface PricingMeta {
  plans: PlanDisplayMeta[];
  faqs: { q: string; a: string }[];
  trustBadges: string[];
  annualNote: string;
}

/** Compliance-safe fallback so the page renders if the API is briefly down. */
export const FALLBACK_PRICING_META: PricingMeta = {
  trustBadges: ["Cancel anytime", "Secure checkout via Polar", "You own your data", "GDPR \u00b7 CCPA \u00b7 DPDP aligned"],
  annualNote: "Save with annual billing \u2014 discount applied automatically at checkout.",
  faqs: [
    { q: "How do credits work?", a: "Credits power actions like generating, scheduling, and publishing. Each plan includes a monthly allotment; you can use credits on any action until your balance runs out." },
    { q: "Do credits roll over?", a: "Plan credits reset each billing period. Trial credits expire 14 days after signup. Bonus/reward credits never expire." },
    { q: "Where does Trndinn\u2019s AI get its \u201cvoice\u201d?", a: "Your Brand Voice is built only from the examples you provide. We never scrape your social feeds or train on connected-platform data." },
    { q: "Can I change or cancel my plan?", a: "Yes \u2014 upgrade, downgrade, or cancel anytime. Cancellation stops future renewals and you keep access until the end of the period." },
    { q: "Which platforms are supported?", a: "LinkedIn is live today, with more channels on the roadmap. You publish only to accounts you connect, and we comply with each platform\u2019s policies." },
  ],
  plans: [
    { planType: "free", publicName: "Free", tagline: "Start creating with AI \u2014 no card required.", credits: 150, creditsAsOutput: "~25 AI posts to try the workflow", highlight: "", featured: false, ctaLabel: "Start free", features: ["150 credits to start (14-day trial credits)", "Connect 1 LinkedIn account", "AI drafts from the examples you provide", "Schedule & publish to your connected account", "Calendar with drag-and-drop", "Brand Voice from your examples", "Basic analytics"] },
    { planType: "standard", publicName: "Creator", tagline: "For solo creators publishing consistently.", credits: 500, creditsAsOutput: "~80 AI posts or ~60 image posts / month", highlight: "", featured: false, ctaLabel: "Choose Creator", features: ["500 credits / month", "Connect 1 LinkedIn account", "Brand Voice from your examples", "AI images & carousels", "Recurring schedules", "Publish history & logs", "Priority email support", "Content templates library"] },
    { planType: "pro", publicName: "Team", tagline: "For teams that ship content as a system.", credits: 2000, creditsAsOutput: "~320 AI posts or ~130 carousels / month", highlight: "Most popular", featured: true, ctaLabel: "Choose Team", features: ["2,000 credits / month", "Everything in Creator", "Up to 5 team members", "Connect up to 30 channels", "Priority AI generation", "Public API v1 + webhooks", "Advanced analytics & reporting", "Priority support", "Custom content workflows"] },
    { planType: "ultimate", publicName: "Agency", tagline: "For agencies managing many brands at scale.", credits: 10000, creditsAsOutput: "~1,600 AI posts / month for multiple brands", highlight: "Best value", featured: false, ctaLabel: "Choose Agency", features: ["10,000 credits / month", "Everything in Team", "Up to 25 team members", "Connect up to 100 channels", "Highest rate limits", "Multi-brand workflows", "Dedicated onboarding", "SLA & priority support", "Custom integrations", "White-label options (roadmap)"] },
  ],
};

export const SUPPORTED_CURRENCIES = ["USD", "INR"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", INR: "\u20b9", EUR: "\u20ac", GBP: "\u00a3" };
export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code?.toUpperCase()] ?? `${code} `;
}

// --- Browser-side pricing cache with TTL (stale-while-revalidate pattern) ---
const PRICING_CACHE_KEY = "trndinn_pricing_cache";
const PRICING_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface PricingCacheEntry {
  live: LivePricing | null;
  meta: PricingMeta | null;
  cachedAt: number;
}

function readPricingCache(): PricingCacheEntry | null {
  try {
    const raw = sessionStorage.getItem(PRICING_CACHE_KEY);
    if (!raw) return null;
    const entry: PricingCacheEntry = JSON.parse(raw);
    if (!entry.cachedAt) return null;
    return entry;
  } catch {
    return null;
  }
}

function writePricingCache(live: LivePricing | null, meta: PricingMeta | null) {
  try {
    const entry: PricingCacheEntry = { live, meta, cachedAt: Date.now() };
    sessionStorage.setItem(PRICING_CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* quota exceeded - ignore */
  }
}

function isCacheStale(entry: PricingCacheEntry): boolean {
  return Date.now() - entry.cachedAt > PRICING_CACHE_TTL_MS;
}

// --- Currency preference persistence ---
const CURRENCY_PREF_KEY = "trndinn_display_currency";

export function getStoredCurrency(): SupportedCurrency {
  if (typeof window === "undefined") return "USD";
  try {
    const stored = localStorage.getItem(CURRENCY_PREF_KEY)?.toUpperCase();
    if (stored && (SUPPORTED_CURRENCIES as readonly string[]).includes(stored)) {
      return stored as SupportedCurrency;
    }
  } catch { /* ignore */ }
  // Detect locale-based default
  try {
    const locale = navigator.language;
    if (locale?.startsWith("en-IN") || locale?.startsWith("hi")) return "INR";
  } catch { /* ignore */ }
  return "USD";
}

export function setStoredCurrency(currency: SupportedCurrency) {
  try {
    localStorage.setItem(CURRENCY_PREF_KEY, currency);
  } catch { /* ignore */ }
}

export function usePricing(): {
  live: LivePricing | null;
  meta: PricingMeta;
  loading: boolean;
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
} {
  const [live, setLive] = useState<LivePricing | null>(() => {
    const cached = readPricingCache();
    return cached?.live ?? null;
  });
  const [meta, setMeta] = useState<PricingMeta>(() => {
    const cached = readPricingCache();
    return cached?.meta ?? FALLBACK_PRICING_META;
  });
  const [loading, setLoading] = useState(() => {
    // If cache exists, start not-loading (show cached data immediately)
    const cached = readPricingCache();
    return !cached || !cached.live;
  });
  const [currency, setCurrencyState] = useState<SupportedCurrency>(getStoredCurrency);

  const setCurrency = useCallback((c: SupportedCurrency) => {
    setCurrencyState(c);
    setStoredCurrency(c);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cached = readPricingCache();

    // If we have fresh cache, skip the network entirely
    if (cached?.live && !isCacheStale(cached)) {
      setLive(cached.live);
      if (cached.meta?.plans?.length) setMeta(cached.meta);
      setLoading(false);
      return;
    }

    // Stale cache: show cached data immediately, revalidate in background
    if (cached?.live) {
      setLive(cached.live);
      if (cached.meta?.plans?.length) setMeta(cached.meta);
      setLoading(false);
    }

    (async () => {
      try {
        const [livRes, metaRes] = await Promise.all([
          apiClient.get("/public/pricing-live") as Promise<LivePricing>,
          apiClient.get("/public/pricing-meta") as Promise<PricingMeta>,
        ]);
        if (cancelled) return;
        if (livRes?.plans) {
          setLive(livRes);
          writePricingCache(livRes, metaRes?.plans?.length ? metaRes : null);
        }
        if (metaRes?.plans?.length) setMeta(metaRes);
      } catch {
        /* keep fallbacks / cache */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { live, meta, loading, currency, setCurrency };
}
