"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Sparkles, Timer, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LaunchPricingConfig } from "@/hooks/useActiveLaunchPricing";

const DISMISS_KEY_PREFIX = "trndinn_offer_banner_dismissed_";

export type OfferBannerProps = {
  config: LaunchPricingConfig;
  className?: string;
  onDismiss?: () => void;
};

function formatTimeRemaining(endDate: string): string {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

/**
 * Dismissible banner showing active launch offer.
 * Displays label, optional countdown timer, and description.
 * LocalStorage persistence for dismissal state.
 */
export function OfferBanner({ config, className, onDismiss }: OfferBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Check if previously dismissed
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const dismissed = window.localStorage.getItem(`${DISMISS_KEY_PREFIX}${config.id}`);
      if (dismissed === "true") {
        setIsVisible(false);
        onDismiss?.();
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [config.id, onDismiss]);

  // Update countdown timer
  useEffect(() => {
    if (!config.endDate) return;

    setTimeRemaining(formatTimeRemaining(config.endDate));

    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(config.endDate));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [config.endDate]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(`${DISMISS_KEY_PREFIX}${config.id}`, "true");
      } catch {
        // Ignore localStorage errors
      }
    }
    onDismiss?.();
  }, [config.id, onDismiss]);

  if (!isVisible || !config.isActive) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-pink-500/20 p-4 shadow-lg backdrop-blur-xl",
        "animate-in fade-in slide-in-from-top-2 duration-500",
        className,
      )}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute -left-1/4 -top-1/4 h-[150%] w-[150%] animate-pulse rounded-full bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-pink-500/30 blur-3xl" />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[10%] top-[20%] h-1 w-1 animate-bounce rounded-full bg-amber-400/60" style={{ animationDuration: "3s" }} />
        <div className="absolute left-[20%] top-[60%] h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400/50" style={{ animationDuration: "4s", animationDelay: "0.5s" }} />
        <div className="absolute right-[15%] top-[30%] h-1 w-1 animate-bounce rounded-full bg-pink-400/60" style={{ animationDuration: "3.5s", animationDelay: "1s" }} />
        <div className="absolute right-[25%] top-[70%] h-0.5 w-0.5 animate-bounce rounded-full bg-amber-300/50" style={{ animationDuration: "2.5s", animationDelay: "0.3s" }} />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {/* Label row */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="default"
              className="border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              {config.badgeText ?? config.label}
            </Badge>
            {timeRemaining && (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              >
                <Timer className="mr-1 h-3 w-3" />
                {timeRemaining}
              </Badge>
            )}
          </div>

          {/* Title and description */}
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Tag className="h-4 w-4 text-amber-500" />
              {config.label}
            </h3>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>

          {/* Banner text if provided */}
          {config.bannerText && (
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {config.bannerText}
            </p>
          )}
        </div>

        {/* Dismiss button */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full hover:bg-white/10"
          onClick={handleDismiss}
          aria-label="Dismiss offer"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

export type CompactOfferBannerProps = {
  config: LaunchPricingConfig;
  className?: string;
};

/**
 * Compact version of the offer banner for inline use.
 * Shows just the label and countdown.
 */
export function CompactOfferBanner({ config, className }: CompactOfferBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (!config.endDate) return;
    setTimeRemaining(formatTimeRemaining(config.endDate));
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(config.endDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [config.endDate]);

  if (!config.isActive) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-3 py-1.5 text-sm",
        className,
      )}
    >
      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
      <span className="font-medium text-foreground">{config.label}</span>
      {timeRemaining && (
        <>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">{timeRemaining}</span>
        </>
      )}
    </div>
  );
}
