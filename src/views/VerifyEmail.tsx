import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (data.success) {
          setStatus("success");
          toast({ title: "Email verified!", description: "You can now sign in." });
        } else {
          setStatus("error");
          toast({ title: "Verification failed", description: data.message || "Invalid or expired token", variant: "destructive" });
        }
      } catch {
        setStatus("error");
        toast({ title: "Verification failed", description: "Could not verify email", variant: "destructive" });
      }
    };

    verify();
  }, [token, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Verifying your email...</h2>
            <p className="text-muted-foreground text-sm">Please wait a moment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold">Email verified!</h2>
            <p className="text-muted-foreground text-sm">Your email has been confirmed. You can now sign in to your account.</p>
            <Button asChild className="w-full">
              <Link href="/auth">Sign in</Link>
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Verification failed</h2>
            <p className="text-muted-foreground text-sm">
              {token ? "This link may have expired or already been used." : "No verification token provided."}
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth">Back to sign in</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
