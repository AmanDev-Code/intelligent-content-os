import { supabase } from '@/integrations/supabase/client';

type PlanType = 'standard' | 'pro' | 'ultimate';
type BillingCycle = 'monthly' | 'yearly';

declare global {
  interface Window {
    Paddle?: any;
  }
}

const PADDLE_ENV = process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox';
const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '';

const PADDLE_PRICE_MAP: Record<PlanType, Record<BillingCycle, string>> = {
  standard: {
    monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_STANDARD_MONTHLY || '',
    yearly: process.env.NEXT_PUBLIC_PADDLE_PRICE_STANDARD_YEARLY || '',
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY || '',
    yearly: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_YEARLY || '',
  },
  ultimate: {
    monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_ULTIMATE_MONTHLY || '',
    yearly: process.env.NEXT_PUBLIC_PADDLE_PRICE_ULTIMATE_YEARLY || '',
  },
};

let initialized = false;

async function loadScript(): Promise<void> {
  if (window.Paddle) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paddle.js'));
    document.head.appendChild(script);
  });
}

async function ensurePaddleReady(): Promise<void> {
  await loadScript();
  if (!window.Paddle) throw new Error('Paddle.js unavailable');
  if (initialized) return;

  if (PADDLE_ENV === 'sandbox') {
    window.Paddle.Environment.set('sandbox');
  }

  if (!PADDLE_CLIENT_TOKEN) {
    throw new Error('Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN');
  }

  window.Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN });
  initialized = true;
}

export async function openPaddleCheckout(
  planType: PlanType,
  billingCycle: BillingCycle,
): Promise<void> {
  await ensurePaddleReady();

  const priceId = PADDLE_PRICE_MAP[planType][billingCycle];
  if (!priceId) {
    throw new Error(`Missing Paddle price ID for ${planType}/${billingCycle}`);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!session?.access_token || !user?.id) {
    throw new Error('You must be signed in to checkout');
  }

  window.Paddle.Checkout.open({
    settings: {
      displayMode: 'overlay',
      theme: 'light',
      locale: 'en',
      successUrl: `${window.location.origin}/billing?paddle=success`,
    },
    items: [{ priceId, quantity: 1 }],
    customer: {
      email: user.email || undefined,
    },
    customData: {
      user_id: user.id,
      plan_type: planType,
      billing_cycle: billingCycle,
      app: 'trndinn',
      app_reference: `trndinn_${user.id}_${planType}_${billingCycle}_${Date.now()}`,
    },
  });
}

