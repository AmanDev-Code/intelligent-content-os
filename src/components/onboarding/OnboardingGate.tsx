import { ReactNode, useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { OnboardingWizard, type OnboardingAnswers } from "./OnboardingWizard";
import { ProductTour } from "./ProductTour";

type StatusResponse = {
  success: boolean;
  required: boolean;
  completed?: boolean;
  tourCompleted?: boolean;
  tourSteps?: Record<string, boolean>;
};

interface OnboardingGateProps {
  children: ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourSteps, setTourSteps] = useState<Record<string, boolean> | null>(
    null,
  );

  const refreshStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status: StatusResponse = await apiClient.get("/onboarding/status");
      const required = Boolean(status?.required);
      const completed = Boolean(status?.completed);
      const tourCompleted = Boolean(status?.tourCompleted);
      setTourSteps((status?.tourSteps as Record<string, boolean> | undefined) || null);

      if (required) {
        setShowWizard(true);
        setShowTour(false);
      } else if (completed && !tourCompleted) {
        setShowWizard(false);
        setShowTour(true);
      } else {
        setShowWizard(false);
        setShowTour(false);
      }
    } catch {
      // Fail-open: never block app usage if onboarding status fails.
      setShowWizard(false);
      setShowTour(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleCompleteOnboarding = async (answers: OnboardingAnswers) => {
    await apiClient.post("/onboarding/complete", answers);
    setShowWizard(false);
    setShowTour(true);
  };

  const handleCompleteTour = async () => {
    await apiClient.post("/onboarding/tour-complete", {});
    setShowTour(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      {children}
      {showWizard && <OnboardingWizard onComplete={handleCompleteOnboarding} />}
      {showTour && (
        <ProductTour onFinish={handleCompleteTour} tourSteps={tourSteps || undefined} />
      )}
    </>
  );
}
