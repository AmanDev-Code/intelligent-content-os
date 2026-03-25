"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LinkedInProvider } from "@/contexts/LinkedInContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { QuotaProvider } from "@/contexts/QuotaContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <OnboardingGate>
        <QuotaProvider>
          <LinkedInProvider>
            <NotificationProvider>
              <AppLayout>{children}</AppLayout>
            </NotificationProvider>
          </LinkedInProvider>
        </QuotaProvider>
      </OnboardingGate>
    </ProtectedRoute>
  );
}
