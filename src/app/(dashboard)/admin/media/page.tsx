"use client";

import { AdminMediaBrowser } from "@/components/admin/AdminMediaBrowser";
import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";

export default function AdminMediaPage() {
  const { loading, allowed } = useAdminSectionGate("media");

  if (loading || !allowed) {
    return (
      <div className="w-full px-4 text-muted-foreground text-sm lg:px-8 py-4">Loading…</div>
    );
  }

  return (
    <div className="w-full px-4 pb-12 pt-4 lg:px-8">
      <AdminMediaBrowser />
    </div>
  );
}
