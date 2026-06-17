import { ReactNode, useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { OnboardingWizard, type OnboardingAnswers } from "./OnboardingWizard";
import { OnboardingActivationFlow } from "./OnboardingActivationFlow";
import { ProductTour } from "./ProductTour";

type StatusResponse = {
  success: boolean;
  required: boolean;
  completed?: boolean;
  activationCompleted?: boolean;
  tourCompleted?: boolean;
  tourSteps?: Record<string, boolean>;
  linkedInConnected?: boolean;
  /** When true, show the guided activation flow instead of questions. */
  activationFlowEnabled?: boolean;
};

interface OnboardingGateProps {
  children: ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const [loading, setLoading] = useState(true);
  const [showActivation, setShowActivation] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourSteps, setTourSteps] = useState<Record<string, boolean> | null>(
    null,
  );
  const [linkedInConnected, setLinkedInConnected] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status: StatusResponse = await apiClient.get("/onboarding/status");
      const required = Boolean(status?.required);
      const completed = Boolean(status?.completed);
      const tourCompleted = Boolean(status?.tourCompleted);
      const activationCompleted = Boolean(status?.activationCompleted);
      const activationFlowEnabled = Boolean(status?.activationFlowEnabled);
      setTourSteps((status?.tourSteps as Record<string, boolean> | undefined) || null);
      setLinkedInConnected(Boolean(status?.linkedInConnected));

      if (required) {
        if (activationFlowEnabled && !activationCompleted) {
          // Default: show the guided "create first post" activation flow
          setShowActivation(true);
          setShowWizard(false);
          setShowTour(false);
        } else if (!activationFlowEnabled) {
          // Fallback: legacy question-based wizard (admin can turn this on)
          setShowActivation(false);
          setShowWizard(true);
          setShowTour(false);
        } else {
          // Activation done, check if tour still needed
          setShowActivation(false);
          setShowWizard(false);
          setShowTour(!tourCompleted);
        }
      } else if (completed && !tourCompleted) {
        setShowActivation(false);
        setShowWizard(false);
        setShowTour(true);
      } else {
        setShowActivation(false);
        setShowWizard(false);
        setShowTour(false);
      }
    } catch {
      // Fail-open: never block app usage if onboarding status fails.
      setShowActivation(false);
      setShowWizard(false);
      setShowTour(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleCompleteActivation = async () => {
    await apiClient.post("/onboarding/activation-complete", {});
    setShowActivation(false);
    // After activation, show the product tour
    setShowTour(true);
  };

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
      {showActivation && (
        <OnboardingActivationFlow
          onComplete={handleCompleteActivation}
          linkedInConnected={linkedInConnected}
        />
      )}
      {showWizard && <OnboardingWizard onComplete={handleCompleteOnboarding} />}
      {showTour && (
        <ProductTour onFinish={handleCompleteTour} tourSteps={tourSteps || undefined} />
      )}
    </>
  );
}
