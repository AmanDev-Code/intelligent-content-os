"use client";

import { usePathname } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LinkedInProvider } from "@/contexts/LinkedInContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { QuotaProvider } from "@/contexts/QuotaContext";
import { FeedbackPromptGate } from "@/components/feedback/FeedbackPromptGate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminArea = pathname.startsWith("/admin");

  return (
    <ProtectedRoute>
      <OnboardingGate>
        <QuotaProvider>
          <LinkedInProvider>
            <NotificationProvider>
              {!isAdminArea && <FeedbackPromptGate />}
              {isAdminArea ? (
                <AdminLayout>{children}</AdminLayout>
              ) : (
                <AppLayout>{children}</AppLayout>
              )}
            </NotificationProvider>
          </LinkedInProvider>
        </QuotaProvider>
      </OnboardingGate>
    </ProtectedRoute>
  );
}
