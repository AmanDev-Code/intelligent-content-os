import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Checks if the current user has a pending (unused, unexpired) email_verification token.
 * If a pending token exists → verified = false.
 * If no pending token exists → verified = true.
 * Exposes recheck() to manually re-query after OTP verification.
 */
export function useVerificationStatus() {
  const { user } = useAuth();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    if (!user) {
      setVerified(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase
        .from('user_verification_tokens')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'email_verification')
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      setVerified(!data);
    } catch {
      setVerified(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    check();
  }, [check]);

  return { verified, loading, recheck: check };
}
