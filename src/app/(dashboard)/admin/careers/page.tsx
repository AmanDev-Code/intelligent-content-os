"use client";

import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";
import CareersAdminPage from "@/views/CareersAdminPage";

export default function AdminCareersRoutePage() {
  const { loading, allowed } = useAdminSectionGate("careers");

  if (loading || !allowed) {
    return (
      <div className="max-w-5xl mx-auto p-4 text-muted-foreground text-sm">Loading…</div>
    );
  }

  return <CareersAdminPage />;
}
