import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TourStep = {
  key: string;
  title: string;
  description: string;
  route: string;
  selector: string;
  onEnter?: () => void;
};

const TOUR_STEPS: TourStep[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    description: "This is your home. You can track activity, quota, and recent generations here.",
    route: "/",
    selector: '[data-tour="nav-dashboard"]',
  },
  {
    key: "createPost",
    title: "Create Post",
    description: "Use this to open AI Agent and generate content fast.",
    route: "/",
    selector: '[data-tour="create-post"]',
  },
  {
    key: "generationDemo",
    title: "Generate & Schedule (Demo)",
    description:
      "Here’s a quick demo of generating a post, previewing it, and scheduling it — without spending credits.",
    route: "/agent",
    selector: '[data-tour="tour-demo-generation"]',
    onEnter: () => {
      window.dispatchEvent(new CustomEvent("trndinn:tour-enter-agent-demo"));
    },
  },
  {
    key: "scheduledPosts",
    title: "Scheduled Posts",
    description: "Plan your pipeline and keep posting consistency with scheduling.",
    route: "/scheduled-posts",
    selector: '[data-tour="tour-scheduled-actions"]',
  },
  {
    key: "media",
    title: "Media",
    description: "Manage generated images and assets for reuse.",
    route: "/media",
    selector: '[data-tour="tour-media-library"]',
  },
  {
    key: "settings",
    title: "Settings",
    description: "Update your profile (username, full name, avatar) and preferences.",
    route: "/settings",
    selector: '[data-tour="nav-settings"]',
  },
  {
    key: "notificationsBell",
    title: "Notifications",
    description: "Track system events and important updates here.",
    route: "/",
    selector: '[data-tour="header-notifications-bell"]',
    onEnter: () => {
      window.dispatchEvent(new CustomEvent("trndinn:tour-open-notifications"));
    },
  },
];

interface ProductTourProps {
  onFinish: () => Promise<void> | void;
  tourSteps?: Record<string, boolean>;
}

export function ProductTour({ onFinish, tourSteps }: ProductTourProps) {
  const router = useRouter();
  const pathname = usePathname();
  const steps = useMemo(() => {
    const cfg = tourSteps || {};
    return TOUR_STEPS.filter((s) => cfg[s.key] !== false);
  }, [tourSteps]);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const current = steps[step];
  const total = steps.length;
  const isLast = step === total - 1;
  const progress = useMemo(() => ((step + 1) / total) * 100, [step, total]);
  const rafRef = useRef<number | null>(null);

  // Ensure we're on the correct route for the current step.
  useEffect(() => {
    if (!current) return;
    if (pathname !== current.route) {
      router.push(current.route);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.route]);

  useEffect(() => {
    current?.onEnter?.();
  }, [current]);

  useEffect(() => {
    const handler = () => handleNext();
    window.addEventListener("trndinn:tour-next", handler);
    return () => window.removeEventListener("trndinn:tour-next", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, total, isLast]);

  // Track the target element position (and keep it updated on resize/scroll).
  useEffect(() => {
    if (!current) return;
    const findAndSet = () => {
      const el = document.querySelector(current.selector) as HTMLElement | null;
      if (!el) {
        setTargetRect(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    };

    const tick = () => {
      findAndSet();
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    window.addEventListener("resize", findAndSet);

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", findAndSet);
    };
  }, [current.selector]);

  const tooltipStyle = useMemo(() => {
    if (!targetRect) {
      return { top: 96, left: 24, transform: "none" as const };
    }

    const padding = 12;
    const preferredLeft = Math.min(
      Math.max(targetRect.left, padding),
      window.innerWidth - 360 - padding,
    );
    const below = targetRect.bottom + 14;
    const above = targetRect.top - 14;
    const top =
      below + 220 < window.innerHeight ? below : Math.max(padding, above - 220);

    return { top, left: preferredLeft, transform: "none" as const };
  }, [targetRect]);

  const handleNext = async () => {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    try {
      setSaving(true);
      await onFinish();
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    try {
      setSaving(true);
      await onFinish();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95]">
      {/* Spotlight overlay (non-blocking) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-black/40" />
        {targetRect && (
          <div
            className="absolute rounded-xl ring-2 ring-primary/60"
            style={{
              left: Math.max(0, targetRect.left - 8),
              top: Math.max(0, targetRect.top - 8),
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.40)",
            }}
          />
        )}
      </div>

      {/* Tooltip (interactive) */}
      <div
        className={cn(
          "absolute w-[340px] max-w-[calc(100vw-24px)] rounded-xl border bg-background shadow-xl",
          "p-4 pointer-events-auto",
        )}
        style={tooltipStyle}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-sm font-semibold">{current.title}</div>
          <div className="text-xs text-muted-foreground">
            {step + 1}/{total}
          </div>
        </div>

        <div className="h-1.5 rounded-full bg-muted mb-3">
          <div
            className="h-1.5 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-sm text-muted-foreground leading-relaxed">
          {current.description}
        </div>

        <div className="flex items-center justify-between mt-4">
          <Button variant="ghost" size="sm" onClick={handleSkip} disabled={saving}>
            Skip
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || saving}
            >
              Back
            </Button>
            <Button size="sm" onClick={handleNext} disabled={saving}>
              {saving ? "Saving..." : isLast ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
