"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  HelpCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  usePricing,
  currencySymbol,
  SUPPORTED_CURRENCIES,
  type InternalPlanType,
  type LivePricePlan,
  type PlanDisplayMeta,
  type SupportedCurrency,
} from "@/lib/marketing/pricing";
import { getPublicPlansCached } from "@/lib/publicPlansCache";
import { formatPlanMoney, resolvePlanCardPrices } from "@/lib/planDisplayFormatting";
import { useActiveLaunchPricing } from "@/hooks/useActiveLaunchPricing";
import type { SubscriptionPlanPayload } from "@/types/publicPlans";

const PLAN_INTENT_KEY = "trndinn_pricing_intent";

function formatAmount(symbol: string, amount: number | null): string {
  if (amount == null) return "\u2014";
  const rounded = Number.isInteger(amount) ? amount : Math.round(amount * 100) / 100;
  return `${symbol}${rounded.toLocaleString()}`;
}

function CurrencyToggle({
  currency,
  onChange,
}: {
  currency: SupportedCurrency;
  onChange: (c: SupportedCurrency) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/50 px-1 py-0.5 backdrop-blur-xl">
      {SUPPORTED_CURRENCIES.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-all",
            currency === c
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={`Show prices in ${c}`}
        >
          {c === "USD" ? "$ USD" : "\u20b9 INR"}
        </button>
      ))}
    </div>
  );
}

function PlanCard({
  meta,
  live,
  annual,
  currency,
  planPayload,
  launchConfig,
}: {
  meta: PlanDisplayMeta;
  live: LivePricePlan | undefined;
  annual: boolean;
  currency: string;
  planPayload: SubscriptionPlanPayload | undefined;
  launchConfig: ReturnType<typeof useActiveLaunchPricing>["config"];
}) {
  const { session } = useAuth();
  const router = useRouter();
  const isFree = meta.planType === "free";
  const featured = meta.featured;

  // Use multi-currency displayPricing when available
  const resolved = planPayload
    ? resolvePlanCardPrices(planPayload, currency, annual, launchConfig)
    : null;
  
  // Fall back to live pricing if no displayPricing
  const symbol = resolved?.symbolFallback ?? currencySymbol(live?.currency ?? currency);
  const monthly = resolved?.pricingReady ? resolved.mainAmount : (live?.monthly ?? null);
  const yearlyTotal = resolved?.yearlyTotal ?? (live?.yearly ?? null);
  const yearly = yearlyTotal != null && yearlyTotal > 0 ? yearlyTotal : null;
  const savingsPct =
    monthly && yearly && monthly > 0
      ? Math.round((1 - yearly / (monthly * 12)) * 100)
      : 0;

  const handleClick = () => {
    if (isFree) {
      router.push(session ? "/dashboard" : "/auth");
      return;
    }
    const billingCycle = annual ? "yearly" : "monthly";
    if (session) {
      router.push("/billing");
      return;
    }
    try {
      sessionStorage.setItem(
        PLAN_INTENT_KEY,
        JSON.stringify({ planType: meta.planType, billingCycle, timestamp: Date.now() }),
      );
    } catch {
      /* ignore */
    }
    const returnTo = `/pricing?plan=${meta.planType}&cycle=${billingCycle}`;
    router.push(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-2xl border bg-gradient-to-b from-card/80 to-card/40 p-6 backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-primary/40",
        featured
          ? "border-primary/45 ring-1 ring-primary/25 glow-ring lg:scale-[1.03]"
          : "border-border/70 hover:shadow-xl hover:shadow-primary/10",
      )}
    >
      {meta.highlight ? (
        <span
          className={cn(
            "absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white",
            featured
              ? "bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f]"
              : "bg-foreground/80",
          )}
        >
          {featured ? <Sparkles className="mr-1 inline h-3 w-3" /> : null}
          {meta.highlight}
        </span>
      ) : null}

      <h3 className="font-display text-xl font-bold">{meta.publicName}</h3>
      <p className="mt-1 min-h-[2.5rem] text-sm text-muted-foreground">{meta.tagline}</p>

      <div className="mt-5 min-h-[5rem]">
        {isFree ? (
          <span className="font-display text-4xl font-black tracking-tight">Free</span>
        ) : (
          <>
            <div className="flex items-end gap-1.5">
              <span className="font-display text-4xl font-black tracking-tight">
                {resolved?.pricingReady
                  ? formatPlanMoney(monthly ?? 0, resolved.currencyCode, symbol)
                  : formatAmount(symbol, annual ? (yearly != null ? yearly / 12 : null) : monthly)}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">/ mo</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {annual
                ? yearly != null
                  ? `${resolved?.pricingReady ? formatPlanMoney(yearly, resolved.currencyCode, symbol) : formatAmount(symbol, yearly)} billed yearly${savingsPct > 0 ? ` \u00b7 save ${savingsPct}%` : ""}`
                  : "Annual price unavailable"
                : "billed monthly"}
            </p>
          </>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5">
        <p className="text-sm font-semibold text-foreground">
          {meta.credits.toLocaleString()} credits{isFree ? "" : " / mo"}
        </p>
        <p className="text-xs text-muted-foreground">{meta.creditsAsOutput}</p>
      </div>

      <ul className="mt-6 flex-1 space-y-2.5 text-sm text-muted-foreground">
        {meta.features.map((f) => (
          <li key={f} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={handleClick}
        className={cn(
          "mt-7 w-full cursor-pointer rounded-full font-semibold",
          featured
            ? "bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] text-white shadow-lg shadow-primary/20"
            : "",
        )}
        variant={featured ? "default" : "outline"}
      >
        {meta.ctaLabel}
      </Button>
    </article>
  );
}

export default function PricingPage({ h1Override }: { h1Override?: string | null }) {
  const { live, meta, loading, currency, setCurrency } = usePricing();
  const [annual, setAnnual] = useState(true);
  const { config: launchConfig } = useActiveLaunchPricing();
  const [planPayloads, setPlanPayloads] = useState<SubscriptionPlanPayload[]>([]);

  // Fetch full plan data with displayPricing for multi-currency support
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const payload = await getPublicPlansCached();
        if (!cancelled && payload.plans) {
          setPlanPayloads(payload.plans);
        }
      } catch {
        /* keep empty - fallback to live pricing */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const liveByType = useMemo(() => {
    const m = new Map<InternalPlanType, LivePricePlan>();
    live?.plans.forEach((p) => m.set(p.planType, p));
    return m;
  }, [live]);

  const planPayloadByType = useMemo(() => {
    const m = new Map<string, SubscriptionPlanPayload>();
    planPayloads.forEach((p) => m.set(p.planType, p));
    return m;
  }, [planPayloads]);

  return (
    <MarketingShell>
      <main className="pb-8">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 sm:px-6 sm:pt-24">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[min(50vw,420px)] w-[min(50vw,420px)] -translate-x-1/2 rounded-full bg-primary/20 blur-[110px]" />
            <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-red-500/10 blur-[90px]" />
          </div>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
              Credit-based pricing
            </span>
            <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-6xl">
              {h1Override ?? (
                <>
                  Simple plans that <span className="text-gradient-brand">scale with you</span>
                </>
              )}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Start free, then pick the plan that matches your output. Prices are pulled live from
              our billing system &mdash; pay monthly or annually, cancel anytime.
            </p>
          </Reveal>

          {/* Billing toggle + Currency selector */}
          <Reveal delay={80} className="mt-9 flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/50 px-4 py-2 backdrop-blur-xl">
              <span className={cn("text-sm", !annual && "font-semibold text-foreground")}>Monthly</span>
              <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Toggle annual billing" />
              <span className={cn("text-sm", annual && "font-semibold text-foreground")}>
                Annual <span className="text-primary">&middot; save more</span>
              </span>
            </div>
            <CurrencyToggle currency={currency} onChange={setCurrency} />
          </Reveal>
          <p className="mt-3 text-center text-xs text-muted-foreground">{meta.annualNote}</p>
        </section>

        {/* Plan grid */}
        <Section className="pt-12 sm:pt-14">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">Loading live pricing&hellip;</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {meta.plans.map((p) => (
                <PlanCard
                  key={p.planType}
                  meta={p}
                  live={liveByType.get(p.planType)}
                  annual={annual}
                  currency={currency}
                  planPayload={planPayloadByType.get(p.planType)}
                  launchConfig={launchConfig}
                />
              ))}
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {meta.trustBadges.map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                {b}
              </span>
            ))}
          </div>
        </Section>

        {/* Comparison */}
        <Section className="pt-4">
          <SectionHeading
            eyebrow="Compare"
            title="What's included in each plan"
            subtitle="Every plan is credit-based &mdash; use credits on any action until your balance runs out."
          />
          <Reveal className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 text-left font-medium text-muted-foreground">Feature</th>
                  {meta.plans.map((p) => (
                    <th key={p.planType} className="px-3 py-3 text-center font-display font-semibold">
                      {p.publicName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/60">
                  <td className="py-3 text-left text-muted-foreground">Monthly credits</td>
                  {meta.plans.map((p) => (
                    <td key={p.planType} className="px-3 py-3 text-center font-semibold">
                      {p.credits.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-3 text-left text-muted-foreground">Approx. output</td>
                  {meta.plans.map((p) => (
                    <td key={p.planType} className="px-3 py-3 text-center text-xs text-muted-foreground">
                      {p.creditsAsOutput}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 text-left text-muted-foreground align-top">Highlights</td>
                  {meta.plans.map((p) => (
                    <td key={p.planType} className="px-3 py-3 align-top">
                      <ul className="space-y-1.5 text-left text-xs text-muted-foreground">
                        {p.features.slice(0, 5).map((f) => (
                          <li key={f} className="flex gap-1.5">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </Reveal>
        </Section>

        {/* FAQ */}
        <Section className="pt-4">
          <SectionHeading eyebrow="FAQ" title="Pricing questions" />
          <Reveal className="mx-auto mt-8 max-w-3xl">
            <Accordion type="single" collapsible>
              {meta.faqs.map((item, i) => (
                <AccordionItem key={item.q} value={`item-${i}`} className="border-border/60">
                  <AccordionTrigger className="text-left font-display hover:no-underline">
                    <span className="inline-flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {item.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>

          <Reveal className="mt-12">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card/60 to-card/40 p-8 text-center sm:p-12">
              <h3 className="font-display text-2xl font-bold sm:text-3xl">Ready to publish with confidence?</h3>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Start free with 150 credits &mdash; no card required. You own your data; we comply with every platform&apos;s policies.
              </p>
              <Button
                asChild
                className="mt-6 cursor-pointer rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white shadow-xl shadow-primary/25"
              >
                <Link href="/auth">Start free</Link>
              </Button>
            </div>
          </Reveal>
        </Section>
      </main>
    </MarketingShell>
  );
}
