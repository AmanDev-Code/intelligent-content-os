'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeReturnTo } from '@/lib/sanitizeReturnTo';

const PLAN_INTENT_KEY = "trndinn_pricing_intent";

/**
 * OAuth callback landing page.
 *
 * The backend builds an implicit-flow Supabase authorize URL
 * (no code_challenge), so Supabase redirects here with the session tokens
 * in the URL hash:  /auth/callback#access_token=...&refresh_token=...
 *
 * supabase-js detects the hash on its own (detectSessionInUrl: true default)
 * and fires onAuthStateChange('SIGNED_IN').  We wait for that event and then
 * send the user to the dashboard.
 *
 * If the backend ever adds a code_challenge (PKCE), Supabase will redirect
 * here with ?code=... instead.  The exchangeCodeForSession branch handles that.
 */
export default function AuthCallback() {
  const router = useRouter();

  // Helper to determine redirect URL after successful login
  const getRedirectUrl = (): string => {
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo');

    // Check for plan intent in sessionStorage
    const planIntent = sessionStorage.getItem(PLAN_INTENT_KEY);
    if (planIntent) {
      try {
        const intent = JSON.parse(planIntent);
        // Only use intent if it's recent (within 10 minutes)
        if (intent.timestamp && Date.now() - intent.timestamp < 10 * 60 * 1000) {
          sessionStorage.removeItem(PLAN_INTENT_KEY);
          return `/pricing?plan=${intent.planType}&cycle=${intent.billingCycle}`;
        }
      } catch {
        // Ignore invalid intent data
      }
    }

    return sanitizeReturnTo(returnTo, '/dashboard');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    const code = params.get('code');

    if (errorParam) {
      router.replace('/auth?error=google_auth_failed');
      return;
    }

    // PKCE flow: Supabase sends ?code=... when code_challenge was included.
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          router.replace('/auth?error=google_auth_failed');
        } else {
          router.replace(getRedirectUrl());
        }
      });
      return;
    }

    // Implicit flow: supabase-js auto-processes the hash fragment and fires
    // SIGNED_IN.  Check whether the session is already set first (supabase-js
    // may have already finished by the time this effect runs).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace(getRedirectUrl());
        return;
      }

      // Not set yet — wait for the SIGNED_IN event.
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, sess) => {
        if (event === 'SIGNED_IN' && sess) {
          subscription.unsubscribe();
          clearTimeout(timeout);
          router.replace(getRedirectUrl());
        }
      });

      const timeout = setTimeout(() => {
        subscription.unsubscribe();
        router.replace('/auth?error=google_auth_failed');
      }, 5000);
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
