"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/apiClient";
import { FEEDBACK_ELIGIBILITY_EVENT } from "@/lib/feedbackEvents";
import posthog from "posthog-js";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Eligibility = {
  showPopup: boolean;
  reason: "none" | "first_time" | "reminder";
  creditsRewardText: string;
};

function captureIfPosthog(event: string, props?: Record<string, unknown>) {
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(event, props);
  }
}

export function FeedbackPromptGate() {
  const [open, setOpen] = useState(false);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const suppressCloseEventRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const data = (await apiClient.get("/feedback/eligibility")) as Eligibility;
      setEligibility(data);
      if (data.showPopup) {
        setOpen(true);
        captureIfPosthog("feedback_popup_shown", { reason: data.reason });
      } else {
        setOpen(false);
      }
    } catch {
      /* non-blocking */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onRefresh = () => void load();
    window.addEventListener(FEEDBACK_ELIGIBILITY_EVENT, onRefresh);
    return () => window.removeEventListener(FEEDBACK_ELIGIBILITY_EVENT, onRefresh);
  }, [load]);

  const handleSkip = async () => {
    captureIfPosthog("feedback_skipped", { reason: eligibility?.reason });
    try {
      await apiClient.post("/feedback/skip");
    } catch {
      /* still close */
    }
    suppressCloseEventRef.current = true;
    setOpen(false);
    queueMicrotask(() => {
      suppressCloseEventRef.current = false;
    });
    void load();
  };

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error("Please choose a star rating");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post("/feedback/submit", {
        rating,
        message: message.trim() || undefined,
      });
      captureIfPosthog("feedback_submitted", { rating });
      toast.success("Thank you for your feedback!");
      suppressCloseEventRef.current = true;
      setOpen(false);
      setRating(0);
      setMessage("");
      void load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not submit feedback";
      toast.error(msg);
    } finally {
      setSubmitting(false);
      queueMicrotask(() => {
        suppressCloseEventRef.current = false;
      });
    }
  };

  const rewardCopy =
    eligibility?.creditsRewardText ||
    "Submit your rating and optional feedback — we add 100 bonus credits to your account about 24 hours after you submit.";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !suppressCloseEventRef.current) {
          void handleSkip();
        }
      }}
    >
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">How was your first experience?</DialogTitle>
          <DialogDescription className="text-base">
            Rate us — optional constructive criticism is welcome.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-sm font-medium">Rating</Label>
            <div className="flex gap-1 mt-2 justify-center sm:justify-start">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    rating >= n ? "text-amber-500" : "text-muted-foreground/40",
                  )}
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={cn(
                      "h-9 w-9 sm:h-10 sm:w-10",
                      rating >= n && "fill-current",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="feedback-msg" className="text-sm font-medium">
              Anything else? (optional)
            </Label>
            <Textarea
              id="feedback-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What worked well or what could be better?"
              className="mt-2 min-h-[100px] resize-none"
              maxLength={2000}
            />
          </div>

          <p className="text-sm text-muted-foreground leading-snug">{rewardCopy}</p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={handleSkip} className="w-full sm:w-auto order-2 sm:order-1">
            Skip for now
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || rating < 1}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {submitting ? "Sending…" : "Submit feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
