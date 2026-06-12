"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/apiClient";
import {
  buildCleanPath,
  clearPagePickerPending,
  markPagePickerPending,
  readPagePickerPending,
  shouldOpenPagePickerAfterOAuth,
} from "@/lib/linkedin-oauth-callback";
import { useLinkedInConnectionStatus } from "@/hooks/useLinkedInConnectionStatus";

interface UseLinkedInOAuthCallbackOptions {
  refreshConnection?: () => void;
  refreshMetrics?: () => void;
  onConnected?: () => void;
}

export function useLinkedInOAuthCallback(
  options: UseLinkedInOAuthCallbackOptions = {},
) {
  const { refreshConnection, refreshMetrics, onConnected } = options;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { clearConnecting } = useLinkedInConnectionStatus();
  const [pagePickerOpen, setPagePickerOpen] = useState(false);
  const processedCallbackRef = useRef<string | null>(null);

  const openPagePicker = useCallback(() => {
    markPagePickerPending();
    setPagePickerOpen(true);
  }, []);

  const closePagePicker = useCallback(() => {
    clearPagePickerPending();
    setPagePickerOpen(false);
  }, []);

  // Restore picker intent after remount / Strict Mode (URL may already be cleaned).
  useEffect(() => {
    if (readPagePickerPending()) {
      setPagePickerOpen(true);
    }
  }, []);

  const maybePromptCompanyPagesAfterPersonalConnect = useCallback(async () => {
    try {
      const res = await api.linkedin.orgPages();
      const pages = Array.isArray(res?.pages) ? res.pages : [];
      const hasUnconnected = pages.some(
        (page: { connected?: boolean }) => !page.connected,
      );
      if (hasUnconnected) {
        openPagePicker();
        toast.success("LinkedIn connected! Select company pages to post from.");
        return;
      }
    } catch {
      // Org discovery may require extra OAuth scopes — not a hard failure.
    }
    toast.success("LinkedIn connected successfully!");
  }, [openPagePicker]);

  useEffect(() => {
    const linkedinParam = searchParams.get("linkedin");
    if (!linkedinParam) return;

    const callbackKey = `${pathname}?${searchParams.toString()}`;
    if (processedCallbackRef.current === callbackKey) return;
    processedCallbackRef.current = callbackKey;

    const reasonParam = searchParams.get("reason");
    const flowParam = searchParams.get("flow");
    const hasOrgPagesParam = searchParams.get("has_org_pages");

    if (linkedinParam === "connected") {
      clearConnecting();
      refreshConnection?.();
      refreshMetrics?.();
      onConnected?.();
      localStorage.setItem("linkedin-connected", "true");
      localStorage.removeItem("linkedin-connected");

      // Unified flow: check if backend signaled org pages available, or legacy flow
      if (shouldOpenPagePickerAfterOAuth(flowParam, hasOrgPagesParam)) {
        openPagePicker();
        toast.success("LinkedIn connected! Select company pages to post from.");
      } else {
        // Fallback: check for org pages client-side (for edge cases)
        void maybePromptCompanyPagesAfterPersonalConnect();
      }
    } else if (linkedinParam === "error") {
      clearConnecting();
      if (reasonParam === "account_in_use") {
        toast.error(
          "This LinkedIn account is already connected to another Trndinn account. Each LinkedIn account can only be linked to one Trndinn user.",
          { duration: 8000 },
        );
      } else if (reasonParam === "token_exchange") {
        toast.error(
          "LinkedIn authorization failed. Please try connecting again — the link may have expired.",
        );
      } else if (reasonParam === "oauth_denied") {
        toast.error("LinkedIn connection was cancelled.");
      } else {
        toast.error("LinkedIn connection failed. Please try again.");
      }
    }

    const cleanPath = buildCleanPath(pathname, searchParams);
    window.setTimeout(() => {
      router.replace(cleanPath);
    }, 0);
  }, [
    searchParams,
    pathname,
    router,
    clearConnecting,
    refreshConnection,
    refreshMetrics,
    onConnected,
    openPagePicker,
    maybePromptCompanyPagesAfterPersonalConnect,
  ]);

  return {
    pagePickerOpen,
    setPagePickerOpen: openPagePicker,
    openPagePicker,
    closePagePicker,
  };
}
