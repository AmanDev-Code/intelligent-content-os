import { useAuth } from "@/contexts/AuthContext";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  const { verified, loading: verificationLoading } = useVerificationStatus();

  // Auth loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // Verification check loading — show spinner, NEVER show dashboard
  if (verificationLoading || verified === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not verified — send to /auth where OTP will show inline
  if (verified === false) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
