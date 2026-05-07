"use client";

import { AdminUserFeedbackView } from "@/components/admin/AdminUserFeedbackView";
import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";

export default function AdminUserFeedbackPage() {
  const { loading, allowed } = useAdminSectionGate("feedback");

  if (loading || !allowed) {
    return (
      <div className="max-w-5xl mx-auto p-4 text-muted-foreground text-sm">Loading...</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-16">
      <AdminUserFeedbackView />
    </div>
  );
}
