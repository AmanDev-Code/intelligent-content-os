"use client";

import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";
import { PlatformStaffGrantsSettings } from "@/components/platform-admin/PlatformStaffGrantsSettings";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          Manage system settings, staff access, and cache controls.
        </p>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="staff">Staff Access</TabsTrigger>
        </TabsList>
        <TabsContent value="system" className="mt-6">
          <SystemSettings />
        </TabsContent>
        <TabsContent value="staff" className="mt-6">
          <PlatformStaffGrantsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
