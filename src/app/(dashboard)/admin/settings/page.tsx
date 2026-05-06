"use client";

import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";
import { PlatformStaffGrantsSettings } from "@/components/platform-admin/PlatformStaffGrantsSettings";

export default function AdminSettingsPage() {
  const { loading, allowed } = useAdminSectionGate("settings");

  if (loading || !allowed) {
    return (
      <div className="max-w-5xl mx-auto p-4 text-muted-foreground text-sm">Loading…</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 pb-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Delegate platform staff access (feedback, users, analytics APIs). Super-admin only.
        </p>
      </div>
      <PlatformStaffGrantsSettings />
    </div>
  );
}
