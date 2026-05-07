"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { Star, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackType = "bug" | "feature" | "general" | "other";

const feedbackTypeLabels: Record<FeedbackType, string> = {
  bug: "Bug Report",
  feature: "Feature Request",
  general: "General Feedback",
  other: "Other",
};

interface UserFeedbackModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function UserFeedbackModal({ trigger, onSuccess }: UserFeedbackModalProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("general");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please enter your feedback message");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/user-feedback/submit", {
        type,
        message: message.trim(),
        rating: rating > 0 ? rating : undefined,
      });
      toast.success("Thank you for your feedback!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not submit feedback";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setType("general");
    setMessage("");
    setRating(0);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquarePlus className="h-4 w-4" />
            Send Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Send Feedback</DialogTitle>
          <DialogDescription className="text-base">
            Help us improve by sharing your thoughts, reporting bugs, or suggesting features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="feedback-type" className="text-sm font-medium">
              Feedback Type
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as FeedbackType)}>
              <SelectTrigger id="feedback-type" className="mt-2">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(feedbackTypeLabels) as FeedbackType[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {feedbackTypeLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="feedback-message" className="text-sm font-medium">
              Your Feedback
            </Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === "bug"
                  ? "Describe the bug you encountered..."
                  : type === "feature"
                    ? "Describe the feature you'd like to see..."
                    : "Share your thoughts with us..."
              }
              className="mt-2 min-h-[120px] resize-none"
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {message.length}/5000
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Rating (optional)
            </Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? 0 : n)}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    rating >= n ? "text-amber-500" : "text-muted-foreground/40 hover:text-muted-foreground/60",
                  )}
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={cn(
                      "h-7 w-7",
                      rating >= n && "fill-current",
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRating(0)}
                  className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !message.trim()}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {submitting ? "Sending..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
