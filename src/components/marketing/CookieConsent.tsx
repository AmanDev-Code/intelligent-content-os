"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Cookie, X, ChevronUp, Cookie as CookieIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const STORAGE_KEY = "trndinn_cookie_consent";
const PREFERENCES_KEY = "trndinn_cookie_preferences";
const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: true,
  marketing: false,
  functional: true,
};

// Custom Modal Portal - Renders outside component tree at highest z-index
function CookiePreferencesModal({
  isOpen,
  onClose,
  preferences,
  setPreferences,
  onSave,
  isReducedMotion,
}: {
  isOpen: boolean;
  onClose: () => void;
  preferences: CookiePreferences;
  setPreferences: React.Dispatch<React.SetStateAction<CookiePreferences>>;
  onSave: () => void;
  isReducedMotion: boolean;
}) {
  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        isReducedMotion ? "" : "animate-in fade-in duration-200"
      )}
    >
      {/* Backdrop - covers everything */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg mx-4 overflow-hidden",
          "bg-background rounded-2xl shadow-2xl border border-border",
          isReducedMotion ? "" : "animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
            <Cookie className="h-5 w-5 text-orange-500" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 id="cookie-preferences-title" className="text-lg font-semibold">
              Cookie Preferences
            </h2>
            <p className="text-sm text-muted-foreground">
              Customize your preferences. Necessary cookies are always enabled.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
            aria-label="Close preferences"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Necessary Cookies */}
          <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Necessary</span>
                <span className="inline-flex items-center rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700">
                  Required
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Essential for the website to function properly.
              </p>
            </div>
            <Switch checked disabled className="pointer-events-none opacity-50" />
          </div>

          {/* Functional Cookies */}
          <div className={cn(
            "flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors",
            preferences.functional ? "border-orange-500/30 bg-orange-500/5" : "border-border hover:bg-accent/50"
          )}>
            <label htmlFor="toggle-functional" className="flex-1 cursor-pointer">
              <span className="font-medium">Functional</span>
              <p className="mt-1 text-xs text-muted-foreground">
                Remember your preferences and enhance your experience.
              </p>
            </label>
            <Switch
              id="toggle-functional"
              checked={preferences.functional}
              onCheckedChange={() => togglePreference("functional")}
              aria-label="Toggle functional cookies"
            />
          </div>

          {/* Analytics Cookies */}
          <div className={cn(
            "flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors",
            preferences.analytics ? "border-orange-500/30 bg-orange-500/5" : "border-border hover:bg-accent/50"
          )}>
            <label htmlFor="toggle-analytics" className="flex-1 cursor-pointer">
              <span className="font-medium">Analytics</span>
              <p className="mt-1 text-xs text-muted-foreground">
                Help us understand how visitors interact with Trndinn.
              </p>
            </label>
            <Switch
              id="toggle-analytics"
              checked={preferences.analytics}
              onCheckedChange={() => togglePreference("analytics")}
              aria-label="Toggle analytics cookies"
            />
          </div>

            {/* Marketing Cookies */}
            <div className={cn(
              "flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors",
              preferences.marketing ? "border-orange-500/30 bg-orange-500/5" : "border-border"
            )}>
              <div className="flex-1">
                <span className="font-medium">Marketing</span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Personalize advertisements and measure effectiveness.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={() => togglePreference("marketing")}
                aria-label="Toggle marketing cookies"
              />
            </div>

          {/* Summary Bar */}
          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {Object.entries(preferences).filter(([, v]) => v).length} of 4 enabled
            </span>
            <button
              onClick={() => setPreferences(DEFAULT_PREFERENCES)}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
              type="button"
            >
              Reset to defaults
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end p-6 pt-0 border-t border-border">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className="w-full bg-orange-500 text-white hover:bg-orange-600 sm:w-auto"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mobile FAB Banner Component
function MobileCookieFAB({
  onAccept,
  onDecline,
  onOpenPreferences,
}: {
  onAccept: () => void;
  onDecline: () => void;
  onOpenPreferences: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const dragStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStartY.current;
    if (deltaY > 0) {
      setDragY(deltaY * 0.5);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 100) {
      setIsExpanded(false);
    } else if (dragY < -50) {
      setIsExpanded(true);
    }
    setDragY(0);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDecline, 300);
  };

  const handleAccept = () => {
    setIsVisible(false);
    setTimeout(onAccept, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3 sm:hidden">
      {/* FAB Button */}
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          "group relative flex h-14 w-14 items-center justify-center",
          "rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30",
          "transition-all duration-300 ease-spring",
          "hover:shadow-orange-500/50 hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2",
          !isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        )}
        aria-label="Open cookie settings"
      >
        <CookieIcon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white">
          <span className="absolute inset-0 rounded-full bg-white animate-ping" />
        </span>
      </button>

      {/* Bottom Sheet */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "absolute bottom-0 right-0 w-[calc(100vw-32px)] max-w-[380px] overflow-hidden",
          "rounded-3xl bg-background/95 backdrop-blur-xl border border-border/50",
          "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)] transition-all duration-300",
          !isExpanded ? "opacity-0 scale-90 translate-y-8 pointer-events-none" : "opacity-100 scale-100 translate-y-0"
        )}
        style={{
          transform: isDragging ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? "none" : undefined,
        }}
      >
        <div className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing">
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10">
              <Cookie className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1 pr-8">
              <h3 className="font-semibold text-base">Cookie Preferences</h3>
              <p className="text-xs text-muted-foreground mt-1">
                We use cookies to enhance your experience and analyze traffic.
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-accent"
              aria-label="Close cookie preferences panel"
              type="button"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-muted/50">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Necessary</span>
              <div className="mt-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-muted/50">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Analytics</span>
              <div className="mt-1 w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                <CookieIcon className="w-3 h-3 text-orange-500" />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-muted/50">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Marketing</span>
              <div className="mt-1 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-[8px] text-muted-foreground">off</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              size="lg"
              onClick={handleAccept}
              className="w-full bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20"
            >
              <Cookie className="mr-2 h-4 w-4" />
              Accept All Cookies
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenPreferences}
                className="flex-1 border-dashed"
              >
                <ChevronUp className="mr-1.5 h-3.5 w-3.5" />
                Customize
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                Decline
              </Button>
            </div>
          </div>

          <p className="text-center mt-3 text-[10px] text-muted-foreground">
            <Link href="/legal/cookies" className="underline underline-offset-2 hover:text-foreground">
              Read our Cookie Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Desktop Banner Component
function DesktopCookieBanner({
  onAccept,
  onDecline,
  onOpenPreferences,
}: {
  onAccept: () => void;
  onDecline: () => void;
  onOpenPreferences: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[100] hidden sm:block",
        "bg-background/95 backdrop-blur-md border-t border-border",
        "shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3)]",
        "animate-in slide-in-from-bottom-4 duration-300"
      )}
      role="region"
      aria-label="Cookie consent"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="mt-0.5 shrink-0">
              <Cookie className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed text-foreground sm:text-base">
                We use cookies to enhance your experience, analyze site traffic, and personalize content.
                By clicking "Accept All", you consent to our use of cookies.
                <Link
                  href="/legal/cookies"
                  className="ml-1 font-medium text-orange-600 underline-offset-2 hover:text-orange-700 hover:underline dark:text-orange-400 dark:hover:text-orange-300"
                >
                  Cookie Policy
                </Link>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenPreferences}
              className="text-sm font-medium text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
              type="button"
            >
              Cookie preferences
            </button>
            <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none sm:gap-3">
              <Button variant="outline" size="sm" onClick={onDecline} className="shrink-0">
                Decline
              </Button>
              <Button size="sm" onClick={onAccept} className="shrink-0 bg-orange-500 text-white hover:bg-orange-600">
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    const storedConsent = localStorage.getItem(STORAGE_KEY);
    if (!storedConsent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => {
        clearTimeout(timer);
        mediaQuery.removeEventListener("change", handleChange);
      };
    }

    const storedPreferences = localStorage.getItem(PREFERENCES_KEY);
    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences));
      } catch {
        setPreferences(DEFAULT_PREFERENCES);
      }
    }

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const saveConsent = useCallback(({ all = false }: { all?: boolean }) => {
    const prefs = all
      ? { necessary: true, analytics: true, marketing: true, functional: true }
      : preferences;

    localStorage.setItem(STORAGE_KEY, "consented");
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    setIsModalOpen(false);

    window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: prefs }));
  }, [preferences]);

  const handleAcceptAll = () => saveConsent({ all: true });
  const handleSavePreferences = () => saveConsent({ all: false });
  const handleDecline = () => {
    const minimalPrefs = { ...DEFAULT_PREFERENCES, analytics: false, marketing: false, functional: false };
    localStorage.setItem(STORAGE_KEY, "consented");
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(minimalPrefs));
    setPreferences(minimalPrefs);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile FAB */}
      <MobileCookieFAB
        onAccept={handleAcceptAll}
        onDecline={handleDecline}
        onOpenPreferences={() => setIsModalOpen(true)}
      />

      {/* Desktop Banner */}
      <DesktopCookieBanner
        onAccept={handleAcceptAll}
        onDecline={handleDecline}
        onOpenPreferences={() => setIsModalOpen(true)}
      />

      {/* Custom Modal - Renders at z-9999, above everything */}
      <CookiePreferencesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preferences={preferences}
        setPreferences={setPreferences}
        onSave={handleSavePreferences}
        isReducedMotion={isReducedMotion}
      />
    </>
  );
}

// Hook for other components to check consent
export function useCookieConsent() {
  const getConsent = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const preferences = localStorage.getItem(PREFERENCES_KEY);
    if (preferences) {
      try {
        return JSON.parse(preferences) as CookiePreferences;
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }
    return DEFAULT_PREFERENCES;
  };

  const hasAnalyticsConsent = () => {
    const consent = getConsent();
    return consent?.analytics ?? false;
  };

  const hasMarketingConsent = () => {
    const consent = getConsent();
    return consent?.marketing ?? false;
  };

  return { getConsent, hasAnalyticsConsent, hasMarketingConsent };
}

export type { CookiePreferences };
