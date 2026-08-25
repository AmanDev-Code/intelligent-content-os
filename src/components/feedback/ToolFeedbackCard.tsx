"use client";

import { useState } from "react";
import { Star, MessageSquarePlus, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ToolFeedbackCardProps {
  toolSlug: string;
  toolName: string;
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (rating: number, message?: string) => Promise<void>;
  submitting: boolean;
  mode?: "auto" | "manual";
}

/**
 * Compact glass-morphism feedback card that slides up after tool use.
 * Non-blocking — user can still interact with tool results behind it.
 *
 * Design: glass card, amber stars, subtle entrance animation.
 * Accessibility: keyboard navigable stars, ARIA labels, focus management.
 */
export function ToolFeedbackCard({
  toolName,
  visible,
  onDismiss,
  onSubmit,
  submitting,
  mode = "auto",
}: ToolFeedbackCardProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [message, setMessage] = useState("");
  const [showTextarea, setShowTextarea] = useState(false);

  if (!visible) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    await onSubmit(rating, message || undefined);
    // Reset on success (component will unmount via visible=false)
    setRating(0);
    setMessage("");
    setShowTextarea(false);
  };

  const activeRating = hoveredStar || rating;

  return (
    <div
      className={cn(
        "mt-4 w-full max-w-md mx-auto",
        "bg-card/60 backdrop-blur-xl border border-border/50 rounded-lg",
        "p-4 shadow-lg",
        "animate-fade-in-up",
        // Subtle glow on the card
        "ring-1 ring-primary/5",
      )}
      role="region"
      aria-label={`Rate your experience with ${toolName}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium text-foreground">
            {mode === "auto" ? "How was your experience?" : `Rate ${toolName}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
          aria-label="Dismiss feedback"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-1 mb-3" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(rating === n ? 0 : n)}
            onMouseEnter={() => setHoveredStar(n)}
            onMouseLeave={() => setHoveredStar(0)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" && n < 5) {
                setRating(n + 1);
                (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
              }
              if (e.key === "ArrowLeft" && n > 1) {
                setRating(n - 1);
                (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
              }
            }}
            className={cn(
              "p-1 rounded-md transition-all duration-150",
              activeRating >= n
                ? "text-amber-500 scale-110"
                : "text-muted-foreground/30 hover:text-muted-foreground/50",
            )}
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            tabIndex={rating === n || (rating === 0 && n === 1) ? 0 : -1}
          >
            <Star
              className={cn(
                "h-7 w-7 transition-all duration-150",
                activeRating >= n && "fill-current",
              )}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-xs text-muted-foreground">
            {rating === 5
              ? "Excellent!"
              : rating === 4
                ? "Great"
                : rating === 3
                  ? "Okay"
                  : rating === 2
                    ? "Could be better"
                    : "Poor"}
          </span>
        )}
      </div>

      {/* Expandable textarea */}
      {!showTextarea ? (
        <button
          type="button"
          onClick={() => setShowTextarea(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center gap-1"
        >
          <MessageSquarePlus className="h-3 w-3" />
          Add a comment (optional)
        </button>
      ) : (
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Any new feature you want or any issue? Let us know!"
          className="mb-3 min-h-[72px] max-h-[120px] resize-none text-sm bg-background/50"
          maxLength={2000}
          autoFocus
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="text-xs text-muted-foreground"
        >
          Not now
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="px-4"
        >
          {submitting ? "Sending..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}

/**
 * Standalone trigger button for manual feedback.
 * Place this below the tool result area.
 */
export function ToolFeedbackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2 text-muted-foreground hover:text-foreground"
    >
      <MessageSquarePlus className="h-4 w-4" />
      Share Feedback
    </Button>
  );
}
