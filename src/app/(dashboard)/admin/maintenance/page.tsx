"use client";

import { LayoutDashboard } from "lucide-react";
import { MaintenanceControl } from "@/components/admin/MaintenanceControl";
import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";

export default function AdminMaintenancePage() {
  const { loading, allowed } = useAdminSectionGate("maintenance");

  if (loading || !allowed) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
          Admin · Maintenance
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Maintenance Mode
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Control the maintenance gate shown to visitors. Toggle immediately or
          schedule a window for planned downtime.
        </p>
      </div>

      <MaintenanceControl />
    </div>
  );
}
