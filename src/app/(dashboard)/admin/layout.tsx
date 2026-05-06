"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAreaAccess } from "@/hooks/useAdminAreaAccess";

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { canEnter, loading } = useAdminAreaAccess();

  useEffect(() => {
    if (!loading && !canEnter) {
      router.replace("/dashboard");
    }
  }, [loading, canEnter, router]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  if (!canEnter) {
    return null;
  }

  return <>{children}</>;
}
