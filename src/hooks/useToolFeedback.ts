"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

const STORAGE_PREFIX = "trndinn:tool-fb";

/**
 * Hook managing tool feedback lifecycle:
 * - Auto-show popup 1.5s after tool produces a result (success OR failure)
 * - Check eligibility (localStorage → server → Redis/Supabase)
 * - Handle submission
 * - Expose manual open for "Give Feedback" button
 */
export function useToolFeedback(toolSlug: string, hasResult: boolean) {
  const [showCard, setShowCard] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);
  const checkedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Check localStorage first (instant, no network)
  const hasLocalFlag = useCallback(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`${STORAGE_PREFIX}:${toolSlug}`) === "1";
  }, [toolSlug]);

  // Check server eligibility (Redis → Supabase)
  const checkServerEligibility = useCallback(async (): Promise<boolean> => {
    try {
      const res = await apiClient.get(`/tool-feedback/eligibility/${toolSlug}`);
      return res?.eligible === true;
    } catch {
      // On error, don't block — assume eligible
      return true;
    }
  }, [toolSlug]);

  // Auto-show logic: triggers 1.5s after hasResult becomes true
  useEffect(() => {
    if (!hasResult || checkedRef.current) return;
    checkedRef.current = true;

    // Always show the manual button once there's a result
    setShowButton(true);

    // Check if we should auto-show
    if (hasLocalFlag()) {
      setHasGivenFeedback(true);
      return;
    }

    timerRef.current = setTimeout(async () => {
      const eligible = await checkServerEligibility();
      if (eligible) {
        setShowCard(true);
      } else {
        setHasGivenFeedback(true);
        // Sync to localStorage
        localStorage.setItem(`${STORAGE_PREFIX}:${toolSlug}`, "1");
      }
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hasResult, toolSlug, hasLocalFlag, checkServerEligibility]);

  // Dismiss without submitting (hides for this session, doesn't set "given" flag)
  const dismiss = useCallback(() => {
    setShowCard(false);
  }, []);

  // Open manually (from "Give Feedback" button)
  const openManual = useCallback(() => {
    setShowCard(true);
  }, []);

  // Submit feedback
  const submit = useCallback(
    async (rating: number, message?: string) => {
      setSubmitting(true);
      try {
        const res = await apiClient.post("/tool-feedback/submit", {
          toolSlug,
          rating,
          message: message?.trim() || undefined,
        });

        if (res?.success) {
          // Mark as given in localStorage
          localStorage.setItem(`${STORAGE_PREFIX}:${toolSlug}`, "1");
          setHasGivenFeedback(true);
          setShowCard(false);
          toast.success("Thanks for your feedback! 🎉");
        } else {
          toast.error(res?.error || "Could not submit feedback");
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Could not submit feedback";
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [toolSlug],
  );

  return {
    showCard,
    showButton: showButton && !showCard, // Hide button when card is visible
    hasGivenFeedback,
    openManual,
    dismiss,
    submit,
    submitting,
  };
}
