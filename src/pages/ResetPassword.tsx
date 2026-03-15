import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    if (token) {
      setValidSession(true);
      return;
    }
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setValidSession(true);
    } else {
      setValidSession(false);
    }
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (token) {
        const res = await apiClient.post("/auth/reset-password", { token, password });
        if (res.success) {
          toast({ title: "Password updated", description: "You can now sign in." });
          navigate("/auth", { replace: true });
        } else {
          toast({ title: "Error", description: res.message || "Invalid or expired link", variant: "destructive" });
        }
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast({ title: "Password updated", description: "You can now sign in." });
        navigate("/auth", { replace: true });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update password", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (validSession === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h2 className="text-xl font-semibold">Invalid reset link</h2>
          <p className="text-muted-foreground text-sm">Please request a new password reset link from the sign in page.</p>
          <Button asChild>
            <Link to="/auth">Back to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6 animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Set new password</h2>
          <p className="text-muted-foreground mt-1 text-sm">Enter your new password below.</p>
        </div>
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>
          <Button type="submit" className="w-full gradient-primary" disabled={loading}>
            {loading ? (
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            ) : (
              "Update password"
            )}
          </Button>
        </form>
        <div className="border-t pt-4 text-center text-xs text-muted-foreground">
          <p>
            Review our{" "}
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
    </div>
  );
}
