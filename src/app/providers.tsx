"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PostHogInit } from "@/components/analytics/PostHogInit";
import { PostHogPageProvider } from "@/components/analytics/PostHogPageProvider";
import {
  MaintenanceProvider,
  useMaintenanceStatus,
} from "@/contexts/MaintenanceContext";
import { MaintenancePage } from "@/components/maintenance/MaintenancePage";

/**
 * Client-side maintenance gate for mid-session detection only.
 * Initial page load is handled by middleware (server-side) to avoid flash.
 * This gate catches maintenance mode enabled AFTER the page has loaded.
 */
function MaintenanceGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isMaintenanceActive, maintenanceMessage, scheduledEnd } =
    useMaintenanceStatus();
  const normalizedPath =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const isAdminPath = /^\/admin(?:\/|$)/.test(normalizedPath);

  // Only block if maintenance becomes active mid-session (detected by polling).
  // Initial load is handled server-side by middleware — no blocking on isCheckingMaintenance.
  if (!isAdminPath && isMaintenanceActive) {
    return (
      <MaintenancePage message={maintenanceMessage} scheduledEnd={scheduledEnd} />
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="trndinn-theme"
        disableTransitionOnChange
      >
        <TooltipProvider>
          <AuthProvider>
            <PostHogInit>
              <PostHogPageProvider />
              <Toaster />
              <Sonner />
              <MaintenanceProvider>
                <MaintenanceGate>{children}</MaintenanceGate>
              </MaintenanceProvider>
            </PostHogInit>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
