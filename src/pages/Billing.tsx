import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: 'standard',
    name: 'Standard',
    price: { monthly: 29, yearly: 278 },
    description: 'Perfect for individual creators',
    features: ['5 channels', '400 posts per month', 'AI auto-complete', 'AI copilots', 'AI Autocomplete', '3 AI Videos per month', 'Basic analytics', 'Email support'],
    popular: false,
    current: true
  },
  {
    id: 'team',
    name: 'Team',
    price: { monthly: 39, yearly: 374 },
    description: 'Great for small teams',
    features: ['10 channels', 'Unlimited posts', 'Unlimited members', 'AI auto-complete', 'AI copilots', '10 AI Videos/month', 'Advanced analytics', 'Priority support'],
    popular: false,
    current: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 49, yearly: 470 },
    description: 'For growing businesses',
    features: ['30 channels', 'Unlimited posts', 'Unlimited members', 'AI auto-complete', 'AI copilots', 'Picture Editor', '30 AI Videos/month', '300 AI Images/month', 'Custom branding', 'Priority support'],
    popular: true,
    current: false
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: { monthly: 99, yearly: 950 },
    description: 'For large organizations',
    features: ['100 channels', 'Unlimited posts', 'Unlimited members', 'AI auto-complete', 'AI copilots', 'Picture Editor', '60 AI Videos/month', '500 AI Images/month', 'White-label', 'Custom integrations', 'Dedicated support'],
    popular: false,
    current: false
  }
];

const usageData = {
  posts: { used: 24, limit: 400 },
  aiCredits: { used: 47, limit: 100 },
  channels: { used: 1, limit: 5 },
};

const billingHistory = [
  { id: 1, date: '2026-03-01', description: 'Standard Plan - Monthly', amount: '$29.00', status: 'paid', invoice: 'INV-2026-001' },
  { id: 2, date: '2026-02-01', description: 'Standard Plan - Monthly', amount: '$29.00', status: 'paid', invoice: 'INV-2026-002' },
  { id: 3, date: '2026-01-01', description: 'Standard Plan - Monthly', amount: '$29.00', status: 'paid', invoice: 'INV-2026-003' },
];

export default function Billing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
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

      {/* Current Plan */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <Crown className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold">Current Plan</h2>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">{currentPlan?.name}</h3>
              <p className="text-sm text-muted-foreground">{currentPlan?.description}</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl sm:text-3xl font-bold">${currentPlan?.price.monthly}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Badge variant="secondary" className="mt-2 text-xs">
                Billed monthly • Renews March 14, 2026
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Change Plan</Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Cancel</Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 shrink-0" />
            <h2 className="text-lg font-bold">Usage This Month</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Posts Published', ...usageData.posts },
              { label: 'AI Credits', ...usageData.aiCredits },
              { label: 'Connected Channels', ...usageData.channels },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.used} / {item.limit}</span>
                </div>
                <Progress value={(item.used / item.limit) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing Toggle */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className={cn("text-sm font-medium", billingCycle === 'monthly' && "text-primary")}>Monthly</span>
            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
            />
            <span className={cn("text-sm font-medium", billingCycle === 'yearly' && "text-primary")}>Yearly</span>
            <Badge variant="secondary" className="text-xs">20% Off</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={cn(
            "relative",
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
            <CardContent className="p-4 sm:p-6 pt-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                {plan.id === 'ultimate' && <Crown className="h-4 w-4 text-yellow-500" />}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl sm:text-3xl font-bold">
                  ${billingCycle === 'yearly' ? Math.round(plan.price.yearly / 12) : plan.price.monthly}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-xs text-muted-foreground mb-1">${plan.price.yearly} billed yearly</p>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">{plan.description}</p>
              <ul className="space-y-1.5 mb-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                    <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={cn("w-full", plan.popular && !plan.current && "bg-primary text-primary-foreground")}
                variant={plan.current ? "outline" : "default"}
                disabled={plan.current}
                size="sm"
              >
                {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing History */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 shrink-0" />
            <h2 className="text-lg font-bold">Billing History</h2>
          </div>
          <div className="space-y-3">
            {billingHistory.map((bill) => (
              <div key={bill.id} className="p-3 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{bill.description}</h3>
                    <p className="text-xs text-muted-foreground">{new Date(bill.date).toLocaleDateString()} • {bill.invoice}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 ml-9">
                  <span className="font-medium text-sm">{bill.amount}</span>
                  <Badge variant="default" className="text-[10px]">Paid</Badge>
                  <Button variant="outline" size="sm" className="ml-auto h-7 text-xs">
                    <Download className="h-3 w-3 mr-1" /> Invoice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 shrink-0" />
            <h2 className="text-lg font-bold">Payment Method</h2>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">•••• •••• •••• 4242</h3>
                <p className="text-xs text-muted-foreground">Expires 12/28</p>
              </div>
              <Badge variant="secondary" className="text-[10px] shrink-0">Primary</Badge>
              <Button variant="outline" size="sm" className="h-7 text-xs shrink-0">Update</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
