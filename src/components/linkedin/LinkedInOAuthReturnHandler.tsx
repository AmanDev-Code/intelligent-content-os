"use client";

import { createContext, useContext, type ReactNode } from "react";
import { PagePickerModal } from "@/components/linkedin/PagePickerModal";
import { useLinkedIn } from "@/contexts/LinkedInContext";
import { useLinkedInOAuthCallback } from "@/hooks/useLinkedInOAuthCallback";

interface LinkedInPagePickerContextValue {
  openPagePicker: () => void;
  closePagePicker: () => void;
}

const LinkedInPagePickerContext =
  createContext<LinkedInPagePickerContextValue | null>(null);

export function useLinkedInPagePicker(): LinkedInPagePickerContextValue {
  const context = useContext(LinkedInPagePickerContext);
  if (!context) {
    throw new Error(
      "useLinkedInPagePicker must be used within LinkedInOAuthReturnHandler",
    );
  }
  return context;
}

interface LinkedInOAuthReturnHandlerProps {
  children: ReactNode;
}

/**
 * Handles LinkedIn OAuth return query params once at layout level so page-picker
 * state survives router.replace() and page remounts after OAuth redirect.
 */
export function LinkedInOAuthReturnHandler({
  children,
}: LinkedInOAuthReturnHandlerProps) {
  const { refreshConnection, refreshMetrics } = useLinkedIn();
  const { pagePickerOpen, openPagePicker, closePagePicker } =
    useLinkedInOAuthCallback({
      refreshConnection,
      refreshMetrics,
    });

  return (
    <LinkedInPagePickerContext.Provider
      value={{ openPagePicker, closePagePicker }}
    >
      {children}
      <PagePickerModal
        open={pagePickerOpen}
        onClose={closePagePicker}
        onConnected={() => {
          refreshConnection();
          refreshMetrics();
        }}
      />
    </LinkedInPagePickerContext.Provider>
  );
}
