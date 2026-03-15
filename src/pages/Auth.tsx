import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, Sparkles, User, AtSign, ShieldCheck, Loader2 } from "lucide-react";

export default function Auth() {
  const { session, user, signOut } = useAuth();
  const { verified, loading: verificationLoading, recheck } = useVerificationStatus();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP is shown inline when this is true — set immediately on signup (local, no async)
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const signupEmailRef = useRef("");

  // Verified user with session → go to dashboard
  useEffect(() => {
    if (session && !verificationLoading && verified === true && !showOtp) {
      navigate("/", { replace: true });
    }
  }, [session, verified, verificationLoading, showOtp, navigate]);

  // Returning unverified user (has session, DB says not verified) → show OTP
  useEffect(() => {
    if (session && !verificationLoading && verified === false && !showOtp) {
      signupEmailRef.current = user?.email || "";
      setShowOtp(true);
    }
  }, [session, verificationLoading, verified, showOtp, user]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Focus first OTP input
  useEffect(() => {
    if (showOtp) {
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    }
  }, [showOtp]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isForgot) {
        await apiClient.post("/auth/forgot-password", { email });
        toast({ title: "Check your email", description: "If an account exists, a password reset link has been sent." });
        setIsForgot(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // useEffect handles navigation after verification check
      } else {
        const trimmedUsername = username.trim().toLowerCase();
        if (trimmedUsername.length < 2) {
          toast({ title: "Error", description: "Username must be at least 2 characters", variant: "destructive" });
          return;
        }
        if (!/^[a-z0-9_-]+$/.test(trimmedUsername)) {
          toast({ title: "Error", description: "Username can only contain letters, numbers, underscores, and hyphens", variant: "destructive" });
          return;
        }
        const checkRes = await apiClient.get(`/profile/check-username?username=${encodeURIComponent(trimmedUsername)}`);
        if (!checkRes.available) {
          toast({ title: "Error", description: "Username is already taken", variant: "destructive" });
          return;
        }

        // Register via backend Admin API — no Supabase email is sent
        const regRes = await apiClient.post("/auth/register", {
          email,
          password,
          username: trimmedUsername,
          fullName: fullName.trim() || undefined,
        });
        if (!regRes.success) throw new Error(regRes.message || "Registration failed");

        // Sign in to get a Supabase session
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        // Show OTP view immediately
        signupEmailRef.current = email;
        setShowOtp(true);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // OTP handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = useCallback(async () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    setVerifying(true);
    try {
      const res = await apiClient.post("/auth/verify-otp", { otp: code });
      if (res.success) {
        toast({ title: "Email verified", description: "Welcome to Postra!" });
        recheck();
        setShowOtp(false);
        navigate("/", { replace: true });
      } else {
        toast({ title: "Invalid code", description: res.message || "The code is invalid or expired.", variant: "destructive" });
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      }
    } catch {
      toast({ title: "Verification failed", description: "Could not verify the code. Please try again.", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  }, [otp, toast, navigate, recheck]);

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (otp.join("").length === 6 && showOtp) {
      handleVerify();
    }
  }, [otp, showOtp, handleVerify]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await apiClient.post("/auth/resend-otp", {});
      toast({ title: "Code sent", description: "A new verification code has been sent to your email." });
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch {
      toast({ title: "Error", description: "Could not resend the code.", variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  const displayEmail = signupEmailRef.current || user?.email || email;

  // Right panel content
  const renderRightPanel = () => {
    // OTP view — shown inline, replaces the form
    if (showOtp) {
      return (
        <div className="w-full max-w-sm space-y-8 animate-fade-in-up">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold gradient-text">Postra AI</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Verify your email</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Enter the 6-digit code sent to <span className="font-medium text-foreground">{displayEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                disabled={verifying}
                className="h-14 w-12 rounded-xl border border-border bg-background text-center text-2xl font-semibold text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            className="w-full gradient-primary"
            disabled={verifying || otp.join("").length < 6}
          >
            {verifying && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {verifying ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
            <Button variant="ghost" size="sm" onClick={handleResend} disabled={resending || cooldown > 0}>
              {resending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
            </Button>
          </div>

          <div className="border-t pt-4 text-center">
            <button
              onClick={() => { signOut(); setShowOtp(false); }}
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              Sign in with a different account
            </button>
          </div>
        </div>
      );
    }

    // Loading state while checking verification for a logged-in user
    if (session && verificationLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      );
    }

    // Normal auth form (login / signup / forgot)
    return (
      <div className="w-full max-w-sm space-y-8 animate-fade-in-up">
        <div className="lg:hidden text-center mb-8">
          <h1 className="text-2xl font-bold gradient-text">Postra AI</h1>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {isForgot ? "Reset password" : isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {isForgot
              ? "Enter your email to receive a reset link"
              : isLogin
              ? "Sign in to your workspace"
              : "Start your AI content journey"}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {!isForgot && !isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                    className="pl-10"
                    required
                    minLength={2}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Letters, numbers, underscores, hyphens only. Unique.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </>
          )}

          {!isForgot && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full gradient-primary" disabled={loading}>
            {loading ? (
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            ) : (
              <>
                {isForgot ? "Send reset link" : isLogin ? "Sign in" : "Create account"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </form>

        {!isForgot && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>
          </>
        )}

        <div className="text-center text-sm space-y-1">
          {isForgot ? (
            <button onClick={() => setIsForgot(false)} className="text-primary hover:underline">
              Back to sign in
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline block w-full"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
              {isLogin && (
                <button onClick={() => setIsForgot(true)} className="text-muted-foreground hover:text-primary hover:underline">
                  Forgot password?
                </button>
              )}
            </>
          )}
        </div>

        <div className="border-t pt-4 text-center text-xs text-muted-foreground">
          <p>
            By continuing, you agree to our{" "}
            <Link to="/terms-of-use" className="text-primary hover:underline">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-accent/30 blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        </div>
        <div className="relative z-10 max-w-md text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">AI-Powered Content OS</span>
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4 tracking-tight">
            Postra AI
          </h1>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            The operating system for AI content creation. Discover, create, publish, and grow — all from one intelligent workspace.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        {renderRightPanel()}
      </div>
    </div>
  );
}
