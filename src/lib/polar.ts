import { api } from '@/lib/apiClient';
import {
  markPolarReturnKind,
  storePolarPlanIntent,
} from '@/lib/polarPlanIntent';
import { toast } from 'sonner';

export type PolarPlanType = 'standard' | 'pro' | 'ultimate';
export type PolarBillingCycle = 'monthly' | 'yearly';

type PlanType = PolarPlanType;
type BillingCycle = PolarBillingCycle;

const POLAR_MODE = process.env.NEXT_PUBLIC_POLAR_MODE || 'sandbox';
const POLAR_ORGANIZATION = process.env.NEXT_PUBLIC_POLAR_ORGANIZATION || '';

const POLAR_CHECKOUT_MAP: Record<PlanType, Record<BillingCycle, string>> = {
  standard: {
    monthly: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_STANDARD_MONTHLY || '',
    yearly: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_STANDARD_YEARLY || '',
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_PRO_MONTHLY || '',
    yearly: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_PRO_YEARLY || '',
  },
  ultimate: {
    monthly: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_ULTIMATE_MONTHLY || '',
    yearly: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_ULTIMATE_YEARLY || '',
  },
};

/** Client hint only — backend always builds the real return URL from FRONTEND_URL. */
function billingReturnUrl(): string {
  const baseOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseOrigin}/billing?polar=success`;
}

function notifyPortalRedirect(message?: string): void {
  toast.info(
    message || "Complete your plan change on Polar's secure page",
  );
}

/**
 * Build Polar checkout URL with custom data parameters (static link fallback).
 */
function buildCheckoutUrl(
  baseUrl: string,
  customData: {
    user_id: string;
    plan_type: PlanType;
    billing_cycle: BillingCycle;
    app: string;
    app_reference: string;
  },
  discountCode?: string,
): string {
  const url = new URL(baseUrl);

  url.searchParams.set('user_id', customData.user_id);
  url.searchParams.set('plan_type', customData.plan_type);
  url.searchParams.set('billing_cycle', customData.billing_cycle);
  url.searchParams.set('app', customData.app);
  url.searchParams.set('app_reference', customData.app_reference);

  if (discountCode?.trim()) {
    url.searchParams.set('discount_code', discountCode.trim().toUpperCase());
  }

  const baseOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  if (!url.searchParams.has('success_url')) {
    url.searchParams.set('success_url', `${baseOrigin}/billing?polar=success`);
  }
  if (!url.searchParams.has('cancel_url')) {
    url.searchParams.set('cancel_url', `${baseOrigin}/billing?polar=cancel`);
  }

  return url.toString();
}

export type OpenPolarCheckoutOptions = {
  discountCode?: string;
  /** When true, never fall back to static checkout links (existing Polar subscribers). */
  hasActiveSubscription?: boolean;
};

/**
 * Open Polar customer portal to manage the current subscription (payment method, plan, cycle).
 * Does not pass a target plan — use {@link openPolarSwitchPlan} when switching to a specific tier.
 */
export async function openPolarPortal(): Promise<void> {
  markPolarReturnKind('portal');
  const session = await api.subscription.customerPortal();
  if (!session?.url) {
    throw new Error('Polar did not return a customer portal URL');
  }
  window.location.assign(session.url);
}

/**
 * Start checkout or portal plan change with explicit target plan + billing cycle context.
 */
export type OpenPolarSwitchPlanResult =
  | { mode: 'redirect' }
  | { mode: 'in_app'; planType: PlanType; billingCycle: BillingCycle };

export async function openPolarSwitchPlan(
  planType: PlanType,
  billingCycle: BillingCycle,
  options?: OpenPolarCheckoutOptions,
): Promise<OpenPolarSwitchPlanResult> {
  const discountCode = options?.discountCode?.trim() || undefined;
  const baseOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  if (options?.hasActiveSubscription) {
    storePolarPlanIntent({ planType, billingCycle });
    try {
      await api.subscription.changePlan(planType, billingCycle);
      return { mode: 'in_app', planType, billingCycle };
    } catch (err) {
      // For existing subscribers, never fall back to checkout/redirect.
      // Show the error to the user instead.
      throw err;
    }
  }

  try {
    const session = await api.subscription.checkoutUrl({
      planType,
      billingCycle,
      discountCode,
      successUrl: billingReturnUrl(),
      cancelUrl: `${baseOrigin}/billing?polar=cancel`,
    });
    if (session?.redirectKind === 'in_app') {
      storePolarPlanIntent({ planType, billingCycle });
      return { mode: 'in_app', planType, billingCycle };
    }
    if (session?.url) {
      if (session.redirectKind === 'portal') {
        markPolarReturnKind('portal');
        storePolarPlanIntent({ planType, billingCycle });
        notifyPortalRedirect(session.message);
      } else {
        markPolarReturnKind('checkout');
      }
      window.location.assign(session.url);
      return { mode: 'redirect' };
    }
  } catch (err) {
    if (discountCode) {
      throw err;
    }
    console.warn('Polar checkout session API failed, falling back to static link:', err);
  }

  const checkoutUrl = POLAR_CHECKOUT_MAP[planType][billingCycle];
  if (!checkoutUrl) {
    throw new Error(`Missing Polar checkout URL for ${planType}/${billingCycle}`);
  }

  const { supabase } = await import('@/integrations/supabase/client');
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!session?.access_token || !user?.id) {
    throw new Error('You must be signed in to checkout');
  }

  const customData = {
    user_id: user.id,
    plan_type: planType,
    billing_cycle: billingCycle,
    app: 'trndinn',
    app_reference: `trndinn_${user.id}_${planType}_${billingCycle}_${Date.now()}`,
  };

  const redirectUrl = buildCheckoutUrl(checkoutUrl, customData, discountCode);
  markPolarReturnKind('checkout');
  window.location.href = redirectUrl;
  return { mode: 'redirect' };
}

/** @deprecated Prefer {@link openPolarSwitchPlan} */
export async function openPolarCheckout(
  planType: PlanType,
  billingCycle: BillingCycle,
  options?: OpenPolarCheckoutOptions,
): Promise<OpenPolarSwitchPlanResult> {
  return openPolarSwitchPlan(planType, billingCycle, options);
}

/**
 * Get checkout URL without redirecting.
 */
export async function getPolarCheckoutUrl(
  planType: PlanType,
  billingCycle: BillingCycle,
  options?: OpenPolarCheckoutOptions,
): Promise<string> {
  const discountCode = options?.discountCode?.trim() || undefined;
  const baseOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  try {
    const session = await api.subscription.checkoutUrl({
      planType,
      billingCycle,
      discountCode,
      successUrl: `${baseOrigin}/billing?polar=success`,
      cancelUrl: `${baseOrigin}/billing?polar=cancel`,
    });
    if (session?.url) {
      if (session.redirectKind === 'portal') {
        notifyPortalRedirect(session.message);
      }
      return session.url;
    }
  } catch (err) {
    if (discountCode || options?.hasActiveSubscription) throw err;
  }

  if (options?.hasActiveSubscription) {
    throw new Error(
      'Could not open the Polar customer portal. Please try again or use Manage billing.',
    );
  }

  const checkoutUrl = POLAR_CHECKOUT_MAP[planType][billingCycle];
  if (!checkoutUrl) {
    throw new Error(`Missing Polar checkout URL for ${planType}/${billingCycle}`);
  }

  const { supabase } = await import('@/integrations/supabase/client');
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error('You must be signed in to checkout');
  }

  return buildCheckoutUrl(
    checkoutUrl,
    {
      user_id: user.id,
      plan_type: planType,
      billing_cycle: billingCycle,
      app: 'trndinn',
      app_reference: `trndinn_${user.id}_${planType}_${billingCycle}_${Date.now()}`,
    },
    discountCode,
  );
}

/** True when at least one checkout link URL is set (slug optional for link-based checkout). */
export function isPolarConfigured(): boolean {
  for (const planType of ['standard', 'pro', 'ultimate'] as PlanType[]) {
    for (const billingCycle of ['monthly', 'yearly'] as BillingCycle[]) {
      if (POLAR_CHECKOUT_MAP[planType][billingCycle]) {
        return true;
      }
    }
  }
  return false;
}

export function getPolarMode(): 'sandbox' | 'production' {
  return POLAR_MODE === 'production' ? 'production' : 'sandbox';
}

export function getPolarOrganization(): string {
  return POLAR_ORGANIZATION;
}

export function getPolarCheckoutPriceId(
  planType: PlanType,
  billingCycle: BillingCycle,
): string | null {
  const checkoutUrl = POLAR_CHECKOUT_MAP[planType][billingCycle];
  if (!checkoutUrl) return null;
  const match = checkoutUrl.match(/\/checkout\/([^/?]+)/);
  return match ? match[1] : null;
}

export async function initPolarCheckout(): Promise<void> {
  return Promise.resolve();
}

/**
 * Open Polar customer portal (manage plan, payment method, cancel).
 */
export async function openPolarCustomerPortal(options?: {
  intent?: 'change' | 'switch';
  planType?: PlanType;
  billingCycle?: BillingCycle;
}): Promise<void> {
  markPolarReturnKind('portal');

  try {
    const session = await api.subscription.portalUrl({
      intent: options?.intent ?? 'change',
      planType: options?.planType,
      billingCycle: options?.billingCycle,
    });
    if (session?.url) {
      window.location.assign(session.url);
      return;
    }
  } catch {
    // fall through to POST customer-portal
  }

  const legacy = await api.subscription.customerPortal();
  if (!legacy?.url) {
    throw new Error('Could not open the Polar customer portal');
  }
  window.location.assign(legacy.url);
}
