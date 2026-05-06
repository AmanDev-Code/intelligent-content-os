'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';

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
          router.replace('/dashboard');
        }
      });
      return;
    }

    // Implicit flow: supabase-js auto-processes the hash fragment and fires
    // SIGNED_IN.  Check whether the session is already set first (supabase-js
    // may have already finished by the time this effect runs).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard');
        return;
      }

      // Not set yet — wait for the SIGNED_IN event.
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, sess) => {
        if (event === 'SIGNED_IN' && sess) {
          subscription.unsubscribe();
          clearTimeout(timeout);
          router.replace('/dashboard');
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
