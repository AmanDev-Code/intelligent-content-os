"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Linkedin,
  Palette,
  Sparkles,
  Send,
  Check,
  ArrowRight,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

type ActivationStep = "connect" | "brand" | "create" | "publish";

interface OnboardingActivationFlowProps {
  /** Called when the user completes or skips the activation flow. */
  onComplete: () => Promise<void> | void;
  /** Whether the LinkedIn account is already connected. */
  linkedInConnected?: boolean;
}

const STEPS: { key: ActivationStep; title: string; description: string; icon: typeof Linkedin }[] = [
  {
    key: "connect",
    title: "Connect LinkedIn",
    description: "Link your LinkedIn account so posts go live instantly.",
    icon: Linkedin,
  },
  {
    key: "brand",
    title: "Set up Brand Kit",
    description: "Define your brand voice — logo, colors, tone, and example posts.",
    icon: Palette,
  },
  {
    key: "create",
    title: "Create your first post",
    description: "Use AI to generate a post in seconds — or write your own.",
    icon: Sparkles,
  },
  {
    key: "publish",
    title: "Schedule or publish",
    description: "Send it now or pick the perfect time.",
    icon: Send,
  },
];

export function OnboardingActivationFlow({
  onComplete,
  linkedInConnected = false,
}: OnboardingActivationFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(
    linkedInConnected ? 1 : 0,
  );
  const [completing, setCompleting] = useState(false);

  const handleConnectLinkedIn = async () => {
    try {
      const res = await apiClient.post("/linkedin/oauth/start", {
        returnTo: "/dashboard?activation=connect-done",
      });
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch {
      // If oauth start fails, let user proceed anyway
      setCurrentStep(1);
    }
  };

  const handleBrandKit = () => {
    // Navigate to the Brand Kit page to set up brand voice
    router.push("/brand?activation=brand-setup");
    // Mark activation as progressed — they're now in the product
    handleFinish();
  };

  const handleCreatePost = () => {
    // Navigate to the AI agent page to create a post
    router.push("/agent?activation=first-post");
    // Mark activation as progressed — they're now in the product
    handleFinish();
  };

  const handleSchedule = () => {
    // Navigate to the scheduler
    router.push("/scheduled-posts?activation=schedule");
    // Mark activation as complete
    handleFinish();
  };

  const handleSkip = async () => {
    setCompleting(true);
    try {
      await onComplete();
    } finally {
      setCompleting(false);
    }
  };

  const handleFinish = async () => {
    setCompleting(true);
    try {
      await onComplete();
    } finally {
      setCompleting(false);
    }
  };

  const handleStepAction = () => {
    const step = STEPS[currentStep];
    switch (step.key) {
      case "connect":
        handleConnectLinkedIn();
        break;
      case "brand":
        handleBrandKit();
        break;
      case "create":
        handleCreatePost();
        break;
      case "publish":
        handleSchedule();
        break;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-border/80 relative">
        {/* Skip button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleSkip}
          disabled={completing}
          aria-label="Skip activation"
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="pb-4">
          <CardTitle className="text-xl">
            Let&apos;s get you started 🚀
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Get your first LinkedIn post live in under 5 minutes.
          </p>
          {/* Progress bar */}
          <div className="h-2 rounded-full bg-muted mt-4">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Steps list */}
          <div className="space-y-3">
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;
              const isFuture = idx > currentStep;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.key}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
                    isCurrent
                      ? "border-primary bg-primary/5 shadow-sm"
                      : isCompleted
                        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/20"
                        : "border-border/50 opacity-50",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full shrink-0 transition-colors",
                      isCompleted
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : isCurrent
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isFuture && "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action area */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              disabled={completing}
              className="text-muted-foreground"
            >
              Skip for now
            </Button>
            <Button
              onClick={handleStepAction}
              disabled={completing}
              className="gap-2"
            >
              {completing ? (
                "Saving..."
              ) : currentStep === 0 ? (
                <>
                  {linkedInConnected ? "Already connected" : "Connect LinkedIn"}
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : currentStep === 1 ? (
                <>
                  Set up Brand Voice
                  <Palette className="h-4 w-4" />
                </>
              ) : currentStep === 2 ? (
                <>
                  Create a post
                  <Sparkles className="h-4 w-4" />
                </>
              ) : (
                <>
                  Go to scheduler
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
