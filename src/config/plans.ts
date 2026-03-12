// Subscription Plans Configuration
// Edit this file to modify plan details, pricing, and features

export interface PlanConfig {
  id: string;
  name: string;
  description: string;
  pricing: {
    monthly: number;
    yearly: number;
  };
  credits: number;
  features: string[];
  popular?: boolean;
  hidden?: boolean; // For plans that shouldn't be shown in billing UI
}

export const SUBSCRIPTION_PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    pricing: {
      monthly: 0,
      yearly: 0,
    },
    credits: 50,
    features: [
      '50 AI credits per month',
      'Basic content generation',
      'Community support'
    ],
    popular: false,
    hidden: true, // Hidden from billing page - auto-assigned for 14 days on signup
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Great for regular content creators',
    pricing: {
      monthly: 15,
      yearly: 150, // 17% discount
    },
    credits: 500,
    features: [
      '500 AI credits per month',
      'Advanced content generation',
      'Priority support',
      'Analytics dashboard',
      'Content scheduling'
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Perfect for businesses and agencies',
    pricing: {
      monthly: 25,
      yearly: 250, // 17% discount
    },
    credits: 2000,
    features: [
      '2000 AI credits per month',
      'Premium content generation',
      'Advanced analytics',
      'Priority support',
      'Custom templates',
      'Team collaboration',
      'API access'
    ],
    popular: true, // Most popular plan
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    description: 'For enterprise and high-volume users',
    pricing: {
      monthly: 49,
      yearly: 490, // 17% discount
    },
    credits: 10000,
    features: [
      '10000 AI credits per month',
      'Unlimited content generation',
      'Enterprise analytics',
      '24/7 support',
      'Custom integrations',
      'White-label options',
      'Dedicated account manager',
      'Custom workflows'
    ],
    popular: false,
  },
];

// Helper functions
export const getVisiblePlans = () => SUBSCRIPTION_PLANS.filter(plan => !plan.hidden);

export const getPlanById = (id: string) => SUBSCRIPTION_PLANS.find(plan => plan.id === id);

export const getPopularPlan = () => SUBSCRIPTION_PLANS.find(plan => plan.popular);

export const calculateYearlyDiscount = (monthly: number, yearly: number) => {
  const monthlyTotal = monthly * 12;
  const discount = ((monthlyTotal - yearly) / monthlyTotal) * 100;
  return Math.round(discount);
};

// Plan limits and quotas
export const PLAN_LIMITS = {
  free: {
    credits: 50,
    trialDays: 14,
  },
  standard: {
    credits: 500,
    channels: 5,
    teamMembers: 1,
  },
  pro: {
    credits: 2000,
    channels: 30,
    teamMembers: 5,
    apiCalls: 10000,
  },
  ultimate: {
    credits: 10000,
    channels: 100,
    teamMembers: 25,
    apiCalls: 100000,
    customIntegrations: true,
  },
} as const;