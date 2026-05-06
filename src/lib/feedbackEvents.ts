export const FEEDBACK_ELIGIBILITY_EVENT = "trndinn-feedback-eligibility";

export function dispatchFeedbackEligibilityRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FEEDBACK_ELIGIBILITY_EVENT));
}
