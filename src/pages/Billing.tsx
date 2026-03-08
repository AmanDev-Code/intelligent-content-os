import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  CreditCard, 
  Check, 
  Zap, 
  Users, 
  Calendar,
  Download,
  AlertCircle,
  Crown,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Video,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: 'standard',
    name: 'Standard',
    price: { monthly: 29, yearly: 278 },
    description: 'Perfect for individual creators',
    features: [
      '5 channels',
      '400 posts per month',
      'AI auto-complete',
      'AI copilots',
      'AI Autocomplete',
      '3 AI Videos per month',
      'Basic analytics',
      'Email support'
    ],
    popular: false,
    current: true
  },
  {
    id: 'team',
    name: 'Team',
    price: { monthly: 39, yearly: 374 },
    description: 'Great for small teams',
    features: [
      '10 channels',
      'Unlimited posts per month',
      'Unlimited team members',
      'AI auto-complete',
      'AI copilots',
      'AI Autocomplete',
      '10 AI Videos per month',
      'Advanced analytics',
      'Priority support'
    ],
    popular: false,
    current: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 49, yearly: 470 },
    description: 'For growing businesses',
    features: [
      '30 channels',
      'Unlimited posts per month',
      'Unlimited team members',
      'AI auto-complete',
      'AI copilots',
      'AI Autocomplete',
      'Advanced Picture Editor',
      '30 AI Videos per month',
      '300 AI Images per month',
      'Advanced analytics',
      'Custom branding',
      'Priority support'
    ],
    popular: true,
    current: false
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: { monthly: 99, yearly: 950 },
    description: 'For large organizations',
    features: [
      '100 channels',
      'Unlimited posts per month',
      'Unlimited team members',
      'AI auto-complete',
      'AI copilots',
      'AI Autocomplete',
      'Advanced Picture Editor',
      '60 AI Videos per month',
      '500 AI Images per month',
      'White-label solution',
      'Custom integrations',
      'Dedicated support'
    ],
    popular: false,
    current: false
  }
];

const usageData = {
  posts: { used: 24, limit: 400 },
  aiCredits: { used: 47, limit: 100 },
  channels: { used: 1, limit: 5 },
  teamMembers: { used: 1, limit: 1 }
};

const billingHistory = [
  {
    id: 1,
    date: '2026-03-01',
    description: 'Standard Plan - Monthly',
    amount: '$29.00',
    status: 'paid',
    invoice: 'INV-2026-001'
  },
  {
    id: 2,
    date: '2026-02-01',
    description: 'Standard Plan - Monthly',
    amount: '$29.00',
    status: 'paid',
    invoice: 'INV-2026-002'
  },
  {
    id: 3,
    date: '2026-01-01',
    description: 'Standard Plan - Monthly',
    amount: '$29.00',
    status: 'paid',
    invoice: 'INV-2026-003'
  }
];

export default function Billing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const currentPlan = plans.find(plan => plan.current);
  const yearlyDiscount = billingCycle === 'yearly' ? 0.2 : 0;

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-sm text-muted-foreground">Manage your subscription and billing information</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Download Invoice</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan & Usage */}
        <div className="lg:col-span-1 space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{currentPlan?.name}</h3>
                  <p className="text-muted-foreground">{currentPlan?.description}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${currentPlan?.price.monthly}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Badge variant="secondary" className="w-fit">
                  Billed monthly • Renews March 14, 2026
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Change Plan
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Posts Published</span>
                    <span>{usageData.posts.used} / {usageData.posts.limit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(usageData.posts.used / usageData.posts.limit) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>AI Credits</span>
                    <span>{usageData.aiCredits.used} / {usageData.aiCredits.limit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(usageData.aiCredits.used / usageData.aiCredits.limit) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Connected Channels</span>
                    <span>{usageData.channels.used} / {usageData.channels.limit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(usageData.channels.used / usageData.channels.limit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Toggle */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-4">
                <span className={cn("font-medium", billingCycle === 'monthly' && "text-primary")}>
                  Monthly
                </span>
                <Switch
                  checked={billingCycle === 'yearly'}
                  onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                />
                <span className={cn("font-medium", billingCycle === 'yearly' && "text-primary")}>
                  Yearly
                </span>
                <Badge variant="secondary" className="ml-2">
                  20% Off
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className={cn(
                "relative",
                plan.popular && "ring-2 ring-primary",
                plan.current && "bg-primary/5"
              )}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="gradient-primary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="secondary">
                      <Check className="h-3 w-3 mr-1" />
                      Current Plan
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {plan.id === 'ultimate' && <Crown className="h-5 w-5 text-yellow-500" />}
                  </CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      ${billingCycle === 'yearly' 
                        ? Math.round(plan.price.yearly / 12) 
                        : plan.price.monthly}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingCycle === 'yearly' ? 'month' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-muted-foreground">
                      ${plan.price.yearly} billed yearly
                    </p>
                  )}
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={cn(
                      "w-full",
                      plan.current 
                        ? "opacity-50 cursor-not-allowed" 
                        : plan.popular 
                          ? "gradient-primary" 
                          : ""
                    )}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingHistory.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{bill.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(bill.date).toLocaleDateString()} • {bill.invoice}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{bill.amount}</span>
                  <Badge variant={bill.status === 'paid' ? 'default' : 'secondary'}>
                    {bill.status === 'paid' ? 'Paid' : 'Pending'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Invoice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">•••• •••• •••• 4242</h3>
                <p className="text-sm text-muted-foreground">Expires 12/28</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Primary</Badge>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}