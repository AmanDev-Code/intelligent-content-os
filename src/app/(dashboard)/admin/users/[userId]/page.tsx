"use client";

import { useParams } from "next/navigation";
import { AdminUserDetail } from "@/components/admin/AdminUserDetail";
import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";
import { usePlatformAccess } from "@/hooks/usePlatformAccess";

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = typeof params.userId === "string" ? params.userId : "";
  const { loading, allowed } = useAdminSectionGate("users");
  const { superAdmin, loading: accessLoading } = usePlatformAccess();

  if (loading || accessLoading || !allowed) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-muted-foreground text-sm">Loading…</div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-destructive text-sm">Invalid user id.</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <AdminUserDetail userId={userId} superAdmin={superAdmin} />
    </div>
  );
}
