import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Check,
  CheckCircle2,
  Calendar,
  Download,
  Crown,
  Sparkles,
  BarChart3,
  Loader2,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuota } from "@/contexts/QuotaContext";
import { toast } from "sonner";
import { api, clearClientGetCache, ApiError } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/error-handler";
import { openPolarPortal, openPolarSwitchPlan } from "@/lib/polar";
import {
  clearPolarPlanIntent,
  consumePolarReturnKind,
  readPolarPlanIntent,
} from "@/lib/polarPlanIntent";
import { invalidatePublicPlansCache } from "@/lib/publicPlansCache";
import {
  getClientBillingProvider,
  resolveBillingProvider,
} from "@/lib/billingProvider";
import { normalizePublicPlansResponse } from "@/lib/normalizePublicPlans";
import type { BillingProviderKind, SubscriptionPlanPayload } from "@/types/publicPlans";
import { formatPlanMoney, resolvePlanCardPrices } from "@/lib/planDisplayFormatting";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  SUPPORTED_CURRENCIES,
  getPlanDisplayMetaFromPricing,
  getPlanPublicName,
  usePricing,
  type SupportedCurrency,
} from "@/lib/marketing/pricing";
import { fireConfettiSnip } from "@/registry/magicui/confetti";
import { PromoCodeInput, type DiscountValidation } from "@/components/billing/PromoCodeInput";
import { DiscountBadge } from "@/components/billing/DiscountBadge";
import {
  clearLaunchPricingClientCache,
  useActiveLaunchPricing,
} from "@/hooks/useActiveLaunchPricing";
import { OfferBanner } from "@/components/pricing/OfferBanner";

type BillingPlanCard = {
  id: string;
  name: string;
  price: { monthly: number; yearly: number };
  tagline: string;
  description: string;
  features: string[];
  popular: boolean;
  current: boolean;
  credits: number;
  creditsAsOutput: string;
  /** When present, enables multi-currency strike/offer display */
  raw?: SubscriptionPlanPayload;
};

const DISPLAY_CURRENCY_LS = "trndinn_display_currency";
const BILLING_CYCLE_UPGRADE_KEY = "__billing_cycle__";
const PORTAL_LOADING_KEY = "__portal__";

// Currency toggle component matching the pricing page design
function CurrencyToggle({
  currency,
  onChange,
}: {
  currency: SupportedCurrency;
  onChange: (c: SupportedCurrency) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/30 dark:bg-white/[0.04] px-1 py-0.5 backdrop-blur-xl">
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
          {c === "USD" ? "$ USD" : "₹ INR"}
        </button>
      ))}
    </div>
  );
}

type BillingApiResponse = {
  subscription: {
    planType: string;
    billingCycle: "monthly" | "yearly";
    priceMonthly: number;
    priceYearly?: number;
    creditsLimit: number;
    polarSubscriptionId?: string;
    stripeSubscriptionId?: string;
  };
  usage: {
    currentPeriodUsage: number;
    remainingCredits?: number;
    percentageUsed?: number;
    resetDate?: string;
  };
  billing?: {
    nextBillingDate?: string | null;
    amount?: number;
    paymentMethod?: string;
    history?: Array<{
      id: string;
      date: string;
      description?: string;
      amount: string;
      status: string;
      invoice?: string;
    }>;
  };
  billingProvider?: BillingProviderKind;
};

export default function Billing() {
  const { user } = useAuth();
  const { quota: userQuota, refreshQuota } = useQuota();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<BillingPlanCard[]>([]);
  const [billingCurrency, setBillingCurrency] = useState<SupportedCurrency>("USD");
  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>(["USD", "INR"]);
  const [usageData, setUsageData] = useState({
    posts: { used: 0, limit: 0 },
    aiCredits: { used: 0, limit: 0 },
    channels: { used: 0, limit: 5 },
  });
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<BillingApiResponse | null>(null);
  const [activeBillingProvider, setActiveBillingProvider] = useState<BillingProviderKind>(() =>
    getClientBillingProvider(),
  );
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBillingTimelineModal, setShowBillingTimelineModal] = useState(false);
  const [isSyncingCheckout, setIsSyncingCheckout] = useState(false);
  const hasLoadedPlansRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const hasHandledCheckoutRef = useRef(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoValidated, setPromoValidated] = useState<DiscountValidation | null>(null);
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const { config: activeLaunchConfig, refetch: refetchLaunchPricing } =
    useActiveLaunchPricing();
  const { meta: pricingMeta } = usePricing();

  const polarSubscriptionId =
    currentSubscription?.subscription?.polarSubscriptionId ||
    currentSubscription?.subscription?.stripeSubscriptionId;
  const currentPlanType = currentSubscription?.subscription?.planType;
  const hasActivePolarSubscription =
    Boolean(polarSubscriptionId) ||
    (typeof currentPlanType === "string" && currentPlanType !== "free");

  useEffect(() => {
    if (!user?.id) return;
    // Prevent duplicate initial fetches in dev StrictMode.
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    fetchBillingData();
  }, [user?.id]);

  const invalidateBillingCaches = () => {
    clearLaunchPricingClientCache();
    clearClientGetCache("/subscription/billing");
    clearClientGetCache("/subscription");
    clearClientGetCache("/subscription/usage");
    clearClientGetCache("/quota");
    clearClientGetCache("/public/launch-pricing/active");
    invalidatePublicPlansCache();
    hasLoadedPlansRef.current = false;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get("code")?.trim();
    if (urlCode) {
      setPromoCode(urlCode.toUpperCase());
      params.delete("code");
      const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", next);
    }

    const polarParam = params.get("polar");
    const polarCheckoutSuccess = polarParam === "success";
    const polarPortalReturn = polarParam === "portal_return";
    const returnKind = consumePolarReturnKind();
    const portalPlanIntent = readPolarPlanIntent();

    if ((polarCheckoutSuccess || polarPortalReturn) && !hasHandledCheckoutRef.current) {
      hasHandledCheckoutRef.current = true;
      invalidateBillingCaches();
      void refetchLaunchPricing();

      const isPortalReturn =
        polarPortalReturn ||
        returnKind === "portal" ||
        (polarCheckoutSuccess && Boolean(portalPlanIntent));

      if (isPortalReturn) {
        void syncAfterPortalReturn();
      } else {
        setCheckoutSuccess(true);
        setShowSuccessModal(true);
        toast.success("Payment completed. Syncing subscription...");
        void syncAfterCheckout();
      }

      params.delete("polar");
      const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", next);
    }
  }, []);

  useEffect(() => {
    if (showSuccessModal) {
      fireConfettiSnip();
    }
  }, [showSuccessModal]);

  // Sync AI credit usage from quota for ongoing usage updates, but do not
  // override the post-checkout subscription sync window.
  useEffect(() => {
    if (userQuota && !isSyncingCheckout) {
      setUsageData(prev => ({
        ...prev,
        aiCredits: { used: userQuota.usedCredits, limit: userQuota.totalCredits },
      }));
    }
  }, [userQuota?.usedCredits, userQuota?.totalCredits, isSyncingCheckout]);

  useEffect(() => {
    const onSubscriptionUpdated = () => {
      // Only refetch quota and launch pricing here
      // Billing was already updated by the polling that triggered this event
      void Promise.all([
        refreshQuota(true),
        refetchLaunchPricing(),
      ]);
    };
    window.addEventListener("trndinn:subscription-updated", onSubscriptionUpdated);
    return () => {
      window.removeEventListener("trndinn:subscription-updated", onSubscriptionUpdated);
    };
  }, [user?.id]);

  const fetchPlansOnce = async () => {
    if (hasLoadedPlansRef.current) return;
    try {
      const raw = await api.subscription.plans();
      const { plans: planRows, pricingDisplay, billingProvider } = normalizePublicPlansResponse(raw);
      setActiveBillingProvider(resolveBillingProvider(billingProvider));
      setSupportedCurrencies(pricingDisplay.supportedCurrencies);
      let cur = pricingDisplay.defaultCurrency.toUpperCase();
      if (typeof window !== "undefined") {
        const ls = window.localStorage.getItem(DISPLAY_CURRENCY_LS);
        if (ls && pricingDisplay.supportedCurrencies.map((c) => c.toUpperCase()).includes(ls.toUpperCase())) {
          cur = ls.toUpperCase();
        }
      }
      setBillingCurrency(cur as SupportedCurrency);

      const visiblePlansData = planRows.filter((plan) => plan.planType !== "free");
      const formattedPlans: BillingPlanCard[] = visiblePlansData.map((plan) => {
        const displayMeta = getPlanDisplayMetaFromPricing(plan.planType, pricingMeta);
        return {
          id: plan.planType,
          name: getPlanPublicName(plan.planType, pricingMeta),
          price: { monthly: plan.priceMonthly, yearly: plan.priceYearly },
          tagline: displayMeta?.tagline ?? plan.description,
          description: plan.description,
          features: displayMeta?.features ?? plan.features,
          popular: displayMeta?.featured ?? plan.planType === "pro",
          current: false,
          credits: displayMeta?.credits ?? plan.creditsLimit,
          creditsAsOutput: displayMeta?.creditsAsOutput ?? `${plan.creditsLimit} credits / month`,
          raw: plan,
        };
      });
      setPlans(formattedPlans);
      hasLoadedPlansRef.current = true;
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Could not load plan prices. Please refresh.");
      hasLoadedPlansRef.current = true;
    }
  };

  const fetchBillingOnly = async (force = false) => {
    if (force) {
      clearClientGetCache("/subscription/billing");
    }
    try {
      const subscriptionData = (await api.subscription.billing()) as BillingApiResponse;
      setCurrentSubscription(subscriptionData);

      if (subscriptionData.billingProvider === "polar") {
        setActiveBillingProvider(subscriptionData.billingProvider);
      }

      setPlans(prev => prev.map(plan => ({
        ...plan,
        current: plan.id === subscriptionData.subscription.planType
      })));

      setUsageData({
        posts: { used: 0, limit: 0 },
        aiCredits: {
          used: subscriptionData.usage.currentPeriodUsage,
          limit: subscriptionData.subscription.creditsLimit
        },
        channels: { used: 0, limit: 5 },
      });
      return subscriptionData;
    } catch (error) {
      console.error('Error fetching billing info:', error);
      setCurrentSubscription(null);
      setPlans(prev => prev.map(plan => ({ ...plan, current: false })));
      return null;
    }
  };

  const pollBillingUntil = async (
    isDone: (billing: BillingApiResponse | null) => boolean,
    options?: { maxAttempts?: number; intervalMs?: number },
  ): Promise<BillingApiResponse | null> => {
    const maxAttempts = options?.maxAttempts ?? 6;
    const intervalMs = options?.intervalMs ?? 1200;
    let latest: BillingApiResponse | null = null;
    for (let i = 0; i < maxAttempts; i++) {
      latest = await fetchBillingOnly(true);
      if (isDone(latest)) break;
      if (i < maxAttempts - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
      }
    }
    return latest;
  };

  const finalizeSubscriptionSync = async (billing?: BillingApiResponse | null) => {
    // Only invalidate caches once, after successful sync
    invalidateBillingCaches();
    // fetchBillingOnly was already called during polling, pass through if successful
    // Only refresh quota once - the key additional call we need
    await refreshQuota(true);
    await refetchLaunchPricing();
    window.dispatchEvent(new CustomEvent("trndinn:subscription-updated"));
  };

  const syncAfterCheckout = async () => {
    setIsSyncingCheckout(true);
    try {
      const billing = await pollBillingUntil((billing) => {
        const planType = billing?.subscription?.planType;
        return typeof planType === "string" && planType !== "free";
      });
      await finalizeSubscriptionSync(billing);
    } finally {
      setIsSyncingCheckout(false);
    }
  };

  const syncAfterPortalReturn = async () => {
    setIsSyncingCheckout(true);
    const intent = readPolarPlanIntent();

    try {
      // CRITICAL FIX: Do NOT call syncFromPolar here immediately after in-app plan change
      // The backend's changePlanForExistingSubscription already updated the DB directly
      // and the API returns the new plan immediately.
      // Calling syncFromPolar creates a race condition where Polar might return stale data
      // and overwrite the just-updated DB record.
      //
      // We only call syncFromPolar when using the Polar portal (handleChangePlan flow),
      // not for in-app changes via handleSwitchPlan.
      //
      // For now, we skip the syncFromPolar call entirely and rely on polling to verify
      // the DB state reflects what we expect.

      // Poll until the returned plan matches our intent
      // The backend already updated the DB, so polling should quickly reflect the change
      const billing = await pollBillingUntil(
        (row) => {
          const sub = row?.subscription;
          if (!sub) return false;
          if (intent) {
            return (
              sub.planType === intent.planType &&
              sub.billingCycle === intent.billingCycle
            );
          }
          // No intent, just wait for any active subscription
          return sub.planType !== 'free';
        },
        { maxAttempts: 6, intervalMs: 1200 },
      );

      await finalizeSubscriptionSync(billing);

      const synced = billing?.subscription;
      const planMatched =
        intent && synced
          ? synced.planType === intent.planType &&
            synced.billingCycle === intent.billingCycle
          : Boolean(synced && synced.planType !== 'free');

      if (planMatched) {
        toast.success("Plan changed successfully");
      } else {
        toast.message(
          "Plan update is still processing. Your dashboard will refresh when Polar confirms the change.",
        );
      }
    } finally {
      clearPolarPlanIntent();
      setIsSyncingCheckout(false);
    }
  };

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      await fetchPlansOnce();
      await fetchBillingOnly();
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const validatePromoForSelection = async (
    planType_: "standard" | "pro" | "ultimate",
  ) => {
    const code = promoCode.trim();
    if (!code) {
      setPromoValidated(null);
      return true;
    }
    try {
      const res = await api.subscription.validateDiscount({
        code,
        planType: planType_,
        billingCycle,
      });
      const validation: DiscountValidation = {
        valid: true,
        code,
        name: res.name || code,
        discountType: res.discountType === "fixed" ? "fixed" : "percentage",
        percentOff: res.percentOff ?? undefined,
        amountOff: res.amountOff ?? undefined,
        currency: res.currency ?? undefined,
      };
      setPromoValidated(validation);
      return true;
    } catch (e) {
      setPromoValidated(null);
      const msg = e instanceof Error ? e.message : "Invalid promo code";
      toast.error(msg.slice(0, 200));
      return false;
    }
  };

  const handleChangePlan = async () => {
    if (!user?.id) {
      toast.error("You must be signed in to manage your subscription.");
      return;
    }

    if (!hasActivePolarSubscription) {
      document.getElementById("billing-plan-cards")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    setPortalLoading(true);
    try {
      await openPolarPortal();
      window.setTimeout(() => setPortalLoading(false), 150);
    } catch (error) {
      console.error("Error opening Polar portal:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to open billing portal",
      );
      setPortalLoading(false);
    }
  };

  const handleSwitchPlan = async (planId: string, cycle?: "monthly" | "yearly") => {
    if (!user?.id) {
      toast.error("You must be signed in to change your plan.");
      return;
    }

    const planType = planId as "standard" | "pro" | "ultimate";
    const targetCycle = cycle ?? billingCycle;
    const loadingKey = cycle ? BILLING_CYCLE_UPGRADE_KEY : planId;

    const ok = await validatePromoForSelection(planType);
    if (!ok) return;

    setUpgradingPlanId(loadingKey);
    try {
      const result = await openPolarSwitchPlan(planType, targetCycle, {
        discountCode: promoCode.trim() || undefined,
        hasActiveSubscription: hasActivePolarSubscription,
      });
      if (result.mode === "in_app") {
        toast.info("Updating your plan…");
        await syncAfterPortalReturn();
        setUpgradingPlanId(null);
        return;
      }
      window.setTimeout(() => setUpgradingPlanId(null), 150);
    } catch (error) {
      console.error("Error opening Polar plan change:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to open checkout",
      );
      setUpgradingPlanId(null);
    }
  };

  const handleBillingCycleChange = async () => {
    if (!user?.id || !currentSubscription) {
      toast.error("User not authenticated or subscription not loaded");
      return;
    }

    const planType = currentSubscription.subscription.planType;
    if (planType === "free") {
      toast.error("Subscribe to a paid plan before changing billing cycle.");
      return;
    }

    try {
      await handleSwitchPlan(planType, billingCycle);
    } catch (error) {
      console.error("Error updating billing cycle:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to update billing: ${errorMessage}`);
      setBillingCycle(currentSubscription.subscription.billingCycle || "monthly");
    }
  };

  const displayPlans = useMemo(
    () =>
      plans.map((plan) => {
        const displayMeta = getPlanDisplayMetaFromPricing(plan.id, pricingMeta);
        return {
          ...plan,
          name: getPlanPublicName(plan.id, pricingMeta),
          tagline: displayMeta?.tagline ?? plan.tagline,
          features: displayMeta?.features ?? plan.features,
          popular: displayMeta?.featured ?? plan.popular,
          credits: displayMeta?.credits ?? plan.credits,
          creditsAsOutput: displayMeta?.creditsAsOutput ?? plan.creditsAsOutput,
        };
      }),
    [plans, pricingMeta],
  );

  const currentPlan = displayPlans.find((plan) => plan.current);
  const billingHistory = currentSubscription?.billing?.history || [];
  const latestBill = billingHistory[0];
  const processorLabel = "Polar";
  const sub = currentSubscription?.subscription;
  const currentPlanMeta = getPlanDisplayMetaFromPricing(sub?.planType ?? "free", pricingMeta);
  const bill = currentSubscription?.billing;
  const renewalLabel =
    bill?.nextBillingDate != null && bill.nextBillingDate !== ""
      ? new Date(bill.nextBillingDate).toLocaleDateString()
      : "—";

  const currentPlanPriceDisplay = useMemo(() => {
    if (!sub || sub.planType === "free") {
      return { main: "Free", period: "", yearlyNote: null as string | null };
    }
    const payload: SubscriptionPlanPayload =
      currentPlan?.raw ??
      ({
        id: sub.planType,
        planType: sub.planType,
        name: currentPlan?.name ?? sub.planType,
        description: currentPlan?.description ?? "",
        creditsLimit: sub.creditsLimit,
        priceMonthly: sub.priceMonthly,
        priceYearly: sub.priceYearly ?? 0,
        features: currentPlan?.features ?? [],
        isActive: true,
        sortOrder: 0,
        displayPricing: null,
      } satisfies SubscriptionPlanPayload);
    const resolved = resolvePlanCardPrices(
      payload,
      billingCurrency,
      sub.billingCycle === "yearly",
      activeLaunchConfig,
    );
    const mainStr = resolved.pricingReady
      ? formatPlanMoney(resolved.mainAmount, resolved.currencyCode, resolved.symbolFallback)
      : "—";
    const yearlyNote =
      sub.billingCycle === "yearly" && resolved.yearlyTotal != null && resolved.yearlyTotal > 0
        ? `${formatPlanMoney(resolved.yearlyTotal, resolved.currencyCode, resolved.symbolFallback)} billed yearly`
        : null;
    return {
      main: mainStr,
      period: "month",
      yearlyNote,
    };
  }, [sub, currentPlan, billingCurrency, activeLaunchConfig]);
  const openInvoice = async (transactionId: string) => {
    try {
      const result = await api.subscription.invoiceUrl(transactionId);
      if (result?.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
        return;
      }
      toast.error("Invoice link not available yet");
    } catch {
      toast.error("No downloadable invoice for this event yet.");
    }
  };

  return (
    <div className="flex-1 space-y-4 sm:space-y-6">
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment successful</DialogTitle>
            <DialogDescription>
              Your purchase is confirmed. We are syncing your subscription, invoices, and payment details from {processorLabel}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccessModal(false)}>Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showBillingTimelineModal} onOpenChange={setShowBillingTimelineModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Billing Timeline</DialogTitle>
            <DialogDescription>
              Complete history of your invoices and billing events.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
            {billingHistory.map((row: { id: string; date: string; description?: string; amount: string; status: string; invoice?: string }) => (
              <div key={row.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
                <div className="p-1.5 bg-primary/10 rounded-lg shrink-0 hidden sm:flex">
                  <CreditCard className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-xs sm:text-sm truncate">{row.description || "Subscription Charge"}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {new Date(row.date).toLocaleDateString()} {row.invoice ? `• ${row.invoice}` : ""}
                  </p>
                </div>
                <span className="font-medium text-xs sm:text-sm shrink-0">{row.amount}</span>
                <Badge variant={row.status === "paid" || row.status === "completed" ? "default" : "secondary"} className="text-[10px] shrink-0">
                  {row.status}
                </Badge>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => openInvoice(row.id)}
                  title="Download invoice"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-sm text-muted-foreground">Manage your subscription and billing information</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CurrencyToggle
            currency={billingCurrency}
            onChange={(v) => {
              setBillingCurrency(v);
              if (typeof window !== "undefined") {
                window.localStorage.setItem(DISPLAY_CURRENCY_LS, v);
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={!latestBill?.id}
            onClick={() => {
              if (latestBill?.id) {
                openInvoice(latestBill.id);
              }
            }}
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Download Invoice</span>
          </Button>
        </div>
      </div>

      {activeLaunchConfig && (
        <OfferBanner config={activeLaunchConfig} />
      )}

      {checkoutSuccess && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="font-medium">Payment completed.</span>
              <span className="text-muted-foreground">
                Your subscription is syncing from {processorLabel} webhook events.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan + Usage - side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Card className="border-border/70 bg-card shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-2.5 mb-3">
              <Crown className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <h2 className="text-base font-bold">Current Plan</h2>
            </div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-6 bg-muted animate-pulse rounded"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                <div className="h-8 bg-muted animate-pulse rounded w-1/2"></div>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold">
                  {currentPlan?.name ||
                    getPlanPublicName(sub?.planType ?? "free", pricingMeta) ||
                    "No Plan"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentPlan?.tagline ||
                    currentPlanMeta?.tagline ||
                    "Select a plan to get started"}
                </p>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold">
                      {currentPlanPriceDisplay.main}
                    </span>
                    {currentPlanPriceDisplay.period && (
                      <span className="text-muted-foreground text-xs sm:text-sm">
                        /{currentPlanPriceDisplay.period}
                      </span>
                    )}
                  </div>
                  {currentPlanPriceDisplay.yearlyNote && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {currentPlanPriceDisplay.yearlyNote}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="mt-2 text-[10px] sm:text-xs">
                  {currentSubscription && sub
                    ? `Billed ${sub.billingCycle} • Renews ${renewalLabel}`
                    : "Free Plan"}
                </Badge>
              </>
            )}
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none h-8 text-xs"
                disabled={portalLoading || upgradingPlanId !== null}
                onClick={() => void handleChangePlan()}
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Opening…
                  </>
                ) : (
                  "Change Plan"
                )}
              </Button>
              {currentSubscription && sub && sub.billingCycle !== billingCycle && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1 sm:flex-none h-8 text-xs"
                  disabled={upgradingPlanId !== null}
                  onClick={handleBillingCycleChange}
                >
                  {upgradingPlanId === BILLING_CYCLE_UPGRADE_KEY ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Redirecting…
                    </>
                  ) : (
                    `Update to ${billingCycle}`
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none h-8 text-xs"
                onClick={async () => {
                  try {
                    await api.subscription.cancel();
                    toast.success("Subscription cancelled");
                    await Promise.all([fetchBillingOnly(), refreshQuota()]);
                    window.dispatchEvent(new CustomEvent("trndinn:subscription-updated"));
                  } catch (error) {
                    // ApiError already has the friendly message from apiClient
                    const errorMessage = error instanceof Error ? error.message : getErrorMessage(error);
                    toast.error(errorMessage);
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-5 w-5 shrink-0" />
              <h2 className="text-base font-bold">Usage This Month</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Posts Published', ...usageData.posts },
                { label: 'AI Credits', ...usageData.aiCredits },
                { label: 'Connected Channels', ...usageData.channels },
              ].map((item) => {
                const pct = item.limit > 0 ? Math.min(100, (item.used / item.limit) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.used} / {item.limit}</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compare plan pricing cadence — matching pricing page toggle style */}
      <div className="flex flex-col items-center gap-4 py-6 rounded-2xl border border-border/70 bg-muted/30 dark:bg-white/[0.04]">
        <p className="text-sm text-muted-foreground text-center">Compare pricing options</p>
        <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/50 px-4 py-2 backdrop-blur-xl">
          <span className={cn("text-sm", billingCycle === "monthly" && "font-semibold text-foreground")}>
            Monthly
          </span>
          <Switch
            checked={billingCycle === "yearly"}
            onCheckedChange={(checked) => {
              setBillingCycle(checked ? "yearly" : "monthly");
            }}
            disabled={loading}
            aria-label="Toggle annual billing"
          />
          <span className={cn("text-sm", billingCycle === "yearly" && "font-semibold text-foreground")}>
            Annual <span className="text-primary">· save more</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Save with annual billing — discount applied automatically at checkout.
        </p>
      </div>

      {/* Promo Code Section */}
      <Card className="border-border/70 bg-card shadow-sm">
        <CardContent className="py-5 space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm">Promo code</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Applied at Polar checkout. Share links like{" "}
            <code className="text-[11px]">/billing?code=SAVE10</code>.
          </p>

          {!promoValidated ? (
            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="promo-code"
                  placeholder="Enter promo code (e.g. SAVE20)"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    if (e.target.value.trim() === "") {
                      setPromoValidated(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && promoCode.trim() && plans.length) {
                      const first = plans.find((p) => !p.current)?.id as
                        | "standard"
                        | "pro"
                        | "ultimate"
                        | undefined;
                      if (first) void validatePromoForSelection(first);
                    }
                  }}
                  className="pl-10 font-mono uppercase"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                disabled={!promoCode.trim() || !plans.length}
                onClick={() => {
                  const first = plans.find((p) => !p.current)?.id as
                    | "standard"
                    | "pro"
                    | "ultimate"
                    | undefined;
                  if (first) void validatePromoForSelection(first);
                }}
              >
                Apply
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{promoValidated.name}</p>
                    {promoValidated.discountType === "percentage" && promoValidated.percentOff && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {promoValidated.percentOff}% off applied
                      </p>
                    )}
                    {promoValidated.discountType === "fixed" && promoValidated.amountOff && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ${promoValidated.amountOff} off applied
                      </p>
                    )}
                  </div>
                </div>
                <DiscountBadge
                  code={promoValidated.code}
                  name={promoValidated.name}
                  discountType={promoValidated.discountType}
                  percentOff={promoValidated.percentOff}
                  amountOff={promoValidated.amountOff}
                  currency={promoValidated.currency}
                  onClear={() => {
                    setPromoValidated(null);
                    setPromoCode("");
                  }}
                  size="md"
                  variant="success"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans - 3 columns on lg, 2 on sm with 3rd full width */}
      <div
        id="billing-plan-cards"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch [&>*:last-child:nth-child(odd)]:sm:col-span-2 [&>*:last-child:nth-child(odd)]:lg:col-span-1"
      >
        {displayPlans.map((plan) => {
          const payload: SubscriptionPlanPayload =
            plan.raw ??
            ({
              id: plan.id,
              planType: plan.id,
              name: plan.name,
              description: plan.description,
              creditsLimit: plan.credits,
              priceMonthly: plan.price.monthly,
              priceYearly: plan.price.yearly,
              features: [...plan.features],
              isActive: true,
              sortOrder: 0,
              displayPricing: null,
            } satisfies SubscriptionPlanPayload);
          const resolved = resolvePlanCardPrices(
            payload,
            billingCurrency,
            billingCycle === "yearly",
            activeLaunchConfig,
          );
          const mainStr = resolved.pricingReady
            ? formatPlanMoney(resolved.mainAmount, resolved.currencyCode, resolved.symbolFallback)
            : "—";
          const strikeStr =
            resolved.strikeAmount != null && resolved.strikeAmount > resolved.mainAmount
              ? formatPlanMoney(resolved.strikeAmount, resolved.currencyCode, resolved.symbolFallback)
              : null;
          const yearlyTotal = resolved.yearlyTotal;
          const savingsPct =
            resolved.mainAmount && yearlyTotal && resolved.mainAmount > 0
              ? Math.round((1 - yearlyTotal / (resolved.mainAmount * 12)) * 100)
              : 0;
          const featured = plan.popular && !plan.current;
          return (
          <article
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-gradient-to-b from-card/80 to-card/40 p-6 backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-primary/40",
              featured
                ? "border-primary/45 ring-1 ring-primary/25 lg:scale-[1.03]"
                : "border-border/70 hover:shadow-xl hover:shadow-primary/10",
              plan.current && "border-primary/30 bg-primary/[0.03]"
            )}
          >
            {/* Highlight badge */}
            {plan.popular && !plan.current ? (
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f]">
                <Sparkles className="mr-1 inline h-3 w-3" />
                Most popular
              </span>
            ) : plan.id === "ultimate" && !plan.current ? (
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white bg-foreground/80">
                Best value
              </span>
            ) : null}

            {/* Current plan badge */}
            {plan.current && (
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
                <Check className="mr-1 inline h-3 w-3" />
                Current plan
              </span>
            )}

            <h3 className="font-display text-xl font-bold">{plan.name}</h3>
            <p className="mt-1 min-h-[2.5rem] text-sm text-muted-foreground">{plan.tagline}</p>

            {/* Price display */}
            <div className="mt-5 min-h-[5rem]">
              {promoValidated && !plan.current ? (
                <>
                  <div className="flex items-end gap-1.5">
                    <span className="text-sm text-muted-foreground line-through mr-1">
                      {mainStr}
                    </span>
                    <span className="font-display text-4xl font-black tracking-tight text-green-600 dark:text-green-400">
                      {(() => {
                        let discounted = resolved.mainAmount;
                        if (promoValidated.discountType === "percentage" && promoValidated.percentOff) {
                          discounted = resolved.mainAmount * (1 - promoValidated.percentOff / 100);
                        } else if (promoValidated.discountType === "fixed" && promoValidated.amountOff) {
                          discounted = Math.max(0, resolved.mainAmount - promoValidated.amountOff);
                        }
                        return formatPlanMoney(discounted, resolved.currencyCode, resolved.symbolFallback);
                      })()}
                    </span>
                    <span className="mb-1 text-sm text-muted-foreground">/ mo</span>
                  </div>
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    {promoValidated.discountType === "percentage" && promoValidated.percentOff
                      ? `${promoValidated.percentOff}% off with ${promoValidated.name}`
                      : `$${promoValidated.amountOff || 0} off with ${promoValidated.name}`}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-end gap-1.5">
                    {strikeStr && (
                      <span className="text-sm text-muted-foreground line-through mr-1" aria-hidden>
                        {strikeStr}
                      </span>
                    )}
                    <span className="font-display text-4xl font-black tracking-tight">{mainStr}</span>
                    <span className="mb-1 text-sm text-muted-foreground">/ mo</span>
                    {strikeStr && (
                      <Badge variant="outline" className="ml-1 text-[10px] font-normal mb-1">
                        Offer
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {billingCycle === "yearly"
                      ? yearlyTotal != null
                        ? `${formatPlanMoney(yearlyTotal, resolved.currencyCode, resolved.symbolFallback)} billed yearly${savingsPct > 0 ? ` · save ${savingsPct}%` : ""}`
                        : "Annual price unavailable"
                      : "billed monthly"}
                  </p>
                </>
              )}
            </div>

            {/* Credits highlight box - matching pricing page */}
            <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5">
              <p className="text-sm font-semibold text-foreground">
                {plan.credits.toLocaleString()} credits / mo
              </p>
              <p className="text-xs text-muted-foreground">{plan.creditsAsOutput}</p>
            </div>

            {/* Features list */}
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-muted-foreground">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              className={cn(
                "mt-7 w-full cursor-pointer rounded-full font-semibold",
                featured
                  ? "bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] text-white shadow-lg shadow-primary/20"
                  : "",
              )}
              variant={plan.current ? "outline" : featured ? "default" : "outline"}
              disabled={plan.current || loading || upgradingPlanId !== null}
              onClick={() => !plan.current && void handleSwitchPlan(plan.id)}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : upgradingPlanId === plan.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redirecting…
                </>
              ) : plan.current ? (
                'Current Plan'
              ) : hasActivePolarSubscription ? (
                `Switch to ${plan.name}`
              ) : (
                `Upgrade to ${plan.name}`
              )}
            </Button>
          </article>
          );
        })}
      </div>

      {/* Billing History + Payment Method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold">Billing History</h2>
            </div>
            <div className="space-y-2">
              {billingHistory.length === 0 ? (
                <div className="text-xs sm:text-sm text-muted-foreground border rounded-lg p-3">
                  No invoices yet. Your {processorLabel} transaction history will appear here.
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
                    <div className="p-1.5 bg-primary/10 rounded-lg shrink-0 hidden sm:flex">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-xs sm:text-sm truncate">{latestBill.description || "Subscription Charge"}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {new Date(latestBill.date).toLocaleDateString()} {latestBill.invoice ? `• ${latestBill.invoice}` : ""}
                      </p>
                    </div>
                    <span className="font-medium text-xs sm:text-sm shrink-0">{latestBill.amount}</span>
                    <Badge variant={latestBill.status === "paid" || latestBill.status === "completed" ? "default" : "secondary"} className="text-[10px] shrink-0">
                      {latestBill.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => openInvoice(latestBill.id)}
                      title="Download invoice"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {billingHistory.length > 1 && (
                    <div className="pt-1">
                      <Button
                        variant="link"
                        className="h-auto px-0 text-xs sm:text-sm"
                        onClick={() => setShowBillingTimelineModal(true)}
                      >
                        Show all
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold">Payment Method</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
              <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-xs sm:text-sm">
                  {currentSubscription?.billing?.paymentMethod || "No payment method on file"}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {currentSubscription?.billing?.paymentMethod
                    ? `Managed by ${processorLabel}`
                    : "Add a payment method during checkout"}
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {currentSubscription?.billing?.paymentMethod ? "Primary" : "None"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
