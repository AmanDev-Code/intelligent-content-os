import { useState, useEffect } from "react";
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

const billingHistory = [
  { id: 1, date: '2026-03-01', description: 'Standard Plan - Monthly', amount: '$29.00', status: 'paid', invoice: 'INV-2026-001' },
  { id: 2, date: '2026-02-01', description: 'Standard Plan - Monthly', amount: '$29.00', status: 'paid', invoice: 'INV-2026-002' },
  { id: 3, date: '2026-01-01', description: 'Standard Plan - Monthly', amount: '$29.00', status: 'paid', invoice: 'INV-2026-003' },
];

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

  useEffect(() => {
    if (user?.id) {
      fetchBillingData();
    }
  }, [user?.id]);

  // Sync AI Credits usage from QuotaContext so Billing updates when generation completes
  useEffect(() => {
    if (userQuota) {
      setUsageData(prev => ({
        ...prev,
        aiCredits: { used: userQuota.usedCredits, limit: userQuota.totalCredits },
      }));
    }
  }, [userQuota?.usedCredits, userQuota?.totalCredits]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Use the centralized API client
      try {
        const plansData = await api.subscription.plans();
        // Filter out hidden plans (like free) and format for UI
        const visiblePlansData = plansData.filter((plan: any) => plan.planType !== 'free');
        const formattedPlans = visiblePlansData.map((plan: any) => ({
          id: plan.planType,
          name: plan.name,
          price: { monthly: plan.priceMonthly, yearly: plan.priceYearly },
          description: plan.description,
          features: plan.features,
          popular: plan.planType === 'pro',
          current: false // Will be set based on user's subscription
        }));
        setPlans(formattedPlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
        // Fallback to local config if API fails
        setPlans(formatPlansForBilling(getVisiblePlans()));
      }

      try {
        const subscriptionData = await api.subscription.billing();
        setCurrentSubscription(subscriptionData);
        // DON'T automatically set billing cycle from subscription
        // Keep it as display-only toggle for pricing comparison
        
        // Update current plan
        setPlans(prev => prev.map(plan => ({
          ...plan,
          current: plan.id === subscriptionData.subscription.planType
        })));

        // Update usage data
        setUsageData({
          posts: { used: 0, limit: 0 }, // You can add posts tracking later
          aiCredits: { 
            used: subscriptionData.usage.currentPeriodUsage, 
            limit: subscriptionData.subscription.creditsLimit 
          },
          channels: { used: 0, limit: 5 }, // You can add channels tracking later
        });
      } catch (error) {
        console.error('Error fetching billing info:', error);
        // Set fallback data for Ultimate plan
        setCurrentSubscription({
          subscription: {
            planType: 'ultimate',
            billingCycle: 'yearly',
            creditsLimit: 10000,
          },
          usage: {
            currentPeriodUsage: 0,
            remainingCredits: 10000,
            percentageUsed: 0,
          },
          billing: {
            nextBillingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          }
        } as any);
        
        setPlans(prev => prev.map(plan => ({
          ...plan,
          current: plan.id === 'ultimate'
        })));
      }
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
      await api.subscription.update(planId, billingCycle);
      toast.success('Plan updated successfully!');
      fetchBillingData(); // Refresh data
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    }
  };

  const handleBillingCycleChange = async () => {
    if (!user?.id || !currentSubscription) {
      toast.error('User not authenticated or subscription not loaded');
      return;
    }
    
    try {
      // Update the billing cycle for the current plan
      const result = await api.subscription.update(currentSubscription.subscription.planType, billingCycle);
      toast.success(`Billing cycle updated to ${billingCycle}!`);
      fetchBillingData(); // Refresh data
    } catch (error) {
      console.error('Error updating billing cycle:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      toast.error(`Failed to update billing cycle: ${errorMessage}`);
      // Revert the toggle
      setBillingCycle(currentSubscription?.subscription.billingCycle || 'monthly');
    }
  };

  const currentPlan = plans.find(plan => plan.current);

  return (
    <div className="flex-1 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-sm text-muted-foreground">Manage your subscription and billing information</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Download Invoice</span>
        </Button>
      </div>

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
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-8 text-xs">Cancel</Button>
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
                  {plan.popular && <><Sparkles className="h-3 w-3 mr-1" />Most Popular</>}
                  {plan.current && <><Check className="h-3 w-3 mr-1" />Current Plan</>}
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
              {billingHistory.map((bill) => (
                <div key={bill.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
                  <div className="p-1.5 bg-primary/10 rounded-lg shrink-0 hidden sm:flex">
                    <CreditCard className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs sm:text-sm truncate">{bill.description}</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{new Date(bill.date).toLocaleDateString()} • {bill.invoice}</p>
                  </div>
                  <span className="font-medium text-xs sm:text-sm shrink-0">{bill.amount}</span>
                  <Badge variant="default" className="text-[10px] shrink-0">Paid</Badge>
                </div>
              ))}
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
                <h3 className="font-medium text-xs sm:text-sm">•••• •••• •••• 4242</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Expires 12/28</p>
              </div>
              <Badge variant="secondary" className="text-[10px] shrink-0">Primary</Badge>
              <Button variant="outline" size="sm" className="h-7 text-xs shrink-0">Update</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
