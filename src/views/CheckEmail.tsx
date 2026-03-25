import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function CheckEmail() {
  const { session, user, signOut } = useAuth();
  const { verified, loading } = useVerificationStatus();
  const router = useRouter();
  const { toast } = useToast();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!session) {
      router.replace('/auth');
      return;
    }
    if (!loading && verified) {
      router.replace('/');
    }
  }, [session, verified, loading, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setOtp(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = useCallback(async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast({ title: 'Enter the full code', description: 'Please enter all 6 digits.', variant: 'destructive' });
      return;
    }
    setVerifying(true);
    try {
      const res = await apiClient.post('/auth/verify-otp', { otp: code });
      if (res.success) {
        toast({ title: 'Email verified', description: 'Welcome to Trndinn!' });
        router.replace('/');
      } else {
        toast({ title: 'Invalid code', description: res.message || 'The code is invalid or expired.', variant: 'destructive' });
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast({ title: 'Verification failed', description: 'Could not verify the code. Please try again.', variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  }, [otp, toast, router]);

  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6) {
      handleVerify();
    }
  }, [otp, handleVerify]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await apiClient.post('/auth/resend-otp', {});
      toast({ title: 'Code sent', description: 'A new verification code has been sent to your email.' });
      setCooldown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      toast({ title: 'Error', description: 'Could not resend the code.', variant: 'destructive' });
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-foreground">{user?.email}</span>.
            Enter it below to continue.
          </p>
        </div>

        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={verifying}
              className="h-14 w-12 rounded-lg border-2 border-border bg-background text-center text-2xl font-semibold text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          className="w-full gradient-primary"
          disabled={verifying || otp.join('').length < 6}
        >
          {verifying ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {verifying ? 'Verifying...' : 'Verify Email'}
        </Button>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
          >
            {resending ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : null}
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
          </Button>
        </div>

        <div className="border-t pt-4">
          <button
            onClick={() => signOut()}
            className="text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            Sign in with a different account
          </button>
        </div>
      </div>
    </div>
  );
}
