"use client";

import { AdminFeedbackView } from "@/components/admin/AdminFeedbackView";
import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";

export default function AdminFeedbackPage() {
  const { loading, allowed } = useAdminSectionGate("feedback");

  if (loading || !allowed) {
    return (
      <div className="max-w-5xl mx-auto p-4 text-muted-foreground text-sm">Loading…</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-16">
      <AdminFeedbackView />
    </div>
  );
}
