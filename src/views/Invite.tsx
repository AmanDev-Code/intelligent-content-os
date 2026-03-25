import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function Invite() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      document.title = "You're Invited - Trndinn";
    }
  }, [token]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h2 className="text-xl font-semibold">Invalid invitation</h2>
          <p className="text-muted-foreground text-sm">This invitation link is invalid or has expired.</p>
          <Button asChild>
            <Link href="/auth">Go to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">You're invited to Trndinn</h2>
        <p className="text-muted-foreground text-sm">
          Create your account to get started with AI-powered content creation.
        </p>
        <Button asChild className="w-full">
          <Link href={`/auth?invite=${encodeURIComponent(token)}`}>Create account</Link>
        </Button>
      </div>
    </div>
  );
}
