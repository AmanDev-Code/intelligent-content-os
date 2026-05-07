/**
 * Unified Analytics Service
 *
 * Tracks events to Google Analytics (gtag) and PostHog.
 * All methods are safe to call server-side (they no-op when window is undefined).
 */

type GtagFunction = (
  command: "event" | "config" | "js",
  targetOrEventName: string | Date,
  params?: Record<string, unknown>
) => void;

declare global {
  interface Window {
    gtag?: GtagFunction;
    dataLayer?: unknown[];
  }
}

function trackGA(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, properties);
  }
}

function trackPostHog(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    import("posthog-js").then(({ default: posthog }) => {
      if (posthog.__loaded) {
        posthog.capture(event, properties);
      }
    });
  }
}

function track(event: string, properties?: Record<string, unknown>) {
  trackGA(event, properties);
  trackPostHog(event, properties);
}

export type ContentType = "text" | "image" | "carousel" | "video" | "reel";
export type GenerationType = "viral" | "custom" | "repurpose" | "template";
export type Platform = "linkedin" | "twitter" | "instagram" | "facebook" | "youtube" | "tiktok";
export type AuthMethod = "email" | "google" | "linkedin";
export type FeedbackType = "bug" | "feature" | "general";
export type BillingCycle = "monthly" | "yearly";

export const analytics = {
  /**
   * Generic track method for custom events
   */
  track,

  // ─────────────────────────────────────────────────────────────────────────────
  // Generation Events
  // ─────────────────────────────────────────────────────────────────────────────

  generationStarted: (type: GenerationType, contentType: ContentType) => {
    track("generation_started", {
      type,
      content_type: contentType,
    });
  },

  generationCompleted: (
    type: GenerationType,
    contentType: ContentType,
    durationMs: number
  ) => {
    track("generation_completed", {
      type,
      content_type: contentType,
      duration_ms: durationMs,
      duration_seconds: Math.round(durationMs / 1000),
    });
  },

  generationFailed: (
    type: GenerationType,
    contentType: ContentType,
    errorReason: string
  ) => {
    track("generation_failed", {
      type,
      content_type: contentType,
      error_reason: errorReason,
    });
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Content Events
  // ─────────────────────────────────────────────────────────────────────────────

  postScheduled: (platform: Platform, contentType: ContentType) => {
    track("post_scheduled", {
      platform,
      content_type: contentType,
    });
  },

  postPublished: (platform: Platform, contentType: ContentType) => {
    track("post_published", {
      platform,
      content_type: contentType,
    });
  },

  postCancelled: (platform: Platform) => {
    track("post_cancelled", {
      platform,
    });
  },

  postDeleted: (platform: Platform) => {
    track("post_deleted", {
      platform,
    });
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // LinkedIn Events
  // ─────────────────────────────────────────────────────────────────────────────

  linkedinConnected: () => {
    track("linkedin_connected");
  },

  linkedinDisconnected: () => {
    track("linkedin_disconnected");
  },

  linkedinConnectionFailed: (errorReason?: string) => {
    track("linkedin_connection_failed", {
      error_reason: errorReason,
    });
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Billing/Credits Events
  // ─────────────────────────────────────────────────────────────────────────────

  creditsPurchased: (amount: number, plan: string) => {
    track("credits_purchased", {
      amount,
      plan,
      value: amount,
      currency: "USD",
    });
  },

  subscriptionStarted: (plan: string, billingCycle: BillingCycle) => {
    track("subscription_started", {
      plan,
      billing_cycle: billingCycle,
    });
  },

  subscriptionCancelled: (plan: string) => {
    track("subscription_cancelled", {
      plan,
    });
  },

  creditsUsed: (amount: number, actionType: string) => {
    track("credits_used", {
      amount,
      action_type: actionType,
    });
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Feedback Events
  // ─────────────────────────────────────────────────────────────────────────────

  feedbackSubmitted: (type: FeedbackType, rating?: number) => {
    track("feedback_submitted", {
      type,
      rating,
    });
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Auth Events
  // ─────────────────────────────────────────────────────────────────────────────

  userSignedUp: (method: AuthMethod) => {
    track("user_signed_up", {
      method,
    });
  },

  userLoggedIn: (method: AuthMethod) => {
    track("user_logged_in", {
      method,
    });
  },

  userLoggedOut: () => {
    track("user_logged_out");
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Page View (for SPA navigation)
  // ─────────────────────────────────────────────────────────────────────────────

  pageView: (path: string, title?: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "", {
        page_path: path,
        page_title: title,
      });
    }
    trackPostHog("$pageview", {
      $current_url: typeof window !== "undefined" ? window.location.href : path,
    });
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // User Identification
  // ─────────────────────────────────────────────────────────────────────────────

  identify: (userId: string, traits?: Record<string, unknown>) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "", {
        user_id: userId,
      });
    }
    import("posthog-js").then(({ default: posthog }) => {
      if (posthog.__loaded) {
        posthog.identify(userId, traits);
      }
    });
  },

  reset: () => {
    import("posthog-js").then(({ default: posthog }) => {
      if (posthog.__loaded) {
        posthog.reset();
      }
    });
  },
};

export default analytics;
