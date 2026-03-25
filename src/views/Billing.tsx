import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  Check, 
  Calendar,
  Download,
  Crown,
  Sparkles,
  BarChart3,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuota } from "@/contexts/QuotaContext";
import { toast } from "sonner";
import { getVisiblePlans, getPlanById, calculateYearlyDiscount, type PlanConfig } from "@/config/plans";
import { api } from "@/lib/apiClient";
import { openPaddleCheckout } from "@/lib/paddle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { fireConfettiSnip } from "@/registry/magicui/confetti";

// Convert plan config to billing page format
const formatPlansForBilling = (plans: PlanConfig[]) => {
  return plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    price: { monthly: plan.pricing.monthly, yearly: plan.pricing.yearly },
    description: plan.description,
    features: plan.features,
    popular: plan.popular || false,
    current: false
  }));
};

export default function Billing() {
  const { user } = useAuth();
  const { quota: userQuota } = useQuota();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState(formatPlansForBilling(getVisiblePlans()));
  const [usageData, setUsageData] = useState({
    posts: { used: 0, limit: 0 },
    aiCredits: { used: 0, limit: 0 },
    channels: { used: 0, limit: 5 },
  });
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBillingTimelineModal, setShowBillingTimelineModal] = useState(false);
  const hasLoadedPlansRef = useRef(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    // Prevent duplicate initial fetches in dev StrictMode.
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    fetchBillingData();
  }, [user?.id]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paddle") === "success") {
      setCheckoutSuccess(true);
      setShowSuccessModal(true);
      toast.success("Payment completed. Syncing subscription...");
      fetchBillingOnly();
      // Do a tiny controlled retry window for webhook propagation.
      window.setTimeout(() => fetchBillingOnly(), 4000);
      window.setTimeout(() => fetchBillingOnly(), 9000);
      // Clean URL query after showing feedback
      params.delete("paddle");
      const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", next);
    }
  }, []);

  useEffect(() => {
    if (showSuccessModal) {
      fireConfettiSnip();
    }
  }, [showSuccessModal]);

  // Sync AI Credits usage from QuotaContext so Billing updates when generation completes
  useEffect(() => {
    if (userQuota) {
      setUsageData(prev => ({
        ...prev,
        aiCredits: { used: userQuota.usedCredits, limit: userQuota.totalCredits },
      }));
    }
  }, [userQuota?.usedCredits, userQuota?.totalCredits]);

  const fetchPlansOnce = async () => {
    if (hasLoadedPlansRef.current) return;
    try {
      const plansData = await api.subscription.plans();
      const visiblePlansData = plansData.filter((plan: any) => plan.planType !== 'free');
      const formattedPlans = visiblePlansData.map((plan: any) => ({
        id: plan.planType,
        name: plan.name,
        price: { monthly: plan.priceMonthly, yearly: plan.priceYearly },
        description: plan.description,
        features: plan.features,
        popular: plan.planType === 'pro',
        current: false,
      }));
      setPlans(formattedPlans);
      hasLoadedPlansRef.current = true;
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans(formatPlansForBilling(getVisiblePlans()));
      hasLoadedPlansRef.current = true;
    }
  };

  const fetchBillingOnly = async () => {
    try {
      const subscriptionData = await api.subscription.billing();
      setCurrentSubscription(subscriptionData);

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
    } catch (error) {
      console.error('Error fetching billing info:', error);
      setCurrentSubscription(null);
      setPlans(prev => prev.map(plan => ({ ...plan, current: false })));
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

  const handlePlanUpgrade = async (planId: string) => {
    if (!user?.id) return;

    try {
      // Force payment verification through checkout for every upgrade.
      await openPaddleCheckout(
        planId as 'standard' | 'pro' | 'ultimate',
        billingCycle,
      );
      toast.success('Checkout opened. Complete payment to activate plan.');
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to open checkout');
    }
  };

  const handleBillingCycleChange = async () => {
    if (!user?.id || !currentSubscription) {
      toast.error('User not authenticated or subscription not loaded');
      return;
    }
    
    try {
      await openPaddleCheckout(
        currentSubscription.subscription.planType as 'standard' | 'pro' | 'ultimate',
        billingCycle,
      );
      toast.success(`Checkout opened for ${billingCycle} billing.`);
    } catch (error) {
      console.error('Error updating billing cycle:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      toast.error(`Failed to open checkout: ${errorMessage}`);
      // Revert the toggle
      setBillingCycle(currentSubscription?.subscription.billingCycle || 'monthly');
    }
  };

  const currentPlan = plans.find(plan => plan.current);
  const billingHistory = currentSubscription?.billing?.history || [];
  const latestBill = billingHistory[0];
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
              Your purchase is confirmed. We are syncing your subscription, invoices, and payment details from Paddle.
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
            {billingHistory.map((bill: any) => (
              <div key={bill.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
                <div className="p-1.5 bg-primary/10 rounded-lg shrink-0 hidden sm:flex">
                  <CreditCard className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-xs sm:text-sm truncate">{bill.description || "Subscription Charge"}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {new Date(bill.date).toLocaleDateString()} {bill.invoice ? `• ${bill.invoice}` : ""}
                  </p>
                </div>
                <span className="font-medium text-xs sm:text-sm shrink-0">{bill.amount}</span>
                <Badge variant={bill.status === "paid" || bill.status === "completed" ? "default" : "secondary"} className="text-[10px] shrink-0">
                  {bill.status}
                </Badge>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => openInvoice(bill.id)}
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

      {checkoutSuccess && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="font-medium">Payment completed.</span>
              <span className="text-muted-foreground">
                Your subscription is syncing from Paddle webhook events.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan + Usage - side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Card>
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
                  {currentPlan?.name || (currentSubscription?.subscription.planType === 'free' ? 'Free Trial' : 'No Plan')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentPlan?.description || (currentSubscription?.subscription.planType === 'free' ? '14-day free trial' : 'Select a plan to get started')}
                </p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-xl sm:text-2xl font-bold">
                    ${currentSubscription ? 
                      (currentSubscription.subscription.billingCycle === 'yearly' ? 
                        currentSubscription.billing.amount : 
                        currentSubscription.subscription.priceMonthly) : 
                      '0'}
                  </span>
                  <span className="text-muted-foreground text-xs sm:text-sm">
                    /{currentSubscription?.subscription.billingCycle || 'month'}
                  </span>
                </div>
                <Badge variant="secondary" className="mt-2 text-[10px] sm:text-xs">
                  {currentSubscription ? 
                    `Billed ${currentSubscription.subscription.billingCycle} • Renews ${new Date(currentSubscription.billing.nextBillingDate).toLocaleDateString()}` :
                    'Free Plan'
                  }
                </Badge>
              </>
            )}
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-8 text-xs">Change Plan</Button>
              {currentSubscription && currentSubscription.subscription.billingCycle !== billingCycle && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1 sm:flex-none h-8 text-xs"
                  onClick={handleBillingCycleChange}
                >
                  Update to {billingCycle}
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
                    fetchBillingOnly();
                  } catch {
                    toast.error("Failed to cancel subscription");
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
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
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.used} / {item.limit}</span>
                  </div>
                  <Progress value={(item.used / item.limit) * 100} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Toggle - For Pricing Display Only */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Compare pricing options</p>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <span className={cn("text-sm font-medium", billingCycle === 'monthly' && "text-primary")}>Monthly</span>
              <Switch
                checked={billingCycle === 'yearly'}
                onCheckedChange={(checked) => {
                  const newCycle = checked ? 'yearly' : 'monthly';
                  setBillingCycle(newCycle);
                  // This is just for display comparison - doesn't change your actual subscription
                }}
                disabled={loading}
              />
              <span className={cn("text-sm font-medium", billingCycle === 'yearly' && "text-primary")}>Yearly</span>
              <Badge variant="secondary" className="text-xs">
                {calculateYearlyDiscount(25, 250)}% Off
              </Badge>
            </div>
            {currentSubscription && currentSubscription.subscription.billingCycle !== billingCycle && (
              <p className="text-xs text-muted-foreground">
                You're currently on <strong>{currentSubscription.subscription.billingCycle}</strong> billing. 
                Use "Update to {billingCycle}" button above to change.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plans - 3 columns on lg, 2 on sm with 3rd full width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-stretch [&>*:last-child:nth-child(odd)]:sm:col-span-2 [&>*:last-child:nth-child(odd)]:lg:col-span-1">
        {plans.map((plan) => (
          <Card key={plan.id} className={cn(
            "relative flex flex-col h-full",
            plan.popular && "ring-2 ring-primary",
            plan.current && "bg-primary/5"
          )}>
            {(plan.popular || plan.current) && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className={plan.popular ? "bg-primary text-primary-foreground" : ""} variant={plan.current ? "secondary" : "default"}>
                  {plan.current ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Most Popular
                    </>
                  )}
                </Badge>
              </div>
            )}
            <CardContent className="p-4 sm:p-5 pt-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                {plan.id === 'ultimate' && <Crown className="h-4 w-4 text-primary" />}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold">
                  ${billingCycle === 'yearly' ? Math.round(plan.price.yearly / 12) : plan.price.monthly}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-xs text-muted-foreground mb-1">${plan.price.yearly} billed yearly</p>
              )}
              <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
              <ul className="space-y-1.5 mb-4 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={cn("w-full mt-auto", plan.popular && !plan.current && "bg-primary text-primary-foreground")}
                variant={plan.current ? "outline" : "default"}
                disabled={plan.current || loading}
                size="sm"
                onClick={() => !plan.current && handlePlanUpgrade(plan.id)}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : plan.current ? (
                  'Current Plan'
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
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
                  No invoices yet. Your Paddle transaction history will appear here.
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
                    ? "Managed by Paddle"
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
